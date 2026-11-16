# DESIGN — Perfect Collection

The design rules the code cannot show.
The user's decisions in `docs/adr/` outrank them.
The site should meet the three criteria the collection applies to works (docs/why.md): creative love, internal coherence, authentic beauty.

## The lunar month

- The home page is one lunar month: it opens on a new moon, each work is one night, and scrolling advances the phase to the full moon at the last work.
  A work's night is its position in the list.
- At the full moon the page shows "The finger pointing at the moon is not the moon" and links to /why.
  The music list follows, over the sea: the moon in the sky fades almost out and its reflection brightens.
- The page opens with the first sentence of docs/why.md and ends with its last.
- The mapping stays unexplained: the page carries no labels for it.
- On the home page the moon is the reading-progress indicator.
  A work page shows that work's phase, with the sky dimmed behind the text.

## The sky

- One WebGL canvas, persisting across pages, is the site's only ambient effect: no cursor effects, no sound.
- The moon's reflection comes from wave facets that reflect it toward the camera, so it narrows toward the horizon.
  The sea moves on its own clock, independent of scrolling.
- The CSS poster shows first and the sky fades in over it; there is no loader.
  Without a GPU the poster stays; when frames run late, the sky lowers its resolution.
- The end of the page is calm, with no climax effect.

## Content

- The site's words about the works are the user's Markdown, copied verbatim (ADR 0003); the page description is the README's opening sentence.
- `src/content/catalog.ts` holds what Markdown cannot: slugs, accents, cover sources, the language of each non-Latin name.
  To add a work, add it to the Markdown and add one catalog entry; the build fails while the two disagree.

## Color

- Each theme has six colors: background, surface, border, foreground, muted, and one UI accent.
  Dark is moonlit, bright enough to read as night rather than gloom; light is a golden-hour sky over warm paper.
  Only the moon disc is strongly saturated.
- A work's accent belongs to that work: it appears on its row, its page and its cover (title underline, cover border and glow, review labels), and nowhere else in the UI.
- Each accent is the color the work is known for (Senjougahara's purple), adjusted by hand for contrast; 少女終末旅行's is muted because the work's own palette is.
- Cover art shows in its original colors, unfiltered.
- Text meets WCAG AA in both themes.

## Type

- Components use a type-scale role, never a raw size.
- Each title's language is data (`lang`), never guessed from its characters: Han unification gives Chinese and Japanese the same code points, and Japanese titles need the Japanese font.
- CJK display text keeps a line height of at least 1.15; Latin display text may go down to 1.02.
- Display text rises line by line behind a mask, whole lines only, so CJK glyph clusters stay intact.

## Layout

- Wide screens: the text column sits left of center and the moon in the empty space on the right.
  Narrow screens: the column is full width, over a faint scrim.
- The gaps between media sections stay almost empty.
- Fixed controls are round glass buttons in fixed places: theme top-right, back top-left, previous/next at mid-height on the edges, back-to-top bottom-right once the page is scrolled past the first screen.
  Each shows its label beside it on hover and on keyboard focus.
- A work page is a lightbox: Escape, or a click on a wide screen's empty margins, returns to the home page.
  Previous/next step through every work across media, by button, arrow key or horizontal swipe; narrow screens show full-title previous/next links at the end of the page instead of edge buttons.

## Motion

- Fluid (ADR 0005): every motion responds at once and can be interrupted or reversed mid-flight.
- One spring per kind of motion, defined once in `src/lib/motion.ts` and shared by script and CSS.
- Motion moves transform and opacity only.
- Scrolling is native and never held back.
  A page reached through history restores its scroll position; a page opened by a link starts at the top.
- Scroll reveals follow the scroll position and reverse with it; where unsupported, the content simply shows.
- Between a row and its work page the cover travels as one element while the pages cross-fade.
  A navigation the browser already animated changes page without a second animation.
- With reduced motion, everything renders in its end state: colors and opacity may still fade, the moon still shows the right phase, and page changes are instant.
- Hover effects apply only on devices that hover.

## Platform

- Every page is prerendered, so it reads fully without JavaScript and follows the system theme there; a URL with no page answers 404.
- Platform code follows <https://github.com/GoogleChrome/modern-web-guidance>; `pnpx modern-web-guidance legacy-scan .` reports no findings.
- Browser support: Baseline widely available features need no fallback.
  Newer features are progressive enhancements; where one carries function rather than decoration, the site ships its own small fallback (as `src/lib/interest.ts` does for interest invokers) and loads no polyfill that would need the CSP loosened.
- Page code is prefetched, except under Save-Data.
- Zero axe violations in both themes and full keyboard access, alongside the budgets in `lighthouserc.json`.
  After changing the shader or the entry bundle, run `pnpm run lighthouse`.
- The site stays free of loaders, scroll-jacking, autoplay audio, cookie banners and trackers.
