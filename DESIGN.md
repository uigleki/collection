# DESIGN — Perfect Collection

The design constitution.
Every file derives from this document; anything that contradicts it is a bug.
The tokens live in `src/styles/index.css` (@theme) and `src/content/catalog.ts`;
this document is their rationale.
The site must pass the collection's own three-fold test (docs/why.md):
creative love, internal coherence, authentic beauty —
a shrine to unmanipulative art must itself be unmanipulative art.

## The Four Rules

These come from the collection's author and outrank everything below.

1. **Latin text is set in Ubuntu.**
2. **Every title stands in its original language.** 化物語 is 化物語.
3. **Every narrative line is verbatim from docs/why.md.**
   UI utility copy (buttons, navigation, the 404) is the only exception.
4. **Light and dark both exist.**
   The site follows the system until the visitor chooses,
   and remembers the choice.

## Overview

The home page is one lunar month, told silently.
It opens on an empty night sky
(nothing has been seen yet);
each of the fourteen works is one night and **scrolling waxes the moon**;
the last work stands under the full moon,
where the collection says its one honest line —
"The finger pointing at the moon is not the moon" — and points at /why.
The forty-nine songs live after it on the water,
where the sky's moon yields to its reflection.
The page ends in rest, not climax: the essay's own last line,
the hero's question answered in its own words —
"The beauty you were born to experience?
/ You've found it."

The reader is never told any of this.
The mechanic is ambient; labels were tried and removed.
The page opens on the collection's fundamental question
("If we're here to experience beauty…")
and closes on its answer —
and every narrative line on the site is VERBATIM from docs/why.md:
that prose is polished word by word,
and inventing sentences next to it is a defect.
UI utility copy (buttons, 404) is the only exception.

**The signature (the one bold thing):** scroll waxes the moon.
One persistent WebGL sky
(phase-accurate terminator from `src/lib/moon.ts`, ridge-wave water,
a moonglade of discrete glints, star field).
Everything else is quiet: no cursor gimmicks, no sound,
no second ambient effect.

Why this passes the three-fold test:

- **Peak-end negation** — no loader (the living sky rises out of the still
  poster, an arrival, not a wait); the ending is deliberately calm.
- **Mere-exposure negation** — depth over loop; revisits find the phases,
  the glade, the accents.
- **Negativity-bias negation** — the night is luminous, never bleak.
- **Internal coherence** — one terminator equation draws the sky's moon and
  the reading progress; each work's night IS its place in line; each room
  is lit by its work's own canonical color.

## Content

The Markdown is the only source of the words.
`src/content` parses README.md,
docs/reviews.md and docs/why.md at build time and serves them
as virtual modules; `src/content/catalog.ts` holds only what Markdown cannot
carry — slugs, accents, art sources, and each non-Latin name's language.
Adding a work is its Markdown plus one catalog entry.
The build refuses to run when the files disagree:
a work listed but not reviewed, reviewed but not listed,
missing from the catalog, or a non-Latin name without a stated language.

## Colors

Two skies, one discipline:
chrome commits to a single two-tone signature per theme plus ONE accent;
the fourteen per-work colors never leak into chrome.

Night (default) — named traditional colors:

