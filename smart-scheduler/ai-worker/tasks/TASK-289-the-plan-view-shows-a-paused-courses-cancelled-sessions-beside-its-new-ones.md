**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 140 pass 0 fail / no backend change. She filtered the VIEW, not `sessions` — filtering the array would have re-broken TASK-288 s 17:00 default silently, in the same component, one night later.

# TASK-289 — the plan view shows a re-planned course's OLD cancelled sessions beside its new ones — 8 rows for a 4-session course

**Assignee:** @Fern (FE) with a question for @Jason · **From:** @Sober (2026-09-08)
**Cause:** @Tanya's UI round. ⛔ **`uat` is off until this and TASK-288 land.**
🔻 **This is the item I told @Jason NOT to fix, writing *"I am not sure it is even wrong."* It is wrong.**

---

## §1 What an admin sees
```
15/22/29 Sep + 06 Oct @10:00  PENDING     ← the new plan
03/10/17/24 Nov @17:00        CANCELLED   ← what the pause cancelled
```
**Eight rows for a four-session course.** ⚠️ **Nothing is broken underneath** — the counts are right, the money is
right, the new plan is right. **But no admin can read that**, and *"no admin can unpick 14 rows into 6"* was
@Porter's first sentence about this defect a day ago. **He was right and I deferred it.**

## §2 🔴 My ruling — the PLAN shows the plan; a cancelled session is HISTORY
**Sessions a pause cancelled are not part of the current plan.** They are what the course used to be.
⇒ **the plan view shows the LIVE plan.**
✅ **And they must remain visible somewhere: `CourseHistoryModal` already exists and is where "what happened to
this course" belongs.** 🔑 **This is not hiding data — it is putting it where its question is asked.** 📌 **This
product keeps everything and deletes almost nothing; that stays true. The row does not move, the VIEW does.**

⚠️ **Do NOT extend this to every cancelled session.** A session an admin cancelled by hand is a different fact
from one a pause swept, **and I am not ruling on that one here.** ⇒ **§3.**

## §3 🔴 The question that decides HOW — and I want the answer before the change
**Can the FE tell a pause-cancelled session from any other cancelled one?**
- `dropCourse` writes `note: "พักคอร์สชั่วคราว"` (the constant `COURSE_PAUSE_NOTE`) — **is that `note` on the DTO
  the plan view receives?**
- If **yes** → the FE can filter precisely, and this is a one-line display change.
- If **no** → **STOP and tell me.** The options are (a) the BE adds the field, (b) the plan view hides *all*
  cancelled rows — **which is a bigger ruling than the one I just made** — and I will choose, not you.
🚫 **Do not infer "it was a pause" from dates, counts or ordering.** **A heuristic that is right today is the
thing this project has spent a week paying for.**
📌 **@Jason knows the payload; ask him through me if the DTO is unclear.**

## §4 What must not change
- 🚫 **Nothing is deleted.** No row, no status, no history.
- 🚫 The counts — `owed`, `remaining`, the entitlement figures are all correct and stay.
- 🚫 `CourseHistoryModal`'s existing content beyond what §2 adds, if anything.
- 🚫 `REQ-076`'s booking tray, `REQ-082`'s edit, the calendar grid (which already hides these).

## Definition of Done
- [ ] Typecheck clean; **state the command**
- [ ] 🔑 **A re-planned 4-session course shows FOUR rows in the plan** — asserted, **on the exact shape from
      @Tanya's screenshot** (4 new PENDING + 4 pause-cancelled)
- [ ] 🔑 **§3 answered in writing BEFORE the change** — can the FE identify a pause-cancelled row, and how
- [ ] **The cancelled sessions are still reachable** — say where an admin sees them now
- [ ] **A hand-cancelled session is UNAFFECTED** — asserted, because §2 deliberately does not rule on it
- [ ] 🚫 Nothing deleted · counts unchanged · the tray, the edit and the grid untouched

## Question
**Is the plan view the only place this shows?** The course card, the history modal and any report that counts
"sessions" all read the same course. 📌 *The grid already hides them, which is why nobody saw this until a plan
modal was opened.* **Name every surface that would show eight; fix only the plan.**

---

## §3 ANSWERED — Fern, 2026-09-08. 🛑 **NO. Stopping here, as you instructed. Nothing changed.**

**Can the FE tell a pause-cancelled session from any other cancelled one? — No.**

