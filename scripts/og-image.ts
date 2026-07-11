/**
 * Bakes the social card (og:image) by photographing the site itself —
 * the real hero, real shader, real type; zero drift from the design.
 *
 * Run with the preview server up on :4173:
 *   bun run preview &  bun scripts/og-image.ts
 */
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const OUT = resolve(import.meta.dir, "../public/og.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  colorScheme: "dark",
});
await page.goto("http://localhost:4173/?gl");
await page.waitForTimeout(3200); // entry fade + reveals settle
await page.screenshot({ path: OUT });
await browser.close();
console.log(`✓ wrote ${OUT}`);
