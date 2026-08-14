# TEST-DONG: FE rework retest + `hallmark audit` — `smart-scheduler-front@dong`
- Source: `neeeeroooo` commits **`63f734d`** (responsive tables + pinned columns) + **`7f9456e`** (hallmark skill), graded against **`FRONTEND-STANDARD.md`**
- Status: **Round 1** — functional retest `TEST_PASSED`; hallmark `close, fix the minors`. · **Round 2** — TASK-129 `TEST_PASSED`; TASK-128 `TEST_FAILED` on DEF-3. · **Round 3 (customer-prod, read-only)** — ✅ **DEF-3 CLOSED, no regression; REQ-041 items 1–5, 7, 8 verified on the deployed build** (item 6 cut by the owner).
- Environment: **local**, branch `dong`, `next dev` in mock mode (`localhost:3016`). **Nothing on any server.**
- Tested: 2026-08-11 by Tanya

## Scope

Porter routed the reworked screens for a functional retest **and** a design-lens pass. Harnesses:
`tests/harness/local-dong-ui-retest.mjs`, `local-dong-followups.mjs`. Evidence:
`../project-docs/qa-dong-2026-08-11/`. Everything below is measured in a real compositing browser or
grepped from source — no impressions.

---

# Part 1 — Functional retest

## What the rework fixed (verified, not taken on trust)

| # | Check (FRONTEND-STANDARD §2) | Measured | Result |
|---|---|---|---|
| F-1 | lead (checkbox) + action columns stay **pinned** | 11 `[data-pin]` elements, all `position: sticky`, at **375 / 768 / 960 / 1280** | **PASS** |
| F-2 | badges no longer truncate ("PENDING"→"PEN…") | 40 chips scanned at each width — **0 truncated** | **PASS** |
| F-3 | tables scroll instead of clipping; page never scrolls sideways | clipped cells **0** at every width; at 375 the table is 760 px inside a 301 px scroller with `overflow-x: auto`; `pageHasHScroll=false` everywhere | **PASS** |
| F-4 | edge shadow is **scroll-aware**, not permanent | `data-at-start` / `data-at-end` flip with width: at 375 `start=true end=false`, at 960+ `start=true end=true` | **PASS** |
| F-5 | 🔴 **DEF-1 retest** — the Voucher "Manage" control at 375 | **reachable=true** (hit-test returns the button). It was `elementFromPoint → null`, off the painted surface, in my 2026-08-04 measurement | **PASS — my long-standing MINOR defect is CLOSED** |
| F-6 | "Manage" reads as a **button**, not a tag | filled: `bg rgb(34,139,230)`, white label, 126 px wide | **PASS** |
| F-7 | PlanModal sized for its table | **width = 1100 px** (was 780) | **PASS** |
| F-8 | row actions collapsed into a **⋯ overflow menu** | every row exposes exactly **one** control ("Actions") instead of 2–3 inline mini buttons | **PASS** |
| F-9 | the ⋯ menu is **keyboard-operable**, not hover-only | focus + **Enter** opens it → `Edit · Mark absence · Cancel` | **PASS** |
| F-10 | containment: no card-in-card around the table | exactly **1** boxed Card/Paper layer in the ancestor chain | **PASS** |

## Functional regressions — none found

| # | Check | Measured | Result |
|---|---|---|---|
| R-1 | search still filters and clears | 10 rows → nonsense query → empty-state → cleared → **10 again** | **PASS** |
| R-2 | the status filter still filters | Confirmed → 6 rows, all `CONFIRMED` | **PASS** |
| R-3 | plan modal still renders its sessions | 3 rows | **PASS** |
| R-4 | bulk confirm | **NOT EXERCISED** — after filtering to CONFIRMED there were no selectable rows; bulk-confirm appears to apply to pending rows only. Stated rather than assumed | **NOT TESTED** |

## Functional misses

| # | Check | Expected (§) | Measured | Severity |
|---|---|---|---|---|
| M-1 | date format consistency | §2 — *dates `DD/MMM/YY`, one helper everywhere* | the **plan table** got `DD/MMM/YY`, but the **bookings table still renders ISO** — 10 cells reading `2026-08-13`. Two formats now coexist | **major** |
| M-2 | `tabular-nums` on numeric/date/time columns | §2 — *misaligned digits are an instant tell* | **0 of 20** numeric cells carry `font-variant-numeric: tabular-nums` | **major** |
| M-3 | phone hit target ≥44 px | §3.2 | the Voucher "Manage" button is **30 px** high at 375 | **minor** |

