# REQ-078: การจองลงตาราง แบบ other (อื่นๆ) — the owner's **REQ-005**

- Status: **READY_FOR_SA**
- Priority: 🔴 **HIGHEST** — the owner ranked it #1 of the remaining frontoffice work (`OWNER-LIST.md` §THE ORDER)
- Requested: 2026-08-29 by the owner (*"การจองลงตาราง แบบ other (อื่นๆ)"*); answers completed 2026-08-30
- Deadline: none stated
- Supersedes: the `§"booking type OTHER"` section inside `REQ-005-standalone-teacher-management.md`, which was a
  temporary home while the item was parked. **That section is now a pointer to this file.**

## Problem / Goal

The calendar can only hold four kinds of booking: `FIRST_TRIAL` · `SINGLE_SESSION` (1HR) · `COURSE_PACKAGE` ·
`VOUCHER`. **Everything else that occupies a real slot has nowhere to live** — a staff meeting, closing the rink
for maintenance, a one-off arrangement that does not match any product.

Today staff either leave those slots empty (so the calendar lies about availability) or fake them as a paid
booking (so the money is wrong). **The goal is a fifth type that is honest about being "something else".**

## The owner's answers — all five questions, now closed

| # | Question | Answer (2026-08-29 / 2026-08-30) |
|---|---|---|
| 1 | What IS "other"? | **A flexible booking the admin configures per instance** — charged or not, consuming or not, with or without a student. Not a fixed product. |
| 2 | Charged? At what price? | 🔴 **BOTH** (his option ค, 2026-08-30): the admin may **type an amount** *or* **pick an existing catalogue item**. |
| 3 | Consumes an entitlement? | **Optional, per instance.** |
| 4 | Teacher LINE? | ✅ **Answered 2026-08-31**, then **superseded the same day** by the multi-teacher rule below → **AC-16 (revised)**. The "no teacher" half is void: a teacher is now mandatory. |
| 5 | Day-end? | **The same rule as everything else** — an unmarked session auto-attends at 23:30. |
| — | Name when there is no student | 🔴 **The admin types it themselves** (2026-08-30). |

## Requirement

1. The system must offer **อื่นๆ (Other)** as a booking type wherever the four existing types are offered.
2. An "other" booking must be creatable **with or without a student**.
2b. 🔴 **A teacher is MANDATORY** (owner, 2026-08-31), and an "other" booking **may carry more than one teacher** —
   the only booking type that may. See the SCOPE CHANGE section at the end.
3. When there is **no student**, the admin must give the booking **a title they type themselves** — that title is
   what names the booking everywhere it appears.
4. Charging must be **optional**, and when charged the admin must be able to **either type an amount or choose an
   existing catalogue item**.
