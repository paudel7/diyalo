import { sql } from "drizzle-orm";
import { bigint, check, index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { AUDIT_ACTOR_TYPES, AUDIT_OUTCOMES, inList, ts } from "./common";

/** Append-only. The trigger and privileges that enforce this live in the SQL migration. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    occurredAt: ts("occurred_at").notNull().defaultNow(),
    actorUserId: uuid("actor_user_id"),
    actorType: text("actor_type").notNull(),
    actorRoles: text("actor_roles")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    outcome: text("outcome").notNull(),
    correlationId: text("correlation_id"),
    ipPrefix: text("ip_prefix"),
    userAgentHash: text("user_agent_hash"),
    metadata: jsonb("metadata")
      .notNull()
      .default(sql`'{}'::jsonb`),
    prevHash: text("prev_hash"),
    rowHash: text("row_hash").notNull(),
  },
  (t) => [
    check("audit_actor_type_check", inList("actor_type", AUDIT_ACTOR_TYPES)),
    check("audit_outcome_check", inList("outcome", AUDIT_OUTCOMES)),
    index("audit_logs_actor_idx").on(t.actorUserId),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_occurred_idx").on(t.occurredAt),
  ],
);
