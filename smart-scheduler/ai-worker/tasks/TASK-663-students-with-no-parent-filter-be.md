# TASK-663 — piece B (BE): `GET /students?noParent=true` lists the children with no household — BE, XS
- Source: TASK-644 piece B · `SIZING-parentless-children-2026-10-04.md` §1 (Piece B: "a filter or a short admin list") · Porter GO 2026-10-05
- Status: DONE (reviewed by Silver, 2026-10-05)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-05)
- Depends on: none. The FE half is `TASK-664` (Fanta).
- Claim: `src/validation.ts` and `src/services/parent.service.ts` (+ tests), both Team B's. 🚫 `scheduler.service.ts` untouched.

## §0 Why (CERTAIN)
- **The owner allowed IMPORTS to create a child with no household *because* piece B makes those children findable.** ⇒ B is the control that replaced the prohibition (Porter).
- The People page lists children **by parent**, so a parentless child is **unlisted**: three families went unseen.
- `GET /students` (`routes/api.ts:46-48`, `searchStudents` at `parent.service.ts:669`) already returns `parentId` per row (`:681`, `:698`), over a LEFT JOIN to parents.
  - **But it cannot ask for "only the parentless ones".** The FE cannot filter them out of a capped page of up to 200 and be complete.

## What to do
1. `studentsQuery` (`validation.ts:83`): add an optional `noParent: "true" | "false"`, using the same enum→boolean transform as `archived`. Absent means today's behaviour, **byte-identical**.
2. `searchStudents`: when `noParent`, add `isNull(students.parentId)` to the where clause.
   - It composes with `archived` (live by default, archived when asked) and with `q`.
   - Pass it through the route the same way the other params are passed.
3. The ordering and the response shape are unchanged.
4. 🚫 **No bulk action, no repair, no new endpoint.** B makes them visible; the owner decides each row.

## Definition of Done
- [ ] Pure tests through drizzle `.toSQL()` (no DB):
  - `noParent=true` adds exactly the `parent_id is null` condition;
  - absent or `false` ⇒ the WHERE is **byte-identical to today's** (pinned);
  - it composes with `archived=true` and with `q`.
- [ ] The validator accepts `noParent=true/false` and an absent value, and rejects junk.
- [ ] Mutation set `src/services/students-no-parent-task663.mutations.json`, with its own test list:
  - the filter ignored (bites);
  - the filter inverted (`isNotNull`) (bites);
  - the default changed to `true` (bites).
- [ ] Full suite with **no reachable database**, plus `tsc --noEmit`. Say that the tree may hold Team A's work.
- [ ] `git status`: only those files. Nothing committed.

## For the QA hand-off
- **API:** `GET /api/students?noParent=true` returns only students with `parentId: null`. On uat that is 21 live rows, per the owner's count of 10-04, less any repaired since.
  - `GET /api/students` with no param is unchanged.

## Implementation Notes
**Bob, 2026-10-05.**

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `src/validation.ts` | `studentsQuery.noParent`: the same `enum(["true","false"]).optional().transform(v => v === "true")` as `archived` |
| `src/services/parent.service.ts` | **new pure `studentListWhere(q, archived, noParent = false)`**: the two conditions `searchStudents` always built, moved unchanged, plus `...(noParent ? [isNull(students.parentId)] : [])`. `searchStudents` gains a 5th param `noParent = false` and calls it. Select, ordering, limit and DTO are untouched. |
| `src/routes/api.ts` | ⚠️ **one route line** (`GET /students`): destructure `noParent`, pass it as the 5th argument |
| `src/services/students-no-parent-task663.test.ts` (new) | 9 tests |
| `src/lib/archive-student-req093.test.ts`, `src/lib/birth-month-req099.test.ts` | ⚠️ 4 pins **re-anchored, none weakened**, see below |
| `src/services/students-no-parent-task663.mutations.json` (new) | the mutation set |

`scheduler.service.ts` is **not touched**.

