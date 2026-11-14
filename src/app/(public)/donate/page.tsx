import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField, RadioGroup, SelectField, TextField } from "@/components/ui/field";
import { getCase } from "@/mocks/cases";
import { sponsorshipNeeds } from "@/mocks/cases";

export const metadata: Metadata = { title: "Donate" };

type Params = Promise<{ case?: string; program?: string; need?: string; amount?: string }>;

export default async function DonatePage({ searchParams }: { searchParams: Params }) {
  const q = await searchParams;
  const selectedCase = q.case ? getCase(q.case) : undefined;
  const selectedNeed = q.need ? sponsorshipNeeds.find((n) => n.slug === q.need) : undefined;
  const designation = selectedCase
    ? "case"
    : selectedNeed
      ? "need"
      : q.program === "education" || q.program === "essential-living"
        ? q.program
        : "general";
  const amount = q.amount && /^\d{1,6}$/.test(q.amount) ? q.amount : "";

  const designations = [
    {
      value: "general",
      label: "Where it is needed most",
      description: "Unrestricted. DIYALO directs it within its approved priorities.",
    },
    {
      value: "education",
      label: "Education support",
      description: "Restricted to the education program.",
    },
    {
      value: "essential-living",
      label: "Essential living support",
      description: "Restricted to the essential living program.",
    },
    ...(selectedCase
      ? [
          {
            value: "case",
            label: `This case: ${selectedCase.title}`,
            description: "Restricted to this case, under the donation terms.",
          },
        ]
      : []),
    ...(selectedNeed
      ? [
          {
            value: "need",
            label: `This need: ${selectedNeed.name}`,
            description: "Restricted to this sponsored need.",
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Donate"
        lead="Choose where your gift goes and how much to give. The designation you pick is recorded with the gift."
        crumbs={[{ label: "Home", href: "/" }, { label: "Donate" }]}
      />
      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_22rem]">
        <form className="space-y-10" aria-describedby="donate-note">
          <Alert tone="warning" title="Payments are not connected">
            <span id="donate-note">
              This is a design prototype. No payment provider is chosen yet, so nothing on this page
              takes or sends money.
            </span>
          </Alert>

          <RadioGroup
            legend="Where should your gift go?"
            name="designation"
            defaultValue={designation}
            options={designations}
          />

          <fieldset>
            <legend className="mb-1.5 font-semibold">Amount</legend>
            <p className="mb-3 text-base text-slate">
              Only USD is shown. The currencies donors can pay in depend on the payment provider and
              are not decided yet.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Amount"
                name="amount"
                inputMode="numeric"
                defaultValue={amount}
                placeholder="50"
                required
              />
              <SelectField label="Currency" name="currency" defaultValue="USD">
                <option value="USD">USD (US dollar)</option>
                <option value="CAD" disabled>
                  CAD (not yet available)
                </option>
                <option value="EUR" disabled>
                  EUR (not yet available)
                </option>
                <option value="NPR" disabled>
                  NPR (not yet available)
                </option>
              </SelectField>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1.5 font-semibold">Your details</legend>
            <TextField label="Full name" name="name" autoComplete="name" required />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              hint="Your gift confirmation is sent here."
            />
            <CheckboxField
              name="anonymous"
              label="Do not show my name publicly"
              hint="You can give anonymously. DIYALO still keeps a private record."
            />
          </fieldset>

          <CheckboxField
            name="terms"
            required
            label={
              <>
                I have read the{" "}
                <Link href="/donation-terms" className="underline underline-offset-4">
                  donation terms
                </Link>
              </>
            }
          />

          <Button type="submit" size="lg" disabled>
            Continue to payment
          </Button>
        </form>

        <aside aria-labelledby="before-title" className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl bg-flame-tint p-5">
            <h2 id="before-title" className="text-xl">
              Before you give
            </h2>
            <ul className="mt-3 space-y-3 text-base">
              <li>A gift to a program or case can only be spent on that program or case.</li>
              <li>Fees and what happens to any surplus are stated in the donation terms.</li>
              <li>Receipt arrangements are not confirmed yet. Gifts are acknowledged by email.</li>
              <li>You can contact us about a gift at any time from the contact page.</li>
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}
