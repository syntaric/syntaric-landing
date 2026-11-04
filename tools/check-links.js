#!/usr/bin/env node
/**
 * Link and URL-contract check over the generated site (Goals 9 and 10).
 *
 * - every internal href/src resolves to a file, every #fragment to an id
 * - every URL in tools/sitemap-baseline.txt is in sitemap.xml
 * - the 8 home anchors exist
 * - no home figure carries more than 8 KB of text
 * - nothing loads from a third-party host (scripts, styles, images,
 *   iframes, media, CSS url(), URLs in inline scripts), except HOST_EXCEPTIONS
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
// Documented exceptions (decision E2): URL prefixes allowed despite the host rule.
const HOST_EXCEPTIONS = ['https://player.vimeo.com/video/1183048650'];

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
 * Everything a page loads: <script src>, every <link href>, <img src> and
 * srcset, <source src> and srcset, <iframe src>, <video src> and poster,
 * CSS url() inside <style>, and absolute http(s) URLs inside inline
 * scripts (JSON-LD is data, not a load, and is skipped).
 */
function loadsIn(html) {
  const loads = [];
  const push = (tag, url) => { if (url) loads.push({ tag, url: url.replace(/&amp;/g, '&') }); };
  const attr = (attrs, name) => { const m = attrs.match(new RegExp(`\\s${name}="([^"]*)"`)); return m && m[1]; };
  const tagRe = /<(script|link|img|source|iframe|video)\b([^>]*)>/gi;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    if (tag === 'link') push(tag, attr(attrs, 'href'));
    else push(tag, attr(attrs, 'src'));
    if (tag === 'video') push(tag, attr(attrs, 'poster'));
    const srcset = attr(attrs, 'srcset');
    if (srcset) for (const part of srcset.split(',')) push(tag, part.trim().split(/\s+/)[0]);
  }
  for (const style of html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || []) {
    const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
    while ((m = urlRe.exec(style)) !== null) push('style', m[1]);
  }
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRe.exec(html)) !== null) {
    if (/\stype="application\/ld\+json"/.test(m[1]) || /\ssrc="/.test(m[1])) continue;
    for (const url of m[2].match(/https?:\/\/[^\s'"`)<>]+/g) || []) push('script', url);
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
      if (ALLOWED_HOSTS.has(host) || HOST_EXCEPTIONS.some(prefix => url.startsWith(prefix))) continue;
      errors.push(`${rel}: <${tag}> loads from third-party host ${host}`);
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
