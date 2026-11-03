# Payment Provider Feasibility Checklist

Purpose: shortlist and verify gateways before Stage 5. **No provider is selected. No code is written against an assumed provider.** Eligibility depends on the receiving entity, merchant country, settlement bank, currencies and the provider's own terms. Every answer below must come from the provider or the receiving entity's advisers, not from assumption.

## A. Prerequisites (all must be known before scoring providers)

| #   | Prerequisite                                                                | Source                    | Status |
| --- | --------------------------------------------------------------------------- | ------------------------- | ------ |
| 1   | Legal receiving entity (D-01)                                               | Founder + advisers        | Open   |
| 2   | Merchant country of that entity                                             | Entity documents          | Open   |
| 3   | Settlement bank account and its country and currency                        | Entity bank               | Open   |
| 4   | Whether the entity may accept foreign donations and online donations (D-02) | Nepal / Canadian advisers | Open   |
| 5   | Target donor countries                                                      | Founder                   | Open   |
| 6   | Currencies to charge (D-13)                                                 | Founder + provider        | Open   |

## B. Provider criteria (one column per candidate once shortlisted)

| Criterion                                                                                 | Why it matters                  | Candidate 1 | Candidate 2 | Candidate 3 |
| ----------------------------------------------------------------------------------------- | ------------------------------- | ----------- | ----------- | ----------- |
| Accepts the entity type as a merchant (charity / NGO / nonprofit) in the merchant country | Eligibility                     |             |             |             |
| Supported settlement countries and currencies                                             | PUB-09                          |             |             |             |
| Charges in CAD, USD, EUR and NPR, or which subset                                         | PUB-09                          |             |             |             |
| Fees: per-transaction, FX, payout, dispute                                                | Fee disclosure (PUB-05, PUB-08) |             |             |             |
| Nonprofit pricing or documentation required                                               | Cost and onboarding time        |             |             |             |
| Hosted checkout available (no card data stored by DIYALO)                                 | Stage 5 gate                    |             |             |             |
| Signed webhooks; documented signature scheme                                              | Mandatory control 7.4           |             |             |             |
| Idempotency keys and event replay handling                                                | Mandatory control 7.4           |             |             |             |
| Server-side API to verify transaction status                                              | Never trust redirect (7.4)      |             |             |             |
| Sandbox environment and test cards                                                        | Stage 5 test suite              |             |             |             |
| Refund and partial refund support, via API                                                | AT-14                           |             |             |             |
| Dispute / chargeback handling and timelines                                               | Stage 5 states                  |             |             |             |
| Settlement reports usable for reconciliation (gross, fee, net, reference)                 | Stage 6 reconciliation          |             |             |             |
| Recurring payments support (for Release 1.1)                                              | Future planning only            |             |             |             |
| Prohibited or restricted activity rules relevant to charities or cross-border giving      | Account risk                    |             |             |             |
| Onboarding and verification time                                                          | Schedule                        |             |             |             |
| Data location and privacy terms                                                           | Privacy                         |             |             |             |

## C. Decision output

| Item                                          | Value |
| --------------------------------------------- | ----- |
| Provider selected                             | None  |
| Decided by / date                             |       |
| Evidence (written confirmation from provider) |       |
| Adviser sign-off on eligibility               |       |

Stage 5 does not start until section C is filled.
