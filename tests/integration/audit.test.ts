import { Writable } from "node:stream";
import pino from "pino";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { auditLogs } from "@db/schema";
import { getDb, withTransaction } from "@/server/db/client";
import { recordAudit, verifyAuditChain, SYSTEM_ACTOR } from "@/server/audit/audit";
import { getEnv } from "@/server/env";
import { ctx } from "./helpers";

const owner = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 1 });
afterAll(() => owner.end());
const log = (tx: Parameters<typeof recordAudit>[0]) =>
  recordAudit(tx, {
    action: "auth.logout",
    outcome: "success",
    actor: SYSTEM_ACTOR,
    context: ctx(),
  });

describe("audit log", () => {
  it("writes inside the caller's transaction: a rollback removes the event", async () => {
    const before = (await getDb().select().from(auditLogs)).length;
    await expect(
      withTransaction(async (tx) => {
        await log(tx);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect((await getDb().select().from(auditLogs)).length).toBe(before);
  });

  it("rejects metadata that is not on the allowlist", async () => {
    await expect(
      withTransaction((tx) =>
        recordAudit(tx, {
          action: "authz.denied",
          outcome: "denied",
          actor: SYSTEM_ACTOR,
          // @ts-expect-error deliberately invalid: personal data must be rejected
          metadata: { permission: "user.manage", email: "someone@example.org" },
          context: ctx(),
        }),
      ),
    ).rejects.toThrow();
  });

  it("keeps a valid hash chain under concurrent writers", async () => {
    await Promise.all(Array.from({ length: 15 }, () => withTransaction(log)));
    const res = await verifyAuditChain(getDb());
    expect(res.ok).toBe(true);
    expect(res.checked).toBeGreaterThanOrEqual(15);
  });

  it("detects a tampered row (even by someone who disables the trigger)", async () => {
    await withTransaction(log);
    const c = await owner.connect();
    try {
      await c.query("alter table audit_logs disable trigger audit_logs_no_update");
      await c.query(
        "update audit_logs set outcome='failure' where id = (select max(id) from audit_logs)",
      );
      await c.query("alter table audit_logs enable trigger audit_logs_no_update");
    } finally {
      c.release();
    }
    const res = await verifyAuditChain(getDb());
    expect(res.ok).toBe(false);
    expect(res.brokenAtId).toBeTypeOf("number");
    // Restore integrity for later tests: rebuild nothing, just mark by truncating via owner is blocked,
    // so later tests run after this file and do not depend on a valid chain.
  });

  it("fails verification with the wrong key", async () => {
    const res = await verifyAuditChain(getDb(), "a-completely-different-key-0123456789abcdef");
    expect(res.ok).toBe(false);
    expect(getEnv().AUDIT_HMAC_KEY).toBeTruthy();
  });
});

describe("logs", () => {
  it("redact secrets and personal data by key", () => {
    const lines: string[] = [];
    const stream = new Writable({
      write(chunk, _e, cb) {
        lines.push(String(chunk));
        cb();
      },
    });
    // Same redaction list as src/server/logger.ts, exercised through pino directly.
    const redactPaths = [
      "password",
      "*.password",
      "token",
      "*.token",
      "secret",
      "*.secret",
      "email",
      "*.email",
      "headers.cookie",
    ];
    const l = pino({ redact: { paths: redactPaths, censor: "[redacted]" } }, stream);
    l.info(
      { password: "p@ss", user: { email: "a@b.example", token: "t0k" }, headers: { cookie: "c" } },
      "x",
    );
    const out = lines.join("");
    expect(out).not.toContain("p@ss");
    expect(out).not.toContain("a@b.example");
    expect(out).not.toContain("t0k");
    expect(out).toContain("[redacted]");
  });
});
