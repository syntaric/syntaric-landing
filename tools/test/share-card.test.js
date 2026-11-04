'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { breakTitle, renderCard, WIDTH, HEIGHT } = require('../share-card');

test('a long title is cut to 3 lines with an ellipsis', () => {
  const lines = breakTitle('Dutch Generic Functions and openEHR - Building Blocks for National Health Data Exchange');
  assert.strictEqual(lines.length, 3);
  assert.match(lines[2], /…$/);
});

test('a short title stays on one line, without an ellipsis', () => {
  assert.deepStrictEqual(breakTitle('Blog'), ['Blog']);
});

test('a card is a 1200 x 627 PNG, and the same input gives the same bytes', () => {
  const a = renderCard({ title: 'FHIR Server and XDS' });
  const b = renderCard({ title: 'FHIR Server and XDS' });
  assert.strictEqual(a.toString('ascii', 1, 4), 'PNG');
  assert.strictEqual(a.readUInt32BE(16), WIDTH);
  assert.strictEqual(a.readUInt32BE(20), HEIGHT);
  assert.ok(a.equals(b));
});
