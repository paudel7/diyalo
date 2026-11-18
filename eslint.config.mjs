import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Layering (roadmap section 14): pages and components never reach the database directly.
    // They call services; services call repositories; repositories own the queries.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/repositories/*"],
              message: "Call a service instead of a repository.",
            },
            {
              group: ["@/server/db/*", "@db/*", "drizzle-orm", "drizzle-orm/*", "pg"],
              message: "UI code must not access the database.",
            },
          ],
        },
      ],
    },
  },
]);
