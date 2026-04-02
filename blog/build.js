#!/usr/bin/env node
/**
 * Syntaric Blog Builder
 *
 * Reads .md files from blog/posts/, generates:
 *   - blog/<slug>/index.html  (one per post)
 *   - blog/index.html          (listing page, auto-updated)
 *
 * Run:  node blog/build.js
 *   or  npm run build:blog
 */

const fs   = require('fs');
const path = require('path');
const { marked } = require('marked');

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT      = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(__dirname, 'posts');

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

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const SHARED_CSS = `
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --ink: #0d1117;
            --ink-light: #4a5568;
            --ink-muted: #718096;
            --surface: #ffffff;
            --surface-2: #f7f8fc;
            --surface-3: #eef0f6;
            --border: #e2e8f0;
            --accent: #0052cc;
            --accent-light: #e8f0fe;
            --accent-glow: rgba(0, 82, 204, 0.12);
            --green: #0f7b55;
            --green-light: #e6f4f0;
            --radius: 12px;
            --radius-lg: 20px;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
            --shadow: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
            --shadow-lg: 0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
            --nav-h: 68px;
        }

        html { scroll-behavior: smooth; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--ink);
            background: var(--surface);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

        /* ─── NAV ─── */
        header {
            position: sticky; top: 0; z-index: 200;
            background: rgba(255,255,255,0.88);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
            height: var(--nav-h);
        }
        nav { height: 100%; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo img { height: 36px; width: auto; }
        .logo-name { font-size: 1.2rem; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }
        .nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
        .nav-links a { font-size: 0.9rem; font-weight: 500; color: var(--ink-light); text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--ink); }
        .nav-links a.active { color: var(--accent); }
        .nav-cta { background: var(--ink) !important; color: var(--surface) !important; padding: 0.55rem 1.25rem !important; border-radius: 8px !important; font-size: 0.875rem !important; transition: background 0.2s, opacity 0.2s !important; }
        .nav-cta:hover { opacity: 0.85; }
        @media (max-width: 640px) { .nav-links { display: none; } }

        /* ─── FOOTER ─── */
        footer { background: var(--ink); color: rgba(255,255,255,0.5); padding: 36px 0; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .footer-logo-name { font-size: 1.1rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
        .footer-right { text-align: right; font-size: 0.825rem; line-height: 1.6; }
        @media (max-width: 640px) { .footer-right { text-align: left; } }

        /* ─── ANIMATIONS ─── */
        @keyframes fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .animate { animation: fade-up 0.55s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
`;

// ─── Nav fragments ────────────────────────────────────────────────────────────

function navHtml(root, activeBlog) {
  return `    <header>
        <nav class="container">
            <a href="${root}" class="logo">
                <img src="${root}etc/syntaric_logo_2.png" alt="Syntaric">
                <span class="logo-name">Syntaric</span>
            </a>
            <ul class="nav-links">
                <li><a href="${root}#services">Services</a></li>
                <li><a href="${root}#engagements">Engagements</a></li>
                <li><a href="${root}#openfhir">openFHIR</a></li>
                <li><a href="${root}#expertise">Expertise</a></li>
                <li><a href="${root}#collaborators">Collaborators</a></li>
                <li><a href="${root}blog/"${activeBlog ? ' class="active"' : ''}>Blog</a></li>
                <li><a href="${root}#contact" class="nav-cta">Contact</a></li>
            </ul>
        </nav>
    </header>`;
}

