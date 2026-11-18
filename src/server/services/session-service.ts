import "server-only";
import { and, eq, isNotNull } from "drizzle-orm";
import { mfaCredentials } from "@db/schema";
import { generateToken, sha256Hex } from "@/lib/auth/crypto";
import { ROLES, type RoleCode } from "@/lib/permissions";
import type { Executor } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { now } from "@/server/clock";
import { isMfaEnforced } from "@/server/env";
import {
  findSessionByHash,
  insertSession,
  revokeSession,
  touchSession,
  type SessionRow,
} from "@/server/repositories/sessions";
import { activeRoleCodes, findUserById } from "@/server/repositories/users";

export const SESSION_COOKIE = "__Host-diyalo_session";
export const IDLE_PRIVILEGED_MS = 30 * 60 * 1000;
export const IDLE_STANDARD_MS = 60 * 60 * 1000;
export const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const TOUCH_EVERY_MS = 60 * 1000;

export interface AuthPolicy {
  mfaEnforced: boolean;
}
export function defaultAuthPolicy(): AuthPolicy {
  return { mfaEnforced: isMfaEnforced() };
}

export interface Actor {
  userId: string;
  email: string;
  displayName: string;
  roles: RoleCode[];
  sessionId: string;
  mfaVerifiedAt: Date | null;
  mfaEnrolled: boolean;
}
export type SessionState = "full" | "needs_mfa_verify" | "needs_mfa_enrol";
export interface ResolvedSession {
  actor: Actor;
  state: SessionState;
}

export function hasPrivilegedRole(roles: readonly RoleCode[]): boolean {
  return ROLES.some((r) => r.isPrivileged && roles.includes(r.code));
}

export function idleWindowMs(roles: readonly RoleCode[]): number {
  return hasPrivilegedRole(roles) ? IDLE_PRIVILEGED_MS : IDLE_STANDARD_MS;
}

export interface IssuedSession {
  token: string;
  sessionId: string;
  absoluteExpiresAt: Date;
}

export async function issueSession(
  db: Executor,
  userId: string,
  roles: readonly RoleCode[],
  ctx: RequestContext,
  opts: { mfaVerifiedAt: Date | null; absoluteExpiresAt?: Date },
): Promise<IssuedSession> {
  const at = now();
  const token = generateToken(32);
  const absoluteExpiresAt = opts.absoluteExpiresAt ?? new Date(at.getTime() + ABSOLUTE_MS);
  const idle = new Date(Math.min(at.getTime() + idleWindowMs(roles), absoluteExpiresAt.getTime()));
  const row = await insertSession(db, {
    tokenHash: sha256Hex(token),
    userId,
    lastSeenAt: at,
    idleExpiresAt: idle,
    absoluteExpiresAt,
    mfaVerifiedAt: opts.mfaVerifiedAt,
    passwordVerifiedAt: at,
    ipPrefix: ctx.ipPrefix,
    userAgentHash: ctx.userAgentHash,
  });
  return { token, sessionId: row.id, absoluteExpiresAt };
}

/** Replaces a session with a new token (after login steps, MFA or password change). */
export async function rotateSession(
  db: Executor,
  current: SessionRow | { id: string; absoluteExpiresAt: Date },
  userId: string,
  roles: readonly RoleCode[],
  ctx: RequestContext,
  opts: { mfaVerifiedAt: Date | null },
): Promise<IssuedSession> {
  await revokeSession(db, current.id, "rotated", now());
  return issueSession(db, userId, roles, ctx, {
    mfaVerifiedAt: opts.mfaVerifiedAt,
    absoluteExpiresAt: current.absoluteExpiresAt,
  });
}

export async function hasConfirmedMfa(db: Executor, userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: mfaCredentials.id })
    .from(mfaCredentials)
    .where(and(eq(mfaCredentials.userId, userId), isNotNull(mfaCredentials.confirmedAt)))
    .limit(1);
  return rows.length > 0;
}

/**
 * Resolves a raw session token. Returns null for unknown, revoked or expired sessions and for
 * users who are no longer active, so deactivation takes effect on the next request.
 */
export async function resolveSession(
  db: Executor,
  rawToken: string | undefined | null,
  policy: AuthPolicy = defaultAuthPolicy(),
): Promise<ResolvedSession | null> {
  if (!rawToken || rawToken.length > 200) return null;
  const session = await findSessionByHash(db, sha256Hex(rawToken));
  if (!session) return null;
  const at = now();
  if (session.revokedAt || session.idleExpiresAt <= at || session.absoluteExpiresAt <= at)
    return null;

  const user = await findUserById(db, session.userId);
  if (!user || user.status !== "active" || user.kind !== "staff") return null;

  const roles = await activeRoleCodes(db, user.id);
  if (at.getTime() - session.lastSeenAt.getTime() > TOUCH_EVERY_MS) {
    const idle = new Date(
      Math.min(at.getTime() + idleWindowMs(roles), session.absoluteExpiresAt.getTime()),
    );
    await touchSession(db, session.id, at, idle);
  }
  const mfaEnrolled = await hasConfirmedMfa(db, user.id);
  const actor: Actor = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    roles,
    sessionId: session.id,
    mfaVerifiedAt: session.mfaVerifiedAt,
    mfaEnrolled,
  };
  let state: SessionState = "full";
  if (!session.mfaVerifiedAt) {
    if (mfaEnrolled) state = "needs_mfa_verify";
    else if (policy.mfaEnforced) state = "needs_mfa_enrol";
  }
  return { actor, state };
}

export async function endSession(db: Executor, sessionId: string, reason: string) {
  return revokeSession(db, sessionId, reason, now());
}
