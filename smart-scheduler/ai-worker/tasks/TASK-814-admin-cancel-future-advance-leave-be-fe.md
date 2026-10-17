# TASK-814 — BE + FE: **the admin cancels a FUTURE advance-leave day** (REQ-123 §4, the MAP's gap 1) — @Jason (BE, XS ≈ 0.2 d) + @Fern (FE, S ≈ 0.55 d), incl. +10 percent
**From @Sober, 2026-10-17.** **HOLD: waiting for the owner's copy approval (below) and @Porter's GO.** Owner: *"ครูลาล้วงหน้า ควรมีหน้ายกเลิกได้ ด้วยมั้ย"*. **Only a FUTURE day.** Undoing a today/past leave (classes already cancelled, families told) is long-term, NOT this task.

## What exists already (back `d29e9d0`)
- `DELETE /teacher-leave-days/:teacherId/:date` (`routes/api.ts:225-227`, key `action:calendar.status`, `lib/route-access.ts:126`) → `liftTeacherLeave(onBehalf: true)` (`services/scheduler.service.ts:3723-3727`):
  - deletes that ONE leave row; **restores nothing, cancels nothing, tells no family**;
  - **LINE-notifies the teacher** (`teacher_leave_lifted`) and returns `{ lifted, teacherNotified }`;
  - unknown day → 404 *"ไม่พบวันลาล่วงหน้านี้"* (approved).
- **Gap:** the door has **no date check**, so it can delete a past/today row. The front **never calls it**: there is no button anywhere.

## BE (@Jason, XS ≈ 0.2 d)
- At the admin DELETE door, refuse a day that is not advance with **the same predicate** the record door uses (`isAdvanceLeave`, as TASK-648 did at `api.ts:222`), not a second date comparison.
- Error: reuse the approved `ADMIN_LEAVE_FUTURE_ONLY` wording if it fits, or a new string for the owner's approval (see the copy below).
- The teacher's own DELETE (`/teachers/me/leave/:date`) is **unchanged**.
- **Tests by value:** a future day → 200 + the row gone + `teacherNotified`; today/past → refused, row kept; no booking row changes in either case. Plus a mutation set.

## FE (@Fern, S ≈ 0.55 d)
- **Where:** the calendar's leave strip, `Calendar/LeaveDayBanner.tsx`. Each "{name} is away" chip gets a small **"Cancel leave"** button.
  - It shows **only** for a date after today, and only with `action:calendar.status`.
  - The strip is admin-only already.
  - ⚠️ That file's header says *"It is not a control … the owner ruled the admin handles those classes by hand"*. **That stays true for the CLASSES.** The new button acts on the LEAVE only, by the owner's 10-17 ask. Update the comment to say so.
- **The confirm dialog** with the approved copy. On success: refresh the leave days + the calendar, and toast (told / not told variants).
- **Service + hook** for the DELETE (beside `useLeaveDays`, `hooks/scheduler/useScheduler.ts:550-571`; `services/scheduler.service.ts:490-525`).
- **Tests (DOM):**
  - the button shows for a future chip only, and is hidden without the key;
  - confirm → DELETE called with that teacher + date;
  - cancel → nothing sent;
  - after success the strip is gone.
  - Plus a mutation set.

## ✅ Claim (pending @Porter)
- **back:** `src/routes/api.ts` (the one DELETE door) + a test + its set.
- **front:**
  - `Calendar/LeaveDayBanner.tsx`;
  - one confirm component (new file or inside the banner);
  - `hooks/scheduler/useScheduler.ts` (one hook);
  - `services/scheduler.service.ts` (one call);
  - `lib/i18n/dictionaries.ts` (the approved keys only);
  - tests + set.

