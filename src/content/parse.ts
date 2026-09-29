/**
 * Reads the collection's three Markdown files into plain data. README.md,
 * docs/reviews.md and docs/why.md are the collection; the site typesets
 * them and says nothing of its own, so nothing here rewrites a word — it
 * only finds where each piece stands.
 *
 * Runs at build time (see ./plugin.ts): the parser never ships to a browser.
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

export interface Shelf {
  medium: string;
  titles: string[];
}

export interface SongName {
  artist: string;
  title: string;
}

export interface Readme {
  tagline: string;
  shelves: Shelf[];
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
/** Where the README stops being the collection and starts being a README. */
const AFTERWORD = new Set(["Documentation", "License"]);

// A soft line break is a space: the files wrap one sentence per line for
// the linter, and that is not something a reader should ever see.
const flat = (value: string) => value.replace(/\s*\n\s*/g, " ");

/**
 * Running text with its strong emphasis kept as `**…**` — the one mark the
 * site renders (src/lib/emphasis.tsx). Italics are a whole paragraph's
 * voice (the epigraph, the sign-off), never a mark inside one.
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

/** The words of a node with every mark taken off. */
const plain = (nodes: readonly PhrasingContent[]) => markup(nodes, false);

const parse = (md: string): RootContent[] =>
  (fromMarkdown(md) as Root).children.filter((node) => node.type !== "html");

/** A heading's text, without the emoji a README section leads with. */
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
  const shelves: Shelf[] = [];
  const songs: SongName[] = [];

  for (const node of nodes) {
    if (node.type === "heading" && node.depth === 2) {
      const name = headingText(node);
      medium = AFTERWORD.has(name) ? null : name;
      if (medium && medium !== MUSIC) shelves.push({ medium, titles: [] });
    } else if (node.type === "paragraph" && tagline === null && !medium) {
      tagline = plain(node.children);
    } else if (node.type === "list" && medium) {
      const names = (node as List).children.map(itemText);
      if (medium === MUSIC) songs.push(...names.map(splitSong));
      else shelves.at(-1)?.titles.push(...names);
    }
  }
  if (!tagline) throw new Error("content: README has no tagline");
  return { tagline, shelves, songs };
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
      // the page's own title and preface
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

/** A paragraph that opens on a bold label and a colon: **The trick**: … */
function labeled(node: Paragraph): ReviewPoint | null {
  const [label, next, ...rest] = node.children;
  if (label?.type !== "strong" || next?.type !== "text") return null;
  if (!next.value.startsWith(":")) return null;
  const text = markup([{ ...next, value: next.value.slice(1) }, ...rest]);
  return { label: plain(label.children), text: text.trim() };
}

/** A paragraph set wholly in italics: the epigraph, or the sign-off. */
function voice(node: RootContent | undefined): string | null {
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

/** Splits a run of nodes at each heading of one depth. */
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
 * The essay's argument: an intro, its concepts, and — closing the last
 * concept, under no heading of its own — the paragraph that sums them up.
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
 * docs/why.md as the site reads it: the title and its epigraph; the first
 * chapter opens, the last closes, every one between is an argument; and
 * after the rule, the sign-off.
 */
export function parseWhy(md: string): Why {
  const nodes = parse(md);
  const [head, epigraph, ...rest] = nodes;
  const description = voice(epigraph);
  if (head?.type !== "heading" || head.depth !== 1 || !description)
    throw new Error("content: the essay opens on its title and an epigraph");

  const rule = rest.findIndex((node) => node.type === "thematicBreak");
  const footer = voice(rest[rule + 1]);
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
