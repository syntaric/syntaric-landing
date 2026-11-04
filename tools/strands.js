/**
 * Strand construction rules and figures (redesign item 42).
 *
 * Every strand is a filled, tapered shape built from the measured geometry
 * of the Syntaric feather (assets/brand/syntaric.svg; measurements and
 * method in docs/strand-rules.md). Pure functions; they return SVG strings
 * and are deterministic, so the build can compare output byte for byte.
 *
 * No parameter exists for blur, glow, gradients other than the openFHIR fire
 * gradient, or particles (brief 2.1).
 */

'use strict';

// ─── Measured rules (docs/strand-rules.md) ────────────────────────────────────

/** Width along a strand: 1-D cubic Bezier control values, peak 1 at s = 0.57. */
const PROFILE = [0, 0.926, 1.687, 0];
/** Blade proportions: maximum width / chord, and the S-bend of the centre line / chord. */
const BLADE = { width: 0.331, bow: 0.07 };
/** Channel between two strands of a bundle / maximum strand width. */
const GAP = 0.178;
/** Notch: a smooth pocket in the outer edge at the measured position, sized relative to the maximum width. */
const NOTCH = { mouth: 0.604, depth: 0.442, at: 0.52 };
/**
 * Hook: the feather's notch as it is drawn, a wedge cut into the outer edge
 * that leaves a pointed tip overhanging it, pointing back toward the start.
 * Measured on the upper blade (docs/strand-rules.md): the tip sits on the
 * edge at 0.46 of the chord; the crescent-shaped wedge opens 0.45 of the
 * maximum width before it (where the blade's concave edge begins) and runs
 * under it to its deepest point 0.18 of the width after
 * it, 0.29 of the width inside the edge. Sizes scale with the width, not the
 * length, so a long strand gets the feather's hook, not a stretched one.
 */
const HOOK = { tip: 0.46, back: 0.45, ahead: 0.18, depth: 0.29 };

const INK = '#122e49';
const FIRE = ['#c32a30', '#df5c34', '#fe933a'];
const UNIO = { navy: '#0c2842', teal: '#11888a', deep: '#1a6372', hair: '#dbdbda' };
const MONO = "'Atkinson Hyperlegible Mono', 'Atkinson Mono Fallback', monospace";
const MONO_ADVANCE = 0.632; // em, Atkinson Hyperlegible Mono (OS/2 xAvgCharWidth)
const TEXT = "'Atkinson Hyperlegible Next', 'Atkinson Next Fallback', sans-serif";
// em, Atkinson Hyperlegible Next 400: the hero labels measure 0.41-0.46; rounded up so
// the text-zone test errs on the safe side
const TEXT_ADVANCE = 0.48;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

const r1 = v => Math.round(v * 10) / 10;
const fmt = p => `${r1(p[0])},${r1(p[1])}`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = a => Math.hypot(a[0], a[1]);
const norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const perp = a => [-a[1], a[0]];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bezier1(c, t) {
  const u = 1 - t;
  return u * u * u * c[0] + 3 * u * u * t * c[1] + 3 * u * t * t * c[2] + t * t * t * c[3];
}

function bezier2(c, t) {
  const u = 1 - t;
  return [0, 1].map(i => u * u * u * c[0][i] + 3 * u * u * t * c[1][i] + 3 * u * t * t * c[2][i] + t * t * t * c[3][i]);
}

function bezier2d(c, t) {
  const u = 1 - t;
  return [0, 1].map(i => 3 * u * u * (c[1][i] - c[0][i]) + 6 * u * t * (c[2][i] - c[1][i]) + 3 * t * t * (c[3][i] - c[2][i]));
}

/** Centre line: an S-shaped cubic from `from` to `to`, bowed by BLADE.bow of the chord. */
function centreLine(from, to, bow = BLADE.bow) {
  const d = sub(to, from); const L = len(d); const n = perp(norm(d));
  return [from, add(add(from, mul(d, 1 / 3)), mul(n, bow * L)), add(add(from, mul(d, 2 / 3)), mul(n, -bow * L)), to];
}

