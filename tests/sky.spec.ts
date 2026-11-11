import type { Page } from "@playwright/test";
import { expect, test } from "./helpers.ts";

declare global {
  interface Window {
    skyDraws: number;
    skyAsked: number;
  }
}

/**
 * The sky as a reader who asked for stillness gets it, with its draws
 * counted. ?gl keeps it on a software rasterizer, where it would otherwise
 * stand down for the poster (src/scene/MoonSky.tsx); a browser with no WebGL
 * at all has only the poster, and nothing here to watch.
 */
async function stillSky(page: Page): Promise<() => Promise<number>> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    window.skyDraws = 0;
    for (const context of [
      window.WebGLRenderingContext,
      window.WebGL2RenderingContext,
    ]) {
      if (!context) continue;
      for (const call of ["drawArrays", "drawElements"] as const) {
        const draw = context.prototype[call] as (...args: unknown[]) => void;
        Object.assign(context.prototype, {
          [call](this: unknown, ...args: unknown[]) {
            window.skyDraws += 1;
            draw.apply(this, args);
          },
        });
      }
    }
  });
  await page.goto("/?gl", { waitUntil: "load" });
  await page.waitForFunction(() => history.scrollRestoration === "manual");
  test.skip(
    (await page.locator("canvas").count()) === 0,
    "this browser has no WebGL here: the poster is the sky",
  );
  const draws = () => page.evaluate(() => window.skyDraws);
  await expect.poll(draws).toBeGreaterThan(0);
  await page.evaluate(() => document.fonts.ready);
  return draws;
}

test.describe("a sky asked to hold still", () => {
  test("is drawn once, then only when it changes", async ({ page }) => {
    const draws = await stillSky(page);
    const settled = await draws();
    await page.waitForTimeout(500);
    expect((await draws()) - settled).toBe(0);

    await page.getByRole("button", { name: "Switch to day" }).click();
    await expect.poll(draws).toBeGreaterThan(settled);
  });

  test("is drawn afresh for a tab brought back to the front", async ({
    page,
  }) => {
    const draws = await stillSky(page);
    const settled = await draws();
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect.poll(draws).toBeGreaterThan(settled);
  });
});

test("a browser with no WebGL is left the poster, and no complaint", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript(() => {
    window.skyAsked = 0;
    const ask = HTMLCanvasElement.prototype.getContext as (
      ...args: unknown[]
    ) => unknown;
    Object.assign(HTMLCanvasElement.prototype, {
      getContext(this: unknown, kind: string, ...rest: unknown[]) {
        if (!kind.startsWith("webgl")) return ask.call(this, kind, ...rest);
        window.skyAsked += 1;
        return null;
      },
    });
  });
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.skyAsked))
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
