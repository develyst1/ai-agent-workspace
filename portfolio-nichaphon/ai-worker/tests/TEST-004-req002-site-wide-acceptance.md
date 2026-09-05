# TEST-004: REQ-002 site-wide acceptance round (full REGRESSION + R9 sweep + the 7 SQ8 eyes)

- Source REQ: REQ-002 (AC3 + AC6), plus SPEC-002 §Questions SQ8 (the 7 eye checks)
- Status: **TEST_FAILED** — see §Verdict. Two defects, both visual/layout, neither
  breaks a function. R9 (AC6) passed outright on all six routes.
- Environment: local only — `cd front && npx next dev -p 3021`,
  **http://localhost:3021**. Production was never opened, not even a GET.
- Tested: 2026-09-05 by Tanya
- Harness (3 rounds, all in `tests/harness/`, Playwright installed OUTSIDE the
  repo via `NODE_PATH`; `front/package.json` untouched):
  `test004-2026-09-05.cjs` (sweep) · `test004b-2026-09-05.cjs` (six re-probes)
  · `test004c-2026-09-05.cjs` (/about re-capture after the images settle)
- Browser: the machine's Chrome via `channel: 'chrome'`, **headed**
  (`headless: false`) — chosen so real frames, real scrolling and real
  `:focus-visible` are in play. That is the one thing every earlier round lacked.
- Evidence folder: `../project-docs/qa-test004-2026-09-05/` (58 files: 12
  full-page route shots at both viewports, the overlay/focus/eye shots, plus
  `_raw-results.json` and `_raw-results-round2.json`)

## Scope

**Covers**, exactly the three outcomes Porter asked for:

1. the full `REGRESSION.md` re-run after the step-up — **S1–S13 and H1–H8**;
2. the **R9 forbidden-string sweep on all six rendered routes** (never done on
   the five non-Home routes before today);
3. the **7 SQ8 eye checks**, answered as observations.

**Does NOT cover** — stated plainly rather than left to silence:

- **A production build.** `npm run build` was not run — see QQ5. That is
  TEST-003 and TEST-003 stays open and separate, with its own verdict.
- **The modal / drawer / lightbox *look*.** They open and close and I say what
  I saw, but ticking the skin is Sober's gate, not mine.
- **The `/contact` submit path.** Never fired: a real submit sets
  `window.location.href = mailto:` and would launch the owner's mail client
  (REGRESSION §Never done by QA, item D). So the submit button's **loading
  label** stays unverified — deliberately, not by omission.
- **Cause or blame for anything found.** I did not test a pre-step-up tree and,
  per the REQ-001 standing rule, I do not track or reason about the human's git.
  "H8 fails today" is not "REQ-002 broke H8".
- **Checkout state.** I tested what the dev server served on 2026-09-05.

## How this round was run

- **Port 3021, not 3000.** Port 3000 was held by PID 8508 — a `next` server for
  this same repo that this session did not start and does not own. I did not
  touch it; I started my own dev server on 3021 and stopped it (PID 18740) at
  the end. `front/.next` was left as I found it: a **dev** output, no `BUILD_ID`.
- Every route was **scrolled end to end** before measuring, one
  `requestAnimationFrame` per step. This is the difference that settled three of
  the eyes: the engineer's harness never scrolled and never ran a frame, so lazy
  content never intersected and animations never ran.
- Focus checks were reached by **real `Tab` presses**, not `el.focus()` —
  `:focus-visible` does not apply to a programmatic focus, and that alone
  explains one of the two contradictory readings in SQ12.
- Every verdict below is from a screenshot I opened and read. Harness lines are
  quoted as measurements, never as the result.

---

## Cases — site-wide (REGRESSION S1–S13)

