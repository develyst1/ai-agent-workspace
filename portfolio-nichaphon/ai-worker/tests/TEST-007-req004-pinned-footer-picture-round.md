# TEST-007: REQ-004 — the pinned modal footer, SEEN at 360x740 and 1280x900

- Source REQ: REQ-004 (AC-a, AC-b, AC-c, AC-d, AC-g) + the owner's SQ19 pictures
- Status: **TEST_PASSED** — 2026-09-05, Tanya
- Environment: **local only.** Production (`portfolio.develyst.online`) never
  opened, not even a GET. The owner's live project URLs were **read off the DOM
  and never clicked** (REQ-004 Constraint 4) — the whole run's network log
  contains `127.0.0.1:3071` and nothing else (0 non-local requests, counted).
- Tested: 2026-09-05 by Tanya
- Evidence: `../../project-docs/qa-test007-2026-09-05/` — 18 pictures +
  `test007-run.txt` (the raw run) + `test007-data.json` (every measured box)
- Harness: `tests/harness/test007-2026-09-05.cjs`

## Surface this round ran on — declared, as Porter required

**The production build already on disk, served, not rebuilt.** `front/.next`
held Sober's build (`BUILD_ID nl80q9MCSEUqycpY3q5Id`, files stamped 18:44); I
**served it** rather than clearing and rebuilding — `node .next/standalone/server.js`
on **port 3071**, `HOSTNAME=127.0.0.1`. Never `npm run dev` on top of it.

Before serving I checked the built CSS actually carries the change, so this is
not a dev-only reading: `.next/static/css/071078ee87298f66.css` contains
`position:sticky;bottom:0;z-index:1;background-color:var(--site-surface);
padding-bottom:var(--mantine-spacing-lg);margin-bottom:calc(var(--mantine-spacing-lg) * -1)`.

**Port 3000 was not taken and not touched** (no listener found; I used 3071
regardless). My server was stopped at the end and verified gone from `netstat`.
`front/.next` was **left exactly as found** — Sober's build, same `BUILD_ID`,
not deleted, because it is his and Porter's acceptance pass may still want it.
`git status` in the code repo is unchanged: one modified path,
`front/src/components/partials/Portfolio/Modal/ProjectModal.module.css` — Fern's,
untouched by me. **Zero git writes, zero product-code edits, no deploy.**

## Scope

Covers exactly what Porter asked for in REQ-004 §Acceptance pass: all **eleven**
`/portfolio` modals at **360x740** (the 7 with a button and the 4 with the
no-demo note), the **two new modals at 1280x900**, the AC-g behaviour counts,
and the **SQ19 "is the pinned bar intrusive?" picture pair** with the bar
measured.

**Deliberately not run, exactly as instructed:** no re-derivation of the approved
strings against DRAFT-001, no re-audit of SPEC-004's eleven-entry coverage table,
no full REGRESSION re-run, and **no judgement of whether the new placement looks
good** — I supply the pictures, the owner supplies that verdict.

**How each modal was opened, so nothing here is a stale reading:** the page was
**reloaded from scratch before every single modal**, the card trigger clicked,
and the modal's own scrollport (`.mantine-Modal-content`) asserted at
`scrollTop = 0` before anything was measured or shot. Headed Chrome, tab fronted,
throwaway wake screenshot first (`document.hidden = false`, verified and printed).

**One thing I declare rather than let pass unnoticed:** clicking card #6-#11
scrolls the *page* down to bring that card into view (`window.scrollY` runs up
to 5027) — that is a visitor scrolling the grid to reach a card, which is not
what AC-a forbids. The modal is `centered` and painted in a fixed overlay, so
page scroll does not move it; the bar AC-a sets is **the modal's own scroll**,
and that was **0 on all eleven**.

## Cases

Viewport 360x740; the modal's scrollport bottom (its fold) is **y = 703**.
"Box" = the "Open live project" button, or the no-demo note where there is no
button. Every row's picture is in `../../project-docs/qa-test007-2026-09-05/`.

