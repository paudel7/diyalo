"use client";

import { useActionState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export interface ActionState {
  error?: string;
  message?: string;
  recoveryCodes?: string[];
}

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  hint?: string;
  inputMode?: "numeric" | "text";
  required?: boolean;
}

/** One small client form for every auth screen: server action in, field errors out. */
export function ActionForm({
  action,
  fields,
  submitLabel,
  hidden,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldDef[];
  submitLabel: string;
  hidden?: Record<string, string>;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      {fields.map((f) => (
        <TextField
          key={f.name}
          name={f.name}
          label={f.label}
          hint={f.hint}
          type={f.type ?? "text"}
          autoComplete={f.autoComplete}
          inputMode={f.inputMode}
          required={f.required ?? true}
        />
      ))}
      {children}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : submitLabel}
      </Button>
    </form>
  );
}
