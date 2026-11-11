# DESIGN — Perfect Collection

Design notes for the site.
The design tokens are defined in `src/styles/index.css` (`@theme`) and `src/content/catalog.ts`; this document explains them.
The site should meet the three criteria the collection applies to works (docs/why.md): creative love, internal coherence, authentic beauty.
The user's decisions are in `docs/adr/` and outrank these notes.

## Overview

The home page presents the collection as one lunar month.

- The page opens on a night sky with a new moon.
- Each work is one night, and scrolling advances the moon's phase.
  The last work is at the full moon.
- At the full moon the page shows the line "The finger pointing at the moon is not the moon" and links to /why.
- The music list comes next, over the sea.
  There the moon in the sky fades almost out and its reflection on the water brightens.
- The page opens with the first sentence of docs/why.md and ends with its last: "The beauty you were born to experience?
  / You've found it."

The page does not explain this mapping and has no labels for it.

The sky is the one prominent effect: a single WebGL canvas that persists across pages.

- The moon's terminator is computed from the phase (`src/lib/moon.ts`).
- The sea is rendered in perspective, from a camera at a fixed height above a flat water plane, and reflects the same sky and moon.
- The moon's reflection is not drawn as a shape.
  It comes from wave facets that reflect the moon toward the camera, so it narrows toward the horizon.
- The sea animates on its own clock and does not react to scrolling.
- There are no other ambient effects: no cursor effects and no sound.

How the design applies the criteria in docs/why.md:

- There is no loader: the static fallback image is shown first and the WebGL sky fades in over it.
- The end of the page has no climax effect.
- The design relies on detail, not repetition: a returning visitor can notice the moon phases, the moon's reflection and the work accents.
- The dark theme is bright enough to read as moonlit, not gloomy.
- On the home page the moon is the reading-progress indicator: its phase follows the scroll position.
- A work's night number is set by its position in the list.
- Each work page uses that work's accent color.

## Content

What the site says about the works comes from the Markdown files (docs/adr/0003).
`src/content` parses README.md, docs/reviews.md and docs/why.md at build time.
`src/content/catalog.ts` holds the data Markdown cannot carry: slugs, accent colors, cover sources, and the language of each non-Latin name.
To add a work, add it to the Markdown and add one catalog entry.
The build fails if the Markdown and the catalog disagree.

## Colors

Each theme uses two background colors and one accent color for the UI.
The per-work accent colors are never used in the UI outside that work's row and page.

Dark theme (default):

- **background (#0b0e17)** — the page background and the top of the sky.
- **surface (#12161f)** — raised surfaces and buttons.
- **border (#2a3140)** — borders.
- **foreground (#eaf1f8)** — text and the moon.
- **muted (#98a2b3)** — secondary text.
- **accent (#cdb489)** — the only UI accent.

Light theme: a bright golden-hour sky, bright enough that dark text is readable over any part of it.
The shader draws pastel periwinkle above pale gold.
The background is a warm paper color, text is dark, and the single accent is gold.
The light theme redefines the same six color names, so components use one set of names in both themes.
Switching theme changes the page and the sky together, without a reload.
Only the moon disc, drawn in gold, is strongly saturated.

Each work has an accent color: the color the work is known for (for example Senjougahara's purple), adjusted by hand for contrast on the dark background.
The accent of 少女終末旅行 is muted on purpose, because the work's own palette is.
Accents are stored in the catalog, not as CSS tokens, so UI styles cannot reference them.
An accent is used only in that work's row and page: title underline, cover border and glow, review labels.
Cover art is shown in its original colors, with no filter or tint.

Contrast: at least WCAG AA (4.5:1 body text, 3:1 large text) in both themes.

## Typography

- Tabular and navigation data: Ubuntu Mono.
- CJK text: CollectionCJK (a Noto Sans SC subset) by default, CollectionCJK-JP for `:lang(ja)`.
  Han unification gives Chinese and Japanese the same code points with different glyph shapes, so Japanese titles need the JP font.
  Each title's language is stored as data (`lang`), not guessed from its characters.
- Components use a type-scale role, not a raw font size.
- Line height for CJK display text is at least 1.15.
  Latin display text may use 1.02–1.04.
- Display text animates in line by line behind a mask.
  It is not split per character, because that breaks CJK glyph clusters.

## Layout

- Wide screens: the text column is left of center and the moon is in the empty space on the right.
  Narrow screens: the text column is full width, over a faint scrim.
- The gaps between media sections are intentionally almost empty.
- Fixed controls share one style (round glass buttons) and fixed positions: theme toggle top-right, back top-left, previous/next at the middle of the left and right edges, back-to-top bottom-right (shown after scrolling one viewport).
- Work pages behave like lightboxes.
  Escape returns to the home page, and on wide screens so does a click on the empty margins.
  Previous/next step through all works in list order, across media, by button, arrow key or horizontal swipe.
  On narrow screens the edge buttons are hidden, and previous/next links with the works' full titles are shown at the bottom of the page instead.

## Components

- **Cover** — the placeholder has the image's aspect ratio, so loading causes no layout shift.
  It has a thin border in the work's accent.
  On navigation between a row and its work page, the cover animates from one position to the other while the pages cross-fade; the cover itself does not fade.
  A work with no licensed cover source shows a text panel instead.
- **WorkRow** — the whole row is a single link.
  On hover the cover lifts and tilts toward the cursor, the title's accent underline extends, and an accent glow appears under the cover.
- **Work page** — the sky animates to the work's moon phase and dims behind the text.
  The page opens scrolled to the top with one short entrance animation.
  Previous/next slides the page horizontally, and a swipe past the first or last work rubber-bands.
  If the browser already animated the navigation (for example an edge-swipe back), the site changes page without its own animation.
  Reviews list a work's shortcomings in their own section, under the heading reviews.md uses.
- **Icon buttons** — 44px round glass buttons; the label appears on hover.
- **Link** — every text link animates its underline in from left to right.

## Do's and Don'ts

Do:

- Each kind of motion has one spring definition in `src/lib/motion.ts`, used by both JavaScript and CSS.
- Use native scrolling, with no scroll library, and never block or delay scrolling.
  A page reached through history restores its scroll position; a page opened by a link starts at the top.
- Scroll reveals are scroll-driven animations: progress follows the scroll position, and scrolling back reverses them.
  In browsers without support, the content is shown without the animation.
- Animate only compositor properties: transform and opacity.
- Apply hover styles only on devices that can hover; on a touch screen a tapped control would stay in its hover state.
- With reduced motion, elements render in their end state with no transition, the moon still shows the correct phase, and page changes are instant.
- The build prerenders every page to an HTML file, so content is readable before and without JavaScript.
  A URL with no page returns 404.
- Page code is prefetched so navigation does not wait on the network, unless the visitor has Save-Data enabled.
- When the frame rate drops, the sky lowers its resolution.
  Without a GPU, the static fallback image is shown instead of the WebGL sky.
- Required: Lighthouse performance ≥ 0.90 and accessibility ≥ 0.95, LCP ≤ 2s, CLS ≤ 0.05, zero axe violations in both themes, full keyboard access (skip link, focus moved to the h1 on route change, visible focus rings).
  After changing the shader or the entry bundle, run Lighthouse.

Don't:

- No colors outside the palette, no filters on cover art, no work accents in the UI.
- No loaders, no scroll-jacking, no autoplay audio, no cookie banners.
- No labels that explain the moon mapping.
- No second ambient effect besides the sky.
