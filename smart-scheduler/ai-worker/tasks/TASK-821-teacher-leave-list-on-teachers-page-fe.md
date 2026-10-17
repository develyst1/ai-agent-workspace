# TASK-821 — FE: **a "Teacher leave" list (upcoming + past, per teacher, with Cancel for future days)** (P5) (REQ-123 Phase 1) — @Fern (M ≈ 1.1 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

**Needs TASK-819** (the list read with `teacherId`, past window, `rangeId`, `menu:teachers`).
## Build
- **On the Teachers page** (`partials/Teachers/*`, Team A): a **"Teacher leave"** tab or section listing leave by teacher:
  - upcoming first, then past (a date window control);
  - each with its days, affected-class count, reason;
  - **Cancel** on future days (814's approved copy);
  - clicking a leave opens TASK-820's panel.
- **From the calendar:** TASK-820's panel has a **"See all teacher leave →"** link to this list. So no calendar header or nav change is needed for P5.
- **No new route, no new menu entry:** it lives in the Teachers page.
## Claim
front `src/components/partials/Teachers/*` (a new `TeacherLeaveList.tsx` + its mount in `TeachersContent.tsx`) · `hooks/scheduler/useScheduler.ts` · `services/scheduler.service.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ @Fern — 2026-10-17 — TASK-821 FE DONE (+ the TASK-589 pin re-aimed, step 1). That closes Phase 1's front. Nothing committed.
### Step 1 — TASK-589's pin, re-aimed as you ruled (`leave-days.test.ts`, that one test only)
- **Retitled:** *"the chip opens the LEAVE; classes are never changed from the panel, only through the booking modal"*, with a declared-change comment in the file's style.
- **Now asserts the truth:** (a) the banner holds no press-handler of its own (`<Link · onClick · <Button · href=` still absent) and delegates each chip to `<LeaveChip`; (b) `LeaveDayPanel.tsx` has **no booking-write hook** (`useCancel… · useMove… · useMarkSick/Attended… · usePause/Resume… · useConfirm… · useCreate… · useUndo… · useReport… · useUpdate… · useSetBooking…`), no `api/axios .post/.put/.patch/.delete`, and its only leave read is `useTeacherLeaveDays(`; the panel's two confirms hold exactly `useLiftTeacherLeave()` / `useLiftLeaveRange()` and no booking write; the booking modal is mounted by `LeaveClassOpener`, never inside the panel.
- **Your required bite, BITING:** Q1 = a booking-cancel hook added to the panel (`useCancelBooking()`) fails the pin (34 pass / 1 fail). Plus Q2 = the panel renders `<BookingModal>` itself — also fails it. Both are in `scripts/mutation/task-820.json`.
### Step 2 — what 821 shipped (front)
- **`Teachers/TeacherLeaveList.tsx`** (NEW) — a "Teacher leave" card on the Teachers page (`id="teacher-leave"`, mounted in `TeachersContent.tsx` above the archived list): a segmented **Upcoming | Past** window; leave **grouped under each teacher** (the teacher with the next leave first); a **range is ONE row** (its days share `rangeId`): span · day count · classes · the reason under it; pressing a row opens TASK-820's panel (`LeaveChip`). **Cancel:** a one-day future leave carries the approved 814 button (`CancelLeaveButton`); a range with a day still ahead carries "Cancel all future days" (`LiftRangeConfirm`, one `DELETE /teacher-leave-ranges/:id`); the past list carries none; no key ⇒ none. Pure helpers `leaveRecordsOf / groupByTeacher` tested by value.
- **The read is the EXISTING `useLeaveDays`** with two windows the server accepts (≤ 92 days): **Upcoming = today … +91 · Past = today−91 … yesterday** (past newest first). No new hook or service was needed.
- **`LeaveDayPanel.tsx` / `LeaveChip.tsx` / `LeaveDayBanner.tsx`** — the panel gained **"See all teacher leave →"** (`/scheduler/teachers#teacher-leave`), passed only by the calendar's chip (`seeAll`) and shown only to an admin who holds `menu:teachers` (read through the real `useMe`/`hasMenu`; else the link would bounce at the route guard). The panel opened FROM the list does not show it.
- `lib/i18n/dictionaries.ts` — 7 DRAFT keys. No new route, no new menu entry; `CalendarContent.tsx` still untouched.
**Numbers:** `tsc` 0 · `bun test` **1257 pass / 0 fail** (138 files) · `bun run build` exit 0 · `unhandled-between-tests: 0` · new test `teacher-leave-list-task821.dom.test.tsx` (21) · **set 821: 16/16 BITE** · re-run on the final tree: **set 814 10/10 · 816 11/11 · 818 27/27 · 820 22/22 (incl. Q1, Q2) · 821 16/16**, every CHECKSUM identical.
**Two things I changed on the way — please read:**
1. **No teacher-scoped `enabled` gate on the list.** My first version asked `useMe()` for it; but `TeachersContent` is rendered by **TASK-806's own page test** (mine), which has no session ⇒ `useSession` threw, and 4 of its tests went red. The Teachers page is behind `menu:teachers`, which a linked teacher's account does not hold, so a scoped session cannot mount it; I removed the session read from the list (a pin says so) and dropped the "scoped asks" test and its mutation (T4). The calendar strip keeps its gate.
2. **My own 814 / 820 / 821 tests no longer stub `useMe`.** The panel now reads the menu set, and a `mock.module` stub of `useMe` leaks across files (it turned TASK-726's header test red for a moment). They give the tree a real `SessionProvider` holding an admin with the Teachers menu instead; nothing replaces `useMe`.
**Inventory line added to `action-gate.test.ts` for 821 (standing grant):** `"src/components/partials/Teachers/TeacherLeaveList.tsx → action:calendar.status"` (after `TeacherFormModal.tsx → action:teachers.edit`). Nothing else changed there.
### 🟡 DRAFT wording for the owner (7 keys; marked DRAFT in the dictionary; nothing ships before approval; a row's "N class(es) booked / Nothing booked" are TASK-818's DRAFT keys, Cancel is 814's approved copy, "Cancel all future days" is TASK-820's DRAFT)
| key | TH | EN |
|---|---|---|
| `listTitle` | การลาของครู | Teacher leave |
| `listUpcoming` (window) | ที่จะถึง | Upcoming |
| `listPast` (window) | ที่ผ่านมา | Past |
| `listEmptyUpcoming` | ยังไม่มีการลาของครูที่จะถึง | No upcoming teacher leave. |
| `listEmptyPast` | ไม่มีการลาของครูใน 3 เดือนที่ผ่านมา | No teacher leave in the last 3 months. |
| `listDays` ({n}) | {n} วัน | {n} days |
| `seeAll` (link in the calendar panel) | ดูการลาของครูทั้งหมด → | See all teacher leave → |
**Not proven:** a real browser; the real list/`DELETE` against the real back (the wire is faked); the `#teacher-leave` scroll on landing (Next's own hash handling — not exercised).
**`git status --short -uall` (front, whole Phase 1 so far):** 814 + 816 + 818 + 820 files (unchanged) + 821: `?? Teachers/TeacherLeaveList.tsx` · `?? Teachers/teacher-leave-list-task821.dom.test.tsx` · `?? scripts/mutation/task-821.json` · ` M Teachers/TeachersContent.tsx` · ` M Calendar/LeaveDayPanel.tsx` (+ `LeaveChip.tsx`, `LeaveDayBanner.tsx` of 820) · ` M lib/scheduler/leave-days.test.ts` (the 589 re-aim) · ` M lib/rbac/action-gate.test.ts` · ` M lib/i18n/dictionaries.ts`; my 814 / 820 tests edited as declared above.
**BALL: @Sober** (verify → Phase 1's front is complete; "one release: nothing committed until the whole set is verified together").

---
## ✅ 2026-10-17 — @Sober: TASK-821 VERIFIED. **Phase 1 front COMPLETE**
- **The whole front tree** (814 + 816 + 818 + 820 + 821, 34 files) on a clean copy of `d1d0a99`: tsc 0 · `bun test` **1,257 / 0**, 138 files · unhandled 0.
- **Sets re-run on the FINAL tree:** 814 **10/10** · 816 **11/11** · 818 **27/27** · 820 **22/22** · 821 **16/16**; 0 survivors, checksums identical.
- **`bun run build`:** 0 in the real tree, which it leaves unchanged.
- **TASK-589's re-aimed pin, checked:**
  - the banner delegates to `LeaveChip`;
  - the panel holds no booking write, only the two leave lifts;
  - "Open" mounts the real `BookingModal`;
  - retitled and comment-declared;
  - its bite (a booking-cancel added to the panel) is in set 820.
- **Your 2 notes, accepted:**
  1. **No session/scoped gate on the list:** the back refuses `GET /teacher-leave-days` to a teacher-scoped session (not in `TEACHER_ALLOWED`), the page sits behind `menu:teachers`, and Cancel stays behind `can("action:calendar.status")`.
  2. **Your tests use a real `SessionProvider`** instead of a global `useMe` stub (it leaked into TASK-726's header test). That is the right fix.
- **Inventory:** `TeacherLeaveList.tsx → action:calendar.status` (standing grant).
