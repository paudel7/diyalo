import "server-only";
import { z } from "zod";

const schema = z.object({
  APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_BASE_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  /** 32 random bytes, base64. Encrypts TOTP secrets at rest. */
  MFA_ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, "must be 32 bytes, base64"),
  /** At least 32 characters. Keys the audit hash chain. */
  AUDIT_HMAC_KEY: z.string().min(32),
});

export type Env = z.infer<typeof schema>;
let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      // Report variable names only, never values.
      const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Invalid or missing environment variables: ${names}`);
    }
    cached = parsed.data;
  }
  return cached;
}

export function resetEnvCacheForTests() {
  cached = undefined;
}

export const MFA_REQUIRED_ENVS = ["staging", "production"] as const;
export function isMfaEnforced(env: Env = getEnv()): boolean {
  return (MFA_REQUIRED_ENVS as readonly string[]).includes(env.APP_ENV);
}
