import "server-only";
import { and, eq, isNull, ne } from "drizzle-orm";
import { sessions } from "@db/schema";
import type { Executor } from "@/server/db/client";

export type SessionRow = typeof sessions.$inferSelect;

export async function insertSession(db: Executor, values: typeof sessions.$inferInsert) {
  const [row] = await db.insert(sessions).values(values).returning();
  if (!row) throw new Error("Session insert failed");
  return row;
}

export async function findSessionByHash(db: Executor, tokenHash: string) {
  const [row] = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
  return row;
}

export async function touchSession(
  db: Executor,
  id: string,
  lastSeenAt: Date,
  idleExpiresAt: Date,
) {
  await db.update(sessions).set({ lastSeenAt, idleExpiresAt }).where(eq(sessions.id, id));
}

export async function revokeSession(db: Executor, id: string, reason: string, at: Date) {
  const rows = await db
    .update(sessions)
    .set({ revokedAt: at, revokedReason: reason })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)))
    .returning({ id: sessions.id });
  return rows.length;
}

export async function revokeAllForUser(
  db: Executor,
  userId: string,
  reason: string,
  at: Date,
  exceptSessionId?: string,
) {
  const rows = await db
    .update(sessions)
    .set({ revokedAt: at, revokedReason: reason })
    .where(
      and(
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        exceptSessionId ? ne(sessions.id, exceptSessionId) : undefined,
      ),
    )
    .returning({ id: sessions.id });
  return rows.length;
}

export async function markMfaVerified(db: Executor, id: string, at: Date) {
  await db.update(sessions).set({ mfaVerifiedAt: at }).where(eq(sessions.id, id));
}
