import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: resolve(process.cwd(), ".env.test") });

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/setup/global-setup.ts",
  workers: 1,
  reporter: [["html"], ["line"]],
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testDir: "./tests/setup",
      testMatch: "auth.setup.ts",
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: ["**/auth.spec.ts", "**/mcp-auth.spec.ts"],
    },
    {
      name: "chromium-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/auth.spec.ts", "**/mcp-auth.spec.ts"],
      dependencies: ["chromium"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
