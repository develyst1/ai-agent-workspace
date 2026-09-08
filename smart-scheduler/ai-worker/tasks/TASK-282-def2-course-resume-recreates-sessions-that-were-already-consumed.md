**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 1728 pass 0 fail / NO migration. Reshaped to the owner RE-PLAN ruling: body REQUIRED (kills DEF-2 non-determinism), expiry DERIVED (kills DEF-4). §8.3: the trailing rows are NOT a defect. §2(a) REFUTED. The re-enable moved to TASK-287.

# TASK-282 — 🔴🔴 DEF-2: pausing and resuming a COURSE leaves the cancelled originals AND over-creates by the number of declared leaves

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
**Cause:** the owner reproduced it on `sid` — a **6-session course renders 14 rows.**
⛔ **`uat` does not take the code until this lands.** 🚫 No FE change until the shape is settled.
⚠️ **Read §2 before writing anything: I have a diagnosis and it is NOT confirmed. Confirm or correct it first.**

---

## §1 What the owner saw
```
15/Sep PENDING + 15/Sep CANCELLED · 22/Sep ON LEAVE + 22/Sep PENDING · 29/Sep · 06/Oct · 13/Oct
plus trailing CANCELLED rows to 03/Nov
```

## §2 My diagnosis — read the code and tell me if it is wrong
**@Porter's reading is that a plan RECONCILER ran. I do not think one did**, and the difference decides the fix.

**`dropCourse` cancels; `resumeCourse` recreates. Neither reconciles:**
- `dropCourse` sets every `endableSessions` row to **`CANCELLED`** with `note: "พักคอร์สชั่วคราว"`. **It does not
  delete them, and that is deliberate — this product has almost no DELETE.**
- `resumeCourse` computes `owed = courseOwedTarget(course) − courseCurrent(rows)` and calls `insertBooking` in a
  loop, **forward from today on the course's weekday.**

⇒ **Two consequences, and they are different defects:**

### 🔴 (a) The money one — `courseCurrent` does not count `SICK_LEAVE`
`COURSE_LIVE = PENDING · CONFIRMED · EXTENDED` · `COURSE_DELIVERED = ATTENDED · NO_SHOW`.
**`SICK_LEAVE` is in NEITHER**, and `endableSessions` leaves those rows alone at pause time — which is why the
owner still sees `22/Sep ON LEAVE`.
⇒ **a declared leave is counted as neither current nor delivered, so `owed` includes it, and the resume creates a
replacement for a session the family has already spent.**
📌 **The owner's own `C-22` (09-04): a leave declared after the course was created CONSUMES quota.** ⇒ **this
hands back sessions the customer already paid out.** **That is the half that must not reach `uat`.**
🔑 **And the arithmetic matches his screen exactly:** 6 cancelled + 6 recreated + 2 leaves = **14.**

### ⚠️ (b) The display one — the cancelled originals stay, and every cycle adds another set
Pause/resume twice and the plan carries three generations. The **counts** stay right (`owed` is recomputed each
time) — **the plan view does not.**
⇒ **Not money, and I am not sure it is even wrong**: a cancelled row is history, this product keeps history, and
`CALENDAR_HIDDEN_STATUSES` already keeps them off the grid. **Tell me what the plan view actually shows and
whether it distinguishes them** before anyone changes it.

## §3 What to do
1. 🔑 **Confirm or correct §2(a) FIRST**, from the code, and say which. **If I am wrong the rest of this task is
   wrong.**
2. **Fix (a):** a session the family has already spent must not be re-created. ⚠️ **The fix is in the COUNTER,
   not in the loop** — `courseCurrent` (or whatever `owed` should read) must agree with `C-22` about a declared
   leave. 🚫 **Do not special-case it inside `resumeCourse`**: `owed` is read by other paths and two answers to
   *"how many does this course still owe?"* is the disagreement this project keeps paying for.
   ⚠️ **Check every caller of `courseCurrent` before changing it** and say what else moves. **If it moves
   something that should not, stop and tell me** — then the fix is a second counter with its own name, not a
   changed one.
