# TASK-625 — BE: **a "from here on" swap pays the NEW teacher at the OLD teacher's rate** (@Sober's finding, owner ruled it into this round)
**From @Sober to @Jason.** **Owner: "3 รอบนี้เลย".** 🔴 **It is money, and it is wrong in ONE direction.**
🚫 **This is NOT part of `TASK-629`. Two changes, two verdicts** — @Porter and I both said so, and the reason is that folding them makes one failure explain the other away.

---

## 1. The finding, as I found it reading for item E
**The per-session swap (`onDate`) writes the incoming teacher's rate, and REFUSES when it cannot find one (`RATE_REQUIRED`).**
🔴 **The from-this-date-on swap writes `{ teacherId: input.to }` and leaves `teacher_rate_minor` ALONE.** ⇒ **the new teacher is paid at the OLD teacher's stored rate, silently, on every row it moves.**
📌 **It was not hidden: the code says the from-date swap was deliberately out of scope at the time.** 🔑 **So the owner's ruling — *the cover is paid at the COVERING teacher's rate* — holds for ONE session and NOT for the rest-of-series case.** **He has now ruled that gap closed.**

## 2. ▶️ What to do
**A from-here-on swap writes the INCOMING teacher's rate on every row it moves, by the SAME rule the per-session swap already uses.**
🔴 **ONE rule, asked from ONE place.** 🚫 **Do not write a second rate resolution for the second scope** — `seriesRateOf` + `RATE_REQUIRED` already exist and are already correct. **If the per-session branch and the from-here-on branch each resolve a rate, extract it.**
⚠️ **Then answer, in the code, the question that follows and do not leave it to the reader:** **what happens when the incoming teacher has NO rate in this series and the swap spans twelve rows?** 🔑 **The per-session case refuses one row. This case must refuse the WHOLE swap before any row moves, or it will half-move a series** — *a partial swap is worse than a refusal, because nobody can see where it stopped.* **Pin "nothing moved" by value on that refusal.**

## 3. 🔴 The part @Porter needs from you, and it is NOT a fix
⚠️ **Say plainly whether rows ALREADY written at the wrong rate exist, and how one would be recognised.**
**What I want is the SHAPE of the answer, not the answer:** **which column, compared against what, identifies a row whose rate belongs to a teacher who is no longer on it.**
🚫 **You do not run it. Nobody here runs it.** ▶️ **Write it as ONE read-only query, with a one-line statement of what each number means, and hand it up through me.** 🔑 **If it turns out such a row cannot be recognised from the data, SAY SO** — *"we cannot tell" is a real answer and the owner can act on it; a guess he mistakes for a count is not.*
📌 **A repair, if any, is the owner's decision and a separate task. 🚫 Do not write one, do not sketch one.**

## 4. ✅ Done means
1. **`tsc` clean · the DB-unreachable suite with COUNTS · migrations balanced.**
2. **ONE rate rule, proven by an ABSENCE: no second resolution site.**
3. **Value tests: a from-here-on swap re-rates every row it moves to the incoming teacher · a swap it cannot rate moves NOTHING · the per-session behaviour is byte-for-byte unchanged.**
4. **Mutations with the set NAMED and left in the repo** — including one that reverts the rate write, which must BITE.
5. **The read-only query and its explanation, for @Porter, through me.**

## 5. 🚫 Not in this task
**Item E's widening (`TASK-629`)** · **any repair of existing rows** · **the four notification kinds (`TASK-614`)** · **the coach-pay visibility rules (Team B's).**

## ✅ 2026-10-04 — @Jason: DONE — ONE rate rule, and §3's query is a SHAPE with a limit, not a count
**`tsc` 0 · the DB-unreachable suite 3796 pass · 0 fail · 65 .sql = 65 journal tags — no migration.**
**Mutation set: `src/lib/from-here-on-rate-task625.mutations.json` — 10 / 10 BITE**, baseline 65, CHECKSUM identical, restores byte-identical. **Test set named in the file:** `from-here-on-rate-task625.test.ts` · `swap-any-teacher-task629.test.ts` · `other-series-req101.test.ts` · `cover-rate-key-task584.test.ts`.

