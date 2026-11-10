/*
 * Polaroid Line Carousel — instant photos pegged to a sagging string. Drag the
 * line (or use the arrows) and the prints slide along it, swinging on their
 * pegs with the speed you give them and settling back with a little
 * overshoot; even at rest they sway in a light breeze. The one in the middle
 * is the one you're looking at.
 *
 * Drag, click a print, ←/→ and autoplay. Slides without an `image` get a
 * painted landscape, so it works with no assets at all.
 *
 * Adapted for this site from the supplied component:
 * - site fonts (Instrument Serif and Sans) and a readable muted text colour
 * - slides can carry `href`, `focus` (crop position) and `meta` (e.g. price),
 *   and the caption bar links to the slide's page
 * - autoplay waits while the pointer is over it or it has keyboard focus,
 *   and is off for reduced motion
 * - prints stay hidden until they've been placed, so they never flash stacked
 * - `scrollDriven`: page scroll drives it inside a sticky track ([data-pl-track]).
 *   All prints show from the start; scrolling slides them from right to left,
 *   one after another (staggered), smoothed but tied to the scroll position.
 *   Drag and autoplay are off in this mode. Hovering a print zooms its photo.
 * - `controls={false}` hides the caption, counter and arrows
 * - a slide with `href` is a link: clicking its print opens the page
 */
import * as React from 'react';

export type LandPalette = 'dawn' | 'alpine' | 'dusk' | 'mist';

export type Slide = {
  image?: string;
  title?: string;
  caption?: string;
  alt?: string;
  /** Link for the caption bar's button. */
  href?: string;
  /** Label for that button; defaults to "Explore {title}". */
  linkLabel?: string;
  /** CSS object-position for the photo. */
  focus?: string;
  /** Extra line under the caption, such as a price. */
  meta?: string;
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette;
  seed?: number;
};

export type PolaroidLineCarouselProps = {
  slides?: Slide[];
  /** Any CSS length. Default 100svh. */
  height?: number | string;
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number;
  /** How far the string sags in the middle, px. */
  sag?: number;
  /** How much the prints swing; 0 holds them still. */
  swing?: number;
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number;
  /** Index of the print to start on. */
  start?: number;
  /** Colour of the string and pegs. */
  string?: string;
  background?: string;
  ink?: string;
  /** Colour for secondary text; must stay readable on the background. */
  muted?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  /** What one slide is called, for the arrow buttons' names (e.g. "destination"). */
  itemLabel?: string;
  /** Let page scroll drive the carousel; place it inside an element with [data-pl-track]. */
  scrollDriven?: boolean;
  /** Show the caption bar, counter and arrows. */
  controls?: boolean;
};

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  const t = clamp(x / w, 0, 1);
  return y0 + 4 * sag * t * (1 - t);
}

/** One step of a critically damped spring toward target. */
export function springStep(x: number, v: number, target: number, dt: number, k = 70): [number, number] {
  const c = 2 * Math.sqrt(k);
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
}

/** One step of a print's swing. lineVel is the prints' on-screen speed (px/s, + = moving right); a print lags behind the motion, is pulled back by gravity and damped. */
export function swingStep(a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt;
  return [clamp(a + nw * dt, -0.6, 0.6), nw];
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1));
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}
// #endregion logic

/* ------------------------------------------------------- painted images */

