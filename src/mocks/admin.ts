import type { Money } from "@/lib/money";
import type { ApplicationRow, ApplicationStatus, DisbursementRow } from "@/mocks/types";

const usd = (dollars: number): Money => ({ minor: dollars * 100, currency: "USD" });

/** FICTIONAL admin records. Names are role labels, not people. */
export const applications: ApplicationRow[] = [
  {
    id: "a1",
    reference: "APP-2026-0001",
    program: "Education support",
    region: "Bagmati Province",
    received: "2026-10-21",
    status: "Awaiting approval",
    assignee: "Case manager A",
  },
  {
    id: "a2",
    reference: "APP-2026-0002",
    program: "Essential living",
    region: "Koshi Province",
    received: "2026-10-24",
    status: "Assessment",
    assignee: "Case manager B",
  },
  {
    id: "a3",
    reference: "APP-2026-0003",
    program: "Education support",
    region: "Gandaki Province",
    received: "2026-10-27",
    status: "Verification",
    assignee: "Verification officer A",
    flag: "Evidence missing: income statement",
  },
  {
    id: "a4",
    reference: "APP-2026-0004",
    program: "Essential living",
    region: "Lumbini Province",
    received: "2026-10-29",
    status: "Returned for information",
    assignee: "Case manager A",
    flag: "Waiting on guardian",
  },
  {
    id: "a5",
    reference: "APP-2026-0005",
    program: "Education support",
    region: "Bagmati Province",
    received: "2026-11-02",
    status: "Eligibility screening",
    assignee: "Case manager B",
  },
  {
    id: "a6",
    reference: "APP-2026-0006",
    program: "Education support",
    region: "Koshi Province",
    received: "2026-11-03",
    status: "Submitted",
    assignee: "Unassigned",
  },
  {
    id: "a7",
    reference: "APP-2026-0007",
    program: "Essential living",
    region: "Bagmati Province",
    received: "2026-11-04",
    status: "Submitted",
    assignee: "Unassigned",
    flag: "Possible duplicate: APP-2026-0002",
  },
  {
    id: "a8",
    reference: "APP-2026-0008",
    program: "Education support",
    region: "Gandaki Province",
    received: "2026-10-15",
    status: "Approved",
    assignee: "Case manager A",
  },
];

export function getApplication(reference: string) {
  return applications.find((a) => a.reference === reference);
}

/** The case workflow from roadmap 5.2, in order, for the stepper. */
export const workflowSteps: ApplicationStatus[] = [
  "Submitted",
  "Eligibility screening",
  "Verification",
  "Assessment",
  "Awaiting approval",
  "Approved",
];

export const disbursements: DisbursementRow[] = [
  {
    id: "d1",
    reference: "DSB-2026-0001",
    payee: "Sample school (fictional)",
    purpose: "School fees, sample case Aarav",
    amount: usd(380),
    fund: "Education (restricted)",
    maker: "Finance officer A",
    checker: "Finance approver A",
    status: "Awaiting approval",
  },
  {
    id: "d2",
    reference: "DSB-2026-0002",
    payee: "Sample supplier (fictional)",
    purpose: "Solar study lights, 30 units",
    amount: usd(660),
    fund: "Education (restricted)",
    maker: "Finance officer A",
    checker: "Finance approver A",
    status: "Approved",
  },
  {
    id: "d3",
    reference: "DSB-2026-0003",
    payee: "Sample landlord (fictional)",
    purpose: "Rent contribution, sample household B",
    amount: usd(120),
    fund: "Essential living (restricted)",
    maker: "Finance officer B",
    checker: "Finance approver A",
    status: "Draft",
  },
];

export interface ChainLink {
  stage: string;
  record: string;
  detail: string;
}

/** One sample gift followed from payment to evidence (roadmap 7.1). Fictional. */
export const sampleChain: ChainLink[] = [
  {
    stage: "Donation",
    record: "DON-2026-0412",
    detail: "$50 gift, payment confirmed by signed gateway message",
  },
  {
    stage: "Fund",
    record: "Education (restricted)",
    detail: "Classified as program-restricted at the time of the gift",
  },
  { stage: "Allocation", record: "ALC-2026-0087", detail: "$50 allocated to sample case Aarav" },
  {
    stage: "Disbursement",
    record: "DSB-2026-0001",
    detail: "Requested by Finance officer A, waiting for a different approver",
  },
  {
    stage: "Expense evidence",
    record: "Not yet received",
    detail: "Receipt from the school is attached after payment",
  },
];
