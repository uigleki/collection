import { useSyncExternalStore } from "react";
import { sky } from "@/scene/signal.ts";

export type Theme = "dark" | "light";

// One owner for the theme: the pre-paint script (index.html) sets the first
// value; this module handles every change after — the toggle, and the OS
// switching mid-visit (which only counts until the visitor states a
// preference of their own).

const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  sky.targetDay = theme === "light" ? 1 : 0;
  for (const l of listeners) l();
}

function chooseTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode — the choice simply doesn't persist */
  }
  apply(theme);
}

/**
 * Turn to the other theme — whichever is showing *now*, not whichever was
 * showing when the control last rendered: two presses inside one frame
 * must turn the page there and back.
 */
export function flipTheme() {
  chooseTheme(current() === "dark" ? "light" : "dark");
}

/** Sync the sky on load and follow the OS until the visitor chooses. */
export function initTheme(): () => void {
  sky.targetDay = sky.day = current() === "light" ? 1 : 0;

  const media = window.matchMedia("(prefers-color-scheme: light)");
  const follow = () => {
    let chosen: string | null = null;
    try {
      chosen = localStorage.getItem("theme");
    } catch {
      /* private mode */
    }
    const theme = media.matches ? "light" : "dark";
    if (!chosen && theme !== current()) apply(theme);
  };
  media.addEventListener("change", follow);
  // The system may have switched after the pre-paint script ran but before
  // this listener existed; that change fired into nothing, so catch up.
  follow();
  return () => media.removeEventListener("change", follow);
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
