import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { syncReferenceData } from "../db/seed/reference";
import * as schema from "../db/schema";
import { assertLocalEnvironment, requireEnv } from "./_env";

/** Drops everything in the target database, migrates from zero and syncs reference data. */
async function main() {
  assertLocalEnvironment();
  const pool = new Pool({ connectionString: requireEnv("DATABASE_MIGRATION_URL"), max: 1 });
  try {
    await pool.query("drop schema if exists public cascade");
    await pool.query("drop schema if exists drizzle cascade");
    await pool.query("create schema public");
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "db/migrations" });
    await syncReferenceData(db);
    console.log("Database reset and migrated from zero.");
  } finally {
    await pool.end();
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
