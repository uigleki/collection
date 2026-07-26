import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { pages } from "../src/data/site";
import { HOME, heading, row } from "./helpers";

// The standing pages come from the site itself, so a page added there is
// audited the day it is added — a route that gets a sitemap entry and no axe
// run is exactly the one that ships a violation. The two rooms are the two
// shapes a work room has: with cover art, and without.
const ROUTES = [
  ...pages.map((page) => page.path),
  "/works/bakemonogatari",
  "/works/kantoku",
];
const THEMES = ["dark", "light"] as const;

// Reduced motion renders every reveal at its end state instantly, so axe
// sees the real colors (not a mid-spring opacity blend) and every piece of
// text on the page — including below the fold — gets checked.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`axe: ${route} (${theme})`, async ({ page }) => {
      // Seeded before anything runs, so the page opens in the theme under
      // test — a goto to set it and a reload to apply it would load every
      // route twice, and the inline theme script reads it at document start
      // either way.
      await page.addInitScript((t) => {
        localStorage.setItem("theme", t);
      }, theme);
      await page.goto(route);
      // Wait for the page, not for a duration: the routes are lazy, and axe
      // finds nothing wrong with a chunk that has not mounted yet — a silent
      // pass. The fonts settle too, since contrast is measured on rendered
      // text.
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("keyboard: skip link lands on the content", async ({ page }) => {
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
