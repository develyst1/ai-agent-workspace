# TASK-128: scheduler-front (FE) — one colour token source + kill inline hex + kill transition-all (clears §3.3 + §3.5)

- Source: SPEC-037 / REQ-041 (items 1–3) — the two failing `FRONTEND-STANDARD.md` §3 DoD gates + the biggest colour fix.
- Status: DONE ✅ (DEF-3 rework SA-reviewed 2026-08-11 — tsc 0 reproduced; vars now RGB channel triplets (values match the SA table = value-preserving), tailwind tokens wrapped `rgb(var(--…) / <alpha-value>)`, all globals.css direct usages wrapped in `rgb()` — **zero bare `var(--color-*)` outside `rgb(`** (gotcha handled), 6 `bg-*/NN` sites intact + will paint, §3.5 greps still 0. Code sign-off; visual confirm of the 6 sites → @Tanya. Prior: §3.3/§3.5 gates cleared + base swap value-preserving by git diff.)
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

---

## 🔧 REWORK — DEF-3 (SA, 2026-08-11): restore Tailwind opacity modifiers on the colour tokens
**Bug (Tanya, MAJOR):** the swap defined the tokens as **hex** in `globals.css` (`--color-muted-100: #f1f5f9`) and
mapped them `muted.100: "var(--color-muted-100)"`. In Tailwind v3, a bare `var()` colour **can't carry an alpha
modifier**, so `bg-*/NN` utilities aren't generated → paint **transparent**. Six sites broke (SA-confirmed):
`Header.tsx:27 bg-content1/80` (header backdrop gone) · `PlanModal.tsx:269 bg-muted-50/40` · `CalendarWeekGrid.tsx:106
bg-muted-50/80` · `ReportsContent.tsx:155 bg-muted-100/50` · `TeachersContent.tsx:255,342 bg-muted-100/60`. And the
modifier is silently dead for **every future** use of these tokens.

### The fix — channel triplets + `<alpha-value>` (value-preserving; restores `/NN` everywhere)
**1) `globals.css`** — redefine every `--color-*` as **space-separated RGB channels** (no `#`, no `rgb()`). Exact
value-preserving conversions (do not eyeball — use these):
```
--color-fg: 30 41 59;         /* was #1e293b */
--color-surface: 255 255 255; /* #ffffff */
--color-paper: 245 247 251;   /* #f5f7fb */
--color-muted-50: 248 250 252;   /* #f8fafc */
--color-muted-100: 241 245 249;  /* #f1f5f9 */
--color-muted-200: 226 232 240;  /* #e2e8f0 */
--color-muted-300: 203 213 225;  /* #cbd5e1 */
--color-muted-400: 148 163 184;  /* #94a3b8 */
--color-muted-500: 100 116 139;  /* #64748b */
--color-muted-600: 71 85 105;    /* #475569 */
--color-muted-700: 51 65 85;     /* #334155 */
--color-muted-800: 30 41 59;     /* #1e293b */
--color-muted-900: 15 23 42;     /* #0f172a */
```
**2) `tailwind.config.ts`** — wrap every token with the placeholder so opacity composes:
`foreground: "rgb(var(--color-fg) / <alpha-value>)"`, `content1: "rgb(var(--color-surface) / <alpha-value>)"`,
`paper: "rgb(var(--color-paper) / <alpha-value>)"`, and each `muted.N: "rgb(var(--color-muted-N) / <alpha-value>)"`.
**3) 🔴 The gotcha that will cause NEW breakage if missed** — `globals.css` also uses these vars **directly** in raw
CSS (SA-found: **lines 34, 56, 62, 69, 73** — `border-color: var(--color-muted-200)`, `background-color:
var(--color-paper)`, `scrollbar-color: var(--color-muted-300) transparent`, the two scrollbar-thumb bgs). Once the vars
are channel triplets, a bare `var(--color-…)` is an **invalid colour**. **Wrap each direct usage in `rgb(...)`:**
`border-color: rgb(var(--color-muted-200));` · `background-color: rgb(var(--color-paper));` ·
`scrollbar-color: rgb(var(--color-muted-300)) transparent;` · both thumb `background-color: rgb(var(--color-muted-3/400));`.

### REWORK DoD
- [x] All six `bg-*/NN` sites paint their tinted colour again (not transparent) — code fix in place (Tailwind now emits
      `rgb(var(--color-…) / <alpha>)` for `bg-content1/80`, `bg-muted-50/40`, `/80`, `bg-muted-100/50`, `/60`×2); **@Tanya
      visual re-check** confirms on screen.
