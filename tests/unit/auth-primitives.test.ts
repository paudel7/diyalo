import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, generateToken, sha256Hex } from "@/lib/auth/crypto";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/lib/auth/password";
import { newTotpSecret, verifyTotp } from "@/lib/auth/totp";
import { generateSync } from "otplib";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { ipToPrefix } from "@/server/context";

describe("passwords", () => {
  it("enforces the policy", () => {
    expect(validatePasswordPolicy("short").ok).toBe(false);
    expect(validatePasswordPolicy("aaaaaaaaaaaaaaaa").ok).toBe(false);
    expect(validatePasswordPolicy("password1234").ok).toBe(false);
    expect(
      validatePasswordPolicy("kiranpaudel-is-great", { email: "kiranpaudel@x.example" }).ok,
    ).toBe(false);
    expect(validatePasswordPolicy("a long, unusual passphrase 91").ok).toBe(true);
  });
  it("hashes with Argon2id and verifies", async () => {
    const h = await hashPassword("a long, unusual passphrase 91");
    expect(h.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(h, "a long, unusual passphrase 91")).toBe(true);
    expect(await verifyPassword(h, "wrong")).toBe(false);
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
  });
});

describe("crypto", () => {
  const key = Buffer.alloc(32, 3).toString("base64");
  it("round-trips AES-256-GCM and detects tampering", () => {
    const enc = encryptSecret("JBSWY3DPEHPK3PXP", key);
    expect(enc).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decryptSecret(enc, key)).toBe("JBSWY3DPEHPK3PXP");
    const parts = enc.split(".");
    parts[2] = Buffer.from("tampered").toString("base64");
    expect(() => decryptSecret(parts.join("."), key)).toThrow();
  });
  it("makes unique 256-bit tokens", () => {
    const a = generateToken();
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(a).not.toBe(generateToken());
    expect(sha256Hex(a)).toHaveLength(64);
  });
});

describe("totp", () => {
  it("accepts a current code and rejects others", () => {
    const secret = newTotpSecret();
    const token = generateSync({ secret });
    const ok = verifyTotp(secret, token);
    expect(ok.valid).toBe(true);
    expect(typeof ok.step).toBe("number");
    expect(verifyTotp(secret, "12345").valid).toBe(false);
    expect(verifyTotp(secret, "abcdef").valid).toBe(false);
  });
});

describe("audit metadata allowlist", () => {
  it("rejects personal data, free text and unknown keys", () => {
    const denied = AUDIT_ACTIONS["authz.denied"];
    expect(denied.safeParse({ permission: "user.manage" }).success).toBe(true);
    expect(denied.safeParse({ permission: "someone@example.org" }).success).toBe(false);
    expect(denied.safeParse({ permission: "a name with spaces" }).success).toBe(false);
    expect(denied.safeParse({ permission: "user.manage", email: "x" }).success).toBe(false);
    expect(
      AUDIT_ACTIONS["auth.login_failed"].safeParse({ reason: "bad_password", password: "x" })
        .success,
    ).toBe(false);
  });
});

describe("request context", () => {
  it("keeps only an IP prefix", () => {
    expect(ipToPrefix("203.0.113.77")).toBe("203.0.113.0/24");
    expect(ipToPrefix("2001:db8:abcd:1234::1")).toBe("2001:db8:abcd::/48");
    expect(ipToPrefix(null)).toBeNull();
  });
});
