import { thumbHashToDataURL } from "thumbhash";
import { covers } from "@/data/generated/covers.ts";
import type { CoverMeta } from "@/data/types.ts";

const urls = import.meta.glob<string>("../assets/works/*.avif", {
  eager: true,
  query: "?url",
  import: "default",
});

interface Cover extends CoverMeta {
  /** the largest file */
  url: string;
  /** every file, as an <img> srcset */
  srcset: string;
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
    const files = cover.widths.map((w) => ({
      w,
      url: urls[`../assets/works/${cover.slug}-${w}.avif`],
    }));
    const url = files.at(-1)?.url;
    if (!url || files.some((f) => !f.url)) return [];
    let placeholder: string | undefined;
    const entry: Cover = {
      ...cover,
      url,
      srcset: files.map((f) => `${f.url} ${f.w}w`).join(", "),
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