### §2 — one rule, and it is FEWER rules than before
```ts
const rate = input.rateMinor ?? seriesRateOf(rows, input.to);
if (rate == null) throw RATE_REQUIRED(targets[0].date);
```
- **Asked ONCE, before the loop, for every scope and BOTH locations.** 🔑 **I did not add a resolution — I removed one:** TASK-629 had left the extra path resolving its own rate beside the per-session one. **That asymmetry — the extra path requiring a rate in both scopes while the primary required one only for `onDate` — IS the defect, in miniature.** The absence is pinned: `seriesRateOf(` and `RATE_REQUIRED(` each appear **exactly once** in the act.
- **The fork that was the bug is gone:** `input.onDate ? {…, teacherRateMinor} : { teacherId }` is now one write carrying the rate. **Mutation R1 puts the fork back and BITES.**
- 🔴 **A swap it cannot rate moves NOTHING** — refused before the first row. **Pinned by value (`expect(writes).toEqual([])`), and R3 (move the refusal inside the loop) BITES.**

### §8 — folded in, and the contract change stated
**`rateMinor` is now accepted with `fromDate` as well.** ⚠️ **The contract change, written in the validator where it happened: a body that was a 400 is now accepted — the door promises more than it did.** ✅ **Pinned as unchanged where it is unchanged:** a scope is still compulsory, the same teacher twice is still refused, `rateMinor` still means the INCOMING coach's rate and nobody else's (a map is still stripped), and **TASK-584's key-59 gate reads the BODY, not the scope** — so widening the scope could not widen who may send a rate. **Asserted by value on `bodyEditsCoachRate` itself. R7 and R8 (undo the widening · widen it too far) both BITE.**

### ⚠️ Pins I narrowed, with the reason written into each
1. **`other-series-req101`'s from-here-on swap pin** asserted `{ teacherId: T3 }` with no rate — **it asserted the defect.** It now asserts the refusal (by CODE, not by status) **and** the re-rated write.
2. **The same test's `from: T2 ⇒ 400`** — ⚠️ **between TASK-629 and TASK-625 that line passed for a DIFFERENT reason than it was written for** (T2 is a legitimate extra swap since 629; the 400 it met was `RATE_REQUIRED`). **Said so in the file.**
3. **TASK-562's "the number lives only with `onDate`"** — retired; the half that survives (there is no way to name anyone ELSE's rate, in either scope) is now asserted in both scopes.
4. **My own TASK-629 "the PRIMARY path is UNCHANGED"** — narrowed to "unchanged BY THAT TASK; TASK-625 added the rate", with both halves stated.

---

## 🔴 §3 — for @Porter, through @Sober: the SHAPE, and what it cannot tell you
### The honest headline
**We can produce a CANDIDATE LIST, not a count — and the reason is one line: nothing in this database records that a swap happened, or why a number was chosen.** 🔑 **A row written by the defect and a row an admin deliberately priced that way are byte-identical.** ⇒ **"How many rows are wrong" cannot be answered. "Which rows to look at, and why each is suspicious" can.**

### What makes a row recognisable at all
**`notification_outbox` is the only durable trace of a teacher change.** Every swap enqueues `teacher_unassigned` + `teacher_assigned` carrying the `booking_id`, **nothing in this repo prunes that table**, and **on a row with `other_series_key` the series swap is the only writer of that pair** (the other writer, `sendTeacherReassigned`, serves the course-plan edit and the Move popup). ⇒ **an outbox `teacher_assigned` on a series row means: a swap put this teacher here.**

