# Journeys and Wireframes (Stage 1)

The built prototype pages are the wireframes: run `pnpm dev` and follow each journey. This file lists each journey, the screens in order, the decisions the design makes, and what is deliberately not built yet. All content is fictional.

## 1. Public journeys

| #   | Journey                        | Screens in order                                                          | Design decisions                                                                                                                                                                        | Not built yet                                                 |
| --- | ------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| P1  | Give to a case                 | Home, Children & Families, Case detail, Donate, (payment), confirmation   | Budget table shows what the money buys. Progress is text plus bar. Preset amounts link straight to Donate with the case selected. Funded cases show other ways to help.                 | Payment, confirmation, receipts (Stage 5)                     |
| P2  | Give to a program or generally | Home or Our Causes, Donate                                                | Designation is a radio group with plain explanations. Only USD is selectable because enabled currencies are undecided (D-13). The donation terms link sits beside the consent checkbox. | Terms text (needs S-02), payment                              |
| P3  | Sponsor a need                 | Sponsor a Need, Donate                                                    | Needs are rows with unit cost and units funded. Page states that sponsoring gives no access to a child.                                                                                 | Per-need allocation (Stage 6)                                 |
| P4  | Apply for support              | Apply for Support, Application form steps 1 to 6                          | One step per screen for phones. Three separate consent checkboxes. Review step explains submit is off. Children cannot apply.                                                           | Saving drafts, uploads, submission, status tracking (Stage 3) |
| P5  | Corporate enquiry              | Corporate & Institutional Giving                                          | Options list plus a short enquiry form.                                                                                                                                                 | Sending, routing (Stage 4 or later)                           |
| P6  | Understand trust               | About, Governance, Partners, Safeguarding, Complaints, Our Impact, footer | Policy pages say plainly they are placeholders and list what each must cover. Impact page shows an empty state, not invented numbers.                                                   | Approved policy text (decisions D-01 to D-08)                 |

## 2. Admin journeys

| #   | Journey               | Screens in order                                  | Design decisions                                                                                                                                                                       | Not built yet                                   |
| --- | --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| A1  | Review an application | Dashboard, Applications queue, Application review | Queue filters by status. Review page shows the workflow stepper, checks, assessment note and three actions, each in a confirm dialog. The assessment panel says a score never decides. | Real transitions, notes, audit log (Stage 3)    |
| A2  | Approve a payment     | Dashboard, Disbursements                          | Sample gift traced from donation to expense evidence. Table shows requester and approver separately. A banner states maker and checker must differ.                                    | Server-side maker-checker enforcement (Stage 6) |
| A3  | Find a module         | Any admin page                                    | Side navigation lists all 11 modules from section 8.1. Placeholder pages state the stage that builds each one.                                                                         | Module content                                  |

## 3. Screen patterns

| Pattern                | Used for                             | Rule                                                                                                   |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Page header            | Every inner page                     | Breadcrumbs, one `h1`, one-sentence lead.                                                              |
| Status badge           | Case, application and payment states | Text and symbol, never colour alone.                                                                   |
| Funding progress       | Cases and sponsorship                | Figures shown as text as well as a bar. Real version uses confirmed, eligible donations only (PUB-05). |
| Stepper                | Case workflow, application form      | Announces state to screen readers.                                                                     |
| Data table             | Queues, budgets, requests            | Named region, keyboard-scrollable, row headers.                                                        |
| Empty and error states | Impact, filters, 404                 | Say what is missing or wrong and what to do next. No apology.                                          |
| Confirm dialog         | Consequential admin actions          | Native dialog: focus trap, Escape to close, focus returns to the trigger.                              |

## 4. Privacy rules the screens follow

| Rule                                      | How the prototype shows it                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| Public cases show allowlisted fields only | `PublicCase` type and a test that fails if a field is added.                 |
| No real data                              | Every name says "sample", the banner is on every page, and a test checks it. |
| Consent is separate and optional          | Three separate checkboxes on application step 5.                             |
| Private documents                         | Upload step says documents are never shown publicly.                         |
