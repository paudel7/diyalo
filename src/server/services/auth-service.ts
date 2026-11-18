import "server-only";
import { and, count, eq, gt, isNull, sql } from "drizzle-orm";
import { auditLogs, mfaCredentials, mfaRecoveryCodes, sessions } from "@db/schema";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { decryptSecret, encryptSecret } from "@/lib/auth/crypto";
import { dummyHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { newTotpSecret, totpUri, verifyTotp } from "@/lib/auth/totp";
import { ConflictError } from "@/lib/errors";
import { withTransaction, type Executor } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { recordAudit, ANONYMOUS_ACTOR } from "@/server/audit/audit";
import { now } from "@/server/clock";
import { getEnv } from "@/server/env";
import {
  activeRoleCodes,
  bumpFailedLogin,
  clearFailures,
  findUserByEmail,
  findUserById,
  lockUser,
} from "@/server/repositories/users";
import { revokeAllForUser } from "@/server/repositories/sessions";
import {
  defaultAuthPolicy,
  endSession,
  hasConfirmedMfa,
  issueSession,
  rotateSession,
  type Actor,
  type AuthPolicy,
  type SessionState,
} from "./session-service";

export const MAX_FAILED_ATTEMPTS = 5;
export const FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_MS = 15 * 60 * 1000;
export const MAX_FAILED_PER_IP = 20;

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(128),
});

export type SignInResult =
  | { ok: true; token: string; state: SessionState }
  | { ok: false; error: "invalid" | "rate_limited" };

function userActor(userId: string, roles: readonly string[]) {
  return { userId, type: "user" as const, roles };
}

async function failuresFromIp(db: Executor, ctx: RequestContext): Promise<number> {
  if (!ctx.ipPrefix) return 0;
  const since = new Date(now().getTime() - FAILURE_WINDOW_MS);
  const [row] = await db
    .select({ n: count() })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.action, "auth.login_failed"),
        eq(auditLogs.ipPrefix, ctx.ipPrefix),
        gt(auditLogs.occurredAt, since),
      ),
    );
  return row?.n ?? 0;
}

/**
 * Staff sign-in. Every failure returns the same result so the response never reveals whether an
 * email exists, is locked or is deactivated. The reason is recorded in the audit log instead.
 */
export async function signIn(
  rawInput: { email: string; password: string },
  ctx: RequestContext,
  policy: AuthPolicy = defaultAuthPolicy(),
): Promise<SignInResult> {
  const parsed = signInSchema.safeParse(rawInput);
  if (!parsed.success) {
    await dummyHash().then((h) => verifyPassword(h, "x"));
    return { ok: false, error: "invalid" };
  }
  const { email, password } = parsed.data;

  return withTransaction(async (tx): Promise<SignInResult> => {
    if ((await failuresFromIp(tx, ctx)) >= MAX_FAILED_PER_IP) {
      return { ok: false, error: "rate_limited" };
    }
    const fail = async (reason: string, userId: string | null): Promise<SignInResult> => {
      await recordAudit(tx, {
        action: "auth.login_failed",
        outcome: "failure",
        actor: userId ? userActor(userId, []) : ANONYMOUS_ACTOR,
        metadata: { reason },
        context: ctx,
      });
      return { ok: false, error: "invalid" };
    };

    const user = await findUserByEmail(tx, email);
    if (!user || user.kind !== "staff" || user.status !== "active" || !user.passwordHash) {
      await verifyPassword(await dummyHash(), password); // equalize timing
      return fail("unknown_or_inactive", user?.id ?? null);
    }
    const at = now();
    const passwordOk = await verifyPassword(user.passwordHash, password);
    if (user.lockedUntil && user.lockedUntil > at) return fail("locked", user.id);
    if (!passwordOk) {
      const failed = await bumpFailedLogin(tx, user.id, at, FAILURE_WINDOW_MS);
      if (failed >= MAX_FAILED_ATTEMPTS) {
        await lockUser(tx, user.id, new Date(at.getTime() + LOCK_MS));
        await recordAudit(tx, {
          action: "auth.account_locked",
          outcome: "failure",
          actor: userActor(user.id, []),
          entityType: "user",
          entityId: user.id,
          metadata: { failedCount: failed },
          context: ctx,
        });
      }
      return fail("bad_password", user.id);
    }

    await clearFailures(tx, user.id, at);
    const roles = await activeRoleCodes(tx, user.id);
    const issued = await issueSession(tx, user.id, roles, ctx, { mfaVerifiedAt: null });
    const enrolled = await hasConfirmedMfa(tx, user.id);
    await recordAudit(tx, {
      action: "auth.login_succeeded",
      outcome: "success",
      actor: userActor(user.id, roles),
      entityType: "user",
      entityId: user.id,
      metadata: { mfaRequired: enrolled || policy.mfaEnforced },
      context: ctx,
    });
    const state: SessionState = enrolled
      ? "needs_mfa_verify"
      : policy.mfaEnforced
        ? "needs_mfa_enrol"
        : "full";
    return { ok: true, token: issued.token, state };
  });
}

