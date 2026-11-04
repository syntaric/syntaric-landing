#!/usr/bin/env node
/**
 * Build data/snapshot.json from the allow-list in data/sources.json
 * (redesign item 39). Run by hand when a source changes:  npm run snapshot
 *
 * - reads only the listed paths, and refuses any path under
 *   ~/Documents/syntaric/_clients/
 * - FHIRConnect mapping files: keeps the mappings named in `select`
 *   (their with.fhir / with.openehr pairs) and the header fields needed to
 *   expand $resource and $archetype; values are copied unchanged
 * - synthetic and written entries (made-up data, plain copy) are copied as written
 * - no filtering here: the build filters on every run (tools/data-rules.js)
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FORBIDDEN = path.join(os.homedir(), 'Documents', 'syntaric', '_clients');

function expandHome(p) {
  return p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p;
}

/** Turn one allow-list entry into a snapshot entry. `readFile` is injectable for tests. */
function snapshotEntry(entry, readFile = f => fs.readFileSync(f, 'utf8')) {
  if (entry.origin === 'synthetic' || entry.origin === 'written') {
    return { origin: entry.origin, licence: entry.licence, values: entry.values };
  }
  if (!entry.path) throw new Error(`Entry "${entry.id}" has neither a path nor origin "synthetic" or "written"`);
  const file = path.resolve(expandHome(entry.path));
  if (file === FORBIDDEN || file.startsWith(FORBIDDEN + path.sep)) {
    throw new Error(`Entry "${entry.id}": paths under ~/Documents/syntaric/_clients/ are never read`);
  }
  if (!file.endsWith('.yml') && !file.endsWith('.yaml')) {
    throw new Error(`Entry "${entry.id}": only FHIRConnect YAML mappings are supported (${file})`);
  }
  const yaml = require('js-yaml');
  const doc = yaml.load(readFile(file));
  const byName = new Map((doc.mappings || []).map(m => [m.name, m]));
  const values = entry.select.map(name => {
    const m = byName.get(name);
    if (!m) throw new Error(`Entry "${entry.id}": mapping "${name}" not found in ${file}`);
    return { name, fhir: m.with.fhir, openehr: m.with.openehr };
  });
  return {
    source: entry.path,
    licence: entry.licence,
    origin_url: entry.origin_url,
    header: {
      structureDefinition: doc.spec.fhirConfig.structureDefinition,
      archetype: doc.spec.openEhrConfig.archetype,
    },
    values,
  };
}

/** The whole snapshot for a sources document. */
function buildSnapshot(sources, readFile) {
  const entries = {};
  for (const entry of sources.entries) entries[entry.id] = snapshotEntry(entry, readFile);
  return { entries };
}

module.exports = { buildSnapshot, snapshotEntry };

if (require.main === module) {
  const sources = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sources.json'), 'utf8'));
  const snapshot = buildSnapshot(sources);
  fs.writeFileSync(path.join(ROOT, 'data', 'snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`data/snapshot.json: ${Object.keys(snapshot.entries).length} entries`);
}