| | |
|---|---|
| Does `dropCourse` write the note? | ✅ **Yes** — `scheduler.service.ts:3742`: `.set({ status: "CANCELLED", note: "พักคอร์สชั่วคราว" })` |
| Is that `note` on the plan DTO? | ⛔ **No.** `toSessionRow` (`:1774-1783`) carries `id · date · startTime · status · bookingType · teacher · subject · attendeeNote` — **and nothing else.** |

⚠️ **One correction to the task, so nobody looks for the wrong thing:** the constant **`COURSE_PAUSE_NOTE` does
not exist**. The sentence is an **inline string literal** at that one call site. `grep -rn "COURSE_PAUSE_NOTE"`
across the backend returns nothing.

⚠️ **And `attendeeNote` is NOT it** — that is REQ-068's *"who is bringing the child"*, a different field
answering a different question. It is on the DTO; the status `note` is not. **They are one keystroke apart in a
grep and would have been an easy wrong answer.**

🚫 **I did not infer it from dates, counts or ordering**, and I want to say plainly why not, beyond your
instruction: the pause-cancelled rows in @Tanya's screenshot are distinguishable *by eye* (older dates, a
different time, contiguous) — **which is exactly what makes a heuristic here so tempting and so dangerous.**
Every one of those signals is a coincidence of this one course.

### ⇒ It is (a) or (b), and it is yours. But (a) has a shape worth choosing before you pick it.

**If (a) — the BE adds a field — please do NOT add `note`.** Shipping the Thai sentence to the client means the
FE matches on `"พักคอร์สชั่วคราว"`, i.e. **two copies of one string in two repos, one of them a UI-language
literal.** That is the drift class this project has spent the week paying for, and *"a heuristic that is right
today"* describes a string comparison as fairly as a date one.
✅ **A structural marker instead** — a boolean, or a reason code beside the status — is the same one-line change
on Jason's side and leaves nothing for the FE to guess. **Then this really is a one-line display change here.**

**If (b) — hide all cancelled rows in the plan** — it is one line on my side and I can do it immediately, but
it is the bigger ruling you said was yours: it also hides a session an admin cancelled by hand, which §2
deliberately does not rule on.

### Your Question — **every surface, and only ONE would show eight**

| Surface | Shows the 8? | Why |
|---|---|---|
| **`PlanModal`** | 🔴 **YES — the only one** | the sole renderer of `plan.sessions` |
| `CreatePlanFlow` | No | renders the **preview** payload in create mode; no cancelled rows exist yet |
| `CourseHistoryModal` | No | a **different endpoint** (`/courses/:id/history`, server-built events) — ⇒ **your §2 "put them where their question is asked" already holds with nothing moved** |
| `CoursePackagePanel` (the card) | No | renders `size` / `usedSessions` / counts off the course row, never sessions |
| Calendar day + week grids | No | filter `OFF_CALENDAR_STATUSES` (`CANCELLED`, `PAUSED`) — **which is why nobody saw this until a plan modal was opened**, exactly as you said |
| `BookingsTable` | Shows them, **correctly** | it is a *bookings* list with a status filter; a cancelled booking belongs in it |

⇒ **Fix only the plan**, and it is one surface — whichever of (a)/(b) you choose.

**Ball: @Sober.** I have made **no change for this task**; TASK-288 is separate and complete.

---

## §4 ✅ RULED — Sober, 2026-09-08. **(a), with a STRUCTURAL marker, derived server-side. No migration.**

**You stopped and asked. That was the instruction and it was the right call** — and your reasoning for *not*
inferring it is better than my instruction was:
> *"The pause-cancelled rows are distinguishable BY EYE — older dates, a different time, contiguous — which is
> exactly what makes a heuristic here so tempting and so dangerous. Every one of those signals is a coincidence
> of this one course."*

### The ruling
🔴 **(a), and NOT the note.** **You are right that shipping `"พักคอร์สชั่วคราว"` to the client means two copies of
one string in two repos, one of them a UI-language literal.** ⇒ **the drift class this project has spent the week
on, and a string comparison is no safer than a date one.**
✅ **The BE adds a BOOLEAN to `toSessionRow`, DERIVED from the note it already stores.** The Thai stays
server-side; the FE receives a fact, not a sentence. ⇒ **TASK-290 (@Jason), one line, NO MIGRATION** — nothing is
stored that is not stored today.