/** Catmull-Rom through points, as cubic Bezier path commands (no initial M). */
function smooth(points) {
  let d = '';
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(i + 2, points.length - 1)];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6)), c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += `C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return d;
}

/**
 * Outline of one strand as a closed path, plus its sampled polygon (for the
 * text-zone test). `t` (0-1) draws only the first part of the strand: the
 * frame at motion progress t. The taper is always that of the full strand.
 */
function outline(from, to, { width, profile = PROFILE, notch = false, hook = null, bow = BLADE.bow, t = 1, steps = 24 }) {
  const c = centreLine(from, to, bow);
  const L = len(sub(to, from));
  const end = Math.max(0, Math.min(1, t));
  const left = [], right = [];
  // sample on a fixed grid over the whole strand, so a partly drawn frame has
  // exactly the outline of the finished strand up to its cut
  const grid = [];
  for (let i = 0; i <= steps; i++) { const s = i / steps; if (s < end) grid.push(s); }
  grid.push(end);
  for (const s of grid) {
    const p = bezier2(c, s); const n = perp(norm(bezier2d(c, s)));
    let hl = (width / 2) * bezier1(profile, s); const hr = hl;
    if (notch) {
      // cosine-shaped pocket, never thinner than 15 % of the maximum half width
      const half = (NOTCH.mouth * width) / L / 2; const x = (s - NOTCH.at) / half;
      if (Math.abs(x) < 1) hl = Math.max(0.15 * width / 2, hl - NOTCH.depth * width * 0.5 * (1 + Math.cos(Math.PI * x)));
    }
    left.push(add(p, mul(n, hl))); right.push(add(p, mul(n, -hr)));
  }
  // hook ('left' or 'right' edge): replace the edge between the mouth and the
  // tip by the wedge, with sharp corners at its deepest point and at the tip
  let leftD = smooth(left), rightRevD = smooth(right.slice().reverse());
  let ring = left.concat(right.slice().reverse());
  if (hook && end >= 0.6) {
    const side = hook === 'left' ? 1 : -1;
    const at = s => { const p = bezier2(c, s); const n = perp(norm(bezier2d(c, s))); return { p, n, h: (width / 2) * bezier1(profile, s) }; };
    const L = len(sub(to, from));
    const sm = HOOK.tip - (HOOK.back * width) / L, sd = HOOK.tip + (HOOK.ahead * width) / L;
    const mouth = at(sm), tip = at(HOOK.tip), deep = at(sd);
    const M = add(mouth.p, mul(mouth.n, side * mouth.h));
    const T = add(tip.p, mul(tip.n, side * tip.h));
    const D = add(deep.p, mul(deep.n, side * (deep.h - HOOK.depth * width)));
    // crescent: the lower lip sags into the blade, the hook's underside
    // curves back to its tip
    const lip = add(mul(add(M, D), 0.5), mul(mouth.n, side * -0.10 * width));
    const under = add(mul(add(D, T), 0.5), add(mul(deep.n, side * 0.04 * width), mul(norm(sub(M, D)), 0.10 * width)));
    const edge = side === 1 ? left : right;
    const before = edge.filter((_, i) => grid[i] <= sm).concat([M]);
    const after = [T].concat(edge.filter((_, i) => grid[i] > HOOK.tip));
    if (side === 1) {
      leftD = smooth(before) + `Q${fmt(lip)} ${fmt(D)}Q${fmt(under)} ${fmt(T)}` + smooth(after);
      ring = before.concat([lip, D, under], after).concat(right.slice().reverse());
    } else {
      rightRevD = smooth(after.slice().reverse()) + `Q${fmt(under)} ${fmt(D)}Q${fmt(lip)} ${fmt(M)}` + smooth(before.slice().reverse());
      ring = left.concat(after.slice().reverse(), [under, D, lip], before.slice().reverse());
    }
  }
  const first = left[0];
  const d = `M${fmt(first)}${leftD}L${fmt(right[right.length - 1])}${rightRevD}Z`;
  const axis = `M${fmt(c[0])}C${fmt(c[1])} ${fmt(c[2])} ${fmt(c[3])}`;
  return { d, polygon: ring, axis };
}

/** One strand as an SVG <path>. */
function strand(from, to, opts = {}) {
  const width = opts.width ?? BLADE.width * len(sub(to, from));
  const { d } = outline(from, to, { ...opts, width });
  return `<path class="strand" fill="${opts.fill || INK}" d="${d}"/>`;
}

/** `count` parallel strands, offset so the channel at the widest point is GAP of the width. */
function bundle(count, from, to, opts = {}) {
  const width = opts.width ?? BLADE.width * len(sub(to, from));
  const gap = opts.gap ?? GAP;
  const n = perp(norm(sub(to, from)));
  const step = width * (1 + gap);
  const out = [];
  for (let k = 0; k < count; k++) {
    const off = mul(n, (k - (count - 1) / 2) * step);
    out.push(strand(add(from, off), add(to, off), { ...opts, width }));
  }
  return out;
}

// ─── Text-zone test ───────────────────────────────────────────────────────────

function pointInRect(p, r) {
  return p[0] >= r.x && p[0] <= r.x + r.width && p[1] >= r.y && p[1] <= r.y + r.height;
}

function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** True if a polygon (dense samples of a strand outline) touches a rectangle. */
function polygonHitsRect(poly, r) {
  if (poly.some(p => pointInRect(p, r))) return true;
  const corners = [[r.x, r.y], [r.x + r.width, r.y], [r.x, r.y + r.height], [r.x + r.width, r.y + r.height]];
  return corners.some(c => pointInPolygon(c, poly));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Box of a label at (x, y) baseline; anchor 'start' or 'end'; face 'mono' or 'text'. */
function labelBox(x, y, text, size, anchor = 'start', face = 'mono') {
  const w = text.length * (face === 'text' ? TEXT_ADVANCE : MONO_ADVANCE) * size;
  return { x: anchor === 'end' ? x - w : x, y: y - size, width: w, height: size * 1.25 };
}

function label(x, y, text, size, { anchor = 'start', fill = INK, cls = 'fig-label', face = 'mono' } = {}) {
  return `<text class="${cls}" x="${r1(x)}" y="${r1(y)}" font-family="${face === 'text' ? TEXT : MONO}" font-size="${size}" fill="${fill}"${anchor === 'end' ? ' text-anchor="end"' : ''}>${esc(text)}</text>`;
}

function svgRoot(cls, w, h, body, defs = '') {
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">` +
    (defs ? `<defs>${defs}</defs>` : '') + body + '</svg>';
}

