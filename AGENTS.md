# Agent Guide

## Project

Perfect Collection — works that enrich rather than diminish.

- `README.md` — the collection itself: works grouped by medium.
- `docs/why.md` — essays on why each work matters.
- `docs/reviews.md` — brief, spoiler-free impressions per work.

## Commands

- `package.json` holds the script list; run them with `bun run <script>`.
- Refresh cover art: `bun scripts/fetch-covers.ts` (not a `package.json` script).

## Gotchas

- Regenerate the CJK font subsets whenever a work title introduces a new glyph:
  `bun run fonts:cjk`. Nothing else catches a missing glyph.

## Conventions

- TDD: red → green → refactor.
- Use Conventional Commits.
- Write comments, documentation, and commit messages in English.
- Delete unused code completely rather than adding compatibility shims.
- Refer to each work by its original-language title.
