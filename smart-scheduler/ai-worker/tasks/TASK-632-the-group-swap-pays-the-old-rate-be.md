# TASK-632 — BE: **the GROUP swap pays the new teacher at the OLD teacher's rate** (@Jason's finding, cut by @Sober the same day)
**From @Sober to @Jason.** 🔴 **Same money defect as `TASK-625`, on a path `TASK-625` does not touch. Live, and OPEN.**
📌 **You found it, you refused to fix it inside another task, and you were right. It is cut as its own task on the same day for one reason: see §1.**

---

## 1. 🔴 Why this is THIS round and not next
**`TASK-625` closed the defect on the OTHER-series path and produced a candidate list for the owner.**
🔑 **If we hand him that list while the SAME defect is still writing new rows on the GROUP path, the list says "here is what a closed problem cost" when the truth is "here is part of what an open problem is still costing."** ⇒ **That is not an incomplete report. It is a misleading one, and we would have built it ourselves.**
⇒ **Either both paths are closed before @Porter takes the numbers up, or the numbers go up with a warning that halves their value.** ⭐ **Closing it is cheaper: the rule already exists and you wrote it.**

## 2. The defect, confirmed independently
**`swapGroupTeacher` (`scheduler.service.ts`, the one `swapGroupSeriesTeacher` delegates to) writes `{ teacherId: input.teacherId }` and never touches `teacher_rate_minor`** — on the group row, **where that column is the primary teacher's rate exactly as on an OTHER row.** ⇒ **the incoming coach is paid the outgoing coach's stored rate, silently, on every date it moves.**

## 3. ▶️ What to do — **reuse, do not re-derive**
🔴 **ONE rule, and it is already written: `input.rateMinor ?? seriesRateOf(rows, to)`, resolved ONCE before the loop, refused when it is `null`, and NOTHING moves on the refusal.**
🚫 **Do not write a second resolution for the group path.** 🔑 **If the group path cannot call the existing one as-is, say WHY in one line before you change anything** — *a second copy of this rule is the defect it fixes, wearing the other path's name.*
⚠️ **And the group swap has a shape the other one does not: it writes the SEATS too** (`groupId` rows, every live status). ▶️ **Answer from the code, in the TASK: does a SEAT carry a `teacher_rate_minor` that matters?** ✅ **If it does not, say so and pin it** — 🔑 *an unread column is only safe while somebody can prove it is unread.* 🔴 **If it does, it is part of this fix.**
⚠️ **`swapGroupSeriesTeacher` reaches this through an ANCHOR row and `fromHereOn: true`.** **Keep the from-here-on filter exactly as it is** — `E14`'s lesson: the past is not ours to touch.

## 4. ✅ Done means
1. **`tsc` clean · the no-DB suite with COUNTS · migrations balanced.**
2. **A FILED, NAMED mutation set.** 🔴 **It must include: the defect restored (no rate written) · a second resolution site · the refusal moved inside the loop (nothing may half-move) · the rate written on the group row but not where a seat needs it, if §3 says a seat needs it.**
3. **Value tests: a group swap re-rates every date it moves to the incoming coach · a swap it cannot rate moves NOTHING, pinned `toEqual([])` · the seats' behaviour pinned either way.**
4. ⚠️ **Re-read every pin you widen past for WHAT IT IS NOW PROVING, not whether it is green.** 🔑 **That is your own finding from `TASK-625` §3 and it has already caught two pins this week.**
5. **Tell me whether `TASK-625`'s candidate query needs a second shape for `group_key`** — ▶️ **if it does, write it, 🚫 do not run it.**

## 5. 🚫 Not in this task
**`sendTeacherReassigned`'s other callers** (the plan edit, the plan apply, the Move popup) — 📌 **you flagged them and did not claim them, correctly: on a `COURSE_PACKAGE` row that column is an OVERRIDE of the course's own default, so "should changing the coach clear it?" is a product question.** **It is `TASK-633`, with the owner, as a question. 🚫 Touch none of them.**
**And no repair of existing rows, on any path.**

## ✅ 2026-10-04 — @Jason: DONE — the rule REUSED, the seat question ANSWERED, and the gap at the door reported not papered over
**`tsc` 0 · the DB-unreachable suite 3813 pass · 0 fail · 65 .sql = 65 journal tags — no migration.**
**Mutation set: `src/lib/group-swap-rate-task632.mutations.json` — 8 / 8 BITE**, baseline 67, CHECKSUM identical, restores byte-identical. **Test set named in the file:** `group-swap-rate-task632.test.ts` · `group-series-req104.test.ts` · `group-session-req095-2a.test.ts` · `camp-on-grid-req095-11.test.ts`.
**All four you named are in it and bite: G1 the defect restored · G2 a second resolution site · G3 the refusal inside the loop · G4 the rate written onto the seats.**

