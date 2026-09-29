import { expect, type Locator, type Page, test } from "@playwright/test";
import { HOME, heading, NOT_FOUND, restingScrollY, row } from "./helpers.ts";

/** Enter a room from the spine, come back, and expect the reading position. */
async function roundTrip(
  page: Page,
  row: Locator,
  before: number,
  tolerance: number,
) {
  await row.click();
  await expect(page).toHaveURL(/girls-last-tour/);
  // rooms open at the top (once the transition settles)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);

  await page.getByRole("button", { name: "Back to the collection" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - before),
    )
    .toBeLessThan(tolerance);
}

// Playwright's touchscreen only taps, so a gesture is dispatched directly —
// exactly what a finger sends: down, a run of moves, up.
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

/** Lift the finger a held swipe left at (dx, dy). */
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

test.describe("rooms", () => {
  test("a work opens into its room", async ({ page }) => {
    await page.goto("/");
    await row(page, "化物語").click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(heading(page, "化物語")).toBeVisible();
    // the collection may still be fading out; the room is what is read
    await expect(page.getByRole("main").getByText("Anime 01")).toBeVisible();
    await expect(page).toHaveTitle(/化物語/);
  });

  test("prev/next walk the whole shelf and never scroll away", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    await page.getByRole("button", { name: "Next: 偽物語" }).click();
    await expect(page).toHaveURL(/\/works\/nisemonogatari$/);
    await expect(heading(page, "偽物語")).toBeVisible();
    // 化物語 is first on the whole shelf, so it has no previous
    await page.getByRole("button", { name: "Previous: 化物語" }).click();
    await expect(page).toHaveURL(/\/works\/bakemonogatari$/);
    await expect(page.getByRole("button", { name: /^Previous:/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(1);
    // the doorway stays pinned after a deep scroll
    await page.mouse.wheel(0, 2000);
    await expect(
      page.getByRole("button", { name: "Back to the collection" }),
    ).toBeInViewport();
  });

  test("a touch swipe walks the shelf, a vertical drag never does", async ({
    page,
  }) => {
    await page.goto("/works/nisemonogatari");
    const room = (name: string) => expect(heading(page, name)).toBeVisible();

    await swipe(page, -160, 10); // left → the next work
    await room("ハイスコアガール");
    await swipe(page, 160, 10); // right → back
    await room("偽物語");

    await swipe(page, -160, 400); // mostly vertical: reading, not a swipe
    await swipe(page, -30, 0); // too short to be decisive, however quick
    await expect(page).toHaveURL(/nisemonogatari$/);
  });

  test("the room follows the finger, and resists past the shelf's end", async ({
    page,
  }) => {
    await page.goto("/works/bakemonogatari");
    const title = heading(page, "化物語");
    await expect(title).toBeVisible();
    const at = async () => (await title.boundingBox())?.x ?? 0;
    const rest = await at();

    // held, not released: the page is wherever the finger is
    await swipe(page, -120, 0, { release: false });
    await expect.poll(async () => (await at()) - rest).toBeLessThan(-100);
    await release(page, -120, 0);
    await expect(page).toHaveURL(/nisemonogatari$/);

    // 化物語 is the first work: nothing stands before it, so a pull toward
    // the previous one gives a little and springs back
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

  test("the arrow keys walk the shelf", async ({ page }) => {
    // The title is set in the same breath the room starts listening.
    await page.goto("/works/nisemonogatari");
    await expect(page).toHaveTitle(/^偽物語/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveTitle(/^ハイスコアガール/);
    await page.keyboard.press("ArrowLeft");
    await expect(heading(page, "偽物語")).toBeVisible();
  });

  test("a room scrolls the moment it opens", async ({ page }) => {
    await page.goto("/");
    const link = row(page, "化物語");
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(heading(page, "化物語")).toBeAttached();
    // No animation owns the page: the reader's wheel is obeyed at once,
    // whatever is still settling.
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 400 })
      .toBeGreaterThan(before + 100);
  });

  test("a back swipe the browser already animated is not animated again", async ({
    page,
  }) => {
    // What a phone's edge swipe reports: the browser has drawn the change.
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
    // the room is simply gone: no second page fading out behind the first
    expect(Math.max(...scenes)).toBe(1);
  });

  test("works without cover art still have complete rooms", async ({
    page,
  }) => {
    await page.goto("/works/kantoku");
    await expect(heading(page, "カントク")).toBeVisible();
    await expect(page.getByText("Artists 01")).toBeVisible();
  });

  test("flaws are stated plainly where they exist", async ({ page }) => {
    await page.goto("/works/steins-gate");
    await expect(page.getByText("Flaws, stated plainly")).toBeAttached();
    await page.goto("/works/bakemonogatari");
    await expect(page.getByText("Flaws, stated plainly")).toHaveCount(0);
  });

  test("returning to the collection restores the reading position", async ({
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

  test("wheel reading restores the position exactly", async ({ page }) => {
    await page.goto("/");
    const link = row(page, "少女終末旅行");
    // Real reading: wheel down until the row sits in the viewport. Each look
    // waits for the glide to land first — a fixed pause measures a page still
    // in flight, and on a loaded machine the row never seems to arrive, so
    // the loop wheels its full thirty and the test ends up asserting about
    // the bottom of the page instead of the row it meant to open.
    for (let i = 0; i < 30; i++) {
      const box = await link.boundingBox().catch(() => null);
      if (box && box.y > 80 && box.y < 480) break;
      await page.mouse.wheel(0, 400);
      await restingScrollY(page);
    }
    // Playwright scrolls a target into view before clicking it, and that
    // nudge would move the page after the position was sampled — so it
    // happens first, and the position measured is the position clicked from.
    await link.scrollIntoViewIfNeeded();
    const before = await restingScrollY(page);
    expect(before).toBeGreaterThan(500);
    await roundTrip(page, link, before, 50);
  });

  test("a missing page says so", async ({ page }) => {
    const res = await page.goto("/works/does-not-exist");
    expect(res).not.toBeNull();
    await expect(heading(page, NOT_FOUND)).toBeVisible();
    await page.getByRole("link", { name: "Return to the collection" }).click();
    await expect(heading(page, HOME)).toBeVisible();
  });

  test("the theme toggle flips the sky and persists", async ({ page }) => {
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

  test("the theme turns live, and can be turned back mid-way", async ({
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
      // the first frame in which the ground has begun to turn
      let between = night;
      for (let i = 0; i < 60 && between === night; i++) {
        await new Promise(requestAnimationFrame);
        between = ground();
      }
      // turned back before dusk arrives
      button?.click();
      return { night, between, frozen };
    });
    // no picture of the page stands in for it while the colors turn
    expect(seen.frozen).toBe(false);
    expect(seen.between).not.toBe(seen.night);
    // …and was caught mid-turn, not already at dusk
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

  test("a system switch before the app starts is still followed", async ({
    page,
  }) => {
    // Hold the app's script back: the pre-paint theme has run, the listener
    // that follows the system has not, and the system changes in between.
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

test.describe("the cover's flight", () => {
  // Runs in the page. The live copy of a work's cover on the page headed
  // `page` (a departing page is inert), waiting up to half a second of
  // frames for that page to exist.
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

  test("a cover flies from its row into its room", async ({ page }) => {
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
    // It leaves from where the reader saw it…
    expect(Math.abs(early.left - from.left)).toBeLessThan(60);
    expect(Math.abs(early.top - from.top)).toBeLessThan(60);
    // …and lands somewhere else entirely: its place in the room.
    expect(Math.abs(landed.width - from.width)).toBeGreaterThan(40);
  });

  test("the cover is seen the whole way, not only once it has landed", async ({
    page,
  }) => {
    const frames = await page.evaluate(async () => {
      document
        .querySelector<HTMLElement>('a[aria-label="化物語 — open"]')
        ?.click();
      const seen: { opacity: number; visible: boolean }[] = [];
      for (let i = 0; i < 12; i++) {
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
        // not yet in the room
        if (!img) continue;
        // what actually reaches the screen: every ancestor's opacity, up to
        // the top layer, which none of them reach into
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

  test("going back mid-flight turns the cover around where it is", async ({
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
    // one continuous object: no jump back to the row, no jump to the room
    expect(Math.abs(after.left - before.left)).toBeLessThan(60);
    expect(Math.abs(after.top - before.top)).toBeLessThan(60);
    expect(Math.abs(after.width - before.width)).toBeLessThan(60);
  });
});
