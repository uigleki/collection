/**
 * Adaptive render scale for the sky canvas.
 *
 * The sky is one full-screen shader, so its cost is its pixel count. A big
 * high-density screen on a slow GPU cannot draw it at full resolution
 * within a frame, and a late frame makes everything the reader does
 * stutter. The governor measures frame times and lowers the scale quickly
 * when frames are late, and raises it slowly once they are on time again,
 * so the scale settles instead of oscillating. The sky is soft gradients
 * and water: drawn slightly below the screen's density and scaled up, it
 * looks the same.
 */

/** Frames per measurement window: about a second on most screens. */
const WINDOW = 60;
/**
 * A frame longer than this (ms) was a pause, such as a hidden tab or a
 * garbage collection, and does not measure render cost.
 */
const HITCH = 100;
/**
 * A frame shorter than this (ms) is two callbacks in one frame, not the
 * display's refresh period.
 */
const FASTEST = 1000 / 240;
/** Consecutive on-time windows needed before the scale is raised. */
const PATIENCE = 8;

export function governor({ max, min }: { max: number; min: number }) {
  let scale = max;
  // the display's refresh period, estimated from the shortest frames seen
  let period = 1000 / 60;
  let sum = 0;
  let count = 0;
  let onTime = 0;

  return {
    get scale() {
      return scale;
    },
    /** Report one frame's length in ms; true when the scale changed. */
    frame(ms: number): boolean {
      if (ms > HITCH) return false;
      period = Math.min(period, Math.max(ms, FASTEST));
      sum += ms;
      count += 1;
      if (count < WINDOW) return false;
      const late = sum / count / period;
      sum = 0;
      count = 0;

      const before = scale;
      if (late > 1.25) {
        onTime = 0;
        scale = Math.max(min, scale * 0.85);
      } else if (late < 1.1) {
        onTime += 1;
        if (onTime >= PATIENCE) {
          onTime = 0;
          scale = Math.min(max, scale * 1.1);
        }
      } else {
        onTime = 0;
      }
      return scale !== before;
    },
  };
}
