import { test as base, expect, type Page } from "@playwright/test";

// What the specs' init scripts put on the page's window.
declare global {
  interface Window {
    __cover: (title: string, page: string) => Promise<DOMRect>;
    __opacities: number[];
    blocked: (what: string) => void;
    skyDraws: number;
    webglRequests: number;
  }
}

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
 * accessible name must match the one WorkRow sets, so it is defined once
 * here.
 */
export const row = (page: Page, title: string) =>
  page.getByRole("link", { name: `${title} — open` });

/** Every work's row on the home page. */
export const rows = (page: Page) =>
  page.getByRole("link", { name: / — open$/ });

/**
 * Store a theme before any page script runs, so the next page loads in it:
 * the inline theme script reads the stored theme at document start.
 */
export const presetTheme = (page: Page, theme: "dark" | "light") =>
  page.addInitScript((t) => localStorage.setItem("theme", t), theme);

/** Each theme's page background (--color-background in index.css). */
export const BACKGROUND = {
  dark: "rgb(11, 14, 23)",
  light: "rgb(242, 236, 224)",
};

/**
 * Expects the page to show the given theme, by its background color. Waits
 * for the color transition to finish.
 */
export const expectTheme = (page: Page, theme: "dark" | "light") =>
  expect(page.locator("html")).toHaveCSS("background-color", BACKGROUND[theme]);

/** The heading of the not-found page (src/pages/NotFound.tsx). */
export const NOT_FOUND = "Nothing stands here.";

/**
 * The scroll position once scrolling has stopped. The browser's smooth wheel
 * scroll continues after the last wheel event, so a fixed wait can sample a
 * position that is still changing, while the position the page saves is the
 * final one.
 */
export async function settledScrollY(page: Page): Promise<number> {
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

/** The home page's music section, found by its heading. */
export const musicSection = (page: Page) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { level: 2, name: "Music" }) });
