# Design tokens

Status: **frozen** after the first run of the peer test and the 5-second
test passed on the 0.5a mockups (2026-11-04, `docs/test-results.md`).
Redesign item 23b, decision E1.

Commits 0.5, 0.6 and 1.7 implement this file and add no values outside it.
A value missing here is added here first, with the reason, and reviewed by
the owner with the screenshots of the commit that needs it.

The mockups were deleted after the tests; their source is in git at commit
`2a685c8` (`preview/1ne1c5bdaxbcao/index.html`).

## Colour

One ink, its tints, one ground. Contrast is against the ground `#f6f3ee`
(WCAG 2 luminance formula). Tints used for text reach 4.5:1.

| Token | Value | Contrast | Use |
|---|---|---|---|
| `--ground` | `#f6f3ee` | | Page background |
| `--ink` | `#122e49` | 12.5:1 | Text, headings, primary button, the only accent |
| `--ink-2` | `#40556a` (80% navy) | 7.0:1 | Secondary text |
| `--ink-3` | `#56697a` (70% navy) | 5.1:1 | Labels, meta, mono keys |
| `--rule` | `#bdc2c5` (25% navy) | 1.6:1 | Rules, borders, link underlines; never text |
| `--hair` | `#dbdbda` (12% navy) | 1.2:1 | Hairlines between items |
| `--panel` | `#ece9e3` (5% navy) | | Quiet panels, code backgrounds |

