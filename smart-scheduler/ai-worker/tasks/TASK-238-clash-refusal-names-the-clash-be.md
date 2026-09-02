# TASK-238: BE — AC-24 revised: the clash refusal must NAME the teacher and the clashing booking

- Source: REQ-078 **AC-24 (revised)** — the owner's DEF-2 ruling, option ข *"ตามนั้ม"* (via @Porter)
- Status: ✅ DONE — code (Sober 2026-09-01) · the open window → TASK-239 — 🔴 the DEF-4 sweep found ONE open window; see §Questions

## The ruling

**Overlap stays refused** — the full capability (guard + warning + two items in one slot) is a follow-up REQ,
because honouring "warn, don't block" would require the calendar to *show* two things in one slot, and without
that we would ship **invisible double-bookings** (Porter, and he is right). **What changes now is only the
message.**

Required text (REQ-078 AC-24 revised, verbatim):

> `ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว ({ชื่อคาบ} {เวลา}) กรุณาเลือกเวลาอื่น`

- **Never a generic error.** The staff member's next action is *pick another time* — the message has to tell them
  which teacher and which booking, or they have to go and look.
- **AC-25 unchanged: no clash ⇒ no message.** A refusal that fires when nothing clashes is worse than a generic
  one; assert the negative case too.
- The name used for the clashing booking is **`displayName`** (TASK-224) — so an อื่นๆ blocking an อื่นๆ names
  the admin's typed title, never "อื่นๆ".

## What to do

The refusal today is the untouched slot-uniqueness guard. Make the service look up **what** it collided with and
raise the message above with the teacher and the clashing booking's name + time.
⚠️ **The FE must actually render it.** `ApiClientError` surfaces `e.message` in the cancel dialog; **confirm the
create form does the same** rather than swallowing it into a generic toast. If it does not, say so — that is one
FE line and it becomes its own task rather than something you reach across for.

## 🔴 And one check that belongs to this task, not to the follow-up REQ

**Confirm no OTHER path can still create DEF-4's hidden-session state.** DEF-4 was: an อื่นๆ laid over an
existing session **hides that session on the calendar** (display only — Tanya verified the data was intact).
The form now refuses overlap, so the *form* cannot produce it. **Enumerate the other writers from the code** —
the move path, the reschedule/overbook path, the import, any direct status change — and state whether any of
them can still place two bookings in one teacher-slot. **If one can, say so and stop**; it becomes a defect, not
a follow-up. This is exactly the *"the door is shut, is the window?"* check.

## Definition of Done — the OUTCOME
- [ ] Booking an อื่นๆ onto a teacher who already has a session is refused with a message **naming that teacher
      and the clashing booking's name and time** — asserted on the composed string, not on an error code.
- [ ] The clashing booking's name comes from `displayName` (an อื่นๆ clash names its title).
- [ ] **AC-25:** no clash ⇒ **no message at all**.
- [ ] The four existing types' clash behaviour is **unchanged** (same refusal, and their message is either
      improved identically or untouched — state which).
- [ ] The DEF-4 sweep above is written up: every other writer enumerated, with a verdict per path.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. No migration. 🚫 No DB run.

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `07dac42` |

🔴 **No migration.** Two files changed, one added.

### The message
New pure `src/lib/slot-clash.ts` — `slotClashMessage()` composes AC-24's sentence verbatim, and
`GENERIC_SLOT_TAKEN` keeps the old one as a named **fallback**. `describeSlotClash()` in the service turns a
`23505` into that sentence.

```
ครูหนึ่ง มีคาบสอนช่วงเวลานี้อยู่แล้ว (น้องเอ 10:00-11:00) กรุณาเลือกเวลาอื่น
```

**Three things in it are deliberate:**

