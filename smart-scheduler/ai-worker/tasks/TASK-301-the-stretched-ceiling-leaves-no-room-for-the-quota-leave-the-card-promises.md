# TASK-301 — 🔴 the stretched ceiling leaves NO room for the quota leave the card promises, and the refusal names the wrong week

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
🔴 **Screen-verified by the owner on `sid`.** 🚫 No migration. 🚫 No FE change.
**Source:** the owner, via @Porter, on the deployed TASK-299. 🔑 **TASK-299 is correct; its arithmetic is one
term short.**

---

## §1 The arithmetic — this is checkable on paper and I checked it
`courseExpiry(start, size)` = `start + (maxWeekFor(size, quota) − 1)` weeks ⇒ for a 4-session course,
**`maxWeekFor(4, 1) = 5`** ⇒ the base ceiling is **week 5**.
| | plan's last session | ceiling | headroom |
|---|---|---|---|
| **no absences** | week 4 | week 5 | 🔑 **1 week = exactly the quota of 1** |
| **3 declared absences** | week 7 *(3 make-ups)* | `courseBornCeiling` = `max(week5, week4 + 3×7d)` = **week 7** | 🔴 **ZERO** |

🔑 **The base ceiling encodes *plan end + quota weeks*.** **`courseBornCeiling` stretches from `lastPlanned` by
the ABSENCES only** ⇒ **the quota's week is dropped.**
⇒ **The owner's `มิลล่า` ends 27 Oct = week 7, its ceiling is 27 Oct, and the next leave needs week 8.**
🔴 **The card says `Leave 0/1` — one leave available — and the course cannot use it.** ⇒ **`§10` gave the admin
unlimited absences at creation and silently took away the one the family had afterwards.**

## §2 🔴 The refusal names a week it did not use — and it misled a PM tonight
`scheduler.service.ts:2233`:
```ts
`คอร์สขยายเกินสัปดาห์ที่ ${MAX_WEEK_BY_SIZE[course.size] ?? "?"} ไม่ได้`
```
**The CHECK reads `course.expiryDate` (week 7, correctly — TASK-299). The MESSAGE prints
`MAX_WEEK_BY_SIZE[size]` = 5.**
⇒ **the admin is refused at week 7 and told the limit is week 5.**
🔑 **This is why @Porter reported *"the after-creation path is measuring against the OLD week-5 limit"*. It is
not. The message said so.** ⚠️ **A wrong number in a refusal does not just confuse the admin — it sent a PM to
the wrong diagnosis and nearly earned a second task on a defect that was not there.**
📌 **This is the same class as DEF-3 and the `startTime` formats: a value with two sources. The message must
print the boundary the check actually used.**

## §3 What to fix
✅ **(a) `courseBornCeiling` keeps the quota's week.** The promise it must preserve is **plan end + quota weeks**,
which is exactly what the base ceiling gives an absence-free course. 🔑 **State the promise in the code; do not
just add `+ 7`** — **a lone `+ 7` is a number nobody can check, and the next size or quota change breaks it
silently.**
⚠️ **It must still be `max(base, …)`** — TASK-299's one-directional rule stands: **a short plan keeps the full
window.**
✅ **(b) The refusal prints the boundary it used** — the course's own ceiling. **Whether that is a date or a week
number is yours**, but ⚠️ **if you print a WEEK number you must derive it from the ceiling, not from the size, or
this defect returns with different digits.** 📌 *A date the admin can compare to the plan they are looking at is
probably kinder than a week number they have to count.*

## §4 What must not change
- 🚫 **The leave QUOTA itself** — this task gives the course ROOM to use its existing quota. **It does not grant
  extra leaves, and `leaveUsed` / `LEAVE_QUOTA_BY_SIZE` are untouched.**
