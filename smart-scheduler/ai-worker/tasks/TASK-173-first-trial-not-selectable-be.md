# TASK-173: `1st Trial` unselectable as a program — active-filter subjectOptions (REQ-065) (scheduler-back)

- Source: SPEC-061 (REQ-065). Owner: do first.
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. BE code + a one-row owner-run data flip. **No FE change** (all pickers read
  `teacher.subjectOptions`). No migration (data flag, not schema).

## What to build

1. **Filter `subject.active` in the `subjectOptions` build.** `scheduler.service.ts:388` and `:452` load
   `with: { teacherSubjects: { with: { subject: true } } }` and map **every** linked subject regardless of `active`.
   Drop subjects with `active === false` from the mapped `subjectOptions`. Because every picker (single/course/
   voucher/trial) is driven by `subjectOptions` and there is **no separate all-subjects fetch on the FE**, this one
   filter fixes AC-1 + AC-2 everywhere — the cause, not one dropdown (REQ-065 req 3).
2. 🔴 **AC-3 — read paths must NOT filter `active`.** Put the filter **only** in the picker build. Audit the read
   paths (`db/mappers.ts`, daily-report / SOM services, calendar/plan) — a booking whose subject is inactive must
   still render with that name and not error. Add a test: an inactive-subject booking maps its name fine.
3. **Owner-run data flip (AC-6, dry-run-first):** `1st Trial` → `active = false`. **Give it to Porter for the
   owner** (chat SQL, `sid` first then `uat`): `SELECT id, name, active FROM subjects WHERE name='1st Trial';`
   (confirm exactly one row) → `UPDATE subjects SET active=false WHERE name='1st Trial';`. One row, unique name,
   reversible. **You run nothing against a DB.**
4. **Optional (non-blocking) dev-data hygiene:** `db/seed.ts:185` books a demo trial with `subject:"1st Trial"` —
   change it to a **real activity** so fresh seeds stop modeling a trial as its own subject. Skip if you'd rather.

## Definition of Done
- [ ] AC-1/AC-2: with `1st Trial` inactive, it is absent from `subjectOptions` ⇒ from the single/course/voucher/trial
      pickers. Unit-test the `subjectOptions` mapping drops an inactive subject and keeps active ones.
- [ ] AC-3: a booking whose subject is inactive still renders its name (mapper/report test); no read filters `active`.
- [ ] AC-4: booking a `FIRST_TRIAL` still works, still `first-trial`/฿1,390 (unaffected — it uses the real activity).
- [ ] AC-5: only the `subjectOptions` filter changes; no other subject/program affected.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. The data flip is the owner's (SQL handed to Porter).

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **706/0** (+4).
- **Filter in `toTeacherDTO` (`mappers.ts:30`) — better than my two-site suggestion:** both `getCalendar` and
  `getTeachers` map through it and the FE's `subjectOptions` **is** `dto.subjects`, so it's one fix instead of two
  that can drift. `active !== false` (not `=== true`) is the right defensive choice — a row loaded without the column
  doesn't silently vanish from every picker.
- **🔴 Q1 — the silent-data-loss hazard he caught is real, and the guard is correct. Strongly endorsed.**
  `TeacherFormModal` seeds its multi-select from the (now-filtered) `subjectOptions` and PATCHes it back via
  delete-all→insert, so the **first save of any teacher would silently unlink `1st Trial`** — a data change from a
  display filter, exactly what AC-5 forbids. `updateTeacher` (`:2321`) now keeps links to subjects the client
  **couldn't see** (`keep = existing where subject.active === false`, insert `union(sent, keep)`). *"A client may
  only change what it was shown"* — the right principle. The deliberate consequence (an inactive subject can't be
  unlinked through the teacher API) is sound; reactivate first if ever needed.
- **AC-3 grep-audited, not assumed:** the only `subject.active` reads are this picker filter, the new guard,
  `bulk-link-plan` (a picker) and `getSellablePackages` (a sale picker) — **no mapper/report/calendar/SOM/plan path**
  consults it, so historical `1st Trial` bookings still render. Pinned by a test.
- **Seed hygiene taken** (the optional item): `1st Trial` seeds inactive + the demo trial books a real activity, so a
  fresh DB doesn't reproduce the reported bug.

**⇒ DONE (code).** The owner-run flip is the remaining step; **deploy the code FIRST**, then flip (flipping on the
old build hides nothing). SQL to Porter for the owner (SELECT-confirm one row → UPDATE, `sid`→`uat`, dry-run-first).

## Notes / Questions
(Jason fills in. The whole fix is one filter + a read-path audit + a one-row flag flip. `active` = "selectable"; the
row stays for history. Confirm every picker truly comes from `subjectOptions` — the FE grep found no other source,
but you own the API shape.)
