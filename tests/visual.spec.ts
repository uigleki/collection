import type { Page } from "@playwright/test";
import { expect, test } from "./helpers.ts";

/**
 * Waits until the sky has drawn its first frame and the fonts have loaded.
 * The sky adds its canvas while the page hydrates, which `goto` waits for
 * (helpers.ts), so a page with no canvas by then shows the static poster:
 * this browser has no WebGL. The canvas's host is shown after the first
 * drawn frame, at once under reduced motion.
 */
async function skyShown(page: Page) {
  if ((await page.locator("canvas").count()) > 0)
    await expect(page.locator(":has(> canvas)")).toHaveCSS("opacity", "1");
  await page.evaluate(() => document.fonts.ready);
}

// Reduced motion stops the shader's clock (uTime stays 0) and skips all
// entrance animation, so the canvas is deterministic and the screenshots
// need no masking.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

// ?gl turns WebGL back on under headless CI's software rasterizer: these
// two tests check how the sky itself renders.
test("screenshot: top of the home page", async ({ page }) => {
  await page.goto("/?gl");
  await skyShown(page);
  await expect(page).toHaveScreenshot("hero-dark.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("screenshot: 化物語 work page", async ({ page }) => {
  await page.goto("/works/bakemonogatari?gl");
  await skyShown(page);
  await expect(page.getByAltText("Cover art of 化物語")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page).toHaveScreenshot("work-page-bakemonogatari.png", {
    maxDiffPixelRatio: 0.02,
  });
});
