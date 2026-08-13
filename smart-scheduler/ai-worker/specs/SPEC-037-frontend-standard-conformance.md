# SPEC-037 — Frontend-standard conformance (REQ-041)

- Source: REQ-041 (owner, off `neeeeroooo`'s rework + Tanya's hallmark audit). Standard = workspace-root
  `FRONTEND-STANDARD.md`. Repo: `smart-scheduler-front` (branch `dong`). Design ref: `.agents/skills/hallmark/` (`audit`).
- Status: DESIGN → two tasks for @Fern (TASK-128, TASK-129). **Item 6 (heading type pairing) HELD** — owner's Thai
  display-face pick pending; not in either task.
- Goal: make the FE pass `FRONTEND-STANDARD.md` **§3 Definition of Done** — specifically the two currently-failing
  gates, **§3.3** (focus-visible ring must be instant) and **§3.5** (zero inline hex / `font-family` / `transition-all`).

## Grounded current state (SA-verified greps, 2026-08-11)
- `bg-default-*` / `text-default-*` / `border-default-*` (parallel Tailwind colour scale beside the Mantine theme) in
  **26 files** — the standard's named "biggest sin" (§1, §2 two-colour-systems).
- **4** inline hex `bg-[#f5f7fb]`: `app/checkin/page.tsx:11`, `app/login/page.tsx:40`,
  `components/layout/AdminLayout/AdminLayout.tsx:25`, `components/partials/Checkin/CheckinContent.tsx:71`.
- **4** `transition-all`: `Sidebar.tsx:61`, `CalendarGrid.tsx:116`, `CalendarGrid.tsx:149`, `CalendarWeekGrid.tsx:131`
  — plus the row-action control whose focus ring animates via `transition-property: all` (§3.3 fail).
- Dates: scattered `dayjs().format(...)` — the **bookings table display** renders ISO `YYYY-MM-DD` (M-1), the plan
  table uses `DD/MMM/YY`. ⚠️ Many `format("YYYY-MM-DD")` are **query-range / date-input VALUES**, not display — those
  MUST stay ISO. The unify target is **display cells only**.

## TASK-128 — Tokens & motion (items 1–3): clears §3.3 + §3.5
The two failing DoD gates + the biggest-blast-radius colour fix, together (they're one concern: one token source, no
raw motion).
1. **One colour token source.** Route the 26 files' `bg-default-*`/`text-*`/`border-*` through the single Mantine theme
   token system (or the app's CSS-var tokens) — kill the parallel Tailwind `default-*` scale. No visual redesign; a
   like-for-like token swap so colour has one source of truth.
2. **4 inline hex → one token.** Replace `bg-[#f5f7fb]` (the 4 sites above) with a single named surface token
   (`--color-paper` / the Mantine equivalent). Same colour, named once.
3. **Kill `transition-all` (4 sites) + never animate the focus ring.** Replace each `transition-all` with an explicit
   property list (`transition-colors`/`transition-shadow` as the hover actually needs). Ensure the `:focus-visible`
   ring has **no** transition (§3.3 — instant).
- **DoD:** `grep -rE "bg-\[#|transition-all|font-family" src` → **0**; no `bg-default-*`/`text-default-*`/
  `border-default-*` left (one colour source); focus ring instant; `bunx tsc --noEmit` 0 + build ok; **no visual/
  functional regression** (Tanya's `dong` retest set); **run `hallmark audit`, paste the verdict in the task**.

## TASK-129 — Table & format polish (items 4, 5, 7, 8)
4. **`tabular-nums`** on every numeric / date / time / count / price column (audit found 0/20). Add to the cell/column
   className where digits render.
5. **One date-DISPLAY formatter, everywhere a table shows a date.** Add/'use one helper (`DD/MMM/YY`, times `HH:mm`)
   and route table display cells through it — the bookings table's ISO cell is the miss. 🔴 **Do NOT touch the
   `format("YYYY-MM-DD")` used for query ranges or `DateInput` values** — those are API/params, not display.
6. **[HELD]** heading type pairing — owner's font pick pending; not here.
7. **Status chip carries shape/icon, not hue alone** (§2, a11y) — add an icon or shape token to the status chip so
   red/green isn't the only signal.
8. **44px hit target on phone** — the Voucher "Manage" button is 30px at 375; size it ≥44px on phone (§3.2).
- **DoD:** `tabular-nums` present on numeric/date columns; one date-display format app-wide (query/input ISO untouched);
  status chip has a non-colour signal; Manage button ≥44px at 375; `tsc` 0 + build; **no functional regression**;
  **`hallmark audit` verdict pasted in the task**.

## Process (FRONTEND-STANDARD §4)
- Fern **self-runs `hallmark audit` before marking either task REVIEW** and pastes the verdict.
- SA review adds a **UI-lens pass** (not just code-correct) + reproduces the §3.5 greps (=0) and `tsc`.
- Tanya re-verifies no functional regression against her `dong` retest set; re-audits for the hallmark verdict lift.

→ **TASK-128 + TASK-129 (@Fern).** Item 6 stays in REQ-041 as held.
