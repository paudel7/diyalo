# Stage 2 Access-Control Matrix

Status: **PROPOSED, awaiting owner review.** Source: roadmap section 3. Permissions are enforced on the server for every protected operation. Hiding a button is never the control.

Legend: **Y** allowed, **-** denied, **C** conditional (see the note number), **L** later stage (permission is defined now and enforced when the feature exists).

## 1. Roles

| Role                                                      | Staff | Privileged | MFA required (proposed)                                                               |
| --------------------------------------------------------- | ----- | ---------- | ------------------------------------------------------------------------------------- |
| Super administrator                                       | Yes   | Yes        | Yes                                                                                   |
| Case manager                                              | Yes   | No         | Yes (child data)                                                                      |
| Verification officer                                      | Yes   | No         | Yes (child data)                                                                      |
| Finance officer (maker)                                   | Yes   | Yes        | Yes (money)                                                                           |
| Finance approver (checker)                                | Yes   | Yes        | Yes (money)                                                                           |
| Reporting officer                                         | Yes   | No         | Yes                                                                                   |
| Safeguarding officer                                      | Yes   | Yes        | Yes. **New, see question 5.** No members until the owner names the lead.              |
| Public visitor, Donor, Applicant / guardian, Partner user | No    | No         | Donor and applicant access arrive in Stages 3 and 5. Partner user is a later release. |

## 2. Permission matrix

Columns: SA super administrator, CM case manager, VO verification officer, FO finance officer, FA finance approver, RO reporting officer, SG safeguarding officer, ANON public or applicant before sign-in.

| Permission                                                                                                 | SA  | CM  | VO  | FO  | FA  | RO  | SG  | ANON | Notes                                                            |
| ---------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | ---- | ---------------------------------------------------------------- |
| `public.read` public content                                                                               | Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y    |                                                                  |
| `account.manage_own` password, MFA, own sessions                                                           | Y   | Y   | Y   | Y   | Y   | Y   | Y   | -    |                                                                  |
| `staff.directory.read` names of staff                                                                      | Y   | Y   | Y   | Y   | Y   | Y   | Y   | -    | Names only, for assignment                                       |
| `user.manage` invite, edit, deactivate                                                                     | Y   | -   | -   | -   | -   | -   | -   | -    | 1                                                                |
| `role.assign` grant or revoke roles                                                                        | Y   | -   | -   | -   | -   | -   | -   | -    | 1, 2                                                             |
| `session.revoke_any`                                                                                       | Y   | -   | -   | -   | -   | -   | -   | -    |                                                                  |
| `settings.manage` reference data, configuration                                                            | Y   | -   | -   | -   | -   | -   | -   | -    |                                                                  |
| `audit.read` full audit log                                                                                | Y   | -   | -   | -   | -   | -   | C   | -    | 3                                                                |
| `audit.read_entity` history on a record the user can open                                                  | -   | C   | C   | C   | C   | -   | C   | -    | 3                                                                |
| `application.submit`                                                                                       | -   | -   | -   | -   | -   | -   | -   | L    | Stage 3, adult guardian only                                     |
| `application.read_own`                                                                                     | -   | -   | -   | -   | -   | -   | -   | L    | Stage 3, secure access link                                      |
| `application.read` queue and detail                                                                        | -   | Y   | C   | -   | -   | C   | C   | -    | 4, 5                                                             |
| `application.assign`                                                                                       | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `application.review` completeness and eligibility                                                          | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `application.request_info`                                                                                 | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `verification.record`                                                                                      | -   | -   | Y   | -   | -   | -   | -   | -    | Separate from review on purpose                                  |
| `assessment.record`                                                                                        | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `application.recommend`                                                                                    | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `case.approve`                                                                                             | -   | C   | -   | -   | -   | -   | -   | -    | 6                                                                |
| `case.read`                                                                                                | -   | Y   | C   | C   | C   | C   | C   | -    | 4, 7                                                             |
| `case.manage` setup, update, close                                                                         | -   | Y   | -   | -   | -   | -   | -   | -    |                                                                  |
| `beneficiary.read_identity` real names, school                                                             | -   | Y   | C   | -   | -   | -   | C   | -    | 4, 5                                                             |
| `beneficiary.read_masked` label and age band                                                               | -   | Y   | Y   | Y   | Y   | Y   | Y   | -    |                                                                  |
| `document.read` evidence                                                                                   | -   | Y   | C   | -   | -   | -   | C   | -    | 4, 5, 8                                                          |
| `document.upload`                                                                                          | -   | Y   | Y   | -   | -   | -   | -   | L    | Applicant upload in Stage 3                                      |
| `document.delete`                                                                                          | -   | -   | -   | -   | -   | -   | -   | -    | Denied for all. Removal follows the retention process (Stage 8). |
| `safeguarding.read` restricted safeguarding records                                                        | -   | -   | -   | -   | -   | -   | Y   | -    | 9                                                                |
| `donation.read`                                                                                            | -   | -   | -   | L   | L   | L   | -   | -    | Stage 5, masked for RO                                           |
| `fund.classify`, `allocation.prepare`, `disbursement.request`, `journal.prepare`, `reconciliation.perform` | -   | -   | -   | L   | -   | -   | -   | -    | Stage 6, maker actions                                           |
| `allocation.approve`, `disbursement.approve`, `journal.post`                                               | -   | -   | -   | -   | L   | -   | -   | -    | Stage 6, checker actions, never the maker                        |
| `report.view`                                                                                              | -   | C   | -   | L   | L   | L   | -   | -    | Stage 7                                                          |
| `report.export`                                                                                            | -   | -   | -   | L   | L   | L   | -   | -    | Stage 7, sensitive fields masked by role                         |

