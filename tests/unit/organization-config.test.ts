import { describe, expect, it } from "vitest";
import { baseCurrency, organization, targetCurrencies } from "@/lib/config/organization";

describe("organization placeholders (Stage 0 gate)", () => {
  it("does not state any legal entity or partner as fact", () => {
    expect(organization.legalReceivingEntity).toBe("TBD");
    expect(organization.nepalPartner).toBe("TBD");
    expect(organization.canadianCharityPartner).toBe("TBD");
  });

  it("does not offer tax receipts", () => {
    expect(organization.taxReceiptsOffered).toBe(false);
  });

  it("uses USD as the base currency, with NPR among the target currencies", () => {
    expect(baseCurrency).toBe("USD");
    expect(targetCurrencies).toContain("NPR");
  });
});
