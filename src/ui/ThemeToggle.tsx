import { toggleTheme, useTheme } from "@/lib/theme.ts";
import { Icon } from "./Icon.tsx";

/**
 * Shows the theme a press switches to: a sun in the dark theme, a moon in
 * the light theme. Both icons are always rendered and one is rotated away
 * and faded out, so a press rotates one out and the other in, on a spring
 * that can reverse mid-rotation. The stylesheet picks the visible icon from
 * the document's data-theme (index.css), not this component: the page is
 * prerendered and painted before this code runs, and the correct icon must
 * already be showing. The page's colors change on their own transition.
 */
export function ThemeToggle() {
  const label = useTheme() === "dark" ? "Switch to day" : "Switch to night";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="icon-button fixed top-5 right-5 z-50"
    >
      <span className="glyph" data-target-theme="light">
        <Icon>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </Icon>
      </span>
      <span className="glyph" data-target-theme="dark">
        <Icon filled>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </Icon>
      </span>
    </button>
  );
}
