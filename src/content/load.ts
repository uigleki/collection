/**
 * Reads the collection off disk. Build time only: the Vite plugin serves
 * what this returns to the app, and the tests hold the real files to it.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { catalog } from "./catalog.ts";
import { assemble, type Collection } from "./collection.ts";
import { parseReadme, parseReviews, parseWhy, type Why } from "./parse.ts";

const ROOT = resolve(import.meta.dirname, "../..");

/** The three files the collection is written in. */
export const SOURCES = {
  readme: resolve(ROOT, "README.md"),
  reviews: resolve(ROOT, "docs/reviews.md"),
  why: resolve(ROOT, "docs/why.md"),
} as const;

export interface Content {
  collection: Collection;
  why: Why;
}

export function load(): Content {
  const read = (path: string) => readFileSync(path, "utf8");
  return {
    collection: assemble(
      parseReadme(read(SOURCES.readme)),
      parseReviews(read(SOURCES.reviews)),
      catalog,
    ),
    why: parseWhy(read(SOURCES.why)),
  };
}
