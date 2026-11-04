#!/usr/bin/env node
/**
 * Syntaric site builder
 *
 * Reads blog/posts/*.md, assets/site.css and partials/*.html, then writes:
 *   - blog/<slug>/index.html  (one per post)
 *   - blog/index.html          (listing page)
 *   - sitemap.xml
 *   - the marker regions of index.html (css, nav, footer); everything
 *     outside the markers is hand-edited (decision #13)
 *
 * Run:   node blog/build.js            (or npm run build)
 * Check: node blog/build.js --check    builds in memory, compares every
 *        output with the file on disk, writes nothing, exits 1 on any
 *        difference or on any TODO-OWNER marker.
 * Option --root <dir> builds another checkout (used by the tests).
 */

const fs   = require('fs');
const path = require('path');
const { marked } = require('marked');
const { replaceRegions } = require('../tools/markers');

// ─── Paths ────────────────────────────────────────────────────────────────────

const ARGS      = process.argv.slice(2);
const CHECK     = ARGS.includes('--check');
const ROOT_ARG  = ARGS.indexOf('--root');
const ROOT      = ROOT_ARG >= 0 ? path.resolve(ARGS[ROOT_ARG + 1]) : path.resolve(__dirname, '..');
const BLOG_DIR  = path.join(ROOT, 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse YAML-ish frontmatter (simple key: value, no nested objects). */
function parseFrontmatter(src) {
  // Normalise line endings so the regex and line splitting both work regardless of OS
  src = src.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const match = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Missing or malformed frontmatter (expected --- ... ---)');

  const meta = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const key = m[1].trim();
    let   val = m[2].trim();

    // Arrays: "[a, b, c]" inline style
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    } else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    } else {
      val = val.replace(/^['"]|['"]$/g, ''); // strip optional surrounding quotes
    }
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

/** Turn a title into a URL-safe slug. */
function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Initials from a name, e.g. "Gasper Andrejc" → "GA". */
function initials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

/** Format a date string to "Month D, YYYY". */
function formatDate(str) {
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Estimate read time from markdown body. */
function readTime(md) {
  const words = md.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * Resolve a front matter image path (relative to the post page, e.g.
 * "../../blog/<slug>/cover.png") to its absolute URL on syntaric.com.
 * Fails the build if the file does not exist in the repo.
 */
function absoluteImageUrl(image, pageUrl) {
  const url  = new URL(image, pageUrl);
  const file = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!fs.existsSync(file)) {
    throw new Error(`Cover image not found: ${image} (expected ${path.relative(ROOT, file)})`);
  }
  return url.href;
}

/** Escape HTML for attribute/text use. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Custom marked renderer ────────────────────────────────────────────────────
// Adds id anchors to h2/h3 so the sidebar TOC can link to them.

const renderer = new marked.Renderer();

renderer.heading = function(text, level) {
  const id = slugify(text.replace(/<[^>]+>/g, ''));
  if (level === 2 || level === 3) {
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  }
  return `<h${level}>${text}</h${level}>\n`;
};

// Blockquotes become callout boxes (> text → <div class="callout">)
renderer.blockquote = function(quote) {
  return `<div class="callout">${quote}</div>\n`;
};

marked.use({ renderer });

// ─── TOC builder ──────────────────────────────────────────────────────────────

function buildToc(html) {
  const items = [];
  const re = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({ level: parseInt(m[1]), id: m[2], text: m[3].replace(/<[^>]+>/g, '') });
  }
  if (!items.length) return '';
  const lis = items.map(({ id, text }) => `<li><a href="#${id}">${esc(text)}</a></li>`).join('\n                        ');
  return `<ul class="toc-list">\n                        ${lis}\n                    </ul>`;
}

// ─── Shared design source ─────────────────────────────────────────────────────
// assets/site.css is split into blocks by its marker comments; partials are
// HTML fragments with {{placeholders}}. Both are read once per build.

function loadCss() {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'site.css'), 'utf8');
  const parts = {};
  let current = null;
  for (const line of src.split('\n')) {
    const m = line.match(/^\/\* @(shared|page (home|blog)) \*\/$/);
    if (m) { current = m[2] || 'shared'; parts[current] = []; continue; }
    if (current) parts[current].push(line);
  }
  for (const name of ['shared', 'home', 'blog']) {
    if (!parts[name]) throw new Error(`assets/site.css: missing block /* @${name === 'shared' ? 'shared' : 'page ' + name} */`);
    parts[name] = parts[name].join('\n').trim();
  }
  return parts;
}

function loadPartial(name) {
  return fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8').replace(/\s+$/, '');
}

/** Fill {{key}} placeholders; an unknown placeholder fails the build. */
function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (all, key) => {
    if (!(key in vars)) throw new Error(`Unfilled placeholder ${all}`);
    return vars[key];
  });
}

const CSS     = loadCss();
const NAV     = loadPartial('nav.html');
const FOOTER  = loadPartial('footer.html');

/** Nav and footer for blog pages: root-absolute links, Blog marked current. */
const BLOG_NAV    = fill(NAV, { root: '/', blogCurrent: ' aria-current="page"' });
const BLOG_FOOTER = fill(FOOTER, { root: '/' });
const BLOG_STYLE  = `<style>\n${CSS.shared}\n\n${CSS.blog}\n    </style>`;

/** Text-face preload and GoatCounter (decision #12), on every blog page. */
const FONT_AND_ANALYTICS = [
  '<link rel="preload" href="/assets/fonts/atkinson-hyperlegible-next.woff2" as="font" type="font/woff2" crossorigin>',
  '<script data-goatcounter="https://syntaric.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>',
].join('\n    ');

/** Adds `js` to <html> before first paint; CSS uses it for the mobile menu. */
const JS_CLASS_SCRIPT = `<script>document.documentElement.classList.add('js')</script>`;
// ─── Post page template ───────────────────────────────────────────────────────

function buildPostPage(meta, bodyHtml, toc) {
  const tags     = Array.isArray(meta.topics) ? meta.topics : (meta.topics ? [meta.topics] : []);
  const avatar   = initials(meta.author || 'Author');
  const date     = formatDate(meta.date || '');
  const isoDate  = meta.date || '';
  const time     = meta.readTime || readTime(bodyHtml);
  const crumb    = esc(meta.breadcrumb || meta.title);
  const desc     = esc(meta.description || meta.excerpt || '');
  const slug     = meta._slug || meta.slug || '';
  const canonUrl = `https://syntaric.com/blog/${slug}/`;
  const logoUrl  = 'https://syntaric.com/etc/syntaric_logo_2.png';
  const coverUrl = meta.image ? absoluteImageUrl(meta.image, canonUrl) : '';
  const imgUrl   = coverUrl || logoUrl;

  const tagsHtml = tags.map(t => `                        <span class="sidebar-tag">${esc(t)}</span>`).join('\n');
  const tocHtml  = toc || '';

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": meta.title,
    "description": meta.description || meta.excerpt || '',
    "datePublished": isoDate,
    "author": {
      "@type": "Person",
      "name": meta.author || '',
      "url": meta.authorLinkedIn || ''
    },
    "publisher": {
      "@type": "Organization",
      "name": "Syntaric",
      "@id": "https://syntaric.com/#organization",
      "logo": { "@type": "ImageObject", "url": logoUrl }
    },
    ...(coverUrl ? { "image": coverUrl } : {}),
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonUrl },
    "keywords": tags.join(', ')
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
${JS_CLASS_SCRIPT}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(meta.title)} | Syntaric</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="${meta.publish === false ? 'noindex, nofollow' : 'index, follow'}">
    <link rel="canonical" href="${canonUrl}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonUrl}">
    <meta property="og:title" content="${esc(meta.title)} | Syntaric">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:image:alt" content="${esc(meta.title)}">
    <meta property="og:site_name" content="Syntaric">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:author" content="${esc(meta.author || '')}">
    ${tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="${coverUrl ? 'summary_large_image' : 'summary'}">
    <meta name="twitter:title" content="${esc(meta.title)} | Syntaric">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- JSON-LD: Article -->
    <script type="application/ld+json">${jsonLd}</script>

    <link rel="icon" type="image/png" href="../../favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
    <link rel="shortcut icon" href="../../favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="../../apple-touch-icon.png" />
    ${FONT_AND_ANALYTICS}
    ${BLOG_STYLE}
</head>
<body>

${BLOG_NAV}

    <!-- ─── ARTICLE HERO ─── -->
    <section class="article-hero">
        <div class="container">
            <div class="article-hero-inner animate">
                <div class="breadcrumb">
                    <a href="../../">Home</a>
                    <span class="breadcrumb-sep">/</span>
                    <a href="../">Blog</a>
                    <span class="breadcrumb-sep">/</span>
                    <span class="breadcrumb-current">${crumb}</span>
                </div>
                <span class="article-tag">${esc(meta.tag || 'Article')}</span>
                <h1>${esc(meta.title)}</h1>
                <div class="article-hero-meta">
                    <div class="article-meta-author">
                        <div class="article-meta-avatar">${avatar}</div>
                        <div>
                            <div class="article-meta-name">${esc(meta.author || '')}</div>
                            <div class="article-meta-role">${esc(meta.authorRole || '')}</div>
                            ${meta.authorAssumingRole ? `<div class="article-meta-role"><strong>Written as:</strong> ${esc(meta.authorAssumingRole)}</div>` : ''}
                        </div>
                    </div>
                    <span class="article-meta-sep"></span>
                    <span class="article-meta-date">${esc(date)}</span>
                    <span class="article-meta-sep"></span>
                    <span class="article-meta-read">${esc(time)}</span>
                </div>
            </div>
        </div>
    </section>

    <!-- ─── ARTICLE CONTENT ─── -->
    <div class="container">
        <div class="article-layout">
            <article class="article-body animate">
${meta.image ? `<img src="${esc(meta.image)}" alt="${esc(meta.title)}" class="article-cover">` : ''}
${bodyHtml}
            </article>

            <aside class="article-sidebar">
${tocHtml ? `                <div class="sidebar-card">
                    <div class="sidebar-card-title">Table of contents</div>
                    ${tocHtml}
                </div>` : ''}

                <div class="sidebar-card">
                    <div class="sidebar-card-title">Author</div>
                    <div class="sidebar-author-name">${esc(meta.author || '')}</div>
                    <div class="sidebar-author-role">${esc(meta.authorBio || '')}</div>
                    ${meta.authorLinkedIn ? `<a href="${esc(meta.authorLinkedIn)}" target="_blank" class="sidebar-author-link">
                        LinkedIn profile
                        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>` : ''}
                </div>

${tagsHtml ? `                <div class="sidebar-card">
                    <div class="sidebar-card-title">Topics</div>
                    <div class="sidebar-tags">
${tagsHtml}
                    </div>
                </div>` : ''}

                <div class="sidebar-card">
                    <div class="sidebar-card-title">Share</div>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonUrl)}" target="_blank" rel="noopener" class="share-linkedin">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.354V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.284zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        Share on LinkedIn
                    </a>
                </div>
            </aside>
        </div>
    </div>

