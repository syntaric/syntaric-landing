#!/usr/bin/env node
/**
 * Link and URL-contract check over the generated site (Goals 9 and 10).
 *
 * - every internal href/src resolves to a file, every #fragment to an id
 * - every URL in tools/sitemap-baseline.txt is in sitemap.xml
 * - the 8 home anchors exist
 * - no home figure carries more than 8 KB of text
 * - no <script src> or <link href> loads from a third-party host
 *
 * Usage: node tools/check-links.js [root]   (exit 1 on any error)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SITE = 'https://syntaric.com';
// The 8 ids that must keep working (Goal 9), plus `writing` from commit 0.6.
const HOME_ANCHORS = ['services', 'engagements', 'expertise', 'products', 'openfhir', 'unio', 'collaborators', 'contact', 'writing'];
const FIGURE_TEXT_LIMIT = 8 * 1024;
// Goal 10: no third-party loads besides analytics (GoatCounter script and beacon).
const ALLOWED_HOSTS = new Set(['syntaric.com', 'gc.zgo.at', 'syntaric.goatcounter.com']);

// Generated pages: index.html, blog/index.html and blog/<slug>/index.html.
function listPages(root) {
  const pages = ['index.html'];
  const blog = path.join(root, 'blog');
  for (const e of fs.readdirSync(blog, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === 'posts') continue;
    if (fs.existsSync(path.join(blog, e.name, 'index.html'))) pages.push(`blog/${e.name}/index.html`);
  }
  if (fs.existsSync(path.join(blog, 'index.html'))) pages.push('blog/index.html');
  return pages;
}

/** URL path a page is served at, e.g. blog/x/index.html -> /blog/x/. */
function pageUrlPath(rel) {
  return '/' + rel.replace(/index\.html$/, '');
}

function idsIn(html) {
  const ids = new Set();
  const re = /\s(?:id|name)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  return ids;
}

/** href/src attribute values, excluding inline <script> bodies. */
function linksIn(html) {
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => m.slice(0, m.indexOf('>') + 1));
  const links = [];
  const re = /\s(href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(markup)) !== null) links.push(m[2].replace(/&amp;/g, '&'));
  return links;
}

/**
 * Resources a page loads through markup: <script src> and every <link href>
 * (stylesheet, preload, preconnect, icon...). Commit 0.7 extends this to
 * images, iframes, media, CSS url() and URLs inside inline scripts.
 */
function loadsIn(html) {
  const loads = [];
  const re = /<(script|link)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attr = m[1].toLowerCase() === 'script' ? 'src' : 'href';
    const value = m[2].match(new RegExp(`\\s${attr}="([^"]*)"`));
    if (value && value[1]) loads.push({ tag: m[1].toLowerCase(), url: value[1].replace(/&amp;/g, '&') });
  }
  return loads;
}

/** Map a site URL path to a file in the repo, or null if none exists. */
function fileFor(root, urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\//, '');
  const candidates = urlPath.endsWith('/') ? [rel + 'index.html'] : [rel, rel + '/index.html'];
  for (const c of candidates) {
    const file = path.join(root, c);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

function checkSite(root) {
  const errors = [];
  const cache = new Map();
  const read = file => {
    if (!cache.has(file)) cache.set(file, fs.readFileSync(file, 'utf8'));
    return cache.get(file);
  };

  for (const rel of listPages(root)) {
    const html = read(path.join(root, rel));
    const base = SITE + pageUrlPath(rel);
    for (const link of linksIn(html)) {
      if (!link || /^(mailto|tel|javascript|data):/i.test(link)) continue;
      let url;
      try { url = new URL(link, base); } catch { errors.push(`${rel}: unparseable link "${link}"`); continue; }
      if (url.origin !== SITE) continue;
      const target = fileFor(root, url.pathname);
      if (!target) { errors.push(`${rel}: broken link "${link}"`); continue; }
      const frag = url.hash.slice(1);
      if (frag && target.endsWith('.html') && !idsIn(read(target)).has(decodeURIComponent(frag))) {
        errors.push(`${rel}: link "${link}" points to a missing #${frag}`);
      }
    }
  }

  const sitemapFile = path.join(root, 'sitemap.xml');
  const baselineFile = path.join(root, 'tools', 'sitemap-baseline.txt');
  if (fs.existsSync(baselineFile)) {
    const sitemap = fs.existsSync(sitemapFile) ? read(sitemapFile) : '';
    for (const url of read(baselineFile).split('\n').map(s => s.trim()).filter(Boolean)) {
      if (!sitemap.includes(`<loc>${url}</loc>`)) errors.push(`sitemap.xml: baseline URL missing: ${url}`);
    }
  }

  for (const rel of listPages(root)) {
    for (const { tag, url } of loadsIn(read(path.join(root, rel)))) {
      let host;
      try { host = new URL(url, SITE + pageUrlPath(rel)).hostname; } catch { continue; }
      if (!ALLOWED_HOSTS.has(host)) errors.push(`${rel}: <${tag}> loads from third-party host ${host}`);
    }
  }

  const home = read(path.join(root, 'index.html'));
  const homeIds = idsIn(home);
  for (const id of HOME_ANCHORS) if (!homeIds.has(id)) errors.push(`index.html: home anchor #${id} is missing`);

  const figures = home.match(/<figure\b[\s\S]*?<\/figure>/gi) || [];
  figures.forEach((fig, i) => {
    const text = (fig.match(/<(text|tspan)\b[^>]*>([^<]*)</gi) || []).map(t => t.replace(/^<[^>]*>/, '').replace(/<$/, '')).join('');
    const size = Buffer.byteLength(text, 'utf8');
    if (size > FIGURE_TEXT_LIMIT) errors.push(`index.html: figure ${i + 1} has ${size} bytes of text (limit ${FIGURE_TEXT_LIMIT})`);
  });

  return errors;
}

module.exports = { checkSite };

if (require.main === module) {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const errors = checkSite(root);
  for (const e of errors) console.log(e);
  if (errors.length) {
    console.log(`\ncheck-links: ${errors.length} problem${errors.length === 1 ? '' : 's'}`);
    process.exit(1);
  }
  console.log('check-links: all links, anchors and baseline URLs resolve');
}
