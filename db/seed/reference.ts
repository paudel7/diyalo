import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import {
  PERMISSION_CODES,
  MATRIX,
  ROLES,
  permissionsForRole,
} from "../../src/lib/permissions/matrix";

type Db = NodePgDatabase<typeof schema>;

/**
 * Idempotent. Makes the roles, permissions and role grants in the database equal the typed
 * catalogue in src/lib/permissions/matrix.ts. Runs in every environment after migrations.
 */
export async function syncReferenceData(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    for (const r of ROLES) {
      await tx
        .insert(schema.roles)
        .values({
          code: r.code,
          name: r.name,
          description: r.description,
          isPrivileged: r.isPrivileged,
          requiresMfa: r.requiresMfa,
        })
        .onConflictDoUpdate({
          target: schema.roles.code,
          set: {
            name: r.name,
            description: r.description,
            isPrivileged: r.isPrivileged,
            requiresMfa: r.requiresMfa,
          },
        });
    }
    for (const code of PERMISSION_CODES) {
      const def = MATRIX[code];
      await tx
        .insert(schema.permissions)
        .values({ code, description: def.description, stage: def.stage })
        .onConflictDoUpdate({
          target: schema.permissions.code,
          set: { description: def.description, stage: def.stage },
        });
    }
    const roleRows = await tx.select().from(schema.roles);
    const permRows = await tx.select().from(schema.permissions);
    const permId = new Map(permRows.map((p) => [p.code, p.id]));
    const wanted = new Set<string>();
    for (const role of roleRows) {
      const def = ROLES.find((r) => r.code === role.code);
      if (!def) continue;
      for (const p of permissionsForRole(def.code)) {
        const pid = permId.get(p);
        if (!pid) continue;
        wanted.add(`${role.id}:${pid}`);
        await tx
          .insert(schema.rolePermissions)
          .values({ roleId: role.id, permissionId: pid })
          .onConflictDoNothing();
      }
    }
    const existing = await tx.select().from(schema.rolePermissions);
    for (const e of existing) {
      if (!wanted.has(`${e.roleId}:${e.permissionId}`)) {
        await tx
          .delete(schema.rolePermissions)
          .where(
            and(
              eq(schema.rolePermissions.roleId, e.roleId),
              eq(schema.rolePermissions.permissionId, e.permissionId),
            ),
          );
      }
    }
    await tx
      .insert(schema.programs)
      .values([
        { code: "education", name: "Education assistance" },
        { code: "essential-living", name: "Essential living assistance" },
      ])
      .onConflictDoNothing();
  });
}
