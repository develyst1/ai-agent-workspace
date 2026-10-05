# TASK-668 — link a parent to a child that has none (BE) — BE, S
- Source: owner "ให้ประเมินเรื่องผูกผู้ปกครองเลย" → sized in `SIZING-link-a-parent-teamB-2026-10-06.md` · Porter's plan (Wed–Thu)
- Status: REVIEW (Bob, 2026-10-06) — ▶️ **GO (Porter, 2026-10-06): claims granted and the key reuse decided (his call: YES, `people.parent-students`).**
  - 🔴 **`routes/api.ts` is a shared spine: ONE line, for `POST /students/:id/parent`, and nothing else in that file.** If the work wants a second line, STOP and tell me.
  - 🔴 **`scheduler.service.ts` is Team A's all week** (Jason is rewriting it for REQ-112). Nothing of this TASK enters it.
  - Wording: build against `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C (DRAFT). Swap in the approved words when they land.
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-06)
- 🔴 **Ships ONLY with its FE, TASK-669.** It must not go to sid alone, because nobody could reach it.
- **Claim:**
  - `src/services/parent.service.ts` ✅ · `src/validation.ts` ✅;
  - ✅ `src/routes/api.ts` (one route line) · ✅ `src/lib/route-access.ts` (map the new route to `people.parent-students`);
  - any test that pins `parent_id` writers or route counts: **name it before editing**.
  - If you need anything else, STOP and tell me.

## §0 The act, and the one thing it must never become
- **"Set a household on a child that has none."** It is **not** a field on the student edit (its six-field allow-list stays as it is).
- 🔴 **It must only ever go from NO parent to one, and that is enforced IN THE WRITE:**
  `UPDATE students SET parent_id = $parent WHERE id = $student AND parent_id IS NULL RETURNING id`. **Zero rows ⇒ 409 `STUDENT_ALREADY_HAS_PARENT`.**
  - The database decides in the same statement. There is no read-then-write gap, and it takes **no "from" parameter.**

## What to do
1. A route, e.g. `POST /students/:id/parent { parentId }`, gated by the **existing** key `action:people.parent-students` ("ผูกนักเรียนกับผู้ปกครอง"). No new key.
2. A service function in `parent.service.ts`, **reusing, not copying:**
   - **`assertParentActive`** (an archived family is refused);
   - **`assertCanAddStudent`** (the 5-per-family cap, because linking a 6th child is adding one).
   - **Order:** 404 if the student or parent is missing ⇒ the archived-family refusal ⇒ the cap ⇒ the conditional write ⇒ 409 if zero rows.
3. **The read the confirm needs** (TASK-669 shows the family's children **and** the child's upcoming sessions). **Decide and declare:** either a small `GET` preview, or the FE composing existing reads.
   - "Upcoming" = the archive rule's set (`ARCHIVE_BLOCKING_STATUSES`, today or later), so the confirm and the archive refusal agree.
4. **The refusal sentence** for the 409 is in `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C, shipped `📋 DRAFT wording`. The cap and archived refusals reuse their existing sentences.
5. **The link sends NO notice by itself** (no outbox row). State it in a comment and pin it.

## Definition of Done
- [ ] Tests by value (no DB, real condition, like TASK-667):
  - parentless ⇒ linked;
  - **already has a parent ⇒ 409, and the row is unchanged**;
  - an archived family ⇒ refused;
  - a family at 5 children ⇒ refused with the cap sentence;
  - a missing student or parent ⇒ 404;
  - no outbox row written.
- [ ] 🔴 **A writer sweep:** a source pin that `parentId` / `parent_id` is written only by creation, the import exemption, and this act. A future "move a child" must break it in plain sight.
- [ ] Mutation set (`tests` listed):
  - `AND parent_id IS NULL` dropped (bites);
  - the cap skipped (bites);
  - the archived guard skipped (bites);
  - the route's key changed (bites).
- [ ] The full suite with **no reachable database**, plus `tsc`. State Team A's work in the tree. Nothing committed.

## QA hand-off
- **API:** `POST /api/students/{parentless id}/parent { parentId }` ⇒ linked, and the child leaves `?noParent=true`.
  - The same on a child **with** a parent ⇒ **409**, unchanged.
  - An archived family ⇒ refused.
  - A family with 5 ⇒ refused.

## Implementation Notes
**Bob, 2026-10-06.**

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `src/services/parent.service.ts` | `linkParentToStudent(studentId, parentId, { dryRun }, exec = db)` and `STUDENT_ALREADY_HAS_PARENT()` (DRAFT wording from §C), beside `createStudentForParent` |
| `src/validation.ts` | `linkStudentParent = { parentId: uuid, dryRun?: boolean }` (the student is the PATH id; the body has no "from") |
| `src/routes/api.ts` | ✅ **ONE route line**: `POST /students/:id/parent`. The diff is exactly `+1`. |
| `src/lib/route-access.ts` | ✅ the route mapped to the **existing** `action:people.parent-students` (identical to `POST /parents/:id/students`; no new key) |
| `src/services/course-ended-writes.test.ts` | ⚠️ **one named pin, +2 lines**: see below |
| `src/services/link-parent-task668.test.ts` (new) | 23 tests |
| `src/services/link-parent-task668.mutations.json` (new) | the mutation set |

