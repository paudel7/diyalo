import path from "node:path";
import { defineConfig } from "vitest/config";

export const alias = {
  "@": path.resolve(__dirname, "src"),
  "@db": path.resolve(__dirname, "db"),
  // `server-only` throws outside React Server Components; tests run in plain Node.
  "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
