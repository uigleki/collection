import { expect, type Page } from "@playwright/test";

/** The home page's own heading — spelled loosely because it wraps. */
export const HOME = /Perfect\s*Collection/;

/**
 * A work's row on the home spine. The whole row is one link, and its label
 * is a contract with NightRow — asserted from three specs, so it is named
 * once here.
 */
export const row = (page: Page, title: string) =>
  page.getByRole("link", { name: `${title} — open` });

/** What a page that isn't in the collection says (src/pages/NotFound.tsx). */
export const NOT_FOUND = "Nothing stands here.";

/**
 * Where the reader actually came to rest. The browser's smooth wheel scroll
 * glides on after the last wheel event, so any fixed wait samples a position
 * still in flight — while the position the page remembers is the one it
 * stopped at. Waiting for stillness is waiting for the real thing.
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

/** The heading a route lands on, and moves focus to. */
export const heading = (page: Page, name: string | RegExp) =>
  page.getByRole("heading", { level: 1, name });
