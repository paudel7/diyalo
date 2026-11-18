import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { decryptSecret, encryptSecret } from "@/lib/auth/crypto";
import { ForbiddenError, StepUpRequiredError } from "@/lib/errors";
import type { PermissionCode } from "@/lib/permissions";
import { getDb } from "@/server/db/client";
import { buildContext, type RequestContext } from "@/server/context";
import { getEnv } from "@/server/env";
import { authorize } from "@/server/services/authorize";
import {
  resolveSession,
  type Actor,
  type ResolvedSession,
} from "@/server/services/session-service";

/** `__Host-` cookies need HTTPS, so plain-http local development uses a plain name. */
export function sessionCookieName(): string {
  return getEnv().APP_ENV === "development" || getEnv().APP_ENV === "test"
    ? "diyalo_session"
    : "__Host-diyalo_session";
}

export async function setSessionCookie(token: string, expires: Date): Promise<void> {
  const secure = !(getEnv().APP_ENV === "development" || getEnv().APP_ENV === "test");
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(sessionCookieName());
}

export async function requestContext(): Promise<RequestContext> {
  return buildContext(await headers());
}

/** CSRF defence in depth: SameSite=Lax plus an Origin check on every state-changing action. */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return; // same-origin form posts from some browsers omit it; SameSite still applies
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host || new URL(origin).host !== host)
    throw new ForbiddenError("csrf", "Request origin not allowed.");
}

export async function currentSession(): Promise<ResolvedSession | null> {
  const token = (await cookies()).get(sessionCookieName())?.value;
  return resolveSession(getDb(), token);
}

/** Only same-site admin paths are valid redirect targets (blocks open redirects). */
export function safeNext(next: unknown): string {
  return typeof next === "string" && /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(next) ? next : "/admin";
}

export function nextStepPath(state: ResolvedSession["state"], next?: string): string {
  if (state === "needs_mfa_verify")
    return `/sign-in/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  if (state === "needs_mfa_enrol") return "/mfa/setup";
  return safeNext(next);
}

/** For admin pages and actions: a fully signed-in staff member or a redirect. */
export async function requireActor(nextPath = "/admin"): Promise<Actor> {
  const session = await currentSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(safeNext(nextPath))}`);
  if (session.state !== "full") redirect(nextStepPath(session.state, nextPath));
  return session.actor;
}

export type Gate =
  { ok: true; actor: Actor } | { ok: false; actor: Actor; reason: "forbidden" | "step_up" };

/** Page-level gate. Denials are audited by authorize(); the page decides what to render. */
export async function gate(permission: PermissionCode, nextPath: string): Promise<Gate> {
  const actor = await requireActor(nextPath);
  try {
    await authorize(actor, permission, await requestContext());
    return { ok: true, actor };
  } catch (e) {
    if (e instanceof StepUpRequiredError) return { ok: false, actor, reason: "step_up" };
    if (e instanceof ForbiddenError) return { ok: false, actor, reason: "forbidden" };
    throw e;
  }
}

const FLASH_COOKIE = "diyalo_recovery_flash";

/**
 * Recovery codes are shown once, on the page after enrolment. Setting the session cookie makes
 * Next re-render the current page, so the codes travel in a short-lived, encrypted, HttpOnly
 * cookie scoped to the recovery page and are cleared when the user continues.
 */
export async function setRecoveryFlash(codes: string[]): Promise<void> {
  const secure = !(getEnv().APP_ENV === "development" || getEnv().APP_ENV === "test");
  (await cookies()).set(
    FLASH_COOKIE,
    encryptSecret(JSON.stringify(codes), getEnv().MFA_ENCRYPTION_KEY),
    {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/mfa/recovery",
      maxAge: 120,
    },
  );
}

export async function readRecoveryFlash(): Promise<string[] | null> {
  const raw = (await cookies()).get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decryptSecret(raw, getEnv().MFA_ENCRYPTION_KEY));
    return Array.isArray(parsed) && parsed.every((c) => typeof c === "string") ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearRecoveryFlash(): Promise<void> {
  (await cookies()).set(FLASH_COOKIE, "", { path: "/mfa/recovery", maxAge: 0 });
}
