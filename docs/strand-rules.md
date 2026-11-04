# Strand rules

Redesign item 42a. The rules `tools/strands.js` draws with, measured from the
signed-off feather (`assets/brand/syntaric.svg`, commit 1.1), so a person
can check any figure against them. Not published (`docs/` is excluded).

## Where the numbers come from

The feather is two identical blades: the lower one is the upper one turned
180° about (53.06, 59.44); they match to 0.02 units. All measurements are on
the upper blade, in the SVG's own units, with its outline sampled at 4,000
points (`svgpathtools`, `shapely`; run once on 2026-11-04, not a project
dependency).

| Measurement | Value | Method |
|---|---|---|
| Chord (tip to tip) | 123.6 | Farthest pair of points on the blade's convex hull |
| Maximum width | 40.9 (0.331 of the chord), at 0.54 of the chord | Width of the blade on lines perpendicular to the chord, every 4 % |
| Centre-line bend | ±0.07 of the chord | Largest distance of the width midpoints from the chord, each side |
| Channel between the blades | narrowest 6.4; 7.3 along the parallel run (0.178 of the maximum width) | Distance from the upper blade's edge to the lower blade, where they run side by side |
| Notch | mouth 24.7 (0.604 of max width), depth 18.1 (0.442), at 0.52 of the chord on the outer edge | The concave pocket between the blade and its convex hull, near the base |

## The rules

| Rule | Constant | Value |
|---|---|---|
| **Profile:** width along a strand, as a 1-D cubic Bezier of control values, peak 1 | `PROFILE` | `[0, 0.926, 1.687, 0]`: zero at both tips, widest at 0.57 (fit to the 25 measured widths, RMS error 0.09 of the maximum) |
| **Blade:** maximum width and S-bend, relative to the chord | `BLADE` | `width: 0.331`, `bow: 0.07` |
| **Gap:** channel between strands of a bundle, relative to the maximum width | `GAP` | `0.178` |
| **Notch:** a smooth pocket in the outer edge, used only where a strand meets a data endpoint | `NOTCH` | `mouth: 0.604`, `depth: 0.442`, `at: 0.52`; never thinner than 15 % of the half width |
| **Count** | | 2 strands: Syntaric. 2 in fire colours: openFHIR. 3 fanning out: Unio. |

A strand's centre line is an S-shaped cubic from its start to its end,
bowed by `BLADE.bow` of the chord to each side. The outline is offset from
it by half the profile width, sampled at 25 points and joined with smooth
curves.

**Banned by construction:** glow, blur, bloom, particles, mesh gradients,
neon on dark grounds. `tools/strands.js` has no parameter for any of them.
The only gradient is the openFHIR fire gradient, inside the openFHIR figure.

## Motion vocabulary

Defined in `docs/design-tokens.md`; used from commit 1.3.

| Motion | What moves | Property |
|---|---|---|
| draw | a strand grows from its start | a mask over the strand: a stroked copy of the centre line with `pathLength="1"`, animated by `stroke-dashoffset` (the mask is added in 1.3; the static frame needs none) |
| align | labels slide into line | `transform` |
| fan-out | the Unio strands spread from one point | `transform`, `opacity` |

One easing curve (`--ease`), two durations (`--dur-short`, `--dur-long`).

**Hero choreography (both prototypes):** the FHIR strand draws over 900 ms
from 0 ms; the openEHR strand draws over 900 ms from 200 ms; the labels
slide in (12 px, opacity 0 to 1) over 900 ms from 540 ms. Done at 1.44 s.
The video holds the finished frame until 5 s, then loops.
`hero(…, { t })` draws the frame at progress `t` (0 to 1) by cutting the
strand at `t` of its length; the video renderer (item 47) uses it.

## Figure layouts (proposals, decision E7)

The implementer proposes these; the owner approves the hero at the 1.4 gate
and the others at the 1.5 review. All text comes from `data/snapshot.json`.

| Figure | viewBox | Text zone | Reads | Labels |
|---|---|---|---|---|
| `hero`, layout `wide` (from 960 px, behind the text) | 1440 × 640 | x 0-760, full height (the build fails if a strand or label enters it) | `allergy-mapping`, first pair | FHIR path above the upper strand at (820, 118); openEHR path and archetype id below the lower strand at (860, 590) and (860, 616); mono 22 and 16 |
| `hero`, layout `narrow` (phones, below the text) | 390 × 270 | none | same | mono 13 and 10.5 |
| `openfhirFigure` | 360 × 314 | none | `allergy-mapping`, all 4 pairs | one row per pair: FHIR path left, fire strand with notch, openEHR path right; heads give the resource and the archetype |
| `unioFigure` | 360 × 290 | none | `unio-federation` (synthetic) | query top left; three strands fan from (14, 150) to the right; repository names and row counts at the right; the unreachable one drawn in the hairline tint; result bottom left |
| `divider` | 1200 × 28 | none | a note passed by the build | hairline strand (width 4, tint `#bdc2c5`); mono 12 note right-aligned in `--ink-3` |
| `cardArt` | part of the 1200 × 627 card | none | none | a two-strand bundle from (720, 560) to (1160, 110), width 120 |

Divider placements (proposal): one before Selected work, one before Products
and one before Contact (regions `divider-1` … `divider-3`).

Strands are filled `#122e49` in the SVG; the page may lighten them with CSS
where a figure sits behind text (brief 4.2: light navy tints behind the
text, labels at full ink).

## Known limits

*   **The notch is not drawn yet (commit 1.3).** The feather's notch is a
    hook: a small separate tip with a wedge cut behind it. The `NOTCH`
    rule as a smooth pocket in a strand's edge reads as a pinch, not a
    hook, so the figures render without it. The hook drawing is an open
    item for the 1.4 gate; the measured values stay above.

*   The profile is one symmetric-ended curve; the real blade's width rises
    in a step where the notch's hook adds material (around 0.5 of the
    chord). The fit error is largest there.
*   Label widths for the text-zone test use the mono face's average advance
    (0.632 em); a real glyph run can differ by a few per cent.
*   Arrows and emoji are not in the subset fonts; figure text must not use
    them.