- 🚫 `courseExpiry`, `maxWeekFor`, `MAX_WEEK_BY_SIZE`, the derived expiry (TASK-282), TASK-299's ceiling SOURCE.
- 🚫 `EXTENSION_CEILING`'s code and status · `plannedAtCreation` · no migration · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The owner's `มิลล่า` case: a 4-session course with 3 declared absences can then TAKE ITS QUOTA LEAVE** —
      asserted end to end. **This is the defect; write it first**
- [ ] 🔑 **A SECOND quota leave on that course is still REFUSED** — ⚠️ **the boundary must still exist.** *This is
      the assertion that stops a fix for "no room" from becoming "no ceiling"*
- [ ] **An absence-free course is unchanged** — ceiling still week 5 for size 4, asserted **by the number**
- [ ] 🔑 **The refusal message names the boundary the CHECK used** — asserted **against the course's own ceiling,
      not against a constant**. ⚠️ **Also assert it does NOT print `5` on a week-7 course** — that is the exact
      thing that misled us
- [ ] **The promise is written where the arithmetic is** — *plan end + quota weeks* — **in words, not just digits**
- [ ] 🔑 **Break it and watch** — drop the quota term, show the owner's case refused again **for that reason**;
      restored, suite green, before the number
- [ ] 🚫 Quota, `courseExpiry`, `maxWeek`, the card and TASK-299's source untouched — asserted

## Question
🔴 **Nobody wrote a test asking *"can a course still use the quota it is shown?"*** — **not me in TASK-299's DoD,
not you.** 📌 *We tested that the ceiling stretched, that it still refused, and that an admin edit worked. We
never tested that the promise on the card was still keepable.*
🔑 **Is there a property worth pinning once — *a course's ceiling always leaves room for its remaining quota*?**
⚠️ **If it holds for imports, off-card sizes and paused courses too, it is one assertion covering a family of
defects. If it does NOT hold in some legitimate case, that case is the interesting answer** — **name it and do
not force it.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1775 pass / 0 fail**, 141 files · 🚫 **35 `.sql` = 35 journal tags.**

