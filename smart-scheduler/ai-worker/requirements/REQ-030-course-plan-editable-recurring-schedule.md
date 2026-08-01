# REQ-030: A course is an editable PLAN — per-session teacher/date, planned absences, inserts, and the end date follows

- Status: DRAFT — needs SA design + 4 stakeholder answers below
- Priority: 🔴 **HIGH — this is the core of "the frontoffice must be right"** and it is the mechanism REQ-025's go-live migration depends on
- Requested: 2026-08-01 by the project owner
- Deadline: go-live **2026-08-20**
- Source: owner, in her own words (below). Supersedes the narrow "add leave dates at purchase" idea raised earlier the same day.

## The owner's requirement, verbatim

> *"ฉันซื้อคอร์สวันเสาร์นี้ 6 สัปดาห์ กับครูคนไหน วิชาไหน ในวันไหนบ้างล่ะ ต้องมีตารางให้ลงเลย ว่าเสาร์นี้ครู A
> เสาร์หน้าขอครู B เสาร์ต่อไปกลับมาครู A อีก เสาร์ต่อไปลารอไว้เลย มีนัดด่วน ต้องบวกไปสัปดาห์ต่อๆ ไป จาก re
> 6 สัปดาห์ เป็นจบสัปดาห์ที่ 7 แล้วพอกดเพิ่มแทรกเข้าไปในตารางเป็นวันอาทิตย์ คอร์สก็จะกลับมาจบในสัปดาห์ที่ 6
> เหมือนเดิม"*
>
> *"มันต้องทำงานกับ recurring date เสมอ"*

## Problem / Goal

Today, buying a course **generates a fixed weekly chain**: same weekday, same time, same teacher, N sessions, and
that's that. Reality is not fixed:

- **the teacher varies by week** — this Saturday coach A, next Saturday coach B, then back to A;
- **the family already knows they'll miss a date** when they buy;
- **a session gets inserted** on a different day to catch up;
- and **each of those changes when the course finishes.**

The system models a course as *a recurrence*. **The business treats it as a plan.** Everything the owner listed
is ordinary scheduling, and today every one of it has to be fought with after the fact — generate the wrong
chain, then hunt through the calendar cancelling and re-adding sessions one at a time.

**Goal: the course plan is visible and editable, and the course's end follows the plan automatically.**

## Requirement

1. **At purchase, staff see the generated plan as a table before committing** — one row per session with
   **date · time · teacher · subject** — and can change any of it.
2. **Teacher and subject may differ per session.** The recurrence is a starting suggestion, not a constraint.
3. **A session can be marked as a planned absence** ("we already know we can't come"). The course **extends** —
   6 sessions ending week 6 becomes week 7.
