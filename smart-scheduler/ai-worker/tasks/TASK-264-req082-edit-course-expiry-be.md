**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / 1533 pass 0 fail / 35 sql = 35 tags / migration 0034, not applied. Ships with the FE task.

# TASK-264 — REQ-082 BE: edit a course's expiry, record who changed it, and make `EXPIRY_REQUIRED` conditional

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Spec:** `SPEC-076` · **Requirement:** `REQ-082` AC-1…AC-5, **plus (ข)** — the owner's conditional
`EXPIRY_REQUIRED`.
**In the batch by the owner's reversal.** 🔴 **First deploy is `sid`, then `uat`** — so a lock on the index is not
tonight's risk, but **this task adds the batch's SECOND schema change.**
📌 **No clock.** @Porter: *"completeness over speed, twice today."* **Say when it is done; do not trim it to fit.**

---

## §1 🔴 AC-2 is a new table — there is nothing to record into

`grep auditLog|audit_log|courseAudit` in `db/schema.ts` → **nothing.** `SYSTEM-FACTS.md` says it too: *"NO audit
table exists anywhere."*

**Record: `courseId · from · to · actor · timestamp`.**
🚫 **No free-text reason** — nobody asked for one, and a reason field on an audit row is a prompt someone has to
fill in and will not.
🚫 **Do not build a general audit system.** ⚠️ **But this is the second demand of its class in two weeks** —
TASK-244 wants a durable trail for the family LINE unlink for the same reason. **Put that in the table's own
comment**, so the third demand reuses the shape instead of inventing a third answer. **Naming the likely second
tenant is not designing for it.**

**Migration:** hand-authored, journal-registered, **witnessed on the table** (it does not exist before ⇒ existence
is a valid witness here — unlike `0033`, and say so in a word). ⚠️ **Re-count `.sql` = journal tags and state both
numbers**; `0032`/`0033` landed since this task was written.

## §2 🔴 AC-3 is an ABSENCE and it is the one helpfulness will break
> *"the sessions already on the calendar are not moved, added or removed. This changes one date and nothing else."*

The plan reconciles against `size`, `maxWeek` and the expiry in several places (`reconcileCoursePlan`,
`applyPlanChange`, `courseOwedTarget`). ⇒ **assert this path calls none of them, with the reason in the test
name.** **An expiry edit that quietly regenerates a plan is worse than the missing feature.**

## §3 AC-4 + (ข) — ONE computation, three callers
**AC-4:** a new expiry earlier than a scheduled session ⇒ **warn, name which sessions fall outside, and save
anyway.** 🚫 Not a refusal and not a blocking dialog — the owner's rule is *warn, do not act*.
**(ข):** `resumeCourse`'s `EXPIRY_REQUIRED` becomes **conditional** — required only **when the warning fires**,
never on a resume where nothing is wrong.

⇒ 🔴 **The same question — "is this expiry a problem, and for which sessions?" — is asked by three callers:** the
edit's warning, the resume's warning, and the resume's validation gate. **One function.**
🚫 **Three copies of that answer is this project's single most frequent defect** — three status lists on 09-06,
three parent lookups on 09-05, two labelling conventions on 09-06.
⚠️ **The warning's inputs are computed on the SERVER.** A second derivation on the screen is how the warning and
the truth come apart.

## §4 AC-5 — no money, no entitlement
An expiry is a boundary, not a purchase. **Assert this path touches no `bo.movement`, no `usedSessions`, no
`usedHours`** — the absence-with-a-reason shape, as in TASK-260.

## §5 Not in this task
🚫 The **control** and the warning's display — FE, and REQ-084's resume button with it. ⚠️ **DEPLOY RULE 3: an
editable expiry with no screen is a server-side gate with no screen. They ship together** — I am cutting the FE
task next.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] The migration is hand-authored and journal-registered; **`.sql` count = tag count, both numbers stated**
- [ ] A witness for it, and **one line on why existence IS a valid witness here** when it was not for `0033`
- [ ] AC-1…AC-5 asserted, named by number
- [ ] 🔴 **AC-3 asserted as an absence** — this path calls no plan-reconciling function, with the reason
- [ ] AC-4 warns, names the sessions, **and saves** — asserted that it does not refuse
- [ ] (ข): `EXPIRY_REQUIRED` fires **only** when the warning does — asserted both ways, **and asserted that both
      read the SAME function**
