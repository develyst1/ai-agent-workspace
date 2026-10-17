# TASK-817 — BE: **record an advance leave as a DATE RANGE with one reason** (P2) (REQ-123 Phase 1) — @Jason (M ≈ 1.1 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

## Build
- **The admin door** `POST /teacher-leave-days` also accepts **`{ teacherId, from, to, reason }`**. The single-day body stays valid.
  - Every day must be future (`isAdvanceLeave`, at the door, as TASK-648).
  - `from ≤ to`; **at most 31 days** (a draft limit: say if a different one reads better).
- **One record, many days:** one row per day in `teacher_leave_days`, all sharing a new nullable **`range_id`** (additive migration `0070` — corrected from 0071 by @Sober, 10-17: Journal 70 → 71 — a witness entry). This lets the front show and cancel "this leave" as one thing.
  - 📌 This is my design decision, and it can be overturned at review: deriving ranges from consecutive dates + reason would be fragile.
- **Days already recorded** are skipped, not refused, and reported back.
- **One transaction.** The answer gives **per day** the live classes (the same list as today) + which days were new / already there.
- **One LINE to the teacher for the whole range**, not one per day. Reuse `teacher_leave_recorded` if its wording fits a range. If not, the new wording is a DRAFT.
- **Unchanged:** the teacher's own door stays one day (`/teachers/me/leave`); the record act's fork; the lift.
## Claim
back `src/routes/api.ts` (the POST door) · `src/validation.ts` (`adminTeacherLeave`) · `src/lib/teacher-leave.ts` (the range writer) · `src/services/scheduler.service.ts` (`reportTeacherLeave` admin path) · `src/db/schema.ts` (+ `range_id`) · `drizzle/0070_…sql` + its journal entry · the migration-count pins 70 → 71 (granted 10-17, TASK-800 convention) · `src/lib/migration-witness.ts` (one entry) · `src/lib/line-message.ts` / `line-i18n.ts` **only if** a range wording is needed (DRAFT) · new tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-817 GREEN — a leave over a DATE RANGE, one reason, one `range_id`, migration **0070** (per your correction). Back only, nothing committed.
**Contract (for Fern):** `POST /api/teacher-leave-days` takes EITHER the single-day body (unchanged) OR **`{ teacherId, from, to, reason }`**. Ambiguous bodies are 400 (`date` + `from`/`to`; a range with `sessionIds`; `from` without `to`). `from ≤ to`, **≤ 31 days** (`MAX_LEAVE_RANGE_DAYS`, one constant). The future-only guard is the **same single line** TASK-648 put on that door: a parsed range carries its FIRST day as `date`, so a range that starts today/past is refused with the same `ADMIN_LEAVE_FUTURE_ONLY` text.
**Answer for a range** `200 { mode: "advance-range", rangeId (null if every day was already there), from, to, recordedDays, alreadyRecordedDays, teacherNotified, cancelled: 0, bookingIds: [], familiesNotified: 0, days: [{ date, alreadyRecorded, bookings: [the same list as the single-day answer] }] }`.
**What it does:** ONE `db.transaction`, one `teacher_leave_days` row per day written through THE day writer (`recordAdvanceLeave` — the one future-only check; it now takes an optional `rangeId`), all new rows sharing one uuid. Days already recorded are **skipped** (their own reason/author/range untouched) and reported. **ONE LINE to the teacher** for the whole range (`teacher_leave_recorded` carries `to`; only on behalf; not when every day was already there). Nothing cancelled, no family told. **A single-day record is written exactly as before** (`range_id` stays NULL — no key in the insert; the TASK-608 value pin passes untouched).
**Migration `0070_teacher_leave_range.sql`:** `ALTER TABLE "teacher_leave_days" ADD COLUMN IF NOT EXISTS "range_id" uuid;` — nullable, no data written, no index (small table); journal idx 70 (`when 1783000000066`); witness probes the column; schema `rangeId: uuid("range_id")`. **Journal 71 = 71 files.**
**Files (claim):** `src/routes/api.ts` (one token: `v.adminTeacherLeaveBody`) · `src/validation.ts` (`adminTeacherLeaveRange`, `adminTeacherLeaveBody`, `MAX_LEAVE_RANGE_DAYS`; `adminTeacherLeave` itself untouched) · `src/lib/teacher-leave.ts` (`recordAdvanceLeaveRange` + rangeId on the day writer) · `src/services/scheduler.service.ts` (`reportTeacherLeaveRange` ABOVE the act + a `to` branch before the fork — the act still forks ONCE, its `isAdvanceLeave(` count is still 1) · `src/db/schema.ts` · `drizzle/0070…sql` + journal · `src/lib/migration-witness.ts` · `src/lib/line-message.ts` + `line-i18n.ts` (the range wording, below) · NEW `src/lib/leave-range-task817.test.ts` (19) + `…mutations.json` (13).
**Count pins (your grant):** **63 lines in 38 files bumped 70 → 71**, value + comment `· 🔻 TASK-817: +0070`, nothing else — the full file:line list is in `smart-scheduler/ai-worker/CHECK-TASK-817-count-pins-bumped-2026-10-17.txt`. (`git status` shows 39 modified `*.test.ts`: those 38 + `admin-leave-future-only-task648.test.ts`, TASK-814's grant.)
**Proofs:** set 817 **13/13 BITE** (F1 each day its own range id · F2 id not stored · F3 single-day row gets `rangeId: null` · F4 already-recorded refused · F5 one LINE per day · F6 told again when all existed · F7 no transaction (a failing day 3 leaves days 1–2) · F8 no 31-day limit · F9 the door reads the LAST day (a past start slips through) · F10 ambiguous body accepted · F11 lift notice shows a span · F12 range blocked line never used · F13 last day dropped), baseline 41, CHECKSUM identical. A real find by the test: my first draft showed the span on the LIFT notice too — fixed (`recorded && …`).
**tsc 0 · SAFE suite 4,778 pass / 0 fail, 353 files · unhandled-between-tests 0 · migrations 71 = 71.**
**`git status --short -uall` (back):** the Phase-1 tree so far: 814's + 815's files · ` M` `_journal.json` · `schema.ts` · `line-i18n.ts` · `line-message.ts` · `migration-witness.ts` · `teacher-leave.ts` · `api.ts` · `scheduler.service.ts` · `contract.ts` · `validation.ts` · `?? 0070_teacher_leave_range.sql` · `?? leave-range-task817.{test.ts,mutations.json}` · + the 39 `*.test.ts` above.
### 🆕 NEW WORDING — DRAFT, for the owner (nothing ships before approval)
| where | TH | EN |
|---|---|---|
| LINE to the teacher, blocked line, RANGE (`ob_tl_blocked_range`) — used when the notice covers more than one day; the single-day line `ob_tl_blocked` is untouched | ช่วงวันนั้นจะไม่มีการจองคาบใหม่กับคุณ | No new class will be booked on those days. |
| the same LINE, Date line for a range (no new key; the label stays «Date») | Date: 20-10-2026 – 24-10-2026 | Date: 20-10-2026 – 24-10-2026 |
| door refusal, `to` before `from` (zod message) | วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม | The end date can't be before the start date |
| door refusal, more than 31 days (zod message) | ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง | A leave can cover at most 31 days at a time |
| writer backstop (unreachable through the door), `ช่วงวันลาไม่ถูกต้อง` | ช่วงวันลาไม่ถูกต้อง | The leave range is not valid |
Everything else reuses approved strings (`teacher_leave_recorded` title, «classes still on» line, «Recorded by», the future-only refusal). The 31-day limit is a draft number — say if a different one reads better.
▶️ **Ball: Sober — verify. TASK-819 next, on your word.**

---
## ✅ 2026-10-17 — @Sober: TASK-817 VERIFIED (its wording is DRAFT, collected in `COPY-DRAFT-REQ-123-phase1-2026-10-17.md`)
- **Clean copy** (`c1d90d8` + the whole tree: 814 + 815 + 817): tsc 0 · SAFE suite **4,778 / 0**, 353 files · unhandled 0 · set **13/13** (incl. F7 no transaction, F9 a past start slipping through, F13 off-by-one) · **71 migration files = journal 71**.
- **Migration `0070`:** one `ADD COLUMN IF NOT EXISTS "range_id" uuid`, nullable, no data written, rerunnable; the witness probes it.
- **Count pins, checked by me:** 38 files, **63 lines changed in each direction**, and **every changed line is a 70 → 71 pin or its `TASK-817` comment.** Nothing else touched.
- **Diff read:**
  - the range rides THE day writer (one future-only check);
  - one tx; already-recorded days skipped and reported;
  - the door's TASK-648 line reads the FIRST day;
  - single-day records are byte-identical to before (no `rangeId` key);
  - one LINE per range.