3. 🚫 **Do NOT change (b) in this task.** Report what the plan view shows.
4. 🚫 **Do not touch `dropCourse`'s cancel-don't-delete**, `insertBooking`, `assertCourseWritable`, or the
   `SLOT_TAKEN` refusal.

## §4 What must not change
- 🚫 REQ-082's expiry paths and TASK-264's AC-3 absence — **that rule is about the EXPIRY path and stays.**
- 🚫 `endableSessions` (one definition of "still ahead"), `recordExpiryChange`, the `EXPIRY_REQUIRED` gate.
- 🚫 The booking-level pause (REQ-076). **Different feature, different table row, already shipped.**
- 🚫 No migration, no database, no FE change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count**
- [ ] **§2(a) confirmed or corrected in writing**, with the file and line
- [ ] 🔑 **The owner's exact case as a test:** 6 sessions, **2 declared leaves**, nothing attended ⇒ pause, resume
      ⇒ **4 sessions created, not 6.** Asserted on the count AND on the dates.
- [ ] **A course with no leaves is unchanged** — asserted, because that is the path that already worked
- [ ] **Pause → resume → pause → resume does not grow the owed count** — asserted; the second cycle must create
      the same number as the first
- [ ] **Every other caller of the counter is named**, and either unaffected or reported
- [ ] 🚫 No migration, no database, no FE change

## Questions
1. **What does `usedSessions` do across a pause/resume?** If it is unchanged then entitlement was never wrong and
   only the plan was — **which makes this smaller than it looks and I want to know that plainly.**
2. ⚠️ **Does the pause CANCEL rows that were already `SICK_LEAVE`?** The owner's screen says no. **If a leave
   survives a pause, does it survive an END?** *(Not to fix — to know.)*
3. 🔴 **Was this reachable before REQ-076?** Course pause is `dropCourse`, which shipped with **REQ-036 Part B**.
   **If the duplication is older than this week, the shop may have live courses in this state** — and that is
   @Porter's to take to the owner, not ours to repair silently. **Say what you find.**



---

## §5 ➕ ADDED 2026-09-08 — 🔻 MY §2 DIAGNOSIS IS WRONG. The defect is RELOCATION.

@Tanya, API-driven on `sid`: **a NOVEMBER course came back as SEPTEMBER** — `2026-11-09` → `2026-09-09`, and
`liveEndDate` moved `12-02` → `09-30`. **This week's calendar now shows sessions belonging to November courses.**
🔴 **The line is `resumeCourse`'s `nextWeekdayOnOrAfter(bangkokNow().date, course.weekday)` — it always rebuilds
from TODAY, wherever the course actually lived.** **The route promises "bring it back on its own slot" and does
not.** ⇒ **RELOCATION is the defect; the duplicate rows were the symptom.**

🟢 **NOT money, and @Tanya established it:** exactly ONE `SALE` per course · **pause and resume wrote NOTHING to
the ledger** · entitlement `size 4 · used 0 · remaining 4` · expiry untouched. ⇒ **"the counter is right and the
calendar is wrong."** ⚠️ And the untouched expiry makes it MORE visible, not less: **the course now runs
September against a December expiry.**

⚠️ **§2(a) is NOT withdrawn — it is UNCONFIRMED.** Her fixtures were **all `PENDING`**; **she never reached a
course with declared leaves**, and the owner's case had `ON LEAVE` pairs **and** trailing `CANCELLED` rows past
the original end date, **neither of which her runs produced.**
⇒ 🔴 **Do not assume one fix covers both shapes.** **Fix the relocation first; then re-run the owner's shape and
say whether the leave arithmetic was real.**

🔑 **What the fix must preserve, and it is the hard part:** *"bring it back on its own slot"* means the sessions
return **where they were**, not where today is. ⚠️ **But a course paused in the PAST cannot come back in the
past** — some of its dates have gone. **That is a real question and it is @Porter's, not yours: name it, and say
what your fix does with a date that has already passed.** 🚫 **Do not invent a policy for it inside a defect fix.**

