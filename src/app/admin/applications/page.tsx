import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, ApplicationStatusBadge } from "@/components/admin/admin-page";
import { Button, ButtonLink } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { SelectField } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { applications } from "@/mocks/admin";

export const metadata: Metadata = { title: "Applications" };

type Params = Promise<{ status?: string }>;

const statuses = [...new Set(applications.map((a) => a.status))];

export default async function ApplicationsPage({ searchParams }: { searchParams: Params }) {
  const { status } = await searchParams;
  const rows = status ? applications.filter((a) => a.status === status) : applications;

  return (
    <>
      <AdminPageHeader
        title="Applications"
        lead="The review queue. Open an application to screen, verify, assess and recommend."
      />
      <form method="get" className="mb-6 grid max-w-xl gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <SelectField label="Status" name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <div className="flex gap-3">
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          <ButtonLink href="/admin/applications" variant="ghost">
            Reset
          </ButtonLink>
        </div>
      </form>
      {rows.length > 0 ? (
        <DataTable
          caption="Applications"
          rows={rows}
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
            { key: "program", header: "Program" },
            { key: "region", header: "Region" },
            { key: "received", header: "Received" },
            {
              key: "status",
              header: "Status",
              cell: (r) => <ApplicationStatusBadge status={r.status} />,
            },
            { key: "assignee", header: "Assigned to" },
          ]}
        />
      ) : (
        <EmptyState title="No applications with that status">
          Choose another status or reset the filter.
        </EmptyState>
      )}
    </>
  );
}
