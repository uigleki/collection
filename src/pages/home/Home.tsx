import { siteMeta } from "@/data/site.ts";
import { sections } from "@/data/works.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { DawnClose } from "./DawnClose.tsx";
import { Hero } from "./Hero.tsx";
import { Interlude } from "./Interlude.tsx";
import { Koan } from "./Koan.tsx";
import { MusicWater } from "./MusicWater.tsx";
import { NightRow } from "./NightRow.tsx";

/** The whole night: fourteen works → the koan → the music → dawn. */
export function Home() {
  const h1 = usePage(siteMeta.title);

  // The one page that is a whole month: scrolling it waxes the moon.
  useSky({ waxWithProgress: true });

  return (
    <main id="main" className="relative">
      <Hero h1={h1} />

      <div className="scrim">
        <div className="mx-auto max-w-6xl px-5 md:px-12">
          <div className="md:max-w-[58%]">
            {sections.map((section) => (
              <section key={section.name} aria-label={section.name}>
                <Interlude name={section.name} count={section.entries.length} />
                {section.entries.map((entry) => (
                  <NightRow key={entry.work.slug} entry={entry} />
                ))}
              </section>
            ))}
          </div>

          <Koan />
          <MusicWater />
          <DawnClose />
        </div>
      </div>
    </main>
  );
}

export { Home as Component };
