import { useMemo, useState, useSyncExternalStore } from "react";
import type { Work } from "@/data/types.ts";
import { coverFor } from "@/lib/covers.ts";
import { aboard } from "@/lib/flight.ts";

interface CoverProps {
  work: Work;
  /**
   * animate between pages, so the home row's cover and the work page's
   * cover appear as one moving element (flight.ts)
   */
  morph?: boolean;
  /** eager-load with high fetch priority (a work page's cover is its LCP) */
  priority?: boolean;
  className?: string;
}

const shown = new Set<string>();

const never = () => () => {};
/** True while prerendering and while hydrating; false in other renders. */
const useWritten = () =>
  useSyncExternalStore(
    never,
    () => false,
    () => true,
  );

/**
 * A work's cover in its original colors: no filter and no tint (DESIGN.md).
 * The thumbhash placeholder is painted at once at the exact aspect ratio,
 * so the page's height is stable before the image decodes (no CLS, no
 * scroll-restoration drift). A work without licensed art gets a panel with
 * the first character of its title instead.
 */
export function Cover({
  work,
  morph = false,
  priority = false,
  className = "",
}: CoverProps) {
  const { title, slug, lang } = work;
  const cover = coverFor(slug);
  // An image already shown during this visit is in memory, so it paints at
  // once and gets no fade-in: a cover animating onto a work page must be
  // sharp from the start. A prerendered image gets no fade-in either: the
  // browser started loading it before this code ran and may have finished
  // (a load event that already fired is never delivered), and an image the
  // reader can already see must not be hidden again.
  const written = useWritten();
  const [loaded, setLoaded] = useState(
    () => !!cover && (written || shown.has(cover.url)),
  );
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
      {/* the element that animates between pages; the parent box keeps its
          place in the layout (flight.ts) */}
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
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) shown.add(cover.url);
          }}
          onLoad={() => {
            shown.add(cover.url);
            setLoaded(true);
          }}
          className={`relative h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
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
