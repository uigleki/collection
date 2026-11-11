import type { ReactNode } from "react";

/**
 * The SVG wrapper for every button icon, so they share one size and stroke.
 * Every icon is decorative: the control that contains it has the label, so
 * the icon is always hidden from the accessibility tree.
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
