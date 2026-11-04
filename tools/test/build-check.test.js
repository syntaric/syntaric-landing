'use strict';

// `node blog/build.js --check` on a copy of the repo: clean, then after a
// hand edit inside a marker region and inside a generated page.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.join(__dirname, '..', '..');
const BUILD = path.join(REPO, 'blog', 'build.js');

function copyRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-check-'));
  for (const item of ['index.html', 'sitemap.xml', 'assets', 'partials', 'blog', 'data']) {
    fs.cpSync(path.join(REPO, item), path.join(root, item), { recursive: true });
  }
  // Bring the copy in line with the current sources first.
  const build = spawnSync(process.execPath, [BUILD, '--root', root], { encoding: 'utf8' });
  assert.strictEqual(build.status, 0, build.stdout + build.stderr);
  return root;
}

const check = root => spawnSync(process.execPath, [BUILD, '--root', root, '--check'], { encoding: 'utf8' });

test('a freshly built copy passes --check', () => {
  const result = check(copyRepo());
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
});

test('--check reports an edited marker region and an edited generated page', () => {
  const root = copyRepo();
  const home = path.join(root, 'index.html');
  fs.writeFileSync(home, fs.readFileSync(home, 'utf8').replace('<!-- @nav -->', '<!-- @nav -->hand edit'));
  const post = path.join(root, 'blog', 'fhir-server-xds', 'index.html');
  fs.appendFileSync(post, '<!-- hand edit -->');
  const result = check(root);
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /differs from build: index\.html/);
  assert.match(result.stdout, /differs from build: blog\/fhir-server-xds\/index\.html/);
});

test('--check fails on a TODO-OWNER marker', () => {
  const root = copyRepo();
  const home = path.join(root, 'index.html');
  fs.writeFileSync(home, fs.readFileSync(home, 'utf8').replace('</body>', '<p>TODO-OWNER: reply time</p></body>'));
  const result = check(root);
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /contains TODO-OWNER: index\.html/);
});
