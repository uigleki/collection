import type { Plugin } from "vite";
import { load, SOURCES } from "./load.ts";

/**
 * Serves the collection to the app as two modules, parsed from the Markdown
 * at build time: `virtual:collection` (README.md and docs/reviews.md: the
 * works and the songs) and `virtual:why` (docs/why.md).
 */
const MODULES = {
  "virtual:collection": () => load().collection,
  "virtual:why": () => load().why,
} as const;

type Id = keyof typeof MODULES;
const isId = (id: string): id is Id => id in MODULES;
const RESOLVED = "\0";

export function content(): Plugin {
  const sources = new Set<string>(Object.values(SOURCES));
  return {
    name: "content",
    resolveId: (id) => (isId(id) ? RESOLVED + id : undefined),
    load(id) {
      if (!id.startsWith(RESOLVED)) return;
      const name = id.slice(RESOLVED.length);
      if (!isId(name)) return;
      for (const file of sources) this.addWatchFile(file);
      return `export default ${JSON.stringify(MODULES[name]())};`;
    },
    handleHotUpdate({ file, server }) {
      if (!sources.has(file)) return;
      for (const name of Object.keys(MODULES)) {
        const mod = server.moduleGraph.getModuleById(RESOLVED + name);
        if (mod) server.moduleGraph.invalidateModule(mod);
      }
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
