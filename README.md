# Syntaric Landing Page

A professional static landing page for Syntaric - Healthcare Interoperability Consulting.

## Structure

```
index.html          Main landing page
robots.txt          Crawler instructions (points to sitemap)
sitemap.xml         Generated — do not edit by hand
etc/                Logos and company documents
images/             Diagrams and product images
blog/
  build.js          Blog generator script
  posts/            Markdown source files (edit these)
  index.html        Generated — do not edit by hand
  <slug>/
    index.html      Generated — do not edit by hand
```

---

## Writing a Blog Post

### 1. Install dependencies (first time only)

```bash
npm install
```

### 2. Create a markdown file in `blog/posts/`

Name it `YYYY-MM-DD-your-post-slug.md`. The date prefix controls sort order on the listing page (newest first).

```
blog/posts/2026-04-01-my-post-title.md
```

### 3. Add frontmatter at the top

```yaml
---
title: Your Full Post Title
slug: your-post-slug
description: One-line SEO description — also used for Open Graph. Keep it under 155 characters.
excerpt: A slightly longer teaser shown on the blog listing card (1-2 sentences).
tag: Architecture
author: Gasper Andrejc
authorRole: Healthcare Interoperability Architect
authorBio: Healthcare Interoperability Architect & Consultant at Syntaric. 10+ years building FHIR, openEHR, and IHE solutions across Europe and the US.
authorLinkedIn: https://www.linkedin.com/in/andrejcgasper/
date: 2026-04-01
breadcrumb: Short label shown in breadcrumb nav
topics: [FHIR, openEHR, Architecture]
---
```

### 4. Write the body in Markdown

Standard Markdown — headings, bold, lists, links, code blocks, tables all work.

**Special elements:**

| Markdown | Renders as |
|---|---|
| `## Heading` | Section heading with anchor (auto-added to sidebar TOC) |
| `> blockquote` | Highlighted callout box |
| `**bold**` | Bold text |
| `` `inline code` `` | Styled inline code |
| ` ```code block``` ` | Dark code block |

### 5. Build

```bash
npm run build:blog
```

This regenerates:
- `blog/index.html` — the listing page (all posts, newest first)
- `blog/<slug>/index.html` — the individual post page
- `sitemap.xml` — updated automatically with all post URLs and dates

### 6. Commit and push

```bash
git add blog/posts/ blog/index.html blog/<your-slug>/ sitemap.xml
git commit -m "Add post: your post title"
git push
```

> The generated HTML files are committed alongside the markdown source so the site works as a plain static host (GitHub Pages) with no build step on deploy.

---

## Deployment

Static files — deploy to any host:

- **GitHub Pages** — push to `main`, served automatically via the `CNAME` record
- Netlify / Vercel / traditional hosting also work fine

---

## Customization

All CSS lives inline in the `<style>` block of each HTML file. The design system uses CSS variables defined in `:root` — change colors there to update the whole site.