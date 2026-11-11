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
// Output directory of the server (prerender) build. It is not deployed: the
// build runs it once to write the HTML pages into dist/.
const PRERENDER_OUT = resolve(import.meta.dirname, "node_modules/.prerender");

/**
 * Each theme's background color (--color-background), read from
 * src/styles/index.css. DESIGN.md defines the palette there and nowhere
 * else, but the browser-UI colors in the document head must be literal
 * values, because they apply before any stylesheet does. So they are read
 * from the stylesheet at build time instead of copied by hand, and a
 * renamed token fails the build instead of leaving the address bar the
 * wrong color.
 */
function backgroundColors(): { dark: string; light: string } {
  const css = readFileSync(STYLES, "utf8");
  const read = (block: RegExp, where: string) => {
    const scope = css.match(block)?.[1];
    const value = scope?.match(/--color-background:\s*([^;]+);/)?.[1]?.trim();
    if (!value)
      throw new Error(`site-metadata: no --color-background in ${where}`);
    return value;
  };
  return {
    dark: read(/@theme\s*\{([\s\S]*?)\n\}/, "@theme"),
    light: read(
      /:root\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/,
      "the light theme",
    ),
  };
}

const manifest = () => {
  const { dark } = backgroundColors();
  return JSON.stringify(
    {
      name: siteMeta.title,
      short_name: "Collection",
      description: siteMeta.description,
      start_url: "/",
      display: "standalone",
      theme_color: dark,
      background_color: dark,
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
 * Every page of the site. The work pages are derived from the collection,
 * so every work is in the sitemap and gets a prerendered file, and a
 * renamed slug leaves no old URL in the sitemap.
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
 * The response headers. The site loads no third-party resources
 * (lighthouserc.json asserts a third-party count of zero), so the CSP
 * allows same-origin sources only. The one inline script (it sets the theme
 * before first paint) and the one inline stylesheet (inlineStyles) are each
 * allowed by hash. The hash is computed from the built HTML, not written by
 * hand, so an edit cannot leave a stale hash that blocks the theme script
 * or the stylesheet.
 *
 * Besides that stylesheet, the only inline styles allowed are style
 * attributes: the prerendered markup carries them (a cover's aspect ratio,
 * a work's accent, an entrance animation's delay). Any other <style>
 * element is blocked. Styles set by a script go through the CSSOM
 * (`el.style`), which the CSP does not restrict.
 */
function headers(html: string): string {
  const inlineHash = (tag: "script" | "style") => {
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
    `script-src 'self' 'sha256-${inlineHash("script")}'`,
    `style-src 'self' 'sha256-${inlineHash("style")}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    // The site never passes a string to innerHTML or another DOM sink: the
    // page is React and a shader, and neither writes markup. With this
    // directive such a call throws, so DOM-sink XSS is blocked by the
    // browser instead of having to be audited for.
    "require-trusted-types-for 'script'",
    // No upgrade-insecure-requests: every URL the site emits is relative and
    // same-origin, so it would change nothing in production. Over
    // http://localhost, engines that do not exempt loopback would upgrade
    // the preview's own asset URLs to https, where they fail to load;
    // tests/shell.spec.ts catches that.
  ].join("; ");

  // All three Cross-Origin-* headers are set, not just one. The site loads
  // no cross-origin resources, so they cost nothing, and a cross-origin
  // resource added later fails to load instead of shipping unnoticed.
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
 * Inline the stylesheet into the page. A prerendered page waits only on the
 * stylesheet for its first paint, and on a phone that extra request costs
 * more than sending these few kilobytes with every page.
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
 * Prerender every page to its own HTML file, so the response already
 * contains the page: it is readable at once on a slow phone, and complete
 * where scripts never run. The client build's index.html is the template
 * each page is inserted into; the server build is the same app, rendered
 * here once per page (src/app/prerender.tsx).
 *
 * A file per page also allows a real 404: with a 404.html and no catch-all
 * rewrite, the host answers a path it has no file for with that page and
 * status 404.
 */
async function writePages(dist: string): Promise<void> {
  const { render, textFontUrl } = (await import(
    pathToFileURL(resolve(PRERENDER_OUT, "prerender.js")).href
  )) as typeof import("./src/app/prerender.tsx");
  const shell = inlineStyles(
    dist,
    readFileSync(resolve(dist, "index.html"), "utf8"),
  );

  const fill = (part: string | RegExp, into: string, what: string) => {
    if (into.search(part) === -1)
      throw new Error(`site-metadata: the shell has no ${part} to fill`);
    return into.replace(part, () => what);
  };
  const write = async (path: string, file: string, canonical: boolean) => {
    const { html, title } = await render(path);
    // The CSP allows one inline script, by hash: the one in index.html.
    if (html.includes("<script"))
      throw new Error(`site-metadata: ${path} renders a script of its own`);
    let page = fill(
      '<div id="root"></div>',
      shell,
      `<div id="root">${html}</div>`,
    );
    page = fill(
      /<title>[^<]*<\/title>/,
      page,
      `<title>${escapeHtml(title)}</title>`,
    );
    // Request what the page shows before the scripts. The scripts load at
    // the same priority as the page's main image and its text font, and a
    // connection serves requests of equal priority in the order they were
    // made, which in index.html's own order is scripts first.
    const cover = html
      .match(/<img[^>]*fetchpriority="high"[^>]*>/i)?.[0]
      .match(/ src="([^"]+)"/)?.[1];
    const first = [
      cover &&
        `<link rel="preload" as="image" fetchpriority="high" href="${cover}" />`,
      `<link rel="preload" as="font" type="font/woff2" crossorigin href="${textFontUrl}" />`,
    ].filter(Boolean);
    page = fill(
      '<script type="module"',
      page,
      `${first.join("\n      ")}\n      <script type="module"`,
    );
    if (canonical)
      page = fill(
        "</head>",
        page,
        `    <link rel="canonical" href="${origin}${path}" />\n    </head>`,
      );
    const to = resolve(dist, file);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, page);
  };

  // <path>.html, not <path>/index.html: the host serves the first at the
  // bare path and redirects the second to a trailing slash, which is not
  // the URL the sitemap and the links use.
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
 * The site's name is defined once in src/data/site.ts, its colors in
 * src/styles/index.css and its works in README.md. This plugin copies all
 * three into the outputs the app cannot write at runtime: the HTML a reader
 * or a crawler gets before any JavaScript runs, the manifest, the sitemap,
 * robots.txt and the response headers. These outputs therefore cannot
 * differ from the site itself.
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
    // A placeholder with no value fails the build. Otherwise a typo in
    // index.html would ship the literal text __SITE_TITLE__ to every
    // crawler without any error.
    transformIndexHtml: {
      order: "pre",
      handler: (html) => {
        const { dark, light } = backgroundColors();
        const values: Record<string, string> = {
          __SITE_TITLE__: siteMeta.title,
          __SITE_DESCRIPTION__: siteMeta.description,
          __SITE_ORIGIN__: origin,
          __BACKGROUND_DARK__: dark,
          __BACKGROUND_LIGHT__: light,
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
    // The pages are written from the built index.html, and the CSP hashes
    // that file's inline script, so both run after the client build has
    // written it to disk.
    async buildApp(builder) {
      const { client, ssr } = builder.environments;
      if (!client || !ssr)
        throw new Error(
          "site-metadata: the client or ssr environment is missing",
        );
      await builder.build(client);
      await builder.build(ssr);
      await writePages(resolve(client.config.root, client.config.build.outDir));
    },
    // The host answers a path it has no file for with 404.html. The preview
    // server would answer it with the home page, and the script would then
    // hydrate that markup as a different page.
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
        outDir: PRERENDER_OUT,
        copyPublicDir: false,
        rolldownOptions: { input: "src/app/prerender.tsx" },
      },
    },
  },
  // every environment, not the client alone (siteMetadata's buildApp)
  builder: {},
  server: {
    watch: {
      // .direnv symlinks the flake's inputs (all of nixpkgs) into the tree,
      // and the watcher follows symlinks: crawling them delays the dev
      // server's start. None of these directories holds source files.
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
