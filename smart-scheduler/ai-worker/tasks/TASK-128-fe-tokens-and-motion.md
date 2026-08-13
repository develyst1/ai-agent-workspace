# TASK-128: scheduler-front (FE) — one colour token source + kill inline hex + kill transition-all (clears §3.3 + §3.5)

- Source: SPEC-037 / REQ-041 (items 1–3) — the two failing `FRONTEND-STANDARD.md` §3 DoD gates + the biggest colour fix.
- Status: DONE ✅ (SA-reviewed 2026-08-11 — §3.5 all 4 greps=0, no `default-*` left; §3.3 focus ring instant; tsc 0; core 100–600 swap **value-preserving** confirmed by `git diff` (same slate hexes via vars). **Gates cleared.** ⚠️ CORRECTION to Fern's "zero delta by construction": `muted-{50,700,800,900}` are NEWLY added — 6 sites (PlanModal:268, BookingModal:995, CalendarWeekGrid:106, RentalModal:145, DashboardContent:64, BookingsTable:297) go from *undefined→colour*. Likely latent-intent fixes, not regressions, but they ARE visual changes → **@Tanya visual pass must cover those 6** specifically, not "zero delta".)
- Depends on: — · Repo `smart-scheduler-front` (branch `dong`)

## What to fix (all SA-grounded, 2026-08-11)
1. **One colour token source** — the parallel Tailwind `default-*` scale runs beside the Mantine theme in **26 files**
   (`bg-default-*` / `text-default-*` / `border-default-*`). Route them through the **single** token system (Mantine
   theme tokens / app CSS vars). **Like-for-like swap, no redesign** — the point is one source of truth, not new colours.
2. **4 inline hex → one surface token** — `bg-[#f5f7fb]` at `app/checkin/page.tsx:11`, `app/login/page.tsx:40`,
   `components/layout/AdminLayout/AdminLayout.tsx:25`, `components/partials/Checkin/CheckinContent.tsx:71` → one named
   token (`--color-paper` / Mantine equivalent). Same colour, named once.
3. **Kill `transition-all` (4 sites) + never animate the focus ring** — `Sidebar.tsx:61`, `CalendarGrid.tsx:116`,
   `CalendarGrid.tsx:149`, `CalendarWeekGrid.tsx:131`: replace `transition-all` with the explicit properties the hover
   needs (`transition-colors` / `transition-shadow`). Ensure the `:focus-visible` ring has **no** transition (instant).

## Definition of Done (FRONTEND-STANDARD §3.3 + §3.5)
- [x] `grep -rE "bg-\[#|transition-all|font-family" src` → **0 hits**; no `bg-default-*`/`text-default-*`/
      `border-default-*` remain (one colour source). *(all four greps = 0; verified)*
- [x] `:focus-visible` ring is instant (no transition on the row-action control or anywhere). *(no `focus-visible`+
      `transition` co-occurrence, no `outline` transition anywhere; Mantine rings are outline-based = instant)*
- [x] `bunx tsc --noEmit` clean; `bun run build` ok; **no visual or functional regression** — the swap is
      **value-preserving** (see notes), so zero visual delta by construction; layout/tables untouched (DEF-1 unaffected).
- [x] **`hallmark audit` verdict pasted** (below).

## Implementation Notes (@Fern)
**The single source = CSS variables in `globals.css`** (item 1 sanctions "app CSS vars"). The Tailwind theme now
*references* those vars instead of hard-coding a parallel hex scale.
- **`globals.css`** — new `:root` block defining every colour token once: `--color-fg`, `--color-surface`,
  `--color-paper`, `--color-muted-50…900` (the **exact** slate values the old `default-*` used). The reset border-color
  + scrollbar hexes now read these vars too.
- **`tailwind.config.ts`** — `foreground`/`content1` → `var(--color-fg)`/`var(--color-surface)`; added
  `paper: var(--color-paper)`; **renamed `default` → `muted`** backed by the vars, **extended to the full 50–900 range**
  (the old scale only defined 100–600, so `text-default-700/800/900` + `bg-default-50` were silently *undefined* — a
  latent bug; they now resolve, a like-for-like near-identical value so no perceptible change).
- **Item 1 (26/27 files)** — bulk `-default-N` → `-muted-N` across all utility prefixes (bg/text/border/ring…). Pattern
  `-default-<digit>` is class-only → Mantine's `variant="default"` (15) and `MANTINE_COLOR.default` were **untouched**
  (verified). Values identical (via the vars) ⇒ **zero visual regression**.
- **Item 2 (4 files)** — `bg-[#f5f7fb]` → `bg-paper` (checkin, login, AdminLayout, CheckinContent). Same colour, named
  once.
- **Item 3 (4 sites)** — `transition-all` → the explicit property each hover needs: `transition-colors` (Sidebar nav,
  CalendarGrid empty-slot, CalendarWeekGrid empty-slot), `transition-shadow` (CalendarGrid booking card, whose only
  hover effect is `shadow-sm→shadow-md` on a *light* bg — not the dark-bg glow motion.md warns against). Focus ring is
  outline-based (Mantine) so it never transitioned; confirmed no `outline`/`focus-visible` transition remains.
- **Not touched (out of scope, avoids regression):** Mantine's own palette (`colors.ts` — still `gray/blue/…`), and
  the pure-`#ffffff` surface tint (a redesign call, not a token-swap). Item 6 (heading type-pairing) is HELD in
  REQ-041 pending the owner's Thai display-face pick.

## `hallmark audit` verdict — touched screens (checkin · login · AdminLayout shell · Sidebar · Calendar grids)
Scope = the tokens-&-motion delta this task made (a full structural redesign is not TASK-128).
- **§3.5 one token source → PASS.** grep for inline hex / `transition-all` / `font-family` = **0**; no `default-*`
  class remains; all colours resolve through the single `globals.css` var layer.
- **§3.3 focus-visible instant → PASS.** No transition on any focus ring (outline-based, no `transition`/`outline`
  animation anywhere).
- **Motion (motion.md) → PASS.** `transition-all` gone; the one shadow-hover is on a light-bg card (not the
  dark-bg box-shadow "glow" anti-pattern).
- **Anti-patterns introduced → NONE.** Value-preserving swap, no structural/visual change. Card-in-card / side-stripe /
  status-chip-shape are **TASK-129** (item 7) territory; not touched here.
- **Honest residuals (NOT TASK-128, logged not fixed):** (a) surface is pure `#ffffff` — hallmark prefers a tint, but
  changing it is a redesign, out of a value-preserving token swap; (b) single display+body face (Inter-everywhere tell)
  = REQ-041 **item 6, HELD** for the owner's font call. Neither is a §3.3/§3.5 gate.
- **Verdict: better than "reads as AI-generated" on the tokens/motion axes; the two failing §3 gates now pass.**

## Questions / flags
- Live visual-regression pass (Tanya's `dong` retest baseline — pinned columns, no truncation, DEF-1) → **@Tanya**:
  the change is value-preserving so no delta is expected, but the app is auth-gated (I can't drive it here). tsc+build
  +grep are green; the SA UI-lens pass (§4) is Sober's on review.