4. **A session can be inserted** on any day/slot (the owner's example: a Sunday make-up). The course **contracts
   back** — week 7 returns to week 6.
5. **The end date is always derived from the plan**, never stored as a fixed assumption. Any edit recomputes it.
6. **The same plan is manageable after purchase**, from two places, because the owner asked for both and they
   serve different moments:
   - **(1) the calendar** — because that is where slots, clashes and teacher availability are visible;
   - **(2) the course/booking screen** — a list view of *this child's plan*, which the owner expects to be
     easier for an admin managing one family's absences (*"มันอาจจะง่ายกว่านะ ... ในมุมของผู้ใช้ (admin)"*).
7. Every edit is still subject to the existing guarantees: **no double-booking**, teacher availability, and the
   freelance ceiling.

## Acceptance Criteria

- [ ] Buying a 6-session Saturday course shows 6 editable rows before it is created.
- [ ] Setting session 2 to a different teacher works, and the calendar shows that teacher for that week only.
- [ ] Marking session 4 as a planned absence adds a session at the end; the stated end date moves out by a week.
- [ ] Inserting a make-up session on a Sunday moves the end date back in.
- [ ] The same edits are possible after purchase, from **both** the calendar and the course screen, with the
      same result.
- [ ] A conflicting edit (busy teacher, taken slot, freelance ceiling full) is **refused with a reason** — not
      silently dropped, and not silently accepted.
- [ ] Sessions already attended cannot be edited away.

## Analysis / current state (Porter, read-only — for SA to verify)

- **`POST /courses` generates the chain and books it in one shot**; a clash anywhere aborts the whole
  registration. **There is no "preview then confirm" step and no per-session override** — this is the gap.
- **Leave exists, but only as an after-the-fact event**: cancel that session, increment `leaveUsed`, auto-append
  one at the end, and lock when over quota (4→1, 6→2, 10→3). **A planned absence is a different thing from a
  sick day**, and today there is no way to express it — see Question 1, which is the one I most want answered
  before design.
- **"Book a session against an existing course" already exists** (the Course tab, REQ-022/TASK-051) — so the
  insert half has a foundation. The owner asked *"จองคอร์สมีไปทำไม"* about that tab; **this REQ is its answer**:
  it is the mechanism for adjusting a plan, and it is what REQ-025's migration will use to place a mid-course
  child's remaining sessions.

### ⚠️ Four interactions I want the SA to design deliberately, not discover

1. **Per-session teacher × the freelance ceiling.** The ceiling is drawn per booking against **that** teacher
   (`reconcileFreelanceDraw`, TASK-028). Changing session 2 from coach A to coach B must **release A and draw
   B**, inside the same transaction. The reconcile-to-target design should handle it — **but it was written for
   status changes, not teacher changes.** Verify rather than assume; this is money.
2. **The extension ceiling becomes load-bearing.** `MAX_WEEK_BY_SIZE` caps how far a course may extend
   (4→week 5, 10→week 13) — and **the 6-session value of "week 8" is a long-standing unconfirmed assumption**
   flagged in the root `CLAUDE.md`. Planned absences push against that cap directly, so **the guess is about to
   start affecting real customers.** @Porter will get it confirmed.
3. **Every edit is a re-validation.** Changing a date/teacher/slot must re-run the same conflict checks as a new
   booking. The partial unique index on `(teacherId, date, startTime)` protects the database — but the user
   deserves the reason before the constraint fires.
4. **Two entry points, one behaviour.** Requirement 6 asks for calendar *and* course screen. **They must share
   one implementation of "apply a plan change".** Two code paths for one rule is how the same policy ends up
   with two answers — the trap Jason avoided on TASK-058 by keeping one `SUSPENDED_MESSAGE`.

## Constraints

- Frontoffice + scheduling API. Server enforces; the UI may preview.
- **Never silently discard a staff edit.** If it can't be applied, say why.
- Attended history is immutable.
- HOW (plan table shape, whether a plan is persisted or derived from its bookings) is the SA's design.
  📌 One thought, not an instruction: the sessions **are** the plan. A separate plan entity that can disagree
  with the bookings is a second source of truth, and this project has already paid for one of those.

## Out of Scope

- Registering a course **already in progress** → **REQ-025** (but they share this machinery — design together).
- Voucher scheduling — vouchers have no fixed plan by definition.
- Changing the leave-quota or extension **rules** themselves; this REQ makes them visible and plannable.

## Questions

1. 🔴 **Does a planned absence consume the sick-leave quota?** A 6-session course allows 2 leaves. If a parent
   marks 3 known absences at purchase, is that (a) refused, (b) allowed and unlocked because it was planned
   honestly up front, or (c) allowed but locked like any over-quota case?
   *(Porter's lean: **(b) — planned absences are a different thing.** The quota exists to stop open-ended
   rescheduling of a course that has already started; a family telling us their dates on day one is the
   opposite behaviour and arguably deserves encouraging. But this is a commercial policy, not a technical
   choice, and it is the answer the whole design hangs on.)*
2. **Is there a limit to how far a course may be pushed out?** Related: **the 6-session extension ceiling
   ("week 8") has never been confirmed** and this feature will start exercising it for real.
3. **Can staff change the teacher on a session that is already confirmed and notified?** The teacher was already
   pushed a LINE message. *(Porter's lean: yes, but **both** teachers must be notified — the old one that it is
   off their schedule, the new one that it is on. A silent reassignment means someone doesn't turn up.)*
4. **Does an inserted make-up session cost the family anything?** *(Porter's lean: no — it is a session they
   already bought, moved. But it must draw a freelance teacher's budget, because the teacher is paid for
   teaching it.)*

---

## ✅ ANSWERS (owner, 2026-08-01) — all four, plus one new rule

**Q1 — planned absences: counted, but never locking. ⚠️ Read this carefully, it is two rules not one.**
> *"ควรสิ"* (should they count against the quota) · *"ข ตามที่นายคิดเลย เพราะเขาจะวางแผนมาแล้วว่าเขาจะมาไม่ได้
> แน่ๆ ตามแผน ในสัปดาห์ไหนบ้าง"*

**Porter's reading, stated explicitly so it can be corrected rather than assumed:**
- a planned absence **DOES consume the leave quota** — it increments `leaveUsed` and **earns the extension**,
  exactly like a sick day;
- but going **over** quota this way **does NOT lock the course** — no admin unlock, no blocked state.

So the quota keeps driving *how the plan extends*, and stops being a *penalty* when the family declared the
dates up front. The lock still exists for its original purpose: **open-ended rescheduling after a course has
started.** Declaring absences honestly on day one is the opposite behaviour and is not punished.

**Q2 — the 6-session extension ceiling of "week 8" is CONFIRMED CORRECT** (*"ถูก"*). This closes a long-standing
assumption flagged in the root `CLAUDE.md` since the start of the project. It is now a stated rule, not a guess —
please treat it as load-bearing and test against it, since planned absences push straight into it.

**Q3 — a confirmed teacher CAN be swapped, and both must be told — but with a new constraint:**
> *"ใช่ แต่ควรมีเวลาว่าเปลี่ยนได้ล่วงหน้ากี่วันด้วย"*

**A minimum notice period for changing a teacher.** ❓ **The number is not decided — @Porter is getting it.**
Design it as a **named, configurable rule** (like the existing leave-notice rule, `lib/leave-notice.ts`: FT/PT
≥1h, FL ≥2h), not a literal buried in a handler. Note her unit is **days**, where leave notice is hours.

**Q4 — an inserted make-up session costs the family nothing** (it is a session they already bought), but it
**must still draw the freelance teacher's budget**, because the teacher is paid for teaching it.

## ➕ Requirement 8 — plan management belongs on the course AND voucher screens

> *"ฉันถึงอยากให้หน้า booking course + voucher มี manage plan ง่ายๆ ที่บอกว่าเขาจะจัดการแผนของน้องคนนี้ๆ
> ยังไงได้บ้าง ด้วย option course หรือ voucher นั้นๆ"*

8. From the Bookings page, staff can open **one child's entitlement** — a specific course *or* a specific
   voucher — and manage that entitlement's sessions in place: see the plan, mark a planned absence, insert a
   session, change a teacher, and see the resulting end date.
   - **For a course**, this is the plan defined above.
   - **For a voucher**, there is no recurrence — the "plan" is *the sessions booked against those hours*, plus
     how many hours remain. The management surface should still exist, because the admin's question is the same
     one: **"what does this child have, and how do I move it?"**

📌 **The owner has now asked for this view twice, in different words** — first as "manage plan on the booking
page", now again alongside the two-courses problem. That is a signal worth acting on: **the missing thing is a
per-entitlement view.** Both requests, plus REQ-029's two-identical-rows defect, plus REQ-025's migration, are
the same absence — **nowhere in the product can you look at one child's entitlement as a thing.**
