import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema";
import { getEnv } from "@/server/env";

export type Db = NodePgDatabase<typeof schema>;
/** A transaction handle has the same query API as the database. */
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type Executor = Db | Tx;

const globalForDb = globalThis as unknown as { __diyaloPool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.__diyaloPool) {
    globalForDb.__diyaloPool = new Pool({ connectionString: getEnv().DATABASE_URL, max: 10 });
  }
  return globalForDb.__diyaloPool;
}

let cachedDb: Db | undefined;
export function getDb(): Db {
  cachedDb ??= drizzle(getPool(), { schema });
  return cachedDb;
}

export function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return getDb().transaction(fn);
}