### The query — READ ONLY, nobody here runs it
```sql
-- TASK-625 §3 — CANDIDATES for "the rate on this row belongs to a teacher who is no longer on it".
-- READ ONLY: one SELECT, no writes, no temp tables. Safe on a replica.
WITH swapped AS (                                   -- rows a swap put the current teacher onto
  SELECT DISTINCT o.booking_id
  FROM notification_outbox o
  WHERE o.payload->>'kind' = 'teacher_assigned' AND o.booking_id IS NOT NULL
),
rowz AS (                                           -- every OTHER-series row that carries a primary rate
  SELECT b.id, b.other_series_key AS k, b.teacher_id, b.teacher_rate_minor AS rate, b.date, b.status
  FROM bookings b
  WHERE b.other_series_key IS NOT NULL AND b.teacher_rate_minor IS NOT NULL
)
SELECT r.id, r.k, r.date, r.status, r.teacher_id, r.rate,
       -- 1 = this number is a rate the CURRENT teacher is paid elsewhere in this same series
       (EXISTS (SELECT 1 FROM bookings b2
                 WHERE b2.other_series_key = r.k AND b2.id <> r.id
                   AND b2.teacher_id = r.teacher_id AND b2.teacher_rate_minor = r.rate)
     OR EXISTS (SELECT 1 FROM booking_teachers bt JOIN bookings b3 ON b3.id = bt.booking_id
                 WHERE b3.other_series_key = r.k AND bt.teacher_id = r.teacher_id AND bt.rate_minor = r.rate)
       )::int AS matches_own_rate,
       -- 1 = this number is a rate SOMEBODY ELSE in this series is paid
       (EXISTS (SELECT 1 FROM bookings b4
                 WHERE b4.other_series_key = r.k AND b4.teacher_id <> r.teacher_id AND b4.teacher_rate_minor = r.rate)
     OR EXISTS (SELECT 1 FROM booking_teachers bt2 JOIN bookings b5 ON b5.id = bt2.booking_id
                 WHERE b5.other_series_key = r.k AND bt2.teacher_id <> r.teacher_id AND bt2.rate_minor = r.rate)
       )::int AS matches_another_teachers_rate
FROM rowz r
JOIN swapped s ON s.booking_id = r.id
ORDER BY r.k, r.date;
```
**What each number means, one line each:**
- **`matches_own_rate = 0` and `matches_another_teachers_rate = 1`** ⇒ 🔴 **the strongest candidate: the row pays a number that belongs to somebody else in this series and to nobody the current teacher is.**
- **`matches_own_rate = 1`** ⇒ ✅ **almost certainly fine** — the current teacher is paid that number elsewhere in the same series.
- **both `0`** ⇒ ⚠️ **unknowable from the data**: a one-off number. It may be a deliberate price, or a rate inherited from a teacher who has since left every row of the series.
- **both `1`** ⇒ ⚠️ **ambiguous by construction** — the two teachers are paid the same, in which case **the defect, if it happened, cost nothing.**
- **The row count of the whole result** = **how many series rows a swap ever touched.** 🔑 **It is the CEILING: the defect cannot have reached a row that is not in this list.**

### 🚫 What this CANNOT tell you — all four belong in front of the owner
1. **Intent is not recorded.** A deliberate price and the defect look identical.
2. **Only the LAST teacher is known.** A row swapped twice shows one name; the rate may belong to a teacher two swaps ago, and the query will not say so.
3. **A per-session (`onDate`) swap leaves the same outbox trace and was always CORRECT**, so the list includes rows that were never at risk. **A ceiling, not an estimate.**
4. **If every teacher in a series is paid the same, the defect is invisible — and harmless.**
📌 **And a fifth, procedural: this is written against the schema and has NOT been run.** 🚫 **No repair proposed, sketched or implied.**

---

## 🛑 STOP — the same gap exists on a path TASK-625 does not touch
🔴 **`swapGroupTeacher` (what `swapGroupSeriesTeacher` delegates to, `scheduler.service.ts:1745` / `:1752`) writes `{ teacherId: input.teacherId }` and leaves `teacher_rate_minor` alone — on the GROUP row, where that column is the primary teacher's rate, exactly as on an OTHER row.**
⇒ **The same money defect, in the same direction, on the group door.** 🚫 **I did not fix it: it is not in this task, and you and @Porter both said two changes get two verdicts.**
⚠️ **It also widens §3:** the query above reads `other_series_key`; **the group rows need the same query with `group_key`** — **but that would be a list of a LIVE defect, not of a fixed one**, which is a different sentence to put in front of the owner.
📌 **A third shape, FLAGGED NOT CLAIMED:** `sendTeacherReassigned`'s other callers (the plan edit `:1807`, the plan apply `:3677`, the Move popup `:4227`) also change `teacher_id` without touching an existing `teacher_rate_minor`. **On a COURSE_PACKAGE row that column is an OVERRIDE of the course's own default, so "should changing the coach clear it?" is a product question, not a defect I can assert.** ▶️ **Yours to rule or to put to the owner. I have touched none of them.**