🚫 **NOT (b).** Hiding *all* cancelled rows also hides one an admin cancelled **by hand**, and those are different
facts: **a hand-cancelled session is a decision about the plan; a pause-cancelled one is the plan being
replaced.** ⚠️ **I said that bigger ruling was mine, and my answer is that I am not making it** — not tonight, and
not for the convenience of a display fix.

### 🔻 And you corrected me — `COURSE_PAUSE_NOTE` does not exist
**It did.** It was `course-plan.ts:203` when I wrote TASK-282 §7, and **@Jason deleted it with the withdrawn
reviving design** (his §8.1: *"`resumeAnchor` is deleted, along with `COURSE_PAUSE_NOTE`"*). **Your grep is right
about the code as it stands; my sentence was right when written and stale by the time you read it.**
📌 **Which is the same class as everything else this week — and it is why TASK-290 restores the constant** rather
than comparing against an inline literal on the backend either.
⚠️ **And thank you for `attendeeNote` NOT being it.** *"One keystroke apart in a grep and would have been an easy
wrong answer"* — **it would have been mine.**

### What happens now
1. **TASK-290 (@Jason)** — the derived boolean on `toSessionRow`, the constant restored. ⛔ **This task waits.**
2. **Then here:** the plan filters on that flag. **One line, as you said.**
✅ **Your surface table stands and needs nothing** — **`PlanModal` is the only one that shows the eight**, and
`CourseHistoryModal` is a different endpoint, so **my §2 *"put them where their question is asked"* already holds
with nothing moved.** 🔑 **That is a better outcome than the one I ruled: I expected to move something and you
established that nothing needs moving.**
📌 **`BookingsTable` showing them CORRECTLY is the distinction that makes the whole ruling safe** — a cancelled
booking belongs in a bookings list. **The plan is the only place it does not.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-08. **One line, as ruled. `smart-scheduler-front` HEAD `098a1d2`.**

**Verified:** `bunx tsc --noEmit` → **exit 0** · `bun test` → **140 pass / 0 fail** (was 133 — **+7**) ·
`bun run build` ok. 🚫 No backend change.

### The rule — `lib/scheduler/plan-rows.ts` (new)
```ts
export const visiblePlanRows = (sessions: readonly PlanSession[]): PlanSession[] =>
  sessions.filter((s) => !s.cancelledByPause);
```
`PlanSession` gained `cancelledByPause?: boolean`. **Optional, and that is a decision:** on a payload that
predates the field, absent must mean **"not a pause"** — showing a row we cannot classify is the safe direction;
hiding one would lose information against an older server. Asserted.

🚫 **Not widened, and not seconded.** No date, no count, no `CANCELLED` check, no `note`. Asserted by reading the
module's own source: it may not contain `dayjs`, `CANCELLED`, or a `.length` comparison.

### 🔑 The one judgement in it — **the VIEW is filtered, `sessions` is NOT**
```ts
const planRows = visiblePlanRows(sessions);   //  → <SessionTable sessions={planRows} />
```
Your words were *"the row does not move, the VIEW does"*, and here that is load-bearing rather than stylistic:
⚠️ **after a pause EVERY row is pause-cancelled, and those rows are the only ones still carrying the course's own
date and time** — which is exactly what **TASK-288's `courseSlot`** reads to seed the resume form's 17:00
default. **Filtering `sessions` itself would have re-broken last night's fix, in the same file, silently** — the
form would have fallen back to 10:00 for every course and nothing would have failed.
⇒ `sessions`, `liveSessions`, `pendingCount`, `weekIndexOf` and `courseSlot` all still read the whole plan;
**only the table is given the filtered rows.** Asserted at source, with that reason written beside it.

### Definition of Done
- [x] **Typecheck clean** — `bunx tsc --noEmit`, exit 0
- [x] 🔑 **A re-planned 4-session course shows FOUR rows** — asserted **on @Tanya's exact shape**: her 8 rows
      (4 PENDING @10:00 + 4 pause-cancelled @17:00) in, `["new-1","new-2","new-3","new-4"]` out
- [x] 🔑 **§3 answered in writing BEFORE the change** — above, and I changed nothing until your §4 ruling
- [x] **Still reachable** — **`CourseHistoryModal`** (`/courses/:id/history`) answers *"what happened to this
      course"*, and **`BookingsTable`** still lists every row. **Nothing was moved and nothing was deleted.**
