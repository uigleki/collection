import { describe, expect, it } from "vitest";
import { governor } from "./governor.ts";

const run = (g: ReturnType<typeof governor>, ms: number, frames: number) => {
  for (let i = 0; i < frames; i++) g.frame(ms);
  return g.scale;
};

describe("governor", () => {
  it("keeps full resolution while frames arrive on time", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    expect(run(g, 1000 / 60, 600)).toBe(1.75);
  });

  it("lowers the scale when frames keep running late", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 60); // one window at the display's refresh period
    // two seconds of 30fps on a 60Hz display
    expect(run(g, 1000 / 30, 60)).toBeLessThan(1.75);
  });

  it("detects a 120Hz display's period from its frame times", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 120, 60);
    // 60fps is on time for most screens, late for a 120Hz one
    expect(run(g, 1000 / 60, 240)).toBeLessThan(1.75);
  });

  it("never goes below the minimum scale", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    expect(run(g, 100, 3000)).toBe(0.6);
  });

  it("ignores a single long frame", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 120);
    g.frame(400); // a tab switch or a garbage-collection pause
    expect(run(g, 1000 / 60, 120)).toBe(1.75);
  });

  it("raises the scale slowly once frames are on time again", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 60);
    const low = run(g, 1000 / 20, 600);
    // one on-time window does not raise the scale
    expect(run(g, 1000 / 60, 60)).toBe(low);
    // a sustained run does
    expect(run(g, 1000 / 60, 1200)).toBeGreaterThan(low);
  });
});