| # | Case (from AC) | Type | Viewport | Steps | Expected | Actual | Result |
|---|----------------|------|----------|-------|----------|--------|--------|
| 1 | **AC-a** Learning Curve | happy | 360x740 | reload → open card 01 → assert `scrollTop 0` → shoot | button fully inside the viewport, no scrolling | button **634 → 678** (viewport 740), `scrollTop 0`, scrollport 1285/664 (overflows), footer `position: sticky`, bg `rgb(21,17,34)`, `elementFromPoint` at the button centre returns the button's own label — nothing covers it. `href https://learning.develyst.online/` `target=_blank` `rel=noopener noreferrer`. Seen: `a01-learning-curve-360.png` | **PASS** |
| 2 | **AC-b** Ong Match | happy | 360x740 | same | same | button **634 → 678**, `scrollTop 0`, 1323/664, same href `https://ong.develyst.online/`, same `target`/`rel`. Seen: `a02-ong-match-360.png` | **PASS** |
| 3 | **AC-c** DTE Platform | happy | 360x740 | same | same | button **634 → 678**, `scrollTop 0`, 894/664. `href https://dte.develyst.online` (DOM attribute), `a.href` IDL reports the trailing slash — the browser normalising a bare origin, already on the record. Seen: `a03-dte-platform-360.png` | **PASS** |
| 4 | **AC-c** Develyst Company Website | happy | 360x740 | same | same | button **632.69 → 676.69**, `scrollTop 0`, **661/661 — does not overflow** (SQ21 reproduced). `href https://develyst.online`. Seen: `a04-develyst-web-360.png` | **PASS** |
| 5 | **AC-c** Laichill | happy | 360x740 | same | same | button **601.94 → 645.94**, `scrollTop 0`, **600/600 — does not overflow** (SQ21 reproduced). `href https://laichill.develyst.online`. Seen: `a05-laichill-360.png` | **PASS** |
| 6 | **AC-c** YodBarber Queue Booking | happy | 360x740 | same | same | button **634 → 678**, `scrollTop 0`, 778/664. `href https://yodbarber.develyst.online`. Seen: `a08-yodbarber-360.png` | **PASS** |
| 7 | **AC-c** AI Voice Avatar | happy | 360x740 | same | same | button **634 → 678**, `scrollTop 0`, 803/664. `href https://avatar.develyst.online`. Seen: `a09-ai-voice-avatar-360.png` | **PASS** |
| 8 | **AC-c exceptions** — the 4 link-less entries | edge | 360x740 | same, one picture each | the pinned bar holds the no-demo note instead of a button | all four paint `Internal project — no public demo available.` inside the pinned bar, note box **656.56 → 678** on each, `scrollTop 0`, no anchor present (`href`/`target`/`rel` all null). RAG Chatbot 724/664 · Enterprise Backend Optimisation 726/664 · Develyst AI Gateway 781/664 · R1-BEV 923/664. Seen: `b06-…`, `b07-…`, `b10-…`, `b11-…` | **PASS** |
| 9 | **AC-d** Learning Curve, desktop | regression | 1280x900 | reload → open card 01 → shoot | button visible on open, modal still readable | button **734.69 → 778.69** inside a 900px viewport; scrollport **705/705 — no overflow, so sticky is inert**; the modal reads exactly as it did (summary, 5 bullets, 11 chips, hairline, button last). Seen: `c01-learning-curve-1280.png` | **PASS** |
| 10 | **AC-d** Ong Match, desktop | regression | 1280x900 | same | same | button **760.19 → 804.19**; scrollport **756/756 — no overflow**. Seen: `c02-ong-match-1280.png` | **PASS** |
| 11 | **AC-g** the modal still behaves | happy | both | for every modal above: open → paint → `Escape` → check the lock | opens, paints, `Escape` closes, scroll lock released, 0 errors | **13/13 opens** (11 mobile + 2 desktop) painted a titled dialog with a non-zero footer box; **`Escape` closed 13/13**; the scroll lock was released 13/13 (`data-scroll-locked` gone, `body.style.overflow` empty). Over the **whole** run: **0 console errors · 0 pageerrors · 0 failed requests · 0 non-local requests** | **PASS** |
| 12 | **SQ19 (not an AC)** — is the pinned bar intrusive? | evidence | 360x740 | Learning Curve → scroll the modal to the middle, shoot → scroll to the end, shoot | the bar seen over content, and seen un-pinned at full scroll, with its height measured | **Bar measured 613 → 702 = exactly 89px**, i.e. **13.4% of the 664px scrollport** — Fern's ~89px confirmed independently. **Mid-scroll** (`scrollTop 311/621), `d1-sq19-midscroll-360.png`: the bar sits over the bullet list — `elementsFromPoint` at its top edge returns `DIV.footer` first and `UL.highlights` underneath. **Full scroll** (`scrollTop 621/621), `d2-sq19-fullscroll-360.png`: the bar sits at the natural end (613 → 702 against a scrollport bottom of 703), the last chip `JWT` (555.38 → 581.38) and the last bullet (314.94 → 365.94) are both **uncovered** — `elementFromPoint` returns each element itself, not the bar. **Un-pinning seen, not argued** | **PASS (evidence supplied; the verdict on "intrusive" is the owner's)** |

