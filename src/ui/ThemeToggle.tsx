import { useCallback } from "react";
import { chooseTheme, type Theme, useTheme } from "@/lib/theme";
import { chip } from "./chip";

/**
 * Shows where you're going: a sun by night, a moon by day. Switching runs
 * the eclipse wipe — the incoming sky expands as a circle from the toggle
 * itself (see index.css).
 */
export function ThemeToggle() {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!document.startViewTransition || reduced) {
        chooseTheme(next);
        return;
      }
      const r = e.currentTarget.getBoundingClientRect();
      const root = document.documentElement;
      root.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
      root.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
      document.startViewTransition(() => chooseTheme(next));
    },
    [next],
  );

  const label = next === "light" ? "Switch to day" : "Switch to night";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${chip} fixed top-5 right-5 z-50`}
    >
      {next === "light" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
