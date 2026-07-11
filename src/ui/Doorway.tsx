import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { chip } from "./chip";

/**
 * The page's fixtures: no bar, no gradient — the same glass chips as the
 * theme toggle, mirrored. Back stands top-left; a room's neighbours stand
 * at mid-height on either edge, the way gallery pagers do, and say who
 * they are on hover. Escape leaves, and so does a click on the empty
 * margins — a room is an expanded cover, and lightboxes close outward.
 */
export function Doorway({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();

  // Decide on the history *index*, not location.key: a replace navigation
  // mints a fresh key but keeps idx 0 when the page was deep-linked, and
  // navigate(-1) from idx 0 would eject the visitor off-site.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      {/* the empty side margins are also the way out (mouse affordance;
          keyboard users have the chip and Escape) */}
      <div
        aria-hidden="true"
        onClick={goBack}
        className="fixed inset-y-0 left-0 z-10 hidden w-[max(0px,calc((100vw-72rem)/2-1rem))] cursor-pointer lg:block"
      />
      <div
        aria-hidden="true"
        onClick={goBack}
        className="fixed inset-y-0 right-0 z-10 hidden w-[max(0px,calc((100vw-72rem)/2-1rem))] cursor-pointer lg:block"
      />
      <button
        type="button"
        onClick={goBack}
        aria-label="Back to the collection"
        title="Back to the collection"
        className={`${chip} fixed top-5 left-5 z-50`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      </button>
      {children}
    </>
  );
}

/** A neighbouring work, standing at the room's edge. */
export function EdgeChip({
  side,
  title,
  lang,
  onClick,
}: {
  side: "prev" | "next";
  title: string;
  lang?: "ja" | undefined;
  onClick: () => void;
}) {
  const edge = side === "prev" ? "left-5 flex-row" : "right-5 flex-row-reverse";
  // Hidden on touch-sized screens: there the shelf is walked by swiping,
  // and a mid-height chip would sit on top of the reading column.
  return (
    <div
      className={`group/edge fixed top-1/2 z-50 hidden -translate-y-1/2 items-center gap-3 md:flex ${edge}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`${side === "prev" ? "Previous" : "Next"}: ${title}`}
        className={chip}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {side === "prev" ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <path d="M9 6l6 6-6 6" />
          )}
        </svg>
      </button>
      <span
        lang={lang}
        aria-hidden="true"
        className="hidden max-w-48 truncate rounded-full border border-border/50 bg-mizu/70 px-3 py-1 text-caption text-hoshi opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/edge:opacity-100 md:block"
      >
        {title}
      </span>
    </div>
  );
}
