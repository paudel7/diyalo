import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/admin-page";

export const metadata: Metadata = { title: "Donations" };

export default function Page() {
  return (
    <ModulePage
      title="Donations"
      purpose="Gifts received, their payment status and the fund each belongs to."
      builtIn="Stage 5"
      willList={[
        "Donation, payment status and campaign",
        "Donor record and anonymity choice",
        "Refunds, disputes and failed payments",
        "Payment provider reference for reconciliation",
      ]}
      controls="A payment is confirmed only by a signed message from the payment provider, never by a browser redirect."
    />
  );
}
