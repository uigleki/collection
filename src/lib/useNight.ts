import { useEffect, useRef } from "react";
import { sky } from "@/scene/signal";

/**
 * When the marked element crosses the middle band of the viewport, its night
 * becomes the sky's target — this is how scrolling waxes the moon, one night
 * at a time, exactly in step with the work being read.
 */
export function useNight<T extends HTMLElement>(night: number) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) sky.targetNight = night;
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [night]);
  return ref;
}

/** The music section brightens the moonglade while it holds the viewport. */
export function useGlade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sky.glade = entry.isIntersecting ? 1 : 0;
        }
      },
      { rootMargin: "-30% 0px -30% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