| # | Check | Viewport | Actual | Result |
|---|-------|----------|--------|--------|
| S1 | Six routes 200, none renders 404 | both | All six HTTP 200; `is404` false on all twelve loads | **PASS** |
| S2 | Every route has an `h1` and its own `<title>` | both | 1 `h1` each; six distinct titles (`Nichaphon Sayvav — Senior / AI Software Engineer`, `About/Services/Portfolio/Blog/Contact — Nichaphon Sayvav`) | **PASS** |
| S3 | 6 header nav links land on their own path | desktop | 6/6 clicked, 6/6 landed | **PASS** |
| S4 | 5 footer nav links land on their own path | desktop | 5/5 clicked, 5/5 landed | **PASS** |
| S5 | Mobile drawer opens, lists six routes, navigates, closes | mobile 360 | Burger → `[role=dialog]`=1, drawer 280×740, scroll-locked, exactly 6 links; clicked Services → `/services`, dialog back to 0, scroll lock released. Seen in `s5-02-drawer-open.png` | **PASS** |
| S6 | No console errors / pageerror / failed requests | both | 0 errors, 0 pageerrors, 0 failed requests on all twelve loads | **PASS** |
| S7 | `data-mantine-color-scheme="dark"`, body `rgb(11, 9, 22)` | both | Both hold on all twelve loads | **PASS** |
| S8 | No horizontal overflow at 360 | mobile | `scrollWidth === clientWidth` (345) on all six. `/services`' 887px table sits inside `.ServicesTable_scroller` (`overflow-x: auto`, client 303) — the page does not overflow. See DEF-3 for what that costs a visitor | **PASS** |
| S9 | No invisible or unreadable text | both | Read against the 12 full-page shots, not a contrast script. Nothing rendering at its own ground on any route | **PASS** |
| S10 | The three webfonts actually load | both | `Space Grotesk`, `IBM Plex Sans Thai`, `JetBrains Mono` all loaded on 5 of 6 routes. On `/contact` JetBrains Mono is **not** loaded — because **0 elements on that page ask for it** (control: `/portfolio` has 54 and loads it). On-demand loading working as designed, not a miss | **PASS** (see OBS-2) |
| S11 | `npm run build` exits 0 | — | **Not run this round** — see QQ5 | **NOT_TESTED** |
| S12 | Every overlay opens **and** closes, with the hydration control | desktop + mobile | Hydration control `header[data-scrolled]` false→true on all three pages. T1 `/portfolio` "Project detail" → dialog 760×590 with content → Escape → 0. T2 `/about` thumbnail → dialog 1100×810, image 1035×720 natural 1100×810 → Escape → 0. T3 `/` @360 burger → drawer → close. All three scroll-locked while open | **PASS** |
| S13 | No image renders at 0×0 | both | All 9 `/about` frames non-zero **and painted**: desktop boxes 244×183 / 337×210, naturals 320×235…422×367; mobile boxes 303×227 / 303×189, naturals 359×265…359×313. Nine `/_next/image` responses, all HTTP 200, none failed. Seen in `b3-s13-certificates-row.png`, `b3-s13-testimonials-row.png`, `desktop-about-full.png`, `mobile-about-full.png` | **PASS** — **DEF-1 is closed** (see §DEF-1 below) |

## Cases — Home (REGRESSION H1–H8)

| # | Check | Viewport | Actual | Result |
|---|-------|----------|--------|--------|
| H1 | No light/dark toggle or colour-scheme control anywhere | desktop | 0 suspects across every `button`/`[role=switch]`/`input` matching theme·scheme·dark·light·mode·toggle; 0 `*ColorScheme*` nodes; `html` pinned `dark` | **PASS** |
| H2 | Between one and three of the four R5 quotes, never all four | desktop | Two: quote 4 (hero) and quote 2 (statement band, th + en) | **PASS** |
| H3 | Every rendered quote R5-exact | desktop | Four leaf strings, all exact: `Don't say why me. Say try me.` (29) ×2; `ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร` (42, `lang=th`); `I don't work "for" anyone. I work "with" them.` (46, `lang=en`). The 88-char node is the ancestor container concatenating th+en — the documented non-diff, not a mismatch | **PASS** |
| H4 | None of R9's strings on Home | both | 0 hits in text, 0 in source — see the R9 table below | **PASS** |
| H5 | No new or altered client-facing string on Home except the quotes | — | **Cannot be run from here.** The check compares against "the last pre-REQ baseline", and no such captured baseline exists in `tests/` or `../project-docs/` for me to diff against. I will not turn "I see nothing odd" into a PASS on a character-exactness check | **NOT_TESTED** |
| H6 | Reduced motion: no animations at first paint, hero fully visible, two settled frames identical — **with the no-preference control** | desktop | `reduce`: `getAnimations()` = **0** at first paint, hero `opacity: 1`, `transform: none`, box 1056×250 — fully visible, not stuck at the start state; two settled frames byte-identical. Control `no-preference`: `getAnimations()` = **1** (`HomeHero_rise`) — so the check can detect motion | **PASS** |
| H7 | Skip link by keyboard | desktop | Fresh load, first `Tab` → `a.site-skip-link` "Skip to content", `href="#main"`, **visible** ring `rgb(164,136,255) solid 2px`, box 146×52 at top 8 / left 8. `Enter` → `location.hash === "#main"`; the next `Tab` lands on "View my work", **inside `<main>`**. (Round 1 read this as a fail — my own fault: I clicked the page first, which moved the sequential-focus start point. `b1-h7-first-tab.png` is the honest run) | **PASS** |
| H8 | Hero renders its **full set** at 360×740 above the fold: name, nickname/role, lead, **both CTAs**, hero quote | mobile 360×740 | Name 177–265 ✅, role line 285–311 ✅, lead 335–610 ✅, CTA 1 "View my work" 650–694 ✅ — but **CTA 2 "Get in touch" 706–750** (10px past a 740 fold) and the **hero quote 782–809**, both below it. Seen in `b2-h8-fold-360x740.png`: the second CTA is sliced through and the quote is not on screen | **FAIL** — DEF-2 |

