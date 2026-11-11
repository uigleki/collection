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
 * The face every page's reading is set in. A stylesheet's fonts are only
 * asked for once a layout has needed them; the build asks for this one with
 * the page itself.
 */
export const face = text;

/**
 * One page as the build writes it into its file (vite.config.ts): what
 * stands in #root, and the title the page gave itself.
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
        {/* no hydration script: there is no loader data to carry over, and
            the policy admits one inline script by hash — the theme's */}
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
