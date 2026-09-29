import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { FULL_NIGHT, terminator } from "@/lib/moon.ts";
import { governor } from "./governor.ts";
import { ease, sky } from "./signal.ts";

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
uniform float uPhase;   // terminator: +1 new moon … -1 full moon
uniform vec2  uMoon;    // moon center, uv space
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
// Hash without sine (Hoskins). The classic fract(sin(dot(p, k)) * 43758.5)
// hands sin() arguments in the thousands, and GLSL ES promises precision
// only across [-PI, PI] — outside it drivers are free to return anything,
// which on some mobile GPUs collapses the field into repeating bands. The
// dither at the end of main() draws from this same hash to KILL banding.
// Pure float ops instead: ~9% more fragment time for one sky everywhere.
float hash(vec2 p) {
  vec3 q = fract(p.xyx * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
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

vec3 skyColor(vec2 uv, float aspect, float stars) {
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
  c += MOON_C * glow * 0.85 * stars;
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
    face = mix(face, face * vec3(1.02, 1.0, 0.95), 0.25);
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

// ---- water ------------------------------------------------------------------
// A real surface seen through a real lens. The eye stands EYE above a flat
// sea and looks level at the horizon (the screen row WATER); each pixel below
// it is a ray that meets the sea somewhere, near at the bottom of the
// screen and ever farther toward the horizon. Waves live on that plane, in
// the world, so they shrink and crowd with distance the way water does.
const float FOCAL = 1.2;   // lens: screen heights per unit of ray depth
const float EYE = 1.0;     // height of the eye above the water
const int WAVES = 12;

// The ray through a screen point: horizon at WATER, looking straight ahead.
vec3 viewRay(vec2 uv, float aspect) {
  return normalize(vec3((uv.x - 0.5) * aspect, uv.y - WATER, FOCAL));
}
// And back: where a direction lands on the screen (used for reflections).
vec2 screenOf(vec3 d, float aspect) {
  return vec2(0.5 + d.x / d.z * FOCAL / aspect, WATER + d.y / d.z * FOCAL);
}

// The surface's slope at a point of the sea: a sum of wind waves, long
// swells to short ripples, each running its own way around the wind and
// at the speed deep water gives its length (w = sqrt(g k)). Their slopes are
// summed analytically — no differences, no noise lattice to repeat. A wave
// shorter than the patch of sea one pixel covers cannot be drawn, only
// aliased: it is left out, and the slope it would have added is returned as
// roughness instead, which spreads the moon's reflection the way the
// unseen ripples would.
vec3 seaSlope(vec2 p, float footprint, float t) {
  vec2 slope = vec2(0.0);
  float rough = 0.0;
  float len = 7.0;
  for (int i = 0; i < WAVES; i++) {
    float fi = float(i);
    float a = 0.3 + 1.1 * sin(fi * 2.39996);   // spread around the wind
    vec2 dir = vec2(sin(a), cos(a));
    float k = 6.28318 / len;
    float w = sqrt(9.81 * k);
    float steep = 0.05;                        // slope amplitude of each wave
    float phase = dot(dir, p) * k - w * t + fi * 1.7;
    // how much of this wave the pixel can resolve: none once it is shorter
    // than two footprints
    float seen = smoothstep(2.0, 4.0, len / footprint);
    slope += dir * cos(phase) * steep * seen;
    rough += steep * steep * 0.5 * (1.0 - seen);
    len *= 0.72;
  }
  return vec3(slope, rough);
}

vec3 waterColor(vec2 uv, float aspect) {
  vec3 ray = viewRay(uv, aspect);
  float dist = EYE / max(-ray.y, 1e-4);
  vec2 p = ray.xz * dist;
  // One pixel's footprint on the sea: it grows with distance, and
  // stretches along the view as the ray grazes the surface.
  float pixel = 1.0 / (uRes.y * FOCAL);
  float footprint = pixel * dist / max(-ray.y, 1e-3);

  vec3 sl = seaSlope(p, footprint, uTime * 0.55);
  vec3 n = normalize(vec3(-sl.x, 1.0, -sl.y));
  vec3 r = reflect(ray, n);
  r.y = abs(r.y);                              // no ray ever goes under

  // What the water mirrors: the same sky, seen along the reflected ray.
  vec3 sky = skyColor(screenOf(r, aspect), aspect, 0.0);

  // The moon, mirrored: a glint wherever a facet is tilted just so — its
  // normal halfway between the eye and the moon. How far the drawn surface
  // is from that tilt, against how much tilt the moon's own width and the
  // unseen ripples allow, is how bright the glint is; the allowance widens
  // only by dimming, so light is spread, never added. Measured in slope,
  // not angle, the path narrows toward the horizon on its own, as real
  // moonglades do. It is not painted: it is every such facet at once.
  vec3 moonDir = viewRay(uMoon, aspect);
  vec3 mid = normalize(moonDir - ray);
  vec2 need = -mid.xz / mid.y;
  float radius = 0.5 * MOON_R / FOCAL;
  float allow = radius * radius + sl.z;
  vec2 miss = need - sl.xy;
  float illum = (1.0 - uPhase) * 0.5;
  float glint = exp(-dot(miss, miss) / (2.0 * allow)) * radius * radius / allow;
  vec3 gladeC = mix(mix(MOON_C, WARM, 0.25), GOLD, uDay);
  // by night the glint is as bright as the moon is full; at dusk the ball
  // is always whole
  float shine = mix(0.15 + illum * 1.1, 0.8, uDay) * (1.0 + uGlade * 0.8);

  // Water is dark before it is a mirror: looking down, it shows its body;
  // toward the horizon, only the sky (Fresnel, Schlick's form for water).
  float cosI = clamp(dot(-ray, n), 0.0, 1.0);
  float fresnel = 0.02 + 0.98 * pow(1.0 - cosI, 5.0);
  vec3 body = mix(vec3(0.010, 0.016, 0.034), vec3(0.80, 0.72, 0.60), uDay);
  vec3 c = mix(body, sky, fresnel) + gladeC * glint * shine * fresnel * 6.0;

  // the far sea melts into the horizon's haze instead of ending on a line
  float haze = exp(-dist * 0.012);
  return mix(skyColor(vec2(uv.x, WATER), aspect, 0.0), c, haze);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;

  vec3 col;
  if (uv.y >= WATER) {
    col = skyColor(uv, aspect, 1.0);
    col = moonLayer(col, uv, aspect);
  } else {
    col = waterColor(uv, aspect);
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

    const sharpest = Math.min(window.devicePixelRatio, 1.75);
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: sharpest,
        alpha: false,
        antialias: false,
        // One triangle, no depth test: a depth buffer would be tens of MB
        // of VRAM cleared every frame for nothing. The COLOR clear stays —
        // on tiled mobile GPUs it is what lets the driver skip loading the
        // previous frame back into tile memory.
        depth: false,
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
      uPhase: { value: 1 },
      uMoon: { value: [0.64, 0.56] as [number, number] },
      uDay: { value: 0 },
      uDawn: { value: 0 },
      uGlade: { value: 0 },
      uDim: { value: 0 },
    };
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
    // A shader this driver will not build leaves the night to the poster
    // rather than taking the page down with it.
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Both of these are layout reads, and both only change when something
    // resizes — measured here rather than in the frame loop, where they cost
    // a forced style-and-layout flush sixty times a second.
    let aspect = 1;
    let span = 0;
    const measure = () => {
      aspect = el.clientWidth / Math.max(el.clientHeight, 1);
      span = document.documentElement.scrollHeight - window.innerHeight;
    };
    const size = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    const resize = () => {
      size();
      measure();
      // Sizing a canvas clears it, and observers run after this frame's
      // draw: without a draw of its own, the frame would show black.
      renderer.render({ scene: mesh });
    };
    // Resolution follows what this machine can draw in time (governor.ts).
    const pace = governor({ max: sharpest, min: Math.min(sharpest, 0.6) });
    resize();

    // The entry beat: the living sky rises out of the still poster once,
    // when the visit begins — an arrival, not a loader. The host is hidden
    // from its first paint (a hiding set here would itself transition, and
    // leave the canvas showing while it faded), and it is the loop that
    // reveals it, once there is a drawn frame to reveal: a canvas shown
    // before that is a black one.
    if (!reduced.matches)
      el.style.transition = "opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1)";
    let shown = false;
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    // The document grows and shrinks without the canvas ever changing size —
    // covers decoding, entrances settling, a route swapping the whole page.
    const docRo = new ResizeObserver(measure);
    docRo.observe(document.body);

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let glade = 0;
    let dim = 0;
    // Eased and sampled entirely inside this loop — nothing outside the sky
    // ever reads them, so they are locals, not part of the page's channel.
    let night = 1;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const ms = now - last;
      const dt = Math.min(ms / 1000, 0.1);
      last = now;
      if (pace.frame(ms)) {
        renderer.dpr = pace.scale;
        size(); // drawn below, in this same frame
      }
      // reduced motion: the ambient time stands still and states cut cleanly,
      // but the moon still shows the truthful phase for where the reader is.
      const still = reduced.matches;

      // Where the reader is. Sampled here rather than in its own rAF: the
      // sky is the only thing that reads these, and this loop already runs
      // every frame.
      const y = window.scrollY;
      const progress = span > 0 ? y / span : 0;
      // An instant jump (deep link, keyboard End) can skip every night's
      // observer band. Which pages that matters on is the page's business,
      // not the shader's — it arrives on the channel like everything else.
      if (
        sky.waxWithProgress &&
        progress > 0.6 &&
        sky.targetNight < FULL_NIGHT
      ) {
        sky.targetNight = FULL_NIGHT;
      }

      // The water keeps its own time. It once ran faster while the reader
      // scrolled — a sea that answers the scroll wheel reads as a screen
      // effect, not a sea.
      if (!still) time += dt;

      night = still ? sky.targetNight : ease(night, sky.targetNight, 3.0, dt);
      sky.day = still ? sky.targetDay : ease(sky.day, sky.targetDay, 4.0, dt);
      glade = still ? sky.glade : ease(glade, sky.glade, 2.2, dt);
      dim = still ? sky.dim : ease(dim, sky.dim, 4.0, dt);

      const alt = (night - 1) / (FULL_NIGHT - 1);
      uniforms.uPhase.value = terminator(night);
      uniforms.uMoon.value[0] = aspect > 1.05 ? 0.66 : 0.5;
      uniforms.uMoon.value[1] = 0.52 + 0.32 * alt;
      uniforms.uTime.value = time;
      uniforms.uDay.value = sky.day;
      uniforms.uDawn.value = progress > 0.84 ? (progress - 0.84) / 0.16 : 0;
      uniforms.uGlade.value = glade;
      uniforms.uDim.value = dim;

      renderer.render({ scene: mesh });
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
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
      docRo.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
      el.style.opacity = "";
      el.style.transition = "";
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-0"
    />
  );
}
