import { sections } from "@/data/works.ts";
import { FULL_NIGHT } from "@/lib/moon.ts";
import { useNight, useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { CategoryHeading } from "./CategoryHeading.tsx";
import { ClosingSection } from "./ClosingSection.tsx";
import { EpigraphSection } from "./EpigraphSection.tsx";
import { Hero } from "./Hero.tsx";
import { MusicSection } from "./MusicSection.tsx";
import { WorkRow } from "./WorkRow.tsx";

export function Home() {
  const h1 = usePage();
  useSky({ dim: 0 });
  // One band over everything after the works, so the moon is full wherever
  // past them the reader lands, a jump to the end included.
  const tail = useNight<HTMLDivElement>(FULL_NIGHT);

  return (
    <main id="main" className="relative">
      <Hero h1={h1} />

      <div className="scrim">
        <div className="mx-auto max-w-6xl px-5 md:px-12">
          <div className="md:max-w-[58%]">
            {sections.map((section) => (
              <section key={section.name}>
                <CategoryHeading
                  name={section.name}
                  count={section.entries.length}
                />
                {section.entries.map((entry) => (
                  <WorkRow key={entry.work.slug} entry={entry} />
                ))}
              </section>
            ))}
          </div>

          <div ref={tail}>
            <EpigraphSection />
            <MusicSection />
            <ClosingSection />
          </div>
        </div>
      </div>
    </main>
  );
}

export { Home as Component };
