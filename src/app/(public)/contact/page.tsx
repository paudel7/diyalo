import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        lead="Ask about a gift, a case, an application or a partnership."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="details-title">
          <h2 id="details-title" className="text-2xl">
            Contact details
          </h2>
          <dl className="mt-4 space-y-3 text-lg">
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="text-slate">To be confirmed</dd>
            </div>
            <div>
              <dt className="font-semibold">Postal address</dt>
              <dd className="text-slate">To be confirmed (depends on the legal entity)</dd>
            </div>
          </dl>
          <p className="mt-6 text-base text-slate">
            To raise a concern about a child&apos;s safety or about how DIYALO has acted, use the
            complaints page.
          </p>
        </section>
        <section aria-labelledby="msg-title">
          <h2 id="msg-title" className="text-2xl">
            Send a message
          </h2>
          <Alert tone="warning" className="mt-4" title="Not connected">
            This form does not send anything in the prototype.
          </Alert>
          <form className="mt-6 space-y-5">
            <TextField label="Your name" name="name" autoComplete="name" required />
            <TextField label="Email" name="email" type="email" autoComplete="email" required />
            <SelectField label="Topic" name="topic" defaultValue="">
              <option value="">Choose a topic</option>
              <option>A gift I made</option>
              <option>A case</option>
              <option>An application for support</option>
              <option>Partnerships</option>
              <option>Something else</option>
            </SelectField>
            <TextAreaField
              label="Message"
              name="message"
              required
              hint="Do not include a child's full name, address or identity documents."
            />
            <Button type="submit" disabled>
              Send message
            </Button>
          </form>
        </section>
      </Container>
    </>
  );
}
