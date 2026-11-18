import { generateSecret, generateURI, verifySync } from "otplib";

export const TOTP_ISSUER = "DIYALO";
const PERIOD = 30;

export function newTotpSecret(): string {
  return generateSecret();
}

export function totpUri(secret: string, accountLabel: string): string {
  return generateURI({ issuer: TOTP_ISSUER, label: accountLabel, secret });
}

export interface TotpResult {
  valid: boolean;
  /** Time step that matched, used to block replay of the same code. */
  step?: number;
}

/** Accepts the current code and one step either side. */
export function verifyTotp(secret: string, token: string): TotpResult {
  if (!/^\d{6}$/.test(token)) return { valid: false };
  const result = verifySync({ secret, token, epochTolerance: PERIOD });
  if (!result.valid) return { valid: false };
  // Matched step = current step plus the drift the library reports.
  return { valid: true, step: Math.floor(Date.now() / 1000 / PERIOD) + result.delta };
}
