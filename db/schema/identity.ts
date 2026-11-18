import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  AUTH_TOKEN_PURPOSES,
  USER_KINDS,
  USER_STATUSES,
  citext,
  createdAt,
  inList,
  pk,
  ts,
  updatedAt,
  version,
} from "./common";

export const users = pgTable(
  "users",
  {
    id: pk(),
    email: citext("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    kind: text("kind").notNull().default("staff"),
    status: text("status").notNull().default("invited"),
    passwordHash: text("password_hash"),
    passwordChangedAt: ts("password_changed_at"),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lastFailedLoginAt: ts("last_failed_login_at"),
    lockedUntil: ts("locked_until"),
    lastLoginAt: ts("last_login_at"),
    deactivatedAt: ts("deactivated_at"),
    deactivatedBy: uuid("deactivated_by"),
    deactivationReason: text("deactivation_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    version: version(),
  },
  (t) => [
    check("users_kind_check", inList("kind", USER_KINDS)),
    check("users_status_check", inList("status", USER_STATUSES)),
    check(
      "users_deactivated_check",
      sql`("status" <> 'deactivated') or ("deactivated_at" is not null)`,
    ),
    index("users_status_idx").on(t.status),
  ],
);

export const roles = pgTable("roles", {
  id: pk(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isPrivileged: boolean("is_privileged").notNull().default(false),
  requiresMfa: boolean("requires_mfa").notNull().default(true),
  createdAt: createdAt(),
});

export const permissions = pgTable("permissions", {
  id: pk(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  stage: integer("stage").notNull(),
  createdAt: createdAt(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionId] }),
    index("role_permissions_permission_idx").on(t.permissionId),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: pk(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "restrict" }),
    grantedAt: ts("granted_at").notNull().defaultNow(),
    revokedAt: ts("revoked_at"),
    revokedBy: uuid("revoked_by").references(() => users.id, { onDelete: "restrict" }),
  },
  (t) => [
    uniqueIndex("user_roles_active_unique")
      .on(t.userId, t.roleId)
      .where(sql`${t.revokedAt} is null`),
    index("user_roles_user_idx").on(t.userId),
    index("user_roles_role_idx").on(t.roleId),
    check("user_roles_revoke_check", sql`("revoked_at" is not null) or ("revoked_by" is null)`),
  ],
);

export const approvalAuthorities = pgTable(
  "approval_authorities",
  {
    id: pk(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    authority: text("authority").notNull(),
    maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
    currency: text("currency"),
    grantedBy: uuid("granted_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    validFrom: ts("valid_from").notNull().defaultNow(),
    validTo: ts("valid_to"),
    revokedAt: ts("revoked_at"),
    createdAt: createdAt(),
  },
  (t) => [
    index("approval_authorities_user_idx").on(t.userId),
    check("approval_authorities_authority_check", inList("authority", ["case.approve"])),
    check(
      "approval_authorities_currency_check",
      sql`("currency" is null) or ("currency" ~ '^[A-Z]{3}$')`,
    ),
    check(
      "approval_authorities_amount_currency_check",
      sql`("max_amount" is null) = ("currency" is null)`,
    ),
    check(
      "approval_authorities_window_check",
      sql`("valid_to" is null) or ("valid_to" > "valid_from")`,
    ),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: pk(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    lastSeenAt: ts("last_seen_at").notNull().defaultNow(),
    idleExpiresAt: ts("idle_expires_at").notNull(),
    absoluteExpiresAt: ts("absolute_expires_at").notNull(),
    mfaVerifiedAt: ts("mfa_verified_at"),
    passwordVerifiedAt: ts("password_verified_at").notNull().defaultNow(),
    ipPrefix: text("ip_prefix"),
    userAgentHash: text("user_agent_hash"),
    revokedAt: ts("revoked_at"),
    revokedReason: text("revoked_reason"),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_absolute_expiry_idx").on(t.absoluteExpiresAt),
  ],
);

export const mfaCredentials = pgTable(
  "mfa_credentials",
  {
    id: pk(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: text("type").notNull().default("totp"),
    secretEncrypted: text("secret_encrypted").notNull(),
    confirmedAt: ts("confirmed_at"),
    lastUsedStep: bigint("last_used_step", { mode: "number" }),
    createdAt: createdAt(),
  },
  (t) => [
    check("mfa_credentials_type_check", inList("type", ["totp"])),
    uniqueIndex("mfa_credentials_one_confirmed")
      .on(t.userId)
      .where(sql`${t.confirmedAt} is not null`),
    index("mfa_credentials_user_idx").on(t.userId),
  ],
);

export const mfaRecoveryCodes = pgTable(
  "mfa_recovery_codes",
  {
    id: pk(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    codeHash: text("code_hash").notNull(),
    usedAt: ts("used_at"),
    createdAt: createdAt(),
  },
  (t) => [index("mfa_recovery_codes_user_idx").on(t.userId)],
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: pk(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    purpose: text("purpose").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: ts("expires_at").notNull(),
    usedAt: ts("used_at"),
    createdAt: createdAt(),
  },
  (t) => [
    check("auth_tokens_purpose_check", inList("purpose", AUTH_TOKEN_PURPOSES)),
    index("auth_tokens_user_idx").on(t.userId),
  ],
);
