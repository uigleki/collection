import { beforeEach, describe, expect, it } from "vitest";
import { sky } from "@/scene/signal.ts";
import { claimSky } from "./sky.ts";

describe("claimSky", () => {
  beforeEach(() => {
    sky.dim = 0;
    sky.waxWithProgress = false;
    sky.targetNight = 1;
  });

  it("gives the sky to the newest page", () => {
    const home = claimSky({ waxWithProgress: true });
    expect(sky.waxWithProgress).toBe(true);
    const room = claimSky({ dim: 1, night: 5 });
    expect(sky).toMatchObject({
      dim: 1,
      waxWithProgress: false,
      targetNight: 5,
    });
    room();
    home();
  });

  // Pages overlap while one leaves and the next arrives, and the leaving
  // one lets go last: its release must not undo the arrival's sky.
  it("lets a departing page go without touching the page that replaced it", () => {
    const first = claimSky({ dim: 1, night: 3 });
    const second = claimSky({ dim: 1, night: 4 });
    first();
    expect(sky).toMatchObject({ dim: 1, targetNight: 4 });
    second();
  });

  it("returns the sky to the page beneath when the top one leaves", () => {
    const home = claimSky({ waxWithProgress: true });
    const room = claimSky({ dim: 1, night: 5 });
    room();
    expect(sky).toMatchObject({ dim: 0, waxWithProgress: true });
    home();
    expect(sky).toMatchObject({ dim: 0, waxWithProgress: false });
  });
});
