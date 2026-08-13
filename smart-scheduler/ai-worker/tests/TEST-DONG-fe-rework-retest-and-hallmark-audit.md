# TEST-DONG: FE rework retest + `hallmark audit` — `smart-scheduler-front@dong`
- Source: `neeeeroooo` commits **`63f734d`** (responsive tables + pinned columns) + **`7f9456e`** (hallmark skill), graded against **`FRONTEND-STANDARD.md`**
- Status: **Functional retest `TEST_PASSED`** (3 misses, all minor-to-major, none blocking) · **hallmark verdict: `close, fix the minors`** — but **two §3 DoD gates formally fail**, so by our own standard it is not "done" yet
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
