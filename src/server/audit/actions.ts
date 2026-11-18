import { z } from "zod";

/**
 * Allowlisted audit metadata, one strict schema per action. Values are short identifier-like
 * tokens, numbers or booleans. Names, emails, phone numbers, tokens, passwords and free text
 * are rejected at runtime (and by tests), so they cannot reach the audit log.
 */
const token = z
  .string()
  .max(80)
  .regex(/^[A-Za-z0-9_.:+\-/]+$/, "metadata values must be identifier-like");
const roleList = z.array(token).max(20);
const none = z.strictObject({});

export const AUDIT_ACTIONS = {
  "auth.login_succeeded": z.strictObject({ mfaRequired: z.boolean() }),
  "auth.login_failed": z.strictObject({ reason: token }),
  "auth.account_locked": z.strictObject({ failedCount: z.number().int() }),
  "auth.logout": none,
  "auth.mfa_enrolled": none,
  "auth.mfa_verified": z.strictObject({ method: z.enum(["totp", "recovery"]) }),
  "auth.mfa_failed": z.strictObject({ reason: token }),
  "auth.recovery_codes_regenerated": none,
  "auth.password_changed": z.strictObject({ sessionsRevoked: z.number().int() }),
  "auth.password_reset_requested": none,
  "auth.password_reset_completed": none,
  "auth.invite_accepted": none,
  "user.invited": z.strictObject({ roles: roleList }),
  "user.updated": z.strictObject({ fields: roleList }),
  "user.deactivated": z.strictObject({ sessionsRevoked: z.number().int() }),
  "user.reactivated": none,
  "role.granted": z.strictObject({ role: token }),
  "role.revoked": z.strictObject({ role: token }),
  "session.revoked": z.strictObject({ count: z.number().int(), scope: z.enum(["own", "user"]) }),
  "authz.denied": z.strictObject({ permission: token, reason: token.optional() }),
  "audit.viewed": z.strictObject({ resultCount: z.number().int() }),
  "audit.chain_verified": z.strictObject({ checked: z.number().int(), ok: z.boolean() }),
  "application.opened": none,
  "beneficiary.identity_opened": none,
  "document.opened": none,
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS;
export type AuditMetadata<A extends AuditAction> = z.infer<(typeof AUDIT_ACTIONS)[A]>;
export const AUDIT_ACTION_NAMES = Object.keys(AUDIT_ACTIONS) as AuditAction[];

/** Events a safeguarding officer may read (matrix note 3). */
export const SAFEGUARDING_VISIBLE_PREFIXES = [
  "beneficiary.",
  "document.",
  "application.opened",
] as const;