${BLOG_FOOTER}

</body>
</html>`;
}

// ─── Blog index template ──────────────────────────────────────────────────────

// Icon pool — cycled per post so cards look varied
const ICONS = [
  `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  `<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
];

function postCardFeatured(post, icon) {
  const date    = formatDate(post.meta.date || '');
  const time    = post.meta.readTime || readTime(post.body);
  const avatar  = initials(post.meta.author || 'A');
  return `
                <!-- Featured post -->
                <a href="${post.slug}/" class="post-card--featured animate">
                    <div class="post-visual"${post.meta.image ? ` style="background-image:url('${esc(post.meta.image)}');background-size:cover;background-position:center;"` : ''}>
                        ${post.meta.image ? '' : `<div class="post-visual-icon">${icon}</div>`}
                    </div>
                    <div class="post-body">
                        <span class="post-tag">${esc(post.meta.tag || 'Article')}</span>
                        <h2 class="post-title">${esc(post.meta.title)}</h2>
                        <p class="post-excerpt">${esc(post.meta.excerpt || post.meta.description || '')}</p>
                        <div class="post-meta">
                            <div class="post-meta-author">
                                <div class="post-meta-avatar">${avatar}</div>
                                ${esc(post.meta.author || '')}
                            </div>
                            <span class="post-meta-sep"></span>
                            <span>${esc(date)}</span>
                            <span class="post-meta-sep"></span>
                            <span>${esc(time)}</span>
                        </div>
                        <span class="post-read-more">
                            Read article
                            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </span>
                    </div>
                </a>`;
}

function postCardRegular(post, icon) {
  const date   = formatDate(post.meta.date || '');
  const time   = post.meta.readTime || readTime(post.body);
  const avatar = initials(post.meta.author || 'A');
  return `
                <a href="${post.slug}/" class="post-card animate">
                    <div class="post-visual-sm"${post.meta.image ? ` style="background-image:url('${esc(post.meta.image)}');background-size:cover;background-position:center;"` : ''}>
                        ${post.meta.image ? '' : `<div class="post-visual-sm-icon">${icon}</div>`}
                    </div>
                    <div class="post-body">
                        <span class="post-tag">${esc(post.meta.tag || 'Article')}</span>
                        <h2 class="post-title">${esc(post.meta.title)}</h2>
                        <p class="post-excerpt">${esc(post.meta.excerpt || post.meta.description || '')}</p>
                        <div class="post-meta">
                            <div class="post-meta-author">
                                <div class="post-meta-avatar">${avatar}</div>
                                ${esc(post.meta.author || '')}
                            </div>
                            <span class="post-meta-sep"></span>
                            <span>${esc(date)}</span>
                            <span class="post-meta-sep"></span>
                            <span>${esc(time)}</span>
                        </div>
                        <span class="post-read-more">
                            Read article
                            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </span>
                    </div>
                </a>`;
}

function buildIndexPage(posts) {
  const cards = posts.map((post, i) => {
    const icon = ICONS[i % ICONS.length];
    return i === 0 ? postCardFeatured(post, icon) : postCardRegular(post, icon);
  }).join('\n');

  const blogDesc = 'Deep dives into FHIR, openEHR, IHE, and the architecture decisions shaping modern health information exchange — by Gasper Andrejc, Syntaric.';

  const blogJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Syntaric Blog",
    "url": "https://syntaric.com/blog/",
    "description": blogDesc,
    "publisher": {
      "@type": "Organization",
      "name": "Syntaric",
      "@id": "https://syntaric.com/#organization"
    },
    "blogPost": posts.map(p => ({
      "@type": "BlogPosting",
      "headline": p.meta.title,
      "url": `https://syntaric.com/blog/${p.slug}/`,
      "datePublished": p.meta.date || '',
      "author": { "@type": "Person", "name": p.meta.author || '' }
    }))
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${JS_CLASS_SCRIPT}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | Syntaric</title>
    <meta name="description" content="${blogDesc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://syntaric.com/blog/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://syntaric.com/blog/">
    <meta property="og:title" content="Blog | Syntaric">
    <meta property="og:description" content="${blogDesc}">
    <meta property="og:image" content="https://syntaric.com/etc/syntaric_logo_2.png">
    <meta property="og:site_name" content="Syntaric">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Blog | Syntaric">
    <meta name="twitter:description" content="${blogDesc}">
    <meta name="twitter:image" content="https://syntaric.com/etc/syntaric_logo_2.png">

    <!-- JSON-LD: Blog -->
    <script type="application/ld+json">${blogJsonLd}</script>

    <link rel="icon" type="image/png" href="../favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
    <link rel="shortcut icon" href="../favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png" />
    <link rel="manifest" href="../site.webmanifest" />
    ${FONT_AND_ANALYTICS}
    ${BLOG_STYLE}
