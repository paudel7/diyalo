# Child Safeguarding and Privacy Policy Checklist

This is a checklist of policies that must exist and be approved. It does not contain legal policy text. Policy content must come from the safeguarding/privacy lead and qualified advisers (roadmap 1.2, 5.4, 16).

## A. Policies to be approved before real data or launch

| #   | Policy / artifact                                                              | Needed by                              | Owner                    | Status                 |
| --- | ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------ | ---------------------- |
| 1   | Child safeguarding policy                                                      | Stage 3 (real data); Stage 8           | Safeguarding lead        | Not started            |
| 2   | Privacy policy and privacy notice for applicants                               | Stage 3; Stage 8                       | Privacy lead             | Not started            |
| 3   | Guardian consent: support processing                                           | Stage 3                                | Safeguarding lead        | Not started            |
| 4   | Guardian consent: public case text                                             | Stage 3                                | Safeguarding lead        | Not started            |
| 5   | Guardian consent: image use                                                    | Stage 3                                | Safeguarding lead        | Not started            |
| 6   | Photography and media consent                                                  | Stage 3                                | Safeguarding lead        | Not started            |
| 7   | Consent revocation process (subject to lawful retention)                       | Stage 3                                | Privacy lead             | Not started            |
| 8   | Complaints and incident escalation process                                     | Stage 3; Stage 8                       | Safeguarding lead        | Not started            |
| 9   | Anti-fraud policy                                                              | Stage 5                                | Finance lead             | Not started            |
| 10  | Conflict-of-interest policy                                                    | Stage 3                                | Board                    | Not started            |
| 11  | Data retention schedule and legal holds                                        | Before real data                       | Privacy lead             | Not started            |
| 12  | Privacy impact assessment                                                      | Before real beneficiary data is loaded | Privacy lead             | Not started            |
| 13  | Breach response procedure                                                      | Stage 8                                | Tech lead + privacy lead | Not started            |
| 14  | Donation terms (purpose, restriction, fees, refunds, surplus and underfunding) | Stage 4                                | Founder + advisers       | Not started (see S-02) |

## B. Engineering rules derived from the roadmap (apply from Stage 1)

| Rule                                                                                                                                                           | Source          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Never publish a child's full legal name, exact address, personal contact, identifiable school details, identity documents, medical details or private evidence | 5.4             |
| Use pseudonym, first name only or anonymized label as consent and risk assessment permit                                                                       | 5.4             |
| No direct donor-to-child contact, private messaging, unsupervised visits or donor access to private case files                                                 | 5.4             |
| Guardian consent for publication, image use and updates stored separately; each revocable                                                                      | 5.4             |
| Children cannot create public accounts or submit applications; applicant is an adult guardian or authorized representative                                     | 5.1             |
| Restricted access for safeguarding records                                                                                                                     | 5.4             |
| Public content derived from a private case record through explicit allowlisted DTOs                                                                            | PUB-03, Stage 4 |
| No sensitive child information in email; no sensitive personal data or payment secrets in logs                                                                 | 10              |
| Private documents are never in a public bucket; short-lived signed URLs only                                                                                   | 10              |
| Fictional seed data only; no real child information in fixtures                                                                                                | 15.1            |
| Delete or anonymize when retention obligations expire                                                                                                          | 5.4             |

## C. Stage 0 exit check

| Check                                                                                                             | Status                     |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Policy list above reviewed by owner                                                                               | Pending                    |
| Safeguarding/privacy lead named                                                                                   | Pending (owner to name)    |
| Confirmed: no real beneficiary data enters any repository, fixture or environment before items 11 and 12 are done | Pending owner confirmation |
