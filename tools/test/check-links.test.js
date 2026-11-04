'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { checkSite } = require('../check-links');

const ANCHORS = ['services', 'engagements', 'expertise', 'products', 'openfhir', 'unio', 'collaborators', 'contact', 'writing'];

/** A minimal site: home with the 8 anchors, one blog post, a sitemap. */
function site(postBody) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-links-'));
  const home = `<html><body>${ANCHORS.map(id => `<section id="${id}"></section>`).join('')}<a href="blog/">Blog</a></body></html>`;
  fs.writeFileSync(path.join(root, 'index.html'), home);
  fs.mkdirSync(path.join(root, 'blog', 'post'), { recursive: true });
  fs.writeFileSync(path.join(root, 'blog', 'index.html'), '<a href="/blog/post/">post</a>');
  fs.writeFileSync(path.join(root, 'blog', 'post', 'index.html'), `<h2 id="intro">Intro</h2>${postBody}`);
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<loc>https://syntaric.com/</loc><loc>https://syntaric.com/blog/post/</loc>');
  fs.mkdirSync(path.join(root, 'tools'));
  fs.writeFileSync(path.join(root, 'tools', 'sitemap-baseline.txt'), 'https://syntaric.com/\nhttps://syntaric.com/blog/post/\n');
  return root;
}

test('a site whose links all resolve passes', () => {
  const root = site('<a href="#intro">x</a><a href="/#contact">c</a><a href="https://example.org/">ext</a><a href="mailto:a@b.c">m</a>');
  assert.deepStrictEqual(checkSite(root), []);
});

test('a broken internal link fails', () => {
  const errors = checkSite(site('<a href="/posts/missing">x</a>'));
  assert.strictEqual(errors.length, 1);
  assert.match(errors[0], /broken link "\/posts\/missing"/);
});

test('a broken fragment fails', () => {
  const errors = checkSite(site('<a href="/#nowhere">x</a>'));
  assert.strictEqual(errors.length, 1);
  assert.match(errors[0], /missing #nowhere/);
});

test('a missing baseline URL fails', () => {
  const root = site('');
  fs.appendFileSync(path.join(root, 'tools', 'sitemap-baseline.txt'), 'https://syntaric.com/blog/gone/\n');
  assert.match(checkSite(root).join('\n'), /baseline URL missing: https:\/\/syntaric.com\/blog\/gone\//);
});

test('a script or stylesheet from a third-party host fails', () => {
  const errors = checkSite(site(
    '<script src="https://www.googletagmanager.com/gtag/js"></script>' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'
  ));
  assert.strictEqual(errors.length, 2);
  assert.match(errors[0], /<script> loads from third-party host www\.googletagmanager\.com/);
  assert.match(errors[1], /<link> loads from third-party host fonts\.googleapis\.com/);
});

test('GoatCounter and same-site loads pass', () => {
  const root = site(
    '<script data-goatcounter="https://syntaric.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>' +
    '<link rel="preload" href="/index.html" as="document"><link rel="canonical" href="https://syntaric.com/blog/post/">'
  );
  assert.deepStrictEqual(checkSite(root), []);
});

test('a missing home anchor fails', () => {
  const root = site('');
  const file = path.join(root, 'index.html');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('id="unio"', 'id="other"'));
  assert.match(checkSite(root).join('\n'), /home anchor #unio is missing/);
});
