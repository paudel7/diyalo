import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/mocks/types";

export function AdminPageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-lg text-slate">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

const statusTone: Record<ApplicationStatus, BadgeTone> = {
  Submitted: "neutral",
  "Returned for information": "warning",
  "Eligibility screening": "info",
  Verification: "info",
  Assessment: "info",
  "Awaiting approval": "warning",
  Approved: "success",
  Declined: "danger",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <StatusBadge tone={statusTone[status]}>{status}</StatusBadge>;
}

/**
 * Page for a module that is built in a later stage. It states what the module is for, which
 * stage builds it and what it will list, so reviewers can check the navigation and the plan.
 */
export function ModulePage({
  title,
  purpose,
  builtIn,
  willList,
  controls,
}: {
  title: string;
  purpose: string;
  builtIn: string;
  willList: string[];
  controls?: string;
}) {
  return (
    <>
      <AdminPageHeader title={title} lead={purpose} />
      <Alert title={`Built in ${builtIn}`} className="mb-8">
        This is a layout placeholder. It has no data and no actions yet.
      </Alert>
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="list-title">
          <h2 id="list-title" className="text-xl">
            What this module will show
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
            {willList.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          {controls && (
            <p className="mt-5 text-base text-slate">
              <span className="font-semibold text-ink">Controls: </span>
              {controls}
            </p>
          )}
        </section>
        <EmptyState title={`No ${title.toLowerCase()} to show`}>
          Records will appear here once the module is built and data exists.
        </EmptyState>
      </div>
    </>
  );
}
