import type { ReactNode } from "react";
import { SectionGuard } from "@/server/auth/section-guard";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SectionGuard anyOf={["application.read"]} path="/admin/applications">
      {children}
    </SectionGuard>
  );
}
