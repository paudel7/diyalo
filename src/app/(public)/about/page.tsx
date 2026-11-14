import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "About DIYALO" };

const principles = [
  {
    title: "Approved before published",
    text: "No case appears until it has been reviewed, verified, approved and consented to.",
  },
  {
    title: "Private by default",
    text: "Public pages show only what a guardian agreed to share. No names, addresses or documents.",
  },
  {
    title: "People decide",
    text: "Scores can help order the queue. They never approve or reject an application.",
  },
  {
    title: "Traceable money",
    text: "A gift stays linked to its fund, its allocation, its payment and its receipt.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About DIYALO"
        lead="Diyalo is the Nepali word for a clay oil lamp. The name is a promise to keep a light on for children who are working to learn."
        crumbs={[{ label: "Home", href: "/" }, { label: "About DIYALO" }]}
      />
      <Container className="space-y-12 py-12">
        <section aria-labelledby="how-title" className="prose-diyalo">
          <h2 id="how-title">How DIYALO works</h2>
          <p>
            DIYALO is a giving platform with its own brand and its own systems. It plans to work
            first through a Nepal partner organization that has been checked and is legally able to
            take part. It does not publish cases on its own say-so, and it does not let anyone
            publish their own.
          </p>
          <Alert tone="warning" title="Partners and legal status are not confirmed">
            The partner, the receiving legal entity and the approvals needed to take donations have
            not been confirmed. This page will name them once they are.
          </Alert>
        </section>

        <section aria-labelledby="principles-title">
          <h2 id="principles-title" className="text-2xl">
            What we hold to
          </h2>
          <dl className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="border-t-4 border-ink pt-3">
                <dt className="font-display text-xl font-semibold">{p.title}</dt>
                <dd className="mt-1 text-base text-slate">{p.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="text-lg">
          Read more about{" "}
          <Link href="/about/governance" className="font-semibold underline underline-offset-4">
            governance
          </Link>
          ,{" "}
          <Link href="/about/partners" className="font-semibold underline underline-offset-4">
            partners
          </Link>{" "}
          and{" "}
          <Link href="/safeguarding" className="font-semibold underline underline-offset-4">
            child safeguarding
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