> M-1/M-2 are exactly the kind of thing the rework was *about* — it fixed truncation and pinning, then left
> the digits and one of the two date renderers alone. Worth naming so the follow-up REQ closes the set.

---

# Part 2 — `hallmark audit` (design lens)

Target: the reworked screens (`BookingsTable`, `VoucherPanel`, `PlanModal`) plus the shell they live in.
Per the audit verb: no edits, findings ranked, each with Tell / Where / Severity / Fix.

## Major (looks AI-generated)

| # | Tell | Where | Fix |
|---|---|---|---|
| H-1 | **Two colour systems in parallel** — the standard's own named "biggest sin": Mantine theme + Tailwind `bg-default-*` / `text-default-*` / `border-default-*` | **26 files** under `src/` | Pick one source. Bridge Tailwind semantic names to the Mantine tokens (there is already `lib/ui/colors.ts`) and delete the parallel scale |
| H-2 | **Mid-render token improvisation** (inline hex) — §3.5 requires **zero** hits | `bg-[#f5f7fb]` in `app/login/page.tsx:40` · `app/checkin/page.tsx:11` · `partials/Checkin/CheckinContent.tsx:71` · `layout/AdminLayout/AdminLayout.tsx:25` | Lift to one named token (`--color-paper`) and reference it in all four |
| H-3 | **`transition-all`** — explicit anti-pattern, and the cause of H-4 | `layout/.../Sidebar.tsx:61` · `partials/Calendar/CalendarGrid.tsx:116,149` · `CalendarWeekGrid.tsx:131` | Transition only the properties that change (`background-color`, `border-color`) |
| H-4 | **Focus ring that animates in** — §3.3 requires the `:focus-visible` ring to be **instant** | measured on the PlanModal row-action control: `transition-property: all`, outline width 3 px | Exclude `outline`/`box-shadow` from any transition; ring appears on the first frame |
| H-5 | **Tabular data without `tabular-nums`** | every numeric/date/time column in `BookingsTable` (0/20 cells) | Add `font-variant-numeric: tabular-nums` to the numeric column class — one utility, applied in the table cell |
| H-6 | **One-font page** — §1 asks for a display + body pairing; *"a one-font page is a template page"* | `context/MantineProviders.tsx:16-17` — body **and** headings both `var(--font-noto-sans-thai)` | Pair a display face for headings (must carry Thai), keep Noto Sans Thai for body |
| H-7 | **Inconsistent date rendering** (see M-1) | plan table `DD/MMM/YY` vs bookings table ISO | One shared formatter, used by both |

## Minor (small taste issues)

| # | Tell | Where | Fix |
|---|---|---|---|
| H-8 | **Status carried by colour + label but no shape** — §2 asks red/green pairs to carry an icon or shape too | `common/BookingBadges.tsx:19` — `StatusChip` is `variant="light"` with no icon (the TYPE chip does use `variant="dot"`) | Give the status chip a small state icon, or reuse the dot variant so it isn't hue-only |
| H-9 | **Hit target below 44 px on phone** (see M-3) | Voucher "Manage" at 375 → 30 px | `size="sm"`/`h={44}` at the phone breakpoint |

## Not found (checked, and clean)

Card-in-card ✅ · side-stripe badge ✅ · 3-equal-column grid ✅ · `hover:scale-105` ✅ (0 hits) ·
arbitrary `z-index` ✅ (0 hits) · hover-only affordances ✅ (the ⋯ menu is keyboard-operable) ·
gradient headline / aurora blobs / floating orbs ✅ · invented metrics ✅ (the counts on screen are real data).

## Count and verdict

**0 critical · 7 major · 2 minor.**

**Verdict: `close, fix the minors`** — for the *reworked screens themselves*. The structural work is right
and it is a genuine step up: pinned anchor columns, honest scrolling instead of truncation, a real overflow
menu that works on keyboard, buttons that read as buttons. Nothing here "ships as slop".

**But by our own §3 Definition of Done it is not finished**, and I want that stated rather than softened:
- **§3.3 fails** — the focus-visible ring animates (H-4).
- **§3.5 fails** — "grep the diff for inline hex / `transition-all`: **zero hits**" is currently **4 + 4**.
Those are gates the standard says must pass before a FE task is `REVIEW`-ready, so the honest reading is
*"the tables are fixed; the token and interaction discipline the standard asks for is not yet in place."*

## Ranked punch-list (input for the follow-up REQ)

