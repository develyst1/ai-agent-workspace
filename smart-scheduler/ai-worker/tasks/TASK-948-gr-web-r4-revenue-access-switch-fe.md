# TASK-948 — FE: GR web round 4 — "Can see Revenue" switch per person in User Setting — @Fern (Team A)

**From @Sober, 2026-11-11.** Source: Porter 2026-11-11 07:28 (inbox/SA.md) · ขวัญ 07:12 «ให้พี่ฟีนเลือกได้ว่าใครเห็นหน้ารายได้บ้างเป็นรายคน / โอเคค่า» · ledger row 12. **Accepted by ขวัญ → NO "Proposed" badge.** Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo — no git). Desk stop is lifted for THIS round only.

## The seam (done by Sober in the shell — build against it, don't change it)
- `useRevenueAccess()` from `@/shell` → `{ canSee(username): boolean, set(username, on): void }`. Shared state, survives navigation (and reloads via localStorage). Default: **`khwan` ON, everyone else OFF.**
- The header switcher is now a **"Viewing as" dropdown**: CEO (phin) · **Admin (Khwan)** (username `khwan`) · **Admin (Kung)** (`kung`) · Coach. `useViewer()` gives `{ role, username, label }`.
- The access rule is in `shell/registry.ts` `canOpen()`: REVENUE pages open for the CEO and for any admin whose switch is ON (menu, page gate and Home cards all use it). **Page lists are unchanged** (REVENUE keeps `roles: ["ceo"]`).

## Your slice (your files only: `pages/a/frontoffice/UserSetting.tsx`, `mock/a-users.ts`)
1. **Add a mock admin login `khwan`** (display "Khwan", role admin, active) to `mock/a-users.ts` (+ to `FRONT_OFFICE` so it's consistent). Username must be exactly `khwan` — it's the key the shell uses.
2. **User Setting table: a "Can see Revenue" column.**
   - **Admin rows:** a Mantine `Switch` bound to `useRevenueAccess()` (`checked={canSee(u.username)}`, `onChange → set(u.username, on)`), toast `"<Name> can now see Revenue"` / `"<Name> can no longer see Revenue"`.
   - **CEO row:** "Always" (text, no switch). **Coach rows:** "—" (coaches never see Revenue).
   - A deactivated admin keeps its switch value but the switch is disabled (can't sign in anyway).
3. English only, approved words; mock only; User Setting stays CEO-only.

## Done = (evidence in `## Implementation Notes`)
- tsc 0 · `vite build` OK (scratch outDir) · Thai-scan clean on your files.
- **Headless click-through covering the whole round — including my shell seam** (I could not open it in a browser here):
  1. Viewing as **CEO** → User Setting shows the column; Khwan ON, Kung OFF; REVENUE in the menu.
  2. Viewing as **Admin (Khwan)** → REVENUE group in the menu, a Revenue page opens.
  3. Viewing as **Admin (Kung)** → no REVENUE in the menu; `#/revenue/summary` by link shows the "cannot see" card.
  4. As CEO turn **Kung ON** → switch to Admin (Kung) → REVENUE appears; turn it OFF → gone again.
  5. Coach → no Revenue; the dropdown works at phone width (375px), no horizontal overflow.
  6. 0 console errors.
- Report file:line changes. No git.

## Claim
final-ui `pages/a/frontoffice/UserSetting.tsx` + `mock/a-users.ts`. **Sober reviews.** Questions → me (`## Questions` below).

## Questions / Implementation Notes / Review
_(—)_

## Implementation Notes (Fern, 2026-11-11) — TASK-948: "Can see Revenue" switch per person
**Files (only mine):** `pages/a/frontoffice/UserSetting.tsx` (import :3, `useRevenueAccess` + `setRevenue` :19-25, column header :113, cell with the `Switch` ~:128-142, table min width 720) · `mock/a-users.ts` (admin login `khwan`, id `u6`, active; also in `FRONT_OFFICE`). Shell seam used as given, untouched. No git.
**Behaviour:** column «Can see Revenue» — CEO row «Always» (no switch) · admin rows a Mantine Switch bound to `useRevenueAccess()` (`canSee` / `set`), toast «Khwan can now see Revenue» / «Khwan can no longer see Revenue» · coach rows «—» · a deactivated admin (mali) keeps its value, switch disabled. No «Proposed» badge (accepted by ขวัญ). Page still CEO-only.
**Proof:** tsc 0 · vite build OK (scratch outDir) · Thai-scan 0 on both files · headless click-through (~27 checks, through the REAL header «Viewing as» dropdown, not localStorage) ALL PASS: (1) CEO sees the column, Khwan ON / Kung OFF, REVENUE in menu · (2) Admin (Khwan): REVENUE in menu, `#/revenue/summary` opens, no User Setting · (3) Admin (Kung): no REVENUE, by link → the «cannot see» card · (4) CEO turns Kung ON → Kung sees REVENUE and the page opens; state survives navigation and a reload; OFF → gone; Khwan OFF → gone (restored) · (5) Coach: no REVENUE, by link → «cannot see»; at 375px no horizontal page overflow on Coach and on User Setting, switcher visible · (6) 0 console errors/warnings. Your shell seam works as built — nothing found wrong. Evidence: `tests/evidence/task-941-fern/fui-r4-1-users.png`, `fui-r4-2-phone.png`.

## Review (Sober, 2026-11-11) — ✅ DONE
Code-read `UserSetting.tsx:17-25,128-142`: Switch bound to `useRevenueAccess()` (`canSee`/`set`), CEO «Always», coach «—», `disabled={!u.active}`; `mock/a-users.ts:34,48` `khwan` admin (exact key). Rendered evidence `fui-r4-1-users.png` matches the spec (Khwan ON, Kung OFF, mali disabled, REVENUE in CEO menu). Headless 6/6 incl. my shell seam (dropdown, persistence, 375px, 0 console errors). tsc 0, Thai-scan 0.
Security review: none — mock-only prototype, no real auth or data; the gate is demo UI only.
