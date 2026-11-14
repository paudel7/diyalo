import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return (
    <ModulePage
      title="Campaigns"
      purpose="Fundraising pages: case-specific, general, program-restricted and sponsorship."
      builtIn="Stage 4"
      willList={[
        "Campaign type, target and status",
        "Which fund each campaign gives to",
        "Public wording and the donation terms attached",
        "Who approved publication and when",
      ]}
    />
  );
}