## §6 ➕ The control is HIDDEN tonight, and turning it back on is YOUR Definition of Done
**TASK-285 (@Fern) hides `พักคอร์ส` and its resume so the rest of the release can ship.** ⇒ **added here:**
- [ ] **Re-enable the control** — TASK-285's report names the one line — **and say you did it**
- [ ] 🔑 **pause → resume keeps the course's OWN dates** — a November course comes back in November. Asserted.
- [ ] **The owner's shape re-run:** declared leaves + trailing cancelled rows ⇒ **state whether §2(a) was real**
- [ ] **A date that has already passed** — say what happens, having asked rather than chosen

📌 **A disabled feature with nobody's name on re-enabling it is the shape this project keeps paying for. It is
yours, and it is written here rather than remembered.**

---

## §7 ➕ RESULT 2026-09-08 — @Jason. Code done. tsc **0** · **1723 pass / 0 fail**, 136 files.

- [x] `tsc --noEmit` → **0** · `bun test` → **1723 / 0**, 136 files
- [x] **§2(a) CORRECTED in writing, with file and line** — see below
- [x] **A course with no leaves is unchanged** — asserted
- [x] **Pause → resume → pause → resume does not grow the owed count** — asserted (the second cycle creates 6, as the first did; the ROW count grows by 6 a cycle, which is §2(b))
- [x] **Every caller of the counter named** — below
- [x] 🔑 **pause → resume keeps the course's OWN dates** — a November course comes back in November. Asserted.
- [x] 🚫 No migration, no database, no FE change
- [ ] ⛔ **Re-enable the control** — **NOT done, and not mine.** TASK-285 is `smart-scheduler-front`, @Fern's, and
      **has not landed** — there is no line to revert yet, and §4 of this task says *no FE change*. **Needs to be
      @Fern's task or @Sober's ruling.** 📌 Left unticked and named rather than quietly skipped, which is the
      shape §6 exists to prevent.
- [ ] 🔻 **The DoD's `4 sessions created, not 6` was NOT built** — it follows from §2(a), and §2(a) is wrong. The
      correct number for that shape is **6**, and it is asserted as 6.

### 🔻 §2(a) — CORRECTED. It is not real for the owner's shape.
`course-plan.ts:10` documents the omission as deliberate: *"SICK_LEAVE earns a replacement (neither live nor
delivered)."* That replacement is an **`EXTENDED` row** (`scheduler.service.ts:2774`), and **`EXTENDED` is in
`COURSE_LIVE`** (`course-plan.ts:7`). ⇒ a within-quota leave is **already represented by a live row at pause
time**, and `endableSessions` cancels it with the rest.

🔑 **The invariant:** a paused course has zero live rows, so `owed = planSize − delivered` — **exactly what was
live a moment before.** The leave count is on **neither side of that subtraction**. ⇒ **created ≡ cancelled**,
for 0, 1 or 2 leaves. `src/lib/course-pause-resume.test.ts`, driven by the service's own `endableSessions` /
`courseOwedTarget` / `courseCurrent`.
📌 **The 14 is reproduced exactly and contains no over-creation:** 6 cancelled + 2 leaves + 6 created. **That
SIX were cancelled is itself the evidence both make-ups existed before the pause.**
🔴 **The prescribed fix would have deleted SPEC-028's make-up rule:** count `SICK_LEAVE` as delivered and
`planCourseMoves`'s short branch reads `current === size`, `need = 0` — no `EXTENDED` is ever appended again.
📌 **C-22's "a leave CONSUMES quota" is `leaveUsed` / `leaveQuota`** (`scheduler.service.ts:2745`) — the leave
**allowance**, a different number from the session count.

### ✅ §5 — the relocation, fixed at the anchor
`resumeAnchor(rows, today)` (`course-plan.ts`, pure, clock-free): **the earliest date the pause cancelled,
floored at today.** November returns in November; a July pause returns from today, because a resume may never
write a lesson into the past. The caller snaps to `course.weekday` once — a make-up can sit on another weekday.
🔑 **The today-anchor existed TWICE** — the expiry gate's projection and the insert loop — so a fix to one and
not the other would have **warned about September while writing November.** Now ONE `start`, read by both.
📌 `COURSE_PAUSE_NOTE` is named in `course-plan.ts`: the pause's marker is the only thing separating those rows
from an admin's cancel, and two hand-typed copies drifting apart would silently restore the old behaviour.
✅ **Safe on the slot:** `CANCELLED` is in `SLOT_INACTIVE_STATUSES` (`db/schema.ts:89`), so recreating on the
same dates cannot clash with the course's own paused rows. A slot given away during the pause still raises
`SLOT_TAKEN` — now on the **right** dates.

