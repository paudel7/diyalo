import { randomUUID } from "node:crypto";
import { sha256Hex } from "@/lib/auth/crypto";

/** Per-request facts attached to audit events. No full IP address is kept. */
export interface RequestContext {
  correlationId: string;
  ipPrefix: string | null;
  userAgentHash: string | null;
}

export function ipToPrefix(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(ip);
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  if (ip.includes(":")) return `${ip.split(":").slice(0, 3).join(":")}::/48`;
  return null;
}

export function buildContext(headers: { get(name: string): string | null }): RequestContext {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = headers.get("user-agent");
  return {
    correlationId: headers.get("x-correlation-id")?.slice(0, 64) || randomUUID(),
    ipPrefix: ipToPrefix(forwarded ?? headers.get("x-real-ip")),
    userAgentHash: ua ? sha256Hex(ua).slice(0, 32) : null,
  };
}

export function testContext(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    correlationId: randomUUID(),
    ipPrefix: "203.0.113.0/24",
    userAgentHash: "test",
    ...overrides,
  };
}