Product colours appear only inside their own blocks (#5):

| Token | Value | Use |
|---|---|---|
| `--fire-1` | `#c32a30` | openFHIR strand gradient start |
| `--fire-2` | `#df5c34` | openFHIR strand gradient middle |
| `--fire-3` | `#fe933a` | openFHIR strand gradient end; never text (2.0:1) |

The text-zone rule for figures: no pixel inside a text zone has a contrast
above 1.2:1 against the ground (a 10% navy tint, `#dfdfde`).

## Type

Atkinson Hyperlegible Next for text and headings; Atkinson Hyperlegible Mono
for paths, data and labels (decision #7). Self-hosted, see
`assets/fonts/`.

| Token | Value | Use |
|---|---|---|
| `--font` | `'Atkinson Hyperlegible Next', 'Atkinson Next Fallback', sans-serif` | |
| `--mono` | `'Atkinson Hyperlegible Mono', 'Atkinson Mono Fallback', monospace` | |
| `--t-xs` | `0.8125rem` (13 px) | Mono labels, figure keys |
| `--t-s` | `0.9375rem` (15 px) | Nav, meta, captions, item facts |
| `--t-m` | `1.0625rem` (17 px) | Body, line-height 1.55 |
| `--t-l` | `1.375rem` (22 px) | Item names, the proof line from 640 px |
| `--t-xl` | `1.75rem` (28 px) | Section headings, line-height 1.2 |
| `--t-post` | `clamp(1.875rem, 2.6vw + 1.1rem, 2.75rem)` | Blog post titles: 30-44 px, line-height 1.12, max-width 22ch. Added in 0.5: post titles are longer than the home H1, so `--t-hero` would wrap them to 4+ lines |
| `--t-hero` | `clamp(2.125rem, 5.2vw + 0.9rem, 3.5rem)` | H1: 34 px at 390, 56 px from about 1100 px; line-height 1.08, weight 700, letter-spacing -0.02em, max-width 14ch |

Headings are weight 700. The proof line is 19 px (`1.1875rem`, line-height
1.45) below 640 px. Figure text: 11 px mono, heads 10 px in `--ink-3`.

## Space and layout

| Token | Value |
|---|---|
| `--s-1` … `--s-9` | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| `--measure` | `36rem`: longest line of running text |
| `--page` | `72rem`: page width, with `--s-5` side padding |
| `--radius` | `4px`: buttons and the Menu button; no pills |

Breakpoints: **640 px** (phone to tablet: proof line size, nav menu below)
and **960 px** (two-column layouts: hire list, product block, hero figure
behind the text).

## Components (as tested)

*   **Header:** height 64 px, `--hair` bottom border, links in `--ink-2` at
    `--t-s`. Contact is a filled `--ink` button with `--ground` text.
*   **Primary button:** `--ink` fill, `--ground` text, weight 700, padding
    14 px 26 px, `--radius`.
*   **Secondary action:** a text link in `--ink`, underline in `--rule`,
    offset 4 px, 1 px thick.
*   **Proof line:** a 1 px `--ink` rule above, a `--hair` rule below,
    `--s-5` vertical padding, max-width 44rem.
*   **Hire list items:** separated by `--hair` rules; name at `--t-l`;
    facts as a two-column grid (6.5rem keys in `--mono` `--t-xs` `--ink-3`,
    values in `--t-s` `--ink-2`). Two columns from 960 px. No icons,
    badges or numbering.
*   **Product block:** text and figure side by side from 960 px (1 : 1.1),
    stacked below. Link out as a text link.
*   **Figure caption:** `--t-s`, `--ink-2`, max-width `--measure`, below
    the figure.

## Motion

Defined, not yet used (Stage 1).

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--dur-short` | `200ms` |
| `--dur-long` | `900ms` |

`prefers-reduced-motion: reduce` sets both durations to 0.

## Blog (commit 0.5, from the tokens above)

*   **Post header:** on the ground, no gradient. Breadcrumb in `--t-s`;
    the post tag as a `--mono` `--t-xs` label (no pill); title at
    `--t-post`; one meta line (author, role, date, read time) in `--t-s`
    `--ink-2`; a 1 px `--ink` rule below, as the proof line.
*   **Post layout:** article first at every width; from 960 px a 17.5rem
    sidebar, sticky. Body max-width 44rem, text `--t-m` at line-height
    1.65. Code blocks `--ink` with `--ground` text; inline code on
    `--panel`. Images, cover and slides: 1 px `--hair` border, `--radius`.
*   **Sidebar:** sections split by `--hair` rules (the first by `--ink`),
    mono labels, plain links. No cards, shadows or brand-coloured share
    button.
*   **End-of-post block:** `--ink` rule above, the text at `--t-l`, the
    primary button and a text link.
*   **Listing:** page title at `--t-hero`; the newest post as a featured
    row (cover 1.2 : text 1 from 960 px), then a grid of 1 / 2 / 3 columns
    at < 640 / 640 / 960 px. Covers at 16:9, `object-fit: cover`. No
    shadows, card borders or hover lift; the title underlines on hover.

## Share card (commit 1.7, decision E9)

1200 × 627 PNG, rendered by `tools/share-card.js` with resvg from the TTF
copies of the faces in `tools/fonts/`.

| Element | Value |
|---|---|
| Ground | `--ground` |
| Logo | the feather, 56 high at (72, 64), with "Syntaric" in Next Bold 34 beside it |
| Title | Next Bold 50, line-height 60, first baseline 270, at most 620 wide (about 25 characters by the face's average advance of 0.497 em), at most 3 lines, ellipsis after the third |
| Kicker | Mono 22 in `--ink-3`, baseline 566: "Healthcare interoperability consultancy" on posts; `syntaric.com` on the home card (its title already says it); the blog's description on the blog card |
| Art | `cardArt()`, the hero field's look without labels: a faint bundle (8 % navy, `#e4e3e1`) across the card, a light bundle (`#c9cdd0`) and the two hooked data strands (40 % navy, `#9ba4ac`) right of the title area |

Approved by the owner on 2026-11-04 (commit 1.7), after one change: the art follows the hero field in light tints instead of two full-navy blades.

## Not in the mockups yet

These follow from the tokens above and are reviewed with the screenshots of
the commit that builds them:

*   Selected work, Products (Unio), Recent writing and talks, Contact and
    the footer (commit 0.6).
