import { defineConfig, devices } from "@playwright/test";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:8013";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8012";

export default defineConfig({
  testDir: "./tests",
  // The run switches the dev account to English and restores its language afterwards.
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      testIgnore: /language\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      // language.spec switches the ONE dev account's language, which every other spec
      // reads: run it alone, after the rest, never in parallel with them.
      name: "language",
      testMatch: /language\.spec\.ts/,
      dependencies: ["chromium"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  metadata: { BACKEND_URL },
});
