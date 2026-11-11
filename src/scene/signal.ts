/**
 * The only state shared between the pages and the sky canvas.
 *
 * Pages mutate this plain object (no React state, no re-renders); the canvas
 * loop reads it every frame and eases toward the targets. Scrolling therefore
 * causes no React render, and a slow React render does not block the shader.
 */
export const sky = {
  /**
   * the night (moon phase) the page asks for: home sets it from the work
   * being read, a work page sets its own night
   */
  targetNight: 1,
  /**
   * set by a page whose scroll covers the whole month (home): past its
   * works the moon must be full, even after an instant jump there. Opt-in
   * only: a work page's scroll must not change the phase, because that
   * looks like the moon moving at random.
   */
  waxWithProgress: false,
  /**
   * 0..1, 1 while the music section is in view (lib/sky.ts): brightens the
   * moon's reflection on the water
   */
  glade: 0,
  /** how far the sky is dimmed behind the page content, 0..1 */
  dim: 0,
  /** theme: 0 night, 1 dusk — eased in the loop */
  day: 0,
  targetDay: 0,
};

/** Frame-rate independent exponential approach. */
export function ease(
  current: number,
  target: number,
  rate: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
