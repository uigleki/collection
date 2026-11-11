import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Playwright sets its worker count from CPU cores, but three engines
  // running at once are limited by memory. With more than one worker, WebKit
  // times out and tests fail for lack of resources, not because of the site.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Two reporters in CI: `github` annotates the failure on the diff, and only
  // `html` writes the playwright-report/ directory the workflow uploads.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",

  // Longer than Playwright's default of five seconds: every route change is
  // a spring animation, and three engines sharing one machine can delay its
  // frames.
  expect: { timeout: 8000 },

  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    colorScheme: "dark", // dark is the site's default theme
  },

  // The WebGL sky, the cover transition and scrolling behave differently per
  // engine, so the behavioral specs run on all three. The visual snapshots
  // run on one engine: they check the site's appearance, and engines differ
  // in antialiasing.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /dev\.spec\.ts/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /(visual|dev)\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /(visual|dev)\.spec\.ts/,
    },
    // The development server, where React's StrictMode unmounts and remounts
    // each component it mounts. Development happens there, so the site has to
    // work there too.
    {
      name: "dev",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
      testMatch: /dev\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: "pnpm run build && pnpm run preview",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm run dev --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
