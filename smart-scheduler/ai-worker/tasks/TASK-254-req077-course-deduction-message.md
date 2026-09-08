# TASK-254 — REQ-077: `COURSE DEDUCTION`, the one genuinely new message — and it has TWO triggers
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1377/0** · no migration · 🚫 nothing sent.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-072` §3 · **Requirement:** `REQ-077` Parent 3 + the per-type table.
⛔ **Do TASK-253 first** — this message cannot render until the renderer has the fields.

---

## §1 🔴 Two deduction sites, and the one everybody would forget is the majority

Quota is written in **two** places:

| Site | Path | How it writes |
|---|---|---|
| `scheduler.service.ts:2513/2520` | an admin marks attendance | `usedSessions: current.course.usedSessions + 1` — **read-then-write**, so the post-value is already in hand |
| `jobs.service.ts:58/65` | **the day-end auto-attend** | `sql\`usedSessions + 1\`` — **in place**, so the post-value must be read back |

🔴 **Since REQ-070 / TASK-180 the day-end auto-attends every unmarked class.** ⇒ **the day-end is the MAJORITY
path**, not the exception. A `COURSE DEDUCTION` wired only to the manual check-in would be **missing for most
sessions and would pass every test anyone thought to write**, because the test would check the path the author
was looking at.

⇒ **One helper, called from both sites.** 🚫 Not two message-building blocks that must be kept in step.

## §2 `Remaining` is the balance AFTER the deduction — read it from the write

Porter, and he is right: *the message exists to answer "เหลือเท่าไหร่", and a before-figure in a message headed
DEDUCTION is the one number that must never be ambiguous.*

- Manual site: it already holds the pre-value; **+1 is exact.**
- Day-end: the update is `sql\`… + 1\`` ⇒ **`.returning()` the row and use what the database wrote.**
⚠️ **Never recompute the remaining from a second read** — a concurrent write between them would print a number
that was true at neither moment. **Take it from the write that caused the message.**

## §3 Who gets it, and who does not

| Type | `COURSE DEDUCTION`? |
|---|---|
| Course · Voucher | ✅ |
| 1HR · 1st Trial · อื่นๆ | ❌ — **they deduct from nothing** |

📌 Porter's decision 4, and keep his reason in a comment: **announcing a subtraction that did not happen is worse
than silence.**
⚠️ **The guard is "there is a balance", not "the type is in a list".** The booking already carries `courseId` /
`voucherId` — **absent means nothing was deducted, which is the same condition the deduction itself uses.** One
condition, not a type list that can drift from it.

## §4 The `อื่นๆ`-with-no-student rule is an ENQUEUE rule (SPEC-072 §5)
An อื่นๆ booking may have **no student** ⇒ **no parent row is written at all.** Do not "handle" it in the
renderer: a row addressed to nobody still lands in the outbox as SKIPPED and reads as *we tried to reach a
family*, when there was none. **No parent ⇒ no parent row.**
*(In practice อื่นๆ never deducts, so this should be unreachable here — **assert that it is**, rather than
relying on it.)*

## §5 Idempotency — the day-end can be re-run, and we have just told the owner it is safe
`runEndOfDayJob(date)` re-run is the documented recovery for the AC-5 seeding gap, and revenue is idempotent on
`rev:<bookingId>`. 🔴 **A notification must not be the thing that makes a re-run unsafe** — a parent receiving
*"1 session used"* twice for one class is a support call and a loss of trust in the number.
⇒ **The deduction message needs its own idempotency key** on the outbox row — the booking id is the natural one,
since a session is deducted once. ⚠️ **Confirm what the outbox already offers** (`reminderKey` exists for the
daily reminder — say whether that mechanism is reusable or whether this needs its own) **before inventing one.**
📌 The auto-attend itself is already idempotent — it only touches `CONFIRMED` rows — **so a second run deducts
nothing, and must therefore announce nothing.** Tie the message to the write, and this follows for free.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1377 pass / 0 fail** (18 new)
- [x] One helper (`src/lib/course-deduction.ts` · `notifyCourseDeduction`), called from **both** sites —
      asserted in each site's own source, and asserted that **neither builds its own message**
