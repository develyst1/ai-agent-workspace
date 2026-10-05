# TASK-665 — per-row ARCHIVE (and its RESTORE) on the "no parent linked" list — FE, S
- Source: owner "ใส่ปุ่ม archive เลย" (Porter, 2026-10-06) · `ANSWER-no-parent-list-on-uat-2026-10-06.md` §3 · builds on TASK-664
- Status: DONE (reviewed by Silver, 2026-10-06) · 🔴 ships ONLY with TASK-667
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-06)
- Claim: `src/components/partials/People/*` (Team B's) · co-located tests. 🚫 **No back-end change** (see §0). If you find you need a file outside `People/*`, **STOP and tell me.**

## §0 Why, and what the server ALREADY guarantees (CERTAIN, read by me)
- On uat the list shows 18 rows: **13 class or school titles** the customer's team created as students, and **5 nicknames.** The data cannot tell them apart. ⇒ The owner hands the clean-up to the only people who know which rows are not children: **one row at a time.**
- 🔑 **Why this does NOT contradict the owner's judgement #3 (Porter, written so nobody reopens it):** #3 forbade a button that **promises what the product cannot do** (setting a parent). Archive is something the product **can** do. **#3 stands for any "link a parent" control.**
- **`POST /students/:id/archive` (`archiveStudent`, back `parent.service.ts`) already refuses a student with LIVE sessions ahead.** It counts future rows in `PENDING · CONFIRMED · EXTENDED` (`liveFutureSessionCount`) and answers **409 `STUDENT_HAS_LIVE_SESSIONS`** with *"มีคาบเรียนข้างหน้า {n} คาบ — ยกเลิก/ย้ายก่อน"*.
  - ⇒ **A row with live bookings can never be archived silently.** The server says no and says how many.
  - It is idempotent.
- `POST /students/:id/unarchive` restores. For a record with **no parent** it skips the household checks (they apply only `if (row.parentId)`), so a parentless record restores cleanly.
- 🔴 **The gap this TASK must close:** today an archived child is restored **from inside its parent's card** under "Show archived" (`PeopleContent.tsx:200`, `:514`). **A parentless record has no card**, so once archived, **no screen could bring it back.**
  - The approved confirm body promises *"you can restore them any time"* (`people.archiveStudentBody`).
  - ⇒ **Archive ships WITH a way to restore, or that sentence becomes untrue.**

## What to do
1. **Archive, per row:** each row in `NoParentList` gets the existing **`people.archiveStudent`** action. It reuses **the same handler and confirm** as the family list's student archive:
   - title `people.archiveStudentTitle` with **the row's own name**;
   - body `people.archiveStudentBody`, which already says it is reversible and that sessions-ahead are refused;
   - confirm `people.archiveStudentConfirm`;
   - the existing success notice.
   - On `409 STUDENT_HAS_LIVE_SESSIONS`, show the server's sentence (the existing error path). Nothing is archived.
2. **Restore, so it is really reversible:** with the page's **"Show archived"** on, the no-parent view **also lists the ARCHIVED parentless records** (`GET /students?noParent=true&archived=true`; TASK-663 composes these). Each is marked archived the way the page already marks archived students, with the existing **`people.restore`** and **`people.restoredOk`**.
   - **The count beside the switch stays the LIVE count**, so it still equals `GET /students?noParent=true` (TEST-078's reconciliation holds).
3. 🔴 **ARCHIVE ONLY:**
   - 🚫 no delete;
   - 🚫 no bulk, no select-all, no "archive all titles";
   - 🚫 no action decided by the row's name.
   - *A bulk action over a list we just proved we cannot classify is how a real child gets archived.*
4. **Update the `🔒 OWNER'S JUDGEMENT` comment at the rows:** "no LINK-a-parent action (#3 stands); per-row archive approved 2026-10-06 because the product can do it."
5. **Wording:** reuse the existing keys only. **If you find you need a new sentence, STOP and tell me.** It would be DRAFT and join this round's one copy set.

## Definition of Done
- [ ] **Clicked DOM tests:**
  - archive opens a confirm **naming that row**, and confirming calls `POST /students/{id}/archive` for **that id only**;
  - a `409 STUDENT_HAS_LIVE_SESSIONS` shows the server's sentence and the row stays;
  - after an archive the row leaves the live list and the count drops by 1;
  - with Show archived on, the archived parentless row is listed with Restore, and Restore calls `unarchive` for that id;
  - **there is no bulk, select-all or delete control** (pinned by count).
- [ ] The count still equals the live rows only (pinned).
- [ ] Mutation set `src/components/partials/People/no-parent-archive-task665.mutations.json` (front form). At minimum:
  - archive without confirm (bites);
  - the confirm without the row's name (bites);
  - a bulk "archive all" (bites);
  - archived rows hidden under Show archived (bites, which proves reversibility);
  - the count including archived rows (bites).
- [ ] `bun test`, `tsc --noEmit` and `bun run build`, with counts. 🚫 No click on sid or uat.
- [ ] `git status`: only `People/*` files and their tests and set. Nothing committed.

## For the QA hand-off (routes first)
- **API:**
  - `POST /api/students/{id}/archive` on a parentless record **with a live future session** ⇒ **409 `STUDENT_HAS_LIVE_SESSIONS`**, and nothing archived.
  - On one **without** a live session ⇒ archived.
  - `GET /api/students?noParent=true&archived=true` lists it.
  - `POST …/unarchive` ⇒ it is back in `?noParent=true`.
- **Screen:** People → "นักเรียนที่ยังไม่มีผู้ปกครอง":
  - each row has "เก็บ";
  - the confirm names the row;
  - a title row archives and leaves the list, and the count drops;
  - Show archived ⇒ it appears with "คืนสถานะ", and restore brings it back;
  - there is no bulk control.

## Implementation Notes
**Fanta, 2026-10-06.** Repo `smart-scheduler-front`. The tree was clean at the start (the owner had committed 662/664), so every change is mine. Nothing committed.

**Files (`git status`, all in `People/*`):**
- `M NoParentList.tsx`
  - Each live row gets the family list's **own** archive door: the same `ActionIcon`, `Tooltip` and aria-label `people.archiveStudent`, and `data-no-parent-archive`. Its click is the page's first tap.
  - When given `archivedRows`, it lists them dimmed, with a line-through name, the `people.archivedBadge` badge and a `people.restore` button. That is the family card's archived-child treatment.
  - The `🔒 OWNER'S JUDGEMENT` comment is updated as asked: #3 stands for link-a-parent; per-row archive approved 2026-10-06; one row at a time.
- `M PeopleContent.tsx`
  - `noParentArchivedParams` = the live params + `archived: "true"`, **only while Show archived is on**. It is a second `GET /students` read, so the count beside the switch stays the LIVE rows.
  - `NoParentList` receives `canArchive = can("action:people.student-archive")` (the family list's key), `onArchive` (sets the page's existing `archiveTarget`, so it is **the same confirm modal**) and `onRestore` (the page's existing `runRestore`).
  - `archiveTarget` and `runRestore` are narrowed to `Pick<Student, "id"|"name"|"nickname">`, the only fields they ever read, so a `StudentListItem` fits. The family list's behaviour is unchanged.
  - After a successful archive or restore, the student reads are re-read (`STUDENTS_KEY`), not only `PARENTS_KEY`. That is what makes the row leave the list and the count drop. ⚠️ It also refreshes the birthday list after a family-list archive, which is harmless and correct.
- `M no-parent-filter-task664.dom.test.tsx`: the TASK-664 pin "0 buttons" became "**exactly one archive door per row, and nothing else**" (2 doors = 2 controls). TASK-664's F3 still bites.
- `?? no-parent-archive-task665.dom.test.tsx` (5 clicked tests) · `?? no-parent-archive-task665.mutations.json`.
- **Wording:** existing keys only (`archiveStudent`, `archiveStudentTitle/Body/Confirm`, `archivedOk`, `archivedBadge`, `restore`, `restoredOk`). **No new string.**

**Verification:**
- `bun test src/components/partials/People/no-parent-archive-task665.dom.test.tsx src/components/partials/People/no-parent-filter-task664.dom.test.tsx` → **9 pass / 0 fail**. Read at the wire:
  - the door opens a confirm **naming that row** (and not the other), and the first tap posts nothing. Confirming posts `/students/s-title/archive` **only**. The row leaves, the list goes 2 → 1, and the label reads `(1)`.
  - a `409 STUDENT_HAS_LIVE_SESSIONS` shows the server's sentence in the dialog; nothing is archived and the list stays at 2.
  - the controls are one archive door per row (count pinned), 0 checkboxes, no delete.
  - Show archived on: the archived parentless row is listed with the badge, **while the count stays the live `(2)`**. Restore posts `/students/s-old/unarchive` and the live list becomes 3.
  - Show archived off: no archived rows.
- Set `no-parent-archive-task665`: **6/6 BITES**, checksum identical:
  ```
  BASELINE 9 pass / 0 fail
  A1 archive without the confirm ............. BITES 7/2
  A2 the confirm without the row's name ...... BITES 8/1
  A3 a bulk "archive all" .................... BITES 7/2
  A4 archived rows hidden under Show archived  BITES 8/1   (reversibility)
  A5 the count includes archived rows ........ BITES 8/1
  A6 student reads not refreshed ............. BITES 8/1
  ```
  The TASK-664 set re-run is still **7/7 BITES**.
- `tsc --noEmit` exit 0 · `bun run build` exit 0.
  - ⚠️ Honest note: one earlier build run in this session exited 1 and I did not capture why. The next two runs succeeded with no change in between. I am reporting it, not explaining it away.
- **Full `bun test`: 1003 pass / 2 fail across 112 files.** Both fails are the pins in Q1. Nothing else fails.
  - 📌 **Found and fixed on the way:** my 409 test passed alone but failed in the full run. Another file's `mock.module("@/lib/api/client")` builds `ApiClientError` with a different argument order, so the dialog showed the code. The test now builds the error from the real module by its own specifier (the 10-05 SYSTEM-FACTS recipe).
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
- **Q1 — two COUNT pins outside `People/*` (STOP, as the TASK says).** The new per-row door asks `can("action:people.student-archive")` **as a literal**, the way every gate is asked, so the sweeps can see it. Two pins count those literals and are now short by exactly this door:
  1. `src/lib/people/archive-student.test.ts:55`: `(page.match(/"action:people\.student-archive"/g) ?? []).length).toBe(2)`, commented *"the icon and the Restore, nothing else"*. With the no-parent door it is **3**.
  2. `src/lib/rbac/action-gate.test.ts:69`: `expect(sites.length).toBe(107)` → **108**. Each earlier door appended its own note to that comment (TASK-586, TASK-572 …).
  - **Proposal:** 2 → 3 in the first, with a note naming TASK-665's no-parent door; 107 → 108 in the second, with a TASK-665 note in the same style. **No new key**: the same `people.student-archive` the family list uses.
  - 🚫 **What I did NOT do:** hoist the gate into a variable so the counts happen to stay. That would hide a new door from the sweep that exists to count doors.
  - May I make those two edits?
  > answer (Silver, 2026-10-06): **Correctly stopped, and NOT hoisting the gate was the right call.** Both files are outside the claim, so I have asked @Porter, recommending YES for exactly your two edits: 2→3 and 107→108, each with a TASK-665 note in the file's style. 🚫 Do not edit them until he grants it.
  - **Pre-review (Silver):** I re-ran People/* → 9/0, and `bun run build` → exit 0 (your one unexplained failing build did not recur). The only failures are exactly these two counts (2→3, 107→108). Once granted, this is DONE.

## Review

### Q1 granted — done (Fanta, 2026-10-06)
- **Those two numbers only**, each with a TASK-665 note in the file's style. No other line in either file:
  ```
  src/lib/people/archive-student.test.ts:55   .toBe(2)   → .toBe(3)    + "🔻 TASK-665: + the no-parent list's per-row door (the archived parentless rows restore through the same `runRestore`, so no third Restore literal)"
  src/lib/rbac/action-gate.test.ts:69         .toBe(107) → .toBe(108)  + /* TASK-665: + the no-parent list's per-row archive door, on the EXISTING `people.student-archive` key, asked as a literal */
  ```
- **Re-run:** `tsc --noEmit` exit 0 · **`bun test` 1005 pass / 0 fail across 112 files** · `bun run build` exit 0 · set `no-parent-archive-task665` still 6/6 BITES, checksum identical (no SURVIVED, no NO RESULT).
- `git status`: the 3 `People/*` files, the new test and set, and the two granted pin files. Nothing committed.

- ✅ **Final review (Silver, 2026-10-06):** the two granted pins changed one line each (2→3, 107→108), and every earlier TASK note on the 107/108 line is kept. Re-ran archive-student + action-gate + People/* → 22/0. **TASK-665 is DONE** and pairs with TASK-667.