- **yoru (#0b0e17)** 濡羽 — sky and ground.
- **mizu (#12161f)** 藍鉄 — water, raised surfaces, chips.
- **kasumi (#2a3140)** 藍鼠 — mist, borders.
- **tsuki (#eaf1f8)** 月白 — text and the moon itself.
- **hoshi (#98a2b3)** 銀鼠 — secondary text.
- **tsukikage (#cdb489)** 香色 — the moon's warmth; the only chrome accent.

Dusk (light theme) — a BRIGHT golden hour, so ink reads anywhere:
pastel periwinkle over pale gold in the shader, warm dusk paper for the ground,
deep ink for text, sunset gold as the lone accent.
There is no second set of token names:
`:root[data-theme="light"]` rebinds the same six,
so every component keeps asking for `tsuki` and gets whichever sky it is under.
The six are registered as colors (`@property`),
so a theme change is one transition on the root.
The page turns with the sky, live, and a second press turns it back mid-way.
The saturation budget is spent on exactly one thing — the golden ball.

Work accents are each work's canonical color —
the color the work is actually known by
(Senjougahara's purple, the Ocean's blue, Kurisu's auburn),
researched from the web, calibrated by hand against the night ground;
少女終末旅行 is deliberately muted because the work itself is.
They live in the catalog
(each work carries its own)
rather than as CSS tokens — chrome must never be able to reach for one.
They appear only inside that work's row and room
(title underline, cover hairline and glow,
review labels via color-mix toward tsuki).
Cover art is always true color — never filtered, never tinted.

Contrast floor: WCAG AA (4.5:1 body, 3:1 large) in BOTH themes,
verified by axe in CI.

## Typography

- **Latin: Ubuntu — always, everywhere.**
  Ubuntu Mono for tabular/nav data.
- **CJK: CollectionCJK (Noto SC subset) default; CollectionCJK-JP via
  `:lang(ja)`.**
  Original-language titles are sacred;
  Japanese titles must take Japanese letterforms (Han unification).
  Languages are data (`lang` fields judged per title), not heuristics.
- Roles are fluid `clamp()`s in CSS;
  the tokens above record each role's ceiling.
  Components ask for a role, never a raw size.
- **CJK display leading never drops below 1.15** (`:lang(ja)`,
  `:lang(zh-Hans)` overrides); Latin display may sit at 1.02–1.04.
- CJK craft: `palt` on display roles, `text-spacing-trim` and
  `text-autospace` as progressive enhancement; the subsetter retains all
  OpenType layout features.
- Display text enters as masked lines
  (never per-character splits — CJK glyph clusters break).
  The reveal trigger must observe an UNCLIPPED ancestor:
  an overflow-clipped line has zero visible area
  and its own viewport observer deadlocks.

## Layout

- Asymmetric: the reading column sits left-of-center on wide screens;
  the moon owns the right sky gutter.
  Narrow screens run full-width with a quiet scrim.
- 間 (ma): interludes between media are near-empty on purpose.
- Fixtures speak one glass-chip language at the four corners and edges:
  theme (top-right), back (top-left), neighbors (mid-edges, gallery-pager
  style), back-to-top (bottom-right, appears a viewport deep).
- Rooms behave like lightboxes: Escape leaves; on wide screens the empty
  margins are clickable exits; prev/next walk the WHOLE shelf in reading
  order — by chip, by arrow key, or by carrying the room with a finger.
- Wide content never scrolls the body horizontally.

## Components

- **Cover** — thumbhash placeholder at exact aspect
  (no CLS), hairline in the work's accent.
  The row's cover and the room's are one object:
  it flies between them on a spring (`src/lib/flight.ts`),
  and a reader who turns back halfway sees it curve around, not restart.
  In flight it rides the top layer, fully opaque above both pages,
  so the fade of the page it lands on never touches it.
  Works without licensed art get a typographic panel.
- **NightRow** — the whole row is one door.
  Hover: lift + cursor-facing tilt on the SAME springs
  (one movement), accent underline grows, accent glow under the cover.
  Rows arrive with the scroll, not a clock:
  a return to a remembered position finds them already standing.
- **Room** — sky eases to the work's night and dims behind reading;
  one short mounted choreography on the site's springs —
  a room opens at its top, so everything in it is in view the moment it arrives.
  Walking the shelf slides the room along it.
  A finger carries it 1:1, meets resistance past either end of the shelf,
  and can catch it again mid-spring.
  A change the browser already animated (an edge swipe back) is a cut.
  Flaws are stated plainly.
- **Chips** — 44px glass circles, labels on hover.
  Hover and press ride springs even in plain CSS:
  `src/lib/motion.ts` publishes them as `linear()` curves,
  so a press let go halfway springs back from where it is.
- **Link** — every text link draws its underline left-to-right; one
  gesture site-wide.

## Do's and Don'ts

Do:

- Native scroll, never a scroll library:
  the browser scrolls off the main thread, at the display's own rate,
  with the platform's own inertia — nothing a script can match.
  The reader's scroll is never held, not even while something animates.
  Restoration is ours (save continuously from scroll events;
  restore with an instant `scrollTo` inside a layout effect).
- Integrate all shader phases on the CPU (`phase += rate·dt`) — never
  multiply a changing rate by total time.
- Reduced motion is a parallel design: end states render instantly, the
  moon still shows the truthful phase, cuts are honest.
- Pages change on a live stage, never a view transition:
  those freeze the page into pictures until they finish.
  The departing page fades where it stood, inert;
  the arriving one can be scrolled, pressed, or left at once,
  and a change mid-way picks everything up from where it is.
- Hover exists only where a pointer can hover (`@media (hover: hover)`):
  a touch screen keeps :hover on whatever it touched last,
  so an unguarded hover style leaves a tapped control stuck in it.
- Animate only what the compositor can carry — transform and opacity.
  A glow is drawn once and faded, never a shadow that grows.
- What the scroll reveals, the scroll draws
  (`animation-timeline: view()`):
  the reader's position is the timeline, no observer or script is awake,
  and scrolling back reverses it.
  Where the browser cannot, the page simply stands.
- The sky's resolution follows the frames (`src/scene/governor.ts`):
  late frames trade pixels for time, and on-time frames slowly win them back.
- Every page's code is fetched while the reader reads the first,
  so no change of page waits on the network —
  unless the reader has asked to save data.
- Software rasterizers (SwiftShader/llvmpipe) get the static poster —
  a machine without a GPU should not be handed a slideshow.
- Hard floors: Lighthouse perf ≥ 0.90 / a11y ≥ 0.95, LCP ≤ 2s, CLS ≤ 0.05,
  axe zero violations in both themes, keyboard-complete
  (skip link, h1 focus per route change, visible rings).
  Axe and the keyboard paths run in CI;
  the Lighthouse numbers are asserted by `bun run lighthouse`,
  which is run by hand — a change that touches the shader
  or the entry graph is not finished until it has passed.

Don't:

- No arbitrary colors, no filters over cover art, no accents in chrome.
- No English-only titles.
  化物語 is 化物語.
- No loaders, no scroll-jacking, no autoplay audio, no cookie banners.
- No decorative labels that explain the mechanic — the month stays silent.
- No second ambient effect competing with the sky.
  One moon.
