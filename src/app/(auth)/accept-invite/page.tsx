import { ActionForm } from "@/components/auth/action-form";
import { acceptInviteAction } from "@/server/auth/actions";

export const metadata = { title: "Accept your invitation" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-2 text-3xl">Welcome to DIYALO</h1>
      <p className="mb-6 text-lg text-slate">
        Choose a password to finish setting up your staff account.
      </p>
      <ActionForm
        action={acceptInviteAction}
        submitLabel="Save password"
        hidden={{ token: token ?? "" }}
        fields={[
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "new-password",
            hint: "At least 12 characters.",
          },
        ]}
      />
    </>
  );
}
