# TASK-820 — FE: **the calendar leave strip opens the leave: its days, its affected classes (child · program · open), and Cancel leave** (P3 + P4) (REQ-123 Phase 1) — @Fern (M ≈ 1.75 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

**Needs TASK-819** (the class detail) and builds on **TASK-814** (the approved Cancel leave button + confirm, which first ship on the chip tonight).
## Build
- Each "{name} is away" chip in `Calendar/LeaveDayBanner.tsx` becomes **clickable** and opens a **leave panel** (drawer or modal) showing:
  - the leave's days (the whole range, if any);
  - per day, the affected classes with **child · program · time · status**, each with **"Open"**, which opens the existing booking modal (`Calendar/Modal/BookingModal.tsx`). There the admin moves / changes teacher / cancels as today;
  - **Cancel leave** (future days only, 814's approved copy). For a range: per day and "cancel all future days".
- Update the banner's header comment: it IS now a control, for the leave, by the owner's 10-17 approval. **The classes are still handled in the booking modal**, never bulk-changed from here.
- The panel is mounted **inside our own files** (`LeaveDayBanner.tsx` or a new `Calendar/LeaveDayPanel.tsx`), so `CalendarContent.tsx` is not touched.
## Claim
front `Calendar/LeaveDayBanner.tsx` (**pending Porter**: unclaimed since TASK-589) · new `Calendar/LeaveDayPanel.tsx` · `hooks/scheduler/useScheduler.ts` · `services/scheduler.service.ts` · `types/api/contract.ts` · `lib/i18n/dictionaries.ts` (DRAFT keys) · tests + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ @Fern — 2026-10-17 — TASK-820 FE DONE: the calendar chip opens the LEAVE (days · classes · Open · Cancel, per day and "cancel all future days"). Nothing committed.
**What shipped (front):**
- **`Calendar/LeaveChip.tsx`** (NEW) — the chip's text is now a button → opens the panel; "Open" on a class closes the panel and opens the booking modal.
- **`Calendar/LeaveDayPanel.tsx`** (NEW) — a modal: this leave's days (the **whole range** by `rangeId`, date order — a range can run past the week on screen, so it asks `GET /teacher-leave-days?teacherId&from&to` for ±31 days around the chip, and shows the chip's own row until that arrives) · per day the classes: **time · child (DUO: both, nickname first) · program (or an "other" row's title) · status chip · "Open"** · per FUTURE day the approved **814 Cancel leave** (`CancelLeaveButton`, moved here from the chip) · for a **range** with a day still ahead and the key: **"Cancel all future days"**. Helpers `leaveClassWho / leaveClassWhat / daysOfLeave` are exported and tested by value.
- **`Calendar/LiftRangeConfirm.tsx`** (NEW) — the range's confirm: ONE `DELETE /teacher-leave-ranges/:rangeId` (never one per day); the two buttons and the two toasts are the **approved 814 strings, reused**; the title/body/trigger are DRAFT. A refusal stays in the dialog.
- **`Calendar/LeaveClassOpener.tsx`** (NEW) — "Open": reads THAT day (the same `GET /calendar` the grid uses), finds the class by its id and mounts the **real `BookingModal`** on it; if the class has gone from the read it opens nothing (never a half-filled modal, never another class). Because `CalendarContent.tsx` stays untouched, the panel hosts its own instance of the modal; `onOverbook`/`onWalkIn` (create-form doors of the grid's cells) just close it.
- **`Calendar/LeaveDayBanner.tsx`** — mounts `<LeaveChip>` per chip; header comment rewritten ("the chip IS now a control, for the LEAVE, by the owner's 10-17 approval; the classes are still handled by hand in the booking modal"). `hooks/scheduler/useScheduler.ts` (`useTeacherLeaveDays`, `useLiftLeaveRange`) · `services/scheduler.service.ts` (`getLeaveDays(…, teacherId?)`, `liftLeaveRange`) · `types/api/contract.ts` (class detail fields optional, `rangeId`, `LiftLeaveRangeResponse`) · `lib/i18n/dictionaries.ts` (6 DRAFT keys).
**Numbers:** `tsc` 0 · `bun test` **1237 pass / 0 fail** (137 files) · `bun run build` exit 0 · `unhandled-between-tests: 0` · new test `leave-panel-task820.dom.test.tsx` (20) · **set 820: 20/20 BITE, CHECKSUM identical** (its `tests` also run my 814 test and `leave-days.test.ts`). One survivor found and fixed on the way: "cancel all" offered on a single-day leave drew a button with NO attribute (null `rangeId`), so the test now checks the WORDS too.
**Tests by value (the wire faked, the strip read through the real hook):** the whole range incl. a day outside the week · who/what/when/status rows (DUO "บอส + แพร", title of an "other" row) · asks for THIS teacher only · opening the panel sends only reads · `Open` closes the panel, reads that class's day and shows the real booking modal's student name; a class gone from the read opens nothing · per-day Cancel on future days only · "cancel all": range + a future day + key only; pressing it only opens the confirm; confirm → exactly `DELETE /teacher-leave-ranges/r-1`, told-toast, lifted chips gone, past day stands; 0 told → not-told toast; refusal → no toast, chips stay.
**My own 814 test re-aimed** (declared in the file): the Cancel moved from the chip into the panel, so it now presses the chip and waits for the panel first; every assertion about the button and its confirm is unchanged (8/8 green, and still in the 814 set's list of bites).
**Inventory line added to `action-gate.test.ts` for 820 (standing grant):** `"src/components/partials/Calendar/LeaveDayPanel.tsx → action:calendar.status"` (after `CancelLeaveButton.tsx → …`). Nothing else changed in that file.
**Team A pins:** none edited. ⚠️ **One is green but now means less:** TASK-589's *"it is NOT a control — no link, no button"* reads `LeaveDayBanner.tsx`, which still holds no press-handler **because the handlers live in `LeaveChip.tsx`** (same trick as 814). The sentence in its title is no longer true of the chip; re-aim its wording whenever you like — I did not touch it.
### 🟡 DRAFT wording for the owner (6 keys; marked DRAFT in the dictionary; nothing ships before approval; the range confirm's two buttons and two toasts are the approved 814 ones; the per-day "N class(es) booked / Nothing booked" reuse 818's DRAFT keys; "Reason" is the approved label)
| key | TH | EN |
|---|---|---|
| `panelTitle` | การลาของครู {name} | {name}'s leave |
| `panelNote` | หน้านี้ใช้ดูและยกเลิกวันลาเท่านั้น คาบในวันเหล่านี้ไม่ถูกแก้ที่นี่ — กดเปิดคาบเพื่อย้าย เปลี่ยนครู หรือยกเลิกคาบ | This only shows and cancels the leave. Classes on these days are not changed here — open one to move it, change its teacher or cancel it. |
| `panelOpen` (button on a class) | เปิดดู | Open |
| `cancelRange` (button) | ยกเลิกวันลาที่ยังไม่ถึงทั้งหมด | Cancel all future days |
| `cancelRangeTitle` | ยกเลิกวันลาของครู {name} ตั้งแต่ {from} ถึง {to}? | Cancel {name}'s leave from {from} to {to}? |
| `cancelRangeBody` | วันที่ยังไม่ถึงจะกลับมาจองคาบกับครูได้ตามปกติ วันที่เริ่มหรือผ่านไปแล้วคงไว้ตามเดิม คาบที่มีอยู่แล้วไม่มีอะไรเปลี่ยน และระบบจะแจ้งครูทาง LINE | The days still ahead open for bookings with this teacher again. Days that have already begun stay as they are. Existing classes don't change. The teacher is told on LINE. |
**Not proven:** a real browser (the booking modal is the real component, but under a faked wire) and the real `DELETE`/list against the real back. The mock mode answers the range lift inline (empty).
**`git status --short -uall` (front, whole release so far):** the 814 + 816 + 818 files (unchanged) + ` M LeaveDayBanner.tsx` (this task) + `?? LeaveChip.tsx` · `?? LeaveDayPanel.tsx` · `?? LiftRangeConfirm.tsx` · `?? LeaveClassOpener.tsx` · `?? leave-panel-task820.dom.test.tsx` · `?? scripts/mutation/task-820.json` + the shared ` M` files (`useScheduler.ts`, `scheduler.service.ts`, `contract.ts`, `dictionaries.ts`, `action-gate.test.ts`).
**BALL: @Sober** (verify → GO 821).

---
## ✅ 2026-10-17 — @Sober: TASK-820 VERIFIED (one own-team pin to re-aim, done as the first step of 821)
- **Clean copy** of front `d1d0a99` + the tree (814 + 816 + 818 + 820): tsc 0 · `bun test` **1,237 / 0**, 137 files · unhandled 0 · set **20/20** (0 survivors).
- **`bun run build`:** 0 in the real tree, which it leaves unchanged.
- **Read by me:** `LeaveDayPanel.tsx` holds **no booking-write hook or mutation**. Its only write is the leave lift (per day / range). "Open" mounts the real `BookingModal`. `CalendarContent.tsx` is untouched.
- **Your 814 test re-aim** (Cancel now inside the panel): accepted; the assertions are unchanged.
- **Inventory:** `LeaveDayPanel.tsx → action:calendar.status` (standing grant).
- **🔧 TASK-589's pin, RULED (self-granted, standing rule):**
  - it now stays green only because the press-handlers live in another file. Its title ("NOT a control") is no longer true, so **re-aim it to the current truth**:
    - (a) the banner delegates each chip to `LeaveChip`;
    - (b) `LeaveDayPanel.tsx` contains **no booking-write** (no cancel / move / teacher-change / status hook or call), and its only mutations are the two leave lifts;
  - **retitle it** ("the chip opens the LEAVE; classes are never changed from the panel, only through the booking modal").
  - **Bite:** a mutation that adds a booking-cancel call to the panel must fail it.
  - Nothing else in `leave-days.test.ts`.
- **Wording:** 6 DRAFT keys, copied verbatim into `COPY-DRAFT-REQ-123-phase1-2026-10-17.md`.
