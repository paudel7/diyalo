import { eq } from "drizzle-orm";
import { generateSync } from "otplib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authTokens, sessions, users, auditLogs } from "@db/schema";
import { decryptSecret } from "@/lib/auth/crypto";
import { mfaCredentials } from "@db/schema";
import { getDb } from "@/server/db/client";
import { setClockForTests } from "@/server/clock";
import { getEnv } from "@/server/env";
import {
  beginMfaEnrolment,
  confirmMfaEnrolment,
  signIn,
  signOut,
  verifyMfa,
} from "@/server/services/auth-service";
import {
  acceptInvite,
  completePasswordReset,
  changePassword,
  requestPasswordReset,
} from "@/server/services/password-service";
import { inviteUser, deactivateUser } from "@/server/services/user-service";
import {
  resolveSession,
  IDLE_PRIVILEGED_MS,
  IDLE_STANDARD_MS,
  ABSOLUTE_MS,
} from "@/server/services/session-service";
import {
  PASSWORD,
  actorFor,
  captureMail,
  createUser,
  ctx,
  login,
  noMfa,
  outbox,
  withMfa,
} from "./helpers";

beforeEach(() => captureMail());
afterEach(() => setClockForTests(undefined));

describe("sign-in", () => {
  it("returns the same result for unknown email, wrong password and deactivated user", async () => {
    const real = await createUser(["case_manager"]);
    const gone = await createUser([], { status: "deactivated", deactivatedAt: new Date() });
    const results = await Promise.all([
      signIn({ email: "nobody@diyalo.example", password: PASSWORD }, ctx(), noMfa),
      signIn({ email: real.email, password: "wrong password here" }, ctx(), noMfa),
      signIn({ email: gone.email, password: PASSWORD }, ctx(), noMfa),
    ]);
    for (const r of results) expect(r).toEqual({ ok: false, error: "invalid" });
  });

  it("locks after 5 failures, even for the right password, then recovers after the lock window", async () => {
    const u = await createUser(["case_manager"]);
    for (let i = 0; i < 5; i++)
      await signIn({ email: u.email, password: "bad password number " + i }, ctx(), noMfa);
    const [row] = await getDb().select().from(users).where(eq(users.id, u.id));
    expect(row?.lockedUntil).not.toBeNull();
    expect(await signIn({ email: u.email, password: PASSWORD }, ctx(), noMfa)).toEqual({
      ok: false,
      error: "invalid",
    });
    setClockForTests(() => new Date(Date.now() + 16 * 60 * 1000));
    expect((await signIn({ email: u.email, password: PASSWORD }, ctx(), noMfa)).ok).toBe(true);
  });

  it("rate-limits repeated failures from one network prefix", async () => {
    const c = ctx({ ipPrefix: "198.51.100.0/24" });
    for (let i = 0; i < 20; i++)
      await signIn({ email: `x${i}@diyalo.example`, password: "whatever password" }, c, noMfa);
    expect(
      await signIn({ email: "y@diyalo.example", password: "whatever password" }, c, noMfa),
    ).toEqual({ ok: false, error: "rate_limited" });
  });

  it("stores only a hash of the session token and revokes it on sign-out", async () => {
    const u = await createUser(["case_manager"]);
    const { token, actor } = await login(u.email);
    const rows = await getDb().select().from(sessions).where(eq(sessions.userId, u.id));
    expect(rows.every((r) => r.tokenHash !== token && r.tokenHash.length === 64)).toBe(true);
    await signOut(actor, ctx());
    expect(await resolveSession(getDb(), token, noMfa)).toBeNull();
  });

  it("applies idle and absolute expiry (shorter idle for privileged roles)", async () => {
    const priv = await createUser(["super_admin"]);
    const std = await createUser(["case_manager"]);
    const p = await login(priv.email);
    const s = await login(std.email);
    const t0 = Date.now();
    setClockForTests(() => new Date(t0 + IDLE_PRIVILEGED_MS + 1000));
    expect(await resolveSession(getDb(), p.token, noMfa)).toBeNull();
    expect(await resolveSession(getDb(), s.token, noMfa)).not.toBeNull();
    setClockForTests(undefined);
    const s2 = await login(std.email);
    setClockForTests(() => new Date(Date.now() + IDLE_STANDARD_MS + 1000));
    expect(await resolveSession(getDb(), s2.token, noMfa)).toBeNull();
    setClockForTests(undefined);
    // Keep a session alive by activity, then hit the absolute limit.
    const k = await login(std.email);
    const t1 = Date.now();
    for (let h = 1; h <= 14; h++) {
      setClockForTests(() => new Date(t1 + h * 50 * 60_000));
      expect(await resolveSession(getDb(), k.token, noMfa)).not.toBeNull();
    }
    setClockForTests(() => new Date(t1 + ABSOLUTE_MS + 1000));
    expect(await resolveSession(getDb(), k.token, noMfa)).toBeNull();
  });

  it("ends a deactivated user's sessions on the next request", async () => {
    const admin = await actorFor(["super_admin"]);
    const target = await createUser(["case_manager"]);
    const { token } = await login(target.email);
    expect(await resolveSession(getDb(), token, noMfa)).not.toBeNull();
    await deactivateUser(admin, target.id, "left the team", ctx(), { policy: noMfa });
    expect(await resolveSession(getDb(), token, noMfa)).toBeNull();
    expect((await signIn({ email: target.email, password: PASSWORD }, ctx(), noMfa)).ok).toBe(
      false,
    );
  });
});

