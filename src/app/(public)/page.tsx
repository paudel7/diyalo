import Link from "next/link";
import { Lamp } from "@/components/brand/lamp";
import { Container, Section } from "@/components/layout/container";
import { CaseCard } from "@/components/public/case-card";
import { ButtonLink } from "@/components/ui/button";
import { cases } from "@/mocks/cases";
import { programs } from "@/mocks/programs";

const tracedSteps = [
  {
    title: "Gift",
    text: "A donor gives. The payment is confirmed by the payment provider, not by a web page.",
  },
  { title: "Fund", text: "The gift is placed in a fund that matches what the donor chose." },
  { title: "Allocation", text: "Money is set aside for an approved case or program need." },
  { title: "Payment", text: "A second person approves each payment before it is made." },
  { title: "Report", text: "Receipts and updates are attached, so the record is complete." },
];

const ways = [
  {
    title: "Donate",
    text: "Give to where help is needed most, or to one program.",
    href: "/donate",
    cta: "Donate now",
  },
  {
    title: "Support a child or family",
    text: "Read an approved case and fund its stated need.",
    href: "/children-and-families",
    cta: "See cases",
  },
  {
    title: "Sponsor a need",
    text: "Pay for a defined item, such as a study light or a term of bus fare.",
    href: "/sponsor-a-need",
    cta: "Sponsor a need",
  },
  {
    title: "Give as a company",
    text: "Restricted gifts and partnerships for businesses and institutions.",
    href: "/corporate-giving",
    cta: "Corporate giving",
  },
  {
    title: "Ask for support",
    text: "A parent or guardian in Nepal can apply for help.",
    href: "/apply",
    cta: "Apply for support",
  },
];

export default function HomePage() {
  const featured = cases.filter((c) => c.status === "open").slice(0, 3);

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="surface-dark relative overflow-hidden bg-ink text-snow"
      >
        <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:py-24">
          <div>
            <h1 id="hero-title" className="max-w-2xl text-5xl sm:text-6xl lg:text-[4.25rem]">
              Lighting the path to a brighter future.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-night-text">
              DIYALO connects donors with children and families in Nepal who need help with school
              and daily essentials. Every gift is recorded against a purpose, from payment to
              spending, and reported in the open.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/donate" size="lg">
                Donate now
              </ButtonLink>
              <ButtonLink href="/children-and-families" size="lg" variant="outline-light">
                Support a child
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <Lamp glow animated className="mx-auto w-full max-w-md" />
          </div>
        </Container>
      </section>

      <Section labelledBy="programs-title">
        <h2 id="programs-title" className="max-w-2xl text-3xl sm:text-4xl">
          Two programs, each with clear limits
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-slate">
          A gift to a program can only be spent on that program. If a donor chooses one, it is never
          moved to another without a documented reason and approval.
        </p>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-0">
          {programs.map((p, i) => (
            <div
              key={p.slug}
              className={i === 0 ? "md:border-r md:border-mist md:pr-12" : "md:pl-12"}
            >
              <h3 className="text-2xl">{p.name}</h3>
              <p className="mt-2 text-lg">{p.summary}</p>
              <p className="mt-5 font-semibold">Can pay for</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-base">
                {p.covers.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <Link
                href={`/causes#${p.slug}`}
                className="mt-5 inline-block font-semibold underline underline-offset-4"
              >
                About {p.name.toLowerCase()}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper" labelledBy="cases-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="cases-title" className="text-3xl sm:text-4xl">
              Children and families you can support
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate">
              These are sample cases that show how an approved case will look. Real cases appear
              only after review, verification and guardian consent.
            </p>
          </div>
          <ButtonLink href="/children-and-families" variant="outline">
            See all cases
          </ButtonLink>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <li key={c.slug}>
              <CaseCard item={c} />
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="tint" labelledBy="trace-title">
        <h2 id="trace-title" className="max-w-2xl text-3xl sm:text-4xl">
          How a gift is followed from payment to purpose
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-6">
          {tracedSteps.map((s, i) => (
            <li key={s.title} className="border-t-4 border-ink pt-4">
              <p className="font-display text-sm font-semibold text-flame-deep">Step {i + 1}</p>
              <h3 className="mt-1 text-xl">{s.title}</h3>
              <p className="mt-2 text-base">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8">
          <Link href="/impact" className="font-semibold underline underline-offset-4">
            See what we will report and how it is measured
          </Link>
        </p>
      </Section>

      <Section labelledBy="ways-title">
        <h2 id="ways-title" className="text-3xl sm:text-4xl">
          Ways to take part
        </h2>
        <ul className="mt-8 divide-y divide-mist border-y border-mist">
          {ways.map((w) => (
            <li
              key={w.title}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <div className="max-w-xl">
                <h3 className="text-xl">{w.title}</h3>
                <p className="mt-1 text-base text-slate">{w.text}</p>
              </div>
              <ButtonLink href={w.href} variant="outline" className="self-start sm:self-auto">
                {w.cta}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
