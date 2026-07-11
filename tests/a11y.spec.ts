import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/works/bakemonogatari",
  "/works/kantoku",
  "/why",
  "/credits",
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
      await page.goto(route);
      await page.evaluate((t) => {
        localStorage.setItem("theme", t);
      }, theme);
      await page.reload();
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("keyboard: skip link lands on the content", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Perfect\s*Collection/ }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("route change moves focus to the new heading", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "化物語 — open" }).click();
  await expect(page).toHaveURL(/bakemonogatari/);
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.tagName), {
      timeout: 4000,
    })
    .toBe("H1");
});
