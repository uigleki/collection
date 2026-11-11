import { expect, test } from "./helpers.ts";

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
  await page.waitForTimeout(900);
  await expect(page).toHaveScreenshot("hero-night.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("screenshot: 化物語 work page", async ({ page }) => {
  await page.goto("/works/bakemonogatari?gl");
  await page.waitForTimeout(1200);
  await expect(page).toHaveScreenshot("room-bakemonogatari.png", {
    maxDiffPixelRatio: 0.02,
  });
});
