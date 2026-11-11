import { describe, expect, it } from "vitest";
import { data, displayLines } from "./why.ts";

// Every narrative line on the site is verbatim from docs/why.md (DESIGN.md).
// The home page's two split sentences (displayLines) are the only text typed
// into the code instead of parsed from the essay, so they are the only text
// that could differ from it. These tests compare them with the essay.
describe("displayLines", () => {
  it("opening equals the essay's first sentence", () => {
    expect(displayLines.opening.join(" ")).toBe(
      data.opening[0]?.replaceAll("**", ""),
    );
  });

  it("closing equals the essay's last sentence", () => {
    expect(displayLines.closing.join(" ")).toBe(data.closing.at(-1));
  });
});
