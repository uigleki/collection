import { expect, row, test } from "./helpers.ts";

test.describe("entrance animations", () => {
  // The home page's entrance animations are scroll-driven and run on the
  // compositor: the scroll position alone decides how far each has played.
  // So after a jump (a restored position, a deep link, End) the content at
  // that position is already fully shown; no timed animation has to finish.
  test("a work jumped to by scrolling is already fully visible", async ({
    page,
  }) => {
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    await expect(link).toBeAttached();
    await link.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - window.innerHeight / 3,
        behavior: "instant",
      });
    });
    await page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
    const article = page.locator("article", { has: link });
    expect(
      await article.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBeGreaterThan(0.95);
  });
});
