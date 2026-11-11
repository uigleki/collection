import text from "@fontsource/ubuntu/files/ubuntu-latin-400-normal.woff2?url";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { origin } from "@/data/site.ts";
import { PageHead } from "@/lib/usePage.ts";
import { routes } from "./routes.tsx";

/**
 * URL of the font file used for body text on every page. A browser requests
 * a stylesheet's fonts only once a layout needs them; the build preloads
 * this one from the page's HTML (vite.config.ts).
 */
export const textFontUrl = text;

/**
 * Renders one page for the build (vite.config.ts): the HTML that goes into
 * #root, and the title the page set through usePage.
 */
export async function render(
  path: string,
): Promise<{ html: string; title: string }> {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(new Request(new URL(path, origin)));
  if (context instanceof Response)
    throw new Error(`prerender: ${path} answered with a response, not a page`);

  const head: { title?: string } = {};
  const html = renderToString(
    <StrictMode>
      <PageHead value={head}>
        {/* no hydration script: there is no loader data to pass on, and the
            CSP allows one inline script by hash, which is the theme script */}
        <StaticRouterProvider
          router={createStaticRouter(dataRoutes, context)}
          context={context}
          hydrate={false}
        />
      </PageHead>
    </StrictMode>,
  );
  if (!head.title) throw new Error(`prerender: ${path} has no title`);
  return { html, title: head.title };
}
