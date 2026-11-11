import { expect, heading, test } from "./helpers.ts";

// The desktop projects are the only ones Playwright ships, and every layout
// bug this file exists to catch hides at the width where the columns collapse.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

/**
 * `.link-draw` underlines by painting a background the full width of the
 * link's own box (styles/index.css). That is the text's width for an inline
 * link and nothing else — so a link whose box has been stretched by its
 * container draws a rule across the stretch, and the site claims a reader can
 * click a place they cannot.
 */
test("draws each link's underline no wider than the link", async ({ page }) => {
  await page.goto("/credits");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const overhang = await page.evaluate(() =>
    [...document.querySelectorAll("a.link-draw")].map((link) => {
      const contents = document.createRange();
      contents.selectNodeContents(link);
      return (
        link.getBoundingClientRect().width -
        contents.getBoundingClientRect().width
      );
    }),
  );

  expect(overhang.length).toBeGreaterThan(3);
  // Sub-pixel only: the box is the text, not the column it sits in.
  expect(Math.max(...overhang)).toBeLessThan(1);
});

// The mid-edge chips would sit on the reading column at this width, so they
// are gone — and a swipe alone is a path gesture, which not every reader can
// make and no screen reader announces.
test("a phone walks the shelf by links at the room's foot", async ({
  page,
}) => {
  await page.goto("/works/nisemonogatari");
  const shelf = page.getByRole("navigation", { name: "Shelf" });
  const next = shelf.getByRole("link", { name: /^Next\b.*ハイスコアガール$/ });
  await next.scrollIntoViewIfNeeded();
  const target = await next.boundingBox();
  expect(target?.height).toBeGreaterThanOrEqual(44);

  await next.tap();
  await expect(page).toHaveURL(/\/works\/hi-score-girl$/);
  await expect(heading(page, "ハイスコアガール")).toBeVisible();

  // the room just left was read to its foot: going back to it by a link is
  // a fresh visit, and a room opens at its top
  await shelf.getByRole("link", { name: /^Previous\b.*偽物語$/ }).tap();
  await expect(heading(page, "偽物語")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("the shelf's foot ends where the shelf does", async ({ page }) => {
  await page.goto("/works/bakemonogatari");
  const shelf = page.getByRole("navigation", { name: "Shelf" });
  await expect(shelf.getByRole("link", { name: /^Next\b/ })).toHaveCount(1);
  await expect(shelf.getByRole("link", { name: /^Previous\b/ })).toHaveCount(0);
});
