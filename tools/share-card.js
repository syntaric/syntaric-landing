/**
 * Share cards (redesign item 51): a 1200 x 627 PNG per page for LinkedIn and
 * other link previews. Layout values: docs/design-tokens.md, "Share card".
 *
 *   renderCard({ title, kicker }) -> PNG Buffer
 *
 * resvg cannot read WOFF2, so the text faces come from tools/fonts/*.ttf.
 * Output is deterministic for a given input and resvg version, so the build
 * can compare bytes and leave unchanged cards untouched.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { cardArt } = require('./strands');

const W = 1200, H = 627;
const GROUND = '#f6f3ee', INK = '#122e49', INK3 = '#56697a';
const FONTS = ['atkinson-hyperlegible-next.ttf', 'atkinson-hyperlegible-next-bold.ttf', 'atkinson-hyperlegible-mono.ttf']
  .map(f => path.join(__dirname, 'fonts', f));

const LAYOUT = {
  margin: 72,
  logo: { y: 64, height: 56, word: 34 },
  title: { size: 50, lineHeight: 60, firstBaseline: 270, maxWidth: 620, maxLines: 3 },
  kicker: { size: 22, baseline: 566 },
};
// Average advance of Atkinson Hyperlegible Next Bold over the site's titles (em).
const TITLE_ADVANCE = 0.4968;
const DEFAULT_KICKER = 'Healthcare interoperability consultancy';

const feather = (() => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'assets', 'brand', 'syntaric.svg'), 'utf8');
  const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const paths = [...svg.matchAll(/<path [^>]*d="([^"]+)"/g)].map(m => m[1]);
  return { vx, vy, vw, vh, paths };
})();

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Break a title into at most `maxLines` lines by average character width; ellipsis after the last. */
function breakTitle(title, { size, maxWidth, maxLines } = LAYOUT.title) {
  const perLine = Math.floor(maxWidth / (TITLE_ADVANCE * size));
  const words = String(title).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (next.length <= perLine || !line) { line = next; continue; }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) {
      // out of room: end the last line with an ellipsis
      let last = lines[maxLines - 1];
      while (last.length + 1 > perLine && last.includes(' ')) last = last.slice(0, last.lastIndexOf(' '));
      lines[maxLines - 1] = last.replace(/[\s,;:—–-]+$/, '') + '…';
      return lines;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function cardSvg({ title, kicker = DEFAULT_KICKER }) {
  const { margin, logo, title: t, kicker: k } = LAYOUT;
  const s = logo.height / feather.vh;
  const logoW = feather.vw * s;
  const lines = breakTitle(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${GROUND}"/>` +
    cardArt() +
    `<g transform="translate(${margin} ${logo.y}) scale(${s.toFixed(5)}) translate(${-feather.vx} ${-feather.vy})">` +
    feather.paths.map(d => `<path fill="${INK}" d="${d}"/>`).join('') + '</g>' +
    `<text x="${(margin + logoW + 14).toFixed(1)}" y="${logo.y + logo.height * 0.72}" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="${logo.word}" fill="${INK}">Syntaric</text>` +
    lines.map((l, i) => `<text x="${margin}" y="${t.firstBaseline + i * t.lineHeight}" font-family="Atkinson Hyperlegible Next" font-weight="700" font-size="${t.size}" fill="${INK}">${esc(l)}</text>`).join('') +
    `<text x="${margin}" y="${k.baseline}" font-family="Atkinson Hyperlegible Mono" font-size="${k.size}" fill="${INK3}">${esc(kicker)}</text>` +
    '</svg>';
}

function renderCard(card) {
  const r = new Resvg(cardSvg(card), {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Atkinson Hyperlegible Next' },
  });
  return Buffer.from(r.render().asPng());
}

module.exports = { renderCard, breakTitle, cardSvg, WIDTH: W, HEIGHT: H, LAYOUT };
