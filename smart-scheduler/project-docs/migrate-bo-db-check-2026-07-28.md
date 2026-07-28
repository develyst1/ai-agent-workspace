# `migrate:bo` DB-config DATA REQUEST result (2026-07-28)

> Answer to Sober's [18:02] DATA REQUEST. Stakeholder ran the checks; Porter transcribed.
> **Credentials redacted** (the DB user/password/host are NOT recorded here).

## What was checked
`backoffice-back` `DATABASE_URL` + `to_regclass(...)` on the DB it connects to.

## Result
- **`DATABASE_URL` → database `smart_scheduler`** — i.e. the **CORRECT shared DB** (not the old
  `smart_backoffice_db`). (host + credentials redacted.)
- `to_regclass` on `smart_scheduler`:
  | object | exists? |
  |--------|---------|
  | `public.freelance_budgets` | ✅ yes |
  | `bo.item` | ✅ yes |
  | `ops.catalog_items` | ⚠️ **YES (non-null)** |

## Conclusion — the "wrong DB" hypothesis is DISPROVEN
The config is correct (`smart_scheduler`), **but `ops.catalog_items` DOES exist in the shared DB** and is
**drifted** (missing `item_group`, `0001_item_pl` not applied). So `opsSchemaPresent()` returns true → the
ops-copy pass runs → 42703. Sober's expectation ("`ops.catalog_items` null on the correct DB") does not hold —
the shared DB has a leftover, drifted `ops` shell.

**⇒ Fix is NOT a repoint.** The real fix is **TASK-030** (harden `migrate:bo` to skip/degrade on a drifted
`ops` schema and always run the essential `public.freelance_budgets` pass). Faster alternative (needs Sober's
OK that it's an empty/safe leftover): drop the drifted `ops` schema in `smart_scheduler` so the guard skips it.
