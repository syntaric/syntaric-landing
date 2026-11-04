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

**Result:** pass / fail. Tells to fix:

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

**Result:** pass / fail.

### Outcome

- If both pass: the mockup's `:root` values are frozen in
  `docs/design-tokens.md` (item 23b), the mockups are deleted, and commit
  0.5 starts.
- If either fails: fix the named tells or the copy, rebuild the mockups and
  run the failing test again before commit 0.5.

## Run 2: finished build

(After Stage 1.)