- [x] `Remaining` comes from the write: `.returning()` at the day-end, the pre-value + 1 at the manual site.
      Asserted, **and the absence of a second read is asserted too** (no `findFirst` / `.select(` in that loop)
- [x] Course and voucher get it; 1HR · 1st Trial · อื่นๆ do not — and the guard is the deduction's **own**
      condition (`if (b.courseId)` / `if (b.voucherId)`), asserted to sit before the call. 🚫 No type list in
      the helper: asserted it mentions neither `FIRST_TRIAL` nor `SINGLE_SESSION`
- [x] A studentless booking produces **no row at all** — `if (!input.studentId) return;` before any enqueue,
      asserted by position
- [x] **A re-run sends no second message** — see the answer below for the mechanism
- [x] 🚫 No SQL, nothing sent, **no migration** (32 `drizzle/*.sql` = 32 journal tags) — **and none was needed**:
      the outbox already has everything this uses

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`219fd59`**. New: `src/lib/course-deduction.ts` +
`src/lib/course-deduction.test.ts`. Touched: `src/services/scheduler.service.ts` · `src/services/jobs.service.ts`
· `src/lib/line-message.ts` · `src/lib/line-i18n.ts`.

**The payload carries money facts only** — `remaining` (already rendered), `total`, `expiryDate`, `bookingType`.
Student · program · date · time · coach are enriched by the worker from the row's `bookingId`, the same way every
other booking-based message gets them. That is also why `Coach` needed nothing new here: TASK-253's `joinCoaches`
already fills it from the one accessor.

**The day-end loop now `.returning()`s both updates.** The write is `used + 1` **in SQL**, so the post-value
exists only in the database until it is read back — and reading it back is the only way to print a number that
was true at the moment of the deduction rather than at some moment near it.

⚠️ **One shape worth your eye:** `notifyCourseDeduction` does its own parent lookup (student → parent →
`line_user_id`), which is the third copy of that two-step in the repo (`scheduler.service` has a private one,
`daily-reminder` does it in bulk). I did **not** unify them in this task — it would touch `confirmCourse` and the
reminder job, neither of which this task is about — but it is the kind of duplication that drifts, and TASK-230's
`familyLineUserIds` is the accessor they should probably all end at. **Flagging, not fixing.**

## Answer — the idempotency mechanism (your Question)

**Yes, the outbox has one — `idempotencyKey` + `notification_outbox_idempotency_uq` (TASK-218, migration `0028`).
`reminderKey` is not a mechanism, it is a key FORMAT built on it. And I could not use it, for a stated reason.**

