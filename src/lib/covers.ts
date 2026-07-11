import { CANON_ACCENT } from "@/data/accents";
import { type CoverMeta, coverByTitle } from "@/data/generated/covers";

// Vite resolves every cover to its hashed asset URL at build time.
const urls = import.meta.glob<string>("../assets/works/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export interface Cover extends CoverMeta {
  url: string;
}

/** Cover art + metadata for a work title, or null for the two works whose
 * art has no licensed source (they get a typographic panel instead). */
export function coverFor(title: string): Cover | null {
  const meta = coverByTitle[title];
  if (!meta) return null;
  const url = urls[`../assets/works/${meta.slug}.webp`];
  return url ? { ...meta, url } : null;
}

/**
 * The work's accent: its curated canonical color first (the color the work
 * is actually known by), the cover-extracted average as fallback, the
 * moon's warmth as the last resort.
 */
export function accentFor(slug: string, title: string): string {
  return (
    CANON_ACCENT[slug] ?? coverFor(title)?.accent ?? "var(--color-tsukikage)"
  );
}