1. **H-1** one token source — kill the parallel Tailwind colour scale *(largest blast radius, 26 files)*
2. **H-2** remove the 4 inline hex values → one `--color-paper` token *(fast, closes half of §3.5)*
3. **H-3 + H-4** drop `transition-all`; never transition the focus ring *(closes §3.3 and the rest of §3.5)*
4. **H-5** `tabular-nums` on numeric/date/time columns *(one class, instant polish)*
5. **H-7 / M-1** one date formatter for every table
6. **H-6** a real type pairing for headings *(needs a Thai-capable display face — a design call, not a code one)*
7. **H-8** status chip carries shape as well as hue
8. **H-9** 44 px hit target on phone

## Verdict

**Functional retest: `TEST_PASSED`** — the rework does what it claims, with no regression found, and it
**closes DEF-1** (the voucher Manage button I filed as unreachable at 375 on 2026-08-04).
**Design lens: `close, fix the minors`, with §3.3 and §3.5 formally failing** — items 1–4 above are the
cheap ones and would clear both gates.

## Test data created

**None.** Local, mock data, read-only inspection. The dev server was stopped afterwards.

## Questions

1. **@Porter — H-6 (type pairing) is a design decision, not a code fix**: it needs a display face that
   carries Thai. Worth the owner's eye before anyone implements it.
2. **@Porter — R-4 (bulk confirm) stayed unexercised** because the filtered set had no selectable rows. If
   you want it covered I'll run it on a pending-only set; it is unrelated to this rework.

---

# ROUND 2 — REQ-041 verification (TASK-128 tokens/motion + TASK-129 polish), 2026-08-11

Ran locally on `dong`. **Note: Fern's work is uncommitted** — 36 modified files in the working tree, HEAD
still at `7f9456e`. So this verdict covers the working tree, not a commit. Harnesses:
`local-req041-verify.mjs`, `local-req041-precise.mjs`, `local-alpha-modifier-probe.mjs`,
`local-alpha-cssom.mjs`, `local-alpha-regression-sites.mjs`. Evidence: `../project-docs/qa-dong-2026-08-11/`.

## What is fixed — verified

| # | Item | Measured | Result |
|---|---|---|---|
| V-1 | **§3.5 gates** — inline hex · `transition-all` · `font-family` · residual `-default-N` · dead `font-num` | **all five greps = 0** | **PASS** |
| V-2 | **§3.3 focus ring instant** | 12 controls sampled: **0** animate the ring. Nav links transition `color, background-color, border-color…` at 0.15 s — explicit properties, exactly the fix — and the one `all` seen carries `duration: 0s`, so it animates nothing | **PASS** |
| V-3 | **M-1 dates** — bookings table | `iso = 0`, 10 cells now read **`13/Aug/26`** | **PASS** |
| V-4 | **M-2 tabular-nums** — was 0/20 | **20/20** numeric cells | **PASS** |
| V-5 | **H-8 status shape** | chips now carry icons, `aria-hidden="true"` so the text label stays the accessible name | **PASS** |
| V-6 | **M-3 / H-9 hit target** | Voucher "Manage" at 375 → **h = 44 px**, reachable | **PASS** |
| V-7 | **the date FILTER still queries** (the risk in swapping a date renderer) | preset "This month" → **10 rows** returned | **PASS** |
| V-8 | **the 63f734d rework survives the token swap** | pinned = 11 all `sticky`, truncated badges 0, clipped cells 0, no page h-scroll — at 375 / 768 / 1280 | **PASS** |
| V-9 | **DEF-1 stays closed** | reachable at 375 | **PASS** |

### Correction to my own earlier reading (§3.3)
My first run flagged the focus ring as animated because the computed `transition-property` was `all`. That
was **my error**: the same element's `transition-duration` was **0 s**, so nothing animates. The question is
whether it *animates*, not what the property list says. Re-measured across 12 controls: **0 animated**.
§3.3 passes. I'd rather correct myself here than let a false FAIL travel.

## 🔴 DEF-3 — the token migration silently disabled every Tailwind opacity modifier — **MAJOR**

**This is a real visual regression, and it contradicts TASK-128's "zero visual delta by construction".**

- **Mechanism (proved, not inferred).** `git diff tailwind.config.ts`: before, colours were **literal hex**
  (`content1: "#ffffff"`, `default-100: "#f1f5f9"`) — Tailwind can compose an alpha modifier from a hex.
  After, they are `var(--color-…)`. In Tailwind v3 a bare `var()` colour **cannot** carry `/NN`, so the
  utility is **never generated**.
