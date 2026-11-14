import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <ModulePage
      title="Settings"
      purpose="Users, roles, reference data and system configuration."
      builtIn="Stage 2"
      willList={[
        "Users, roles and deactivation",
        "Approval limits and signatories",
        "Enabled currencies and the base currency",
        "Audit log search",
      ]}
      controls="Privileged changes need multi-factor sign-in and are written to the audit log."
    />
  );
}
