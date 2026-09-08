**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 1723 pass 0 fail / nothing applied. The cause was TWO OWNERS for one range, one of which did not exist; hhmm removed from jobs.service.ts so one place owns it. TIME_OWNER closes it two ways.

# TASK-283 — DEF-3: `TODAY'S SCHEDULE` prints `09:00:00-10:00` — seconds on the START only

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
**Cause:** the owner's phone, live on `sid`. 📌 **Cosmetic — and in the message every parent and coach reads
every morning.** ⛔ **Rides with TASK-282** while `uat` is halted; it costs nothing extra.
🚫 No migration, no database, no FE change.

---

## §1 Where it is
`line-today-schedule.ts:77` — `time: r.endTime ? \`${r.startTime}-${r.endTime}\` : r.startTime`.
**`startTime` arrives raw from the `time` column (`09:00:00`); `endTime` arrives already formatted (`10:00`).**
⇒ **it is not a formatter applied to both ends — it is one end that never had one.**

## §2 🔴 Fix it where the payload is BUILT, not at the join
✅ **`hhmm()` exists and every other message already uses it** — `CONFIRMED SCHEDULE` (`hhmm(course.startTime)`)
and `COURSE DEDUCTION` (`ctx.startTime`) are both correct, which is why only this one is wrong.
⇒ **Find where the daily-reminder payload sets `startTime` and apply the same `hhmm()` the others do.**
🚫 **Do not add a second trim at the render site.** *A value that arrives clean everywhere except one builder is
a builder bug; trimming it at the join would make two places responsible for the same fact* — and the next
message added would be the third.
⚠️ **If `endTime` is formatted somewhere different from `startTime`, say so** — two ends formatted in two places
is the actual cause and worth naming even after the fix.

## §3 🔑 @Porter's point, and it is the reason this is worth a task rather than a line
> *"Your test compares `CONFIRMED` against `DEDUCTION` and both are right. The defect lives in the third
> rendering, which the comparison does not reach."*

**He is right, and it is the shape we have hit all week: two things agreeing while a third disagrees with both.**
📌 **TASK-257 §2 made `Time` mean one thing by comparing two messages. The daily block is @Porter's Decision 6
and did not exist when that assertion was written.**
⇒ 🔑 **The assertion must cover ALL THREE renderings**, and be written so a FOURTH cannot be added without
joining it — **enumerate the message kinds that print a `Time`, from one list, rather than naming two of them.**
**That is the deliverable; the `hhmm()` is the easy half.**

## §4 What must not change
- 🚫 `hhmm()` itself, the stored `time` values, the numbered daily-block layout (Decision 6).
- 🚫 `CONFIRMED SCHEDULE` and `COURSE DEDUCTION` output — **byte-identical, asserted.**
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] `TODAY'S SCHEDULE` prints **`09:00-10:00`** — asserted on the rendered message
- [ ] 🔑 **ONE assertion covering every message kind that prints a `Time`**, enumerated from a single list, **so a
      fourth cannot be added without joining it** — *not two messages compared to each other*
- [ ] 🚫 `CONFIRMED SCHEDULE` and `COURSE DEDUCTION` byte-identical — asserted, not assumed
- [ ] **Break it and watch:** restore the raw `startTime` and show the new assertion fails **for that reason**
- [ ] 🚫 No migration, no database, no FE change

## Question
**Is any other value in that payload raw where the other messages' is formatted?** You are already in the
builder. 📌 *`startTime` was wrong because it was the one field the daily block sourced differently — there may
be a second.* **Name it; fix only the time.**

---

## §5 ➕ RESULT 2026-09-08 — @Jason. Code done. tsc **0** · **1723 pass / 0 fail**, 136 files.

- [x] `tsc --noEmit` → **0** · `bun test` → **1723 / 0**, 136 files
- [x] `TODAY'S SCHEDULE` prints **`09:00-10:00`** — asserted on the full rendered message, byte for byte
- [x] 🔑 **ONE assertion covering every message kind that prints a `Time`**, enumerated from `TEMPLATE_FIELDS`
- [x] 🚫 `CONFIRMED SCHEDULE` and `COURSE DEDUCTION` byte-identical — asserted with their full strings
- [x] **Break it and watch** — see below
- [x] 🚫 No migration, no database, no FE change

New: `src/lib/message-time-format.test.ts` (7 tests).

### The cause, and it is not "one end had no formatter"
**The two ends of one range had two different owners, and one of them did not exist.** `endTime` was trimmed in
`jobs.service.ts`; `startTime` was owned by nobody. The other two templates each format both ends in one file
(`scheduler.service.ts` for CONFIRMED SCHEDULE, `outbox.service.ts` for COURSE DEDUCTION).
⇒ **Both ends now live in `groupReminders`** (`daily-reminder.ts`), the pure builder that constructs the row —
the daily block becomes the third template that works this way rather than the exception. The `hhmm` was
**removed** from `jobs.service.ts` so exactly one place owns it. 🚫 Nothing added at the join.

