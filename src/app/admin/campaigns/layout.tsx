import type { ReactNode } from "react";
import { SectionGuard } from "@/server/auth/section-guard";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SectionGuard anyOf={["settings.manage"]} path="/admin/campaigns">
      {children}
    </SectionGuard>
  );
}
