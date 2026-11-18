import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { ActionForm } from "@/components/auth/action-form";
import { signInAction } from "@/server/auth/actions";
import { safeNext } from "@/server/auth/web";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; welcome?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <h1 className="mb-2 text-3xl">Staff sign-in</h1>
      <p className="mb-6 text-lg text-slate">Use the account your administrator invited.</p>
      {sp.reset && (
        <Alert tone="success" className="mb-5">
          Password updated. Sign in with the new password.
        </Alert>
      )}
      {sp.welcome && (
        <Alert tone="success" className="mb-5">
          Your password is set. Sign in to continue.
        </Alert>
      )}
      <ActionForm
        action={signInAction}
        submitLabel="Sign in"
        hidden={{ next: safeNext(sp.next) }}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "username" },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
          },
        ]}
      />
      <p className="mt-5 text-base">
        <Link href="/forgot-password" className="underline underline-offset-4">
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
