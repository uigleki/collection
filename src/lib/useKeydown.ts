import { useIsPresent } from "motion/react";
import { useEffect, useEffectEvent } from "react";

/**
 * A page's window keydown listener. It is attached only while the page is
 * the current one: an exiting page is still mounted and must not handle
 * key presses.
 */
export function useKeydown(onKey: (e: KeyboardEvent) => void) {
  const present = useIsPresent();
  const handle = useEffectEvent(onKey);
  useEffect(() => {
    if (!present) return;
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [present]);
}
