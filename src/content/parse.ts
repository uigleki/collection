/**
 * Parses the collection's three Markdown files (README.md, docs/reviews.md
 * and docs/why.md) into plain data. The site shows their text verbatim and
 * adds none of its own, so this module never changes a word; it only
 * locates each part.
 *
 * Runs at build time (see ./plugin.ts): the parser is not shipped to the
 * browser.
 */
import type {
  Heading,
  ListItem,
  Paragraph,
  PhrasingContent,
  RootContent,
} from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import type {
  PageMeta,
  ReviewPoint,
  WhyConcept,
  WhyData,
  WhySection,
} from "../data/types.ts";

export interface MediumGroup {
  medium: string;
  titles: string[];
}

export interface SongName {
  artist: string;
  title: string;
}

export interface Readme {
  tagline: string;
  groups: MediumGroup[];
  songs: SongName[];
}

export interface Review {
  subtitle: string;
  points: ReviewPoint[];
  /** the review's shortcomings, under the heading reviews.md gives them */
  flaws?: { heading: string; points: ReviewPoint[] };
}

export interface Why {
  meta: Required<PageMeta>;
  data: WhyData;
}

const MUSIC = "Music";
/** README sections that are not part of the collection. */
const OTHER_SECTIONS = new Set(["Documentation", "License"]);

// A soft line break becomes a space: the files put one sentence per line
// for the linter, and those breaks must not appear on the site.
const flat = (value: string) => value.replace(/\s*\n\s*/g, " ");

/**
 * Inline text with its strong emphasis kept as `**…**`, the only inline
 * mark the site renders (src/lib/emphasis.tsx). Italics apply only to whole
 * paragraphs (the epigraph, the sign-off), never to part of one, so their
 * markers are dropped.
 */
function markup(nodes: readonly PhrasingContent[], strong = true): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return flat(node.value);
      if (node.type === "break") return " ";
      if (node.type === "emphasis") return markup(node.children, strong);
      if (node.type === "strong") {
        const inner = markup(node.children, strong);
        return strong ? `**${inner}**` : inner;
      }
      throw new Error(`content: no way to typeset inline ${node.type}`);
    })
    .join("");
}

/** The text of the nodes with every emphasis marker removed. */
const plain = (nodes: readonly PhrasingContent[]) => markup(nodes, false);

const parse = (md: string): RootContent[] =>
  fromMarkdown(md).children.filter((node) => node.type !== "html");

