# REQ-070: A wrongly-marked `NO_SHOW` must be correctable to `ATTENDED` without charging the family twice
- Status: READY_FOR_SA
- Priority: **HIGH — live, on the customer's system, and the customer has asked for it by name**
- Requested: 2026-08-24 by the customer (ขวัญ), relayed by the owner
- Found: by the customer's own use, the morning after the `uat` day-end job ran for the first time

## What happened
The nightly `end-of-day` job ran on `uat` for the first time on 2026-08-23 23:30. It flipped **15 `CONFIRMED`
course sessions to `NO_SHOW`** and incremented `used_sessions` on each of their packages.

**The children attended.** Staff pressed `ยืนยัน` but never pressed `มาเรียน`. The customer:
> *"เด็กพวกนี้ขวัญกด confirm ไว้ แต่ไม่ได้มากด attend ให้ แต่น้องๆ มานั่นแหละค่ะ ... เรากดแก้ให้น้องมาเรียนปกติได้ไหมคะ
> ไม่ต้องเป็น noshow ค่ะ"*

## The problem — and why the obvious fix is worse than doing nothing
**The quota is already correct.** They attended, so one session *should* be consumed, and the job consumed one.
**Only the label is wrong.** But there is no way in the product to fix only the label:

- **Press `มาเรียน` on a `NO_SHOW` row** (`scheduler.service.ts:1904`): the guard is `if (current.status !==
  "ATTENDED")`, so it enters, sets `ATTENDED` ✅ **and increments `used_sessions` a second time** 🔴 —
  **the family is charged twice for one class.**
- **Cancel then re-mark:** `returnsConsumedUnit` is **`status === "ATTENDED"` only** (`lib/checkin-correction.ts:11`),
  so cancelling a `NO_SHOW` **does not give the unit back** — and the cancel path also re-owes a make-up session
  (`reconcileCoursePlan`), appending a session that was never bought. **Strictly worse.**

⇒ **Both available paths double-consume.** There is no correct move for the customer today, which is why she was
told to press nothing.

## Root cause
`used_sessions` has two writers — `attend` and the day-end `NO_SHOW` cut — but the correction helper
`returnsConsumedUnit` only recognises **`ATTENDED`** as a status that consumed a unit. **The job's consumption is
invisible to the correction path.** This could not surface until the job actually ran against real bookings, which
had never happened on either box until last night (`courses_cut` was 0 on every prior run).

## Requirement
1. **Correcting `NO_SHOW` → `ATTENDED` must leave `used_sessions` unchanged.** The unit was already consumed; the
   correction is to the *label*, not the ledger of usage.
2. It must be doable **by the customer's staff, in the product** — this is a daily-operations mistake, not an
   engineering event. **Not a script the owner runs.**
3. **The 15 existing rows on `uat` need repairing too** — a one-off, dry-run-first, owner-run correction for rows
   already wrong. SA to decide whether that is the same code path or a separate script.
4. Must not re-owe a make-up (the session was delivered), must not re-post or reverse revenue (course revenue posts
   at sale; these are `COURSE_PACKAGE`), and must not send a notification.

## Acceptance Criteria
- [ ] **AC-1** — Given a `NO_SHOW` course session, when staff mark it `มาเรียน`, then status becomes `ATTENDED`
      and **`used_sessions` is unchanged** (verified by count before/after).
- [ ] **AC-2** — Given an `ATTENDED` session, the existing behaviour is unchanged (marking attend from
      `PENDING`/`CONFIRMED` still consumes exactly one).
- [ ] **AC-3** — No make-up session is appended, the course `size` and end date are unchanged.
- [ ] **AC-4** — The same correction on a **voucher** session leaves `used_hours` unchanged.
- [ ] **AC-5** — The 15 affected `uat` rows are repaired: status `ATTENDED`, `used_sessions` back to what the
      children actually used (**not** +2), verified per course.
- [ ] **AC-6** — Re-running the repair changes nothing.

## Out of scope (named, so it is not silently bundled)
**Whether the day-end job should mark unmarked sessions `NO_SHOW` at all.** That is the bigger question this
incident raises and it belongs in its own REQ — the customer's Saturday is in three days and this one is the
bleeding to stop first.

