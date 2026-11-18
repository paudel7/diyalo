# Stage 2 exit report: foundation, database, authentication

Status: **Ready for owner review.** Stage 3 has not been started.

## 1. Exit gate (roadmap Stage 2)

| Gate                                            | Result | Evidence                                                                                                                                      |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh database migrates from zero               | Met    | `tests/integration/global-setup.ts` drops and migrates a throwaway database on every run; CI repeats it; `pnpm db:reset`                      |
| No drift between schema code and migrations     | Met    | `drizzle-kit check` and `generate` report nothing; also enforced in CI                                                                        |
| Unauthenticated users cannot reach admin        | Met    | `proxy.ts` redirect (convenience only), layout and action checks, `resolveSession` returns null for any bad token; live browser run confirmed |
| Each role tested for allowed and denied actions | Met    | `permissions-matrix.test.ts` (every role x permission pair, plus parsing the matrix document), `rbac.test.ts` (7 roles x 3 guarded services)  |
| Audit events written for sensitive mutations    | Met    | Same-transaction `recordAudit`; denials, reads of the log, role and user changes all audited; tests in `rbac`, `auth`, `audit`                |
| Secrets absent from repo and logs               | Met    | `.env.example` has blanks; gitleaks and `pnpm audit` in CI; pino redaction test; audit metadata allowlist test                                |

## 2. Test results (local)

| Suite                                                | Files | Tests     | Result                                                                   |
| ---------------------------------------------------- | ----- | --------- | ------------------------------------------------------------------------ |
| Unit (`pnpm test`)                                   | 7     | 41        | Pass                                                                     |
| Database (`pnpm test:integration`)                   | 4     | 64        | Pass                                                                     |
| Lint, typecheck, format                              |       |           | Clean                                                                    |
| Production build                                     |       |           | Pass                                                                     |
| Browser smoke (Playwright, real server and database) |       | 22 checks | Pass                                                                     |
| axe accessibility on new pages (desktop and 375 px)  |       |           | No violations after one fix (access-denied states lacked a page heading) |

## 3. What was built

| Area             | Detail                                                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database         | 20 tables, `text` + CHECK statuses, partial unique indexes, decimal money, FK RESTRICT, DB-level separation-of-duties trigger on cases                                                                        |
| Audit            | Append-only (triggers plus revoked privileges), HMAC hash chain continuity enforced in the database, full-chain verifier, metadata allowlist                                                                  |
| Roles            | Seven roles incl. Safeguarding officer (no members); matrix in one typed file; DB catalogue synced and tested equal                                                                                           |
| Authentication   | Invite-only staff, Argon2id, hashed session tokens, rotation, idle and absolute expiry, lockout, per-network rate limit, TOTP with replay block, recovery codes, reset and invite tokens (single use, hashed) |
| Authorization    | One `authorize()` gate, deny by default, audited denials, MFA step-up in 10 minutes, role-conflict and last-super-admin policies                                                                              |
| Screens          | Sign-in, MFA verify and setup, recovery codes, forgot and reset password, accept invite, account, Settings: Users and roles, Audit log                                                                        |
| Existing screens | Dashboard and module pages still show fictional mock data, now behind sign-in and per-module permission; navigation is permission filtered                                                                    |
| Tooling          | Drizzle migrations, scripts (`db:*`), vitest integration config, CI with Postgres 16, drift check, secrets scan, dependency audit                                                                             |

## 4. Known limits and decisions for you

| #   | Item                                                                                                                                                                  | Action   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | No `main` branch exists yet on GitHub. Merge Stage 0, 1 and 2 branches and turn on branch protection and required CI.                                                 | You      |
| 2   | No email provider (D-16): invitation and reset emails go to a dev outbox only. Production refuses to send until a provider is chosen.                                 | Decide   |
| 3   | MFA setup shows a manual key, not a QR code (no QR dependency added). Authenticator apps accept manual keys.                                                          | Optional |
| 4   | First super administrator in staging and production needs a controlled one-time creation step. Not automated, by design.                                              | Decide   |
| 5   | Login rate limit is derived from audit rows by network prefix; behind a proxy, `x-forwarded-for` must be set only by your trusted proxy.                              | Hosting  |
| 6   | Module layouts gate the mock pages. When real data arrives (Stage 3 onward) every page and service re-checks permission itself.                                       | Built in |
| 7   | Campaigns module is gated by `settings.manage` for now because no campaign permission exists until Stage 4.                                                           | Note     |
| 8   | The audit chain cannot detect removal of the newest rows by someone who can disable triggers; mitigated by privileges. Periodic external anchoring is a Stage 8 item. | Stage 8  |
| 9   | Decisions D-14, D-15, D-22, D-23, D-24 recorded as decided per your "go with your recommendations". Accountant and security reviewer sign-off still advised.          | Note     |

## 5. Next step

Stage 3 (application and case workflow) starts only on your approval. It will begin with a proposal for the guardian form, secure upload storage and the case state machine, as in Stage 2.