### ⚠️ Where over-creation IS real — and it is still not the counter
- 🔴 **An OVER-QUOTA leave.** `canTakeLeave` false ⇒ `locked = true` and **no make-up**
  (`scheduler.service.ts:2782`); no reconcile runs on the leave path, so the plan sits deliberately SHORT. The
  pause cancels 5, the resume regenerates to 6 — **one more than it cancelled, and the lock is spent silently.**
- 🔴 **An IMPORTED course LOSES one instead.** `withholdImportCancels` leaves it carrying more rows than
  `planSize` on purpose (TASK-166); the resume measures against `planSize`. **Nobody chose that.**
Both asserted as the current behaviour. **Neither fixed — outside this task.**

### Every caller of `courseCurrent` — **five sites, not two**
`scheduler.service.ts:1808` (`getEntitlementPlan` → `owedCount`) · `scheduler.service.ts:3782` (`resumeCourse`) ·
`scripts/audit-imported-courses.ts:66` · and in-module `canInsert` (`course-plan.ts:72`) and `planCourseMoves`
(`:100`), which fan out to `canInsertIntoCourse` (`scheduler.service.ts:1821`, `:2336`) and
`planCourseMovesForCourse` (`:2141`). **Nothing was changed, so nothing moved.**

### The answers
1. **`usedSessions` is untouched** — zero references in either `dropCourse` or `resumeCourse`. ⇒ **entitlement
   was never wrong; only the calendar was.**
2. **No** — `endableSessions` is `COURSE_LIVE` only, so a leave survives a pause **and an END**
   (`course-plan.ts:243`, which says so in its own comment: *"including the leave that earned the make-up"*).
3. **`bcb0ee6`, 2026-08-28** — eleven days. **The relocation is that old.** The over-creation was never real for
   a within-quota leave, so **there is nothing to repair silently**; the two shapes above are worth @Porter
   knowing about, but neither matches the owner's report.
4. **§2(b), what the plan view shows:** `getEntitlementPlan` returns **ALL** rows (`scheduler.service.ts:1817`)
   with `status`, so every generation appears and is distinguishable as `CANCELLED` — **but `toSessionRow` does
   not carry `note`**, so the FE cannot tell a pause's cancel from an admin's. `liveEndDate` and `owedCount` are
   unaffected. ⚠️ **After the §5 fix the recreated rows land on the SAME dates as the cancelled ones**, so the
   owner's `15/Sep PENDING + 15/Sep CANCELLED` pairing will now appear on *every* date rather than the overlap.
   **Display only. Not changed, per §3.3.**

---

## §7 🔴 RESHAPED 2026-09-08 — the owner has ruled. **Resume is a RE-PLAN, not a restoration.**

> *"ให้ไปเริ่มตามสูตรใหม่ เหมือนวางแผนใหม่ … เอาเหมือนตอนสร้างคอร์สเลย … วันหมดอายุก็งอกไปสิ เรื่องปกติ"*

**§5's reviving design is WITHDRAWN.** ⇒ **`resumeCourse` asks the admin the same scheduling question as course
creation — weekday, start time, start date — and lays out the REMAINING sessions from there. The expiry extends
with the course.**
✅ **NO MIGRATION** — verified: `coursePackages` already has `weekday`, `startTime`, `expiryDate` (`schema.ts:347-349`),
and `maxWeek` is derived, never a column. **The request body changes; the schema does not.**

### §7.1 The three requirements that make this correct, and two of them are ANSWERS to open defects
1. 🔑 **THE BODY BECOMES REQUIRED** — `{ weekday, startTime, startDate }`, plus the existing optional expiry only
   if you find you still need it (§7.2 says you should not).
   🔴 **This is the fix for DEF-2's NON-DETERMINISM**, not a side effect: today `{}` and `{expiryDate}` are **two
   paths and only one was ever trialled.** **A re-plan always carries a schedule ⇒ there is no second path left
   to go untested.** ⚠️ **Breaking for any caller sending `{}`; the FE is the only one and changes in the same
   shipment (TASK-287).**
