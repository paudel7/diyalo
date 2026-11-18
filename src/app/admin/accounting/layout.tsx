import type { ReactNode } from "react";
import { SectionGuard } from "@/server/auth/section-guard";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SectionGuard anyOf={["journal.prepare", "journal.post"]} path="/admin/accounting">
      {children}
    </SectionGuard>
  );
}
