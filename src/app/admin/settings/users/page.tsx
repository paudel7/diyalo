import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { NotPermitted, StepUpNeeded } from "@/components/admin/not-permitted";
import { ActionForm } from "@/components/auth/action-form";
import { UserRowForms } from "@/components/auth/user-row-forms";
import { StatusBadge } from "@/components/ui/badge";
import { ROLES } from "@/lib/permissions";
import { inviteUserAction, userChangeAction } from "@/server/auth/actions";
import { gate, requestContext } from "@/server/auth/web";
import { listUsers } from "@/server/services/user-service";

export const metadata: Metadata = { title: "Users and roles" };

export default async function UsersPage() {
  const g = await gate("user.manage", "/admin/settings/users");
  if (!g.ok)
    return g.reason === "step_up" ? (
      <StepUpNeeded next="/admin/settings/users" />
    ) : (
      <NotPermitted />
    );
  const users = await listUsers(g.actor, await requestContext());
  const allRoles = ROLES.map((r) => ({ code: r.code, name: r.name }));
  const roleName = (code: string) => ROLES.find((r) => r.code === code)?.name ?? code;
  return (
    <>
      <AdminPageHeader
        title="Users and roles"
        lead="Staff are invited, never self-registered. Role changes sign the person out everywhere. Finance officer and Finance approver cannot be held together."
      />
      <section
        aria-labelledby="invite"
        className="mb-10 max-w-xl rounded-xl border border-mist bg-paper p-5"
      >
        <h2 id="invite" className="mb-4 text-xl">
          Invite a staff member
        </h2>
        <ActionForm
          action={inviteUserAction}
          submitLabel="Send invitation"
          fields={[
            { name: "displayName", label: "Name", autoComplete: "off" },
            { name: "email", label: "Email", type: "email", autoComplete: "off" },
          ]}
        >
          <fieldset>
            <legend className="mb-1.5 font-semibold">
              Roles <span className="font-normal text-slate">(optional)</span>
            </legend>
            {allRoles.map((r) => (
              <label key={r.code} className="mb-1 flex items-center gap-2 text-base">
                <input type="checkbox" name="roles" value={r.code} className="h-5 w-5" />
                {r.name}
              </label>
            ))}
          </fieldset>
        </ActionForm>
      </section>
      <h2 className="mb-4 text-xl">Staff accounts ({users.length})</h2>
      <ul className="space-y-4">
        {users.map((u) => (
          <li key={u.id} className="rounded-xl border border-mist bg-paper p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="text-lg">{u.displayName}</h3>
              <StatusBadge
                tone={
                  u.status === "active" ? "success" : u.status === "invited" ? "info" : "neutral"
                }
              >
                {u.status}
              </StatusBadge>
              <span className="text-slate">{u.email}</span>
            </div>
            <p className="mb-3 text-base">
              Roles: {u.roles.length ? u.roles.map(roleName).join(", ") : "none"}
              {u.lastLoginAt
                ? ` · last sign-in ${u.lastLoginAt.toISOString().slice(0, 16).replace("T", " ")} UTC`
                : ""}
            </p>
            {u.status !== "deactivated" && u.id !== g.actor.userId && (
              <UserRowForms
                action={userChangeAction}
                userId={u.id}
                roles={u.roles.map((c) => ({ code: c, name: roleName(c) }))}
                allRoles={allRoles}
                canDeactivate
              />
            )}
            {u.id === g.actor.userId && (
              <p className="text-slate">This is you. You cannot change your own roles.</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
