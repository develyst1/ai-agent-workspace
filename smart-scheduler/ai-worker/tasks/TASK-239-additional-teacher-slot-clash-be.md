# TASK-239: BE — an ADDITIONAL teacher must not be double-booked (the door the unique index does not guard)

- Source: REQ-078 · @Jason's DEF-4 sweep on TASK-238 · the owner's DEF-2 ruling applied to the path it did not name
- Status: ✅ DONE — code (Sober 2026-09-01) · schema-predicate edit approved (runtime blast radius nil) — was: touches the index PREDICATE SOURCE (no SQL change; see §Questions)
- Depends on: none. Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## Why this is urgent and not a follow-up

`bookings_teacher_slot_uq` is a partial unique index on **`bookings.teacher_id`** only. An อื่นๆ booking's
**additional** teachers live in `booking_teachers`, which has **no slot constraint and no application check** —
deliberately, because several teachers sharing an hour is the feature.

⇒ **Teacher B can be an additional teacher on a 10:00 อื่นๆ booking *and* teach their own 10:00 lesson.**

Jason's note said *"today it hides nothing"* because the calendar keyed cells on the **primary** teacher.
🔴 **That is no longer true.** TASK-227 shipped `teachers.some(...)` in both grids, so the booking **is** drawn in
B's column — and Fern's TASK-227 Q2 reports that a day cell holding two bookings **draws one and silently drops
the other**.

**So DEF-4's exact shape — a session that exists and is not on the calendar — is reachable through the form
today.** It is the precise outcome @Porter deferred the whole overlap capability to avoid.

## What to do

In **`attachAdditionalTeachers`** (the one chokepoint), before attaching: refuse if any additional teacher
already has a **live** booking in that `(date, start_time)`.

- **"Live" must mean exactly what the index means.** Read the statuses from `bookings_teacher_slot_uq`'s own
  `WHERE` the way TASK-238's test already does — 🚫 **do not restate the list.** Two definitions of "live" is how
  the refusal and the index drift apart.
- **Reuse `slotClashMessage`** so the sentence is identical to AC-24's, naming that teacher and their clashing
  booking. A different sentence for the same situation is a second rule.
- ⚠️ **Say at the site that this is an APPLICATION check, not an index** — it is genuinely weaker than the
  guarantee sitting next to it, and the next reader must not assume the database is holding this one.
- 🚫 **Do not constrain teachers sharing an hour.** Three teachers on one meeting is the feature. What is refused
  is **one teacher being in two places at once** — the same thing the index has always refused for the primary.

## Why this is not new scope
The owner ruled on DEF-2: **refuse with an honest message, because the calendar cannot show two things in one
slot.** That reasoning does not change when the second thing arrives through the join table instead of the
primary column — his ruling simply did not name a path nobody had walked yet.
📌 **@Porter — strike this if you read it as scope**, and it goes to the owner instead. But it should not ship as
it stands.

## Definition of Done — the OUTCOME
- [ ] Adding teacher B as an **additional** teacher on an อื่นๆ booking is refused when B already has a live
      booking in that slot — with the **same** AC-24 sentence, naming B and the clashing booking.
- [ ] **Several teachers with no clash still save** — the feature is untouched. Assert this first; it is the one
      that proves the guard is narrow.
- [ ] A **cancelled / on-leave / pending-reschedule** booking in that slot does **not** refuse — the same statuses
      the index excludes, read from the index, not restated.
- [ ] The primary teacher's existing refusal is unchanged.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. No migration. 🚫 No DB run.

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `07dac42` |

🔴 **No migration** — and that needs saying carefully, because I touched the index's *source*. See below.

### The guard
`assertAdditionalTeacherFree()`, called per teacher inside `attachAdditionalTeachers` — the one chokepoint —
**before anything is written**, beside the archived-teacher check that was already there. It refuses with
`slotClashMessage`, the identical AC-24 sentence the primary teacher's clash produces.

### 🔴 "Do not restate the list" — I went one further than a matching test
You asked me to read "live" from the index's own `WHERE` rather than restate it. TASK-238's test *compared* two
lists and kept them in step. **That is still two lists.** So I removed the second one:

