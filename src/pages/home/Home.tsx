import { useEffect } from "react";
import { categories, entriesFor, siteMeta } from "@/data/works";
import { usePage } from "@/lib/usePage";
import { sky } from "@/scene/signal";
import { DawnClose } from "./DawnClose";
import { Hero } from "./Hero";
import { Interlude } from "./Interlude";
import { Koan } from "./Koan";
import { MusicWater } from "./MusicWater";
import { NightRow } from "./NightRow";

/** The whole night: fourteen works → the koan → the music → dawn. */
export function Home() {
  const h1 = usePage(siteMeta.title);

  useEffect(() => {
    sky.dim = 0;
  }, []);

  return (
    <main id="main" className="relative">
      <Hero h1={h1} />

      <div className="scrim">
        <div className="mx-auto max-w-6xl px-5 md:px-12">
          <div className="md:max-w-[58%]">
            {categories.map((category) => (
              <section key={category.name} aria-label={category.name}>
                <Interlude name={category.name} count={category.works.length} />
                {entriesFor(category.name).map((entry) => (
                  <NightRow key={entry.slug} entry={entry} />
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
