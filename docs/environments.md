# Environments and Delivery Plan

Plan only. Hosting, database, storage, email and monitoring providers are not chosen (decision register D-16). Nothing below is provisioned in Stage 0.

## 1. Environments

| Environment | Purpose                               | Data                                                         | Deploys from                          | Approval                               |
| ----------- | ------------------------------------- | ------------------------------------------------------------ | ------------------------------------- | -------------------------------------- |
| Local       | Development                           | Fictional seed data only                                     | Developer machine                     | None                                   |
| CI          | Automated checks                      | Synthetic                                                    | Every pull request and push to `main` | Automatic                              |
| Staging     | Review, UAT, provider sandbox testing | Fictional or synthetic only                                  | `main`                                | Automatic after CI passes              |
| Production  | Live pilot                            | Real, consented, verified data only, after Stage 8 sign-offs | Version tag                           | Manual approval by an authorized owner |

Rules: separate database, storage buckets and secrets per environment; no production data in staging; no real beneficiary data anywhere before the privacy impact assessment and retention schedule exist (see `decisions/safeguarding-privacy-checklist.md`).

## 2. Branching and release

| Item           | Convention                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Default branch | `main`, protected: pull request, passing CI, no force-push                 |
| Work branches  | `stage-N/<topic>` or `feat/<topic>`, short-lived                           |
| Commits        | Imperative subject line; reference the stage or decision ID where relevant |
| Checkpoints    | Tag each accepted stage, for example `stage-0-accepted`                    |
| Releases       | Production deploys from an annotated version tag only                      |

## 3. CI skeleton (Stage 0)

| Check      | Command             |
| ---------- | ------------------- |
| Formatting | `pnpm format:check` |
| Lint       | `pnpm lint`         |
| Types      | `pnpm typecheck`    |
| Tests      | `pnpm test`         |
| Build      | `pnpm build`        |

Added in later stages: database migration test from zero (Stage 2), end-to-end and accessibility tests (Stage 3 onward), dependency and secret scanning (Stage 2), provider sandbox suite (Stage 5), full security checks (Stage 8).

## 4. Secrets

| Rule                   | Detail                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| Source control         | Only `.env.example` is committed, with names and no values              |
| Local                  | `.env.local`, git-ignored                                               |
| Staging and production | Host secret manager; never in logs or error messages                    |
| Rotation               | Any secret that is ever committed is treated as compromised and rotated |

## 5. Open infrastructure decisions

| Topic                                                      | Register ID | Needed by |
| ---------------------------------------------------------- | ----------- | --------- |
| Hosting (managed app hosting / DigitalOcean or equivalent) | D-16        | Stage 2   |
| Managed PostgreSQL                                         | D-16        | Stage 2   |
| Private object storage for evidence                        | D-16        | Stage 3   |
| Transactional email, verified sender domain                | D-16        | Stage 3   |
| Error monitoring and uptime checks                         | D-16        | Stage 2   |
| Backup retention, RPO and RTO                              | D-21        | Stage 8   |
