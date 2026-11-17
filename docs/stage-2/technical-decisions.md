# Stage 2 Technical Proposal

Status: **PROPOSED, awaiting owner review.** Covers decisions D-14 (authentication) and D-15 (ORM), the migration workflow, environment variables, audit service, test plan and build sequence.

## 1. D-14: Authentication provider

The roadmap asks for Appwrite Auth or a managed OIDC provider "after capability and security review". This is that review. Stage 2 only needs staff sign-in. Donor and applicant access come in Stages 3 and 5 and can be decided again then.

| Criterion                                     | A. First-party (Postgres sessions, Argon2id, TOTP) behind an `AuthProvider` interface | B. Appwrite Auth                             | C. Managed OIDC provider                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Needs an external account and keys now        | No                                                                                    | Yes                                          | Yes                                                  |
| Can run in CI and on a laptop with no network | Yes                                                                                   | No (needs the service or a self-hosted copy) | No (needs a test tenant or a mock)                   |
| MFA for privileged roles                      | Built with TOTP and recovery codes                                                    | Provided                                     | Provided, often with stronger options (passkeys)     |
| Who carries the security maintenance          | DIYALO                                                                                | Appwrite                                     | The provider                                         |
| Cost and data location                        | None. Data stays in the DIYALO database.                                              | Per plan. Check hosting region.              | Per plan. Check hosting region and child-data terms. |
| Lock-in                                       | None                                                                                  | Medium                                       | Medium                                               |
| Fit with server-side roles and audit          | Direct: sessions and roles are in the same database as the audit log                  | Roles and audit must be mirrored             | Roles and audit must be mirrored                     |
| Risk if built badly                           | Highest                                                                               | Low                                          | Lowest                                               |

**Recommendation: A for Stage 2**, using vetted primitives (`@node-rs/argon2`, a maintained TOTP library, Web Crypto) and nothing hand-rolled. Reasons: it needs no account or credential that I cannot create for you, it can be tested end to end in CI, and the staff user count is small. The `AuthProvider` interface keeps sign-in separate from sessions and authorization, so staff sign-in can move to a managed OIDC provider (single sign-on, passkeys) later without touching the roles, permissions or audit code. If you prefer B or C now, tell me which provider and I will build against it. That needs you to create the account and keep the keys.

### Session and password policy (proposed defaults)