- [ ] AC-5: no movement, no `usedSessions`, no `usedHours` — asserted as absences
- [ ] 🚫 No SQL run, **no `db:generate`**, the migration is **not applied by you**, nothing sent

## Questions
1. **Does anything already write `courses.expiry_date` that should now be recorded too?** I know of `resumeCourse`
   (`:3698`) and the voucher path (`:1208`). **If an expiry can change anywhere else, the audit has a hole on day
   one** — name what you find, and say whether those sites should record as well or deliberately not.
2. **Is there an existing "actor" convention** — how do `droppedBy` / `discountActor` get their value? **Use that
   one.** A second way of naming who did something is the same defect class as everything above.

---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1533 pass / 0 fail, 121 files**
**Migrations: 35 `drizzle/*.sql` = 35 journal tags**, both re-counted at the moment of writing (they were 34 = 34
before this — `0032`/`0033` had landed as you warned). 🚫 **No SQL run · `db:generate` NOT run** (no snapshot
file is modified — `git status drizzle/` shows only the journal and the new `.sql`) · **the migration is not
applied by me** · nothing sent.
New: `drizzle/0034_course_expiry_changes.sql` · `src/lib/course-expiry-impact.ts` ·
`src/services/course-expiry-edit.test.ts` (19 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1533 / 0**, 121 files
- [x] Hand-authored, journal-registered; **`.sql` = 35, tags = 35**, both stated
- [x] Witness + the one line on existence — below
- [x] AC-1…AC-5 asserted, named by number
- [x] 🔴 AC-3 asserted as an **absence**, six functions named
- [x] AC-4 warns, names the sessions, **and saves** — asserted there is no `throw` between the impact and the write
- [x] (ข) asserted both ways, **and that both read the same function** (`expiryImpact(` appears **once** in `resumeCourse`)
- [x] AC-5 asserted as absences
- [x] 🚫 No SQL run, no `db:generate`, not applied, nothing sent

## The witness — and **why existence IS valid here**
`{ kind: "index", index: "course_expiry_changes_course_idx" }`.
🔑 **The index, not the table** — rule 1 wants the LAST object, and witnessing the table would call a run that
died between the two statements "applied", leaving the index never created.
✅ **Existence is enough because this migration INVENTS the object**: the index is new, over a table that is new,
so nothing that ran before could have produced it and a false "applied" is impossible.
⚠️ **`0033` could not use existence** — `bookings_teacher_slot_uq` existed before **and** after and only its
predicate changed, which is the `0022` blindness. ⇒ **The rule was never "avoid existence"; it is "the object
must exist ONLY because this ran".** For `0033` that forced a predicate probe; here it permits the simple one.

## §3 — one function, and the count that proves it
`src/lib/course-expiry-impact.ts` · `expiryImpact(expiryDate, sessions)` → `{ warn, outside, outsideCount }`.
Pure, and it takes **candidates rather than fetching rows** — which is what lets one function serve both askers:
the edit asks about sessions **already on the calendar**, the resume asks about dates it is **about to create**.
🔑 **`expiryImpact(` appears exactly ONCE inside `resumeCourse`** — asserted — so the gate and the warning cannot
be two answers. (ข) is then true by construction rather than by two implementations agreeing.

🔴 **A THIRD status list, and I wrote it as the SETTLED set on purpose.** Following the rule your own two lists
are documented by:

| list | question |
|---|---|
| `SLOT_INACTIVE_STATUSES` | *does it hold a teacher's slot?* |
| `CALENDAR_HIDDEN_STATUSES` | *does it appear on the grid?* |
| **`EXPIRY_SETTLED_STATUSES`** | ***is this session already finished with, whatever the boundary says?*** |

⚠️ **Written as the settled set (`ATTENDED · SICK_LEAVE · NO_SHOW · CANCELLED`), not the affected set**, so a
status added tomorrow falls into "still owed" and gets **warned about** rather than silently dropped from the
warning. Both defaults are wrong somewhere; **this one is wrong loudly**, and the other is wrong in the direction
where a family quietly loses sessions. `PAUSED` is deliberately **not** settled — a paused booking keeps its date
and is still owed. Asserted, including an unknown status.
⚠️ **A session ON the expiry date is INSIDE it** — the same reading `courseStatus` already uses
(`c.expiryDate < today`). A boundary meaning one thing in the warning and another in the status is worse than no
warning.

## AC-1 — **no `assertCourseWritable`, and it is a decision**
That gate keeps ENDED/DROPPED courses out of paths that **create or move sessions**; this path does neither, which
is AC-3, so it has nothing to protect here. 🔴 **And guarding it would break the pair this ships with:** REQ-084's
resume warning says *"ขยับวันหมดอายุก่อน"* about a course that is **DROPPED at that very moment**, and the gate
refuses DROPPED. **It would make the warning point at a control that refuses.**
📌 Your own guard caught this before I could forget it: `course-ended-writes.test.ts` failed with *"no write route
is unclassified"* the moment the route existed. **`PATCH /courses/:id/expiry` is classified `allowed`, with the
reason and with the sentence that decides it again if the route ever gains a second field.**

## Answers

### Q1 — **TWO paths move a course's expiry. Both now record. The audit has no hole.**

| site | what it is | recorded? |
|---|---|---|
| `updateCourseExpiry` (new) | the admin's edit | ✅ |
| `resumeCourse` (`:3698`) | takes the admin's new expiry on resume | ✅ **yes — this was the day-one hole** |
| `createCoursePackage` · `importCourse` · the plan-create paths | **INSERT** the initial expiry | 🚫 no — there is no "from"; a creation is not a change |
| `prepareVoucherBooking` (`:1208`) | `voucherExpiry(...)` on a voucher's **first booking** | 🚫 no — see below |

🔴 **`resumeCourse` is the one that mattered.** Recording only the new endpoint would have shipped an audit whose
hole is **invisible**: a missing row looks exactly like a course nobody edited. It now records through the **same
writer, in the same transaction** — and a resume that does not change the date records nothing, because an audit
full of rows saying nothing happened is how people stop reading it.
📌 **`prepareVoucherBooking` is deliberately NOT recorded, and I want the reason on the record rather than the
omission:** it is a **voucher**, this table is `course_id`-keyed, and it is not a human decision — it is the
"validity starts at the first booking" rule firing once. ⚠️ **But it means "why does this VOUCHER expire today"
still has no answer**, and REQ-082 only ever asked about courses. **That is a gap in the requirement, not in the
build** — your call whether it becomes anything.
📌 One more: `resumeCourse` took **`_actor`** and threw it away. The route has supplied one all along; the
underscore was the sign nothing read it. **The audit is its first reader.**

### Q2 — **the actor convention exists and I used it: the TOKEN's `sub`, resolved at the ROUTE.**
`c.get("user")?.sub ?? null`, passed as an argument — `api.ts:197 · 205 · 219 · 320`, and TASK-160's rule stated
at the discount site: *"the actor comes from the TOKEN — never from the body."* `droppedBy` / `endedBy` are
written from exactly that value. ⇒ `actor` is **nullable text**, same as those columns, and **not in the request
schema** — asserted, because an audit row whose author the caller can choose records nothing.

## ⚠️ A CONTRACT CHANGE for the FE task, before you cut it
`POST /courses/:id/resume` changes shape. **@Fern is building against it next, so this needs to reach her as a
contract, not as a discovery** (TASK-260 §8's lesson):

1. **`expiryDate` is now OPTIONAL** in the request. Sending it always still works, so **her current code does not
   break** — but "resume without asking for a date" is now a legal call and is the normal one.
2. **`EXPIRY_REQUIRED` (400) still exists** and now fires **only** when the sessions the resume would create fall
   outside the existing expiry. Its message names the count and the old date.
3. **The response gains `expiryWarning: { expiryDate, warn, outside[], outsideCount }`** — the same shape
   `PATCH /courses/:id/expiry` returns, **so one warning component serves both REQs.** That is what makes "one
   rule across both" true in the code rather than in the REQ text.
4. New: `GET /courses/:id/expiry-history` → the audit rows, newest first.

## Review — Sober, 2026-09-06: ✅ **PASS. TASK-264 is DONE (code).** You sharpened my own witness rule and pre-empted my worst mistake of the week.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1533 pass / 0 fail** (121 files) · **35 `.sql` = 35 journal
tags**, counted here · `git status drizzle/` shows **only the journal modified** plus the three new `.sql` — **no
snapshot file touched, so `db:generate` provably was not run.** Nothing applied, nothing sent.

### 🔴 You sharpened the witness rule rather than following it
I wrote *"existence IS a valid witness here — unlike `0033`."* **You found the general form:**
> *"The rule was never 'avoid existence'; it is **'the object must exist ONLY because this ran'**."*

✅ **And you did not take the easy witness.** The table would have been the obvious one — you witnessed **the
index**, because *"rule 1 wants the LAST object, and witnessing the table would call a run that died between the
two statements 'applied', leaving the index never created."* **A half-applied migration reporting green is the
same failure `0033` was protected from, arriving through the other door.**

### 🔴 The day-one hole, and why it was the one that mattered
> *"Recording only the new endpoint would have shipped an audit whose hole is **invisible**: a missing row looks
> exactly like a course nobody edited."*

**`resumeCourse` moves an expiry too**, and it now records **through the same writer, in the same transaction.**
✅ **And a resume that does not change the date records nothing** — *"an audit full of rows saying nothing happened
is how people stop reading it."* **That is the difference between an audit and a log.**
📌 **`_actor` had been thrown away all along** — the route supplied it, the underscore was the sign nothing read
it. **The audit is its first reader.**

### ✅ The voucher gap — named as a REQUIREMENT gap, not hidden as an omission
*"'Why does this VOUCHER expire today' still has no answer. That is a gap in the requirement, not in the build."*
⇒ **My ruling: leave it out, and it goes to @Porter as a question, not a task.** A voucher's expiry is set **once,
by a rule firing** — not by a person — so *"who changed it"* has no answer to record. **But *"why does it expire
today"* is still a support question with no answer**, and that is the owner's to want or not. **Correctly refused
and correctly escalated.**

### 🔴 The third status list, written as the SETTLED set — and that direction is the decision
`EXPIRY_SETTLED_STATUSES` answers *"is this session already finished with, whatever the boundary says?"* — the
third list in this project in one day, each named by its question.
✅ **Written as the settled set, not the affected set**, so **a status added tomorrow falls into "still owed" and
is warned about loudly**, rather than silently dropped from a warning. ⚠️ *"Both defaults are wrong somewhere;
this one is wrong loudly, and the other is wrong in the direction where a family quietly loses sessions."*
📌 **Same reasoning @Fern used for `undefined` on TASK-262, reached independently the same day.**
✅ And **a session ON the expiry date is INSIDE it**, matching `courseStatus`'s own reading — *"a boundary meaning
one thing in the warning and another in the status is worse than no warning."*

### ✅ AC-1's missing guard is a decision, not an omission
No `assertCourseWritable` — **and guarding it would have broken the pair this ships with:** REQ-084's resume
warning says *"ขยับวันหมดอายุก่อน"* about a course that is **DROPPED at that moment**, and the gate refuses
DROPPED. **It would point the warning at a control that refuses it.**
📌 **And an existing guard caught it before you could forget:** `course-ended-writes.test.ts` failed with *"no
write route is unclassified"* the moment the route existed. **A control doing its job on someone who was already
right.**

### 🔴 The thing I most want to credit: you delivered the FE a CONTRACT
> *"`POST /courses/:id/resume` changes shape. @Fern is building against it next, so this needs to reach her as a
> contract, not as a discovery (TASK-260 §8's lesson)."*

**That was my failure last time and you closed it before it could repeat** — optional `expiryDate`, the narrowed
`EXPIRY_REQUIRED`, the shared `expiryWarning` shape, and the new history route. ✅ **And the shared shape is what
makes *"one rule across both REQs"* true in the code:** one warning component can serve REQ-082 and REQ-084
because both endpoints return the same object.

**Status → DONE (code).** ⇒ The FE task is mine to cut, **and it will carry your contract verbatim.**
