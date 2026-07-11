/**
 * The one channel between the page and the sky.
 *
 * Pages mutate this plain object (no React state, no re-renders); the canvas
 * loop reads it every frame and eases toward the targets. Scroll cannot budge
 * React and React cannot stall the shader — the two worlds only share this.
 */
export const sky = {
  /** eased, what the shader currently shows (continuous night 1..15) */
  night: 1,
  /** where the page wants the moon (home: reading progress; room: its night) */
  targetNight: 1,
  /** smoothed scroll velocity, px/frame — stirs the water */
  velocity: 0,
  /** whole-document progress 0..1 — eases the sky toward dawn at the end */
  progress: 0,
  /** how deep into the music section we are, 0..1 — brightens the glade */
  glade: 0,
  /** room mode: how much the sky steps back behind reading, 0..1 */
  dim: 0,
  /** theme: 0 night, 1 dusk — eased in the loop */
  day: 0,
  targetDay: 0,
  /** view transition in flight: the canvas is hidden behind snapshots, so
   * the loop skips rendering instead of fighting the morph for the GPU */
  hold: false,
};

if (import.meta.env.DEV) {
  // debugging hatch: page.evaluate(() => __sky) from Playwright
  (window as unknown as Record<string, unknown>).__sky = sky;
}

/** Frame-rate independent exponential approach. */
export function ease(
  current: number,
  target: number,
  rate: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
