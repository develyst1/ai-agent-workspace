# TASK-027: backoffice-back — permanent shared-DB topology fix (`bo` in `smart_scheduler`)
- Source: SPEC-006 (acceptance fix — DB-topology assumption)
- Status: DONE
- Depends on: TASK-021 (schema), TASK-025 (migration)
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## Why
Acceptance found the deploy used **2 separate databases** — scheduling on `smart_scheduler`, backoffice-back
on `smart_backoffice_db` (legacy ops-era config). So `bo` was created in the wrong DB, `migrate:bo` couldn't
see `public.freelance_budgets`, and scheduling crashed on `bo.item`. The design always required `bo` + `public`
in **one** DB (`smart_scheduler`); the fix makes the backoffice-back point there permanently. (Staging → fix-forward.)

## What to do
1. **`.env.example` (backoffice-back):** `DATABASE_URL` → **`…/smart_scheduler`** (the shared scheduling DB where
   `public` + `bo` live), **not** `smart_backoffice_db`. Add a comment: *"backoffice-back shares the scheduling
   database — `bo.*` lives alongside `public.*` in `smart_scheduler`; do NOT use a separate DB (breaks the
   shared-DB/in-tx design)."* Update any config default that hard-codes the old DB name.
2. **`migrate-to-bo.ts` — make the `ops.*` passes optional.** After repointing to `smart_scheduler`, `ops.*`
   won't exist there. Guard each ops pass (catalog_items / stock_movements / recurring_costs) so it **skips
   cleanly if the `ops` schema/tables are absent** (existence check or try/catch → log "ops.* not present,
   skipping"). The **`public.freelance_budgets` → `bo.item`** pass (raw SQL) is the essential one and must run.
   Result: `bun run migrate:bo` works against `smart_scheduler` (public + bo, no ops).
3. **Retire the now-unreachable `ops.*` routes.** With backoffice-back on `smart_scheduler` (no `ops.*` tables),
   the still-mounted ops routes (`/catalog/items`, `/reports/pl`, `/parties`, `/recurring-costs`, …) would 500.
   **Unmount them** (the ops-retirement we'd deferred, now forced). Keep only `/api/v1/bo/*` + `/auth`. Leave the
   ops service/route files dormant/unimported (delete in a later cleanup).
   - ⚠️ **Flag (for @Porter, follow-up):** scheduling-back's day-end `recordSale` → ops `/catalog/items/by-ref/
     movements` becomes a no-op once ops is gone (it's best-effort, won't crash). **Trial/single revenue no longer
     posts** until revenue is re-homed to a `bo.item` — a follow-up REQ (same bucket as FT/PT salary → bo).

## Definition of Done
- [ ] backoffice-back `.env.example` (+ any config default) uses `smart_scheduler`; comment documents the
      shared-DB requirement.
- [ ] `migrate-to-bo.ts` runs with only `public` + `bo` present (ops.* absent) — freelance pass works, ops passes
      skip gracefully; re-run idempotent.
- [ ] ops routes unmounted; app boots on `smart_scheduler` serving `/bo/*` + `/auth` with no ops.* dependency.
- [ ] `bun test` + `bunx tsc --noEmit` clean.

## Implementation Notes
Repo: `smart-scheduler-backoffice-back`. Fix-forward to the shared-DB topology the design always required.

1. **`.env.example`** — `DATABASE_URL` → `…/smart_scheduler` (was `smart_backoffice_db`) + a comment: the
   backoffice shares the scheduling DB (`bo.*` co-located with `public.*`); a separate DB breaks the shared-DB /
   in-tx design and `migrate:bo` (needs to see `public.freelance_budgets`). No hard-coded DB-name defaults exist
   elsewhere (DB name only comes from `DATABASE_URL`).
2. **`migrate-to-bo.ts` — ops passes now optional.** Added `opsSchemaPresent()` (checks `information_schema`
   for `ops.catalog_items`); `main()` runs the three ops passes only if present, else logs "ops.* not present —
   skipping" — the **`public.freelance_budgets → bo.item`** pass always runs. So `bun run migrate:bo` works on
   `smart_scheduler` (public + bo, no ops) and stays idempotent.
3. **Ops routes retired (`routes/api.ts`)** — `v1` now mounts **only `/auth` + `/bo`**. Removed the mounts +
   imports for catalog/commerce/parties/accounts/commercial/pricing/reports/recurring-costs/internal/
   teacher-sync (they'd 500 with no `ops.*` tables). The route/service files are left **dormant/unimported**
   (delete in a later cleanup, per the task).

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → **48 pass / 0 fail** (dormant ops files still typecheck; the
  teacher-sync/other tests build their own apps and pass). ⚠️ App boot on `smart_scheduler` + running the
  migration are DB-runtime — verified by inspection (brownfield). The staging DB fix itself (create `bo` in
  `smart_scheduler`, repoint DATABASE_URL, restart, re-run migrate, re-enter budgets) is the human/Porter step.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Confirm the flagged follow-up:** with ops retired, scheduling-back's day-end `recordSale` → ops
  `/catalog/items/by-ref/movements` becomes a **no-op** (best-effort, won't crash), so **attended TRIAL/SINGLE
  revenue (TASK-007) stops posting** until it's re-homed to a `bo.item` — same follow-up bucket as FT/PT salary
  → bo. Logged for @Porter as a known REQ-006-followup gap; nothing to fix in this task. OK?
  > answer (Sober): **Confirmed — correct, and it's a follow-up REQ, not a fix here.** With ops retired,
  > `recordSale`→ops is a no-op (best-effort, no crash), so attended TRIAL/SINGLE revenue stops posting until
  > it's re-homed to a `bo.item`. Same bucket as FT/PT salary → bo. Flagged to Porter as a REQ-006 follow-up.
- **Also unmount `/internal/teacher-sync`?** I did (it's ops-party-backed and REQ-003 is ON HOLD/undeployed).
  Confirm — if the REQ-003 rework later needs a machine sync surface, it'll be rebuilt on `bo`, not the old ops one.
  > answer (Sober): **Confirmed — unmount it.** REQ-003 is ON HOLD and **undeployed**, so nothing live calls
  > teacher-sync → retiring it breaks no live feature. The "teacher CRUD not standalone" gap (scheduling's
  > blocking `onboardOpsTeacher`/etc. calls) stays a **prereq for eventually deploying REQ-003**, not for this
  > REQ-006 deploy — unchanged from what the board already tracks. A future REQ-003 rework rebuilds any sync on `bo`.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **48 pass / 0 fail**, `tsc` 0.
Verified the three parts of the fix:
- **`.env.example` `DATABASE_URL` → `smart_scheduler`** (was `smart_backoffice_db`) with the shared-DB comment;
  no other hard-coded DB-name default. ✓ (Restores the design's intended single-DB topology.)
- **`migrate-to-bo.ts` ops-optional:** `opsSchemaPresent()` (checks `information_schema` for `ops.catalog_items`)
  gates the three ops passes; **`migrateFreelanceBudgets()` runs unconditionally** → the migration works against
  `smart_scheduler` (public + bo, no ops), stays idempotent. ✓
- **Ops routes retired:** `api.ts` `v1` now mounts **only `/auth` + `/bo`**; the catalog/commerce/parties/
  accounts/commercial/pricing/reports/recurring-costs/internal/teacher-sync mounts are removed (they'd 500 with
  no `ops.*`). Route/service files left dormant (delete in a later cleanup). ✓
App-boot + migration run are DB-runtime (brownfield) — the human/Porter staging step. No rework.
**REQ-006 acceptance-fix complete — the shared-DB topology is now permanent in the repo.**
