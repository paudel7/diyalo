import Link from "next/link";
import { AdminPageHeader, ApplicationStatusBadge } from "@/components/admin/admin-page";
import { Alert } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { applications, disbursements } from "@/mocks/admin";

export default function AdminDashboard() {
  const toReview = applications.filter((a) =>
    ["Submitted", "Eligibility screening", "Verification", "Assessment"].includes(a.status),
  );
  const awaitingApproval = applications.filter((a) => a.status === "Awaiting approval");
  const payAwaiting = disbursements.filter((d) => d.status === "Awaiting approval");
  const flagged = applications.filter((a) => a.flag);

  const tiles = [
    { label: "Applications in review", value: toReview.length, href: "/admin/applications" },
    {
      label: "Cases awaiting approval",
      value: awaitingApproval.length,
      href: "/admin/applications",
    },
    {
      label: "Payments awaiting approval",
      value: payAwaiting.length,
      href: "/admin/disbursements",
    },
    { label: "Items needing attention", value: flagged.length, href: "/admin/applications" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        lead="What needs a decision today. All figures are from fictional sample records."
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link
              href={t.href}
              className="block rounded-xl border border-mist bg-paper p-5 hover:border-ink"
            >
              <span className="block text-4xl font-semibold font-display">{t.value}</span>
              <span className="mt-1 block text-base text-slate">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-10">
        <section aria-labelledby="attention-title">
          <h2 id="attention-title" className="mb-3 text-2xl">
            Needs attention
          </h2>
          <DataTable
            caption="Applications with a flag"
            rows={flagged}
            columns={[
              {
                key: "reference",
                header: "Reference",
                rowHeader: true,
                cell: (r) => (
                  <Link
                    href={`/admin/applications/${r.reference}`}
                    className="underline underline-offset-4"
                  >
                    {r.reference}
                  </Link>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (r) => <ApplicationStatusBadge status={r.status} />,
              },
              { key: "flag", header: "Why it needs attention" },
              { key: "assignee", header: "Assigned to" },
            ]}
          />
        </section>

        <section aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-3 text-2xl">
            Payments waiting for a second person
          </h2>
          <DataTable
            caption="Disbursements awaiting approval"
            rows={payAwaiting}
            columns={[
              { key: "reference", header: "Reference", rowHeader: true },
              { key: "purpose", header: "Purpose" },
              {
                key: "amount",
                header: "Amount",
                align: "right",
                cell: (r) => formatMoney(r.amount),
              },
              { key: "maker", header: "Requested by" },
            ]}
          />
        </section>

        <section aria-labelledby="safe-title">
          <h2 id="safe-title" className="mb-3 text-2xl">
            Safeguarding
          </h2>
          <Alert title="Restricted view">
            Safeguarding records are visible only to people with that role. Counts and details
            appear here for them in Stage 2.{" "}
            <StatusBadge tone="neutral">No role assigned</StatusBadge>
          </Alert>
        </section>
      </div>
    </>
  );
}
