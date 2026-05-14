import { expect, test } from "@playwright/test";

test("PWA manifest is served and contains correct app metadata", async ({
  page,
}) => {
  await page.goto("/");

  const manifestLink = page.locator('head link[rel="manifest"]');
  await expect(manifestLink).toBeAttached();

  const href = await manifestLink.getAttribute("href");
  expect(href).toBeTruthy();

  const response = await page.request.get(href!);
  expect(response.ok()).toBe(true);

  const manifest = await response.json();
  expect(manifest.name).toBe("Perfect Collection");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
});
