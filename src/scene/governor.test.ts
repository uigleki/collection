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

  it("gives up resolution when frames keep running late", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 60); // the display's own pace, seen once
    // two seconds of 30fps on a 60Hz display
    expect(run(g, 1000 / 30, 60)).toBeLessThan(1.75);
  });

  it("knows a fast display's pace from the frames themselves", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 120, 60);
    // 60fps is on time for most screens, late for a 120Hz one
    expect(run(g, 1000 / 60, 240)).toBeLessThan(1.75);
  });

  it("never goes below its floor", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    expect(run(g, 100, 3000)).toBe(0.6);
  });

  it("shrugs off a single hitch", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 120);
    g.frame(400); // a tab switch, a collection pause
    expect(run(g, 1000 / 60, 120)).toBe(1.75);
  });

  it("wins resolution back slowly, once frames are on time again", () => {
    const g = governor({ max: 1.75, min: 0.6 });
    run(g, 1000 / 60, 60);
    const low = run(g, 1000 / 20, 600);
    // a moment of good frames is not yet trusted
    expect(run(g, 1000 / 60, 60)).toBe(low);
    // a sustained stretch is
    expect(run(g, 1000 / 60, 1200)).toBeGreaterThan(low);
  });
});
