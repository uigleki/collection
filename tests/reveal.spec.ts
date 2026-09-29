import { expect, test } from "@playwright/test";
import { row } from "./helpers.ts";

test.describe("entrances", () => {
  // The collection's entrances are drawn by the scroll itself, on the
  // browser's compositor: where the reader stands decides what has arrived,
  // so a jump (a restored position, a deep link, End) finds everything
  // already there — nothing starts a clock and makes the reader wait.
  test("a work scrolled straight to is already standing", async ({ page }) => {
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

  test("entrances ride the scroll where the browser can draw them so", async ({
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
    // where scroll-driven animation is missing, the page simply stands
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
