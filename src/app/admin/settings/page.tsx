import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { NotPermitted } from "@/components/admin/not-permitted";
import { hasPermission } from "@/lib/permissions";
import { requireActor } from "@/server/auth/web";

export const metadata: Metadata = { title: "Settings" };

const items = [
  {
    href: "/admin/settings/users",
    label: "Users and roles",
    perm: "user.manage" as const,
    text: "Invite staff, grant or remove roles, deactivate accounts.",
  },
  {
    href: "/admin/settings/audit",
    label: "Audit log",
    perm: "audit.read" as const,
    text: "Who did what, and when. Includes denied attempts.",
  },
];

export default async function Page() {
  const actor = await requireActor("/admin/settings");
  const visible = items.filter((i) => hasPermission(actor.roles, i.perm));
  if (visible.length === 0) return <NotPermitted />;
  return (
    <>
      <AdminPageHeader
        title="Settings"
        lead="Privileged changes need a recent authenticator code and are written to the audit log."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {visible.map((i) => (
          <li key={i.href} className="rounded-xl border border-mist bg-paper p-5">
            <h2 className="text-xl">
              <Link href={i.href} className="underline underline-offset-4">
                {i.label}
              </Link>
            </h2>
            <p className="mt-1 text-slate">{i.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
