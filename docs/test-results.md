# Success test results

Protocol: decision #3 in `docs/designs/site-redesign.md`. Not published
(`docs/` is excluded by `_config.yml`).

Each test runs twice: first on the static mockups (commit 0.5a), then on the
finished Stage 0 + 1 build. Either test failing on the finished build
triggers Stage 2.

## Setup (record once, reuse on every run)

| Item | Value |
|---|---|
| Phone models and OS versions | |
| LinkedIn app version | |
| Template site used as the control | |
| WebPageTest location and device profile (later runs) | |

## Run 1: mockups (commit 0.5a)

Pages, opened from a LinkedIn message on a phone, inside the LinkedIn app:

- **Old page:** `https://syntaric.com/`
- **New page, logo hidden:** `https://syntaric.com/preview/1ne1c5bdaxbcao/blind.html`
- **New page, with logo:** `https://syntaric.com/preview/1ne1c5bdaxbcao/` (5-second test only)
- **Template control:** the site in Setup

### Peer test

5 or more peers. Each sees the old page, the new page (logo hidden) and the
template control, in random order. Record the order shown.

Questions, per page:

1.  Does this look like a template? (yes / no)
2.  Does this look AI-generated? (yes / no)
3.  Would you trust this firm with a national-scale project? (1-5)
4.  One sentence: why?

Then, on the new page only: Which company makes this?

**Pass:** at least 80% of peers, rounded up (4 of 5, 5 of 6, 6 of 7), answer
"no" to both questions 1 and 2 for the new page, **and** no peer names a
specific template tell. A single named tell fails the run; log it as a fix.

| Peer | Order shown | New: template? | New: AI? | New: trust | Old: trust | Control: trust | Reason (new page) | Named tell | Which company? |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |
| 4 | | | | | | | | | |
| 5 | | | | | | | | | |

**Result:** pass, reported by the owner on 2026-11-04. Per-peer answers
not recorded in this table. Tells to fix: none reported.

### 5-second comprehension test

3-5 people outside the field; at least one a hospital IT manager or CIO.
Each sees the first 390 px screen of the new page (with logo) in the
LinkedIn app for 5 seconds, then answers:

1.  What does the company do?
2.  Who is it for?
3.  Is it a consultancy or a software vendor?

**Pass:** at least 4 of 5 (or all but one, if fewer than 5) answer all three
correctly. Any answer of "software vendor" or "shop" is a fail for that
person (the "boutique" H1 risk under #2).

| Person | Role | What it does | Who it is for | Consultancy or vendor | Correct (all 3)? |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**Result:** pass, reported by the owner on 2026-11-04. Per-person answers
not recorded in this table.

### Outcome

Both passed: values frozen in `docs/design-tokens.md`; mockups deleted
(source at commit `2a685c8`).

- If both pass: the mockup's `:root` values are frozen in
  `docs/design-tokens.md` (item 23b), the mockups are deleted, and commit
  0.5 starts.
- If either fails: fix the named tells or the copy, rebuild the mockups and
  run the failing test again before commit 0.5.

## Run 2: finished build

(After Stage 1.)

## Verification Plan checks, local (2026-11-04, after commit 1.7)

Run on `npm run build` served by `python3 -m http.server` (no compression
or HTTP/2, so transfer sizes and LCP are worse than on GitHub Pages).
Browser: the installed Google Chrome, driven by Playwright; axe-core 4,
Lighthouse 12. Scripts were throwaway, not kept in the repo.

| Check | Result |
|---|---|
| `npm run check` | Pass: 46 tests, 46 outputs match, links and baseline URLs resolve |
| axe on `/`, `/blog/` and 3 posts, at 390 and 1280 px | Pass (0 violations) after one fix: blog pages had no `<main>` landmark (`landmark-one-main`, `region`); `blog/build.js` now wraps the content in `<main>` |
| Lighthouse mobile, `/` | Performance 99, Accessibility 100, SEO 100, Best practices 100; LCP 2.0 s (the who-for line), CLS 0.017, TBT 0 ms, 320 KiB. One fix: the footer email and phone links were 2 px apart (`target-size`); gap now 0.4rem |
| Lighthouse mobile, `/blog/` and one post (not a plan target) | Performance 77 and 86: LCP 6.6 s and 4.3 s, the 2376 x 1652 PNG cover. Accessibility, SEO, Best practices 100 |
| No JavaScript, 390 and 1280 px | Every section visible, figures in their finished state, no video; on phones the nav links show without the Menu button |
| Reduced motion, 390 and 1280 px | Only `js` on `<html>` (no `motion-ok`), 0 animations, no video, every figure finished; the Menu button opens the nav |
| Hero contrast behind the text (copy hidden, `.hero-text` box), 960-1920 px at 0, 1, 2, 3, 5 s and reduced motion | Steady state passes: highest 1.159:1 on the still (reduced motion) and 0 pixels over 1.2:1 with the video playing. At 0 s, Chrome's first paint puts 23 antialiased edge pixels of the faint bundle at 1.20-1.23:1; gone by 1 s. At 390 px the field is below the text (1.0:1) |
| Content (inventory rows not dropped are on the page) | Pass: 61 of 61 rows found on the built pages, ids and all 26 client names included. B1 and B2 (years, project count) were dropped under §3 of the inventory but still said "rewritten"; their rows now say dropped |

Still to run (need the deployed site, phones or people): `check-deploy.sh`,
LinkedIn Post Inspector for the cards, VoiceOver and TalkBack, WebPageTest
and the 6x CPU trace, the devices in the LinkedIn app, the GoatCounter
click events, and the success tests of run 2.
