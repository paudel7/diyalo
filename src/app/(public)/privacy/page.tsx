import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <PolicyPage
      title="Privacy"
      lead="What personal information DIYALO collects, why, and how long it is kept."
      owner="the privacy lead"
      decisionRef="D-08"
      mustCover={[
        "What is collected from donors, applicants and website visitors",
        "Why it is collected and who can see it",
        "How long it is kept and how it is deleted or anonymized",
        "How to ask for your information or ask for it to be corrected",
      ]}
    />
  );
}
