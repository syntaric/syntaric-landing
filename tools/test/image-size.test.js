'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { imageSize } = require('../image-size');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'image-size-'));
const write = (name, bytes) => { const f = path.join(dir, name); fs.writeFileSync(f, Buffer.from(bytes)); return f; };

// Header bytes only: the reader never looks past the frame header.
function png(width, height) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

function jpeg(width, height, sof = 0xc0) {
  const app0 = [0xff, 0xe0, 0x00, 0x10, ...Buffer.from('JFIF\0'), 1, 1, 0, 0, 1, 0, 1, 0, 0];
  const frame = [0xff, sof, 0x00, 0x11, 8, height >> 8, height & 0xff, width >> 8, width & 0xff, 3,
    1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1];
  return [0xff, 0xd8, ...app0, ...frame, 0xff, 0xd9];
}

test('reads PNG dimensions', () => {
  assert.deepStrictEqual(imageSize(write('a.png', png(1200, 627))), { width: 1200, height: 627 });
});

test('reads baseline and progressive JPEG dimensions', () => {
  assert.deepStrictEqual(imageSize(write('b.jpg', jpeg(800, 450))), { width: 800, height: 450 });
  assert.deepStrictEqual(imageSize(write('c.jpg', jpeg(640, 480, 0xc2))), { width: 640, height: 480 });
});

test('reads a real cover from the repo', () => {
  const cover = path.join(__dirname, '..', '..', 'blog', 'fhir-server-xds', 'cover.png');
  const { width, height } = imageSize(cover);
  assert.ok(width > 0 && height > 0);
});

test('throws on another format', () => {
  assert.throws(() => imageSize(write('d.gif', Buffer.from('GIF89a......'))), /Unsupported image format/);
});
