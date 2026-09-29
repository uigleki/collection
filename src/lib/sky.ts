import { useEffect, useRef } from "react";
import { sky } from "@/scene/signal.ts";

type Cross = (visible: boolean) => void;

// One observer per band, shared by every element watching that band. The home
// page marks seventeen elements; seventeen separate IntersectionObservers meant
// seventeen callbacks to service on one scroll, each holding its own component
// scope. Here the closure captures a single number.
const bands = new Map<
  string,
  { io: IntersectionObserver; watchers: WeakMap<Element, Cross> }
>();

function band(rootMargin: string) {
  let existing = bands.get(rootMargin);
  if (!existing) {
    const watchers = new WeakMap<Element, Cross>();
    const io = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          watchers.get(record.target)?.(record.isIntersecting);
        }
      },
      { rootMargin },
    );
    existing = { io, watchers };
    bands.set(rootMargin, existing);
  }
  return existing;
}

/** Mark an element; `onCross` fires as it enters and leaves the band. */
function useBand<T extends HTMLElement>(rootMargin: string, onCross: Cross) {
  const ref = useRef<T>(null);
  const latest = useRef(onCross);
  useEffect(() => {
    latest.current = onCross;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { io, watchers } = band(rootMargin);
    watchers.set(el, (visible) => latest.current(visible));
    io.observe(el);
    return () => {
      io.unobserve(el);
      watchers.delete(el);
    };
  }, [rootMargin]);
  return ref;
}

/**
 * When the marked element crosses the middle band of the viewport, its night
 * becomes the sky's target — this is how scrolling waxes the moon, one night
 * at a time, exactly in step with the work being read.
 */
export function useNight<T extends HTMLElement>(night: number) {
  return useBand<T>("-40% 0px -40% 0px", (visible) => {
    if (visible) sky.targetNight = night;
  });
}

/** The music section brightens the moonglade while it holds the viewport. */
export function useGlade<T extends HTMLElement>() {
  return useBand<T>("-30% 0px -30% 0px", (visible) => {
    sky.glade = visible ? 1 : 0;
  });
}

/**
 * How far a route stands the sky back behind its reading, and which night it
 * opens on. Every route that dims returns the sky on the way out, so the one
 * route that wants it undimmed — home — needs to say nothing.
 */
export function useSky({
  dim = 0,
  night,
  waxWithProgress = false,
}: {
  dim?: number;
  night?: number;
  waxWithProgress?: boolean;
}) {
  useEffect(() => {
    if (night !== undefined) sky.targetNight = night;
    sky.dim = dim;
    sky.waxWithProgress = waxWithProgress;
    return () => {
      sky.dim = 0;
      sky.waxWithProgress = false;
    };
  }, [dim, night, waxWithProgress]);
}
