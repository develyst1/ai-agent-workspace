# TASK-101: scheduling (BE) — settings mechanism (registry + resolver + API) + wire the two go-live rules
- Source: SPEC-029 (REQ-031)
- Status: TODO — first-cut scope CONFIRMED by owner (2026-08-03, via Porter): the mechanism + exactly these two keys
- Depends on: — (TASK-094 consumes the resolved teacher-change value, but this task doesn't depend on it)
- Assignee: @Jason (smart-scheduler-back)

## What to build
Defaults in code, **overrides** in `app_settings` (`key text PK, value jsonb` — `schema.ts:399`), pure functions
stay pure. Mirror the `lib/line-admin.ts` read / `onConflictDoUpdate` write pattern.

1. **`lib/settings.ts` (pure)** — a small explicit registry (NOT a framework): `Record<key, { default, parse(raw)
   → value | null, unit, label, bounds }>` for the two go-live keys:
   - `teacher_change_notice_days` — default **3**, integer ≥ 0 (bound e.g. ≤ 30).
   - `checkin_early_minutes` — default **30**, integer ≥ 0 (bound e.g. ≤ 240).
   Plus pure **`resolveSetting(key, rawFromDb) → { value, isDefault, reason? }`**: parsed override, else the coded
   default with `isDefault: true` + a reason (missing/malformed → default, **never** zero/null; AC #4).
2. **Edge service** `getSetting(key)` (reads the `app_settings` row, calls `resolveSetting`) + `setSetting(key,
   value)` (validate via `parse`; **reject malformed with the reason**; upsert jsonb via `onConflictDoUpdate`).
   The DB read lives here, not in `lib/`.
3. **API** — `GET /api/settings` → the rules with `{ key, label, unit, value, default, isOverridden }`;
   `PUT /api/settings/:key` → validate + upsert, 400 with the reason on malformed.
4. **Wire the two rules through the edge:**
   - **Check-in window:** refactor `isWithinCheckinWindow` (`lib/checkin.ts`) to take `earlyMinutes =
     CHECKIN_EARLY_MINUTES` as a param; the check-in service resolves `checkin_early_minutes` and passes it. Keep
     the function pure. (Also thread `checkinWindowMessage` if it hardcodes the 30.)
   - **Teacher-change notice:** register the key + default; the value is consumed by TASK-094's
     `hasEnoughTeacherChangeNotice(..., noticeDays)` at the `applyPlanChange` call site. **This task does not
     enforce it — it provides the resolved value** (no double-wiring with REQ-030).

## Definition of Done
- [ ] `resolveSetting` pure + tested: valid override parsed; missing → default `isDefault:true`; malformed →
      default + reason (never zero/null).
- [ ] `PUT /api/settings/checkin_early_minutes` to a new value changes check-in behaviour with **no deploy**;
      a corrupt value falls back to 30 and the system keeps working (AC).
- [ ] `isWithinCheckinWindow` takes `earlyMinutes`; nothing in `lib/` reads the DB.
- [ ] Adding a third rule later = one registry entry, **no schema change** (AC).
- [ ] `bunx tsc --noEmit` clean; `bun test` green.

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (code-verified). Read `settings.ts` + `settings.service.ts` + the two wiring
points; ran the suite: **tsc 0 · 429/0**.
- **`resolveSetting` is the load-bearing bit and it's exactly AC #4** — no override → default+`isDefault`+reason;
  **malformed → default+reason (never zero/null/"no rule")**; valid → parsed. `intInRange` accepts number/numeric-
  string only, bounds-checked (0–30 / 0–240). `isSettingKey` is `hasOwnProperty`-based (proto-safe — nice).
- **`settings.service` is the only DB edge** — `setSetting` validates via the registry `parse` and **400s malformed
  with a Thai reason** (never writes junk); `onConflictDoUpdate` upsert (line-admin pattern). Nothing in `lib/` reads
  the DB.
- **Wiring, values read at ACTION time (AC #5):** `isWithinCheckinWindow`/`checkinWindowMessage` take `earlyMinutes`
  (pure, default the constant); both check-in paths resolve `checkin_early_minutes`. `applyPlanChange` resolves
  `teacher_change_notice_days` **in-tx** and passes it to TASK-094's pure fn (`:1495-1497`) — **no double-wire**,
  the exact SPEC-029/REQ-030 seam.
- **Scope held** — exactly the two go-live keys; the other six stay constants. Adding a 3rd = one registry entry.
**DONE — unblocks TASK-102 (FE settings screen).**
