# Design System (Stage 1)

Live reference: the `/design-system` page. Tokens live in `src/app/globals.css`; components in `src/components/`.

## 1. Direction

_Diyalo_ is the clay oil lamp. The site is a dusk-blue night with one lit lamp in the hero, which is the single bold element. Everything else is quiet, high-contrast and readable on a phone. The marigold flame is used as a fill, never as text on a light background.

## 2. Colour tokens

| Token                  | Hex                   | Use                                               |
| ---------------------- | --------------------- | ------------------------------------------------- |
| `ink`                  | `#0F2A43`             | Text, dark surfaces, primary outline              |
| `ink-deep`             | `#091B2D`             | Footer                                            |
| `ink-soft`             | `#1D3D5C`             | Hover on dark                                     |
| `night-text`           | `#BCCBD9`             | Secondary text on dark                            |
| `flame`                | `#F5A623`             | Primary button, progress fill, focus ring on dark |
| `flame-hover`          | `#FFB938`             | Primary button hover                              |
| `flame-tint`           | `#FFF1D6`             | Warnings, highlighted bands                       |
| `flame-deep`           | `#8A5200`             | Warning text                                      |
| `snow`                 | `#F6F8FA`             | Page background                                   |
| `paper`                | `#FFFFFF`             | Cards, header, inputs                             |
| `mist`                 | `#DFE6EC`             | Borders, progress track                           |
| `slate`                | `#44566A`             | Secondary text                                    |
| `moss` / `moss-tint`   | `#2B6A58` / `#E3F2EC` | Success, verified                                 |
| `rhodo` / `rhodo-tint` | `#A82B4A` / `#FBE9EE` | Errors, destructive actions                       |
| `sky-tint`             | `#E1ECF6`             | Information                                       |

## 3. Typography

| Role        | Face                        | Size and weight                                                                 |
| ----------- | --------------------------- | ------------------------------------------------------------------------------- |
| Headings    | Literata (variable)         | `h1` 36 to 68 px, `h2` 28 to 40 px, `h3` 20 to 24 px, weight 600, tight leading |
| Body        | Mukta                       | 18 px, line height 1.6                                                          |
| Secondary   | Mukta                       | 16 px, slate                                                                    |
| Nepali text | Mukta (includes Devanagari) | Same scale. Localization is built later (PUB-12), the font path is ready.       |

Body line length is capped at 68 characters on long-form pages. Fonts are bundled with the app, so no request goes to a third-party font service.

## 4. Spacing and layout

| Item            | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Page width      | max 72 rem, gutters 16 px on phones, 24 px from 640 px, 32 px from 1024 px |
| Section spacing | 56 px on phones, 80 px from 640 px                                         |
| Touch targets   | Buttons and fields at least 48 px tall, small buttons 40 px                |
| Breakpoints     | Tailwind defaults, plus `xs` at 480 px                                     |

## 5. Components

| Component                                                            | File                   | Key accessibility behaviour                                                                     |
| -------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| Button, ButtonLink                                                   | `ui/button.tsx`        | Visible focus ring, disabled state keeps text readable                                          |
| StatusBadge                                                          | `ui/badge.tsx`         | Text plus symbol                                                                                |
| FundingProgress, UnitProgress                                        | `ui/progress.tsx`      | `role="progressbar"` with value text                                                            |
| TextField, TextAreaField, SelectField, CheckboxField, RadioGroup     | `ui/field.tsx`         | Visible label, "required" or "optional" in words, hint and error linked with `aria-describedby` |
| Alert                                                                | `ui/alert.tsx`         | `role="alert"` for errors, `status` otherwise                                                   |
| ConfirmDialog                                                        | `ui/dialog.tsx`        | Native `<dialog>`: focus trap, Escape, focus return                                             |
| DataTable                                                            | `ui/data-table.tsx`    | Named, keyboard-scrollable region with row headers                                              |
| EmptyState, ErrorState                                               | `ui/states.tsx`        | Heading level is configurable                                                                   |
| Stepper                                                              | `ui/stepper.tsx`       | `aria-current="step"`, state in text                                                            |
| Lamp, Wordmark                                                       | `brand/lamp.tsx`       | Decorative unless a title is given                                                              |
| SiteHeader, SiteFooter, AdminShell, PageHeader, Breadcrumbs, Section | `layout/`              | Landmarks, skip link, `aria-current` on the active link                                         |
| CaseCard                                                             | `public/case-card.tsx` | Public-allowlist fields only                                                                    |

## 6. Motion

One decorative motion: the lamp flame flickers. It stops when the visitor's system asks for reduced motion. Nothing else animates by itself.

## 7. Content rules

| Rule                                         | Example                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| Plain words, sentence case                   | "Return for information", not "Request additional data"                   |
| One name for each action                     | The button "Recommend approval" is what the dialog and the status call it |
| Errors say what went wrong and how to fix it | "Enter an email address, for example name@example.com."                   |
| No unconfirmed legal or payment claim        | Enforced by `tests/unit/no-unverified-claims.test.ts`                     |
