import "server-only";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { roles, userRoles, users } from "@db/schema";
import type { Executor } from "@/server/db/client";
import { isRoleCode, type RoleCode } from "@/lib/permissions";

export type UserRow = typeof users.$inferSelect;

export async function findUserByEmail(db: Executor, email: string): Promise<UserRow | undefined> {
  const [row] = await db.select().from(users).where(eq(users.email, email.trim())).limit(1);
  return row;
}

export async function findUserById(db: Executor, id: string): Promise<UserRow | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function activeRoleCodes(db: Executor, userId: string): Promise<RoleCode[]> {
  const rows = await db
    .select({ code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), isNull(userRoles.revokedAt)));
  return rows.map((r) => r.code).filter(isRoleCode);
}

export async function countActiveSuperAdmins(db: Executor): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .innerJoin(users, eq(users.id, userRoles.userId))
    .where(
      and(eq(roles.code, "super_admin"), isNull(userRoles.revokedAt), eq(users.status, "active")),
    );
  return row?.n ?? 0;
}

export async function listUsersWithRoles(db: Executor) {
  const all = await db.select().from(users).orderBy(users.displayName);
  if (all.length === 0) return [];
  const grants = await db
    .select({ userId: userRoles.userId, code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(
      and(
        isNull(userRoles.revokedAt),
        inArray(
          userRoles.userId,
          all.map((u) => u.id),
        ),
      ),
    );
  return all.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    status: u.status,
    lastLoginAt: u.lastLoginAt,
    roles: grants.filter((g) => g.userId === u.id).map((g) => g.code),
  }));
}

export async function roleIdByCode(db: Executor, code: RoleCode): Promise<string | undefined> {
  const [row] = await db.select({ id: roles.id }).from(roles).where(eq(roles.code, code)).limit(1);
  return row?.id;
}

export async function bumpFailedLogin(db: Executor, userId: string, now: Date, windowMs: number) {
  // Failures outside the window start a new count.
  const [row] = await db
    .update(users)
    .set({
      failedLoginCount: sql`case when ${users.lastFailedLoginAt} is null or ${users.lastFailedLoginAt} < ${new Date(now.getTime() - windowMs)} then 1 else ${users.failedLoginCount} + 1 end`,
      lastFailedLoginAt: now,
    })
    .where(eq(users.id, userId))
    .returning({ failedLoginCount: users.failedLoginCount });
  return row?.failedLoginCount ?? 0;
}

export async function lockUser(db: Executor, userId: string, until: Date) {
  await db.update(users).set({ lockedUntil: until }).where(eq(users.id, userId));
}

export async function clearFailures(db: Executor, userId: string, now: Date) {
  await db
    .update(users)
    .set({ failedLoginCount: 0, lastFailedLoginAt: null, lockedUntil: null, lastLoginAt: now })
    .where(eq(users.id, userId));
}
