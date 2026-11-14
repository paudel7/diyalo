# Accessibility and Responsive Baseline (Stage 1)

Target: WCAG 2.2 level AA. Stage 8 repeats these checks with assistive technology and a full audit.

## 1. Baseline rules built into the components

| Area            | Rule                                                                                                      | Where                           |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Keyboard        | Every control is reachable and operable by keyboard. Skip link is the first tab stop.                     | `globals.css`, layouts          |
| Focus           | 3 px visible ring, ink on light surfaces, flame on dark surfaces.                                         | `globals.css`                   |
| Landmarks       | `header`, `nav`, `main`, `footer`, and named regions. Prototype notice is a named `aside`.                | Layouts                         |
| Headings        | One `h1` per page and no skipped levels.                                                                  | Pages, `CaseCard`, `ErrorState` |
| Colour          | Text meets 4.5:1. Meaning is never carried by colour alone.                                               | Tokens, badges, alerts          |
| Forms           | Visible labels, "required" or "optional" in words, errors in text with a symbol, errors linked to fields. | `ui/field.tsx`                  |
| Targets         | Interactive controls at least 40 px, most 48 px.                                                          | `ui/button.tsx`, fields         |
| Motion          | The flame animation is off for `prefers-reduced-motion`.                                                  | `globals.css`                   |
| Zoom and reflow | No horizontal scroll at 375 px. Wide tables scroll inside a focusable region.                             | `ui/data-table.tsx`             |
| Language        | `lang="en"` set. Nepali content needs `lang="ne"` on that content when added.                             | Root layout                     |

## 2. Automated audit run at the end of Stage 1

| Check                                                              | Result                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| axe-core rules: WCAG 2.0, 2.1 and 2.2 A and AA, plus best practice | 0 violations                                                                                                       |
| Pages covered                                                      | 39 routes, including every public page, 6 application form steps, filtered lists, the 404 page and all admin pages |
| Widths                                                             | 1280 px and 375 px                                                                                                 |
| Horizontal overflow                                                | None                                                                                                               |

Automated tools find only part of the problems. Manual checks still to do in Stage 8: screen reader pass (NVDA or VoiceOver), keyboard-only walkthrough of each journey, 200 percent zoom, Nepali text rendering, and real-device testing on low-end Android phones.

## 3. Re-running the audit

The audit script is not part of the repo yet because it needs a browser. Adding it to CI is a backlog item for Stage 2.

## 4. Known gaps

| Gap                                                         | Plan                                                |
| ----------------------------------------------------------- | --------------------------------------------------- |
| No Nepali translation of any page                           | Localization architecture in a later stage (PUB-12) |
| Dialog and mobile menu not tested with a screen reader      | Stage 8                                             |
| Colour contrast checked by tool, not for every future state | Re-check when new states are added                  |