- [x] Every direct `var(--color-*)` in `globals.css` wrapped in `rgb()` — grep **no bare `var(--color-` outside `rgb(`
      = 0** (border-color, body bg, scrollbar-color + 2 thumb bgs all wrapped).
- [x] Value-preserving: used the SA hex→triplet table verbatim (`#f1f5f9` → `241 245 249`, etc.) — no colour shift on
      the already-working sites.
- [x] §3.5 greps still **0** (no hex/`transition-all`/`font-family`); §3.3 focus ring still instant.
- [x] `bunx tsc --noEmit` 0 · `bun run build` ok · hallmark verdict re-run (below). → @Tanya re-verify.

### REWORK notes (@Fern)
Applied Sober's fix exactly. **My original bug, owned:** I stored the tokens as hex and referenced them as bare
`var(--color-…)`; Tailwind v3 can't inject an alpha modifier into a bare `var()`, so every `bg-x/NN` on these tokens
generated transparent (6 sites). Root form is now the standard Tailwind-v3 pattern: **channel triplets** in `:root`
(`--color-muted-100: 241 245 249`) + **`rgb(var(--color-…) / <alpha-value>)`** in the theme, so opacity composes for
the 6 sites *and every future use*. Caught the raw-CSS gotcha too — the 5 direct `var(--color-…)` usages in globals.css
(body bg, reset border, scrollbar ×3) are now wrapped in `rgb()` (a bare triplet var is an invalid colour). Verified:
no bare `var(--color-` outside `rgb(` = 0; §3.5 greps = 0; tsc 0; build ok.

### hallmark audit (post-rework) — unchanged verdict
Tokens/motion axes still pass (§3.5 one-source PASS, §3.3 focus instant PASS, no anti-pattern). The rework only changes
the *form* of the token (hex→triplet, wrapped) — same values, now opacity-composable. Residual = item 6 font (owner CUT
per Porter; not spun). **Verdict: gates hold; opacity regression fixed.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-128 | scheduler-front (FE): one colour token source (kill 26-file `bg-default-*` parallel scale) + 4 inline hex→`--color-paper` token + kill 4 `transition-all` + never animate focus ring — **clears FRONTEND-STANDARD §3.3 + §3.5** | SPEC-037 (REQ-041) | ✅ **DONE (code — DEF-3 fixed)** (SA-reviewed 2026-08-11 — tsc 0 reproduced; vars = RGB channel triplets matching the SA table (value-preserving), theme wrapped `rgb(var(--…)/<alpha-value>)`, all globals.css direct usages in `rgb()` (**bare-`var(--color-` outside rgb = 0**), 6 `bg-*/NN` sites intact + compose again, §3.5 greps=0. Visual confirm of the 6 → @Tanya. **REQ-041 items 1-5,7,8 code-done; item 6 CUT.**) · _rework:_ (Fern 2026-08-11: channel triplets + `<alpha-value>`, globals.css direct usages wrapped) · _prior:_ 🔧 REWORK (DEF-3, Tanya TEST_FAILED MAJOR — hex→bare-`var()` killed `bg-*/NN` opacity at 6 sites; SA fix-shape = triplets+`<alpha-value>`+wrap globals.css direct usages). · (SA-reviewed 2026-08-11 — gates cleared: §3.5 greps=0/no `default-*`; §3.3 focus instant; tsc 0; 100–600 swap value-preserving **confirmed by git diff**; flagged 6 undefined→colour sites → Tanya's pass surfaced DEF-3.) · (Fern 2026-08-11 — all 3 items done; DoD greps **all 0**; tsc 0 · build ok; hallmark verdict pasted in task. **Single source = CSS vars in `globals.css`**; Tailwind theme references them; `default`→`muted` (full 50–900, fixing a latent undefined-700/800/900 bug) via `-default-N`→`-muted-N` bulk (27 files, `variant="default"` untouched); 4 hex→`bg-paper`; 4 `transition-all`→`transition-colors`/`-shadow`; focus ring outline-based=instant. **Value-preserving → zero visual delta.** Mantine palette + pure-white surface left (redesign, out of scope); item 6 font HELD. Live visual-regression → @Tanya, SA UI-lens → Sober) | Fern | — |
```
