import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";

export const metadata: Metadata = { title: "Corporate & Institutional Giving" };

const options = [
  {
    title: "Program-restricted gifts",
    text: "Fund education or essential living for a set period, with reporting by program.",
  },
  {
    title: "Sponsoring needs",
    text: "Pay for defined items, such as study lights or school transport.",
  },
  {
    title: "Employee giving",
    text: "Share DIYALO with staff. A self-service company portal and gift matching come in a later release.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <PageHeader
        title="Corporate & institutional giving"
        lead="Companies, foundations and community groups can support DIYALO's programs. Send an enquiry and the team will reply."
        crumbs={[{ label: "Home", href: "/" }, { label: "Corporate & Institutional Giving" }]}
      />
      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_1.1fr]">
        <section aria-labelledby="options-title">
          <h2 id="options-title" className="text-2xl">
            Ways to give
          </h2>
          <ul className="mt-5 divide-y divide-mist border-y border-mist">
            {options.map((o) => (
              <li key={o.title} className="py-4">
                <h3 className="text-xl">{o.title}</h3>
                <p className="mt-1 text-base text-slate">{o.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="enquiry-title">
          <h2 id="enquiry-title" className="text-2xl">
            Send an enquiry
          </h2>
          <Alert tone="warning" className="mt-4" title="Not connected">
            This form does not send anything in the prototype.
          </Alert>
          <form className="mt-6 space-y-5">
            <TextField label="Organization name" name="org" autoComplete="organization" required />
            <TextField label="Your name" name="name" autoComplete="name" required />
            <TextField label="Work email" name="email" type="email" autoComplete="email" required />
            <SelectField label="Type of giving" name="type" required defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              <option>Program-restricted gift</option>
              <option>Sponsoring needs</option>
              <option>Employee giving</option>
              <option>Something else</option>
            </SelectField>
            <TextAreaField label="How would you like to help?" name="message" />
            <Button type="submit" disabled>
              Send enquiry
            </Button>
          </form>
        </section>
      </Container>
    </>
  );
}
