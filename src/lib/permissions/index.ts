import { ForbiddenError } from "@/lib/errors";
import {
  grantLevel,
  isPermissionCode,
  ROLE_CODES,
  type GrantLevel,
  type PermissionCode,
  type RoleCode,
} from "./matrix";

export * from "./matrix";

/** Strongest level any held role grants. Unknown permission codes throw (deny by default). */
export function strongestGrant(roles: readonly RoleCode[], permission: string): GrantLevel {
  if (!isPermissionCode(permission)) {
    throw new Error(`Unknown permission code: ${permission}`);
  }
  let best: GrantLevel = "-";
  for (const role of roles) {
    if (!ROLE_CODES.includes(role)) continue;
    const level = grantLevel(role, permission);
    if (level === "Y") return "Y";
    if (level === "C") best = "C";
    else if (level === "L" && best === "-") best = "L";
  }
  return best;
}

/** True when a held role grants the permission (conditionally or not). */
export function hasPermission(roles: readonly RoleCode[], permission: PermissionCode): boolean {
  return strongestGrant(roles, permission) !== "-";
}

/** True only for an unconditional grant. Conditional grants need a policy decision. */
export function hasUnconditionalPermission(
  roles: readonly RoleCode[],
  permission: PermissionCode,
): boolean {
  return strongestGrant(roles, permission) === "Y";
}

export function assertPermission(roles: readonly RoleCode[], permission: PermissionCode): void {
  if (!hasPermission(roles, permission)) throw new ForbiddenError(permission);
}
