import { describe, expect, it } from "vitest";
import { formatMoney, minorToDecimalString, percentOf } from "@/lib/money";

describe("minorToDecimalString", () => {
  it("converts integer minor units without floating point", () => {
    expect(minorToDecimalString(0)).toBe("0.00");
    expect(minorToDecimalString(5)).toBe("0.05");
    expect(minorToDecimalString(100)).toBe("1.00");
    expect(minorToDecimalString(123456)).toBe("1234.56");
    expect(minorToDecimalString(-250)).toBe("-2.50");
  });

  it("rejects non-integer amounts", () => {
    expect(() => minorToDecimalString(10.5)).toThrow();
  });
});

describe("formatMoney", () => {
  it("shows whole amounts without decimals and others with two", () => {
    expect(formatMoney({ minor: 64000, currency: "USD" })).toBe("$640");
    expect(formatMoney({ minor: 64050, currency: "USD" })).toBe("$640.50");
  });

  it("adds thousands separators", () => {
    expect(formatMoney({ minor: 123456700, currency: "USD" })).toBe("$1,234,567");
  });
});

describe("percentOf", () => {
  it("uses whole numbers and clamps to 0..100", () => {
    expect(percentOf(41000, 64000)).toBe(64);
    expect(percentOf(100, 0)).toBe(0);
    expect(percentOf(200, 100)).toBe(100);
    expect(percentOf(-5, 100)).toBe(0);
  });
});
