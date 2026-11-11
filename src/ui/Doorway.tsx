import { useIsPresent } from "motion/react";
import { type ReactNode, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Work } from "@/data/types.ts";
import { Icon } from "./Icon.tsx";

/**
 * A page's fixed navigation controls. There is no bar and no gradient: the
 * controls are .chip buttons like the theme toggle. Back is top-left. On a
 * work page the previous and next works are at mid-height on the left and
 * right edges (EdgeChip), like an image gallery's pager, and show the
 * work's title on hover. Escape goes back, and so does a click on the empty
 * side margins, as in a lightbox.
 */
export function Doorway({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  // An exiting page is still mounted; it must not handle key presses.
  const present = useIsPresent();

  // Decide on the history index, not location.key: a replace navigation
  // creates a new key but keeps idx 0 when the page was opened directly, and
  // navigate(-1) from idx 0 would take the visitor off the site.
  // useCallback keeps the identity stable, so the Escape listener below is
  // attached once, not on every render.
  const goBack = useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, present]);

  return (
    <>
      {/* clicking the empty side margins also goes back (for mouse users;
          keyboard users have the back button and Escape) */}
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
        className="chip fixed top-5 left-5 z-50"
      >
        <Icon>
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </Icon>
      </button>
      {children}
    </>
  );
}

export function EdgeChip({
  side,
  work,
  onClick,
}: {
  side: "prev" | "next";
  work: Work;
  onClick: () => void;
}) {
  const { title, lang } = work;
  const edge = side === "prev" ? "left-5 flex-row" : "right-5 flex-row-reverse";
  // Hidden on narrow screens, where a mid-height button would cover the
  // text column: there the links are at the end of the article (ShelfLink,
  // WorkRoom.tsx).
  return (
    <div
      className={`group/edge fixed top-1/2 z-50 hidden -translate-y-1/2 items-center gap-3 md:flex ${edge}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`${side === "prev" ? "Previous" : "Next"}: ${title}`}
        className="chip"
      >
        <Icon>
          {side === "prev" ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <path d="M9 6l6 6-6 6" />
          )}
        </Icon>
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