`scheduler.service.ts` is **not touched**.

⚠️ **The one pin outside the file list, named in §Questions before I edited it (as the claim asks):** `course-ended-writes.test.ts` is the write-route census (TASK-185), *"no write route is unclassified — a new one fails here by omission"*. The new route made it the suite's only failure.
- The edit is **one new `VERDICT` line**, `"POST /students/:id/parent": "unrelated"`, plus a comment. It sits beside the archive routes, which have the same verdict: the act writes `students.parent_id` only.
- No existing line or assertion changed. The file was clean of Team A work.

**The act (as §0):**
- `UPDATE students SET parent_id = $p WHERE id = $s AND parent_id IS NULL RETURNING id`. **Zero rows ⇒ `409 STUDENT_ALREADY_HAS_PARENT`.** The database decides in the same statement; the act takes no "from".
- **Order, pinned by value:** 404 student ⇒ 404 parent ⇒ archived-family refusal (`assertParentActive`, reused) ⇒ the cap (`assertCanAddStudent`, reused) ⇒ the conditional write ⇒ 409.
  - Consequence worth knowing: a child that already has a parent, linked to a **full** family, gets the **cap** sentence, not the 409. The write is last by design.
- **It sends no notice:** no outbox row, no admin alert. Pinned twice: by value (the fake executor's `insert` throws, and it was never called), and by source (the function mentions no `enqueueLine` / `notifyAdmins` / outbox).

**Decide and declare — the confirm's read (§3).** I chose **`dryRun: true` on the same route**, not a GET and not the FE composing reads. Reasons:
1. **`api.ts` allows ONE line.** A separate GET preview would be a second route line, which you told me to stop on.
2. The confirm must **agree with the archive refusal** about "upcoming". The server reads `ARCHIVE_BLOCKING_STATUSES` itself, so Fanta can't drift.
3. Preview and act are one function with the same guards, so they can't diverge. The repo's precedent is `applyPlanChange(…, { dryRun })`.
- The dry run does **not** write, pinned by value (no update, and the row unchanged).

**🔑 Contract for Fanta (TASK-669)** — `POST /api/students/{studentId}/parent`, key `action:people.parent-students`:
```
# the CONFIRM's read — { "parentId": "<uuid>", "dryRun": true }  ⇒ 200
{ "dryRun": true,
  "parent":   { "id": "<uuid>", "name": "Mom", "phone": "0812345678" },
  "children": [ { "id": "…", "name": "Ari", "nickname": "Ari" }, { "id": "…", "name": "Bee", "nickname": null } ],
  "upcoming": { "count": 3, "next": "2026-10-09" } }      # count 0 ⇒ "next": null; no children ⇒ []

# the LINK — { "parentId": "<uuid>" }  ⇒ 200
{ "dryRun": false, "linked": true, "studentId": "…", "parentId": "…", "familyCount": 3 }
```
- **Refusals** (both modes): `404 NOT_FOUND` ("ไม่พบนักเรียน" / "ไม่พบผู้ปกครอง") · `409 PARENT_ARCHIVED` · `400 VALIDATION` with the cap sentence ("เพิ่มนักเรียนได้สูงสุด 5 คนต่อเบอร์") · `409 STUDENT_ALREADY_HAS_PARENT`.
- ⚠️ **As in TASK-644, these refusals are `ApiException`s, not zod refusals.** `app.onError` maps them, so `error.message` carries the specific sentence (unlike the validator's generic line). A bad body (no/junk `parentId`, a non-uuid path id, `dryRun: "yes"`) is `400 VALIDATION` with the generic message and the issues in `details`.
- The dry run is **advisory** for "already has a parent": it throws the same 409 early, but the real write stays the authority.

**Tests (`link-parent-task668.test.ts`, 23)** — by value, no database. `linkParentToStudent` takes its executor, so a fake executor answers the reads and **evaluates the REAL built conditions** (read back through `.toSQL()`):
- the act: parentless ⇒ linked, **one** update setting only `parentId`, with the literal `where ("students"."id" = $1 and "students"."parent_id" is null)`; **already has a parent ⇒ 409 and the row UNCHANGED** (the write was attempted and matched zero rows); archived ⇒ refused; 5 ⇒ cap sentence (and 4 ⇒ the 5th succeeds); a missing student or parent ⇒ 404; the order; no notice.
- dryRun: family + children + upcoming count/next; **for every status of `bookingStatus.enumValues`, a future row counts iff it is in `ARCHIVE_BLOCKING_STATUSES`**; a past row never counts, today does, a DUO co-student row counts; the same refusals; no write.
- route/key through the root app: same key as `POST /parents/:id/students`; with the key ⇒ 200 and the service gets `(path id, parentId, { dryRun })`; **without the key ⇒ 403**; a linked teacher account ⇒ 403 `SCOPE_TEACHER`; no/junk `parentId`, non-uuid path id, `dryRun: "yes"` ⇒ 400; a stray `fromParentId` / `studentId` in the body is ignored and never passed.

**🔴 The writer sweep (DoD):** `writers()` derives, from every non-test `.ts` under `src/`, each `.insert(students)` / `.update(students)` statement whose **written part** (`.set(…)` / `.values(…)`) names `parentId`. It must be exactly:
```
db/seed.ts insert · services/parent.service.ts insert (createStudentForParent) · services/parent.service.ts update (THIS act)
services/scheduler.service.ts insert (resolveStudentId — the inline new student; the import exemption)
```
- Also pinned: that one `update` is this act's, with its guard in the same statement; the student **edit**'s six-field allow-list has no `parentId`; no raw SQL assigns `parent_id`; and the sweep sees ≥ 100 files, so it can't go quietly vacuous.
- 📌 I first matched any `parentId` in the statement and it flagged the parent-restore cascade, whose **WHERE** names `parentId`. I narrowed it to what is *written*, which is the correct meaning.

**Mutation set `link-parent-task668`** (`tests` = the task file + `course-ended-writes` + `archive-student-req093` + `archive-parent-req098` + `archive-owed-task667`; anchors checked to match exactly once):
```
baseline 108
L1  BITES (104 / 4) — `AND parent_id IS NULL` dropped: a link could MOVE a child
L2  BITES (104 / 4) — the 5-per-family cap skipped
L3  BITES (105 / 3) — the archived-family guard skipped
L4  BITES (106 / 2) — the route's key changed
L5  BITES (102 / 6) — dryRun ignored: the confirm's read WRITES
L6  BITES (104 / 4) — the preview counts the OLD live set (would disagree with the archive refusal)
L7  BITES (105 / 3) — a SECOND write after the link (what a notice would look like)
L8  BITES (107 / 1) — the missing-parent 404 removed
L9  BITES (107 / 1) — the student EDIT's allow-list gains `parentId`
L10 BITES (106 / 2) — a NEW writer: the archive write also clears `parentId` (a future "unlink")
L11 BITES (107 / 1) — the route drops `dryRun`
CHECKSUM identical
```
- **11 BITES · 0 SURVIVED · 0 NO RESULT.** The DoD's four are L1–L4; L9/L10 are the sweep proving itself.

**Runs (no reachable database; `.env` untouched):**
- Full suite: **4053 pass / 0 fail across 317 files.**
  - The tree also holds **Team A's uncommitted work**: `scheduler.service.ts`, `line-webhook.service.ts`, the migration-ledger scripts and tests, `every-leave-adds-a-week-task656.test.ts`, several test edits and mutation sets. It is included in the count, and nothing failed.
  - It also holds **my own earlier uncommitted TASK-666/667 work**.
- `tsc --noEmit` → **exit 0**.
- `git status` (mine, this TASK): `parent.service.ts`, `validation.ts`, `route-access.ts`, `api.ts` (+1 line), `course-ended-writes.test.ts` (+2), and the new test + mutation set. Nothing committed.

**Known limits, stated, not changed:**
- **The cap is read-then-write** (`assertCanAddStudent` counts, then the write). Two links to the same family at the same instant could both pass and make 6. `createStudentForParent` has exactly the same gap today. Tell me if you want it closed for both together.
- The act does not check whether the **student** is archived. The TASK doesn't ask, and an archived child still has the same missing household; I didn't invent a rule.
- 🔴 **Ships ONLY with TASK-669**, as the TASK says. Nothing here enforces that.
## Questions
- **Named before editing (Bob, 2026-10-06), as the claim asks — one pin, no question:** `src/services/course-ended-writes.test.ts` is the write-route census (TASK-185): *"no write route is unclassified — a new one fails here by omission"*. The new `POST /students/:id/parent` made it red (the only failure in the suite). It is clean of Team A work.
  - **The edit: ONE new line in its `VERDICT` table, `"POST /students/:id/parent": "unrelated"`**, beside `POST /students/:id/archive` / `/unarchive`, with a comment. That is the census working as designed. No existing line or assertion changes.
  - Why `"unrelated"`: the act writes `students.parent_id` only; no booking, course or voucher row moves (the same verdict as `POST /parents/:id/students` and the archive routes).

## Review
