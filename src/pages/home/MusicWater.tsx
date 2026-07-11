import { motion, useReducedMotion } from "motion/react";
import { music } from "@/data/works";
import { useGlade } from "@/lib/useNight";

/** The songs live on the water; in view, the moonglade burns brighter. */
export function MusicWater() {
  const reduced = useReducedMotion();
  const ref = useGlade<HTMLElement>();

  return (
    <section ref={ref} aria-label="Music" className="relative py-20 md:py-28">
      <header className="mb-14 flex min-h-[24vh] items-end">
        <div className="flex items-baseline gap-4">
          <h2 className="text-title font-light tracking-tight">Music</h2>
          <span className="font-mono text-caption text-hoshi tabular-nums">
            {String(music.length).padStart(2, "0")}
          </span>
        </div>
      </header>

      <ul className="divide-y divide-border/60">
        {music.map((track) => {
          const cut = track.title.indexOf(" - ");
          const artist = cut > 0 ? track.title.slice(0, cut) : null;
          const song = cut > 0 ? track.title.slice(cut + 3) : track.title;
          return (
            <motion.li
              key={track.title}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -6% 0px" }}
              transition={{ type: "spring", stiffness: 90, damping: 22 }}
              className="grid gap-1 py-5 md:grid-cols-[1fr_1.15fr] md:items-baseline md:gap-8"
            >
              <span lang={track.lang} className="text-body">
                {artist ? (
                  <span className="font-mono text-caption text-hoshi">
                    {artist}
                    <span aria-hidden="true" className="mx-2">
                      ·
                    </span>
                  </span>
                ) : null}
                <span className="font-medium">{song}</span>
              </span>
              <span className="text-caption text-hoshi italic md:text-body">
                {track.subtitle}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
