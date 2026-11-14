import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PrototypeBanner } from "@/components/layout/prototype-banner";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | DIYALO Admin" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <PrototypeBanner area="admin" />
      <AdminShell>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </AdminShell>
    </>
  );
}
