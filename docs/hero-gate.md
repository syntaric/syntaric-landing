# Hero gate (decision #4, commit 1.4)

**Decision: Prototype B**, the full-bleed strand video, chosen by the owner
on 2026-11-04. Not published (`docs/` is excluded).

## What was compared

| | A: SVG motion | B: full-bleed strand video |
|---|---|---|
| What moves | the hero figure beside the text, once (1.44 s) | a strand field behind the whole hero, a seamless 8 s loop |
| Extra transfer | `assets/motion.js` 1.7 KB gzip | 261 KB (wide, from 960 px) or 152 KB (narrow, phones), after `load` |
| Without motion | finished figure | the inline SVG still (frame 0) |
| Low Power Mode (iOS) | plays | autoplay is usually blocked: the still stays |

Both were drawn by `tools/strands.js` from the feather's measured rules and
the `allergy-mapping` snapshot entry. The first version of B (the figure
rendered to video) was replaced on the owner's feedback because it did not
test a fire.ly-style background video (see the design doc, commit 1.3
notes).

## Gate inputs

| Input | Result |
|---|---|
| Owner viewing on phones, inside the LinkedIn app, with Low Power Mode and Data Saver on in turn | Not recorded here; the owner chose B after viewing the prototypes |
| File sizes | as above; both within #15 (hero video 1.5 MB or less, loading after `load`, never with Data Saver) |
| Mono legibility at 390 px | Labels at 24 px in the 780 px band, so 12 px on a 390 px screen |

## What changed at the gate

*   `index.html`: the hero is the field: from 960 px a full-bleed background
    (the section takes the field's 1920 × 854 aspect ratio, the text keeps
    to the left 52.8 % of the content width), on phones a full-width band
    below the text. The still is inline SVG (build regions
    `hero-field-wide`, `hero-field-narrow`); a small script adds the video
    after `load` and shows it only once it plays, with a "Pause animation"
    button (the loop runs longer than 5 s, WCAG 2.2.2).
*   Removed: Prototype A's hero figure (`hero()` and its draw masks), the
    preview pages and `tools/make-hero-previews.js`, the PNG posters.
*   Kept: `assets/motion.js`, for the scroll moments in commit 1.6.
*   Still open: the notch is not drawn (`docs/strand-rules.md`, Known
    limits); the field's strands do not use it.