1. 🔴 **The lookup runs on `db`, NOT on the transaction that just failed.** A statement that raises `23505`
   inside a Postgres transaction leaves it **aborted** — every later query in it fails with `25P02`. Using `tx`
   here would have turned a clean 409 into a confusing 500, **on the one path whose whole job is to explain
   itself**. The occupant is committed data outside our transaction, so a fresh read is both safe and correct.
   (Same family as the `enqueueLine` transaction caveat from TASK-218; that one cost me a comment, this one
   would have cost a 500.)
2. **Its predicate mirrors `bookings_teacher_slot_uq`'s own `WHERE`**, and the test reads that `WHERE` **out of
   the schema** rather than restating it — so if the index's status list ever changes, the test fails instead of
   the message quietly describing a different row than the one that refused.
3. **It never invents.** If the occupant cannot be identified — it may have been cancelled between the failed
   insert and the read — it falls back to the generic sentence. Refusing with less detail is right; a made-up
   teacher name would be worse than saying less.

**AC-25** (no clash ⇒ no message) is structural: `describeSlotClash` has exactly one call site, inside the
`23505` branch, so on the happy path it never runs. Asserted by counting call sites.

**The other four types:** course creation keeps its own date-specific refusal (it catches `SLOT_TAKEN` and
replaces the message), so it is untouched **by construction**. The **plan-change** and **move** paths still
refuse generically — **untouched, stated rather than silently improved**: widening this to a refusal Tanya is
not testing, during a `TEST_FAILED` release, is risk with no ACs behind it. Say the word and it is the same
helper at two more sites.

---

## 🔴 THE DEF-4 SWEEP — "the door is shut; is the window?"

**Answer: the door is shut for every writer. One window is open, and it is one I flagged on TASK-224 and never
got a ruling on.**

### Why every writer is covered
The refusal is **not** the form and not the service — it is `bookings_teacher_slot_uq`, a **partial unique index
in the database**, on `(teacher_id, date, start_time)` where `status NOT IN ('CANCELLED', 'PENDING_RESCHEDULE',
'SICK_LEAVE')`. Postgres enforces it on **INSERT and UPDATE alike**, so no code path — present or future — can
put two live bookings in one teacher-slot without raising `23505`.

| Writer | Path | Verdict |
|---|---|---|
| The booking form | `createBooking` → `insertBooking` `:1081` | ✅ refused (this is the one AC-24 now explains) |
| Course creation | `createCoursePackage` → `insertBooking` | ✅ refused, with its own message |
| Extra paid session | `addExtraSession` → `createBooking` | ✅ refused (same chokepoint) |
| Plan change / insert | `applyPlanChange` `:2100` | ✅ refused (`23505` → `SLOT_TAKEN` at `:2288`) |
| **Move / patch** | `updateBooking` `:2603` + `:2708` | ✅ refused — the index applies to the UPDATE too |
| Resume a dropped course | `resumeCourse` `:3355` | ✅ refused, with its own message |
| Auto-extend on leave | `findFreeExtensionDate` → create | ✅ refused — and it *searches* for a free date first |
| Status changes (confirm / attend / leave / cancel) | `:2383 · :2447 · :2574 · jobs.service.ts:54` | ✅ safe — a status change **into** the live set is re-checked by the index; changes **out** of it only free the slot |
| `db/seed.ts:255` | dev seed | ✅ not a production writer |

**The deliberate exception, which is NOT DEF-4:** `SICK_LEAVE` is excluded from the index, so a live booking may
share a slot with the leave row it replaced (UC-004 overbooking). `getCalendar:494` handles it explicitly —
*surface the active booking, not the leave one*. That is a rule someone wrote on purpose, and it works.

### ⚠️ THE OPEN WINDOW — `additionalTeacherIds` is not slot-checked at all

**`bookings_teacher_slot_uq` covers `bookings.teacher_id` only.** An อื่นๆ booking's **additional** teachers live
in `booking_teachers`, which has **no slot constraint** — and `attachAdditionalTeachers` deliberately does not
check one, because several teachers sharing an hour is the whole feature.

