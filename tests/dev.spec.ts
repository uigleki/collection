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
  const aloft = await page.evaluate(async () => {
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
  expect(aloft).toBeGreaterThan(8);
});

test("in development mode the first page shows without a fade-in", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const seen: number[] = [];
    (window as unknown as { __seen: number[] }).__seen = seen;
    const look = () => {
      const scene = document.querySelector("[data-scene]");
      if (scene) seen.push(Number(getComputedStyle(scene).opacity));
      if (seen.length < 30) requestAnimationFrame(look);
    };
    requestAnimationFrame(look);
  });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __seen: number[] }).__seen),
    )
    .toHaveLength(30);
  const seen = await page.evaluate(
    () => (window as unknown as { __seen: number[] }).__seen,
  );
  expect(Math.min(...seen)).toBe(1);
});
