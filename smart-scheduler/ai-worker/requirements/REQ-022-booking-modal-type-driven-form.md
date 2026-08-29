# REQ-022: Booking modal — booking type drives the form (tabs), with contextual student filtering
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-01 by stakeholder (คุณฟีน), from a walkthrough of the live New-booking modal
- Deadline: none
- Source: stakeholder review of `/scheduler/calendar` → New booking modal.

## Problem / Goal
On the New-booking modal, **Booking type sits near the bottom**, *below* the fields it actually governs
(student, teacher, subject, time). Staff fill things in and only then choose the type — even though the type
decides which of those fields are relevant, and which students are even eligible.

Concretely today: a **Voucher** booking cannot have a chosen teacher or fixed slot (a domain rule), yet the
form asks for teacher and time first. And for a **course session**, staff must know from memory which students
have an active course and how far along they are — the form gives no help at all.

Goal: **choose the booking type first, then show only what that type needs**, with the student list and the
student's context matched to that type. Fewer wrong bookings, less staff memory.

## Requirement
1. **Booking type becomes the first choice** — presented as a **tab bar at the top of the modal** — and the rest
   of the form changes to match the selected tab.
2. Each tab shows **only the fields that type needs**, and does not ask for fields that type cannot use (e.g. a
   voucher booking must not ask staff to pick a teacher/slot it will ignore).
3. **The student list is filtered to students eligible for that type:**
   - **Course tab** → only students who **already have a course**.
   - **Voucher tab** → only students who **have an active voucher**.
4. **Show the student's context for that type once they're picked**, so staff don't have to look it up:
   - Course: which course/program, progress (e.g. used 4 of 10), leave used, expiry.
   - Voucher: hours remaining and expiry.
5. **It must look clean and not cramped** — the stakeholder was explicit: "ทำให้ดูดีไม่อึดอัดใช้งานยาก". Adding
   context must not turn the modal into a wall of text.

## Acceptance Criteria
- [ ] Booking type is chosen **first**, from tabs at the top; changing tabs changes the form.
- [ ] No tab asks for a field that its booking type cannot use.
- [ ] On the Course tab the student list contains only students with a course; on the Voucher tab only students
      with an active voucher.
- [ ] After picking a student, their relevant context (course + progress, or voucher hours + expiry) is visible
      without leaving the modal.
- [ ] The modal stays comfortable to use — not visually crowded.
- [ ] No regression: existing booking creation for every type still works.

## Analysis / current state (Porter, read-only — for Sober to verify)
- The modal renders one flat form with `bookingType` as a Select **below** subject/time; there is an `isVoucher`
  branch, so *some* adaptation exists, but the ordering still invites filling fields the type may discard.
- The student picker is the **global** search (`GET /students?q=`) with no eligibility filter, and shows no
  course/voucher context.
- Domain rules that make this matter: **VOUCHER has no fixed slot and no chosen teacher**; **COURSE_PACKAGE**
  tracks size 4/6/10, `usedSessions`, `leaveUsed`, and an expiry.
- **Scope note (confirmed with the stakeholder):** the **Course tab means booking an additional session for a
  student who ALREADY has a course** — *not* registering a new course. New course registration stays where it is
  (the Bookings page). Same reading for Voucher.

## Constraints
- Frontoffice only (`smart-scheduler-front` + scheduling API). Backend may need eligibility/context endpoints.
- Do not change the booking domain rules — this is about surfacing them, not altering them.
- HOW (tabs vs segmented control, where the context sits, which endpoints) is the SA's design.

## Out of Scope
- Registering a **new** course or selling a voucher from this modal.
- The demographics/incomplete-data flag → REQ-019 / REQ-023.

