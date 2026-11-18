import "server-only";
import type { ReactNode } from "react";
import { NotPermitted, StepUpNeeded } from "@/components/admin/not-permitted";
import { hasPermission, type PermissionCode } from "@/lib/permissions";
import { gate, requireActor } from "./web";

/** Layout-level guard for a module. Renders children only if the user holds one of the permissions. */
export async function SectionGuard({
  anyOf,
  path,
  children,
}: {
  anyOf: PermissionCode[];
  path: string;
  children: ReactNode;
}) {
  const actor = await requireActor(path);
  const allowed = anyOf.find((p) => hasPermission(actor.roles, p)) ?? anyOf[0]!;
  const g = await gate(allowed, path);
  if (!g.ok) return g.reason === "step_up" ? <StepUpNeeded next={path} /> : <NotPermitted />;
  return <>{children}</>;
}
