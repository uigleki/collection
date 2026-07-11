import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { FULL_NIGHT, terminator } from "@/lib/moon";
import { ease, sky } from "./signal";

/**
 * The sky: one fixed WebGL canvas alive for the whole visit — a
 * phase-accurate moon (same terminator math as lib/moon.ts), stars, and
 * moonlit water. Scroll waxes the moon; rooms dim the sky; the light theme
 * is a golden dusk. Without WebGL the CSS poster carries the night alone.
 */

const VERT = /* glsl */ `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uFlow;    // integrated water phase — NEVER rate × total time
uniform float uPhase;   // terminator: +1 new moon … -1 full moon
uniform vec2  uMoon;    // moon centre, uv space
uniform float uVel;     // smoothed scroll velocity
uniform float uDay;     // 0 night … 1 day theme
uniform float uDawn;    // 0 … 1 dawn warmth at the end of the page
uniform float uGlade;   // 0 … 1 music section: the sky moon yields to its reflection
uniform float uDim;     // 0 … 1 room mode

const float WATER = 0.30;
const float MOON_R = 0.075;

// ---- palette (DESIGN.md tokens) -------------------------------------------
const vec3 NIGHT_TOP = vec3(0.043, 0.055, 0.090);  // 濡羽 yoru
const vec3 NIGHT_HOR = vec3(0.102, 0.133, 0.204);  // horizon haze
const vec3 MOON_C    = vec3(0.918, 0.945, 0.973);  // 月白 geppaku
const vec3 WARM      = vec3(0.803, 0.706, 0.537);  // 香色 tsukikage
// The light theme is a BRIGHT golden hour: pastel periwinkle over
// pale gold, so ink text reads anywhere. The saturation budget is spent
// on one thing only — the golden ball.
const vec3 DUSK_TOP  = vec3(0.740, 0.750, 0.880);
const vec3 DUSK_HOR  = vec3(0.985, 0.890, 0.720);
const vec3 GOLD      = vec3(0.980, 0.760, 0.400);
const vec3 DAWN      = vec3(0.485, 0.398, 0.373);  // dawn, kept quiet

// ---- noise ------------------------------------------------------------------
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// ---- moon -------------------------------------------------------------------
// Lit fraction of the disc at local point q (unit disc, lit from the right):
// inside iff q.x >= uPhase * sqrt(1 - q.y^2) — identical to lib/moon.ts.
float litMask(vec2 q) {
  float band = sqrt(max(1.0 - q.y * q.y, 0.0));
  return smoothstep(uPhase * band - 0.04, uPhase * band + 0.04, q.x);
}

vec3 skyColor(vec2 uv, float aspect) {
  float h = smoothstep(WATER, 1.0, uv.y);
  vec3 night = mix(NIGHT_HOR, NIGHT_TOP, h);
  vec3 dusk = mix(DUSK_HOR, DUSK_TOP, pow(h, 0.8));
  vec3 c = mix(night, dusk, uDay);

  // dawn — a quiet warmth pooling at the horizon as the page ends.
  float dawnBand = (1.0 - smoothstep(WATER, 0.62, uv.y)) * uDawn * (1.0 - uDay);
  c = mix(c, DAWN, dawnBand * 0.45);

  // stars: sparse, hashed, slow twinkle; gone by day and dawn
  vec2 cell = uv * vec2(aspect, 1.0) * 42.0;
  vec2 id = floor(cell);
  vec2 gv = fract(cell) - 0.5 - (vec2(hash(id), hash(id + 7.3)) - 0.5) * 0.8;
  float star = pow(hash(id * 1.61), 24.0);
  float tw = 0.7 + 0.3 * sin(uTime * (0.4 + hash(id) * 0.8) + hash(id) * 6.28);
  float d = length(gv);
  float glow = star * tw * (1.0 - smoothstep(0.0, 0.12, d));
  // keep the moon's halo region clean
  float nearMoon = 1.0 - smoothstep(0.1, 0.34, distance(uv * vec2(aspect, 1.0), uMoon * vec2(aspect, 1.0)));
  glow *= (1.0 - nearMoon) * (1.0 - uDay) * (1.0 - uDawn * 0.8);
  c += MOON_C * glow * 0.85;
  return c;
}

vec3 moonLayer(vec3 base, vec2 uv, float aspect) {
  vec2 q = (uv - uMoon) * vec2(aspect, 1.0) / MOON_R;
  float r = length(q);

  // While the music holds the page, the sky moon steps aside and only
  // its reflection stays on the water — you keep the glint, not the moon.
  float presence = 1.0 - uGlade * 0.92;

  // halo — wider and warmer the fuller the moon; at dusk it burns gold
  float illum = (1.0 - uPhase) * 0.5;
  float halo = exp(-max(r - 1.0, 0.0) * 3.2) * (0.10 + illum * 0.22);
  vec3 haloC = mix(mix(MOON_C, WARM, 0.35), GOLD, uDay);
  base += haloC * halo * (1.0 - uDay * 0.45) * presence;

  if (r < 1.1) {
    float disc = 1.0 - smoothstep(0.985, 1.0, r);
    float lit = litMask(q);
    // maria — the faint seas, so the full moon has a face, not a lamp
    float seas = fbm(q * 2.6 + 19.7) * 0.10 + fbm(q * 6.0 + 4.2) * 0.045;
    vec3 face = MOON_C * (1.0 - seas);
    face = mix(face, face * vec3(1.02, 1.0, 0.95), 0.25); // breath of warmth
    // earthshine keeps the dark limb barely present
    vec3 dark = mix(base, MOON_C, 0.07);
    vec3 moon = mix(dark, face, lit);
    // dusk: the ball goes gold, unmistakable against the twilight
    vec3 duskMoon = GOLD * (1.0 - seas * 0.5);
    moon = mix(moon, mix(mix(base, GOLD, 0.35), duskMoon, lit), uDay);
    base = mix(base, moon, disc * presence);
  }
  return base;
}

// Ridge-wave octave after Alekseev's Seascape (shadertoy Ms2SD1): sine
// ridges warped by one noise tap, sharpened by pow — crisp crests instead
// of value-noise fog. One noise tap per octave.
float seaOctave(vec2 uv, float choppy) {
  uv += noise(uv);
  vec2 wv = 1.0 - abs(sin(uv));
  vec2 swv = abs(cos(uv));
  wv = mix(wv, swv, wv);
  return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
}

// Water height field: crests run across the view, two layers drift at
// different speeds, and everything packs toward the horizon (persp).
float waterH(vec2 q, float persp, float t) {
  vec2 a = vec2(q.x * 1.7, q.y * persp * 5.0 - t);
  vec2 b = vec2(q.x * 3.1 + 2.7 + t * 0.21, q.y * persp * 9.0 - t * 1.6);
  return 0.65 * seaOctave(a, 2.0) + 0.35 * seaOctave(b, 1.6);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float vel = clamp(abs(uVel) / 40.0, 0.0, 1.0);

  vec3 col;
  if (uv.y >= WATER) {
    col = skyColor(uv, aspect);
    col = moonLayer(col, uv, aspect);
  } else {
    float depth = (WATER - uv.y) / WATER;          // 0 horizon … 1 near shore
    float persp = 1.0 / (depth * depth + 0.06);
    // uFlow is accumulated on the CPU (phase += rate·dt). Multiplying a
    // velocity-dependent rate by total time here made the whole wave field
    // jump phase every frame the scroll speed changed — the flicker.
    float speed = uFlow;
    float amp = (0.05 + vel * 0.14) * (1.0 - uDay * 0.6);

    vec2 p = vec2(uv.x * aspect, uv.y);
    float e = 0.004;
    float hC = waterH(p, persp, speed);
    // one-sided differences: 3 height samples total instead of 5.
    // The vertical component is amplified so reflections streak downward
    // (the way calm water smears lights), the horizontal stays subtle.
    vec2 n = vec2(
      waterH(p + vec2(e, 0.0), persp, speed) - hC,
      waterH(p + vec2(0.0, e), persp, speed) - hC) * vec2(1.0, 1.9);

    // mirror the sky through the disturbed surface — slope-driven on BOTH
    // axes (height-only warps smear; slope warps refract)
    vec2 rp = vec2(uv.x, WATER * 2.0 - uv.y) + n * amp * (0.35 + depth);
    vec3 skyRef = skyColor(vec2(rp.x, max(rp.y, WATER)), aspect);

    // Water is dark before it is a mirror: a near-black indigo base, with
    // the reflected sky admitted only by Fresnel — full mirror at grazing
    // angle (horizon), almost none looking down at the shore. The missing
    // dark/bright separation is what reads as fog.
    vec3 base = mix(vec3(0.012, 0.020, 0.042), vec3(0.760, 0.690, 0.575), uDay);
    float fres = 0.05 + 0.95 * pow(1.0 - depth, 3.0);
    vec3 water = mix(base, skyRef, fres * 0.9);
    water += base * hC * 0.35; // crests catch a breath of light

    // The moonglade (Cox-Munk): a path of discrete wave-facet glints —
    // narrow as the moon itself at the horizon, flaring wider and breaking
    // into separate soft flashes near the shore. Never one uniform streak.
    float illum = (1.0 - uPhase) * 0.5;
    float pathW = MOON_R * mix(0.9, 4.5, depth) * (1.0 + uGlade * 0.6);
    float dx = (uv.x - uMoon.x) * aspect / pathW;
    float envelope = exp(-dx * dx * 3.5);
    float sparkle = pow(
      max(0.0, 1.0 - abs(n.x) * mix(26.0, 8.0, depth)),
      mix(22.0, 4.0, depth));
    // the stable bright core where the still-water reflection would sit
    float core = exp(-dx * dx * 8.0) *
                 exp(-pow((WATER - uv.y) * 16.0, 2.0));
    vec3 gladeC = mix(mix(MOON_C, WARM, 0.3), GOLD, uDay);
    float shine = (0.25 + illum) * (0.6 + uGlade * 0.8) * (1.0 - uDay * 0.2);
    water += gladeC * (envelope * sparkle * 0.9 + core * (0.5 + illum * 0.6)) * shine;
    col = water;
  }

  // rooms: the sky steps back so reading can stand in front
  vec3 ground = mix(NIGHT_TOP, vec3(0.949, 0.925, 0.878), uDay);
  col = mix(col, ground, uDim * 0.62);

  // dither kills gradient banding on the long night sky
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function MoonSky() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 1.75),
        alpha: false,
        antialias: false,
      });
    } catch {
      return; // no WebGL — the CSS poster carries the night
    }
    const gl = renderer.gl;

    // Software rasterizers (SwiftShader, llvmpipe — headless CI, GPU-less
    // VMs) would burn the main thread rendering this every frame. Those
    // machines get the honest static poster instead. Tests that pin the
    // sky's look opt back in with ?gl.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const glName = String(
      dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "",
    );
    const software = /swiftshader|llvmpipe|software/i.test(glName);
    if (software && !new URLSearchParams(location.search).has("gl")) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    el.appendChild(gl.canvas);

    const uniforms = {
      uRes: { value: [1, 1] as [number, number] },
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uPhase: { value: 1 },
      uMoon: { value: [0.64, 0.56] as [number, number] },
      uVel: { value: 0 },
      uDay: { value: 0 },
      uDawn: { value: 0 },
      uGlade: { value: 0 },
      uDim: { value: 0 },
    };
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__uni = uniforms;
    }
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();

    // The entry beat: the living sky rises out of the still poster once,
    // when the visit begins — an arrival, not a loader.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "0";
      el.style.transition = "opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1)";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = "1";
        });
      });
    }
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let flow = 0;
    let glade = 0;
    let dim = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // A view transition is animating over the page: the canvas is fully
      // covered by its snapshots, so skip the draw and give the morph the
      // whole frame budget. The clock above keeps ticking — no dt jump.
      if (sky.hold) return;

      // reduced motion: the ambient time stands still and states cut cleanly,
      // but the moon still shows the truthful phase for where the reader is.
      const still = reduced.matches;
      if (!still) {
        time += dt;
        // integrate the water's phase: faster while the reader scrolls,
        // continuous always
        const v = Math.min(Math.abs(sky.velocity) / 40, 1);
        flow += (0.28 + v * 1.1) * dt;
      }

      sky.night = still
        ? sky.targetNight
        : ease(sky.night, sky.targetNight, 3.0, dt);
      sky.day = still ? sky.targetDay : ease(sky.day, sky.targetDay, 4.0, dt);
      glade = still ? sky.glade : ease(glade, sky.glade, 2.2, dt);
      dim = still ? sky.dim : ease(dim, sky.dim, 4.0, dt);

      const aspect = el.clientWidth / Math.max(el.clientHeight, 1);
      const alt = (sky.night - 1) / (FULL_NIGHT - 1);
      uniforms.uPhase.value = terminator(sky.night);
      uniforms.uMoon.value = [aspect > 1.05 ? 0.66 : 0.5, 0.52 + 0.32 * alt];
      uniforms.uTime.value = time;
      uniforms.uFlow.value = flow;
      uniforms.uVel.value = still ? 0 : sky.velocity;
      uniforms.uDay.value = sky.day;
      uniforms.uDawn.value =
        sky.progress > 0.84 ? (sky.progress - 0.84) / 0.16 : 0;
      uniforms.uGlade.value = glade;
      uniforms.uDim.value = dim;

      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
