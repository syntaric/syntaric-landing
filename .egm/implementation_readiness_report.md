# Stage 9: Implementation Readiness Report

**Target:** `docs/designs/site-redesign.md`, lines 900-1899 (Detailed Implementation Plan, Verification Plan, Decisions Log)
**Round:** 1
**Goldfish context:** none beyond the document and the files it names
**Reviewers:**

| Reviewer | Standard | Status | Raw findings |
| --- | --- | --- | --- |
| `egm-implementation-readiness` | implementation-readiness-standard | completed | 1 Blocker, 16 Major, 10 Nit |
| `egm-codebase-details` | implementation-readiness-standard | completed | 3 Blocker, 15 Major, 10 Nit |
| `egm-style` | (persona rules) | completed | 0 Blocker, 10 Major, 19 Nit |

**Verdict: not ready to implement.** After deduplication: 4 Blockers, 28 Majors, 24 Nits.
Where reviewers gave the same issue different severities, the highest is kept.

The Elephant spot-checked these claims against the repository, and all held:

- `blog/build.js:745,759,765` write today's date into the sitemap.
- No commit after 0.3 modifies `assets/site.css`.
- `index.html:199` hotlinks `open-fhir.com`.
- `package.json` has no `build` script.
- `build.js:285` already emits `noindex` for drafts.
- The webinar post embeds a `player.vimeo.com` iframe at line 23.

---

## 🔴 Blockers

### B1. The new visual system has no specification and no commit that builds it
*   **Scope:** lines 924-950 (Commit order), 1021-1042 (item 8), commits 0.4-0.6 (1135-1286)
*   **Sources:** IR-1-1
*   **Problem:** Item 8 says commit 0.3 ports "today's look" and "the new look lands in 0.4-0.6". But no item in 0.4, 0.5, 0.5a or 0.6 modifies `assets/site.css`.
    *   Item 8 also lists things that cannot exist yet in 0.3:
        *   new palette tokens;
        *   `@font-face` for fonts that arrive in 0.4;
        *   layouts for the 8-part structure that arrives in 0.6.
    *   The 0.5a mockups need "the new fonts and palette" before any commit writes them.
    *   No concrete values are given for: type scale, spacing scale, navy tints, `--ease`, `--dur-short`/`--dur-long`, breakpoints, or the post hero that replaces the gradient.
*   **Why it blocks:** this is the core deliverable of the redesign. Without values or a referenced mockup, the implementer designs the site.

### B2. `--check` reports drift on every new day
*   **Scope:** lines 1086-1089 (item 12), 1177 (item 20), 1058-1064 (item 10), 1592-1596 (Verification)
*   **Sources:** CD-1-1 (Blocker), IR-1-3 (Major)
*   **Problem:** `blog/build.js:745` sets `today`, and lines 759 and 765 write it as `<lastmod>` for `/` and `/blog/`. Item 20 changes only the post entries.
    *   `--check` rebuilds in memory and compares against `sitemap.xml`, so it fails on any day after the last build. Item 16 tells the owner to run it before every commit.
    *   A computed footer year has the same problem at New Year.
