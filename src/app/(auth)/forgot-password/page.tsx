import Link from "next/link";
import { ActionForm } from "@/components/auth/action-form";
import { forgotPasswordAction } from "@/server/auth/actions";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-3xl">Reset your password</h1>
      <p className="mb-6 text-lg text-slate">
        We will email a link if the address belongs to a staff account.
      </p>
      <ActionForm
        action={forgotPasswordAction}
        submitLabel="Send reset link"
        fields={[{ name: "email", label: "Email", type: "email", autoComplete: "username" }]}
      />
      <p className="mt-5 text-base">
        <Link href="/sign-in" className="underline underline-offset-4">
          Back to sign-in
        </Link>
      </p>
    </>
  );
}
