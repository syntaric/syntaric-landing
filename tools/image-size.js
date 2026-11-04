/**
 * Intrinsic pixel size of a PNG or JPEG file, read from its header.
 * No dependencies; throws on any other format.
 */

'use strict';

const fs = require('fs');

function pngSize(buf) {
  // 8-byte signature, then the IHDR chunk: length(4) type(4) width(4) height(4)
  if (buf.toString('ascii', 12, 16) !== 'IHDR') throw new Error('PNG without IHDR chunk');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  let i = 2; // after SOI (FF D8)
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) throw new Error(`Malformed JPEG marker at byte ${i}`);
    const marker = buf[i + 1];
    if (marker === 0xff) { i += 1; continue; }           // fill byte
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
    const length = buf.readUInt16BE(i + 2);
    // SOF0 (baseline), SOF1 (extended), SOF2 (progressive): length(2) precision(1) height(2) width(2)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    if (marker === 0xd9 || marker === 0xda) break;       // EOI or start of scan: no frame header found
    i += 2 + length;
  }
  throw new Error('JPEG without a SOF0/SOF1/SOF2 frame header');
}

/** Return { width, height } for the PNG or JPEG at `file`. */
function imageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) return pngSize(buf);
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  throw new Error(`Unsupported image format: ${file}`);
}

module.exports = { imageSize };