// ─── Data access ──────────────────────────────────────────────────────────────

function mappingPairs(snapshot) {
  const { expandPaths } = require('./data-rules');
  const e = snapshot.entries['allergy-mapping'];
  if (!e) throw new Error('snapshot: entry "allergy-mapping" is missing');
  return e.values.map(v => expandPaths(v, e.header));
}

// ─── Figures (layouts: docs/strand-rules.md, approved at the 1.4 and 1.5 gates) ─

/**
 * Full-bleed hero field (Prototype B): the scene behind the whole hero, for a
 * looping video. `phase` (0-1) is the position in the loop; motion is a
 * gentle sway of every strand, periodic, so frame 0 follows the last frame.
 *
 * Labels are plain words in the text face (plain-language pass, decision P2),
 * from the written "hero-labels" entry of the snapshot.
 *
 * Layers, back to front: a wide two-strand bundle in an 8 % navy tint that may
 * pass behind the text (under the 1.2:1 text-zone limit); a 20 % bundle and
 * the two data strands, which stay out of the text zone in every frame.
 * layout 'wide': 1920 x 854, the text zone is the left 1080 units (the text
 * column's share of the viewport at 1280-1920 px). layout 'narrow': a
 * 780 x 584 band below the text on phones, no text zone.
 */
function heroField(snapshot, { layout = 'wide', phase = 0, textZone, hooks = true } = {}) {
  const e = snapshot.entries['hero-labels'];
  if (!e) throw new Error('snapshot: entry "hero-labels" is missing');
  const words = e.values;
  const TAU = Math.PI * 2;
  const wave = (amp, offset) => amp * Math.sin(TAU * phase + offset);
  const L = layout === 'wide'
    ? { w: 1920, h: 854, zone: textZone || { x: 0, y: 0, width: 1080, height: 854 },
        back: { from: [-120, 760], to: [2040, 90], width: 170, amp: 46, fill: '#e4e3e1' },
        mid: { from: [1180, 900], to: [2010, 300], width: 72, amp: 30, fill: '#c9cdd0' },
        data: { a: [[1160, 250], [1860, 470]], b: [[1190, 700], [1860, 470]], width: 52, amp: 9, fill: '#56697a' },
        la: [1160, 212], lb: [1190, 760], arch: [1190, 792], size: 26, small: 19 }
    : { w: 780, h: 584, zone: textZone || null,
        back: { from: [-80, 560], to: [860, 40], width: 110, amp: 30, fill: '#e4e3e1' },
        mid: { from: [320, 640], to: [820, 330], width: 44, amp: 20, fill: '#c9cdd0' },
        data: { a: [[24, 120], [756, 262]], b: [[24, 430], [756, 262]], width: 40, amp: 5, fill: INK },
        la: [24, 84], lb: [24, 494], arch: [24, 530], size: 30, small: 22 };
  const sway = (p, amp, off) => [p[0], p[1] + wave(amp, off)];
  const shapes = [];
  const bundleOf = (spec, off) => {
    const step = spec.width * (1 + GAP);
    const n = perp(norm(sub(spec.to, spec.from)));
    return [-0.5, 0.5].map(k => outline(add(sway(spec.from, spec.amp, off), mul(n, k * step)),
      add(sway(spec.to, spec.amp, off + 1.3), mul(n, k * step)),
      { width: spec.width, bow: BLADE.bow + 0.03 * Math.sin(TAU * phase + off + 0.7) }));
  };
  const back = bundleOf(L.back, 0);
  const mid = bundleOf(L.mid, 2.1);
  const off = L.data.width * (1 + GAP) / 2;
  const da = outline(sway(L.data.a[0], L.data.amp, 4.2), sway(add(L.data.a[1], [0, -off]), L.data.amp, 5.5),
    { width: L.data.width, bow: BLADE.bow + 0.02 * Math.sin(TAU * phase + 4.9), hook: hooks ? 'right' : null });
  const db = outline(sway(L.data.b[0], L.data.amp, 4.6), sway(add(L.data.b[1], [0, off]), L.data.amp, 5.5),
    { width: L.data.width, bow: BLADE.bow + 0.02 * Math.sin(TAU * phase + 5.3), hook: hooks ? 'left' : null });
  const labels = [
    { x: L.la[0], y: L.la[1], text: words.upper, size: L.size },
    { x: L.lb[0], y: L.lb[1], text: words.lower, size: L.size },
    // full ink: on the wide layout the note sits on the 20 % bundle
    { x: L.arch[0], y: L.arch[1], text: words.note, size: L.small },
  ];
  if (L.zone) {
    for (const [name, s] of [['middle bundle', mid[0]], ['middle bundle', mid[1]], ['upper data strand', da], ['lower data strand', db]]) {
      if (polygonHitsRect(s.polygon, L.zone)) throw new Error(`heroField: the ${name} enters the text zone (phase ${phase})`);
    }
    for (const l of labels) {
      if (rectsOverlap(labelBox(l.x, l.y, l.text, l.size, 'start', 'text'), L.zone)) throw new Error(`heroField: label "${l.text}" enters the text zone`);
    }
  }
  for (const s of back) shapes.push(`<path class="strand" fill="${L.back.fill}" d="${s.d}"/>`);
  for (const s of mid) shapes.push(`<path class="strand" fill="${L.mid.fill}" d="${s.d}"/>`);
  shapes.push(`<path class="strand" fill="${L.data.fill}" d="${da.d}"/>`, `<path class="strand" fill="${L.data.fill}" d="${db.d}"/>`);
  const body = shapes.join('') + labels.map(l => label(l.x, l.y, l.text, l.size, { fill: l.fill, face: 'text' })).join('');
  return svgRoot(`fig fig-field fig-field--${layout}`, L.w, L.h, body);
}

