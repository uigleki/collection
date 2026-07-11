import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEmphasis } from "./emphasis";

describe("renderEmphasis", () => {
  it("passes plain text through", () => {
    const { container } = render(<p>{renderEmphasis("just a line")}</p>);
    expect(container.textContent).toBe("just a line");
    expect(container.querySelector("strong")).toBeNull();
  });

  it("turns **marks** into <strong>", () => {
    const { container } = render(
      <p>
        {renderEmphasis(
          "Not what makes you cry, but **what makes you believe.**",
        )}
      </p>,
    );
    expect(container.querySelector("strong")?.textContent).toBe(
      "what makes you believe.",
    );
    expect(container.textContent).toBe(
      "Not what makes you cry, but what makes you believe.",
    );
  });

  it("handles several marks in one line", () => {
    const { container } = render(<p>{renderEmphasis("**a** then **b**")}</p>);
    expect(container.querySelectorAll("strong")).toHaveLength(2);
  });
});
