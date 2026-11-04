'use strict';

const test = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const { snapshotEntry } = require('../snapshot');

const yaml = `grammar: FHIRConnect/v1.0.0
type: model
spec:
  openEhrConfig:
    archetype: openEHR-EHR-EVALUATION.adverse_reaction_risk.v2
  fhirConfig:
    structureDefinition: http://hl7.org/fhir/StructureDefinition/AllergyIntolerance
mappings:
  - name: "substance"
    with:
      fhir: "$resource.code"
      openehr: "$archetype/data[at0001]/items[at0002]"
  - name: "other"
    with:
      fhir: "$resource.note"
      openehr: "$archetype/data[at0001]/items[at0999]"
`;

test('keeps only the selected mappings, unchanged, with the header', () => {
  const entry = snapshotEntry({ id: 'm', path: '/tmp/x.yml', select: ['substance'], licence: 'Apache-2.0' }, () => yaml);
  assert.deepStrictEqual(entry.values, [{ name: 'substance', fhir: '$resource.code', openehr: '$archetype/data[at0001]/items[at0002]' }]);
  assert.strictEqual(entry.header.archetype, 'openEHR-EHR-EVALUATION.adverse_reaction_risk.v2');
});

test('refuses any path under ~/Documents/syntaric/_clients/', () => {
  const p = path.join(os.homedir(), 'Documents', 'syntaric', '_clients', 'acme', 'x.yml');
  assert.throws(() => snapshotEntry({ id: 'c', path: p, select: [] }, () => yaml), /_clients/);
  assert.throws(() => snapshotEntry({ id: 'c', path: '~/Documents/syntaric/_clients/x.yml', select: [] }, () => yaml), /_clients/);
});

test('refuses a selected mapping that does not exist', () => {
  assert.throws(() => snapshotEntry({ id: 'm', path: '/tmp/x.yml', select: ['missing'] }, () => yaml), /"missing" not found/);
});

test('copies a synthetic entry as written', () => {
  const values = { query: 'q' };
  assert.deepStrictEqual(snapshotEntry({ id: 's', origin: 'synthetic', licence: 'Syntaric', values }), { origin: 'synthetic', licence: 'Syntaric', values });

test('copies a written entry (plain copy) as written', () => {
  const values = { upper: 'u' };
  assert.deepStrictEqual(snapshotEntry({ id: 'w', origin: 'written', licence: 'Syntaric', values }), { origin: 'written', licence: 'Syntaric', values });
});
});
