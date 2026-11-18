import { customType, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";

export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const pk = () =>
  uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`);
export const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
export const version = () => integer("version").notNull().default(1);
export const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Builds a CHECK expression `column in ('a','b')` from one TypeScript list. */
export function inList(column: string, values: readonly string[]): SQL {
  const quoted = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
  return sql.raw(`"${column}" in (${quoted})`);
}

export const USER_KINDS = ["staff", "donor", "guardian", "partner"] as const;
export const USER_STATUSES = ["invited", "active", "locked", "deactivated"] as const;
export const AUTH_TOKEN_PURPOSES = ["invite", "password_reset"] as const;
export const APPLICATION_STATUSES = [
  "submitted",
  "completeness_review",
  "returned_for_information",
  "eligibility_screening",
  "verification",
  "assessment",
  "awaiting_approval",
  "approved",
  "declined",
  "closed_duplicate",
  "closed_out_of_scope",
  "withdrawn",
] as const;
export const CASE_STATUSES = ["pending_setup", "active", "on_hold", "closed"] as const;
export const SCAN_STATUSES = ["pending", "clean", "infected", "skipped"] as const;
export const DOCUMENT_CLASSIFICATIONS = ["restricted", "confidential", "internal"] as const;
export const RELATIONSHIP_TYPES = [
  "parent",
  "legal_guardian",
  "authorized_representative",
] as const;
export const AUDIT_OUTCOMES = ["success", "denied", "failure"] as const;
export const AUDIT_ACTOR_TYPES = ["user", "system", "anonymous"] as const;
