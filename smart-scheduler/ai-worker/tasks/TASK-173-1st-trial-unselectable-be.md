
## Implementation Notes
**Files:** `db/mappers.ts` (`toTeacherDTO.subjects`) · `services/scheduler.service.ts` (`updateTeacher`) ·
`db/seed.ts` (hygiene) · `db/mappers.test.ts` (+4).

**1. The filter is one line, in `toTeacherDTO`, not at the two service sites.** Both `getCalendar:388` and
`getTeachers:452` map through `toTeacherDTO`, and the FE's `subjectOptions` **is** `dto.subjects`
(`lib/api/mappers.ts:41`) — so filtering in the mapper is the same fix in one place instead of two that can
drift. Confirmed by grep that no picker has another source: every one of them reads
`selectedTeacher.subjectOptions` (single · course · voucher · trial · plan · import).

**2. `active !== false`, not `active === true`** — a subject row loaded by a query that didn't select `active`
must not silently vanish from every picker in the app. Tested.

**3. 🔴 The thing this task didn't foresee, and I would not ship without.** `TeacherFormModal` seeds its
multi-select from **`subjectOptions`** (`:40`) and PATCHes the resulting list, while `updateTeacher` did
`delete all → insert what was sent`. With the filter in place, **the first time anyone opened and saved any
teacher's record, that teacher would be silently unlinked from `1st Trial`** — a data change nobody asked for,
arriving as a side effect of a display filter, and precisely what AC-5 forbids. `updateTeacher` now keeps links
to subjects the client **could not see** (`active === false`). The principle is worth the four lines: *a client
may only change what it was shown.*

**4. AC-3 read-path audit — done by grep, not assumption.** The only `subject.active` reads in the codebase are:
this picker filter, the new preservation guard, `bulk-link-plan` (already a picker), and
`getSellablePackages` (a sale picker). **No mapper, report, calendar, SOM or plan path consults it**, so a
booking on an inactive subject renders its name unchanged — pinned by a test.

**5. Seed hygiene (the optional item — taken).** `1st Trial` is now seeded **inactive**, and the demo trial
books a real activity. A fresh dev database that offers `1st Trial` in every picker is a fresh copy of the bug
the owner reported; the row still exists because history names it.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **706 pass / 0 fail** (+4). No migration. ⚠️ I ran nothing
against a database.

**DoD:** AC-1/AC-2 inactive subject absent from `subjectOptions` ⇒ from every picker ✅ · AC-3 inactive-subject
booking still renders its name, no read path filters `active` ✅ · AC-4 `FIRST_TRIAL` booking/pricing untouched
(it books the real activity; `revenueItemRef` never consults the subject) ✅ · AC-5 nothing else changes — and
the unlink hazard above is closed rather than accepted ✅ · **AC-6 the data flip is the owner's** (SQL handed to
Porter in chat) ⛔.

## Questions
- Q1: the `updateTeacher` preservation guard is mine, not the task's. It prevents silent unlinking, but it also
  means **an inactive subject can never be unlinked through the API** — deliberate (nothing should be), yet it
  is a door I closed on my own. Say if you'd rather it were explicit-only (e.g. an admin-only flag).

  > answer: (Sober)
