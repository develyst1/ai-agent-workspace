# TASK-299 — the extension ceiling is RE-DERIVED from the purchase date, so an admin's edited expiry does nothing

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
📌 **No clock, blocks nothing.** 🚫 **No migration.** 🚫 No FE change.
🔑 **`REQ-085 §10` (the ceiling stretches at creation), the purchase-date item, and `§11.2` not doing what the
owner wants it for are ONE defect with three faces. Read §2 before planning.**

---

## §1 The mechanism, verified at source
`course-plan.ts:86` — **`exceedsExtensionCeiling(date, startDate, size)` → `date > courseExpiry(startDate, size)`**
⇒ **the ceiling is RE-DERIVED, every time, from the purchase date and the size.**
🔴 **The stored `expiryDate` column is never consulted** — even though `course-plan.ts:45` calls that column
***"only the MAX_WEEK ceiling"***, which is exactly what this predicate is asking about.

**Two callers:**
| | |
|---|---|
| `scheduler.service.ts:2027` | the CREATION preview's `exceedsCeiling` ⇒ **what disabled the owner's `Create plan`** |
| `scheduler.service.ts:2199` | the auto-extend when a leave is marked ⇒ **`EXTENSION_CEILING`** |

## §2 🔴 The three faces, and why fixing them separately would be wrong
**(a) `§10` — the ceiling must stretch at creation.** ⚠️ **Do NOT implement this by deleting the `:2027` gate.**
`:2022` stores **`expiryDate: courseExpiry(startDate, size)`** — the ceiling, **computed independently of the
plan.** ⇒ **a 4-session course with 3 planned absences would be created with its plan running to week 7 and its
ceiling at week 5** ⇒ 🔴 **the FIRST post-creation leave hits `:2199` immediately, and the stored ceiling sits
BEHIND the course's own last session — which is DEF-4's exact shape, re-created at creation time.**
✅ **So `§10` is not "skip the check". It is *the PLAN SETS THE CEILING*.**

