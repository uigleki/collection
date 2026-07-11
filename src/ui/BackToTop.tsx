import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/scroll";
import { chip } from "./chip";

/**
 * Bottom-right, same glass language as every other fixture. Appears only
 * once the reader is more than a viewport deep — before that it would be
 * furniture.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setShown(window.scrollY > window.innerHeight * 1.2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      className={`${chip} fixed right-5 bottom-5 z-50 ${shown ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
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
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
