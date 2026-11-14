import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, ApplicationStatusBadge } from "@/components/admin/admin-page";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Stepper, type Step } from "@/components/ui/stepper";
import { applications, getApplication, workflowSteps } from "@/mocks/admin";
import type { ApplicationStatus } from "@/mocks/types";

type Params = Promise<{ ref: string }>;

export function generateStaticParams() {
  return applications.map((a) => ({ ref: a.reference }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

function buildSteps(status: ApplicationStatus): Step[] {
  let currentIndex = workflowSteps.indexOf(status);
  let note: string | undefined;
  if (status === "Returned for information") {
    currentIndex = 1;
    note = "Returned to the guardian for more information";
  } else if (status === "Declined") {
    currentIndex = 4;
    note = "Declined. The reason is recorded and the guardian is told.";
  }
  return workflowSteps.map((label, i) => ({
    label,
    state: i < currentIndex ? "complete" : i === currentIndex ? "current" : "upcoming",
    note: i === currentIndex ? note : undefined,
  }));
}

const checklist = [
  { id: "c1", item: "Application is complete", result: "Yes" },
  { id: "c2", item: "Adult applicant confirmed", result: "Yes" },
  { id: "c3", item: "Possible duplicate checked", result: "Done" },
  { id: "c4", item: "Identity and evidence checked", result: "Pending" },
  { id: "c5", item: "Conflict of interest declared", result: "None" },
];

export default async function ApplicationDetail({ params }: { params: Params }) {
  const { ref } = await params;
  const app = getApplication(ref);
  if (!app) notFound();

  return (
    <>
      <p className="mb-3 text-base">
        <Link href="/admin/applications" className="underline underline-offset-4">
          Applications
        </Link>{" "}
        / {app.reference}
      </p>
      <AdminPageHeader
        title={app.reference}
        lead={`${app.program}, ${app.region}. Received ${app.received}.`}
        actions={<ApplicationStatusBadge status={app.status} />}
      />

      {app.flag && (
        <Alert tone="warning" title="Needs attention" className="mb-8">
          {app.flag}
        </Alert>
      )}

      <div className="grid gap-10 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="summary-title">
            <h2 id="summary-title" className="text-2xl">
              Summary
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Program", app.program],
                ["Region", app.region],
                ["Assigned to", app.assignee],
                ["Applicant", "Sample guardian (details are fictional and hidden here)"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-base text-slate">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="check-title">
            <h2 id="check-title" className="mb-3 text-2xl">
              Verification checklist
            </h2>
            <DataTable
              caption="Verification checks and results"
              rows={checklist}
              columns={[
                { key: "item", header: "Check", rowHeader: true },
                { key: "result", header: "Result" },
              ]}
            />
          </section>

          <section aria-labelledby="assess-title">
            <h2 id="assess-title" className="text-2xl">
              Assessment
            </h2>
            <Alert className="mt-3" title="A score helps order the queue. It never decides.">
              A person records the assessment and the reason for the recommendation. The
              prioritization rubric is not approved yet, so no score is shown.
            </Alert>
          </section>
        </div>

        <aside aria-labelledby="flow-title" className="space-y-8">
          <div>
            <h2 id="flow-title" className="mb-4 text-xl">
              Case workflow
            </h2>
            <Stepper label="Case workflow" steps={buildSteps(app.status)} />
          </div>
          <div>
            <h2 className="mb-3 text-xl">Actions</h2>
            <div className="flex flex-col items-stretch gap-3">
              <ConfirmDialog
                triggerLabel="Return for information"
                title="Return this application?"
                confirmLabel="Return to guardian"
              >
                The guardian is asked for the missing information and the application is paused. In
                the prototype this only closes the dialog.
              </ConfirmDialog>
              <ConfirmDialog
                triggerLabel="Recommend approval"
                triggerVariant="primary"
                title="Recommend approval?"
                confirmLabel="Send for approval"
              >
                A different person must approve. You cannot approve your own recommendation.
              </ConfirmDialog>
              <ConfirmDialog
                triggerLabel="Decline"
                triggerVariant="danger"
                confirmVariant="danger"
                title="Decline this application?"
                confirmLabel="Decline application"
              >
                A reason is required and is recorded. The guardian is told the outcome.
              </ConfirmDialog>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
