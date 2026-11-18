import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { userRoles, users } from "@db/schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { isRoleCode, type RoleCode } from "@/lib/permissions";
import { getDb, withTransaction } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { recordAudit } from "@/server/audit/audit";
import { now } from "@/server/clock";
import { getEnv } from "@/server/env";
import { getMailer } from "@/server/mailer";
import {
  checkDeactivation,
  checkRoleAssignment,
  checkRoleRevocation,
} from "@/server/policies/role-assignment";
import {
  activeRoleCodes,
  countActiveSuperAdmins,
  findUserByEmail,
  findUserById,
  listUsersWithRoles,
  roleIdByCode,
} from "@/server/repositories/users";
import { revokeAllForUser } from "@/server/repositories/sessions";
import { authorize, denyByPolicy } from "./authorize";
import { createAuthToken, INVITE_TTL_MS } from "./password-service";
import type { Actor, AuthPolicy } from "./session-service";

type Opts = { policy?: AuthPolicy };
const actorOf = (a: Actor) => ({ userId: a.userId, type: "user" as const, roles: a.roles });

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  displayName: z.string().trim().min(2).max(120),
  roles: z.array(z.string()).max(7),
});

export async function listUsers(actor: Actor, ctx: RequestContext, opts: Opts = {}) {
  await authorize(actor, "user.manage", ctx, { ...opts, stepUp: false });
  return listUsersWithRoles(getDb());
}

/** Invites a staff member. The invitee sets a password through a single-use 72-hour link. */
export async function inviteUser(
  actor: Actor,
  input: { email: string; displayName: string; roles: string[] },
  ctx: RequestContext,
  opts: Opts = {},
): Promise<{ userId: string }> {
  await authorize(actor, "user.manage", ctx, opts);
  await authorize(actor, "role.assign", ctx, opts);
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Enter a valid email and name.");
  const roleCodes: RoleCode[] = [];
  for (const r of parsed.data.roles) {
    if (!isRoleCode(r)) throw new ValidationError("Unknown role.");
    roleCodes.push(r);
  }
  // Conflicts are checked as if granting one at a time to a brand-new user.
  const granted: RoleCode[] = [];
  for (const r of roleCodes) {
    const d = checkRoleAssignment({
      actorId: actor.userId,
      targetUserId: "new-user",
      roleToGrant: r,
      targetCurrentRoles: granted,
    });
    if (!d.allowed) return denyByPolicy(actor, "role.assign", d.reason ?? "policy", ctx);
    granted.push(r);
  }

  const result = await withTransaction(async (tx) => {
    if (await findUserByEmail(tx, parsed.data.email))
      throw new ConflictError("A user with this email already exists.");
    const at = now();
    const [user] = await tx
      .insert(users)
      .values({
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        kind: "staff",
        status: "invited",
        createdBy: actor.userId,
        updatedBy: actor.userId,
        createdAt: at,
        updatedAt: at,
      })
      .returning({ id: users.id, email: users.email });
    if (!user) throw new Error("User insert failed");
    for (const r of granted) {
      const roleId = await roleIdByCode(tx, r);
      if (!roleId) throw new Error(`Role not seeded: ${r}`);
      await tx
        .insert(userRoles)
        .values({ userId: user.id, roleId, grantedBy: actor.userId, grantedAt: at });
    }
    const token = await createAuthToken(tx, user.id, "invite", INVITE_TTL_MS);
    await recordAudit(tx, {
      action: "user.invited",
      outcome: "success",
      actor: actorOf(actor),
      entityType: "user",
      entityId: user.id,
      metadata: { roles: granted },
      context: ctx,
    });
    return { userId: user.id, to: user.email, token };
  });
  const link = `${getEnv().APP_BASE_URL}/accept-invite?token=${result.token}`;
  await getMailer().send({
    to: result.to,
    subject: "You have been invited to DIYALO",
    text: `Set your password within 72 hours:\n${link}`,
  });
  return { userId: result.userId };
}

export async function grantRole(
  actor: Actor,
  targetUserId: string,
  role: string,
  ctx: RequestContext,
  opts: Opts = {},
): Promise<void> {
  await authorize(actor, "role.assign", ctx, opts);
  if (!isRoleCode(role)) throw new ValidationError("Unknown role.");
  const outcome = await withTransaction(async (tx) => {
    const target = await findUserById(tx, targetUserId);
    if (!target || target.kind !== "staff") throw new NotFoundError("User not found.");
    const current = await activeRoleCodes(tx, targetUserId);
    const decision = checkRoleAssignment({
      actorId: actor.userId,
      targetUserId,
      roleToGrant: role,
      targetCurrentRoles: current,
    });
    if (!decision.allowed) return decision;
    if (current.includes(role)) throw new ConflictError("The user already has this role.");
    const roleId = await roleIdByCode(tx, role);
    if (!roleId) throw new Error(`Role not seeded: ${role}`);
    await tx.insert(userRoles).values({ userId: targetUserId, roleId, grantedBy: actor.userId });
    // Role change invalidates the target's sessions so new privileges start from a fresh sign-in.
    await revokeAllForUser(tx, targetUserId, "roles_changed", now());
    await recordAudit(tx, {
      action: "role.granted",
      outcome: "success",
      actor: actorOf(actor),
      entityType: "user",
      entityId: targetUserId,
      metadata: { role },
      context: ctx,
    });
    return { allowed: true as const };
  });
  if (!outcome.allowed) return denyByPolicy(actor, "role.assign", outcome.reason ?? "policy", ctx);
}

