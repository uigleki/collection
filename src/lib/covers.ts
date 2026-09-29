import { CANON_ACCENT } from "@/data/accents.ts";
import { type CoverMeta, covers } from "@/data/generated/covers.ts";

// Vite resolves every cover to its hashed asset URL at build time.
const urls = import.meta.glob<string>("../assets/works/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

interface Cover extends CoverMeta {
  url: string;
}

// The generated module holds data; the index over it belongs here. The asset
// URL is resolved once as the index is built — both sides are fixed at build
// time, and Cover asks for this on every render.
const bySlug: ReadonlyMap<string, Cover> = new Map(
  covers.flatMap((cover) => {
    const url = urls[`../assets/works/${cover.slug}.webp`];
    return url ? [[cover.slug, { ...cover, url }] as const] : [];
  }),
);

/** Cover art + metadata for a work, or null for the two whose art has no
 * licensed source (they get a typographic panel instead). */
export function coverFor(slug: string): Cover | null {
  return bySlug.get(slug) ?? null;
}

/**
 * The work's accent: the color the work is actually known by, art-directed
 * per work in accents.ts. The moon's warmth stands behind it for anything
 * added to the collection before it has been given a color of its own.
 */
export function accentFor(slug: string): string {
  return CANON_ACCENT[slug] ?? "var(--color-tsukikage)";
}
