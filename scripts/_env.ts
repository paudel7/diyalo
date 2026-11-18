export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

/** Destructive and demo-data scripts refuse to run anywhere but development or test. */
export function assertLocalEnvironment(): void {
  const env = process.env.APP_ENV;
  if (env !== "development" && env !== "test") {
    throw new Error(
      `Refusing to run: APP_ENV must be "development" or "test" (got "${env ?? "unset"}").`,
    );
  }
}
