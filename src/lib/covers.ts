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
  /** the blurred placeholder, as a data URL */
  readonly placeholder: string;
}

function decode(hash: string): string {
  return thumbHashToDataURL(
    Uint8Array.from(atob(hash), (c) => c.charCodeAt(0)),
  );
}

// The generated module holds only data; this index over it is built here.
// The asset URL is resolved once when the index is built: both inputs are
// fixed at build time, and Cover reads this on every render. A placeholder
// is decoded on first access: a work page shows one, the credits page none.
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

/** Cover art + metadata for a work, or null for one whose art has no
 * licensed source (it gets a typographic panel instead). */
export function coverFor(slug: string): Cover | null {
  return bySlug.get(slug) ?? null;
}
