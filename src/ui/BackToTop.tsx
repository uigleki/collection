import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/scroll.ts";
import { Icon } from "./Icon.tsx";

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
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      className={`icon-button fixed right-5 bottom-5 z-50 ${shown ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <Icon>
        <path d="M12 19V5M6 11l6-6 6 6" />
      </Icon>
    </button>
  );
}
