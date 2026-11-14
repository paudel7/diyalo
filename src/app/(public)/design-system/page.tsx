import type { Metadata } from "next";
import { Lamp, Wordmark } from "@/components/brand/lamp";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  CheckboxField,
  RadioGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/field";
import { FundingProgress, UnitProgress } from "@/components/ui/progress";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Stepper } from "@/components/ui/stepper";

export const metadata: Metadata = { title: "Design system" };

const colors = [
  {
    name: "Ink",
    token: "--color-ink",
    hex: "#0F2A43",
    use: "Text, dark surfaces, primary outlines",
  },
  { name: "Ink deep", token: "--color-ink-deep", hex: "#091B2D", use: "Footer" },
  { name: "Ink soft", token: "--color-ink-soft", hex: "#1D3D5C", use: "Hover on dark" },
  {
    name: "Flame",
    token: "--color-flame",
    hex: "#F5A623",
    use: "Primary button fill, progress, focus on dark. Never as text on light.",
  },
  {
    name: "Flame tint",
    token: "--color-flame-tint",
    hex: "#FFF1D6",
    use: "Warnings, highlight bands",
  },
  { name: "Flame deep", token: "--color-flame-deep", hex: "#8A5200", use: "Warning text" },
  { name: "Snow", token: "--color-snow", hex: "#F6F8FA", use: "Page background" },
  { name: "Mist", token: "--color-mist", hex: "#DFE6EC", use: "Borders, tracks" },
  { name: "Slate", token: "--color-slate", hex: "#44566A", use: "Secondary text" },
  { name: "Moss", token: "--color-moss", hex: "#2B6A58", use: "Success, verified" },
  {
    name: "Rhododendron",
    token: "--color-rhodo",
    hex: "#A82B4A",
    use: "Errors, destructive actions",
  },
];

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        title="Design system"
        lead="Tokens and components used across DIYALO. This page is a working reference for Stage 1 review."
        crumbs={[{ label: "Home", href: "/" }, { label: "Design system" }]}
      />
      <Container className="space-y-16 py-12">
        <section aria-labelledby="brand-title">
          <h2 id="brand-title" className="text-2xl">
            Brand
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-10">
            <Wordmark />
            <div className="surface-dark rounded-xl bg-ink p-6">
              <Wordmark dark />
            </div>
            <Lamp glow animated className="h-40 w-40" title="The DIYALO lamp" />
          </div>
        </section>

        <section aria-labelledby="color-title">
          <h2 id="color-title" className="text-2xl">
            Colour
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((c) => (
              <li key={c.token} className="flex gap-4 rounded-lg border border-mist bg-paper p-3">
                <span
                  aria-hidden="true"
                  className="h-16 w-16 shrink-0 rounded-md border border-mist"
                  style={{ background: c.hex }}
                />
                <span className="text-base">
                  <span className="block font-semibold">
                    {c.name} <span className="font-normal text-slate">{c.hex}</span>
                  </span>
                  <span className="block text-sm text-slate">{c.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type-title">
          <h2 id="type-title" className="text-2xl">
            Type
          </h2>
          <div className="mt-5 space-y-4">
            <p className="font-display text-5xl font-semibold">Headline in Literata</p>
            <p className="font-display text-3xl font-semibold">Section heading</p>
            <p className="font-display text-xl font-semibold">Card heading</p>
            <p className="max-w-prose text-lg">
              Body text is Mukta at 18 pixels with a 1.6 line height. It also carries Devanagari, so
              Nepali text such as दियालो uses the same family.
            </p>
            <p className="text-base text-slate">Secondary text at 16 pixels in slate.</p>
          </div>
        </section>

        <section aria-labelledby="btn-title">
          <h2 id="btn-title" className="text-2xl">
            Buttons and status
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <span className="surface-dark inline-flex rounded-lg bg-ink p-3">
              <Button variant="outline-light">Outline on dark</Button>
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <StatusBadge>Draft</StatusBadge>
            <StatusBadge tone="info">In review</StatusBadge>
            <StatusBadge tone="success">Verified</StatusBadge>
            <StatusBadge tone="warning">Awaiting approval</StatusBadge>
            <StatusBadge tone="danger">Declined</StatusBadge>
          </div>
        </section>

        <section aria-labelledby="form-title">
          <h2 id="form-title" className="text-2xl">
            Form fields
          </h2>
          <form className="mt-5 grid max-w-3xl gap-5 sm:grid-cols-2">
            <TextField label="Text field" name="a" hint="Hint text sits under the label." />
            <TextField
              label="With an error"
              name="b"
              required
              error="Enter an email address, for example name@example.com."
              defaultValue="name"
            />
            <SelectField label="Select" name="c" defaultValue="">
              <option value="">Choose one</option>
              <option>Option one</option>
            </SelectField>
            <TextAreaField label="Text area" name="d" rows={3} />
            <CheckboxField name="e" label="Checkbox" hint="Hint under the label." />
            <RadioGroup
              legend="Radio group"
              name="f"
              defaultValue="x"
              options={[
                { value: "x", label: "First choice", description: "With a description." },
                { value: "y", label: "Second choice" },
              ]}
            />
          </form>
        </section>

        <section aria-labelledby="fb-title" className="space-y-5">
          <h2 id="fb-title" className="text-2xl">
            Messages and states
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Alert title="Information">A neutral message.</Alert>
            <Alert tone="success" title="Saved">
              The change was saved.
            </Alert>
            <Alert tone="warning" title="Check this">
              Something needs a look before you continue.
            </Alert>
            <Alert tone="danger" title="Could not save">
              Your session ended. Sign in again and retry.
            </Alert>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState title="Nothing here yet">
              Say what is missing and what to do next.
            </EmptyState>
            <ErrorState title="Payment not confirmed">
              The provider has not confirmed this payment. Check the reference and try again.
            </ErrorState>
          </div>
        </section>

        <section aria-labelledby="data-title" className="space-y-6">
          <h2 id="data-title" className="text-2xl">
            Progress, steps, table, dialog
          </h2>
          <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
            <FundingProgress
              label="Sample funding"
              raised={{ minor: 41000, currency: "USD" }}
              target={{ minor: 64000, currency: "USD" }}
            />
            <UnitProgress done={18} total={40} unitLabel="packs funded" label="Sample units" />
          </div>
          <Stepper
            label="Sample steps"
            steps={[
              { label: "Done step", state: "complete" },
              { label: "Current step", state: "current", note: "Waiting on you" },
              { label: "Next step", state: "upcoming" },
            ]}
          />
          <DataTable
            caption="Sample table"
            rows={[
              { id: "1", name: "Row one", value: "10" },
              { id: "2", name: "Row two", value: "20" },
            ]}
            columns={[
              { key: "name", header: "Name", rowHeader: true },
              { key: "value", header: "Value", align: "right" },
            ]}
          />
          <ConfirmDialog triggerLabel="Open a dialog" title="Dialog title" confirmLabel="Confirm">
            Dialogs trap focus, close with Escape and return focus to the button that opened them.
          </ConfirmDialog>
        </section>
      </Container>
    </>
  );
}
