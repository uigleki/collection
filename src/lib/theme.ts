import { useSyncExternalStore } from "react";
import { sky } from "@/scene/skyState.ts";

type Theme = "dark" | "light";

// The page follows the system theme in CSS alone (index.css: color-scheme,
// light-dark()), and so do the browser-UI colors (index.html: the
// color-scheme and theme-color metas), with or without JavaScript. Script
// is needed only for a visitor's choice, which overrides the system theme:
// the pre-paint script (index.html) applies a stored choice, and this module
// handles every later change, from the toggle or from another tab. It also
// tells the sky, which CSS cannot reach, which theme is showing.

const listeners = new Set<() => void>();
const systemQuery = "(prefers-color-scheme: light)";

function systemTheme(): Theme {
  return window.matchMedia(systemQuery).matches ? "light" : "dark";
}

function storedTheme(): Theme | null {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null; /* private mode */
  }
}

/** The theme showing: the visitor's choice, else the system theme. */
function current(): Theme {
  const chosen = document.documentElement.dataset.theme;
  return chosen === "light" || chosen === "dark" ? chosen : systemTheme();
}

/** Apply a choice, or follow the system theme again (null). */
function apply(choice: Theme | null) {
  const root = document.documentElement;
  if (choice) root.dataset.theme = choice;
  else delete root.dataset.theme;
  const scheme = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (scheme) scheme.content = choice ?? "light dark";
  // Each theme-color meta applies to one system theme (its media query) and
  // keeps its own color in data-color. A choice gives both the chosen
  // theme's color, so the browser UI matches whatever the system theme is.
  const metas = document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const chosen = [...metas].find((m) => m.dataset.theme === choice);
  for (const meta of metas) {
    const color = (chosen ?? meta).dataset.color;
    if (color) meta.content = color;
  }
  syncSky();
}

function syncSky() {
  sky.targetLightTheme = current() === "light" ? 1 : 0;
  for (const l of listeners) l();
}

/**
 * A choice that matches the system theme is not stored: the visitor is
 * undoing an earlier choice, and storing it would pin the page to that
 * theme after the system theme changes.
 */
function choose(theme: Theme) {
  const choice = theme === systemTheme() ? null : theme;
  try {
    if (choice) localStorage.setItem("theme", choice);
    else localStorage.removeItem("theme");
  } catch {
    /* private mode — the choice simply doesn't persist */
  }
  apply(choice);
}

/**
 * Switch to the other theme. The current theme is read from the document at
 * call time, not from the control's last render: two presses within one
 * frame must switch the theme and switch it back.
 */
export function toggleTheme() {
  choose(current() === "dark" ? "light" : "dark");
}

/**
 * Sync the sky on load and after every system theme change, and apply a
 * choice made in another tab.
 */
export function initTheme(): () => void {
  sky.lightTheme = current() === "light" ? 1 : 0;
  syncSky();

  const media = window.matchMedia(systemQuery);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "theme" || e.key === null) apply(storedTheme());
  };
  media.addEventListener("change", syncSky);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", syncSky);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    current,
    () => "dark",
  );
}
