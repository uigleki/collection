import AxeBuilder from "@axe-core/playwright";
import { pages } from "../src/data/site.ts";
import { expect, HOME, heading, row, test } from "./helpers.ts";

// The static pages are read from src/data/site.ts, which also feeds the
// sitemap, so a page added there is audited without editing this list. The
// two work pages cover both layouts: with cover art and without.
const ROUTES = [
  ...pages.map((page) => page.path),
  "/works/bakemonogatari",
  "/works/kantoku",
];
const THEMES = ["dark", "light"] as const;

// With reduced motion every entrance animation renders at its end state, so
// axe measures the final colors (not a partly faded-in blend) and checks all
// text on the page, including text below the fold.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`axe: ${route} (${theme})`, async ({ page }) => {
      // Set before any page script runs, so the page loads in the theme
      // under test. Setting it after a goto and reloading would load every
      // route twice; the inline theme script reads it at document start.
      await page.addInitScript((t) => {
        localStorage.setItem("theme", t);
      }, theme);
      await page.goto(route);
      // Wait for the h1, not a fixed time: routes are lazy-loaded, and axe
      // reports no violations on a page whose chunk has not mounted yet.
      // Wait for the fonts too, since contrast is measured on rendered text.
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("keyboard: the skip link jumps to #main", async ({ page }) => {
  await page.goto("/");
  await expect(heading(page, HOME)).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("route change moves focus to the new heading", async ({ page }) => {
  await page.goto("/");
  await row(page, "化物語").click();
  await expect(page).toHaveURL(/bakemonogatari/);
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.tagName), {
      timeout: 4000,
    })
    .toBe("H1");
});