2. 🔑 **THE EXPIRY BECOMES AN OUTPUT, NOT AN INPUT** — derived so it always covers the last planned session.
   🔴 **This is the fix for DEF-4.** Its validator checks the **request**, and the owner's design moves the last
   session **by construction**, so a request-checking validator would wave through every resume. ⇒ **stop
   validating it. There is no expiry request left to be wrong.**
   ✅ **`recordExpiryChange` already audits it in the same transaction — `REQ-082`'s trail needs no change.**
3. ⚠️ **THE CONFIRMATION MUST STATE IT** (@Porter): the expiry moves **because the course moved**, not as a
   separate admin act. **The response carries the new last session AND the new expiry**, and TASK-287 shows both.
   📌 **This is the one place that differs from `REQ-082`'s "warn, do not act" — and the difference is that here
   we ARE acting, so it must be said.**

### §7.2 What NOT to build
- 🚫 **Do not revive or re-date the old cancelled rows.** They stay cancelled, where they are. **Nothing is
  restored** — that is the whole of the owner's ruling.
- 🚫 **Do not invent a scheduler.** `courseSessionDates` is the course-creation planner and is already what
  `resumeCourse` calls. **Reuse it; the input changes, not the algorithm.**
- 🚫 **Do not keep `EXPIRY_REQUIRED` alive on this path** if §7.1(2) makes it unreachable — **and say so rather
  than leaving a throw nothing can trigger.** ⚠️ **The EDIT path keeps it; check before deleting anything shared.**
- 🚫 No migration. No change to `dropCourse`.

### §7.3 ⚠️ Still open and NOT covered by this — the trailing rows
The owner's screen showed **`CANCELLED` rows to `03/Nov` on a course that should end `20/Oct`.** **The re-plan
does not touch them** — it lays out new sessions and leaves the old ones where they are. ⇒ **if that was a second
defect this morning it is still one now.**
🔑 **Do the 20–30 minute read as part of this task** — an earlier pause/resume cycle, or the leave-EXTENSION path
(`extendedFromId`) — **and REPORT it. Do not fix it here.**

### §7.4 Definition of Done — replaces the one above
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 **no migration**
- [ ] 🔑 **A November course resumed in September comes back on the schedule the ADMIN gave** — asserted on the
      dates, **not on "not today"**
- [ ] 🔑 **The body is REQUIRED** — `{}` is refused — asserted. **One path only.**
- [ ] 🔑 **The expiry is DERIVED and always covers the last planned session** — asserted, **including a plan that
      runs past the old expiry**, which is the DEF-4 case
- [ ] The response carries **the new last session and the new expiry**, for TASK-287 to state
- [ ] **`recordExpiryChange` still fires**, in the same transaction — asserted
- [ ] **Old cancelled rows are UNTOUCHED** — asserted; nothing revived, nothing re-dated
- [ ] **A slot clash still refuses with `SLOT_TAKEN`** and rolls back whole — asserted
- [ ] ⚠️ **The trailing-rows read is REPORTED** — cause named, fix not attempted
- [ ] **Re-enable the control** (`PlanModal.tsx:79`, TASK-285) and say you did

### §7.5 Question
**Does `owed` still mean the right thing under a re-plan?** It is `courseOwedTarget − courseCurrent`, and
**§2(a)'s `SICK_LEAVE` question is still unanswered** — a declared leave counts as neither. ⚠️ **Under the old
reviving design that was arithmetic; under a re-plan it decides HOW MANY sessions the admin's new schedule
lays out.** ⇒ **it is now more visible, not less.** **Say what `owed` returns for a course with two declared
leaves, and whether that is what the owner would expect.**

## §8 ➕ RESULT 2026-09-08 (§7 re-plan) — @Jason. tsc **0** · **1728 pass / 0 fail**, 136 files. 🚫 No migration.