5. Consuming a course or voucher entitlement must be **optional**.
6. An unmarked "other" session must **auto-attend at 23:30**, exactly like every other type.
7. Cancelling an "other" booking must follow the **same reason-code path** as 1HR / Voucher / 1st Trial
   (REQ-074's stored, queryable reason).

## Acceptance Criteria

Tanya tests exactly this list.

- [ ] **AC-1 (the type exists)** — **Given** the booking form, **When** the admin opens the type picker,
      **Then** **อื่นๆ** appears alongside the four existing types, and choosing it lets the booking be saved.
- [ ] **AC-2 (no student)** — **Given** อื่นๆ is chosen and **no student is selected**, **When** the admin types a
      title and saves, **Then** the booking saves and the calendar cell shows **that title**.
- [ ] **AC-3 (with student)** — **Given** อื่นๆ is chosen **with** a student, **When** it is saved, **Then** it
      behaves like any other booking for that child and appears on their record.
- [ ] **AC-4 (free)** — **Given** อื่นๆ with charging left off, **When** the day ends, **Then** **no money is
      posted at all** — no sale, no movement, nothing in the books.
- [ ] **AC-5 (typed amount)** — **Given** อื่นๆ with a **typed** amount of ฿500, **When** it is attended and the
      day ends, **Then** ฿500 is posted, and the posted amount equals the typed amount exactly.
- [ ] **AC-6 (catalogue item)** — **Given** อื่นๆ charged by **choosing a catalogue item**, **When** it posts,
      **Then** the amount is the **item's own price** and the revenue is attributed to that item — not to a
      generic "other" bucket that no report can break down.
- [ ] **AC-7 (consumes)** — **Given** อื่นๆ set to consume a course session, **When** it is attended,
      **Then** exactly one session is deducted and the remaining count drops by one.
- [ ] **AC-8 (does not consume)** — **Given** อื่นๆ set **not** to consume, **When** it is attended, **Then** the
      child's remaining sessions are **unchanged**.
- [ ] **AC-9 (day-end)** — **Given** an อื่นๆ session nobody marked, **When** 23:30 passes, **Then** it becomes
      **ATTENDED**, the same as every other type.
- [ ] **AC-10 (negative — no title)** — **Given** อื่นๆ with **no student and no title**, **When** the admin
      saves, **Then** it is **refused with a message that says what is missing** — never a silent save, never a
      cell labelled with a blank or with the word "other".
- [ ] **AC-11 (negative — bad amount)** — **Given** a typed amount that is **0, negative, or not a number**,
      **When** the admin saves, **Then** it is refused with a clear message, and **nothing is booked**.
- [ ] **AC-12 (negative — both price sources)** — **Given** the admin has typed an amount **and** selected a
      catalogue item, **Then** the form must not silently pick one. It either prevents the combination or states
      plainly which one will be charged.
- [ ] **AC-13 (cancel)** — **Given** an อื่นๆ booking, **When** the admin cancels it, **Then** the same reason
      popup appears as for 1HR/Voucher, and the reason is **stored and queryable** (REQ-074).
- [ ] **AC-14 (regression — the four existing types)** — **Given** a 1st Trial, a 1HR, a course session and a
      voucher session, **When** each is created, attended and cancelled as before, **Then** every one behaves
      **exactly as it did before this change** — the price card, the day-end posting and the quota deduction all
      unchanged.
- [ ] **AC-15 (regression — the calendar cell)** — **Given** the calendar, **When** it renders,
      **Then** the existing cell still shows program and booking type as REQ-052/068 defined, and an อื่นๆ cell
      is **visually distinguishable** from the four paid types at a glance.

## User-facing wording (Porter, UX writer)

| Where | Thai | English |
|---|---|---|
| Type in the picker | **อื่นๆ** | **Other** |
| Title field label | **ชื่อรายการ** | **Title** |
| Title placeholder | **เช่น ประชุมทีม, ปิดปรับปรุงลาน** | e.g. Team meeting, Rink maintenance |
| Missing title error | **กรุณาระบุชื่อรายการ** | Please enter a title |
| Charge toggle | **คิดเงินรายการนี้** | Charge for this booking |
| Amount error | **กรุณาระบุจำนวนเงินให้ถูกต้อง** | Please enter a valid amount |
| Consume toggle | **ตัดสิทธิ์จากคอร์ส / Voucher** | Deduct from course / voucher |

📌 **The title is the admin's words, not ours** — the system must never substitute "อื่นๆ" as the display name of
a titled booking. That is the whole point of asking them to type it.

## Constraints

- `booking_type` is a Postgres enum with no `OTHER` value ⇒ this needs a **migration**, and the standing rule
  applies: **run and verify on `sid` first** (`PROJECT-STATUS.md` §DEPLOY ORDER).
- The calendar cell needs a colour/label token like the other four (REQ-052 token set).
- `smart-scheduler-front` is **shared with another team** — check `develop` before building the FE.

## Out of Scope

- Recurring "other" bookings (a weekly staff meeting as a series). One instance at a time.
- Blocking a whole day or the whole rink in one action.
- Refunds or reversals of a charged "other" booking — money is undone in the backoffice, as everywhere else.

## Questions

**Q5 and Q6 are open — see the SCOPE CHANGE section at the end of this file. Neither blocks the build.**
Q4 below is kept for the record: answered, then superseded by the multi-teacher rule.

- ~~**Q4 (to the owner)**~~ ✅ **ANSWERED 2026-08-31** — does an อื่นๆ booking send the teacher a LINE message, and
  does it appear on their daily schedule? The two cases pulled opposite ways and Porter did not choose for him:
  a **staff meeting** is something a teacher genuinely needs to see; **ปิดปรับปรุงลาน** with no teacher assigned
  has nobody to tell. **Porter's lean:** if a teacher is assigned, it appears on their schedule and behaves like
  any other booking; if no teacher is assigned, nothing is sent.
  ⚠️ **This does not block the build** — it is one branch at the end of it — but it must be answered before the
  REQ can be called delivered.

### ✅ Q4 ANSWERED by the owner, 2026-08-31 — this REQ now has no open questions

> *"ถ้ามีครูก็ส่งไลน์ ไม่มีครูก็ไม่ต้อง"*

**Exactly Porter's lean, confirmed by him rather than assumed.** Adding two acceptance criteria:

- [ ] **AC-16 (teacher assigned)** — **Given** an อื่นๆ booking **with a teacher**, **When** it is confirmed,
      **Then** that teacher gets the same LINE confirmation as any other booking, and it appears on their daily
      schedule. The **admin's typed title** is what names it in that message — never the words "อื่นๆ"/"Other".
- [ ] **AC-17 (no teacher)** — **Given** an อื่นๆ booking with **no teacher**, **When** it is confirmed,
      **Then** **no LINE message is sent to anyone**, and nothing appears in any teacher's schedule.
      ⚠️ It must fail *silently by design*, not by error — no failed-send in the outbox, no retry, no alert.

📌 **Wording note (UX writer):** for a studentless block the teacher's line reads the title alone — e.g.
*"ประชุมทีม"* — with no student field and no empty label, following the rule TASK-219 established: an empty
label reads as information that went missing.

**⇒ Status: `READY_FOR_SA` with zero open questions.** Nothing in this REQ is waiting on the owner.

---

## 🔴 SCOPE CHANGE — owner, 2026-08-31: every booking has a teacher, and an อื่นๆ booking may have MANY

> *"ทุกการจองต้องมีครู แค่การจองนั้น อาจจะครูหลายคนได้"*

**Triggered by Sober's finding:** the calendar is a grid keyed by teacher, so a teacher-less booking would save
and be **invisible**. The owner resolved it by tightening one rule and loosening another.

### What this changes

1. **A teacher is REQUIRED on every อื่นๆ booking.** There is no teacher-less case.
2. 🆕 **An อื่นๆ booking may carry MORE THAN ONE teacher** — new capability; the four existing types have always
   been one-teacher.
3. **His own example still works:** *ปิดปรับปรุงลาน* is booked against whichever staff it actually concerns, and
   *ประชุมทีม* against everyone attending — which is exactly why he allowed many.

### 🔴 AC-17 is now IMPOSSIBLE and is WITHDRAWN — do not test it

AC-17 ("no teacher ⇒ no LINE") described a state that can no longer exist. **Leaving it in would send Tanya to
verify a case the system forbids** — and a test that cannot be executed gets quietly marked "pass".
**Replaced by AC-16 (revised) and AC-18…AC-20:**

- [ ] **AC-16 (revised — every assigned teacher is told)** — **Given** an อื่นๆ booking with one or more
      teachers, **When** it is confirmed, **Then** **each assigned teacher** receives the LINE confirmation and it
      appears on **each of their** daily schedules, named by the **admin's typed title**.
- [ ] **AC-18 (many teachers, one booking)** — **Given** an อื่นๆ booking assigned to 3 teachers, **When** the
      calendar renders, **Then** it appears in **all three** teachers' columns, and it is recognisable as **one
      booking**, not three separate ones. Cancelling it removes it from all three.
- [ ] **AC-19 (negative — no teacher)** — **Given** อื่นๆ with **no teacher selected**, **When** the admin saves,
      **Then** it is **refused with a message**. This is now the rule, not an edge case.
- [ ] **AC-20 (regression — the other four types)** — **Given** a course / 1HR / trial / voucher booking,
      **When** it is created, **Then** it still takes **exactly one** teacher and behaves as before. Multi-teacher
      is **only** for อื่นๆ unless the owner says otherwise (see Q5).

### Questions raised BY this change — neither blocks the start of the build

- **Q5 (scope reading, stated so it is not silently assumed):** Porter reads *"การจองนั้น"* as **the อื่นๆ booking
  specifically** — i.e. multi-teacher is a property of this new type, **not** a change to the four existing ones.
  Building on that reading (AC-20 pins it). **Owner to correct if he meant all booking types** — that would be a
  much larger change touching every existing screen.
- **Q6 (money — do NOT guess, per the standing rule):** if an อื่นๆ booking is **charged** and/or draws teacher
  pay, **what happens with several teachers?** A freelance teacher has a monthly budget ceiling (REQ-001/004), and
  attendance is what draws it. Does an อื่นๆ booking draw each teacher's budget, one of them, or none? Porter's
  read is that a meeting or a rink closure is **not a taught lesson and should draw nothing** — but that is a
  money rule and money rules are the owner's, never inferred. **Needed before the day-end/pay behaviour is built,
  not before the type, the form or the calendar cell.**

### ✅ Q5 and Q6 answered — owner, 2026-08-31

> *"1. yes  2. yes ถ้าครูหลายคน ไม่ต้องมีให้ใส่การได้ตังค์"*

**Q5 — SETTLED.** Multi-teacher is **only** for อื่นๆ. The four existing types keep exactly one teacher; AC-20
stands as the regression that proves it.

**Q6 — SETTLED on the part I asked:** an อื่นๆ booking **does not draw any teacher's freelance budget**. A
meeting or a rink closure is not a taught lesson, so nothing is drawn from anyone — confirmed by him, not
inferred by me.

- [ ] **AC-21 (freelance untouched)** — **Given** an อื่นๆ booking on a **freelance** teacher, **When** it is
      attended (or auto-attended at 23:30), **Then** that teacher's **remaining monthly budget is unchanged** —
      the same number before and after. Applies to **every** assigned teacher when there are several.

**And he added a rule I had not asked for:** *"ถ้าครูหลายคน ไม่ต้องมีให้ใส่การได้ตังค์"* — when a booking carries
**more than one teacher, the money input is not offered at all.** The shape is unambiguous (single teacher ⇒ the
field exists; several ⇒ it is absent, not merely ignored). ⚠️ **Which money it refers to is being confirmed —
see Q7. Porter is not writing an AC on a guess about money.**

- **Q7 (one-line confirmation, to the owner):** *"การได้ตังค์"* on a multi-teacher อื่นๆ booking means
  (ก) **the teacher-pay / earning field** — the booking cannot pay anyone when it is shared, or
  (ข) **the customer charge** (the คิดเงินรายการนี้ toggle) — a shared booking is never billable.
  Porter's lean is **(ก)**, because the question he answered was about teacher pay — **but the two hide different
  controls, so it is worth the one line.** Everything else in this REQ is unblocked either way.

### ✅ Q7 answered — owner, 2026-08-31: **(ก) the teacher-pay field**

*"การได้ตังค์"* = **the teacher's earning / pay**, not the customer charge. ⇒ **The customer-charge toggle
(`คิดเงินรายการนี้`) is unaffected and still works with several teachers** — a shared booking can still bill the
customer; it just cannot pay a teacher.

- [ ] **AC-22 (multi-teacher ⇒ no teacher pay)** — **Given** an อื่นๆ booking with **more than one teacher**,
      **When** the admin opens the form, **Then** **no control for teacher pay / earnings is offered at all** —
      **absent, not present-and-ignored.** A disabled-but-visible field, or one that silently discards its value,
      is a defect: it tells the admin a payment was recorded when none was.
- [ ] **AC-23 (single teacher unaffected)** — **Given** an อื่นๆ booking with **exactly one** teacher, **When**
      the admin opens the form, **Then** whatever teacher-pay behaviour the product has for other booking types
      is available here too, unchanged.

**🔴 A technical fact @Sober must confirm rather than anyone assuming — this is not a business question:**
**does an explicit per-booking teacher-pay input exist in the product today at all?** Teacher money on this
project has been the **freelance monthly ceiling drawn by attendance** (REQ-001/004), which is automatic, not a
field on a booking form. If no such input exists, **AC-22 is already satisfied and needs no build** — say so and
the two ACs collapse to a verification. If one does exist, it is hidden when there are several teachers.
⚠️ Note this sits alongside **AC-21** (an อื่นๆ booking draws no freelance budget from anyone): the two are
consistent only if an *explicit* pay entry is a different mechanism from the *automatic* ceiling draw.

### ✅ Teacher clash on an อื่นๆ booking — owner, 2026-09-01: **warn, never refuse**

> *"เตือนพอ ไม่ห้าม"*

Sober's question: an อื่นๆ booking does not extend `bookings_teacher_slot_uq`, so a teacher can be on a 10:00
meeting **and** a 10:00 lesson. Refusing would forbid the very flexibility the owner asked for; staying silent
would let a teacher be double-booked with nobody told. **His ruling: warn at save, allow the save.**

- [ ] **AC-24 (soft clash warning)** — **Given** an อื่นๆ booking assigned to a teacher who already has another
      booking overlapping that time, **When** the admin saves, **Then** a warning names **which teacher and which
      clashing booking**, and the admin can **continue and save anyway**. It must **never** block the save.
- [ ] **AC-25 (negative — no false alarm)** — **Given** teachers with **no** overlapping booking, **When** the
      admin saves, **Then** **no warning appears.** A warning that fires on every save is trained away in a week
      and then the real one is invisible too.

**Wording (Porter, UX writer)** — it must name the clash, not just assert one:

| | Thai |
|---|---|
| Warning | **ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว ({ชื่อคาบ} {เวลา})** |
| Buttons | **บันทึกต่อไป** / **ยกเลิก** |

📌 **"บันทึกต่อไป" is deliberately the affirmative button** — the owner said allow, so the default path must not
feel like an error the admin is overriding.

### 🔴 AC-24 / AC-25 — SUPERSEDED by the owner's ruling, 2026-09-01 ("ตามนั้น")

**The overlap capability is DEFERRED.** After TEST-064 exposed that honouring *"เตือนพอ ไม่ห้าม"* requires
relaxing the slot-uniqueness guard **and** teaching the calendar to show two items in one slot (DEF-4 — an
อื่นๆ over a session HIDES the session today), the owner accepted Porter's recommendation:

1. **For now an อื่นๆ MAY NOT overlap an existing booking.** The refusal stays — but with an honest message:
   - [ ] **AC-24 (revised)** — **Given** an อื่นๆ booking on a slot where the teacher already has a booking,
         **When** the admin saves, **Then** it is refused with **`ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว
         ({ชื่อคาบ} {เวลา}) กรุณาเลือกเวลาอื่น`** — naming the teacher and the clashing booking, never a generic
         error, never a silent save.
   - [ ] **AC-25 (unchanged in spirit)** — no clash ⇒ no message of any kind.
2. **The full behaviour (overlap allowed + warning + two items visible in one slot) is a FOLLOW-UP REQ**, not
   part of REQ-078. It must ship as one piece: guard relaxation, the warning dialog (the original AC-24 wording,
   `บันทึกต่อไป`/`ยกเลิก`), and the calendar rendering — **DEF-4's fix is a precondition, or overlaps are
   invisible.** Original wording preserved above for that day.
3. **DEF-4 within REQ-078's scope:** since overlap is now refused, the hide-a-session state should be
   unreachable via the form. ⚠️ @Sober to confirm no other path creates it (e.g. a booking moved onto an อื่นๆ).

---

# 🅿️ PARK STATE — REQ-078, as of 2026-09-02. **Read this first if you are resuming.**

**Status: `TEST_FAILED`, parked on the owner's order** (*"รอบสุดท้าย … เทสแล้วไม่ผ่านก็พักไว้ note ไว้ แล้วไปทำ line ก่อน"*).
**Parked ≠ delivered ≠ done.** In `OWNER-LIST.md` it reads **"In Progress — PARKED"**, never Completed.
**The build is COMPLETE** — every task DONE (224 · 225 · 226 · 227 · 228 · 229 · 236 · 237 · 238 · 239 · 241).
**18 ACs pass** on the deployed `sid` build. Full evidence: `tests/TEST-064` §Round 4.

## What blocks the pass — exactly three things, in order of size

### 1. 🔴 No อื่นๆ has ever been observed posting money — and there are TWO candidate causes

**AC-4 · AC-5 · AC-9 are `NOT_TESTED`.** This is the real blocker; the other two are small.

**Cause A — a test-setup error, MINE, and now understood.** `end-of-day` runs at **18:30**
(`SYSTEM-FACTS.md` — owner-set, correct, because bookings only go to 18:00). **I told Tanya "23:30" from stale
documents.** Her fixtures F3/F4 were confirmed at **22:39 / 22:45**, i.e. after that night's run. If F1/F2 were
created the same evening they simply **missed the run** — no defect involved.
⇒ **The cheap close, no new build and no new round:** create a **฿20 อื่นๆ, charge ON, before 18:30**, let it
post that night, and have the owner reverse it. That closes AC-4 · AC-5 · AC-9 together.
**Offered to the owner 2026-09-02; he has not said yes or no. Do not run it without his word — it posts money.**

**Cause B — 🔴 OPEN, and possibly a real defect that must not ship.** `job_runs.byBookingType` reports only
**four** types — `FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER`. **No `OTHER`.**
⇒ **Does the day-end merely fail to COUNT an อื่นๆ, or does it SKIP it when selecting what to auto-attend?**
**If it skips, an อื่นๆ never posts at all and AC-9 fails outright.**
**This is answerable from the source with no data and no owner** — it is with **@Sober**, asked 2026-09-02,
not yet answered. 🔴 **Answer this BEFORE spending another overnight run**, or Cause A's test proves nothing.

### 2. DEF-4 (reopened) — display only, data proven intact
An อื่นๆ laid over an **on-leave** session hides that session from the teacher's column. Data is fine — Tanya
cancelled hers and the session came straight back. It survives because overlapping an on-leave booking is
**sanctioned** (UC-004), which is the premise I got wrong when I deferred it: I reasoned from the change I had
just approved instead of from the product's own rules. **Porter accepts it as a named gap; it would not hold a
release on its own.**

### 3. DEF-7 (new) — the clash refusal never names WHICH teacher
`AC-24 revised` leads with `ครู{ชื่อ}` precisely because อื่นๆ is the one multi-teacher type. With five teachers
and one clash the admin is left guessing. Small, real, named.

## Accepted gaps — decisions, not oversights

- **AC-6** (catalogue-item pricing) — AC-5 proves the posting mechanism; AC-6 differs only in where the amount
  comes from. Risk: attribution for a catalogue-priced อื่นๆ is unverified.
- **AC-7 / AC-8** (consumes / does not consume an entitlement) — QA owns no course on `sid` and buying one posts
  irreversible money. ⚠️ **The owner's own use cases (ประชุมทีม, ปิดปรับปรุงลาน) do not consume entitlements.**
- **AC-21** (freelance untouched) — all 10 `sid` freelancers are ฿0/h. Closing it needs the owner to set one rate.
- **AC-16 multi-teacher half** — only ONE LINE recipient is linked (the owner, as `Bank`). The **send** is proven
  from source to fan out per teacher; the **on-phone proof for a second teacher** needs a second linked device.

## Deferred to a follow-up REQ — decided, not forgotten

- **Overlap allowed + warning + two items visible in one slot.** The owner ruled *"เตือนพอ ไม่ห้าม"*, then
  accepted deferring it once TEST-064 showed it needs the calendar to render two items in a slot (DEF-4's fix is
  its precondition, or overlaps become invisible). **The original AC-24 wording is preserved above for that day.**
- **The post-confirm chip says `ส่ง LINE แล้ว` while an unlinked teacher's row is `SKIPPED`.** Ruling: change the
  words cheaply (`ส่ง LINE ถึงครูหลักแล้ว`), and make per-recipient results a follow-up carrying the owner's
  one-line question — *does he want the screen to answer "did everyone get it?"*

## The first three moves for whoever resumes

1. **Get @Sober's answer on Cause B** (does the day-end skip `OTHER`?). Source read, costs nothing, and it
   decides whether this is a fixture problem or a defect.
2. **If it does not skip:** ask the owner for the ฿20 run **before 18:30**, then his reversal + the
   `bo.movement` query. AC-4/5/9 close together.
3. **Re-run nothing that passed.** 18 ACs are green on this build; `TEST-064` §Round 4 lists them and names the
   five live `sid` fixtures with their ids and who retires each.
