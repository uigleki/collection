import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import { renderEmphasis } from "./emphasis.tsx";

/** The marked segments, in order — what the function actually decides. */
function marks(nodes: ReturnType<typeof renderEmphasis>): string[] {
  return nodes
    .filter((n) => isValidElement<{ children: string }>(n))
    .map((n) => n.props.children);
}

describe("renderEmphasis", () => {
  it("passes plain text through", () => {
    const nodes = renderEmphasis("just a line");
    expect(nodes.join("")).toBe("just a line");
    expect(marks(nodes)).toEqual([]);
  });

  it("turns **marks** into <strong>", () => {
    const nodes = renderEmphasis(
      "Not what makes you cry, but **what makes you believe.**",
    );
    expect(marks(nodes)).toEqual(["what makes you believe."]);
    expect(nodes.map((n) => (isValidElement(n) ? "" : n)).join("")).toBe(
      "Not what makes you cry, but ",
    );
  });

  it("handles several marks in one line", () => {
    expect(marks(renderEmphasis("**a** then **b**"))).toEqual(["a", "b"]);
  });
});
