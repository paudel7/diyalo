import type { PolicyDecision } from "./separation-of-duties";
import { checkSeparationOfDuties } from "./separation-of-duties";

export interface ApprovalAuthority {
  authority: string;
  maxAmount: string | null;
  currency: string | null;
  validFrom: Date;
  validTo: Date | null;
  revokedAt: Date | null;
}

export interface CaseApprovalInput {
  approverId: string;
  assignedToId: string | null;
  recommenderId: string | null;
  authorities: readonly ApprovalAuthority[];
  amount: string | null;
  currency: string | null;
  now: Date;
}

/** Decimal-string comparison without floats. Both values are non-negative with up to 2 decimals. */
export function decimalLte(a: string, b: string): boolean {
  const norm = (v: string) => {
    const [i = "0", f = ""] = v.split(".");
    return BigInt(i + f.padEnd(2, "0").slice(0, 2));
  };
  return norm(a) <= norm(b);
}

/**
 * Matrix note 6: a case manager approves only with a current approval authority, within its
 * limit, and never a case they recommended or are assigned to.
 */
export function checkCaseApproval(input: CaseApprovalInput): PolicyDecision {
  const sod = checkSeparationOfDuties({
    approverId: input.approverId,
    preparerIds: [input.assignedToId, input.recommenderId],
  });
  if (!sod.allowed) return sod;

  const current = input.authorities.filter(
    (a) =>
      a.authority === "case.approve" &&
      a.revokedAt === null &&
      a.validFrom <= input.now &&
      (a.validTo === null || a.validTo > input.now),
  );
  if (current.length === 0) return { allowed: false, reason: "no_current_approval_authority" };

  const withinLimit = current.some((a) => {
    if (a.maxAmount === null) return true; // no limit configured for this authority
    if (input.amount === null || input.currency === null) return false;
    return a.currency === input.currency && decimalLte(input.amount, a.maxAmount);
  });
  return withinLimit ? { allowed: true } : { allowed: false, reason: "amount_exceeds_authority" };
}
