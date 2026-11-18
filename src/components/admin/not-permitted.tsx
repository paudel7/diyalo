import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export function NotPermitted() {
  return (
    <>
      <h1 className="mb-6 text-3xl sm:text-4xl">Access needed</h1>
      <Alert tone="warning" title="You do not have access to this area">
        Your role does not include it. If you need it, ask a super administrator. This attempt was
        recorded.
      </Alert>
    </>
  );
}

export function StepUpNeeded({ next }: { next: string }) {
  return (
    <>
      <h1 className="mb-6 text-3xl sm:text-4xl">Confirm it is you</h1>
      <Alert tone="info" title="Confirm your authenticator code again">
        This area needs a code from the last 10 minutes.{" "}
        <Link
          className="font-semibold underline"
          href={`/sign-in/verify?next=${encodeURIComponent(next)}`}
        >
          Enter a code
        </Link>
      </Alert>
    </>
  );
}
