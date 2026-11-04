# Syntaric Landing Page

The static site for Syntaric - Healthcare Interoperability Consulting, served by
GitHub Pages from `main`. One local Node build writes every generated file;
the output is committed, and nothing builds on deploy.

## Structure

```
index.html          Home page. Hand-edited, except its marker regions (see below)
_config.yml         GitHub Pages (Jekyll) exclude list: what is NOT published
robots.txt          Crawler instructions (points to sitemap)
sitemap.xml         Generated — do not edit by hand
assets/
  site.css          The one stylesheet source, inlined into every page
partials/
  nav.html          Shared header and mobile menu
  footer.html       Shared footer
tools/
  markers.js        Marker-region replacement used by the build
  check-links.js    Link, anchor and sitemap-baseline check
  image-size.js     PNG/JPEG dimensions for <img width/height>
  check-deploy.sh   Post-deploy URL check (200s and 404s)
  sitemap-baseline.txt  The 19 URLs that must keep working
  test/             Unit tests (node --test)
docs/               Design documents (not published)
etc/                Logos and company documents
images/             Diagrams and product images
blog/
  build.js          Site build script
  posts/            Markdown source files (edit these; not published)
  index.html        Generated — do not edit by hand
  <slug>/
    index.html      Generated — do not edit by hand
```

---

## Before every commit

```bash
npm install        # first time only
npm run build      # regenerate everything
npm run check      # unit tests, build --check, link check
```

`npm run check` fails if:

- a generated file or a marker region differs from what the build would write
  (someone edited generated output by hand, or forgot to build);
- any generated file, `index.html` or anything under `preview/` contains
  `TODO-OWNER` (a fact only the owner can supply is still missing);
- an internal link or `#anchor` is broken, a URL from
  `tools/sitemap-baseline.txt` is missing from `sitemap.xml`, or one of the 8
  home anchors (`services`, `engagements`, `expertise`, `products`,
  `openfhir`, `unio`, `collaborators`, `contact`) is gone.

### Marker regions in `index.html`

The build rewrites only the content between these markers. Edit outside them;
anything inside is overwritten on the next build.

| Region | Filled from |
|---|---|
| `<!-- @css -->…<!-- /@css -->` | `assets/site.css` (`@shared` + `@page home`) |
| `<!-- @nav -->…<!-- /@nav -->` | `partials/nav.html` |
| `<!-- @footer -->…<!-- /@footer -->` | `partials/footer.html` |

To change styles, edit `assets/site.css`. Its three marker comments,
`/* @shared */`, `/* @page home */` and `/* @page blog */`, split it: the
home page gets shared + home, blog pages get shared + blog.

---

## Writing a Blog Post

### 1. Create a markdown file in `blog/posts/`

Name it `YYYY-MM-DD-your-post-slug.md`. The date prefix controls sort order on the listing page (newest first).

```
blog/posts/2026-04-01-my-post-title.md
```

### 2. Add frontmatter at the top

```yaml
---
title: Your Full Post Title
slug: your-post-slug
image: ../../blog/your-post-slug/cover.png
description: One-line SEO description — also used for Open Graph. Keep it under 155 characters.
excerpt: A slightly longer teaser shown on the blog listing card (1-2 sentences).
tag: Architecture
author: Gasper Andrejc
authorRole: Healthcare Interoperability Architect
authorBio: Healthcare Interoperability Architect & Consultant at Syntaric. 10+ years building FHIR, openEHR, and IHE solutions across Europe and the US.
authorLinkedIn: https://www.linkedin.com/in/andrejcgasper/
date: 2026-04-01
updated: 2026-04-15
publish: true
breadcrumb: Short label shown in breadcrumb nav
topics: [FHIR, openEHR, Architecture]
---
```

- `image`: the cover, relative to the post page. It is also the LinkedIn
  preview image; the build fails if the file does not exist.
- `updated` (optional): last substantial edit; used for the sitemap date.
- `publish: false`: the page is still written but marked `noindex` and left
  out of the listing and the sitemap.
- Link to other posts as `/blog/<slug>/`.

### 3. Write the body in Markdown

Standard Markdown — headings, bold, lists, links, code blocks, tables all work.

**Special elements:**

| Markdown | Renders as |
|---|---|
| `## Heading` | Section heading with anchor (auto-added to sidebar TOC) |
| `> blockquote` | Highlighted callout box |
| `**bold**` | Bold text |
| `` `inline code` `` | Styled inline code |
| ` ```code block``` ` | Dark code block |

### 4. Build, check, commit

```bash
npm run build
npm run check
git add blog/posts/ blog/index.html blog/<your-slug>/ sitemap.xml
git commit -m "Add post: your post title"
git push
```

---

## After each deploy

1. Run `tools/check-deploy.sh`. It checks that every baseline URL returns 200
   and that private files and Jekyll's duplicate post pages return 404.
   `_config.yml` is a deny-list: a new private file is public until it is
   added there.
2. Check the link preview in [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
   for `/`, `/blog/` and every changed post.
3. Links posted on LinkedIn carry
   `?utm_source=linkedin&utm_medium=social&utm_campaign=<post-slug>`, because
   the LinkedIn in-app browser often drops the referrer.
