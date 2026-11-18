import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  APPLICATION_STATUSES,
  CASE_STATUSES,
  DOCUMENT_CLASSIFICATIONS,
  RELATIONSHIP_TYPES,
  SCAN_STATUSES,
  createdAt,
  inList,
  pk,
  ts,
  updatedAt,
  version,
} from "./common";
import { users } from "./identity";

const actor = (name: string) => uuid(name).references(() => users.id, { onDelete: "restrict" });

export const programs = pgTable("programs", {
  id: pk(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const referenceCounters = pgTable(
  "reference_counters",
  {
    kind: text("kind").notNull(),
    year: integer("year").notNull(),
    lastValue: integer("last_value").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.kind, t.year] })],
);

export const applicants = pgTable(
  "applicants",
  {
    id: pk(),
    fullName: text("full_name").notNull(),
    relationshipType: text("relationship_type").notNull(),
    authorityNote: text("authority_note"),
    phone: text("phone"),
    email: text("email"),
    province: text("province"),
    district: text("district"),
    preferredLanguage: text("preferred_language").notNull().default("ne"),
    householdSize: integer("household_size"),
    anonymizedAt: ts("anonymized_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: actor("created_by"),
    updatedBy: actor("updated_by"),
    version: version(),
  },
  () => [
    check("applicants_relationship_check", inList("relationship_type", RELATIONSHIP_TYPES)),
    check("applicants_language_check", inList("preferred_language", ["en", "ne"])),
    check("applicants_household_check", sql`("household_size" is null) or ("household_size" > 0)`),
  ],
);

export const applications = pgTable(
  "applications",
  {
    id: pk(),
    reference: text("reference").notNull().unique(),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => applicants.id, { onDelete: "restrict" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("submitted"),
    statusChangedAt: ts("status_changed_at").notNull().defaultNow(),
    requestedAmount: numeric("requested_amount", { precision: 18, scale: 2 }),
    requestedCurrency: text("requested_currency").notNull().default("NPR"),
    frequency: text("frequency"),
    supportStart: date("support_start"),
    supportEnd: date("support_end"),
    hardshipSummary: text("hardship_summary"),
    assignedTo: actor("assigned_to"),
    duplicateOfId: uuid("duplicate_of_id"),
    submittedAt: ts("submitted_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: actor("created_by"),
    updatedBy: actor("updated_by"),
    deletedAt: ts("deleted_at"),
    version: version(),
  },
  (t) => [
    check("applications_status_check", inList("status", APPLICATION_STATUSES)),
    check("applications_currency_check", inList("requested_currency", ["NPR"])),
    check(
      "applications_amount_check",
      sql`("requested_amount" is null) or ("requested_amount" >= 0)`,
    ),
    check(
      "applications_support_window_check",
      sql`("support_end" is null) or ("support_start" is null) or ("support_end" >= "support_start")`,
    ),
    index("applications_status_idx").on(t.status),
    index("applications_assigned_idx").on(t.assignedTo),
    index("applications_applicant_idx").on(t.applicantId),
    index("applications_program_idx").on(t.programId),
  ],
);

export const applicationStatusHistory = pgTable(
  "application_status_history",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "restrict" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actorId: actor("actor_id"),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [
    check("app_status_history_to_check", inList("to_status", APPLICATION_STATUSES)),
    index("app_status_history_app_idx").on(t.applicationId),
  ],
);

export const beneficiaries = pgTable(
  "beneficiaries",
  {
    id: pk(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "restrict" }),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => applicants.id, { onDelete: "restrict" }),
    publicLabel: text("public_label"),
    givenName: text("given_name").notNull(),
    familyName: text("family_name"),
    ageBand: text("age_band").notNull(),
    birthDate: date("birth_date"),
    educationLevel: text("education_level"),
    schoolName: text("school_name"),
    anonymizedAt: ts("anonymized_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: actor("created_by"),
    updatedBy: actor("updated_by"),
    version: version(),
  },
  (t) => [
    check("beneficiaries_age_band_check", inList("age_band", ["0-4", "5-9", "10-14", "15-17"])),
    index("beneficiaries_application_idx").on(t.applicationId),
    index("beneficiaries_applicant_idx").on(t.applicantId),
  ],
);

export const cases = pgTable(
  "cases",
  {
    id: pk(),
    caseNumber: text("case_number").notNull().unique(),
    applicationId: uuid("application_id")
      .notNull()
      .unique()
      .references(() => applications.id, { onDelete: "restrict" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending_setup"),
    approvedBy: actor("approved_by"),
    approvedAt: ts("approved_at"),
    closedAt: ts("closed_at"),
    closureReason: text("closure_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdBy: actor("created_by"),
    updatedBy: actor("updated_by"),
    version: version(),
  },
  (t) => [
    check("cases_status_check", inList("status", CASE_STATUSES)),
    check(
      "cases_approval_check",
      sql`("status" = 'pending_setup') or ("approved_by" is not null and "approved_at" is not null)`,
    ),
    check(
      "cases_closed_check",
      sql`("status" <> 'closed') or ("closed_at" is not null and "closure_reason" is not null)`,
    ),
    index("cases_status_idx").on(t.status),
    index("cases_program_idx").on(t.programId),
  ],
);

export const caseBeneficiaries = pgTable(
  "case_beneficiaries",
  {
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "restrict" }),
    beneficiaryId: uuid("beneficiary_id")
      .notNull()
      .references(() => beneficiaries.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.caseId, t.beneficiaryId] }),
    index("case_beneficiaries_beneficiary_idx").on(t.beneficiaryId),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: pk(),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "restrict",
    }),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "restrict" }),
    storageKey: text("storage_key").notNull().unique(),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    sha256: text("sha256").notNull(),
    scanStatus: text("scan_status").notNull().default("pending"),
    classification: text("classification").notNull().default("restricted"),
    uploadedBy: actor("uploaded_by"),
    retentionUntil: date("retention_until"),
    legalHold: boolean("legal_hold").notNull().default(false),
    deletedAt: ts("deleted_at"),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      "documents_parent_check",
      sql`("application_id" is not null)::int + ("case_id" is not null)::int = 1`,
    ),
    check("documents_scan_check", inList("scan_status", SCAN_STATUSES)),
    check("documents_class_check", inList("classification", DOCUMENT_CLASSIFICATIONS)),
    check("documents_size_check", sql`"size_bytes" >= 0`),
    check("documents_sha_check", sql`"sha256" ~ '^[0-9a-f]{64}$'`),
    index("documents_application_idx").on(t.applicationId),
    index("documents_case_idx").on(t.caseId),
    uniqueIndex("documents_storage_key_idx").on(t.storageKey),
  ],
);
