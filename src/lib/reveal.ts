// Which pieces of the page have already made their entrance this visit.
// Returning to a page REMOUNTS everything, and a whileInView entrance that
// replays at the restored scroll position reads as the content jumping —
// things you have already seen simply stand where you left them.
const seen = new Set<string>();

/**
 * A register of entrances, under a name of the caller's choosing. Each caller
 * owns its own namespace, so a work slugged "dawn-close" cannot settle the
 * closing beat before it has been seen.
 */
export function revealed(kind: string) {
  return {
    has: (name: string) => seen.has(`${kind}:${name}`),
    add: (name: string) => seen.add(`${kind}:${name}`),
  };
}
