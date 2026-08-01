# SPEC-022: Bookings page — search, filtering and paging that work on every tab
- Source: REQ-024
- Status: ACTIVE

## Overview
Three tabs with wildly uneven search. Make each one findable and stop the default tab loading the whole school.
This is the only thing a paying customer complained about in her own words, so it gets built properly rather
than patched.

## As-built — verified, and **two of the five ACs are nearly free**
- **AC #3 (search must match nickname + parent phone) is a three-line change.** `getBookings` (`:445-452`)
  resolves `q` with `ilike(students.name, %q%)` — **name only**. But `studentSearchConditions(q)`
  (`parent.service.ts:304`) already matches **name · nickname · parent phone**, is exported, and is unit-tested
  — it's the REQ-011 fix. The bookings search simply isn't using it. *That is exactly why the same query works
  in the student picker and returns nothing here, which reads as "the system is broken".*
- **AC #4 (custom date range) is FE-only.** `bookingsQuery` already accepts arbitrary `from`/`to` (`:57-58`);
  the UI just never offers anything but its four presets.
- **The Courses tab really does load everything**: `getCourses()` (`:365`) has no filter, no paging, and **no
  `ORDER BY` at all** — so card order genuinely varies between identical requests.
- **The Vouchers tab's search is a post-load filter**: `getVouchers` (`:708`) loads every voucher then filters
  in JS. The `q` exists but buys nothing — the whole table is still read.

## ⚠️ Design constraint that decides the shape: `getCourses()` has four consumers, and three need everything
The route, **plus** the attention checks (TASK-053), the eligible-students picker (TASK-051) and the SOM report
(TASK-062). Those three **must keep getting the full list** — paging them would silently truncate a digest
count, an eligibility list and a dashboard figure.

**So paging is opt-in on the function**: `getCourses()` with no options behaves exactly as today; the route
passes `{ q, page, limit }`. **The stable `ORDER BY` is added unconditionally** — non-determinism helps nobody,
and a deterministic order is a precondition for paging meaning anything at all.

## Design
1. **`GET /courses`** gains `q` · `page` · `limit`, server-side, plus a **stable order** (student name, then
   course `createdAt`). `q` matches via **`studentSearchConditions`** — the same rule as everywhere else.
2. **`GET /vouchers`** gains `page` · `limit` and moves `q` **into SQL** (join students) instead of filtering
   after the fact. Same search rule.
3. **`GET /bookings`** — swap the name-only lookup for **`studentSearchConditions`**. Nothing else changes.
4. **Custom date range** — FE only; the API already takes `from`/`to`.
5. **Every list returns `{ items, page, limit, total }`** — the shape `getBookings` already uses, so the FE has
   one pagination component and not three.

**One search rule across all three tabs.** A staff member typing a nickname must get the same answer wherever
they type it; three tabs with three definitions of "search" is how "the system is broken" gets said again.

**No migration.** No change to booking creation, entitlements, bulk-confirm, the freelance cap or the suspend
gate.

## ⚠️ Parentless students must still be findable
`studentSearchConditions` pushes the phone clause only when the query has digits, and the student lookup must
**LEFT JOIN parents** — a walk-in student with `parent_id = null` (nullable **by design**) must still match on
name and nickname. An inner join would delete the walk-in cohort from every search on the page. Same failure
mode as the badge report, third time this pattern has come up.

## Tasks
- **TASK-070** (Jason, BE): the three endpoints + the shared search rule + stable order + paging.
- **TASK-071** (Fern, FE): Courses/Vouchers search + paging, custom date range, one pagination component.
  **Browser-checked** before DONE.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **No blocking question.** The REQ's ACs settle the behaviour, and every rule I need already exists in the
   codebase — I'm reusing it rather than inventing a second one.
2. **FYI on sizing, since go-live is 19 days out:** this is **smaller than the REQ reads** — AC #3 is a swap to
   an existing tested helper and AC #4 is already in the API. The real work is paging the Courses tab.
3. **FYI, deliberately not included:** the REQ mentions column sorting and URL-persisted filters as ✅. I've left
   them to the FE task's judgement rather than specifying them — they're presentation, and Fern is closer to
   what the page can carry without becoming cramped.
