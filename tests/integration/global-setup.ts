import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { syncReferenceData } from "../../db/seed/reference";
import * as schema from "../../db/schema";

/** Migrates the throwaway test database from zero once per run. */
export default async function setup() {
  const url = process.env.TEST_MIGRATION_DATABASE_URL ?? process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL (or TEST_MIGRATION_DATABASE_URL) is required");
  const name = new URL(url).pathname.slice(1);
  if (!/test/.test(name))
    throw new Error(`Refusing to reset a database not named *test* (${name})`);
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await pool.query("drop schema if exists public cascade");
    await pool.query("drop schema if exists drizzle cascade");
    await pool.query("create schema public");
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "db/migrations" });
    await syncReferenceData(db);
  } finally {
    await pool.end();
  }
}
