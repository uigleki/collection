import type { Locator, Page } from "@playwright/test";
import {
  expect,
  HOME,
  heading,
  NOT_FOUND,
  restingScrollY,
  row,
  test,
} from "./helpers.ts";

/**
 * Open a work page from the home page, go back, and expect the home page's
 * scroll position to be restored.
 */
async function roundTrip(
  page: Page,
  row: Locator,
  before: number,
  tolerance: number,
) {
  await row.click();
  await expect(page).toHaveURL(/girls-last-tour/);
  // work pages open scrolled to the top (once the transition has finished)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);

  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - before),
    )
    .toBeLessThan(tolerance);
}

// Playwright's touchscreen can only tap, so a swipe is dispatched as raw
// pointer events: pointerdown, a series of pointermove, then pointerup.
async function swipe(
  page: Page,
  dx: number,
  dy: number,
  { release: lift = true } = {},
) {
  await page.getByRole("main").evaluate(
    (main, { dx, dy, lift }) => {
      const at = (type: string, x: number, y: number) =>
        new PointerEvent(type, {
          bubbles: true,
          pointerType: "touch",
          pointerId: 1,
          isPrimary: true,
          clientX: 200 + x,
          clientY: 300 + y,
        });
      main.dispatchEvent(at("pointerdown", 0, 0));
      for (let i = 1; i <= 8; i++)
        main.dispatchEvent(at("pointermove", (dx * i) / 8, (dy * i) / 8));
      if (lift) main.dispatchEvent(at("pointerup", dx, dy));
    },
    { dx, dy, lift },
  );
}

/** End a swipe that was held at (dx, dy) by dispatching pointerup. */
async function release(page: Page, dx: number, dy: number) {
  await page.evaluate(
    ({ dx, dy }) =>
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerType: "touch",
          pointerId: 1,
          isPrimary: true,
          clientX: 200 + dx,
          clientY: 300 + dy,
        }),
      ),
    { dx, dy },
  );
}

