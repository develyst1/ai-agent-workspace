# TASK-018: Pin the project modal's footer to the modal's foot

- Source: SPEC-004 (REQ-004)
- Status: **DONE** — 2026-09-05, Sober (reviewed; see §Review)
- Assignee: **Fern (FE)**
- Depends on: none

## What to do

**One file. One rule. Six added properties.** Read SPEC-004 §Interface Design and
§The layout-neutrality trick before you touch anything — the `margin-bottom` line
is the only non-obvious part of this change and it is the thing I will review
hardest.

**Capture the baseline BEFORE you edit** (step 1 below). You cannot prove
"desktop did not move" after the fact.

### The edit

File: `front/src/components/partials/Portfolio/Modal/ProjectModal.module.css`
Rule: the existing `.footer`. **Add** these six properties. **Remove nothing**;
`display`, `align-items`, `gap`, `margin-top`, `padding-top` and `border-top`
stay exactly as they are.

```css
.footer {
  /* ... existing declarations, untouched ... */

  /* SPEC-004: the modal's own scrollport is Mantine's Modal.Content
     (overflow-y:auto, max-height 90dvh). Pinning the footer there puts
     "Open live project" on screen with no scrolling on a phone, without
     moving one word or one DOM node. The header above already pins the
     same way. `--site-surface` is the modal's ground, same token and same
     reason as the header override in theme.ts. The negative margin cancels
     the new padding in flow, so a modal that does NOT overflow is byte-for-
     byte unchanged — see SPEC-004 §The layout-neutrality trick. */
  position: sticky;
  bottom: 0;
  z-index: 1;
  background-color: var(--site-surface);
  padding-bottom: var(--mantine-spacing-lg);
  margin-bottom: calc(var(--mantine-spacing-lg) * -1);
}
```

Keep the comment (shortened if you like) — the negative margin will look like a
mistake to the next reader without it.

### Hard fences

- **`ProjectModal.tsx` must not change.** No prop, no `classNames`, no wrapper,
  no conditional. If you find yourself needing one, the design is wrong: **stop
  and write a Question below** — see SPEC-004 §Fallback. Do not build the
  fallback.
- **`projects.ts` must not change.** Those are the owner's character-exact
  approved strings (TASK-017, 24/24). Requirement 3 / AC-f.
- **`theme.ts` must not change.** No new token, no new colour.
- **Never open the owner's live URLs** (`learning.develyst.online`,
  `ong.develyst.online`). Read `href` / `target` / `rel` **off the DOM**; never
  click the button. Standing rule from TEST-006.
- **No git writes** (`add` / `commit` / `push` / branch) and **no deploy** — the
  human's alone. Read-only `git status` / `git diff` for evidence is fine.
- Local only: `cd front && npm run dev` or a `npm run build` + local serve.

## How to verify — the numbers I will check

Drive a real browser (headed Chrome via Playwright is what the team uses).
**Report actual numbers, not "looks fine".** Viewports: **360x740** and
**1280x900**, exactly as TEST-006 used.

1. **Baseline, BEFORE the edit.** At **1280x900**, open the *Learning Curve*
   modal and record `document.querySelector('.mantine-Modal-content').scrollHeight`
   and `clientHeight`. Record the same two numbers for *Ong Match*. Write them
   into §Implementation Notes. (These are the desktop-neutrality baseline.)
2. Make the edit.
3. **AC-a / AC-b / AC-c — 360x740, the seven entries that have a button.**
   For each of **Learning Curve, Ong Match, DTE Platform, Develyst Company
   Website, Laichill, YodBarber Queue Booking, AI Voice Avatar**: open the modal
   and, **with no scrolling of any kind**, record the button's
   `getBoundingClientRect()` and the modal content's rect. Assert for each:
   - button `top >= 0` and button `bottom <= 740` (inside the viewport), **and**
   - button `bottom <=` the modal content's `bottom` (inside the modal, ~703).
   Expected roughly `top ≈ 639`, `bottom ≈ 683` — but **report what you measure**;
   the arithmetic is mine and the measurement is the authority.
   If any entry fails, **stop and raise a Question** (SPEC-004 §Fallback).
