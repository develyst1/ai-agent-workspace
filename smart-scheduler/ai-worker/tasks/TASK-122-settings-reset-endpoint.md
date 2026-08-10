# TASK-122: scheduling (BE) — `DELETE /api/settings/:key` (true reset-to-default, clears the override row)

- Source: SPEC-029 (REQ-031 settings) — surfaced by @Fern while scoping TASK-102 (Settings FE reset-to-default)
- Status: DONE ✅ (SA-reviewed 2026-08-04 — tsc 0 · settings 9/9 reproduced; `resetSetting` deletes the row (test asserts delete, not PUT-the-default), returns coded default + `isOverridden:false`, route `isSettingKey`-guarded, idempotent. Unblocks TASK-102.)
- Depends on: — (extends the delivered settings service)
- Assignee: @Jason (smart-scheduler-back)

## Why (the gap Fern found)
The Settings screen's DoD includes **"reset-to-default per rule (clear the override)"** with **"default vs override
visually clear"**. But the delivered BE exposes only `GET /api/settings` + `PUT /api/settings/:key`, and `setSetting`
always **upserts** (`onConflictDoUpdate`, `settings.service.ts:30`) → it can only ever return `isOverridden: true`.
So a "reset" done as *PUT the default value* leaves an **override row equal to the default** — `isOverridden` stays
`true`, and the "default vs override is clear" DoD **cannot be met honestly**. A real reset must **remove** the row.

## What to build
**`DELETE /api/settings/:key`** — delete the override row for `key`; the resolver then returns the **coded default**
with `isOverridden: false`.
- Route in `api.ts` beside the existing `.get/.put("/settings...")`; validate `key` via `isSettingKey` (400/404 on
  an unknown key, same guard the PUT path uses — don't create rows for junk keys).
- New `settings.service.ts` `resetSetting(key)` — `delete from appSettings where key = :key`. **Idempotent:** deleting
  a key with no override is a no-op success (already at default), not a 404.
- Return the same shape the GET/PUT rows use, now resolved to the default:
  `{ key, label, unit, value: <coded default>, default, isOverridden: false }` — so the FE can reflect the reset
  without a refetch.

## Definition of Done
- [ ] `DELETE /api/settings/:key` removes the override; a subsequent `GET /api/settings` shows that key with
      `isOverridden: false` and `value === default`.
- [ ] Deleting a key that has no override succeeds as a no-op (idempotent); an unknown key is rejected (`isSettingKey`).
- [ ] `bunx tsc --noEmit` clean; `bun test` green (resolver-returns-default-after-delete is the piece to unit-test).
- [ ] Unblocks FE TASK-102 (reset button calls DELETE, not PUT-the-default).
