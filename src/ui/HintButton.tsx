import { type ReactNode, useId } from "react";

/** Where the hint sits: beside the control, toward the page's middle. */
type HintPlacement =
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "middle-left"
  | "middle-right";

/**
 * A fixed, round icon button (.icon-button) whose label is shown as a hint
 * next to it on hover or keyboard focus. The hint is a `popover="hint"`
 * opened by the button's `interestfor`, so the browser shows it, keeps it
 * open while the pointer is over it, and closes it on Escape; where interest
 * invokers are unsupported, src/lib/interest.ts does the same. The hint is
 * also the button's accessible name, so its text is the label.
 */
export function HintButton({
  hint,
  placement,
  icon,
  onClick,
  inert,
  className = "",
}: {
  hint: ReactNode;
  placement: HintPlacement;
  icon: ReactNode;
  onClick: () => void;
  inert?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-labelledby={id}
        interestfor={id}
        inert={inert}
        className={`icon-button ${className}`}
      >
        {icon}
      </button>
      <span id={id} popover="hint" className={`hint hint-${placement}`}>
        {hint}
      </span>
    </>
  );
}
