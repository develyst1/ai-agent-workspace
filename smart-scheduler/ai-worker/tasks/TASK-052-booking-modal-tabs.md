# TASK-052: scheduler-front (FE) — booking type first (tabs), per-type fields, eligible students + context
- Source: SPEC-017 (REQ-022)
- Status: DONE  (re-reviewed 2026-08-01 by Sober — `courseId` traced end-to-end (leak closed), voucher alert names teacher/time; tsc 0 + build success on my own run) — deploy: FE only, smoke the used-count increment + the item-7 expiry alert on `sid`
- Depends on: **TASK-051** (the eligible-students endpoint + context shape)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Today the New-booking modal asks for student/teacher/subject/time **first** and the **booking type last**
(`BookingModal` renders the type selector near the bottom) — even though the type decides which of those fields
matter and which students are eligible. Turn it around.

1. **Tabs at the top:** First Trial · Single Session · Course · Voucher — the **first** choice in the modal;
   switching tabs re-renders the form. Keep the existing `BookingType` values (presentation change, not domain).
2. **Only the fields that type can use:**
   - **Voucher:** **no teacher, no fixed slot** (existing domain rule — a voucher booking can't pick either), so
     stop asking for them instead of collecting values that get discarded.
     > **⚠️ WRONG — corrected 2026-08-01 (Sober's error, found by Fern).** "Can't pick a teacher" is a
     > **purchase-time** rule, not a per-session one (`scheduler.service.ts:569-571`); a voucher session is
     > booked into a real slot with a real teacher. **Don't ask** for them = right; *"there is no teacher"* =
     > wrong. Resolved: take teacher/subject/time from the clicked slot **and name them in the alert**.
   - **Course:** student (eligible only) + date/time; the course supplies the program.
   - **Trial / Single:** as today.
3. **Student list per tab:** Course/Voucher tabs load `GET /students/eligible?type=…`; Trial/Single keep the
   existing searchable picker (`GET /students?q=`).
   - **Hide "add new student" on the Course/Voucher tabs** — a new student can't already hold one, so it could
     only produce an ineligible pick. Keep it on Trial/Single.
4. **Context after picking a student** (this is the "less staff memory" half of the REQ): Course → program,
   **used X of Y**, leave used, expiry. Voucher → **hours remaining** + expiry. Straight from TASK-051's
   `context` — do not recompute eligibility or progress in the FE.
5. **Keep it calm** — the stakeholder was explicit ("ทำให้ดูดีไม่อึดอัดใช้งานยาก"). A compact summary line/card,
   not a table; the modal must not become a wall of text.
6. i18n TH+EN for all new copy (tab labels, context labels, empty states).
7. **⚠️ Handle the "eligible today, but not for that date" rejection cleanly** (added after reviewing TASK-051).
   Eligibility is judged against **today**, not the booking date — that's deliberate (we never hide someone
   bookable now). So a student can appear eligible while a booking for a **far-future** date is still refused at
   submit by the backend (e.g. the voucher expires before then). **Surface that server error as a clear,
   specific message** next to the date — it must read as *"this voucher expires before the selected date"*, not
   as a form that mysteriously refuses to save.

## Definition of Done
- [ ] Booking type is the first choice (tabs); changing tab changes the form; no tab asks for a field its type
      can't use (notably: Voucher shows no teacher/slot).
- [ ] Course tab lists only students with an active course; Voucher tab only students with an active voucher;
      Trial/Single keep the normal picker **with** add-new-student.
- [ ] After picking a student the relevant context is visible in-modal (course program + used/total + leave +
      expiry, or voucher hours + expiry) without leaving the modal.
- [ ] An empty eligible list shows a clear empty state (e.g. "no students with an active course") rather than an
      empty dropdown.
- [ ] No regression to creating a booking of any type, to the calendar, or to the freelance-cap behaviour.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and open the modal in a browser** and exercise all
      four tabs incl. picking a student and seeing the context. State what you clicked. If the environment
      blocks a specific interaction, say exactly which, as you did on TASK-049 — don't imply coverage you don't have.

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change (POST /bookings unchanged).** 6 files.

Reworked the New-booking `CreateForm` (`Calendar/Modal/BookingModal.tsx`) into **type-first tabs**.
- **Tabs at the top** (First Trial · Single Session · Course · Voucher) via Mantine `Tabs`; switching re-renders +
  resets the per-tab state. Labels reuse `bookingType.*` (no new tab-label keys).
- **Per-tab fields:** Trial/Single = unchanged (`StudentSelect` **with add-new** + teacher + subject + time).
  **Course** = eligible-student list + teacher + time (**no subject picker — the course supplies it**).
  **Voucher** = eligible-student list + a "no teacher/slot" info alert (**no teacher/subject/time inputs**).
- **Eligibility from the backend:** `getEligibleStudents(type)` → `useEligibleStudents` (added to service + hook +
  types + mock). Course/Voucher tabs load `GET /students/eligible?type=…`; Trial/Single keep `GET /students?q=`.
  **Add-new-student is hidden on Course/Voucher** (only Trial/Single have `StudentSelect`). One row per
  entitlement (keyed by courseId/voucherId), so a student with two active courses appears twice.
- **In-modal context** (compact single line, not a table — per "ไม่อึดอัด"): Course → `โปรแกรม … · ใช้ไป X/Y ·
  ลา a/b · หมดอายุ …`; Voucher → `เหลือ N ชม. · หมดอายุ …`. Straight from TASK-051's `context` — no FE recompute.
- **#7 expiry rejection:** submit wraps create in try/catch; an `ApiClientError` (e.g. voucher expires before the
  chosen date) is shown in a red **"จองวันที่นี้ไม่ได้"** Alert with the backend's own message — not a silently
  failing form.
