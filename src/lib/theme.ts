import { useSyncExternalStore } from "react";
import { sky } from "@/scene/signal";

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

export function chooseTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode — the choice simply doesn't persist */
  }
  apply(theme);
}

/** Sync the sky on load and follow the OS until the visitor chooses. */
export function initTheme(): () => void {
  sky.targetDay = sky.day = current() === "light" ? 1 : 0;

  const media = window.matchMedia("(prefers-color-scheme: light)");
  const follow = (e: MediaQueryListEvent) => {
    let chosen: string | null = null;
    try {
      chosen = localStorage.getItem("theme");
    } catch {
      /* private mode */
    }
    if (!chosen) apply(e.matches ? "light" : "dark");
  };
  media.addEventListener("change", follow);
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
