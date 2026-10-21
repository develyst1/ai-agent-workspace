# TASK-823 — BE: **a teacher's own calendar shows every class they teach, including one where they are an EXTRA teacher (multi-teacher Other/ECA, a group's extra coach)** (REQ-125) — @Jason (XS ≈ 0.35 d incl. +10 percent)
**From @Sober, 2026-10-19.** Source: `requirements/REQ-125-teacher-login-misses-a-multi-teacher-eca.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first; Tanya's TEST-110 recipe pins it).

## The mechanism (read by me, back `6bac497`)
- `getCalendar` (`services/scheduler.service.ts:503`) reads the scoped teacher's rows with THE predicate `ownScopeWhere(scope)` (`:547`). That predicate **includes** classes where they are an extra teacher (`lib/own-scope.ts:25-29`). ✅
- It then indexes every row into a cell by **the PRIMARY teacher only**: `key = date|dto.teacher.id|startTime` (`:571`). The columns are filled from that index (`:600-606`).
- **A scoped calendar has ONE column, mine** (`:516`). So a class where I am an EXTRA teacher is fetched, keyed under the primary's id, and **never drawn**: the primary's column is not in my payload.
- **Why the admin calendar looks right:** the FRONT puts a multi-teacher class into every assigned teacher's column (`CalendarGrid.tsx:63-80`, TASK-227; *"The BE indexes the calendar payload on the FIRST teacher only"*). It can do that only for columns that exist in the payload. A scoped payload has no primary column, so nothing reaches the front.
- **Prediction for Tanya's recipe (TEST-110):** QA teacher NOT first → **missing** from their own view; QA teacher FIRST → **shown**. The admin calendar shows it in every column either way.

## Build
- In `getCalendar`, **when scoped**, index each row under **the scoped teacher's id** (my one column), so a class I teach as primary OR extra lands in my column.
- **The admin payload stays byte-identical** (unscoped: the primary key, as today; the front's placement is unchanged).
- Reuse the predicate's answer: the row is already "mine" because `ownScopeWhere` let it in. No second rule for "mine".
- **The existing one-booking-per-cell rule stays** (TASK-227 Q2): if I am primary of a lesson AND extra on an Other in the SAME slot, the cell shows one (as the admin grid does today). Keep the existing SICK_LEAVE preference. Don't redesign the cell.

## 🚫 Not this task
The front · any other "own" read (all checked: they already include extras, see Sober's audit in `inbox/PM.md` 10-19) · the group extra coach's freelance ceiling · same-day leave by an extra teacher (a business question, with Porter).

## ✅ Done means
- **By value, through `getCalendar` with a scoped viewer:**
  - an Other class with 3 teachers, the viewer **2nd** → in the viewer's column at its slot;
  - the viewer **1st** → shown (unchanged);
  - a group whose **extra coach** is the viewer → shown;
  - the day AND week view.
- **The admin (unscoped) payload is byte-identical** for the same data (snapshot the columns/cells).
- **Mutation set:** at least
  - the scoped key back to the primary (the ECA disappears);
  - the scoped key applied to the admin too (the admin payload changes);
  - the predicate dropped from the scoped read.
- tsc 0 · SAFE suite · counts · `unhandled-between-tests: N`. `git status` = the claim only. Nothing committed.

## ✅ Claim (Team A, pending @Porter)
back `src/services/scheduler.service.ts` (`getCalendar` only) · a new test + its set. Own-team pins: ask me (standing rule).

---
## ✅ 2026-10-19 — Jason (BE) → @Sober: TASK-823 GREEN — a teacher's own calendar now shows classes where they are an EXTRA teacher. Back only, nothing committed.
**Code — `src/services/scheduler.service.ts`, `getCalendar` only (+4/−1), base `7d39cbf`+:** the cell key `${dto.date}|${dto.teacher.id}|${dto.startTime}` → **`${dto.date}|${scope ?? dto.teacher.id}|${dto.startTime}`**. Scoped (a coach's own calendar, ONE column = the viewer) every fetched row is drawn in the viewer's column — `ownScopeWhere` already decided the row is "mine" (primary OR extra), no second rule; unscoped (admin / no viewer) keeps the primary key, byte for byte. The one-booking-per-cell rule and the SICK_LEAVE preference are untouched.
**By value through `getCalendar` (DB answers what it would for the scoped read), your recipe:** a 3-teacher ECA with the viewer **2nd** → in the viewer's column at 10:00 ✅ · the viewer **1st** → shown (unchanged) ✅ · a **group whose extra coach is the viewer** → shown ✅ · their own private lesson → shown ✅ · **day AND week** views ✅ (week: both days land in the one column on their own dates) · ONE column in the payload ✅ · same-slot clash (my lesson + an ECA I co-teach, same slot) → one cell, the first read; a SICK_LEAVE yields to the active one (unchanged) ✅.
**Admin payload byte-identical (same data, unscoped):** ECA + group under the PRIMARY's column, own lesson under the viewer's, nothing under the third coach; the cell still lists every assigned teacher; `null` viewer behaves as admin.
**Files:** `scheduler.service.ts` (M) · NEW `src/lib/own-calendar-co-taught-task823.test.ts` (8) + `…mutations.json` (4). `git status --short -uall` = exactly those three. No front, no migration, no copy.
**Set 823: 4/4 BITE** (H1 key back to the primary — the ECA disappears · H2 the admin payload re-keyed · H3 the predicate dropped from the scoped read · H4 the scoped column filter dropped), baseline 31 (the set's `tests` also run TASK-097's own-calendar pins), CHECKSUM identical.
**tsc 0 · SAFE suite 4,951 pass / 0 fail, 358 files · unhandled-between-tests 0 · migrations 71 = 71.**
*(Not in scope, as ruled: same-day leave by an extra teacher, a seat check-in, the freelance ceiling. One thing I noticed and did NOT touch: a co-taught class falling on a day the VIEWER does not work is still hidden, because the scoped column is only built for the viewer's own work days — say if you want that looked at.)*
▶️ **Ball: Sober — verify.**

---
## ✅ 2026-10-19 — @Sober: TASK-823 VERIFIED at unit level. **The tie to TEST-110 is still OPEN** (no TEST-110 file yet)
- **Diff:** one token in `getCalendar`: the scoped cell key is `scope ?? dto.teacher.id`. The unscoped (admin) key is unchanged.
  - The front already places a class in a column whenever that column's teacher is any of its teachers (`CalendarGrid.tsx:63-80`), so a co-taught row in MY column is drawn.
- **Clean copy** of back `6bac497` + the 3 files: tsc 0 · SAFE suite **4,951 / 0**, 358 files · unhandled 0 · 71 = 71 · set **4/4 BITE**.
- **Your side note (non-work-day column):** recorded, not in scope. An extra teacher can't be added on a day they don't work (`attachAdditionalTeachers` → `assertTeacherBookable`, the workday check), so it arises only if work days change after the class exists. It applies to the admin grid too.
- **Commit list (back, 3):** `src/services/scheduler.service.ts` · `src/lib/own-calendar-co-taught-task823.test.ts` · `src/lib/own-calendar-co-taught-task823.mutations.json`.
- **Still to tie:** TEST-110 on sid. Expected:
  - OLD build: viewer 2nd → missing, 1st → shown;
  - NEW build: both shown.
  - If her OLD-build repro contradicts this, I stop.

---
## ✅ 2026-10-19 — @Sober: TASK-823 DONE, tied to TEST-110
- **Committed as `01d7f04`**: exactly the 3 verified files (`scheduler.service.ts` +5/−1, the 823 test, its set), checked by `git show --stat`.
- **TEST-110 on sid** (back `01d7f04` + front `692f798`), the owner's qatt75 own view (DR-1):
  - **QA-T110-A**, qatt75 **3rd** of 3 → **shown** (Khwan's missing case);
  - **B**, qatt75 **1st** → **shown**;
  - **matches §1's prediction for the NEW build.**
- **⚠️ Boundary, stated plainly:** the **OLD-build half was not captured on sid** (the fix was deployed before the run). The old-build evidence is **Khwan's own uat screens** (REQ-125 intake), and uat still runs the old build. The before/after pair is therefore Khwan's uat (before) + TEST-110 on sid (after), **not one recipe on one host.**
- **Next:** uat (back only, these 3 files), then Tanya's read-only uat check (Camp's own view shows the STA ECA), then the answer to Khwan.