- [x] `tsc --noEmit` → **0** · `bun test` → **1728 / 0**, 136 files · 🚫 no migration
- [x] 🔑 **A November course resumed in September comes back on the schedule the ADMIN gave** — asserted on the
      dates (`courseSessionDates("2026-11-03", 4)`), not on "not today"
- [x] 🔑 **The body is REQUIRED** — `{}`, `{startDate}` and `{startTime}` all refused, asserted against the real
      zod schema. **One path.**
- [x] 🔑 **The expiry is DERIVED and always covers the last planned session** — including the DEF-4 case where
      the re-plan runs past the old expiry
- [x] The response carries **`lastSession`, `expiryDate` and `expiryExtended`**
- [x] **`recordExpiryChange` still fires**, in the same transaction, before the writes — asserted
- [x] **Old cancelled rows UNTOUCHED** — asserted as the absence of any `bookings` write in the body
- [x] **`SLOT_TAKEN` still refuses** and the whole resume rolls back — asserted
- [x] ⚠️ **The trailing-rows read is REPORTED** — see §8.3. **It is not a defect.**
- [ ] ⛔ **Re-enable the control — deliberately NOT done. See §8.5: flipping it now ships a broken button.**

### §8.1 What was built
`resumeCourse(id, { startDate, startTime }, actor)`. The admin's answer goes straight into
`courseSessionDates` — **the course-creation planner, which this function already called.** The input changed;
the algorithm did not. `weekday` and `startTime` are written back to the course row so the next reader is not
left on the old slot; **`startDate` is deliberately not touched** — it is when the course was *bought*, and
`Start` on the CONFIRMED SCHEDULE means that.
🔻 **§5's `resumeAnchor` is deleted, along with `COURSE_PAUSE_NOTE`, and `dropCourse` is byte-identical to
before I touched it.** The withdrawn design leaves no residue.
✅ **`EXPIRY_REQUIRED` is gone from the whole service** — asserted across the file, not just the body, so a
surviving copy fails. The EDIT path never had it; `expiryImpact` now has exactly **one** caller, the edit.

### §8.2 🔴 ONE deviation from §7.1's field list, and I want it read before TASK-287 ships
**The body is `{ startDate, startTime }` — TWO fields. Not `{ weekday, startTime, startDate }`.**
📌 **Because that is literally the course-creation question:** `createCoursePackage` has **no `weekday` field**
(`validation.ts:242`); the service derives it — `weekday: weekdayOf(input.startDate)`
(`scheduler.service.ts:1524`, `:1641`). I use the same line.
🔑 **A three-field body can contradict itself.** `{ startDate: Tue 3 Nov, weekday: FRIDAY }` has no correct
answer: either it is refused for something that can only ever be a typo, or one field silently wins. **Two
fields cannot disagree.**
⚠️ **@Fern must send TWO fields.** A `weekday` in the body is stripped by zod — silently, which is the TASK-215
failure mode quoted in that very file. **This is the one thing in this task that can break TASK-287, and it
needs to reach @Fern before the form is built.**

### §8.3 ✅ §7.3 — the trailing `CANCELLED` rows are NOT a defect. The arithmetic is exact.
A 6-session course starting **15 Sep** plans `15/9 · 22/9 · 29/9 · 6/10 · 13/10 · **20/10**` — Sober's *"should
end 20/Oct"*. **Each declared leave appends an `EXTENDED` make-up after the last live date**
(`scheduler.service.ts:2765`, `orderBy date desc` over the non-cancelled rows) ⇒ two leaves give **27/10** and
**03/11**.
🔑 **And `courseExpiry("2026-09-15", 6)` returns `2026-11-03` — the MAX_WEEK ceiling to the day.** `maxWeek =
size + leaveQuota = 6 + 2 = 8`, and week 8 from 15 Sep **is** 3 Nov.
⇒ **Nothing created rows beyond the plan.** *"Should end 20/Oct"* is true only of a course that takes no
leaves; this one used its full quota of two, so it correctly runs to its own ceiling. The trailing rows are the
tail of the plan plus its two make-ups, which the pause then cancelled.
📌 **And it independently re-confirms §2(a):** the screen shows the two make-ups **existed**, which is exactly
what makes 6 — not 4 — the right number for the re-plan to lay out.

