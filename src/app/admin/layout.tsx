import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PrototypeBanner } from "@/components/layout/prototype-banner";
import { adminNav } from "@/lib/navigation";
import { hasPermission, ROLES } from "@/lib/permissions";
import { signOutAction } from "@/server/auth/actions";
import { requireActor } from "@/server/auth/web";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | DIYALO Admin" },
  robots: { index: false, follow: false },
};

// Every admin request is personal and must never be cached or prerendered.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const actor = await requireActor();
  const nav = adminNav.filter(
    (i) => !i.anyOf || i.anyOf.some((p) => hasPermission(actor.roles, p)),
  );
  const roleNames = ROLES.filter((r) => actor.roles.includes(r.code)).map((r) => r.name);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <PrototypeBanner area="admin" />
      <AdminShell
        nav={nav}
        userName={actor.displayName}
        roleNames={roleNames}
        signOutAction={signOutAction}
      >
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </AdminShell>
    </>
  );
}
