import { allWorks } from "@/data/works.ts";
import { coverFor } from "@/lib/covers.ts";
import { useSky } from "@/lib/sky.ts";
import { usePage } from "@/lib/usePage.ts";
import { TextPage } from "@/ui/TextPage.tsx";

// Built by iterating allWorks in collection order and looking up each work's
// cover, not by reading the generated covers file. A cover the fetch script
// failed to produce leaves its work without a credit, and this page must
// never omit a rights holder: works.test.ts checks that every work with an
// art source has a credited cover. The list is the same on every render, so
// it is built once.
const CREDITED = allWorks.flatMap(({ work }) => {
  const cover = coverFor(work.slug);
  return cover ? [{ work, cover }] : [];
});

/**
 * The colophon page: credits for the cover art sources, the fonts and the
 * libraries.
 */
export function Credits() {
  const h1 = usePage("Colophon");

  useSky({ dim: 0.75 });

  return (
    <TextPage>
      <h1
        ref={h1}
        tabIndex={-1}
        className="text-title font-light tracking-tight"
      >
        Colophon
      </h1>

      <section className="mt-14">
        <h2 className="text-lead font-medium">Cover art</h2>
        <p className="mt-3 text-body text-muted">
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
              {/* A grid item is blockified and stretched to its track, and
                  link-draw underlines the link's whole box. Stretched, the
                  underline and the click target would span the row.
                  justify-self-start shrinks the box back to the text. */}
              <a
                href={cover.sourceUrl}
                rel="noopener"
                className="link-draw justify-self-start text-caption text-muted hover:text-foreground"
              >
                {cover.credit} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-lead font-medium">Letterforms</h2>
        <ul className="mt-4 space-y-2 text-body text-muted">
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
        <p className="mt-4 text-body text-muted">
          React, Vite, Tailwind CSS, Motion, OGL — one WebGL sky, native scroll,
          no trackers, no analytics, no cookies.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-lead font-medium">License</h2>
        <p className="mt-4 text-body text-muted">
          Text and curation{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            rel="license noopener"
            className="link-draw hover:text-foreground"
          >
            CC BY-SA 4.0
          </a>
          ; code{" "}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            rel="license noopener"
            className="link-draw hover:text-foreground"
          >
            AGPL-3.0-only
          </a>
          , with{" "}
          <a
            href="https://github.com/uigleki/collection"
            rel="noopener"
            className="link-draw hover:text-foreground"
          >
            source on GitHub ↗
          </a>
          . Cover art remains the property of its creators, shown reduced with
          credit — any rights holder&rsquo;s removal request will be honored
          immediately.
        </p>
      </section>
    </TextPage>
  );
}

export { Credits as Component };
