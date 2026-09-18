# TASK-363 — Remove the `< size` advance-leave cap — FULL UNLOCK (`REQ-089 §4.2`), with two correctness GATES

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Source:** owner ruling `REQ-089 §4.2` — *every planned row leaveable, no ceiling, advance leave still free.* Overrides `§4` (which kept the cap) — the case: a family must leave an EXTENDED session too, and on a size-4 the cap refused the very first make-up leave.
**Size XS — but the two gates are the task, not the line.** ⛔ Chain stopped. Rides in the item 8 + 1 + 3 round.

---

## §1 The line
`validation.ts:285` — the `new Set(d.absentWeeks).size < d.size` refine and its TASK-148/361 comment: **remove**; rewrite the comment as the reversal with the owner's reason. The FE has no client-side cap (TASK-362 asserted it), so nothing moves there.

## §2 GATE 1 — the chain TERMINATES (my read; you PIN it with values)
`plannedRowCount` loops `while (live < size)`; any position beyond the largest declared absence is live, so it stops for every finite request: **rows ≤ `size + |absent|`**. The create's flip loop is bounded by `wanted` with the guarded `break`; `reconcileCoursePlan` appends exactly `size − live` per call. ⇒ **Pin: size 4, absent {1,2,3,4} ⇒ 8 rows, 4 live, all 4 originals `SICK_LEAVE`; absent {1..4, 5..8} ⇒ 12 rows; the flip loop runs ≤ `wanted` times (assert the count).**
⚠️ **The one unbounded input is the REQUEST itself** — `absentWeeks: z.array(...)` has no `max`; by API (not the UI, which only shows rows that exist) a caller can name 10,000 positions and get a 10,004-row course. 🚫 Do not add a bound — the owner said "no ceiling" and a request bound is a DECISION; **say the number you would pick and why on the list** (my instinct: positions ≤ 104, two years — an abuse fence, not a product cap).

## §3 GATE 2 — a course with ZERO attended originals is a valid state everywhere downstream
Size 4, all four originals declared absent: the live sessions are four make-ups. **Assert, by running not reading, that these do not choke or mislabel it:** the ceiling (base + 4 weeks, Kavya pins hold) · `leaveUsed` untouched (free) · the plan response's `endDate`/`liveCount` · `deriveLiveEndDate` · `attention.ts` (does it flag a course that is "all leave"? if so, is the flag WRONG or merely loud — say which) · `course-history.ts` · the daily reminder / outbox kinds that print sessions (nothing prints a `SICK_LEAVE` as a class) · the import audit is untouched. **If any of these is wrong for this state — STOP, do not remove the line, report.** If merely loud, remove the line and list the loudness.

## Definition of Done
- [ ] Suite, **count** · tsc · **35 = 35**
- [ ] Cap asserted GONE from the source; gate 1 and gate 2 pinned with values
- [ ] 🔑 Break-and-watch (cap back; a non-terminating variant of `plannedRowCount` — e.g. `absent` treated as "all positions" — must be caught by the count pin), `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The request bound (§2). One number, one reason.

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code).** **2161 pass / 0 fail**, **175 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**. **One line removed** (`validation.ts`'s `< size` refine, its comment rewritten as the reversal with the owner's reason), two pins rewritten as reversals, one new test file. **The FE has no client-side cap (TASK-362 asserted it), so nothing moves there.**

## §0 🔴 THE ORDER — the gates ran on the UNFIXED tree, before the line moved
Both gates were written and run with the cap still in place: **11 pass, and only the two LINE tests failed** (the cap still refusing). ⇒ nothing downstream was found WRONG for the zero-attended-originals state; the line was removed after that, not before.

## §1 ✅ GATE 1 — the chain TERMINATES, pinned with values
- size 4, absent {1,2,3,4} ⇒ **8 rows, 4 live (rows 5–8, all make-ups), all 4 originals absent.**
- absent {1..4, 5..8} ⇒ **12 rows** — a make-up of every make-up, and it still stops; 13 does not exist.
- **The bound, over six shapes (sizes 4/6/10, all-absent, scattered, past-the-end):** `rows ≤ size + |absent|`, and exactly `rows = size + |declared positions that exist|`.
- **The create's flip loop, simulated with the real `makeupsToFlip` and `plannedRowCount`:** {1..4} ⇒ **0 flip passes** (nothing past the chain declared) · {1..8} ⇒ **1 pass** (rows 5–8 flipped together, one reconcile appends 9–12) · {2,5,6} ⇒ **2 passes** (row 6 exists only after the second reconcile) — every count ≤ `wanted`, and every end state has exactly `size` live rows.

## §2 ✅ GATE 2 — a course with ZERO attended originals is a VALID state downstream — run, not read
| reader | result |
|---|---|
| the ceiling | base + 4 = **week 9**, covering the last make-up (week 8); Kavya still week 11 |
| the plan engine | `courseCurrent` = 4 = size ⇒ `planCourseMoves` = no moves; `deriveLiveEndDate` = the last make-up |
| `leaveUsed` | UNTOUCHED — the create contains no `leaveUsed`; a declared absence is free (decision B) |
| attention | `usedSessions` = 0 ⇒ `courseRemainingSessions` = 4 ⇒ **NOT nearly finished — correct, not merely quiet** |
| course history | four `sick-leave` + four `makeup-appended` events, each make-up naming its original; summary `remaining` 4, `leaveUsed` 0 — **labels RIGHT** |
| the daily reminder | prints only `CONFIRMED` rows — a `SICK_LEAVE` is never printed as a class |
| the import path | untouched |
🔑 **Nothing WRONG and nothing LOUD:** attention does not flag an all-leave course (it has nothing to flag — `remaining` is the full size), history describes it exactly, and no outbox kind prints a leave as a lesson. ⇒ **the line was removed.**

## §3 🔻 Pins — two rewritten as REVERSALS, with the reason
`validation.test.ts`'s TASK-148 *"every week absent is refused — that is not a course"* → **accepted, because the engine appends a make-up per absence and an all-absent course IS a course: four make-ups**; and TASK-361's own *"the CAP stays"* from this morning → gone the same day, with the sentence that the LOCK's claim is unchanged and the cap's fate is this task's. Both keep the existence rule asserted still refusing a position beyond the drawn plan.

## §4 🔑 Mutation — three, `finally`, checksum — all bite
the cap back · **a non-terminating variant of `plannedRowCount`** (a declared set treated as "all positions", with a 100 000 guard so it is caught by the COUNT pin rather than by a hang — four pins fail) · `makeupsToFlip` forgetting the `!== SICK_LEAVE` clause (the flip loop's pass-count pin fails). 🔻 *My first B was a no-op mutation — a rewritten condition that evaluated to the original — and passed; rewritten to actually stop `live` from advancing, it fails.*

## §5 ❓ YOUR QUESTION — the request bound: ONE number, ONE reason
🔑 **104.** `absentWeeks`: every position ≤ 104, and at most 104 entries.
**The reason:** it is the length of the CALENDAR, not of the product — two years of weekly rows. A course whose ceiling sits two years past its start is not a course the school runs; **a request that names position 105 is not a family declaring leave, it is a client that is broken or hostile.** 104 bounds the worst plan at 104 rows (a size-10 with 94 absences) — a number the DB, the preview and the admin's screen all survive — and it is a fence with NO product meaning, so it cannot be mistaken for the cap the owner just removed. 🚫 **Not added: "no ceiling" is the ruling and a bound is a decision.** *If he says yes it is `.max(104)` on the array and `w <= 104` in the existence refine — two tokens.*
