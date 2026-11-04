/**
 * Marker regions in hand-edited HTML (decision #13).
 *
 * A region is the content between `<!-- @name -->` and `<!-- /@name -->`.
 * The build rewrites only region content; everything outside is hand-edited.
 */

'use strict';

const MARKER = /<!-- (\/?)@([\w-]+) -->/g;

/** Scan `html` and return [{ name, openStart, innerStart, innerEnd, closeEnd }]. */
function scan(html) {
  const regions = [];
  const seen = new Set();
  let open = null;
  let m;
  MARKER.lastIndex = 0;
  while ((m = MARKER.exec(html)) !== null) {
    const [tag, slash, name] = m;
    if (!slash) {
      if (open) throw new Error(`Marker <!-- @${name} --> opens inside unclosed region "${open.name}"`);
      if (seen.has(name)) throw new Error(`Duplicated marker region "${name}"`);
      seen.add(name);
      open = { name, openStart: m.index, innerStart: m.index + tag.length };
    } else {
      if (!open) throw new Error(`Closing marker <!-- /@${name} --> has no opening marker`);
      if (open.name !== name) throw new Error(`Closing marker <!-- /@${name} --> does not match open region "${open.name}"`);
      regions.push({ ...open, innerEnd: m.index, closeEnd: m.index + tag.length });
      open = null;
    }
  }
  if (open) throw new Error(`Marker region "${open.name}" is not closed`);
  return regions;
}

/** Names of all regions in `html`, in document order. */
function listRegions(html) {
  return scan(html).map(r => r.name);
}

/**
 * Replace the inner content of the named regions.
 * `contents` maps region name to the new inner content.
 * Throws if any requested region is missing.
 */
function replaceRegions(html, contents) {
  const regions = scan(html);
  const byName = new Map(regions.map(r => [r.name, r]));
  for (const name of Object.keys(contents)) {
    if (!byName.has(name)) throw new Error(`Missing marker region "${name}"`);
  }
  let out = '';
  let pos = 0;
  for (const r of regions) {
    if (!(r.name in contents)) continue;
    out += html.slice(pos, r.innerStart) + contents[r.name];
    pos = r.innerEnd;
  }
  return out + html.slice(pos);
}

module.exports = { listRegions, replaceRegions };
