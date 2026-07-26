import { describe, expect, it } from "vitest";
import { couplets, data } from "./why";

// Every narrative line on the site is verbatim from docs/why.md (DESIGN.md).
// The home page's two display couplets are the only copy that is re-typed
// rather than read straight out of the essay, so they are the only copy that
// could drift from it. These hold them.
describe("the home page's display couplets", () => {
  it("opens on the essay's first sentence", () => {
    expect(couplets.opening.join(" ")).toBe(
      data.opening[0].replaceAll("**", ""),
    );
  });

  it("closes on the essay's last", () => {
    expect(couplets.closing.join(" ")).toBe(data.closing.at(-1));
  });
});
