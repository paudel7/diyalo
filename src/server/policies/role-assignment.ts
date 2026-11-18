import { CONFLICTING_ROLE_PAIRS, type RoleCode } from "@/lib/permissions";
import type { PolicyDecision } from "./separation-of-duties";

export interface RoleAssignmentInput {
  actorId: string;
  targetUserId: string;
  roleToGrant: RoleCode;
  targetCurrentRoles: readonly RoleCode[];
}

export function checkRoleAssignment(input: RoleAssignmentInput): PolicyDecision {
  if (input.actorId === input.targetUserId) {
    return { allowed: false, reason: "cannot_grant_own_role" };
  }
  const resulting = new Set<RoleCode>([...input.targetCurrentRoles, input.roleToGrant]);
  for (const [a, b] of CONFLICTING_ROLE_PAIRS) {
    if (resulting.has(a) && resulting.has(b)) {
      return { allowed: false, reason: `conflicting_roles:${a}+${b}` };
    }
  }
  return { allowed: true };
}

export interface DeactivationInput {
  actorId: string;
  targetUserId: string;
  targetRoles: readonly RoleCode[];
  activeSuperAdminCount: number;
}

export function checkDeactivation(input: DeactivationInput): PolicyDecision {
  if (input.actorId === input.targetUserId)
    return { allowed: false, reason: "cannot_deactivate_self" };
  if (input.targetRoles.includes("super_admin") && input.activeSuperAdminCount <= 1) {
    return { allowed: false, reason: "last_super_admin" };
  }
  return { allowed: true };
}

export function checkRoleRevocation(input: {
  roleToRevoke: RoleCode;
  targetStatusActive: boolean;
  activeSuperAdminCount: number;
}): PolicyDecision {
  if (
    input.roleToRevoke === "super_admin" &&
    input.targetStatusActive &&
    input.activeSuperAdminCount <= 1
  ) {
    return { allowed: false, reason: "last_super_admin" };
  }
  return { allowed: true };
}
