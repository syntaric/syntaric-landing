#!/usr/bin/env node
/**
 * Prototype B (redesign item 47, revised 2026-11-04): the full-bleed hero
 * video. Renders the swaying strand field of tools/strands.js heroField()
 * frame by frame and encodes a muted, seamless 8 s H.264 loop per layout,
 * without a headless browser.
 *
 *   node tools/render-hero-video.js        (needs ffmpeg with libx264 on PATH)
 *
 * Writes:
 *   assets/video/hero-field-wide.mp4      1920 x 854, behind the hero from 960 px
 *   assets/video/hero-field-narrow.mp4    780 x 584, a band below the text on phones
 * The still frame (phase 0) is not an image: the build inlines it as SVG.
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
const LOOP = 8000;   // ms; heroField motion is periodic over one loop
const GROUND = '#f6f3ee';
const TEXT_TTF = path.join(ROOT, 'tools', 'fonts', 'atkinson-hyperlegible-next.ttf');
const LIMIT = 1.5 * 1024 * 1024;   // #15: hero video budget

function render(svg, width) {
  // the SVG carries a font-family list; resvg is given the text face's TTF directly
  svg = svg.replace(/font-family="[^"]*"/g, 'font-family="Atkinson Hyperlegible Next"')
    .replace(/<svg ([^>]*)>/, `<svg $1><rect width="100%" height="100%" fill="${GROUND}"/>`);
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width },
    font: { fontFiles: [TEXT_TTF], loadSystemFonts: false, defaultFontFamily: 'Atkinson Hyperlegible Next' } });
  return r.render().asPng();
}

function main() {
  if (!fs.existsSync(TEXT_TTF)) throw new Error(`Missing ${path.relative(ROOT, TEXT_TTF)} (TTF copy of the text face for resvg)`);
  const snapshot = cleanSnapshot(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'snapshot.json'), 'utf8'))).snapshot;
  fs.mkdirSync(OUT, { recursive: true });
  for (const [layout, width] of [['wide', 1920], ['narrow', 780]]) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `field-${layout}-`));
    const frames = Math.round((LOOP / 1000) * FPS);
    for (let i = 0; i < frames; i++) {
      const svg = strands.heroField(snapshot, { layout, phase: i / frames });
      fs.writeFileSync(path.join(tmp, `f${String(i).padStart(4, '0')}.png`), render(svg, width));
    }
    const mp4 = path.join(OUT, `hero-field-${layout}.mp4`);
    const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.png'),
      '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { encoding: 'utf8' });
    if (ff.status !== 0) throw new Error(`ffmpeg failed: ${ff.stderr}`);
    fs.rmSync(tmp, { recursive: true, force: true });
    const size = fs.statSync(mp4).size;
    console.log(`  ✓ assets/video/hero-field-${layout}.mp4  ${(size / 1024).toFixed(0)} KB, ${frames} frames`);
    if (size > LIMIT) throw new Error(`hero-field-${layout}.mp4 is over the 1.5 MB budget (#15)`);
  }
}

main();
