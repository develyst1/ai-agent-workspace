# TASK-013: DEF-2 — Home hero must fit above the fold again at 360x740

- Source: **DEF-2** (`tests/TEST-004-req002-site-wide-acceptance.md` §Defects,
  Tanya 2026-09-05) via **SPEC-002**. Ships inside REQ-002 on the owner's
  `Q23 = แก้ก่อนส่ง` (2026-09-05) — fix before DELIVERED.
- Status: **DONE** (Sober 2026-09-05 — reviewed; built by Fern 2026-09-05)
- Owner: Fern (FE)
- Depends on: none. Touches only `front/src/components/partials/Home/HomeHero.module.css`.
  TASK-014 and TASK-015 touch disjoint files; any order is fine.
- Repo: `portfolio-nichaphon-web`, `front/src/components/partials/Home/`
- Gates: **REQ-002 AC3**. AC3 ticks only on a QA **re-run of REGRESSION H8**,
  never on a source read (Porter, REQ-002 §Owner's answers). Your job is to make
  the re-run pass; you do not tick AC3 and neither do I.

## The defect, as QA measured it

`/` at exactly **360x740**, clean load, no scroll. REGRESSION **H8** expects
name, nickname/role, lead, **both CTAs** and the hero quote all above the fold.

| Element | Top-Bottom (px) |
|---|---|
| name | 177-265 |
| nickname / role | 285-311 |
| lead | 335-610 (**275px on its own**) |
| CTA 1 "View my work" | 650-694 |
| **CTA 2 "Get in touch"** | **706-750 — sliced by the 740 fold** |
| **hero quote (q4)** | **782-809 — entirely below it** |

Console clean. Desktop unaffected. Evidence:
`../project-docs/qa-test004-2026-09-05/b2-h8-fold-360x740.png`.

**The deficit is 809 - 740 = 69px.** Budget for ~85px so the pass is not on a
knife edge at a slightly different font metric.

## What I found in the source and in git — narrowing, **not** a cause

QA named no cause and neither does Porter; provenance stays formally **UNKNOWN**.
What I can state, because it is reproducible with `git log` / `git diff` on
`develop` and someone should not spend a session re-discovering it:

- `HomeHero.module.css` and `HomeHero.tsx` were last **shaped** by `566d466`
  (2026-08-30, REQ-001/TASK-004). REQ-002 added exactly **two lines** to that
  CSS in `46aef59` — the `background-color: var(--mantine-color-body)` on
  `.hero` (FQ24), which changes no box metric.
- `front/src/app/globals.css` is **byte-identical** between `76ad68e`
  (2026-09-02) and `HEAD`.
- `theme.ts`'s REQ-002 diff is inputs/Accordion/Modal/Alert skins and the D1
  grid variables. **Nothing in it touches a Home hero metric.**
- Working tree is clean; `HEAD` is the tree QA tested.

So the hero's own layout inputs are unchanged since 2026-08-30. **This does not
prove the defect pre-dates REQ-002** — a rendered A/B would, and nobody has run
one. It does mean: **do not go looking for a REQ-002 regression in this file.**
Treat it as "the mobile budget was never large enough and the 2026-09-02 reading
did not catch it", and fix the budget. If you turn up hard evidence of a real
cause while working, write it in §Implementation Notes — it is worth having.

## What to do

Reclaim >= 85px of vertical space in the Home hero **at phone widths only**,
until H8's full set fits above 740px at 360 wide.

**Scope rule (mine, and it is hard):** every change lands inside
`@media (max-width: 47.99em)` in `HomeHero.module.css`. **Nothing at >= 48em may
change, not one declaration.** Reason: the owner ticked **AC2 (`ผ่าน เท่ขึ้นมาก`)
and AC1 on the desktop look on 2026-09-05.** A repair that shifts the desktop
hero un-ticks a criterion the owner has already passed. `47.99em` is Mantine's
`sm` boundary and 62em (the file's existing query) is `lg`; the band in between
is untouched by this task.

### The lever ledger — my arithmetic, unrendered, so verify each one

Current mobile values are all outside any media query, so each lever is a
declaration repeated inside the new `max-width: 47.99em` block:

| Lever | Now | Suggested | Saves (approx) |
|---|---|---|---|
| `.status` `margin-bottom` | 28px | 16px | 12 |
| `.supporting` `margin-top` | 20px | 12px | 8 |
| `.lead` `margin-top` | 24px | 16px | 8 |
| `.lead` `line-height` | 1.7 | 1.55 | ~24 (9 lines x 2.7) |
| `.closing` `margin-top` | 40px | 24px | 16 |
| `.closing` `gap` | 32px | 20px | 12 |
| | | **total** | **~80** |

That lands short of 85 on my numbers, so **one more lever is expected**. Ranked
by how much I trust it:

1. `.lead` `font-size` 1.125rem -> 1.0625rem. Biggest single win, changes the
   line count, must be measured not assumed.
2. `.hero` `align-content: center` -> `start` at this breakpoint. When the
   content is taller than `100dvh` the centring pushes it off **both** ends, so
   `start` recovers roughly half the overflow for free. **Measure the top too:**
   the status capsule must not end up under the sticky 64px header.
3. `.actions` `gap` column 28px -> 16px so both CTAs share one row (saves 56px
   at a stroke). **I rate this fragile** — at 360 the content box is ~296px and
   the two controls plus the gap are right at that edge; a single wrap and you
   are worse off than now. Only if you can show it holds.

Take the smallest set that clears the bar with room. Stop when it clears; do not
apply all of them.

### Forbidden — these are not levers

- **No string changes.** `HOME_LEAD`, `HERO_CTA_PRIMARY`, `HERO_CTA_SECONDARY`,
  `SITE.*` and quote q4 are untouched (R4; H5's baseline problem is open, do not
  add to it).
- **No element removed or hidden at any width** — the status capsule, the
  quote and both CTAs all stay rendered. H8 requires the quote to be *visible*,
  so `display:none` is a fail, not a fix.
- **No change to `.name`'s type scale** — the h1 is the design's main event and
  its tracking is global in `globals.css`, which this task does not open.
- **No new one-off colour, font or spacing token.** Spacing numbers already in
  this file may be reduced; a new *named* token would be a SPEC decision.
- **No new file, no new component, no JS, no markup change.** CSS module only.
- Do not touch `HomeStats`, `HomeStatement`, `HomeCapabilities`, `PullQuote`,
  `theme.ts` or `globals.css`.

## Definition of Done

- [x] Only `front/src/components/partials/Home/HomeHero.module.css` is modified.
      Prove it: `git status --porcelain` shows that one path and nothing else.
- [x] Every added declaration is inside `@media (max-width: 47.99em)`. Prove it:
      paste the diff in §Implementation Notes.
- [x] `git diff` shows **no change** to any rule that applies at >= 48em.
- [x] Rendered at **360x740** on `npm run dev`: report the measured top/bottom of
      **name, nickname/role, lead, CTA 1, CTA 2, hero quote and the status
      capsule**, in a table like QA's. **All of H8's set must end at <= 740**, and
      the status capsule must start below the 64px header.
- [x] Rendered at **1280** wide: hero screenshot compared against the same tree
      before your change — state whether it is identical and how you compared.
      A visible desktop difference is a **stop-and-report**, not a judgement call.
- [x] `npx tsc --noEmit` clean (it should be unaffected; run it anyway).
- [x] Console clean on `/` at both widths.
- [x] §Implementation Notes says which levers you used, which you rejected and
      why, and states plainly that H8's re-run belongs to QA, not to you.

## Implementation Notes

**Done 2026-09-05 by Fern. Status -> REVIEW.** One file, one appended block, 28 lines,
all inside `@media (max-width: 47.99em)`. Measured on `npx next dev -p 3030`
(port 3000's orphan `next`, PID 8508, routed around and never touched; `front/.next`
had no `BUILD_ID` before or after, so no `next build` output was run over).

### 1. A real cause, found while measuring — the missing 15px is a scrollbar

QA's numbers are **not reproducible at a 360px *content* width**, and that is not a
font wobble. Chrome on a desktop OS draws a **classic 15px scrollbar**, so a headed
run at viewport 360x740 lays the page out in `documentElement.clientWidth = 345`.
`PageSection.inner` then gives the hero a **305px** content box instead of 320px, and
two things tip over at once:

- the lead wraps to **9** lines instead of 8 (+30px), and
- `.actions` needs `167 + 28 + 113 = 308px` but has 305 -> the two CTAs **stack**
  (+56px). That is the "sliced CTA 2" in QA's table.

Proof, same tree, same browser, only the width changed (pre-change CSS):

| element | at clientWidth 360 | at clientWidth 345 | QA's table |
|---|---|---|---|
| name | 177-265 | 189-277 | 177-265 |
| nickname / role | 285-311 | 297-323 | 285-311 |
| lead | 335-580 (8 lines) | 347-622 (9 lines) | 335-610 (9 lines) |
| CTA 1 | 620-664 | 662-706 | 650-694 |
| CTA 2 | 620-664 (same row) | 718-762 (**stacked**) | 706-750 |
| hero quote | 696-723 | 794-821 | 782-809 |

At 345 every element sits **exactly +12px** below QA's value and every *delta* between
elements matches to the pixel — same wrap count, same stack, same 88px name box. So
DEF-2 reproduces exactly at content width 345 and does not reproduce at 320.
**The residual constant +12px I cannot explain and I do not guess at it** (my header
measures 65px tall; if QA's measured 53 that would account for all of it, but I did not
see QA's header box and will not assume it). It does not affect the fix: +12 makes my
figures the *pessimistic* ones.

This still does **not** date the defect. It says the mobile budget never had room for a
15px-narrower box, which is consistent with your source+git narrowing and with H8
passing on 2026-09-02 under whatever width that run used. Provenance stays **UNKNOWN**.

**Consequence for the fix:** I tuned against the harsh case (clientWidth 345), not the
comfortable one.

### 2. Levers used (4 rules, 6 declarations)

```
@media (max-width: 47.99em) {
  .status     { margin-bottom: 16px; }            /* was 28 */
  .supporting { margin-top: 12px; }               /* was 20 */
  .lead       { margin-top: 16px;                 /* was 24 */
                font-size: 1.0625rem;             /* was 1.125rem  (lever 1) */
                line-height: 1.55; }              /* was 1.7 */
  .closing    { gap: 20px;                        /* was 32 */
                margin-top: 24px; }               /* was 40 */
}
```

Lever 1 (`.lead` font-size) earned its place by measurement, not by arithmetic: at 17px
the lead drops from 9 lines to 8 at clientWidth 345, which is 66px on its own
(9x30.6 = 275 -> 8x26.35 = 211). Without it the ledger lands at ~80px and the quote
finishes at 741 — 1px over the fold. That is the knife edge you warned about, so it is
not a candidate.

**Rejected, deliberately:**

- **`.actions` column gap 28 -> 16** (your lever 3). Rejected as you rated it. At
  clientWidth 345 the row needs 296px in a 305px box — 9px of slack against a text
  string, and if it ever wraps the fix is 56px worse than doing nothing. The CTAs are
  *allowed* to stack in the fixed layout (they do at 345, they do not at 360) and it
  fits either way. Nothing depends on them sharing a row.
- **`.hero` `align-content: center` -> `start`** (your lever 2). Rejected because it is
  now the wrong direction and would *hurt*. Pre-fix the hero is 770px tall against a
  740 viewport, so there is no free space and the centring does nothing. Post-fix the
  content is short enough that `min-height: 100dvh` wins, the centring gets ~90px of
  slack and spends half of it pushing the status capsule **down** to y=155 — clear of
  the 65px sticky header, which is exactly the hazard you flagged. `start` would put it
  at 113 and gain nothing. Left alone.
- No string, no element hidden, no `.name` type scale, no new token, no markup, no JS.

### 3. Rendered result — `/` on `npm run dev`, clean load, `scrollY = 0`

**At viewport 360x740, clientWidth 345 (reproduces QA's headed run):**

| element | before | after | fits <= 740 |
|---|---|---|---|
| status capsule | 125-161 | **127-163** | yes, starts below the 65px header |
| name | 189-277 | 179-268 | yes |
| nickname / role | 297-323 | 280-305 | yes |
| lead | 347-622 (9 ln) | 321-532 (8 ln) | yes |
| CTA 1 "View my work" | 662-706 | 556-600 | yes |
| CTA 2 "Get in touch" | 718-**762** | 612-**656** | yes |
| hero quote (q4) | 794-**821** | 676-**703** | yes, 37px of headroom |

**Reclaimed = 821 - 703 = 118px** against your >=85px budget.

**At viewport 360x740, clientWidth 360 (overlay-scrollbar case):**

| element | after |
|---|---|
| status capsule | 155-191 (header ends 65) |
| name | 207-296 |
| nickname / role | 308-333 |
| lead | 349-560 |
| CTA 1 | 584-628 |
| CTA 2 | 584-628 (same row) |
| hero quote (q4) | 648-675 — 65px of headroom |

Hero box lands at 1-741 in both, i.e. exactly one viewport, nothing clipped.

### 4. `>= 48em` is provably frozen

A/B on the same running server, same tab, same 1280x800 viewport: measured the
after-tree, restored the pre-change file byte-for-byte (`md5 5941e6c2...`), re-measured,
then restored the fixed file (`md5 67488843...`).

- **Every** box identical: hero `[1,801,0,1265]`, status `[154,190,105,334]`, name
  `[218,468,105,1161]`, supporting `[488,514,...]`, lead `[538,660,105,709]`, CTA 1
  `[700,744,105,271]`, CTA 2 `[700,744,299,412]`, quote `[704,740,468,1161]`,
  `scrollHeight` 2740. Screenshots indistinguishable.
- Computed styles identical at 1280 both ways — `.status` margin-bottom **28px**,
  `.supporting` margin-top **20px**, `.lead` 24px / **18px** / **30.6px**, `.closing`
  40px / gap 56px. The block does not reach desktop.
- Boundary walked: at viewport **768** the desktop values are live; at **767** the
  mobile values are. Note for the file: Chrome matched the query on the 768 viewport
  even though `clientWidth` was 753, i.e. the width a media query sees **includes** the
  classic scrollbar. The band 48em-62em is untouched, and the file's existing
  `@media (min-width: 62em)` rule never overlaps `max-width: 47.99em`.

### 5. Checks

- `git status --porcelain` -> `M front/src/components/partials/Home/HomeHero.module.css`
  and nothing else. `git diff` = the one appended block above, 0 lines removed.
- `npx tsc --noEmit` -> exit 0, no output.
- Console on `/` in a **fresh tab** at 360 and at 1280: only React's
  "Download the React DevTools" info line. No warning, no error. (Earlier 404s in this
  session were a dev-server hiccup of mine before a restart, not the page.)
- Dev server stopped; port 3000's orphan left listening as found.

### 6. What I did not do

**H8's re-run is QA's, not mine, and AC3 does not tick on this file.** The tables above
are my own instrumented measurement in a mobile-emulated tab — they are evidence that
the geometry now fits, not a pass. Nobody has looked at this on a real phone, and the
mobile lead is now visibly tighter type (17px/1.55 vs 18px/1.7) — see FQ39.


## Questions

**FQ39 — non-blocking. Flagging a visible change, not asking permission to ship it.**
Lever 1 was necessary (§Implementation Notes §2), so the Home lead now reads at
**17px / 1.55** on phones instead of 18px / 1.7. That is a real, visible type change on
the one paragraph the owner reads first, and it is the only part of this fix a person
could dislike on sight. Desktop is byte-identical, so AC1/AC2 as he ticked them are
untouched — but if you want the mobile lead left at 18px, say so and I will re-cut the
budget without it: it is worth 66px, which means lever 3 (CTA stacking) has to be
attacked instead, and I would want a QA eye on that wrap before trusting it.

> **answer (Sober, 2026-09-05): ship it — the mobile lead stays 17px / 1.55.**
> Three reasons, in order. (1) Lever 1 was **necessary by measurement**: without it
> the ledger lands at ~80px and the quote finishes at 741 — 1px over the fold. The
> 85px budget existed precisely so the pass would not sit on that edge. (2) The only
> alternative is lever 3, which I rated fragile before you measured it and which you
> then measured as **9px of slack against a text string**; I am not trading a proven
> 118px for that. (3) Desktop is byte-identical, so AC1/AC2 as the owner ticked them
> are untouched — the change is confined to the surface he has not yet seen.
> One observation I am **recording rather than acting on**: at 1.0625rem the mobile
> lead is now the same size as `.supporting` (also 1.0625rem, line-height 1.5), so on
> phones those two paragraphs differ only by line-height. That is a softened
> hierarchy, not a defect, and I will not spend fold budget to fix it. It goes to
> Porter as an SA notice for the owner's eye alongside DEF-2's sign-off, because he
> is the only person who can say "the phone lead reads too small". **No action from
> you.**


## Review

**Verdict: DONE — Sober, 2026-09-05.** Re-verified by me in the working tree, not
read off your notes.

- **Scope.** `git status --porcelain` on `develop` shows five paths; this task's is
  `HomeHero.module.css` alone, **+28 / -0**. The other four are TASK-014's and
  TASK-015's, accounted for in their own files. The tree matches your report.
- **`>= 48em` is frozen structurally, not just by A/B.** The whole diff is one
  appended `@media (max-width: 47.99em)` block (file lines 174-192). **No rule that
  applies at >= 48em changed a byte**, and the file's existing
  `@media (min-width: 62em)` never overlaps the new query. Your 1280 before/after is
  good corroboration, but the diff is the proof and it is stronger than the eye.
- **Budget met with room.** 118px reclaimed against my >= 85px, tuned at the harsh
  width (clientWidth 345), quote ending 703 with 37px of headroom, and the status
  capsule at 127 clear of the 65px header. Both the 345 and the 360 tables are
  reported, not just the flattering one.
- **Both rejections survive scrutiny.** Lever 2 (`align-content: start`) is correctly
  identified as *harmful after the fix* — post-fix the centring is what pushes the
  capsule clear of the header, so `start` would gain nothing and cost the clearance I
  asked you to protect. Lever 3 is the one I rated fragile, and you measured the slack
  instead of arguing about it.
- **Forbidden list respected**, confirmed against the diff: no string, no element
  hidden, no `.name` type scale, no new token, no markup, no JS, no other file.
- **`npx tsc --noEmit` re-run by me: exit 0.**

**The scrollbar finding is the most valuable thing in this task — and it is a
mechanism, not a date.** "Headed Chrome lays an emulated 360x740 out at
`clientWidth` 345" explains why QA's table reproduces and a naive 360 run does not,
and it is reusable by every role from here on. You do not claim it dates DEF-2, and
it does not: **provenance stays formally UNKNOWN.** The residual constant +12px is
left honestly unexplained instead of rationalised into a header height you never saw
— that is the right call.

**AC3 is not ticked here and I do not tick it.** REGRESSION **H8**, re-run by Tanya,
is the only authority on it (Porter, REQ-002 §Owner's answers). Your tables are
evidence that the geometry now fits; they are not a pass.

**FQ39 answered above: ship as built.** Nothing carried back to you.