## R9 forbidden-string sweep (REQ-002 AC6) — the part nobody had ever run on the five non-Home routes

Eight strings, checked twice per route — against rendered `innerText` **and**
against `documentElement.outerHTML` (so a string hidden in an attribute, a
comment or a `<script>` payload would still be caught) — at both viewports.

| Route | `FAEK` | `150+` | `Win Awards` | `12Years` | `Li Europan` | `Get Started` | `CREATIVE` | `agency.` |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `/` | — | — | — | — | — | — | — | — |
| `/about` | — | — | — | — | — | — | — | — |
| `/services` | — | — | — | — | — | — | — | — |
| `/portfolio` | — | — | — | — | — | — | — | — |
| `/blog` | — | — | — | — | — | — | — | — |
| `/contact` | — | — | — | — | — | — | — | — |

**0 hits out of 96 text checks and 96 source checks.** AC6 is met on the
rendered site — **PASS**.

## The 7 SQ8 eye checks

| Eye | The ask | What I saw | Evidence |
|---|---|---|---|
| 3rd | Nobody has seen the rebuilt `/portfolio` cards, `/blog` rows or `/contact` panels | **Seen, all three.** `/portfolio`: 9 cards, corner brackets + node dot, mono ordinals `01`–`09`, chip rows, "Project detail ↗". `/blog`: filter chip row + 6 rows with mono date/category/read-time. `/contact`: form panel + 4 FAQ items + channels. They render as the SPEC describes; whether that is *bold enough* is AC2 and stays the owner's | `desktop-portfolio-full.png`, `desktop-blog-full.png`, `desktop-contact-full.png` (+ the three mobile twins) |
| 4th | Does each FAQ item open **and** close (mouse + keyboard, focus ring), and is the hover ground perceptible? Plus: fields accept input; submit loading label | **Opens and closes both ways.** Mouse: `aria-expanded` false→true→false, panel height 0→99→0, chevron flips. Keyboard: `Enter` opens, `Enter` closes. **Focus ring is clearly visible** — `outline: rgb(164,136,255) solid 2px`, offset 2px, reached by a real `Tab`. **Hover ground is perceptible** — `rgba(0,0,0,0)` → `rgba(164,136,255,0.1)`, and in the shot the hovered item reads distinctly lighter than its three siblings; it is a soft cue, not a strong one. All three fields accept typed input. **Submit loading label NOT tested** — never submitted, by rule | `sq8-eye4-accordion-hover.png`, `-open.png`, `b4-focus-accordion-real-tab.png`, `sq8-eye4-form-filled.png` |
| 5th | Does the visitor actually see the nine `/about` lightbox images? | **Yes — at both viewports.** All nine painted: box non-zero **and** `naturalWidth > 0` **and** `complete`. The four certificates and five client conversations are legible in the shots. This is S13's authoritative re-run: **DEF-1 is closed for the visitor**, not merely measured | `b3-s13-certificates-row.png`, `b3-s13-testimonials-row.png`, `desktop-about-full.png`, `mobile-about-full.png` |
| 6th | The disagreement: tab into Name / Email / Message — a ring, a border change, or nothing? | **Settled: a border change, and it is plainly visible. Sober's read is the correct one.** Reached by a real `Tab`, each field matches `:focus-visible`; `outline-style` is **`none`** (so there is genuinely no ring — Fern was right about that half), but `border-top-color` goes **`rgb(68,60,92)` at rest → `rgb(164,136,255)` focused**, and in `b4-focus-name-field-real-tab.png` the focused Name field is unmistakable against the two unfocused ones. Fern's "`rgb(68,60,92)` at rest *and* focused" was taken unfocused — his own note says real `Tab` presses did not move focus in his harness. **This resolves SQ12**; whether a 1px border change is *sufficient* under WCAG 2.4.7 is a call for Porter → the owner, not mine | `b4-focus-name-field-real-tab.png`, `-email-`, `-message-` |
| 7th | Mobile navigation at 360 — verified by nobody | **Verified end to end.** Burger → drawer 280×740 with exactly the six routes and the active marker on the current one → tapped Services → landed `/services` → drawer closed, scroll lock released. **SQ7 is harness-only for the drawer too**: it opens for a real visitor | `s5-01/02/03-*.png` |
| (a) | Is the D1 lattice still visible at all below the fold? | **Yes.** On `/services` below the fold both rhythms read: the 16px fine grid and the heavier 64px lines, violet on the dark ground. Tokens as designed: `--site-grid-line: rgba(164,136,255,0.045)`, 64px / 16px, `position: fixed`, `z-index: -1`, mounted once. On Home it does not read — which is SQ9's own decision (the aurora is the ground there), not a fault | `sq8-eyeA-lattice-crop.png`, `-below-fold-services.png` |
| (b) | The `prefers-reduced-motion: reduce` render, which could not be emulated before | **Emulated and correct.** Under `reduce`: 0 animations at first paint and the hero fully visible (`opacity: 1`, `transform: none`) — it is not stuck at the entrance animation's start state. Control under `no-preference`: exactly 1 animation, `HomeHero_rise`. Same evidence as H6 | `h6-reduce-frame-a/b.png`, `h6-no-preference-frame-a/b.png` |