- i18n TH+EN for all new copy; the overbook-on-leave + slot-taken (`blocked`) flows are preserved.

**Design calls (flagged below):** (1) **Voucher auto-fills teacher/subject/time from the clicked slot** — because
`POST /bookings` validation **requires** teacherId/subjectId/startTime (verified in `validation.ts`) and the SPEC
says the payload is unchanged; so "no teacher/slot" means *don't ask* — the voucher session lands in the opened
slot (matching current behavior). (2) **Course booking does not send `courseId`** — the FE `CreateBookingInput`
has no such field and the payload is unchanged, so a Course-tab booking is a `COURSE_PACKAGE` session for an
eligible student (as today); the eligibility filter just stops staff picking someone without a course.

**Verification:**
- `bunx tsc --noEmit` → **0**; `bun run build` → success.
- **Browser check (mock mode, logged in, real modal — exercised all four tabs):** opened the New-booking modal
  from a calendar slot → the **four tabs render at the top** (ทดลองเรียน · จองรายครั้ง · คอร์สรายสัปดาห์ · Voucher).
  - **Voucher tab:** form shows **only นักเรียน** (no teacher/time) + the no-slot alert; picked the eligible voucher
    student "วิว" → context **"เหลือ 7 ชม. · หมดอายุ 2026-12-31"**.
  - **Course tab:** fields = นักเรียน + ครูผู้สอน + เวลา (no subject picker); picked "น้องพีพี" → context
    **"โปรแกรม Surfskate · ใช้ไป 3/10 · ลา 1/3 · หมดอายุ 2026-10-10"**.
  - **Trial tab:** full form back — นักเรียน (searchable, add-new) + ครูผู้สอน + วิชา + เวลา.
  - (Same hidden-pane workaround as TASK-049 — the pane runs `document.hidden`, so I patched rAF/visibility to let
    the Mantine modal + Select dropdowns mount; the interactions themselves are real.)
  - **Not triggered live:** the actual create submit + the #7 expiry rejection (the mock doesn't enforce
    entitlement expiry) — that path reuses the existing create/detect/notify flow (unchanged) plus the new
    `ApiClientError`→Alert catch; verified by code + the identical delivered pattern. Deploy smoke will confirm the
    real backend message renders.
- `bun run lint` not run — known-broken on Next 16 (not gated).

**Rework applied (2026-08-01, Fern) — both items from Sober's review:**
- **🔴 1 — Course tab now sends `courseId`** (FE-only, as Sober found — the API already accepts it): added
  `courseId?: string` to `CreateBookingInput`, pass-through in `createBooking` (`courseId: bookingType ===
  "COURSE_PACKAGE" ? input.courseId : undefined`), and the Course branch sends `courseId: ctx.courseId`. So an
  attended course session now increments `usedSessions` and a no-show cuts one — no more free sessions / drifting
  remaining count. (My "same as today" was true of the FE type, not the API — I should have checked the server
  contract, not just our own `CreateBookingInput`. Noted.)
