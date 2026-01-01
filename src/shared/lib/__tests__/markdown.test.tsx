import { describe, expect, it } from "vitest";
import { parseEmphasis } from "../markdown";

describe("parseEmphasis", () => {
  it("returns plain text unchanged", () => {
    expect(parseEmphasis("Hello world")).toEqual(["Hello world"]);
  });

  it("parses single bold text", () => {
    expect(parseEmphasis("Hello **world**!")).toEqual([
      "Hello ",
      <strong key={1}>world</strong>,
      "!",
    ]);
  });

  it("parses multiple bold segments", () => {
    expect(parseEmphasis("**First** and **second**")).toEqual([
      "",
      <strong key={1}>First</strong>,
      " and ",
      <strong key={3}>second</strong>,
      "",
    ]);
  });
});
