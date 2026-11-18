import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dismissRecoveryAction } from "@/server/auth/actions";
import { currentSession, readRecoveryFlash } from "@/server/auth/web";

export const metadata = { title: "Save your recovery codes" };
export const dynamic = "force-dynamic";

export default async function RecoveryPage() {
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const codes = await readRecoveryFlash();
  if (!codes || codes.length === 0) redirect("/admin");
  return (
    <>
      <h1 className="mb-2 text-3xl">Multi-factor sign-in is on</h1>
      <Alert tone="warning" title="Save these recovery codes now">
        Each code works once if you lose your authenticator. They are shown only here and cannot be
        shown again.
      </Alert>
      <ul className="my-6 grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-snow p-4 font-mono text-lg">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <form action={dismissRecoveryAction}>
        <Button type="submit" className="w-full">
          I have saved them. Continue
        </Button>
      </form>
    </>
  );
}
