import { describe, expect, it } from "vitest";
import { cases, sponsorshipNeeds } from "@/mocks/cases";
import { applications, disbursements } from "@/mocks/admin";

/**
 * Stage 1 exit gate: no private data in prototypes. The only fields a public case may expose
 * are on this allowlist (roadmap PUB-03 and 5.4). Adding a field here is a privacy decision.
 */
const PUBLIC_CASE_ALLOWLIST = [
  "ageBand",
  "budget",
  "displayName",
  "lastUpdate",
  "needSummary",
  "program",
  "raised",
  "region",
  "slug",
  "status",
  "story",
  "target",
  "title",
];

describe("public case mock data", () => {
  it("exposes only allowlisted fields", () => {
    for (const c of cases) {
      expect(Object.keys(c).sort()).toEqual(PUBLIC_CASE_ALLOWLIST);
    }
  });

  it("marks every displayed name as a sample", () => {
    for (const c of cases) {
      expect(c.displayName.toLowerCase()).toContain("sample");
    }
  });

  it("has budget lines that add up exactly to the target", () => {
    for (const c of cases) {
      const total = c.budget.reduce((sum, line) => sum + line.amount.minor, 0);
      expect(total).toBe(c.target.minor);
    }
  });

  it("never raises more than the target and uses integer minor units", () => {
    for (const c of cases) {
      expect(c.raised.minor).toBeLessThanOrEqual(c.target.minor);
      expect(Number.isInteger(c.raised.minor)).toBe(true);
      expect(Number.isInteger(c.target.minor)).toBe(true);
    }
  });

  it("marks a case funded only when raised equals target", () => {
    for (const c of cases) {
      expect(c.status === "funded").toBe(c.raised.minor === c.target.minor);
    }
  });

  it("uses unique slugs", () => {
    expect(new Set(cases.map((c) => c.slug)).size).toBe(cases.length);
  });
});

describe("sponsorship mock data", () => {
  it("never funds more units than needed", () => {
    for (const n of sponsorshipNeeds) {
      expect(n.unitsFunded).toBeLessThanOrEqual(n.unitsNeeded);
    }
  });
});

describe("admin mock data", () => {
  it("uses unique references", () => {
    const refs = [
      ...applications.map((a) => a.reference),
      ...disbursements.map((d) => d.reference),
    ];
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("keeps maker and checker different on every disbursement", () => {
    for (const d of disbursements) {
      expect(d.maker).not.toBe(d.checker);
    }
  });
});
