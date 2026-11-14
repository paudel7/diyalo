import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { Alert } from "@/components/ui/alert";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatMoney } from "@/lib/money";
import { disbursements, sampleChain } from "@/mocks/admin";
import type { DisbursementRow } from "@/mocks/types";

export const metadata: Metadata = { title: "Disbursements" };

const tone: Record<DisbursementRow["status"], BadgeTone> = {
  Draft: "neutral",
  "Awaiting approval": "warning",
  Approved: "info",
  Paid: "success",
  Rejected: "danger",
};

export default function DisbursementsPage() {
  return (
    <>
      <AdminPageHeader
        title="Disbursements"
        lead="Payments out. Each one is requested by one person and approved by a different person."
      />

      <Alert title="Maker and checker are always different people" className="mb-8">
        The person who requests a payment cannot approve it. The real rule is enforced on the server
        in Stage 6.
      </Alert>

      <section aria-labelledby="chain-title" className="mb-10">
        <h2 id="chain-title" className="text-2xl">
          One sample gift, followed end to end
        </h2>
        <ol className="mt-5 grid gap-6 md:grid-cols-5">
          {sampleChain.map((l) => (
            <li key={l.stage} className="border-t-4 border-ink pt-3">
              <p className="font-display text-lg font-semibold">{l.stage}</p>
              <p className="mt-1 text-base font-semibold">{l.record}</p>
              <p className="mt-1 text-base text-slate">{l.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="req-title">
        <h2 id="req-title" className="mb-3 text-2xl">
          Payment requests
        </h2>
        <DataTable
          caption="Disbursement requests"
          rows={disbursements}
          columns={[
            { key: "reference", header: "Reference", rowHeader: true },
            { key: "purpose", header: "Purpose" },
            { key: "fund", header: "Fund" },
            { key: "amount", header: "Amount", align: "right", cell: (r) => formatMoney(r.amount) },
            { key: "maker", header: "Requested by" },
            { key: "checker", header: "Approver" },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge tone={tone[r.status]}>{r.status}</StatusBadge>,
            },
          ]}
        />
      </section>
    </>
  );
}
