import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return (
    <ModulePage
      title="Reports"
      purpose="Finance, case and donor reports, with exports limited by role."
      builtIn="Stage 7"
      willList={[
        "Funds received and disbursed by program",
        "Fund balances and restricted-fund compliance",
        "Case pipeline and approval times",
        "Reconciliation exceptions",
      ]}
      controls="Every report figure reconciles to the ledger. Exports hide sensitive fields for roles that should not see them."
    />
  );
}
