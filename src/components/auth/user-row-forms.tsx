"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ActionState } from "./action-form";

interface RoleOption {
  code: string;
  name: string;
}

/** Per-user controls: grant a role, remove a role, deactivate. The server re-checks everything. */
export function UserRowForms({
  action,
  userId,
  roles,
  allRoles,
  canDeactivate,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  userId: string;
  roles: RoleOption[];
  allRoles: RoleOption[];
  canDeactivate: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const available = allRoles.filter((r) => !roles.some((x) => x.code === r.code));
  return (
    <div className="space-y-3">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="intent" value="grant" />
        <label className="text-sm font-semibold">
          Add role
          <select
            name="role"
            className="mt-1 block min-h-10 rounded-lg border-2 border-slate bg-paper px-2"
            required
          >
            <option value="">Choose…</option>
            {available.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <Button size="sm" type="submit" disabled={pending}>
          Grant
        </Button>
      </form>
      {roles.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <li key={r.code}>
              <form action={formAction}>
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="intent" value="revoke" />
                <input type="hidden" name="role" value={r.code} />
                <Button
                  size="sm"
                  variant="outline"
                  type="submit"
                  disabled={pending}
                  aria-label={`Remove role ${r.name}`}
                >
                  Remove {r.name}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {canDeactivate && (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="intent" value="deactivate" />
          <label className="text-sm font-semibold">
            Reason to deactivate
            <input
              name="reason"
              required
              minLength={3}
              maxLength={500}
              className="mt-1 block min-h-10 rounded-lg border-2 border-slate bg-paper px-2"
            />
          </label>
          <Button size="sm" variant="danger" type="submit" disabled={pending}>
            Deactivate
          </Button>
        </form>
      )}
    </div>
  );
}
