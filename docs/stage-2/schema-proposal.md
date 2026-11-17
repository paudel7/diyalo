# Stage 2 Schema Proposal

Status: **PROPOSED, awaiting owner review. No Stage 2 code has been written.**
Source: roadmap sections 3, 5, 9, 9.1 and 10.1, and Stage 2 steps 33 to 38.

## 1. Scope

| In Stage 2                                                                                      | Deferred (and why)                                                                                               |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity and access: users, roles, permissions, user roles, sessions, MFA, one-time auth tokens | Consents, verification records, case assessments, support plans, approval requests and actions: Stage 3 workflow |
| Reference data: programs, reference counters                                                    | Campaigns, public profiles, campaign terms: Stage 4                                                              |
| Applicants, applications, application status history, beneficiaries, cases, case beneficiaries  | Donors, donations, payments, webhook events, refunds: Stage 5                                                    |
| Documents (metadata only, no file storage yet)                                                  | Funds, allocations, budgets, disbursements, ledger, bank, FX: Stage 6                                            |
| Audit logs                                                                                      | Notifications, impact updates, document versions: Stages 3 and 7                                                 |

No payment tables, no public beneficiary data, no real data. The roadmap's Stage 2 instruction forbids payment logic and public beneficiary data.

## 2. Conventions applied to every table

| Convention            | Rule                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary key           | `uuid`, default `gen_random_uuid()`. No sequential IDs in URLs or APIs.                                                                                                               |
| Human reference       | Separate unique column (`APP-2026-0001`, `CASE-2026-0001`) from the `reference_counters` table, incremented inside the creating transaction.                                          |
| Timestamps            | `timestamptz`, stored in UTC. `created_at` and `updated_at` on every mutable table.                                                                                                   |
| Actor columns         | `created_by` and `updated_by` reference `users.id` (nullable for system or anonymous actions).                                                                                        |
| Optimistic locking    | `version integer not null default 1`. Updates use `where version = $n` and increment it.                                                                                              |
| Status fields         | `text` with a `CHECK` constraint listing allowed values, generated from one TypeScript list. Chosen over Postgres enums because adding a value to a `CHECK` is an ordinary migration. |
| Money                 | `numeric(18,2)` plus `char(3)` currency code with a format check, never floating point. In TypeScript, money crosses the database boundary as a decimal string.                       |
| Deletion              | Soft delete (`deleted_at`) only on operational tables where the roadmap allows it. Audit rows and financial rows are never deleted.                                                   |
| Foreign keys          | Always declared, `ON DELETE RESTRICT` unless stated. Users are deactivated, never deleted, so audit attribution survives.                                                             |
| Indexes               | On every foreign key, every status column used in a queue, and every unique business key.                                                                                             |
| Case-insensitive text | `citext` for emails.                                                                                                                                                                  |

## 3. Identity and access

