import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";

export const metadata: Metadata = { title: "Apply for Support" };

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        title="Apply for support"
        lead="A parent, guardian or authorized representative can ask for help with a child's schooling or a family's essentials."
        crumbs={[{ label: "Home", href: "/" }, { label: "Apply for Support" }]}
        actions={<ButtonLink href="/apply/form">Start an application</ButtonLink>}
      />
      <Container className="grid gap-12 py-12 lg:grid-cols-2">
        <section aria-labelledby="who-title">
          <h2 id="who-title" className="text-2xl">
            Who can apply
          </h2>
          <ul className="prose-diyalo mt-3 list-disc pl-5">
            <li>An adult parent, guardian or authorized representative. Children cannot apply.</li>
            <li>For a child or family in Nepal who needs help with schooling or essentials.</li>
            <li>Applying does not promise support. Every application is reviewed by a person.</li>
          </ul>
          <Alert tone="warning" className="mt-6" title="Eligibility rules are not final">
            The eligibility policy has not been approved yet. This page will state it in plain
            language once it is.
          </Alert>
        </section>

        <section aria-labelledby="next-title">
          <h2 id="next-title" className="text-2xl">
            What happens after you apply
          </h2>
          <Stepper
            className="mt-5"
            label="Application review steps"
            steps={[
              {
                label: "We check your application is complete",
                state: "upcoming",
                note: "We may ask for more information.",
              },
              { label: "We check eligibility", state: "upcoming" },
              {
                label: "We verify the details",
                state: "upcoming",
                note: "This can include a visit or a call.",
              },
              { label: "A person assesses the need", state: "upcoming" },
              {
                label: "A decision is made",
                state: "upcoming",
                note: "You are told the outcome either way.",
              },
            ]}
          />
          <h2 className="mt-10 text-2xl">What to have ready</h2>
          <ul className="prose-diyalo mt-3 list-disc pl-5">
            <li>Details of the child and household.</li>
            <li>A short description of what help is needed.</li>
            <li>Supporting documents. Accepted types are set before launch.</li>
            <li>Your consent choices, which you can change later.</li>
          </ul>
        </section>
      </Container>
    </>
  );
}