/** openFHIR: the mapping pairs, each FHIR path joined to its openEHR path by a fire strand. */
function openfhirFigure(snapshot, { t = 1, hooks = true } = {}) {
  const pairs = mappingPairs(snapshot);
  const W = 360, top = 44, row = 66, H = top + row * pairs.length + 6;
  const defs = `<linearGradient id="fire" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${FIRE[0]}"/><stop offset=".55" stop-color="${FIRE[1]}"/><stop offset="1" stop-color="${FIRE[2]}"/></linearGradient>`;
  let body = label(0, 12, 'FHIR R4 · ' + pairs[0].fhir.split('.')[0], 10, { fill: '#56697a', cls: 'fig-head' }) +
    label(W, 28, pairs[0].archetype, 10, { anchor: 'end', fill: '#56697a', cls: 'fig-head' });
  // Draw motion (commit 1.6): each strand is masked by a stroked copy of its
  // centre line (pathLength 1). Without motion the stroke is solid, so the
  // mask shows the whole strand; motion.js animates stroke-dashoffset 1 -> 0.
  let masks = '';
  body += '<g class="fig-strands" data-motion="draw" data-motion-start="view">';
  pairs.forEach((p, i) => {
    const y = top + i * row;
    const o = outline([10, y + 17], [W - 10, y + 43], { width: 13, t, hook: hooks ? 'right' : null });
    masks += `<mask id="ofhir-draw-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` +
      `<path class="draw-axis" d="${o.axis}" fill="none" stroke="#fff" stroke-width="20" pathLength="1"/></mask>`;
    body += `<path class="strand" fill="url(#fire)" mask="url(#ofhir-draw-${i})" d="${o.d}"/>`;
  });
  body += '</g><g class="fig-labels">';
  pairs.forEach((p, i) => {
    const y = top + i * row;
    body += label(0, y + 12, p.fhir, 11) + label(W, y + 56, p.openehr, 11, { anchor: 'end' });
  });
  body += '</g>';
  return svgRoot('fig fig-openfhir', W, H, body, defs + masks);
}

