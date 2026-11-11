import { expect, heading, test } from "./helpers.ts";

// Every project is a desktop browser (playwright.config.ts), and the layout
// bugs this file checks for appear only at a narrow width, where the columns
// collapse into one.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

/**
 * `.link-draw` draws its underline as a background across the full width of
 * the link's box (styles/index.css). For an inline link that is the width of
 * the text. If a container stretches the link's box, the underline extends
 * past the text and marks empty space as part of the link.
 */
test("each .link-draw underline is no wider than the link's text", async ({
  page,
}) => {
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
  // Under 1px: the link's box is as wide as its text, not as its column.
  expect(Math.max(...overhang)).toBeLessThan(1);
});

// At this width the previous/next buttons at the screen edges would cover
// the text column, so they are hidden. A swipe alone is not enough: it is a
// path-based gesture, which some users cannot make and no screen reader
// announces.
test("narrow touch screen: bottom links go to the previous/next work", async ({
  page,
}) => {
  await page.goto("/works/nisemonogatari");
  const nav = page.getByRole("navigation", { name: "Shelf" });
  const next = nav.getByRole("link", { name: /^Next\b.*ハイスコアガール$/ });
  await next.scrollIntoViewIfNeeded();
  const target = await next.boundingBox();
  expect(target?.height).toBeGreaterThanOrEqual(44);

  await next.tap();
  await expect(page).toHaveURL(/\/works\/hi-score-girl$/);
  await expect(heading(page, "ハイスコアガール")).toBeVisible();

  // the previous work page was left scrolled to its bottom; opening it again
  // by a link is a new visit, and a work page opens at its top
  await nav.getByRole("link", { name: /^Previous\b.*偽物語$/ }).tap();
  await expect(heading(page, "偽物語")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("the first work has a bottom next link and no previous link", async ({
  page,
}) => {
  await page.goto("/works/bakemonogatari");
  const nav = page.getByRole("navigation", { name: "Shelf" });
  await expect(nav.getByRole("link", { name: /^Next\b/ })).toHaveCount(1);
  await expect(nav.getByRole("link", { name: /^Previous\b/ })).toHaveCount(0);
});
