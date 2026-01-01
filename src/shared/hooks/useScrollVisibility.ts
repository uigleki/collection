import { useEffect, useState } from "react";

export function useScrollVisibility(sentinelId: string) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Button is visible when sentinel is NOT interacting (scrolled past)
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null, // Viewport
        threshold: 0,
        rootMargin: "0px",
      },
    );

    const sentinel = document.getElementById(sentinelId);
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      observer.disconnect();
    };
  }, [sentinelId]);

  return isVisible;
}
