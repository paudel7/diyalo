/**
 * Separation of duties as one pure function, reused by every approval from Stage 3 onward.
 * The person who prepared, recommended or is assigned to an item cannot approve it.
 */
export interface SeparationInput {
  approverId: string;
  /** Everyone who prepared the item: maker, recommender, assignee, requester. */
  preparerIds: ReadonlyArray<string | null | undefined>;
}
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

export function checkSeparationOfDuties({
  approverId,
  preparerIds,
}: SeparationInput): PolicyDecision {
  if (preparerIds.some((id) => id === approverId)) {
    return { allowed: false, reason: "approver_prepared_item" };
  }
  return { allowed: true };
}
