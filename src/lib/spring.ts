/**
 * A spring, spelled for CSS. `linear()` takes any curve as a list of points,
 * so a damped spring can drive a plain CSS transition: it runs on the
 * compositor, and a transition retargeted mid-flight starts from where the
 * value is — the two things a hover or a press needs that a cubic-bezier
 * of fixed duration cannot give.
 */
export interface Spring {
  stiffness: number;
  damping: number;
  mass?: number;
}

/** Close enough to rest that no one can see it still moving. */
const REST_DISTANCE = 0.001;
const REST_SPEED = 0.01;

export function cssSpring({ stiffness, damping, mass = 1 }: Spring): {
  easing: string;
  /** milliseconds until the spring is at rest */
  duration: number;
} {
  const dt = 1 / 1000;
  const trail: number[] = [];
  let x = 0;
  let v = 0;
  for (let t = 0; t < 10; t += dt) {
    trail.push(x);
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    if (Math.abs(x - 1) < REST_DISTANCE && Math.abs(v) < REST_SPEED) break;
  }
  const samples = Math.min(64, trail.length - 1);
  const step = (trail.length - 1) / samples;
  const curve = Array.from({ length: samples }, (_, i) =>
    Number((trail[Math.round(i * step)] ?? 0).toFixed(4)),
  );
  return {
    easing: `linear(${[...curve, 1].join(", ")})`,
    duration: trail.length,
  };
}
