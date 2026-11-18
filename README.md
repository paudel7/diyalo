# DIYALO

_Lighting the Path to a Brighter Future._

A transparent, case-based giving platform connecting donors worldwide with verified children and families in Nepal.

**Current stage: Stage 2 (foundation, database, authentication), awaiting owner review.** The public site and admin screens still show fictional content. Staff sign-in, roles, MFA and the audit log are real and backed by PostgreSQL; there are no payments. See `docs/stage-2/exit-report.md` and `docs/runbooks/stage-2-local-setup.md`. Do not deploy publicly until Stage 8. The source of truth is _DIYALO Complete Website Requirements & Development Roadmap v1.0_ (3 November 2026). The roadmap is not committed to this repo; keep the canonical copy in your project files.

> Nothing in this repository states a legal entity, partner approval, tax-receipt eligibility or payment-provider eligibility as fact. See `docs/decisions/decision-register.md`.

## Quick start

| Step         | Command                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Requirements | Node 22 (`.nvmrc`), pnpm 10 (`corepack enable`)                                                                    |
| Install      | `pnpm install`                                                                                                     |
| Configure    | `cp .env.example .env.local`, then follow `docs/runbooks/stage-2-local-setup.md` (database and two generated keys) |
| Run          | `pnpm dev` then open http://localhost:3000                                                                         |
| All checks   | `pnpm check`                                                                                                       |

## Scripts

| Script                         | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `pnpm dev` / `build` / `start` | Next.js development, production build, production server |
| `pnpm lint`                    | ESLint (Next.js core-web-vitals + TypeScript)            |
| `pnpm typecheck`               | `tsc --noEmit` with strict settings                      |
| `pnpm test`                    | Vitest unit tests                                        |
| `pnpm format` / `format:check` | Prettier                                                 |
| `pnpm check`                   | format check, lint, type-check, test, build (same as CI) |

## Repository layout

| Path                                    | Contents                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/app/`                              | Next.js App Router pages                                                             |
| `src/lib/config/`                       | Organization and currency configuration (placeholders until decisions are confirmed) |
| `tests/unit/`                           | Unit tests, including the Stage 0 "no unverified claims" guard                       |
| `docs/`                                 | Product brief, decision register, checklists, environments plan, backlog             |
| `db/`                                   | Drizzle schema, SQL migrations, reference-data sync, role bootstrap (Stage 2)        |
| `src/server/`                           | Services, policies, repositories, audit, sessions (never imported by UI code)        |
| `scripts/`                              | `db:migrate`, `db:reset`, `db:seed`                                                  |
| `docs/decisions/`                       | Decision register and Stage 0 checklists                                             |
| `docs/runbooks/`, `docs/test-evidence/` | Reserved for later stages                                                            |
| `.github/workflows/ci.yml`              | CI: format, lint, type-check, test, build                                            |

The domain folders in roadmap section 14 (`src/modules/*`, `src/server/*`, and so on) are created in the stage that first needs them, not before.

## Working agreement

| Rule                | Detail                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| One stage at a time | A stage ends at its exit gate; the next starts only on owner approval.                               |
| Branching           | Trunk-based. `main` is protected. Short-lived branches, pull requests required, CI must pass.        |
| Secrets             | Never committed. Use `.env.local` locally and the host's secret manager in staging and production.   |
| Data                | Fictional seed data only. No real child, guardian or donor data in the repo, fixtures or logs.       |
| Money               | Decimal values with an ISO 4217 currency code. Never floating point.                                 |
| Authorization       | Enforced server-side on every protected operation.                                                   |
| Payments            | Never mark a payment successful from a browser redirect; signed, idempotent webhooks only (Stage 5). |

See `docs/environments.md` and `docs/backlog.md`.
