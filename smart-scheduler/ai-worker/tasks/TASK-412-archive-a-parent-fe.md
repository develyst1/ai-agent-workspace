# TASK-412 — Archive a PARENT, FE: the `Archive` / `Restore` doors on the parent detail, the parents' restore view on People, the archived badge (`REQ-098`, `SPEC-084`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size S.** Builds against TASK-411's contract once CONFIRMED (I paste the final lines into §0). ⏳ Pure parts now. `sid`; joins the batch.

## §0 The contract — CONFIRMED 2026-09-19 (TASK-411)
`POST /api/parents/:id/archive` (key `action:people.parent-archive`, 56th — ONE key for both doors) ⇒ `{ parent, archivedStudents: n, clearedLineAccounts: n }` | `409 PARENT_HAS_SESSIONS` (the count in the sentence) · `POST /api/parents/:id/unarchive` ⇒ `{ parent, restoredStudents: n }` (the LINE link is NOT restored — say so in the restore confirm) · `GET /api/parents?archived=1` = only the archived (with their `archivedStudents`) · `GET /api/parents/:id` ⇒ 404 when archived unless `?archived=1` · the DTO carries `archivedAt`, `archivedBy` · `409 PARENT_ARCHIVED` on: create a parent with an archived parent's phone, suspend, edit, add a student, clear the LINE link of an archived parent — show the server's sentence (it says "restore instead"). The success notice can name the counts from the response.

## §1
- **Parent detail:** a red `Archive` door (by the 56th key; the students' archive door's shape) with a confirm that says the students go with it and the LINE link is cleared; the `409` sentence shown as the server's. An archived parent's page shows the badge + `Restore` (same key) — restore says the LINE link is NOT restored (the family re-links).
- **People page:** the `Show archived` toggle REQ-093 gave the students now also lists archived parents (one toggle, two lists — no second control); the archived badge on the row.
- Snapshot 55 → 56 with the reason. Copy both languages, counted. 🚫 No client rules (the count and the refusals are the server's).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (the two calls; the toggle drives both lists; the door by key) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **Archive / Restore a FAMILY on the People page (the 56th key), the archived families under the SAME `Show archived` toggle, the badge.**

```
bunx tsc --noEmit → exit 0
bun test          →  485 pass / 0 fail   (was 480; +5 — new lib/people/archive-parent.test.ts)
bun run build     → ok
git status        →  7 source modified (PeopleContent · usePeople · people.service + mock · people types · actions.ts · dictionaries) · 7 tests re-pinned (55 → 56) · 2 new (lib/people/parent-archive.ts · its test)
```
Built to §0 + @Jason's final lines in TASK-411 (2554/0, 47 = 47). **Snapshot 55 → 56** — `people.parent-archive` right
after `people.student-archive`, the BE's slot (read in `lib/permissions.ts`, asserted by position). 🚫 No deploy asked.

### 📌 One reading of §1
"Parent detail" — the People page has no separate parent page; the family CARD is the detail (edit · add a student ·
LINE link · suspend live on it). The doors sit there.

### `§1` — what was built
- **Pure (`lib/people/parent-archive.ts`):** `archivedParentsQuery(q)` — the restore view's query = the SAME search
  as the working list + `archived: 1`, no offset (the archived are few; one pager, not two; mutations 1, 2). Nothing
  else: nothing on the FE decides who is archived — the server's two lists do (the TASK-393 walk pin, "no `archivedAt`
  on the page", still holds; mutation 7 — filtering by the flag — fails).
- **Wire:** `archiveParent(id)` ⇒ `POST /parents/:id/archive` ⇒ `{ parent, archivedStudents, clearedLineAccounts }`;
  `unarchiveParent(id)` ⇒ `POST /parents/:id/unarchive` ⇒ `{ parent, restoredStudents }` (mutation 9); `ParentsQuery.archived?: 1`;
  `Parent.archivedAt / archivedBy` (optional — an older payload). Hooks `useArchiveParent` / `useUnarchiveParent`
  re-read `PARENTS_KEY` (both lists share it; mutation 10); `useArchivedParents(query, enabled)` — fetched ONLY while
  the toggle is on (mutation 3). Mocks follow (the mock list splits by the flag, the mock archive cascades).
- **The family card:** a red **Archive** icon after Suspend (the students' door's shape; `can("action:people.parent-archive")`,
  hidden not disabled — mutation 5) ⇒ the confirm: *"every student is archived with the parent and their LINE link
  is cleared … a family with sessions ahead cannot be archived — the server will say how many"* (asserted words, both
  languages) ⇒ ONE call; the toast: *"{name} archived — {n} students with them, {line} LINE link(s) cleared"* from the
  server's counts (mutation 8 — a count of my own — fails); a `409` (`PARENT_HAS_SESSIONS` with its number,
  `PARENT_ARCHIVED` "restore instead") is the server's sentence IN the dialog, the dialog stays.
