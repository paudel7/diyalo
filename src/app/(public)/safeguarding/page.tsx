import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Child safeguarding" };

export default function Page() {
  return (
    <PolicyPage
      title="Child safeguarding"
      lead="How DIYALO protects the children it supports."
      owner="the safeguarding lead"
      decisionRef="D-08"
      mustCover={[
        "What is never published: full names, exact addresses, contacts, school details, identity documents, medical details",
        "No direct contact between donors and children",
        "How guardian consent is asked for, recorded and withdrawn",
        "How a concern is raised and who handles it",
      ]}
    />
  );
}
