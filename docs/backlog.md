# Milestone Backlog

One milestone per roadmap stage. Create these as GitHub milestones and issues once the owner approves. Each stage ends at its exit gate; the next stage starts only on owner approval. Acceptance test IDs (AT-xx) come from roadmap section 12.

| Milestone                              | Scope summary                                                                                                   | Exit gate                                                                                | Acceptance tests                  | Depends on decisions   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------- | ---------------------- |
| Stage 0: Decisions and repo setup      | Brief, decision register, checklists, repo shell, CI                                                            | Assumptions not stated as fact; repo runs locally; CI runs a check                       | n/a                               | D-11 recorded          |
| Stage 1: UX and design system          | Sitemap, wireframes, tokens, components, accessibility baseline, mock data only                                 | MVP journeys have approved wireframes; no private data in prototypes                     | n/a                               | None                   |
| Stage 2: Foundation, DB, auth          | Strict TS, ORM and migrations, users, roles, permissions, audit logs, MFA path, seed data                       | Migrate from zero; unauthenticated denied; per-role tests; audit events written          | n/a (supports AT-16)              | D-14, D-15, D-16, D-11 |
| Stage 3: Application and case workflow | Guardian form, secure uploads, admin queue, verification, assessment, approval, consent, privacy review         | Every transition tested; publication gates enforced in backend; private docs not public  | AT-02, AT-03, AT-04, AT-05        | D-07, D-08, D-16       |
| Stage 4: Public site and campaigns     | Public pages, case listing and detail, campaign publishing, DTO allowlists, SEO                                 | Only approved campaigns public; allowlisted fields only; progress reproducible           | AT-01, AT-17 (partial)            | D-01, S-02, D-08       |
| Stage 5: Donations and gateway         | One eligible gateway, hosted checkout, signed idempotent webhooks, donor records, refunds                       | Forged redirect cannot confirm; duplicate webhook safe; sandbox suite passes             | AT-06, AT-07, AT-08, AT-14        | D-01, D-03, D-04, D-13 |
| Stage 6: Funds and ledger              | Funds, restrictions, budgets, allocations, maker-checker disbursements, double-entry ledger, reconciliation, FX | Journals balance; restrictions enforced; maker cannot approve own; sample case traceable | AT-09, AT-10, AT-11, AT-12, AT-13 | D-05, D-06, D-11, D-12 |
| Stage 7: Reports and impact            | Dashboards, finance and case reports, exports, notification emails, impact updates                              | Reports reconcile to ledger; export authorization tested                                 | AT-15, AT-17                      | None new               |
| Stage 8: Security, QA, pilot           | Full test suite, security and privacy review, UAT, backup restore, runbook, launch checklist                    | No critical or high defects; sign-offs documented; restore succeeds                      | AT-18 and full catalogue          | D-01 to D-10, D-21     |
| Stage 9: Post-MVP                      | Recurring gifts, celebration pages, corporate giving, partner portal, more gateways                             | Per-enhancement mini-SRS, privacy review, tests                                          | AT-16 (partner)                   | Pilot evidence         |

## Stage 0 task list

| #   | Task                                                        | Status                                    |
| --- | ----------------------------------------------------------- | ----------------------------------------- |
| 1   | Product brief and MVP boundary (`docs/product-brief.md`)    | Done, pending owner approval              |
| 2   | Decision register (`docs/decisions/decision-register.md`)   | Done; owner to assign owners and statuses |
| 3   | Safeguarding and privacy checklist                          | Done; safeguarding lead to be named       |
| 4   | Payment-provider feasibility checklist                      | Done; no provider selected                |
| 5   | Roles and restrictions summary                              | Done                                      |
| 6   | Repository shell, README, `.env.example`, environments plan | Done                                      |
| 7   | CI skeleton                                                 | Done; runs on GitHub once pushed          |
| 8   | Branch protection on `main`, GitHub milestones and issues   | Manual, owner to do (needs repo admin)    |
