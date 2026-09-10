# TASK-300 — 🔴 the make-up is booked ON the very day the family said they would be away

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
🔴 **Family-facing.** 🚫 No migration. 🚫 No FE change. **Source: YOUR finding while answering my TASK-299 edge
question.** 🔑 **You declined to fix it because cutting tasks is mine. Correct — and here it is.**

---

## §1 The mechanism — I verified both anchors before writing this
| | anchor | code | where 3 make-ups land on a 4-session course with absences in weeks 2–4 |
|---|---|---|---|
| **preview** | the last **PLANNED** session | `:2027` — `sessions[sessions.length - 1]?.date` | **weeks 5, 6, 7** |
| **save** | the last **LIVE** session | `:2216` — `liveAfterCancel.reduce(max, course.startDate)` | 🔴 **weeks 2, 3, 4** |

**`liveAfterCancel` filters on `COURSE_LIVE`, and `SICK_LEAVE` is not in it** ⇒ **the declared-absent weeks are
invisible to the anchor**, so the search starts from **week 1**.
**And `SICK_LEAVE` IS in `SLOT_INACTIVE_STATUSES`** ⇒ **those weeks read as FREE slots** ⇒ **the search fills
them.**
🔴 **The make-up for the week-2 absence is booked on week 2 — same teacher, same time, mirrored from the absence
it is replacing.** ⇒ **the family is given a lesson on a day they told us they would be away, and nothing warns
anyone.**

## §2 🔑 It also explains the owner's screen, which no other theory did
**The preview computed `exceedsCeiling` over weeks 5–7 against a week-5 ceiling and refused.** **The save would
never have gone past week 4.** ⇒ **the two disagreed, and the one the admin sees is the one that refused.**
📌 **They agree only when every absence falls BEFORE the last live week** — **and his arrangement is the case
where they disagree most.**
⚠️ **This is a THIRD symptom of one cause**, after `§10` and `§11.2`: **the preview and the save answer the same
question with different inputs.**

## §3 What to fix — and the choice is a real one, so make it explicitly
✅ **One placement rule, used by BOTH paths.** 🔑 **That is the whole task**: today there are two rules and the
admin is shown the stricter one.
🔴 **The rule I believe is right, and say why if you disagree:** **a make-up is appended AFTER the last planned
session** — the preview's anchor.
**Because a declared absence is a date the family has already told us to avoid.** ⇒ **placing a make-up there is
not a scheduling detail, it is booking a lesson they said they cannot attend.**
⚠️ **`SICK_LEAVE` staying in `SLOT_INACTIVE_STATUSES` is CORRECT and must not change** — a student on leave does
free the teacher's slot for **someone else** (UC-004). 🔑 **The bug is not that the slot is free; it is that
*this* course reused *its own* absent week.**
🚫 **Do NOT fix it by making `SICK_LEAVE` block slots.** That would break overbooking-on-leave, which
`migration-witness.ts:77` says *"must never be attempted"*.

## §4 What must not change
- 🚫 `SLOT_INACTIVE_STATUSES`, `SLOT_NON_BLOCKING`, `COURSE_LIVE`, `SICK_LEAVE`'s six prices *(`SYSTEM-FACTS`)*.
- 🚫 TASK-299's ceiling source, `courseBornCeiling`, `courseExpiry`, the derived expiry (TASK-282).
- 🚫 The make-up's teacher/subject/time mirroring · quota · `plannedAtCreation` · no migration · no FE change.
- ⚠️ **`findFreeExtensionDate` still skips genuinely occupied slots.** **This task changes WHERE THE SEARCH
  STARTS, not what it treats as taken.**

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **No make-up lands on a date carrying a declared absence for the SAME course** — asserted on the owner's
      own arrangement (absences in weeks 2–4 of a 4-session course). ⚠️ **Assert the DATES, not the count**
- [ ] 🔑 **The preview and the save place them in the SAME weeks** — asserted **by comparing the two**, on a plan
      where they currently differ. **This is the assertion the task exists for**
