import { expect, type Locator, type Page, test } from "@playwright/test";

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
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 4000 })
    .toBeLessThan(50);

  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(
      async () =>
        Math.abs((await page.evaluate(() => window.scrollY)) - before),
      { timeout: 4000 },
    )
    .toBeLessThan(tolerance);
}

test.describe("rooms", () => {
  test("a work opens into its room", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "化物語 — open" }).click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "化物語" }),
    ).toBeVisible();
    await expect(page.getByText("Anime 01")).toBeVisible();
    await expect(page).toHaveTitle(/化物語/);
  });

  test("prev/next stay within the medium and never scroll away", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    await page.getByRole("button", { name: "Next: 偽物語" }).click();
    await expect(page).toHaveURL(/\/works\/nisemonogatari$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "偽物語" }),
    ).toBeVisible();
    // first of its medium has no previous
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

  test("works without cover art still have complete rooms", async ({
    page,
  }) => {
    await page.goto("/works/kantoku");
    await expect(
      page.getByRole("heading", { level: 1, name: "カントク" }),
    ).toBeVisible();
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
    const row = page.getByRole("link", { name: "少女終末旅行 — open" });
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(500);

    await roundTrip(page, row, before, 200);
  });

  test("smooth scrolling restores the position exactly", async ({ page }) => {
    await page.goto("/");
    const row = page.getByRole("link", { name: "少女終末旅行 — open" });
    // real reading: wheel down until the row sits in the viewport
    for (let i = 0; i < 30; i++) {
      const box = await row.boundingBox().catch(() => null);
      if (box && box.y > 80 && box.y < 480) break;
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(700); // lenis settles
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(500);
    await roundTrip(page, row, before, 50);
  });

  test("a missing page says so", async ({ page }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res).not.toBeNull();
    await expect(page.getByText("Nothing stands here.")).toBeVisible();
    await page.getByRole("link", { name: "Return to the collection" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: /Perfect\s*Collection/ }),
    ).toBeVisible();
  });

  test("the theme toggle flips the sky and persists", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to day" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Switch to night" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
