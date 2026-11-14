import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Our Impact" };

const metrics = [
  {
    id: "received",
    metric: "Funds received",
    definition: "Confirmed gifts, by program and by fund type.",
    source: "Donation records, reconciled to the payment provider",
  },
  {
    id: "disbursed",
    metric: "Funds disbursed",
    definition: "Payments approved and made, by program.",
    source: "Disbursement records and the ledger",
  },
  {
    id: "cases",
    metric: "Cases funded",
    definition: "Cases that reached their approved target.",
    source: "Case and allocation records",
  },
  {
    id: "updates",
    metric: "Case updates published",
    definition: "Updates approved for publication with guardian consent.",
    source: "Case update records",
  },
  {
    id: "overhead",
    metric: "Costs of running DIYALO",
    definition: "Operating costs and how they were paid for.",
    source: "Ledger, with the fee and cost policy",
  },
];

export default function ImpactPage() {
  return (
    <>
      <PageHeader
        title="Our impact"
        lead="DIYALO will report what it received, what it spent and what that achieved. Each figure will have a written definition and a source."
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Impact" }]}
      />
      <Container className="space-y-12 py-12">
        <section aria-labelledby="empty-title">
          <h2 id="empty-title" className="sr-only">
            Published figures
          </h2>
          <EmptyState title="No figures are published yet">
            DIYALO has not started its pilot, so there is nothing to report. Figures appear here
            only when they come from reconciled records.
          </EmptyState>
        </section>

        <section aria-labelledby="defs-title">
          <h2 id="defs-title" className="text-2xl">
            What each report will measure
          </h2>
          <p className="mt-2 max-w-2xl text-lg text-slate">
            Nothing is shown unless it can be traced to a record. This is the planned list.
          </p>
          <DataTable
            className="mt-5"
            caption="Planned impact measures, definitions and sources"
            rows={metrics}
            columns={[
              { key: "metric", header: "Measure", rowHeader: true },
              { key: "definition", header: "Definition" },
              { key: "source", header: "Source" },
            ]}
          />
        </section>
      </Container>
    </>
  );
}
