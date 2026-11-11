import { expect, HOME, heading, test } from "./helpers.ts";

// Each page's code is small. Once the first page has loaded and the browser
// is idle, the other pages' code is fetched, so later navigation does not
// wait on the network: a visitor whose first page is a work page already
// has the home page's code when they press the back button.
test("code for pages not yet visited is prefetched after load", async ({
  page,
}) => {
  const home = page.waitForRequest(/\/assets\/Home-[^/]*\.js$/);
  await page.goto("/works/bakemonogatari");
  await home;

  // once it is fetched, going back needs no further network requests
  await page.route(/\/assets\/.*\.js$/, (route) => route.abort());
  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(heading(page, HOME)).toBeVisible();
});

test("nothing is prefetched when the Save-Data preference is set", async ({
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
  // by network idle, the page has fetched everything it fetches on its own
  await page.waitForLoadState("networkidle");
  expect(fetched).toEqual([]);
});

test("a failed prefetch raises no page error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.route(/\/assets\/Why-[^/]*\.js$/, (route) => route.abort());
  const refused = page.waitForEvent("requestfailed");
  await page.goto("/works/bakemonogatari");
  await refused;
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
