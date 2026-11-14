import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Accounting" };

export default function Page() {
  return (
    <ModulePage
      title="Accounting"
      purpose="The ledger: journal entries, reconciliation and exchange rates. Base currency is USD, convertible to NPR."
      builtIn="Stage 6"
      willList={[
        "Journal entries that always balance",
        "Bank and payment provider reconciliation",
        "Exchange rate source, rate and date for each conversion",
        "Period close and adjustments",
      ]}
      controls="Posted entries are never edited. Corrections are new entries that reference the original. The accounting policy still needs the accountant's confirmation."
    />
  );
}
