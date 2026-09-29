import { useIsPresent } from "motion/react";
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

/**
 * Mark an element; `onCross` fires as it enters and leaves the band — only
 * while its page is the one being read. A page on its way out still has
 * elements crossing the viewport as it fades, and they no longer speak for
 * the sky.
 */
function useBand<T extends HTMLElement>(rootMargin: string, onCross: Cross) {
  const ref = useRef<T>(null);
  const present = useIsPresent();
  const latest = useRef(onCross);
  useEffect(() => {
    latest.current = present ? onCross : () => {};
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

export interface SkyClaim {
  /** how far the sky stands back behind the reading, 0..1 */
  dim?: number | undefined;
  /** the night the page opens on */
  night?: number | undefined;
  /** whether reading progress waxes the moon (see signal.ts) */
  waxWithProgress?: boolean | undefined;
}

// Every page that wants something of the sky, oldest first. Pages overlap
// while one leaves and the next arrives, and the departing one lets go
// last — so the sky belongs to the newest claim, not to whoever spoke last.
const claims: SkyClaim[] = [];

function settle() {
  const { dim = 0, night, waxWithProgress = false } = claims.at(-1) ?? {};
  sky.dim = dim;
  sky.waxWithProgress = waxWithProgress;
  if (night !== undefined) sky.targetNight = night;
}

/** Ask the sky for something; the returned function lets go. */
export function claimSky(claim: SkyClaim): () => void {
  const own = { ...claim };
  claims.push(own);
  settle();
  return () => {
    claims.splice(claims.indexOf(own), 1);
    settle();
  };
}

/** A route's claim on the sky, for as long as it is the page being read. */
export function useSky({ dim, night, waxWithProgress }: SkyClaim) {
  const present = useIsPresent();
  useEffect(
    () => (present ? claimSky({ dim, night, waxWithProgress }) : undefined),
    [present, dim, night, waxWithProgress],
  );
}