### The five opening-block heights SQ8 was collecting — and a corroboration

Measured as the first child of `<main>`, at 1280×800-equivalent and 360×740:

| Route | 1280 | 360 |
|---|---|---|
| `/about` | 1243.03 | 532.88 |
| `/services` | **742.59** | **371.52** ← the fifth number SQ8 was missing |
| `/portfolio` | 992.81 | 415.67 |
| `/blog` | 867.70 | 415.67 |
| `/contact` | 742.59 | 371.52 |

Four of the five match Sober's numbers exactly (1243 / 992.81 / 867.70 / 742.59
and both 415.67s), measured independently with a different method — so the
`/services` figure can be trusted on the same footing. The *question* SQ8 asks
of the owner is unchanged and is not mine to answer.

---

## Defects

### DEF-1 — `/about` lightbox thumbnails render 0×0 — **CLOSED by this round**

Raised in TEST-002, `REGRESSION S13` **FAIL 2026-09-03**. Re-run today at both
viewports: all nine frames have a non-zero box **and** a decoded image inside it,
and the images are legible in the screenshots. **S13 now PASSES.** Porter may
tell the owner it is fixed — that sentence was waiting on this run.

### DEF-2 — Home hero no longer fits at 360×740: the second CTA is cut and the hero quote is off-screen — **MAJOR**

- Viewport: **mobile 360×740** (desktop unaffected)
- Repro, from a clean load: 1. `npx next dev` · 2. open `/` at exactly 360×740
  · 3. do not scroll · 4. look at the bottom of the first screen.
- Expected (REGRESSION H8, a REQ-001-accepted criterion, last PASS 2026-09-02):
  name, nickname/role, lead, **both CTAs** and the hero quote all above the fold.
- Actual: name 177–265, role 285–311, lead 335–610 and CTA 1 "View my work"
  650–694 are above the fold; **CTA 2 "Get in touch" runs 706–750** — sliced by
  the 740px fold — and the **hero quote sits at 782–809**, entirely below it.
  The lead alone occupies 275px / seven lines at this width.
- Console: clean. No error text.
- Evidence: `../project-docs/qa-test004-2026-09-05/b2-h8-fold-360x740.png`
- **I am not naming a cause.** I did not test a pre-step-up tree and I do not
  reason about git; "H8 passed on 2026-09-02 and fails on 2026-09-05" is the
  whole of what I know. See QQ4.

### DEF-3 — `/services` at 360: two of the table's three columns are off-screen behind a scroller with no visible affordance — **MAJOR**

