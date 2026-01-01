import { describe, expect, it } from "vitest";
import { renderEmphasis } from "../markdown";

describe("renderEmphasis", () => {
  it("returns plain text unchanged", () => {
    expect(renderEmphasis("Hello world")).toEqual(["Hello world"]);
  });

  it("parses single bold text", () => {
    expect(renderEmphasis("Hello **world**!")).toEqual([
      "Hello ",
      <strong key={1}>world</strong>,
      "!",
    ]);
  });

  it("parses multiple bold segments", () => {
    expect(renderEmphasis("**First** and **second**")).toEqual([
      "",
      <strong key={1}>First</strong>,
      " and ",
      <strong key={3}>second</strong>,
      "",
    ]);
  });
});