describe("MFA", () => {
  async function enrol(email: string) {
    const first = await login(email, withMfa);
    expect(first.state).toBe("needs_mfa_enrol");
    const { secret } = await beginMfaEnrolment(first.actor);
    const res = await confirmMfaEnrolment(first.actor, generateSync({ secret }), ctx());
    if (!res.ok) throw new Error("enrol failed");
    return { secret, token: res.token, recoveryCodes: res.recoveryCodes ?? [] };
  }

  it("is required in enforced mode: password alone gives a restricted session", async () => {
    const u = await createUser(["case_manager"]);
    const r = await login(u.email, withMfa);
    expect(r.state).toBe("needs_mfa_enrol");
    const done = await enrol((await createUser(["case_manager"])).email);
    const resolved = await resolveSession(getDb(), done.token, withMfa);
    expect(resolved?.state).toBe("full");
    expect(done.recoveryCodes).toHaveLength(10);
  });

  it("encrypts the TOTP secret at rest", async () => {
    const u = await createUser(["case_manager"]);
    const { secret } = await enrol(u.email);
    const [cred] = await getDb()
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, u.id));
    expect(cred?.secretEncrypted).not.toContain(secret);
    expect(decryptSecret(cred!.secretEncrypted, getEnv().MFA_ENCRYPTION_KEY)).toBe(secret);
  });

  it("verifies a TOTP code at sign-in and blocks replay of the same code", async () => {
    const u = await createUser(["case_manager"]);
    const { secret } = await enrol(u.email);
    const second = await login(u.email, withMfa);
    expect(second.state).toBe("needs_mfa_verify");
    const code = generateSync({ secret });
    // The enrolment already consumed this time step, so the same code is a replay.
    expect(await verifyMfa(second.actor, code, ctx())).toMatchObject({ ok: false });
    // A code from the next step is accepted once.
    const future = generateSync({ secret, epoch: Math.floor(Date.now() / 1000) + 30 });
    const ok = await verifyMfa(second.actor, future, ctx());
    expect(ok.ok).toBe(true);
    const third = await login(u.email, withMfa);
    expect(await verifyMfa(third.actor, future, ctx())).toMatchObject({ ok: false });
  });

  it("accepts each recovery code once", async () => {
    const u = await createUser(["case_manager"]);
    const { recoveryCodes } = await enrol(u.email);
    const a = await login(u.email, withMfa);
    expect((await verifyMfa(a.actor, recoveryCodes[0]!, ctx())).ok).toBe(true);
    const b = await login(u.email, withMfa);
    expect((await verifyMfa(b.actor, recoveryCodes[0]!, ctx())).ok).toBe(false);
    expect((await verifyMfa(b.actor, recoveryCodes[1]!, ctx())).ok).toBe(true);
  });

  it("locks the account after repeated wrong codes and revokes its sessions", async () => {
    const u = await createUser(["case_manager"]);
    await enrol(u.email);
    const s = await login(u.email, withMfa);
    let last;
    for (let i = 0; i < 5; i++) last = await verifyMfa(s.actor, "000000", ctx());
    expect(last).toEqual({ ok: false, error: "locked" });
    expect(await resolveSession(getDb(), s.token, withMfa)).toBeNull();
  });

  it("rotates the session token when MFA completes", async () => {
    const u = await createUser(["case_manager"]);
    await enrol(u.email);
    const s = await login(u.email, withMfa);
    const { secret } = await getSecret(u.id);
    const res = await verifyMfa(
      s.actor,
      generateSync({ secret, epoch: Math.floor(Date.now() / 1000) + 30 }),
      ctx(),
    );
    expect(res.ok && res.token !== s.token).toBe(true);
    expect(await resolveSession(getDb(), s.token, withMfa)).toBeNull();
  });
});