### §8.4 🔑 §7.5 — does `owed` still mean the right thing under a re-plan? **Yes, and the leaves are why.**
For the owner's course — 6 sessions, 2 declared leaves, nothing attended — **`owed` returns 6**, and the admin's
new schedule lays out **6**.
That is what the owner would expect, and the leave is the reason rather than an exception to it: a within-quota
leave **already earned an `EXTENDED` make-up**, the make-up **is** counted (`COURSE_LIVE`), and the pause
cancelled it along with everything else. So `owed` is not "6 sessions plus 2 leaves ignored" — it is **4
un-taught originals + 2 un-taught make-ups**, and the family is genuinely owed all six lessons.
⚠️ **Where it is NOT right, and it is unchanged by this task:** an **over-quota** leave gets `locked = true` and
**no make-up** (`scheduler.service.ts:2782`), so the plan sits deliberately short and the re-plan quietly lays
out one more than the pause cancelled — **spending the lock.** An **imported** course with withheld phantoms
loses one instead. Both asserted as current behaviour; neither fixed.

### §8.5 ⛔ Why I did NOT flip `PlanModal.tsx:79`
TASK-285 **has** landed (`db1ac1b`), and the line is there: `const COURSE_PAUSE_RESUME_ENABLED = false;`
🔴 **Flipping it now ships a button that this task has just made the backend refuse.** The body is REQUIRED as
of today; the control still sends the old `{}` / `{ expiryDate }`. **The re-enable belongs in TASK-287's commit,
beside the new form that sends the new body** — one edit to that component, on the shipment that makes it work.
📌 Not a boundary objection. **Re-enabling it before @Fern's form exists would turn a hidden feature into a
visibly broken one**, which is worse than either.

### §8.6 ⚠️ One consequence of the ruling, reported not fixed
`exceedsExtensionCeiling(date, course.startDate, size)` measures from the **purchase** start date, and a
re-plan moves the sessions without moving it. ⇒ after a long pause, **the next leave's make-up can be refused
with `EXTENSION_CEILING`** on a course that legitimately moved. Nothing today does this — it needs a re-planned
course to then take a leave — but it is the first thing that will bite after this ships, and whether the
ceiling should follow the re-plan is the owner's call, not mine.

### §8.7 Tests corrected, never deleted — **six of them, all defending the contract §7 reverses**
`course-ended-writes.test.ts` — the SLOT_TAKEN indent, and *"resume rebuilds on the course's OWN weekday"*,
**now on its third version**: it asserted the today-anchor under a title that described the requirement, then
my §5 anchor, and now **the ABSENCE of any inferred anchor** — which is what the owner actually ruled.
`course-expiry-edit.test.ts` — TASK-264 (ข)'s conditional gate, the optional schema, the audit's `to:` field,
and the signature. **(ข)'s rule still governs the EDIT verb; the two verbs simply stopped sharing a question.**
✅ **Break it and watch:** shrinking the derived expiry fails the DEF-4 assertion (`2026-12-31` → `2026-11-24`);
making the body optional again fails the one-path assertion. ⚠️ **My first attempt at that second mutation
silently did not apply** — a `perl` pattern that did not match — and the suite went green. **A green run from a
mutation that did not mutate proves nothing;** re-run with a `MUTATED` marker before I claimed it.

**BALL: @Sober — TASK-282 §7 ready for review. 🔴 @Fern needs §8.2 (TWO fields) before building TASK-287.**

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-282 §7 is DONE.** 🔻 **You corrected me FOUR times and every one of them was right.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **1728 pass / 0 fail**, 136 files · **35 `.sql`,
unchanged — no migration** · `validation.ts:697` = `z.object({ startDate: DATE, startTime: TIME })`, **two
fields, both required** · `weekdayOf(input.startDate)` at `:1523`/`:1640`, the line you reuse.

### 🔻 1. The three-field body — mine, and yours is better for a reason I did not have
> *"A three-field body can contradict itself. `{ startDate: Tue 3 Nov, weekday: FRIDAY }` has no correct answer:
> either it is refused for something that can only ever be a typo, or one field silently wins."*

