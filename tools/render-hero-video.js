#!/usr/bin/env node
/**
 * Prototype B (redesign item 47): render the hero motion frame by frame and
 * encode it as a muted, looping H.264 MP4, without a headless browser.
 *
 *   node tools/render-hero-video.js        (needs ffmpeg with libx264 on PATH)
 *
 * The choreography is the one motion.js plays with the design tokens
 * (--dur-short 200 ms, --dur-long 900 ms, --ease cubic-bezier(0.2, 0, 0, 1)):
 * the FHIR strand draws over 900 ms, the openEHR strand starts 200 ms later,
 * the labels slide in from 540 ms. The clip then holds the finished frame so
 * the loop reads as a pause. Writes, per layout (wide 1440 x 640, narrow
 * 780 x 540):
 *   assets/video/hero-<layout>.mp4
 *   assets/video/hero-<layout>-poster.png   (the finished frame, t = 1)
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const strands = require('./strands');
const { cleanSnapshot } = require('./data-rules');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'video');
const FPS = 30;
const SHORT = 200, LONG = 900, CLIP = 5000;          // ms
const GROUND = '#f6f3ee';
const MONO_TTF = path.join(ROOT, 'tools', 'fonts', 'atkinson-hyperlegible-mono.ttf');
const LIMIT = 1.5 * 1024 * 1024;

/** cubic-bezier(0.2, 0, 0, 1) as a function of time fraction x. */
function ease(x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const p1 = [0.2, 0], p2 = [0, 1];
  const bx = t => 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t ** 3;
  const by = t => 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (bx(mid) < x) lo = mid; else hi = mid; }
  return by((lo + hi) / 2);
}

const progress = (ms, delay) => ease((ms - delay) / LONG);

function frameAt(ms) {
  const l = progress(ms, LONG * 0.6);
  return { a: progress(ms, 0), b: progress(ms, SHORT), labelOpacity: l, labelDx: -12 * (1 - l) };
}

/** The wide hero sits behind the text: the same light navy tint as the page's CSS gives the inline SVG. */
function tint(layout, svg) {
  return layout === 'wide' ? svg.replace(/class="strand" fill="#122e49"/g, 'class="strand" fill="#9ba4ac"') : svg;
}

function render(svg, width) {
  // the SVG carries a font-family list; resvg is given the mono TTF directly
  svg = svg.replace(/font-family="[^"]*"/g, 'font-family="Atkinson Hyperlegible Mono"')
    .replace(/<svg ([^>]*)>/, `<svg $1><rect width="100%" height="100%" fill="${GROUND}"/>`);
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width },
    font: { fontFiles: [MONO_TTF], loadSystemFonts: false, defaultFontFamily: 'Atkinson Hyperlegible Mono' } });
  return r.render().asPng();
}

function main() {
  if (!fs.existsSync(MONO_TTF)) throw new Error(`Missing ${path.relative(ROOT, MONO_TTF)} (TTF copy of the mono face for resvg)`);
  const snapshot = cleanSnapshot(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'snapshot.json'), 'utf8'))).snapshot;
  fs.mkdirSync(OUT, { recursive: true });
  for (const [layout, width] of [['wide', 1440], ['narrow', 780]]) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `hero-${layout}-`));
    const frames = Math.round((CLIP / 1000) * FPS);
    for (let i = 0; i < frames; i++) {
      const svg = tint(layout, strands.hero(snapshot, { layout, frame: frameAt((i * 1000) / FPS) }));
      fs.writeFileSync(path.join(tmp, `f${String(i).padStart(4, '0')}.png`), render(svg, width));
    }
    const mp4 = path.join(OUT, `hero-${layout}.mp4`);
    const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
      '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { encoding: 'utf8' });
    if (ff.status !== 0) throw new Error(`ffmpeg failed: ${ff.stderr}`);
    fs.writeFileSync(path.join(OUT, `hero-${layout}-poster.png`), render(tint(layout, strands.hero(snapshot, { layout })), width));
    fs.rmSync(tmp, { recursive: true, force: true });
    const size = fs.statSync(mp4).size;
    console.log(`  ✓ assets/video/hero-${layout}.mp4  ${(size / 1024).toFixed(0)} KB, ${frames} frames`);
    if (size > LIMIT) throw new Error(`hero-${layout}.mp4 is over the 1.5 MB budget (#15)`);
  }
}

main();
