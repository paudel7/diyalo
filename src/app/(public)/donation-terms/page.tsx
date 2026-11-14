import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Donation terms" };

export default function Page() {
  return (
    <PolicyPage
      title="Donation terms"
      lead="What a gift pays for, what fees apply, and what happens if a target is passed or not reached."
      owner="the founder and the receiving entity's advisers"
      decisionRef="D-03, S-02"
      mustCover={[
        "Purpose and restriction: what each type of gift can be spent on",
        "Fees and who pays them",
        "Surplus and shortfall on a case, and what happens if a need changes or the family is no longer eligible",
        "Refunds and disputes",
        "What acknowledgment a donor receives",
      ]}
    />
  );
}