/** A heading's text, without the emoji a README section starts with. */
const headingText = (node: Heading) =>
  plain(node.children)
    .replace(/^[^\p{L}\p{N}"'(]+/u, "")
    .trim();

function itemText(item: ListItem): string {
  const [first, ...rest] = item.children;
  if (first?.type !== "paragraph" || rest.length > 0)
    throw new Error("content: a list item must be one line of text");
  return plain(first.children);
}

function splitSong(name: string): SongName {
  const at = name.indexOf(" - ");
  if (at < 0) throw new Error(`content: "${name}" is not "artist - title"`);
  return { artist: name.slice(0, at), title: name.slice(at + 3) };
}

export function parseReadme(md: string): Readme {
  const nodes = parse(md);
  let tagline: string | null = null;
  let medium: string | null = null;
  const groups: MediumGroup[] = [];
  const songs: SongName[] = [];

  for (const node of nodes) {
    if (node.type === "heading" && node.depth === 2) {
      const name = headingText(node);
      medium = OTHER_SECTIONS.has(name) ? null : name;
      if (medium && medium !== MUSIC) groups.push({ medium, titles: [] });
    } else if (node.type === "paragraph" && tagline === null && !medium) {
      tagline = plain(node.children);
    } else if (node.type === "list" && medium) {
      const names = node.children.map(itemText);
      if (medium === MUSIC) songs.push(...names.map(splitSong));
      else groups.at(-1)?.titles.push(...names);
    }
  }
  if (!tagline) throw new Error("content: README has no tagline");
  return { tagline, groups, songs };
}

/**
 * A paragraph that starts with a bold label and a colon: **The trick**: …
 * `strong` is whether the text after the colon keeps its own bold markers.
 */
function labeled(node: Paragraph, strong = true): ReviewPoint | null {
  const [label, next, ...rest] = node.children;
  if (label?.type !== "strong" || next?.type !== "text") return null;
  if (!next.value.startsWith(":")) return null;
  const text = markup(
    [{ ...next, value: next.value.slice(1) }, ...rest],
    strong,
  );
  return { label: plain(label.children), text: text.trim() };
}

function point(item: ListItem): ReviewPoint {
  const [para, ...rest] = item.children;
  const found =
    para?.type === "paragraph" && rest.length === 0
      ? labeled(para, false)
      : null;
  if (!found) throw new Error("content: a review point is **Label**: text");
  return found;
}

/** A bold label and its colon with no text after: the heading of a list. */
function listHeading(node: RootContent): string | null {
  const found = node.type === "paragraph" ? labeled(node, false) : null;
  return found?.text === "" ? found.label : null;
}

export function parseReviews(md: string): Map<string, Review> {
  const reviews = new Map<string, Review>();
  let current: Review | null = null;

  for (const node of parse(md)) {
    if (node.type === "heading") {
      current = null;
      if (node.depth === 3) {
        current = { subtitle: "", points: [] };
        reviews.set(plain(node.children), current);
      }
      continue;
    }
    // reviews.md's own title and introduction
    if (!current) continue;

    const heading = current.flaws ? null : listHeading(node);
    if (heading !== null) {
      current.flaws = { heading, points: [] };
    } else if (node.type === "paragraph" && !current.subtitle) {
      current.subtitle = plain(node.children);
    } else if (node.type === "list") {
      (current.flaws ?? current).points.push(...node.children.map(point));
    } else {
      throw new Error(`content: unexpected ${node.type} in a review`);
    }
  }
  return reviews;
}

/** A paragraph entirely in italics: the epigraph, or the sign-off. */
function italicParagraph(node: RootContent | undefined): string | null {
  if (node?.type !== "paragraph" || node.children.length !== 1) return null;
  const [only] = node.children;
  return only?.type === "emphasis" ? plain(only.children) : null;
}

function paragraphs(nodes: readonly RootContent[], where: string): Paragraph[] {
  for (const node of nodes)
    if (node.type !== "paragraph")
      throw new Error(`content: unexpected ${node.type} in ${where}`);
  return nodes as Paragraph[];
}

/** Splits a list of nodes at each heading of the given depth. */
function chapters(nodes: readonly RootContent[], depth: number) {
  const before: RootContent[] = [];
  const parts: { title: string; body: RootContent[] }[] = [];
  for (const node of nodes) {
    if (node.type === "heading" && node.depth === depth)
      parts.push({ title: plain(node.children), body: [] });
    else (parts.at(-1)?.body ?? before).push(node);
  }
  return { before, parts };
}

/**
 * One section of the essay: an intro, its concepts and an outro. The outro
 * has no heading of its own: it is the last paragraph under the last
 * concept's heading.
 */
function section({
  title,
  body,
}: {
  title: string;
  body: RootContent[];
}): WhySection {
  const { before, parts } = chapters(body, 3);
  const [intro, ...extra] = paragraphs(before, title);
  if (!intro || extra.length > 0 || parts.length === 0)
    throw new Error(`content: "${title}" is one intro and its concepts`);
  const lastBody = parts.at(-1)?.body ?? [];
  const outro = lastBody.pop();
  if (outro?.type !== "paragraph" || labeled(outro) || lastBody.length === 0)
    throw new Error(`content: "${title}" must end on a paragraph of its own`);
  const concepts = parts.map(
    (part): WhyConcept => ({
      title: part.title,
      explanation: paragraphs(part.body, part.title).map(
        (p) => labeled(p) ?? markup(p.children),
      ),
    }),
  );
  return {
    title,
    intro: markup(intro.children),
    concepts,
    outro: markup(outro.children),
  };
}

/**
 * Parses docs/why.md. Expected structure: the title and its epigraph; then
 * chapters, of which the first is the opening, the last is the closing and
 * each one between is a section; then a thematic break and the sign-off.
 */
export function parseWhy(md: string): Why {
  const nodes = parse(md);
  const [head, epigraph, ...rest] = nodes;
  const description = italicParagraph(epigraph);
  if (head?.type !== "heading" || head.depth !== 1 || !description)
    throw new Error("content: the essay opens on its title and an epigraph");

  const rule = rest.findIndex((node) => node.type === "thematicBreak");
  const footer = italicParagraph(rest[rule + 1]);
  if (rule < 0 || !footer || rest.length !== rule + 2)
    throw new Error("content: the essay ends on a rule and its sign-off");

  const { before, parts } = chapters(rest.slice(0, rule), 2);
  const [first, ...middle] = parts;
  const last = middle.pop();
  if (before.length > 0 || !first || !last)
    throw new Error("content: the essay is an opening, arguments, a close");
  const lines = (part: { title: string; body: RootContent[] }) =>
    paragraphs(part.body, part.title).map((p) => markup(p.children));

  return {
    meta: { title: plain(head.children), description, footer },
    data: {
      opening: lines(first),
      sections: middle.map(section),
      closing: lines(last),
    },
  };
}
