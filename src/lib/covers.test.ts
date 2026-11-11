import { describe, expect, it } from "vitest";
import { covers } from "@/data/generated/covers.ts";
import { coverFor } from "./covers.ts";

describe("cover placeholders", () => {
  // A placeholder stored as an image adds kilobytes per cover to every
  // page; its hash is ~30 bytes, and the decoder costs about as much as one
  // such image.
  it("ships each placeholder as its thumbhash, not as an image", () => {
    for (const cover of covers) {
      expect(cover, cover.slug).not.toHaveProperty("placeholder");
      expect(cover.thumbhash.length, cover.slug).toBeLessThanOrEqual(40);
    }
  });

  it("decodes the hash into a PNG data URL", () => {
    const cover = coverFor("bakemonogatari");
    expect(cover?.placeholder).toMatch(/^data:image\/png;base64,/);
  });
});