export async function revokeRole(
  actor: Actor,
  targetUserId: string,
  role: string,
  ctx: RequestContext,
  opts: Opts = {},
): Promise<void> {
  await authorize(actor, "role.assign", ctx, opts);
  if (!isRoleCode(role)) throw new ValidationError("Unknown role.");
  const outcome = await withTransaction(async (tx) => {
    const target = await findUserById(tx, targetUserId);
    if (!target) throw new NotFoundError("User not found.");
    const current = await activeRoleCodes(tx, targetUserId);
    if (!current.includes(role)) throw new ConflictError("The user does not have this role.");
    const decision = checkRoleRevocation({
      roleToRevoke: role,
      targetStatusActive: target.status === "active",
      activeSuperAdminCount: await countActiveSuperAdmins(tx),
    });
    if (!decision.allowed) return decision;
    const roleId = await roleIdByCode(tx, role);
    if (!roleId) throw new Error(`Role not seeded: ${role}`);
    const at = now();
    await tx
      .update(userRoles)
      .set({ revokedAt: at, revokedBy: actor.userId })
      .where(
        and(
          eq(userRoles.userId, targetUserId),
          eq(userRoles.roleId, roleId),
          isNull(userRoles.revokedAt),
        ),
      );
    await revokeAllForUser(tx, targetUserId, "roles_changed", at);
    await recordAudit(tx, {
      action: "role.revoked",
      outcome: "success",
      actor: actorOf(actor),
      entityType: "user",
      entityId: targetUserId,
      metadata: { role },
      context: ctx,
    });
    return { allowed: true as const };
  });
  if (!outcome.allowed) return denyByPolicy(actor, "role.assign", outcome.reason ?? "policy", ctx);
}

export async function deactivateUser(
  actor: Actor,
  targetUserId: string,
  reason: string,
  ctx: RequestContext,
  opts: Opts = {},
): Promise<void> {
  await authorize(actor, "user.manage", ctx, opts);
  const trimmed = reason.trim();
  if (trimmed.length < 3 || trimmed.length > 500) throw new ValidationError("Give a short reason.");
  const outcome = await withTransaction(async (tx) => {
    const target = await findUserById(tx, targetUserId);
    if (!target) throw new NotFoundError("User not found.");
    if (target.status === "deactivated")
      throw new ConflictError("The user is already deactivated.");
    const roles = await activeRoleCodes(tx, targetUserId);
    const decision = checkDeactivation({
      actorId: actor.userId,
      targetUserId,
      targetRoles: roles,
      activeSuperAdminCount: target.status === "active" ? await countActiveSuperAdmins(tx) : 0,
    });
    if (!decision.allowed) return decision;
    const at = now();
    await tx
      .update(users)
      .set({
        status: "deactivated",
        deactivatedAt: at,
        deactivatedBy: actor.userId,
        deactivationReason: trimmed,
        updatedAt: at,
        updatedBy: actor.userId,
      })
      .where(eq(users.id, targetUserId));
    const revoked = await revokeAllForUser(tx, targetUserId, "deactivated", at);
    await recordAudit(tx, {
      action: "user.deactivated",
      outcome: "success",
      actor: actorOf(actor),
      entityType: "user",
      entityId: targetUserId,
      metadata: { sessionsRevoked: revoked },
      context: ctx,
    });
    return { allowed: true as const };
  });
  if (!outcome.allowed) return denyByPolicy(actor, "user.manage", outcome.reason ?? "policy", ctx);
}

export async function revokeUserSessions(
  actor: Actor,
  targetUserId: string,
  ctx: RequestContext,
  opts: Opts = {},
): Promise<number> {
  await authorize(actor, "session.revoke_any", ctx, opts);
  return withTransaction(async (tx) => {
    const count = await revokeAllForUser(tx, targetUserId, "revoked_by_admin", now());
    await recordAudit(tx, {
      action: "session.revoked",
      outcome: "success",
      actor: actorOf(actor),
      entityType: "user",
      entityId: targetUserId,
      metadata: { count, scope: "user" },
      context: ctx,
    });
    return count;
  });
}