/** Unio: one query fanning out to three repositories, one unreachable, the result partial. */
function unioFigure(snapshot, { t = 1 } = {}) {
  const e = snapshot.entries['unio-federation'];
  if (!e) throw new Error('snapshot: entry "unio-federation" is missing');
  const v = e.values;
  const W = 360, H = 290, origin = [14, 150];
  const ends = [[300, 66], [300, 150], [300, 234]];
  const fills = [UNIO.navy, UNIO.teal, UNIO.deep];
  let body = label(0, 18, v.query, 11) + '<g class="fig-strands" data-motion="fanout" data-motion-start="view">';
  v.repositories.forEach((r, i) => {
    const down = r.status === 'unreachable';
    body += `<path class="strand${down ? ' strand--down' : ''}" fill="${down ? UNIO.hair : fills[i]}" d="${outline(origin, ends[i], { width: 18, t }).d}"/>`;
  });
  body += '</g><g class="fig-labels">';
  v.repositories.forEach((r, i) => {
    const down = r.status === 'unreachable';
    body += label(W, ends[i][1] - 16, r.label, 11, { anchor: 'end' }) +
      label(W, ends[i][1] + 22, r.status, 10, { anchor: 'end', fill: down ? '#56697a' : INK });
  });
  body += label(0, H - 8, v.result, 11) + '</g>';
  return svgRoot('fig fig-unio', W, H, body);
}

/** Divider: a hairline strand (its margin note went in the plain-language pass, P1). */
function divider() {
  const W = 1200, H = 28;
  const body = `<path class="strand" fill="#bdc2c5" d="${outline([0, 20], [880, 12], { width: 4, bow: 0.01 }).d}"/>`;
  return svgRoot('fig fig-divider', W, H, body);
}

/**
 * Share-card art (1.7 review): the hero field's look on a 1200 x 627 card,
 * without labels. A faint bundle across the card (it may pass behind the
 * title), a light bundle and the two data strands on the right, clear of the
 * title area (x < 680), in light navy tints.
 */
function cardArt() {
  const out = [];
  const pair = (from, to, width, fill) => {
    const n = perp(norm(sub(to, from))); const step = width * (1 + GAP);
    for (const k of [-0.5, 0.5]) {
      out.push(`<path class="strand" fill="${fill}" d="${outline(add(from, mul(n, k * step)), add(to, mul(n, k * step)), { width }).d}"/>`);
    }
  };
  pair([-80, 640], [1280, 40], 120, '#e4e3e1');
  pair([800, 720], [1280, 250], 54, '#c9cdd0');
  const off = 40 * (1 + GAP) / 2;
  out.push(`<path class="strand" fill="#9ba4ac" d="${outline([730, 170], [1150, 330 - off], { width: 40, hook: 'right' }).d}"/>`);
  out.push(`<path class="strand" fill="#9ba4ac" d="${outline([750, 500], [1150, 330 + off], { width: 40, hook: 'left' }).d}"/>`);
  return `<g class="card-art">${out.join('')}</g>`;
}

module.exports = {
  PROFILE, BLADE, GAP, NOTCH, HOOK,
  strand, bundle, outline, heroField, openfhirFigure, unioFigure, divider, cardArt,
  polygonHitsRect, labelBox,
};
