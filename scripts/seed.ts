import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword } from "../src/lib/auth/password";
import { ROLE_CODES } from "../src/lib/permissions/matrix";
import { syncReferenceData } from "../db/seed/reference";
import * as schema from "../db/schema";
import { assertLocalEnvironment, requireEnv } from "./_env";

/**
 * Reference data always; fictional development staff only when APP_ENV is development or test.
 * Demo passwords come from SEED_PASSWORD or are generated and printed once. Nothing is committed.
 */
async function main() {
  const pool = new Pool({ connectionString: requireEnv("DATABASE_MIGRATION_URL"), max: 1 });
  try {
    const db = drizzle(pool, { schema });
    await syncReferenceData(db);
    console.log("Reference data synced (roles, permissions, grants, programs).");
    if (process.argv.includes("--reference-only")) return;

    assertLocalEnvironment();
    const password = process.env.SEED_PASSWORD ?? randomBytes(12).toString("base64url");
    const passwordHash = await hashPassword(password);
    const roles = await db.select().from(schema.roles);
    for (const code of ROLE_CODES) {
      if (code === "safeguarding_officer") continue; // no members until the lead is named (D-23)
      const email = `${code.replace(/_/g, ".")}@diyalo.example`;
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
      if (existing) continue;
      const [user] = await db
        .insert(schema.users)
        .values({
          email,
          displayName: `Dev ${code.replace(/_/g, " ")}`,
          kind: "staff",
          status: "active",
          passwordHash,
          passwordChangedAt: new Date(),
        })
        .returning();
      const role = roles.find((r) => r.code === code);
      if (user && role)
        await db.insert(schema.userRoles).values({ userId: user.id, roleId: role.id });
      console.log(`Created fictional staff user ${email}`);
    }
    if (!process.env.SEED_PASSWORD)
      console.log(`Development password for seeded users: ${password}`);
  } finally {
    await pool.end();
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