`db/schema.ts` now exports **`SLOT_INACTIVE_STATUSES`**, and the index's predicate is **built from it**:

```ts
export const SLOT_INACTIVE_STATUSES = ["CANCELLED", "PENDING_RESCHEDULE", "SICK_LEAVE"] as const;
const SLOT_INACTIVE_SQL = SLOT_INACTIVE_STATUSES.map((s) => `'${s}'`).join(", ");
...
.where(sql`${t.status} not in (${sql.raw(SLOT_INACTIVE_SQL)})`)
```

Both application checks — the new guard **and** `describeSlotClash`, which was restating the three inline —
now read that constant. **There is no second definition of "live" left in the repo.**

⚠️ **`sql.raw` inlines the text, so the emitted predicate is byte-identical** to the hand-written line it
replaced (`not in ('CANCELLED', 'PENDING_RESCHEDULE', 'SICK_LEAVE')`). **No SQL changed and no migration is
implied** — only where the list lives. A test asserts that byte-identity, and it matters more than it looks:
`db:verify` witnesses the index by **name**, so a predicate that silently changed would be invisible to it —
the `0022` blindness, one layer over. I would not have made this change without that assertion.

### The guard is deliberately narrow
It asks *"does **this teacher** already have a live booking at this date+time?"* — nothing about how many
teachers share this booking. **Three teachers on one meeting still saves.** What is refused is one person in two
places, which is exactly what the index has always refused for the primary. Asserted first, because that is the
test that proves the guard did not eat the feature.

It also excludes the booking being created (`ne(b.id, bookingId)`). Validation already refuses an extra that
repeats the primary, so this is belt-and-braces on the one row known to be in flight.

### ⚠️ It is an APPLICATION check and the code says so, twice
It is **genuinely weaker** than the index beside it — two concurrent requests can both pass it. That is written
at the site in the words a reader needs (*"the database is NOT holding this one; do not assume it is"*), and a
test asserts the warning is present. A `booking_teachers` unique index would be stronger, but it would forbid
the feature (several teachers *must* share a booking), and a partial index across two tables is not something I
would add without a ruling.

