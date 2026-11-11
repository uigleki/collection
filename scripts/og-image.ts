/**
 * Generates the social card (og:image) as a screenshot of the home page's
 * hero, with the real shader and fonts, so the card cannot differ from the
 * site's design.
 *
 * Run with the preview server up on :4173:
 *   pnpm run preview &  node scripts/og-image.ts
 */
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const OUT = resolve(import.meta.dirname, "../public/og.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  colorScheme: "dark",
});
await page.goto("http://localhost:4173/?gl");
await page.waitForTimeout(3200); // until the entrance animations finish
await page.screenshot({ path: OUT });
await browser.close();
console.log(`✓ wrote ${OUT}`);
