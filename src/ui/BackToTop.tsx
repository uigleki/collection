import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/scroll.ts";
import { HintButton } from "./HintButton.tsx";
import { Icon } from "./Icon.tsx";

// The button becomes inert at the top of the page, which would drop its
// focus to the document body. Focus goes to the current page's h1 instead,
// where the reader now is.
function backToTop() {
  scrollToTop();
  document
    .querySelector<HTMLElement>("[data-page-layer]:not([inert]) h1")
    ?.focus({ preventScroll: true });
}

/**
 * Shown only once the page is scrolled more than a viewport down: before
 * that it has no use.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 1.2);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <HintButton
      hint="Back to top"
      placement="bottom-right"
      onClick={backToTop}
      inert={!shown}
      className={`fixed right-(--control-inset) bottom-(--control-inset) z-50 ${shown ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      icon={
        <Icon>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </Icon>
      }
    />
  );
}
