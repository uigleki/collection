import type { Location, NavigationType } from "react-router";

/** Direction of a page change along the shelf: previous, none, next. */
export type Step = -1 | 0 | 1;

/**
 * The step by which a work page was reached. A previous/next navigation
 * records its step in the navigation state. A history navigation (POP) to
 * such an entry is not a previous/next step, so it counts as none.
 */
export function stepOf(location: Location, type: NavigationType): Step {
  if (type === "POP") return 0;
  const step = (location.state as { step?: unknown } | null)?.step;
  return step === 1 || step === -1 ? step : 0;
}
