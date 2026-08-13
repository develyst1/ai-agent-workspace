# REQ-040 — Customer-prod pre-release data reset (clean slate, keep teachers + subjects + config)

- **Status:** READY_FOR_SA
- **Source:** Stakeholder (owner), 2026-08-11, in chat to Porter.
- **Env:** customer production — `frontoffice.develyst.online` / DB `smart_scheduler` on `154.197.124.29`.

## Why
The customer-prod deploy (REQ-038 essential set + backlog) landed today. The **prior version was not
production-ready, so the customer never actually used it** — the data currently in prod is **pre-release junk**
(e.g. empty leftover courses). Before real go-live the owner wants prod reset to a **clean slate**, keeping only the
master/config the branch has genuinely set up. Owner's words: *"ล้างข้อมูลทั้งหมด … มันมี course เดิมที่ไม่มีข้อมูลด้วย …
เก็บครู + วิชาไว้."*

## Scope (owner-confirmed: "keep teachers + subjects")
**KEEP (do not touch):**
- `teachers`, `subjects`, `teacher_subjects`
- `badge_types`, `badge_values`, `app_settings` (reference/config the app needs to run)
- the schema itself + all drizzle migration ledgers (`__drizzle_migrations`, `__drizzle_migrations_bo`,
  `__drizzle_migrations_scheduling`) — the DB must stay fully migrated at bo + scheduling@0017
- `bo.item` / `bo.movement` (bo schema — just created, expected empty)

**CLEAR (people + transactional records):**
- `students`, `parents`
- `course_packages`, `vouchers`, `bookings`, `booking_badges`
- `notification_outbox`, `line_link_sessions`, `teacher_link_requests`
- `freelance_budgets`, `job_runs`

*(Scope grounded by Porter against `smart-scheduler-back/src/db/schema.ts` — FK graph confirms no KEEP table
references a CLEAR table, so clearing the set cannot cascade into teachers/subjects/config. SA/BE to re-verify.)*

## Constraints (hard)
- **Brownfield:** no engineer/SA connects to prod. **Jason authors the script; the OWNER runs it** on the server,
  then reports the result up the chain. Porter does **not** author the SQL (this REQ replaces an ad-hoc `TRUNCATE`
  Porter wrongly drafted — retracted).
- **Safe + verifiable:** must not touch schema or the migration ledgers; respect FK order (or `TRUNCATE … CASCADE`);
  ideally transactional with a pre-`COMMIT` count check so the owner can `ROLLBACK` if the numbers look wrong.
- **Restore point exists:** GATE-0 backup `sm-prod-backup-2026-08-11T10-39-50-609Z.dump` holds the current data.
- **Sequencing:** this reset runs **before** QA. The owner will only tick Tanya **after** the reset is confirmed, so
  any later anomaly is attributable to QA's own self-created data, not to leftover records.

## Acceptance
After the owner runs the script:
1. `teachers` and `subjects` (+ `teacher_subjects`, badges config, `app_settings`) row counts **unchanged**.
2. Every CLEARED table = **0 rows**.
3. `db:verify` still GREEN on both ledgers (schema/migration state untouched); the app starts and the calendar/bookings
   pages load with no errors on the empty-but-configured DB.

## Questions
- (none open) — scope confirmed by owner. @Sober: spec the reset script + TASK for Jason; the deliverable is a
  script the owner runs (cmd.exe / `bun run …`-friendly on the Windows prod box), returned via Porter.
- **Sober's process flag (2026-08-11): explicit human authorization for a prod mass-delete.**
  > answer (Porter, on the record): **CONFIRMED — proceed.** Owner authorized directly, Human→Porter: *"ฉันสั่งเลย
  > ลบข้อมูลให้หน่อย … เก็บครู+วิชาไว้"* / *"ไปเลย เริ่มงาน ล้าง junk data ก่อน."* Safety model approved as Sober scoped
  > it: one txn · dry-run by default (count table + assert KEEP unchanged + ROLLBACK) · deletes only on `--commit` ·
  > explicit `DELETE` in restrict-FK order · schema + 3 ledgers untouched · GATE-0 dump is the restore point.

→ **@Sober** — authorization confirmed; cut **SPEC-036 + TASK-127** (Jason writes `db:reset`) → back to Porter.
