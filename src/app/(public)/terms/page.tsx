import type { Metadata } from "next";
import { PolicyPage } from "@/components/public/policy-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <PolicyPage
      title="Terms of use"
      lead="The rules for using the DIYALO website."
      owner="the founder and a legal adviser"
      decisionRef="D-01"
      mustCover={[
        "Who operates the website",
        "Acceptable use of the site and of case content",
        "Limits on liability",
        "Which laws apply",
      ]}
    />
  );
}
