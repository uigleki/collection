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
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
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
  flaws: ReviewPoint[];
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
  (fromMarkdown(md) as Root).children.filter((node) => node.type !== "html");

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
      const names = (node as List).children.map(itemText);
      if (medium === MUSIC) songs.push(...names.map(splitSong));
      else groups.at(-1)?.titles.push(...names);
    }
  }
  if (!tagline) throw new Error("content: README has no tagline");
  return { tagline, groups, songs };
}

function point(item: ListItem): ReviewPoint {
  const para = item.children[0];
  const [label, ...rest] = para?.type === "paragraph" ? para.children : [];
  if (label?.type !== "strong" || item.children.length > 1)
    throw new Error("content: a review point is **Label**: text");
  const text = plain(rest).replace(/^:\s*/, "").trim();
  return { label: plain(label.children), text };
}

const isShortcomings = (node: RootContent) =>
  node.type === "paragraph" &&
  plain((node as Paragraph).children).replace(/:$/, "") === "Shortcomings";

export function parseReviews(md: string): Map<string, Review> {
  const reviews = new Map<string, Review>();
  let current: Review | null = null;
  let inFlaws = false;

  for (const node of parse(md)) {
    if (node.type === "heading") {
      current = null;
      if (node.depth === 3) {
        current = { subtitle: "", points: [], flaws: [] };
        inFlaws = false;
        reviews.set(plain(node.children), current);
      }
    } else if (!current) {
      // reviews.md's own title and introduction: skipped
    } else if (isShortcomings(node)) {
      inFlaws = true;
    } else if (node.type === "paragraph" && !current.subtitle) {
      current.subtitle = plain(node.children);
    } else if (node.type === "list") {
      (inFlaws ? current.flaws : current.points).push(
        ...node.children.map(point),
      );
    } else {
      throw new Error(`content: unexpected ${node.type} in a review`);
    }
  }
  return reviews;
}

/** A paragraph that starts with a bold label and a colon: **The trick**: … */
function labeled(node: Paragraph): ReviewPoint | null {
  const [label, next, ...rest] = node.children;
  if (label?.type !== "strong" || next?.type !== "text") return null;
  if (!next.value.startsWith(":")) return null;
  const text = markup([{ ...next, value: next.value.slice(1) }, ...rest]);
  return { label: plain(label.children), text: text.trim() };
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
  const concepts = parts.map(
    (part): WhyConcept => ({
      title: part.title,
      explanation: paragraphs(part.body, part.title).map(
        (p) => labeled(p) ?? markup(p.children),
      ),
    }),
  );
  const last = concepts.at(-1)?.explanation as (string | ReviewPoint)[];
  const outro = last.pop();
  if (typeof outro !== "string" || last.length === 0)
    throw new Error(`content: "${title}" must end on a paragraph of its own`);
  return { title, intro: markup(intro.children), concepts, outro };
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
