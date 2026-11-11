import { useSyncExternalStore } from "react";
import { sky } from "@/scene/skyState.ts";

type Theme = "dark" | "light";

// The theme has one owner: the pre-paint script (index.html) sets the first
// value, and this module handles every later change: the toggle, and an OS
// theme switch during the visit (followed only until the visitor chooses a
// theme).

const listeners = new Set<() => void>();

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  // index.html's meta has both background colors: data-dark and data-light
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const color = meta?.dataset[theme];
  if (meta && color) meta.content = color;
  sky.targetLightTheme = theme === "light" ? 1 : 0;
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
 * Switch to the other theme. The current theme is read from the document at
 * call time, not from the control's last render: two presses within one
 * frame must switch the theme and switch it back.
 */
export function toggleTheme() {
  chooseTheme(current() === "dark" ? "light" : "dark");
}

/** Sync the sky on load and follow the OS until the visitor chooses. */
export function initTheme(): () => void {
  sky.targetLightTheme = sky.lightTheme = current() === "light" ? 1 : 0;

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
  // The system theme may have changed after the pre-paint script ran but
  // before this listener was added. That change event was missed, so apply
  // the current system theme now.
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
