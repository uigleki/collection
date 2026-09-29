import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { origin } from "../src/data/site.ts";
import { HOME, heading, NOT_FOUND } from "./helpers.ts";

// dist/ is what the preview server is already serving (see playwright.config).
const dist = (file: string) =>
  readFileSync(resolve(import.meta.dirname, "..", "dist", file), "utf8");

/**
 * The edge's headers are a file the browser never sees while these tests run
 * — vite preview does not apply _headers, and Cloudflare is not here. So they
 * are read out of the build and applied to the real pages by hand. Untested
 * headers are worse than none: they fail silently, in production, on the one
 * visitor who reported nothing.
 */
test.describe("the shipped shell", () => {
  /** Everything the edge sends with every document, as the browser gets it. */
  const edgeHeaders = () => {
    const lines = dist("_headers").split("\n");
    const start = lines.indexOf("/*");
    if (start === -1) throw new Error("no /* section in dist/_headers");
    const headers: Record<string, string> = {};
    for (const line of lines.slice(start + 1)) {
      if (!line.startsWith("  ")) break; // the section ends at the next path
      const at = line.indexOf(":");
      const name = line.slice(0, at).trim().toLowerCase();
      if (name) headers[name] = line.slice(at + 1).trim();
    }
    if (!headers["content-security-policy"])
      throw new Error("no Content-Security-Policy in dist/_headers");
    return headers;
  };

  // A room and the spine: between them they exercise every kind of thing the
  // policy has to allow.
  const VISITS = ["/works/bakemonogatari", "/"] as const;

  test("runs clean under the headers it ships with", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/content security policy|trusted type|cross-origin/i.test(m.text()))
        violations.push(m.text());
    });
    page.on("pageerror", (e) => violations.push(String(e)));

    // Only the two documents are rewritten — the policies arrive with the page
    // and the browser applies them to everything the page then loads. Routing
    // the subresources too would race every navigation (the ones still in
    // flight when the next goto starts are disposed before they can be
    // fulfilled) and send every chunk, font and cover out through the driver
    // for nothing.
    await page.route(
      (url) => VISITS.some((path) => path === url.pathname),
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({
          response,
          headers: { ...response.headers(), ...edgeHeaders() },
        });
      },
    );

    // The whole vocabulary in one visit: the inline theme script, the shader,
    // the self-hosted fonts, the data: cover placeholders, the accent styles.
    await page.goto(VISITS[0]);
    await expect(heading(page, "化物語")).toBeVisible();
    await page.goto(VISITS[1]);
    await expect(heading(page, HOME)).toBeVisible();
    await expect(page.locator("img").first()).toBeVisible();

    expect(violations).toEqual([]);
  });

  test("advertises only URLs that resolve", async ({ page }) => {
    const paths = [...dist("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1] ?? "").pathname,
    );
    expect(paths.length).toBeGreaterThan(3);

    for (const path of paths) {
      await page.goto(path);
      // Every listed URL is a real page, never the soft 404 the SPA rewrite
      // would otherwise hand a crawler with a 200.
      await expect(heading(page, NOT_FOUND)).toHaveCount(0);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("names each route as its own canonical URL", async ({ page }) => {
    await page.goto("/why");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${origin}/why`,
    );
    await page.goto("/works/kantoku");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${origin}/works/kantoku`,
    );
  });
});
