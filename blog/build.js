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
const { imageSize } = require('../tools/image-size');
const { cleanSnapshot, textSize } = require('../tools/data-rules');
const strands = require('../tools/strands');
const { renderCard } = require('../tools/share-card');

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

/**
 * Root-absolute path and pixel size of a front matter image, for <img>
 * tags on any page. Covers keep their original format (decision E5).
 */
function coverImage(image, pageUrl) {
  const url = new URL(absoluteImageUrl(image, pageUrl));
  const { width, height } = imageSize(path.join(ROOT, decodeURIComponent(url.pathname)));
  return { src: url.pathname, width, height };
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

// Inline images: width/height from the file (no layout shift), lazy loading.
// The page URL of the post being rendered resolves relative paths.
let currentPageUrl = null;

renderer.image = function(href, title, text) {
  let size = '';
  try {
    const url = new URL(href, currentPageUrl);
    const file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (url.origin === 'https://syntaric.com' && fs.existsSync(file)) {
      const { width, height } = imageSize(file);
      size = ` width="${width}" height="${height}"`;
    }
  } catch { /* unknown format or URL: no size attributes */ }
  return `<img src="${href}" alt="${text}"${title ? ` title="${title}"` : ''}${size} loading="lazy" decoding="async">`;
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
  const lis = items.map(({ id, text }) => `<li><a href="#${id}">${text}</a></li>`).join('\n                        ');
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
const POST_CONTACT = loadPartial('post-contact.html');

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

function buildPostPage(meta, bodyHtml, toc, markdownBody) {
  const tags     = Array.isArray(meta.topics) ? meta.topics : (meta.topics ? [meta.topics] : []);
  const date     = formatDate(meta.date || '');
  const isoDate  = meta.date || '';
  const time     = meta.readTime || readTime(markdownBody);
  const crumb    = esc(meta.breadcrumb || meta.title);
  const desc     = esc(meta.description || meta.excerpt || '');
  const slug     = meta._slug || meta.slug || '';
  const canonUrl = `https://syntaric.com/blog/${slug}/`;
  const logoUrl  = 'https://syntaric.com/assets/brand/syntaric-512.png';
  const coverUrl = meta.image ? absoluteImageUrl(meta.image, canonUrl) : '';
  // share card (commit 1.7): published posts get their own; drafts use the home card
  const imgUrl   = meta.publish === false ? 'https://syntaric.com/assets/share/home.png' : `${canonUrl}share.png`;
  void coverUrl;
  const cover    = meta.image ? coverImage(meta.image, canonUrl) : null;

  const tagsHtml = tags.map(t => `                        <li>${esc(t)}</li>`).join('\n');
  const tocHtml  = toc || '';

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": meta.title,
    "description": meta.description || meta.excerpt || '',
    "datePublished": isoDate,
    "dateModified": meta.updated || isoDate,
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
    "image": imgUrl,
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
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="627">
    <meta property="og:image:alt" content="${esc(meta.title)}">
    <meta property="og:site_name" content="Syntaric">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:author" content="${esc(meta.author || '')}">
    ${tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
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

    <main>
    <!-- ─── ARTICLE HEADER ─── -->
    <section class="article-hero">
        <div class="container">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="/">Home</a>
                <span aria-hidden="true">/</span>
                <a href="/blog/">Blog</a>
                <span aria-hidden="true">/</span>
                <span class="breadcrumb-current">${crumb}</span>
            </nav>
            <p class="label">${esc(meta.tag || 'Article')}</p>
            <h1>${esc(meta.title)}</h1>
            <p class="article-meta">
                <span class="article-meta-name">${esc(meta.author || '')}</span>
                ${meta.authorRole ? `<span>${esc(meta.authorRole)}</span>` : ''}
                ${meta.authorAssumingRole ? `<span>Written as ${esc(meta.authorAssumingRole)}</span>` : ''}
                <span>${esc(date)}</span>
                <span>${esc(time)}</span>
            </p>
        </div>
    </section>

    <!-- ─── ARTICLE ─── -->
    <div class="container">
        <div class="article-layout">
            <article class="article-body">
${cover ? `<img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${esc(meta.title)}" class="article-cover">` : ''}
${bodyHtml}
${POST_CONTACT}
            </article>

            <aside class="article-sidebar">
${tocHtml ? `                <div class="sidebar-section">
                    <p class="label sidebar-title">Contents</p>
                    ${tocHtml}
                </div>` : ''}

                <div class="sidebar-section">
                    <p class="label sidebar-title">Author</p>
                    <p class="sidebar-author-name">${esc(meta.author || '')}</p>
                    <p class="sidebar-author-role">${esc(meta.authorBio || '')}</p>
                    ${meta.authorLinkedIn ? `<a href="${esc(meta.authorLinkedIn)}" target="_blank" rel="noopener" class="text-link">LinkedIn profile</a>` : ''}
                </div>

${tagsHtml ? `                <div class="sidebar-section">
                    <p class="label sidebar-title">Topics</p>
                    <ul class="sidebar-tags">
${tagsHtml}
                    </ul>
                </div>` : ''}

                <div class="sidebar-section">
                    <p class="label sidebar-title">Share</p>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonUrl)}" target="_blank" rel="noopener" class="text-link">Share on LinkedIn</a>
                </div>
            </aside>
        </div>
    </div>
    </main>

${BLOG_FOOTER}

</body>
</html>`;
}

// ─── Blog index template ──────────────────────────────────────────────────────

function postCard(post, featured) {
  const date  = formatDate(post.meta.date || '');
  const time  = post.meta.readTime || readTime(post.body);
  const cover = post.meta.image ? coverImage(post.meta.image, `https://syntaric.com/blog/${post.slug}/`) : null;
  const Tag   = featured ? 'h2' : 'h3';
  return `
                <a href="/blog/${post.slug}/" class="post-card${featured ? ' post-card--featured' : ''}">
                    ${cover ? `<img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="" class="post-cover"${featured ? '' : ' loading="lazy" decoding="async"'}>` : ''}
                    <div class="post-body">
                        <p class="label">${esc(post.meta.tag || 'Article')}</p>
                        <${Tag} class="post-title">${esc(post.meta.title)}</${Tag}>
                        <p class="post-excerpt">${esc(post.meta.excerpt || post.meta.description || '')}</p>
                        <p class="label post-meta">${esc(date)} · ${esc(time)}</p>
                    </div>
                </a>`;
}

function buildIndexPage(posts) {
  const cards = posts.map((post, i) => postCard(post, i === 0)).join('\n');

  const blogDesc = "Articles from Syntaric's FHIR, openEHR and IHE projects, and notes from the events we take part in.";

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
    <meta name="description" content="${esc(blogDesc)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://syntaric.com/blog/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://syntaric.com/blog/">
    <meta property="og:title" content="Blog | Syntaric">
    <meta property="og:description" content="${esc(blogDesc)}">
    <meta property="og:image" content="https://syntaric.com/assets/share/blog.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="627">
    <meta property="og:image:alt" content="Syntaric blog">
    <meta property="og:site_name" content="Syntaric">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Blog | Syntaric">
    <meta name="twitter:description" content="${esc(blogDesc)}">
    <meta name="twitter:image" content="https://syntaric.com/assets/share/blog.png">

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

    <main>
    <!-- ─── HEADER ─── -->
    <section class="blog-hero">
        <div class="container">
            <h1>Blog</h1>
            <p class="blog-hero-desc">Articles from our FHIR, openEHR and IHE projects, and notes from the events we take part in.</p>
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
    </main>

${BLOG_FOOTER}

</body>
</html>`;
}

// ─── Home page: latest posts ──────────────────────────────────────────────────

/** The 3 newest published posts, by front matter date; ties by slug, descending. */
function latestPostsHtml(posts) {
  const newest = posts.slice().sort((a, b) =>
    (b.meta.date || '').localeCompare(a.meta.date || '') || b.slug.localeCompare(a.slug)
  ).slice(0, 3);
  const items = newest.map(p => {
    const cover = p.meta.image ? coverImage(p.meta.image, `https://syntaric.com/blog/${p.slug}/`) : null;
    return `
                    <a class="writing-item" href="blog/${p.slug}/">
                        ${cover ? `<img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="" loading="lazy" decoding="async">` : ''}
                        <h3>${esc(p.meta.title)}</h3>
                        <p>${esc(p.meta.description || p.meta.excerpt || '')}</p>
                        <p class="label">${esc(formatDate(p.meta.date || ''))}</p>
                    </a>`;
  }).join('');
  return `
                <div class="writing-list">${items}
                </div>
                `;
}

