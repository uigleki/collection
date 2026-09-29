import { thumbHashToDataURL } from "thumbhash";
import { type CoverMeta, covers } from "@/data/generated/covers.ts";

// Vite resolves every cover to its hashed asset URL at build time.
const urls = import.meta.glob<string>("../assets/works/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

interface Cover extends CoverMeta {
  url: string;
  /** the blurred stand-in, as an image the page can paint */
  readonly placeholder: string;
}

function decode(hash: string): string {
  return thumbHashToDataURL(
    Uint8Array.from(atob(hash), (c) => c.charCodeAt(0)),
  );
}

// The generated module holds data; the index over it belongs here. The asset
// URL is resolved once as the index is built — both sides are fixed at build
// time, and Cover asks for this on every render. A placeholder is decoded the
// first time it is asked for: a room paints one, the colophon none.
const bySlug: ReadonlyMap<string, Cover> = new Map(
  covers.flatMap((cover) => {
    const url = urls[`../assets/works/${cover.slug}.webp`];
    if (!url) return [];
    let placeholder: string | undefined;
    const entry: Cover = {
      ...cover,
      url,
      get placeholder() {
        placeholder ??= decode(cover.thumbhash);
        return placeholder;
      },
    };
    return [[cover.slug, entry] as const];
  }),
);

/** Cover art + metadata for a work, or null for the two whose art has no
 * licensed source (they get a typographic panel instead). */
export function coverFor(slug: string): Cover | null {
  return bySlug.get(slug) ?? null;
}
