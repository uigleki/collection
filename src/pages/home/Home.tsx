import { sections } from "@/data/works.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { CategoryHeading } from "./CategoryHeading.tsx";
import { ClosingSection } from "./ClosingSection.tsx";
import { EpigraphSection } from "./EpigraphSection.tsx";
import { Hero } from "./Hero.tsx";
import { MusicSection } from "./MusicSection.tsx";
import { WorkRow } from "./WorkRow.tsx";

export function Home() {
  const h1 = usePage();

  // The only page where scroll progress advances the moon's phase.
  useSky({ fullMoonByScroll: true });

  return (
    <main id="main" className="relative">
      <Hero h1={h1} />

      <div className="scrim">
        <div className="mx-auto max-w-6xl px-5 md:px-12">
          <div className="md:max-w-[58%]">
            {sections.map((section) => (
              <section key={section.name} aria-label={section.name}>
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

          <EpigraphSection />
          <MusicSection />
          <ClosingSection />
        </div>
      </div>
    </main>
  );
}

export { Home as Component };