## Questions for SA
- **Q1:** is "this row already consumed its unit" derivable at correction time, or does it need recording when the
  job consumes it (e.g. a flag / the `job_runs` summary already lists the booking ids)?
- **Q2:** should `returnsConsumedUnit` simply be widened to include `NO_SHOW`, or does that break the cancel path's
  make-up logic in a way that matters?

---

## 📌 OWNER'S DESIGN DECISION — 2026-08-24. This supersedes the fix shape above.
> *"ฉันว่าไม่ควรมี noshow ... นอกเหนือจากนี้ ให้ถือว่า ถ้าตอน dayend ทำงานแล้วเห็นคาบ confirm แต่ไม่มาเรียน
> ให้ปรับเป็นมาเรียนให้เลย"*

**The two legitimate flows are:** `จอง → confirm → กดมาเรียน` and `จอง → confirm → กดลา`. Anything else the
day-end job finds should become **`ATTENDED`**, not `NO_SHOW`.

**His two reasons, both of which the code supports:**
1. The quota is cut either way, so `NO_SHOW` adds **no mechanism — only a false claim about a child.** If the child
   really was absent, the parent phones and staff record a **backdated sick leave**, which is the truthful path.
2. Good customers are separated by **CRM points**, not by the status label: those who check in (LINE / QR / ask
   staff) earn; those who book and do nothing earn nothing.

### ✅ Verified against the code before accepting — the owner's read of the design is correct
- **`NO_SHOW` has exactly ONE writer in the entire codebase: our own day-end job** (`jobs.service.ts:47`). No
  screen, no API, no human can set it. **Nobody ever asserts it; the machine infers it from silence.** The schema
  comment says so outright (`schema.ts:52`): *"auto-cut end-of-day (UC-012): confirmed class, no check-in, no leave
  → quota cut."* **The label was a by-product of the cut, never a business fact.**
- **Quota already treats them as identical:** `COURSE_DELIVERED = new Set(["ATTENDED", "NO_SHOW"])`
  (`course-plan.ts:9`). ⇒ switching the label **changes nothing** about how a course is consumed.
- **The reward design he suspected is already built:** `CRM_POINT_RULES` — **`ON_TIME_CHECKIN: 10`**,
  **`PROPER_SICK_LEAVE: 5`** (`lib/crm.ts`) — with five levels (`น้องใหม่ → น่ารัก → น่ารักมาก → VIP น่ารัก →
  ซูเปอร์สตาร์`), a ladder endpoint (`/crm/levels`), and **QR check-in already awards the 10**
  (`checkin.service.ts`, `awardCrmPoints(...ON_TIME_CHECKIN)`). ⇒ **the "good customer vs ordinary customer"
  separation he wants exists and is earned by checking in — exactly independent of the status label.**

⇒ **Accepted.** His design does not paper over the double-consume defect — **it removes the state that causes it.**

### Revised requirement
1. **The day-end job writes `ATTENDED`** for a `CONFIRMED` session that ended with no check-in and no leave.
   Quota consumption is unchanged (it already consumes). **No CRM points awarded** — they did not check in, and
   that is precisely the signal the owner wants preserved.
2. **`NO_SHOW` stops being produced.** Do not rip the enum out — historical rows exist and must still render.
3. **Repair the 15 `uat` rows** from 2026-08-23: `NO_SHOW → ATTENDED`, **`used_sessions` untouched** (already
   correct — the children attended and one session was consumed). One-off, dry-run first, owner-run.
4. The double-consume defect (AC-1 above) still needs fixing **for the historical rows only**, since after (1) no
   new `NO_SHOW` can appear.

### ⚠️ The one thing that goes quiet — naming it rather than discovering it later
`attention.ts:79` flags **yesterday's `NO_SHOW`** in the 08:00 digest. With no `NO_SHOW` ever written, that check
becomes dead. **@Sober — decide deliberately:** drop it, or re-point it at something that still means something
(e.g. *"attended but never checked in"*, which is now the interesting signal and is exactly the low-CRM cohort).
Other read sites to sweep: `course-history.ts:52` · `scheduler.service.ts:701` (report counts) · `:2371`.
