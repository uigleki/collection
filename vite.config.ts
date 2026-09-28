import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { origin, pages, siteMeta } from "./src/data/site";
import { allWorks } from "./src/data/works";

const STYLES = resolve(__dirname, "src/styles/index.css");

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
 * Every URL the site asks to be crawled. The rooms come from the collection,
 * so a work cannot join it and stay invisible to search — nor can a renamed
 * slug leave a dead URL advertised behind it.
 */
const sitemap = () => {
  const url = (path: string, priority: string) =>
    `  <url><loc>${origin}${path}</loc><priority>${priority}</priority></url>`;
  const lines = [
    ...pages.map((page) =>
      url(page.path === "/" ? "" : page.path, page.priority),
    ),
    ...allWorks.map(({ work }) => url(`/works/${work.slug}`, "0.6")),
  ];
  return `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
};

const robots = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

/**
 * The site loads nothing from anywhere else — budget.json puts the
 * third-party allowance at zero — so the policy that says exactly that is
 * both cheap and honest. The one inline script (the theme, set before
 * paint) is admitted by the hash of what actually shipped, read back out of
 * the built HTML rather than assumed, so an edit to it can never leave a
 * stale hash behind and silently disable the theme.
 *
 * `unsafe-inline` survives only for styles: every cover carries its aspect
 * ratio and its work's accent as a style attribute, which is inline by
 * definition and cannot be hashed per element.
 */
function headers(html: string): string {
  const inline = [
    ...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g),
  ];
  if (inline.length !== 1)
    throw new Error(
      `site-metadata: expected exactly one inline script in the shell, found ${inline.length}`,
    );
  const hash = createHash("sha256")
    .update(inline[0]?.[1] ?? "", "utf8")
    .digest("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${hash}'`,
    "style-src 'self' 'unsafe-inline'",
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

/index.html
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

/**
 * The site is named once in src/data/site.ts, colored once in
 * src/styles/index.css, and curated once in src/data/works/. This carries
 * all three out to the files the app cannot reach at runtime — the document
 * head a crawler reads before any JavaScript runs, the manifest, the
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
      for (const [path, file] of Object.entries(generated)) {
        this.emitFile({
          type: "asset",
          fileName: path.slice(1),
          source: file.body(),
        });
      }
    },
    // The CSP names the shipped shell's own script by hash, so it is written
    // once the shell exists on disk — not from the source it was built from.
    writeBundle({ dir }) {
      const dist = resolve(dir ?? "dist");
      const html = readFileSync(resolve(dist, "index.html"), "utf8");
      writeFileSync(resolve(dist, "_headers"), headers(html));
    },
  };
}

export default defineConfig({
  plugins: [siteMetadata(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
