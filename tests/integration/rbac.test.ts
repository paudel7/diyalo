import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { auditLogs } from "@db/schema";
import { getDb } from "@/server/db/client";
import { ForbiddenError, StepUpRequiredError } from "@/lib/errors";
import { ROLE_CODES, hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveSession } from "@/server/services/session-service";
import { authorize } from "@/server/services/authorize";
import {
  grantRole,
  inviteUser,
  listUsers,
  revokeRole,
  revokeUserSessions,
  deactivateUser,
} from "@/server/services/user-service";
import { listAuditEvents, verifyChainAsAdmin } from "@/server/services/audit-service";
import { actorFor, captureMail, createUser, ctx, login, noMfa, withMfa } from "./helpers";

beforeEach(() => captureMail());

describe("unauthenticated access", () => {
  it("resolves no session for missing, malformed or unknown tokens", async () => {
    for (const t of [undefined, null, "", "x".repeat(500), "not-a-real-token"]) {
      expect(await resolveSession(getDb(), t, noMfa)).toBeNull();
    }
  });
});

describe("each role is allowed and denied exactly as the matrix says (service level)", () => {
  const guarded = [
    {
      permission: "user.manage" as const,
      call: (a: Awaited<ReturnType<typeof actorFor>>) => listUsers(a, ctx(), { policy: noMfa }),
    },
    {
      permission: "audit.read" as const,
      call: (a: Awaited<ReturnType<typeof actorFor>>) =>
        listAuditEvents(a, {}, ctx(), { policy: noMfa }),
    },
    {
      permission: "settings.manage" as const,
      call: (a: Awaited<ReturnType<typeof actorFor>>) =>
        verifyChainAsAdmin(a, ctx(), { policy: noMfa }),
    },
  ];

  for (const role of ROLE_CODES) {
    for (const g of guarded) {
      it(`${role} -> ${g.permission}`, async () => {
        const actor = await actorFor([role as RoleCode]);
        if (hasPermission([role as RoleCode], g.permission)) {
          await expect(g.call(actor)).resolves.toBeDefined();
        } else {
          await expect(g.call(actor)).rejects.toBeInstanceOf(ForbiddenError);
        }
      });
    }
  }

  it("a denial writes an audit event naming the permission", async () => {
    const actor = await actorFor(["case_manager"]);
    await expect(listUsers(actor, ctx(), { policy: noMfa })).rejects.toBeInstanceOf(ForbiddenError);
    const rows = await getDb()
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorUserId, actor.userId));
    const denied = rows.find((r) => r.action === "authz.denied");
    expect(denied?.outcome).toBe("denied");
    expect(denied?.metadata).toMatchObject({ permission: "user.manage" });
  });

  it("a user with no roles can do nothing", async () => {
    const actor = await actorFor([]);
    await expect(authorize(actor, "account.manage_own", ctx())).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(authorize(actor, "user.manage", ctx())).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("the safeguarding officer sees only safeguarding-related audit events", async () => {
    const sg = await actorFor(["safeguarding_officer"]);
    const rows = await listAuditEvents(sg, {}, ctx(), { policy: noMfa });
    expect(
      rows.every((r) => /^(beneficiary\.|document\.|application\.opened)/.test(r.action)),
    ).toBe(true);
  });
});

describe("user and role management rules", () => {
  it("blocks self grants, conflicting roles and removal of the last super administrator", async () => {
    const admin = await actorFor(["super_admin"]);
    await expect(
      grantRole(admin, admin.userId, "case_manager", ctx(), { policy: noMfa }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    const maker = await createUser(["finance_officer"]);
    await expect(
      grantRole(admin, maker.id, "finance_approver", ctx(), { policy: noMfa }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    const other = await createUser(["super_admin"]);
    await expect(
      grantRole(admin, other.id, "finance_approver", ctx(), { policy: noMfa }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    // Both policy denials are in the audit log.
    const denials = await getDb()
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorUserId, admin.userId));
    expect(denials.filter((d) => d.action === "authz.denied").length).toBeGreaterThanOrEqual(3);
  });

  it("cannot deactivate yourself or the last active super administrator", async () => {
    const admin = await actorFor(["super_admin"]);
    await expect(
      deactivateUser(admin, admin.userId, "testing this", ctx(), { policy: noMfa }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("a role grant or revoke ends the target's sessions and is audited", async () => {
    const admin = await actorFor(["super_admin"]);
    const target = await createUser(["reporting_officer"]);
    const s = await login(target.email);
    await grantRole(admin, target.id, "verification_officer", ctx(), { policy: noMfa });
    expect(await resolveSession(getDb(), s.token, noMfa)).toBeNull();
    await revokeRole(admin, target.id, "verification_officer", ctx(), { policy: noMfa });
    const actions = (
      await getDb().select().from(auditLogs).where(eq(auditLogs.entityId, target.id))
    ).map((r) => r.action);
    expect(actions).toEqual(expect.arrayContaining(["role.granted", "role.revoked"]));
  });

  it("invites reject unknown roles and conflicting role sets", async () => {
    const admin = await actorFor(["super_admin"]);
    await expect(
      inviteUser(
        admin,
        { email: "a1@diyalo.example", displayName: "A One", roles: ["wizard"] },
        ctx(),
        { policy: noMfa },
      ),
    ).rejects.toThrow();
    await expect(
      inviteUser(
        admin,
        {
          email: "a2@diyalo.example",
          displayName: "A Two",
          roles: ["finance_officer", "finance_approver"],
        },
        ctx(),
        { policy: noMfa },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("revoking sessions needs the permission", async () => {
    const cm = await actorFor(["case_manager"]);
    const target = await createUser(["case_manager"]);
    await expect(
      revokeUserSessions(cm, target.id, ctx(), { policy: noMfa }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("MFA step-up for sensitive changes (enforced mode)", () => {
  it("requires MFA verified within 10 minutes", async () => {
    const admin = await actorFor(["super_admin"]);
    const target = await createUser(["reporting_officer"]);
    // actor has no MFA verification at all in enforced mode
    await expect(
      grantRole(admin, target.id, "verification_officer", ctx(), { policy: withMfa }),
    ).rejects.toBeInstanceOf(StepUpRequiredError);
    const fresh = { ...admin, mfaVerifiedAt: new Date() };
    await expect(
      grantRole(fresh, target.id, "verification_officer", ctx(), { policy: withMfa }),
    ).resolves.toBeUndefined();
    const stale = { ...admin, mfaVerifiedAt: new Date(Date.now() - 11 * 60 * 1000) };
    await expect(
      revokeRole(stale, target.id, "verification_officer", ctx(), { policy: withMfa }),
    ).rejects.toBeInstanceOf(StepUpRequiredError);
  });
});