⇒ **Teacher B can be an additional teacher on a 10:00 อื่นๆ booking AND have their own 10:00 lesson.** Nothing
refuses it, and the state is creatable through the normal form.

**Today it hides nothing**, because `getCalendar:490` keys cells on `dto.teacher.id` — the **primary** teacher —
so the อื่นๆ booking is not drawn in B's column at all. **But AC-18 requires it to be**, and TASK-227 is the task
that puts it there. The moment an อื่นๆ booking renders into every assigned teacher's column, **B's 10:00 cell
has two bookings in it** — which is exactly DEF-4's shape, reached through the one door the DB does not guard.

📌 **I raised this on TASK-224 §Questions** (*"is that acceptable, or does AC-18 want a soft warning?"*) and no
ruling came back. **You told me to say so and stop, so I have stopped** — no guard written, nothing invented.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1083 pass / 0 fail (+11)
```

### 🚫 Not proven by me, and one thing I could not check at all
- The rendered refusal on a real screen is Tanya's.
- ⚠️ **The DoD asks me to confirm the FE renders `e.message` on the create form.** That is the front repo, which
  is **not mine to read or change**. I have not confirmed it — see §Questions.

## Questions
- 🔴 **THE SWEEP FOUND ONE OPEN WINDOW, and I stopped as you instructed.** `bookings_teacher_slot_uq` guards
  `bookings.teacher_id` only. An อื่นๆ booking's **additional** teachers are in `booking_teachers`, which has no
  slot constraint and no application check — so **teacher B can be an additional teacher on a 10:00 อื่นๆ and
  also teach their own 10:00 lesson.** Nothing refuses it.

  It hides nothing **today**, because `getCalendar` keys cells on the **primary** teacher, so the อื่นๆ booking
  is never drawn in B's column. **But AC-18 requires exactly that it be drawn there, and TASK-227 is what puts
  it there.** When 227 ships, B's 10:00 cell holds two bookings — DEF-4's shape, through the one door the
  database does not guard.

  **This is your call and it is time-sensitive**, because it changes what TASK-227 has to do:
  - **(a)** it is intended — several teachers sharing an hour is the feature — and TASK-227 must be able to
    render two things in one cell; or
  - **(b)** an additional teacher's slot should be checked like the primary's, and the form refuses it with the
    same AC-24 message (the helper is written and reusable); or
  - **(c)** a soft warning, which needs the calendar capability the owner already deferred on DEF-2.

  📌 I asked this on **TASK-224 §Questions** and it did not come back. I am not treating silence as approval,
  and I have written no guard.

- ⚠️ **I could not do one DoD line: "confirm the create form renders `e.message`".** That is
  `smart-scheduler-front`, which is **not mine to read or change** — reaching across is the routing violation
  the protocol is built to prevent. **Unverified, and I am naming it rather than quietly leaving the box
  ticked.** It is one question to @Fern via you: does the booking-create form surface `ApiClientError.message`,
  as the cancel dialog does, or does it swallow it into a generic toast? If it swallows it, **the entire value
  of this task is invisible to the user** and it is one FE line.

- **The move and plan-change paths still refuse generically — untouched, and I want that confirmed rather than
  assumed.** Improving them is the same helper at two more sites and I can do it in minutes. I left them because
  AC-24 is about the create path the อื่นๆ form uses, and changing a refusal Tanya is not currently testing,
  inside a `TEST_FAILED` release, is risk without an AC behind it. If you would rather all three speak the same
  way now, say so.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** And the sweep is the most valuable thing in this task.

**Reproduced:** `tsc --noEmit` → **0** · the affected suites green · `src/lib/slot-clash.ts` exists ·
`describeSlotClash` reads through **`db`**, not `tx` (`scheduler.service.ts:963`).

📌 **The `db`-not-`tx` decision would have cost a 500 on the one path whose entire job is to explain itself.**
A `23505` aborts the transaction, so every later query in it fails `25P02` — the refusal that was supposed to
name the teacher would instead have produced *"เกิดข้อผิดพลาดภายในระบบ"*. You spotted it, and the connection you
drew to TASK-218's `enqueueLine` caveat is the right one: **the same Postgres rule, twice, in two features.**

📌 **Reading the index's own `WHERE` out of the schema instead of restating it in the test** — that is the
difference between a test that pins the message and one that pins *the message describing the row that actually
refused*. If the index's status list changes, the test fails instead of the sentence quietly becoming wrong.

📌 **"It never invents"** — falling back to the generic sentence when the occupant cannot be identified is right.
**A made-up teacher name would be worse than saying less**, and the occupant genuinely can vanish between the
failed insert and the read.

**Leaving the plan-change and move paths generic, and saying so rather than silently improving them** — ✅
correct for a `TEST_FAILED` release: a refusal Tanya is not testing, changed with no AC behind it, is risk for
nothing. See the coupling below before you extend them.

### ✅ Your question — YES, the create form renders `e.message`. But I found a trap on the way

`BookingModal.tsx:946` — the create path does `setSubmitError(e.message)`, so **AC-24's sentence reaches the
screen.** That box is met.

🔴 **But the MOVE path does not, and it matters the day you extend the helper.** `BookingModal.tsx:603-609`:

```ts
e instanceof ApiClientError && e.code === "SLOT_TAKEN"
  ? t("booking.moveSlotTaken")   // ← a LOCAL generic, replacing whatever the server said
  : e.message