| Item             | Policy                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts         | Staff are invited by a super administrator. No public sign-up.                                                                                                                               |
| Password         | At least 12 characters, no composition rules, checked against a bundled common-password list, hashed with Argon2id (19 MiB, 2 passes, 1 lane, the OWASP minimum)                             |
| Session token    | 256-bit random value in a `__Host-` cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`. Only its SHA-256 hash is stored.                                                                 |
| Rotation         | New token at sign-in, after MFA, and after any role or password change                                                                                                                       |
| Expiry           | Idle 30 minutes for privileged roles, 60 minutes for others, absolute 12 hours                                                                                                               |
| MFA              | TOTP with 10 single-use recovery codes. Secret encrypted at rest. Replay of a used code is blocked. Enforced for every staff role in staging and production.                                 |
| Lockout          | After 5 failed attempts in 15 minutes the account locks for 15 minutes, with a delay that grows per attempt. A per-IP limit applies as well. Responses never reveal whether an email exists. |
| Reset and invite | Single-use token, 30 minutes for reset and 72 hours for invite, hashed in the database                                                                                                       |
| CSRF             | `SameSite` cookie, origin check on every state-changing request, and framework protection for server actions                                                                                 |
| Email            | No email provider is chosen (D-16), so invite and reset messages go through a `Mailer` interface with a development outbox. Real delivery is wired when D-16 is decided.                     |

## 2. D-15: ORM

| Criterion                                                                 | Drizzle                                           | Prisma                                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Works in this workspace                                                   | Yes, pure npm packages                            | **No.** The Prisma binary host is unreachable here (tested), so I could not generate or test the client. |
| Migrations                                                                | Plain SQL files, reviewable in pull requests      | Plain SQL files, generated by Prisma Migrate                                                             |
| Money as exact decimals                                                   | `numeric` returned as a string, no floating point | `Decimal` via a decimal library                                                                          |
| Triggers, partial indexes, `CHECK`, immutability rules (needed for audit) | Written as hand-edited SQL in the migration       | Same, through custom migration SQL                                                                       |
| Transaction control for financial work                                    | Explicit and simple                               | Supported                                                                                                |
| Maturity and tooling                                                      | Younger, fewer guard rails                        | More mature, better schema tooling                                                                       |

**Recommendation: Drizzle** with `node-postgres`. The deciding factor is that I can build, run and verify everything here and in CI. The cost is that I hand-write the trigger and constraint SQL, which I would do with Prisma anyway.

## 3. Migration and environment workflow

| Item                      | Proposal                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                    | `db/schema/` (table definitions), `db/migrations/` (committed SQL), `db/seed/` (development only)                                                                |
| Create a migration        | `pnpm db:generate` writes SQL, then it is reviewed and hand-edited where needed (triggers, checks)                                                               |
| Apply migrations          | `pnpm db:migrate`, run by a migration-only database role                                                                                                         |
| From zero                 | `pnpm db:reset` (development and test only) drops and re-migrates                                                                                                |
| Drift check               | CI fails if the schema code and the committed migrations disagree                                                                                                |
| Direction                 | Roll forward only. Destructive changes need an explicit review note.                                                                                             |
| Database roles            | `diyalo_migrator` owns the schema. `diyalo_app` has only the data privileges it needs and no `UPDATE`, `DELETE` or `TRUNCATE` on `audit_logs`.                   |
| Local database            | A local PostgreSQL 16 (it is available in this workspace) or any Postgres 16 you run yourself                                                                    |
| CI database               | A PostgreSQL 16 service container in GitHub Actions                                                                                                              |
| Environment guard         | The seed and reset commands refuse to run unless `APP_ENV` is `development` or `test`                                                                            |
| First super administrator | Development: created by the seed. Staging and production: a one-off command that reads the password from standard input, so nothing is stored in the repository. |

## 4. Environment variables (new in Stage 2)

| Variable                 | Purpose                                                 | Notes                                                                     |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`           | Application connection (`diyalo_app`)                   | Never committed                                                           |
| `DATABASE_MIGRATION_URL` | Migration connection (`diyalo_migrator`)                | Used only by migration commands                                           |
| `TEST_DATABASE_URL`      | Throwaway database for tests                            | Tests refuse to run against a URL that does not look like a test database |
| `MFA_ENCRYPTION_KEY`     | 32-byte key for encrypting TOTP secrets                 | Base64. Rotation procedure documented in the runbook.                     |
| `AUDIT_HMAC_KEY`         | Key for the audit hash chain                            | Separate from other keys                                                  |
| `APP_BASE_URL`           | Origin check and link building                          |                                                                           |
| `APP_ENV`                | Existing. Gates seed, reset and strict cookie settings. |                                                                           |

`.env.example` lists names only. A secrets scan runs in CI, and a test asserts that logs redact passwords, tokens and keys.

## 5. Audit service

| Item              | Design                                                                                                                                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API               | `audit.record(tx, event)` inside the caller's transaction. Services receive a `RequestContext` with the actor, roles and correlation id, so no code path can write a mutation without one.                                                                                                                        |
| Correlation       | One id per request, created at the edge and carried through `AsyncLocalStorage`                                                                                                                                                                                                                                   |
| Events in Stage 2 | Sign-in success and failure, lockout, MFA enrolment and use, sign-out, session revoke, password change and reset, user invite, deactivation, role grant and revoke, approval authority changes, application and case mutations, status changes, document metadata changes, sensitive reads, authorization denials |
| Metadata          | Allowlisted per action and validated with `zod`. PII and secrets are rejected.                                                                                                                                                                                                                                    |
| Tamper evidence   | Database trigger blocks edits and deletes. HMAC chain makes gaps detectable. A verification command checks the chain.                                                                                                                                                                                             |

## 6. Application structure

Follows roadmap section 14.

