import { expect, test } from "@playwright/test";

test.describe("the collection", () => {
  test("opens on the thesis with no loader", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Perfect\s*Collection/ }),
    ).toBeVisible();
  });

  test("holds all fourteen works across the four media", async ({ page }) => {
    await page.goto("/");
    for (const name of ["Anime", "Movies", "Games", "Artists"]) {
      await expect(
        page.getByRole("heading", { level: 2, name }),
      ).toBeAttached();
    }
    await expect(page.locator('a[aria-label$="— open"]')).toHaveCount(14);
    await expect(page.getByText("カントク").first()).toBeAttached();
  });

  test("says the koan and points to why", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("The finger pointing at the moon is not the moon."),
    ).toBeAttached();
    await page.getByRole("link", { name: "Why these works" }).click();
    await expect(page).toHaveURL(/\/why$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Why These Works" }),
    ).toBeVisible();
  });

  test("carries all 49 songs on the water", async ({ page }) => {
    await page.goto("/");
    const rows = page.locator('section[aria-label="Music"] li');
    await expect(rows).toHaveCount(49);
    const row = rows.filter({ hasText: "朧月" });
    await expect(row).toHaveCount(1);
    await expect(row.getByText("minato & 初音ミク")).toBeAttached();
  });

  test("ends on the essay's own final beat", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 2, name: /found it/ }),
    ).toBeAttached();
    await expect(
      page.getByText("The beauty you were born to experience?"),
    ).toBeAttached();
    await expect(page.getByRole("link", { name: "Colophon" })).toBeAttached();
  });

  test("titles carry their language for correct letterforms", async ({
    page,
  }) => {
    await page.goto("/");
    const bakemono = page.locator('h3[lang="ja"]', { hasText: "化物語" });
    await expect(bakemono).toBeAttached();
    const zh = page.locator('[lang="zh-Hans"]', { hasText: "海棠仙" });
    await expect(zh).toBeAttached();
  });
});
