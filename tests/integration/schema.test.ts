import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { and, eq, isNull } from "drizzle-orm";
import { permissions, rolePermissions, roles, userRoles } from "@db/schema";
import { getDb, getPool } from "@/server/db/client";
import { PERMISSION_CODES, ROLES, permissionsForRole } from "@/lib/permissions";
import { createUser } from "./helpers";

const migrator = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 1 });
afterAll(() => migrator.end());

async function sql(text: string, params: unknown[] = []) {
  return migrator.query(text, params);
}

async function seedApplication() {
  const prog = (await sql("select id from programs where code='education'")).rows[0].id as string;
  const app = await sql(
    `insert into applicants (full_name, relationship_type) values ('Fictional Guardian','parent') returning id`,
  );
  const ref = `APP-T-${randomUUID().slice(0, 8)}`;
  const a = await sql(
    `insert into applications (reference, applicant_id, program_id) values ($1,$2,$3) returning id`,
    [ref, app.rows[0].id, prog],
  );
  return { applicationId: a.rows[0].id as string, programId: prog };
}

describe("migrations from zero", () => {
  it("creates the expected tables and extensions", async () => {
    const t = await sql(
      "select table_name from information_schema.tables where table_schema='public'",
    );
    const names = t.rows.map((r) => r.table_name);
    for (const n of [
      "users",
      "roles",
      "permissions",
      "role_permissions",
      "user_roles",
      "approval_authorities",
      "sessions",
      "mfa_credentials",
      "mfa_recovery_codes",
      "auth_tokens",
      "programs",
      "reference_counters",
      "applicants",
      "applications",
      "application_status_history",
      "beneficiaries",
      "cases",
      "case_beneficiaries",
      "documents",
      "audit_logs",
    ]) {
      expect(names).toContain(n);
    }
    const ext = await sql("select extname from pg_extension where extname='citext'");
    expect(ext.rowCount).toBe(1);
  });

  it("seeds roles and permissions equal to the typed catalogue", async () => {
    const db = getDb();
    const dbRoles = await db.select().from(roles);
    expect(dbRoles.map((r) => r.code).sort()).toEqual(ROLES.map((r) => r.code).sort());
    const dbPerms = await db.select().from(permissions);
    expect(dbPerms.map((p) => p.code).sort()).toEqual([...PERMISSION_CODES].sort());
    for (const role of dbRoles) {
      const granted = await db
        .select({ code: permissions.code })
        .from(rolePermissions)
        .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
        .where(eq(rolePermissions.roleId, role.id));
      const expected = permissionsForRole(role.code as (typeof ROLES)[number]["code"]);
      expect(granted.map((g) => g.code).sort(), role.code).toEqual([...expected].sort());
    }
  });
});