export async function signOut(actor: Actor, ctx: RequestContext): Promise<void> {
  await withTransaction(async (tx) => {
    await endSession(tx, actor.sessionId, "logout");
    await recordAudit(tx, {
      action: "auth.logout",
      outcome: "success",
      actor: userActor(actor.userId, actor.roles),
      context: ctx,
    });
  });
}

// ---------------------------------------------------------------- MFA

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function newRecoveryCode(): string {
  const bytes = randomBytes(10);
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join("");
  return `${chars.slice(0, 5)}-${chars.slice(5)}`;
}

async function storeRecoveryCodes(tx: Executor, userId: string): Promise<string[]> {
  await tx.delete(mfaRecoveryCodes).where(eq(mfaRecoveryCodes.userId, userId));
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, newRecoveryCode);
  const hashes = await Promise.all(codes.map((c) => hashPassword(c)));
  await tx.insert(mfaRecoveryCodes).values(hashes.map((codeHash) => ({ userId, codeHash })));
  return codes;
}

export interface EnrolmentStart {
  secret: string;
  uri: string;
}

export async function beginMfaEnrolment(actor: Actor): Promise<EnrolmentStart> {
  return withTransaction(async (tx) => {
    if (await hasConfirmedMfa(tx, actor.userId)) throw new ConflictError("MFA is already set up.");
    const key = getEnv().MFA_ENCRYPTION_KEY;
    // Reuse a pending (unconfirmed) secret so reloading the page does not invalidate a scan.
    const [pending] = await tx
      .select()
      .from(mfaCredentials)
      .where(and(eq(mfaCredentials.userId, actor.userId), isNull(mfaCredentials.confirmedAt)))
      .limit(1);
    if (pending) {
      const secret = decryptSecret(pending.secretEncrypted, key);
      return { secret, uri: totpUri(secret, actor.email) };
    }
    const secret = newTotpSecret();
    await tx
      .insert(mfaCredentials)
      .values({ userId: actor.userId, secretEncrypted: encryptSecret(secret, key) });
    return { secret, uri: totpUri(secret, actor.email) };
  });
}

export type MfaResult =
  | { ok: true; token: string; recoveryCodes?: string[] }
  | { ok: false; error: "invalid" | "locked" };

/** Counts an MFA failure towards the same lockout as password failures. */
async function mfaFailure(
  tx: Executor,
  actor: Actor,
  reason: string,
  ctx: RequestContext,
): Promise<MfaResult> {
  const at = now();
  const failed = await bumpFailedLogin(tx, actor.userId, at, FAILURE_WINDOW_MS);
  await recordAudit(tx, {
    action: "auth.mfa_failed",
    outcome: "failure",
    actor: userActor(actor.userId, actor.roles),
    metadata: { reason },
    context: ctx,
  });
  if (failed >= MAX_FAILED_ATTEMPTS) {
    await lockUser(tx, actor.userId, new Date(at.getTime() + LOCK_MS));
    await revokeAllForUser(tx, actor.userId, "locked", at);
    await recordAudit(tx, {
      action: "auth.account_locked",
      outcome: "failure",
      actor: userActor(actor.userId, actor.roles),
      entityType: "user",
      entityId: actor.userId,
      metadata: { failedCount: failed },
      context: ctx,
    });
    return { ok: false, error: "locked" };
  }
  return { ok: false, error: "invalid" };
}

async function currentSessionRow(tx: Executor, actor: Actor) {
  const [row] = await tx.select().from(sessions).where(eq(sessions.id, actor.sessionId)).limit(1);
  if (!row) throw new Error("Session not found");
  return row;
}

