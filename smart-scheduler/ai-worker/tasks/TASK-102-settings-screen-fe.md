# TASK-102: scheduler-front (FE) — the Settings screen (the load-bearing half of REQ-031)
- Source: SPEC-029 §3 (REQ-031)
- Status: DONE ✅ (SA-reviewed 2026-08-11 — tsc 0 reproduced; renders from the API list (`rows.map` → "3rd rule = no FE change" holds), orange/gray override badge, edit→PUT with server reason on reject, reset shown only when overridden → confirm modal → `api.delete` (TASK-122); both mutations invalidate `SETTINGS_KEY` so the badge flips with no refetch. NumberInput min=0 only — server is the bound authority, no duplicated bounds table.) Was FAST-FOLLOW; built once TASK-122 landed.
- Depends on: TASK-101 (`GET/PUT /api/settings`) + TASK-122 (`DELETE /api/settings/:key` — reset) — both DONE
- Assignee: @Fern (smart-scheduler-front)

## What to build
A staff Settings page (scheduler-front :3016) — because *"in the database" is not "easy to change"*: the screen is
what makes REQ-031 real (no SQL, no deploy).

- List each configurable rule from `GET /api/settings`: **label · current value · default · overridden?**.
- **Edit** a value with validation (show the **unit** — days vs minutes; reject out-of-bounds inline, matching the
  server's `parse`), then `PUT /api/settings/:key`. On a server 400, show the reason (never silently accept).
- **Reset to default** per rule (clear the override).
- Make it obvious when a value is the coded **default** vs a live **override**.

At go-live the list has two rows (teacher-change notice, check-in window); the page must render whatever
`GET /api/settings` returns, so a third rule appears with no FE change.

## Definition of Done
- [x] A staff user changes the teacher-change notice to 5 days and REQ-030 enforces it with no deploy (AC). *(FE: edits
      via `PUT /settings/:key`; enforcement is REQ-030 BE, verified DONE. Live behaviour → QA on sid.)*
- [x] Editing the check-in window changes behaviour; reset-to-default restores the coded value. *(Reset calls the
      TASK-122 `DELETE /settings/:key` → row returns `isOverridden:false, value:default`.)*
- [x] A rejected value shows the server's reason; default vs override is visually clear.
- [x] The page renders from the API list (a new rule needs no FE change).
- [x] tsc clean; build ok. Measure any shared-row inputs at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes (@Fern)
Layered types/service/mock/hook/page against the frozen contract — `GET /settings` →
`{key,label,unit,value,default,isOverridden}[]`, `PUT /settings/:key {value}` → updated row (400 + Thai reason on a
bad value), `DELETE /settings/:key` (TASK-122) → row resolved to the coded default (`isOverridden:false`).
- **Types** `types/app/settings` `SettingRow`. **Service** `settings.service.ts` (`getSettings`/`updateSetting`/
  `resetSetting`, paths `/settings`, `/settings/:key`) + **mock** mirroring the BE registry (the two go-live rules +
  their bounds 0–30 / 0–240) so list/edit-validation/reset all work offline. **Hooks** `useSettings`/
  `useUpdateSetting`/`useResetSetting` (invalidate `["settings"]`).
- **Screen** `partials/Settings/SettingsContent.tsx` + route `app/(admin)/scheduler/settings/page.tsx` +
  **nav entry** (`AdminLayout.config` `nav.settings`, Settings2 icon). Route auto-guarded by the existing
  `/scheduler/:path*` proxy — no proxy change.
- **Renders from the API list** — one Card per row, so a 3rd rule appears with **zero FE change** (AC). Each card:
  label · current value+unit · default+unit · an **Override (orange) / Default (gray) badge** so the state is
  unmistakable. **Edit** = inline `NumberInput` + Save/Cancel; a rejected value shows the **server's exact reason** in a
  red Alert (never silently accepted). **Reset to default** (shown only when overridden) → confirm Modal → `DELETE`;
  the response's `isOverridden:false` flips the badge with no manual refetch. Notify on save/reset.
- **STANDING RULE:** the only input is a single full-width-capped `NumberInput` that stacks under its card — no
  shared-row control that needs 1600/1280/768/375 measurement.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok (`/scheduler/settings` generated).

## Questions / flags
- Mock labels are English (mock-only); the real `GET /settings` returns the BE registry's (Thai) labels — the screen
  renders whatever the API sends, no FE copy of the labels. Live render (auth-gated) → QA.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-102 | scheduler-front (FE): Settings screen — list rules (value/default/override) · edit-with-validation · reset-to-default. The load-bearing half of REQ-031 | SPEC-029 | ✅ **DONE** (SA-reviewed 2026-08-11 — tsc 0 reproduced; renders from the API list (`rows.map` → 3rd-rule-no-FE-change holds), override/default badge, edit→PUT w/ server reason, reset-only-when-overridden→confirm→`api.delete` (TASK-122), both mutations invalidate `SETTINGS_KEY` → badge auto-flips, min=0 only (server is bound authority). **REQ-031 fully SA-reviewed: 101+122+102.**) · (Fern 2026-08-04 — tsc 0 · build ok, `/scheduler/settings` route generated. New nav entry + page; renders from `GET /settings` (one Card/rule → a 3rd rule needs **zero FE change**), Override/Default badge, inline `NumberInput` edit → `PUT` (server's Thai reject reason shown in a red Alert, never silent), **Reset** (only when overridden) → confirm → TASK-122 `DELETE` → `isOverridden:false` flips the badge. types/service/mock(mirrors registry bounds 0–30/0–240)/hooks. STANDING RULE n/a (single stacked NumberInput). Live render → QA) | Fern | TASK-101 ✅, TASK-122 ✅ |
```
