'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { cleanSnapshot, expandPaths, textSize } = require('../data-rules');

const snap = values => ({ entries: { e: { values } } });

test('placeholder strings are removed and listed', () => {
  for (const text of ['Lorem ipsum dolor', 'DOE, John', 'No example for this element']) {
    const { snapshot, removed } = cleanSnapshot(snap({ text }));
    assert.deepStrictEqual(snapshot.entries.e.values, {});
    assert.deepStrictEqual(removed, [{ entryId: 'e', path: 'e.values.text', reason: 'placeholder' }]);
  }
});

test('patient fields are removed', () => {
  const { snapshot, removed } = cleanSnapshot(snap({ name: 'x', identifier: 'x', telecom: 'x', address: 'x', birthDate: 'x', code: 'kept' }));
  assert.deepStrictEqual(snapshot.entries.e.values, { code: 'kept' });
  assert.strictEqual(removed.length, 5);
  assert.ok(removed.every(r => r.reason === 'field'));
});

test('base64 over 64 characters is removed; 64 characters is kept', () => {
  const { snapshot, removed } = cleanSnapshot(snap({ long: 'A'.repeat(65), short: 'A'.repeat(64) }));
  assert.deepStrictEqual(snapshot.entries.e.values, { short: 'A'.repeat(64) });
  assert.deepStrictEqual(removed, [{ entryId: 'e', path: 'e.values.long', reason: 'base64' }]);
});

test('the name of a mapping pair is structural and kept', () => {
  const { removed } = cleanSnapshot(snap([{ name: 'substance', fhir: '$resource.code', openehr: '$archetype/data[at0001]' }]));
  assert.deepStrictEqual(removed, []);
});

const header = {
  structureDefinition: 'http://hl7.org/fhir/StructureDefinition/AllergyIntolerance',
  archetype: 'openEHR-EHR-EVALUATION.adverse_reaction_risk.v2',
};

test('expandPaths resolves $resource and $archetype from the header', () => {
  assert.deepStrictEqual(
    expandPaths({ fhir: '$resource.code', openehr: '$archetype/data[at0001]/items[at0002]' }, header),
    { fhir: 'AllergyIntolerance.code', openehr: '/data[at0001]/items[at0002]', archetype: header.archetype }
  );
});

test('expandPaths refuses a profile URL, whose base type it cannot know', () => {
  assert.throws(() => expandPaths({ fhir: '$resource.code', openehr: '$archetype' },
    { ...header, structureDefinition: 'https://example.org/fhir/StructureDefinition/my-allergy' }), /not a base FHIR StructureDefinition/);
});

test('textSize counts text and tspan content in bytes', () => {
  assert.strictEqual(textSize('<svg><text x="1">abc</text><text><tspan>é</tspan></text></svg>'), 5);
});
