# DESIGN — Perfect Collection

The design constitution. Every file derives from this document; anything that
contradicts it is a bug. The tokens live in `src/styles/index.css` (@theme) and
`src/data/accents.ts`; this document is their rationale. The site must pass the collection's own three-fold test
(docs/why.md): creative love, internal coherence, authentic beauty — a
shrine to unmanipulative art must itself be unmanipulative art.

## Overview

The home page is one lunar month, told silently. It opens on an empty night
sky (nothing has been seen yet); each of the fourteen works is one night and
**scrolling waxes the moon**; the last work stands under the full moon,
where the collection says its one honest line — "The finger pointing at the
moon is not the moon" — and points at /why. The forty-nine songs live after
it on the water, where the sky's moon yields to its reflection. The page
ends in rest, not climax: a full-bleed "The search can end."

The reader is never told any of this. The mechanic is ambient; labels were
tried and removed. The page opens on the collection's fundamental question
("If we're here to experience beauty…") and closes on its answer — and
every narrative line on the site is VERBATIM from docs/why.md: the owner's
prose is polished word by word, and inventing sentences next to it is a
defect. UI utility copy (buttons, 404) is the only exception.

**The signature (the one bold thing):** scroll waxes the moon. One
persistent WebGL sky (phase-accurate terminator from `src/lib/moon.ts`,
ridge-wave water with a Cox-Munk moonglade, star field). Everything else is
quiet: no cursor gimmicks, no sound, no second ambient effect.

Why this passes the three-fold test:

- **Peak-end negation** — no loader (the living sky rises out of the still
  poster, an arrival, not a wait); the ending is deliberately calm.
- **Mere-exposure negation** — depth over loop; revisits find the phases,
  the glade, the accents.
- **Negativity-bias negation** — the night is luminous, never bleak.
- **Internal coherence** — one terminator equation draws the sky's moon and
  the reading progress; each work's night IS its place in line; each room
  is lit by its work's own canonical color.

## Colors

Two skies, one discipline: chrome commits to a single two-tone signature
per theme plus ONE accent; the fourteen per-work colors never leak into
chrome.

Night (default) — named traditional colors:

- **yoru (#0b0e17)** 濡羽 — sky and ground.
- **mizu (#12161f)** 藍鉄 — water, raised surfaces, chips.
- **kasumi (#2a3140)** 藍鼠 — mist, borders.
- **tsuki (#eaf1f8)** 月白 — text and the moon itself.
- **hoshi (#98a2b3)** 銀鼠 — secondary text.
- **tsukikage (#cdb489)** 香色 — the moon's warmth; the only chrome accent.

Dusk (light theme) — a BRIGHT golden hour, so ink reads anywhere: pastel
periwinkle over pale gold in the shader, warm dusk paper (`dusk-yoru`) for
the ground, deep ink (`dusk-tsuki`) for text, sunset gold
(`dusk-tsukikage`) as the lone accent. The saturation budget is spent on
exactly one thing — the golden ball.

Work accents (`accent-*`) are each work's canonical color — the color the
work is actually known by (Senjougahara's purple, the Ocean's blue,
Kurisu's auburn), researched from the web, calibrated by hand against the
night ground; 少女終末旅行 is deliberately muted because the work itself
is. They appear only inside that work's row and room (title underline,
cover hairline and glow, review labels via color-mix toward tsuki).
Cover art is always true color — never filtered, never tinted.

Contrast floor: WCAG AA (4.5:1 body, 3:1 large) in BOTH themes, verified by
axe in CI.

## Typography

- **Latin: Ubuntu — always, everywhere.** Ubuntu Mono for tabular/nav data.
- **CJK: CollectionCJK (Noto SC subset) default; CollectionCJK-JP via
  `:lang(ja)`.** Original-language titles are sacred; Japanese titles must
  take Japanese letterforms (Han unification). Languages are data (`lang`
  fields judged per title), not heuristics.
- Roles are fluid `clamp()`s in CSS; the tokens above record each role's
  ceiling. Components ask for a role, never a raw size.
- **CJK display leading never drops below 1.15** (`:lang(ja)`,
  `:lang(zh-Hans)` overrides); Latin display may sit at 1.02–1.04.
- CJK craft: `palt` on display roles, `text-spacing-trim` and
  `text-autospace` as progressive enhancement; the subsetter retains all
  OpenType layout features.
- Display text enters as masked lines (never per-character splits — CJK
  glyph clusters break). The reveal trigger must observe an UNCLIPPED
  ancestor: an overflow-clipped line has zero visible area and its own
  viewport observer deadlocks.

## Layout

- Asymmetric: the reading column sits left-of-center on wide screens; the
  moon owns the right sky gutter. Narrow screens run full-width with a
  quiet scrim.
- 間 (ma): interludes between media are near-empty on purpose.
- Fixtures speak one glass-chip language at the four corners and edges:
  theme (top-right), back (top-left), neighbours (mid-edges, gallery-pager
  style), back-to-top (bottom-right, appears a viewport deep).
- Rooms behave like lightboxes: Escape leaves; on wide screens the empty
  margins are clickable exits; prev/next walk the WHOLE shelf in reading
  order.
- Wide content never scrolls the body horizontally.

## Components

- **Cover** — thumbhash placeholder at exact aspect (no CLS), hairline in
  the work's accent, `view-transition-name: cover-<slug>` for the 月相
  morph. Works without licensed art get a typographic panel.
- **NightRow** — the whole row is one door. Hover: lift + cursor-facing
  tilt on the SAME springs (one movement), accent underline grows, accent
  glow under the cover. Entrances remember themselves per visit — nothing
  replays on return.
- **Room** — sky eases to the work's night and dims behind reading; one
  mounted choreography (whileInView is banned here: observers fire under
  view transitions before anything is visible). Flaws are stated plainly.
- **Chips** — 44px glass circles, press physics, labels on hover.
- **Link** — every text link draws its underline left-to-right; one
  gesture site-wide.

## Do's and Don'ts

Do:

- Lenis smooth scroll, disabled under prefers-reduced-motion; restoration
  is ours (save continuously from scroll events; restore via
  `lenis.resize()` + `scrollTo(immediate)` inside a layout effect, within
  the view transition's update callback). Scroll HOLDS while a morph flies.
- Integrate all shader phases on the CPU (`phase += rate·dt`) — never
  multiply a changing rate by total time.
- Reduced motion is a parallel design: end states render instantly, the
  moon still shows the truthful phase, cuts are honest.
- Software rasterizers (SwiftShader/llvmpipe) get the static poster —
  a machine without a GPU should not be handed a slideshow.
- Hard floors: Lighthouse perf ≥ 0.90 / a11y ≥ 0.95, LCP ≤ 2s, CLS ≤ 0.05,
  axe zero violations in both themes, keyboard-complete (skip link, h1
  focus per route change, visible rings).

Don't:

- No arbitrary colors, no filters over cover art, no accents in chrome.
- No English-only titles. 化物語 is 化物語.
- No loaders, no scroll-jacking, no autoplay audio, no cookie banners.
- No decorative labels that explain the mechanic — the month stays silent.
- No second ambient effect competing with the sky. One moon.