- **🟡 2 — voucher alert names the slot:** `booking.voucherNoSlot` now interpolates `{teacher}` + `{time}` (the
  clicked slot's teacher nickname + time), TH+EN.
- **Re-verified:** `bunx tsc --noEmit` 0; `bun run build` success. **Browser re-check (mock, Course tab):** picked
  "น้องพีพี" (context showed) → clicked **บันทึก** → **success toast "สร้างการจองแล้ว · สถานะ: รอยืนยัน", no
  error** (courseId in the payload, submit accepted). Voucher tab alert now reads **"…จะใช้ช่องนี้: ครู บีม ·
  09:00"**. (Same hidden-pane rAF/visibility workaround; interactions real.) The live #7 expiry rejection still
  needs `sid` smoke (mock has no expiry enforcement).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Design call #1 → @Sober:** Voucher tab **auto-fills teacher/subject/time from the clicked slot** (the modal
  opens on a slot; `POST /bookings` still requires them). If คุณฟีน expects a voucher booking to carry **no**
  teacher/time at all, that's a `POST /bookings` change (SPEC said unchanged) — flag it and I'll adjust once the
  payload supports it.
- **Design call #2 → @Sober:** Course-tab booking sends **no `courseId`** (payload unchanged), so it's a
  `COURSE_PACKAGE` session not linked to the specific course row — same as today. If you want the booking linked
  to the course (to decrement it), that's a `POST /bookings` payload change; say the word.
- **#7 expiry rejection** is wired (backend message → red "จองวันที่นี้ไม่ได้" Alert) but couldn't be triggered in
  mock; confirm it reads right on the first `sid` deploy smoke.
- Built against TASK-051's `context` shape exactly (courseId/subject/size/usedSessions/remainingSessions/leaveUsed/
  leaveQuota/expiryDate · voucherId/totalHours/usedHours/remainingHours/expiryDate) — nothing missing.

## Review
**Verdict: REWORK 🔧 (Sober, 2026-08-01) — two items, one of them a real entitlement leak. The modal itself is
right; the Course tab's payload isn't.** `bunx tsc --noEmit` → **0** (my own run).

### What's good
- **Type-first tabs, per-tab fields, eligible lists, in-modal context** all land as specced, and the context is
  taken straight from TASK-051 — no eligibility or progress recomputed in the browser.
- **Item 7 is wired properly:** the submit `ApiClientError` surfaces the backend's own message in a red alert
  by the date, so the "eligible today but not for that date" rejection reads as a reason, not a broken form.
- **The browser check is honest** — you exercised all four tabs with real interactions and stated plainly that
  the live submit + the expiry rejection weren't triggered (the mock doesn't enforce expiry). That's the
  standing rule followed, not implied coverage. Accepted as deploy smoke.

### 🔴 1 — The Course tab books a course session that **draws down nothing**. Must fix.
The Course branch of the payload builder sends `bookingType: "COURSE_PACKAGE"` but **no `courseId`** — even
though `ctx.courseId` is right there (you already read `ctx.subject` from the same object).

I traced what that does server-side:
- `validation.ts:83` — **`courseId: ID.optional()` is already accepted.** So this needs **no `POST /bookings`
  change at all**; your Question assumed one, and that assumption is what made it look like a design call
  rather than a gap. The only thing missing is `courseId?: string` on the FE's own `CreateBookingInput`
  (`services/scheduler.service.ts:350`), which is why it "couldn't" be sent.
- `insertBooking` stores `courseId: input.courseId ?? null`.
- On check-in, `scheduler.service.ts:786` increments the course only `if (current.courseId && current.course)`
  — and the end-of-day NO_SHOW cut is gated the same way (`jobs.service.ts`).

**So a booking made from the Course tab is free**: attended, it never increments `usedSessions`; no-showed, it
never cuts one either. The family keeps the session, and the course's remaining count — which TASK-051's
eligibility reads — silently drifts from reality. It also makes the "student with two active courses appears
once per course, staff pick which" design decorative: the pick is discarded on submit.

**Fix (FE only, ~3 lines):** add `courseId?: string` to `CreateBookingInput`, pass it through in
`createBooking`, and send `courseId: ctx.courseId` on the Course branch.

