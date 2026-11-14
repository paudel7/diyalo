import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Funds" };

export default function Page() {
  return (
    <ModulePage
      title="Funds"
      purpose="Restricted and unrestricted funds, their balances and what has been allocated."
      builtIn="Stage 6"
      willList={[
        "Fund type and restriction",
        "Raised, settled, allocated, disbursed and available balances",
        "Allocations to cases and program needs",
        "Budgets and the variance against them",
      ]}
      controls="A restricted fund is never reclassified or reallocated without documented authority and approval."
    />
  );
}
