import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getEnv } from "@/server/env";

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
}

/** Provider-neutral. No email provider is chosen yet (decision D-16). */
export interface Mailer {
  send(mail: OutgoingMail): Promise<void>;
}

/** Development and test only: appends to `.dev-outbox/outbox.jsonl`. Never sends anything. */
class DevOutboxMailer implements Mailer {
  async send(mail: OutgoingMail): Promise<void> {
    const dir = path.join(process.cwd(), ".dev-outbox");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "outbox.jsonl"),
      JSON.stringify({ at: new Date().toISOString(), ...mail }) + "\n",
    );
  }
}

class UnconfiguredMailer implements Mailer {
  async send(): Promise<void> {
    throw new Error("No email provider is configured (decision D-16). Cannot send email.");
  }
}

let override: Mailer | undefined;
export function setMailerForTests(m: Mailer | undefined) {
  override = m;
}

export function getMailer(): Mailer {
  if (override) return override;
  const env = getEnv().APP_ENV;
  return env === "development" || env === "test" ? new DevOutboxMailer() : new UnconfiguredMailer();
}