| Table                  | Key columns                                                                                                                                                                                                                                                                                         | Constraints and indexes                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `users`                | `email` (citext), `display_name`, `kind` (`staff`, `donor`, `guardian`, `partner`), `status` (`invited`, `active`, `locked`, `deactivated`), `password_hash` (Argon2id, nullable), `failed_login_count`, `locked_until`, `last_login_at`, `deactivated_at`, `deactivated_by`, `deactivation_reason` | Unique `email`. `deactivated_at` required when status is `deactivated`. Only `staff` users are created in Stage 2.     |
| `roles`                | `code`, `name`, `description`, `is_privileged`, `requires_mfa`                                                                                                                                                                                                                                      | Unique `code`. Codes are fixed in code and seeded by migration.                                                        |
| `permissions`          | `code` (for example `application.review`), `description`, `stage`                                                                                                                                                                                                                                   | Unique `code`.                                                                                                         |
| `role_permissions`     | `role_id`, `permission_id`                                                                                                                                                                                                                                                                          | Primary key on the pair. Seeded from one typed catalogue, and a test fails if the database differs from it.            |
| `user_roles`           | `user_id`, `role_id`, `granted_by`, `granted_at`, `revoked_at`, `revoked_by`                                                                                                                                                                                                                        | Partial unique index on active pairs (`revoked_at is null`). History is kept.                                          |
| `approval_authorities` | `user_id`, `authority` (`case.approve`), `max_amount`, `currency`, `granted_by`, `valid_from`, `valid_to`                                                                                                                                                                                           | Implements "separately authorized" approvers and D-06 limits without adding a role. Empty until the owner sets limits. |
| `sessions`             | `token_hash` (SHA-256 of a 256-bit random token), `user_id`, `created_at`, `last_seen_at`, `idle_expires_at`, `absolute_expires_at`, `mfa_verified_at`, `ip_prefix`, `user_agent_hash`, `revoked_at`, `revoked_reason`                                                                              | Unique `token_hash`. Raw tokens are never stored. Index on `user_id` and on expiry.                                    |
| `mfa_credentials`      | `user_id`, `type` (`totp`), `secret_encrypted` (AES-256-GCM), `confirmed_at`, `last_used_step`                                                                                                                                                                                                      | One confirmed TOTP credential per user. `last_used_step` blocks code replay.                                           |
| `mfa_recovery_codes`   | `user_id`, `code_hash`, `used_at`                                                                                                                                                                                                                                                                   | Hashed like passwords. Ten per user.                                                                                   |
| `auth_tokens`          | `user_id`, `purpose` (`invite`, `password_reset`), `token_hash`, `expires_at`, `used_at`                                                                                                                                                                                                            | Single use, 30-minute expiry for reset, 72 hours for invite.                                                           |

## 4. Programs, applicants, applications and cases

| Table                        | Key columns                                                                                                                                                                                                                                                                  | Constraints and indexes                                                                                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `programs`                   | `code` (`education`, `essential-living`), `name`, `active`                                                                                                                                                                                                                   | Reference data. Emergency assistance is not seeded (not launched).                                                                                                                                                                                                             |
| `reference_counters`         | `kind`, `year`, `last_value`                                                                                                                                                                                                                                                 | Primary key `(kind, year)`. Incremented with `update ... returning` inside the creating transaction so two requests cannot get the same number.                                                                                                                                |
| `applicants`                 | `full_name`, `relationship_type` (`parent`, `legal_guardian`, `authorized_representative`), `authority_note`, `phone`, `email`, `province`, `district`, `preferred_language` (`en`, `ne`), `household_size`, `anonymized_at`                                                 | Adult guardian only. No identity-document numbers are stored. Classified Restricted.                                                                                                                                                                                           |
| `applications`               | `reference`, `applicant_id`, `program_id`, `status`, `status_changed_at`, `requested_amount`, `requested_currency` (`NPR`), `frequency`, `support_start`, `support_end`, `hardship_summary`, `assigned_to`, `duplicate_of_id`, `submitted_at`, `version`                     | Unique `reference`. `status` checked against the section 5.2 list. Currency checked to `NPR` as the roadmap says applications are in NPR. Indexes on `status`, `assigned_to`, `applicant_id`.                                                                                  |
| `application_status_history` | `application_id`, `from_status`, `to_status`, `actor_id`, `reason`, `created_at`                                                                                                                                                                                             | Append only. Written in the same transaction as every status change.                                                                                                                                                                                                           |
| `beneficiaries`              | `application_id`, `applicant_id`, `public_label` (pseudonym or first name, nullable), `given_name`, `family_name`, `age_band`, `birth_date` (nullable, only where justified), `education_level`, `school_name`, `anonymized_at`                                              | The child's real name and school never leave the private record. `public_label` is the only candidate for public use, and only after Stage 4 consent review. Classified Restricted.                                                                                            |
| `cases`                      | `case_number`, `application_id`, `program_id`, `status`, `approved_by`, `approved_at`, `closed_at`, `closure_reason`, `version`                                                                                                                                              | Unique `case_number`. One case per application (unique `application_id`). A check requires `approved_by` and `approved_at` once the status is past approval, and `approved_by` must differ from the application's `assigned_to` (separation of duties, also enforced in code). |
| `case_beneficiaries`         | `case_id`, `beneficiary_id`                                                                                                                                                                                                                                                  | Primary key on the pair. Models "one application may lead to one or more beneficiary records".                                                                                                                                                                                 |
| `documents`                  | `application_id` or `case_id` (exactly one, by check), `storage_key`, `original_filename`, `content_type`, `size_bytes`, `sha256`, `scan_status` (`pending`, `clean`, `infected`, `skipped`), `classification`, `uploaded_by`, `retention_until`, `legal_hold`, `deleted_at` | Metadata only. Files and signed URLs arrive in Stage 3. A document cannot be opened unless `scan_status` is `clean`. Classified Restricted.                                                                                                                                    |

