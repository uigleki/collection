import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { load } from "./src/content/load.ts";
import { content } from "./src/content/plugin.ts";
import { origin, pages, siteMeta } from "./src/data/site.ts";
import { cssSprings } from "./src/lib/motion.ts";

const STYLES = resolve(import.meta.dirname, "src/styles/index.css");
// Where the build leaves the code that writes the pages out. It never ships:
// it runs once, here, and dist/ gets only what it wrote.
const WRITER = resolve(import.meta.dirname, "node_modules/.prerender");

/**
 * The ground each theme stands on, read out of the tokens themselves.
 * DESIGN.md puts the palette in src/styles/index.css and nowhere else, so
 * the browser-chrome colors — which have to be literal values in the
 * document head, before any stylesheet applies — are lifted from there at
 * build time rather than copied by hand. A renamed token fails the build
 * instead of quietly leaving the address bar the wrong color.
 */
function grounds(): { night: string; dusk: string } {
  const css = readFileSync(STYLES, "utf8");
  const read = (block: RegExp, where: string) => {
    const scope = css.match(block)?.[1];
    const value = scope?.match(/--color-yoru:\s*([^;]+);/)?.[1]?.trim();
    if (!value) throw new Error(`site-metadata: no --color-yoru in ${where}`);
    return value;
  };
  return {
    night: read(/@theme\s*\{([\s\S]*?)\n\}/, "@theme"),
    dusk: read(
      /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/,
      "the light theme",
    ),
  };
}

