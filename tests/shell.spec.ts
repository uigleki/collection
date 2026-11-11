import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { origin } from "../src/data/site.ts";
import { expect, HOME, heading, NOT_FOUND, row, test } from "./helpers.ts";

// dist/ is what the preview server is already serving (see playwright.config).
const dist = (file: string) =>
  readFileSync(resolve(import.meta.dirname, "..", "dist", file), "utf8");

/**
 * The response headers are in dist/_headers, which only Cloudflare applies:
 * vite preview ignores the file. So these tests read the headers from the
 * build and add them to the page responses themselves. Otherwise a wrong
 * header would fail only in production, unnoticed.
 */
test.describe("built site", () => {
  /** The headers in the `/*` section of dist/_headers: sent with every page. */
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

  // A work page and the home page: together they use every kind of resource
  // the Content-Security-Policy has to allow.
  const VISITS = ["/works/bakemonogatari", "/"] as const;

  test("the CSP has no 'unsafe-' source except for style attributes", () => {
    const unsafe = edgeHeaders()
      ["content-security-policy"]?.split("; ")
      .filter((directive) => directive.includes("'unsafe-"));
    expect(unsafe).toEqual(["style-src-attr 'unsafe-inline'"]);
  });

  test("pages load with no CSP violation under the production headers", async ({
    page,
  }) => {
    const violations: string[] = [];
    // Listen for the securitypolicyviolation event as well as the console:
    // Firefox reports a blocked style neither to the console Playwright
    // listens to nor as a pageerror.
    await page.exposeFunction("blocked", (what: string) => {
      violations.push(what);
    });
    await page.addInitScript(() =>
      document.addEventListener("securitypolicyviolation", (e) =>
        (window as unknown as { blocked: (what: string) => void }).blocked(
          `${e.effectiveDirective} blocked ${e.blockedURI}`,
        ),
      ),
    );
    page.on("console", (m) => {
      if (/content security policy|trusted type|cross-origin/i.test(m.text()))
        violations.push(m.text());
    });
    page.on("pageerror", (e) => violations.push(String(e)));

    // Only the two document responses get the headers: the policy is sent
    // with the document, and the browser applies it to everything the page
    // loads. Routing subresources too would race every navigation (requests
    // still pending when the next goto starts are disposed before they can
    // be fulfilled) and pass every chunk, font and cover through the driver
    // for no benefit.
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

    // One visit that uses everything the policy must allow: the inline theme
    // script, the shader, the self-hosted fonts, the data: cover
    // placeholders, the accent styles, and a cover transition.
    await page.goto(VISITS[0]);
    await expect(heading(page, "化物語")).toBeVisible();
    await page.goto(VISITS[1]);
    await expect(heading(page, HOME)).toBeVisible();
    await expect(page.locator("img").first()).toBeVisible();
    await row(page, "化物語").click();
    await expect(heading(page, "化物語")).toBeVisible();

    expect(violations).toEqual([]);
  });

  test("every URL in sitemap.xml resolves to a page", async ({ page }) => {
    const paths = [...dist("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1] ?? "").pathname,
    );
    expect(paths.length).toBeGreaterThan(3);

    for (const path of paths) {
      await page.goto(path);
      await expect(heading(page, NOT_FOUND)).toHaveCount(0);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("each route's canonical link is its own URL", async ({ page }) => {
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

/**
 * Every page is prerendered to its own HTML file at build time
 * (vite.config.ts), so it can be read before its script runs. On a phone
 * that can be seconds before the script has been parsed.
 */
test.describe("prerendered pages", () => {
  const WRITTEN = [
    ["/", /^Perfect Collection$/],
    ["/works/bakemonogatari", /^化物語 — /],
    ["/works/kantoku", /^カントク — /],
    ["/why", / — Perfect Collection$/],
    ["/credits", /^Colophon — /],
  ] as const;

  test("render with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const art = page.waitForResponse(/\/assets\/bakemonogatari-[^/]*\.webp$/);
    await page.goto("/works/bakemonogatari");
    expect((await art).ok()).toBe(true);
    await expect(page.getByAltText("Cover art of 化物語")).toHaveCSS(
      "opacity",
      "1",
    );

    for (const [path, title] of WRITTEN) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveTitle(title);
    }
    await context.close();
  });

  for (const reader of [
    { theme: "dark", reducedMotion: "no-preference" },
    { theme: "light", reducedMotion: "reduce" },
  ] as const) {
    test(`hydrate in place with no React errors (${reader.theme})`, async ({
      page,
    }) => {
      const errors: string[] = [];
      // Only React's errors count: the missing page is requested on
      // purpose, and the browser logs its 404 as a console error
      const note = (said: string) => {
        if (/react|hydrat/i.test(said)) errors.push(said);
      };
      page.on("pageerror", (e) => note(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") note(m.text());
      });
      await page.emulateMedia({ reducedMotion: reader.reducedMotion });
      await page.addInitScript((theme) => {
        localStorage.setItem("theme", theme);
      }, reader.theme);

      // The page's scripts are held back until released, so the page can be
      // inspected before hydration.
      let waiting: (() => void)[] = [];
      let held = true;
      const letIn = () => {
        held = false;
        for (const open of waiting) open();
        waiting = [];
      };
      await page.route(/\/assets\/[^/]*\.js$/, async (route) => {
        if (held) await new Promise<void>((open) => waiting.push(open));
        await route.continue();
      });

      type Marked = HTMLElement & { written?: boolean };
      const adopted = (h1: Marked) =>
        Object.keys(h1).some((key) => key.startsWith("__react"));

      for (const [path] of [...WRITTEN, ["/works/does-not-exist"] as const]) {
        held = true;
        // not "load": the scripts are being held back, and load waits on them
        await page.goto(path, { waitUntil: "commit" });
        const h1 = page.locator("h1");
        await expect(h1).toBeVisible();
        expect(await h1.evaluate(adopted)).toBe(false);
        await h1.evaluate((el: Marked) => {
          el.written = true;
        });

        letIn();
        await expect.poll(() => h1.evaluate(adopted)).toBe(true);
        // React adopted the existing h1 element instead of replacing it
        expect(await h1.evaluate((el: Marked) => el.written)).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }

  test("declare their charset within the first 1024 bytes", () => {
    for (const [path] of WRITTEN) {
      const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
      // The HTML spec has a browser determine the encoding from a page's
      // first 1024 bytes, before parsing them
      const opening = Buffer.from(dist(file)).subarray(0, 1024);
      expect(opening.toString("latin1"), file).toMatch(/<meta charset=/i);
    }
  });

  test("an unknown path gets a 404 status and the not-found page", async ({
    page,
    request,
  }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(heading(page, NOT_FOUND)).toBeVisible();
    await expect(page).toHaveTitle(/^Not found — /);
    // a request for a chunk from an old build must get a 404, not an HTML
    // page that would be cached as a script for a year
    expect((await request.get("/assets/gone-abc123.js")).status()).toBe(404);
  });
});
