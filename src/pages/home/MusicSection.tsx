import { music, trackName } from "@/data/works.ts";
import { useReflectionOnly } from "@/lib/sky.ts";
import { CategoryHeading } from "./CategoryHeading.tsx";

export function MusicSection() {
  const ref = useReflectionOnly();

  return (
    <section ref={ref} aria-label="Music" className="relative py-20 md:py-28">
      <CategoryHeading
        name="Music"
        count={music.length}
        className="mb-14 min-h-[24vh]"
      />

      <ul className="divide-y divide-border/60">
        {music.map((track) => (
          <li
            key={trackName(track)}
            style={{ "--from": "14px" }}
            className="reveal grid gap-1 py-5 md:grid-cols-[1fr_1.15fr] md:items-baseline md:gap-8"
          >
            <span className="text-body">
              <span
                lang={track.artistLang}
                className="font-mono text-caption text-muted"
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
            <span className="text-caption text-muted italic md:text-body">
              {track.subtitle}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
