Status: resolved (auto accept, 2026-11-04). All PROPOSE FIX items applied; ESCALATE E1-E9 and DECLINE items not applied. Item numbers added: 15a, 17a, 19a, 20a, 26a (the stylesheet change proposed as "25a" sits after item 26), 31a; items 52-56 renumbered to 51-55. Not edited because they fall outside lines 900-End: Technical Plan line 327 (divider region list), 349 ("10% navy" wording), 503 (draft `noindex`), 545 (client logos, see E4).

# Goldfish Annotated Review Report

**Target:** `docs/designs/site-redesign.md` (lines 900-1899)
**Source findings:** `.egm/implementation_readiness_report.md` (Stage 9, round 1)
**Line baseline:** every proposed edit below names the text it replaces, so it still applies after earlier edits move lines.

## Summary

| Category | Count | Findings |
| --- | --- | --- |
| PROPOSE FIX | 44 | B1a, B2, B3, B4, M1a, M2-M9, M10a, M12, M13a, M14a, M15a, M16, M17, M18a, M19-M22, M23a, M24-M28, N1-N5, N7-N13, N22 |
| ESCALATE (owner decision needed) | 9 | B1b, M1b, M10b, M11, M13b, M14b, M15b, M18b, M23b |
| CONTEST | 0 | none |
| DECLINE (nits) | 9 | N6, N14-N21, N23, N24 |

Some findings mix a mechanical problem with a design decision. Those are split into
**a** (the fix) and **b** (the decision for you).
The **b** parts are under ESCALATE: nobody can tell from the repository what the
answer should be.

No finding is contested. Each one I checked matched the document or the code:

- `blog/build.js:241-265` (`imgUrl` feeds `publisher.logo`)
- `blog/build.js:340-341` (the nested `.article-sidebar` rule)
- `blog/build.js:745-765` (sitemap dates)
- `blog/build.js:217-227` (the footer year is the literal `2026`)
- `index.html:199` and `index.html:1270-1286`
- `package.json` (no `build` script)
- the header of the FHIRConnect YAML
- brief 1.1, which names "a logo wall" as a template tell

---

## Escalations (owner input needed)

