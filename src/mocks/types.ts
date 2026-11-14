import type { Money } from "@/lib/money";

/**
 * Stage 1 mock types. These describe what the prototype screens display. They are NOT the
 * database schema (that is proposed in Stage 2) and every record built from them is fictional.
 */

export type ProgramSlug = "education" | "essential-living";

export interface Program {
  slug: ProgramSlug;
  name: string;
  /** Short label for badges where space is tight. */
  shortName: string;
  summary: string;
  covers: string[];
  doesNotCover: string[];
}

/**
 * Public case: the allowlist of fields the public site may ever show (roadmap PUB-03, 5.4).
 * Anything not listed here (full name, address, contacts, school identity, documents,
 * assessments) must never appear on a public page. A test enforces this key list.
 */
export interface PublicCase {
  slug: string;
  /** Pseudonym or first name only, as consent permits. Fictional in the prototype. */
  displayName: string;
  ageBand: string;
  /** Broad region only, never an exact address. */
  region: string;
  program: ProgramSlug;
  title: string;
  needSummary: string;
  story: string[];
  status: "open" | "funded";
  target: Money;
  raised: Money;
  budget: Array<{ item: string; amount: Money }>;
  lastUpdate: { date: string; text: string };
}

export interface SponsorshipNeed {
  slug: string;
  name: string;
  program: ProgramSlug;
  unitCost: Money;
  unitsNeeded: number;
  unitsFunded: number;
  description: string;
}

export type ApplicationStatus =
  | "Submitted"
  | "Returned for information"
  | "Eligibility screening"
  | "Verification"
  | "Assessment"
  | "Awaiting approval"
  | "Approved"
  | "Declined";

export interface ApplicationRow {
  id: string;
  reference: string;
  program: string;
  region: string;
  received: string;
  status: ApplicationStatus;
  assignee: string;
  flag?: string;
}

export interface DisbursementRow {
  id: string;
  reference: string;
  payee: string;
  purpose: string;
  amount: Money;
  fund: string;
  maker: string;
  checker: string;
  status: "Draft" | "Awaiting approval" | "Approved" | "Paid" | "Rejected";
}
