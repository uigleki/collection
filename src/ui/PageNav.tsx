import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Work } from "@/data/types.ts";
import { useKeydown } from "@/lib/useKeydown.ts";
import { Chevron, Icon } from "./Icon.tsx";

/**
 * A page's fixed navigation controls. There is no bar and no gradient: the
 * controls are .icon-button buttons like the theme toggle. Back is
 * top-left. On a work page the previous and next works are at mid-height on
 * the left and right edges (EdgeButton), like an image gallery's pager, and
 * show the work's title on hover. Escape goes back, and so does a click on
 * the empty side margins, as in a lightbox.
 */
export function PageNav({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();

  // Decide on the history index, not location.key: a replace navigation
  // creates a new key but keeps idx 0 when the page was opened directly, and
  // navigate(-1) from idx 0 would take the visitor off the site.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/");
  };

  useKeydown((e) => {
    if (e.key === "Escape") goBack();
  });

  return (
    <>
      {/* clicking the empty side margins also goes back (for mouse users;
          keyboard users have the back button and Escape) */}
      {["left-0", "right-0"].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          onClick={goBack}
          className={`fixed inset-y-0 z-10 hidden w-[max(0px,calc((100vw-72rem)/2-1rem))] cursor-pointer lg:block ${side}`}
        />
      ))}
      <button
        type="button"
        onClick={goBack}
        aria-label="Back to the collection"
        title="Back to the collection"
        className="icon-button fixed top-5 left-5 z-50"
      >
        <Icon>
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </Icon>
      </button>
      {children}
    </>
  );
}

export function EdgeButton({
  step,
  work,
  onClick,
}: {
  step: 1 | -1;
  work: Work;
  onClick: () => void;
}) {
  const { title, lang } = work;
  const edge = step === 1 ? "right-5 flex-row-reverse" : "left-5 flex-row";
  // Hidden on narrow screens, where a mid-height button would cover the
  // text column: there the links are at the end of the article (NeighborLink,
  // WorkPage.tsx).
  return (
    <div
      className={`group/edge fixed top-1/2 z-50 hidden -translate-y-1/2 items-center gap-3 md:flex ${edge}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`${step === 1 ? "Next" : "Previous"}: ${title}`}
        className="icon-button"
      >
        <Chevron step={step} />
      </button>
      <span
        lang={lang}
        aria-hidden="true"
        className="max-w-48 truncate rounded-full border border-border/50 bg-surface/70 px-3 py-1 text-caption text-muted opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/edge:opacity-100"
      >
        {title}
      </span>
    </div>
  );
}
