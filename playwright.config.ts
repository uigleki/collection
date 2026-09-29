import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Playwright derives its worker count from CPU cores, but three engines
  // running at once are bound by memory, not by cores — over-committing makes
  // WebKit miss its own timeouts and the suite reports site failures that are
  // really starvation. At two workers the same run would pass, then fail two
  // unrelated specs, then pass again; a suite that answers differently each
  // time cannot be used to decide anything. One worker trades minutes for an
  // answer that means something.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Two reporters in CI, not one: `github` writes the failure onto the diff
  // where it is read, and the HTML report is what survives the run as an
  // artifact. `github` alone produced no playwright-report/ at all, so the
  // upload step in the workflow had nothing to find, every time.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",

  // Longer than Playwright's five seconds: every route change here plays out
  // on springs, and three engines sharing one machine do not always spare
  // the frames one needs promptly. Nothing about what is asserted
  // changes — only the patience, so a loaded run reports what the site did
  // rather than how busy the box was.
  expect: { timeout: 8000 },

  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    colorScheme: "dark", // the night is the default sky
  },

  // The sky, the cover's flight and the scroll behave differently per
  // engine, so the behavioral specs run on all three. The visual snapshots stay on one
  // engine: they pin the site's look, not the renderers' disagreements about
  // antialiasing.
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
    // The development build, where React's StrictMode tears down and rebuilds
    // what it mounts: the site is worked on there, so it has to hold up there.
    {
      name: "dev",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
      testMatch: /dev\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: "bun run build && bun run preview",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run dev --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