const PALETTES = {
  dawn: { top: '#e7b7a5', bottom: '#f8e8d6', sun: '#fff4df', far: '#d2b2bb', near: '#3a2a3b', mist: '255,240,232' },
  alpine: { top: '#7ea5c8', bottom: '#e3ecf2', sun: '#ffffff', far: '#a9bfd0', near: '#1c3044', mist: '236,244,250' },
  dusk: { top: '#2a2450', bottom: '#ef8d60', sun: '#ffd9a6', far: '#93607c', near: '#18121f', mist: '255,196,160' },
  mist: { top: '#c4d0cb', bottom: '#eef1ec', sun: '#ffffff', far: '#aebcb5', near: '#2c3a33', mist: '246,248,245' },
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexRgb(h: string): [number, number, number] {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function mixRgb(a: string, b: string, t: number): string {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
}

// A layered-ridge landscape: sky, a low sun, five ridges fading into haze with
// mist between them, a tree line on the nearest, film grain. Painted once.
function paintLandscape(seed: number, palette: LandPalette, w = 1600, h = 1000): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) return '';
  const P = PALETTES[palette] ?? PALETTES.dawn;
  const r = mulberry32(seed * 104729 + 7);

  const sky = g.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, P.top);
  sky.addColorStop(1, P.bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  const sx = w * (0.22 + r() * 0.56);
  const sy = h * (0.26 + r() * 0.16);
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.45);
  halo.addColorStop(0, 'rgba(' + hexRgb(P.sun).join(',') + ',.85)');
  halo.addColorStop(0.08, 'rgba(' + hexRgb(P.sun).join(',') + ',.55)');
  halo.addColorStop(1, 'rgba(' + hexRgb(P.sun).join(',') + ',0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = P.sun;
  g.beginPath();
  g.arc(sx, sy, h * 0.045, 0, Math.PI * 2);
  g.fill();

  const layers = 5;
  for (let L = 0; L < layers; L++) {
    const k = L / (layers - 1);
    const base = h * (0.42 + k * 0.4);
    const amp = h * (0.07 + k * 0.1);
    const ph = [r(), r(), r(), r()].map((v) => v * Math.PI * 2);
    const fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4, 17 + r() * 8];
    const ridge = (x: number) => {
      const u = x / w;
      return (
        base -
        amp *
          (0.55 * Math.sin(u * fr[0] + ph[0]) +
            0.28 * Math.sin(u * fr[1] + ph[1]) +
            0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) +
            0.05 * Math.sin(u * fr[3] + ph[3]))
      );
    };
    const mist = g.createLinearGradient(0, base - amp * 1.4, 0, base + amp * 0.4);
    mist.addColorStop(0, 'rgba(' + P.mist + ',0)');
    mist.addColorStop(1, 'rgba(' + P.mist + ',' + (0.55 - k * 0.35).toFixed(2) + ')');
    g.fillStyle = mist;
    g.fillRect(0, base - amp * 1.4, w, amp * 1.8);
    const body = g.createLinearGradient(0, base - amp, 0, h);
    body.addColorStop(0, mixRgb(P.far, P.near, Math.pow(k, 1.3)));
    body.addColorStop(1, mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.18)));
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x));
    g.lineTo(w, h);
    g.closePath();
    g.fill();
    if (L >= layers - 2) {
      g.fillStyle = mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.08));
      for (let x = 0; x < w; x += 7 + r() * 9) {
        if (r() < 0.35) continue;
        const y = ridge(x) + 2;
        const th = h * (0.025 + r() * 0.035) * (0.6 + k);
        const tw = th * 0.32;
        g.beginPath();
        g.moveTo(x, y - th);
        g.lineTo(x + tw, y);
        g.lineTo(x - tw, y);
        g.closePath();
        g.fill();
      }
    }
  }

  const vig = g.createRadialGradient(w / 2, h * 0.45, h * 0.3, w / 2, h / 2, w * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,.32)');
  g.fillStyle = vig;
  g.fillRect(0, 0, w, h);
  const grain = g.getImageData(0, 0, w, h);
  const d = grain.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (r() - 0.5) * 14;
    d[i] += v;
    d[i + 1] += v;
    d[i + 2] += v;
  }
  g.putImageData(grain, 0, 0);
  return c.toDataURL('image/jpeg', 0.88);
}

const DEFAULT_SLIDES: Slide[] = [
  { title: 'First Light', caption: 'Haze lifting off the eastern ridges.', palette: 'dawn', seed: 3 },
  { title: 'High Pass', caption: 'Cold air, clear to the far range.', palette: 'alpine', seed: 8 },
  { title: 'Ember Hour', caption: 'The last of the sun on the valley floor.', palette: 'dusk', seed: 14 },
  { title: 'Still Valley', caption: 'Morning mist that never quite lifts.', palette: 'mist', seed: 21 },
  { title: 'Rose Ridge', caption: 'Five ridges, one long exhale.', palette: 'dawn', seed: 34 },
  { title: 'Blue Hour', caption: 'Pines going dark against the snow.', palette: 'alpine', seed: 55 },
];

