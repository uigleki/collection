import { beforeEach, describe, expect, it } from "vitest";
import { sky } from "@/scene/skyState.ts";
import { requestSky } from "./sky.ts";

describe("requestSky", () => {
  beforeEach(() => {
    sky.dim = 0;
    sky.fullMoonByScroll = false;
    sky.targetNight = 1;
  });

  it("applies the newest request", () => {
    const home = requestSky({ fullMoonByScroll: true });
    expect(sky.fullMoonByScroll).toBe(true);
    const work = requestSky({ dim: 1, night: 5 });
    expect(sky).toMatchObject({
      dim: 1,
      fullMoonByScroll: false,
      targetNight: 5,
    });
    work();
    home();
  });

  // Pages overlap during a page change, and the outgoing page removes its
  // request last: that removal must not undo the incoming page's settings.
  it("keeps the newer request's settings when an older request is removed", () => {
    const first = requestSky({ dim: 1, night: 3 });
    const second = requestSky({ dim: 1, night: 4 });
    first();
    expect(sky).toMatchObject({ dim: 1, targetNight: 4 });
    second();
  });

  it("falls back to the previous request when the newest is removed", () => {
    const home = requestSky({ fullMoonByScroll: true });
    const work = requestSky({ dim: 1, night: 5 });
    work();
    expect(sky).toMatchObject({ dim: 0, fullMoonByScroll: true });
    home();
    expect(sky).toMatchObject({ dim: 0, fullMoonByScroll: false });
  });
});