✅ **And the decisive fact is one I could have checked and did not: `createCoursePackage` has no `weekday` field
either.** ⇒ *"the same question as course creation"* was the owner's instruction, and **two fields is what that
question literally is.** I wrote three from memory of the course row's columns.
🔴 **Your warning about zod stripping it SILENTLY is why this was urgent** — **@Fern has it**, TASK-287 is
corrected, and it reached her before the form was built. **That is the whole value of flagging it rather than
letting it be found.**

### 🔻 2. §8.3 — *"should end 20/Oct"* was mine, and it was wrong
**Each declared leave appends an `EXTENDED` make-up after the last live date**, so two leaves give `27/10` and
`03/11` — **and `courseExpiry("2026-09-15", 6)` returns `2026-11-03`, the MAX_WEEK ceiling to the day**
(`6 + 2 = 8` weeks from 15 Sep).
⇒ **Nothing created rows beyond the plan.** **My "should end 20/Oct" is true only of a course that takes no
leaves**, and the owner's took its full quota. 🔑 **The arithmetic landing on the exact date is what makes this an
answer rather than a plausible story** — and it closes §7.3 as **not a defect.**

### 🔻 3. §8.4 — my §2(a) is REFUTED, and the refutation is the good kind
I claimed `courseCurrent` omitting `SICK_LEAVE` meant the resume replaced a spent session.
✅ **You showed the leave already earned an `EXTENDED` make-up, the make-up IS counted, and the pause cancelled
it too** ⇒ **`owed = 6` is "4 un-taught originals + 2 un-taught make-ups"**, not "6 with 2 leaves ignored".
**The family is genuinely owed six lessons.** 🔑 **The leave is the REASON rather than an exception to it** — that
sentence is the whole answer and it is not one I would have reached.
✅ **And you named where it IS wrong without being asked:** an **over-quota** leave is `locked` with no make-up,
so the re-plan lays out one more than the pause cancelled — **spending the lock**; an **imported** course loses
one instead. **Both asserted as current behaviour, neither fixed.** ⇒ **that is a real finding sitting inside a
refutation, and it goes to @Porter.**

### 🔻 4. §8.5 — you refused my DoD and were right
**My TASK-282 DoD said "re-enable the control".** ⇒ **that would have shipped a button the backend had just made
refuse**, because the body is required now and the old control sends `{}`.
**"Re-enabling it before @Fern's form exists would turn a hidden feature into a visibly broken one."** ✅ **The
re-enable has moved to TASK-287, beside the form that makes it work.** 📌 **I wrote the ordering wrong in the
task whose whole point was that the re-enable must not be forgotten** — the item was right, the owner of it was
not.

### ⚠️ One thing to fix before this ships — a comment that outlived its subject
**`scheduler.service.ts:15`** still reads *"...the expiry edit's warning, the resume's warning and the resume's
`EXPIRY_REQUIRED` gate."* **The gate is gone; you asserted it across the whole service.** ⇒ **the last surviving
`EXPIRY_REQUIRED` in that file is a comment describing a mechanism that no longer exists.**
📌 **One line, and it is this week's theme inverted:** we have spent days on notes that never became mechanisms;
**this is a note that outlived one.** **The next reader would learn something false from it.**

### ✅ And your mutation discipline held twice
*"My first attempt at that second mutation silently did not apply — a `perl` pattern that did not match — and the
suite went green."* ⇒ **you re-ran with a `MUTATED` marker before claiming it.** **That marker is the habit from
TASK-268 applied to yourself, and it caught the same failure again.** 🔑 **Third time this week a mutation did not
mutate. It is now the most reliably recurring failure we have, and the marker is the only thing that catches it.**

### §8.6 → @Porter
`exceedsExtensionCeiling` measures from the **purchase** start date, and a re-plan moves the sessions without
moving it ⇒ **after a long pause, the next leave's make-up can be refused on a course that legitimately moved.**
**Reported, not fixed, and correctly so — whether the ceiling follows the re-plan is the owner's call.** ✅ **And
"nothing today does this; it needs a re-planned course to then take a leave" is exactly the sizing that makes it
safe to ship tonight.**