| Path                                               | Contents                                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `db/`                                              | Schema, migrations, seed                                                                                                            |
| `src/lib/permissions/`                             | Permission catalogue and role matrix (one source of truth)                                                                          |
| `src/lib/auth/`                                    | Password, session, MFA, `AuthProvider` interface and first-party implementation                                                     |
| `src/lib/audit/`                                   | Audit event service and metadata schemas                                                                                            |
| `src/lib/errors/`, `src/lib/validation/`           | Typed errors and `zod` schemas                                                                                                      |
| `src/server/policies/`                             | Resource rules: assignment, separation of duties                                                                                    |
| `src/server/services/`, `src/server/repositories/` | Business logic and data access. Pages and actions call services only, and a lint rule blocks importing repositories from `src/app`. |
| `src/modules/identity/`                            | Users, roles, sessions services                                                                                                     |
| `src/app/(auth)/`                                  | Sign-in, MFA, reset pages                                                                                                           |
| `src/app/admin/`                                   | Gated by a session check in the layout **and** in every action and route. The proxy layer only redirects.                           |
| `tests/integration/`                               | Database-backed tests                                                                                                               |

## 7. Admin screens in Stage 2 (minimal)

| Screen                                                             | Why                                                                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Sign-in, MFA enrolment and verification, sign-out, change password | Required to meet the exit gate                                                                             |
| Settings: Users and roles (invite, deactivate, assign roles)       | Otherwise roles could only be set from the command line                                                    |
| Settings: Audit log (search and view)                              | Proves the audit foundation works                                                                          |
| Existing dashboard and application pages                           | Stay on fictional mock data until Stage 3, now behind sign-in. Their navigation is filtered by permission. |

## 8. Test plan (maps to the exit gate)

| Exit gate                                               | Tests                                                                                                                                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fresh database migrates from zero                       | CI creates an empty Postgres 16, runs all migrations, runs the drift check, then the full suite                                                                                                  |
| Unauthenticated users cannot reach admin routes or APIs | Every admin route and every API route is requested without a session. Each must redirect to sign-in or return 401. The route list is generated from navigation so new pages cannot be forgotten. |
| Each role is tested for allowed and denied actions      | Table-driven test over every role and permission in the matrix, plus service-level tests that a denied call changes nothing and writes a `denied` audit event                                    |
| Audit events are written for sensitive mutations        | Mutation and audit commit or roll back together. Updating or deleting an audit row fails at the database. PII in metadata is rejected. Sensitive reads are logged.                               |
| Secrets absent from repository and logs                 | Secrets scan in CI, `.env` ignore check, and a logging test that passwords, tokens and keys are redacted                                                                                         |
| Separation of duties                                    | The maker cannot approve their own item. Conflicting roles cannot be assigned. A super administrator cannot grant themselves roles or remove the last super administrator.                       |
| Session and password rules                              | Expiry, rotation, revocation, immediate effect of deactivation, lockout, MFA replay, reset token reuse                                                                                           |

CI additions: PostgreSQL service container, a secrets scan, and a dependency audit.

## 9. Build sequence once approved

| Step | Output                                                                           | Roadmap step |
| ---- | -------------------------------------------------------------------------------- | ------------ |
| 1    | Add dependencies, database tooling, CI changes                                   | 33, 34       |
| 2    | Schema, migrations, database roles, audit triggers                               | 34, 35       |
| 3    | Permission catalogue, matrix and policies, with tests                            | 35, 36       |
| 4    | Auth: passwords, sessions, MFA, lockout, reset and invite                        | 36           |
| 5    | Audit service and event coverage                                                 | 37           |
| 6    | Gate `/admin`, sign-in screens, users and audit screens                          | 36           |
| 7    | Fictional seed data matching the Stage 1 prototype                               | 38           |
| 8    | Full verification, report of migration commands, environment variables and tests | Gate         |

## 10. Risks

| Risk                                                   | Mitigation                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| First-party auth carries security responsibility       | Vetted primitives only, OWASP-based policy, provider interface, independent review in Stage 8    |
| No email provider yet                                  | Development outbox now, real delivery after D-16                                                 |
| Next.js proxy layer must not be the only gate          | Authorization is enforced in services, layouts, actions and routes, and tested without the proxy |
| Hand-written constraint SQL can drift from schema code | Drift check in CI and integration tests that exercise each constraint                            |
| Applicant and donor identity not designed yet          | Deferred to Stages 3 and 5 on purpose. `users.kind` leaves room.                                 |
