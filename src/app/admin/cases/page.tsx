import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Cases" };

export default function Page() {
  return (
    <ModulePage
      title="Cases"
      purpose="Approved cases: their budgets, consent, updates and publication state."
      builtIn="Stage 3"
      willList={[
        "Case status, from approved to published or closed",
        "Budget lines and funding progress",
        "Consent records for publication, images and updates",
        "Privacy review before anything is published",
      ]}
      controls="A case is published only after approval, consent and a privacy review, checked on the server."
    />
  );
}
