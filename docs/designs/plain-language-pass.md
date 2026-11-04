# Plain-language pass: bring the home page back to non-technical visitors

Status: draft plan, 2026-11-04. Follows `docs/designs/site-redesign.md`
(commits 0.1-1.7, all done). Not published (`docs/` is excluded).

## Problem

After the redesign the owner judged the home page **nicer, but further away
from its key audience: non-technical people** (hospital directors,
programme leads, procurement, clinicians in management roles). Comparing
the page at `55c5d76` (before the redesign) with today's build, four things
make it read as technical:

| Source | Where | Example |
|---|---|---|
| Code on the page | Hero field, openFHIR figure, Unio figure, all three dividers | `/data[at0001]/items[at0002]`, `openEHR-EHR-EVALUATION.adverse_reaction_risk.v2`, `AQL · …`, `5 rows · partial` |
| The mono face | Figure labels; the "What you can hire us for" labels (For, Format, Length, You receive); dates; contact labels; "Engagement formats"; the share-card kicker | Spec-sheet look |
| The text face | Everywhere | Atkinson Hyperlegible Next draws zero with a slash and has no open-zero alternate (its GSUB has `tnum` and `pnum` only), so "1.0.0" and "2026" look like code |
| Product visuals replaced by drawings | Products | The Unio console screenshot (deleted at the 1.5 review) and the openFHIR image became strand figures; the product logos are not shown |

The copy adds to it: the proof line, the hire items, the Selected work
titles and the product texts lead with standard names (openEHR, FHIR, IHE,
AQL, CDR) before saying what changes for a hospital.

## Goals

1.  A visitor who does not know FHIR or openEHR understands, from the
    first screen, what Syntaric does, for whom, and that it is a
    consultancy.
2.  No code-like text anywhere on the home page.
3.  Technical depth stays available, one level down: second sentences,
    the product sites, the blog.
4.  Keep what works: the palette, the strand brand, the hero video, the
    page structure, the blog.

**Non-goals:** the blog posts themselves (written for technical readers);
a new brand; a new page structure; stock photography.

## Decisions (owner, 2026-11-04)

| # | Question | Answer |
|---|---|---|
| P1 | Code in the figures | Plain labels only; no real paths anywhere on the home page (technical detail lives on open-fhir.com, unio.syntaric.com and the blog) |
| P2 | Hero | The full-bleed strand video stays; its labels change from FHIR resource and path names to plain words from the healthcare domain |
| P3 | Typefaces | Remove the mono face from the page, and test a warmer face pairing against Atkinson at a gate. **Revised the same day:** after seeing 2.2 built, the owner judged the faces better as they were. Atkinson Next and Mono stay everywhere, including the hero labels; 2.2 was reverted before commit and the face gate (2.3) is dropped |
| P4 | Visuals to bring back | Real product images (Unio console, an openFHIR image) and the openFHIR and Unio logos with each product. Not client logos (E4 stands), not photos |
| P5 | Copy | Plain first, technical second: every block leads with what changes for a hospital or programme; standard names follow in a second sentence or are explained on first use |

Supersedes, for the home page only: decision #7's mono face for "paths,
data, margin notes"; the rule that figure text comes from
`data/snapshot.json` (plain labels are written copy, like the synthetic
Unio text); the 1.5 review's removal of the Unio screenshot.

## Rules for the copy (P5)

*   **First screen** (header, hero, proof line): a standard's name may
    appear only where the sentence still makes sense to someone who has
    never heard of it. Product names (openFHIR, Unio) are fine.
*   **Every block** (hire item, case, product): the first sentence says
    who it is for or what changes for them; the second may name standards,
    systems and profiles.