```

**The FE special-cases `SLOT_TAKEN` and throws the server's message away.** Today that is harmless — you left the
move path generic on the BE, so generic meets generic. **But if you ever apply `slotClashMessage` to the move
path as you offered, the FE would silently discard it** and you would be debugging a message that is correct on
the wire and invisible on screen. **One rule, two files, again.** ⇒ if that extension is ever ordered, it is a
**pair**, and the FE half comes with it. Recorded here rather than discovered later.

### 🔴 THE OPEN WINDOW — you were right to stop, and it is now urgent rather than theoretical

**Your sweep is exactly what I asked for and better than I expected:** the refusal is a **partial unique index**,
so Postgres enforces it on INSERT *and* UPDATE for every writer, present and future — that is a much stronger
answer than a table of call sites, and the `SICK_LEAVE` exclusion being a deliberate UC-004 rule (handled at
`getCalendar:494`) is the right distinction to draw.

**And then you found the one door the index does not guard:** `bookings_teacher_slot_uq` covers
`bookings.teacher_id` only; an อื่นๆ booking's **additional** teachers live in `booking_teachers`, unconstrained.

🔴 **You wrote "today it hides nothing". That stopped being true while you were writing it.** TASK-227 shipped
`teachers.some(...)` in both grids — **an อื่นๆ booking is now drawn in every assigned teacher's column** — and
Fern's own TASK-227 Q2 reports that a day cell holding two bookings **draws one and silently drops the other**.

⇒ **DEF-4's exact shape is reachable in the current build, through the form, right now.** Not after a future
task: today. And it is the precise outcome @Porter deferred the whole overlap capability to avoid.

**You raised this on TASK-224 and no ruling came back. That is my miss, not yours** — I routed it to @Porter as
"not blocking" when the FE half that makes it bite had not landed yet, and I did not revisit it when it did.

⇒ **TASK-239 cut and released:** an additional teacher may not be attached when they already have a live booking
in that slot. **This is not new scope** — it is the owner's own DEF-2 ruling (*refuse honestly, because the
calendar cannot show two*) applied to the one path his ruling did not name, and it takes nothing away from the
feature: several teachers may still share an hour; what is refused is a teacher being in two places at once.
⚠️ It is an **application** check, not an index — say so at the site, because it is genuinely weaker than the
guarantee next to it.

**Status → DONE (code).** The rendered refusal is @Tanya's.
