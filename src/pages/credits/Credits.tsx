import { siteMeta } from "@/data/site";
import { allWorks } from "@/data/works";
import { coverFor } from "@/lib/covers";
import { useSky } from "@/lib/sky";
import { usePage } from "@/lib/usePage";
import { Reading } from "@/ui/Reading";

// Walked in the collection's own order, asking each work for its art — not
// read off the generated file. A cover the fetch script failed to bring back
// is a work missing its credit, and a credit list that quietly omits a rights
// holder is the one failure this page must not have (works.test.ts proves it
// cannot). The list is the same on every render, so it is built once.
const CREDITED = allWorks.flatMap(({ work }) => {
  const cover = coverFor(work.slug);
  return cover ? [{ work, cover }] : [];
});

/**
 * The colophon. Where every borrowed thing is named: the cover art's
 * sources, the letterforms, the machinery. A shrine credits its carpenters.
 */
export function Credits() {
  const h1 = usePage(`Colophon — ${siteMeta.title}`);

  useSky({ dim: 0.75 });

  return (
    <Reading>
      <h1
        ref={h1}
        tabIndex={-1}
        className="text-title font-light tracking-tight"
      >
        Colophon
      </h1>

      <section className="mt-14">
        <h2 className="text-lead font-medium">Cover art</h2>
        <p className="mt-3 text-body text-hoshi">
          Shown in true color, unfiltered, at reduced size, linking to each
          source — the art belongs to its creators.
        </p>
        <ul className="mt-6 divide-y divide-border/60">
          {CREDITED.map(({ work, cover }) => (
            <li
              key={work.slug}
              className="grid gap-1 py-3 md:grid-cols-[1fr_auto] md:gap-6"
            >
              <span lang={work.lang} className="text-body">
                {work.title}
              </span>
              <a
                href={cover.sourceUrl}
                rel="noopener"
                className="link-draw text-caption text-hoshi hover:text-tsuki"
              >
                {cover.credit} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-lead font-medium">Letterforms</h2>
        <ul className="mt-4 space-y-2 text-body text-hoshi">
          <li>
            Latin — Ubuntu, by Dalton Maag (Ubuntu Font Licence), self-hosted.
          </li>
          <li>
            CJK — Noto Sans CJK (SIL OFL), subset to this site's glyphs in both
            Simplified-Chinese and Japanese forms, so every title keeps its own
            regional letterforms.
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-lead font-medium">Machinery</h2>
        <p className="mt-4 text-body text-hoshi">
          React, Vite, Tailwind CSS, Motion, OGL — one WebGL sky, native scroll,
          no trackers, no analytics, no cookies.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-lead font-medium">License</h2>
        <p className="mt-4 text-body text-hoshi">
          Text and curation{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            rel="license noopener"
            className="link-draw hover:text-tsuki"
          >
            CC BY-SA 4.0
          </a>
          ; code{" "}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            rel="license noopener"
            className="link-draw hover:text-tsuki"
          >
            AGPL-3.0-only
          </a>
          , with{" "}
          <a
            href="https://github.com/uigleki/collection"
            rel="noopener"
            className="link-draw hover:text-tsuki"
          >
            source on GitHub ↗
          </a>
          . Cover art remains the property of its creators, shown reduced with
          credit — any rights holder&rsquo;s removal request will be honored
          immediately.
        </p>
      </section>
    </Reading>
  );
}

export { Credits as Component };