describe("constraints", () => {
  it("rejects unknown statuses and bad currencies", async () => {
    const { applicationId } = await seedApplication();
    await expect(
      sql("update applications set status='nonsense' where id=$1", [applicationId]),
    ).rejects.toThrow(/applications_status_check/);
    await expect(
      sql("update applications set requested_currency='USD' where id=$1", [applicationId]),
    ).rejects.toThrow(/applications_currency_check/);
    await expect(
      sql("update applications set requested_amount=-1 where id=$1", [applicationId]),
    ).rejects.toThrow(/applications_amount_check/);
  });

  it("allows one active role grant per user and role, and keeps history", async () => {
    const u = await createUser(["case_manager"]);
    const db = getDb();
    const [role] = await db.select().from(roles).where(eq(roles.code, "case_manager"));
    await expect(db.insert(userRoles).values({ userId: u.id, roleId: role!.id })).rejects.toThrow();
    await db
      .update(userRoles)
      .set({ revokedAt: new Date(), revokedBy: u.id })
      .where(and(eq(userRoles.userId, u.id), isNull(userRoles.revokedAt)));
    await db.insert(userRoles).values({ userId: u.id, roleId: role!.id });
  });

  it("requires a document to belong to exactly one parent", async () => {
    const { applicationId } = await seedApplication();
    const hash = "a".repeat(64);
    await expect(
      sql(
        `insert into documents (storage_key, original_filename, content_type, size_bytes, sha256) values ($1,'a.pdf','application/pdf',1,$2)`,
        [randomUUID(), hash],
      ),
    ).rejects.toThrow(/documents_parent_check/);
    await sql(
      `insert into documents (application_id, storage_key, original_filename, content_type, size_bytes, sha256) values ($1,$2,'a.pdf','application/pdf',1,$3)`,
      [applicationId, randomUUID(), hash],
    );
  });

  it("requires approval fields on a case and blocks approver = assignee in the database", async () => {
    const { applicationId, programId } = await seedApplication();
    const assignee = await createUser(["case_manager"]);
    const other = await createUser(["case_manager"]);
    await sql("update applications set assigned_to=$1 where id=$2", [assignee.id, applicationId]);
    await expect(
      sql(
        `insert into cases (case_number, application_id, program_id, status) values ($1,$2,$3,'active')`,
        [`CASE-T-${randomUUID().slice(0, 6)}`, applicationId, programId],
      ),
    ).rejects.toThrow(/cases_approval_check/);
    await expect(
      sql(
        `insert into cases (case_number, application_id, program_id, status, approved_by, approved_at) values ($1,$2,$3,'active',$4,now())`,
        [`CASE-T-${randomUUID().slice(0, 6)}`, applicationId, programId, assignee.id],
      ),
    ).rejects.toThrow(/separation of duties/);
    await sql(
      `insert into cases (case_number, application_id, program_id, status, approved_by, approved_at) values ($1,$2,$3,'active',$4,now())`,
      [`CASE-T-${randomUUID().slice(0, 6)}`, applicationId, programId, other.id],
    );
  });

  it("keeps emails unique case-insensitively", async () => {
    const u = await createUser();
    await expect(createUser([], { email: u.email.toUpperCase() })).rejects.toThrow();
  });
});

describe("append-only protections", () => {
  async function anAuditRow() {
    const r = await sql("select id from audit_logs order by id limit 1");
    if (r.rowCount) return r.rows[0].id as number;
    await sql(
      `insert into audit_logs (actor_type, action, outcome, row_hash, prev_hash) values ('system','auth.logout','success','h',null)`,
    );
    return (await sql("select id from audit_logs order by id limit 1")).rows[0].id as number;
  }

  it("rejects update, delete and truncate even for the table owner", async () => {
    const id = await anAuditRow();
    await expect(sql("update audit_logs set outcome='failure' where id=$1", [id])).rejects.toThrow(
      /append-only/,
    );
    await expect(sql("delete from audit_logs where id=$1", [id])).rejects.toThrow(/append-only/);
    await expect(sql("truncate audit_logs")).rejects.toThrow(/append-only/);
  });

  it("denies the application role update, delete and truncate privileges", async () => {
    const id = await anAuditRow();
    const app = getPool();
    await expect(
      app.query("update audit_logs set outcome='failure' where id=$1", [id]),
    ).rejects.toThrow(/permission denied|append-only/);
    await expect(app.query("delete from audit_logs where id=$1", [id])).rejects.toThrow(
      /permission denied|append-only/,
    );
    await expect(app.query("truncate audit_logs")).rejects.toThrow(/permission denied|append-only/);
    await expect(app.query("update application_status_history set reason='x'")).rejects.toThrow(
      /permission denied|append-only/,
    );
  });

  it("rejects an audit row whose prev_hash does not continue the chain", async () => {
    await expect(
      sql(
        `insert into audit_logs (actor_type, action, outcome, row_hash, prev_hash) values ('system','auth.logout','success','h2','not-the-previous-hash')`,
      ),
    ).rejects.toThrow(/audit chain broken/);
  });
});
