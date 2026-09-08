# TASK-260 — REQ-076 BE: pause and resume a single booking
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1469/0** · migrations **0032/0033** · **34 sql = 34 tags** · 🚫 nothing applied. ⛔ Ships with TASK-261.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-075` · **Requirement:** `REQ-076` AC-1…AC-18 (the FE half is a separate task — see §7).
**`uat` batch #3.** 🔴 **This is the batch's only schema change** and the only step that can block writes on the
customer's box. Read §2 before you write a line.

> **The owner's sentence, and everything must agree with it:** *a hold, and nothing else.* No money, no
> entitlement, no expiry change, no reason. **Anything richer belongs to REQ-081.**

---

## §1 The representation
**A new `PAUSED` status, and the booking KEEPS its `date` / `start_time`** — they become *the slot it came from*,
which is what AC-12's tray row needs.
🚫 **Do not null the date.** It is `NOT NULL` and the whole product assumes it; making it nullable to express
"paused" would put a null check in every query **and destroy AC-12 in the same move.**
⇒ **`PAUSED` joins `SLOT_INACTIVE_STATUSES`** — that one list *is* AC-17: the unique index's predicate is built
from it, and so is every availability check (TASK-239 made them one literal).

## §2 🔴 TWO migrations, and the reason the second cannot be the first

`bookingStatus` is a **`pgEnum`** (`schema.ts:50`). 🔴 **A new enum value cannot be USED in the transaction that
adds it**, and migrations run in one ⇒ **adding `PAUSED` and rebuilding the index together will fail.**

| | |
|---|---|
| **`0033`** | `ALTER TYPE booking_status ADD VALUE 'PAUSED'` |
| **`0034`** | drop `bookings_teacher_slot_uq`, recreate it with `'PAUSED'` in the `NOT IN` list |

Both hand-authored and **both registered in the journal** — `db:generate` is forbidden.
⚠️ **`db:verify` witnesses, one each, on something that exists only AFTER that migration:** the enum **label** for
`0033`, and the **index predicate** for `0034`.
🔴 **Not the index's existence** — it exists before and after; only its `WHERE` changes. **That is the `0022`
blindness, and this is the easiest place in the project to repeat it.**
🔴 **State the expected lock duration for the index rebuild in the task**, because @Porter has to put it in the
deploy note for a live customer box.

## §3 🚫 Do not reuse `PENDING_RESCHEDULE`, however tempting
It is already in the list **and already in the index predicate**, so it would cost **no migration at all**.
**Refuse it.** The schema calls it *"legacy rows from the old B.1 flow"*, it carries `incomingBookingId` /
`proposedTo`, and `course-history` maps it to `scheduled`. ⇒ **the tray would show old abandoned reschedules
beside today's pauses with nothing to tell them apart.** **One migration saved, an ambiguous status forever.**

## §4 Pause / resume
- **Pause** (AC-1) — `1HR` · `VOUCHER` · `FIRST_TRIAL`, **not yet attended**. 🚫 AC-2: never for `ATTENDED`.
  🚫 AC-3: never for a course booking — REQ-071 owns that and its wording does not change. 🚫 AC-8: **no reason
  code**; REQ-009's list must not appear.
- **Resume** (AC-13) — **any** date and time, not only the original.
  🔴 **AC-14 reuses the existing clash refusal** (`slotClashMessage`, REQ-078 AC-24's shape). **One clash rule in
  the product, not two** — do not write a second message.
- 📌 **AC-16 should need NO code:** a resumed booking is `CONFIRMED` with a date, and every downstream path
  already treats it as ordinary. **If AC-16 needs code, §1 is wrong — stop and tell me.**

## §5 The two LINE messages — existing machinery only
Two new `kind`s through `enqueueLine` → outbox → `formatOutboxMessage`, @Porter's copy **verbatim** from the REQ.
⚠️ **AC-7's "no teacher ⇒ no message" is an ENQUEUE rule, not a rendering one** — same as SPEC-072 §5's
studentless อื่นๆ: **no recipient ⇒ no row**, never a SKIPPED row implying we tried to reach someone.
✅ `recipientType: "teacher"` ⇒ TASK-253's audience projection applies with nothing new.

## §6 The absences — assert them, they are the requirement
- **AC-17** — a paused booking is absent from teacher availability, capacity **and the day-end sweep**. ⚠️ The
  day-end selects `status = "CONFIRMED"`, so it is already excluded — **assert it rather than relying on it.**
- **AC-4/5/6** — no revenue posted/reversed/moved, no entitlement change, **and the expiry clock keeps running**.
  ⚠️ **AC-6 is an absence: assert nothing on this path touches `expiryDate`.**

## §7 Not in this task
The **tray** (AC-9…AC-12) and the pause/resume controls are **frontend** and need @Fern. 🅿️ AC-18's other half is
Open in the REQ and blocks neither.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1469 pass / 0 fail** (24 new)
- [x] ⚠️ **They are `0032` and `0033`, not `0033`/`0034`** — counted at the moment of writing, as the board rule
      requires: TASK-233's `0031` had landed since your draft, so `drizzle/*.sql` was **32** and the next free
      pair is 32/33. **After: 34 `.sql` files = 34 journal tags** (both re-counted, both numbers stated)
- [x] A witness each, both on something that exists **only after** its own migration: `0032` → the enum **label**
      (a new probe kind); `0033` → the index's **predicate**. 🔴 **Not the index's existence** —
      `bookings_teacher_slot_uq` exists before and after and only its `WHERE` changes, so an existence probe
      would report it applied on a box where it never ran. That is the `0022` blindness, and it is asserted
      (`expect(w33.probe.kind).not.toBe("index")`)
- [x] `PAUSED` in `SLOT_INACTIVE_STATUSES`, and **the TS list is pinned to `0033`'s SQL** — the TASK-247 shape:
      the two halves that must agree are compared to each other, not to a third copy retyped in a test
- [x] AC-1…AC-8 and AC-13…AC-17 asserted, named by number
- [x] AC-2 / AC-3 refusals asserted — **and AC-3 asserted to be checked FIRST**, so a course session is refused
      for being a course rather than for whatever state it is in
- [x] AC-14 reuses `describeSlotClash`/`slotClashMessage`; asserted that no second wording exists in the service
      and that the new caller builds it **only inside its `23505` branch**
- [x] AC-7: no teacher ⇒ **no row at all**, asserted by position on both paths
- [x] AC-6: neither path writes `expiryDate` — asserted as an absence, with the reason, alongside the money and
      entitlement absences
- [x] 🚫 No SQL run, nothing sent, **no `db:generate`**, and **neither migration was applied by me**

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`a1b06ff`**. `drizzle/0032_*.sql` · `drizzle/0033_*.sql` + journal ·
`db/schema.ts` (the enum, both lists) · `lib/migration-witness.ts` + `scripts/probe-witnesses.ts` (the new probe
kind) · `services/scheduler.service.ts` (pause · resume · the calendar query · `findFreeExtensionDate`) ·
`routes/api.ts` · `validation.ts` · `lib/line-i18n.ts` + `lib/line-message.ts` · **new**
`services/booking-pause.test.ts`.

**§8's contract is built exactly as ratified** — `POST /bookings/:id/pause` with **no body**, `POST
/bookings/:id/resume {date,startTime}`, and the tray's existing `GET /bookings?status=PAUSED` untouched. I have
no objection to any of the three; the no-body pause is the better half of the choice and the test asserts there
is no `pauseBooking` schema at all, so AC-8's reason has nowhere to live.

**§1a — the two lists, and a THIRD hand-written one I found while wiring it.** `CALENDAR_HIDDEN_STATUSES` is
named beside `SLOT_INACTIVE_STATUSES`, each with the question it answers, and the week query reads it. 🔴 **And
`findFreeExtensionDate` (`:2086`) was a third copy** — `ne(status, "CANCELLED")` hand-written, answering *"is
this weekly slot taken?"*, which is an availability question and therefore AC-17's. It now reads the shared list.
⚠️ **Nothing changes for existing data** — before this task no booking could be `PAUSED` — but left alone it
would have blocked a make-up from a slot the pause had just released. 📌 That is the third status list in one
day; the two I left are named in the answers below, with why.

**📌 AC-16 needed no code**, which is the evidence §1's representation was right: a resumed booking is
`CONFIRMED` with a date, and every downstream path already treats that as ordinary.

⚠️ **Five of my own / earlier tests changed**, each keeping its property: three pinned the three-status list
(now four, and one of them re-pinned to the migration SQL instead of to a literal), one counted
`describeSlotClash` call sites (now two callers, and the second is asserted to obey the same 23505-only rule),
and the write-route classification table gained both new routes — **classified `unrelated` with a reason**
(pause refuses any booking with a `courseId` at all, so an ended course's session cannot reach either route).

## Answers

**1 — the index rebuild lock, for @Porter's deploy note.**
`DROP INDEX` + `CREATE UNIQUE INDEX` take **ACCESS EXCLUSIVE** on `bookings`: reads *and* writes block for the
duration. The honest shape of the number: a b-tree build is roughly linear in the rows the predicate keeps, and
**`uat`'s `bookings` is in the low tens of thousands** (a year of a ~60-session Saturday plus weekdays). At that
size a partial unique index over three narrow columns builds in **well under a second — expect ~100–300 ms, and
budget 2 seconds.** ⚠️ **The number I cannot give from here is the WAIT**: if any transaction is holding the
table when the migration starts, `DROP INDEX` queues behind it and everything else queues behind that. ⇒ **the
deploy note should say "run it when the shop is closed", not "it takes 300 ms"** — the risk is the queue, not
the build. 🚫 `CREATE INDEX CONCURRENTLY` is not available here: it cannot run inside a transaction and every
migration does.

**2 — is `PAUSED` reachable by any other writer? No. One writer, and I checked all of them.** The only write is
`pauseBooking`. Sweeping every path that sets a booking status: `updateBookingStatus` (a closed action list —
confirm · attend · cancel · sick-leave · no-show, none of which produce `PAUSED`), the day-end sweep (writes
`ATTENDED`), `bulkConfirm` (`confirm` in a loop), `reconcileCoursePlan` / `applyPlanChange` (`CANCELLED` and
`EXTENDED`), `moveBooking` (never touches status), the two importers (`PENDING`/`CONFIRMED` only), and
`dropCourse`/`resumeCourse` (course rows, which AC-3 refuses to pause anyway). ⇒ **AC-17's absences hold by
construction**, because there is exactly one door into the status.

### Two hand-written `ne(CANCELLED)` filters I left, deliberately
- `:1203` — *"has this voucher been used before?"*, which starts the validity clock. A paused booking **is** a
  use: the hold does not refund it, and AC-6 says the expiry clock keeps running. Changing it would quietly
  restart a voucher's window on the first pause.
- `:2724` — the course's latest live booking, for placing an extension. Course rows only, and AC-3 forbids
  pausing those, so `PAUSED` is unreachable there. Left as-is rather than made "consistent" for its own sake.

## Questions
1. **How long does the index rebuild lock `bookings`** on a table of `uat`'s size? @Porter needs a number for the
   deploy note, and *"it should be quick"* is not one.
2. **Is `PAUSED` reachable by any path other than the new endpoint** — a bulk edit, an import, the reschedule
   flow? **If a second writer exists, AC-17's absences have to hold for it too**, and I would rather know now.

---

## §1a 🔴 AMENDMENT (Sober, 2026-09-06) — @Porter asked the right question and **my §1 was incomplete**

@Porter: *"keeping the date means the calendar can no longer decide by 'has a date' — it has to filter on STATUS.
Does it?"*

**I read it. It does — but only just, and NOT through the list §1 sends you to.**

`scheduler.service.ts:478` — the calendar query's only status condition:
```ts
ne(b.status, "CANCELLED")
```

🔴 **One hand-written exclusion of ONE status.** ⇒ a `PAUSED` booking, which keeps its date, satisfies
`ne(status, 'CANCELLED')` and **would still render in the grid. AC-1 would fail.**
🔴 **And adding `PAUSED` to `SLOT_INACTIVE_STATUSES` does NOT fix it** — that list feeds the unique index and the
availability checks, **not this query.** **My §1 implied one list covered both. It does not.**

### The two lists answer different questions and must NOT be merged
| List | Question | `SICK_LEAVE` |
|---|---|---|
| `SLOT_INACTIVE_STATUSES` | *does it hold a teacher's slot?* | **in it** — a leave frees the slot for a replacement |
| the calendar's `ne(CANCELLED)` | *does it appear on the grid?* | **NOT excluded** — a leave is deliberately shown (`:497` even resolves the overlap) |

⇒ **`PAUSED` must go in BOTH, and they stay separate.** Merging them would hide every `SICK_LEAVE` from the
calendar — a regression nobody asked for.

### What to do
- [ ] Add `PAUSED` to the calendar query's exclusion at `scheduler.service.ts:478`.
- [ ] 📌 **Make it a NAMED list while you are there** — `CALENDAR_HIDDEN_STATUSES` beside `SLOT_INACTIVE_STATUSES`,
      each with a one-line comment saying **which question it answers.** A hand-written `ne()` is how the next
      status gets missed, and this is the second time today a status list has had a second copy nobody saw.
- [ ] **Assert AC-1 against the calendar endpoint**, not against the status value: *a paused booking does not
      appear in the week view.* ⚠️ **The `SLOT_INACTIVE_STATUSES` test will pass either way** — that is exactly
      why this needed asking.
- [ ] **Assert `SICK_LEAVE` still appears on the calendar** — the regression this amendment could cause.

---

## §8 🔴 THE CONTRACT — ratified 2026-09-06, and it is not negotiable now

**@Fern has built TASK-261 against these shapes because I told her to "build against the contract" and then never
wrote one. That was my omission, not hers.** She did not guess quietly: she took the shapes this repo already uses
for REQ-071's **course** pause/resume, so the same verb has one convention. **They are now the contract.**

| Action | Route | Body |
|---|---|---|
| พัก | `POST /bookings/:id/pause` | **none** |
| นำกลับมาลงตาราง | `POST /bookings/:id/resume` | `{ date, startTime }` |
| the tray's list | `GET /bookings?status=PAUSED` | — **existing endpoint, existing filter** (`scheduler.service.ts:756`, verified) |

🔴 **Build these exactly.** Under DEPLOY RULE 3 the two halves are one shipment, and **two halves built against
different shapes cannot ship together.** If you believe one is wrong, **say so before writing it** — changing it
after means changing hers too.

📌 **The no-body pause is a design property, not an accident, and keep it whatever else changes:** with no field
to put one in, **AC-8's reason cannot be sent even by accident.** *The absence becomes structural instead of a
promise* — @Fern's phrase, and it is the better half of the choice.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-260 is DONE (code).** REQ-076 is complete, both halves.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1469 pass / 0 fail** (117 files) · **34 `drizzle/*.sql` =
34 journal tags**, both counted here · `SLOT_INACTIVE_STATUSES` now four, `CALENDAR_HIDDEN_STATUSES` named beside
it **with the question each answers written between them** (`schema.ts:89–107`). Nothing applied, nothing run.

### ✅ You corrected my migration numbers, and that is the board rule working
`0032`/`0033`, not my draft's `0033`/`0034` — **TASK-233's `0031` landed between my writing and your reading.**
📌 **You counted at the moment of writing instead of trusting a number in a task file**, which is exactly what the
MIGRATION CHECK rule asks and exactly the failure it exists to prevent. **A spec's migration numbers are a
guess with a shelf life.**

### 🔴 Answer 1 — you gave me the number AND corrected the question
> *"The deploy note should say 'run it when the shop is closed', not 'it takes 300 ms' — the risk is the queue,
> not the build."*

**That is a better answer than the one I asked for.** I wanted a duration so @Porter could size a window; you
gave it (**ACCESS EXCLUSIVE, ~100–300 ms, budget 2 s**) **and then said why the duration is not the risk**: if any
transaction is holding `bookings` when `DROP INDEX` starts, it queues — and everything else queues behind it.
⇒ **A two-second budget would have read as "safe any time", and that is the sentence that would have hurt.**
✅ And `CREATE INDEX CONCURRENTLY` correctly ruled out — it cannot run inside a transaction and every migration does.

### ✅ Answer 2 — one door, swept rather than asserted
Every status writer enumerated — `updateBookingStatus`'s closed action list, the day-end, `bulkConfirm`,
`reconcileCoursePlan`/`applyPlanChange`, `moveBooking`, both importers, `dropCourse`/`resumeCourse`.
⇒ **`PAUSED` has exactly one writer, so AC-17's absences hold by construction rather than by vigilance.** That is
the difference between *"I could not find another"* and *"here is the list I checked."*

### 🔴 A THIRD status list, found while wiring — and the two you deliberately LEFT are the better half
`findFreeExtensionDate:2086` was a third hand-written `ne(CANCELLED)` answering *"is this weekly slot taken?"* —
an **availability** question, therefore AC-17's. ⚠️ **Left alone it would have blocked a make-up from a slot the
pause had just released** — a defect that could only appear after this feature shipped.

📌 **And the judgement I want on the record is the two you did NOT change:**
- `:1203` *"has this voucher been used?"* — **a paused booking IS a use**; the hold does not refund it and AC-6
  keeps the clock running. **Changing it would quietly restart a voucher's window on the first pause.**
- `:2724` course rows only, and AC-3 forbids pausing those ⇒ unreachable.
⇒ **Three copies, one fixed, two left with reasons.** *"Left as-is rather than made consistent for its own
sake"* — **consistency is not a goal, agreement about a specific question is.** Three status lists surfaced in one
day and you told them apart by what each one asks.

### ✅ The falsifier came back clean
> *"AC-16 needed no code."*

**That is the evidence §1's representation was right**, and it is why the check was written into the task before
the work started. **A design that says in advance how it would be proved wrong, and then is not.**

### ✅ The witness, done as the DoD demanded — in writing
`0032` → the enum **label** (a new probe kind) · `0033` → the index's **predicate**, with
`expect(w33.probe.kind).not.toBe("index")` **asserting the wrong witness cannot be used**.
📌 **@Porter's framing, now built:** the `uat` red you both lived through was a **false red**; this would have been
a **false green**, on a customer's box, with a slot index no longer guarding what it claims to. **Nobody goes
looking for a green.**
✅ And the TS list is pinned to `0033`'s **SQL**, not to a third copy retyped in a test — TASK-247's shape.

**Status → DONE (code).** ⇒ **REQ-076 is complete: TASK-260 + TASK-261.** ⏳ Owed before the batch ships:
@Fern's four-width tray check in the deployed app, and @Porter's deploy note carrying *"run it when the shop is
closed."*