const FOOTER_HTML = `    <footer>
        <div class="container">
            <div class="footer-inner">
                <div><span class="footer-logo-name">Syntaric</span></div>
                <div class="footer-right">
                    <p>&copy; 2025 Syntaric d.o.o. · Healthcare Interoperability Consulting</p>
                    <p>VAT SI24333611 · Reg. 9746927000</p>
                </div>
            </div>
        </div>
    </footer>`;

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
  const imgUrl   = meta.image
    ? `https://syntaric.com/blog/images/${slug}.jpg`
    : `https://syntaric.com/etc/syntaric_logo_2.png`;

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
      "logo": { "@type": "ImageObject", "url": imgUrl }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonUrl },
    "keywords": tags.join(', ')
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZSP30ZJ4NV"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-ZSP30ZJ4NV');
</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(meta.title)} | Syntaric</title>
    <meta name="description" content="${desc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonUrl}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonUrl}">
    <meta property="og:title" content="${esc(meta.title)} | Syntaric">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:site_name" content="Syntaric">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:author" content="${esc(meta.author || '')}">
    ${tags.map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(meta.title)} | Syntaric">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- JSON-LD: Article -->
    <script type="application/ld+json">${jsonLd}</script>

    <link rel="icon" type="image/png" href="../../favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
    <link rel="shortcut icon" href="../../favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="../../apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>${SHARED_CSS}
        /* ─── ARTICLE HERO ─── */
        .article-hero {
            background: linear-gradient(135deg, #0a1832 0%, #0d2160 40%, #0052cc 80%, #1a6fff 100%);
            padding: 80px 0 72px; position: relative; overflow: hidden;
        }
        .article-hero::before { content: ''; position: absolute; top: -100px; right: -100px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%); pointer-events: none; }
        .article-hero::after  { content: ''; position: absolute; bottom: -80px; left: -80px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(26,111,255,0.2) 0%, transparent 70%); pointer-events: none; }
        .article-hero-inner { position: relative; z-index: 1; max-width: 800px; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 2rem; }
        .breadcrumb a { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
        .breadcrumb a:hover { color: rgba(255,255,255,0.9); }
        .breadcrumb-sep { color: rgba(255,255,255,0.3); font-size: 0.85rem; }
        .breadcrumb-current { font-size: 0.85rem; color: rgba(255,255,255,0.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
        .article-tag { display: inline-flex; align-items: center; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 100px; margin-bottom: 1.5rem; }
        .article-hero h1 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; color: white; margin-bottom: 1.5rem; }
        .article-hero-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .article-meta-author { display: flex; align-items: center; gap: 10px; }
        .article-meta-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white; }
        .article-meta-name { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.9); }
        .article-meta-role { font-size: 0.8rem; color: rgba(255,255,255,0.55); margin-top: 1px; }
        .article-meta-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.25); }
        .article-meta-date, .article-meta-read { font-size: 0.85rem; color: rgba(255,255,255,0.55); }

        /* ─── ARTICLE LAYOUT ─── */
        .article-layout { display: grid; grid-template-columns: 1fr 300px; gap: 48px; padding: 64px 0 96px; align-items: start; }
        @media (max-width: 900px) { .article-layout { grid-template-columns: 1fr; gap: 40px; } .article-sidebar { order: -1; position: static; } }
        @media (max-width: 640px) { .article-layout { padding: 40px 0 72px; .article-sidebar { order: -1; position: static; } } }

        /* ─── ARTICLE BODY ─── */
        .article-body { min-width: 0; }
        .article-body h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; color: var(--ink); margin: 2.5rem 0 1rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .article-body h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
        .article-body h3 { font-size: 1.15rem; font-weight: 600; color: var(--ink); margin: 1.75rem 0 0.75rem; }
        .article-body p { font-size: 1.05rem; line-height: 1.8; color: var(--ink-light); margin-bottom: 1.25rem; }
        .article-body strong { color: var(--ink); font-weight: 600; }
        .article-body a { color: var(--accent); text-decoration: underline; text-decoration-color: rgba(0,82,204,0.3); text-underline-offset: 3px; transition: text-decoration-color 0.2s; }
        .article-body a:hover { text-decoration-color: var(--accent); }
        .article-body ul, .article-body ol { margin: 1rem 0 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .article-body li { font-size: 1.05rem; line-height: 1.7; color: var(--ink-light); }
        .article-body li strong { color: var(--ink); }
        .article-body pre { background: var(--ink); color: #e2e8f0; border-radius: var(--radius); padding: 20px 24px; overflow-x: auto; margin: 1.5rem 0; font-size: 0.9rem; line-height: 1.6; }
        .article-body code { font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; }
        .article-body p code, .article-body li code { background: var(--surface-3); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        .article-body img { max-width: 100%; border-radius: var(--radius); border: 1px solid var(--border); margin: 0 0 1.5rem;}
        .article-body hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
        .article-body th { background: var(--surface-2); font-weight: 600; color: var(--ink); text-align: left; padding: 10px 14px; border: 1px solid var(--border); }
        .article-body td { padding: 10px 14px; border: 1px solid var(--border); color: var(--ink-light); }
        .article-body tr:hover td { background: var(--surface-2); }

        /* ─── COVER IMAGE ─── */
        .article-cover { width: 100%; max-height: 480px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 48px; border: 1px solid var(--border); display: block; }

        /* ─── CALLOUT ─── */
        .callout { background: var(--accent-light); border-left: 3px solid var(--accent); border-radius: 0 var(--radius) var(--radius) 0; padding: 20px 24px; margin: 1.75rem 0; }
        .callout p { margin: 0; color: var(--ink); font-size: 0.975rem; }

        /* ─── SIDEBAR ─── */
        .article-sidebar { position: sticky; top: calc(var(--nav-h) + 24px); }
        .sidebar-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; }
        .sidebar-card-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 16px; }
        .toc-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .toc-list a { display: block; font-size: 0.875rem; color: var(--ink-light); text-decoration: none; padding: 6px 10px; border-radius: 6px; transition: background 0.15s, color 0.15s; line-height: 1.4; }
        .toc-list a:hover { background: var(--surface-3); color: var(--ink); }
        .sidebar-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .sidebar-tag { font-size: 0.78rem; font-weight: 500; color: var(--accent); background: var(--accent-light); padding: 4px 10px; border-radius: 100px; }
        .sidebar-author-name { font-size: 0.95rem; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .sidebar-author-role { font-size: 0.83rem; color: var(--ink-muted); margin-bottom: 16px; line-height: 1.5; }
        .sidebar-author-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.83rem; font-weight: 500; color: var(--accent); text-decoration: none; transition: opacity 0.2s; }
        .sidebar-author-link:hover { opacity: 0.75; }
        .sidebar-author-link svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .share-linkedin { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; font-weight: 600; color: #fff; background: #0a66c2; padding: 10px 16px; border-radius: 8px; text-decoration: none; transition: background 0.2s; }
        .share-linkedin:hover { background: #004182; }
        .share-linkedin svg { width: 16px; height: 16px; fill: currentColor; flex-shrink: 0; }
    </style>
</head>
<body>

${navHtml('../../', true)}

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
                            <div class="article-meta-role"><strong>Written as:</strong> ${esc(meta.authorAssumingRole || '')}</div>
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

${FOOTER_HTML}

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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>${SHARED_CSS}
        /* ─── HERO ─── */
        .blog-hero {
            padding: 80px 0 64px;
            background:
                linear-gradient(to bottom, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.98) 100%),
                url('https://open-fhir.com/images/openFHIR-hero-background-image.jpg') center/cover no-repeat;
            position: relative; overflow: hidden;
        }
        .blog-hero::before { content: ''; position: absolute; top: -120px; right: -160px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,82,204,0.07) 0%, transparent 70%); pointer-events: none; }
        .blog-hero-label { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 6px 14px; border-radius: 100px; margin-bottom: 1.5rem; }
        .blog-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
        .blog-hero h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); max-width: 600px; margin-bottom: 1rem; }
        .blog-hero-desc { font-size: 1.1rem; color: var(--ink-light); max-width: 520px; line-height: 1.7; }

        /* ─── POSTS GRID ─── */
        .blog-posts { padding: 72px 0 96px; }
        .posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 900px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .posts-grid { grid-template-columns: 1fr; } }

        /* Featured */
        .post-card--featured { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: box-shadow 0.2s, transform 0.2s; text-decoration: none; color: inherit; }
        .post-card--featured:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        @media (max-width: 900px) { .post-card--featured { grid-template-columns: 1fr; } }
        .post-card--featured .post-visual { background: linear-gradient(135deg, #0d1f4d 0%, #0052cc 50%, #1a6fff 100%); min-height: 280px; display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden; }
        .post-card--featured .post-visual::before { content: ''; position: absolute; top: -60px; right: -60px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%); }
        .post-visual-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.12); border-radius: 20px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); }
        .post-visual-icon svg { width: 40px; height: 40px; stroke: rgba(255,255,255,0.9); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .post-card--featured .post-body { padding: 48px; display: flex; flex-direction: column; justify-content: center; }

        /* Regular */
        .post-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
        .post-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
        .post-visual-sm { background: linear-gradient(135deg, #0d1f4d 0%, #0052cc 60%, #1a6fff 100%); height: 160px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .post-visual-sm::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%); }
        .post-visual-sm-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.12); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); }
        .post-visual-sm-icon svg { width: 24px; height: 24px; stroke: rgba(255,255,255,0.9); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .post-card .post-body { padding: 28px; flex: 1; display: flex; flex-direction: column; }

        /* Shared card */
        .post-tag { display: inline-flex; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); background: var(--accent-light); padding: 4px 10px; border-radius: 100px; margin-bottom: 1rem; width: fit-content; }
        .post-title { font-size: 1.25rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 0.75rem; }
        .post-card--featured .post-title { font-size: 1.6rem; margin-bottom: 1rem; }
        .post-excerpt { font-size: 0.95rem; color: var(--ink-light); line-height: 1.65; flex: 1; margin-bottom: 1.5rem; }
        .post-meta { display: flex; align-items: center; gap: 16px; font-size: 0.825rem; color: var(--ink-muted); }
        .post-meta-author { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--ink-light); }
        .post-meta-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent) 0%, #1a6fff 100%); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0; }
        .post-meta-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--border); }
        .post-read-more { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 600; color: var(--accent); margin-top: 1.5rem; }
        .post-read-more svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.2s; }
        .post-card:hover .post-read-more svg, .post-card--featured:hover .post-read-more svg { transform: translateX(3px); }
    </style>
</head>
<body>

${navHtml('../', true)}

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

${FOOTER_HTML}

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    console.log(`Created ${path.relative(ROOT, POSTS_DIR)}/`);
  }

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

    // Write post page
    const postDir = path.join(__dirname, slug);
    fs.mkdirSync(postDir, { recursive: true });
    const postHtml = buildPostPage(meta, bodyHtml, toc);
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
    console.log(`  ✓ blog/${slug}/index.html`);

    posts.push({ meta, body, slug });
  }

  // Write blog index
  const indexHtml = buildIndexPage(posts);
  fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml, 'utf8');
  console.log(`  ✓ blog/index.html  (${posts.length} post${posts.length !== 1 ? 's' : ''})`);

  // Write sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const postUrls = posts.map(p => `
  <url>
    <loc>https://syntaric.com/blog/${p.slug}/</loc>
    <lastmod>${p.meta.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://syntaric.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://syntaric.com/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${postUrls}
</urlset>`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`  ✓ sitemap.xml  (${posts.length + 2} URLs)`);

  console.log('\nDone.');
}

main();
