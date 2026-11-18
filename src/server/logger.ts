import "server-only";
import pino from "pino";

/** Structured logs with secrets and personal data redacted by key name. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "password",
      "*.password",
      "newPassword",
      "*.newPassword",
      "token",
      "*.token",
      "*.tokenHash",
      "secret",
      "*.secret",
      "code",
      "*.code",
      "email",
      "*.email",
      "phone",
      "*.phone",
      "authorization",
      "cookie",
      "headers.authorization",
      "headers.cookie",
      "DATABASE_URL",
      "MFA_ENCRYPTION_KEY",
      "AUDIT_HMAC_KEY",
    ],
    censor: "[redacted]",
  },
});