**(b) The purchase-date item.** `:3849` — **`startDate` is deliberately NOT touched on resume** (*"it is when the
course was BOUGHT"*), and that is right. ⇒ **but `:2199` measures from it**, so **a course paused for two months
and resumed is at or past its ceiling the moment it comes back**, and a legitimate make-up is refused.

**(c) 🔴 `§11.2` does NOT do what the owner wants it for — and I told @Porter it was "already built".**
**It is built** — `PATCH /courses/:id/expiry` writes the column and the dialog warns. **But his stated reason is**
> *"แอดมินสามารถเลื่อนวันหมดอายุคอร์สได้ เพื่อที่อาจจะใส่วัน extra เพิ่มได้"*

⇒ **he moves the expiry so an extra session FITS.** 🔴 **`:2199` never reads that column, so the extra session is
still refused.** **The admin moves a date and the rule ignores it.**

## §3 ✅ The ruling — the ceiling is measured from the course's OWN AGREED PLAN
**`exceedsExtensionCeiling` reads the course's stored `expiryDate`** — the column that already claims to be the
ceiling — **instead of re-deriving one from the purchase date.** Then:
| | |
|---|---|
| **at creation** | the plan sets the stored ceiling ⇒ **`§10`**, and no course is born behind its own plan |
| **after a re-plan** | the ceiling moved when the expiry moved ⇒ **(b)** |
| **an admin edit** | ✅ **finally means something** ⇒ **(c)**, and it is `§11.2`'s whole purpose |
| **a leave-driven auto-extend** | 🔑 **STILL REFUSED past the agreed boundary** — **the rule keeps a real job** |

🔑 **@Porter's question — *"if the ceiling always stretches, what still bounds a course?"* — has this answer:
the ceiling refuses AUTOMATIC growth and yields to a DELIBERATE act.** ⇒ **`exceedsExtensionCeiling` does not
become an unreachable branch** *(the `EXPIRY_REQUIRED` lesson)*: **it keeps `:2199`, and only its SOURCE changes.**
⚠️ **`MAX_WEEK_BY_SIZE` / `maxWeekFor` stay exactly as they are** — they are what COMPUTES the ceiling at
creation and what the card displays. 🚫 **This task does not touch the card, the quota, or `maxWeek`.**

## §4 What must not change
- 🚫 **The DERIVED effective expiry (TASK-282) — it is what killed DEF-4.** 🚫 `courseExpiry` itself.
- 🚫 `startDate` on resume · the leave QUOTA and `plannedAtCreation` · `adminUnlocked` and the per-change
  `override` *(both withdrawn from this batch — do not touch them)*.
- 🚫 The `EXTENSION_CEILING` code and status · no migration · no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The owner's own repro passes: a 4-session course with THREE planned absences CREATES**, and its stored
      expiry **covers its own last session** — asserted on both, because either alone is the bug
- [ ] 🔑 **A leave marked AFTER creation is still refused past the agreed ceiling** — ⚠️ **this is the assertion
      that proves the rule is not dead. Write it FIRST**
- [ ] **An admin who moves the expiry LATER can then fit the extra session** — asserted end to end, **because
      that sentence is the owner's reason for `§11.2`**
- [ ] **A resumed course's make-up is not refused by a ceiling measured from its purchase date** — asserted
- [ ] 🔑 **Break it and watch** — restore the purchase-date derivation and show the owner's repro fails again
      **for that reason** — and **restore it, suite green, before you report a number**
- [ ] 🚫 The derived expiry, `courseExpiry`, quota, `maxWeek` and the card untouched — asserted

## Question
🔴 **A stored column and a re-derived value both claimed to be "the ceiling", and they disagreed the moment a
plan stopped being uniform.** 📌 *`course-plan.ts:45` even says the column IS the ceiling — the code just did not
read it.*
🔑 **Where ELSE does this product store a value AND re-derive it?** ⚠️ **I am not asking you to change any of
them.** **Name them** — ***two things that agree today are two things that can disagree later***, and **this
week has now produced three: the status lists, the two `startTime` formats, and this.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1754 pass / 0 fail**, 139 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1754 / 0**, 139 files · 🚫 no migration (**35 = 35**, counted)
- [x] 🔑 **The owner's repro: a 4-session course with THREE declared absences** — asserted on **both** halves,
      because either alone is the bug: it creates, **and its stored expiry covers its own last session** (week 7)
- [x] 🔑 **A leave marked AFTER creation is still refused past the agreed ceiling** — ⚠️ **written first**, as
      you asked, and it is the first describe in the file
- [x] **An admin who moves the expiry later can then fit the extra session** — asserted
- [x] **A resumed course's make-up is not refused by a purchase-date ceiling** — asserted
- [x] 🔑 **Break it and watch** — twice; restored and green before this number was written
- [x] 🚫 The derived expiry, `courseExpiry`, quota, `maxWeek` and the card untouched — asserted

New: `src/lib/extension-ceiling.test.ts` (12 tests).

### §1 The change — only the SOURCE
`exceedsExtensionCeiling(date, ceiling)` now takes the course's **stored `expiryDate`**. It is still called from
both places; **nothing was skipped and no branch became unreachable.** `courseExpiry`, `maxWeekFor`,
`MAX_WEEK_BY_SIZE`, the quota and the card are byte-identical.
🔑 **Your rule, in the code's own words:** *the ceiling refuses AUTOMATIC growth and yields to a DELIBERATE
act.* The first describe in the test file is that sentence made executable — a post-creation leave is still
refused past the boundary, and a date landing exactly on it is still allowed.

### §2 ✅ §10 is *the plan sets the ceiling* — and your warning was the whole design
`courseBornCeiling(base, lastPlanned, absences)` = `max(base, lastPlanned + absences weeks)`, computed **before
the insert**, from `plannedSessions` — **the same array that is then inserted**, not a second projection.
🔴 **Deleting the `:2027` gate would have been worse than the bug.** A 4-session course with three absences
would have been created with its plan at week 7 and its stored ceiling at week 5 — **the row sitting behind its
own last session, and the first post-creation leave refused.** That is DEF-4's shape at creation time, and it
would have looked like a success.
🚫 **The stretch is one-directional.** A short plan keeps the full MAX_WEEK window: the family bought a leave
window, and shrinking it to fit a plan would take back something nobody agreed to give up.
✅ **The PREVIEW computes the boundary through the same function**, so `exceedsCeiling` and the create's refusal
cannot disagree — which would have been this task's own defect, one screen earlier.

### §3 ✅ Break it and watch — the owner's repro, and the REASON
Removing the stretch returns the ceiling as **`2026-09-29` (week 5)** while the plan runs to **`2026-10-13`
(week 7)** — **the two-week gap that disabled his `Create plan`**, reproduced exactly. A second mutation
(storing `courseExpiry` again on the row) fails the wiring assertion, which is the one that would catch the
rule being right and the read being wrong.
📌 Both applied through a script that throws if its anchor is missing and prints `MUTATED`; restored and the
**whole suite re-run green before I wrote the number above**, as the DoD asks.

### §4 🔑 The Question — where else a value is STORED **and** re-derived
| stored | re-derived | why they agree *today* |
|---|---|---|
| `coursePackages.usedSessions` | the delivered count `courseCurrent` sees | the attendance write moves both |
| `coursePackages.leaveUsed` | the count of `SICK_LEAVE` rows | ⚠️ **already designed to disagree** — a `plannedAtCreation` leave deliberately does not increment it (TASK-148) |
| `coursePackages.expiryDate` | `deriveLiveEndDate(sessions)` | two different questions (TASK-097), and the plan returns both side by side |
| `coursePackages.weekday` / `startTime` | `weekdayOf(booking.date)` (`:2971`) | ⚠️ TASK-282 had to write the stored pair back on a re-plan **because they drift** |
| `coursePackages.expiryDate` | `courseExpiry(startDate, size)` | 🔴 **this task** |

⚠️ **Changed none of them.** 📌 But two of the five are guarded **only by a sentence in a comment** —
`getEntitlementPlan`'s *"do not read `usedSessions` as the plan's progress"* is prose, not an assertion. **This
week has shown twice what a sentence is worth: yours about `COURSE_PAUSE_NOTE` went stale inside a day, and
`scheduler.service.ts:15` outlived its mechanism.**

🔑 **And a sharper form of your rule, offered because the list suggests it:** the useful question is not
*stored or derived* — it is ***"is there an act that can move one without the other?"*** Every pair here was
fine until exactly such an act appeared: a plan with absences, a re-plan, an import with `priorSessions`, a free
declared leave. ⇒ **two things that agree today are two things that can disagree later — and the act that will
split them is usually already in the backlog.**

**BALL: @Sober — TASK-299 ready for review. TASK-297 and TASK-298 still open on me, neither blocking.**
