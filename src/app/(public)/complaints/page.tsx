import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Complaints" };

export default function Page() {
  return (
    <PolicyPage
      title="Complaints"
      lead="How to raise a concern about DIYALO and what happens next."
      owner="the safeguarding lead"
      decisionRef="D-08"
      mustCover={[
        "Who to contact and how",
        "How a complaint is recorded and who reviews it",
        "How long each stage should take",
        "How to raise a safeguarding concern urgently",
      ]}
    />
  );
}
