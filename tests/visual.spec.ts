import { expect, test } from "@playwright/test";

// Reduced motion freezes the shader's clock (uTime stays 0) and skips all
// entrance animation, so the canvas itself is deterministic — the whole
// night can be visually pinned without masking.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

// ?gl opts back into WebGL under the software rasterizer of headless CI —
// these two tests exist to pin the sky itself.
test("the hero night", async ({ page }) => {
  await page.goto("/?gl");
  await page.waitForTimeout(900);
  await expect(page).toHaveScreenshot("hero-night.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("a room", async ({ page }) => {
  await page.goto("/works/bakemonogatari?gl");
  await page.waitForTimeout(1200);
  await expect(page).toHaveScreenshot("room-bakemonogatari.png", {
    maxDiffPixelRatio: 0.02,
  });
});
