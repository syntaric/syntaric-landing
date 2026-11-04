'use strict';

const test = require('node:test');
const assert = require('node:assert');
const strands = require('../strands');
const snapshot = require('../../data/snapshot.json');

test('a strand is one closed path', () => {
  const p = strands.strand([0, 0], [100, 0]);
  assert.match(p, /^<path class="strand" fill="#122e49" d="M[^"]+Z"\/>$/);
});

test('output is deterministic', () => {
  assert.strictEqual(strands.hero(snapshot), strands.hero(snapshot));
  assert.strictEqual(strands.openfhirFigure(snapshot), strands.openfhirFigure(snapshot));
});

test('a bundle has one path per strand', () => {
  assert.strictEqual(strands.bundle(3, [0, 0], [100, 0]).length, 3);
});

test('t < 1 draws only part of the strand', () => {
  const full = strands.outline([0, 0], [100, 0], { width: 20 }).polygon;
  const half = strands.outline([0, 0], [100, 0], { width: 20, t: 0.5 }).polygon;
  const maxX = poly => Math.max(...poly.map(p => p[0]));
  assert.ok(maxX(half) < 55 && maxX(full) > 95);
});

test('the default hero keeps its text zone clear', () => {
  assert.doesNotThrow(() => strands.hero(snapshot, { layout: 'wide' }));
});

test('hero throws when geometry enters the text zone', () => {
  assert.throws(() => strands.hero(snapshot, { layout: 'wide', textZone: { x: 0, y: 0, width: 1100, height: 640 } }), /text zone/);
});

test('every figure is aria-hidden and has a viewBox', () => {
  for (const svg of [strands.hero(snapshot), strands.hero(snapshot, { layout: 'narrow' }),
    strands.openfhirFigure(snapshot), strands.unioFigure(snapshot), strands.divider('note')]) {
    assert.match(svg, /^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*aria-hidden="true" focusable="false"/);
    assert.doesNotMatch(svg, /<title>/);
  }
});

test('the full-bleed field keeps its text zone clear in every frame of the loop', () => {
  for (let i = 0; i < 48; i++) assert.doesNotThrow(() => strands.heroField(snapshot, { layout: 'wide', phase: i / 48 }));
});

test('the field loop is seamless: phase 0 and phase 1 draw the same frame', () => {
  assert.strictEqual(strands.heroField(snapshot, { phase: 0 }), strands.heroField(snapshot, { phase: 1 }));
});