*(This block covers TASK-301 and TASK-300 — they share `courseBornCeiling`'s file and one suite run.)*

### ✅ TASK-301 — the quota's week is back, and the refusal names the boundary it used
- [x] 🔑 **The owner's `มิลล่า` can now take its quota leave** — 4 sessions, 3 declared absences, plan ends
      week 7, ceiling week 8 ⇒ the make-up at week 8 is allowed. **Written first.**
- [x] 🔑 **A SECOND leave is still REFUSED** — week 9 is past the boundary. *The assertion that stops "no room"
      becoming "no ceiling."*
- [x] **An absence-free course is unchanged, by the number** — size 6 ends week 6, ceiling week 8 = `courseExpiry`
- [x] 🔑 **The refusal names the course's own ceiling** — asserted, **and asserted NOT to print `5`**
- [x] **The promise is in words where the arithmetic is** · 🚫 quota, `courseExpiry`, `maxWeek`, card untouched

**(a)** `courseBornCeiling(base, lastPlanned, absences, quota)` — the comment states the promise as a sentence
before the code does it: ***the ceiling is the plan's end plus the leave quota, in weeks.*** The absences move
the plan's END; the quota's weeks sit beyond it. 📌 **The no-absence case is the check that the term is the
RIGHT one and not merely more room:** week 6 + quota 2 = week 8 = `courseExpiry(start, 6)` — the two agree by
arithmetic, not coincidence. And it is still `max(base, …)`, so a short plan keeps its full window.
**The quota comes through `courseLeaveQuota`**, not the card's table, so an off-card size answers with its own
allowance instead of falling through to zero.

**(b)** The refusal now prints `คอร์สขยายเกินวันสิ้นสุดของคอร์ส (${course.expiryDate}) ไม่ได้` — **a date**, so
the admin can compare it to the plan in front of them. ⚠️ A week number derived from anything but the ceiling
would bring this back with new digits, and that is asserted: `MAX_WEEK_BY_SIZE[course.size]` is gone from the
refusal and the message cannot print `5` on a week-7 course.

✅ **Break it and watch:** dropping the quota term returns the ceiling as `2026-10-13` (week 7) instead of
`2026-10-20`, and **the owner's leave is refused again** — four assertions fail, and the second names his case.

#### 🔑 The Question — yes, and the exceptions are the interesting part
**Pinned:** *a course's ceiling always leaves room for its remaining quota* — asserted across **all three sizes ×
0–3 absences**, as a property rather than an example.
⚠️ **It does NOT hold in two places, and I did not force either:**
1. 🔴 **A RE-PLANNED course.** TASK-282 derives the expiry as `max(old, last session)` — so a re-plan that ends
   after the old expiry leaves **zero** headroom, and the next leave is refused. **The owner's complaint, one
   verb over.** 🚫 Not touched: the derived expiry is in this task's `must not change`. **It is worth a task.**
2. ⚪ **An admin edit.** The headroom is whatever they chose, and that is correct — a deliberate act sets the
   boundary, which is TASK-299's whole rule. **Not a defect.**
✅ **Imports are fine:** `importedCourseExpiry` reconstructs the real start and calls `courseExpiry`, so it
carries the same *plan end + quota* promise.

---

### ✅ TASK-300 — 🔴 the gate FAILED. The defect was real, and it is fixed
**🔑 The gate result, recorded in the log before any code was touched**, on the arrangement you named — 4
sessions, weeks 2/3/4 declared absent, week 1 live:

| | dates |
|---|---|
| declared absent | `2026-09-08` · `2026-09-15` · `2026-09-22` |
| 🔴 where the SAVE placed the 3 make-ups | **`2026-09-08` · `2026-09-15` · `2026-09-22`** |
| where the PREVIEW places them | `2026-09-29` · `2026-10-06` · `2026-10-13` |

**All three landed on the three absent days — exactly.** Your amendment was right: **it is the POSITION, not the
count.** The mirror arrangement passed at weeks 5/6/7 on the same run.

**The fix is §3 as written:** one anchor, the **last PLANNED session**, used by both paths. 🚫 **Neither status
list changed** — a student on leave DOES free the teacher's slot for someone else (UC-004), and that is asserted
directly. **The bug was this course reusing its OWN absent week**, and the anchor is where that is decided.

- [x] 🔑 **No make-up lands on a declared-absent date** — asserted on the DATES
- [x] 🔑 **The preview and the save place them in the SAME weeks** — asserted by comparing the two
- [x] **A leave taken AFTER creation** — ⚠️ **named, and the answer is more than "they coincide":** a
      post-creation leave on the LAST session had **the identical defect** — the old anchor fell back to the
      second-to-last live row and that session's own date, now slot-inactive, read as free. ⇒ **the planned
      anchor is not a creation-time special case; it is strictly better on both paths**, which is why there is
      one rule and no branch.
- [x] **Another student may still be booked into the freed slot** — asserted
- [x] 🚫 TASK-299's ceiling, the status lists and the mirroring untouched — asserted

#### ⚠️ On "break it and watch", honestly
**The behavioural proof is the GATE RUN itself** — the live-only anchor, on the untouched build, putting three
make-ups on three absent days. That is recorded above and in the log, and it is stronger than a re-mutation.
📌 **What a source mutation shows here is narrower, and worth saying:** restoring `liveAfterCancel` fails only
the **reconstruction pin**, not the placement assertions — because the test reproduces two inline lines from a
DB-bound function and cannot re-read them. ⇒ **the pin is what makes this file honest**, and it did its job.
**A reconstructed test that stops describing the code it names would be worse than no test**, which is why the
pin is in the file rather than in this report.

**BALL: @Sober — TASK-301 and TASK-300 ready for review. ⛔ TASK-298 still open on me.**