/** Confirms enrolment with the first code, issues recovery codes once, and rotates the session. */
export async function confirmMfaEnrolment(
  actor: Actor,
  code: string,
  ctx: RequestContext,
): Promise<MfaResult> {
  return withTransaction(async (tx): Promise<MfaResult> => {
    const [cred] = await tx
      .select()
      .from(mfaCredentials)
      .where(and(eq(mfaCredentials.userId, actor.userId), isNull(mfaCredentials.confirmedAt)))
      .limit(1);
    if (!cred) throw new ConflictError("Start MFA setup first.");
    const check = verifyTotp(
      decryptSecret(cred.secretEncrypted, getEnv().MFA_ENCRYPTION_KEY),
      code.trim(),
    );
    if (!check.valid || check.step === undefined) return mfaFailure(tx, actor, "bad_code", ctx);

    const at = now();
    await tx
      .update(mfaCredentials)
      .set({ confirmedAt: at, lastUsedStep: check.step })
      .where(eq(mfaCredentials.id, cred.id));
    const recoveryCodes = await storeRecoveryCodes(tx, actor.userId);
    const issued = await rotateSession(
      tx,
      await currentSessionRow(tx, actor),
      actor.userId,
      actor.roles,
      ctx,
      {
        mfaVerifiedAt: at,
      },
    );
    await recordAudit(tx, {
      action: "auth.mfa_enrolled",
      outcome: "success",
      actor: userActor(actor.userId, actor.roles),
      context: ctx,
    });
    return { ok: true, token: issued.token, recoveryCodes };
  });
}

/** Verifies a TOTP code (replay blocked) or a one-time recovery code, then rotates the session. */
export async function verifyMfa(
  actor: Actor,
  rawCode: string,
  ctx: RequestContext,
): Promise<MfaResult> {
  const code = rawCode.trim().toLowerCase();
  if (code.length > 40) return { ok: false, error: "invalid" };
  return withTransaction(async (tx): Promise<MfaResult> => {
    const user = await findUserById(tx, actor.userId);
    if (user?.lockedUntil && user.lockedUntil > now()) return { ok: false, error: "locked" };

    const [cred] = await tx
      .select()
      .from(mfaCredentials)
      .where(and(eq(mfaCredentials.userId, actor.userId), eq(mfaCredentials.type, "totp")))
      .limit(1);
    if (!cred?.confirmedAt) throw new ConflictError("MFA is not set up.");

    let method: "totp" | "recovery" | null = null;
    if (/^\d{6}$/.test(code)) {
      const check = verifyTotp(
        decryptSecret(cred.secretEncrypted, getEnv().MFA_ENCRYPTION_KEY),
        code,
      );
      if (check.valid && check.step !== undefined) {
        // Replay protection: the step must be newer than the last accepted one.
        const claimed = await tx.execute<{ id: string }>(
          sql`update mfa_credentials set last_used_step = ${check.step}
            where id = ${cred.id} and (last_used_step is null or last_used_step < ${check.step}) returning id`,
        );
        if (claimed.rows.length === 1) method = "totp";
      }
    } else if (/^[a-z0-9]{5}-[a-z0-9]{5}$/.test(code)) {
      const unused = await tx
        .select()
        .from(mfaRecoveryCodes)
        .where(and(eq(mfaRecoveryCodes.userId, actor.userId), isNull(mfaRecoveryCodes.usedAt)));
      for (const row of unused) {
        if (await verifyPassword(row.codeHash, code)) {
          const claimed = await tx
            .update(mfaRecoveryCodes)
            .set({ usedAt: now() })
            .where(and(eq(mfaRecoveryCodes.id, row.id), isNull(mfaRecoveryCodes.usedAt)))
            .returning({ id: mfaRecoveryCodes.id });
          if (claimed.length === 1) method = "recovery";
          break;
        }
      }
    }
    if (!method) return mfaFailure(tx, actor, "bad_code", ctx);

    const at = now();
    await clearFailures(tx, actor.userId, at);
    const issued = await rotateSession(
      tx,
      await currentSessionRow(tx, actor),
      actor.userId,
      actor.roles,
      ctx,
      {
        mfaVerifiedAt: at,
      },
    );
    await recordAudit(tx, {
      action: "auth.mfa_verified",
      outcome: "success",
      actor: userActor(actor.userId, actor.roles),
      metadata: { method },
      context: ctx,
    });
    return { ok: true, token: issued.token };
  });
}

export async function regenerateRecoveryCodes(
  actor: Actor,
  ctx: RequestContext,
): Promise<string[]> {
  return withTransaction(async (tx) => {
    if (!(await hasConfirmedMfa(tx, actor.userId))) throw new ConflictError("MFA is not set up.");
    const codes = await storeRecoveryCodes(tx, actor.userId);
    await recordAudit(tx, {
      action: "auth.recovery_codes_regenerated",
      outcome: "success",
      actor: userActor(actor.userId, actor.roles),
      context: ctx,
    });
    return codes;
  });
}