⚠️ **Outside the TASK's claim line, stated plainly:** `api.ts` and the two test files are not named in the claim (`validation.ts` + `parent.service.ts` + tests).
- The TASK itself directs "pass it through the route", so the route line had to move.
- Its two existing source pins then had to follow:
  - `archive-student-req093:125` and `birth-month-req099:96` read that exact route call: +`, noParent`.
  - `birth-month-req099:105/107` (the spied call's arguments): + the 5th `false`.
  - `archive-student-req093:119` and `birth-month-req099:89` read the `archived` term inside `searchStudents`. That term moved, word for word, into `studentListWhere`. Each pin now asserts **both** that `searchStudents` calls `studentListWhere(q, archived, noParent)` AND the same `archived` text inside `studentListWhere`.
- I checked all three files first: **none had uncommitted work from Team A** (`git status` clean for them). Tell me if you'd rather the claim be widened after the fact or the change be shaped differently.

**Decide and declare:**
- **Why extract `studentListWhere`:** `searchStudents` runs its query, so there is nothing pure to call `.toSQL()` on.
  - The builder holds the identical expressions, and the default is proven byte-identical.
  - The test rebuilds the OLD expression (`and(sql\`true\`, isNull(students.archivedAt))`) and compares the two SQLs, so nothing is pinned against a copy of itself.
- `noParent` is a positional 5th argument, matching how `archived` arrives (3rd). It is not folded into the `birthday` object, which is a different filter.

**Tests (`students-no-parent-task663.test.ts`, 9):**
- **SQL, no DB:**
  - absent ⇒ ` where (true and "students"."archived_at" is null)` with `[]`, and that **equals the old expression's SQL**;
  - `false` ⇒ the same bytes;
  - `true` ⇒ `… and "students"."parent_id" is null`, exactly one more condition;
  - composes with `archived=true` (`is not null … and parent_id is null`) and with `q` (`(name ilike $1 or nickname ilike $2) and … parent_id is null`, params `["%Ari%","%Ari%"]`).
- **Validator:** `true`/`false`/absent ⇒ `true`/`false`/`false`; `yes` · `1` · `TRUE` · `""` ⇒ refused.
- **Route** (root app, service spied): `?noParent=true&q=Ari` ⇒ args `["Ari", 50, false, …, true]`; no param ⇒ 5th `false`.

**Mutation set `students-no-parent-task663`** (`tests` = the task file + `archive-student-req093` + `birth-month-req099`):
```
baseline 39
N1  BITES (36 / 3) — the filter ignored — noParent adds nothing
N2  BITES (36 / 3) — the filter inverted — `parent_id is NOT null`
N3a BITES (38 / 1) — the builder's default changed to true
N3b BITES (36 / 3) — the validator's default changed to true (absent ⇒ only the parentless)
N4  BITES (35 / 4) — the route drops the param
CHECKSUM identical
```
- **5 BITES · 0 SURVIVED · 0 NO RESULT.**

**Runs (no reachable database, the SYSTEM-FACTS recipe; `.env` untouched):**
- Full suite: **3974 pass / 0 fail, 3974 tests across 314 files**.
  - The tree also holds **Team A's uncommitted TASK-645 work** (`course-plan.ts`, `scheduler.service.ts`, tests, a mutation set), included in the count.
- `tsc --noEmit` → **exit 0**.
- Re-ran `parent-phone-required-task644` after these edits: still **6 BITES · 0 · 0**.
- Nothing committed.

## Questions

## Review
**Silver, 2026-10-05 — ✅ DONE.**
- **Diff read:**
  - `noParent` in `studentsQuery` (the same transform as `archived`).
  - The pure `studentListWhere`, which holds the two existing conditions moved unchanged, plus `isNull(parent_id)` only when asked.
  - `searchStudents` gets a 5th param, default `false`.
  - One route line in `api.ts`.
  - Select, order, limit and DTO are untouched, and `scheduler.service.ts` is not touched.
- **Default byte-identical:** proven against a rebuilt copy of the OLD expression, not against itself. That is the right way to pin it.
- **The 4 re-anchored pins are STRONGER, not weaker:** each now asserts both the call (`studentListWhere(q, archived, noParent)`) and the moved `archived` text inside the builder. I read every changed line.
- ⚠️ **The files outside the claim line (`api.ts` + two test files) are accepted, and the omission is mine.** My TASK said "pass it through the route" but listed only `validation.ts` + `parent.service.ts`. `api.ts`'s diff is your one line only, with no Team A edits in it. Reported to Porter.
- **Re-run by me, with no reachable database:** task663 + archive-student-req093 + birth-month-req099 + task644 + parent.service → **99 / 0**; `tsc` exit 0.
  - ⚠️ The tree also holds Team A's uncommitted TASK-645 work.
- **Mutation set:** 5 BITES / 0 / 0. N3a and N3b separate the builder default from the validator default; that is a good split.
