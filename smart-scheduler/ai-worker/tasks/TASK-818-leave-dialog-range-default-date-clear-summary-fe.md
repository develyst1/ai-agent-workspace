# TASK-818 — FE: **the leave dialog: a date range, a sensible default date, and a clear "what this will do" before saving** (P2 + P6 + P7) (REQ-123 Phase 1) — @Fern (M ≈ 1.5 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

One file family, `Calendar/Modal/ReportLeaveDialog.tsx`, so these three ship as one task. **Needs TASK-817** for the range body.
## Build
- **P2:** the admin door gets **From–To** (one reason). The result shows per day: its classes, new or already recorded.
- **P6:**
  - from the Teachers ⋮ menu the date starts **empty**;
  - from the calendar it starts at **the day being viewed**;
  - **never "tomorrow" by default.**
  - The calendar entry: a **"Record teacher leave"** button in `Calendar/CalendarHeader.tsx` (admin, `action:calendar.status`) that opens this dialog with the header's `date`. ⚠️ **That file needs Porter's claim** (see the claims list).
- **P7:** before saving, the dialog states plainly what will happen:
  - **future** → "only blocks the day(s); N class(es) stay for you to handle";
  - **today (teacher's own door)** → "cancels N class(es) and tells N famil(ies)".
  - The counts come from what the dialog already holds (the session list / ticks). No new BE call unless one is truly needed; tell me first.
## Claim
front `Calendar/Modal/ReportLeaveDialog.tsx` · `Teachers/TeacherRowActions.tsx` (default date) · `Calendar/CalendarHeader.tsx` (one button, **pending Porter**) · `hooks/scheduler/useScheduler.ts` + `services/scheduler.service.ts` (the range body) · `types/api/contract.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ @Fern — 2026-10-17 — TASK-818 FE DONE: a date range, a default date that is never "tomorrow", and "what saving will do". Nothing committed.
**What shipped (front):**
- **`Calendar/Modal/ReportLeaveDialog.tsx`** — **P2:** the admin door has an optional **To**; blank = the one day (body unchanged `{teacherId, date, reason}`), set = `{teacherId, from, to, reason}` (no `date`, no `sessionIds`). The range ANSWER (`mode: "advance-range"`) is read from the answer, before the one-day check, and shown PER DAY (new / already on record, each day's classes), with the two approved sentences (NOTHING CANCELLED; teacher told / not told / unknown = silent). **P6:** `initialDate=""` empty = nothing refused, the button waits; a new `pickTeacher` mode asks WHOSE leave (the calendar entry). **P7:** the teacher's own door says "only blocks the day, N class(es) stay" (N = the day's classes it loaded) or "cancels N class(es)" (N = the ticked); the admin door holds no count and its hint says so. The front copies no limit (the 31 days + its sentence are the server's).
- **`Calendar/Modal/LeaveTeacherPick.tsx`** (NEW) — the teacher choice (active teachers only). Its own file because TASK-406's pin lists the only data hooks `ReportLeaveDialog.tsx` may hold (a teacher-scoped session must never list teachers).
- **`Calendar/CalendarHeader.tsx`** — "Record teacher leave" (admin, `action:calendar.status`, not for a linked account) → opens the dialog on the day being viewed. **`Teachers/TeacherRowActions.tsx`** — date starts empty (unused `dayjs` import removed).
- `hooks/scheduler/useScheduler.ts` (range body type; the admin hook also refreshes the leave strip) · `services/scheduler.service.ts` (`AdminLeaveBody`; mock answers a range inline) · `types/api/contract.ts` (range answer fields) · `lib/i18n/dictionaries.ts` (10 DRAFT keys).
**Numbers:** `tsc` 0 · `bun test` **1217 pass / 0 fail** (136 files) · `bun run build` exit 0 · `unhandled-between-tests: 0` · new test `leave-range-task818.dom.test.tsx` (22) · **set 818: 27/27 BITE, CHECKSUM identical** (its `tests` = my file + `teacher-scope.test.ts` + `teacher-leave-row.dom.test.tsx`).
**Your required bites, all BITING:** B1 `leaveBody` built twice (own door) · B2 `teacherId` dropped from the range body · H1 default date back to a chosen one ("tomorrow" family) · B4 `refusedForAdmin` removed · B5 the cancel-warning guard reverted to `!subject` (fails my new test: calendar entry, admin, TODAY, no teacher picked ⇒ no cancel warning). Plus R1–R18 (range body, range answer read, labels, end dropped, empty date, picker, counts, per-day badge, teacher-told) and H2–H6 (header key / linked / date, strip refresh, DRAFT marker). Not mutated, with the reason in the set: the redundant `noDate`/`choosing` waits inside `submit` (the button is already disabled for both).
**Team A pins touched (all granted):** `teacher-scope.test.ts` §4: the admin `res` pin re-aimed (range = its own call beside the one-day call; the second pin of the one-day call stays VERBATIM; `leaveBody` still once) · `disabled=` + `noDate || choosing ||` · `{!advance && !subject && (` → `{!advance && !onBehalf && (` · §6 key count 31 → 41 + declared comment. `teacher-leave-row.dom.test.tsx` ×2 (empty date; picks a future day through the From picker before submitting; the wire assertion unchanged). ⚠️ **One more pin turned up that the grant did not name, and I did NOT touch it — I moved my code instead:** §4's "data hooks of the dialog file" list (`useCalendar · useReportOwnLeave · useReportTeacherLeave`) — my teacher picker needed `useTeachers`, so it lives in `LeaveTeacherPick.tsx`.
**Inventory line added to `action-gate.test.ts` for 818 (standing grant):** `"src/components/partials/Calendar/CalendarHeader.tsx → action:calendar.status"` (after `CalendarGrid.tsx → action:calendar.book`). Nothing else changed in that file.
### 🟡 DRAFT wording for the owner (10 keys; every one marked DRAFT in the dictionary; nothing ships before approval; all other strings reuse approved ones, incl. "Whose leave this is")
| key | TH | EN |
|---|---|---|
| `recordTeacherLeave` (button + dialog title before a teacher is chosen) | บันทึกการลาของครู | Record teacher leave |
| `dateTo` | ถึงวันที่ (ไม่ใส่ = วันเดียว) | To (optional — blank means just this day) |
| `adminRangeHint` ({name}, {n} days) | การบันทึกลาของครู {name} จะปิดการจองใหม่ตลอด {n} วัน คาบที่จองไว้แล้วในช่วงนั้นไม่ถูกยกเลิกและยังไม่มีการแจ้งครอบครัวใด — จะเห็นรายการคาบของแต่ละวันเมื่อบันทึกเสร็จ | Recording leave for {name} blocks all {n} days for new bookings. Classes already booked on those days are not cancelled and no family has been told anything — you will see the list for each day once the leave is recorded. |
| `adminSubmitRange` | ปิดการจอง {n} วันของครู {name} | Block these {n} days for {name} |
| `willBlock` (teacher's own door, future day) | การบันทึกนี้แค่ปิดวันนั้นไม่ให้จองใหม่ คาบที่จองไว้แล้ว {n} คาบยังอยู่ในตาราง ให้แอดมินจัดการ | Saving only blocks the day for new bookings. {n} class(es) stay on the schedule for an admin to handle. |
| `willCancel` (teacher's own door, today) | การบันทึกนี้จะยกเลิก {n} คาบ และแจ้งครอบครัวของคาบเหล่านั้น | Saving cancels {n} class(es) and tells their families. |
| `rangeDayNew` | บันทึกแล้ว | Recorded |
| `rangeDayAlready` | มีบันทึกอยู่แล้ว — ใช้รายการแรก | Already on record — the first entry stands |
| `rangeDayClasses` | จองไว้ {n} คาบ | {n} class(es) booked |
| `rangeDayNone` | ไม่มีคาบ | Nothing booked |
**Two things for you:** (1) P7's "tells N famil(ies)" — the dialog holds the CLASSES it will cancel, not the number of FAMILIES (that is a household count only the server knows), so `willCancel` says "tells their families" without a number. If you want the number, it needs a BE preview — I did not add a call (your rule: tell you first). (2) the dialog's `mock` path answers a range with an empty result (the mock service has no range writer; outside the claim).
**`git status --short -uall` (front, whole release so far):** the 814 + 816 files (unchanged) + ` M CalendarHeader.tsx` · ` M ReportLeaveDialog.tsx` · ` M TeacherRowActions.tsx` · ` M teacher-leave-row.dom.test.tsx` · ` M teacher-scope.test.ts` · ` M useScheduler.ts` · ` M scheduler.service.ts` · ` M contract.ts` · ` M dictionaries.ts` · ` M action-gate.test.ts` · `?? LeaveTeacherPick.tsx` · `?? leave-range-task818.dom.test.tsx` · `?? scripts/mutation/task-818.json`.
**BALL: @Sober** (verify → GO 820).

---
## ✅ 2026-10-17 — @Sober: TASK-818 VERIFIED
- **Clean copy** of front `d1d0a99` + the tree (814 + 816 + 818): tsc 0 · `bun test` **1,217 / 0**, 136 files · unhandled 0 · set **27/27** (0 survivors).
- **`bun run build`:** 0 in the real tree, which it leaves unchanged.
- **Own-team pin edits (self-granted under Porter's standing rule), checked line by line, each with its bite in the set:**
  - `teacher-scope.test.ts` §4: the admin call split into range + one-day (the one-day call verbatim); `disabled=` + `noDate || choosing`; the guard `!subject` → `!onBehalf` (TASK-651 F5's point kept);
  - §6: the key count 31 → 41;
  - `teacher-leave-row.dom.test.tsx`: the P6 empty date + choosing a date before submit;
  - each comment-declared. Nothing else in those files.
- **Inventory:** `CalendarHeader.tsx → action:calendar.status` (standing grant).
- **Your 2 notes:**
  1. **the family count:** the "no number" wording is accepted for now and goes to the owner as a question (see the COPY-DRAFT);
  2. **the mock range answer:** fine; mock only.
