/**
 * The access-control matrix, single source of truth (docs/stage-2/access-control-matrix.md).
 * Three checks keep it honest: tests/unit/permissions-matrix.test.ts (table-driven), the same
 * test parsing the document, and tests/integration/seed-matches-catalogue.test.ts (database).
 *
 * Levels: Y allowed, C conditional (a policy adds the condition), L later stage, - denied.
 * Deny by default: a pair not listed as Y, C or L is denied.
 */
export const ROLE_CODES = [
  "super_admin",
  "case_manager",
  "verification_officer",
  "finance_officer",
  "finance_approver",
  "reporting_officer",
  "safeguarding_officer",
] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export interface RoleDefinition {
  code: RoleCode;
  name: string;
  description: string;
  isPrivileged: boolean;
  requiresMfa: boolean;
}

export const ROLES: readonly RoleDefinition[] = [
  {
    code: "super_admin",
    name: "Super administrator",
    description: "Manages users, roles and settings. No child-data access by default.",
    isPrivileged: true,
    requiresMfa: true,
  },
  {
    code: "case_manager",
    name: "Case manager",
    description: "Reviews applications, assesses, recommends and manages cases.",
    isPrivileged: false,
    requiresMfa: true,
  },
  {
    code: "verification_officer",
    name: "Verification officer",
    description: "Records verification of evidence on assigned applications.",
    isPrivileged: false,
    requiresMfa: true,
  },
  {
    code: "finance_officer",
    name: "Finance officer",
    description: "Prepares financial actions (maker).",
    isPrivileged: true,
    requiresMfa: true,
  },
  {
    code: "finance_approver",
    name: "Finance approver",
    description: "Approves financial actions (checker). Never the maker.",
    isPrivileged: true,
    requiresMfa: true,
  },
  {
    code: "reporting_officer",
    name: "Reporting officer",
    description: "Views and exports masked reports.",
    isPrivileged: false,
    requiresMfa: true,
  },
  {
    code: "safeguarding_officer",
    name: "Safeguarding officer",
    description: "Reads restricted safeguarding records. No members until the lead is named.",
    isPrivileged: true,
    requiresMfa: true,
  },
];

/** Column order of every row in MATRIX_ROWS. */
export const MATRIX_ROLE_ORDER: readonly RoleCode[] = ROLE_CODES;

export type GrantLevel = "Y" | "C" | "L" | "-";

interface MatrixRow {
  stage: number;
  description: string;
  /** One character per role in MATRIX_ROLE_ORDER. */
  grants: string;
}

