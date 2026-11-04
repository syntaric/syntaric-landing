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
  assert.strictEqual(strands.heroField(snapshot), strands.heroField(snapshot));
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

test('the default hero field keeps its text zone clear', () => {
  assert.doesNotThrow(() => strands.heroField(snapshot, { layout: 'wide' }));
});

test('the hero field throws when geometry enters the text zone', () => {
  assert.throws(() => strands.heroField(snapshot, { layout: 'wide', textZone: { x: 0, y: 0, width: 1300, height: 854 } }), /text zone/);
});

test('every figure is aria-hidden and has a viewBox', () => {
  for (const svg of [strands.heroField(snapshot), strands.heroField(snapshot, { layout: 'narrow' }),
    strands.openfhirFigure(snapshot), strands.unioFigure(snapshot), strands.divider()]) {
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

test('the hero field shows the written plain labels', () => {
  const svg = strands.heroField(snapshot);
  for (const t of Object.values(snapshot.entries['hero-labels'].values)) assert.ok(svg.includes(t), t);
  assert.doesNotMatch(svg, /\[at\d|AllergyIntolerance/);
});