## Observations — not defects, nothing here fails an AC

### OBS-9 — the pinned bar costs 89px of reading area on every modal, and at open it hides the top of the "What it does" list on the two entries the owner approved

**This is the cost SQ19 warned about, now seen rather than predicted.** The bar
is 89px tall and is present on **all eleven** modals at 360 — including the four
that only carry the no-demo note. On the **nine** modals whose content overflows
it therefore covers whatever content sits beneath it, and at open the clipped
edge lands mid-line on several:

- **Learning Curve** (`a01`) and **Ong Match** (`a02`) — the last thing the
  visitor sees before the bar is the label **"What it does"**. **None of the five
  bullets is visible until they scroll.** These are the two entries the owner
  approved word-for-word on 2026-09-05.
- **DTE Platform** (`a03`) — the bullet *"Semantic search backed by vector
  databases"* is sliced horizontally through the word "databases".
- **YodBarber** (`a08`), **AI Voice Avatar** (`a09`), **Develyst AI Gateway**
  (`b10`) — the `Stack` chip row is sliced, chips half-drawn.
- **R1-BEV** (`b11`) — the fifth bullet is sliced mid-line.

The two entries that never overflowed (**Develyst Company Website**, **Laichill**)
show none of this: their whole modal fits and the bar sits at its natural end.
Desktop shows none of it either — 705/705 and 756/756, sticky inert.

**I name no cause and propose no fix**; whether this trade is acceptable is the
owner's eye, and REQ-004 says so itself. It is put here because the owner asked
"is the pinned bar intrusive" and this is the honest answer in pictures.

### OBS-10 — SQ21 independently reproduced

Measured on my own run, not taken from the task: of the **7** linked entries,
**Develyst Company Website (661/661)** and **Laichill (600/600)** do not overflow
at 360, so their buttons were already on screen before TASK-018. **The fix moved
5 of the 7.** All seven meet AC-a's bar today.

## Verdict

**`TEST_PASSED`** — 12 of 12 cases pass, **0 defects**. On a 360x740 phone the
"Open live project" button is **inside the viewport with no scrolling on all
seven linked modals**, the four link-less ones show the no-demo note in the same
pinned bar, desktop 1280x900 is unchanged (sticky provably inert, no overflow),
and the round is clean: 0 console errors, 0 pageerrors, 0 failed requests.

**What this verdict does NOT cover, said plainly:** whether the new placement
*looks good*, and whether the 89px bar is *intrusive*. Both are excluded by the
REQ and both are the owner's call — OBS-9 and case 12 are the material he needs
to make it. Ticking AC-a…AC-d and AC-g is Porter's, not mine.

## Questions

- **QQ13 — where does OBS-9 go?** It is a *consequence* of REQ-004's own fix, not
  a defect, and it lands on the two entries the owner approved himself. Does it
  ride to him **with** the SQ19 pictures (one question: "here is the bar, here is
  what it covers, is that acceptable?"), or does it go as its own line the way
  OBS-8 did? **I am not choosing** — routing to the owner is yours, exactly as
  QQ12 was.
