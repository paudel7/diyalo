import "server-only";
import { ForbiddenError, StepUpRequiredError } from "@/lib/errors";
import {
  hasPermission,
  STEP_UP_PERMISSIONS,
  STEP_UP_WINDOW_MS,
  type PermissionCode,
} from "@/lib/permissions";
import { withTransaction, type Executor } from "@/server/db/client";
import type { RequestContext } from "@/server/context";
import { recordAudit } from "@/server/audit/audit";
import { now } from "@/server/clock";
import { defaultAuthPolicy, type Actor, type AuthPolicy } from "./session-service";

export interface AuthorizeOptions {
  /** Force MFA step-up even if the permission does not always need it. */
  stepUp?: boolean;
  policy?: AuthPolicy;
  /** Transaction to write the denial into. Defaults to its own committed transaction. */
  tx?: Executor;
}

async function deny(
  actor: Actor,
  permission: PermissionCode,
  reason: string | undefined,
  ctx: RequestContext,
  tx?: Executor,
) {
  const write = (executor: Executor) =>
    recordAudit(executor, {
      action: "authz.denied",
      outcome: "denied",
      actor: { userId: actor.userId, type: "user", roles: actor.roles },
      metadata: reason ? { permission, reason } : { permission },
      context: ctx,
    });
  // A denial must persist even though the caller then throws, so it gets its own transaction.
  if (tx) await write(tx);
  else await withTransaction(write);
}

/**
 * The single server-side gate. Deny by default, audit every denial, and require recent MFA
 * for sensitive permissions. Conditional grants (matrix "C") still need a policy decision by
 * the calling service after this returns.
 */
export async function authorize(
  actor: Actor,
  permission: PermissionCode,
  ctx: RequestContext,
  options: AuthorizeOptions = {},
): Promise<void> {
  const db = options.tx;
  if (!hasPermission(actor.roles, permission)) {
    await deny(actor, permission, undefined, ctx, db);
    throw new ForbiddenError(permission);
  }
  const policy = options.policy ?? defaultAuthPolicy();
  const needsStepUp = options.stepUp ?? STEP_UP_PERMISSIONS.includes(permission);
  if (needsStepUp && policy.mfaEnforced) {
    const verified = actor.mfaVerifiedAt;
    if (!verified || now().getTime() - verified.getTime() > STEP_UP_WINDOW_MS) {
      await deny(actor, permission, "step_up_required", ctx, db);
      throw new StepUpRequiredError();
    }
  }
}

/** Records a denial from a policy function (for example separation of duties). */
export async function denyByPolicy(
  actor: Actor,
  permission: PermissionCode,
  reason: string,
  ctx: RequestContext,
  tx?: Executor,
): Promise<never> {
  await deny(actor, permission, reason.replace(/[^A-Za-z0-9_.:+\-/]/g, "_").slice(0, 80), ctx, tx);
  throw new ForbiddenError(permission);
}
