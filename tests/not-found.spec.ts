import { expect, test } from "@playwright/test";

test("unknown routes display 404 page with navigation back", async ({
  page,
}) => {
  await page.goto("/this-page-does-not-exist");

  await expect(page).toHaveTitle(/Page Not Found/);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("Page not found")).toBeVisible();

  // User can get back to home
  await page.getByRole("link", { name: "Back to Home" }).click();
  await expect(page).toHaveURL("/");
});
