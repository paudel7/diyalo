import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { NotPermitted } from "@/components/admin/not-permitted";
import { SimpleAction } from "@/components/auth/simple-action";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { hasUnconditionalPermission } from "@/lib/permissions";
import { AUDIT_ACTION_NAMES } from "@/server/audit/actions";
import { verifyChainAction } from "@/server/auth/actions";
import { gate, requestContext } from "@/server/auth/web";
import { listAuditEvents } from "@/server/services/audit-service";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; outcome?: string }>;
}) {
  const g = await gate("audit.read", "/admin/settings/audit");
  if (!g.ok) return <NotPermitted />;
  const sp = await searchParams;
  const rows = await listAuditEvents(
    g.actor,
    { action: sp.action, limit: 200 },
    await requestContext(),
  );
  const shown = sp.outcome ? rows.filter((r) => r.outcome === sp.outcome) : rows;
  return (
    <>
      <AdminPageHeader
        title="Audit log"
        lead="Newest first. Entries cannot be edited or deleted. Details are limited to codes and counts: no names, emails or passwords are recorded."
      />
      <form method="get" className="mb-6 flex flex-wrap items-end gap-4">
        <label className="font-semibold">
          Action
          <select
            name="action"
            defaultValue={sp.action ?? ""}
            className="mt-1 block min-h-12 rounded-lg border-2 border-slate bg-paper px-3"
          >
            <option value="">All</option>
            {AUDIT_ACTION_NAMES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="font-semibold">
          Outcome
          <select
            name="outcome"
            defaultValue={sp.outcome ?? ""}
            className="mt-1 block min-h-12 rounded-lg border-2 border-slate bg-paper px-3"
          >
            <option value="">All</option>
            <option value="success">success</option>
            <option value="denied">denied</option>
            <option value="failure">failure</option>
          </select>
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-lg border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-snow"
        >
          Filter
        </button>
      </form>
      <DataTable
        caption="Audit events, newest first"
        rows={shown.map((r) => ({ ...r, id: String(r.id) }))}
        columns={[
          {
            key: "when",
            header: "When (UTC)",
            cell: (r) => r.occurredAt.toISOString().slice(0, 19).replace("T", " "),
            rowHeader: true,
          },
          { key: "action", header: "Action" },
          {
            key: "outcome",
            header: "Outcome",
            cell: (r) => (
              <StatusBadge
                tone={
                  r.outcome === "success"
                    ? "success"
                    : r.outcome === "denied"
                      ? "warning"
                      : "danger"
                }
              >
                {r.outcome}
              </StatusBadge>
            ),
          },
          {
            key: "actor",
            header: "Actor",
            cell: (r) => (r.actorUserId ? r.actorUserId.slice(0, 8) : r.actorType),
          },
          {
            key: "entity",
            header: "Record",
            cell: (r) => (r.entityType ? `${r.entityType} ${r.entityId?.slice(0, 8) ?? ""}` : ""),
          },
          { key: "details", header: "Details", cell: (r) => JSON.stringify(r.metadata) },
        ]}
      />
      {hasUnconditionalPermission(g.actor.roles, "settings.manage") && (
        <section className="mt-8 max-w-md">
          <h2 className="mb-2 text-xl">Check the log has not been altered</h2>
          <p className="mb-3 text-slate">
            Recomputes the tamper-evident hash chain across every event.
          </p>
          <SimpleAction action={verifyChainAction} label="Verify chain" />
        </section>
      )}
    </>
  );
}
