#!/usr/bin/env node
/**
 * Render the site icons from assets/brand/syntaric.svg (redesign item 35).
 * Run by hand when the logo changes:  node tools/icons.js
 *
 * - favicon.svg                      the vector feather; light fill in dark mode
 * - favicon-96x96.png                transparent
 * - apple-touch-icon.png (180)       feather on the ground colour
 * - web-app-manifest-192/512 (maskable) feather inside the 80 % safe circle
 * - assets/brand/syntaric-512.png    transparent, for JSON-LD logos
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const GROUND = '#f6f3ee';
const src = fs.readFileSync(path.join(ROOT, 'assets', 'brand', 'syntaric.svg'), 'utf8');

const viewBox = src.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const paths = [...src.matchAll(/<path [^>]*d="([^"]+)"/g)].map(m => m[1]);
const [vx, vy, vw, vh] = viewBox;

/** A square SVG with the feather centred, filling `scale` of the side. */
function square(size, scale, background) {
  const s = (size * scale) / Math.max(vw, vh);
  const tx = (size - vw * s) / 2 - vx * s;
  const ty = (size - vh * s) / 2 - vy * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '') +
    `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${s.toFixed(5)})">` +
    paths.map(d => `<path fill="#122e49" d="${d}"/>`).join('') + '</g></svg>';
}

function png(svg) {
  return new Resvg(svg, { background: 'rgba(0,0,0,0)' }).render().asPng();
}

function write(rel, data) {
  const file = path.join(ROOT, rel);
  const old = fs.existsSync(file) ? fs.readFileSync(file) : null;
  if (old && Buffer.compare(old, Buffer.from(data)) === 0) return console.log(`  = ${rel}`);
  fs.writeFileSync(file, data);
  console.log(`  ✓ ${rel}`);
}

// A maskable icon is cropped to a circle of 80 % of its side; a feather of
// height h and width w fits when hypot(w, h) <= 0.8. The scale below keeps it
// at 0.72 of that circle's diameter.
const maskableScale = 0.72 * 0.8 * Math.max(vw, vh) / Math.hypot(vw, vh);

write('favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}">` +
  '<style>path{fill:#122e49}@media (prefers-color-scheme:dark){path{fill:#f6f3ee}}</style>' +
  paths.map(d => `<path d="${d}"/>`).join('') + '</svg>\n');
write('favicon-96x96.png', png(square(96, 0.92)));
write('apple-touch-icon.png', png(square(180, 0.66, GROUND)));
write('web-app-manifest-192x192.png', png(square(192, maskableScale, GROUND)));
write('web-app-manifest-512x512.png', png(square(512, maskableScale, GROUND)));
write('assets/brand/syntaric-512.png', png(square(512, 0.9)));
