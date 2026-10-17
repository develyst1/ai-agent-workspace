# TASK-819 — BE: **affected classes with child + program + booking id, and a leave list by teacher / past / range** (P3 + P5) (REQ-123 Phase 1) — @Jason (S ≈ 0.8 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

## Build
- **P3:** `leaveDayBookings` (`lib/teacher-leave.ts:80-85`) returns per class: **booking id, time, child name(s)** (DUO: both), **program, course or not, status**. It stays a read, the same rows as today.
- **P5:** `GET /teacher-leave-days` gains **`teacherId`** (optional) and allows a **past window** (`from` before today), still ≤ 92 days. Each item carries **`rangeId`** (TASK-817) and its classes in the P3 shape.
  - **Access:** today it is `read(["menu:calendar"])`. **Add `menu:teachers`** so the Teachers page can read it (`lib/route-access.ts`).
- **Cancel a whole future range (P4/P5):** if the front needs it, either one `DELETE …/range/:rangeId` (future days only, same predicate, one LINE) or the front loops the existing per-day DELETE. **Your call;** a new route means one more line of access + tests.
## Claim
back `src/lib/teacher-leave.ts` (`leaveDayBookings`, the list read) · `src/services/scheduler.service.ts` (the list service) · `src/validation.ts` (the list query) · `src/routes/api.ts` (the GET, + the range DELETE if chosen) · `src/lib/route-access.ts` (menus) · `src/types/contract.ts` · new tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-819 GREEN — class detail (P3) + the leave list (P5) + the range lift. Back only, nothing committed.
**P3 — each class says WHO and WHAT** (`leaveDayBookings`, one select, same filter/order): the six original keys untouched + `childName · childNickname · coChildName · coChildNickname` (DUO: both) · `program` · `title` (อื่นๆ rows) · `inCourse`. Columns are correlated sub-selects (no joins), flat, rows passed through. Every record answer (single day, range) and every list item carries them (they all come from THE one reader). *(Naming note: `child…`, not `student…`, so the `studentName:` census in `line-notices-both-names-req095-13` — which is about LINE payloads — is untouched.)*
**P5 — the list** `GET /teacher-leave-days?from&to&teacherId`: optional `teacherId` (uuid) · a PAST window is passed through to the query as asked (never clamped; still ≤ 92 days) · each item `{ teacherId, teacherName, date, reason, createdBy, rangeId, bookings[] }` (`rangeId` null = single-day record) · readable from **`menu:calendar` OR `menu:teachers`**.
**Range lift — `DELETE /api/teacher-leave-ranges/:id`** (your OK): lifts ONLY the FUTURE days of the record (THE predicate `isAdvanceLeave`, once, in the lib); days that have begun or passed stay and are **reported as `kept`**. Answer `{ rangeId, lifted: [dates], kept: [dates], teacherNotified }`. **ONE `teacher_leave_lifted` LINE** for the lifted span (date + `to`), only on behalf, none when nothing lifted. Nothing left to lift ⇒ **400 with the approved future-only refusal**; unknown range ⇒ the approved 404. Access: the SAME key as the per-day lift (`action:calendar.status`) with menus calendar/bookings/**teachers** (the panel lives on the Teachers page). Own noun + existing `:id` param name ⇒ cannot be shadowed, no new param-census entry. ⚠️ **For you/Fern:** the per-day lift `DELETE /teacher-leave-days/:teacherId/:date` (TASK-814) still has menus calendar/bookings only — a Teachers-page-only admin gets 403 on a single day. Not in my claim; say if you want it widened.
**Contract:** `LeaveClassDTO` · `RecordedLeaveDayDTO` · `RecordedLeaveListResponse` · `RecordLeaveRangeResponse` (817's answer, which had no type) · `LiftLeaveRangeResponse`.
**The 4 granted pin edits (nothing else in those files):** `admin-leave-future-only-task648.test.ts:106` 4→5 + comment · `teacher-leave-admin-list-task587.test.ts:68` menus `["menu:calendar","menu:teachers"]` · `teacher-leave-day-task561.test.ts:148` + third `"delete:teacherLeaveDays"` · `course-ended-writes.test.ts` VERDICT + `"DELETE /teacher-leave-ranges/:id": "unrelated"`.
**Condition on #1 shown:** G8 (the range lift's `isAdvanceLeave` swapped for a hand-written compare) run against the **TASK-648 test ALONE** (one-off set, deleted): `G8 BITES (8 pass / 1 fail vs baseline 9)`; the 648 file is now in the 819 set's `tests`.
**Set 819: 14/14 BITE** (G1 DUO child reads wrong id · G2 inCourse flipped · G3 teacher filter dropped · G4 rangeId missing · G5 past window clamped · G6 Teachers menu off · G7 lift deletes every day · G8 hand-written compare · G9 one LINE per day · G10 told when nothing lifted · G11 empty lift not refused · G12 action key lost · G13 delete forgets the range id · G14 wrong program column), baseline 47, CHECKSUM identical.
**tsc 0 · SAFE suite 4,801 pass / 0 fail, 354 files · unhandled-between-tests 0 · migrations 71 = 71.**
**`git status --short -uall` (back):** Phase-1 tree (813 committed): ` M` `_journal.json` · `schema.ts` · `line-i18n.ts` · `line-message.ts` · `migration-witness.ts` · `route-access.ts` · `teacher-leave.ts` · `api.ts` · `scheduler.service.ts` · `contract.ts` · `validation.ts` · `?? 0070_teacher_leave_range.sql` · `?? admin-lift-leave-future-only-task814.{test.ts,mutations.json}` · `?? leave-range-task817.{…}` · `?? leave-list-detail-task819.{…}` · `?? preview-flags-leave-week-task815.{…}` · + the ` M` `*.test.ts`: the 38 count-pin files, `admin-leave-future-only-task648`, and the 3 other 819 pin files above.
### 🆕 NEW WORDING — DRAFT, for the owner (nothing ships before approval)
| where | TH | EN |
|---|---|---|
| LINE to the teacher when an admin lifts a RANGE (`ob_tl_open_again_range`) — the single-day line `ob_tl_open_again` is untouched; the Date line reuses the existing label with a span «20-10-2026 – 24-10-2026» | ช่วงวันนั้นรับจองคาบกับคุณได้ตามปกติแล้ว | Bookings with you are open again on those days. |
Everything else reuses approved strings (the lifted title «LEAVE CANCELLED», «Recorded by», the approved 404 and the approved future-only refusal). No other new text.
▶️ **Ball: Sober — verify. That is Phase 1's back end (813 · 814 · 815 · 817 · 819) done; nothing left in my queue.**

---
## ✅ 2026-10-17 — @Sober: TASK-819 VERIFIED, with one XS follow-up (the per-day lift door + menu:teachers)
- **Clean copy** (`c1d90d8` + the whole Phase 1 back tree): tsc 0 · SAFE suite **4,801 / 0**, 354 files · unhandled 0 · set **14/14**.
  - G7 the range lift deleting days that have begun;
  - G13 the delete forgetting the range id;
  - G12 the action key lost.
- **Porter's condition:** G8 alone, then only the TASK-648 pin → **8 pass / 1 fail**.
- **The 4 granted pin edits, checked line by line:** exactly as granted, nothing else in those files.
  - The 648 count reads 3 → 5 against HEAD: 814's +1 and 819's +1.
- **Wording:** 1 DRAFT (`ob_tl_open_again_range`), collected in `COPY-DRAFT-REQ-123-phase1-2026-10-17.md`.
- **🔧 Your heads-up, ruled YES:** `DELETE /teacher-leave-days/:teacherId/:date` → `act([...CAL_BOOK, ...TEACHERS], "action:calendar.status")`, the same as the range lift. Fern's TASK-821 offers per-day Cancel on the Teachers page, and an admin with only the Teachers menu would get 403.
  - That is one line in `route-access.ts` (inside your claim) + a test (by value: menus-only-teachers → 200 on a future day).
  - **If an existing pin outside your claim turns red, stop and tell me** before touching it.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: the per-day lift now opens to the Teachers menu (TASK-819 follow-up) — DONE. Nothing committed.
- **`route-access.ts`:** `"DELETE /teacher-leave-days/:teacherId/:date": act([...CAL_BOOK, ...TEACHERS], "action:calendar.status")` — identical to the range lift (a test pins the two equal).
- **By value (my 819 test file):** a Teachers-menu viewer WITH `action:calendar.status` lifts a future day (200); the menu without the key ⇒ 403; the key without the Teachers/calendar/bookings menu ⇒ 403.
- **The granted pin split (`admin-records-teacher-leave-task608.test.ts`, that one loop only):** POST keeps `[calendar, bookings]`; DELETE expects `[calendar, bookings, teachers]`; both still assert `action:calendar.status`; comment `🔻 TASK-819 follow-up`.
- **Set 819: 15/15 BITE** (new G15 = the per-day lift loses the Teachers menu; it fails 3, incl. the 608 pin), baseline 62 (the set's `tests` now also run the 608 file), CHECKSUM identical.
- **tsc 0 · SAFE suite 4,803 pass / 0 fail, 354 files · unhandled-between-tests 0 · migrations 71 = 71.** `git status`: the same Phase-1 tree as in the 819 report + `admin-records-teacher-leave-task608.test.ts` (` M`).
- Standing rule noted: Team A's own test pins that a granted change turns red are ruled by you first (I stop, you rule, I edit); cross-team and non-test files still go to Porter.
▶️ **Ball: Sober — queue empty until the combined run.**

## ✅ 2026-10-17 — @Sober: the TASK-819 follow-up VERIFIED. **Phase 1 back end COMPLETE** (813 · 814 · 815 · 817 · 819)
- **Per-day lift:** `act([...CAL_BOOK, ...TEACHERS], "action:calendar.status")`, identical to the range lift.
- **The TASK-608 pin split is exactly as Porter granted:** POST `[calendar, bookings]`, DELETE `+ teachers`, the status key asserted on both.
- **Clean copy of the whole back tree:** tsc 0 · SAFE suite **4,803 / 0** · unhandled 0 · set **15/15** (G15 = the per-day lift loses the Teachers menu) · G8 alone still bites the 648 pin.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: Phase 1 markers flipped to APPROVED, sets re-run, FULL git status below. 🧊 FREEZING now.
**Flipped (comments only, no word changes), verbatim marker «✅ APPROVED by the owner 2026-10-17 (REQ-123 Phase 1), COPY-REVIEW-2026-09-29.md, verbatim»:** `line-i18n.ts` (`ob_tl_blocked_range` TASK-817 · `ob_tl_open_again_range` TASK-819) · `line-message.ts` (the range Date-span/«those days» comment) · `teacher-leave.ts` (the writer backstop `ช่วงวันลาไม่ถูกต้อง`; and the 31-day constant now «owner-approved 2026-10-17», no longer «a draft limit») · `validation.ts` (the two refusals + «31 วัน A») · the 817 test title. Older DRAFT markers (camp/voucher/parent: line-i18n 762/764 …) left exactly as they are.
**Mutations re-aimed/added so the APPROVED text and marker are guarded:** 817 set **F14** (a refusal text differs) · **F15** (backstop text differs) · **F16** (the APPROVED marker turned back into DRAFT) · 819 set **G16** (approved Thai of the range open-again line differs) · **G17** (its marker back to DRAFT) · 814's D6 already guarded the approved lift text. New verbatim pins: both refusals, the backstop, the open-again-range line, "no Phase-1 DRAFT marker left".
### ⚠️ One real defect found and fixed while pinning the approved refusals (in my 817 claim, `validation.ts`)
`adminTeacherLeaveBody` was a **`z.union`** of the range and single schemas. In zod 4 a union reports ONE generic `Invalid input`, so **the owner's two approved refusal sentences would never have reached the admin** (my earlier test passed only because it read inside the union). It is now **one object + `superRefine` + `transform`** (same accepted bodies, same parsed output `{teacherId, date: from, to, reason}` for a range / the single-day shape unchanged, ambiguous bodies still 400). A root-app test now proves the 400's `details[].message` carries «วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม» and «ลาล่วงหน้าได้ไม่เกิน 31 วันต่อครั้ง». F8/F9/F10 re-aimed to the new schema text.
**Sets on the final tree (every one CHECKSUM identical):** 813 **8/8** · 814 **7/7** · 815 **6/6** · 817 **16/16** · 819 **17/17**.
**tsc 0 · SAFE suite 4,808 pass / 0 fail, 354 files · unhandled-between-tests 0 · migrations 71 = 71.**
**`git status --short -uall` (back) — 63 lines, also saved verbatim as `smart-scheduler/ai-worker/GIT-STATUS-back-phase1-2026-10-17.txt`:**
- ` M` non-test (13): `drizzle/meta/_journal.json` · `src/db/schema.ts` · `src/lib/line-i18n.ts` · `src/lib/line-message.ts` · `src/lib/migration-witness.ts` · `src/lib/route-access.ts` · `src/lib/teacher-leave.ts` · `src/routes/api.ts` · `src/services/scheduler.service.ts` · `src/types/contract.ts` · `src/validation.ts` (11 — plus the two below are tests) 
- ` M` test files (41): the 38 count-pin files (70→71) + `admin-leave-future-only-task648` · `admin-records-teacher-leave-task608` · `teacher-leave-admin-list-task587` · `teacher-leave-day-task561` · `course-ended-writes` · `subject-kind-req095-13-4a` (805's, if not yet committed) — exactly the list in the file.
- `??` (9): `drizzle/0070_teacher_leave_range.sql` · `admin-lift-leave-future-only-task814.{test.ts,mutations.json}` · `leave-range-task817.{…}` · `leave-list-detail-task819.{…}` · `preview-flags-leave-week-task815.{…}`.
*(Counts in this list are my reading of the file; the file is the authority — please build the commit list from it.)*
🧊 **FROZEN: I save nothing in `smart-scheduler-back` until you write «unfrozen» in `inbox/BE.md`.**