*   **Needed:** where these dates come from (for example, the newest post's `updated`/`date`), and whether the footer year is fixed text.

### B3. `npm run check` cannot pass at commit 0.3
*   **Scope:** lines 1112-1122 (item 15), 1103-1108 (item 14), 930-937 (Commit order)
*   **Sources:** CD-1-2 (Blocker), IR-1-2 (Major)
*   **Problem:** from commit 0.3, `check-links.js` fails any script or stylesheet from a host other than syntaric.com and `gc.zgo.at`. Two such hosts are still loaded until commit 0.4:
    *   GA4: `index.html:5`, `blog/build.js:273`
    *   Google Fonts: `index.html:77`, `blog/build.js:314,611`
*   **Why it blocks:** every phase must build and pass its own checks.
*   **Needed:** move the host rule to 0.4, or allow-list the old hosts until then.

### B4. The 0.3 nav links "Writing" to an anchor that never exists
*   **Scope:** lines 1049-1051 (item 9), 1040-1042 (item 8), 1274 (item 25)
*   **Sources:** CD-1-3 (Blocker), IR-1-2 (Major)
*   **Problem:** the nav order "Services, Selected work, Products, Writing, Blog" ships in 0.3.
    *   The "Recent writing and talks" section arrives in 0.6, and no item gives it an `id`. It is not one of the 8 anchors in Goal 9.
    *   The fragment check fails from 0.3 to 0.6.
    *   Relabelling the nav in 0.3 also contradicts "the commit only moves code". Today's labels are at `index.html:1277-1283` and `blog/build.js:205-209`.
*   **Needed:** name the id (for example `id="writing"`), and add the new labels in 0.6.

---

## 🟡 Majors

### Build, tooling and commit integrity

**M1. Third-party loads that the host check cannot see.**
*   **Scope:** lines 1190-1198 (item 22), 1119-1120 (item 15), 1300-1308 (Commit 0.7), 1166-1169 (item 20)
*   **Sources:** IR-1-4, CD-1-8, CD-1-9
*   **The loads:**
    *   **Vimeo iframe:** the webinar post embeds `player.vimeo.com` (post line 23). Item 22 does not mention it. It breaks Goal 10 and possibly decision #12 (no cookies).
    *   **pdf.js at runtime:** it is injected through `loadScript()`, not through a static `<script src>`.
    *   **Home hero background:** `index.html:199` hotlinks `open-fhir.com`. Item 20 removes only the blog copy (`build.js:618`), and 0.3 ports the home one into `site.css`.
*   **Gap:** `check-links.js` inspects only static scripts and stylesheets, so it catches none of these.
*   **Needed:**
    *   a decision on Vimeo: a documented exception, `?dnt=1`, or a click-to-load facade;
    *   an item that removes the home hotlink;
    *   a host rule that also covers iframes, CSS `url()` and script-injected URLs.

**M2. `npm run build` is used in 0.2 before it exists.** Lines 1016-1017 (item 7). `package.json` defines only `build:blog` and `blog`; `build` arrives in 0.3 (item 14). *Sources: CD-1-17.*

**M3. No automated tests for the new modules.**
*   **Scope:** lines 1589-1623 (Verification Plan)
*   **Sources:** IR-1-16, CD-1-18
*   **Problem:** no test runner and no `npm test` script are planned. No happy-path or edge-case tests are listed for:
    *   `markers.js`: missing, duplicated and unbalanced markers;
    *   `data-rules.js`: each rule, base64 over 64 characters, and the `removed` output;
    *   `snapshot.js`: refusing `_clients/` and entries without `validated`;
    *   `strands.js`: the text-zone intersection;
    *   `share-card.js`: 3-line wrap and ellipsis;
    *   `check-links.js`: a broken fragment and a foreign host;
    *   `--check`: drift detection.

**M4. Commit 1.4 tells the implementer to edit generated output.** Lines 1517-1519. The step "delete the hero `data-motion` attributes" edits `hero.svg`, but `strands.js` writes those attributes (items 43-44), so the next build restores them. The step should name the change to `hero()`. *Sources: IR-1-17.*

**M5. Line references point to the wrong lines once earlier commits land.**
*   **Scope:** lines 1146-1147, 1156-1157, 1166-1173, 1252-1253, 1306 (items 18, 19, 20, 25, 28)
*   **Sources:** ST-1-1 (Major), IR nit
*   **Problem:** these items cite line numbers from before 0.3. Item 12 deletes `build.js:124-227`, and item 13 removes about 1,190 lines of `<style>` from `index.html`. After those commits, every later citation is off.
*   **Needed:** tie each citation to a named baseline commit, or anchor it by a symbol, selector or string.

### Blog template changes (items 6 and 20)

**M6. Item 6 gets today's JSON-LD wrong.** Lines 1004-1010.
*   **Sources:** CD-1-5 (Major), IR nit
*   **Problem:** today's Article JSON-LD has no `image` property. `imgUrl` feeds only `publisher.logo.url` (`build.js:263`). Repointing `imgUrl` turns every post's publisher logo into its cover image.
*   **Needed:** say "add an `image` property" and keep `publisher.logo` separate.

**M7. Item 20 "adds" a draft `noindex` that already exists.** Lines 1175-1176. `build.js:285` already writes `noindex, nofollow` for `publish: false`, so following the text as written adds a second robots tag. *Sources: CD-1-4 (Major), IR nit.*

**M8. Item 20 misses most of the blog's template patterns.** Lines 1166-1173. *Sources: CD-1-6.*
*   **Glows and gradients not listed:**
    *   `.blog-hero::before` (621)
    *   `.post-visual` (637-638)
    *   `.post-visual-sm` (646-647)
    *   the gradient avatar (659)
*   **Fade-ups not removed:** no item removes the `.animate`/`.delay-*` classes (`build.js:399, 430, 492, 523, 673, 677, 678`) or the `fade-up` keyframes (187-192), and 0.3 ports them.

**M9. The 0.3 port carries nested CSS.** Lines 1039, 1041, 1166-1167. `build.js:342` nests `.article-sidebar` inside `.article-layout`, so a verbatim port breaks item 8's "no nested CSS" rule. `order: -1` appears twice (341 and 342), but item 20 refers to it once. *Sources: CD-1-7 (Major), IR nit.*

### Content and copy

**M10. No one is named to write the page copy, and some owner inputs are needed earlier than the table says.**
*   **Scope:** lines 902-922, 1184-1188, 1209-1226, 1242-1286, 1173, 1275
*   **Sources:** IR-1-5, ST-1-4
*   **Problem:**
    *   Item 25 asks for "every line in brief 4.6 rewritten", plus new headings, product outcome lines, evidence lines and a page title and description. Brief 4.6 says the owner must supply the facts.
    *   The outcome lines, evidence lines and item 21's "next step" sentence are missing from the owner-input table.
    *   The table says the proof line (#8) and the item names (#9) are needed by 0.6, but the 0.5a mockups need them first.
    *   "The plain voice" (lines 1173, 1275) is defined nowhere in the document or the brief.
*   **Needed:** supply the copy, or add each piece to the owner-input table with "Needed by 0.5a" where it applies. Point to brief 2.8 and the model lines as the definition of the voice.

**M11. Client logos are created but nothing puts them on the page.** Lines 1302-1308 (item 28) against 1259-1262 (item 25). The client list is "one line per entry", with no logos. Decide where they appear and at what size, or cut item 28. *Sources: IR-1-7.*

**M12. The content check contradicts the inventory.** Line 1619 against 1235-1237. The inventory deliberately lists items that are dropped, so "every row is found on the page" fails by design. Reword it to "every row not marked dropped". *Sources: ST-1-5.*

**M13. No method is given for image dimensions, formats or paths.** Lines 1170-1172 (item 20), 1288-1293 (item 26).
*   **Sources:** IR-1-6, CD-1-10
*   **Problem:**
    *   17 covers in mixed formats need `width`/`height`. The build's only dependency is `marked`, and no front matter carries dimensions.
    *   The front-matter `image` paths (`../../blog/<slug>/…`) are wrong when used from `index.html`.
    *   No item converts covers to AVIF/WebP or changes how `marked` renders `<img>` inside posts.
*   **Needed:** the method (front matter, a header reader, or a dependency) and the path-rewrite rule.

### Figures and data

**M14. Figure data sources are incomplete, and the snapshot format is not defined.**
*   **Scope:** lines 1378-1407 (items 38-41), 1449-1456, 1527-1530, 1263-1266
*   **Sources:** IR-1-9, CD-1-11, CD-1-12
*   **Missing sources:**
    *   The openFHIR figure shows "one Observation", but no listed source contains an Observation.
    *   The Unio figure (query and repository text) has no source at all.
*   **Unresolved paths and validation:**
    *   "openFHIR KDS diagnose ... test resources" has no path, and copies exist in several trees (`OPENFHIR/openfhir/core/src/test/resources/kds/diagnose/`, `tmp/`, worktrees).
    *   There is no standalone Condition file.
    *   The `.flat.json` file and the FHIRConnect YAML are not FHIR resources, so the HL7 Validator cannot mark them `validated`, yet `snapshot.js` refuses unvalidated entries.
*   **The mapping excerpt:**
    *   `eps.adverse_reaction_risk.v2.yml:21-42` holds only 4 pairs, not 5-6.
    *   Its values are placeholders (`$resource`, `$archetype`). Whether to expand them is open, and Goal 5 depends on the answer.
*   **Undefined formats:** the YAML `select` format, the `data/snapshot.json` schema and the entry ids each figure reads.

**M15. The `strands.js` API contradicts itself, and the figures have no geometry.**
*   **Scope:** lines 1421-1441 (items 42, 42a), 1491-1497 (item 47)
*   **Sources:** IR-1-10, CD-1-13
*   **Contradictions:** `hero(snapshot)` takes one argument, but the same item says it "takes the text-zone rectangle". Item 47 passes "a time parameter" that no function accepts. The types of `from` and `to` are not given.
*   **Missing:**
    *   how `PROFILE`, `GAP` and `NOTCH` are measured from the SVG;
    *   `viewBox`, size, label positions and layout for each of the four figures.

**M16. The build-time text-zone check cannot guarantee a clear zone in the browser.** Lines 1431-1432, 1466-1474.
*   **Sources:** IR-1-11
*   **Problem:** the zone is the HTML text box plus 32 px, which changes with viewport width and fonts, and the build cannot measure it.
*   **Needed:** a fixed rectangle in SVG coordinates and the CSS mapping for every width from 960 px up (`preserveAspectRatio`, sizing, anchoring).

**M17. The divider cannot be repeated with the marker tool.** Lines 1532-1537 (item 49b), 1069-1071 (item 11).
*   **Sources:** IR-1-8, CD-1-14
*   **Problem:** CSS cannot copy markup, and `markers.js` errors on duplicate markers. A CSS background image would turn the margin note into an image of text.
*   **Needed:** the mechanism (numbered regions, `<use href>`, or the build adding the markup) and which section breaks get a divider.

### Motion and the hero gate

**M18. How motion is driven is ambiguous.** Lines 1036-1038, 1476-1490 (item 46), 1550-1555 (item 50).
*   **Sources:** IR-1-12
*   **Open points:**
    *   **CSS vs WAAPI:** item 46 drives motion with the Web Animations API, and item 50 adds "motion CSS for draw, align and fan-out". How the two divide the work is not stated.
    *   **Reset jump:** the figure is painted finished, then reset after `load`. On desktop, where it sits behind the text, the visitor will see it jump.
    *   **Path length:** `pathLength` attribute or `getTotalLength` is not chosen.
    *   **Values:** easing and durations are not stated.
    *   **Choreography:** what moves, in what order and for how long is not given, so A and B cannot show "the same motion".

**M19. Prototype B is underspecified.** Lines 1499-1508 (item 49), 1515-1519.
*   **Sources:** IR-1-13, CD-1-15
*   **Gaps:**
    *   **Poster:** `poster` needs a published URL, but `partials/` is excluded from publishing.
    *   **Playback:** there is no `autoplay`, and nothing names the script that starts playback.
    *   **Reduced motion:** behaviour is not specified (CUJ 3 requires no motion).
    *   **Controls:** pause/play is not specified (`aria-pressed`, 24x24 px).
    *   **Resolution:** video resolution per layout is not given.

**M20. The owner cannot view the gate build on a phone.** Lines 1443, 1501-1523. The prototypes live on branch `hero-prototypes`, but Pages serves only main, and line 1222 already notes there are no preview deploys. Viewing inside the LinkedIn app needs a public URL. Name the publish route, for example an unlisted `preview/` path, as in 0.5a. *Sources: IR-1-14.*

**M21. The test devices cannot be reproduced.** Lines 1512-1513, 1607-1608, 1614-1616, 1702-1703. "An older iPhone", "a mid-range Android" and "from Europe" name no model, OS version or WebPageTest preset. *Sources: ST-1-9.*

**M22. The "10% navy" text-zone criterion is ambiguous.** Line 1613. It could mean alpha ≥ 0.1, or a 10% navy tint mixed into the ground. Define a measurable value. *Sources: ST-1-10.*

### Share cards

**M23. Share-card layout and coverage have gaps.** Lines 1559-1587 (items 52-56), 1597-1599.
*   **Sources:** IR-1-15, CD-1-16
*   **Gaps:**
    *   No layout values: font size, line height, logo and strand positions, or the "average character width" used to break lines.
    *   No home card title text.
    *   No card for `/blog/`, although Verification expects one. Today it uses `etc/syntaric_logo_2.png`.
    *   No `og:image` rule for drafts.

### Decisions Log and success criteria

**M24. The real-user LCP and INP targets cannot be measured.** Lines 1839, 1842 against 1606-1610 and 1884-1889. Real-user telemetry is dropped, and Verification never measures INP. *Sources: ST-1-6 (Major), IR nit.*

**M25. The peer-test threshold does not scale with group size.** Lines 1663, 1670-1672 (#3). "5 or more peers" passes at "at least 4 of 5", and no rule is given for 6 or more. State it as a proportion or as "all but one". *Sources: ST-1-7.*

**M26. "Step 5 of Stage 1" does not resolve.** Lines 1707-1708 (#4). It most likely means "in commit 1.4" or "before 1.5". *Sources: ST-1-8 (Major), IR and CD nits.*

**M27. Item 51 is missing.** Lines 1550-1559. Numbering jumps from 50 to 52, and items are cited by number. *Sources: ST-1-3 (Major), IR and CD nits.*

**M28. Commit 1.6 is misnamed.** Lines 949, 1548. It is called "Motion runtime", but `motion.js` is created in 1.3, and 1.6 only adds scroll moments. *Sources: ST-1-2.*

---

## 🟢 Nits

| # | Scope | Issue | Sources |
| --- | --- | --- | --- |
| N1 | 1174 | The read-time fix needs a signature change: `buildPostPage` uses `bodyHtml` (`build.js:236`), the listing uses `post.body` (488, 520). It is not said whether the `meta.readTime` override stays. | IR, CD-1-25 |
| N2 | 1737-1739 | Decision #13 lists 4 marker regions; the Technical Plan and item 11 list 8. "…" vs "...". | IR, CD-1-23, ST-1-N9 |
| N3 | 1262-1263 vs 1543-1544 | The mapping excerpt lasts "until 1.3" in one place and is removed in 1.5 in another. | IR |
| N4 | 906-908, 1088-1089 | The `TODO-OWNER` scan has no file globs: is `preview/` in? `docs/` must be out, since this file contains the string. | IR |
| N5 | 974 | `check-deploy.sh` checks `/docs/strand-rules.md`; Pages may render it as `.html`. | IR |
| N6 | 1031-1033, 1139-1141, 1284, 1348, 1363, 1600 | Small open choices: font subsetting tool, fallback override values, GoatCounter event names, maskable icon safe zone, exact `@resvg/resvg-js` pin, which 3 posts axe checks (include the webinar post), axe needs a browser driver. | IR, CD-1-28 |
| N7 | 1310-1313 | Item 29 lists one `.webp` but creates WebP and AVIF at 1x and 2x. | IR, CD-1-22, ST-1-N19 |
| N8 | 1052-1054 | The unio-landing nav toggle toggles `nav-open` on `body` with inline `onclick`, not "the button's parent". | CD-1-19 |
| N9 | 1173 | The blog copy line list omits `build.js:678`. | CD-1-20 |
| N10 | 1156-1157 | Google Fonts preconnects at `build.js:312-313, 609-610` not listed. | CD-1-21 |
| N11 | 1046-1047 | The partial gives the home logo `href=""` (today `#`) and drops `navHtml`'s `activeBlog` state. | CD-1-24 |
| N12 | 1124-1133 | The README front-matter template (`README.md:41-55`) lacks `image`, `publish`, `updated`. | CD-1-26 |
| N13 | 1290 | Latest-posts sort key unstated; the build sorts by filename, and one post's filename date differs from its `date`. | CD-1-27 |
| N14 | 927-928 | "Defects that hurt every visitor": 0.1 and 0.2 do not. | ST |
| N15 | 1052, 1090 | "A tiny inline script"; "Pin behaviour: no change to..." is unclear. | ST |
| N16 | 1271-1272, 1297 | "Base64 noise", "generic boxes" are value judgements. | ST |
| N17 | 1330, 1419, 1446-1447, 1675, 1724 | "Reconciled at Step 6" refers to a drafting step. Use section and item references. | ST |
| N18 | various | Item template inconsistent (missing Why or Type lines; bodiless items 41, 48, 56). `docs/hero-gate.md` and `docs/test-results.md` are created without item numbers. | ST |
| N19 | 1054 vs 1335, 1343, 1392 | `/home/gandrejc/...` mixed with `~/...`. | ST |
| N20 | 1631-1866 | Decisions Log out of numeric order; Share-card rendering unnumbered. | ST |
| N21 | 1854, 1859-1860 | The marquee is "replaced" by both the proof line and Selected work. | ST |
| N22 | 1758 | The orange contrast is quoted against white (2.2:1); against `#f6f3ee` it is about 2.0:1. | ST |
| N23 | 1281, 1395, 1384, 1897-1899, 1120 | "FHIR Connect" vs "FHIRConnect"; KDS and EGM not expanded; code formatting inconsistent. | ST |
| N24 | 1598-1618, 1680-1686, 1725-1727, 1787, 1791-1792, 1878, 919-921 | Wording: "the right card", "skip every figure" (figcaptions are read), "after the hero settles", "other GoatCounter paths", "CIO type", a garbled GoatCounter sentence, "owner confirms terms" missing from owner inputs, "reverse a Non-Goal", "draft kept", share-card fill location contradicts item 52, owner-input "Needed by" columns off by one commit. | ST |

---

## Traceability matrix

| Raw finding | Consolidated |
| --- | --- |
| IR-1-1 | B1 |
| IR-1-2 | B3, B4 |
| IR-1-3 | B2 |
| IR-1-4 | M1 |
| IR-1-5 | M10 |
| IR-1-6 | M13 |
| IR-1-7 | M11 |
| IR-1-8 | M17 |
| IR-1-9 | M14 |
| IR-1-10 | M15 |
| IR-1-11 | M16 |
| IR-1-12 | M18 |
| IR-1-13 | M19 |
| IR-1-14 | M20 |
| IR-1-15 | M23 |
| IR-1-16 | M3 |
| IR-1-17 | M4 |
| IR nits | M5, M6, M7, M9, M24, M26, M27, N1-N7 |
| CD-1-1 | B2 |
| CD-1-2 | B3 |
| CD-1-3 | B4 |
| CD-1-4 | M7 |
| CD-1-5 | M6 |
| CD-1-6 | M8 |
| CD-1-7 | M9 |
| CD-1-8, CD-1-9 | M1 |
| CD-1-10 | M13 |
| CD-1-11, CD-1-12 | M14 |
| CD-1-13 | M15 |
| CD-1-14 | M17 |
| CD-1-15 | M19 |
| CD-1-16 | M23 |
| CD-1-17 | M2 |
| CD-1-18 | M3 |
| CD-1-19 … CD-1-28 | N1, N2, N6-N13, M27 |
| ST-1-1 | M5 |
| ST-1-2 | M28 |
| ST-1-3 | M27 |
| ST-1-4 | M10 |
| ST-1-5 | M12 |
| ST-1-6 | M24 |
| ST-1-7 | M25 |
| ST-1-8 | M26 |
| ST-1-9 | M21 |
| ST-1-10 | M22 |
| ST nits 1-19 | N2, N7, N14-N24 |

## Elephant notes

*   **The findings cluster in two places.**
    *   *Undecided design:* B1, M14, M15, M16, M18, M23. These need owner or design decisions, not text edits.
    *   *Commit-order integrity:* B2, B3, B4, M2, M4. These have mechanical fixes.
*   **Most style Majors are short wording fixes:** M12, M21, M22, M25-M28.
*   **Resolving B1 is the main structural change.** Item 8 must be split into "port" and "new system", and the new token values must be written down or linked to the 0.5a mockups as the source.