## Questions
(SA + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`.)
1. On the **Course/Voucher tabs**, what should staff see if the student they want has **no** course/voucher —
   hidden entirely, or shown greyed with "no active course" so they know why? (Porter's lean: shown but
   disabled, with the reason — silently missing people generates support questions.)
2. Should the tab set be **Single · Trial · Course · Voucher** (the four booking types), or fewer? (Porter's
   lean: all four, since each has genuinely different needs.)
3. Anything else staff routinely look up while booking that should appear alongside the course/voucher context?

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-022 | Booking modal — booking type drives the form (tabs) + contextual student filtering | MEDIUM | ✅ 🧪 **`TEST_PASSED` (Tanya, 2026-08-04) — CLOSED ON PREVENTION**, per the owner's ruling: an expired voucher never reaching the eligible list *is* the promise kept, and the red alert stays as the race-only safety net. Backend refusal proven (TEST-022b `400 "วอยเชอร์หมดอายุแล้ว"`) and the generic reason-surfacing path proven live in the plan modal. _The finding that led to the ruling:_ **the alert is unreachable through the UI.** On the Voucher tab, searching `QA-expv` returns **no options** — `GET /students/eligible?type=VOUCHER` lists only students with a **live** voucher, so the expired one is filtered out **server-side** (REQ-022's own "eligibility is a backend answer" design). The promise is therefore kept by **prevention**, not by the alert; the alert can now only fire on a race. Backend refusal already proven (TEST-022b `400 "วอยเชอร์หมดอายุแล้ว"`), and the **generic reason-surfacing path is now proven live** the same day: a plan-modal clash returned `409 SLOT_TAKEN` and the modal rendered the red alert **"ครูมีคาบในช่วงเวลานี้แล้ว"**. **@Porter — AC-intent call: does REQ-022 close on prevention, or must the alert itself be demonstrated?** Prior: ✅ **DELIVERED** — **acceptance PASSED 2026-08-01** (stakeholder ran, Porter verified): type-first tabs change the form; Course/Voucher tabs list only eligible students with their context; Voucher tab offers no teacher/slot. 🔴 **The review-caught defect is confirmed fixed: booking from the Course tab → check-in → the course's used count incremented** (previously course sessions were free). ⚠️ **One path still UNVERIFIED — the expired-voucher red alert** was not exercised (needs an actually-expired voucher). Risk judged low: it renders through the **same generic error surfacing that this same round proved working** on the suspend `400`. Worth a look the first time a real voucher expires. **🧪 QA update (Tanya, 2026-08-02, TEST-022b): the BACKEND half is now PROVEN on `sid`** — I built a genuinely expired voucher (5h, expiry forced to 2026-04-05 via a past first booking) and a later booking was refused `400 "วอยเชอร์หมดอายุแล้ว"`, 0 hours drawn. **The red ALERT itself is still `NOT TESTED`** (painted — owner runs `tests/CLICK-SCRIPTS-owner.md` #3, which reuses the QA-expv expired voucher). REQ-022 stays open on that one painted line. | **@Porter — deploy (FE+BE already built) + acceptance. ALL TASKS DONE 2026-08-01** (TASK-051 ✅ · TASK-052 ✅). ⚠️ **Acceptance must include: book from the Course tab → check in → the course's *used* count goes up by one** (a `courseId` gap was caught in review that would have made course sessions free) **and a voucher booked past its expiry showing the red reason alert**. Follow-up **TASK-055** (server backstop) is @Jason's, not a blocker. SPEC-017 (2026-08-01). Verified as-built: the modal really does render the type selector **near the bottom** (`BookingModal:682`) below the fields it governs, and the backend has courses/vouchers but **no "who is eligible" answer**. Design = **eligibility is a backend answer, not an FE filter** — `GET /students/eligible?type=…` returns eligible students **with their context** (course program/used-of-total/leave/expiry, or voucher hours/expiry) in one call, because "active course/voucher" is a **domain rule** and a second copy in the browser would drift. FE = tabs first, per-tab fields (**Voucher shows no teacher/slot** — the existing domain rule), eligible lists, compact context ("ไม่อึดอัด" per คุณฟีน). **2 reversible design calls (FYI):** add-new-student hidden on Course/Voucher tabs (it could only create an ineligible pick); a student with 2 active courses appears once per course. _Porter's original:_ From คุณฟีน's walkthrough of the live New-booking modal 2026-08-01: **booking type becomes a TAB BAR at the top** and the form changes per tab, instead of type sitting *below* the fields it governs. **Course tab → only students who already have a course** (booking an extra session, NOT registering a new course — confirmed); **Voucher tab → only students with an active voucher** and no teacher/slot pickers (domain rule). After picking a student, show their context (course + used/total + leave + expiry · or voucher hours + expiry). **Must stay uncluttered** — her words: "ทำให้ดูดีไม่อึดอัดใช้งานยาก". Qs in REQ: ineligible students hidden vs disabled-with-reason; tab set; what else staff look up while booking. |
```
