import { useState } from "react";
import { accentFor, coverFor } from "@/lib/covers";

interface CoverProps {
  title: string;
  slug: string;
  lang?: "ja" | undefined;
  /** participate in the moon-phase shared-element morph (one per navigation) */
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
export function Cover({
  title,
  slug,
  lang,
  morph = false,
  priority = false,
  className = "",
}: CoverProps) {
  const cover = coverFor(title);
  const [loaded, setLoaded] = useState(false);

  const morphStyle = morph
    ? ({
        viewTransitionName: `cover-${slug}`,
        viewTransitionClass: "cover",
      } as React.CSSProperties)
    : undefined;

  if (!cover) {
    return (
      <div
        style={{ aspectRatio: "3 / 4", ...morphStyle }}
        className={`relative flex items-center justify-center overflow-hidden rounded-sm border border-border/70 bg-mizu ${className}`}
      >
        <span
          lang={lang}
          aria-hidden="true"
          className="select-none text-6xl font-light text-hoshi/50"
        >
          {[...title][0]}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        aspectRatio: `${cover.width} / ${cover.height}`,
        ...morphStyle,
      }}
      className={`relative overflow-hidden rounded-sm ${className}`}
    >
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
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`relative h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* hairline lit by the work's own canonical color */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-sm"
        style={{
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accentFor(slug, title)} 45%, transparent)`,
        }}
      />
    </div>
  );
}
