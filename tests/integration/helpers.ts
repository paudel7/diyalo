import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { roles, userRoles, users } from "@db/schema";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/server/db/client";
import type { RoleCode } from "@/lib/permissions";
import { setMailerForTests, type OutgoingMail } from "@/server/mailer";
import { testContext } from "@/server/context";
import { resolveSession, type Actor } from "@/server/services/session-service";
import { signIn } from "@/server/services/auth-service";

export const PASSWORD = "correct horse battery staple 42";
export const ctx = testContext;
export const noMfa = { mfaEnforced: false };
export const withMfa = { mfaEnforced: true };

export const outbox: OutgoingMail[] = [];
export function captureMail() {
  outbox.length = 0;
  setMailerForTests({ send: async (m) => void outbox.push(m) });
}

export async function createUser(
  rolesToGrant: RoleCode[] = [],
  overrides: Partial<typeof users.$inferInsert> = {},
) {
  const db = getDb();
  const email = `u-${randomUUID().slice(0, 8)}@diyalo.example`;
  const [user] = await db
    .insert(users)
    .values({
      email,
      displayName: "Test User",
      kind: "staff",
      status: "active",
      passwordHash: await hashPassword(PASSWORD),
      ...overrides,
    })
    .returning();
  if (!user) throw new Error("user insert failed");
  for (const code of rolesToGrant) {
    const [role] = await db.select().from(roles).where(eq(roles.code, code));
    if (!role) throw new Error(`role missing ${code}`);
    await db.insert(userRoles).values({ userId: user.id, roleId: role.id });
  }
  return user;
}

/** Signs in and returns the resolved actor plus the raw token. MFA state follows the policy given. */
export async function login(email: string, policy = noMfa, password = PASSWORD) {
  const res = await signIn({ email, password }, ctx(), policy);
  if (!res.ok) throw new Error(`login failed: ${res.error}`);
  const resolved = await resolveSession(getDb(), res.token, policy);
  if (!resolved) throw new Error("session did not resolve");
  return { ...resolved, token: res.token };
}

export async function actorFor(rolesToGrant: RoleCode[], policy = noMfa): Promise<Actor> {
  const u = await createUser(rolesToGrant);
  return (await login(u.email, policy)).actor;
}
