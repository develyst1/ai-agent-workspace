# TEST-001: REQ-001 Home acceptance — independent QA round

- Source REQ: REQ-001 (`requirements/REQ-001-ui-visual-redesign.md`, §Acceptance
  Criteria + §QA round)
- Status: **TEST_PASSED** — the partial closed 2026-09-02 by the confirm-tick round;
  the R5 character-for-character case now passes. The owner's items (B, C, D, F, G, H)
  are still NOT decided here.
- Environment: local only — `cd front && npm run dev`, http://localhost:3000.
  Production (`portfolio.develyst.online`) was not opened, not even a GET.
- Tested: 2026-08-30 by Tanya; re-verified 2026-09-02; confirm-tick round 2026-09-02
- Build under test: repo `portfolio-nichaphon-web`, branch `develop`, HEAD `566d466`
  (working tree clean before and after this round — `git status --porcelain` empty).

## How this round was run (and the one thing that had to change)

Real Chromium, real render, driven with **Playwright**, at 1280x900 desktop and
360x740 mobile, plus 1280x600 and 1440x900 where a criterion needed them.
Every verdict below comes from what the browser did or from a screenshot that
was looked at. TASK-005's results were treated as context only; nothing here is
ticked from the team's earlier evidence or from reading the diff.

**Playwright is not a dependency of `front/`**, and adding it there is an
engineer's change, not QA's — so it was **not** added. It was installed outside
the repo and pointed at the running dev server via `NODE_PATH`, using the
machine's installed Chrome (`channel: 'chrome'`). The repo is untouched. The
script is `tests/harness/home-sweep.cjs`; it prints observations only — it never
produces a verdict. If the team wants a committed test harness inside `front/`,
that is a package.json change and therefore an engineer's TASK (Q3 below).

Screenshots: `../project-docs/qa-req001-2026-08-30/` (18 files, listed per case).
The Next.js dev-tools badge is hidden by an injected CSS rule in the browser for
evidence shots only — it is a `next dev` overlay, not the product, and it sat on
top of the hero at 360px. Nothing in the app was changed.

## Scope

**Covers:** Home (`/`) against REQ-001 §Acceptance Criteria and the objective
list in §QA round; the R8 regression sweep across all six routes; and the three
items Porter moved off the owner's list (A reduced motion, C short-window fold,
E skip-link by keyboard).

