# TASK-415 — People birthday filter, FE: a `Birthday` control beside the People filters + the student result list (`REQ-099`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-20) · **Size S.** Against TASK-414's §1 (final unless Jason says otherwise — I will tell you). Pure parts now; wire after his report. `sid`.

## §0 The contract
`GET /api/students?birthMonthFrom=1..12&birthMonthTo=1..12` (both) **or** `?noDob=true` (never both) + the existing `q` / `limit` ⇒ rows now carry `birthDate: "YYYY-MM-DD" | null`; ordered by month/day within a range (wrap-around handled server-side), by name otherwise. Suspended households and archived children are excluded server-side — nothing to filter here.

## §1
- **The control** in the People filter row beside search + `Show archived`: a `Birthday` popover — month range (from/to, month names, both languages; a wrap like Nov → Feb allowed — the server orders it) and a `No DOB recorded` switch that greys the range (the two are exclusive — mirror the server's rule, the server still decides); `Clear`.
- **The result list** when the control is set: the families view is replaced by a student list — name · nickname · DOB as `DD-MM-YYYY` or `—` · the family's phone; a count line *"n students"*; empty ⇒ *"No students match"*. The list is the server's order — no client sort. Turning the control off returns to the families view.
- The body/query builder is pure and value-tested (`birthdayQuery(state)` ⇒ the two params or `noDob`, never both, the search `q` carried). 🚫 No client filtering by month or null (mutation: a client-side month filter must fail).
- Copy both languages, counted. Snapshot unchanged (no key).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (the query builder; the exclusivity; the list renders `birthDate` or `—`; the families view returns when cleared) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-20. **The `Birthday` control beside the People filters (a month range OR `No DOB recorded`), the server's student list while it is set, the families back on clear.**

```
bunx tsc --noEmit → exit 0
bun test          →  491 pass / 0 fail   (was 485; +6 — new lib/people/birthday-filter.test.ts)
bun run build     → ok
git status        →  5 source modified (PeopleContent · student.service · useStudents · contract.ts · dictionaries) · 3 new (lib/people/birthday-filter.ts · People/BirthdayFilter.tsx · the test)
```
Built to §0 — Jason's final lines in TASK-414 add nothing. **Snapshot unchanged (56, no key — asserted).** 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/people/birthday-filter.ts`), value-tested:** `birthdayActive` — set only when the switch is on or BOTH
  months are picked (a half range is not a query; mutation 2); `birthdayQuery(state, q)` ⇒ `{ birthMonthFrom,
  birthMonthTo, limit: 200 }` or `{ noDob: "true", limit: 200 }` (the boolean-string on the wire; mutation 3) —
  **never both** (the switch wins; mutation 1), `q` trimmed and carried (mutation 4), `null` while unset;
  `formatDob` ⇒ `DD-MM-YYYY` (REQ-099's shape, not the tables' `DD/MMM/YY`) or `—` (mutation 5).
- **The control (`People/BirthdayFilter.tsx`):** a `Birthday` button beside search + `Show archived` ⇒ a popover:
  `From` / `To` month names in the current language (`toLocaleDateString`, `th-TH` / `en-GB`; a wrap like Nov → Feb
  allowed — the server orders it), the `No DOB recorded` switch that greys BOTH selects (mutation 10), a hint line;
  `Clear` beside the button while set (mutation 11). The button reads what is set — rendered: `Birthday` / `Nov →
  Feb` / `No DOB recorded`.
- **The list:** while set, the families view is REPLACED (mutation 8 — the list always winning — fails; the skeleton /
  families branch is the else) by the server's student list from **the SAME `GET /students`** with the built params
  (`listStudentsByBirthday`; fetched only while set — mutation 9): name · (nickname) · DOB or `—` · the family's
  phone; *"n students"*; *"No students match"*. **The server's order and set:** the list region has no `.sort` /
  `.filter`, the page no month arithmetic and no `birthDate === null` of its own (mutations 6, 7). The same search
  `q` composes. Suspended / archived exclusions are the server's — nothing here.
- `StudentListItem.birthDate?: string | null` (optional — an older payload). Copy `people` +8, both languages.

### 🔑 Break-and-watch — eleven, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `noDob` and a range ride together | **1 fail** |
| 2 | a half range counts as set | **1 fail** |
| 3 | `noDob` as a real boolean | **1 fail** |
| 4 | the search is dropped | **1 fail** |
| 5 | the DOB reads ISO | **1 fail** |
| 6 | the page filters by month itself | **1 fail** |
| 7 | the page sorts the list | **1 fail** |
| 8 | the families never come back | **2 fail** |
| 9 | the fetch fires while unset | **1 fail** |
| 10 | the range stays live under the switch | **1 fail** (📌 slipped first — the pin saw one `disabled={value.noDob}` and the other select stayed live; now BOTH selects are counted) |
| 11 | `Clear` sets nothing | **1 fail** |
`md5` identical on the four mutated files. No pins moved elsewhere.

### Definition of Done
- [x] **491 / 0** · `tsc` 0 · build ok
- [x] Shapes asserted: the query builder by value · the exclusivity · the list renders `birthDate` or `—` · the families return when cleared · no client month/null filtering (a client month filter fails)
- [x] Copy counted, both languages · snapshot unchanged
- [x] 🔑 Break-and-watch — eleven, `finally`, checksum

### ⚠️ Not seen on a screen
The three controls (Birthday · Show archived · Add parent) wrapping on a phone; the popover's two selects side by side
at 280 px. For @Tanya on `sid`: Birthday ⇒ From Nov, To Feb ⇒ the button reads `Nov → Feb`, the families are
replaced by the students born Nov–Feb in the server's order (Nov first, then Dec, Jan, Feb, by day), each with
`DD-MM-YYYY`; a search term narrows the same list; tick `No DOB recorded` ⇒ the selects grey, the list becomes the
students with `—`; `Clear` ⇒ the families are back with the pager; a suspended family's child never appears.
