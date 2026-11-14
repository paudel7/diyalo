import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Governance" };

export default function Page() {
  return (
    <PolicyPage
      title="Governance"
      lead="Who is accountable for DIYALO's decisions and how those decisions are controlled."
      owner="the board or founder"
      decisionRef="D-01, D-06"
      mustCover={[
        "The legal receiving entity and who oversees it",
        "Who can approve cases, allocations and payments, and up to what limits",
        "How conflicts of interest are handled",
        "How records are kept and reported",
      ]}
    />
  );
}
