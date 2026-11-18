// Runs in every test worker before the test files import application code.
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is required for integration tests");
Object.assign(process.env, {
  APP_ENV: "test",
  APP_BASE_URL: "http://localhost:3000",
  DATABASE_URL: process.env.TEST_APP_DATABASE_URL ?? url,
  MFA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
  AUDIT_HMAC_KEY: "test-audit-hmac-key-not-a-secret-0123456789",
});
