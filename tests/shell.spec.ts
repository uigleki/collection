import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { origin } from "../src/data/site.ts";
import { expect, HOME, heading, NOT_FOUND, row, test } from "./helpers.ts";

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

  test("allows nothing unsafe but a style attribute", () => {
    const unsafe = edgeHeaders()
      ["content-security-policy"]?.split("; ")
      .filter((directive) => directive.includes("'unsafe-"));
    expect(unsafe).toEqual(["style-src-attr 'unsafe-inline'"]);
  });

  test("runs clean under the headers it ships with", async ({ page }) => {
    const violations: string[] = [];
    // The event as well as the console: Firefox reports a blocked style to
    // neither the console Playwright hears nor pageerror.
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
    // the self-hosted fonts, the data: cover placeholders, the accent styles,
    // and a cover's flight.
    await page.goto(VISITS[0]);
    await expect(heading(page, "化物語")).toBeVisible();
    await page.goto(VISITS[1]);
    await expect(heading(page, HOME)).toBeVisible();
    await expect(page.locator("img").first()).toBeVisible();
    await row(page, "化物語").click();
    await expect(heading(page, "化物語")).toBeVisible();

    expect(violations).toEqual([]);
  });

  test("advertises only URLs that resolve", async ({ page }) => {
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

/**
 * Every page is written out by the build (vite.config.ts), so what arrives is
 * the page — on a phone it is read seconds before the script that will run it
 * has even been parsed.
 */
test.describe("the written pages", () => {
  const WRITTEN = [
    ["/", /^Perfect Collection$/],
    ["/works/bakemonogatari", /^化物語 — /],
    ["/works/kantoku", /^カントク — /],
    ["/why", / — Perfect Collection$/],
    ["/credits", /^Colophon — /],
  ] as const;

  test("stand before any script runs", async ({ browser }) => {
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
    test(`are taken over as they stand (${reader.theme})`, async ({ page }) => {
      const errors: string[] = [];
      // React's own complaints only: the missing page is meant to be
      // missing, and the browser says so
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

      // The page's scripts wait at the door until they are let in, so the
      // page can be looked at as it arrived.
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
        // the heading React runs is the one the reader was already reading
        expect(await h1.evaluate((el: Marked) => el.written)).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }

  test("name their encoding where a browser looks for it", () => {
    for (const [path] of WRITTEN) {
      const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
      // HTML has a browser settle the encoding from a page's first 1024
      // bytes, before it parses any of them
      const opening = Buffer.from(dist(file)).subarray(0, 1024);
      expect(opening.toString("latin1"), file).toMatch(/<meta charset=/i);
    }
  });

  test("answer 404 for what is not there", async ({ page, request }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(heading(page, NOT_FOUND)).toBeVisible();
    await expect(page).toHaveTitle(/^Not found — /);
    // a chunk from a build long gone must not come back as a page, cached
    // as a script for a year
    expect((await request.get("/assets/gone-abc123.js")).status()).toBe(404);
  });
});
