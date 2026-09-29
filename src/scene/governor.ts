/**
 * How sharply the sky can afford to draw.
 *
 * The sky is one full-screen shader, so its cost is its pixel count: a big
 * high-density screen on a modest GPU cannot draw it at full resolution in
 * time, and a late frame is a stutter under everything the reader does.
 * The governor watches the frames arrive and trades resolution for time —
 * quickly when frames run late, slowly when they are on time again, so it
 * settles instead of hunting. The sky is soft light and water; drawn a
 * little under the screen's density and scaled up, it looks the same.
 */

/** Frames per judgment: about a second on most screens. */
const WINDOW = 60;
/** Longer than this was a pause (a tab away, a collection), not the sky. */
const HITCH = 100;
/** Faster than this is two callbacks in one frame, not a real display. */
const FASTEST = 1000 / 240;
/** On-time windows needed before resolution is won back. */
const PATIENCE = 8;

export function governor({ max, min }: { max: number; min: number }) {
  let scale = max;
  // the display's own pace, learned from the fastest frames it delivers
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