## 5. Audit log

| Column                         | Purpose                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `id`                           | `bigint` identity, so order is unambiguous                                                                         |
| `occurred_at`                  | `timestamptz`, set by the database                                                                                 |
| `actor_user_id`, `actor_type`  | `user`, `system` or `anonymous`. User may be null for failed logins.                                               |
| `actor_roles`                  | Roles held at the time, so later role changes do not rewrite history                                               |
| `action`                       | Dotted name such as `application.status_changed` or `auth.login_failed`                                            |
| `entity_type`, `entity_id`     | What was touched                                                                                                   |
| `outcome`                      | `success`, `denied` or `failure`                                                                                   |
| `correlation_id`               | One id per request, shared by every event the request causes                                                       |
| `ip_prefix`, `user_agent_hash` | Truncated IP and hashed agent. No full address.                                                                    |
| `metadata`                     | `jsonb`, checked against a per-action schema (see below)                                                           |
| `prev_hash`, `row_hash`        | HMAC chain: each row hashes its own content plus the previous row's hash, so a deleted or edited row is detectable |

Protections, all in the database so a bug in the application cannot bypass them:

| Protection          | Mechanism                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Append only         | A trigger rejects `UPDATE`, `DELETE` and `TRUNCATE`. The application's database role also lacks those privileges.                                                                                  |
| Safe metadata       | Each action has an allowlisted metadata shape in code (ids, status names, counts). Free text, names, emails, phone numbers, tokens and passwords are rejected by a test and by runtime validation. |
| Same transaction    | The audit write happens inside the transaction of the mutation it describes, so both commit or both roll back.                                                                                     |
| Reads are audited   | Opening a beneficiary identity, a document or an application detail writes an event. This meets the roadmap's "audit log for access to sensitive records".                                         |
| Denials are audited | A denied authorization attempt writes a `denied` event.                                                                                                                                            |

## 6. Relationships

```text
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< sessions, mfa_credentials, mfa_recovery_codes, auth_tokens, approval_authorities
applicants ──< applications >── programs
applications ──< application_status_history
applications ──< beneficiaries
applications ──1:1── cases ──< case_beneficiaries >── beneficiaries
applications / cases ──< documents
every mutation ──> audit_logs (same transaction)
```

## 7. Data classification

| Level        | Examples                                                                            | Handling                                                                        |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Public       | Program names                                                                       | May be shown anywhere                                                           |
| Internal     | Application references, statuses, counts                                            | Staff only                                                                      |
| Confidential | Staff names and emails                                                              | Role-limited, masked in exports                                                 |
| Restricted   | Applicant and child names, contacts, school, evidence documents, hardship narrative | Named permission, access audited, never in logs or email, never on public pages |

Not stored in Stage 2, deliberately: national identity numbers, bank or card details, medical details, photographs, payment data and real beneficiary data of any kind.

## 8. Retention and deletion

Columns exist for the retention schedule (`retention_until`, `legal_hold`, `anonymized_at`, `deleted_at`), but no deletion or anonymization job is built. The schedule itself is a Stage 0 policy item (D-08) that must exist before real data is loaded.

## 9. Considered and not proposed

| Option                                | Decision                                                                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres row-level security           | Not now. It adds complexity with pooled connections, and the roadmap asks for server-side authorization, which the service layer and the least-privilege database role provide. Revisit in Stage 8. |
| Postgres enums                        | Replaced by `CHECK` constraints for easier migrations.                                                                                                                                              |
| Storing role permissions only in code | Rejected, so a future Settings screen can manage roles. The code catalogue stays the source of truth and a test compares it with the database.                                                      |