4. **The four link-less entries — RAG Chatbot for CRM Sales, Enterprise Backend
   Optimisation, Develyst AI Gateway, R1-BEV Voice Command Robot.** Confirm at
   360 that each still renders the `NO_PUBLIC_DEMO` note and that the modal still
   opens and closes. No button exists on these; that is SPEC-004 §Coverage's
   named exception, not a failure.
5. **Requirement 4 / AC-d — 1280x900 desktop neutrality.** Re-record step 1's two
   numbers. **`scrollHeight` must equal the baseline exactly** for both entries.
   Also record whether the footer is **inert** (`scrollHeight <= clientHeight`,
   no overflow, sticky never engages) or **pinned**, and record the button's rect
   — it must still be inside the 900px viewport on open.
6. **The un-pin check, 360.** On *Learning Curve*, scroll the modal fully to the
   bottom and confirm the **last chip / last bullet is not covered** by the
   footer (`document.elementFromPoint` at its centre returns that element, not
   the footer). SPEC-004 §Non-functional.
7. **AC-e — the link is untouched.** For each of the seven, read `href`,
   `target`, `rel` off the DOM. The two new ones must be exactly
   `https://learning.develyst.online/` and `https://ong.develyst.online/`, both
   `_blank` + `noopener noreferrer` (TEST-006's recorded values). **Never
   clicked.**
8. **AC-g — behaviour.** For at least the two new entries at both viewports:
   modal opens, paints, `Escape` closes it, the page scroll lock is released
   (`document.body` scrollable again), and the round produces **0 console
   errors, 0 pageerrors, 0 failed requests**. Report the counts.
9. **Scope + build.** `git status --porcelain` must list **exactly one** path:
   `front/src/components/partials/Portfolio/Modal/ProjectModal.module.css`.
   Then `cd front && npx tsc --noEmit` (exit 0) and `cd front && npm run build`
   (exit 0, zero error and zero warning lines).
10. **Declare your surface** — dev server or built output, which port, what state
    `front/.next` was in before and after. The team's rounds live or die on this.

## Definition of Done

- [x] `.footer` in `ProjectModal.module.css` gains exactly the six properties in
      §The edit, loses nothing, and keeps the explaining comment.
- [x] `git status --porcelain` lists **exactly one** changed path (step 9).
      `ProjectModal.tsx`, `projects.ts` and `theme.ts` are **untouched**.
- [x] **Step 3 passes for all seven linked entries at 360x740**, with the real
      rects written down: button fully inside the viewport **and** inside the
      modal, **with no scrolling**.
- [x] Step 4: the four link-less modals still open, close, and show
      `NO_PUBLIC_DEMO`.
- [x] **Step 5: `scrollHeight` at 1280x900 is identical to the baseline** for
      both new entries, and the inert-or-pinned state is stated.
- [x] Step 6: the last chip/bullet is reachable and uncovered at the bottom of
      the scroll at 360.
- [x] Step 7: `href` / `target` / `rel` reported for all seven, the two new ones
      identical to TEST-006's values, **never clicked**.
- [x] Step 8: `Escape` closes, scroll lock releases, **0 console errors /
      pageerrors / failed requests**, counts reported.
- [x] `cd front && npx tsc --noEmit` exits 0.
- [x] `cd front && npm run build` exits 0 with zero error and zero warning lines.
- [x] Surface declared (step 10); local server stopped; **no git write, no
      deploy, no live URL opened**.
- [x] Status set to `REVIEW` and a line appended to `ai-worker/inbox/SA.md`.

**Not in your DoD, on purpose:** "the new placement looks good", and AC-a…AC-g
themselves. Your measurements are the *implementation* gate; the ACs tick on a
QA round with pictures that Porter requests from Tanya — the implementer's own
load never ticks a "seen as a picture" AC. Same rule that kept AC-d open on
TASK-017.

## Implementation Notes

**Fern, 2026-09-05. Status set to `REVIEW`.** The design worked first try — no
fallback, no TSX change, no Question raised against §Fallback.

### Step 10 — the surface I ran on (declared first; everything below rides on it)

- **`npm run dev` on port 3055.** Port 3000 was **not listening at all** when I
  started (`netstat` clean across 30xx) — I still avoided it and never touched
  any foreign process. My server is **stopped** (PID 21780 killed, `netstat`
  re-checked); 3000 still not listening, unchanged.
- **`front/.next` was ABSENT before I started** (QA deleted it after TEST-003).
  After my round it holds a **production build** (step 9's `npm run build`,
  including the repo's `copy-standalone-assets.mjs` postbuild). `.next` is
  git-ignored, so it is not in the diff.
- **Browser: the Claude Browser pane (Chromium), not Playwright.** Playwright is
  not in this repo and installing it is outside my fences, so I did not install
  it. Viewports were set by emulation and **verified in-page** every time
  (`innerWidth`/`innerHeight`, `devicePixelRatio` 1, `document.hidden` false,
  and `100dvh` measured = the emulated height).
- **Measurements are on the DEV surface; the build is a separate gate (step 9).**
  I did not re-measure the rects on the built output — flagged, not hidden.
- **Two harness facts that shaped the method, so you can judge them:**
  1. The modal only mounts once the page gets a **paint tick** — Mantine's
     transition needs `requestAnimationFrame`, which this pane runs on demand.
     So every open is followed by a screenshot, then a **~500 ms settle**, then
     the measurement. Measuring before the settle catches the modal *mid-pop* and
     gives a wrong `top` (I saw 8.15 instead of 37 once, and recorded it).
  2. I opened each modal by invoking the card button's own React `onClick`. A
     real trusted click on the card does the same thing (verified,
     `isTrusted=true`). **I never clicked the live-link button.**

### Step 1 — BASELINE, captured BEFORE the edit

Measured on `.mantine-Modal-content` at **1280x900**, `scrollTop` 0, no scrolling:

| Entry | `scrollHeight` | `clientHeight` | content top/bottom | button top/bottom |
|---|---|---|---|---|
| Learning Curve | **705** | **705** | 96.31 / 803.69 | 734.69 / 778.69 |
| Ong Match | **756** | **756** | 70.81 / 829.19 | 760.19 / 804.19 |

`scrollHeight == clientHeight` on both — the pre-edit desktop state is **no
overflow**, exactly what SPEC-004 §Overview reason 3 predicted. The button tops
734.69 / 760.19 agree with TEST-006's recorded `(285,735)` / `(285,760)`.

### Step 2 — the edit

`front/src/components/partials/Portfolio/Modal/ProjectModal.module.css`, the
`.footer` rule. **`git diff --stat` = 1 file, 15 insertions, 0 deletions** — so
nothing was removed, provably. The six properties are exactly §The edit's, and
the explaining comment is kept.

Resolved values read off the live element (`getComputedStyle`):
`position: sticky` · `bottom: 0px` · `z-index: 1` ·
`background-color: rgb(21, 17, 34)` (= `--site-surface`) ·
`padding-bottom: 24px` · `margin-bottom: -24px`.
**`--mantine-spacing-lg` resolves to 24px, not the 20px the SPEC's prose
assumed** — the token was used, not a literal, so the two still cancel exactly.
See FQ47.

### Step 3 — AC-a / AC-b / AC-c at 360x740, the seven entries with a button

Every row: modal opened fresh, `scrollTop` **0**, **no scrolling of any kind**.
Viewport 360x740 verified in-page; `100dvh` measured **740**.

| # | Entry | modal box top/bottom | `scrollHeight`/`clientHeight` | button top/bottom | in viewport | in modal |
|---|---|---|---|---|---|---|
| 01 | Learning Curve | 37 / 703 | 1204 / 664 | **634 / 678** | yes | yes |
| 02 | Ong Match | 37 / 703 | 1244 / 664 | **634 / 678** | yes | yes |
| 03 | DTE Platform | 37 / 703 | 834 / 664 | **634 / 678** | yes | yes |
| 04 | Develyst Company Website | 38.31 / 701.69 | 661 / 661 | **632.69 / 676.69** | yes | yes |
| 05 | Laichill | 69.06 / 670.94 | 600 / 600 | **601.94 / 645.94** | yes | yes |
| 08 | YodBarber Queue Booking | 37 / 703 | 778 / 664 | **634 / 678** | yes | yes |
| 09 | AI Voice Avatar | 37 / 703 | 803 / 664 | **634 / 678** | yes | yes |

**7 of 7 pass.** Each assertion was evaluated in-page per row, not eyeballed:
`top >= 0`, `bottom <= 740`, and `button.bottom <= content.bottom`.

Three things worth your eye rather than my silence:

- **Your arithmetic said `top ~639 / bottom ~683`; I measure 634 / 678.** The 5px
  is `lg` resolving to 24px, not 20px. The direction is *more* ground under the
  button, not less, so the bar is met with room. FQ47.
- **Rows 04 and 05 do not overflow** (`scrollHeight == clientHeight`), so sticky
  is **inert** on them at 360 too — their buttons were already on screen before
  my change. They meet AC-a's bar on their own layout. Only **5 of the 7**
  actually needed the fix. FQ48.
- The modal box **37 / 703** reproduces TEST-006's `324x666 at (18,37)` and
  SPEC-004's "fold ~y=703" to the pixel.

### Step 4 — the four entries with no `link`

At 360x740, each opens, paints, renders the note, and closes on `Escape`.

| # | Entry | box top/bottom | `scrollHeight`/`clientHeight` | footer holds |
|---|---|---|---|---|
| 06 | RAG Chatbot for CRM Sales | 37 / 703 | 696 / 664 | `Internal project — no public demo available.` |
| 07 | Enterprise Backend Optimisation | 37 / 703 | 696 / 664 | same string |
| 10 | Develyst AI Gateway | 37 / 703 | 781 / 664 | same string |
| 11 | R1-BEV Voice Command Robot | 37 / 703 | 923 / 664 | same string |

All four overflow, so **the note is pinned too** — SPEC-004 §Edge cases + SQ19,
accepted deliberately, one rule and no branch. No button exists on these.

### Step 5 — Requirement 4 / AC-d, desktop neutrality at 1280x900

| Entry | baseline `sH`/`cH` | after `sH`/`cH` | verdict | button after (baseline) |
|---|---|---|---|---|
| Learning Curve | 705 / 705 | **705 / 705** | **identical** | 734.69 / 778.69 (same) |
| Ong Match | 756 / 756 | **756 / 756** | **identical** | 760.19 / 804.19 (same) |

The content rects are identical too (96.31/803.69 and 70.81/829.19). **The
layout-neutrality trick holds by measurement**, and on more than `scrollHeight`:
the button did not move by a pixel on desktop.

**State at 1280x900 is INERT, not pinned** — `scrollHeight == clientHeight`, no
overflow, sticky never engages. Both buttons are inside the 900px viewport on
open (bottoms 778.69 and 804.19).

One wobble, recorded rather than smoothed: one Learning Curve reading came back
with the box at 71.21 / 778.58 while the pane was momentarily reporting a 563-px
frame and `100dvh` had not resettled. Re-measured with `100dvh` verified = 900,
it returns to 96.31 / 803.69, identical to the baseline. Both readings are here;
the one I stand behind is the one taken with `dvh` verified.

### Step 6 — the un-pin check at 360 (Learning Curve, scrolled fully to bottom)

`scrollTop` driven to **540 of 540** (the true maximum). Then:

- footer rect **612.9 / 701.9** — it has **un-pinned into flow**, its bottom
  landing at the modal's own bottom edge (703).
- last chip `JWT` rect **554.9 / 580.9** — entirely **above** the footer.
  `document.elementFromPoint` at its centre returns `SPAN.TechChip_chip__cpg_b`
  — the chip itself, **not** the footer.
- last bullet (`AI chat with suggested questions and per...`) rect 314.4 / 365.4;
  `elementFromPoint` returns `LI.ProjectModal_highlight__YNIRY` — itself.
- 11 chips counted, none covered. **SPEC-004 §Non-functional holds.**

### Step 7 — AC-e, the link is untouched (read off the DOM, never clicked)

`target` = `_blank` and `rel` = `noopener noreferrer` on **all seven**.

| Entry | `projects.ts` source string (unchanged) | `a.href` read off the DOM |
|---|---|---|
| Learning Curve | `https://learning.develyst.online/` | `https://learning.develyst.online/` |
| Ong Match | `https://ong.develyst.online/` | `https://ong.develyst.online/` |
| DTE Platform | `https://dte.develyst.online` | `https://dte.develyst.online/` |
| Develyst Company Website | `https://develyst.online` | `https://develyst.online/` |
| Laichill | `https://laichill.develyst.online` | `https://laichill.develyst.online/` |
| YodBarber Queue Booking | `https://yodbarber.develyst.online` | `https://yodbarber.develyst.online/` |
| AI Voice Avatar | `https://avatar.develyst.online` | `https://avatar.develyst.online/` |

**The two new ones match TEST-006's recorded values exactly.** The trailing `/`
on the other five is the **`a.href` IDL property normalising a bare origin** — it
is what the browser reports, not a changed string; the literal source is the left
column and `projects.ts` is provably untouched (step 9). Flagged so nobody later
reads it as a content edit. The button label is `Open live project` on all seven.

**Never clicked, and it is provable:** the whole round's network log contains
**only `localhost:3055`** — zero requests to `learning.develyst.online`,
`ong.develyst.online`, or any other live host.

### Step 8 — AC-g, behaviour (clean round in a fresh tab, fresh console buffer)

Both new entries x both viewports (1280x900 and 360x740): the modal **opens**,
**paints**, **`Escape` closes it** (real key press; `.mantine-Modal-root` back to
0 children), and the **page scroll lock releases** — `body` `overflow` goes
`hidden` -> `visible` and the page scrolls again (verified by moving `scrollY`
0 -> 350; the site sets `scroll-behavior: smooth`, so a short poll reads a false
negative — I re-checked with `behavior:'instant'`).

Counts for that round: **0 console errors · 0 pageerrors · 0 failed requests.**
Console held exactly **3 info lines**, all the React DevTools notice, one per
page load. Network: **46 requests, all 200 OK**.

Full disclosure: earlier in my session, on a different tab, I saw two
`_event_target.getAttribute is not a function` errors out of Mantine's
`use-modal.mjs`. **Those were my harness's fault** — I had dispatched a synthetic
`KeyboardEvent` at `document`, whose target has no `getAttribute`. Not a product
defect and not reachable by a user; I switched to real key presses and re-ran the
round clean in a fresh tab. Recorded because a suppressed error is worse than an
explained one.

### Step 9 — scope and build

```
$ git status --porcelain
 M front/src/components/partials/Portfolio/Modal/ProjectModal.module.css
$ git diff --stat
 .../partials/Portfolio/Modal/ProjectModal.module.css | 15 +++++++++++++++
 1 file changed, 15 insertions(+)
```

**Exactly one path.** `ProjectModal.tsx`, `projects.ts` and `theme.ts` are
untouched — they do not appear, and 15 insertions / 0 deletions proves nothing
was removed from the CSS either.

```
$ npx tsc --noEmit   -> TSC_EXIT=0
$ npm run build      -> BUILD_EXIT=0
  Compiled successfully in 14.5s
  Generating static pages (10/10)
  [postbuild] copied .next/static + public/ into .next/standalone
  grep -ci 'error' build.log = 0
  grep -ci 'warn'  build.log = 0
```

`/portfolio` builds at 7.76 kB / 285 kB First Load JS. No git write, no deploy,
no live URL opened, no `pm2`, no ssh.

### What I did NOT verify (plainly)

- **How it looks.** The button is where the numbers say it is, but "the new
  placement looks good" is not mine to tick — and **SQ19's cost (a pinned bar
  over ~85px of the phone's reading area) is now real and visible.** AC-a...AC-g
  need Tanya's picture round.
- **The built output's rects.** All measurements are on the dev surface; the
  build is a pass/fail gate only (step 9).
- The nine pre-existing entries' *content* — not in scope, not read.

## Questions

- **FQ47 (non-blocking, FYI — I did not act on it).** SPEC-004 §Flow predicts the
  button at `y ~639 -> 683` on the arithmetic of a **20px** `lg`.
  `--mantine-spacing-lg` actually resolves to **24px** here, so the real number is
  **634 -> 678**. **The design is unaffected** — the padding and the negative
  margin are the same token, so they cancel whatever it resolves to, which is
  exactly why you specified a token rather than a literal. Raised only so the
  SPEC's arithmetic is never later quoted as a measurement.
- **FQ48 (non-blocking).** Two of the seven — **Develyst Company Website** and
  **Laichill** — do **not** overflow at 360x740, so sticky is inert on them and
  their buttons were already on screen before my change. They meet AC-a's bar,
  but on their own layout. If AC-c is meant to record which entries the fix
  actually *moved*, the honest answer is **5 of 7**, not 7 of 7. Whether that
  distinction reaches Porter is your call; I am not making it.

> **answer FQ47 (Sober, 2026-09-05) — you are right, and the fix is stronger than
> you put it.** Confirmed at the source: `front/src/theme/theme.ts:74` sets
> `spacing: { xs '8px', sm '12px', md '16px', lg '24px', xl '40px' }`, so SPEC-004
> §Flow's `y ≈ 639 → 683` was arithmetic on **Mantine's stock 20px `lg`**, which
> this project overrides. Your **634 → 678** is the number. I have corrected
> §Flow step 4 in SPEC-004 so the prediction can never be quoted back as a
> measurement. Why the design is untouched by it: `ProjectModal.tsx` passes
> `padding="lg"`, Mantine's body `.m_5df29311` is `padding: var(--mb-padding)`
> (`ModalBase.css:50`), so the body's existing bottom ground, your new
> `padding-bottom` and the cancelling `margin-bottom` are **all the same token** —
> they cannot drift apart whatever it resolves to. That is exactly why the SPEC
> named the token and not `20px`. **Nothing for you to do.**

> **answer FQ48 (Sober, 2026-09-05) — it reaches Porter, and you were right to
> put the call to me instead of making it.** Two separate facts, both true:
> AC-c's bar is *"the button is inside the viewport with no scrolling"* and
> **7 of 7 meet it**, so AC-c is not narrowed and QA still shoots all seven.
> But **"the fix moved 5 of 7"** is the honest description of what changed, and
> the owner is going to be shown this work. Letting him believe seven modals
> changed when **Develyst Company Website** and **Laichill** never overflowed at
> 360 is the kind of small inaccuracy this team does not ship. Recorded as
> **SQ21** in `specs/SPEC-004-...md` §Questions, both entries named, and sent to
> Porter. **Nothing for you to do.**

## Review

**Verdict: `DONE` — 2026-09-05, Sober.** The design worked as specified and the
evidence is the strongest kind this task could produce: the neutrality claim is
proven by measurement *and*, as of this review, by construction.

### What I re-verified myself, in the tree, this session

- **Scope.** `git status --porcelain` = **exactly one line**,
  `M front/src/components/partials/Portfolio/Modal/ProjectModal.module.css`; no
  untracked paths. `git diff --stat` = **1 file, 15 insertions, 0 deletions** on
  branch `D1`. `ProjectModal.tsx`, `projects.ts` and `theme.ts` do not appear —
  Requirement 2 / 3, AC-e / AC-f held by the diff itself.
- **The diff, line by line.** The six added properties are character-for-character
  SPEC-004 §Interface Design's; `display`, `align-items`, `gap`, `margin-top`,
  `padding-top` and `border-top` all still stand above them; the explaining
  comment is kept. Nothing removed, provably (0 deletions).
- **`z-index: 1` is right and still loses to the title bar** — Mantine's header is
  `z-index: 1000` (`ModalBase.css:18`). And it was **needed**:
  `.highlight::before` is `position: absolute` (same file, lines 34-42), so
  without a positioned footer the bullets would read through it.
- **The colour is the modal's own ground** — `--site-surface` is `#151122`
  (`theme.ts:266`), which is Fern's computed `rgb(21, 17, 34)`. No new token.
- **The layout-neutrality trick holds by construction, not only by measurement.**
  `ProjectModal.tsx` passes `padding="lg"`; Mantine's body is
  `padding: var(--mb-padding)`; `spacing.lg` is `24px` (`theme.ts:74`). The
  body's bottom ground, the new `padding-bottom` and the cancelling
  `margin-bottom` are **one token in three places**. See FQ47.
- **Blast radius is one route.** `ProjectModal.module.css` is imported by exactly
  one file (`ProjectModal.tsx`), rendered by exactly one file
  (`PortfolioContent.tsx`), reachable on `/portfolio` alone. Nothing else on the
  site can be moved by this rule.
- **`npx tsc --noEmit` → exit 0**, re-run by me.
- **`npm run build` → exit 0**, `grep -ci error` = **0**, `grep -ci warn` = **0**,
  10/10 static pages, `/portfolio` **7.76 kB / 285 kB** — Fern's numbers to the
  digit.
- **The rule survives the build** — a check Fern did not run.
  `.next/static/css/071078ee87298f66.css` carries
  `.ProjectModal_footer__PH_SN{...;position:sticky;bottom:0;z-index:1;background-color:var(--site-surface);padding-bottom:var(--mantine-spacing-lg);margin-bottom:calc(var(--mantine-spacing-lg) * -1)}`
  — **all six properties, nothing dropped by the minifier, tokens not inlined.**
  This closes most of Fern's declared "measured on dev, not on the build" gap:
  the built surface carries the identical rule and **no JS is involved**, so the
  geometry follows the CSS. It does not close the *pictures* — those are QA's.

### What I did NOT re-verify, and why I accept it

- **Every browser rect (steps 1, 3-8).** I ran no browser this session. I accept
  them because Fern declared the surface honestly (dev on 3055, viewport verified
  in-page, `100dvh` measured, `.next` state before and after) **and because the
  numbers reproduce TEST-006's independently recorded values to the pixel**:
  modal box `37 / 703` against QA's `324x666 at (18,37)`, desktop button tops
  `734.69 / 760.19` against QA's `(285,735) / (285,760)`. Two rounds, two
  harnesses, same geometry.
- **Harness deviation, declared not hidden:** the task named Playwright; Fern used
  the Claude Browser pane because Playwright is not in this repo and installing it
  was outside the fences. **Not a rework reason** — the DoD asked for a real
  browser and real numbers and got both. It does matter downstream: **Tanya's
  Playwright round is the authority for the AC pictures**, not this one.
- **The look.** Unchanged from the SPEC and from TASK-017: the implementer's own
  load never ticks a "seen as a picture" AC.

### The gates, against SPEC-004

| Gate | Result |
|---|---|
| Requirement 1 / step 3 — 360x740, no scrolling | **7 of 7** buttons inside the viewport **and** inside the modal (634/678 on five, 632.69/676.69 and 601.94/645.94 on the two that never overflowed) |
| Requirement 4 / step 5 — desktop neutrality | **`scrollHeight` identical** (705/705, 756/756); content rects identical; button unmoved to the pixel; state **INERT**, which is §Overview reason 3 coming true |
| §Non-functional — the un-pin check | Footer `612.9 / 701.9` at max scroll, last chip `554.9 / 580.9` above it, `elementFromPoint` returns the chip. Holds |
| §Fallback | **Never entered** — no TSX change, no second approach improvised. Correct behaviour |
| §Edge cases — the four link-less entries | All four open, close, show `NO_PUBLIC_DEMO`, and the note is pinned. The deliberate SQ19 consequence, as designed |
| AC-e evidence | `href`/`target`/`rel` read off the DOM, **never clicked**; network log localhost-only. The five trailing slashes are the `a.href` IDL normalising a bare origin — Fern flagged it correctly, the source strings are untouched |

**SQ19's cost is now measured, not predicted.** The pinned footer's box is ~89px
(612.9 → 701.9); my "~85px of phone reading area" estimate was right, and it goes
to Porter for the owner's sign-off exactly as written.

### What this does NOT do

It does not tick AC-a…AC-g. Those want pictures, and **a QA round is still
needed** — that request is Porter's to make, not mine.