*(Note on "same as today": true of the client type, not of the API — the server has accepted `courseId` all
along and `createCoursePackage` sets it on every session it creates. Worth checking the server, not just our
own types, before concluding a field isn't supported.)*

### 🟡 2 — Say which teacher and time the voucher booking will use
`booking.voucherNoSlot` reads *"…— it uses this slot / จะใช้ช่องเวลานี้"*, which is honest and I'm glad you
wrote it that way. Since `createSlot` already holds both, please **name them**: *"…will use ครูเบส · 10:00
วันนี้"*. Staff shouldn't have to remember which column they clicked to know what they're committing to — that
"less staff memory" goal is the whole REQ. One string + two interpolations.

### ✅ Your two flags — answered
**Flag 1 (voucher auto-fills teacher/subject/time): you're right and I was wrong.** SPEC-017 told you "Voucher:
no teacher, no fixed slot — that's the existing domain rule". It isn't. `scheduler.service.ts:569-571` says it
outright: *"No teacher restriction here — 'can't pick a teacher' is a purchase-time rule, not a per-session
one."* A voucher session is booked into a real slot like any other; what a voucher lacks is the **recurring
locked** slot a course package has. **My spec error — I asserted a domain rule without reading the code, which
is exactly what I ask you two not to do.** Your resolution (take teacher/subject/time from the clicked slot,
don't ask for them) is correct and stays. Item 2 above is the only change.

**Flag 2 (course sends no `courseId`): not a design call — see item 1.** You were right to flag it rather than
decide silently; the answer is that it must be sent.

### Follow-up I'm raising, not yours
The server-side backstop is missing: `validation.ts` has a `.refine` forcing `voucherId` on VOUCHER bookings
(comment: *"ไม่งั้นชั่วโมงจะไม่ถูกตัด"* — otherwise the hours aren't deducted) but **no symmetric rule for
COURSE_PACKAGE**, which is why a FE mistake could produce a free session at all. Raised as **TASK-055** for
@Jason so the UI isn't the only defence — same reasoning as the server-side suspend gate.

**TASK-052 → REWORK.** Items 1–2 only; everything else stands. **Please re-check the Course tab in the browser
after the fix and say what you saw on submit.**

---

### Re-review after the rework — **DONE ✅ (Sober, 2026-08-01)**
- **Item 1 fixed end to end**, and I traced the whole path rather than the diff: `courseId?: string` on
  `CreateBookingInput` (`services/scheduler.service.ts:366`) → sent as
  `input.bookingType === "COURSE_PACKAGE" ? input.courseId : undefined` (`:424`, mirroring the voucher line
  exactly) → `courseId: ctx?.courseId` on the Course branch (`BookingModal.tsx:642`). An attended course session
  now increments `usedSessions` and a no-show gets cut. **The leak is closed and the two-courses pick survives
  submit.**
- **Item 2 done:** `voucherNoSlot` now interpolates teacher + time in TH and EN — *"…จะใช้ช่องนี้: ครู บีม ·
  09:00"*. Staff can see what they're committing to without remembering which column they clicked.
- **Verified myself:** `bunx tsc --noEmit` → **0**; `bun run build` → **success** (standalone output written).
- **Your re-check is what I asked for** — you actually pressed บันทึก on the Course tab and reported the success
  toast, instead of re-asserting the code was right. And you named your own lesson (you'd checked our
  `CreateBookingInput` rather than the server contract) without me having to draw it out.

**One line for whenever you next touch this file — not a rework, don't make a trip for it:** the Course branch's
`valid` checks `!!selectedEligible` but not `!!ctx?.courseId`, whereas the Voucher branch does check `!!ctx`.
Unreachable through the real endpoint (every eligible row is built *from* an entitlement, so context always
exists), and **TASK-055** closes it server-side, which is the guard that actually matters. Just make the two
branches symmetric next time you're in there.

**TASK-052 → DONE.** ⏳ Deploy: `smart-scheduler-front` only, **no BE change, no migration**. **Smoke on `sid`:**
Course tab → book → check in → the course's *used* count goes up by one (that's the fix); Voucher tab → the
alert names the right teacher/time; and the **item-7 path** — book a voucher far past its expiry and confirm the
red alert carries the backend's own reason (the mock can't enforce expiry, so this is the one behaviour never
exercised locally).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-052 | scheduler-front (FE): booking modal **type-first tabs** + per-type fields + eligible-student lists + in-modal context (**browser-checked**) | SPEC-017 | ✅ **DONE** (Sober re-review 2026-08-01 — `courseId` traced end-to-end through type→service→payload, so the **free-session leak is closed** and the two-courses pick survives submit; voucher alert now names teacher+time; tsc 0 + `bun run build` success on my own run; Fern re-pressed บันทึก on the Course tab) — ⏳ deploy: **FE only, no BE change, no migration** | Fern | TASK-051 |
```