- **Evidence — the generated CSS itself.** Reading the CSSOM for the classes actually used in `src`:

  | class | rule Tailwind emitted | paints |
  |---|---|---|
  | `bg-muted-50` | `background-color: var(--color-muted-50)` | `rgb(248,250,252)` ✅ |
  | `bg-muted-100` | `background-color: var(--color-muted-100)` | `rgb(241,245,249)` ✅ |
  | `bg-muted-50/40` | **no rule generated** | `rgba(0,0,0,0)` ❌ |
  | `bg-muted-50/80` | **no rule generated** | `rgba(0,0,0,0)` ❌ |
  | `bg-muted-100/60` | **no rule generated** | `rgba(0,0,0,0)` ❌ |
  | `bg-muted-100/50` | **no rule generated** | `rgba(0,0,0,0)` ❌ |
  | `bg-content1/80` | **no rule generated** | `rgba(0,0,0,0)` ❌ |

- **Affected sites — 6 usages in 5 files:**

  | Site | Class | Before | Now |
  |---|---|---|---|
  | `layout/AdminLayout/Header/Header.tsx:27` | `bg-content1/80` | `#ffffff` @ 80 % | **nothing** — 🔴 regression (the app header backdrop) |
  | `partials/Teachers/TeachersContent.tsx:255` | `bg-muted-100/60` | `#f1f5f9` @ 60 % | **nothing** — 🔴 regression |
  | `partials/Teachers/TeachersContent.tsx:342` | `bg-muted-100/60` | `#f1f5f9` @ 60 % | **nothing** — 🔴 regression |
  | `partials/Reports/ReportsContent.tsx:155` | `bg-muted-100/50` | `#f1f5f9` @ 50 % | **nothing** — 🔴 regression |
  | `partials/Bookings/PlanModal.tsx:269` | `bg-muted-50/40` | nothing (`default-50` never existed) | **still nothing** — ⚠️ not the fix the review predicted |
  | `partials/Calendar/CalendarWeekGrid.tsx:106` | `bg-muted-50/80` | nothing | **still nothing** — ⚠️ same |

- **Why it matters beyond these 6:** the modifier is silently unavailable for **every future use** of these
  tokens. The next person writing `bg-muted-200/50` gets no background and no error.
- **Repro:** open any screen, inject `<div class="bg-muted-50/40">` → `backgroundColor: rgba(0,0,0,0)`;
  the same div with `bg-muted-50` paints. Harness: `local-alpha-cssom.mjs`.
- **Not my fix to write**, but the shape is standard: express the vars as channel triplets and reference
  them with the alpha placeholder — `--color-muted-50: 248 250 252` +
  `muted: { 50: "rgb(var(--color-muted-50) / <alpha-value>)" }`.

### Correction to the review's expectation, on the record
SA's 128 review flagged **six newly-defined `muted-{50,700,800,900}` sites** as "no-colour → a colour, so
Tanya must eyeball them". Measured: the **text** ones do now paint (`RentalModal` price `฿200` at
`rgb(51,65,85)`, contrast **10.35:1** — comfortably over 4.5) — but the **two `bg-muted-50/…` ones do
not**, because of DEF-3. The prediction was right about intent and wrong about outcome for 2 of the 6;
that's exactly what a runtime pass is for.

## Verdict — round 2

**TASK-129 → `TEST_PASSED`** (all four items verified: dates, tabular-nums, status shape, 44 px).
**TASK-128 → `TEST_FAILED` on DEF-3.** The gates it set out to close (§3.3, §3.5) genuinely **are** closed,
and the rename is sound — but the migration took a working Tailwind feature away at 6 sites, 4 of which
visibly regressed. One config-shape change fixes all six at once.

**REQ-041 as a whole: not yet done** — items 1–5, 7, 8 land correctly once DEF-3 is fixed; item 6 (type
pairing) remains held on the owner's Thai display-face pick.

## Test data created

**None.** Local, mock data, read-only inspection plus two throwaway `<div>`s injected into the page and
removed in the same evaluation. Dev server stopped afterwards; the product repo is untouched (Fern's
uncommitted changes left exactly as found).

---

# ROUND 3 — post-deploy visual verify on CUSTOMER-PROD, 2026-08-11. **DEF-3 CLOSED. No regression.**

Human-authorized in-session; **strictly read-only** — nothing created, changed or submitted, no LINE, no
teacher-change flow. Access was the app's own login form; `mint-session.mjs` was **not run, not edited, not
bypassed**. Harnesses: `prod-req041-visual-verify.mjs`, `prod-req041-hover-tints.mjs`. Evidence:
`../project-docs/qa-prod-req041-2026-08-11/`.

## DEF-3 — the opacity modifiers compose again on the deployed build