const manifest = () => {
  const { night } = grounds();
  return JSON.stringify(
    {
      name: siteMeta.title,
      short_name: "Collection",
      description: siteMeta.description,
      start_url: "/",
      display: "standalone",
      theme_color: night,
      background_color: night,
      icons: [
        {
          src: "/favicon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
    },
    null,
    2,
  );
};

/**
 * Every page the site has. The rooms come from the collection, so a work
 * cannot join it and stay invisible to search or unwritten by the build —
 * nor can a renamed slug leave a dead URL advertised behind it.
 */
const everyPage = (): { path: string; priority: string }[] => [
  ...pages,
  ...load().collection.categories.flatMap((category) =>
    category.works.map((work) => ({
      path: `/works/${work.slug}`,
      priority: "0.6",
    })),
  ),
];

const sitemap = () => {
  const lines = everyPage().map(
    ({ path, priority }) =>
      `  <url><loc>${origin}${path === "/" ? "" : path}</loc><priority>${priority}</priority></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
};

const robots = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

/**
 * The site loads nothing from anywhere else — lighthouserc.json puts the
 * third-party allowance at zero — so the policy that says exactly that is
 * both cheap and honest. The one inline script (the theme, set before
 * paint) and the one inline stylesheet (inlineStyles) are each admitted by
 * the hash of what actually shipped, read back out of the built HTML rather
 * than assumed, so an edit can never leave a stale hash behind and silently
 * disable the theme or unstyle the page.
 *
 * Beyond that one stylesheet, styles get one inline allowance, and it is
 * the narrow one: the build writes each page out with its style attributes
 * in the markup — a cover's aspect ratio, a work's accent, an entrance's
 * place in line — so the attribute is admitted. Any other <style> element is
 * not, and what a script styles goes through the CSSOM (`el.style`), which
 * the policy does not govern.
 */
function headers(html: string): string {
  const hashOfTheOne = (tag: "script" | "style") => {
    const inline = [
      ...html.matchAll(
        new RegExp(`<${tag}(?![^>]*\\ssrc=)[^>]*>([\\s\\S]*?)</${tag}>`, "g"),
      ),
    ];
    if (inline.length !== 1)
      throw new Error(
        `site-metadata: expected exactly one inline ${tag} in the shell, found ${inline.length}`,
      );
    return createHash("sha256")
      .update(inline[0]?.[1] ?? "", "utf8")
      .digest("base64");
  };

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${hashOfTheOne("script")}'`,
    `style-src 'self' 'sha256-${hashOfTheOne("style")}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    // Nothing here ever hands a string to innerHTML — the page is React and
    // a shader, and neither writes markup. Saying so turns the whole class
    // of DOM-sink XSS into a load-time error rather than a thing to audit.
    "require-trusted-types-for 'script'",
    // No upgrade-insecure-requests: every URL the site emits is relative and
    // same-origin, so it would upgrade nothing in production — while over
    // http://localhost it upgrades the preview's own assets out of existence
    // on engines that do not exempt loopback, and the shell test catches it.
  ].join("; ");

  // The three cross-origin headers together, not one of them: the site loads
  // nothing from anywhere else, so the isolation is free, and any future
  // resource that breaks the promise fails loudly instead of shipping.
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

/**
 * Move the stylesheet into the page. Once a page arrives written, the
 * stylesheet is all its first paint still waits on — and on a phone the
 * second round trip costs more than these few kilobytes do, every visit.
 */
function inlineStyles(dist: string, shell: string): string {
  const link = shell.match(/<link rel="stylesheet"[^>]*href="\/([^"]+)"[^>]*>/);
  if (!link?.[1] || shell.split('rel="stylesheet"').length !== 2)
    throw new Error("site-metadata: expected exactly one stylesheet to inline");
  const file = resolve(dist, link[1]);
  const css = readFileSync(file, "utf8").trim();
  if (css.includes("</style"))
    throw new Error("site-metadata: the stylesheet would close its own tag");
  rmSync(file);
  return shell.replace(link[0], () => `<style>${css}</style>`);
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Write every page out as its own file, so that what arrives is the page:
 * read at once on a slow phone, and whole where no script ever runs. The
 * client build's index.html is the shell each one is poured into; the server
 * build is the same app, rendered here once per page (src/app/prerender.tsx).
 *
 * A file per page is also what lets a missing one be missing: with a
 * 404.html and no catch-all rewrite, the edge answers a path it has no file
 * for with that page and a real 404.
 */
async function writePages(dist: string): Promise<void> {
  const { render, face } = (await import(
    pathToFileURL(resolve(WRITER, "prerender.js")).href
  )) as typeof import("./src/app/prerender.tsx");
  const shell = inlineStyles(
    dist,
    readFileSync(resolve(dist, "index.html"), "utf8"),
  );

  const pour = (part: string | RegExp, into: string, what: string) => {
    if (into.search(part) === -1)
      throw new Error(`site-metadata: the shell has no ${part} to fill`);
    return into.replace(part, () => what);
  };
  const write = async (path: string, file: string, canonical: boolean) => {
    const { html, title } = await render(path);
    // the policy admits one inline script, by its hash: the shell's
    if (html.includes("<script"))
      throw new Error(`site-metadata: ${path} renders a script of its own`);
    let page = pour(
      '<div id="root"></div>',
      shell,
      `<div id="root">${html}</div>`,
    );
    page = pour(
      /<title>[^<]*<\/title>/,
      page,
      `<title>${escapeHtml(title)}</title>`,
    );
    // What the page shows is asked for before what runs it. The scripts
    // travel at the same priority as the page's own art and its text face,
    // and a connection serves equals in the order they were asked for —
    // which, left to the shell, is scripts first.
    const art = html
      .match(/<img[^>]*fetchpriority="high"[^>]*>/i)?.[0]
      .match(/ src="([^"]+)"/)?.[1];
    const first = [
      art &&
        `<link rel="preload" as="image" fetchpriority="high" href="${art}" />`,
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${face}" />`,
    ].filter(Boolean);
    page = pour(
      '<script type="module"',
      page,
      `${first.join("\n      ")}\n      <script type="module"`,
    );
    if (canonical)
      page = pour(
        "</head>",
        page,
        `    <link rel="canonical" href="${origin}${path}" />\n    </head>`,
      );
    const to = resolve(dist, file);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, page);
  };

  // <path>.html, not <path>/index.html: the edge serves the first at the
  // bare path and redirects the second to a trailing slash, which is not
  // the URL the sitemap and every link name.
  for (const { path } of everyPage())
    await write(
      path,
      path === "/" ? "index.html" : `${path.slice(1)}.html`,
      true,
    );
  await write("/404", "404.html", false);

  writeFileSync(resolve(dist, "_headers"), headers(shell));
}

