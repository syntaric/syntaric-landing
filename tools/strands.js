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

const INK = '#122e49';
const FIRE = ['#c32a30', '#df5c34', '#fe933a'];
const UNIO = { navy: '#0c2842', teal: '#11888a', deep: '#1a6372', hair: '#dbdbda' };
const MONO = "'Atkinson Hyperlegible Mono', 'Atkinson Mono Fallback', monospace";
const MONO_ADVANCE = 0.632; // em, Atkinson Hyperlegible Mono (OS/2 xAvgCharWidth)

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
function outline(from, to, { width, profile = PROFILE, notch = false, bow = BLADE.bow, t = 1, steps = 24 }) {
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
  const ring = left.concat(right.slice().reverse());
  const d = `M${fmt(left[0])}${smooth(left)}L${fmt(right[right.length - 1])}${smooth(right.slice().reverse())}Z`;
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

/** Box of a mono label at (x, y) baseline; anchor 'start' or 'end'. */
function labelBox(x, y, text, size, anchor = 'start') {
  const w = text.length * MONO_ADVANCE * size;
  return { x: anchor === 'end' ? x - w : x, y: y - size, width: w, height: size * 1.25 };
}

function label(x, y, text, size, { anchor = 'start', fill = INK, cls = 'fig-label' } = {}) {
  return `<text class="${cls}" x="${r1(x)}" y="${r1(y)}" font-family="${MONO}" font-size="${size}" fill="${fill}"${anchor === 'end' ? ' text-anchor="end"' : ''}>${esc(text)}</text>`;
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
 * Hero: two strands carrying a FHIR path and the matching openEHR path,
 * ending aligned. layout 'wide' (from 960 px, behind the text, clear of
 * `textZone`) or 'narrow' (phones, below the text).
 */
function hero(snapshot, { textZone, t = 1, layout = 'wide', frame } = {}) {
  // `frame` (video renderer): per-strand progress and the labels' state;
  // the same choreography motion.js plays (docs/strand-rules.md).
  const f = frame || { a: t, b: t, labelOpacity: 1, labelDx: 0 };
  const pair = mappingPairs(snapshot)[0];
  const L = layout === 'wide'
    ? { w: 1440, h: 640, zone: textZone || { x: 0, y: 0, width: 760, height: 640 }, size: 22, small: 16,
        a: [[820, 150], [1400, 300]], b: [[860, 540], [1400, 300]], la: [820, 118], lb: [860, 590], arch: [860, 616], width: 46 }
    : { w: 390, h: 270, zone: textZone || null, size: 13, small: 10.5,
        a: [[16, 58], [374, 122]], b: [[16, 196], [374, 122]], la: [16, 36], lb: [16, 236], arch: [16, 256], width: 26 };
  const off = L.width * (1 + GAP) / 2;
  const n = perp(norm(sub(L.a[1], L.a[0])));
  // the two strands end side by side: aligned, one GAP apart
  const aEnd = add(L.a[1], mul([0, -1], off)); const bEnd = add(L.b[1], mul([0, 1], off));
  const sa = outline(L.a[0], aEnd, { width: L.width, t: f.a });
  const sb = outline(L.b[0], bEnd, { width: L.width, t: f.b });
  const labels = [
    { x: L.la[0], y: L.la[1], text: pair.fhir, size: L.size },
    { x: L.lb[0], y: L.lb[1], text: pair.openehr, size: L.size },
    { x: L.arch[0], y: L.arch[1], text: pair.archetype, size: L.small, fill: '#56697a' },
  ];
  if (L.zone) {
    for (const [name, s] of [['FHIR strand', sa], ['openEHR strand', sb]]) {
      if (polygonHitsRect(s.polygon, L.zone)) throw new Error(`hero: the ${name} enters the text zone`);
    }
    for (const l of labels) {
      if (rectsOverlap(labelBox(l.x, l.y, l.text, l.size), L.zone)) throw new Error(`hero: label "${l.text}" enters the text zone`);
    }
  }
  void n;
  // Draw motion: each strand is masked by a stroked copy of its centre line
  // (pathLength 1). Without motion the stroke is solid, so the mask shows the
  // whole strand; motion.js animates stroke-dashoffset from 1 to 0.
  const masks = [['a', sa], ['b', sb]].map(([k, s]) =>
    `<mask id="hero-${layout}-${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="${L.w}" height="${L.h}">` +
    `<path class="draw-axis" d="${s.axis}" fill="none" stroke="#fff" stroke-width="${r1(L.width * 1.3)}" pathLength="1"/></mask>`).join('');
  const body =
    `<g class="fig-strands" data-motion="draw" data-motion-start="load">` +
    `<path class="strand" fill="${INK}" mask="url(#hero-${layout}-a)" d="${sa.d}"/>` +
    `<path class="strand" fill="${INK}" mask="url(#hero-${layout}-b)" d="${sb.d}"/></g>` +
    `<g class="fig-labels" data-motion="align" data-motion-start="load"` +
    (frame ? ` opacity="${r1(f.labelOpacity * 100) / 100}" transform="translate(${r1(f.labelDx)} 0)"` : '') + '>' +
    labels.map(l => label(l.x, l.y, l.text, l.size, { fill: l.fill })).join('') + '</g>';
  return svgRoot(`fig fig-hero fig-hero--${layout}`, L.w, L.h, body, masks);
}

/** openFHIR: the mapping pairs, each FHIR path joined to its openEHR path by a fire strand. */
function openfhirFigure(snapshot, { t = 1 } = {}) {
  const pairs = mappingPairs(snapshot);
  const W = 360, top = 44, row = 66, H = top + row * pairs.length + 6;
  const defs = `<linearGradient id="fire" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${FIRE[0]}"/><stop offset=".55" stop-color="${FIRE[1]}"/><stop offset="1" stop-color="${FIRE[2]}"/></linearGradient>`;
  let body = label(0, 12, 'FHIR R4 · ' + pairs[0].fhir.split('.')[0], 10, { fill: '#56697a', cls: 'fig-head' }) +
    label(W, 28, pairs[0].archetype, 10, { anchor: 'end', fill: '#56697a', cls: 'fig-head' });
  body += '<g class="fig-strands" data-motion="draw" data-motion-start="view">';
  pairs.forEach((p, i) => {
    const y = top + i * row;
    body += `<path class="strand" fill="url(#fire)" d="${outline([10, y + 17], [W - 10, y + 43], { width: 13, t }).d}"/>`;
  });
  body += '</g><g class="fig-labels">';
  pairs.forEach((p, i) => {
    const y = top + i * row;
    body += label(0, y + 12, p.fhir, 11) + label(W, y + 56, p.openehr, 11, { anchor: 'end' });
  });
  body += '</g>';
  return svgRoot('fig fig-openfhir', W, H, body, defs);
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

/** Divider: a hairline strand with a mono margin note. */
function divider(note) {
  const W = 1200, H = 28;
  const body = `<path class="strand" fill="#bdc2c5" d="${outline([0, 20], [880, 12], { width: 4, bow: 0.01 }).d}"/>` +
    label(W, 18, note, 12, { anchor: 'end', fill: '#56697a' });
  return svgRoot('fig fig-divider', W, H, body);
}

/** Share-card art: two navy strands for the right part of a 1200x627 card. */
function cardArt() {
  return `<g class="card-art">${bundle(2, [720, 560], [1160, 110], { width: 120 }).join('')}</g>`;
}

module.exports = {
  PROFILE, BLADE, GAP, NOTCH,
  strand, bundle, outline, hero, openfhirFigure, unioFigure, divider, cardArt,
  polygonHitsRect, labelBox,
};
