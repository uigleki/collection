import type { Location, NavigationType } from "react-router";

/** Which way along the shelf a page change went: back, nowhere, onward. */
export type Step = -1 | 0 | 1;

/**
 * The step a room was reached by. Walking the shelf says so in the
 * navigation's state; a history jump that lands on such an entry again was
 * not a walk, so it is not read as one.
 */
export function stepOf(location: Location, type: NavigationType): Step {
  if (type === "POP") return 0;
  const step = (location.state as { step?: unknown } | null)?.step;
  return step === 1 || step === -1 ? step : 0;
}