## Copy: DRAFT for the owner's approval (nothing ships before it)
| where | TH | EN |
|---|---|---|
| button on the chip | ยกเลิกวันลา | Cancel leave |
| confirm title | ยกเลิกวันลาของครู {name} วันที่ {date}? | Cancel {name}'s leave on {date}? |
| confirm body | วันนั้นจะกลับมาจองคาบกับครูได้ตามปกติ คาบที่มีอยู่แล้วไม่มีอะไรเปลี่ยน และระบบจะแจ้งครูทาง LINE | That day opens for bookings with this teacher again. Existing classes don't change. The teacher is told on LINE. |
| confirm buttons | ยกเลิกวันลา · ไม่ยกเลิก | Cancel leave · Keep leave |
| toast, told | ยกเลิกวันลาแล้ว — แจ้งครูทาง LINE แล้ว | Leave cancelled — the teacher was told on LINE |
| toast, not told | ยกเลิกวันลาแล้ว — ครูยังไม่ได้เชื่อม LINE กรุณาแจ้งครูเอง | Leave cancelled — the teacher has no LINE link, please tell them yourself |
| BE refusal (today/past) | ยกเลิกได้เฉพาะวันลาล่วงหน้า (วันถัดไปเป็นต้นไป) — วันลาของวันนี้หรือวันที่ผ่านมาแล้วยกเลิกไม่ได้ | Only a future leave day can be cancelled. Today's or a past leave can't be cancelled |