*   **Lists of acronyms** (IHE profiles, languages) move out of first
    sentences; they stay where a technical buyer looks for them (the hire
    item's last line).
*   **Numbers** read as plain text: no version strings in the first
    screen ("approved in October 2026", not "version 1.0.0").
*   Sentence case, short sentences, no new marketing words (the banned list
    from the brief still applies).

Draft lines (the full copy, approved by the owner on 2026-11-04 as written, with the H1 kept, is §4 of `docs/content-inventory.md`):

| Place | Today | Draft |
|---|---|---|
| Who-for line | "A small team that designs, reviews and builds data integration for hospitals, national health programmes and health IT vendors. …" | "We help hospitals, regions and national health programmes share patient information between their systems, using open standards. We also make two products, openFHIR and Unio." |
| Proof line | "Member of the openEHR Specifications Editorial Committee Experts Panel since 2026. We drafted the openEHR Federation specification … version 1.0.0 …" | "We sit on the international expert panel that reviews openEHR standards. With RSO Zuid-Limburg we wrote the standard for joining up a region's patient records, approved in October 2026; our product Unio is built on it." |
| Hero caption | "The same allergy record, as sent over FHIR and as stored in openEHR." | "One record, understood the same way by systems that speak different standards." (revised, see 2.1) |
| Case 1 title | "One query across a region's openEHR repositories" | "One view of a patient across a region's care providers" |
| Case 2 title | "A FHIR facade on an openEHR repository, built live" | "Two health data standards working together, built live on stage" |
| Case 3 title | "The Dutch care-transfer standard on openEHR and FHIR" | "Nursing handover between care organisations, on open standards" |
| Products lead | "Syntaric is a consultancy. We also build two products: openFHIR, which is open source under the Apache 2.0 licence …" | "We are a consultancy first. Two products came out of our project work:" (licences move to each product's last line) |
| Unio, first sentence | "Unio makes several openEHR repositories answer as one. …" | "Unio lets an application see a patient's records from every hospital in a region as if they were in one place." |

## Plain labels in the figures (P1, P2)

Labels are set in the text face (P3), never mono.

*   **Hero** (both layouts, the still and the video): the upper data strand
    reads "Recorded in one standard"; the lower one "Read in another", with
    a smaller line "Same meaning, nothing retyped" (revised, see 2.1). Geometry, timing and
    the text-zone rule are unchanged; label boxes are re-measured with the
    text face's advance.
*   **Dividers:** hairline strand only; the path notes are removed.
*   **openFHIR and Unio figures:** replaced or relabelled according to the
    product-visual gate (commit 2.4). If a figure stays, its labels are
    plain: openFHIR rows "What the allergy is", "Is it still active?",
    "Has it been confirmed?", "How serious is it?"; Unio "Find this
    patient's allergies", "Hospital A, 3 records", "Hospital B, 2 records",
    "GP practice, not answering", result "5 records, marked incomplete".

The plain labels live in `data/sources.json` as written copy (a `plain`
block per entry, `origin: "written"`), so `tools/strands.js` still reads
all figure text from one place and the size limit still applies.

## Typefaces (P3)

> [!NOTE]
> Superseded on 2026-11-04: the owner keeps Atkinson Hyperlegible Next and
> Mono as they were (see P3 and commits 2.2 and 2.3). The steps below are
> kept as the record of what was proposed.

1.  **Mono out:** every mono use on the home page and the share cards
    moves to the text face (labels in `--ink-3`, the text size one step
    down, no letter-spacing tricks). If nothing uses it afterwards,
    `atkinson-hyperlegible-mono.woff2`, `tools/fonts/atkinson-hyperlegible-mono.ttf`
    and its `@font-face` are deleted (10 KB less on first load).
    The blog keeps no mono either, except code blocks inside posts, which
    fall back to the system monospace.
2.  **Face gate:** a preview page (unlisted, deleted after the gate, like
    the hero gate) shows the real home page three times:
    *   **Control:** Atkinson Hyperlegible Next.
    *   **A:** Source Serif 4 for headings, Source Sans 3 for text (both SIL
        OFL, plain zero, Latin Extended-A).
    *   **B:** Hanken Grotesk throughout (SIL OFL, plain zero, warmer than
        Atkinson, not a template default such as Inter).

    The owner picks. Each candidate is checked first for: open zero,
    Slovenian and Dutch characters, a bold weight for the share cards, and
    a WOFF2 subset within the font budget of #15.
3.  **Apply:** new WOFF2 subsets and `@font-face`; fallback metric
    overrides (`size-adjust`, `ascent-override`) recalculated so CLS stays
    under 0.02; TTFs in `tools/fonts/` for the share cards and the hero
    video; tokens updated in `docs/design-tokens.md`; cards and videos
    re-rendered.

## Product visuals (P4)

*   **Logos:** `assets/brand/openfhir.svg` and `assets/brand/unio.svg` (both
    exist since 1.1) beside each product heading, at the heading's cap
    height.
*   **Unio:** the console topology screenshot comes back from commit
    `c0aa3b6` (`assets/img/unio-topology{,@2x}.{avif,webp}`, already the
    lighter version), in the thin navy-tint frame of #7.
*   **openFHIR:** a real product image is needed. The old
    `images/openfhir-img.png` was dropped for base64 noise and third-party
    trademark tiles (the openEHR and HL7 FHIR logos), so it does not come
    back as it was. **Owner input:** a screenshot of openFHIR (for example
    the Atlas mapping view, with synthetic data), or approval to redraw the
    old image without the third-party logos.
*   **Gate (commit 2.4):** the two product blocks rendered both ways for
    the owner to pick:
    *   **Images instead of figures (proposed):** image and logo only. The
        openFHIR and Unio figures and the two scroll moments (commit 1.6)
        are removed. Nothing else uses `assets/motion.js` (the hero is the
        video), so the script, its `motion-ok` head script and the start-state
        CSS go too.
    *   **Images and figures:** the image leads; the plainly labelled
        figure sits below it, smaller.

## Commit order

Each commit: preview locally, screenshots to the owner, `npm run check`
passes, owner says go. Nothing is pushed until the owner wants the public
site (LinkedIn previews, external testers).

*   **2.0** Plain copy draft (docs only): the lines above and the rest of
    the home page, rewritten under the copy rules, in a new section of
    `docs/content-inventory.md`. Owner edits and approves.
    *   **As built (2.0)**: §4 of `docs/content-inventory.md`. Approved as
        written on 2026-11-04; the H1 stays (decision #2), with "Healthcare
        data consultancy" as the fallback if run 3 flags "interoperability".
*   **2.1** Hero and dividers: plain labels from `data/sources.json`, text
    face for labels, divider notes removed, hero still and both videos
    re-rendered, new caption. Screenshots at 390, 1280 and 1920 px; the
    contrast check re-run.
    *   **As built (2.1)**: the labels are a written entry, `hero-labels`,
        in `data/sources.json` (`tools/snapshot.js` copies `origin:
        "written"` entries like synthetic ones). The text-zone test sizes
        labels at 0.48 em per character (measured 0.41-0.46). Two fixes
        found in the screenshots: on phones the labels were 12 and 9 px, now
        15 and 11 px; the small line was `--ink-3` on the 20 % bundle
        (about 3.5:1), now full ink. Videos: 265 KB wide, 157 KB narrow.
        Text-zone contrast unchanged: 0 pixels over 1.2:1 with the video
        playing. The divider notes are gone; the three dividers are now
        the same hairline.
    *   **2.1 revision (owner, 2026-11-04)**: the penicillin, hospital and
        GP wording was too specific; the labels stay abstract about
        standards. Wording is now agreed on screenshots of the still frame
        before any video is rendered. Picked from three options: "Recorded
        in one standard", "Read in another", "Same meaning, nothing
        retyped"; caption "One record, understood the same way by systems
        that speak different standards."
*   **2.2** ~~Mono out of the page and the share cards~~. **Dropped**
    (P3 revised, 2026-11-04): built, shown to the owner, reverted before
    commit. The hero labels go back to mono (still frame approved first,
    then the videos re-rendered).
*   **2.3** ~~Face gate~~. **Dropped** (P3 revised): the owner keeps
    Atkinson Hyperlegible Next and Mono.
*   **2.4** Product visuals: logos, the Unio screenshot, the openFHIR image
    (owner input), and the gate on figures.
    *   **As built (2.4)**: owner choices on 2026-11-04: the openFHIR image
        is "Atlas on a monitor" from open-fhir.com (`atlas-left-1200.png`,
        trimmed to 833 × 1006, AVIF and WebP at 600 and 833 px, 24-49 KB;
        transparent background, no frame, at most 26rem wide), picked from
        six images on that site; images replace the figures. The Unio
        console screenshot is restored from `c0aa3b6` in its thin frame.
        Both logos include the product name, so each logo is the product
        heading (`<h3><img alt>`), 32 px tall, openFHIR 40 px so the names
        match. Removed: `openfhirFigure`, `unioFigure`, their partials and
        tests, the `allergy-mapping` and `unio-federation` data entries,
        `assets/motion.js`, the `motion-ok` head script (the `js` class
        stays for the phone nav) and the motion start-state CSS. The
        snapshot tooling stays; it now carries only `hero-labels`.
*   **2.5** Plain copy applied to the rest of the page (who-for line, proof
    line, hire items without the For/Format/Length table, cases, products,
    credentials, contact), meta and OG descriptions included.
    *   **As built (2.5)**: §4 of `docs/content-inventory.md`, as approved.
        Hire items: heading, a quiet format line in mono (the owner kept
        mono, P3), "when it fits" and "you get" sentences (the latter now
        open with "You get", as the label is gone), and the technical
        detail in small type. Meta, OG and Twitter descriptions updated;
        the JSON-LD descriptions are unchanged. At the review the owner
        removed the rule above the contact details: the divider strand is
        enough.
*   **2.6** ~~Jargon check in `npm run check`~~. **Dropped** by the owner
    (2026-11-04) after seeing the word list; built and removed before
    commit.
*   **2.7** Tests on the finished pass (below), after a push.

## Verification

*   ~~**Jargon check**~~ (dropped, see 2.6) (new, `tools/check-plain.js`, part of `npm run
    check`): fails if the built home page shows code-like text anywhere
    (`[at`, `/data`, `.v2`, `AQL`, `CDR`, `R4`, `rows`), or if the first
    screen (hero, proof line) or the first sentence of any block contains a
    term from `tools/plain-terms.json` (FHIR, openEHR, IHE, XDS, API,
    repository, endpoint, archetype, …; product names excepted). Unit tests
    for one failing and one passing page.
*   **Existing checks:** `npm run check`, axe, Lighthouse (home 90+ / 100
    / 100), no-JS and reduced motion, hero contrast; as recorded in
    `docs/test-results.md` on 2026-11-04.
*   **5-second test, run 3:** 3-5 people with no health IT background (at
    least one hospital manager or clinician in a management role, none who
    work with FHIR or openEHR). The three questions of #3, plus: "Was
    there a word you did not understand?" **Pass:** the #3 rule, and no
    more than one unknown word named in total across all people on the
    first screen.
*   **Peer test, run 3:** the #3 protocol on the finished pass, because
    the face changes.
*   **Content:** every inventory row not dropped is still on the page
    (the plain copy rewrites wording, not substance: named systems,
    profiles, clients and figures stay, in second sentences).

## Risks

*   **Losing the technical buyer:** a CIO or architect may read plain
    copy as shallow. Mitigation: the second sentences keep the specifics,
    the hire items keep their profile lists on the last line, and the blog
    and product sites are one click away.
*   **Face change cost:** fonts touch the cards, the videos, the fallbacks
    and the peer test. If the gate keeps Atkinson, 2.3 shrinks to nothing
    and the slashed zero stays.
*   **openFHIR image:** without an owner-supplied screenshot, the openFHIR
    block has a logo but no image; the plan does not invent product UI.
