# TASK-256 — REQ-077 Parent 2 · `TODAY'S SCHEDULE`: the blocks-under-a-shared-header re-cut
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1395/0** · no migration · 🚫 nothing sent. **Completes REQ-077's notification half.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-072` · **Requirement:** `REQ-077` **Decision 6** (@Porter, 2026-09-06) — that section is the layout
of record. **Unblocked:** the eight-block question was decided by design, not a customer round-trip.
**Finishes REQ-077's notification half** — the owner's current priority.

---

## §1 The layout — REQ-077 Decision 6, verbatim as the source

`Date` and `Coach` once at the top; each class a numbered block leading with `Time`, then `Student` · `Program` ·
`Remaining` · `*Expiry date`.
🔴 **ONE class must render EXACTLY as the customer's template, minus the numbering** — that is the common case and
the case they wrote the template for. **Assert it against the template, not by eye.**

✅ Everything else stands: **one message per person per day** (`groupReminders`), `reminderKey` untouched, the
labels verbatim, and TASK-253's audience projection applies unchanged.

## §2 🔴 The one thing to fix before building it: `Coach` is NOT constant for a parent

Decision 6 says *"`Date` and `Coach` are constant for the whole message."*

**`Date` is** — the message is one day by construction.
🔴 **`Coach` is not.** A **parent** with two children, or one child in two programmes, can have **two different
coaches in a day** — and Decision 6's own note that *"the parent's copy needs none of this in practice — one or
two classes"* lands exactly where it breaks: **two is where it breaks.** Hoisting would then print one coach's
name above a class taught by someone else. ⚠️ **In a message a parent reads to know who is teaching their child**,
that is not a layout wrinkle; it is a false statement.

⚠️ **And it is reachable on a teacher's copy too:** REQ-078 allows several teachers per booking, so two blocks can
carry different `Coach` lists even when the recipient is one of them.

### ⇒ The rule: **hoist a field only when it is ACTUALLY constant across the blocks — computed, not assumed.**

```
for each hoistable field: if every block has the same value → print it once at the top, omit from the blocks
                          otherwise                          → leave it in each block
```

- `Date` — constant by construction, always hoisted.
- `Coach` — hoisted **when the blocks agree**, in the block when they do not.

📌 **Why this and not a parent/teacher special case:** @Porter's own reason for one shared rule is *"two formats
for one message is how they drift apart."* **Hoisting is a property of the DATA, not of the audience** — so
computing it keeps one rule, one format, and delivers his intent exactly: **the coach's eight-class message still
hoists, because that coach really is the same all day.**
✅ **His layout is unchanged by this.** It removes a case he did not have in front of him; it does not re-open the
decision.

## §3 What must not regress
- **One message per person per day** and `reminderKey = reminder:<type>:<personId>:<date>` — **untouched.**
  Nothing here may make the send-once guarantee depend on the body.
- 🚫 **Do not delete `renderSchedule`** until this ships and @Porter says the review batch is closed. It is the
  owner-verified composer and the fallback if the customer prefers what they have.
- The other five decisions and the audience projection (TASK-253) — **unchanged**; this is a composer, not a rule
  change.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1395 pass / 0 fail** (18 new)
- [x] **One class renders exactly as the customer's template** — `toBe` against their literal, their field order,
      their ` : `, no numbering, nothing hoisted
- [x] Several classes render as Decision 6's example — `toBe` against that block, blank lines and 3-space indent
      included
- [x] 🔴 Two classes, different coaches ⇒ `Coach` in each block, **header asserted to be exactly**
      `["⏱️TODAY'S SCHEDULE:", "Date : …"]`
- [x] Two classes, same coach ⇒ `Coach` in the header only (`not.toContain("   Coach :")`)
- [x] Teacher audience still drops `*Expiry date` / `**Advance Leave Notice` in the NEW composer
- [x] `groupReminders` / `reminderKey` unchanged — asserted, including the key's literal format
- [x] 🚫 **No migration** (32 `drizzle/*.sql` = 32 journal tags) · no SQL · **nothing sent** — the only execution
      was `bun test` and `tsc`

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`219fd59`**. New: `src/lib/line-today-schedule.ts` ·
`src/lib/coach-names.ts` · `src/lib/line-today-schedule.test.ts`. Touched: `line-message.ts` ·
`line-message-fields.ts` · `line-i18n.ts` · `daily-reminder.ts` · `jobs.service.ts` · `outbox.service.ts`.

**§2 implemented as written: hoisting is computed.** `HOISTABLE = ["date", "coach"]`, and a field moves to the
header only when **every block has it and they all agree**. Two consequences worth naming:
- 🚫 **A field one block would OMIT is never hoisted from another.** A course beside a 1HR: the 1HR has no expiry
  at all, so a header line would announce a value that block was entitled not to have. "Absent" never agrees.
- ✅ The coach's eight-class message still hoists, because that coach really is the same all day — your point
  about one rule rather than a per-audience special case, delivered without a special case.

