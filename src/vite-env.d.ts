/// <reference types="vite/client" />

/** Palette colors from src/styles/index.css, as #rrggbb (vite.config.ts). */
declare const __PALETTE__: Record<
  "background" | "foreground" | "accent",
  { dark: string; light: string }
>;
