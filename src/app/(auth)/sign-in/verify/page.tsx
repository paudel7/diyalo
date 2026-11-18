import { redirect } from "next/navigation";
import { ActionForm } from "@/components/auth/action-form";
import { verifyMfaAction } from "@/server/auth/actions";
import { currentSession, safeNext } from "@/server/auth/web";

export const metadata = { title: "Confirm your sign-in" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  if (!session.actor.mfaEnrolled) redirect("/mfa/setup");
  const sp = await searchParams;
  return (
    <>
      <h1 className="mb-2 text-3xl">Confirm it is you</h1>
      <p className="mb-6 text-lg text-slate">
        Enter the 6-digit code from your authenticator app, or one of your recovery codes.
      </p>
      <ActionForm
        action={verifyMfaAction}
        submitLabel="Confirm"
        hidden={{ next: safeNext(sp.next) }}
        fields={[{ name: "code", label: "Code", autoComplete: "one-time-code", inputMode: "text" }]}
      />
    </>
  );
}