- Viewport: **mobile 360×740**
- Repro, from a clean load: 1. open `/services` at 360×740 · 2. scroll to the
  services table · 3. do not swipe sideways.
- Expected: a phone visitor can reach "What it covers" and "Stack" — the two
  columns that carry the actual substance of the page's main section.
- Actual: the table is **887px wide inside a 303px scroller**
  (`.ServicesTable_scroller`, `overflow-x: auto`). Only the "Service" column is
  on screen; the six service names sit beside ~530px of empty rows whose height
  is set by the hidden columns. There is **no scrollbar, no edge fade, no hint
  text** — nothing tells the visitor the content continues sideways, so the
  section reads as broken/empty rather than scrollable.
- The page itself does **not** overflow (`scrollWidth === clientWidth === 345`),
  so S8 correctly passes; this is a different failure from the one S8 tests, and
  no existing check would have caught it.
- Console: clean.
- Evidence: `../project-docs/qa-test004-2026-09-05/b6-services-table-360.png`,
  `mobile-services-full.png`
- Whether a sideways-scrolling table at 360 is the intended design is a scope
  question, not my call — see QQ6.

## Observations (not defects — recorded so nobody re-discovers them)

- **OBS-1 — the nine `/about` images are slow to paint on a cold `next dev`.**
  At ~1.5s after scrolling they were still `complete: false`, `natural 0×0`;
  waiting longer, all nine settled (9 × `/_next/image` HTTP 200, 0 failures).
  This is the dev image optimiser, not the product — but it is exactly the
  reading that would make a hasty round file a false DEF. Whether the **built**
  output is quicker is TEST-003's, not asserted here.
- **OBS-2 — `/contact` legitimately does not load JetBrains Mono**: 0 elements
  on that page resolve to it (`/portfolio` has 54 and loads it). On-demand font
  loading, working as intended. S10 stays PASS; do not re-report it.
- **OBS-3 — `/blog` row meta wraps inconsistently** (COSMETIC): rows 1–2 put
  "N min read" on its own line, rows 3–6 keep it inline with the category. Seen
  in `desktop-blog-full.png`. Not raised as a defect; no check covers it.
- **OBS-4 — the footer still reads `© 2025`** on every route. Pre-existing,
  already open as TEST-001 Q1. Unchanged.

## Verdict

**`TEST_FAILED`** — one REGRESSION check fails on the running site (**H8**,
DEF-2) and a second, previously-uncovered mobile failure was found (DEF-3).
Neither breaks a function; both are what a visitor sees on a phone.

What this round **does** settle, and Porter can act on immediately:

- **AC6 — PASS.** The R9 sweep is clean on all six routes, in text and in
  source, at both viewports. This was never checked before today.
- **AC3 — PARTIAL, not met.** 20 of 23 REGRESSION checks re-ran and pass;
  **H8 fails**, **H5 and S11 are `NOT_TESTED`** with reasons (no captured
  baseline exists for H5; the build was not run, see QQ5). AC3 asked for a
  re-run rather than an assertion — this is the re-run, and it is honest about
  its three gaps.
- **DEF-1 is closed**, on evidence, at both viewports.
- **SQ12 is settled** by the sixth eye, in Sober's favour.
- **SQ7's drawer half is settled for a real visitor**: mobile nav works at 360.

Nothing here is rounded up. `TEST_FAILED` stops the release for DEF-2 and DEF-3
until Porter and the owner decide what they are worth.

## Questions

(For Porter; he answers as `> answer: ...`)

- **QQ4 — DEF-2 / H8.** H8 is a REQ-001-accepted criterion that passed on
  2026-09-02 and fails today. Two things I will not decide: (a) whether this is
  reported to the owner as a regression or re-scoped the way "Known and
  accepted" item C was for the 1280×600 fold; and (b) how it is worded — I have
  deliberately not said REQ-002 caused it, because I did not test a pre-step-up
  tree and I do not reason about git.
- **QQ5 — S11 was not run, and here is exactly why.** Port 3000 is held by a
  `next` server for this same repo that this session did not start (PID 8508).
  `npm run build` writes into `front/.next`, which that process is also using —
  producing a build would have interfered with a process I do not own and would
  have left `front/.next` holding a build output, which then breaks the next
  role's `npm run dev` unless they clear it first. Since **TEST-003 is the build
  round** and is still open, I left the build to it rather than take that side
  effect for a check TEST-003 runs anyway. If you would rather S11 be re-run
  inside TEST-004, say so and I will — but the orphan on 3000 should be dealt
  with by the human first.
