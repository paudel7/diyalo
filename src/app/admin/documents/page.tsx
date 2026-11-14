import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Documents" };

export default function Page() {
  return (
    <ModulePage
      title="Documents"
      purpose="Evidence and receipts attached to applications, cases and payments."
      builtIn="Stage 3"
      willList={[
        "Uploaded evidence and who has opened it",
        "Payment receipts and invoices",
        "Retention date and legal hold flags",
        "Virus scan result for each upload",
      ]}
      controls="Documents are private. They open through short-lived links and every view is logged."
    />
  );
}
