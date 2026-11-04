/**
 * Rules applied to data/snapshot.json on every build (redesign item 41a).
 * The snapshot keeps values unchanged; anything a figure must not show is
 * removed here, so a new rule applies on the next build without a refresh.
 */

'use strict';

const DROPPED_FIELDS = new Set(['name', 'identifier', 'telecom', 'address', 'birthDate']);
const PLACEHOLDERS = [/lorem ipsum/i, /\bDOE,\s*John\b/i, /no example for/i];
const BASE64 = /^[A-Za-z0-9+/=\r\n]+$/;
const BASE64_LIMIT = 64;

function dropReason(key, value) {
  if (key !== null && DROPPED_FIELDS.has(key)) return 'field';
  if (typeof value !== 'string') return null;
  if (PLACEHOLDERS.some(re => re.test(value))) return 'placeholder';
  if (value.length > BASE64_LIMIT && BASE64.test(value)) return 'base64';
  return null;
}

/**
 * Walk every value of every entry. Returns the cleaned snapshot and a list
 * of { entryId, path, reason } for each value removed.
 * Mapping metadata (`name` of a mapping pair) is structural, not patient
 * data, so the field rule applies inside `values` items only below the pair.
 */
function cleanSnapshot(snapshot) {
  const removed = [];
  const walk = (value, entryId, at, key, inPair) => {
    const reason = inPair && key === 'name' ? null : dropReason(key, value);
    if (reason) { removed.push({ entryId, path: at, reason }); return undefined; }
    if (Array.isArray(value)) {
      return value.map((v, i) => walk(v, entryId, `${at}[${i}]`, null, false)).filter(v => v !== undefined);
    }
    if (value && typeof value === 'object') {
      const pair = 'fhir' in value && 'openehr' in value;
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        const w = walk(v, entryId, `${at}.${k}`, k, pair);
        if (w !== undefined) out[k] = w;
      }
      return out;
    }
    return value;
  };
  const entries = {};
  for (const [id, entry] of Object.entries(snapshot.entries)) entries[id] = walk(entry, id, id, null, false);
  return { snapshot: { entries }, removed };
}

/**
 * Readable paths for a FHIRConnect mapping pair (checked against the
 * FHIRConnect spec, basics/Variables.adoc, on 2026-11-04):
 * - `$resource` becomes the resource type of the header's base
 *   StructureDefinition (http://hl7.org/fhir/StructureDefinition/<Type>);
 *   a profile URL is refused, because its base type is not in the URL.
 * - `$archetype` becomes the archetype root: the path is shown relative to
 *   the archetype, and the archetype id is returned to show as a label.
 */
function expandPaths(pair, header) {
  const base = 'http://hl7.org/fhir/StructureDefinition/';
  const sd = header.structureDefinition;
  if (!sd.startsWith(base) || sd.slice(base.length).includes('/')) {
    throw new Error(`expandPaths: "${sd}" is not a base FHIR StructureDefinition; its resource type is unknown`);
  }
  const type = sd.slice(base.length);
  const fhir = pair.fhir.replace(/^\$resource(?=\.|$)/, type);
  const openehr = pair.openehr.replace(/^\$archetype(?=\/|$)/, '') || '/';
  if (fhir.startsWith('$') || openehr.startsWith('$')) {
    throw new Error(`expandPaths: unsupported variable in "${pair.fhir}" / "${pair.openehr}"`);
  }
  return { fhir, openehr, archetype: header.archetype };
}

/** Byte size of all text nodes (<text>, <tspan>) in an SVG string. */
function textSize(svg) {
  let size = 0;
  const re = /<(text|tspan)\b[^>]*>([^<]*)/g;
  let m;
  while ((m = re.exec(svg)) !== null) size += Buffer.byteLength(m[2], 'utf8');
  return size;
}

module.exports = { cleanSnapshot, expandPaths, textSize };
