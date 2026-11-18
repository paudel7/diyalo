"use server";

import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import type { ActionState } from "@/components/auth/action-form";
import {
  confirmMfaEnrolment,
  regenerateRecoveryCodes,
  signIn,
  signOut,
  verifyMfa,
} from "@/server/services/auth-service";
import {
  acceptInvite,
  changePassword,
  completePasswordReset,
  requestPasswordReset,
} from "@/server/services/password-service";
import {
  grantRole,
  inviteUser,
  revokeRole,
  deactivateUser,
  revokeUserSessions,
} from "@/server/services/user-service";
import { verifyChainAsAdmin } from "@/server/services/audit-service";
import { ABSOLUTE_MS } from "@/server/services/session-service";
import { now } from "@/server/clock";
import {
  assertSameOrigin,
  clearRecoveryFlash,
  clearSessionCookie,
  currentSession,
  nextStepPath,
  requestContext,
  requireActor,
  safeNext,
  setRecoveryFlash,
  setSessionCookie,
} from "./web";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const sessionExpiry = () => new Date(now().getTime() + ABSOLUTE_MS);

function toState(e: unknown): ActionState {
  if (e instanceof AppError) return { error: e.message };
  throw e;
}

export async function signInAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const res = await signIn(
    { email: str(fd, "email"), password: str(fd, "password") },
    await requestContext(),
  );
  if (!res.ok) {
    return {
      error:
        res.error === "rate_limited"
          ? "Too many attempts. Try again in a few minutes."
          : "The email or password is not correct, or the account is temporarily unavailable.",
    };
  }
  await setSessionCookie(res.token, sessionExpiry());
  redirect(nextStepPath(res.state, safeNext(str(fd, "next"))));
}

export async function verifyMfaAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const res = await verifyMfa(session.actor, str(fd, "code"), await requestContext());
  if (!res.ok) {
    if (res.error === "locked") {
      await clearSessionCookie();
      redirect("/sign-in");
    }
    return { error: "That code is not correct. Try the newest code, or a recovery code." };
  }
  await setSessionCookie(res.token, sessionExpiry());
  redirect(safeNext(str(fd, "next")));
}

export async function confirmMfaAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  const res = await confirmMfaEnrolment(session.actor, str(fd, "code"), await requestContext());
  if (!res.ok)
    return { error: "That code is not correct. Check your authenticator and try again." };
  await setSessionCookie(res.token, sessionExpiry());
  await setRecoveryFlash(res.recoveryCodes ?? []);
  redirect("/mfa/recovery");
}

export async function dismissRecoveryAction(): Promise<void> {
  await assertSameOrigin();
  await clearRecoveryFlash();
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  await assertSameOrigin();
  const session = await currentSession();
  if (session) await signOut(session.actor, await requestContext());
  await clearSessionCookie();
  redirect("/sign-in");
}

export async function forgotPasswordAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  await requestPasswordReset(str(fd, "email"), await requestContext());
  return {
    message:
      "If that email belongs to a staff account, a reset link is on its way. It works for 30 minutes.",
  };
}

export async function resetPasswordAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  try {
    await completePasswordReset(str(fd, "token"), str(fd, "password"), await requestContext());
  } catch (e) {
    return toState(e);
  }
  redirect("/sign-in?reset=1");
}

export async function acceptInviteAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  try {
    await acceptInvite(str(fd, "token"), str(fd, "password"), await requestContext());
  } catch (e) {
    return toState(e);
  }
  redirect("/sign-in?welcome=1");
}

export async function changePasswordAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const actor = await requireActor("/admin/account");
  try {
    const { token } = await changePassword(
      actor,
      { currentPassword: str(fd, "current"), newPassword: str(fd, "password") },
      await requestContext(),
    );
    await setSessionCookie(token, sessionExpiry());
  } catch (e) {
    return toState(e);
  }
  return { message: "Password changed. Your other sessions were signed out." };
}

export async function regenerateCodesAction(_p: ActionState): Promise<ActionState> {
  await assertSameOrigin();
  const actor = await requireActor("/admin/account");
  try {
    const codes = await regenerateRecoveryCodes(actor, await requestContext());
    return { message: "New recovery codes. The old ones no longer work.", recoveryCodes: codes };
  } catch (e) {
    return toState(e);
  }
}

// ----- Settings: users and roles (every action re-checks permission and step-up in the service)

export async function inviteUserAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const actor = await requireActor("/admin/settings/users");
  try {
    await inviteUser(
      actor,
      {
        email: str(fd, "email"),
        displayName: str(fd, "displayName"),
        roles: fd.getAll("roles").map(String),
      },
      await requestContext(),
    );
    return { message: "Invitation created. The link is valid for 72 hours." };
  } catch (e) {
    return toState(e);
  }
}

export async function userChangeAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  await assertSameOrigin();
  const actor = await requireActor("/admin/settings/users");
  const ctx = await requestContext();
  const target = str(fd, "userId");
  try {
    switch (str(fd, "intent")) {
      case "grant":
        await grantRole(actor, target, str(fd, "role"), ctx);
        return { message: "Role granted. The user was signed out everywhere." };
      case "revoke":
        await revokeRole(actor, target, str(fd, "role"), ctx);
        return { message: "Role removed. The user was signed out everywhere." };
      case "deactivate":
        await deactivateUser(actor, target, str(fd, "reason"), ctx);
        return { message: "User deactivated and signed out." };
      case "revoke_sessions": {
        const n = await revokeUserSessions(actor, target, ctx);
        return { message: `${n} session(s) ended.` };
      }
      default:
        return { error: "Unknown action." };
    }
  } catch (e) {
    return toState(e);
  }
}

export async function verifyChainAction(_p: ActionState): Promise<ActionState> {
  await assertSameOrigin();
  const actor = await requireActor("/admin/settings/audit");
  try {
    const r = await verifyChainAsAdmin(actor, await requestContext());
    return r.ok
      ? { message: `Audit chain intact: ${r.checked} events checked.` }
      : { error: `Audit chain broken at event ${r.brokenAtId}. Investigate immediately.` };
  } catch (e) {
    return toState(e);
  }
}
