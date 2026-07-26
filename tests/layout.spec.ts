import { expect, test } from "@playwright/test";

// The desktop projects are the only ones Playwright ships, and every layout
// bug this file exists to catch hides at the width where the columns collapse.
test.use({ viewport: { width: 390, height: 844 } });

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
