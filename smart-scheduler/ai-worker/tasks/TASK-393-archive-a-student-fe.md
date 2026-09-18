# TASK-393 — Archive a student (`REQ-093`), FE: the red `Archive` beside Delete, archived students out of the working views, a light "show archived" filter with one-tap Restore

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (proposed to @Jason, TASK-392; confirmation via me):** `POST /students/:id/archive` / `…/unarchive` ⇒ `{ student }`, key `action:people.student-archive` (48th); `409 STUDENT_HAS_LIVE_SESSIONS` with a count; `StudentDTO.archivedAt`; the working reads no longer return archived students; a list read with `archived=true` returns them.
**Size S.** Ships with TASK-392.

## §1
- People page: a red **Archive** icon beside the existing trash (two taps; the dialog says history and money stay; the `409` sentence in the dialog), gated by `can()`; a **`Show archived`** toggle (remembered like the calendar's toggles) lists archived children dimmed with a one-tap **Restore**.
- Pickers and the calendar need NO change — the server filters; assert no client-side `archivedAt` filter exists on them.
- Keys counted, both languages.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-18. **The red Archive beside Delete (two taps; history and money stay; the 409 count in the dialog), a remembered `Show archived` with one-tap Restore — by the 48th key; pickers and the calendar untouched (walk-pinned).**

```
bunx tsc --noEmit → exit 0
bun test          →  429 pass / 0 fail   (+5 — new lib/people/archive-student.test.ts)
bun run build     → ok
git status        →  this task: types/app/people/index.ts · services/people.{service,mock.service}.ts · hooks/scheduler/usePeople.ts ·
                     lib/scheduler/cancelled-tray.ts (one `export`) · People/PeopleContent.tsx · lib/rbac/actions.ts · dictionaries.ts ·
                     NEW lib/people/show-archived.ts + the test
```
Built against @Jason's CONFIRMED contract (TASK-392, 2420/0).

- **Archive — two taps:** a red `Archive` icon beside the trash on every working row (before Delete, each under its
  own key: `can("action:people.student-archive")`; mutation 2 fails four tests) ⇒ a dialog whose words say *"History
  and money stay exactly as they are … A student with sessions ahead cannot be archived — the server will say how
  many."* (both languages, pinned) ⇒ its red confirm ⇒ **`POST /students/:id/archive {}`** (mutation 1 — one tap —
  fails). 🔴 The `409 STUDENT_HAS_LIVE_SESSIONS` sentence (the count) lands in the dialog unchanged; no client rule
  before the call (asserted; mutation 3 fails).
- **`Show archived`** — a `Switch` in the page header, remembered per browser through the calendar's own `boolStore`
  (`ss.showArchivedStudents`, default OFF; the one change to `cancelled-tray.ts` is the `export`). ON ⇒ each family's
  **`archivedStudents`** (the same read, split by the server — no second call; asserted: nothing on the page fetches
  with `archived`) render dimmed + struck with an *archived* badge and a one-tap green **Restore** ⇒
  **`POST /students/:id/unarchive {}`** (no confirm — it only gives back; mutation 4 fails); a `409` on the family's
  cap is the server's sentence as a notice. Both hooks re-read `PARENTS_KEY` (the child moves between the two lists).
- **Pickers and the calendar untouched:** a walk of `src` pins that `archivedAt` / `archivedStudents` appear NOWHERE
  outside the People page, its types and its service (mutation 7 — a filter on `EligibleStudentSelect` — fails); even
  on the page `archivedAt` never decides anything — the working list is `p.students`, the archived list
  `p.archivedStudents`, never one filtered from the other (mutation 6 fails). The server filters.
- Types: `Student.archivedAt?`, `Parent.archivedStudents?` (optional — an older payload still renders). Copy:
  `people.*` +9 ×2. The 48th key in the snapshot (the BE's name; 48 = 48 by script).

### 🔑 Break-and-watch — nine mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | archive on one tap | **1 fail** |
| 2 | the archive icon ignores the key | **4 fail** |
| 3 | a client rule before the call | **1 fail** |
| 4 | restore grows a confirm | **1 fail** |
| 5 | the toggle's default flips | **1 fail** |
| 6 | the archived list filtered client-side from the working one | **1 fail** |
| 7 | a picker grows a client-side `archivedAt` filter | **1 fail** |
| 8 | the archive route path wrong | **1 fail** |
| 9 | the snapshot loses the 48th key | **2 fail** |
`md5` identical on all five files (incl. the untouched picker). TASK-365's "no condition on the student" pin now strips
the archive block between Edit and Delete as well as the user's own grant — named in its file.

### ⚠️ Not seen on a screen
For @Tanya on `sid`: archive a child with a session ahead ⇒ the count sentence in the dialog, still there; cancel the
session, archive ⇒ gone from the row, from the booking form's picker and the calendar's eligible list without any FE
change (the server's filter); `Show archived` ⇒ the child struck through with *archived*, Restore ⇒ back; reload ⇒ the
switch remembers; booking for an archived id from an old tab ⇒ the server's `STUDENT_ARCHIVED` sentence.
