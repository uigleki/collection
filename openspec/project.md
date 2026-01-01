# Project Context

## Overview

A personal collection of works that enrich rather than diminish. The heart of the project is thoughtful essays exploring why these creative works matter, inviting readers to reflect and draw their own conclusions. Presented through an elegant, beautiful website.

## Tech Stack

- **React 19** – with concurrent features
- **TypeScript 5.9** – strict mode
- **Vite 7** – build tooling
- **Tailwind CSS 4** – utility-first CSS with `@theme`
- **Framer Motion** – for elegant, polished animations
- **React Router 7** – SPA routing
- **VitePWA** – offline support and auto-update
- **pnpm** – package manager
- **Cloudflare Pages** – deployment

## Structure

Feature-Sliced Design:

- `src/app/` – entry and routing
- `src/features/` – page-level features (self-contained with own components)
- `src/shared/` – shared components (`ui/`, `lib/`)
- `src/data/` – static data and types
- `src/styles/` – global CSS and design tokens

Higher layers can depend on lower layers, not vice versa.

## Best Practices

- Use Tailwind CSS 4 `@theme` for semantic design tokens
- Use CSS native `light-dark()` for theme switching
- Animate only `transform` and `opacity` for GPU acceleration
- Use `satisfies` over `as` for type assertions to preserve literal types

## Conventions

- Path alias `@/` points to `src/`
- Component naming: PascalCase matching filename
- Components within features go in `/components` subdirectory

## Domain Context

- Categories: Anime, Movies, Games, Artists, Music
- Works data in `src/data/works/` as TypeScript modules
- Work titles use original names (Japanese, etc.)
- Personal collection, not a general media database

## Testing

- No test framework configured
- Build verification: `pnpm build`
