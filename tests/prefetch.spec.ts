import { expect, test } from "@playwright/test";
import { HOME, heading } from "./helpers.ts";

// Every page's code is small; once the first page stands and the browser is
// idle, the rest is fetched, so no later change of page waits on the
// network — a visitor who arrived in a room has the collection ready
// behind the back chip before they reach for it.
test("the pages not yet visited are fetched while the reader reads", async ({
  page,
}) => {
  const home = page.waitForRequest(/\/assets\/Home-[^/]*\.js$/);
  await page.goto("/works/bakemonogatari");
  await home;

  // and with it fetched, leaving needs nothing more from the network
  await page.route(/\/assets\/.*\.js$/, (route) => route.abort());
  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(heading(page, HOME)).toBeVisible();
});

test("a reader saving data is not sent pages they did not ask for", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
    }),
  );
  const fetched: string[] = [];
  page.on("request", (r) => {
    if (/\/assets\/Home-[^/]*\.js$/.test(r.url())) fetched.push(r.url());
  });
  await page.goto("/works/bakemonogatari");
  await expect(page).toHaveTitle(/^化物語/);
  // everything the page was going to fetch on its own has been fetched
  await page.waitForLoadState("networkidle");
  expect(fetched).toEqual([]);
});
