import type { Page } from "@playwright/test";
import { expect, test } from "./helpers.ts";

/**
 * Loads the home page with reduced motion and returns a counter of WebGL
 * draw calls. ?gl keeps the sky running on a software rasterizer, where
 * MoonSky would otherwise leave only the `.poster` fallback
 * (src/scene/MoonSky.tsx). A browser with no WebGL at all has no canvas to
 * count draws on, so the test is skipped.
 */
async function reducedMotionSky(page: Page): Promise<() => Promise<number>> {
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
  await page.goto("/?gl");
  test.skip(
    (await page.locator("canvas").count()) === 0,
    "no WebGL in this browser: only the poster fallback is shown",
  );
  const draws = () => page.evaluate(() => window.skyDraws);
  await expect.poll(draws).toBeGreaterThan(0);
  await page.evaluate(() => document.fonts.ready);
  return draws;
}

test.describe("sky with reduced motion", () => {
  test("does not redraw while idle; redraws on a theme change", async ({
    page,
  }) => {
    const draws = await reducedMotionSky(page);
    const settled = await draws();
    await page.waitForTimeout(500);
    expect((await draws()) - settled).toBe(0);

    await page.getByRole("button", { name: "Switch to day" }).click();
    await expect.poll(draws).toBeGreaterThan(settled);
  });

  test("redraws on visibilitychange", async ({ page }) => {
    const draws = await reducedMotionSky(page);
    const settled = await draws();
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect.poll(draws).toBeGreaterThan(settled);
  });
});

test("logs no error when WebGL is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.addInitScript(() => {
    window.webglRequests = 0;
    const original = HTMLCanvasElement.prototype.getContext as (
      ...args: unknown[]
    ) => unknown;
    Object.assign(HTMLCanvasElement.prototype, {
      getContext(this: unknown, kind: string, ...rest: unknown[]) {
        if (!kind.startsWith("webgl"))
          return original.call(this, kind, ...rest);
        window.webglRequests += 1;
        return null;
      },
    });
  });
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => window.webglRequests))
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