The fix (RGB channel triplets + `rgb(var(--…) / <alpha-value>)`) is live. Read from the **deployed CSS**,
not inferred:

| Class | Emitted rule | Paints |
|---|---|---|
| `bg-content1/80` | `background-color: rgb(var(--color-surface) / .8)` | **`rgba(255,255,255,0.8)`** ✅ |
| `hover:bg-muted-100/60` | `background-color: rgb(var(--color-muted-100) / .6)` | **`rgba(241,245,249,0.6)`** ✅ |
| `bg-muted-100/50` | generated | **`rgba(241,245,249,0.5)`** ✅ |
| `bg-muted-50/40` | generated | **`rgba(248,250,252,0.4)`** ✅ |
| `bg-muted-50/80` | generated | **`rgba(248,250,252,0.8)`** ✅ |
| `bg-muted-50` · `bg-muted-100` (plain) | unchanged | `rgb(248,250,252)` · `rgb(241,245,249)` ✅ value-preserving |

## The six tinted sites

| # | Site | Confirmed | Evidence |
|---|---|---|---|
| 1 | **`Header.tsx:27` — the app header backdrop** | ✅ **in situ** | the live `<header>` computes **`rgba(255,255,255,0.8)`** — **the backdrop is back** (`prod041-1-header.png`) |
| 2 | `TeachersContent.tsx:255` — hover tint | ✅ **in situ** | **21** blocks carry `hover:bg-muted-100/60` on the Teachers page; hovering computes `rgba(241,245,249,0.6)` |
| 3 | `TeachersContent.tsx:342` — hover tint | ✅ | same class as #2, same rule |
| 4 | `ReportsContent.tsx:155` | ✅ **in situ** | the tinted block computes **`rgba(241,245,249,0.5)`** |
| 5 | `PlanModal.tsx:269` — summary bar | ✅ **in situ** | the modal's summary bar computes **`rgba(248,250,252,0.4)`** — this is one of the two that were *still colourless* in round 2 |
| 6 | `CalendarWeekGrid.tsx:106` — non-bookable cell | ⚠️ **not seen in place** | no non-bookable cell rendered in the current week, so there was nothing to point at. Confirmed by the generated rule + a synthetic paint (`rgba(248,250,252,0.8)`). Stated rather than claimed as an in-situ sighting |

## No visual regression from the token migration

| Viewport | pinned | all sticky | truncated badges | clipped cells | ISO dates | `DD/MMM/YY` | tabular-nums | page h-scroll |
|---|---|---|---|---|---|---|---|---|
| 1440 | 11 | ✅ | 0 | 0 | 0 | 10 | 20/20 | none |
| 768 | 11 | ✅ | 0 | 0 | 0 | 10 | 20/20 | none |
| 375 | 11 | ✅ | 0 | 0 | 0 | 10 | 20/20 | none |

**DEF-1 stays closed on prod** — the Voucher "Manage" control at 375 is reachable and **44 px** tall.

## A correction I owe on my own run (third time this pattern has bitten, and worth naming)

My first prod probe reported `bg-muted-100/60` as still dead. **That was my artifact, not the product's.**
That class is only ever used as **`hover:`bg-muted-100/60**, so Tailwind generates
`.hover\:bg-muted-100\/60:hover` and never the bare class — injecting a plain `<div class="bg-muted-100/60">`
was therefore guaranteed to paint nothing regardless of the fix. Re-tested the way it actually renders
(hover the real element, read the emitted rule): **it composes.**

Same shape as the two false negatives I caught in the earlier rounds (`bg-paper/50` not in source; the
day-grid regex). The lesson has now earned its place in `REGRESSION.md`: **a synthetic probe only proves
something about a class Tailwind actually generated — check the source usage and the variant before
concluding the product is broken.**

## Verdict — round 3

**DEF-3 → CLOSED on the deployed build.** All six tinted sites compose; four confirmed in situ (including
the header backdrop the owner specifically asked about), one covered by an identical class, one verified by
rule + synthetic because the state that renders it wasn't present. **No visual regression** — the pinned /
no-truncation / date / tabular-nums baseline holds at 1440 / 768 / 375, and DEF-1 remains closed.

**REQ-041 items 1–5, 7, 8: verified on customer-prod.** Item 6 was cut by the owner.
**@Porter — this is the gate met; DELIVERED is yours to mark.**

## Test data created

**None.** Read-only throughout: page loads, computed-style reads, one hover, one plan modal opened and
closed with Escape, and two throwaway `<div>`s injected and removed inside a single `evaluate`. No writes,
no LINE, no teacher-change.
