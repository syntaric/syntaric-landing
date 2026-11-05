#!/usr/bin/env bash
# Post-deploy check for GitHub Pages (decision #14).
# _config.yml is a deny-list; this script is its guard.
# Usage: tools/check-deploy.sh [base-url]   (default https://syntaric.com)
# Exits non-zero and prints each URL whose status code is not the expected one.

set -u

BASE="${1:-https://syntaric.com}"
BASE="${BASE%/}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

fail=0

status() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$1"
}

expect() {
  local code="$1" url="$2" got
  got="$(status "$url")"
  if [ "$got" != "$code" ]; then
    echo "FAIL $url: expected $code, got $got"
    fail=1
  fi
}

# Must return 200: every URL in the sitemap baseline (includes / and /blog/).
while IFS= read -r url; do
  [ -z "$url" ] && continue
  expect 200 "${BASE}${url#https://syntaric.com}"
done < "$ROOT/tools/sitemap-baseline.txt"

# Must return 404: Jekyll's duplicate render of every post source.
for md in "$ROOT"/blog/posts/*.md; do
  name="$(basename "$md" .md)"
  expect 404 "$BASE/blog/posts/$name.html"
done

# Careers: the listing returns 200, the role sources 404.
expect 200 "$BASE/careers/"
for md in "$ROOT"/careers/roles/*.md; do
  name="$(basename "$md" .md)"
  expect 404 "$BASE/careers/roles/$name.md"
  expect 404 "$BASE/careers/roles/$name.html"
done

# Must return 404: private files and build inputs.
for path in \
  /blog/articles-to-copy.csv \
  /etc/syntaric_12.2025.pdf \
  /package.json \
  /package-lock.json \
  /README.md \
  /partials/nav.html \
  /tools/strands.js \
  /data/snapshot.json \
  /docs/strand-rules.md \
  /docs/strand-rules.html
do
  expect 404 "$BASE$path"
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi
echo "check-deploy: all URLs returned the expected status"
