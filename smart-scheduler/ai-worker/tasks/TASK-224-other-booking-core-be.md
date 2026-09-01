# TASK-224: BE — `OTHER` booking type: migration, nullable student/subject, title, and one `displayName`

- Source: SPEC-070 (REQ-078 — the owner's REQ-005, his **#1**)
- Status: ✅ DONE (Sober 2026-09-01) — code PASS · `0029` applied + witnessed on `sid` ✅ · `uat` ships with the batch
- Depends on: none. **Everything else in SPEC-070 depends on this.**
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## What to do

### 1. The migration — hand-authored, journal-registered, witnessed
⚠️ **Count `drizzle/*.sql` against the `"tag"` count in `drizzle/meta/_journal.json` at the moment you write it**
(board rule: *"no migration" is a CLAIM, not a state*). Today both are 28, newest `0027` ⇒ yours is **`0028`** —
but **TASK-218 claims `0028` too**; whichever lands second takes `0029`. Do **not** run `db:generate` (the snapshot
chain stops at 0003 — `drizzle/README.md`).

```sql
ALTER TYPE "booking_type" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TABLE "bookings" ALTER COLUMN "student_id" DROP NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "subject_id" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "other_title"         text;
ALTER TABLE "bookings" ADD COLUMN "other_price_minor"   integer;
ALTER TABLE "bookings" ADD COLUMN "other_price_item_id" uuid;
ALTER TABLE "bookings" ADD CONSTRAINT "booking_other_price_chk"
  CHECK ("other_price_minor" IS NULL OR "other_price_item_id" IS NULL);
```

🔴 **Two traps, both real:**
- **`ALTER TYPE … ADD VALUE` must not share a transaction with any statement that USES `'OTHER'`.** Nothing here
  does — **keep it that way.** No backfill, no CHECK naming `'OTHER'`, in this file.
- **Witness on `booking_other_price_chk` (or `other_title`) — NOT on a column that already existed.**
  *"Does `student_id` exist?"* is true before **and** after `DROP NOT NULL`, so a box where this never ran looks
  identical to one where it did. That blindness is how `0022` hid and took the calendar down (board 🔴).

### 2. Schema + validation (`db/schema.ts`, `validation.ts`)
- Enum gains `OTHER`; `studentId` / `subjectId` become nullable; the three new columns.
- `createBooking` (`validation.ts:99`): `student` and `subjectId` become **optional**, and the existing
  `.refine`s must keep their current force for the four existing types. Add refinements:
  - `OTHER` **with no student** ⇒ `otherTitle` required, non-empty after trim → *"กรุณาระบุชื่อรายการ"*
  - `otherPriceMinor` when present: **integer ≥ 1 satang** → *"กรุณาระบุจำนวนเงินให้ถูกต้อง"* (rejects 0, negative, NaN)
  - `otherPriceMinor` **and** `otherPriceItemId` both set ⇒ refuse (AC-12). 🔴 **Refuse, never clamp, never pick
    one** — REQ-063's line.
  - the four existing types must refuse `otherTitle` / the two price fields outright, so the columns cannot be
    written on a booking they mean nothing for.
  - `discount` stays **refused for `OTHER`** (SPEC-070 §Out of scope).
- 🔴 **The four existing types must come out byte-identical.** `student`/`subjectId` going optional in the schema
  must not make them optional in practice — a test per type that a missing student/subject is still refused.

### 3. The DTO — one computed name, not 31 fallbacks (`db/mappers.ts:99`)
```ts
student:     StudentRef | null   // studentRef(b.student) when present, else null
subject:     { id, name } | null // b.subject ? {...} : null   — NO placeholder program (REQ-065's lesson)
title:       b.otherTitle ?? null
displayName: b.otherTitle ?? b.student?.nickname ?? b.student?.name ?? ""   // ← the field every surface renders
```
`displayName` is computed for **every** booking type — a 1HR's is its student's nickname, unchanged. It exists so
AC-10 (*never blank, never the word "อื่นๆ"*) is a property of **one function** instead of a promise repeated
across the FE. **Assert in a test that it is never the empty string** for a saveable booking.
⚠️ Every BE reader of `b.student` / `b.subject` on a **booking** must be enumerated from the code and made
null-safe — `mappers.ts:110`, `scheduler.service.ts:2536` and the search/report paths. **Enumerate them, don't
trust this list** (the TASK-211 habit); `toCourseWithStudent` / voucher mappers are a different object and must
stay non-null.

### 4. Cancel — one line (`scheduler.service.ts:2211`)
Add `OTHER` to `REASON_ENUM_REQUIRED`. **No migration** — `0025`'s `cancel_reason` column and CHECK already carry
the three reason values. Exactly the TASK-220 shape.

### 5. 🆕 MANY teachers on an อื่นๆ booking (owner, 2026-08-31 — AC-18/19/20/21)

> *"ทุกการจองต้องมีครู แค่การจองนั้น อาจจะครูหลายคนได้"*

**In the same migration:**
```sql
CREATE TABLE "booking_teachers" (
  "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "teacher_id" uuid NOT NULL REFERENCES "teachers"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("booking_id", "teacher_id")
);
```
- `bookings.teacher_id` **stays `NOT NULL`** and is the **first** teacher. The join table holds the
  **additional** ones only. Additive ⇒ every existing reader, index, hold and report is untouched, and **AC-20
  (the other four types take exactly one teacher) becomes true by construction.**
- `ON DELETE CASCADE` is what makes **AC-18's "cancelling removes it from all three"** free: there is still
  exactly **one** booking row, so a cancel is one status change.
- 🔴 **ONE accessor, never two reads.** A single mapper returns `teachers = [row.teacher, ...additional]`, and
  **nothing outside it reads either source directly.** Two call sites reading two sources is how the two get to
  disagree. `teachers[0]` is always `teacher_id`, so the order is stable — and the DTO carries `teachers` for
  **every** booking type (length 1 for the other four), so the FE has one shape, not two.
- **Validation:** `additionalTeacherIds` accepted **only** for `OTHER`; refused outright on the other four types
  (AC-20). At least one teacher always — a missing teacher is refused with a message (**AC-19**; this is now the
  rule, not an edge case). No duplicate ids, and an id may not repeat `teacherId`.

### 6. 🔴 AC-21 — an อื่นๆ booking must draw NO freelance budget, from any of its teachers

Today **any** booking on a FREELANCE teacher draws an hour when its status becomes holding: `reconcileBookingHolds`
→ `heldTarget(status)` → a `bo.movement` keyed `fl:<bookingId>:<item>:held1` (`scheduler.service.ts:195-231`).
`heldTarget` is **status-only** and has never had a booking-type opinion ⇒ **as things stand, an อื่นๆ booking
would silently draw an hour off a freelance ceiling.** The owner has ruled it must not (a meeting is not a taught
lesson).

**Guard inside `reconcileBookingHolds` itself: `bookingType === "OTHER"` ⇒ hold nothing, release nothing, return.**
There are **six** call sites (`:1984 · :2061 · :2398 · :2482 · :2956` + the move path) — guarding six is how five
stay right and one drifts.
🚫 **Do not touch `heldTarget`.** It answers *"what does this status hold"*, which is still correct; the type
question is a different one and belongs where the booking is known.

### 7. What you must NOT do
- 🚫 **No placeholder `อื่นๆ` row in `subjects`.** REQ-065 exists because `1st Trial` as a subject leaked into the
  picker and had to be filtered back out. A booking with no program has `subject: null`.
- 🚫 **No teacher-less booking.** `teacher_id` stays `NOT NULL` — ✅ **the owner confirmed this on 2026-08-31**
  (*"ทุกการจองต้องมีครู"*), so it is the specified rule now, not a compromise. **AC-17 is WITHDRAWN.**
- 🚫 **No per-booking teacher-pay field.** None exists in the product (SPEC-070 §AC-22 — verified in both repos);
  AC-22/AC-23 are satisfied by absence and need **no build**. Do not invent one.
- 🚫 Nothing about the customer charge in this task — that is TASK-225. (Note the charge is **unaffected** by the
  teacher count: a multi-teacher อื่นๆ can still bill the customer — owner, Q7.)

## Definition of Done — the OUTCOME
- [ ] An `OTHER` booking saves **with** a student, and **without** one when a title is given.
- [ ] No student **and** no title → refused with *"กรุณาระบุชื่อรายการ"*; **nothing is written.**
- [ ] Amount 0 / negative / non-numeric → refused; both price sources → refused. (Fields accepted here; charging
      itself is TASK-225.)
- [ ] `displayName` is the title for a titled booking and the student's nickname for the other four types;
      **never empty, never "อื่นๆ".**
- [ ] **AC-14 regression:** a 1st Trial, a 1HR, a course session and a voucher session each create / attend /
      cancel exactly as before — a test per type, and `git diff` shows no behavioural change on their paths.
- [ ] Cancelling an `OTHER` booking requires a reason and stores it (`SELECT … WHERE cancel_reason='ADMIN_ERROR'`
      finds it).
- [ ] **AC-19** — an `OTHER` booking with **no teacher** is refused with a message.
- [ ] **AC-20 regression** — the other four types **refuse** `additionalTeacherIds`; `booking_teachers` can only
      ever hold `OTHER` rows (assert it, don't assume it).
- [ ] `teachers[]` comes from **one accessor**; `grep` the diff — no second place reads `teacher_id` and the join
      table separately. `teachers[0]` is always the row's `teacher_id`.
- [ ] 🔴 **AC-21** — a FREELANCE teacher's `remainingQty` is **byte-identical** before and after an `OTHER`
      booking is confirmed **and** attended (and auto-attended at 23:30), for **every** assigned teacher, and
      **no `fl:<bookingId>:…` movement exists** for it. Assert the absence of the movement, not just the number.
- [ ] The four existing types' freelance holds are **unchanged** — the existing hold tests still green.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green (report the count).
- [ ] 🔴 **The migration is run and verified on `sid` FIRST** — `db:migrate` then **`db:verify` prints ✅ before any
      restart** — and **this file states how it was proven there.** `uat` holds the customer's real money.
      🚫 You do not run it: state the exact commands for the owner via @Sober → @Porter.

## Implementation Notes (Jason, 2026-09-01)
**Repo facts, as you asked** (three tasks were reported built on 08-30 and were not in the checkout):

| | |
|---|---|
| Absolute path | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `7217599` |
| `git status --short` | 23 entries: 19 modified + 4 new (`0028`, `0029`, `outbox-idempotency.test.ts`, `other-booking.test.ts`) |

🛟 Also captured as a patch **outside** the repo — `ai-worker/archive/patch-scheduler-back-TASK-218-221-223-224.diff`
(base `7217599`, `git apply` from the repo root) — so a second tree sweep cannot destroy it. See TASK-221 §Review.

### 🔴 The migration is `0029`, not `0028`
Counted at the moment of writing, as the board demands: `drizzle/*.sql` = 29 and journal tags = 29 **before**
mine ⇒ TASK-218 had already taken `0028`, so this is **`0029_other_booking_type`**. Now 30 = 30, no orphan
either way.

### What changed

| File | Change |
|---|---|
| `drizzle/0029_other_booking_type.sql` **(new)** | enum value · both `DROP NOT NULL`s · 3 columns · `booking_teachers` · `booking_other_price_chk` |
| `drizzle/meta/_journal.json` | idx 29 registered (hand-authored; no `db:generate`) |
| `src/lib/migration-witness.ts` | witness = the **CHECK**, with the reason written out |
| `src/db/schema.ts` | enum · nullable student/subject · 3 columns · `bookingTeachers` table + relations |
| `src/validation.ts` | `LESSON_TYPES` + 8 refinements |
| `src/db/mappers.ts` | `bookingTeachers()` accessor · nullable `student`/`subject` · `title` · `displayName` · `teachers[]` |
| `src/services/scheduler.service.ts` | AC-21 guard · `attachAdditionalTeachers` · nullable `studentId` · the อื่นๆ columns on insert · `OTHER` in `REASON_ENUM_REQUIRED` · relation in `withBookingRelations` |
| `src/services/checkin.service.ts` | the same relation, so the check-in screen resolves teachers like the calendar |
| `src/services/other-booking.test.ts` **(new)** | 26 tests |
| `src/services/cancel-reason.test.ts` | the pinned set now reads `…, "OTHER"` |

### The parts worth your eye

**AC-14 is where the risk was, so half the tests are about the OLD types.** `0029` dropped two NOT NULLs, which
means the *database* stopped refusing a lesson booking with no student. `LESSON_TYPES` + two refinements put
that back in the contract, and there is a test **per type** for each. Optional-in-the-object plus a refine that
refuses the absence is the same guarantee as `.notNull()`, with one type carved out.

**AC-21 — the guard reads the booking's type inside `reconcileBookingHolds` and returns before anything else.**
Cost: one extra `findFirst` per reconcile call (`columns: { bookingType: true }`). I took that over threading a
parameter through **six** call sites — guarding six is how five stay right and one drifts, which is your own
line. It returns **before** the movement read, so an อื่นๆ booking never writes an `fl:` row at all; the DoD
asks for the absence of the row, not for a number that did not move. `heldTarget` is untouched.

**AC-18 — one accessor, and a test that counts.** `bookingTeachers()` in `mappers.ts` is the only reader;
`scheduler.service.ts` mentions the table exactly **twice** (the import and the one insert) and a test asserts
that count, so a second reader fails the suite instead of producing a support call. The relation lives in the
**shared** `withBookingRelations` (and the check-in service's copy), so every booking read has the same shape.

**A discount on อื่นๆ needed no code.** `captureBookingDiscount` already refuses anything that is not
`FIRST_TRIAL` / `SINGLE_SESSION`, so `OTHER` is excluded by construction — pinned with a test rather than a
second rule.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1004 pass / 0 fail (944 baseline; +60 across 218/221/223/224)
drizzle/*.sql = 30, journal tags = 30, no orphan either way
```

### 🚫 What is NOT proven, and is not mine to prove
Every DoD line about a **row landing** — an อื่นๆ booking saving, a FREELANCE `remainingQty` staying
byte-identical, `SELECT … WHERE cancel_reason='ADMIN_ERROR'` finding the cancel — needs a database. **I have not
run this migration anywhere** and must not.

**The exact commands for the owner, `sid` FIRST (via @Sober → @Porter):**
```bash
bun run db:migrate
bun run db:verify
```
`db:verify` is **BLOCKING** — it must print ✅ before any restart — and should report
`0029_other_booking_type` as **applied**, witnessed by `booking_other_price_chk`. Only then `pm2 restart` the
API. **`uat` only after `sid` is green, never together.**

## Questions
- 🔴 **@Sober — I broke the TASK-220 coupling deliberately, and it needs an FE line.** Adding `OTHER` to
  `REASON_ENUM_REQUIRED` is exactly what AC-13 asked for, but that set is coupled **in code** to the FE's
  `canCancelWithReason` (the ⛔ comment you and Fern put at both sites). **Until Fern adds `OTHER` there, the
  dialog will cancel an อื่นๆ booking without asking for a reason and the API will refuse it with
  `REASON_REQUIRED`.** It is a two-line pair exactly like TASK-220 — please put it in TASK-226/227 explicitly.
  I did not touch the FE.

- **A design consequence of multi-teacher I want confirmed rather than assumed.** `bookings_teacher_slot_uq`
  covers `bookings.teacher_id` only, so the **additional** teachers of an อื่นๆ booking are **not** slot-checked:
  teacher B can be on a 10:00 อื่นๆ meeting *and* teach a 10:00 lesson, and nothing refuses it. I did **not** add
  a clash check — an อื่นๆ booking is the one case where several teachers legitimately share an hour, and
  extending the unique index would forbid the feature the owner asked for. But *"B is double-booked and the
  calendar shows both"* is now a thing a staff member can create. **Acceptable, or does AC-18 want a soft
  warning (not a refusal)?** My reasoning is written at `attachAdditionalTeachers`; either way is cheap, but it
  is a business call, not mine.

- **One migration risk to watch on the `sid` run — not a blocker, but do not run it unattended.**
  `drizzle-kit migrate` wraps the whole pending set in ONE transaction, and `ALTER TYPE … ADD VALUE` inside a
  transaction block requires **PostgreSQL 12+**. I have not verified the server's version and cannot. On 12+
  this is fine — nothing in the file *uses* `'OTHER'`, which is the other half of that rule and is asserted by a
  test. If `sid` throws `ALTER TYPE ... cannot run inside a transaction block`, the fix is to split the enum
  value into its own migration; tell me and it is five minutes. **This is precisely what "sid first" is for.**

- **`OTHER` is now an overloaded word in this codebase**, which caught my eye while editing: `END_REASONS` has
  no `OTHER`, and `cancel-reason.test.ts:26` asserts `isEndReason("OTHER") === false` — which now reads as
  though it were about the booking type. It still passes and I left it alone (out of scope), but a future reader
  will misread it. Worth a rename in whichever task next touches that file.

## Review — Sober, 2026-09-01: ✅ **PASS (code-complete).** The DB-outcome lines are the `sid` run.

**Reproduced here, in `H:\scheduler\smart-scheduler-back`:** `tsc --noEmit` → **exit 0** · the six task-owned test
files (`other-booking` · `cancel-reason` · `outbox-idempotency` · `daily-reminder` · `sale-post` ·
`bulk-link-plan`) → **91 pass / 0 fail**. `drizzle/*.sql` = 30, journal tags = 30, `0029_other_booking_type`
registered at idx 29 — **I re-counted rather than taking the number from your notes.**

⚠️ **I did NOT run the full `bun test`, deliberately** — the suite reaches the live `sid` DB through
`eligible.route.test.ts:13` (your own finding). Having routed that to @Porter as a standing risk, running it here
would contradict the flag. Your 1004/0 stands as your evidence; mine is the targeted run above.

### Checked at the source, not accepted from the notes

| Claim | Verified |
|---|---|
| Guard is in `reconcileBookingHolds`, before the movement read | ✅ `scheduler.service.ts` — reads `columns: {bookingType}` then `if (booking?.bookingType === "OTHER") return;` **above** the `boMovement` query |
| `heldTarget` untouched | ✅ no diff |
| One reader of the join table | ✅ `grep -c bookingTeachers scheduler.service.ts` → **2** (import + the one insert), as your test asserts |
| `displayName` / nullable student+subject / `title` / `teachers[]` | ✅ `mappers.ts:110,138,143,146` |
| AC-14/AC-20 put back in the contract | ✅ `isLessonType` + refinements: student required · subject required · `อื่นๆ`-only fields refused on the four |
| AC-11 bounds | ✅ `otherPriceMinor: z.number().int().min(1)` (0 and negative refused) · `otherTitle: z.string().trim().min(1)` |
| AC-12 backstop | ✅ refinement **and** `booking_other_price_chk` |
| Migration traps | ✅ nothing in `0029` references `'OTHER'`; witness is the CHECK, created last |

**The `0029` renumber is exactly right** and it is the board's rule working as intended — you counted at the
moment of writing instead of trusting the number I wrote into the task yesterday.

📌 **The judgement I want on the record: `LESSON_TYPES` is the best part of this task.** `0029` dropped two NOT
NULLs, so **the database stopped refusing a lesson booking with no student** — the loosening required by อื่นๆ
silently widened the other four types. You noticed that the schema change and the contract are different things
and put the contract back, with a test per type. That is the failure this project has been bitten by twice
(`0016`'s NULL `price_group`, `0022` hiding): **a migration that is correct for the new case and quietly wrong
for the old one.** Half the tests being about the OLD types is the right shape.

📌 **One extra `findFirst` per reconcile — accepted.** It is not a hot path (status changes, not calendar reads),
and it buys the guard living in one place. Correct trade.

### Your four questions

> **1. The TASK-220 coupling is broken until Fern adds `OTHER` to `canCancelWithReason`.** ✅ **Correct, and
> important — thank you for stopping at the FE boundary instead of "just" adding a line.** Written into
> **TASK-227** (not 226: 227 depends only on this task, so the pair can land together), with the ⛔ comment
> requirement at both sites, exactly like TASK-220. Until then an อื่นๆ cancel would ask for no reason and get a
> `REASON_REQUIRED` 400 — a button that silently does nothing, which is the REQ-019 defect the owner failed
> acceptance on.

> **2. Additional teachers are not slot-checked (`bookings_teacher_slot_uq` covers `teacher_id` only).**
> ✅ **Your call not to extend the unique index is right** — it would forbid the very thing the owner asked for.
> **Do not add a clash check.** The residue you named (teacher B on a 10:00 meeting *and* a 10:00 lesson, both
> rendered) is real and is a **business** question ⇒ **@Porter, with my lean: a soft warning at save, never a
> refusal** — the admin is the one who knows whether B can be in two places. **Not blocking**: it is additive
> either way, and nothing in AC-18 requires it.

> **3. `ALTER TYPE … ADD VALUE` inside drizzle's single transaction needs PG 12+.** ✅ Flagged correctly and it is
> **not** yours to verify. It is in the deploy note to @Porter verbatim, with the failure string and your
> five-minute fix (split the enum value into its own migration). **This is exactly what "sid first" exists for** —
> and it is the second reason the `sid` run must be watched, not fired and assumed.

> **4. `OTHER` is now overloaded — `cancel-reason.test.ts:26` asserts `isEndReason("OTHER") === false`.**
> ✅ Agreed, and **leaving it alone was right** (it passes, and renaming it here would have widened a task that
> already carries a migration). Recorded: **whichever task next touches `cancel-reason.test.ts` renames it** —
> a test whose name will be misread is a comment that has started lying.

### What is NOT proven, and I am carrying it up rather than closing over it
Every DoD line that needs a row — an อื่นๆ booking saving, a FREELANCE `remainingQty` byte-identical with **no**
`fl:` movement, a `SELECT … WHERE cancel_reason='ADMIN_ERROR'` finding the cancel — is the **`sid` run**, and the
task states the commands. `db:migrate` → **`db:verify` ✅ (BLOCKING)** → only then `pm2 restart`. `uat` never in
the same sitting.

**Status → DONE (code). @Porter has the `sid` migration + the two questions above.**

## ✅ `sid` PROOF — recorded by Sober, 2026-09-01 (board: a migration TASK must state how it was proven)

Owner-run on `sid`, relayed by @Porter. **Box confirmed `sid`** before anything was read: `course_packages` = **32**
(two digits; `uat` is three — the tell is the ORDER OF MAGNITUDE, never the exact value).

```
bun run db:migrate   → [✓] migrations applied successfully
                       ("booking_other_price_chk ... does not exist, skipping" = the DROP IF EXISTS notice)
bun run db:verify    → 🔴 RED: 0025 / 0026 / 0027 in the journal, not in the ledger
bun run db:seed-ledger (dry run) → 30 applied · 0 not applied · 0 need a human · 3 ledger rows to insert
bun run db:seed-ledger --apply   → 3 rows inserted (shared __drizzle_migrations deliberately untouched)
bun run db:migrate → bun run db:verify → ✅ 30 recorded AND witnessed
```

**`0029_other_booking_type` is applied and witnessed by `booking_other_price_chk`** — the witness chosen precisely
because `DROP NOT NULL` is invisible to an existence probe. `0028` (TASK-218) is live on `sid` in the same set.

✅ **The PG-12 worry did NOT materialise** — no `ALTER TYPE ... cannot run inside a transaction block`. The enum
value and its first use were kept in different transactions, which is the half of that rule this file controls.

🔴 **The RED was the ledger, never the schema** — the dry run verified all 30 against witnesses in the actual
schema before a single row was written. Recovery was board rule 2 executed as written (dry-run → read → `--apply`
→ migrate → verify), not an invented procedure.

🚫 **Nothing was restarted, on purpose** (@Porter's call, and it is right): restarting now would ship 1 of 5 tasks,
and **TASK-227 carries the FE line that completes this task's cancel-reason half** — board rule 3, *never ship a
server-side gate without the screen that opens it*. **The schema change is live and inert: nothing can create an
อื่นๆ booking yet.** ⚠️ See the log entry of 2026-09-01 for the one condition that keeps it inert.

**`uat` is NOT done** — it runs with the rest of the batch, never in the same sitting as `sid`.
