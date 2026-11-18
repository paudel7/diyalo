import { describe, expect, it } from "vitest";
import { checkSeparationOfDuties } from "@/server/policies/separation-of-duties";
import {
  checkCaseApproval,
  decimalLte,
  type ApprovalAuthority,
} from "@/server/policies/case-approval";
import {
  checkDeactivation,
  checkRoleAssignment,
  checkRoleRevocation,
} from "@/server/policies/role-assignment";

describe("separation of duties", () => {
  it("blocks anyone who prepared the item", () => {
    expect(checkSeparationOfDuties({ approverId: "a", preparerIds: ["b", "a"] }).allowed).toBe(
      false,
    );
    expect(
      checkSeparationOfDuties({ approverId: "a", preparerIds: ["b", null, undefined] }).allowed,
    ).toBe(true);
  });
});

describe("case approval", () => {
  const now = new Date("2026-11-10T00:00:00Z");
  const auth = (o: Partial<ApprovalAuthority> = {}): ApprovalAuthority => ({
    authority: "case.approve",
    maxAmount: "1000.00",
    currency: "NPR",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validTo: null,
    revokedAt: null,
    ...o,
  });
  const base = {
    approverId: "x",
    assignedToId: "y",
    recommenderId: "z",
    amount: "500.00",
    currency: "NPR",
    now,
  };

  it("needs a current authority", () => {
    expect(checkCaseApproval({ ...base, authorities: [] })).toEqual({
      allowed: false,
      reason: "no_current_approval_authority",
    });
    expect(checkCaseApproval({ ...base, authorities: [auth({ revokedAt: now })] }).allowed).toBe(
      false,
    );
    expect(
      checkCaseApproval({
        ...base,
        authorities: [auth({ validTo: new Date("2026-06-01T00:00:00Z") })],
      }).allowed,
    ).toBe(false);
    expect(
      checkCaseApproval({
        ...base,
        authorities: [auth({ validFrom: new Date("2027-01-01T00:00:00Z") })],
      }).allowed,
    ).toBe(false);
    expect(checkCaseApproval({ ...base, authorities: [auth()] }).allowed).toBe(true);
  });
  it("enforces the limit and currency without floats", () => {
    expect(checkCaseApproval({ ...base, amount: "1000.00", authorities: [auth()] }).allowed).toBe(
      true,
    );
    expect(checkCaseApproval({ ...base, amount: "1000.01", authorities: [auth()] }).allowed).toBe(
      false,
    );
    expect(checkCaseApproval({ ...base, currency: "USD", authorities: [auth()] }).allowed).toBe(
      false,
    );
    expect(decimalLte("0.1", "0.10")).toBe(true);
    expect(decimalLte("2", "10")).toBe(true);
  });
  it("never lets the assignee or recommender approve", () => {
    expect(checkCaseApproval({ ...base, approverId: "y", authorities: [auth()] }).allowed).toBe(
      false,
    );
    expect(checkCaseApproval({ ...base, approverId: "z", authorities: [auth()] }).allowed).toBe(
      false,
    );
  });
});

describe("role policies", () => {
  it("blocks self grants and conflicting pairs", () => {
    expect(
      checkRoleAssignment({
        actorId: "a",
        targetUserId: "a",
        roleToGrant: "case_manager",
        targetCurrentRoles: [],
      }).allowed,
    ).toBe(false);
    expect(
      checkRoleAssignment({
        actorId: "a",
        targetUserId: "b",
        roleToGrant: "finance_approver",
        targetCurrentRoles: ["finance_officer"],
      }).allowed,
    ).toBe(false);
    expect(
      checkRoleAssignment({
        actorId: "a",
        targetUserId: "b",
        roleToGrant: "finance_approver",
        targetCurrentRoles: ["super_admin"],
      }).allowed,
    ).toBe(false);
    expect(
      checkRoleAssignment({
        actorId: "a",
        targetUserId: "b",
        roleToGrant: "finance_approver",
        targetCurrentRoles: ["reporting_officer"],
      }).allowed,
    ).toBe(true);
  });
  it("protects the last super administrator", () => {
    expect(
      checkDeactivation({
        actorId: "a",
        targetUserId: "b",
        targetRoles: ["super_admin"],
        activeSuperAdminCount: 1,
      }).allowed,
    ).toBe(false);
    expect(
      checkDeactivation({
        actorId: "a",
        targetUserId: "b",
        targetRoles: ["super_admin"],
        activeSuperAdminCount: 2,
      }).allowed,
    ).toBe(true);
    expect(
      checkDeactivation({
        actorId: "a",
        targetUserId: "a",
        targetRoles: [],
        activeSuperAdminCount: 3,
      }).allowed,
    ).toBe(false);
    expect(
      checkRoleRevocation({
        roleToRevoke: "super_admin",
        targetStatusActive: true,
        activeSuperAdminCount: 1,
      }).allowed,
    ).toBe(false);
  });
});
