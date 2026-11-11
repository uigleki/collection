# AGENTS.md

## Project

Perfect Collection — works that enrich rather than diminish.

- `README.md` — the collection itself: works grouped by medium.
- `docs/why.md` — essays on why each work matters.
- `docs/reviews.md` — brief, spoiler-free impressions per work.
- `docs/adr/` — the user's decisions.
- `DESIGN.md` — agent-written design notes; update them when the design changes.

## Commands

- `package.json` holds the script list; run them with `pnpm run <script>`.
- Refresh cover art: `node scripts/fetch-covers.ts` (not a `package.json` script).

## Gotchas

- Regenerate the CJK font subsets whenever a work title introduces a new glyph: `pnpm run fonts:cjk`.
  Nothing else catches a missing glyph.

## Conventions

- Use Conventional Commits.
- Write comments, documentation, and commit messages in plain, literal English.
- Only write a code comment to state a constraint the code itself can't show - never to say what the next line does, or why your change is correct; that's you talking to the reviewer, not the next reader.
- Don't use feature flags or backwards-compatibility shims when you can just change the code.
- Refer to each work by its original-language title.
