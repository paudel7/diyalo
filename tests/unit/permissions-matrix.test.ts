import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONFLICTING_ROLE_PAIRS,
  MATRIX,
  PERMISSION_CODES,
  ROLE_CODES,
  grantLevel,
  hasPermission,
  hasUnconditionalPermission,
  strongestGrant,
  type RoleCode,
} from "@/lib/permissions";

const doc = readFileSync(
  path.resolve(__dirname, "../../docs/stage-2/access-control-matrix.md"),
  "utf8",
);

/** Parses the permission table in section 2 of the matrix document. */
function parseDocMatrix() {
  const section = doc.split("## 2. Permission matrix")[1]?.split("## 3.")[0] ?? "";
  const rows = new Map<string, string[]>();
  for (const line of section.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    const code = /^`([a-z_.]+)`/.exec(cells[1] ?? "")?.[1];
    if (!code) continue;
    // cells: "", permission, SA, CM, VO, FO, FA, RO, SG, ANON, notes
    rows.set(code, cells.slice(2, 9));
  }
  return rows;
}

describe("access-control matrix", () => {
  it("document and code agree on every role and permission pair", () => {
    const parsed = parseDocMatrix();
    // The document groups five Stage 6 maker permissions on one row; expand it.
    const grouped = parsed.get("fund.classify");
    expect(grouped).toBeDefined();
    for (const code of [
      "allocation.prepare",
      "disbursement.request",
      "journal.prepare",
      "reconciliation.perform",
    ]) {
      parsed.set(code, grouped ?? []);
    }
    const groupedApprove = parsed.get("allocation.approve");
    for (const code of ["disbursement.approve", "journal.post"])
      parsed.set(code, groupedApprove ?? []);

    expect([...parsed.keys()].sort()).toEqual([...PERMISSION_CODES].sort());
    for (const code of PERMISSION_CODES) {
      const expected = parsed.get(code);
      const actual = ROLE_CODES.map((r) => grantLevel(r, code));
      expect(actual, code).toEqual(expected);
    }
  });

  it("every role and permission pair is allowed or denied exactly as the table says", () => {
    for (const code of PERMISSION_CODES) {
      ROLE_CODES.forEach((role, i) => {
        const ch = MATRIX[code].grants[i];
        expect(hasPermission([role], code), `${role} ${code}`).toBe(ch !== "-");
        expect(hasUnconditionalPermission([role], code), `${role} ${code}`).toBe(ch === "Y");
      });
    }
  });

  it("denies by default and throws on unknown permission codes", () => {
    expect(hasPermission([], "user.manage")).toBe(false);
    expect(() => strongestGrant(["super_admin"], "made.up")).toThrow();
  });

  it("applies the notable rules of the matrix", () => {
    const only = (role: RoleCode) => [role];
    expect(hasPermission(only("super_admin"), "beneficiary.read_identity")).toBe(false); // no child data
    expect(hasPermission(only("super_admin"), "case.read")).toBe(false);
    expect(hasPermission(only("finance_officer"), "beneficiary.read_identity")).toBe(false);
    expect(hasPermission(only("reporting_officer"), "document.read")).toBe(false);
    expect(hasPermission(only("case_manager"), "user.manage")).toBe(false);
    expect(hasUnconditionalPermission(only("case_manager"), "case.approve")).toBe(false); // needs authority
    expect(hasPermission(only("safeguarding_officer"), "safeguarding.read")).toBe(true);
    for (const r of ROLE_CODES) expect(hasPermission([r], "document.delete")).toBe(false);
  });

  it("maker and checker are different roles", () => {
    expect(hasPermission(["finance_officer"], "disbursement.approve")).toBe(false);
    expect(hasPermission(["finance_approver"], "disbursement.request")).toBe(false);
    expect(CONFLICTING_ROLE_PAIRS).toContainEqual(["finance_officer", "finance_approver"]);
  });
});
