'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { listRegions, replaceRegions } = require('../markers');

const page = 'a<!-- @nav -->old nav<!-- /@nav -->b<!-- @footer -->old foot<!-- /@footer -->c';

test('replaces one region and leaves the rest of the page alone', () => {
  assert.strictEqual(
    replaceRegions(page, { nav: 'NEW' }),
    'a<!-- @nav -->NEW<!-- /@nav -->b<!-- @footer -->old foot<!-- /@footer -->c'
  );
});

test('lists regions in document order', () => {
  assert.deepStrictEqual(listRegions(page), ['nav', 'footer']);
});

test('errors on a missing region', () => {
  assert.throws(() => replaceRegions(page, { css: 'x' }), /Missing marker region "css"/);
});

test('errors on a duplicated region', () => {
  assert.throws(() => listRegions(page + '<!-- @nav --><!-- /@nav -->'), /Duplicated marker region "nav"/);
});

test('errors on an unclosed region', () => {
  assert.throws(() => listRegions('<!-- @nav -->x'), /"nav" is not closed/);
});

test('errors on a closing marker without an opening one', () => {
  assert.throws(() => listRegions('x<!-- /@nav -->'), /has no opening marker/);
});

test('errors on crossed regions', () => {
  assert.throws(() => listRegions('<!-- @a --><!-- @b --><!-- /@a --><!-- /@b -->'), /opens inside unclosed region "a"/);
});
