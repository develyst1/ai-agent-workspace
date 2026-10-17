# TASK-816 — FE: **Generate plan warns on a leave week, with a one-click "tick as planned absence"** (P1) (REQ-123 Phase 1) — @Fern (S ≈ 0.55 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

**Needs TASK-815's field** (`teacherOnLeave` per previewed week). You may build against it on mocks first.
## Build
- In the create preview (`Bookings/CreatePlanFlow.tsx`), a week with `teacherOnLeave` shows a clear warning on that row. **One click ticks it as planned absence** (the existing REQ-045 absence control) and re-previews.
- Once ticked, the warning turns into a calm note (the absence is on the leave day, which is fine since TASK-813).
- **No other picker changes.** Create's own refusal stays as the server's backstop.
## Claim
front `src/components/partials/Bookings/CreatePlanFlow.tsx` (+ its preview subcomponent if separate) · the contract type line · `lib/i18n/dictionaries.ts` (new keys only, as DRAFTS) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ @Fern — 2026-10-17 — TASK-816 FE DONE: Generate plan warns on a teacher-leave week, one click ticks it. Nothing committed. Built on TASK-815's `teacherOnLeave` (real field, no mock needed).
**What shipped (front):**
- `Bookings/LeaveWeekNotice.tsx` (NEW) — `leaveWeeksOf(sessions)` (flagged weeks from the server's rows: `teacherOnLeave === true`, position = row index + 1, make-up rows included, no date compare in the front) + the notice: an UNTICKED flagged week = orange warning naming the teacher and the day, with ONE button (the **approved** `plan.plannedAbsence` label); a TICKED one = a calm grey note (it keeps its flag, so the admin still sees why); nothing flagged = nothing drawn; the button is disabled while a re-preview runs.
- `Bookings/CreatePlanFlow.tsx` — keeps `leaveWeeks` from every preview answer (replaced each time, cleared on close); the notice sits in the create extras (right under the plan table) and its button runs the SAME `toggleAbsent` as the row's own control ⇒ the server re-previews.
- `types/app/scheduler/index.ts` — `CoursePreviewSession.teacherOnLeave?: boolean` (the contract type line).
- `lib/i18n/dictionaries.ts` — 3 NEW keys `plan.leaveWeek{Title,Warn,Note}`, EN + TH, marked DRAFT in the file. Tests: `leave-week-notice-task816.dom.test.tsx` (13) + `scripts/mutation/task-816.json` (11).
**🟡 DRAFT wording for the owner (nothing ships before approval; the button uses the approved "Planned absence / ไม่มาแน่นอน (ลาล่วงหน้า)"):**
| where | TH | EN |
|---|---|---|
| warning title (untickd week) | มีคาบตรงกับวันลาของครู {name} | A class falls on {name}'s leave day |
| warning body | วันที่ {date} เป็นวันลาของครู {name} จึงสร้างคอร์สนี้ยังไม่ได้ กดทำเครื่องหมายเป็นลาล่วงหน้า แล้วระบบจะเพิ่มคาบชดเชยต่อท้ายให้ | {date} is a leave day for {name}, so this course can't be created yet. Mark it as a planned absence and a make-up is added at the end. |
| calm note (ticked week) | วันที่ {date} เป็นวันลาของครู {name} และทำเครื่องหมายเป็นลาล่วงหน้าแล้ว — ไม่เป็นไร | {date} is on {name}'s leave day and is marked as a planned absence — that's fine. |
({date} shows like "Mon 19/Oct/26", the plan table's own format.)
**Tests by value:** only `=== true` counts (absent/false flag claims nothing) · week = row position · a ticked week keeps its flag and reads absent · untick warns once with one button; a click hands the toggle THAT week; ticked = note, no button, no warning; disabled during a re-preview; the 3 strings in both languages and marked DRAFT.
**Set 816: 11/11 BITE**, CHECKSUM identical. ⚠️ **Honest limit:** W8/W9/W10 (stored from the preview · the button runs `toggleAbsent` · cleared on close) bite through SOURCE pins, not a clicked flow — driving the full create picker (student/teacher/subject selects) in happy-dom was out of proportion; the click → `toggleAbsent` → re-preview path itself is the existing, already-pinned toggle.
**Numbers:** `tsc` 0 · `bun test` **1195 pass / 0 fail** (135 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`.
**Inventory lines added to `action-gate.test.ts` for 816: none** (no new `action:` gate).
**Decision for you:** the warning sits **under the plan table**, not literally on the flagged row — the row component lives in `PlanModal.tsx` (shared with manage-plan), outside the 816 claim. The notice names the date, so it reads as the row's own. If you want a marker ON the row, that needs a grant for `PlanModal.tsx` (a small chip beside the status).
**`git status --short -uall` (front, whole release so far):** 814's files (unchanged) + ` M Bookings/CreatePlanFlow.tsx` · ` M types/app/scheduler/index.ts` (+ the dictionary already counted) · `?? Bookings/LeaveWeekNotice.tsx` · `?? Bookings/leave-week-notice-task816.dom.test.tsx` · `?? scripts/mutation/task-816.json`.
**BALL: @Sober** (verify → GO 818).

---
## ✅ 2026-10-17 — @Sober: TASK-816 VERIFIED
- **Clean copy** of front `d1d0a99` + the tree (814 + 816): tsc 0 · `bun test` **1,195 / 0**, 135 files · unhandled 0 · set **11/11** · `bun run build` 0 in the real tree, unchanged by it.
- **Your decision, ACCEPTED:** the notice sits under the plan table and names the date, rather than on the row.
  - The row is in `Bookings/PlanModal.tsx`, which is shared with manage-plan and lies in Team B's `Bookings/*` area (10-02 batch).
  - The notice reads as the row's own, so a cross-team grant isn't worth it.
- **Wording:** 3 DRAFT strings, collected in `COPY-DRAFT-REQ-123-phase1-2026-10-17.md`. The button reuses the approved "Planned absence" label.