## 3. Notes

| #   | Rule                                                                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A super administrator cannot grant roles to themselves, cannot deactivate the last active super administrator, and cannot hold Finance approver. Role changes need a fresh MFA step within the last 10 minutes. |
| 2   | Conflicting role pairs are blocked at assignment time: Finance officer with Finance approver, and Super administrator with Finance approver.                                                                    |
| 3   | `audit.read` is full. The record-level history is limited to records the user could already open. The safeguarding officer sees safeguarding-related events only.                                               |
| 4   | Every open of an application detail, beneficiary identity or document writes an audit event.                                                                                                                    |
| 5   | Conditional on assignment: a Verification officer opens only applications assigned to verification. Safeguarding officer and Reporting officer access is limited as shown.                                      |
| 6   | Not a standing role permission. A Case manager can approve only with a current row in `approval_authorities` (limit and validity period, D-06), and never a case they recommended or are assigned to.           |
| 7   | Finance roles and Reporting officer see case number, program, status and budget totals, never identity or documents.                                                                                            |
| 8   | Documents open only after a clean scan result, through a short-lived link, and every open is audited.                                                                                                           |
| 9   | The safeguarding role exists so restricted records are not visible to every staff member. Until the owner names a lead, nobody holds it.                                                                        |

## 4. Rules that apply to every role

| Rule                   | Detail                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deny by default        | A permission not listed for a role is denied. Unknown permission codes throw.                                                                                                         |
| Separation of duties   | The person who prepares an action (maker, recommender, assignee) cannot approve it. Implemented as one pure policy function with tests, reused by every approval from Stage 3 onward. |
| Least privilege        | No role gets read access to restricted data just because it manages users or settings.                                                                                                |
| Immediate deactivation | A deactivated user's sessions stop working on the next request. History keeps their name.                                                                                             |
| MFA step-up            | Role changes, approvals and exports require MFA verified within the last 10 minutes.                                                                                                  |
| Denials are logged     | Every denied attempt writes an audit event with the permission asked for.                                                                                                             |
| Layers                 | Authorization runs in services and policy functions. The proxy layer only redirects signed-out visitors for convenience, and no protected data depends on it.                         |

## 5. How the matrix is kept honest

The matrix lives in one typed file in the code (`src/lib/permissions/matrix.ts`). Three checks use it: a table-driven test that every role and permission pair is allowed or denied exactly as listed here, a test that the database tables equal the catalogue, and a check that fails CI if this document drifts from the code.
