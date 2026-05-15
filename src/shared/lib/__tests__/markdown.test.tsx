import { describe, expect, it } from "vitest";
import { renderEmphasis } from "../markdown";

describe("renderEmphasis", () => {
  it("returns plain text unchanged", () => {
    expect(renderEmphasis("Hello world")).toEqual(["Hello world"]);
  });

  it("parses single bold text", () => {
    expect(renderEmphasis("Hello **world**!")).toEqual([
      "Hello ",
      <strong key="**world**">world</strong>,
      "!",
    ]);
  });

  it("parses multiple bold segments", () => {
    expect(renderEmphasis("**First** and **second**")).toEqual([
      "",
      <strong key="**First**">First</strong>,
      " and ",
      <strong key="**second**">second</strong>,
      "",
    ]);
  });
});
