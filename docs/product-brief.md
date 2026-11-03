# DIYALO Product Brief and MVP Boundary

Source of truth: _DIYALO Complete Website Requirements & Development Roadmap v1.0_ (3 November 2026). This brief summarizes it. If this brief and the roadmap differ, the roadmap wins and the difference must be logged in `docs/decisions/decision-register.md`.

Status: **DRAFT for owner approval.**

## 1. Product

| Item                     | Value                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product                  | DIYALO, a global giving platform supporting vulnerable children and families in Nepal                                                                                    |
| Brand promise            | Lighting the Path to a Brighter Future.                                                                                                                                  |
| Initial programs         | Education support; essential living support. Emergency assistance only as a controlled program, once formally launched.                                                  |
| Operating model          | Hybrid. Independent brand and platform; initially works through a vetted, legally eligible Nepal NGO partner. Own NGO or Canadian charity relationship considered later. |
| Administration           | Admin-led. DIYALO controls intake, screening, verification workflow, approvals, publication, allocation, disbursement approval and reporting.                            |
| Technology               | Next.js, React, TypeScript, PostgreSQL, modular monolith                                                                                                                 |
| Accounting base currency | USD, convertible to NPR (owner decision 2026-11-03; pending accountant confirmation)                                                                                     |

## 2. Principles that constrain every stage

| Principle           | Meaning in practice                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Trust before growth | No case is published until reviewed, approved and consented.                                                  |
| Traceability        | Payment, restriction, allocation, disbursement, expense and evidence stay linked.                             |
| Privacy by design   | Public pages expose only minimum consented, allowlisted fields.                                               |
| Human decisions     | Scoring assists prioritization; it never approves or rejects.                                                 |
| Financial integrity | Donation, payment, campaign, fund, allocation, disbursement, expense and journal entry are separate concepts. |
| Legal separation    | The DIYALO brand is not itself a legal fundraising authority or tax-receipting entity.                        |

## 3. MVP boundary (pilot)

| In MVP                                                                           | Deferred (not in MVP)                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Public site; approved case profiles                                              | Recurring donations (Release 1.1)                                 |
| Guardian application intake with secure uploads                                  | Birthday, anniversary and memorial fundraising pages (1.1)        |
| Admin case workflow: screen, verify, assess, approve, consent, publish           | Corporate and matching gifts, corporate self-service portal (1.2) |
| Campaigns: case-specific, general, program-restricted, basic program sponsorship | Partner portal (1.2)                                              |
| One-time donations through one eligible gateway                                  | Multi-provider payments (1.2)                                     |
| Donor records; fund classification; allocations; maker-checker disbursements     | AI scoring or triage                                              |
| Basic double-entry ledger; reconciliation support                                | Native apps                                                       |
| Audit trail; essential reports; role-based access                                | Open marketplace or self-publication; child-to-donor messaging    |

MVP is not a donation landing page. Restricted-fund integrity, verified payment processing, approval controls, audit logs, privacy and basic accounting are mandatory in the first pilot.

## 4. Stage order (do not skip or reorder)

| Stage | Name                                                 | Gate to pass before next stage                                   |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| 0     | Product decisions, legal readiness, repository setup | Decisions registered; repo runs locally; CI runs a basic check   |
| 1     | UX, information architecture, design system          | Journeys have approved wireframes; no private data in prototypes |
| 2     | App foundation, database, auth, authorization        | Migrations from zero; unauthenticated access denied; role tests  |
| 3     | Application and case workflow                        | Every transition tested; publication gates enforced server-side  |
| 4     | Public website and campaign publishing               | Only approved campaigns public; allowlisted fields only          |
| 5     | Donations, gateway, donor records                    | Forged redirect cannot confirm; duplicate webhook is idempotent  |
| 6     | Funds, allocations, budgets, disbursements, ledger   | Journals balance; maker cannot approve own request               |
| 7     | Dashboards, reports, notifications, impact           | Reports reconcile to ledger                                      |
| 8     | Security, QA, pilot, launch                          | No open critical or high defects; sign-offs documented           |
| 9     | Post-MVP                                             | Only after a stable pilot cycle                                  |

## 5. Rules for code and copy until decisions are confirmed

- No legal status, partner approval, tax-receipt eligibility, payment-provider eligibility, beneficiary fact, donor data or impact metric is stated as fact in code or public copy.
- Unconfirmed values are configuration placeholders marked `TBD`.
- Seed and fixture data is fictional only.
- Money is decimal with an ISO 4217 currency code; never floating point.

## 6. Approval

| Role            | Name         | Date | Status                       |
| --------------- | ------------ | ---- | ---------------------------- |
| Owner / founder | Kiran Paudel |      | Pending review of this brief |
