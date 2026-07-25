// Which pieces of the page have already made their entrance this visit.
// Returning to a page REMOUNTS everything, and a whileInView entrance that
// replays at the restored scroll position reads as the content jumping —
// things you have already seen simply stand where you left them.
export const revealed = new Set<string>();