test.describe("work pages", () => {
  test("clicking a work on the home page opens its work page", async ({
    page,
  }) => {
    await page.goto("/");
    await row(page, "化物語").click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(heading(page, "化物語")).toBeVisible();
    // the home page may still be fading out; scope to the work page's main
    await expect(page.getByRole("main").getByText("Anime 01")).toBeVisible();
    await expect(page).toHaveTitle(/化物語/);
  });

  test("previous/next buttons change work; back button stays in view", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    await page.getByRole("button", { name: "Next: 偽物語" }).click();
    await expect(page).toHaveURL(/\/works\/nisemonogatari$/);
    await expect(heading(page, "偽物語")).toBeVisible();
    // 化物語 is the first work overall, so it has no previous button
    await page.getByRole("button", { name: "Previous: 化物語" }).click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(page.getByRole("button", { name: /^Previous:/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(1);
    // the back button stays fixed in the viewport after a long scroll
    await page.mouse.wheel(0, 2000);
    await expect(
      page.getByRole("button", { name: "Back to the collection" }),
    ).toBeInViewport();
  });

  test("only a long, mostly horizontal touch swipe changes work", async ({
    page,
  }) => {
    await page.goto("/works/nisemonogatari");
    const room = (name: string) => expect(heading(page, name)).toBeVisible();

    await swipe(page, -160, 10); // left → the next work
    await room("ハイスコアガール");
    await swipe(page, 160, 10); // right → the previous work
    await room("偽物語");

    await swipe(page, -160, 400); // mostly vertical: scrolling, not a swipe
    await swipe(page, -30, 0); // too short to count, at any speed
    await expect(page).toHaveURL(/nisemonogatari$/);
  });

  test("held swipe drags the page; at the first work it springs back", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    const title = heading(page, "化物語");
    await expect(title).toBeVisible();
    const at = async () => (await title.boundingBox())?.x ?? 0;
    const rest = await at();

    // held, not released: the page has moved with the pointer
    await swipe(page, -120, 0, { release: false });
    await expect.poll(async () => (await at()) - rest).toBeLessThan(-100);
    await release(page, -120, 0);
    await expect(page).toHaveURL(/nisemonogatari$/);

    // 化物語 is the first work, so a swipe toward the previous one moves the
    // page only slightly, and it springs back on release
    await page.goto("/works/bakemonogatari");
    await expect(title).toBeVisible();
    await swipe(page, 200, 0, { release: false });
    await expect.poll(async () => (await at()) - rest).toBeGreaterThan(5);
    expect((await at()) - rest).toBeLessThan(100);
    await release(page, 200, 0);
    await expect
      .poll(async () => Math.abs((await at()) - rest))
      .toBeLessThan(2);
    await expect(page).toHaveURL(/bakemonogatari$/);
  });

  test("the arrow keys move to the next and previous work", async ({
    page,
  }) => {
    await page.goto("/works/nisemonogatari");
    await expect(page).toHaveTitle(/^偽物語/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveTitle(/^ハイスコアガール/);
    await page.keyboard.press("ArrowLeft");
    await expect(heading(page, "偽物語")).toBeVisible();
  });

  test("a work page can be scrolled as soon as it opens", async ({ page }) => {
    await page.goto("/");
    const link = row(page, "化物語");
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(heading(page, "化物語")).toBeAttached();
    // No animation blocks scrolling: the wheel scrolls the page at once,
    // even while the page transition is still running.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 400 })
      .toBeGreaterThan(before + 100);
  });

  test("a back navigation the browser animated is not animated again", async ({
    page,
  }) => {
    // What a phone's edge-swipe back reports: the browser has already
    // animated the navigation.
    await page.addInitScript(() =>
      window.addEventListener(
        "popstate",
        (e) =>
          Object.defineProperty(e, "hasUAVisualTransition", { value: true }),
        { capture: true },
      ),
    );
    await page.goto("/");
    await row(page, "化物語").click();
    await expect(page).toHaveTitle(/^化物語/);
    await expect(page.locator("[data-scene]")).toHaveCount(1);
    const scenes = await page.evaluate(async () => {
      history.back();
      await new Promise((r) => addEventListener("popstate", r, { once: true }));
      const counts: number[] = [];
      for (let i = 0; i < 6; i++) {
        await new Promise(requestAnimationFrame);
        counts.push(document.querySelectorAll("[data-scene]").length);
      }
      return counts;
    });
    // the work page is removed at once: no outgoing page is kept to fade out
    expect(Math.max(...scenes)).toBe(1);
  });

  test("a work without cover art still has a full work page", async ({
    page,
  }) => {
    await page.goto("/works/kantoku");
    await expect(heading(page, "カントク")).toBeVisible();
    await expect(page.getByText("Artists 01")).toBeVisible();
  });

  test("the flaws section is shown only for works that list flaws", async ({
    page,
  }) => {
    await page.goto("/works/steins-gate");
    await expect(page.getByText("Flaws, stated plainly")).toBeAttached();
    await page.goto("/works/bakemonogatari");
    await expect(page.getByText("Flaws, stated plainly")).toHaveCount(0);
  });

  test("going back to the home page restores the scroll position", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    await link.scrollIntoViewIfNeeded();
    const before = await restingScrollY(page);
    expect(before).toBeGreaterThan(500);

    await roundTrip(page, link, before, 200);
  });

  test("going back restores the scroll position after wheel scrolling", async ({
    page,
  }) => {
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    // Scroll with the wheel until the row is in the viewport. Each check
    // waits for the smooth scroll to stop first: after a fixed pause the
    // page may still be moving, and on a loaded machine the row is then
    // never seen in range, so the loop runs all thirty steps and the test
    // ends up at the bottom of the page instead of at the row.
    for (let i = 0; i < 30; i++) {
      const box = await link.boundingBox().catch(() => null);
      if (box && box.y > 80 && box.y < 480) break;
      await page.mouse.wheel(0, 400);
      await restingScrollY(page);
    }
    // Playwright scrolls a target into view before clicking it, which would
    // move the page after the position was sampled. So the row is scrolled
    // into view first, and the position is sampled after that.
    await link.scrollIntoViewIfNeeded();
    const before = await restingScrollY(page);
    expect(before).toBeGreaterThan(500);
    await roundTrip(page, link, before, 50);
  });

  test("an unknown URL shows the not-found page and a link home", async ({
    page,
  }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res).not.toBeNull();
    await expect(heading(page, NOT_FOUND)).toBeVisible();
    await page.getByRole("link", { name: "Return to the collection" }).click();
    await expect(heading(page, HOME)).toBeVisible();
  });

  test("the theme toggle switches theme; the choice survives a reload", async ({
    page,
  }) => {
    const theme = (value: string) =>
      expect(page.locator("html")).toHaveAttribute("data-theme", value);
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to day" }).click();
    await theme("light");
    await page.reload();
    await theme("light");
    await page.getByRole("button", { name: "Switch to night" }).click();
    await theme("dark");
  });

  test("theme-color matches the page background after a theme switch", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    // The color the browser uses for its own UI (the first theme-color meta
    // whose media query matches) and the page's background color.
    const colors = () =>
      page.evaluate(() => {
        const meta = [
          ...document.querySelectorAll<HTMLMetaElement>(
            'meta[name="theme-color"]',
          ),
        ].find((m) => matchMedia(m.media || "all").matches);
        const probe = document.createElement("i");
        probe.style.color = meta?.content ?? "";
        document.body.append(probe);
        const chrome = getComputedStyle(probe).color;
        probe.remove();
        return {
          chrome,
          ground: getComputedStyle(document.documentElement).backgroundColor,
        };
      });
    const agree = async () => {
      const { chrome, ground } = await colors();
      expect(chrome).toBe(ground);
    };

    await page.goto("/");
    // the system scheme stays dark (playwright.config.ts): the light theme
    // here is the visitor's own choice
    await page.getByRole("button", { name: "Switch to day" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await agree();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await agree();
  });

  test("a theme change uses no view transition and reverses midway", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /^Switch to/ });
    await expect(toggle).toBeVisible();
    const seen = await page.evaluate(async () => {
      const ground = () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-yoru")
          .trim();
      const night = ground();
      let frozen = false;
      const vt = document.startViewTransition?.bind(document);
      if (vt)
        document.startViewTransition = (...args) => {
          frozen = true;
          return vt(...args);
        };
      const button = document.querySelector<HTMLElement>(
        'button[aria-label^="Switch to"]',
      );
      button?.click();
      // wait for the first frame in which the background color has changed
      let between = night;
      for (let i = 0; i < 60 && between === night; i++) {
        await new Promise(requestAnimationFrame);
        between = ground();
      }
      // toggle back before the light theme's color is reached
      button?.click();
      return { night, between, frozen };
    });
    // no view transition (a snapshot of the page) runs while the colors change
    expect(seen.frozen).toBe(false);
    expect(seen.between).not.toBe(seen.night);
    // …and it was sampled mid-transition, not already at the light value
    expect(seen.between).not.toBe("rgb(242, 236, 224)");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-yoru")
            .trim(),
        ),
      )
      .toBe(seen.night);
  });

  test("a system theme change before the app script runs is applied", async ({
    page,
  }) => {
    // Delay the app's script: the inline theme script has run, the listener
    // that follows the system scheme is not attached yet, and the system
    // scheme changes in between.
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/assets\/index-.*\.js$/, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    release();
    await expect(heading(page, HOME)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("cover transition", () => {
  // Runs in the page. Returns the rect of a work's cover on the page whose
  // h1 is `page`, skipping the outgoing page (which is inert). Waits up to
  // 30 frames for that page to exist.
  const script = `
    window.__cover = async (title, page) => {
      for (let i = 0; i < 30; i++) {
        const img = [...document.querySelectorAll(
          'img[alt="Cover art of ' + title + '"]',
        )].find((img) => !img.closest("[inert]") &&
          img.closest("main")?.querySelector("h1")?.textContent
            ?.replace(/\\s+/g, "") === page.replace(/\\s+/g, ""));
        if (img) return img.getBoundingClientRect();
        await new Promise(requestAnimationFrame);
      }
      throw new Error("no cover of " + title + " on " + page);
    };`;
  type Seen = (title: string, page: string) => Promise<DOMRect>;
  const HOME_H1 = "Perfect Collection";

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(script);
    await page.goto("/");
    const link = row(page, "化物語");
    await link.scrollIntoViewIfNeeded();
    await restingScrollY(page);
  });

  test("the cover animates from its row to its place on the work page", async ({
    page,
  }) => {
    const { from, early, landed } = await page.evaluate(async (home) => {
      const cover = (window as unknown as { __cover: Seen }).__cover;
      const from = await cover("化物語", home);
      document
        .querySelector<HTMLElement>('a[aria-label="化物語 — open"]')
        ?.click();
      const early = await cover("化物語", "化物語");
      await new Promise((r) => setTimeout(r, 1500));
      return { from, early, landed: await cover("化物語", "化物語") };
    }, HOME_H1);
    // It starts at its position in the row…
    expect(Math.abs(early.left - from.left)).toBeLessThan(60);
    expect(Math.abs(early.top - from.top)).toBeLessThan(60);
    // …and ends at a different size: its place on the work page.
    expect(Math.abs(landed.width - from.width)).toBeGreaterThan(40);
  });

  test("the cover stays visible throughout the transition", async ({
    page,
  }) => {
    const frames = await page.evaluate(async () => {
      document
        .querySelector<HTMLElement>('a[aria-label="化物語 — open"]')
        ?.click();
      const seen: { opacity: number; visible: boolean }[] = [];
      // Count frames from the first one with the cover on the work page,
      // not from the click: the time the work page's code takes to load is
      // not part of the transition.
      for (let i = 0; i < 120 && seen.length < 8; i++) {
        await new Promise(requestAnimationFrame);
        const img = [
          ...document.querySelectorAll<HTMLElement>(
            'img[alt="Cover art of 化物語"]',
          ),
        ].find(
          (img) =>
            !img.closest("[inert]") &&
            img.closest("main")?.querySelector("h1")?.textContent === "化物語",
        );
        // not yet on the work page
        if (!img) continue;
        // effective opacity: the product of the opacities up to the
        // popover. It is in the top layer, so opacity on its ancestors does
        // not apply to it.
        let opacity = 1;
        for (let el: Element | null = img; el; el = el.parentElement) {
          opacity *= Number(getComputedStyle(el).opacity);
          if (el.matches(":popover-open")) break;
        }
        seen.push({
          opacity,
          visible: getComputedStyle(img).visibility === "visible",
        });
      }
      return seen;
    });
    expect(frames.length).toBeGreaterThan(4);
    for (const frame of frames) {
      expect(frame.visible).toBe(true);
      expect(frame.opacity).toBeGreaterThan(0.95);
    }
  });

  test("going back mid-transition reverses the cover from where it is", async ({
    page,
  }) => {
    const { before, after } = await page.evaluate(async (home) => {
      const cover = (window as unknown as { __cover: Seen }).__cover;
      document
        .querySelector<HTMLElement>('a[aria-label="化物語 — open"]')
        ?.click();
      await cover("化物語", "化物語");
      await new Promise((r) => setTimeout(r, 160));
      const before = await cover("化物語", "化物語");
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      return { before, after: await cover("化物語", home) };
    }, HOME_H1);
    // no jump: it continues from where it was, not from its position in the
    // row or on the work page
    expect(Math.abs(after.left - before.left)).toBeLessThan(60);
    expect(Math.abs(after.top - before.top)).toBeLessThan(60);
    expect(Math.abs(after.width - before.width)).toBeLessThan(60);
  });
});
