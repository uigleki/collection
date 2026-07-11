import { describe, expect, it } from "vitest";
import { FULL_NIGHT, illumination, terminator } from "./moon";

describe("terminator", () => {
  it("is +1 on night 1 (new moon — nothing lit)", () => {
    expect(terminator(1)).toBeCloseTo(1, 10);
  });

  it("is 0 at the month's midpoint (half lit)", () => {
    expect(terminator((1 + FULL_NIGHT) / 2)).toBeCloseTo(0, 10);
  });

  it("is -1 on night 15 (full)", () => {
    expect(terminator(FULL_NIGHT)).toBeCloseTo(-1, 10);
  });

  it("decreases monotonically as the moon waxes", () => {
    for (let n = 1; n < FULL_NIGHT; n++) {
      expect(terminator(n + 1)).toBeLessThan(terminator(n));
    }
  });

  it("accepts fractional nights for continuous scroll waxing", () => {
    const t = terminator(4.5);
    expect(t).toBeLessThan(terminator(4));
    expect(t).toBeGreaterThan(terminator(5));
  });
});

describe("illumination", () => {
  it("maps terminator to a 0..1 lit fraction", () => {
    expect(illumination(1)).toBeCloseTo(0, 10);
    expect(illumination((1 + FULL_NIGHT) / 2)).toBeCloseTo(0.5, 10);
    expect(illumination(FULL_NIGHT)).toBeCloseTo(1, 10);
  });
});