- [ ] **A leave taken AFTER creation still appends after the last live session** — ⚠️ **name what you decided
      here.** *There is no earlier planned session to protect, so the two anchors may legitimately coincide;
      say so rather than leaving it implied*
- [ ] **Another student may still be booked into the freed slot** — asserted, because §3's `🚫` depends on it
- [ ] 🔑 **Break it and watch** — restore the live-only anchor and show a make-up landing on an absent week
      **for that reason** — restored, suite green, before the number
- [ ] 🚫 TASK-299's ceiling, the status lists and the mirroring untouched — asserted

## Question
🔴 **How many sessions has this already booked onto days families said they were away?** ⚠️ **I am NOT asking you
to touch data, and NEVER to run a query — that is a DATA REQUEST for the owner if it becomes one.**
**What I want is the SHAPE of the answer:** **which stored rows would carry the fingerprint** — an `EXTENDED`
row whose date equals a `SICK_LEAVE` row's date on the same course? 🔑 **If that pattern is identifiable from
columns alone, say so in one line** ⇒ **then the owner can be told what to look for, and told by @Porter, not by
us.** 📌 *A defect that has already run is a different conversation from a defect that might.*

---

# 🔻 §5 AMENDMENT — @Sober, 2026-09-08. **The owner's test did NOT run this scenario. Here is the exact one, and a TEST decides it, not another screenshot.**

## 🔴 What he ran, and why it is the innocent arrangement
**`มิลล่า`, 4-session:** `15 Sep ON LEAVE` · `22 Sep ON LEAVE` · `29 Sep ON LEAVE` · **`06 Oct PENDING`**
⇒ **the absences are weeks 1, 2, 3 and the LIVE session is week 4.**
**`liveAfterCancel` max = 06 Oct = week 4** ⇒ the search starts AFTER the whole plan ⇒ **make-ups at weeks 5, 6, 7.**
✅ **Correct, exactly as he saw. This scenario cannot produce the defect.**

## 🔑 The condition, which @Porter is right that I should have led with
**The defect needs a LIVE session EARLIER than a declared absence** — @Jason's own words:
***"every course whose last declared absence FOLLOWS its last live week."***
⇒ **it is not the NUMBER of absences. It is their POSITION.**
🔻 **My §1 said "absences in weeks 2–4", which is that arrangement — but I wrote the count in the headline and the
position in a table cell. @Porter read the count. That is my drafting, not his reading.**

## ✅ The exact reproduction
**4-session course. Mark weeks 2, 3 and 4 absent. LEAVE WEEK 1 LIVE. Save.**
⇒ `liveAfterCancel` = [week 1] ⇒ `fromDate` = week 1 ⇒ the search steps to weeks 2, 3, 4 — **and each is a
`SICK_LEAVE` row, which is in `SLOT_INACTIVE_STATUSES`, so the slot reads FREE and is taken.**
**Expected if the defect is real:** three `EXTENDED` rows dated **the same days as the three `ON LEAVE` rows**.

## 🔑 A TEST decides this, and it decides it BEFORE anyone is asked to look at a screen again
⚠️ **The DoD below already contains the arbiter** — *"no make-up lands on a date carrying a declared absence for
the same course, asserted on absences in weeks 2–4 of a 4-session course"*.
✅ **Write that test FIRST and report the result before changing any code.**
- 🔴 **It FAILS ⇒ the defect is real, the condition is the position of the absences, and the fix proceeds.**
- 🟢 **It PASSES with no code change ⇒ I RETRACT this task in full**, and the interesting question becomes **what
  normalises the anchor**, because two source-reads then say something the code does not do.
🚫 **Do not fix anything before that test has run.** 🚫 **And nothing goes to the owner about this until it has.**

📌 **On the count: `validation.ts:279` allows any absences as long as not EVERY week is absent, so weeks 2–4 of a
4-session course is a reachable arrangement, not a contrived one.**

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
