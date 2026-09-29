import { expect, type Locator, type Page, test } from "@playwright/test";
import { HOME, heading, NOT_FOUND, restingScrollY, row } from "./helpers.ts";

/** Enter a room from the spine, come back, and expect the reading position. */
async function roundTrip(
  page: Page,
  row: Locator,
  before: number,
  tolerance: number,
) {
  await row.click();
  await expect(page).toHaveURL(/girls-last-tour/);
  // rooms open at the top (once the transition settles)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);

  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - before),
    )
    .toBeLessThan(tolerance);
}

test.describe("rooms", () => {
  test("a work opens into its room", async ({ page }) => {
    await page.goto("/");
    await row(page, "化物語").click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(heading(page, "化物語")).toBeVisible();
    await expect(page.getByText("Anime 01")).toBeVisible();
    await expect(page).toHaveTitle(/化物語/);
  });

  test("prev/next walk the whole shelf and never scroll away", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    await page.getByRole("button", { name: "Next: 偽物語" }).click();
    await expect(page).toHaveURL(/\/works\/nisemonogatari$/);
    await expect(heading(page, "偽物語")).toBeVisible();
    // 化物語 is first on the whole shelf, so it has no previous
    await page.getByRole("button", { name: "Previous: 化物語" }).click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(page.getByRole("button", { name: /^Previous:/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(1);
    // the doorway stays pinned after a deep scroll
    await page.mouse.wheel(0, 2000);
    await expect(
      page.getByRole("button", { name: "Back to the collection" }),
    ).toBeInViewport();
  });

  test("a touch swipe walks the shelf, a vertical drag never does", async ({
    page,
  }) => {
    await page.goto("/works/nisemonogatari");
    // Playwright's touchscreen only taps, so the gesture is dispatched
    // directly — this is exactly what a finger sends.
    const swipe = (dx: number, dy: number) =>
      page.locator("main").evaluate(
        (main, { x, y }) => {
          const opts = { bubbles: true, pointerType: "touch", pointerId: 1 };
          main.dispatchEvent(
            new PointerEvent("pointerdown", {
              ...opts,
              clientX: 200,
              clientY: 300,
            }),
          );
          main.dispatchEvent(
            new PointerEvent("pointerup", {
              ...opts,
              clientX: 200 + x,
              clientY: 300 + y,
            }),
          );
        },
        { x: dx, y: dy },
      );
    const room = (name: string) => expect(heading(page, name)).toBeVisible();

    await swipe(-160, 10); // left → the next work
    await room("ハイスコアガール");
    await swipe(160, 10); // right → back
    await room("偽物語");

    await swipe(-160, 400); // mostly vertical: reading, not a swipe
    await swipe(-30, 0); // too short to be decisive
    await expect(page).toHaveURL(/nisemonogatari$/);
  });

  test("a room scrolls the moment it opens", async ({ page }) => {
    await page.goto("/");
    const link = row(page, "化物語");
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(heading(page, "化物語")).toBeAttached();
    // No animation owns the page: the reader's wheel is obeyed at once,
    // whatever is still settling.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 400 })
      .toBeGreaterThan(before + 100);
  });

  test("works without cover art still have complete rooms", async ({
    page,
  }) => {
    await page.goto("/works/kantoku");
    await expect(heading(page, "カントク")).toBeVisible();
    await expect(page.getByText("Artists 01")).toBeVisible();
  });

  test("flaws are stated plainly where they exist", async ({ page }) => {
    await page.goto("/works/steins-gate");
    await expect(page.getByText("Flaws, stated plainly")).toBeAttached();
    await page.goto("/works/bakemonogatari");
    await expect(page.getByText("Flaws, stated plainly")).toHaveCount(0);
  });

  test("returning to the collection restores the reading position", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    await link.scrollIntoViewIfNeeded();
    const before = await restingScrollY(page);
    expect(before).toBeGreaterThan(500);

    await roundTrip(page, link, before, 200);
  });

  test("wheel reading restores the position exactly", async ({ page }) => {
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    // Real reading: wheel down until the row sits in the viewport. Each look
    // waits for the glide to land first — a fixed pause measures a page still
    // in flight, and on a loaded machine the row never seems to arrive, so
    // the loop wheels its full thirty and the test ends up asserting about
    // the bottom of the page instead of the row it meant to open.
    for (let i = 0; i < 30; i++) {
      const box = await link.boundingBox().catch(() => null);
      if (box && box.y > 80 && box.y < 480) break;
      await page.mouse.wheel(0, 400);
      await restingScrollY(page);
    }
    // Playwright scrolls a target into view before clicking it, and that
    // nudge would move the page after the position was sampled — so it
    // happens first, and the position measured is the position clicked from.
    await link.scrollIntoViewIfNeeded();
    const before = await restingScrollY(page);
    expect(before).toBeGreaterThan(500);
    await roundTrip(page, link, before, 50);
  });

  test("a missing page says so", async ({ page }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res).not.toBeNull();
    await expect(heading(page, NOT_FOUND)).toBeVisible();
    await page.getByRole("link", { name: "Return to the collection" }).click();
    await expect(heading(page, HOME)).toBeVisible();
  });

  test("the theme toggle flips the sky and persists", async ({ page }) => {
    const theme = (value: string) =>
      expect(page.locator("html")).toHaveAttribute("data-theme", value);
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to day" }).click();
    await theme("light");
    await page.reload();
    await theme("light");
    await page.getByRole("button", { name: "Switch to night" }).click();
    await theme("dark");
  });

  test("a system switch before the app starts is still followed", async ({
    page,
  }) => {
    // Hold the app's script back: the pre-paint theme has run, the listener
    // that follows the system has not, and the system changes in between.
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/assets\/index-.*\.js$/, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    release();
    await expect(heading(page, HOME)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