**A small refactor that paid for itself immediately.** `Coach` was joined in the outbox worker (TASK-253) and the
reminder job needed the identical rule ⇒ `src/lib/coach-names.ts`, one definition, both callers. **This is the
same class of drift TASK-254 flagged for the parent lookup** — caught before it became the second copy rather
than after it became the third. Likewise `remainingLabel` is TASK-254's, reused rather than re-derived, so
`4/6 ครั้ง` means the same thing in the reminder and in the deduction.

**What the reminder job now loads:** `course` and `voucher` on the **same** `findMany` (two more relations, no
extra round trip — a Saturday is ~60 sessions and a per-row lookup is the shape that job was written to avoid).

⚠️ **Three of my own tests were rewritten, not removed** — `line-message.test.ts`'s three `daily_reminder` cases
pinned `renderSchedule`'s layout. **Each kept its property in the new layout**: the message still lists every one
of a person's classes, still in ONE message, still bilingual. 🚫 `renderSchedule` itself is untouched and still
serves the teacher's `ตาราง` command.

## Answer — `Program` (your Question)

**I kept it in the block, and I did not let §2's rule decide it silently.** It *would* hoist mechanically when a
child has two sessions of the same package — which is a real case — but a block reduced to `Time` + `Student`
reads as truncated, and **a block should stand on its own**: someone scanning a numbered list is reading each
entry as one class, not as a delta from a header three lines up. Your instinct, and mine.
⇒ `Program` is simply **not in `HOISTABLE`**. One line to add if you disagree, and the test that pins the current
behaviour says so in as many words.

## Question
**Is `Program` ever constant across a person's day** (one child, two sessions of the same package)? If so, does it
hoist under §2's rule, or does it stay in the block because a block that is only `Time` + `Student` reads as
truncated? **Your call — say which you chose and why.** I would keep it in the block; a block should stand on its
own. **But it follows §2's rule mechanically, so if you hoist it, say so rather than letting the rule decide
silently.**


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-256 is DONE (code).** REQ-077's notification half is complete.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1395 pass / 0 fail** (114 files) · the hoist test at
`line-today-schedule.ts:94-98` · one-class and multi-class both asserted with `toBe` against the literals ·
`joinCoaches` imported by **two** callers from one definition · `reminderKey` still
`` `reminder:${recipientType}:${personId}:${date}` `` · no migration. Nothing sent.

### 🔴 You found the half of my rule I did not write

```ts
return blocks.every((b) => b.fields.includes(f) && b.facts[f] === first);
```

I wrote *"hoist when the blocks agree."* **You noticed that ABSENCE IS NOT AGREEMENT** — a field one block omits
can never be hoisted out of another:

> *"A course beside a 1HR: the 1HR has no expiry at all, so a header line would announce a value that block was
> entitled not to have."*

📌 **That is the same defect as the coach one, one layer down** — a header stating something true of some classes
as though it were true of all of them. My §2 named the case I had seen; **`b.fields.includes(f)` closes the case
I had not.** ✅ And `if (!first) return false` closes the third: nothing hoists out of an empty first block.

### ✅ The refactor is the part I want on the record

> *"`Coach` was joined in the outbox worker and the reminder job needed the identical rule ⇒ `coach-names.ts`, one
> definition, both callers. **This is the same class of drift TASK-254 flagged for the parent lookup — caught
> before it became the second copy rather than after it became the third.**"*

**A lesson flagged this morning became a habit this afternoon.** TASK-255 exists because three copies of a lookup
drifted apart before anyone noticed; **this one never got to two.** That is the whole value of naming a class
rather than fixing an instance, and it is the first time in this project I have watched it pay forward on the
same day. Same for reusing TASK-254's `remainingLabel` — so **`4/6 ครั้ง` means the same thing in the reminder
and in the deduction**, rather than two renderings that agree today.

### ✅ Three of your own tests rewritten, not removed
They pinned `renderSchedule`'s layout, and **each kept its property in the new one** — every class listed, one
message, still bilingual. **That is the `not.toContain` discipline generalised correctly:** an assertion is
protecting something, and when the shape changes you re-express what it protected instead of deleting it. 🚫 And
`renderSchedule` itself is untouched and still serves the teacher's `ตาราง` command — the fallback survives, as
instructed.

### ✅ `Program` — decided, not defaulted
**Kept in the block, with the reason:** *"a block should stand on its own — someone scanning a numbered list reads
each entry as one class, not as a delta from a header three lines up."* Agreed, and the important part is that it
is **not in `HOISTABLE`** rather than accidentally excluded, so the disagreement is one line and the test says so
in words. **That is exactly what I asked for: do not let the rule decide silently.**

### 📌 One line I checked because it is load-bearing
`ordered = [...rows].sort(...)` — *"a day is read in time order regardless of how the query returned it
(`renderSchedule`'s rule, kept)"*. **A property carried over from the composer you replaced**, not rediscovered.
The numbering means something because of it.

**Status → DONE (code).** ⇒ **REQ-077's notification half is complete**: audience projection, the deduction
message, and now `TODAY'S SCHEDULE`. @Porter's six decisions are all live in a working thing — **which was the
owner's instruction all along** (*"เขาดูทีหลัง"*).
