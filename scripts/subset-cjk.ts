/**
 * Builds minimal self-hosted CJK font subsets, so the collection's Chinese
 * and Japanese text renders in the same PingFang-grade gothic on every
 * device (not only Apple or Noto machines) instead of an OS-dependent
 * fallback.
 *
 * Two faces are built from the same glyph set, because Han unification
 * means one codepoint (e.g. 直, 骨, 今) has different correct shapes in
 * Chinese and Japanese. The site shows titles in their original language,
 * so a Japanese title must not render in Simplified-Chinese letterforms:
 *   - CollectionCJK    ← Noto Sans CJK SC  (default; Chinese text, e.g. Koan)
 *   - CollectionCJK-JP ← Noto Sans CJK JP  (served to :lang(ja) nodes — titles)
 *
 * Only glyphs used on the site are kept (collected from src/ and the
 * Markdown each time the script runs), so each output is a few dozen KB. A
 * glyph the subset lacks falls back to the system CJK fonts per glyph, so
 * no character renders as a missing-glyph box.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import subsetFont from "subset-font";
import { SOURCES as MARKDOWN } from "../src/content/load.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "src");
const OUT_DIR = resolve(ROOT, "src/assets/fonts");

const BASE = "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF";

// Both faces cover kana + all Han; they differ only in regional glyph shape.
const FACES = [
  {
    label: "SC",
    source: `${BASE}/SimplifiedChinese/NotoSansCJKsc-Regular.otf`,
    out: "noto-sans-cjk-sc-subset.woff2",
  },
  {
    label: "JP",
    source: `${BASE}/Japanese/NotoSansCJKjp-Regular.otf`,
    out: "noto-sans-cjk-jp-subset.woff2",
  },
] as const;

// The OpenType features src/styles/index.css uses: palt on CJK headings,
// halt for text-spacing-trim, kern by default. Each kept feature adds its
// alternate glyphs to the files, so only these are kept; a feature the
// stylesheet starts using has to be added here.
const FEATURES = ["halt", "kern", "palt"];

// CJK / kana / full-width ranges — everything the CJK faces should cover.
const CJK = /[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/gu;

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const p = resolve(dir, e.name);
      if (e.isDirectory()) return walk(p);
      return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
    }),
  );
  return files.flat();
}

async function collectGlyphs(): Promise<string> {
  // The site's text comes from the Markdown files as well as from src/.
  const files = [...(await walk(SRC)), ...Object.values(MARKDOWN)];
  const set = new Set<string>();
  for (const f of files) {
    const text = await readFile(f, "utf8");
    for (const ch of text.match(CJK) ?? []) set.add(ch);
  }
  // Always keep the full kana blocks so any Japanese title stays consistent
  // even if a specific kana isn't currently on the site.
  for (let c = 0x3040; c <= 0x30ff; c++) set.add(String.fromCodePoint(c));
  return [...set].sort().join("");
}

async function build(glyphs: string, face: (typeof FACES)[number]) {
  console.log(`[${face.label}] downloading source face…`);
  const res = await fetch(face.source, {
    headers: {
      "User-Agent": "perfect-collection/1.0 (personal, non-commercial)",
    },
  });
  if (!res.ok) throw new Error(`[${face.label}] source ${res.status}`);
  const src = Buffer.from(await res.arrayBuffer());
  console.log(`[${face.label}]   source ${(src.length / 1e6).toFixed(1)} MB`);

  const woff2 = await subsetFont(src, glyphs, {
    targetFormat: "woff2",
    keepFeatures: FEATURES,
  });
  const out = resolve(OUT_DIR, face.out);
  await writeFile(out, woff2);
  console.log(
    `[${face.label}] ✓ wrote ${out.replace(`${ROOT}/`, "")}  ${(woff2.length / 1024).toFixed(1)} KB`,
  );
}

async function main() {
  const glyphs = await collectGlyphs();
  console.log(`Collecting glyphs → ${[...glyphs].length} unique codepoints`);
  await mkdir(OUT_DIR, { recursive: true });
  // Each face is a ~16 MB download, and the two share only the glyph set
  // above, so they are built in parallel.
  await Promise.all(FACES.map((face) => build(glyphs, face)));
}

await main();
