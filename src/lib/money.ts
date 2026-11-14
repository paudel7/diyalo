/**
 * Display-only money helpers for Stage 1 mock data.
 *
 * Amounts are integers in minor units (cents, paisa) plus an ISO 4217 code, never floats.
 * This is a presentation helper, not the Stage 2 money model, and it implies nothing about
 * which currencies are enabled for payment (decision D-13 is open).
 */
export type CurrencyCode = "USD" | "CAD" | "EUR" | "NPR";

export interface Money {
  /** Integer amount in minor units (2 decimal places for all four currencies above). */
  minor: number;
  currency: CurrencyCode;
}

/** Converts integer minor units to an exact decimal string, without floating point maths. */
export function minorToDecimalString(minor: number): string {
  if (!Number.isInteger(minor)) {
    throw new Error("Money must be an integer number of minor units.");
  }
  const negative = minor < 0;
  const digits = Math.abs(minor).toString().padStart(3, "0");
  const whole = digits.slice(0, -2);
  const fraction = digits.slice(-2);
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/** Formats money for display, for example "$1,250" or "$1,250.50". */
export function formatMoney({ minor, currency }: Money, locale = "en"): string {
  const decimal = minorToDecimalString(minor);
  const wholeAmount = decimal.endsWith(".00");
  // Intl.NumberFormat accepts exact decimal strings, so no float conversion happens.
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: wholeAmount ? 0 : 2,
    maximumFractionDigits: wholeAmount ? 0 : 2,
  }).format(decimal as unknown as number);
}

/** Whole-number percentage of target reached, clamped to 0 to 100, using integer maths only. */
export function percentOf(raisedMinor: number, targetMinor: number): number {
  if (targetMinor <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor((raisedMinor * 100) / targetMinor)));
}