async function getSecret(userId: string) {
  const [cred] = await getDb()
    .select()
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, userId));
  return { secret: decryptSecret(cred!.secretEncrypted, getEnv().MFA_ENCRYPTION_KEY) };
}

describe("passwords and tokens", () => {
  it("changing the password revokes other sessions and rotates the current one", async () => {
    const u = await createUser(["case_manager"]);
    const a = await login(u.email);
    const b = await login(u.email);
    const { token } = await changePassword(
      a.actor,
      { currentPassword: PASSWORD, newPassword: "another long passphrase 77" },
      ctx(),
    );
    expect(await resolveSession(getDb(), a.token, noMfa)).toBeNull();
    expect(await resolveSession(getDb(), b.token, noMfa)).toBeNull();
    expect(await resolveSession(getDb(), token, noMfa)).not.toBeNull();
    await expect(
      changePassword(
        a.actor,
        { currentPassword: "wrong wrong wrong 1", newPassword: "yet another passphrase 5" },
        ctx(),
      ),
    ).rejects.toThrow();
  });

  it("reset links work once, expire after 30 minutes, and do not reveal unknown emails", async () => {
    const u = await createUser(["case_manager"]);
    await requestPasswordReset("nobody@diyalo.example", ctx());
    expect(outbox).toHaveLength(0);
    await requestPasswordReset(u.email, ctx());
    expect(outbox).toHaveLength(1);
    const token = /token=([\w-]+)/.exec(outbox[0]!.text)![1]!;
    await completePasswordReset(token, "brand new long passphrase 11", ctx());
    await expect(
      completePasswordReset(token, "brand new long passphrase 12", ctx()),
    ).rejects.toThrow();
    expect(
      (await signIn({ email: u.email, password: "brand new long passphrase 11" }, ctx(), noMfa)).ok,
    ).toBe(true);

    await requestPasswordReset(u.email, ctx());
    const t2 = /token=([\w-]+)/.exec(outbox.at(-1)!.text)![1]!;
    setClockForTests(() => new Date(Date.now() + 31 * 60 * 1000));
    await expect(
      completePasswordReset(t2, "yet another long passphrase 13", ctx()),
    ).rejects.toThrow();
  });

  it("stores only token hashes", async () => {
    const u = await createUser();
    await requestPasswordReset(u.email, ctx());
    const token = /token=([\w-]+)/.exec(outbox.at(-1)!.text)![1]!;
    const rows = await getDb().select().from(authTokens).where(eq(authTokens.userId, u.id));
    expect(rows.some((r) => r.tokenHash === token)).toBe(false);
  });

  it("invites are single use and set the first password", async () => {
    const admin = await actorFor(["super_admin"]);
    const email = `invitee-${Date.now()}@diyalo.example`;
    const { userId } = await inviteUser(
      admin,
      { email, displayName: "New Person", roles: ["case_manager"] },
      ctx(),
      { policy: noMfa },
    );
    const token = /token=([\w-]+)/.exec(outbox.at(-1)!.text)![1]!;
    expect((await signIn({ email, password: "whatever long password 1" }, ctx(), noMfa)).ok).toBe(
      false,
    ); // not active yet
    await acceptInvite(token, "a first long passphrase 21", ctx());
    await expect(acceptInvite(token, "a first long passphrase 22", ctx())).rejects.toThrow();
    expect((await signIn({ email, password: "a first long passphrase 21" }, ctx(), noMfa)).ok).toBe(
      true,
    );
    const [u] = await getDb().select().from(users).where(eq(users.id, userId));
    expect(u?.status).toBe("active");
  });

  it("never writes passwords, tokens or emails into the audit log", async () => {
    const rows = await getDb().select().from(auditLogs);
    const blob = JSON.stringify(rows);
    expect(blob).not.toContain(PASSWORD);
    expect(blob).not.toMatch(/@diyalo\.example/);
    expect(blob).not.toMatch(/token=/);
  });
});
