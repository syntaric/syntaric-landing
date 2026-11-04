#!/usr/bin/env node
/**
 * The two hero prototypes for the 1.4 gate (redesign item 49), as unlisted
 * copies of the built home page:  npm run build && node tools/make-hero-previews.js
 *
 *   preview/<slug>/a.html   Prototype A: SVG motion (assets/motion.js)
 *   preview/<slug>/b.html   Prototype B: the rendered MP4 (tools/render-hero-video.js)
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
  const region = home.match(/<!-- @hero-figure -->[\s\S]*?<!-- \/@hero-figure -->/);
  if (!region) throw new Error('index.html: hero-figure region not found');
  const video = (layout, w, h) =>
    `<video class="hero-video fig-hero--${layout}" muted playsinline loop preload="none" width="${w}" height="${h}" ` +
    `poster="/assets/video/hero-${layout}-poster.png" data-src="/assets/video/hero-${layout}.mp4" aria-hidden="true"></video>`;
  const figure = `<!-- @hero-figure -->\n                    ${video('wide', 1440, 640)}\n                    ${video('narrow', 780, 540)}\n                    <!-- /@hero-figure -->`;
  const style = `<style>
        .hero-art video { display: block; width: 100%; height: auto; }
        .hero-pause { margin-top: 12px; min-width: 24px; min-height: 36px; padding: 6px 12px; font: inherit; font-size: 0.9375rem; color: #122e49; background: transparent; border: 1px solid #bdc2c5; border-radius: 4px; cursor: pointer; }
        .hero-pause[aria-pressed="true"] { background: #ece9e3; }
        @media (min-width: 960px) {
            .hero-art video { position: absolute; inset: 0; height: 100%; object-fit: contain; }
            .hero-pause { grid-area: 3 / 1; justify-self: start; }
        }
    </style>`;
  const script = `<script>
        (function () {
            var videos = [].slice.call(document.querySelectorAll('.hero-video'));
            var button = document.querySelector('.hero-pause');
            var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var saveData = navigator.connection && navigator.connection.saveData;
            if (reduce || saveData) { button.hidden = true; return; }   // the poster stays
            window.addEventListener('load', function () {
                var wide = window.matchMedia('(min-width: 960px)').matches;
                var video = videos.filter(function (v) { return v.classList.contains(wide ? 'fig-hero--wide' : 'fig-hero--narrow'); })[0];
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
  return base(home, 'Hero prototype B: video')
    .replace(region[0], figure)
    .replace('</figcaption>\n                </figure>', '</figcaption>\n                    <button class="hero-pause" type="button" aria-pressed="false">Pause animation</button>\n                </figure>')
    .replace('</head>', `    ${style}\n</head>`)
    .replace('</body>', `    ${script}\n</body>`);
}

const dir = path.join(ROOT, 'preview', SLUG);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'a.html'), prototypeA());
fs.writeFileSync(path.join(dir, 'b.html'), prototypeB());
console.log(`  ✓ preview/${SLUG}/a.html  (SVG motion)\n  ✓ preview/${SLUG}/b.html  (video)`);