- **ONE toggle, two lists:** `Show archived` (REQ-093's switch, asserted to be the only one) now also renders
  **Archived families (n)** under the working page: dimmed cards, the archived badge, phone, *"{n} students: names"*
  from the server's `archivedStudents`, and **Restore** (the same key; mutation 6 — the students' key — fails) ⇒ the
  confirm: *"The parent and their students come back … The LINE link is NOT restored — the family links again through
  the register page."* (mutation 12) ⇒ ONE call; the toast names `restoredStudents`. The children's archived block
  from REQ-093 is untouched (asserted line). Section hidden with the toggle (mutation 4).
- **Copy:** `people` +11, both languages, counted.

### 🔑 Break-and-watch — twelve, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the restore query forgets `archived` | **1 fail** |
| 2 | the restore query drops the search | **1 fail** |
| 3 | the archived list fetches with the toggle off | **1 fail** |
| 4 | the archived section ignores the toggle | **1 fail** |
| 5 | the archive door ignores the key | **2 fail** |
| 6 | the restore door uses the students' key | **2 fail** |
| 7 | the page decides who is archived by the flag | **2 fail** |
| 8 | the archive toast invents a count | **1 fail** |
| 9 | the restore posts to `/archive` | **1 fail** |
| 10 | the archive hook forgets to re-read | **1 fail** |
| 11 | the 56th key lands before `student-archive` | **1 fail** |
| 12 | the restore confirm stops saying the LINE link stays cleared | **1 fail** |
None slipped; `md5` identical on the six mutated files. Pins moved with the reason: the snapshot 55 → 56 in seven
tests, the sweep 87 → 89 (the two doors).

### Definition of Done
- [x] **485 / 0** · `tsc` 0 · build ok
- [x] Shapes asserted: the two calls and their response shapes · the toggle drives both lists (fetch only while on, one switch) · the doors by the 56th key, hidden not disabled · the confirm words both ways
- [x] Copy counted, both languages · 56 = 56 by position
- [x] 🔑 Break-and-watch — twelve, `finally`, checksum

### ⚠️ Not seen on a screen
The red icon among four compact buttons on a narrow card (it wraps — the group already does); the dimmed archived
card under the pager. For @Tanya on `sid` (after `db:migrate` ⇒ 47): a family with a session ahead ⇒ Archive ⇒ the
server's sentence with the count, dialog stays; a family without ⇒ *"{name} archived — 2 students with them, 1 LINE
link(s) cleared"*, the card gone from the list and from every picker; toggle `Show archived` ⇒ *Archived families (1)*
with the two children's names; search by the archived family's phone ⇒ still listed only under the toggle; `Add
parent` with that phone ⇒ the server's "restore instead" sentence; Restore ⇒ *"… 2 students with them"*, the LINE
button absent on the card (the link is not back); the register page with that phone while archived ⇒ "contact the shop".
