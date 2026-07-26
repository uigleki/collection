import type { ReactNode } from "react";

/**
 * The fixtures' one drawing hand: 16px on a 24 unit grid, hairline, round
 * ends. Every chip's glyph is decorative — the control it sits in carries
 * the label — so it is always hidden from the accessibility tree.
 */
export function Icon({
  children,
  filled = false,
}: {
  children: ReactNode;
  filled?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      {...(filled
        ? { fill: "currentColor" }
        : {
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.6,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          })}
    >
      {children}
    </svg>
  );
}
