# Role Model and Donation Restriction Summary

Summary of roadmap sections 3 and 7.2 so the Stage 0 gate ("role model and donation restrictions documented") is met. Authorization is enforced **server-side**, never only by hiding UI. Detailed access-control matrix is proposed in Stage 2 before any code.

## 1. Roles

| Role                              | Core permissions                                                                                        | Restrictions                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Public visitor                    | View public content and approved cases/campaigns; start donation; submit application                    | No private records                                                                      |
| Donor                             | Optional account; own history and permitted updates                                                     | No other donors; no private beneficiary data                                            |
| Applicant / guardian              | Submit application, save draft, upload evidence, view status via secure access                          | No internal assessments; no other family's data                                         |
| Case manager                      | Review applications, request information, record assessment, recommend approval, manage updates         | Cannot approve own high-risk or material financial actions unless separately authorized |
| Verification officer              | Record verification steps, contacts, evidence, outcome                                                  | No payment release by default                                                           |
| Finance officer (maker)           | Review donations, classify funds, prepare allocations, disbursement requests, journals, reconciliations | Cannot approve own disbursement                                                         |
| Finance approver (checker)        | Approve or reject allocations, payments, journals, adjustments within limits                            | Cannot alter source evidence or bypass maker-checker                                    |
| Super administrator               | Users, roles, settings, reference data, configuration                                                   | Privileged actions need MFA and audit logging; not for routine finance approval         |
| Reporting officer                 | Read approved dashboards; export permitted reports                                                      | Read-only; sensitive fields masked by role                                              |
| Partner user (later, Release 1.2) | Assigned cases and tasks only; submit evidence                                                          | No unrelated cases; no donor private details; no unrestricted finance controls          |

Cross-cutting: least privilege; every privileged action audited; users can be deactivated without losing audit attribution.

## 2. Fund types and restrictions

| Fund type                                        | Rule                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Unrestricted                                     | Available for approved charitable priorities within the receiving entity's authority |
| Program-restricted (Education, Essential Living) | May fund only eligible costs within that restriction                                 |
| Case-designated                                  | Linked to one approved case, subject to published donation terms                     |
| Emergency-restricted                             | Separate fund where donor terms require                                              |
| Corporate-restricted                             | Separate fund where donor terms require (Release 1.2)                                |

Restricted funds are never silently reclassified or reallocated. Any change needs legal or donor-term authority, a documented reason, approval and an audit trail.

## 3. Balance vocabulary (must stay distinct in code and reports)

raised, confirmed, settled, committed, allocated, disbursed, spent, refunded, available.

## 4. Separate concepts (never merge)

donation, payment transaction, campaign, fund, allocation, disbursement, expense, journal entry.