// Every slide as an image URL; slides without one are painted after mount.
function useSlideImages(slides: Slide[]): string[] {
  const key = slides.map((s) => s.image || (s.palette || 'dawn') + ':' + (s.seed ?? 1)).join('|');
  const [painted, setPainted] = React.useState(() => slides.map(() => ''));
  React.useEffect(() => {
    setPainted(slides.map((s, i) => (s.image ? '' : paintLandscape(s.seed ?? i + 1, s.palette || 'dawn'))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return slides.map((s, i) => s.image || painted[i] || '');
}

const SERIF = "var(--font-accent, ui-serif), Georgia, 'Times New Roman', serif";
const SANS = 'var(--font-sans, ui-sans-serif), system-ui, sans-serif';

const PL_CSS = [
  '.pl-root{position:relative;width:100%;overflow:hidden;background:var(--pl-bg);color:var(--pl-ink);user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none;cursor:grab}',
  ".pl-root[data-drag='1']{cursor:grabbing}",
  '.pl-root:focus-visible{box-shadow:inset 0 0 0 3px var(--pl-ink)}',
  ".pl-root[data-scroll='1']{cursor:default}",
  // a print appears by dropping onto the string
  '.pl-hang{transition:opacity .6s ease,transform .8s cubic-bezier(.2,.8,.2,1)}',
  ".pl-card[data-shown='0'] .pl-hang{opacity:0;transform:translateY(-48px);pointer-events:none}",
  'a.pl-print{display:block;color:inherit;text-decoration:none;cursor:pointer;transition:transform .25s ease}',
  // photo zooms in on hover (pointer devices only) and eases back out
  '.pl-shot img{transform:scale(1);transition:transform .9s cubic-bezier(.2,.7,.2,1)}',
  '@media (hover:hover) and (pointer:fine){a.pl-print:hover .pl-shot img{transform:scale(1.09);transition-duration:.7s}}',
  'a.pl-print:focus-visible .pl-shot img{transform:scale(1.09)}',
  // touch: a light press, no hover needed
  'a.pl-print:active{transform:scale(.97)}',
  'a.pl-print:focus-visible{outline:3px solid var(--pl-ink);outline-offset:4px}',
  '.pl-string{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible}',
  // hidden until the first frame places it, so prints never flash stacked
  '.pl-card{position:absolute;left:0;top:0;width:var(--pl-cw);transform-origin:50% 0;will-change:transform;cursor:inherit;visibility:hidden}',
  // print = site card: off-white, large corners, even border around the photo
  ".pl-print{margin-top:10px;background:var(--card-bg,#f7f5f1);padding:var(--card-pad,8px) var(--card-pad,8px) 0;border-radius:var(--radius-card,30px);box-shadow:0 1px 2px rgba(0,0,0,.1),0 18px 30px -16px rgba(0,0,0,.35);transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s ease}",
  ".pl-card[data-on='0'] .pl-print{transform:scale(.9);filter:saturate(.7) brightness(.96)}",
  ".pl-shot{position:relative;aspect-ratio:1;overflow:hidden;background:#d9d5cc;border-radius:var(--radius-card-inner,22px);isolation:isolate}",
  '.pl-shot img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none}',
  `.pl-note{height:50px;display:flex;align-items:center;justify-content:center;padding:0 6px;font:italic 400 20px/1.1 ${SERIF};color:#2f2c28;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`,
  '.pl-peg{position:absolute;left:50%;top:0;width:10px;height:26px;margin-left:-5px;border-radius:2px;background:linear-gradient(90deg,#c9a67a,#e3c9a1 45%,#b8915f);box-shadow:0 2px 3px rgba(0,0,0,.25)}',
  ".pl-peg::after{content:'';position:absolute;left:4px;top:8px;width:2px;height:7px;background:rgba(80,60,30,.45);border-radius:1px}",
  '.pl-bar{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);bottom:clamp(20px,4vh,40px);display:flex;align-items:center;gap:clamp(12px,2vw,24px);cursor:default}',
  '.pl-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.15em}',
  '.pl-cap>*{display:block;animation:pl-in .55s cubic-bezier(.2,.8,.2,1) both}',
  `.pl-title{font:italic 400 clamp(26px,3vw,36px)/1.1 ${SERIF};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`,
  `.pl-sub{margin-top:4px;font:400 16px/1.4 ${SANS};color:var(--pl-muted)}`,
  '.pl-count{font:500 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;color:var(--pl-muted)}',
  '.pl-count b{color:var(--pl-ink);font-weight:500}',
  '.pl-btn{appearance:none;width:48px;height:48px;flex:none;border-radius:50%;border:1px solid var(--pl-line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:background .2s ease,color .2s ease}',
  '.pl-btn:hover{background:var(--pl-ink);color:var(--pl-bg)}',
  '.pl-btn:focus-visible{outline:2px solid var(--pl-ink);outline-offset:2px}',
  '.pl-link{flex:none}',
  '.pl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
  '@keyframes pl-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}',
  // phones: caption on its own row, then arrows and the link together; the counter is dropped
  '@media (max-width:760px){.pl-bar{flex-wrap:wrap;gap:10px}.pl-cap{flex-basis:100%}.pl-count{display:none}.pl-btn{width:44px;height:44px}.pl-link{margin-left:auto;min-height:48px;padding:3px 4px 3px 18px;gap:10px;font-size:15px}.pl-link .btn__arrow{width:40px;height:40px}}',
  '@media (prefers-reduced-motion:reduce){.pl-cap>*{animation:none}.pl-print,.pl-hang,.pl-shot img{transition:none}}',
].join('\n');

export default function PolaroidLineCarousel({
  slides = DEFAULT_SLIDES,
  height = '100svh',
  cardWidth = 300,
  sag = 46,
  swing = 1,
  autoplay = 4500,
  start = 0,
  string = '#8a7f72',
  background = 'var(--color-background, #efece6)',
  ink = 'var(--color-foreground, #161513)',
  muted,
  onChange,
  className,
  style,
  ariaLabel = 'Image carousel',
  itemLabel = 'print',
  scrollDriven = false,
  controls = true,
}: PolaroidLineCarouselProps) {
  const n = slides.length;
  const srcs = useSlideImages(slides);
  const first = clamp(start, 0, Math.max(0, n - 1));
  const [active, setActive] = React.useState(first);
  const [dragging, setDragging] = React.useState(false);
  const [size, setSize] = React.useState({ w: 1200, h: 800, cw: cardWidth });
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const pathRef = React.useRef(null as SVGPathElement | null);
  const cards = React.useRef([] as (HTMLDivElement | null)[]);
  const sim = React.useRef({ off: 0, vel: 0, target: 0, a: [] as number[], w: [] as number[] });
  const drag = React.useRef(null as null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean });
  const lastTouch = React.useRef(0);
  const activeRef = React.useRef(first);
  const held = React.useRef({ hover: false, focus: false });
  const opts = React.useRef({ sag, swing });
  opts.current = { sag, swing };

  const spacing = size.cw * 1.08;
  const goTo = React.useCallback(
    (i: number) => {
      sim.current.target = clamp(i, 0, n - 1) * spacing;
    },
    [n, spacing],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect();
      // scroll mode: on wide screens size the prints so all four fit with room
      // to travel; narrower screens get larger prints and pan through them
      const cw = scrollDriven
        ? Math.round(Math.max(170, Math.min(cardWidth, r.width >= 1000 ? r.width * 0.17 : r.width * 0.62, r.height * 0.55)))
        : Math.round(Math.max(150, Math.min(cardWidth, r.width * 0.42, r.height * 0.42)));
      setSize({ w: r.width, h: r.height, cw });
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [cardWidth, scrollDriven]);

  // keep the target on the active print when the spacing changes
  React.useEffect(() => {
    sim.current.target = activeRef.current * spacing;
    sim.current.off = activeRef.current * spacing;
  }, [spacing]);

  React.useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  // the simulation, written straight to the DOM each frame
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    let raf = 0;
    let prev = performance.now();
    let started = false;
    const S = sim.current;
    const px: number[] = [];
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const { w, h, cw } = size;
      const y0 = Math.max(40, h * 0.2);
      const o = opts.current;
      const g = reduce ? 0 : o.swing;
      if (scrollDriven) {
        const track = (root.closest('[data-pl-track]') as HTMLElement | null) ?? root;
        const tr = track.getBoundingClientRect();
        const total = Math.max(1, track.offsetHeight - window.innerHeight);
        // the movement finishes at 90% of the track, leaving a short hold
        const p = clamp(-tr.top / total / 0.9, 0, 1);
        // S.off holds the smoothed progress (0..1) in this mode
        if (!started) {
          S.off = p;
          started = true;
        }
        if (reduce) S.off = p;
        else [S.off, S.vel] = springStep(S.off, S.vel, p, dt, 140);
      }
      const d = drag.current;
      let lineVel: number;
      if (scrollDriven) {
        lineVel = 0;
      } else if (d && d.moved) {
        lineVel = d.v * 1000;
      } else {
        const before = S.off;
        [S.off, S.vel] = springStep(S.off, S.vel, S.target, dt);
        lineVel = -(S.off - before) / Math.max(dt, 1e-3);
      }
      // scroll mode layout; each print sets off a little after the one before it
      const gut = Math.max(16, Math.min(56, w * 0.04));
      const rowW = (n - 1) * spacing + cw;
      const slack = w - 2 * gut - rowW;
      // fits: start right-aligned, end left-aligned (all prints always in view);
      // too wide: start at the first print and pan to the last
      const startL = slack >= 0 ? w - gut - rowW : gut;
      const endL = slack >= 0 ? gut : w - gut - rowW;
      const stagger = n > 1 ? Math.min(0.12, 0.5 / (n - 1)) : 0;
      const span = 1 - (n - 1) * stagger;
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const near = scrollDriven ? -1 : nearestAt(S.off, spacing, n);
      for (let i = 0; i < n; i++) {
        const el = cards.current[i];
        if (!el) continue;
        let x: number;
        let vel = lineVel;
        if (scrollDriven) {
          const t = ease(clamp((S.off - i * stagger) / span, 0, 1));
          x = startL + (endL - startL) * t + cw / 2 + i * spacing;
          vel = px[i] === undefined ? 0 : (x - px[i]) / Math.max(dt, 1e-3);
          px[i] = x;
        } else {
          x = w / 2 + i * spacing - S.off;
        }
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';
        let a = S.a[i] || 0;
        let av = S.w[i] || 0;
        [a, av] = swingStep(a, av, vel, dt, g);
        if (g) a += Math.sin(now / 1300 + i * 1.7) * 0.0009 * g;
        S.a[i] = a;
        S.w[i] = av;
        const y = stringY(x, w, y0, o.sag) - 6;
        el.style.transform = 'translate(' + (x - cw / 2).toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(4) + 'rad)';
        el.style.zIndex = scrollDriven ? String(i + 1) : String(i === near ? n + 1 : n - Math.abs(i - near));
      }
      pathRef.current?.setAttribute('d', 'M0 ' + y0 + ' Q' + w / 2 + ' ' + (y0 + 2 * o.sag) + ' ' + w + ' ' + y0);
      if (!scrollDriven && near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size, spacing, n, scrollDriven]);

  // autoplay, back to the first print after the last; waits while someone is
  // pointing at or focused on the carousel, and is off for reduced motion
  React.useEffect(() => {
    if (!autoplay || n < 2 || scrollDriven) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || held.current.hover || held.current.focus) return;
      if (performance.now() - lastTouch.current < autoplay) return;
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1);
    }, autoplay);
    return () => window.clearInterval(t);
  }, [autoplay, n, goTo, scrollDriven]);

  const onDown = (e: React.PointerEvent) => {
    if (scrollDriven || (e.target as HTMLElement).closest('.pl-bar')) return;
    lastTouch.current = performance.now();
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      rootRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const max = (n - 1) * spacing;
    let off = d.off - dx;
    if (off < 0) off *= 0.35;
    if (off > max) off = max + (off - max) * 0.35;
    sim.current.off = off;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      sim.current.vel = -d.v * 1000;
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n));
      return;
    }
    const card = (e.target as HTMLElement).closest('[data-i]');
    if (card) goTo(Number(card.getAttribute('data-i')));
  };
  const step = (dir: number) => {
    lastTouch.current = performance.now();
    goTo(clamp(activeRef.current + dir, 0, n - 1));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else return;
    e.preventDefault();
  };

  // Keyboard: tabbing to a print that is off screen scrolls the page to it
  const revealOnFocus = (i: number) => {
    if (!scrollDriven) return;
    const el = cards.current[i];
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.left >= 0 && r.right <= window.innerWidth) return;
    }
    const root = rootRef.current;
    const track = (root?.closest('[data-pl-track]') as HTMLElement | null) ?? root;
    if (!track) return;
    const total = Math.max(1, track.offsetHeight - window.innerHeight);
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (n > 1 ? i / (n - 1) : 0) * 0.9 * total, behavior: 'auto' });
  };

  const s = slides[active] || {};

  return (
    <div
      ref={rootRef}
      className={['pl-root', className].filter(Boolean).join(' ')}
      style={{
        height,
        ['--pl-bg' as string]: background,
        ['--pl-ink' as string]: ink,
        ['--pl-muted' as string]: muted ?? 'color-mix(in srgb, var(--pl-ink) 55%, transparent)',
        ['--pl-line' as string]: 'color-mix(in srgb, var(--pl-ink) 18%, transparent)',
        ['--pl-cw' as string]: size.cw + 'px',
        ...style,
      }}
      data-drag={dragging ? '1' : '0'}
      data-scroll={scrollDriven ? '1' : '0'}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={scrollDriven ? undefined : 0}
      onKeyDown={scrollDriven ? undefined : onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') held.current.hover = true;
      }}
      onPointerLeave={() => (held.current.hover = false)}
      onFocus={() => (held.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) held.current.focus = false;
      }}
    >
      <style>{PL_CSS}</style>
      <svg className="pl-string" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke={string} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {slides.map((sl, i) => {
        const shot = (
          <div className="pl-shot">
            {srcs[i] ? (
              <img
                src={srcs[i]}
                alt={sl.href ? '' : sl.alt || sl.title || ''}
                draggable={false}
                loading="lazy"
                decoding="async"
                style={sl.focus ? { objectPosition: sl.focus } : undefined}
              />
            ) : null}
          </div>
        );
        return (
          <div
            key={i}
            className="pl-card"
            data-i={i}
            data-on={scrollDriven || i === active ? '1' : '0'}
            data-shown="1"
            ref={(el) => void (cards.current[i] = el)}
            aria-hidden={sl.href || i === active ? undefined : true}
          >
            <div className="pl-hang">
              {sl.href ? (
                <a
                  className="pl-print"
                  href={sl.href}
                  draggable={false}
                  aria-label={sl.linkLabel ?? sl.title}
                  onFocus={() => revealOnFocus(i)}
                >
                  {shot}
                  <div className="pl-note">{sl.title || ''}</div>
                </a>
              ) : (
                <div className="pl-print">
                  {shot}
                  <div className="pl-note">{sl.title || ''}</div>
                </div>
              )}
              <div className="pl-peg" />
            </div>
          </div>
        );
      })}
      {controls ? (
      <div className="pl-bar">
        <div className="pl-cap" key={active} aria-hidden="true">
          {s.title ? <span className="pl-title">{s.title}</span> : null}
          {s.caption ? <span className="pl-sub">{s.caption}</span> : null}
          {s.meta ? <span className="pl-sub">{s.meta}</span> : null}
        </div>
        <span className="pl-count" aria-hidden="true">
          <b>{pad2(active + 1)}</b> / {pad2(n)}
        </span>
        <button type="button" className="pl-btn" aria-label={`Previous ${itemLabel}`} onClick={() => step(-1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button type="button" className="pl-btn" aria-label={`Next ${itemLabel}`} onClick={() => step(1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        {s.href ? (
          <a className="pl-link btn" href={s.href}>
            {s.linkLabel ?? 'Explore ' + (s.title ?? '')}
            <span className="btn__arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        ) : null}
      </div>
      ) : null}
      {controls ? (
        <div className="pl-sr" aria-live="polite">
          {'Print ' + (active + 1) + ' of ' + n + (s.title ? ': ' + s.title : '')}
        </div>
      ) : null}
    </div>
  );
}
