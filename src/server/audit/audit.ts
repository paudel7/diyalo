import "server-only";
import { asc, desc, gt, sql } from "drizzle-orm";
import { auditLogs } from "@db/schema";
import { hmacSha256Hex } from "@/lib/auth/crypto";
import { getEnv } from "@/server/env";
import type { Executor } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { AUDIT_ACTIONS, type AuditAction, type AuditMetadata } from "./actions";

const CHAIN_LOCK = 727001;

export interface AuditActor {
  userId: string | null;
  type: "user" | "system" | "anonymous";
  roles: readonly string[];
}

export const SYSTEM_ACTOR: AuditActor = { userId: null, type: "system", roles: [] };
export const ANONYMOUS_ACTOR: AuditActor = { userId: null, type: "anonymous", roles: [] };

type MetadataField<A extends AuditAction> =
  Record<string, never> extends AuditMetadata<A>
    ? { metadata?: AuditMetadata<A> }
    : { metadata: AuditMetadata<A> };

export type AuditEvent<A extends AuditAction> = {
  action: A;
  outcome: "success" | "denied" | "failure";
  actor: AuditActor;
  entityType?: string;
  entityId?: string;
  context: RequestContext;
} & MetadataField<A>;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

interface HashInput {
  occurredAt: Date;
  actorUserId: string | null;
  actorType: string;
  actorRoles: readonly string[];
  action: string;
  entityType: string | null;
  entityId: string | null;
  outcome: string;
  correlationId: string | null;
  ipPrefix: string | null;
  userAgentHash: string | null;
  metadata: unknown;
  prevHash: string | null;
}

export function computeRowHash(key: string, row: HashInput): string {
  return hmacSha256Hex(
    key,
    canonical([
      row.occurredAt.toISOString(),
      row.actorUserId,
      row.actorType,
      [...row.actorRoles].sort(),
      row.action,
      row.entityType,
      row.entityId,
      row.outcome,
      row.correlationId,
      row.ipPrefix,
      row.userAgentHash,
      row.metadata,
      row.prevHash,
    ]),
  );
}

/**
 * Writes one audit event inside the caller's transaction, so the event and the change it
 * describes commit or roll back together. Metadata is validated against the action's schema.
 */
export async function recordAudit<A extends AuditAction>(
  executor: Executor,
  event: AuditEvent<A>,
  key: string = getEnv().AUDIT_HMAC_KEY,
): Promise<void> {
  const schema = AUDIT_ACTIONS[event.action];
  if (!schema) throw new Error(`Unknown audit action: ${event.action}`);
  const metadata = schema.parse(event.metadata ?? {});

  await executor.execute(sql`select pg_advisory_xact_lock(${CHAIN_LOCK})`);
  const [last] = await executor
    .select({ rowHash: auditLogs.rowHash })
    .from(auditLogs)
    .orderBy(desc(auditLogs.id))
    .limit(1);
  const prevHash = last?.rowHash ?? null;
  const occurredAt = new Date();
  const values = {
    occurredAt,
    actorUserId: event.actor.userId,
    actorType: event.actor.type,
    actorRoles: [...event.actor.roles],
    action: event.action,
    entityType: event.entityType ?? null,
    entityId: event.entityId ?? null,
    outcome: event.outcome,
    correlationId: event.context.correlationId,
    ipPrefix: event.context.ipPrefix,
    userAgentHash: event.context.userAgentHash,
    metadata,
    prevHash,
  };
  await executor.insert(auditLogs).values({ ...values, rowHash: computeRowHash(key, values) });
}

export interface ChainVerification {
  ok: boolean;
  checked: number;
  brokenAtId?: number;
}

/** Recomputes the whole chain. Detects edited, removed or reordered rows. */
export async function verifyAuditChain(
  executor: Executor,
  key: string = getEnv().AUDIT_HMAC_KEY,
): Promise<ChainVerification> {
  let prev: string | null = null;
  let checked = 0;
  let afterId = 0;
  for (;;) {
    const rows = await executor
      .select()
      .from(auditLogs)
      .where(gt(auditLogs.id, afterId))
      .orderBy(asc(auditLogs.id))
      .limit(500);
    if (rows.length === 0) break;
    for (const r of rows) {
      const expected = computeRowHash(key, { ...r, prevHash: r.prevHash });
      if (r.prevHash !== prev || r.rowHash !== expected) {
        return { ok: false, checked, brokenAtId: r.id };
      }
      prev = r.rowHash;
      checked += 1;
      afterId = r.id;
    }
  }
  return { ok: true, checked };
}
