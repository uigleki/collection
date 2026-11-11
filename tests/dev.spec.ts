import { expect, test } from "./helpers.ts";

// Runs against the development server, where React's StrictMode unmounts
// and remounts each component right after mounting it. These tests check
// that the app also works there, not only in the production build.

test("in development mode the cover transition still runs", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.getByRole("link", { name: "化物語 — open" });
  await row.scrollIntoViewIfNeeded();
  const overlayFrames = await page.evaluate(async () => {
    document
      .querySelector<HTMLElement>('a[aria-label="化物語 — open"]')
      ?.click();
    let frames = 0;
    for (let i = 0; i < 60; i++) {
      await new Promise(requestAnimationFrame);
      if (
        document.querySelector(":popover-open img[alt='Cover art of 化物語']")
      )
        frames++;
    }
    return frames;
  });
  // the transition lasts a few hundred milliseconds, not a single frame
  expect(overlayFrames).toBeGreaterThan(8);
});

test("in development mode the first page shows without a fade-in", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const opacities: number[] = [];
    (window as unknown as { __opacities: number[] }).__opacities = opacities;
    const sample = () => {
      const layer = document.querySelector("[data-page-layer]");
      if (layer) opacities.push(Number(getComputedStyle(layer).opacity));
      if (opacities.length < 30) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __opacities: number[] }).__opacities,
      ),
    )
    .toHaveLength(30);
  const opacities = await page.evaluate(
    () => (window as unknown as { __opacities: number[] }).__opacities,
  );
  expect(Math.min(...opacities)).toBe(1);
});
