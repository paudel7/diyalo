import "server-only";
import { and, eq, isNull, gt } from "drizzle-orm";
import { authTokens, users } from "@db/schema";
import { generateToken, sha256Hex } from "@/lib/auth/crypto";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/lib/auth/password";
import { ValidationError } from "@/lib/errors";
import { withTransaction, type Executor } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { ANONYMOUS_ACTOR, recordAudit } from "@/server/audit/audit";
import { now } from "@/server/clock";
import { getEnv } from "@/server/env";
import { getMailer } from "@/server/mailer";
import { activeRoleCodes, findUserByEmail, findUserById } from "@/server/repositories/users";
import { revokeAllForUser } from "@/server/repositories/sessions";
import { rotateSession, type Actor } from "./session-service";
import { sessions } from "@db/schema";

export const INVITE_TTL_MS = 72 * 60 * 60 * 1000;
export const RESET_TTL_MS = 30 * 60 * 1000;

export async function createAuthToken(
  tx: Executor,
  userId: string,
  purpose: "invite" | "password_reset",
  ttlMs: number,
): Promise<string> {
  // Only the newest token of a purpose is valid.
  await tx
    .update(authTokens)
    .set({ usedAt: now() })
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
      ),
    );
  const token = generateToken(32);
  await tx.insert(authTokens).values({
    userId,
    purpose,
    tokenHash: sha256Hex(token),
    expiresAt: new Date(now().getTime() + ttlMs),
  });
  return token;
}

/** Marks a token used atomically; returns the user id only if it was valid and unused. */
async function consumeToken(tx: Executor, token: string, purpose: "invite" | "password_reset") {
  if (!token || token.length > 200) return null;
  const rows = await tx
    .update(authTokens)
    .set({ usedAt: now() })
    .where(
      and(
        eq(authTokens.tokenHash, sha256Hex(token)),
        eq(authTokens.purpose, purpose),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, now()),
      ),
    )
    .returning({ userId: authTokens.userId });
  return rows[0]?.userId ?? null;
}

export async function changePassword(
  actor: Actor,
  input: { currentPassword: string; newPassword: string },
  ctx: RequestContext,
): Promise<{ token: string }> {
  const policy = validatePasswordPolicy(input.newPassword, { email: actor.email });
  if (!policy.ok) throw new ValidationError(policy.problem);
  return withTransaction(async (tx) => {
    const user = await findUserById(tx, actor.userId);
    if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, input.currentPassword))) {
      throw new ValidationError("Current password is incorrect.");
    }
    const at = now();
    await tx
      .update(users)
      .set({
        passwordHash: await hashPassword(input.newPassword),
        passwordChangedAt: at,
        updatedAt: at,
        updatedBy: actor.userId,
      })
      .where(eq(users.id, actor.userId));
    const revoked = await revokeAllForUser(
      tx,
      actor.userId,
      "password_changed",
      at,
      actor.sessionId,
    );
    const [current] = await tx
      .select()
      .from(sessions)
      .where(eq(sessions.id, actor.sessionId))
      .limit(1);
    if (!current) throw new Error("Session not found");
    const issued = await rotateSession(tx, current, actor.userId, actor.roles, ctx, {
      mfaVerifiedAt: actor.mfaVerifiedAt,
    });
    await recordAudit(tx, {
      action: "auth.password_changed",
      outcome: "success",
      actor: { userId: actor.userId, type: "user", roles: actor.roles },
      metadata: { sessionsRevoked: revoked },
      context: ctx,
    });
    return { token: issued.token };
  });
}

/** Always resolves the same way, so it cannot be used to discover which emails exist. */
export async function requestPasswordReset(email: string, ctx: RequestContext): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254) return;
  const outbound = await withTransaction(async (tx) => {
    const user = await findUserByEmail(tx, normalized);
    if (!user || user.status !== "active" || user.kind !== "staff") return null;
    const token = await createAuthToken(tx, user.id, "password_reset", RESET_TTL_MS);
    await recordAudit(tx, {
      action: "auth.password_reset_requested",
      outcome: "success",
      actor: ANONYMOUS_ACTOR,
      entityType: "user",
      entityId: user.id,
      context: ctx,
    });
    return { to: user.email, token };
  });
  if (outbound) {
    const link = `${getEnv().APP_BASE_URL}/reset-password?token=${outbound.token}`;
    await getMailer().send({
      to: outbound.to,
      subject: "Reset your DIYALO password",
      text: `Use this link within 30 minutes to choose a new password:\n${link}\nIf you did not ask for this, ignore this message.`,
    });
  }
}

export async function completePasswordReset(
  token: string,
  newPassword: string,
  ctx: RequestContext,
): Promise<void> {
  await withTransaction(async (tx) => {
    const userId = await consumeToken(tx, token, "password_reset");
    if (!userId) throw new ValidationError("This link is invalid or has expired.");
    const user = await findUserById(tx, userId);
    if (!user || user.status !== "active")
      throw new ValidationError("This link is invalid or has expired.");
    const policy = validatePasswordPolicy(newPassword, { email: user.email });
    if (!policy.ok) throw new ValidationError(policy.problem);
    const at = now();
    await tx
      .update(users)
      .set({
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: at,
        failedLoginCount: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        updatedAt: at,
      })
      .where(eq(users.id, userId));
    await revokeAllForUser(tx, userId, "password_reset", at);
    await recordAudit(tx, {
      action: "auth.password_reset_completed",
      outcome: "success",
      actor: { userId, type: "user", roles: await activeRoleCodes(tx, userId) },
      entityType: "user",
      entityId: userId,
      context: ctx,
    });
  });
}

export async function acceptInvite(
  token: string,
  password: string,
  ctx: RequestContext,
): Promise<void> {
  await withTransaction(async (tx) => {
    const userId = await consumeToken(tx, token, "invite");
    if (!userId) throw new ValidationError("This invitation is invalid or has expired.");
    const user = await findUserById(tx, userId);
    if (!user || user.status !== "invited")
      throw new ValidationError("This invitation is invalid or has expired.");
    const policy = validatePasswordPolicy(password, { email: user.email });
    if (!policy.ok) throw new ValidationError(policy.problem);
    const at = now();
    await tx
      .update(users)
      .set({
        passwordHash: await hashPassword(password),
        passwordChangedAt: at,
        status: "active",
        updatedAt: at,
      })
      .where(eq(users.id, userId));
    await recordAudit(tx, {
      action: "auth.invite_accepted",
      outcome: "success",
      actor: { userId, type: "user", roles: await activeRoleCodes(tx, userId) },
      entityType: "user",
      entityId: userId,
      context: ctx,
    });
  });
}