🔴 `enqueueLine`'s own signature says it: *"`idempotencyKey` may only be used OUTSIDE a transaction"* — the
duplicate is detected by letting the insert hit the unique index and swallowing the `23505`, and **a swallowed
constraint error leaves the surrounding transaction aborted**, so every later statement in it fails. **Both
deduction sites are inside a transaction** (the day-end's whole auto-attend loop is one). Passing a key there
would not be belt-and-braces; it would be a live defect the first time two rows collided.

⇒ **The idempotency is the deduction's own, exactly as you predicted in §5: the message is enqueued INSIDE the
`if` that writes the quota.** The day-end selects `status = CONFIRMED` and leaves everything `ATTENDED`, so a
re-run's `due` list is empty and the loop — message included — never runs. The manual path guards on
`status !== "ATTENDED"` for the same effect. **A re-run deducts nothing and therefore announces nothing**, and
the two can never disagree because they are the same branch.

📌 The alternative was enqueuing after the commit to buy a key. That trades atomicity for it: a crash between
commit and enqueue would lose the message **with no recovery**, because the second run deducts nothing and would
send nothing. **A key that protects against a duplicate we cannot produce, at the cost of a message we cannot
resend, is the wrong trade.**

## Question
**Does the outbox already have an idempotency mechanism you can reuse?** `reminderKey` exists for the daily
reminder. **Reuse beats invention here** — and if it does not fit, I want the reason, not a second key format
living beside the first.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-254 is DONE (code).** You found the reason my §5 instruction would have been a defect.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1377 pass / 0 fail** (113 files) ·
`notifyCourseDeduction(tx, …)` at **four** sites — `jobs.service.ts:73/91` and `scheduler.service.ts:2520/2536`,
**all inside the transaction** · `.returning()` on the day-end update with the reason in the comment · no migration.

### 🔴 The answer to my §5 is better than my §5

I told you to give the message *"its own idempotency key on the outbox row"*. **You found why that would not have
been belt-and-braces but a live defect:**

> *"`enqueueLine`'s own signature says it: `idempotencyKey` may only be used OUTSIDE a transaction — the duplicate
> is detected by letting the insert hit the unique index and swallowing the `23505`, and **a swallowed constraint
> error leaves the surrounding transaction aborted.** Both deduction sites are inside a transaction."*

⇒ **Following my instruction literally would have aborted the day-end transaction the first time two rows
collided** — taking the auto-attend, the quota deduction and the `job_runs` row with it. **The one place I said
to add safety was the one place it would have caused the failure.**

✅ **And the shape you took instead is the one §5 predicted for the right reason:** the enqueue sits **inside the
`if` that writes the quota**, so the message and the deduction are the same atomic act. A re-run's `due` list is
empty (`status = CONFIRMED` only), so **it deducts nothing and therefore announces nothing** — and the two cannot
disagree **because they are the same branch**, not because two mechanisms happen to agree.

📌 **The trade you named is the reasoning I want kept:**
> *"A key that protects against a duplicate we cannot produce, at the cost of a message we cannot resend, is the
> wrong trade."*
**Enqueue-after-commit would have bought a key by giving up atomicity** — a crash in that window loses the message
**with no recovery**, because the second run deducts nothing and would send nothing. **Correctly refused.**

### ✅ The guard is the deduction's own condition, and you proved the absence of the alternative
`if (b.courseId)` / `if (b.voucherId)` — **the same condition the deduction itself uses**, so a type list cannot
drift from it. And you asserted the helper mentions **neither `FIRST_TRIAL` nor `SINGLE_SESSION`**.

📌 **That is the first absence-assertion written since the 09-05 rule, and it passes the test that rule sets:**
*an assertion that something does not exist is only as good as the reason it doesn't.* Here the reason is a design
rule — **one condition, not two that can disagree** — so it is a control, not a frozen accident. Same for
*"no second read in that loop"*: the reason is stated (*a concurrent write would print a number true at neither
moment*), so the absence is load-bearing. **Both are the good kind, and they are the good kind for a sayable
reason.**

### ✅ The studentless guard by position, and no migration
`if (!input.studentId) return;` **before any enqueue**, asserted by position — so no row addressed to nobody ever
reaches the outbox. And no migration was needed because the outbox already had what this uses; **you re-counted
32 = 32 rather than asserting it.**

### 📌 Your flag — I am not leaving it as a flag
> *"`notifyCourseDeduction` does its own parent lookup… the third copy of that two-step in the repo."*

**Right, and flagging rather than fixing was the correct call** — unifying it would have touched `confirmCourse`
and the reminder job, neither of which this task was about. ⚠️ **But a flag in a task file is a note, and a note
is not a control** — that is my own recorded lesson and I have now been on the wrong side of it twice this week.
⇒ **Cut as TASK-255**, unprioritised, naming TASK-230's `familyLineUserIds` as the accessor all three should end
at. **It will still be there when it is worth doing; it will not be forgotten.**

**Status → DONE (code).** 🚫 Nothing sent, no SQL, no migration.
