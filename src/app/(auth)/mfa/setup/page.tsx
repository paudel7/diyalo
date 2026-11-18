import { redirect } from "next/navigation";
import { ActionForm } from "@/components/auth/action-form";
import { confirmMfaAction } from "@/server/auth/actions";
import { currentSession } from "@/server/auth/web";
import { beginMfaEnrolment } from "@/server/services/auth-service";

export const metadata = { title: "Set up multi-factor sign-in" };

export default async function MfaSetupPage() {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  if (session.actor.mfaEnrolled) redirect(session.state === "full" ? "/admin" : "/sign-in/verify");
  const { secret, uri } = await beginMfaEnrolment(session.actor);
  return (
    <>
      <h1 className="mb-2 text-3xl">Set up multi-factor sign-in</h1>
      <ol className="mb-6 list-decimal space-y-2 pl-5 text-lg">
        <li>Open an authenticator app (any app that supports time-based codes).</li>
        <li>Add an account and choose manual entry. Type this key:</li>
      </ol>
      <p
        className="mb-2 break-all rounded-lg bg-snow p-3 font-mono text-xl tracking-wider"
        aria-label="Setup key"
      >
        {secret}
      </p>
      <p className="mb-6 break-all text-sm text-slate">
        Setup link for apps that open it: <span className="font-mono">{uri}</span>
      </p>
      <ActionForm
        action={confirmMfaAction}
        submitLabel="Turn on"
        fields={[
          {
            name: "code",
            label: "6-digit code from the app",
            autoComplete: "one-time-code",
            inputMode: "numeric",
          },
        ]}
      />
    </>
  );
}