- [x] **A hand-cancelled session is UNAFFECTED** — asserted directly: a `CANCELLED` row with
      `cancelledByPause: false` beside one with `true` ⇒ **only the pause row goes.**
- [x] 🚫 Nothing deleted · counts unchanged · tray, edit and grid untouched

### 📌 The trap, a third time — and it is now written at the assertion, not in my head
My source assertion forbade the string `"CANCELLED"`; it failed on **the doc comment that names the three paths
the field deliberately does NOT match** — i.e. on the sentence explaining the very absence it checks for.
**Same class as `weekday` (TASK-287) and `mode={dropMode ?? "drop"}` (TASK-288).** Fixed the same way — slice to
the code, never the file:
```ts
const src = file.slice(file.indexOf("export const visiblePlanRows"));
```
⚠️ **The lesson survived only as a habit and the habit is not enough.** The rule is now a comment on the slice
itself, so the next person to add an assertion here reads it before writing one.

### 🔴 Not verified
**I have not seen it rendered.** The filter is unit-asserted on her exact payload, but *"four rows on screen"* is
hers: **open the re-planned course's plan — four rows, all PENDING, none at 17:00 — then cancel one session by
hand and confirm it is still listed.** The mock exercises both ⇒ **LOCAL**.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-289 is DONE. THE BATCH IS COMPLETE.** 🔑 **And you found that my own ruling was load-bearing, not stylistic.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **140 pass / 0 fail** (+7) ·
`PlanModal.tsx:158` `sessions` is the **unfiltered** plan · `:184` `planRows = visiblePlanRows(sessions)` ·
`:193` `courseSlot` reads **`sessions`**, not `planRows` · `:291` only the table receives the filtered rows ·
`:572-573` the resume form is seeded from `courseSlot`. 🚫 No backend change.

### 🔴 The judgement — filtering `sessions` would have RE-BROKEN last night's fix, silently
> *"After a pause EVERY row is pause-cancelled, and those rows are the only ones still carrying the course's own
> date and time — which is exactly what TASK-288's `courseSlot` reads."*

⇒ **filter the array and the 17:00 default falls back to 10:00 for every course, in the same file, with nothing
failing.** 🔑 **I wrote *"the row does not move, the VIEW does"* as a way of saying "do not delete data". You
found it was the difference between a fix and a regression** — and the two changes are one night apart in one
component, which is exactly how a silent re-break happens.
✅ **`sessions`, `liveSessions`, `pendingCount`, `weekIndexOf` and `courseSlot` all still read the whole plan;
only the table is given the filtered rows** — asserted at source, **with the reason written beside it** at
`:176`. **That comment is the control, not the code.**

### ✅ The optional field, and the direction you chose
`cancelledByPause?: boolean` — **absent means "not a pause"** on a payload that predates the field.
> *"Showing a row we cannot classify is the safe direction; hiding one would lose information against an older
> server."*

🔑 **Correct, and it is the right way round for THIS field:** the failure of showing too much is a confused
admin; the failure of hiding is a session nobody can see. **Asserted rather than assumed.**

### ✅ Not widened, not seconded
**No date, no count, no `CANCELLED` check, no `note`** — asserted by reading the module's own source. 📌 **After
@Jason found three other paths that leave a cancelled row carrying text, a second client-side condition beside
this one would have been the whole defect back again.** **You read the field and left it alone.**

### 🔻 The source-assertion trap, a THIRD time — and you fixed the habit, not the instance
Your assertion forbade `"CANCELLED"` and failed on **the doc comment naming the three paths the field
deliberately does not match** — *"the sentence explaining the very absence it checks for."*
📌 **Third instance: `weekday` (TASK-287), `mode={dropMode ?? "drop"}` (TASK-288), this.**
🔑 **And your line is the one worth keeping:** *"the lesson survived only as a habit and the habit is not
enough."* ⇒ **you put the rule at the slice**, so the next person to add an assertion there reads it before
writing one. **That is the difference between learning something and leaving something behind.**

### 🔴 Not verified — and the check you named is the right one
**Two local steps, and the second is the one I would not have specified:** open the re-planned course — four
rows, all `PENDING`, none at 17:00 — **then cancel one session by hand and confirm it is still listed.**
📌 **The second step tests the distinction the whole ruling rests on**, and it is the one a casual look would
skip. **Going to @Porter for @Tanya's round.**
