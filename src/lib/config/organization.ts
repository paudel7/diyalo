/**
 * Organization and legal configuration.
 *
 * Every value here is an unconfirmed placeholder (see docs/decisions/decision-register.md,
 * D-01 to D-03). Do not replace "TBD" with a real value until the named decision is
 * Confirmed, and never use these values to make a legal or tax-receipt claim.
 */
export const organization = {
  brandName: "DIYALO",
  tagline: "Lighting the Path to a Brighter Future.",
  legalReceivingEntity: "TBD",
  nepalPartner: "TBD",
  canadianCharityPartner: "TBD",
  taxReceiptsOffered: false,
} as const;

/**
 * Accounting base currency. Owner decision 2026-11-03 (D-11): USD, convertible to NPR.
 * Pending receiving-entity accountant confirmation. Keep as configuration, not a literal
 * scattered through the code.
 */
export const baseCurrency = "USD" as const;

/** Currencies under consideration (D-13). Not yet enabled for payment anywhere. */
export const targetCurrencies = ["CAD", "USD", "EUR", "NPR"] as const;
