import { expect, test } from "@playwright/test";

// Run against the development server, where React checks the app by
// detaching and reattaching what it has just attached. What survives only in
// the production build has not really been made to work.

test("under React's development checks the cover still flies", async ({
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
  // a flight is a few hundred milliseconds, not a single frame
  expect(aloft).toBeGreaterThan(8);
});

test("under React's development checks the first page is simply there", async ({
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
