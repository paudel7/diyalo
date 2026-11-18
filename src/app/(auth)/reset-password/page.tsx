import { ActionForm } from "@/components/auth/action-form";
import { resetPasswordAction } from "@/server/auth/actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-2 text-3xl">Choose a new password</h1>
      <p className="mb-6 text-lg text-slate">
        At least 12 characters. A short sentence works well.
      </p>
      <ActionForm
        action={resetPasswordAction}
        submitLabel="Save password"
        hidden={{ token: token ?? "" }}
        fields={[
          {
            name: "password",
            label: "New password",
            type: "password",
            autoComplete: "new-password",
          },
        ]}
      />
    </>
  );
}
