import { music, trackName } from "@/data/works.ts";
import { useGlade } from "@/lib/sky.ts";
import { Interlude } from "./Interlude.tsx";

/** The songs live on the water; in view, the moonglade burns brighter. */
export function MusicWater() {
  const ref = useGlade<HTMLElement>();

  return (
    <section ref={ref} aria-label="Music" className="relative py-20 md:py-28">
      <Interlude
        name="Music"
        count={music.length}
        className="mb-14 min-h-[24vh]"
      />

      <ul className="divide-y divide-border/60">
        {music.map((track) => (
          <li
            key={trackName(track)}
            style={{ "--from": "14px" } as React.CSSProperties}
            className="arrive grid gap-1 py-5 md:grid-cols-[1fr_1.15fr] md:items-baseline md:gap-8"
          >
            <span className="text-body">
              <span
                lang={track.artistLang}
                className="font-mono text-caption text-hoshi"
              >
                {track.artist}
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
              </span>
              <span lang={track.lang} className="font-medium">
                {track.title}
              </span>
            </span>
            <span className="text-caption text-hoshi italic md:text-body">
              {track.subtitle}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
