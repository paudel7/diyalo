# Stage 2 runbook: database, secrets and local sign-in

All values below are for local development with fictional data. Never reuse them anywhere shared.

## 1. Prerequisites

| Need       | Version / note                        |
| ---------- | ------------------------------------- |
| Node, pnpm | Node 22+, pnpm 10 (`corepack enable`) |
| PostgreSQL | 16 (local install or a container)     |

## 2. One-time database bootstrap

| Step | Command                                                                                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `psql "$ADMIN_URL" -v migrator_pw="'choose-one'" -v app_pw="'choose-another'" -f db/roles.sql` creates `diyalo_migrator` and `diyalo_app` |
| 2    | `createdb -O diyalo_migrator diyalo_dev` (and `diyalo_test` for tests; the name must contain "test")                                      |

`diyalo_migrator` owns the schema and runs migrations. `diyalo_app` is what the running site uses. It cannot update, delete or truncate `audit_logs`.

## 3. Environment

| Step | Command                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------- |
| 1    | `cp .env.example .env.local`                                                                         |
| 2    | Fill `DATABASE_URL`, `DATABASE_MIGRATION_URL`, `TEST_DATABASE_URL`, `TEST_APP_DATABASE_URL`          |
| 3    | `openssl rand -base64 32` into `MFA_ENCRYPTION_KEY`; `openssl rand -base64 48` into `AUDIT_HMAC_KEY` |

Losing `MFA_ENCRYPTION_KEY` locks every authenticator out (staff would need recovery codes or a reset). Losing or changing `AUDIT_HMAC_KEY` makes the audit chain unverifiable. Store both in the hosting secret manager when hosting is chosen (D-16).

## 4. Commands

| Task                                  | Command                                                           |
| ------------------------------------- | ----------------------------------------------------------------- |
| Apply migrations                      | `pnpm db:migrate`                                                 |
| Wipe and rebuild (dev/test only)      | `pnpm db:reset` (refuses unless `APP_ENV` is development or test) |
| Roles, permissions, programs only     | `pnpm db:seed -- --reference-only` (safe in every environment)    |
| Fictional staff users (dev/test only) | `pnpm db:seed` (set `SEED_PASSWORD` or read the printed one)      |
| Change the schema                     | edit `db/schema/*.ts`, `pnpm db:generate`, review the SQL, commit |
| Drift check                           | `pnpm db:check` and `pnpm db:generate` must report nothing to do  |
| Unit tests                            | `pnpm test`                                                       |
| Database tests                        | `pnpm test:integration` (wipes `TEST_DATABASE_URL`)               |
| Everything                            | `pnpm check`                                                      |

Run `pnpm db:seed -- --reference-only` after every deploy that changes `src/lib/permissions/matrix.ts`.

## 5. Signing in locally

| Step | What happens                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| 1    | `pnpm dev`, open `/sign-in`, use `super.admin@diyalo.example` (or another seeded address) and the seed password |
| 2    | MFA is optional in development and mandatory in staging and production (`APP_ENV`)                              |
| 3    | To try MFA locally, open `/mfa/setup`, type the key into any authenticator app, then sign out and back in       |
| 4    | Invitation and reset emails are written to `.dev-outbox/outbox.jsonl` (never sent)                              |

## 6. Operational rules

| Topic                | Rule                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| New migration tables | Add `GRANT` lines for `diyalo_app` in the migration; append-only tables get INSERT and SELECT only                     |
| First super admin    | Create by a one-time controlled script run by the owner in each hosted environment; never seeded with a known password |
| Lost authenticator   | Use a recovery code; otherwise a super administrator deactivates and re-invites (an audited action)                    |
| Audit integrity      | Settings, Audit log, "Verify chain" recomputes every hash. Run it regularly and before any audit export                |
| Sensitive logging    | Logs redact password, token, secret, code, email and phone keys. Do not log request bodies                             |
