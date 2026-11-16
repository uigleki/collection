import { load } from "../src/content/load.ts";
import { expect, HOME, heading, musicSection, rows, test } from "./helpers.ts";

// The collection as README.md lists it.
const { categories, music } = load().collection;

test.describe("home page", () => {
  test("shows the Perfect Collection heading", async ({ page }) => {
    await page.goto("/");
    await expect(heading(page, HOME)).toBeVisible();
  });

  test("lists every work under its category heading", async ({ page }) => {
    await page.goto("/");
    for (const { name } of categories) {
      await expect(
        page.getByRole("heading", { level: 2, name }),
      ).toBeAttached();
    }
    await expect(rows(page)).toHaveCount(
      categories.reduce((n, c) => n + c.works.length, 0),
    );
  });

  test("shows the moon quote and links to /why", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("The finger pointing at the moon is not the moon."),
    ).toBeAttached();
    await page.getByRole("link", { name: "Why these works" }).click();
    await expect(page).toHaveURL(/\/why$/);
    await expect(heading(page, "Why These Works")).toBeVisible();
  });

  test("lists every song in the Music section", async ({ page }) => {
    await page.goto("/");
    const rows = musicSection(page).locator("li");
    await expect(rows).toHaveCount(music.length);
    const row = rows.filter({ hasText: "朧月" });
    await expect(row).toHaveCount(1);
    await expect(row.getByText("湊貴大 feat. 初音ミク")).toBeAttached();
  });

  test("ends with the essay's closing lines and a Colophon link", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 2, name: /found it/ }),
    ).toBeAttached();
    await expect(
      page.getByText("The beauty you were born to experience?"),
    ).toBeAttached();
    await expect(page.getByRole("link", { name: "Colophon" })).toBeAttached();
  });

  test("titles have a lang attribute matching their language", async ({
    page,
  }) => {
    await page.goto("/");
    const title = page.locator('h3[lang="ja"]', { hasText: "化物語" });
    await expect(title).toBeAttached();
    const zh = page.locator('[lang="zh-Hans"]', { hasText: "海棠仙" });
    await expect(zh).toBeAttached();
  });

  test("a performer's lang attribute does not cover the song title", async ({
    page,
  }) => {
    await page.goto("/");
    // 凛々咲 sings "Letters From Heaven": the name is marked lang="ja", and
    // the Latin title must stay outside that element.
    const row = musicSection(page).locator("li", {
      hasText: "Letters From Heaven",
    });
    const japanese = row.locator('[lang="ja"]');
    await expect(japanese).toHaveCount(1);
    await expect(japanese).toContainText("Capchii feat. 凛々咲");
    await expect(japanese).not.toContainText("Letters From Heaven");
  });
});