### 🔑 The deliverable — enumerated, not named
`TIME_OWNER` is a **`Record<TemplateKey, … | null>`**, and the test walks **`TEMPLATE_FIELDS`** to decide which
templates print a `Time`. A fourth template cannot be added without joining it, two independent ways:
1. a new `TemplateKey` is a **compile error** until it declares where its time is built;
2. declaring `null` for a template that *does* print a `Time` **fails the test** rather than opting out.
Nothing in the file restates *"there are three"* — the list is read.

### ✅ Break it and watch — and the REASON
Restoring `startTime: s.startTime` reproduces the owner's line exactly:
`1) Time : 09:00:00-10:00`. **Four tests fail; `CONFIRMED SCHEDULE` and `COURSE DEDUCTION` stay green** — which
is @Porter's §3 point demonstrated rather than accepted: the two-message comparison could not have caught this.
The ONE-list assertion fails on `todays_schedule.start = false`, i.e. **the build site stopped formatting**, not
merely "something went red".

### 🔻 Two tests were defending the raw value; both corrected, neither deleted
`daily-reminder.test.ts:58` expected `["09:00:00", …]` (the property it protects is the ORDER, which is
unchanged — `hhmm` is a prefix slice and cannot reorder). `line-message.test.ts:176` asserted
`1) Time : 09:00:00` — **the defect written down as an expectation.** Its fixture hand-builds the payload, so it
kept passing after the fix: a test defending a value no real payload can carry any more.

### Question — **no second raw field.**
`date` and `expiryDate` arrive raw in `course_deduction` too (`outbox.service.ts:44`), so the daily block agrees
with it; `remaining`, `coach` and `program` all go through the very helpers the other messages use
(`remainingLabel`, `joinCoaches`, `programLabel`). **`startTime` was the only field the daily block sourced
without the formatter the others call.**

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-283 is DONE.** 🔑 **And the cause is not what I wrote in §2.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1723 pass / 0 fail**, 136 files ·
**`hhmm` no longer appears in `jobs.service.ts` at all** — one owner, as claimed · `TIME_OWNER` is a
`Record<TemplateKey, …>` cross-checked against `TEMPLATE_FIELDS`.

### 🔑 "One end had no formatter" was my §1, and it was the shallower reading
> *"The two ends of one range had two different OWNERS, and one of them did not exist. `endTime` was trimmed in
> `jobs.service.ts`; `startTime` was owned by nobody."*

⇒ **the other two templates each format both ends in ONE file**, and the daily block was the exception. ✅ **You
moved both into `groupReminders` and REMOVED the `hhmm` from `jobs.service.ts`** — **that removal is the fix.**
📌 **Adding a formatter would have made the daily block agree by coincidence; moving the ownership makes it agree
by construction, and it is now the third template that works the same way rather than the odd one.**

### 🔑 The deliverable — and you closed it two ways, where I asked for one
`TIME_OWNER` as a `Record<TemplateKey, …>` **read against `TEMPLATE_FIELDS`**:
1. **a new `TemplateKey` is a COMPILE error** until it declares where its time is built;
2. **declaring `null` for a template that does print a `Time` FAILS** rather than opting out.
🔑 **The second one is the half I would have missed.** A compile error can be silenced by writing `null`; **that
escape is now itself a failure.** ✅ **And nothing in the file restates "there are three" — the list is read.**

### ✅ Break-it-and-watch, with the reason and the CONTRAST
Restoring `startTime: s.startTime` reproduces the owner's line exactly — `1) Time : 09:00:00-10:00` — **four
tests fail while `CONFIRMED SCHEDULE` and `COURSE DEDUCTION` stay green.**
🔑 **That is @Porter's §3 point demonstrated rather than accepted:** *the two-message comparison could not have
caught this.* **Showing which tests DON'T fail is the part that proves the old assertion was blind**, and it is
not something I asked for.

### 🔻 Two more tests were defending the wrong thing — that is FOUR in two days, and one of them is new in kind
`daily-reminder.test.ts:58` expected `["09:00:00", …]` — corrected, and you noted the property it actually
protects (**order**) is untouched, because `hhmm` is a prefix slice and cannot reorder. **That is the right way
to correct a test: keep what it was for.**
🔴 **`line-message.test.ts:176` is the interesting one:** it asserted `1) Time : 09:00:00` — **the defect written
down as an expectation** — **and it kept PASSING after the fix, because its fixture hand-builds the payload.**
⇒ **a test defending a value no real payload can carry any more.**
📌 **The count so far: the overruled date format · the ISO echo · this pair.** **But this is the first one that
stayed GREEN across the fix** — the others went red and announced themselves. ⇒ **a hand-built fixture can keep a
retired shape alive indefinitely, and nothing will ever tell you.** **That is worth more than the defect.**

### Answer — no second raw field, and the negative is reasoned
`date` and `expiryDate` arrive raw in `course_deduction` **too**, so the daily block **agrees** with it;
`remaining`, `coach` and `program` all go through the same helpers the other messages use. ⇒ **`startTime` was
the only field the daily block sourced without the formatter the others call.** **A negative with the reason
attached, which is the only kind worth having.**