---
## ⏸️ 2026-10-17 — Jason (BE) → @Sober: TASK-814 BACK GUARD built — ONE existing pin (TASK-648) turns red and it is OUTSIDE my claim. Need your grant for 1 line.
**Built (inside the claim; back base `c1d90d8`, nothing committed):**
- `src/routes/api.ts` only: the admin `DELETE /teacher-leave-days/:teacherId/:date` door now runs `if (!isAdvanceLeave(c.req.valid("param").date)) throw badRequest(LIFT_FUTURE_ONLY_COPY_PENDING);` BEFORE `svc.liftTeacherLeave(…{ onBehalf: true })` — the SAME predicate as the record door. A module const `LIFT_FUTURE_ONLY_COPY_PENDING = "«copy pending» ยกเลิกได้เฉพาะวันลาล่วงหน้า … "` (the owner's DRAFT, marked) — replace it when you pass me the approved text. The teacher's own lift and `liftTeacherLeave` are untouched; I kept the TASK-608 source pin's exact call text, so that pin stays green.
- NEW `src/lib/admin-lift-leave-future-only-task814.test.ts` (10) + `…mutations.json` (7).
**By value through the root app** (clock 2026-10-17; leave rows on 10-10, 10-17, 10-18, 10-24; `db.delete` captured, update/insert/transaction/booking-read tripwired): tomorrow and a later week ⇒ 200, row deleted, `teacherNotified 1`, one `teacher_leave_lifted` notice · TODAY and a past day ⇒ **400, no delete, no notice, no booking touched** · the refusal carries «copy pending» · an unknown future day ⇒ the approved 404 · the teacher's OWN lift of today still 200 · source: one predicate, before the lift, no date arithmetic, own door has no `isAdvanceLeave`.
**Set 814: 7/7 BITE** (D1 guard removed · D2 hand-written date · D3 guard after the lift · D4 inverted · D5 guard also on the teacher's own lift · D6 marker dropped · D7 today passes), checksum identical — run with the 648 test left out of its `tests` list, because of the red pin below.
**Suite: 4,736 pass / 1 fail.** The 1 = `admin-leave-future-only-task648.test.ts` *"⚠️ the `isAdvanceLeave` exactly-once pin is scoped to the ACT, and now says so"*: it counts `isAdvanceLeave(` calls across `scheduler.service.ts` + `api.ts` + `teacher-leave.ts` and expects **3**; the admin lift door is a deliberate FOURTH call site (a second guard at a route) ⇒ **4**. (Its own comment already says the count is "the lib's own refusal + the act's ONE fork + the route's guard".)
- **Ask (outside my claim):** grant me that ONE line in `src/lib/admin-leave-future-only-task648.test.ts`: `expect(inProduct.length).toBe(3)` → `toBe(4)` and its comment adds "+ the admin LIFT door's guard (TASK-814)". The pin's meaning (no unlisted caller of the predicate) stays. After your GO I put the 648 file back into the set's `tests` list and rerun everything.
▶️ **Ball: Sober — grant (or rule otherwise).**

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-814 BACK GUARD DONE — the TASK-648 pin re-aimed (granted) and shown catching the planted bug. Nothing committed.
- **The re-aim (`admin-leave-future-only-task648.test.ts`, line 106 only):** `toBe(3)` → `toBe(4)`; the comment now lists the four call sites (the lib's own refusal · the act's ONE fork · the record door's guard · the admin LIFT door's guard, TASK-814).
- **Planted bug = D2** in the 814 set (replaces the lift door's `isAdvanceLeave(...)` with a hand-written `date <= new Date().toISOString().slice(0, 10)`), and the set's `tests` list again includes the 648 file. **On the TASK-648 test ALONE (a one-off set, deleted after): `D2 BITES (8 pass / 1 fail vs baseline 9)`** — the count pin goes red (3 calls ≠ 4); in the full set D2 fails 2 (that pin + my source pin).
- **Set 814: 7/7 BITE**, baseline 32, CHECKSUM identical.
- **SAFE suite (DB unreachable, every setting blanked): 4,742 pass / 0 fail, 351 files · unhandled-between-tests: 0 · tsc 0 · migrations 70 = 70.**
- **`git status --short -uall` (back):** ` M src/lib/admin-leave-future-only-task648.test.ts` · ` M src/routes/api.ts` · `?? src/lib/admin-lift-leave-future-only-task814.mutations.json` · `?? src/lib/admin-lift-leave-future-only-task814.test.ts` — exactly the claim + the granted pin.
- Still open: the refusal text is the «copy pending» placeholder (`LIFT_FUTURE_ONLY_COPY_PENDING` in `api.ts`) until you pass me the approved wording.
▶️ **Ball: Sober — verify; send the approved text when the owner has it.**

---
## ✅ 2026-10-17 — @Sober: TASK-814 BE part VERIFIED (the refusal text is still the «copy pending» placeholder)
**My own run on a clean copy:** `c1d90d8` + the 4 changed files.
- **tsc 0.**
- **SAFE suite 4,742 pass / 0 fail**, 351 files, `unhandled-between-tests: 0`.
- **Set 814: 7/7 BITE**, baseline 32:
  - D1 guard removed · D2 a hand-written date compare · D3 the guard after the lift · D4 inverted · D5 on the teacher's own lift · D6 the marker dropped · D7 today passes.
- **Porter's condition:** D2 applied alone, then only the TASK-648 pin run → **8 pass / 1 fail**, the exactly-N pin red.
- **Diff read:**
  - the admin DELETE door checks `isAdvanceLeave` **before** `liftTeacherLeave`;
  - the teacher's own lift is untouched;
  - the 648 pin is 3 → 4 with the comment naming the lift door, nothing else.

**🔧 When you swap in the approved wording (do both then, nothing before):**
1. Move the `LIFT_FUTURE_ONLY_COPY_PENDING` constant **below the import block**. It sits between two `import` lines today: valid, but untidy.
2. **Fix the comment's reason.** It says a today/past leave *"has had its classes cancelled and its families told"*. That is wrong for a recorded **advance** leave whose day has come: recording one never cancels anything (MAP §3), and a same-day leave records no row at all.
   - Say instead: *"lifting a day that has already begun is out of scope tonight (owner, REQ-123 §4); the classes of that day may already have been handled by hand"*.
- **Ships only with:** the approved text and Fern's front button. The back alone has no visible effect.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-814 back — APPROVED TEXT in, D6 re-aimed, both tidy-ups done. Nothing committed.
- **Text:** `LIFT_FUTURE_ONLY_COPY_PENDING` → `LIFT_FUTURE_ONLY_MESSAGE = "ยกเลิกได้เฉพาะวันลาล่วงหน้า (วันถัดไปเป็นต้นไป) — วันลาของวันนี้หรือวันที่ผ่านมาแล้วยกเลิกไม่ได้"` (verbatim, TH as the server message; the EN is kept in the comment above it). No «copy pending» marker anywhere (a test pins `COPY_PENDING` absent).
- **Tidy-up 1:** the constant now sits BELOW the whole import block (after the last `import`, `api.ts` line ~36), not between two imports (a test pins it).
- **Tidy-up 2:** the door's comment now says: lifting a day that has already begun is out of scope tonight (owner, REQ-123 §4); the classes of that day may already have been handled by hand — the wrong "classes cancelled and families told" reason is gone.
- **D6 re-aimed:** "the refusal text differs from the owner's approved one" (drops a clause); the test compares the response message to the approved string verbatim.
- **Set 814: 7/7 BITE** (CHECKSUM identical) · **SAFE suite 4,742 pass / 0 fail, 351 files · unhandled-between-tests 0 · tsc 0 · 70 = 70.** `git status --short -uall`: ` M …task648.test.ts` · ` M src/routes/api.ts` · `?? …task814.mutations.json` · `?? …task814.test.ts`.
▶️ **Ball: Sober — verify. I start TASK-815 now (Phase 1, one at a time).**

## ✅ 2026-10-17 — @Sober: TASK-814 BE re-VERIFIED with the approved text
- `LIFT_FUTURE_ONLY_MESSAGE` = the owner-approved TH, **verbatim** (string-matched against COPY-REVIEW 10-17). No «copy pending» left; the constant sits below the imports; the comment's reason is corrected.
- **Clean copy (814's 4 files only):** tsc 0 · suite **4,742 / 0** · unhandled 0 · set **7/7** (D6 is now "text differs from the approved one") · D2 alone still bites the TASK-648 pin (8/1).
- **The BE part is DONE.** It waits in the tree for the one release (813 + 814 + Phase 1). FE button in progress (Fern).

---
## 🔧 @Fern — 2026-10-17 — TASK-814 FE DONE: "Cancel leave" on the future leave chip (copy verbatim from the 10-17 approved table). Nothing committed.
**What shipped (front, all inside the claim):**
- `Calendar/CancelLeaveButton.tsx` (NEW) — the chip's one control. Renders **nothing** unless `can("action:calendar.status")` AND the day is after today; then the small "Cancel leave" button + the confirm.
- `Calendar/LiftLeaveConfirm.tsx` (NEW) — the one confirm component: approved title/body/buttons; confirm → `useLiftTeacherLeave`; toast by `teacherNotified` (> 0 told · else not told); a server refusal's own sentence stays in the dialog (never a success toast).
- `Calendar/LeaveDayBanner.tsx` — mounts `<CancelLeaveButton>` in each chip; header comment updated ("still not a control for the CLASSES; gains ONE control, for the LEAVE").
- `services/scheduler.service.ts` (one call `liftTeacherLeave` → `DELETE /teacher-leave-days/:teacherId/:date`) · `hooks/scheduler/useScheduler.ts` (one hook; refreshes `["leave-days"]` + the calendar queries) · `lib/i18n/dictionaries.ts` (7 approved keys `leaveDays.cancel*`, EN + TH, verbatim).
- Tests: `lift-leave-task814.dom.test.tsx` (8) + `scripts/mutation/task-814.json` (10).
**Design decisions you can overturn at review:**
1. The button lives in its **own file**, not in the banner. Two old TASK-589 pins read the banner's SOURCE (`not.toContain("calendar")`, and "NOT a control": no `onClick`/`<Button`/…): both would have gone red from a button + the key literal inside that file, and they are outside my claim. With the button in its own file they stay green **untouched** — but note their wording ("it is NOT a control") is now only true of the classes; re-aim them in your own time.
2. `teacherNotified` **absent** (a server older than this screen) → I show the *not-told* toast ("…please tell them yourself"): the approved copy has no neutral variant, and "ask the admin to tell them" is the action-safe reading. If you want a third (silent/neutral) wording it needs the owner's approval.
3. Mock mode (`useMock`): `liftTeacherLeave` answers `{ lifted: true, teacherNotified: 0 }` inline — the mock service holds no leave rows, and `scheduler.mock.service.ts` is outside the claim.
**Tests by value (DOM, the wire faked, the strip read through the REAL `useLeaveDays`):** future chip has the button, today/past chips do not (all chips still drawn) · without the key none has it · the button only OPENS the confirm (title with teacher + date, approved body, 0 requests) · confirm → exactly ONE `DELETE /teacher-leave-days/t1/<date>`, the chip is GONE after the re-read (GET count > 1), the other chips stand, told-toast · `teacherNotified: 0` → not-told toast · absent → not-told toast · `Keep leave` → 0 requests, chip stays · refusal → chip stays, the server's sentence in the dialog, no toast.
**Set 814: 10/10 BITE**, CHECKSUM identical (L1 today offered · L2 past offered · L3 key not asked · L4 wrong path · L5 Keep runs the cancel · L6 strip not refreshed · L7 zero told as told · L8 absent as told · L9 refusal swallowed · L10 approved body altered).
**Numbers:** `tsc` 0 · `bun run build` exit 0 · `bun test` **1181 pass / 1 fail** (1182 tests, 134 files) · `unhandled-between-tests: 0`.
🔴 **The 1 fail is outside my claim — I did NOT touch it:** `src/lib/rbac/action-gate.test.ts` → *"the sweep: every `action:…` literal at a site"* — its SITE_INVENTORY wants the new gate's line (its own comment: "when you add a gate, add its line here"). **Grant me this ONE line**, sorted right after `…/Calendar/CalendarWeekGrid.tsx → action:calendar.book`:
`  "src/components/partials/Calendar/CancelLeaveButton.tsx → action:calendar.status",`
(the diff of the failing run names exactly that line, +1 −0). I add it on your GO and re-run the suite → 1182 / 0.
**`git status --short -uall` (front):** ` M LeaveDayBanner.tsx` · ` M hooks/scheduler/useScheduler.ts` · ` M lib/i18n/dictionaries.ts` · ` M services/scheduler.service.ts` · `?? scripts/mutation/task-814.json` · `?? Calendar/CancelLeaveButton.tsx` · `?? Calendar/LiftLeaveConfirm.tsx` · `?? Calendar/lift-leave-task814.dom.test.tsx` — exactly the claim. 
**Not proven:** the real `DELETE` against the real back (no environment touched); the button's look in a browser (not rendered outside the DOM test).
**Phase 1:** 816 → 818 → 820 → 821 next, one at a time, after you verify this and grant the one line. **BALL: @Sober.**

---
## ✅ @Fern — 2026-10-17 — TASK-814 FE: the inventory line added (Porter's standing grant); all green
- **Line added to `src/lib/rbac/action-gate.test.ts` SITE_INVENTORY (+1 −0, nothing else touched):** `"src/components/partials/Calendar/CancelLeaveButton.tsx → action:calendar.status"` — right after `…/CalendarWeekGrid.tsx → action:calendar.book`. (Your first entry named `LeaveDayBanner.tsx`; the gate literal lives in `CancelLeaveButton.tsx` since the button moved to its own file, as your second entry says — the sweep matches the real file.)
- **`bun test`: 1182 pass / 0 fail** (134 files) · `unhandled-between-tests: 0` · tsc 0 · build 0 (earlier run, no source change since) · **set 814: 10/10 BITE, CHECKSUM identical.**
- **`git status --short -uall` (front):** ` M Calendar/LeaveDayBanner.tsx` · ` M hooks/scheduler/useScheduler.ts` · ` M lib/i18n/dictionaries.ts` · ` M lib/rbac/action-gate.test.ts` · ` M services/scheduler.service.ts` · `?? scripts/mutation/task-814.json` · `?? Calendar/CancelLeaveButton.tsx` · `?? Calendar/LiftLeaveConfirm.tsx` · `?? Calendar/lift-leave-task814.dom.test.tsx`.
**BALL: @Sober** (verify → GO 816).

## ✅ 2026-10-17 — @Sober: TASK-814 FE VERIFIED. TASK-814 is COMPLETE (BE + FE), waiting in the trees for the one release
- **Clean copy** of front `d1d0a99` + Fern's 9 files: tsc 0 · `bun test` **1,182 / 0**, 134 files · unhandled 0 · set **10/10 BITE**.
- **`bun run build`:** exit 0 in the real front tree, `git status` unchanged by it.
- **Copy:** all 7 approved TH strings + 7 EN strings are present **verbatim** (string-matched against COPY-REVIEW 10-17); no new wording.
- **action-gate inventory:** +1 line only (`CancelLeaveButton.tsx → action:calendar.status`), under Porter's standing grant. The gate lives in that file.
- **Files:**
  - `Calendar/LeaveDayBanner.tsx` (M), new `CancelLeaveButton.tsx` + `LiftLeaveConfirm.tsx` + `lift-leave-task814.dom.test.tsx`;
  - `useScheduler.ts`, `services/scheduler.service.ts`, `dictionaries.ts` (M);
  - `scripts/mutation/task-814.json`.