</head>
<body>

${BLOG_NAV}

    <!-- ─── HERO ─── -->
    <section class="blog-hero">
        <div class="container">
            <div class="blog-hero-label animate">
                <span class="blog-hero-dot"></span>
                Insights &amp; Research
            </div>
            <h1 class="animate delay-1">Thoughts on healthcare interoperability</h1>
            <p class="blog-hero-desc animate delay-2">Deep dives into FHIR, openEHR, IHE, and the architecture decisions shaping modern health information exchange.</p>
        </div>
    </section>

    <!-- ─── POSTS ─── -->
    <section class="blog-posts">
        <div class="container">
            <div class="posts-grid">
${cards}
            </div>
        </div>
    </section>

${BLOG_FOOTER}

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/** Newest of front matter `updated` / `date`; a published post needs one. */
function lastModified(meta, slug) {
  const value = meta.updated || meta.date;
  if (!value) throw new Error(`Post "${slug}" has neither "updated" nor "date" in its front matter`);
  return value;
}

/** Files scanned for TODO-OWNER besides the build outputs. */
function todoScanExtras() {
  const files = [path.join(ROOT, 'index.html')];
  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) files.push(p);
    }
  };
  walk(path.join(ROOT, 'preview'));
  return files;
}

function main() {
  const outputs = new Map(); // absolute path -> content
  const log = msg => { if (!CHECK) console.log(msg); };

  const mdFiles = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // newest first (relies on YYYY-MM-DD prefix in filename)

  if (!mdFiles.length) {
    console.log('No .md files found in blog/posts/. Nothing to build.');
    return;
  }

  const posts = [];

  for (const file of mdFiles) {
    const src  = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(src);

    // Slug: use frontmatter `slug` field, or derive from filename (strip date prefix + .md)
    const slug = meta.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    meta._slug = slug;

    const bodyHtml = marked.parse(body);
    const toc      = buildToc(bodyHtml);

    outputs.set(path.join(BLOG_DIR, slug, 'index.html'), buildPostPage(meta, bodyHtml, toc));

    const published = meta.publish !== false;
    posts.push({ meta, body, slug, published });
    log(`  ✓ blog/${slug}/index.html${published ? '' : '  (draft — not listed)'}`);
  }

  // Blog index (published only)
  const publishedPosts = posts.filter(p => p.published);
  outputs.set(path.join(BLOG_DIR, 'index.html'), buildIndexPage(publishedPosts));
  log(`  ✓ blog/index.html  (${publishedPosts.length} post${publishedPosts.length !== 1 ? 's' : ''})`);

  // sitemap.xml (published only). Dates come from front matter, never the
  // clock, so --check gives the same answer on any day. "/" has no lastmod.
  const postDates = publishedPosts.map(p => lastModified(p.meta, p.slug));
  const blogDate  = postDates.slice().sort().pop();
  const postUrls = publishedPosts.map((p, i) => `
  <url>
    <loc>https://syntaric.com/blog/${p.slug}/</loc>
    <lastmod>${postDates[i]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://syntaric.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://syntaric.com/blog/</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${postUrls}
</urlset>`;
  outputs.set(path.join(ROOT, 'sitemap.xml'), sitemap);
  log(`  ✓ sitemap.xml  (${publishedPosts.length + 2} URLs)`);

  // index.html: rewrite marker regions only.
  const indexPath = path.join(ROOT, 'index.html');
  const homeHtml = replaceRegions(fs.readFileSync(indexPath, 'utf8'), {
    css:    `\n    <style>\n${CSS.shared}\n\n${CSS.home}\n    </style>\n    `,
    nav:    `\n${fill(NAV, { root: '', blogCurrent: '' })}\n`,
    footer: `\n${fill(FOOTER, { root: '' })}\n`,
  });
  outputs.set(indexPath, homeHtml);
  log('  ✓ index.html  (marker regions: css, nav, footer)');

  // TODO-OWNER rule: no published file may carry the marker.
  const todo = [];
  for (const [file, content] of outputs) if (content.includes('TODO-OWNER')) todo.push(file);
  for (const file of todoScanExtras()) {
    if (!outputs.has(file) && fs.readFileSync(file, 'utf8').includes('TODO-OWNER')) todo.push(file);
  }

  if (CHECK) {
    const differ = [];
    for (const [file, content] of outputs) {
      const onDisk = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      if (onDisk !== content) differ.push(file);
    }
    for (const f of differ) console.log(`differs from build: ${path.relative(ROOT, f)}`);
    for (const f of todo)   console.log(`contains TODO-OWNER: ${path.relative(ROOT, f)}`);
    if (differ.length || todo.length) {
      console.log('\nbuild --check failed. Run `npm run build` (edit outside marker regions only) and resolve every TODO-OWNER.');
      process.exit(1);
    }
    console.log(`build --check: ${outputs.size} outputs match`);
    return;
  }

  for (const [file, content] of outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) fs.writeFileSync(file, content, 'utf8');
  }
  for (const f of todo) console.log(`  ! contains TODO-OWNER: ${path.relative(ROOT, f)}`);
  console.log('\nDone.');
}

main();