- **QQ6 — DEF-3 / `/services` at 360.** Is a horizontally-scrolling three-column
  table the intended mobile design (in which case the finding is "it needs a
  visible affordance"), or is the table meant to reflow at that width? I report
  what a visitor sees; which of those two it is, is scope.
- **QQ7 — H5 has no baseline and therefore cannot ever be re-run as written.**
  It asks for a character-level diff against "the last pre-REQ baseline", and no
  captured baseline exists anywhere I may read. Either someone provides one (a
  DATA REQUEST, or a stored capture), or H5 should be rewritten into something
  runnable. It will otherwise be `NOT_TESTED` in every future round.

---

### Porter's answers, 2026-09-05 (TEST-004 intake)

> **answer QQ4 (DEF-2 / H8) —** Neither half is mine to close alone, so here is
> exactly how each is handled. **(b) wording, mine, settled:** I report it to the
> owner as *"on 2026-09-05 the Home hero no longer fits at 360×740 — the second
> button is cut by the fold and the quote is below it"*, with the screenshot and
> **no cause named**. I will not write "REQ-002 broke it" and I will not write
> "it is unrelated" either; nobody tested a pre-step-up tree, so both sentences
> would be inventions. **(a) regression vs re-scope is the owner's**, because
> H8's bar came from his own REQ-001 sign-off and only he may lower it — asked as
> **Q23** on 2026-09-05. Your `FAIL` stands as written in the meantime; I have
> not softened it, and DEF-2 is recorded in REQ-002 §Acceptance record.
> **You are right not to have decided it.**

> **answer QQ5 (S11 not run) —** Your call was the correct one and I am not
> asking you to re-run it inside TEST-004. `npm run build` writing into
> `front/.next` while a `next` process you do not own is reading it is exactly
> the kind of side effect a QA round must not take, and **TEST-003 is the build
> round** — S11 belongs to it. So: **S11 stays `NOT_TESTED` in TEST-004, and
> TEST-003 owns it.** I am carrying to the owner that PID 8508 on port 3000 is
> his session's orphan to clear (it is already in his questions from the
> 2026-09-04 FQ36 finding); the standing rule that an occupied port is routed
> around and never cleared by a role is unchanged and you followed it.

> **answer QQ6 (DEF-3 / `/services` at 360) —** I can settle the half that is on
> the record and I will not guess the half that is not. **On the record:** the
> table *deliberately* stays a `<table>` — SPEC-002 §Flow item 2, an SA decision
> taken on 2026-09-02 because turning it into cards would delete the three
> visible column headings `Service` / `What it covers` / `Stack` (R4 forbids
> that) and break its `role="region"` structure. So "reflow into cards" was
> **considered and rejected inside REQ-002**, and it is not something the team
> quietly failed to do. **Not on the record, and therefore the owner's:** whether
> a phone visitor sideways-scrolling a table is acceptable at all, and whether he
> wants an affordance added now or the mobile layout rethought later — asked as
> **Q24** on 2026-09-05. **Your finding stands either way**: "no scrollbar, no
> edge fade, no hint text" is a fact about what a visitor sees and is not
> contingent on which of the two he picks. Also on the record and not asserted by
> me: **nobody has established whether this pre-dates REQ-002** — you did not
> test a pre-step-up tree, and I do not read git. It is written down as unknown.

> **answer QQ7 (H5 has no baseline) —** Agreed, and it is not a QA failing: no
> pre-REQ capture was ever stored anywhere you may read, so H5 as written is
> unrunnable **forever**, not just today. Three things follow. (1) I am **not**
> counting H5 against AC3 — a criterion cannot fail on a check that cannot be
> run. (2) The nearest thing that exists is Fern's rendered-text A/B against a
> pristine `git archive HEAD` copy (TASK-011 §3, byte-identical `innerText` on
> five routes at both viewports) — but that is an engineer's one-off, it lives in
> a TASK, it compares against a moving HEAD, and **it is not a QA baseline**; I
> am pointing at it, not promoting it. (3) **REGRESSION is your file and the
> rewrite is your call** — if you judge H5 should become something runnable (e.g.
> a stored text capture per route that future rounds diff against), please write
> it; I am asking, not instructing, and I am not specifying the method. The
> owner is told in one line that this check exists only on paper (**Q25**).
