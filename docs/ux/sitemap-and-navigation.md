# Sitemap and Navigation (Stage 1)

Source: roadmap sections 4.1, 4.2 and 8.1. Every route below exists in the prototype. Labels match the roadmap exactly so the vocabulary stays the same in the interface, the docs and the code.

## 1. Public navigation

| Area             | Label                            | Route                    | Notes                                                                              |
| ---------------- | -------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| Main bar         | Our Causes                       | `/causes`                | Two programs. Emergency assistance is not offered until formally launched.         |
| Main bar         | Children & Families              | `/children-and-families` | Filterable list (program, status). Detail at `/children-and-families/[slug]`.      |
| Main bar         | Sponsor a Need                   | `/sponsor-a-need`        | Defined program needs. No donor access to a child.                                 |
| Main bar         | Our Impact                       | `/impact`                | Shows planned measures and definitions. No figures until reconciled records exist. |
| Main bar         | About DIYALO                     | `/about`                 | Governance and partners below it.                                                  |
| Main bar         | Donate now (button)              | `/donate`                | Accepts `?case=`, `?program=`, `?need=`, `?amount=`.                               |
| Utility bar      | Apply for Support                | `/apply`                 | Form at `/apply/form?step=1..6`.                                                   |
| Utility bar      | Corporate & Institutional Giving | `/corporate-giving`      | Enquiry form. Self-service portal and matching are Release 1.2.                    |
| Utility bar      | Contact                          | `/contact`               |                                                                                    |
| About            | Governance                       | `/about/governance`      | Placeholder until approved.                                                        |
| About            | Partners                         | `/about/partners`        | Placeholder until approved.                                                        |
| Footer, policies | Child safeguarding               | `/safeguarding`          | Placeholder until approved.                                                        |
| Footer, policies | Privacy                          | `/privacy`               | Placeholder until approved.                                                        |
| Footer, policies | Terms of use                     | `/terms`                 | Placeholder until approved.                                                        |
| Footer, policies | Donation terms                   | `/donation-terms`        | Placeholder until approved. Needs decision S-02.                                   |
| Footer, policies | Complaints                       | `/complaints`            | Placeholder until approved.                                                        |
| Review only      | Design system                    | `/design-system`         | Reference page. Not linked from the site. Remove or protect before launch.         |

On phones the main bar, utility bar and footer links collapse into one Menu list. The Donate now button stays visible in the header at every width.

## 2. Admin navigation

| Module             | Route                       | Built in       | Stage 1 state                                                 |
| ------------------ | --------------------------- | -------------- | ------------------------------------------------------------- |
| Dashboard          | `/admin`                    | Stage 7 (full) | Working layout with fictional counts                          |
| Applications       | `/admin/applications`       | Stage 3        | Working queue with status filter                              |
| Application review | `/admin/applications/[ref]` | Stage 3        | Working layout: summary, checks, workflow, actions in dialogs |
| Cases              | `/admin/cases`              | Stage 3        | Module placeholder                                            |
| Campaigns          | `/admin/campaigns`          | Stage 4        | Module placeholder                                            |
| Donations          | `/admin/donations`          | Stage 5        | Module placeholder                                            |
| Funds              | `/admin/funds`              | Stage 6        | Module placeholder                                            |
| Disbursements      | `/admin/disbursements`      | Stage 6        | Working layout: sample gift chain and maker-checker table     |
| Accounting         | `/admin/accounting`         | Stage 6        | Module placeholder                                            |
| Reports            | `/admin/reports`            | Stage 7        | Module placeholder                                            |
| Documents          | `/admin/documents`          | Stage 3        | Module placeholder                                            |
| Settings           | `/admin/settings`           | Stage 2        | Module placeholder                                            |

## 3. Warnings

| Warning                  | Detail                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin has no sign-in     | `/admin` is open in the prototype because it shows only fictional data. Authentication and role checks arrive in Stage 2. Never deploy this build to a public address. |
| Prototype is not indexed | The root layout sets `noindex, nofollow`.                                                                                                                              |
| Contact details          | Email and postal address are "To be confirmed". They depend on the legal entity (D-01).                                                                                |
