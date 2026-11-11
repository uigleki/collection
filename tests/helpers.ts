import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every page is prerendered at build time (vite.config.ts) and hydrated a
 * moment after it loads; until then no key press, swipe or history change is
 * handled. So a test's `goto` returns only once the page is hydrated. The
 * signal is `history.scrollRestoration === "manual"`: the app sets it
 * (src/lib/scroll.ts) in the same pass that attaches every listener, and
 * that effect runs last. A test about the page before hydration opts out by
 * passing its own `waitUntil`.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      if (!options?.waitUntil)
        await page.waitForFunction(
          () => history.scrollRestoration === "manual",
        );
      return response;
    };
    await use(page);
  },
});
export { expect };

/** The home page's h1. The whitespace is optional because the heading wraps. */
export const HOME = /Perfect\s*Collection/;

/**
 * A work's row on the home page. The whole row is one link, and its
 * accessible name must match the one NightRow sets, so it is defined once
 * here.
 */
export const row = (page: Page, title: string) =>
  page.getByRole("link", { name: `${title} — open` });

/** The heading of the not-found page (src/pages/NotFound.tsx). */
export const NOT_FOUND = "Nothing stands here.";

/**
 * The scroll position once scrolling has stopped. The browser's smooth wheel
 * scroll continues after the last wheel event, so a fixed wait can sample a
 * position that is still changing, while the position the page saves is the
 * final one.
 */
export async function restingScrollY(page: Page): Promise<number> {
  let last = Number.NaN;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => window.scrollY);
        const still = y === last;
        last = y;
        return still;
      },
      { timeout: 5000 },
    )
    .toBe(true);
  return last;
}

/** A page's h1, which receives focus after a route change. */
export const heading = (page: Page, name: string | RegExp) =>
  page.getByRole("heading", { level: 1, name });
