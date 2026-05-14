import { expect, test } from "@playwright/test";

test.describe("Route navigation", () => {
  test("navigates to Why page via hero link and renders content", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: /learn why these works matter/i })
      .click();

    await expect(page).toHaveURL("/why");
    await expect(page).toHaveTitle(/Why These Works/);

    // Page actually rendered meaningful content (not blank/loading)
    await expect(
      page.getByText(/The finger pointing at the moon/i),
    ).toBeVisible();
  });

  test("navigates to Reviews page via divider link and renders content", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: /view detailed reviews/i })
      .click();

    await expect(page).toHaveURL("/reviews");
    await expect(
      page.getByRole("heading", { name: "Reviews", level: 1 }),
    ).toBeVisible();

    // Content actually loaded (not just the heading)
    await expect(
      page.getByText(/Brief impressions designed to aid memory/i),
    ).toBeVisible();

    // Categories rendered on reviews page too
    await expect(
      page.getByRole("heading", { name: "Anime" }),
    ).toBeVisible();
  });

  test("back button returns to home from sub-pages", async ({ page }) => {
    await page.goto("/why");
    await page.getByRole("link", { name: "Go back to home" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("what beauty is worth our finite time");
  });
});
