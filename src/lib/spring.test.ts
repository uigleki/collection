import { describe, expect, it } from "vitest";
import { cssSpring } from "./spring.ts";

const points = (easing: string) =>
  easing
    .replace(/^linear\(|\)$/g, "")
    .split(",")
    .map(Number);

describe("cssSpring", () => {
  it("runs from rest to the target", () => {
    const { easing } = cssSpring({ stiffness: 300, damping: 30 });
    const p = points(easing);
    expect(p[0]).toBe(0);
    expect(p.at(-1)).toBe(1);
  });

  it("overshoots when the spring is underdamped", () => {
    const { easing } = cssSpring({ stiffness: 400, damping: 12 });
    expect(Math.max(...points(easing))).toBeGreaterThan(1.05);
  });

  it("never overshoots when the spring is critically damped", () => {
    const k = 200;
    const { easing } = cssSpring({ stiffness: k, damping: 2 * Math.sqrt(k) });
    expect(Math.max(...points(easing))).toBeLessThanOrEqual(1);
  });

  it("lasts as long as the spring takes to settle", () => {
    const stiff = cssSpring({ stiffness: 500, damping: 40 }).duration;
    const soft = cssSpring({ stiffness: 60, damping: 18 }).duration;
    expect(stiff).toBeLessThan(soft);
    // a soft spring's tail is long but it does come to rest
    expect(soft).toBeLessThan(3000);
  });
});
