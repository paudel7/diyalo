import "server-only";
import { and, desc, eq, gte, lte, or, like, type SQL } from "drizzle-orm";
import { auditLogs } from "@db/schema";
import { getDb, withTransaction } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { recordAudit, verifyAuditChain, type ChainVerification } from "@/server/audit/audit";
import { AUDIT_ACTIONS, SAFEGUARDING_VISIBLE_PREFIXES } from "@/server/audit/actions";
import { strongestGrant } from "@/lib/permissions";
import { authorize } from "./authorize";
import type { Actor, AuthPolicy } from "./session-service";

export interface AuditFilter {
  action?: string;
  actorUserId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

/**
 * Full log for a super administrator. A safeguarding officer (conditional grant) sees only
 * safeguarding-related events (matrix note 3). The read itself is audited.
 */
export async function listAuditEvents(
  actor: Actor,
  filter: AuditFilter,
  ctx: RequestContext,
  opts: { policy?: AuthPolicy } = {},
) {
  await authorize(actor, "audit.read", ctx, { ...opts, stepUp: false });
  const conditions: SQL[] = [];
  if (strongestGrant(actor.roles, "audit.read") !== "Y") {
    const visible = SAFEGUARDING_VISIBLE_PREFIXES.map((p) => like(auditLogs.action, `${p}%`));
    const scoped = or(...visible);
    if (scoped) conditions.push(scoped);
  }
  if (filter.action && filter.action in AUDIT_ACTIONS)
    conditions.push(eq(auditLogs.action, filter.action));
  if (filter.actorUserId) conditions.push(eq(auditLogs.actorUserId, filter.actorUserId));
  if (filter.from) conditions.push(gte(auditLogs.occurredAt, filter.from));
  if (filter.to) conditions.push(lte(auditLogs.occurredAt, filter.to));
  const limit = Math.min(Math.max(filter.limit ?? 100, 1), 500);

  const rows = await getDb()
    .select({
      id: auditLogs.id,
      occurredAt: auditLogs.occurredAt,
      actorUserId: auditLogs.actorUserId,
      actorType: auditLogs.actorType,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      outcome: auditLogs.outcome,
      metadata: auditLogs.metadata,
    })
    .from(auditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.id))
    .limit(limit);

  await withTransaction((tx) =>
    recordAudit(tx, {
      action: "audit.viewed",
      outcome: "success",
      actor: { userId: actor.userId, type: "user", roles: actor.roles },
      metadata: { resultCount: rows.length },
      context: ctx,
    }),
  );
  return rows;
}

export async function verifyChainAsAdmin(
  actor: Actor,
  ctx: RequestContext,
  opts: { policy?: AuthPolicy } = {},
): Promise<ChainVerification> {
  await authorize(actor, "settings.manage", ctx, { ...opts, stepUp: false });
  const result = await verifyAuditChain(getDb());
  await withTransaction((tx) =>
    recordAudit(tx, {
      action: "audit.chain_verified",
      outcome: result.ok ? "success" : "failure",
      actor: { userId: actor.userId, type: "user", roles: actor.roles },
      metadata: { checked: result.checked, ok: result.ok },
      context: ctx,
    }),
  );
  return result;
}
