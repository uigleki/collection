import { useMemo, useState } from "react";
import type { Work } from "@/data/types.ts";
import { coverFor } from "@/lib/covers.ts";
import { aboard } from "@/lib/flight.ts";

interface CoverProps {
  work: Work;
  /** fly between pages: the row's cover and the room's are one object */
  morph?: boolean;
  /** eager-load + high fetch priority (the room's own cover is its LCP) */
  priority?: boolean;
  className?: string;
}

/**
 * A work's cover in true color — never filtered, never tinted (DESIGN.md).
 * The thumbhash placeholder paints instantly at the exact aspect ratio, so
 * the page's height is stable before the art decodes (no CLS, no scroll
 * restoration drift). Works without licensed art stand behind a quiet
 * typographic panel instead.
 */
const shown = new Set<string>();

export function Cover({
  work,
  morph = false,
  priority = false,
  className = "",
}: CoverProps) {
  const { title, slug, lang } = work;
  const cover = coverFor(slug);
  // Art this visit has already shown is in memory: it paints at once and
  // needs no fade — a cover flying into a room must arrive sharp.
  const [loaded, setLoaded] = useState(() => !!cover && shown.has(cover.url));
  const flies = useMemo(
    () => (morph ? aboard(slug) : undefined),
    [morph, slug],
  );

  if (!cover) {
    return (
      <div style={{ aspectRatio: "3 / 4" }} className={`relative ${className}`}>
        <div
          ref={flies}
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-border/70 bg-mizu"
        >
          <span
            lang={lang}
            aria-hidden="true"
            className="select-none text-6xl font-light text-hoshi/50"
          >
            {[...title][0]}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ aspectRatio: `${cover.width} / ${cover.height}` }}
      className={`relative ${className}`}
    >
      {/* the cover itself; the box above is where it rests (flight.ts) */}
      <div ref={flies} className="absolute inset-0 overflow-hidden rounded-sm">
        <img
          src={cover.placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={cover.url}
          alt={`Cover art of ${title}`}
          width={cover.width}
          height={cover.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={loaded ? "sync" : "async"}
          onLoad={() => {
            shown.add(cover.url);
            setLoaded(true);
          }}
          className={`relative h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {/* hairline lit by the work's own canonical color */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${work.accent} 45%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
