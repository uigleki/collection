# DESIGN — Perfect Collection

The design constitution.
Every file derives from this document; anything that contradicts it is a bug.
The tokens live in `src/styles/index.css` (@theme) and `src/content/catalog.ts`;
this document is their rationale.
The site must pass the collection's own three-fold test (docs/why.md):
creative love, internal coherence, authentic beauty —
a shrine to unmanipulative art must itself be unmanipulative art.

## The Five Rules

These come from the collection's author and outrank everything below.

1. **Latin text is set in Ubuntu.**
2. **Every title stands in its original language.** 化物語 is 化物語.
3. **Every narrative line is verbatim from docs/why.md.**
   UI utility copy (buttons, navigation, the 404) is the only exception.
4. **Light and dark both exist.**
   The site follows the system until the visitor chooses,
   and remembers the choice.
5. **Motion is fluid** — what Apple calls a fluid interface.
   Everything that moves behaves like a physical object on a spring:
   it answers at once, follows a finger 1:1, and can be caught, reversed,
   or redirected at any moment,
   carrying on from where it is and as fast as it was going — never restarting.
   Nothing freezes the page while it moves.

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

**The signature (the one bold thing):** scroll waxes the moon.
One persistent WebGL sky
(phase-accurate terminator from `src/lib/moon.ts`,
a sea seen through a real lens that mirrors that same sky and moon, star field).
The moonglade is never painted:
it is every wave facet tilted to throw the moon back at the eye,
so it narrows toward the horizon as real ones do.
The sea keeps its own time — it never answers the scroll.
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
`src/content` parses README.md, docs/reviews.md and docs/why.md at build time;
`src/content/catalog.ts` holds only what Markdown cannot carry — slugs, accents,
art sources, and each non-Latin name's language.
Adding a work is its Markdown plus one catalog entry.
The build refuses to run when the files disagree.

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
It rebinds the same six names,
so every component keeps asking for `tsuki` and gets whichever sky it is under.
The page turns with the sky, live.
The saturation budget is spent on exactly one thing — the golden ball.

Work accents are each work's canonical color —
the color the work is actually known by
(Senjougahara's purple, the Ocean's blue, Kurisu's auburn),
calibrated by hand against the night ground;
少女終末旅行 is deliberately muted because the work itself is.
They live in the catalog rather than as CSS tokens —
chrome must never be able to reach for one.
They appear only inside that work's row and room
(title underline, cover hairline and glow, review labels).
Cover art is always true color — never filtered, never tinted.

Contrast floor: WCAG AA (4.5:1 body, 3:1 large) in BOTH themes.

## Typography

- **Latin: Ubuntu — always, everywhere.**
  Ubuntu Mono for tabular/nav data.
- **CJK: CollectionCJK (Noto SC subset) default; CollectionCJK-JP via
  `:lang(ja)`.**
  Japanese titles must take Japanese letterforms (Han unification).
  Languages are data (a `lang` judged per title), not heuristics.
- Components ask for a role, never a raw size.
- **CJK display leading never drops below 1.15**;
  Latin display may sit at 1.02–1.04.
- Display text enters as masked lines,
  never per-character splits — CJK glyph clusters break.

## Layout

- Asymmetric: the reading column sits left-of-center on wide screens;
  the moon owns the right sky gutter.
  Narrow screens run full-width with a quiet scrim.
- 間 (ma): interludes between media are near-empty on purpose.
- Fixtures speak one glass-chip language at the four corners and edges:
  theme (top-right), back (top-left), neighbors (mid-edges),
  back-to-top (bottom-right, appears a viewport deep).
- Rooms behave like lightboxes: Escape leaves; on wide screens the empty
  margins are clickable exits; prev/next walk the WHOLE shelf in reading
  order — by chip, by arrow key, or by carrying the room with a finger.

## Components

- **Cover** — its placeholder paints at the exact aspect
  (no layout shift), hairline in the work's accent.
  The row's cover and the room's are one object:
  it flies between them while the pages cross-fade around it,
  untouched by the fade.
  Works without licensed art get a typographic panel.
- **NightRow** — the whole row is one door.
  Hover: lift + cursor-facing tilt as one movement, accent underline grows,
  accent glow under the cover.
- **Room** — the sky eases to the work's night and dims behind reading;
  the room opens at its top with one short choreography.
  Walking the shelf slides the room along it;
  past either end a finger meets resistance.
  A change the browser already animated (an edge swipe back) is a cut.
  Flaws are stated plainly.
- **Chips** — 44px glass circles, labels on hover.
- **Link** — every text link draws its underline left-to-right; one
  gesture site-wide.

## Do's and Don'ts

Do:

- One spring per reason something moves (`src/lib/motion.ts`),
  shared by the script and the CSS.
- Native scroll, never a scroll library, and the reader's scroll is never held.
  A page returned to opens where it was left.
- What the scroll reveals, the scroll draws:
  the reader's position is the timeline, and scrolling back reverses it.
  Where the browser cannot, the page simply stands.
- Animate only what the compositor can carry — transform and opacity.
- Hover exists only where a pointer can hover:
  a touch screen would leave a tapped control stuck in it.
- Reduced motion is a parallel design: end states render instantly, the
  moon still shows the truthful phase, cuts are honest.
- No change of page waits on the network,
  unless the reader has asked to save data.
- The sky trades resolution for frames when the machine falls behind;
  a machine without a GPU gets the still poster, not a slideshow.
- Hard floors: Lighthouse perf ≥ 0.90 / a11y ≥ 0.95, LCP ≤ 2s, CLS ≤ 0.05,
  axe zero violations in both themes, keyboard-complete
  (skip link, h1 focus per route change, visible rings).
  A change to the shader or the entry graph is not finished
  until Lighthouse has passed.

Don't:

- No arbitrary colors, no filters over cover art, no accents in chrome.
- No loaders, no scroll-jacking, no autoplay audio, no cookie banners.
- No decorative labels that explain the mechanic — the month stays silent.
- No second ambient effect competing with the sky.
  One moon.
