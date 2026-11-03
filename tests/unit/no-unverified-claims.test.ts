import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Stage 0 gate: no unresolved legal or payment assumption may be stated as fact in code or
 * public copy. This guard scans application source for claims that must not appear until the
 * matching decision in docs/decisions/decision-register.md is Confirmed.
 */
const FORBIDDEN: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /tax[- ]deductible/i, reason: "tax-deductibility is unconfirmed (D-03)" },
  { pattern: /tax receipt/i, reason: "tax receipts are unconfirmed (D-03)" },
  { pattern: /registered charity/i, reason: "charity status is unconfirmed (D-01)" },
  { pattern: /charitable registration number/i, reason: "registration is unconfirmed (D-01)" },
  { pattern: /100% of (your )?donation/i, reason: "fee treatment is undecided (PUB-05, PUB-08)" },
];

const SRC = path.resolve(__dirname, "../../src");
// The organization config file documents the forbidden terms in comments; skip it.
const SKIP = new Set([path.join(SRC, "lib/config/organization.ts")]);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe("no unverified legal or payment claims in src/", () => {
  const files = walk(SRC).filter((f) => /\.(ts|tsx|md|mdx|json)$/.test(f) && !SKIP.has(f));

  it("finds source files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const { pattern, reason } of FORBIDDEN) {
    it(`contains no "${pattern.source}" (${reason})`, () => {
      const offenders = files.filter((f) => pattern.test(fs.readFileSync(f, "utf8")));
      expect(offenders).toEqual([]);
    });
  }
});
