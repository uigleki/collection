/**
 * Reads the collection from disk. Build time only: the Vite plugin serves
 * the result to the app, and the tests run it against the real files.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { catalog } from "./catalog.ts";
import { assemble, type Collection } from "./collection.ts";
import { parseReadme, parseReviews, parseWhy, type Why } from "./parse.ts";

const ROOT = resolve(import.meta.dirname, "../..");

/** The three Markdown files that hold the collection's content. */
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