**Deliberately does not cover** (owner's, per §QA round — QA supplies evidence
where asked, never the decision): **AC1** the identity call · **AC2** Porter's
English for quote 2 · **B** whether the 1px top band is objectionable · **D** a
real `/contact` send (would fire the owner's mail client — not attempted) ·
**F** the required-field asterisk contrast · **G** the display `h1` on the five
out-of-scope routes. Also not covered: the design of the five other routes, and
`/blog/[slug]` (a known pre-existing gap, out of scope).

## Cases

| # | Case (from AC / §QA round) | Type | Viewport | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 1 | Dark-only render (R10) | happy | 1280, 360 | Load `/` clean | Dark ground, no light scheme | `<html data-mantine-color-scheme="dark">`; body bg `rgb(11, 9, 22)`, text `rgb(236, 234, 242)`. Same on all six routes. Shots `01`, `03` | PASS |
| 2 | **No light/dark toggle in the header** (R10) | happy | 1280, 360 | Enumerate every control in `<header>`; then scan the whole document for any colour-scheme control | Toggle gone | Header holds exactly one button: `aria-label="Open navigation"` (the mobile burger). Document-wide scan for `color-scheme / dark-mode / light-mode / theme-toggle` on buttons, switches, checkboxes, links returned **`[]`**. Shots `01`, `02` | PASS |
| 3 | At least one, and not all four, quotes on Home (R5) | happy | 1280 | Enumerate every `<blockquote>` | 1–3 of the 4 | **Two of four**: quote 4 in the hero, quote 2 (Thai + English pair) in the statement band. Quotes 1 and 3 absent. Shot `01` | PASS |
| 4 | Quotes match R5 **character-for-character** (R5) | happy | 1280 | Compare each rendered quote node's `textContent` to the R5 string by exact equality, then by length | Byte-exact | Exact node match, all three strings: `Don't say why me. Say try me.` (len 29) · `ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร` (len 45) · `I don't work "for" anyone. I work "with" them.` (len 46). Straight quote marks as written in R5; `lang="th"` / `lang="en"` set correctly | PASS |
| 5 | Nothing from the reference screenshot's own content (R9) | negative | 1280 | Search rendered text **and** HTML source for `FAEK`, `150+`, `Win Awards`, `12Years`, `12 Years`, `Li Europan`, `Get Started`, `CREATIVE`, `agency.` | No hit | **Zero hits** in both text and source | PASS |
| 6 | No new or altered client-facing wording except the quotes (R4) | negative | 1280 | Collect every visible text node on `/` (46 strings), then check each against the pre-REQ baseline commit `7a58154` (2026-08-27) | Every string pre-exists | Content constants are byte-identical to baseline (`git diff 7a58154 HEAD -- front/src/constant/` empty). Every Home string sampled — `Open to new opportunities`, `Dong`, the lead paragraph, all four stat labels, `What I do`, `Expertise across the full stack`, all four capability rows — is present at baseline. The only new copy is the R5 quotes | PASS |
| 7 | `npm run build` completes with no errors (R7) | happy | — | Dev server stopped, `cd front && npm run build` | Clean | `✓ Compiled successfully in 14.1s`, 10/10 static pages, postbuild copy ok, **exit 0**, no warnings in output | PASS |
| 8 | `/` serves with no console errors (R7) | happy | 1280, 360 | Hook `console`, `pageerror`, `requestfailed` on a clean load | None | **No errors, no warnings, no failed requests** on `/` at either viewport. One warning appears elsewhere — see Observation O1 | PASS |
| 9 | Six routes reachable from the **header**, no 404 (R8) | regression | 1280 | From `/`, click each of the six header links, wait for the URL to settle | Each lands | 6/6 land on their own path with the right `h1`, no 404 | PASS |
| 10 | Five routes reachable from the **footer** (R8) | regression | 1280 | Same from the footer | Each lands | 5/5 land correctly | PASS |
| 11 | Mobile drawer (R8) | regression | 360 | Tap the burger, read the drawer, tap About | Opens, 6 links, navigates, closes | Drawer opens with exactly Home/About/Services/Portfolio/Blog/Contact; tapping About lands on `/about` and the drawer closes. Shots `17`, `18` | PASS |
| 12 | The five old routes still render, nothing broken (R8) | regression | 1280 | Load each, screenshot full page, look at it | Old-looking is fine, broken is not | All 200, all have an `h1`, none is a 404, no console errors, no invisible or white-on-white text, no missing borders. Shots `12`–`16` | PASS |
| 13 | No horizontal overflow at 360 | edge | 360 | `scrollWidth` vs `clientWidth`, then list any element past the right edge | No overflow | `scrollWidth 360 = clientWidth 360`, zero overflowing elements | PASS |
| 14 | **A — reduced motion** (moved off the owner's list) | edge | 1280 | Launch with `prefers-reduced-motion: reduce`; read `document.getAnimations()` at first paint; then compare two settled frames 1.5s apart; then look at the shot | Nothing animates, and nothing is left invisible | Page confirms `matchMedia('(prefers-reduced-motion: reduce)').matches === true`. **`document.getAnimations()` is empty** at first paint; settled frames byte-identical over 1.5s. **Control run** with `no-preference` shows `HomeHero_rise` running for 520ms — so the check can and does detect motion. Shot `05` looked at: the hero is fully rendered and fully opaque, i.e. it is not stuck at the animation's start state. Shot `06` is the control | **PASS — and this item goes off the owner's list** |
| 15 | **E — skip-link by keyboard** (moved off the owner's list) | edge | 1280 | Clean load, press Tab, press Enter, press Tab again; control run without the Enter | Focus ends up in the main content | Tab #1 focuses `Skip to content` (`href="#main"`) with a visible ring (`outline: rgb(164,136,255) solid 2px`). Enter sets `#main` and scrolls (`scrollY 73`). `activeElement` is `<body>` — normal, `#main` has no `tabindex` — so the decisive check is the next Tab: it lands on **`View my work`, inside `<main>`**. The control (no Enter) lands on the header wordmark instead. The skip link therefore does skip | **PASS — and this item goes off the owner's list** |
| 16 | **C — hero at a short desktop window** (evidence only; the call is the owner's) | edge | 1280x600, 360x740 | Measure the hero elements against the fold, screenshot the fold | Evidence, no verdict | See §C below. Shots `07`, `08` | EVIDENCE SUPPLIED |
| 17 | Recurring components visibly different in shape/style (R1) | observation | 1280 | Read the computed geometry of the recurring components; look at the shots | Observation, not a verdict | See §R1 below. Shots `01`, `03` | OBSERVATION — not QA's verdict |

## C — the hero at a short desktop window (for the owner's decision)

Measured on the rendered anchors, clean load, scroll 0. **QA supplies the
picture; the accept/reject call stays the owner's** (REQ §QA round).

**1280x600** — shot `../project-docs/qa-req001-2026-08-30/07-home-fold-1280x600.png`
- Lead paragraph spans 521→643: it **is cut mid-sentence** at the fold. The last
  words visible are "…by an average of 40".
- `View my work` and `Get in touch` both sit at 683→727: **entirely below the fold**.
- The hero quote sits at 687→723: **below the fold**.
- Visible above the fold: header, "Open to new opportunities", the name, `Dong ·
  Senior / AI Software Engineer`, and three of the four lead lines.

**360x740** — shot `../project-docs/qa-req001-2026-08-30/08-home-fold-360x740.png`
- Both CTAs (620→664) and the hero quote (696→723) are **fully above the fold**,
  and the lead paragraph is not cut. Sober's correction to check c20(a) is
  confirmed by an independent run: the phone case was never the problem.

## R1 — what the recurring components actually render as (observation only)

Reported as fact + screenshot, per the brief. QA does not rule on taste.

- `h1`: Space Grotesk, **136px**, weight 700, letter-spacing **-5.44px**, no box.
- Stat / capability panels: radius **20px**, background `rgba(120, 96, 200, 0.1)`,
  **1px** border `rgba(196, 178, 255, 0.18)` — translucent violet "glass".
- Primary CTA: a **fully rounded pill** (`border-radius: 999px`), filled violet.
  Secondary CTA is a plain underlined text link with an arrow.
- Header: 73px tall, transparent, no card; section eyebrows are a small violet
  dot plus uppercase micro-label; index numerals (`01`–`04`, `3+`, `40%`) render
  in JetBrains Mono.
- Fonts confirmed **loaded** in the browser, not just declared: Space Grotesk,
  IBM Plex Sans Thai (400/500/600), JetBrains Mono.

**Limit, stated rather than papered over:** QA cannot produce a before/after.
Rendering the pre-REQ build needs a git checkout (the human's hands alone), and
production is off-limits to QA. So "visibly different **from what was there
before**" is asserted here only from the current render, not from a comparison.
See Q2.

## Observations (no verdict attached, nothing "fixed")

- **O1 — one console *warning*, not an error, and only on a route transition.**
  Navigating via the mobile drawer emits: `Detected 'scroll-behavior: smooth' on
  the <html> element. In a future version, Next.js will no longer automatically
  disable smooth scrolling during route transitions…`. It is a `next dev`
  deprecation notice, not an error; `/` itself logs nothing at all. The AC asks
  for no console **errors**, and there are none — this is surfaced so Porter
  knows it exists, not as a defect claim.
- **O2 — the footer reads `© 2025`** while the date of this round is 2026-08-30.
  The string is **unchanged from the pre-REQ baseline**, so it is not something
  this REQ did, and R4 forbids the team touching it. Whether the year is wrong is
  a fact only the owner has. See Q1.
- **O3 — measured blank band under the hero, desktop.** The hero section has
  `min-height: 100vh`, so at 1280x900 there is 119px of empty space inside the
  hero below its last element plus a 104px gap before the stats row — **223px**
  of blank between the hero quote and the first stat card (identical at 1440x900;
  120px at 360x740). This is what a full-viewport hero produces and TASK-004's
  FQ8 settled that min-height is a floor, so it is recorded as a measurement, not
  as a defect.
- **O4 — the five out-of-scope routes carry the new display `h1`,** confirmed by
  eye: `/about` runs to 7 lines, `/portfolio` to 6, `/services` and `/contact` to
  4 each. That is item **G**, already the owner's scope question — the shots
  `12`–`16` are there so he decides from the picture.

## Defects

**None.** No defect was found within QA's remit this round.

One candidate was raised and then withdrawn before it reached Porter, recorded
here so it is not "found" again next round: a first pass reported all eleven
header/footer nav click-throughs landing back on `/`. That was a **harness
timing fault** — the URL was read before the App Router client navigation
settled. Re-run with an explicit `waitForURL`, all 11 pass. Likewise, the
low-contrast scan flagged `+3 more`, `All`, and `01`–`04`: the heuristic treats a
`rgba(..., 0.1)` background as opaque, which it is not. Each was checked against
the screenshot and is legible. Neither is a product defect.

## Verdict

**`TEST_PASSED` — partial, and partial is the honest word.**

- Every criterion QA is allowed to decide **passed**: dark-only render, no
  light/dark toggle, quote count, quote strings character-for-character, no
  reference content, no new copy, a clean `npm run build`, no console errors on
  `/`, and the full R8 regression across six routes plus the mobile drawer.
- **Items A and E are now tested and pass** — they are removed from the owner's
  homework and do not come back to him.
- **Item C is evidence only.** The picture is supplied at both viewports; the
  accept/reject call remains his.
- **Nothing was tested that decides AC1, AC2, B, D, F or G.** Those stay with the
  owner exactly as Porter framed them, and this pass does not tick any of them.
  **A QA pass is not the owner's sign-off** — REQ-001 goes `DELIVERED` only when
  he answers AC1 and AC2.
- Nothing could not be run. There is no `NOT TESTED` item in this round.

## Questions

For Porter; he answers as `> answer: ...`.

- **Q1 — the footer year.** The footer renders `© 2025`; today is 2026-08-30. The
  string predates REQ-001 and R4 forbids the team changing it. Is the year meant
  to be the current one (i.e. is this a real defect the owner wants raised), or
  is 2025 deliberate? One line from the owner settles it. Not blocking this round.
  > answer (Porter, 2026-09-02): right to raise it, and right not to touch it. I
  > cannot settle it either — the correct year is a fact only the owner has, and
  > "it is 2026 so it must say 2026" is exactly the kind of inference this team
  > does not make. It is now item **H** in REQ-001 §Home acceptance review, marked
  > non-blocking, and goes to him with the rest of his list. If he says it is
  > wrong, it becomes a change for Sober to spec — never a QA or PM edit.
- **Q2 — do you want a before/after for R1?** QA can only show the page as it is
  now: rendering the pre-REQ build needs a git checkout, and production is
  off-limits to QA. If a side-by-side would help the owner answer AC1, that is a
  **DATA REQUEST** — the human captures the live site himself and drops the shot
  in `../project-docs/`. QA does not need it to close this round.
  > answer (Porter, 2026-09-02): **no — do not chase it.** Stating the limit
  > plainly in §R1 is the right outcome; a before/after is not needed to close
  > this round and I am not raising a DATA REQUEST for it. AC1 asks the owner
  > whether the page reads as *his own* — he has the old site in his head and can
  > open production himself if he wants the comparison. I will only ask him for a
  > capture if he answers AC1 with "I can't tell without seeing the old one".
- **Q3 — should the harness live in the repo?** `tests/harness/home-sweep.cjs`
  currently runs with Playwright installed **outside** `front/`, because adding
  it to `front/package.json` is an engineer's change and not QA's to make. If the
  team wants a committed, repeatable test setup in the repo, that needs a SPEC
  and a TASK. Reported, not decided.
  > answer (Porter, 2026-09-02): correct on both counts — it is not yours to add,
  > and it is not mine to decide either (it changes `front/package.json`, so it is
  > a SPEC/TASK, and it is work the owner has to want). **Parked, named, not
  > dropped:** I hold it until REQ-001's acceptance closes, then put it to the
  > owner as its own small scope question rather than lengthening his list now.
  > Until he says yes, keep running the harness outside `front/` and keep
  > declaring the footprint the way you did this round.

---

# Re-verify round — 2026-09-02 (REQ-001 §QA re-verify round)

- Status of this round: **TEST_PASSED (partial) — 3 of 4 cases closed; case 1
  is NOT ticked and is referred to Porter, exactly as the brief instructs.**
- Environment: local only. Production was not opened, not even a GET.
- Tested: 2026-09-02 by Tanya. Original round above is untouched.
- Scope: the four cases Porter issued and nothing else. A and E do not come
  back; the R8 six-route sweep was not re-run.

**Environment note, declared not assumed.** Port 3000 was already held by a
process QA did not start (it answers `/` with HTTP 404), so `next dev` chose
**3001** and the whole round ran against `http://localhost:3001` — QA's own
`npm run dev` on the working tree, started and stopped by QA. The foreign
process on 3000 was left alone and never used as evidence. Footprint: that dev
server (stopped) and `front/.next` rewritten by the R7 build. Playwright is
still installed **outside** the repo and `front/package.json` is untouched.
Harness: `tests/harness/reverify-2026-09-02.cjs` (observations only, no verdict).
Screenshots: `../project-docs/qa-req001-reverify-2026-09-02/` (4 files).

## Cases

| # | Case | Viewport | Expected | Actual | Result |
|---|---|---|---|---|---|
| R1 | R5 character-for-character — every quote rendered on Home vs R5 canonical | 1280 | Byte-exact | **Quote 2's Thai does not match.** Quote 4 (`Don't say why me. Say try me.`, 29 chars) and quote 2's English (`I don't work "for" anyone. I work "with" them.`, 46 chars) are exact. See §R5 difference below | **NOT TICKED — reported to Porter** (his instruction: not a tick, not a defect) |
| R2 | R5 count — at least one but not all four | 1280 | 1–3 of 4 | **Two of four**: quote 4 in the hero, quote 2 (Thai + English pair) in the statement band. Whole-body text search for all seven canonical strings: quotes 1 and 3 absent in both languages | PASS |
| R3 | Item C — hero fold, evidence only | 1280x600, 360x740 | Evidence, no verdict | See §C re-measured below. Shots `03`, `04` | EVIDENCE SUPPLIED — the call stays the owner's |
| R4 | R7 — clean build, no console errors on `/` | — / 1280, 360 | Clean | `npm run build` → `✓ Compiled successfully in 7.3s`, 10/10 static pages, postbuild copy ok, **exit 0**, no warnings. `/` logged **no errors and no warnings** at 1280x900 and at 360x740 | PASS |

## §R5 difference — quote 2's Thai (for Porter; nothing was edited)

The statement band renders a Thai string that is **not** R5's canonical Thai.
Both strings in full, as required:

- **Rendered on the page** (node `PullQuote_primary`, `lang="th"`), 42 characters:
  `ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร`
- **R5 canonical**, 45 characters:
  `ผมไม่ได้ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร`

First divergence is at character index 5. The rendered string is missing the
word **`ได้`** (U+0E44 U+0E14 U+0E49) — `ผมไม่ทำงาน` where R5 has `ผมไม่ได้ทำงาน`.
Everything after that point is identical, quote marks and spacing included.

Two facts Porter needs and QA will not decide:

1. **This is a word, not punctuation.** R4 was lifted for quotes 1–3 for
   punctuation and spacing only (Q10/Q12), and `ได้` is present in the owner's
   own verbatim string recorded at the top of R5. So the page and R5 disagree on
   a word. Which one is right is the owner's ruling, not QA's and not a fix.
2. **The English pair is R5-exact and was not re-checked against the new Thai.**
   R5 says a Thai string that changes must have its English pair re-checked;
   `I don't work "for" anyone. I work "with" them.` still matches R5 byte for
   byte. Whether it still pairs with the Thai now on the page is part of the
   same ruling — and AC2 (the owner's approval of that English) is still open.

Consequence, stated plainly: the acceptance criterion *"any quote shown matches
R5 character-for-character"* **cannot be ticked from this build**. It is not
recorded as PASS and, per Porter's instruction, not raised as a defect either.

## C re-measured — the hero fold (evidence only, the call is the owner's)

Clean load, scroll 0, measured on the rendered nodes and then **looked at** in
the screenshot. The 2026-08-30 picture is confirmed; nothing has moved.

**1280x600** — `../project-docs/qa-req001-reverify-2026-09-02/03-home-fold-1280x600.png`
- Lead paragraph spans 521→643 and **is cut mid-sentence**: 150 of its 282
  characters are on a fully visible line (last full line ends `…from zero to`),
  and the next line is clipped in half by the fold, reading `…cut client costs by
  an average of 40`.
- `View my work` and `Get in touch` both sit at 683→727 — **entirely below the fold**.
- The hero quote sits at 687→723 — **below the fold**.
- Above the fold: header, `Open to new opportunities`, the display name,
  `Dong · Senior / AI Software Engineer`, three lead lines and half of a fourth.

**360x740** — `../project-docs/qa-req001-reverify-2026-09-02/04-home-fold-360x740.png`
- Lead paragraph 335→580, **not cut** (282 of 282 characters visible). Both CTAs
  (620→664) and the hero quote (696→723) are **fully above the fold**. The phone
  case is still not the problem.

## Verdict for the re-run

**`TEST_PASSED` — partial, and the partial is case R1.**

- **R5 count, and R7 (build + console), pass on the current build.** The quote
  count is two of four, the build exits 0, and `/` logs nothing at either viewport.
- **Item C is evidence only**, re-measured and re-shot; the accept/reject call
  is the owner's and is untouched.
- **The R5 character-for-character criterion is not ticked.** The Thai on the
  page differs from R5 by one word. Porter ruled in advance that this is neither
  a tick nor a defect, so it is reported to him and nothing was edited — not R5,
  not the code.
- Nothing in this round could not be run; there is no `NOT TESTED` item.
- This does not revisit AC1, AC2, B, D, F, G or H — all still the owner's.

## Questions — re-verify round

For Porter; he answers as `> answer: ...`.

- **Q4 — which string is canonical for quote 2's Thai?** The page says
  `ผมไม่ทำงาน…`, R5 says `ผมไม่ได้ทำงาน…`. QA cannot rule and will not guess:
  either the page is to be corrected to R5, or R5 records what the owner now
  wants — and only he decides which. Until he does, the character-for-character
  criterion stays unticked and the H3 regression check has no baseline to
  assert against.
  > **answer (Porter, 2026-09-02): the page wins.** The owner ruled it himself,
  > verbatim: `เอาตามเว็บ เพราะนั่นฉันแก้เองกับมือ` — go with the web, because I
  > edited it by hand. So **R5 changes, the code does not.** REQ-001 §R5
  > canonical Thai #2 now reads `ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร`
  > (42 chars), recorded as superseding the 45-char string. Nothing in `front/`
  > is touched and there is no defect. Your 42-char measurement is what I copied
  > in — if the page ever disagrees with R5 again, that is a real finding.
  > **H3 now has its baseline:** R5 as it stands in REQ-001 today.
  > Next, one case only: REQ-001 §QA confirm tick — re-compare and, if it
  > matches, tick the character-for-character criterion. I do not tick it from
  > my own edit.
- **Q5 — does the English pair need re-confirming once Q4 is settled?** R5's own
  rule says a changed Thai string has its English pair re-checked. The English is
  still R5-exact, so QA raises the rule rather than a finding. It may fold into
  AC2 rather than becoming a separate question to him.
  > **answer (Porter, 2026-09-02): it folds into AC2 — no separate round.** The
  > owner answered AC2 the same day with `อนุมัติ`, and he approved that English
  > while the page was already rendering his own hand-edited Thai. So the pair he
  > signed off is the pair that ships. The English stays
  > `I don't work "for" anyone. I work "with" them.` and is now final; R5 records
  > that. Right to raise the rule — it is satisfied, not skipped.

---

# Confirm-tick round — 2026-09-02 (Tanya)

Brief: `requirements/REQ-001-ui-visual-redesign.md` §QA confirm tick (Porter,
2026-09-02). **One case only**, Home only, local only. Porter changed R5's
canonical Thai for quote 2 to what renders; he will not tick a
"matches character-for-character" criterion from his own edit, so QA re-compares.

## How this round was run

- `cd front && npm run dev` — **port 3000 was free this time** (the foreign
  process that held it earlier today is gone), so the round ran on
  `http://localhost:3000`. Production was never opened.
- Playwright driving the machine's Chrome, installed **outside** the repo via
  `NODE_PATH`; `front/package.json` untouched. Harness:
  `tests/harness/confirm-tick-2026-09-02.cjs`.
- Comparison is exact string equality on raw `textContent` (not `innerText`),
  against the seven R5 strings **pasted from REQ-001 §R5 as it stands today** —
  quote 2's Thai being the 42-char string the owner ruled canonical (Q4).
- Verdict below is from the screenshots I opened and read, not from the
  harness's own output lines.

## Case

| # | Case (from AC) | Type | Viewport | Steps | Expected | Actual | Result |
|---|----------------|------|----------|-------|----------|--------|--------|
| T1 | "Any quote shown matches R5 character-for-character" | happy | desktop 1280x900 | Clean load of `/`; collect every quote-bearing node's raw `textContent`; compare each to R5 as it now stands by exact equality; then look at the shots | Every rendered quote string is identical to its R5 string | All three rendered quote strings are R5-exact (see below); no near-miss, no residual diff | **PASS** |

## What renders, node by node

`/` returned HTTP 200. Three quote strings render on Home, in two places:

| Node | `lang` | Rendered string | Length | R5 key | Exact? |
|------|--------|-----------------|--------|--------|--------|
| `PullQuote_quote PullQuote_lead` (BLOCKQUOTE, hero) / `PullQuote_primary` (P) | `en` | `Don't say why me. Say try me.` | 29 | quote 4 | **yes** |
| `PullQuote_primary` (P, statement band) | `th` | `ผมไม่ทำงาน "ให้" ใคร ผมทำงาน "ร่วม" กับใคร` | 42 | quote 2 Thai | **yes** |
| `PullQuote_translation` (P, statement band) | `en` | `I don't work "for" anyone. I work "with" them.` | 46 | quote 2 English | **yes** |

The three 88-character non-matches the harness also printed
(`HomeStatement_band`, `HomeStatement_inner`, `PullQuote_quote PullQuote_band`)
are **ancestor containers**, not quote strings: each is the Thai and the English
child concatenated with no separator, and the first difference is at index 42 —
exactly where the Thai leaf ends and the English leaf begins. Not a finding.

Also observed on the same load, as context for the tick (not re-opened cases):
- Quote count still **two of four** — quote 4 and quote 2 present, quotes 1 and 3
  absent. "At least one, not all four" holds.
- Console at 1280x900: **no errors, no warnings**.

## Evidence

- `../project-docs/qa-req001-confirm-tick-2026-09-02/01-home-full-1280.png` —
  full page. Read by eye: exactly two quote places, nothing else quote-shaped.
- `../project-docs/qa-req001-confirm-tick-2026-09-02/02-hero-quote.png` — hero
  quote, `Don't say why me. Say try me.`
- `../project-docs/qa-req001-confirm-tick-2026-09-02/03-band-quote.png` —
  statement band, Thai over its English pair, both legible.

## Verdict for the confirm-tick round

**`TEST_PASSED`.** Every quote rendered on `/` matches R5 as it now stands,
character for character, straight quote marks included, with `lang` set per
language. The one criterion Porter held open is now satisfied by observation.

- **REQ-001's character-for-character criterion is ticked** — by QA, per Porter's
  written §QA confirm tick delegation, with a pointer to this section.
- **REGRESSION H3 now has its baseline** and is asserted PASS: R5 as it stands in
  REQ-001 on 2026-09-02.
- Nothing else was re-run, nothing was edited in `front/`, and no defect was
  raised. Items B, C, D, F, G, H and the §New asks remain the owner's.

## Questions — confirm-tick round

None. The round had no ambiguity to refer.

**One boundary note for Porter, not a question:** QA.md forbids QA from editing a
REQ, and the tick above is an edit to REQ-001. I made it only because §QA confirm
tick instructs it in writing, in that file, and I limited it to that single
checkbox plus its evidence pointer. If you would rather QA never touch REQ text
even under delegation, say so and I will report the result instead of ticking
next time.

> **answer (Porter, 2026-09-02) — the boundary note.** You were right to flag it
> and right to act as you did. Ruling, so it is settled for next time:
> **QA does not edit REQ text.** The confirm-tick delegation was a one-off I
> should have written differently, and it is now spent — it does not carry to any
> future round. From here: report the result to me and I tick the box, even when
> the tick is obvious and even when I am the one who edited the thing being
> checked. If that creates the same conflict again (I cannot tick my own edit),
> that is mine to solve — e.g. by putting the string to the owner — not yours.
> Nothing about this round is being undone: the tick stands, the evidence is
> sound, and REQ-001 is DELIVERED on the strength of it.
