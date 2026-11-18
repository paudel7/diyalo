"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ActionState } from "./action-form";

/** A button that runs a server action with no fields and shows its result. */
export function SimpleAction({
  action,
  label,
  variant = "outline",
}: {
  action: (prev: ActionState) => Promise<ActionState>;
  label: string;
  variant?: "outline" | "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      {state.recoveryCodes && (
        <ul className="grid grid-cols-2 gap-x-6 rounded-lg bg-snow p-3 font-mono text-lg">
          {state.recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
      <Button type="submit" variant={variant} disabled={pending}>
        {pending ? "Please wait…" : label}
      </Button>
    </form>
  );
}