### [E1 = B1b] [`egm-implementation-readiness`] - Severity: High
*   **Affected Scope:** [Lines 1021-1042](../docs/designs/site-redesign.md#L1021-L1042) (item 8), 1207-1286 (0.5a, 0.6)
*   **Discrepancy Description:** The plan has no values for the new visual system. Missing: the type scale, the spacing scale, the navy tints, `--ease`, `--dur-short` and `--dur-long`, the breakpoints other than 640 and 960, the layout of each home section, and the post hero that replaces the gradient.
*   **Rationale:** Without these values, the implementer designs the site.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** These are design choices, not facts in the repository. You can choose between two ways forward:
    *   **(1) Write the values into the plan now.**
    *   **(2) Let the 0.5a mockups set them, and freeze the result.** The 0.5a mockups are hand-built for the first peer test. They become the place where the values are chosen. When the tests pass, the values are written to a new file, `docs/design-tokens.md`, and commits 0.5 and 0.6 implement that file.
    *   Option 2 needs the plan to reorder 0.5 and 0.5a, so the mockups come before the blog templates. My recommendation is option 2: the peer test is meant to judge these values anyway.
*   ***Proposed Edit (if option 2):***
    *   **Commit order:** swap 0.5 and 0.5a, so the mockups come first.
    *   **Item 23a:** add the line "Output: `docs/design-tokens.md` (Create) records every `:root` token value, breakpoint and section layout used in the mockups. Commits 0.5 and 0.6 implement this file and do not add values outside it."
    *   **Item 8:** the token bullet then refers to `docs/design-tokens.md`.

### [E2 = M1b] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1190-1198](../docs/designs/site-redesign.md#L1190-L1198) (item 22)
*   **Discrepancy Description:** `2026-04-15-ips-on-openehr-webinar.md:23` embeds a `player.vimeo.com` iframe. Item 22 leaves it as it is, and nothing in the plan decides what to do with it.
*   **Rationale:** It breaks Goal 10 (no third-party requests besides analytics), and possibly decision #12 (no cookies).
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** This is a choice between privacy and convenience for one post. The options are:
    *   **(a) Click-to-load facade:** a poster image and a play button. The iframe is created only on click, so Goal 10 holds until the visitor chooses to play.
    *   **(b) Keep the iframe with `?dnt=1`:** a documented exception to Goal 10.
    *   **(c) Replace the embed with a link to Vimeo.**
    *   I recommend (a). The poster image needs no third-party request.
*   ***Proposed Edit (if a):*** add to item 22: "Replace the Vimeo iframe with a `<button>` showing a self-hosted poster (`blog/<slug>/video-poster.webp`, with `width`/`height`). On click, a script inserts the iframe with `?dnt=1`. Without JavaScript, the poster is a link to the Vimeo page."

### [E3 = M10b] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1242-1286](../docs/designs/site-redesign.md#L1242-L1286) (item 25), 1184-1188 (item 21)
*   **Discrepancy Description:** Nobody is named to write the new page copy.
    *   Item 25 asks for "every line in brief 4.6 rewritten", plus new headings, outcome lines, evidence lines and a page title and description.
    *   Brief 4.6 says "The owner must supply the replacement facts".
*   **Rationale:** Without a named writer, the implementer either invents the copy or stops.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** Only you can say whether the implementer drafts the copy for your approval, or you write it yourself. Either way, facts such as numbers, client names and outcomes stay `TODO-OWNER` (this is the doc's own rule).
*   ***Proposed Edit (if the implementer drafts):*** add to item 25: "The implementer drafts all copy that states no new fact, following the voice rule in item 25. Any claim of fact is `TODO-OWNER`. The owner approves the full copy in `docs/content-inventory.md` before 0.6 is committed."

### [E4 = M11] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1302-1308](../docs/designs/site-redesign.md#L1302-L1308) (item 28) against 1259-1262 (item 25)
*   **Discrepancy Description:** Item 28 creates one logo file per client, but item 25's client list is "one line per entry" with no logos.
*   **Rationale:** Either the logos have no place on the page, or the layout is missing.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** The document disagrees with itself.
    *   Technical Plan line 545 keeps self-hosted logos, but item 25 lists the clients without them.
    *   Brief 1.1 names "a logo wall" as a template tell, which supports the text-only list.
    *   I recommend cutting item 28, so the client list stays text only. Line 545, outside this range, would then also need an edit. If you want logos, the size and placement must be specified.
*   ***Proposed Edit (if cut):*** delete item 28. In item 25, add "Client names are text; no logos (brief 1.1)." In commit 0.7, the hotlinked client `<img>` tags go away with the old collaborator section in 0.6, so nothing is left to self-host.

### [E5 = M13b] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1170-1172](../docs/designs/site-redesign.md#L1170-L1172), 1288-1293
*   **Discrepancy Description:** The Technical Plan requires AVIF/WebP with `srcset` for raster images. No item converts the 17 blog covers or the images inside posts.
*   **Rationale:** No tool is named for the conversion, and none exists in the repository.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** This is a scope choice with two options:
    *   **(a) Convert the covers once with a dev dependency.** `sharp` can do it, but it is a native module.
    *   **(b) Keep the covers in their current formats.** Apply AVIF/WebP only to new images under `assets/img/`, and record the exception.
    *   I recommend (b) for this pass: covers below the first screen are lazy-loaded and do not count against the first-view budget.
*   ***Proposed Edit (if b):*** add to item 20: "Covers stay in their current format; AVIF/WebP applies to images under `assets/img/` only (accepted exception to Technical Plan, Assets)."

### [E6 = M14b] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1378-1407](../docs/designs/site-redesign.md#L1378-L1407) (items 38-41), 1263-1266
*   **Discrepancy Description:** Several data sources for the figures are missing or undecided:
    *   No listed source contains an Observation, although the openFHIR figure shows "one Observation's fields".
    *   The Unio figure (query and repositories) has no source at all.
    *   The KDS path matches several copies on disk.
    *   The `.flat.json` file and the FHIRConnect YAML are not FHIR resources, so the HL7 Validator cannot mark them `validated`.
    *   The FHIRConnect values are placeholders (`$resource.code`, `$archetype/...`).
*   **Rationale:** Without the sources, the implementer picks the data.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** Only you know which files you are willing to publish. The decisions needed:
    *   **(1) The openFHIR figure:** switch it to the AllergyIntolerance mapping, which already has a source, or name an Observation source.
    *   **(2) The Unio figure:** name a source for the query and repository text, or allow synthetic text written into `data/sources.json` with `origin: "synthetic"`.
    *   **(3) The KDS source:** name the canonical copy. I suggest `~/development/OPENFHIR/openfhir/core/src/test/resources/kds/diagnose/`.
    *   **(4) Validation:** say what "validated" means for each kind of entry. For example: the HL7 Validator for FHIR JSON; for FHIRConnect YAML, "loaded by openFHIR's own tests"; for openEHR paths, "checked against the archetype".
    *   **(5) Placeholders:** decide whether the figure shows expanded paths. The YAML header names the resource and the archetype (`spec.fhirConfig.structureDefinition`, `spec.openEhrConfig.archetype`).
    *   Point 5 touches FHIRConnect semantics, so check it against the spec before deciding.
*   ***Proposed Edit:*** depends on the answers. M14a below fixes the format gaps that do not depend on them.

### [E7 = M15b + M17 placement] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1421-1441](../docs/designs/site-redesign.md#L1421-L1441), 1527-1537
*   **Discrepancy Description:** No figure has a `viewBox`, size, label positions or layout. Nothing says which section breaks get a divider.
*   **Rationale:** The implementer would design the figures.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** This is visual design. You can choose between two ways forward:
    *   **(1) Specify the geometry in the plan now.**
    *   **(2) Make the figure layout part of each figure's own commit.**
        *   The implementer proposes the layout.
        *   It is recorded in `docs/strand-rules.md`.
        *   You approve it at the existing gates: the hero at 1.4, the others at the 1.5 owner review.
    *   Option 2 matches how the plan already gates the logo redraw.
*   ***Proposed Edit (if option 2):* add to item 42a: "Also records each figure's `viewBox`, the text-zone rectangle, label positions and the divider placements; the owner approves these at the 1.4 and 1.5 gates."

### [E8 = M18b] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1476-1490](../docs/designs/site-redesign.md#L1476-L1490) (item 46)
*   **Discrepancy Description:** Three things about the hero motion are undecided:
    *   **The jump:** the figure is painted finished, then reset after `load`. On desktop, where it sits behind the text, the visitor sees it jump.
    *   **Choreography:** what moves, in what order and for how long is not given.
    *   **Values:** the easing and duration values are not given.
*   **Rationale:** Prototypes A and B must show "the same motion".
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** Each option trades one visual cost against another:
    *   **(a) Accept the jump.** It is visible for one frame.
    *   **(b) The inline `<head>` script adds `motion-ok` before first paint**, when reduced motion and Data Saver are off. The start state is then painted from the beginning. A 3-second timeout removes `motion-ok` if `motion.js` has not started, so a failed script still ends on the finished figure.
    *   **(c) The hero starts at low opacity and fades into the motion.**
    *   I recommend (b). Choreography and values follow E1 and E7.
*   ***Proposed Edit (if b):*** in item 46: "The inline `<head>` script adds `motion-ok` when `prefers-reduced-motion` is not `reduce` and `saveData` is not true, and sets a 3 s timeout that removes it unless `motion.js` has set `data-motion-started` on `<html>`." Update item 13's head script to match.

### [E9 = M23b] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1559-1566](../docs/designs/site-redesign.md#L1559-L1566) (item 52)
*   **Discrepancy Description:** The share card has no layout values. Missing: font size, line height, logo and strand positions, and the per-font average character width.
*   **Rationale:** The implementer would design the card.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** This is the same choice as E1 and E7. I recommend recording the card layout in `docs/design-tokens.md` and approving it at commit 1.7.
*   ***Proposed Edit:*** depends on E1.

---

## Prioritized Findings & AI Suggestions

### [Issue 1 = B1a] [`egm-implementation-readiness`] - Severity: High
*   **Affected Scope:** [Lines 1021-1042](../docs/designs/site-redesign.md#L1021-L1042) (item 8), 924-950, 1135-1286
*   **Discrepancy Description:** Item 8 ports "today's look" in 0.3, but it also lists new tokens, `@font-face` for fonts that arrive in 0.4, and layouts for the 0.6 structure. No commit from 0.4 to 0.6 modifies `assets/site.css`.
*   **Rationale:** The core deliverable has no commit that builds it.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The fix is mechanical: split the stylesheet work across the commits that need it. The token values are E1.
*   ***Proposed Edit:***
    *   Location: item 8, Proposed Changes and Why.
    *   Change: replace the bullets with:
        ```
        *   **Proposed Changes**: three blocks marked `/* @shared */`,
            `/* @page home */`, `/* @page blog */`, holding today's styles
            from the `index.html` `<style>` block and `blog/build.js`
            (`SHARED_CSS` and the page CSS), ported without visual change.
            Nested rules are flattened while porting (today
            `blog/build.js:341` nests `.article-sidebar` inside
            `.article-layout`). No nested CSS (older WebViews, brief 6.4),
            no `animation-timeline`. The new tokens, fonts and layouts are
            added by items 17a, 20a and 25a.
        *   **Why**: one design source for home and blog (decision #13,
            Goal 6). The commit only moves code.
        ```
    *   Add **17a. `assets/site.css` (Modify)** in 0.4: `@font-face` for the two WOFF2 files with `font-display: swap`, size-adjusted local fallback faces tuned against Arial, and `font-family` switched to the new faces.
    *   Add **20a. `assets/site.css` (Modify)** in 0.5:
        *   `:root` tokens: `--ground: #f6f3ee`, `--ink: #122e49`, navy tints (each tint used for text reaches 4.5:1 on the ground), product colours scoped to `.product--openfhir` and `.product--unio`, type scale, spacing scale, `--ease`, `--dur-short`, `--dur-long` (values per E1);
        *   the `@page blog` block rebuilt on the tokens;
        *   the post hero that replaces the gradient;
        *   motion rules only under `html.js.motion-ok`, with every figure's finished state as the default;
        *   `prefers-reduced-motion: reduce` sets all durations to 0.
    *   Add **25a. `assets/site.css` (Modify)** in 0.6: the `@page home` block rebuilt for the 8-part structure on the shared tokens. Remove the `open-fhir.com` hero background (see M1a).

### [Issue 2 = B2] [`egm-codebase-details`, `egm-implementation-readiness`] - Severity: High
*   **Affected Scope:** [Lines 1058-1064](../docs/designs/site-redesign.md#L1058-L1064), 1086-1089, 1177
*   **Discrepancy Description:** The sitemap `<lastmod>` for `/` and `/blog/` comes from `new Date()` (`build.js:745,759,765`), so `--check` reports drift on every new day.
*   **Rationale:** The pre-commit guard would fail on correct code.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** The fix is to make the output depend on the inputs only. The footer year is already the literal text `&copy; 2026` (`build.js:221`), so it only needs to stay literal.
*   ***Proposed Edit:***
    *   Item 10, the word "year": replace with "the year as literal text (today `&copy; 2026`), edited by hand".
    *   Item 20, the sitemap bullet: replace with "Sitemap `lastmod` for each post from front matter `updated`, else `date`; a published post with neither fails the build. `/blog/` gets the newest of those dates. `/` gets no `<lastmod>`. Nothing in the build reads the clock, so `--check` gives the same result on any day."
    *   Item 12, the `--check` bullet: append "The build output must not depend on the current date or time."

### [Issue 3 = B3] [`egm-codebase-details`, `egm-implementation-readiness`] - Severity: High
*   **Affected Scope:** [Lines 1112-1122](../docs/designs/site-redesign.md#L1112-L1122) (item 15), 1135-1159
*   **Discrepancy Description:** The host rule arrives in 0.3, but GA4 and Google Fonts are removed only in 0.4.
*   **Rationale:** Commit 0.3 fails its own check.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Each part of the host rule moves to the commit that removes the last offender it would catch.
*   ***Proposed Edit:***
    *   Item 15: delete "fails if any page loads a script or stylesheet from a host other than syntaric.com and `gc.zgo.at`;". Append "The host rule is added in items 19a and 31a."
    *   Add **19a. `tools/check-links.js` (Modify)** in 0.4: fail if any `<script src>` or `<link>` (stylesheet, preload, preconnect) uses a host other than `syntaric.com` (or a relative URL), `gc.zgo.at` and `<code>.goatcounter.com`.
    *   Item 31a: see M1a.

### [Issue 4 = B4] [`egm-codebase-details`, `egm-implementation-readiness`] - Severity: High
*   **Affected Scope:** [Lines 1044-1056](../docs/designs/site-redesign.md#L1044-L1056) (item 9), 1274 (item 25)
*   **Discrepancy Description:** The 0.3 nav links "Writing" to a section that arrives in 0.6 and has no `id`.
*   **Rationale:** The fragment check fails, and the implementer must invent the anchor.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 9, "the list in page order (Services, Selected work, Products, Writing, Blog)": replace with "today's list and targets (`index.html:1277-1283`: Services, Engagements, Our products, Expertise, Collaborators, Blog)".
    *   Item 25: add the bullet "`partials/nav.html` (and its footer list): the new order Services, Selected work, Products, Writing, Blog."
    *   In item 25, "**Recent writing and talks**: `<!-- @latest-posts -->` region": replace with "**Recent writing and talks** (`id="writing"`, with an `<h2>`): `<!-- @latest-posts -->` region".
    *   Item 15: add "`writing` is checked as a ninth home anchor from 0.6".

### [Issue 5 = M1a] [`egm-codebase-details`, `egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1112-1122](../docs/designs/site-redesign.md#L1112-L1122), 1300-1308, 1166-1169
*   **Discrepancy Description:** Three third-party loads escape the planned check:
    *   `index.html:199` hotlinks `open-fhir.com` as the hero background, and no item removes it.
    *   pdf.js is injected at runtime through `loadScript()`.
    *   The check inspects only static scripts and stylesheets.
*   **Rationale:** Goal 10 can fail with every check passing.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 25a (B1a): "remove the `url('https://open-fhir.com/...')` hero background (today `index.html:199`)".
    *   Add **31a. `tools/check-links.js` (Modify)** in 0.7:
        *   **Tags covered:** extend the host rule to `<img>`, `<iframe>`, `<video>`/`<source>` and CSS `url()` inside `<style>`.
        *   **Inline scripts:** extend it to every absolute `http(s)://` URL inside an inline `<script>`, except URLs in `<a href>`.
        *   **Exception list:** documented exceptions sit in a named array in the script (the Vimeo URL, if E2 picks b).
    *   It lands in 0.7, after pdf.js is self-hosted (0.5), the hotlinks are removed (0.6) and client images are handled (0.7).

### [Issue 6 = M2] [`egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1014-1017](../docs/designs/site-redesign.md#L1014-L1017) (item 7)
*   **Discrepancy Description:** Commit 0.2 uses `npm run build`, which only exists from 0.3.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** in item 7, replace "regenerated by `npm run build`" with "regenerated by `node blog/build.js` (`npm run build` from commit 0.3)".

### [Issue 7 = M3] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1589-1623](../docs/designs/site-redesign.md#L1589-L1623), 1103-1108
*   **Discrepancy Description:** No automated tests are planned for the new modules.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Node's built-in test runner (`node --test`, Node 24 is installed) needs no dependency.
*   ***Proposed Edit:***
    *   Item 14, scripts: add `test` (`node --test tools/test/`). `check` becomes `node --test tools/test/ && node blog/build.js --check && node tools/check-links.js`.
    *   Each item that creates a module in `tools/` also creates `tools/test/<module>.test.js`.
    *   Verification Plan: add the bullet below.
        ```
        *   **Unit tests** (`npm test`):
            *   `markers.js`: replace one region; error on a missing,
                duplicated and unbalanced marker.
            *   `--check`: an edited marker region and an edited
                generated page are both reported.
            *   `check-links.js`: a broken fragment and a foreign host
                each fail.
            *   `data-rules.js`: each placeholder pattern, each dropped
                field, and a 65-character base64 string are removed and
                listed in `removed`; a 64-character string is kept.
            *   `snapshot.js`: refuses a `_clients/` path and an entry
                without `validated`.
            *   `strands.js`: `hero()` fails when geometry enters the
                text zone.
            *   `share-card.js`: a 4-line title is cut to 3 lines with an
                ellipsis.
        ```

### [Issue 8 = M4] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1517-1519](../docs/designs/site-redesign.md#L1517-L1519) (commit 1.4)
*   **Discrepancy Description:** The step "delete the hero `data-motion` attributes" edits generated output, which the next build restores.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace "delete the hero `data-motion` attributes;" with "remove the `data-motion` attributes that `hero()` in `tools/strands.js` writes, then rebuild;".

### [Issue 9 = M5] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Line 952](../docs/designs/site-redesign.md#L952) (Target Files header), and items 18, 19, 20, 25, 28
*   **Discrepancy Description:** Line numbers cited in later commits are wrong once 0.3 removes about 1,190 lines.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** One baseline sentence fixes every citation. `git status` shows `index.html` and `blog/build.js` unchanged from HEAD `55c5d76`.
*   ***Proposed Edit:*** insert under `### Target Files to Create/Modify/Delete`: "Line numbers refer to the files at commit `55c5d76`, before commit 0.1. Earlier commits move them. Find each place by the symbol, selector or string named next to the number."

### [Issue 10 = M6] [`egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1004-1010](../docs/designs/site-redesign.md#L1004-L1010) (item 6), 1178-1180 (item 20)
*   **Discrepancy Description:** Today the JSON-LD has no `image` property. `imgUrl` feeds `publisher.logo.url` (`build.js:263`).
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 6: replace "build `og:image`, `twitter:image` and the JSON-LD image from the post's real cover" with "build `og:image`, `twitter:image` and a new Article JSON-LD `image` property from the post's real cover. Set `publisher.logo` to `https://syntaric.com/etc/syntaric_logo_2.png`, which today wrongly reuses `imgUrl`".
    *   Item 20: replace the JSON-LD bullet with "Article JSON-LD: add `dateModified`."

### [Issue 11 = M7] [`egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1175-1176](../docs/designs/site-redesign.md#L1175-L1176)
*   **Discrepancy Description:** Item 20 says to "add" a draft `noindex` tag, but `build.js:285` already writes `noindex, nofollow`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace the bullet with "Posts with `publish: false`: keep the existing `<meta name="robots" content="noindex, nofollow">` (`build.js:285`)."

### [Issue 12 = M8] [`egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1166-1173](../docs/designs/site-redesign.md#L1166-L1173)
*   **Discrepancy Description:** Item 20 misses several glows and gradients, and the `.animate`/`.delay-*` fade-ups.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace the post-template and listing bullets with:
    ```
    *   Post template: article before sidebar on mobile (remove both
        `.article-sidebar { order: -1 }` rules); add
        `partials/post-contact.html` after the article; remove the glow
        blobs, the gradient post hero and the `open-fhir.com` background.
    *   Listing: remove the `ICONS` pool; remove the `.blog-hero::before`
        glow, the `.post-visual` and `.post-visual-sm` gradients and their
        `::before` glows, and the gradient avatar; every card uses the
        post's real cover image as an `<img>` with `width`, `height`,
        `loading="lazy"` and `alt`.
    *   Both templates: remove the `.animate` and `.delay-*` classes and
        the `fade-up` keyframes.
    ```

### [Issue 13 = M9] [`egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Line 1039](../docs/designs/site-redesign.md#L1039), 1166-1167
*   **Discrepancy Description:** A verbatim port carries the nested CSS rule, and `order: -1` appears twice.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** covered by B1a (flatten while porting) and M8 ("remove both").

### [Issue 14 = M10a] [`egm-implementation-readiness`, `egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 910-922](../docs/designs/site-redesign.md#L910-L922) (owner inputs), 1173, 1275
*   **Discrepancy Description:** Some copy inputs are missing from the owner-input table, and two inputs are needed by 0.5a, earlier than the table says. "The plain voice" is defined nowhere.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Brief 4.6 lists the model lines for the new voice, so "plain voice" can point to them.
*   ***Proposed Edit:***
    *   Table: change "Needed by" for the proof line (#8) and the item names (#9) to "Commit 0.5a".
    *   Table: add the row "One outcome sentence and one evidence line for openFHIR and for Unio | Commit 0.6 | #10".
    *   Item 25, the Copy bullet: append "'Plain voice' means: the ban list (brief 2.8), and the model lines in brief 4.6 (`index.html:1446`, `1512`, `1653-1661` and the engagement duration tags)." Items 20 and 25 then refer to this definition.

### [Issue 15 = M12] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1619-1620](../docs/designs/site-redesign.md#L1619-L1620)
*   **Discrepancy Description:** The content check fails by design, because the inventory also lists dropped items.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace with "**Content**: every row of `docs/content-inventory.md` not marked as dropped is found on the page."

### [Issue 16 = M13a] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1170-1172](../docs/designs/site-redesign.md#L1170-L1172), 1288-1293
*   **Discrepancy Description:** The plan gives no method for getting image dimensions. The `../../` cover paths are wrong when used from `index.html`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** A small header reader keeps the build to one dependency.
*   ***Proposed Edit:***
    *   Add **15a. `tools/image-size.js` (Create)** in 0.3: `imageSize(path) -> { width, height }`. It reads the PNG IHDR or the JPEG SOF0/SOF2 header, has no dependencies, and throws on any other format.
    *   Item 20: "cover paths resolve to root-absolute `/blog/<slug>/<file>`; `width`/`height` from `imageSize()`".
    *   Item 26: "the same resolver and `imageSize()`".

### [Issue 17 = M14a] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1378-1407](../docs/designs/site-redesign.md#L1378-L1407), 1263-1266
*   **Discrepancy Description:** The `select` format and the `snapshot.json` schema are not defined, and lines 21-42 hold 4 pairs, not 4-6.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 25: replace "4-6 FHIR path to openEHR path pairs, copied from `eps.adverse_reaction_risk.v2.yml:21-42`" with "the 4 FHIR path to openEHR path pairs in `eps.adverse_reaction_risk.v2.yml:21-42` (substance, clinicalStatus, verificationStatus, criticality)". How the placeholders are shown is part of E6.
    *   Item 38: define `select`:
        *   for YAML, a list of `mappings[].name` values;
        *   for JSON, a list of RFC 6901 JSON pointers.
    *   Item 41: add the schema:
        ```
        { "entries": { "<id>": { "source": "<path>", "licence": "...",
          "origin_url": "...", "validated": { "tool", "version", "date" },
          "values": [ ... ] } } }
        ```
        Each figure function reads named entry ids, listed in `docs/strand-rules.md`.

### [Issue 18 = M15a] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1421-1433](../docs/designs/site-redesign.md#L1421-L1433), 1491-1497
*   **Discrepancy Description:** `hero(snapshot)` contradicts "takes the text-zone rectangle". The time parameter that item 47 uses does not exist. The types of `from` and `to` are not given, and no measuring method is stated.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** in item 42, replace the signature list and the last sentence with:
    ```
    `strand(from, to, { profile, width, notch })` and
    `bundle(count, from, to, { gap })`, where `from` and `to` are
    `{ x, y }` points in SVG user units; `hero(snapshot, { textZone, t })`,
    `openfhirFigure(snapshot, { t })`, `unioFigure(snapshot, { t })`,
    `divider(note)`, `cardArt()`. `textZone` is `{ x, y, width, height }`
    in the figure's `viewBox` units. `t` is motion progress from 0 to 1,
    default 1 (the finished frame); `tools/render-hero-video.js` calls
    `hero()` with `t` from 0 to 1 per frame. `hero()` throws if any strand
    or label geometry intersects `textZone`. `PROFILE`, `GAP` and `NOTCH`
    are read from the path coordinates of `assets/brand/syntaric.svg` by
    hand and written as constants, with the measurements recorded in
    `docs/strand-rules.md`.
    ```

### [Issue 19 = M16] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1466-1474](../docs/designs/site-redesign.md#L1466-L1474) (item 45), 1611-1613
*   **Discrepancy Description:** The build-time text-zone check works in SVG coordinates and does not carry over to the rendered page.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 45: append "From 960 px up, the hero box has `aspect-ratio` equal to the figure's `viewBox`. The text block is positioned in percentages taken from `textZone / viewBox`, so the clear zone and the text box scale together. The heading size is clamped so the text fits the zone at 960 px."
    *   Verification, Contrast: change "at 390 px and 1280 px wide" to "at 390, 960, 1280, 1440 and 1920 px wide".

### [Issue 20 = M17] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1532-1537](../docs/designs/site-redesign.md#L1532-L1537) (item 49b), 1737-1739
*   **Discrepancy Description:** CSS cannot copy markup, and duplicate markers are an error.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Numbered regions keep `markers.js` strict. Where the dividers go is part of E7.
*   ***Proposed Edit:*** replace "The `divider` region content is reused by CSS class at each section break." with "Dividers use numbered regions `divider-1` … `divider-n`, one per section break listed in `docs/strand-rules.md`. The build fills each with `divider(note)`." Update the Technical Plan's region list (line 327) in the same way, outside this range.

### [Issue 21 = M18a] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1476-1490](../docs/designs/site-redesign.md#L1476-L1490), 1550-1555
*   **Discrepancy Description:** The plan doesn't say how the motion CSS and the Web Animations API (WAAPI) divide the work, and it doesn't define the path length for `stroke-dashoffset`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 42: "`strands.js` writes `pathLength="1"` on every path that can be drawn".
    *   Item 50: replace "motion CSS for draw, align and fan-out under `html.js.motion-ok`" with "CSS under `html.js.motion-ok` sets only the start state of each motion (`stroke-dasharray: 1; stroke-dashoffset: 1` for draw, the start `transform`/`opacity` for align and fan-out). `motion.js` plays every motion with WAAPI; CSS defines no transitions or keyframes."

### [Issue 22 = M19] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1501-1508](../docs/designs/site-redesign.md#L1501-L1508) (item 49)
*   **Discrepancy Description:** Prototype B is missing a poster URL, a playback trigger, reduced-motion behaviour, a controls spec and a video resolution.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace the B sentence with:
    ```
    B: `<video muted playsinline loop preload="none"
    poster="assets/video/hero-poster.png">`; `tools/render-hero-video.js`
    also writes the `t = 1` frame as `assets/video/hero-poster.png`. An
    inline script at the end of `<body>`, after `load`, sets the `<source>`
    and calls `play()` unless `prefers-reduced-motion: reduce` or Data
    Saver is on (then the poster stays). One `<button aria-pressed>` of at
    least 24x24 px, labelled "Pause animation", pauses and plays. The video
    is rendered at the figure's `viewBox` size at 2x for a 1280 px layout,
    one file for all widths.
    ```

### [Issue 23 = M20] [`egm-implementation-readiness`] - Severity: Medium
*   **Affected Scope:** [Lines 1443-1523](../docs/designs/site-redesign.md#L1443-L1523) (commits 1.3-1.4)
*   **Discrepancy Description:** The prototypes live on a branch that GitHub Pages never serves, so the owner cannot open them in the LinkedIn app.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** This reuses the unlisted-preview pattern from 0.5a.
*   ***Proposed Edit:***
    *   Commit 1.3 heading: drop "(branch `hero-prototypes`)".
    *   Item 49: replace "two variants behind a query parameter (`?hero=a`, `?hero=b`) for the gate only" with "two unlisted copies of the home page, `preview/<random-slug>/a.html` and `b.html` (same rules as item 23a: `noindex`, not in `sitemap.xml`). Production `index.html` gets only the static hero figure in 1.3".
    *   Commit 1.4: replace "the query-parameter switch" and "without the switch" with "the preview files", and replace "Merge the branch." with "Add the winning motion layer to `index.html`; delete `preview/<random-slug>/`."

### [Issue 24 = M21] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1512-1513](../docs/designs/site-redesign.md#L1512-L1513), 1607-1608, 1614-1616
*   **Discrepancy Description:** The test devices and the WebPageTest settings are not named, so runs cannot be repeated.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Only the owner knows which phones they have. Recording them makes runs repeatable without inventing a device list.
*   ***Proposed Edit:*** in Verification, Devices: append "The device models and OS versions, and the WebPageTest location and device profile, are recorded in `docs/test-results.md` on the first run. Later runs use the same."

### [Issue 25 = M22] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Line 1613](../docs/designs/site-redesign.md#L1613)
*   **Discrepancy Description:** "Above 10% navy" can be read two ways.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** A 10% navy tint over `#f6f3ee` is `#dfdfde`, which has a contrast of 1.20:1 against the ground (computed with the WCAG luminance formula).
*   ***Proposed Edit:*** replace "no figure pixel above 10% navy falls inside the text zone" with "no pixel inside the text zone has a contrast above 1.2:1 against the ground `#f6f3ee` (the ratio of a 10% navy tint, `#dfdfde`)".

### [Issue 26 = M23a] [`egm-implementation-readiness`, `egm-codebase-details`] - Severity: Medium
*   **Affected Scope:** [Lines 1572-1587](../docs/designs/site-redesign.md#L1572-L1587)
*   **Discrepancy Description:** Three share cards are undefined: the one for `/blog/`, the one for drafts, and the home card's title.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Item 54: write `assets/share/blog.png` as well, titled with the blog index `<h1>`. Drafts use `assets/share/home.png`.
    *   Item 55: "home card title: the H1 'Boutique healthcare interoperability consultancy'".
    *   Item 56: add `assets/share/blog.png`.

### [Issue 27 = M24] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1839-1842](../docs/designs/site-redesign.md#L1839-L1842) (#15)
*   **Discrepancy Description:** Real-user LCP and INP cannot be measured, because the plan drops telemetry.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   LCP row: "2.0 s or less in the lab".
    *   INP row: "Not measured: no real-user data (Step 6 reconciliation, item 6); TBT is the lab proxy".

### [Issue 28 = M25] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1670-1672](../docs/designs/site-redesign.md#L1670-L1672) (#3)
*   **Discrepancy Description:** The pass threshold is written as "at least 4 of 5" and has no rule for groups of 6 or more.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace "at least 4 of 5" with "at least 80% of peers, rounded up (4 of 5, 5 of 6, 6 of 7),".

### [Issue 29 = M26] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1707-1708](../docs/designs/site-redesign.md#L1707-L1708) (#4)
*   **Discrepancy Description:** "Step 5 of Stage 1" refers to a step that doesn't exist.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** replace "The loser is deleted from the branch before step 5 of Stage 1." with "The loser is deleted at the gate (commit 1.4), before commit 1.5."

### [Issue 30 = M27] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Lines 1559-1587](../docs/designs/site-redesign.md#L1559-L1587)
*   **Discrepancy Description:** The item numbering skips 51.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** No text cites items 52-56 (checked with grep).
*   ***Proposed Edit:*** renumber 52-56 to 51-55.

### [Issue 31 = M28] [`egm-style`] - Severity: Medium
*   **Affected Scope:** [Line 949](../docs/designs/site-redesign.md#L949), 1548
*   **Discrepancy Description:** Commit 1.6 is named "Motion runtime", but the runtime is built in 1.3.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Line 949: "**1.6** The two scroll moments (the runtime exists since 1.3)."
    *   Line 1548: "#### Commit 1.6: scroll moments".

### [Issues 32-44 = nits worth fixing] - Severity: Low
*   ***AI Suggestion:*** PROPOSE FIX (each is a single-line edit)
*   **N1** (line 1174): "One `readTime(markdownBody)`: `buildPostPage` gets the markdown body as a new argument; `meta.readTime` still overrides."
*   **N2** (lines 1737-1739): list all regions: `css`, `nav`, `footer`, `latest-posts`, `hero-figure`, `openfhir-figure`, `unio-figure`, `divider-1`…`divider-n`.
*   **N3** (line 1262): "Until commit 1.3" becomes "Until commit 1.5".
*   **N4** (lines 906-908): "published file" becomes "file the build writes, `index.html`, or any file under `preview/`; `docs/` and `.egm/` are not scanned".
*   **N5** (line 974): add `/docs/strand-rules.html`.
*   **N7** (lines 1310-1313): list the outputs `unio-topology.webp`, `unio-topology@2x.webp`, `unio-topology.avif` and `unio-topology@2x.avif`.
*   **N8** (lines 1052-1054): "toggles `nav-open` on `<body>` and flips `aria-expanded`, as `unio-landing/index.html:109` does, with its inline `onclick` moved into the script".
*   **N9** (line 1173): "555, 675, 677, 678".
*   **N10** (lines 1156-1157): "the Google Fonts preconnect and stylesheet links (312-314, 609-611)".
*   **N11** (lines 1046-1047): the logo link is `/` on every page; add `{{blogCurrent}}` = ` aria-current="page"` on the Blog link of blog pages, replacing `navHtml`'s `activeBlog`.
*   **N12** (lines 1124-1133): add to item 16 "the front-matter template gains `image`, `publish`, `updated`".
*   **N13** (line 1290): "the 3 newest by front matter `date`, ties broken by slug, descending".
*   **N22** (line 1758): "(`#fe933a` on the `#f6f3ee` ground is about 2.0:1)".

### [Declined nits]
*   ***AI Suggestion:*** DECLINE
*   **N6:** small open choices (font subsetting tool, GoatCounter event names, the exact resvg pin, the icon safe zone, the axe driver). The implementer can settle these without changing the design.
*   **N14-N21, N23, N24:** wording and ordering nits. They are listed in `implementation_readiness_report.md`. Each changes no behaviour, and they can be fixed in a copy-edit pass.
