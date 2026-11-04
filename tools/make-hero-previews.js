#!/usr/bin/env node
/**
 * The two hero prototypes for the 1.4 gate (redesign item 49), as unlisted
 * copies of the built home page:  npm run build && node tools/make-hero-previews.js
 *
 *   preview/<slug>/a.html   Prototype A: SVG motion (assets/motion.js)
 *   preview/<slug>/b.html   Prototype B: full-bleed strand video (tools/render-hero-video.js)
 *
 * Same rules as the 0.5a mockups: noindex, not in the sitemap, not linked.
 * Deleted at the gate (commit 1.4), together with this script.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SLUG = 'k7h2q9xw4m3tz8';
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const JS_ONLY = "<script>document.documentElement.classList.add('js')</script>";
// E8: paint the start state from first paint; fall back to the finished
// figure if motion.js has not started after 3 s.
const MOTION_HEAD = "<script>(function(h){h.classList.add('js');var m=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,s=navigator.connection&&navigator.connection.saveData;if(!m&&!s){h.classList.add('motion-ok');setTimeout(function(){if(!h.hasAttribute('data-motion-started'))h.classList.remove('motion-ok')},3000)}})(document.documentElement)</script>";

function base(html, title) {
  if (!html.includes(JS_ONLY)) throw new Error('index.html: the js-class script was not found');
  return html
    .replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, nofollow">')
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n    <base href="/">');
}

function prototypeA() {
  return base(home, 'Hero prototype A: SVG motion')
    .replace(JS_ONLY, MOTION_HEAD)
    .replace('</body>', '    <script type="module" src="/assets/motion.js"></script>\n</body>');
}

function prototypeB() {
  // Full-bleed: the video is the hero's background from 960 px, and a
  // full-width band below the text on phones. The static figure is hidden.
  const video = (layout, w, h) =>
    `<video class="hero-bg hero-bg--${layout}" muted playsinline loop preload="none" width="${w}" height="${h}" ` +
    `poster="/assets/video/hero-field-${layout}-poster.png" data-src="/assets/video/hero-field-${layout}.mp4" aria-hidden="true"></video>`;
  const style = `<style>
        .hero { position: relative; overflow: hidden; }
        .hero-art { display: none; }
        .hero-bg { display: block; width: 100%; height: auto; }
        .hero-bg--wide { display: none; }
        .hero-bg--narrow { margin-top: 24px; }
        .hero-pause { margin-top: 12px; min-width: 24px; min-height: 36px; padding: 6px 12px; font: inherit; font-size: 0.9375rem; color: #122e49; background: rgba(246,243,238,0.85); border: 1px solid #bdc2c5; border-radius: 4px; cursor: pointer; }
        .hero-pause[aria-pressed="true"] { background: #ece9e3; }
        @media (min-width: 960px) {
            .hero { aspect-ratio: 1920 / 854; padding: 0; display: flex; align-items: center; }
            .hero > .wrap { position: relative; z-index: 1; width: 100%; }
            .hero-bg--wide { display: block; position: absolute; inset: 0; height: 100%; object-fit: cover; z-index: 0; }
            .hero-bg--narrow { display: none; }
            .hero-pause { grid-area: 3 / 1; justify-self: start; }
        }
    </style>`;
  const script = `<script>
        (function () {
            var button = document.querySelector('.hero-pause');
            var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var saveData = navigator.connection && navigator.connection.saveData;
            if (reduce || saveData) { button.hidden = true; return; }   // the poster stays
            window.addEventListener('load', function () {
                var wide = window.matchMedia('(min-width: 960px)').matches;
                var video = document.querySelector(wide ? '.hero-bg--wide' : '.hero-bg--narrow');
                video.src = video.dataset.src;
                video.play();
                button.addEventListener('click', function () {
                    var paused = button.getAttribute('aria-pressed') === 'true';
                    if (paused) video.play(); else video.pause();
                    button.setAttribute('aria-pressed', paused ? 'false' : 'true');
                });
            });
        })();
    </script>`;
  const out = base(home, 'Hero prototype B: full-bleed video')
    .replace('<section class="hero">', `<section class="hero">\n            ${video('wide', 1920, 854)}`)
    .replace('</figcaption>\n                </figure>', '</figcaption>\n                    <button class="hero-pause" type="button" aria-pressed="false">Pause animation</button>\n                </figure>\n                ' + video('narrow', 780, 584))
    .replace('</head>', `    ${style}\n</head>`)
    .replace('</body>', `    ${script}\n</body>`);
  if (!out.includes('hero-bg--wide') || !out.includes('hero-bg--narrow') || !out.includes('hero-pause')) throw new Error('prototype B: markup anchors not found');
  return out;
}

const dir = path.join(ROOT, 'preview', SLUG);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'a.html'), prototypeA());
fs.writeFileSync(path.join(dir, 'b.html'), prototypeB());
console.log(`  ✓ preview/${SLUG}/a.html  (SVG motion)\n  ✓ preview/${SLUG}/b.html  (full-bleed video)`);
