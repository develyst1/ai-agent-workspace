# SPEC-080 — `REQ-095` "Other" schedules (ECA · Free/KOL · DUO · Group · Camp): feasibility read + staged plan (Sober, 2026-09-18)

**Owner rulings (`REQ-095 §4`):** money ALL to the backoffice; the teacher RATE lives on the Other schedule (entered/editable), stored here, passed to the backoffice as an expense — no payroll/reporting here. ECA/Free = reserve a teacher slot, no students (a head count). Camp = a day-based "Balance camp" package with carry-over/pause. DUO = 2 kids sharing one course (+ a per-session variant); Group similar; teacher mostly fixed but swappable; per-teacher editable rate. Order: ECA/Free → DUO/Group → Camp.

## §0 What exists (the read, from the code)
1. **Teacher pay rate — NO.** Nothing in the schema is a pay rate. `freelance_budgets` / the freelance `bo.item` ceiling are HOURS (a cap on booking freelancers), not money. Net-new: a number on the schedule.
2. **A NON-REVENUE booking — YES, already:** `bookingType = "OTHER"` (REQ-078, TASK-224): no student, no program, a typed **`title`** (required), possibly SEVERAL teachers (`bookingTeachers`), **no money, no entitlement, no expiry**, blocks the teacher slot(s) like any live row, shows on the calendar and in the coach's reminder. **ECA/Free/KOL IS this row** plus: a kind, a head count, a rate, a bulk creator.
3. **Multi-student per slot — NO.** `bookings_teacher_slot_uq` = ONE live booking per `(teacher, date, startTime)` — a DB invariant every availability check shares. Two children's course sessions cannot both point at one teacher slot. Camp packages: net-new (the course model is weekly sessions + quota + expiry; vouchers are hours; nothing is DAYS).
4. **DUO/Group** = several existing COURSES sharing one recurring slot + one teacher + a per-teacher rate. Feasible only by a new object: a **group session** that owns the teacher slot, with the children's course sessions attached to it (the invariant stays; the group row is the one live booking; the children's rows become "seats" — no teacher slot of their own). That is a model change touching the reconcile, the calendar cell, the reminder, check-in, and deductions.

## §1 Per type — reuse vs net-new, sizes
| type | reuses | net-new | size |
|---|---|---|---|
| **ECA · Free/KOL** | the `OTHER` booking end to end (slot block, several teachers, calendar, reminder, no money) | `other_kind` (`ECA`/`FREE`/`KOL`), `head_count`, `teacher_rate_minor` per teacher (on `booking_teachers` + the primary), a **bulk creator** (N fixed dates in one go, editable after), an admin filter/legend by kind, **the backoffice expense PASS** (see §3) | **BE M · FE M** (1 migration) |
| **DUO · Group (recurring)** | courses, the reconcile, the rental row, the reminder shapes | a **group session** object (owns the teacher slot; `size` seats), children's sessions as seats (no slot of their own — the invariant is respected, not relaxed), per-teacher rate on the group, swap teacher on the group, the calendar cell showing N names, check-in/attendance per seat, deductions per child unchanged | **BE L · FE L** (1 migration; touches the reconcile) |
| **DUO · Group (per-session รายครั้ง)** | `SINGLE_SESSION` money path per child | the same group object with single-session seats | **+S** once the group object exists |
| **Camp (Balance camp)** | vouchers' shape (a total, a used count, an expiry), `OTHER`'s no-student-slot shape for the DAY block | a **day entitlement** (`camp_packages`: Full/Half × Full-week/Daily×N = total days, used days, carry-over to a future open week, PAUSE), day-cut attendance (a day = one row, not an hour), the "open week" calendar, the sale (money to the backoffice as today's courses) | **BE L · FE L** (1–2 migrations) — the big one |
Total: 3 stages · ~4 migrations · BE M+L+L, FE M+L+L.

## §2 The stages
1. **ECA/Free/KOL** — extend `OTHER` (TASK-394 BE, TASK-395 FE).
2. **DUO/Group** — the group session object; recurring first, per-session variant after.
3. **Camp** — the day entitlement; own SPEC when reached (the carry-over/pause rules need the customer's words on "open week").

## §3 Decisions that need the OWNER (flagged to @Porter)
1. **The expense PASS (Stage 1):** "stored here, passed to the backoffice" — WHEN and HOW: (a) a `bo.movement` EXPENSE row per session at auto-attend/attendance (the backoffice sees a cost when the class happened), or (b) at creation, or (c) the backoffice PULLS the stored rate (no post from us). *Recommendation: (a) — cost follows the event, exactly as a course's revenue follows the sale; but the backoffice must name the EXPENSE item/endpoint it wants; until it does, Stage 1 STORES the rate and posts nothing (a flag `rate_posted_at null`).*
2. **Head count (Stage 1):** a number only, or a note per head? *Recommendation: a number + the existing free-text note.*
3. **DUO/Group (Stage 2):** does a child in a DUO keep their OWN course (2 courses, 1 slot — the owner's words) — yes per §4; so the group is a scheduling object, not a product. Confirm before Stage 2.
4. **Camp (Stage 3):** what "open week" means and whether a paused camp has an expiry — needs the customer's words before a SPEC.

## §4 Non-goals
No payroll, no reporting of rates here; no change to the one-live-booking-per-slot invariant (the group object respects it); no LINE messages for ECA/Free beyond what `OTHER` already sends to the coach.
