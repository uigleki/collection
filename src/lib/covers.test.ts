import { describe, expect, it } from "vitest";
import { covers } from "@/data/generated/covers.ts";
import { coverFor } from "./covers.ts";

describe("cover placeholders", () => {
  // A baked PNG costs every page ~3KB per cover; the hash it came from is
  // ~30 bytes, and the decoder costs about what one baked image did.
  it("ships each placeholder as its thumbhash, not as an image", () => {
    for (const cover of covers) {
      expect(cover, cover.slug).not.toHaveProperty("placeholder");
      expect(cover.thumbhash.length, cover.slug).toBeLessThanOrEqual(40);
    }
  });

  it("paints the placeholder the hash describes", () => {
    const cover = coverFor("bakemonogatari");
    expect(cover?.placeholder).toMatch(/^data:image\/png;base64,/);
  });
});
