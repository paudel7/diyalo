import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { ActionForm } from "@/components/auth/action-form";
import { SimpleAction } from "@/components/auth/simple-action";
import { changePasswordAction, regenerateCodesAction } from "@/server/auth/actions";
import { requireActor } from "@/server/auth/web";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const actor = await requireActor("/admin/account");
  return (
    <>
      <AdminPageHeader title="Your account" lead={`${actor.displayName} · ${actor.email}`} />
      <div className="grid max-w-3xl gap-10">
        <section aria-labelledby="pw" className="max-w-md">
          <h2 id="pw" className="mb-4 text-xl">
            Change password
          </h2>
          <ActionForm
            action={changePasswordAction}
            submitLabel="Change password"
            fields={[
              {
                name: "current",
                label: "Current password",
                type: "password",
                autoComplete: "current-password",
              },
              {
                name: "password",
                label: "New password",
                type: "password",
                autoComplete: "new-password",
                hint: "At least 12 characters.",
              },
            ]}
          />
        </section>
        <section aria-labelledby="mfa" className="max-w-md">
          <h2 id="mfa" className="mb-2 text-xl">
            Multi-factor sign-in
          </h2>
          {actor.mfaEnrolled ? (
            <>
              <p className="mb-3 text-slate">
                Authenticator app is on. Making new recovery codes cancels the old ones.
              </p>
              <SimpleAction action={regenerateCodesAction} label="Make new recovery codes" />
            </>
          ) : (
            <p className="text-slate">
              Not set up.{" "}
              <a className="font-semibold underline" href="/mfa/setup">
                Set it up now
              </a>
              .
            </p>
          )}
        </section>
      </div>
    </>
  );
}
