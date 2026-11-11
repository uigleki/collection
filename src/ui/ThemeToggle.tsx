import { flipTheme, type Theme, useTheme } from "@/lib/theme.ts";
import { Icon } from "./Icon.tsx";

/**
 * Shows where you're going: a sun by night, a moon by day. Both glyphs are
 * always there, one turned away, so a press turns one out as the other
 * turns in — on a spring, and back again from mid-turn. Which one shows is
 * the stylesheet's call, read off the document's theme (index.css): the
 * page is drawn before this runs, and the right glyph has to be in it. The
 * page's colors follow on their own transition.
 */
export function ThemeToggle() {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Switch to day" : "Switch to night";

  return (
    <button
      type="button"
      onClick={flipTheme}
      aria-label={label}
      title={label}
      className="chip fixed top-5 right-5 z-50"
    >
      <span className="glyph" data-turns-to="light">
        <Icon>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </Icon>
      </span>
      <span className="glyph" data-turns-to="dark">
        <Icon filled>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </Icon>
      </span>
    </button>
  );
}