### §3 — reused, not re-derived
```ts
const rate = seriesRateOf(keyRows as any, input.teacherId);
if (targets.length && rate == null) throw RATE_REQUIRED(targets[0]!.date);
```
- **TASK-562's function and TASK-625's shape, unchanged.** `seriesRateOf(` and `RATE_REQUIRED(` each appear **exactly once** in the act, and the resolution is **before the transaction** — so a swap we cannot rate **moves nothing** (pinned `toEqual([])`).
- 🔑 **One thing I changed about the READ, and it is the reason this is not a copy-paste:** the rate lookup asks the **WHOLE group key**, not the from-here-on slice the move touches. **A coach's rate in this group may be recorded on a date already past** — reading only the slice would refuse a coach the group has paid before. **Mutation G6 reads the slice instead and BITES.**
- ✅ **The from-here-on filter is untouched** (E14's lesson): the past date is neither moved nor re-rated, pinned by value, and **G8 (widen it to every date) BITES.**

### ⚠️ The gap I did NOT close — the door has no way to answer its own refusal
**The OTHER-series door lets an admin supply `rateMinor` (TASK-625 §8). This one does not: `groupSeriesSwap` is `{ to, fromDate }`, and `swapGroupTeacher`'s input is `{ teacherId, fromHereOn }`.** ⇒ **an incoming coach the group has never paid is refused with nothing the admin can do about it at that door.**
🚫 **I did not widen it:** it is a contract change on two doors **and FE work** (the dialog would need the field), and you cut this task to close a money defect, not to grow a door. ⚠️ **The refusal is still the right behaviour — paying the wrong coach silently is worse than a refusal an admin must route around** — but **this is a real edge an admin can hit, and it is yours to rule.** ▶️ **If you want it, it is the same `refine` + one field, and @Fern needs telling.**

### 🔴 §3's other question, answered from the code: **a SEAT does carry a rate that is READ — so the absence is an ANSWER, not an unread column**
- **A seat is a `COURSE_PACKAGE` row.** `rateFacts` returns non-null **only** for that type, and `toBookingDTO` puts it on every DTO as `rate` ⇒ **a seat's `teacher_rate_minor` is read by the app.** 🚫 **So I cannot say "the column is unread and therefore safe".**
- **But its MEANING is different from the group row's:** on the group row that column is *what the primary coach is paid*; on a seat it is an **override of that child's course default** (`class_rate_minor`). ⇒ **"should changing the coach clear a course override?" is exactly `TASK-633`** — the same question you took to the owner for the plan edit and the Move popup.
- ⇒ ▶️ **The seat write deliberately carries NO rate**, the reason is written at the line, and **the absence is pinned by value** (every seat write is exactly `{ teacherId }`). **G4 writes the rate onto the seats and BITES.** 🔑 **A group swap must not answer a product question as a side effect.**

### ▶️ §5 — TASK-625's candidate query DOES need a second shape, and here it is (🚫 not run)
**Two changes only: the key column, and the fact that a GROUP row's extras live in `booking_teachers` exactly as an OTHER row's do.**
```sql
-- TASK-632 — the GROUP-path twin of TASK-625 §3. READ ONLY: one SELECT, no writes.
WITH swapped AS (                                   -- rows a teacher change touched
  SELECT DISTINCT o.booking_id
  FROM notification_outbox o
  WHERE o.payload->>'kind' = 'teacher_assigned' AND o.booking_id IS NOT NULL
),
rowz AS (                                           -- every GROUP row of a keyed series that carries a primary rate
  SELECT b.id, b.group_key AS k, b.teacher_id, b.teacher_rate_minor AS rate, b.date, b.status
  FROM bookings b
  WHERE b.group_key IS NOT NULL AND b.booking_type = 'GROUP' AND b.teacher_rate_minor IS NOT NULL
)
SELECT r.id, r.k, r.date, r.status, r.teacher_id, r.rate,
       (EXISTS (SELECT 1 FROM bookings b2
                 WHERE b2.group_key = r.k AND b2.booking_type = 'GROUP' AND b2.id <> r.id
                   AND b2.teacher_id = r.teacher_id AND b2.teacher_rate_minor = r.rate)
     OR EXISTS (SELECT 1 FROM booking_teachers bt JOIN bookings b3 ON b3.id = bt.booking_id
                 WHERE b3.group_key = r.k AND bt.teacher_id = r.teacher_id AND bt.rate_minor = r.rate)
       )::int AS matches_own_rate,
       (EXISTS (SELECT 1 FROM bookings b4
                 WHERE b4.group_key = r.k AND b4.booking_type = 'GROUP' AND b4.teacher_id <> r.teacher_id AND b4.teacher_rate_minor = r.rate)
     OR EXISTS (SELECT 1 FROM booking_teachers bt2 JOIN bookings b5 ON b5.id = bt2.booking_id
                 WHERE b5.group_key = r.k AND bt2.teacher_id <> r.teacher_id AND bt2.rate_minor = r.rate)
       )::int AS matches_another_teachers_rate
FROM rowz r
JOIN swapped s ON s.booking_id = r.id
ORDER BY r.k, r.date;
```
**The columns mean exactly what they mean in TASK-625 §3 — the same four readings, the same four limits.** ⚠️ **Two differences worth saying to @Porter in one line each:**
1. 🔑 **This path's `teacher_assigned` is a WEAKER filter than the OTHER path's:** on a GROUP row the pair is written by the group swap **and** by `sendTeacherReassigned`'s other callers. **It is still a ceiling, just a looser one.**
2. ✅ **As of today both lists are of a CLOSED defect** — which is the whole reason you cut this task. **Before today, this one would have been a list of a defect still writing new rows.**
📌 **Seats are deliberately NOT in either query.** Whether a seat's override is wrong after a coach change is `TASK-633`, and a list implies an answer.

### ⚠️ Pins re-read for what they now prove (my own TASK-625 §3 rule, applied)
**Nothing broke when I shipped this — and that is the finding:** **no existing test pinned the group swap's rate at all.** **The `{ teacherId }` write was unobserved**, which is how it stayed wrong while the OTHER path's twin was found by reading. 🔑 **A green suite after a behaviour change means either nothing cared, or nothing was watching. Here it was the second.**
⚠️ **And one correction of my own, inside this task's test:** my first `groupWrites` helper classified writes by `"teacherId" in patch`, which counted the **seat** writes as group rows (4 where 2 were expected). **The classifier now reads the rate — the same mistake as a write assertion that does not read the WHERE, one week after I wrote that sentence.**