export const MATRIX = {
  "public.read": { stage: 2, description: "Public content", grants: "YYYYYYY" },
  "account.manage_own": {
    stage: 2,
    description: "Own password, MFA and sessions",
    grants: "YYYYYYY",
  },
  "staff.directory.read": {
    stage: 2,
    description: "Names of staff, for assignment",
    grants: "YYYYYYY",
  },
  "user.manage": { stage: 2, description: "Invite, edit and deactivate users", grants: "Y------" },
  "role.assign": { stage: 2, description: "Grant or revoke roles", grants: "Y------" },
  "session.revoke_any": { stage: 2, description: "Revoke any user's sessions", grants: "Y------" },
  "settings.manage": {
    stage: 2,
    description: "Reference data and configuration",
    grants: "Y------",
  },
  "audit.read": { stage: 2, description: "Full audit log", grants: "Y-----C" },
  "audit.read_entity": {
    stage: 2,
    description: "History of a record the user can open",
    grants: "-CCCC-C",
  },
  "application.submit": {
    stage: 3,
    description: "Submit an application (applicant)",
    grants: "-------",
  },
  "application.read_own": {
    stage: 3,
    description: "Read own application (applicant)",
    grants: "-------",
  },
  "application.read": { stage: 3, description: "Application queue and detail", grants: "-YC--CC" },
  "application.assign": { stage: 3, description: "Assign an application", grants: "-Y-----" },
  "application.review": {
    stage: 3,
    description: "Completeness and eligibility review",
    grants: "-Y-----",
  },
  "application.request_info": {
    stage: 3,
    description: "Request more information",
    grants: "-Y-----",
  },
  "verification.record": { stage: 3, description: "Record verification", grants: "--Y----" },
  "assessment.record": { stage: 3, description: "Record assessment", grants: "-Y-----" },
  "application.recommend": { stage: 3, description: "Recommend a decision", grants: "-Y-----" },
  "case.approve": {
    stage: 3,
    description: "Approve a case (needs approval authority)",
    grants: "-C-----",
  },
  "case.read": { stage: 3, description: "Read a case", grants: "-YCCCCC" },
  "case.manage": { stage: 3, description: "Set up, update and close a case", grants: "-Y-----" },
  "beneficiary.read_identity": {
    stage: 3,
    description: "Read beneficiary real names and school",
    grants: "-YC---C",
  },
  "beneficiary.read_masked": {
    stage: 3,
    description: "Read beneficiary label and age band",
    grants: "-YYYYYY",
  },
  "document.read": { stage: 3, description: "Open evidence documents", grants: "-YC---C" },
  "document.upload": { stage: 3, description: "Upload evidence documents", grants: "-YY----" },
  "document.delete": {
    stage: 3,
    description: "Delete documents (denied to all)",
    grants: "-------",
  },
  "safeguarding.read": {
    stage: 3,
    description: "Read restricted safeguarding records",
    grants: "------Y",
  },
  "donation.read": { stage: 5, description: "Read donations", grants: "---LLL-" },
  "fund.classify": { stage: 6, description: "Classify funds", grants: "---L---" },
  "allocation.prepare": { stage: 6, description: "Prepare allocations", grants: "---L---" },
  "disbursement.request": { stage: 6, description: "Request disbursements", grants: "---L---" },
  "journal.prepare": { stage: 6, description: "Prepare journals", grants: "---L---" },
  "reconciliation.perform": { stage: 6, description: "Perform reconciliation", grants: "---L---" },
  "allocation.approve": {
    stage: 6,
    description: "Approve allocations (checker)",
    grants: "----L--",
  },
  "disbursement.approve": {
    stage: 6,
    description: "Approve disbursements (checker)",
    grants: "----L--",
  },
  "journal.post": { stage: 6, description: "Post journals (checker)", grants: "----L--" },
  "report.view": { stage: 7, description: "View reports", grants: "-C-LLL-" },
  "report.export": { stage: 7, description: "Export reports", grants: "---LLL-" },
} as const satisfies Record<string, MatrixRow>;

export type PermissionCode = keyof typeof MATRIX;
export const PERMISSION_CODES = Object.keys(MATRIX) as PermissionCode[];

export function isPermissionCode(value: string): value is PermissionCode {
  return Object.prototype.hasOwnProperty.call(MATRIX, value);
}
export function isRoleCode(value: string): value is RoleCode {
  return (ROLE_CODES as readonly string[]).includes(value);
}

export function grantLevel(role: RoleCode, permission: PermissionCode): GrantLevel {
  const idx = MATRIX_ROLE_ORDER.indexOf(role);
  const ch = MATRIX[permission].grants[idx];
  return ch === "Y" || ch === "C" || ch === "L" ? ch : "-";
}

/** Permissions a role holds in the database (Y, C and L; conditions are applied by policies). */
export function permissionsForRole(role: RoleCode): PermissionCode[] {
  return PERMISSION_CODES.filter((p) => grantLevel(role, p) !== "-");
}

/** Permissions that require MFA step-up within 10 minutes (access-control matrix section 4). */
export const STEP_UP_PERMISSIONS: readonly PermissionCode[] = [
  "role.assign",
  "user.manage",
  "session.revoke_any",
];
export const STEP_UP_WINDOW_MS = 10 * 60 * 1000;

/** Conflicting role pairs, blocked at assignment (matrix note 2). */
export const CONFLICTING_ROLE_PAIRS: ReadonlyArray<readonly [RoleCode, RoleCode]> = [
  ["finance_officer", "finance_approver"],
  ["super_admin", "finance_approver"],
];
