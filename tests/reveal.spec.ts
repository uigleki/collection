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
    await page.evaluate(() => {
      const el = document.querySelector('a[aria-label="少女終末旅行 — open"]');
      const top = (el?.getBoundingClientRect().top ?? 0) + window.scrollY;
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

  test("uses a view() timeline where supported; else content is shown", async ({
    page,
  }) => {
    await page.goto("/");
    const timeline = await page
      .locator("article")
      .first()
      .evaluate((el) =>
        CSS.supports("animation-timeline: view()")
          ? getComputedStyle(el).animationTimeline
          : null,
      );
    // without scroll-driven animation support, content is shown unanimated
    if (timeline === null) {
      const opacity = await page
        .locator("article")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity);
      expect(opacity).toBe("1");
    } else {
      expect(timeline).toContain("view");
    }
  });
});