// ─── Home page: strand figures ────────────────────────────────────────────────

const FIGURE_TEXT_LIMIT = 8 * 1024;

/** The cleaned data snapshot; every removal is printed (redesign item 44). */
function loadSnapshot(log) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'snapshot.json'), 'utf8'));
  const { snapshot, removed } = cleanSnapshot(raw);
  for (const r of removed) log(`  - snapshot: removed ${r.path} (${r.reason})`);
  return snapshot;
}

function checkFigure(name, svg) {
  const size = textSize(svg);
  if (size > FIGURE_TEXT_LIMIT) throw new Error(`Figure "${name}" has ${size} bytes of text (limit ${FIGURE_TEXT_LIMIT})`);
  return svg;
}

/** True if `file` exists with exactly this content (string or Buffer). */
function sameAsDisk(file, content) {
  if (!fs.existsSync(file)) return false;
  const disk = fs.readFileSync(file);
  return Buffer.isBuffer(content) ? disk.equals(content) : disk.toString('utf8') === content;
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

    currentPageUrl = `https://syntaric.com/blog/${slug}/`;
    const bodyHtml = marked.parse(body);
    const toc      = buildToc(bodyHtml);

    outputs.set(path.join(BLOG_DIR, slug, 'index.html'), buildPostPage(meta, bodyHtml, toc, body));

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

  // Share cards (commit 1.7): PNG buffers, compared byte for byte.
  outputs.set(path.join(ROOT, 'assets', 'share', 'home.png'), renderCard({ title: 'Boutique healthcare interoperability consultancy', kicker: 'syntaric.com' }));
  outputs.set(path.join(ROOT, 'assets', 'share', 'blog.png'), renderCard({ title: 'Blog', kicker: 'Articles from our FHIR, openEHR and IHE projects' }));
  for (const p of publishedPosts) outputs.set(path.join(BLOG_DIR, p.slug, 'share.png'), renderCard({ title: p.meta.title }));
  log(`  ✓ share cards  (${publishedPosts.length + 2})`);

  // Strand figures, from the cleaned snapshot.
  const snapshot = loadSnapshot(log);
  // The hero field's still frame (phase 0, the video's first frame): what
  // visitors see without JavaScript, with reduced motion or Data Saver, and
  // until the video plays (decision #4: Prototype B, 2026-11-04).
  const fieldWide = checkFigure('hero-field-wide', strands.heroField(snapshot, { layout: 'wide' }));
  const fieldNarrow = checkFigure('hero-field-narrow', strands.heroField(snapshot, { layout: 'narrow' }));
  outputs.set(path.join(ROOT, 'partials', 'figures', 'hero-field-wide.svg'), fieldWide + '\n');
  outputs.set(path.join(ROOT, 'partials', 'figures', 'hero-field-narrow.svg'), fieldNarrow + '\n');

  const openfhirFig = checkFigure('openfhir', strands.openfhirFigure(snapshot));
  const unioFig = checkFigure('unio', strands.unioFigure(snapshot));
  // Divider notes: the other mapping pairs, as plain "FHIR path · openEHR path".
  const { expandPaths } = require('../tools/data-rules');
  const mapping = snapshot.entries['allergy-mapping'];
  const dividers = mapping.values.slice(1, 4).map((v, i) => {
    const e = expandPaths(v, mapping.header);
    return checkFigure(`divider-${i + 1}`, strands.divider(`${e.fhir} · ${e.openehr}`));
  });
  outputs.set(path.join(ROOT, 'partials', 'figures', 'openfhir.svg'), openfhirFig + '\n');
  outputs.set(path.join(ROOT, 'partials', 'figures', 'unio.svg'), unioFig + '\n');
  dividers.forEach((d, i) => outputs.set(path.join(ROOT, 'partials', 'figures', `divider-${i + 1}.svg`), d + '\n'));

  // index.html: rewrite marker regions only.
  const indexPath = path.join(ROOT, 'index.html');
  const homeHtml = replaceRegions(fs.readFileSync(indexPath, 'utf8'), {
    css:    `\n    <style>\n${CSS.shared}\n\n${CSS.home}\n    </style>\n    `,
    nav:    `\n${fill(NAV, { root: '', blogCurrent: '' })}\n`,
    footer: `\n${fill(FOOTER, { root: '' })}\n`,
    'latest-posts': latestPostsHtml(publishedPosts),
    'hero-field-wide': `\n                ${fieldWide}\n                `,
    'hero-field-narrow': `\n                ${fieldNarrow}\n                `,
    'openfhir-figure': `\n                        ${openfhirFig}\n                        `,
    'unio-figure': `\n                        ${unioFig}\n                        `,
    ...Object.fromEntries(dividers.map((d, i) => [`divider-${i + 1}`, d])),
  });
  outputs.set(indexPath, homeHtml);
  log('  ✓ index.html  (marker regions: css, nav, footer, latest-posts, hero, openfhir, unio, dividers)');

  // TODO-OWNER rule: no published file may carry the marker.
  const todo = [];
  for (const [file, content] of outputs) if (typeof content === 'string' && content.includes('TODO-OWNER')) todo.push(file);
  for (const file of todoScanExtras()) {
    if (!outputs.has(file) && fs.readFileSync(file, 'utf8').includes('TODO-OWNER')) todo.push(file);
  }

  if (CHECK) {
    const differ = [];
    for (const [file, content] of outputs) {
      if (!sameAsDisk(file, content)) differ.push(file);
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
    if (!sameAsDisk(file, content)) fs.writeFileSync(file, content);
  }
  for (const f of todo) console.log(`  ! contains TODO-OWNER: ${path.relative(ROOT, f)}`);
  console.log('\nDone.');
}

main();
