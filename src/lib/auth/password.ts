import { hash, verify } from "@node-rs/argon2";

/** Argon2id (algorithm 2), 19 MiB, 2 passes, 1 lane: OWASP minimum profile. */
const OPTIONS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

/** Small deny list of the most common passwords. Not a substitute for length. */
const COMMON = new Set(
  [
    "password1234",
    "123456789012",
    "qwertyuiop12",
    "letmein12345",
    "welcome12345",
    "administrator",
    "passwordpassword",
    "iloveyou1234",
    "changeme1234",
    "diyalo123456",
    "diyalodiyalo",
  ].map((s) => s.toLowerCase()),
);

export interface PasswordCheck {
  ok: boolean;
  problem?: string;
}

export function validatePasswordPolicy(
  password: string,
  context: { email?: string } = {},
): PasswordCheck {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, problem: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, problem: `Use at most ${MAX_PASSWORD_LENGTH} characters.` };
  }
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) {
    return {
      ok: false,
      problem: "That password is too common. Choose a longer, less predictable one.",
    };
  }
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) {
    return { ok: false, problem: "Do not include your email name in your password." };
  }
  return { ok: true };
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** A real hash to verify against when the account does not exist, so timing does not reveal it. */
let dummy: Promise<string> | undefined;
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword("not-a-real-account-password");
  return dummy;
}
