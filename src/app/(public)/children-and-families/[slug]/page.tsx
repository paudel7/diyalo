import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FundingProgress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";
import { cases, getCase } from "@/mocks/cases";
import { getProgram } from "@/mocks/programs";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  return { title: item ? item.title : "Case not found" };
}

const presets = [25, 50, 100, 250];

export default async function CaseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();
  const program = getProgram(item.program);
  const funded = item.status === "funded";

  return (
    <>
      <PageHeader
        title={item.title}
        lead={`${item.displayName}, age ${item.ageBand}, ${item.region}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Children & Families", href: "/children-and-families" },
          { label: item.title },
        ]}
      />
      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-10">
          <Alert title="Sample case">
            This page uses invented details to show how an approved case will read. It does not
            describe a real child.
          </Alert>

          <section aria-labelledby="need-title">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="info">{program?.name}</StatusBadge>
              {funded ? (
                <StatusBadge tone="success">Fully funded</StatusBadge>
              ) : (
                <StatusBadge tone="warning">Open for support</StatusBadge>
              )}
            </div>
            <h2 id="need-title" className="mt-4 text-2xl">
              The need
            </h2>
            <div className="prose-diyalo mt-3">
              <p className="text-xl">{item.needSummary}</p>
              {item.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="budget-title">
            <h2 id="budget-title" className="text-2xl">
              What the money will buy
            </h2>
            <DataTable
              className="mt-4"
              caption={`Budget for ${item.title}`}
              rows={[
                ...item.budget.map((b) => ({
                  id: b.item,
                  item: b.item,
                  amount: formatMoney(b.amount),
                })),
                { id: "total", item: "Total", amount: formatMoney(item.target) },
              ]}
              columns={[
                { key: "item", header: "Item", rowHeader: true },
                { key: "amount", header: "Amount", align: "right" },
              ]}
            />
          </section>

          <section aria-labelledby="update-title">
            <h2 id="update-title" className="text-2xl">
              Latest update
            </h2>
            <p className="mt-2 text-base text-slate">
              <time dateTime={item.lastUpdate.date}>{item.lastUpdate.date}</time>
            </p>
            <p className="mt-1">{item.lastUpdate.text}</p>
          </section>
        </div>

        <aside aria-labelledby="give-title" className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border-2 border-ink bg-paper p-5">
            <h2 id="give-title" className="text-xl">
              {funded ? "This case is fully funded" : "Support this case"}
            </h2>
            <FundingProgress
              className="mt-4"
              raised={item.raised}
              target={item.target}
              label={`Funding progress for ${item.title}`}
            />
            {funded ? (
              <div className="mt-5 space-y-3 text-base">
                <p>Thank you to everyone who gave. You can still help another family.</p>
                <ButtonLink href="/children-and-families?status=open" className="w-full">
                  See cases that are open
                </ButtonLink>
              </div>
            ) : (
              <div className="mt-5">
                <p className="font-semibold">Choose an amount</p>
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {presets.map((a) => (
                    <li key={a}>
                      <ButtonLink
                        href={`/donate?case=${item.slug}&amount=${a}`}
                        variant="outline"
                        className="w-full"
                      >
                        ${a}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
                <ButtonLink href={`/donate?case=${item.slug}`} className="mt-3 w-full">
                  Give another amount
                </ButtonLink>
              </div>
            )}
            <p className="mt-5 text-sm text-slate">
              What happens if the target is passed or not reached is set out in the{" "}
              <Link href="/donation-terms" className="font-semibold underline underline-offset-4">
                donation terms
              </Link>
              .
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
