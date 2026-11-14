import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { programs } from "@/mocks/programs";

export const metadata: Metadata = { title: "Our Causes" };

export default function CausesPage() {
  return (
    <>
      <PageHeader
        title="Our causes"
        lead="DIYALO supports two programs. Each one has a stated scope, so donors know what their gift can and cannot pay for."
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Causes" }]}
      />
      <Container className="space-y-16 py-14">
        {programs.map((p) => (
          <section
            key={p.slug}
            id={p.slug}
            aria-labelledby={`${p.slug}-title`}
            className="scroll-mt-32"
          >
            <h2 id={`${p.slug}-title`} className="text-3xl">
              {p.name}
            </h2>
            <p className="mt-3 max-w-2xl text-xl">{p.summary}</p>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl">Can pay for</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {p.covers.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl">Cannot pay for</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {p.doesNotCover.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/donate?program=${p.slug}`}>Give to this program</ButtonLink>
              <ButtonLink href={`/children-and-families?program=${p.slug}`} variant="outline">
                See related cases
              </ButtonLink>
            </div>
          </section>
        ))}
        <Alert title="Emergency assistance">
          DIYALO does not offer emergency assistance yet. It will only be added as a separate
          program, with its own rules, after it is formally launched.
        </Alert>
      </Container>
    </>
  );
}
