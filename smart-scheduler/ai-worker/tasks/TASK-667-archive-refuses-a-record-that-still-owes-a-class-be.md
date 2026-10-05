# TASK-667 — the archive refusal also counts a move awaiting the parent and a held (paused) class — BE, XS
- Source: Porter's ruling 2026-10-06 ("FIX the archive refusal before TASK-665 goes anywhere") · finding in `project-docs/data-requests/DATA-REQUEST-uat-no-parent-18-2026-10-06.md` §addendum
- Status: DONE (reviewed by Silver, 2026-10-06) · 🔴 ships ONLY with TASK-665
- 🔴 **Ships ONLY together with TASK-665** (the front-end archive button). Porter: 665 does not ship without this.
- **Claim:**
  - `src/services/parent.service.ts` (Team B's) + `parent.service.test.ts`;
  - ⚠️ **asked of Porter:** `src/lib/archive-parent-req098.test.ts` (line 110 only) and `src/lib/archive-student-req093.test.ts` (line 85 only). Both pin the exact status expression this TASK changes;
  - a new co-located test and mutation set.
  - 🚫 Nothing else.

## §0 The rule, written so it is not re-argued (Porter)
**The refusal exists to answer ONE question: "does this record still owe somebody a class?"**
- **PENDING · CONFIRMED · EXTENDED**: owed (today's set, `COURSE_LIVE_STATUSES`).
- **PENDING_RESCHEDULE**: a move **awaiting the parent's acceptance**, still drawn on the coach's grid ⇒ **owed** ⇒ must refuse.
- **PAUSED**: a **hold**; the family is coming back ⇒ **owed** ⇒ must refuse.
- **SICK_LEAVE** and **CANCELLED**: **not owed** ⇒ must still ALLOW.
  - 🚫 **Do not widen to "any future booking"**: that makes the button useless on exactly the rows it exists for.
- ATTENDED / NO_SHOW dated in the future should not exist. Leave them out of the set, as today.

## What exists (CERTAIN)
- `liveFutureSessionCount` (`parent.service.ts:173-181`) counts future rows (Bangkok `today`) whose status is in `COURSE_LIVE_STATUSES`.
- It is used by **`archiveStudent`** (`:193`, refuses `409 STUDENT_HAS_LIVE_SESSIONS`) and by the **parent archive** (`:550`).
  - ⇒ **Both get the fix**, which is correct: archiving a whole family out from under an owed class is the same defect.

## What to do
1. A **named set in `parent.service.ts`**, e.g. `ARCHIVE_BLOCKING_STATUSES = [...COURSE_LIVE_STATUSES, "PENDING_RESCHEDULE", "PAUSED"]`, with a one-line comment quoting §0's question.
   - 🚫 **Do NOT change `COURSE_LIVE_STATUSES` itself.** It drives the course plan and the badge, and they must not move.
2. `liveFutureSessionCount` uses the new set. Everything else is unchanged: the date rule, the student/co-student match, the 409 code.
   - The refusal sentence stays as it is (*"มีคาบเรียนข้างหน้า {n} คาบ — ยกเลิก/ย้ายก่อน"*). It is still true, and there is no new wording.
3. Re-pin the two pins (once granted) to the new expression, with a `🔻 TASK-667` note in each file's own style.
   - 🚫 Don't weaken them: they keep reading the exact expression.

## Definition of Done
- [ ] **Pure or route tests by value** (no DB):
  - a future PENDING_RESCHEDULE ⇒ refused;
  - a future PAUSED ⇒ refused;
  - a future SICK_LEAVE ⇒ allowed;
  - a future CANCELLED ⇒ allowed;
  - a past PENDING_RESCHEDULE ⇒ allowed;
  - the existing PENDING, CONFIRMED and EXTENDED cases unchanged.
  - The same for the **parent** archive.
- [ ] Mutation set `src/services/archive-owed-task667.mutations.json` (with `tests`):
  - PENDING_RESCHEDULE dropped (bites);
  - PAUSED dropped (bites);
  - SICK_LEAVE added (bites, so "not owed" is pinned);
  - "any future booking" (bites);
  - `COURSE_LIVE_STATUSES` itself edited (bites, so the plan and badge are protected).
- [ ] Full suite with **no reachable database**, plus `tsc`. State Team A's work in the tree. (If TASK-666's date bomb is still red, say so; it is not yours to attribute here.)
- [ ] `git status`: only the claimed files. Nothing committed.

## Implementation Notes
**Bob, 2026-10-06.** Submitted together with TASK-666.

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `src/services/parent.service.ts` (+9 / −1) | `export const ARCHIVE_BLOCKING_STATUSES = [...COURSE_LIVE_STATUSES, "PENDING_RESCHEDULE", "PAUSED"] as const;`, with a comment quoting §0's question. `liveFutureSessionCount`'s status term now reads it. **Everything else is unchanged:** the date rule (`>= today`, Bangkok), the student/co-student match, both 409 codes, both sentences. |
| `src/lib/archive-parent-req098.test.ts:110` and `src/lib/archive-student-req093.test.ts:85` | **the two granted lines only**, 1 line each |
| `src/services/archive-owed-task667.test.ts` (new) | 21 tests |
| `src/services/archive-owed-task667.mutations.json` (new) | the mutation set |

- **`COURSE_LIVE_STATUSES` is NOT touched** (`course-plan.ts` has no diff).
- Both doors get the fix through the ONE count: `archiveStudent` (`:193`) and `archiveParent` (`:550`).

**The re-pin, and why it is the SAME claim, not a pass (Porter's condition).** Each granted line still asserts, verbatim, the exact count expression, now `inArray(bookings.status, [...ARCHIVE_BLOCKING_STATUSES])`. On the **same line** it also asserts the set's own definition:
```
…[...ARCHIVE_BLOCKING_STATUSES])"); expect(PS).toContain('export const ARCHIVE_BLOCKING_STATUSES = [...COURSE_LIVE_STATUSES, "PENDING_RESCHEDULE", "PAUSED"] as const;'); // 🔻 TASK-667 — the SAME claim (the refusal = the real "still owed" set): live + a move awaiting the parent + a hold; SICK_LEAVE / CANCELLED stay out
```
- So the pin still says "the refusal counts exactly the still-owed set". It names that set and pins its exact contents, so SICK_LEAVE or CANCELLED can't slip in silently.
- The edit was done by a script that **refused to touch any line not textually equal to the old pin** at the granted line numbers. Nothing else in either file changed (`git diff --stat`: 1 line each).

**Tests: by VALUE, no database** (`archive-owed-task667.test.ts`, 21):
- **How:** `db.select` is answered by a fake that **evaluates the REAL built condition**. It reads the condition back through drizzle's `.toSQL()` (student/co-student ids, `today`, the status list) and filters fixture rows with it. So the real `archiveStudent` / `archiveParent` run over the real condition, and the writes are stubbed with an "ALLOWED" sentinel that proves the refusal let them through.
  - A harness guard test checks the fake really read the real condition.
- **Student:**
  - future PENDING · CONFIRMED · EXTENDED · **PENDING_RESCHEDULE** · **PAUSED** ⇒ `409 STUDENT_HAS_LIVE_SESSIONS`;
  - future **SICK_LEAVE** · **CANCELLED** ⇒ allowed;
  - a **past** PENDING_RESCHEDULE ⇒ allowed;
  - a future PAUSED on a DUO row where the child is the **co-student** ⇒ refused (TASK-420 unchanged);
  - a mix of 5 rows ⇒ the unchanged sentence with **3**: *"มีคาบเรียนข้างหน้า 3 คาบ — ยกเลิก/ย้ายก่อน"*.
- **Parent (household):** the same five ⇒ `409 PARENT_HAS_SESSIONS`; SICK_LEAVE / CANCELLED ⇒ allowed; a past PENDING_RESCHEDULE ⇒ allowed.
- **The set:** `ARCHIVE_BLOCKING_STATUSES` equals exactly the five, and `COURSE_LIVE_STATUSES` is still exactly `PENDING · CONFIRMED · EXTENDED`.

**Mutation set `archive-owed-task667`** (`tests` = the task file plus the two granted pin files):
```
baseline 55
O1 BITES (49 / 6)  — PENDING_RESCHEDULE dropped from the owed set
O2 BITES (48 / 7)  — PAUSED dropped from the owed set
O3 BITES (49 / 6)  — SICK_LEAVE added ("not owed" must stay out)
O4 BITES (34 / 21) — "any future booking" — the status filter removed from the count
O5 BITES (53 / 2)  — COURSE_LIVE_STATUSES itself edited (+PAUSED) — the plan and the badge must not move
O6 BITES (47 / 8)  — the count reverted to the OLD set (the defect itself)
CHECKSUM identical
```
- **6 BITES · 0 SURVIVED · 0 NO RESULT.**

**Runs (no reachable database; `.env` untouched):**
- Full suite: **4016 pass / 0 fail across 315 files.** This includes TASK-666's three camp files (green), so the date bomb is no longer red.
- The tree also holds **Team A's uncommitted migration-ledger work** (scripts, `migration-ledger(.test).ts`, `.gitattributes`, a mutation set), untouched.
- `tsc --noEmit` → **exit 0**.
- `git status` (mine, both TASKs): `parent.service.ts`, the two pin files, the three camp test files, and the new test + mutation set. Nothing committed.
- 🔴 **Ships ONLY with TASK-665** (as the TASK says); nothing in this TASK enforces that, so it is your call at release.

## Questions

## Review
**Silver, 2026-10-06 — ✅ DONE. 🔴 Ships ONLY with TASK-665.**
- **Diff read:** `ARCHIVE_BLOCKING_STATUSES = [...COURSE_LIVE_STATUSES, "PENDING_RESCHEDULE", "PAUSED"]`, with §0's question in its comment.
  - `liveFutureSessionCount` reads it, so both the student and the parent archive get it.
  - The date rule, the student/co-student match, both 409 codes and both sentences are unchanged.
  - `course-plan.ts` has no diff, so `COURSE_LIVE_STATUSES` is untouched.
- **The re-pins (Porter's condition) are met:** each granted line still asserts the exact count expression **and** pins the set's exact contents. The claim survived the change; the line was not just made to pass. One line per file.
- **Tests by value, through the real condition:** owed statuses refuse, SICK_LEAVE / CANCELLED / past allow, DUO co-student covered, and the parent path too. 6/0/0 mutations, including O5 (the plan and badge protected) and O6 (the defect itself).
- **Re-run by me:** 667 + the two pin files + the 3 camp files → **92 / 0**; `tsc` 0. ⚠️ The tree also holds Team A's uncommitted migration-ledger work.