### 📌 One runtime risk I checked rather than assumed
The guard uses `notInArray` and `ne` from the relational-query operator set. Those are `any`-typed in the
callback, so **`tsc` would not have caught a typo or a missing operator** — it would have been a runtime
`undefined is not a function` on the refusal path, which is the worst place for one. Verified against the
installed source: `node_modules/drizzle-orm/relations.cjs:94` `getOperators()` exports both. (`describeSlotClash`
has used `notInArray` since TASK-238 on the same unverified assumption; it is now verified too.)

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1096 pass / 0 fail (+12)
drizzle/*.sql = 30 = journal tags — unchanged
```

### 🚫 Not proven by me
The behavioural DoD lines need rows: that B is refused, that three clash-free teachers still save, that a
`SICK_LEAVE` occupant does **not** refuse. **`SICK_LEAVE` is the one I would ask Tanya to check hardest** — it is
the case where a guard that is slightly too wide would break UC-004 overbooking, a flow much older than this
feature, and it would look like an unrelated regression.

## Questions
- **I edited `schema.ts`'s index predicate, and I want that looked at specifically.** It is the one change in
  this task that could in principle touch the database, and my claim is that it cannot: `sql.raw` inlines the
  same text, so the emitted predicate is byte-identical and no migration is implied. **A test asserts exactly
  that byte-identity** — which is load-bearing, because `db:verify` witnesses this index by **name**, so a
  predicate that quietly changed would pass verification while the running index and the schema disagreed.
  That is the `0022` blindness one layer over, and it is the reason I did not make this change on confidence
  alone. **If you would rather the constant existed without the index being built from it, say so** — the
  fallback is TASK-238's shape (two lists, one test keeping them in step), which is weaker but touches nothing.

- **The guard is an application check, and there is a stronger option I did NOT take.** A unique index on
  `(teacher_id, date, start_time)` across `booking_teachers` would make this a database guarantee like the
  primary's. I did not, for two reasons: it needs a migration on a release that is mid-re-test, and
  `booking_teachers` has no `date`/`start_time` of its own, so it would need denormalised columns or an index on
  a join — a real design decision, not a tidy-up. **Naming it so "we used an application check" is a recorded
  choice rather than the thing nobody thought of.**

- 🟢 **TASK-240 is still open and I have not started it** (`coursePackages.student_id`, the same DEF-3 shape in
  course search). You marked it *after the release* and I am respecting that — flagging only so it is in your
  end-of-session ball line rather than remembered.

- **Still unanswered from TASK-236:** whether the `additionalTeachers` fix in `getBookings` and the `q`-title
  search should have been separate tasks. You passed the task, so I am reading that as settled — say otherwise
  if not.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** Deleting the second list beats keeping two in step, and you were right to flag the edit.

**Reproduced:** `tsc --noEmit` → **0** · `other-booking` + `slot-clash` + `mappers` → **51 pass / 0 fail** ·
`schema.ts:82` `SLOT_INACTIVE_STATUSES`, `:85` `SLOT_INACTIVE_SQL`, `:453` the predicate built from it ·
`assertAdditionalTeacherFree` called per teacher **before** the insert (`:1051`).

📌 **"That is still two lists" is the right instinct and the better fix.** I asked you to read the index's `WHERE`
in a test; you removed the thing the test was compensating for. **A test that keeps two definitions in step is a
maintenance contract; one definition is a property.** Same shape as your `SALE_ITEMS` reasoning on TASK-229 —
assert the source, not a copy of it.

### ✅ Your Q1 — the `schema.ts` predicate edit. Approved, and it is even safer than you argued

Your case (`sql.raw` inlines the same text ⇒ byte-identical emitted predicate ⇒ no migration implied) is correct,
and **the byte-identity test is genuinely load-bearing for the reason you gave**: `db:verify` witnesses this index
**by name**, so a predicate that quietly changed would pass verification while the running index and the schema
disagreed — `0022`'s blindness one layer over. Keeping that test is not optional.

**And one more reason it is safe, which strengthens it:** a drizzle index definition in `schema.ts` is
**declarative metadata for `drizzle-kit`**, not something any query consults at runtime. This repo **forbids
`db:generate`** (the snapshot chain stops at 0003 — `drizzle/README.md`), so nothing reads that `.where()` today
at all. ⇒ **the runtime blast radius of this edit is zero**, and the byte-identity test is protecting the day
someone *does* generate. **You did not need to be this careful, and you should keep being this careful** — the
version of this change made on confidence alone is indistinguishable from the version that breaks a box.

### ✅ Your Q2 — application check, not an index

**Right choice, and naming the stronger option you did not take is what makes it a decision instead of an
oversight.** The blocker you identified is the real one: `booking_teachers` has no `date`/`start_time`, so a
unique index there needs **denormalised columns** — a design change with its own failure mode (two places holding
the same time), not a tidy-up. Doing that inside a `TEST_FAILED` re-test would be the wrong trade twice over.
⚠️ Keep the two warnings at the site exactly as they are. *"The database is NOT holding this one"* is the
sentence that stops someone assuming the guarantee next to it applies here.

📌 **Verifying `notInArray`/`ne` exist in the relational operator set against the installed source** — good. Those
callbacks are `any`-typed, so a typo would have been a runtime `undefined is not a function` **on the refusal
path**, which is the worst possible place: the failure would appear only when someone was already being told no.

### Your other two questions
- 🟢 **TASK-240 — correct, it is after the release, and it is in my ball line, not in anyone's memory.**
- ✅ **TASK-236's two extras are settled** — both were the sweep working as intended, and you listed them instead
  of letting me find them. Nothing to split.

### 🚫 Not proven, and I agree with which one to point at
`SICK_LEAVE` **is** the one to check hardest: a guard slightly too wide breaks UC-004 overbooking — a flow far
older than this feature — and it would surface as an unrelated regression nobody connects to อื่นๆ. That warning
goes to @Tanya with the re-test.

**Status → DONE (code). The window is shut.**