/**
 * The site is named once in src/data/site.ts, colored once in
 * src/styles/index.css, and curated once in README.md. This carries all
 * three out to where the app cannot reach at runtime — the document a
 * reader or a crawler gets before any JavaScript runs, the manifest, the
 * sitemap, robots.txt and the edge's response headers — so nothing the
 * outside world is told can drift from what the site actually is.
 */
function siteMetadata(): Plugin {
  const generated = {
    "/manifest.webmanifest": {
      type: "application/manifest+json",
      body: manifest,
    },
    "/sitemap.xml": { type: "application/xml", body: sitemap },
    "/robots.txt": { type: "text/plain", body: robots },
  };

  return {
    name: "site-metadata",
    // One pass over the shell, and a placeholder with nothing behind it stops
    // the build — a typo in index.html would otherwise ship __SITE_TITLE__
    // itself to every crawler, silently.
    transformIndexHtml: {
      order: "pre",
      handler: (html) => {
        const { night, dusk } = grounds();
        const values: Record<string, string> = {
          __SITE_TITLE__: siteMeta.title,
          __SITE_DESCRIPTION__: siteMeta.description,
          __SITE_ORIGIN__: origin,
          __GROUND_NIGHT__: night,
          __GROUND_DUSK__: dusk,
          __SPRINGS__: cssSprings(),
        };
        return html.replace(/__[A-Z_]+__/g, (name) => {
          const value = values[name];
          if (value === undefined)
            throw new Error(`site-metadata: nothing to put in ${name}`);
          return value;
        });
      },
    },
    configureServer(server) {
      for (const [path, file] of Object.entries(generated)) {
        server.middlewares.use(path, (_req, res) => {
          res.setHeader("Content-Type", file.type);
          res.end(file.body());
        });
      }
    },
    generateBundle() {
      if (this.environment.name !== "client") return;
      for (const [path, file] of Object.entries(generated)) {
        this.emitFile({
          type: "asset",
          fileName: path.slice(1),
          source: file.body(),
        });
      }
    },
    // The pages are written from the shell that shipped, and the CSP names
    // that shell's own script by hash — so both wait until it is on disk.
    async buildApp(builder) {
      const { client, ssr } = builder.environments;
      if (!client || !ssr)
        throw new Error("site-metadata: the build has lost an environment");
      await builder.build(client);
      await builder.build(ssr);
      await writePages(resolve(client.config.root, client.config.build.outDir));
    },
    // The edge answers a path it has no file for with 404.html; the preview
    // server would answer it with the home page, which is then taken over by
    // a script that expected to find a different page there.
    configurePreviewServer(server) {
      return () =>
        server.middlewares.use((req, res, next) => {
          const asked = new URL(req.originalUrl ?? "/", origin).pathname;
          const fellBack = req.url === "/index.html" && asked !== req.url;
          if (!fellBack || asked === "/") return next();
          const { root, build } = server.config;
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html");
          res.end(readFileSync(resolve(root, build.outDir, "404.html")));
        });
    },
  };
}

export default defineConfig({
  plugins: [content(), siteMetadata(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  environments: {
    ssr: {
      build: {
        outDir: WRITER,
        copyPublicDir: false,
        rolldownOptions: { input: "src/app/prerender.tsx" },
      },
    },
  },
  // every environment, not the client alone (siteMetadata's buildApp)
  builder: {},
  server: {
    watch: {
      // .direnv links the flake's inputs — all of nixpkgs — into the tree,
      // and the watcher follows links: crawling them held the dev server's
      // start for seventeen seconds. None of these is ever a source.
      ignored: [
        "**/.direnv/**",
        "**/.lighthouseci/**",
        "**/dist/**",
        "**/playwright-report/**",
      ],
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
