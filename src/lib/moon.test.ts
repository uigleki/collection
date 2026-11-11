import { describe, expect, it } from "vitest";
import { allWorks } from "@/data/works.ts";
import { FULL_NIGHT, terminator } from "./moon.ts";

// moon.ts hard-codes FULL_NIGHT so the sky never imports the works data.
// This test keeps the constant in sync with that data.
it("sets FULL_NIGHT to the night of the last work", () => {
  expect(FULL_NIGHT).toBe(allWorks.length + 1);
});

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

  it("accepts fractional nights, for a continuous phase change", () => {
    const t = terminator(4.5);
    expect(t).toBeLessThan(terminator(4));
    expect(t).toBeGreaterThan(terminator(5));
  });
});
