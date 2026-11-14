import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { CaseCard } from "@/components/public/case-card";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { cases } from "@/mocks/cases";

export const metadata: Metadata = { title: "Children & Families" };

type Params = Promise<{ program?: string; status?: string }>;

export default async function CasesPage({ searchParams }: { searchParams: Params }) {
  const { program, status } = await searchParams;
  const shown = cases.filter(
    (c) => (!program || c.program === program) && (!status || c.status === status),
  );

  return (
    <>
      <PageHeader
        title="Children & families"
        lead="Approved cases that need support. Each one lists what the money will buy."
        crumbs={[{ label: "Home", href: "/" }, { label: "Children & Families" }]}
      />
      <Container className="py-10">
        <Alert title="Sample cases" className="mb-8">
          The cases below are invented to show the design. No real child or family is shown in this
          prototype.
        </Alert>

        <form
          method="get"
          className="grid gap-4 rounded-xl border border-mist bg-paper p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <SelectField label="Program" name="program" defaultValue={program ?? ""}>
            <option value="">All programs</option>
            <option value="education">Education support</option>
            <option value="essential-living">Essential living support</option>
          </SelectField>
          <SelectField label="Status" name="status" defaultValue={status ?? ""}>
            <option value="">Any status</option>
            <option value="open">Open for support</option>
            <option value="funded">Fully funded</option>
          </SelectField>
          <div className="flex gap-3">
            <Button type="submit" variant="secondary">
              Apply filters
            </Button>
            <ButtonLink href="/children-and-families" variant="ghost">
              Reset
            </ButtonLink>
          </div>
        </form>

        <p className="mt-6 text-base text-slate" aria-live="polite">
          Showing {shown.length} of {cases.length} cases
        </p>

        {shown.length > 0 ? (
          <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <li key={c.slug}>
                <CaseCard item={c} headingLevel={2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No cases match these filters"
              action={<ButtonLink href="/children-and-families">Show all cases</ButtonLink>}
            >
              Try a different program or status. You can also{" "}
              <Link href="/donate" className="font-semibold underline underline-offset-4">
                give to a program
              </Link>{" "}
              and let DIYALO direct it where it is needed.
            </EmptyState>
          </div>
        )}
      </Container>
    </>
  );
}
