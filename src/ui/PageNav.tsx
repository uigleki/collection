import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Work } from "@/data/types.ts";
import { useKeydown } from "@/lib/useKeydown.ts";
import { HintButton } from "./HintButton.tsx";
import { Chevron, Icon } from "./Icon.tsx";

const OPEN_HINT = '[popover="hint"]:popover-open';

/**
 * A page's fixed navigation controls. There is no bar and no gradient: the
 * controls are .icon-button buttons like the theme toggle. Back is
 * top-left. On a work page the previous and next works are at mid-height on
 * the left and right edges (EdgeButton), like an image gallery's pager, and
 * show the work's title on hover and focus. Escape goes back, and so does a
 * click on the empty side margins, as in a lightbox.
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

  // Escape first closes an open hint (HintButton); only an Escape with no
  // hint open goes back. The hint closes after this listener has run.
  useKeydown((e) => {
    if (e.key === "Escape" && !document.querySelector(OPEN_HINT)) goBack();
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
      <HintButton
        hint="Back to the collection"
        placement="top-left"
        onClick={goBack}
        className="fixed top-(--control-inset) left-(--control-inset) z-50"
        icon={
          <Icon>
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </Icon>
        }
      />
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
  const next = step === 1;
  // Hidden on narrow screens, where a mid-height button would cover the
  // text column: there the links are at the end of the article (NeighborLink,
  // WorkPage.tsx).
  return (
    <div className="hidden md:contents">
      <HintButton
        hint={
          <>
            <span className="sr-only">{next ? "Next" : "Previous"}: </span>
            <span lang={lang}>{title}</span>
          </>
        }
        placement={next ? "middle-right" : "middle-left"}
        onClick={onClick}
        className={`fixed top-1/2 z-50 -translate-y-1/2 ${next ? "right-(--control-inset)" : "left-(--control-inset)"}`}
        icon={<Chevron step={step} />}
      />
    </div>
  );
}
