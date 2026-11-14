import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Partners" };

export default function Page() {
  return (
    <PolicyPage
      title="Partners"
      lead="The organizations DIYALO works with in Nepal and elsewhere."
      owner="the founder and the partner's legal adviser"
      decisionRef="D-01, D-02"
      mustCover={[
        "Which Nepal partner DIYALO works with, once an agreement is signed",
        "What the partner does and what DIYALO does",
        "Approvals the partner holds to receive support from abroad",
      ]}
    />
  );
}
