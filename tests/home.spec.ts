import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero with the collection question and navigation links", async ({
    page,
  }) => {
    // The core proposition is visible
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("what beauty is worth our finite time");

    // Both main navigation paths are accessible
    await expect(
      page.getByRole("link", { name: /learn why these works matter/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /view detailed reviews/i }),
    ).toBeVisible();
  });

  test("displays all content categories with works listed", async ({
    page,
  }) => {
    // All categories render
    for (const category of ["Anime", "Movies", "Games", "Music"]) {
      await expect(
        page.getByRole("heading", { name: category }),
      ).toBeVisible();
    }

    // Works within categories actually have content (not empty sections)
    await expect(page.getByRole("heading", { name: /打ち上げ花火/ })).toBeVisible();
  });

  test("work card expands on click to show review content", async ({
    page,
  }) => {
    // Find a work card button and verify it starts collapsed
    const card = page.getByRole("button", { name: /打ち上げ花火/ });
    await expect(card).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await card.click();
    await expect(card).toHaveAttribute("aria-expanded", "true");

    // Review content becomes visible (point labels from the review data)
    await expect(card.getByText("Shinbo's stream-of-consciousness mastery")).toBeVisible();
  });

  test("work card collapses when clicked again", async ({ page }) => {
    const card = page.getByRole("button", { name: /打ち上げ花火/ });

    // Expand
    await card.click();
    await expect(card).toHaveAttribute("aria-expanded", "true");

    // Collapse
    await card.click();
    await expect(card).toHaveAttribute("aria-expanded", "false");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle("Perfect Collection");
  });
});
