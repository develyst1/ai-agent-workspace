# TASK-148: Planned absences at course creation (BE)
- Source: SPEC-049 (REQ-045), owner decision B
- Status: DONE (SA-reviewed Sober 2026-08-19); REQ-045 BE complete — closes on TASK-149 (FE) + owner-run `0019` deploy

## Review — preview rework (Sober 2026-08-19)
**PASS ✅ — the Q1(b) rework is exactly right.** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **559/0** (+5). Jason
fixed it by **sharing the placement rule, not teaching the preview a second one**: `firstFreeWeeklySlot` extracted to
`lib/extension-slot.ts` (pure), `findFreeExtensionDate` (`:1443`) now a thin wrapper over it with an `alreadyTaken`
param, and **`previewCoursePackage` calls the same `findFreeExtensionDate` the save calls** (`:1364`), sequentially,
passing the dates it has already claimed — so multi-absence end dates match the save. The `size` booked weeks stay at
their weekly-chain dates deliberately (the save inserts them there and refuses a clash with `SLOT_TAKEN` rather than
shifting — previewing them shifted would be the lie in the other direction; correct reasoning). New tests pin
two-make-ups-never-share-a-slot, skip-a-taken-week, and scan-exhaustion → `exceedsExtensionCeiling` refuses. **Preview ==
save by construction (AC-2).** Core (birth-marker flag, quota-skip at both sites, ceiling reuse) was already accepted.
**Verdict: DONE.** `0019` is an owner-run deploy and **must not go to uat while it's behind on `0018` with a bad ledger**
(→ Porter sequencing). REQ-045 closes on TASK-149 (FE, now unblocked) + the deploy.
- Assignee: @Jason (BE)
- Depends on: none

## Context (why)
Owner (B): a planned absence **declared at course creation is free** (no `leaveUsed`); the same action later
still consumes quota. Grounded crux: **no data distinction exists today** — planned absences and sick leaves
are both `SICK_LEAVE`, and the quota `+1` (`scheduler.service.ts:1591-1594`) is unconditional. So we need a
**persisted birth-marker** — a flag, not a new status enum (keeps `SICK_LEAVE` so every status path is unchanged).

## What to do (smart-scheduler-back)
1. **Migration** — add `bookings.planned_at_creation boolean not null default false`. Hand-author `0019`
   (journal-registered, per the drizzle-generate trap TASK-140 documented). Owner-run deploy step.
2. **`createCoursePackage`** accepts marked-absent weeks (extend `input.sessions` / a parallel `absentWeeks`
   input — pick the cleaner shape, validate `sessions.length === size` still holds). For each absent week:
   place the session `SICK_LEAVE` with `planned_at_creation = true` and append the `EXTENDED` make-up —
   **route through the reconcile engine** (`reconcileCoursePlan` / the same append logic the plan editor uses)
   so total **live == size** ("one behaviour").
3. **Conditional quota:** the `leaveUsed += 1` must be **skipped when `planned_at_creation`**. Check-in
   sick-leave (`:1838`) and a later plan-editor mark-absence (flag false) keep consuming. (AC-5)
4. **Ceiling at creation (new guard):** reject the create if any placed/appended session
   `> courseExpiry(startDate, size)` — reuse `exceedsExtensionCeiling`/`courseExpiry` (`course-plan.ts:82`) —
   with the ceiling-named reason (REQ wording). (AC-3, now the only limit)
5. **`previewCoursePackage`** extended to render the absence-adjusted plan (n sessions · absent d · ends date)
   for the pre-save preview (feeds TASK-149). (AC-1/AC-3)

## Definition of Done
- [ ] A 6-session course created with week 3 marked absent → 6 live sessions, week 3 `SICK_LEAVE +
      planned_at_creation`, end date +1 week; **`leaveUsed = 0`, not locked**; a later *sick* leave still
      consumes quota. (AC-1/AC-5)
- [ ] Saved plan matches the preview exactly (no re-shuffle on save). (AC-2)
- [ ] Planned absences past `MAX_WEEK_BY_SIZE` → refused with the ceiling reason, not trimmed. (AC-3)
- [ ] No-absence create → today's exact plan; the plan editor's own mark-absence (edit) unchanged. (AC-4)
- [ ] Consecutive absent weeks allowed (Q2 = yes).
- [ ] Migration idempotent/journal-registered; `db:verify` green. `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Migration = owner-run deploy — flag for Porter.)

## Implementation Notes
**Files:** `drizzle/0019_planned_at_creation.sql` (new) · `drizzle/meta/_journal.json` (idx 19) ·
`lib/migration-witness.ts` (0019 witness, appended **after** 0018 — the map is order-checked against the journal) ·
`db/schema.ts` · `validation.ts` (create + preview) · `services/scheduler.service.ts` (`insertBooking`,
`createCoursePackage`, both quota sites, `previewCoursePackage`) · `lib/course-plan.test.ts` +
`validation.test.ts` (9 new tests).

1. **Migration `0019`** — `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS planned_at_creation boolean NOT NULL
   DEFAULT false`. Hand-authored + journal-registered (the `db:generate` trap from TASK-140). Every existing row
   was, by definition, not declared at creation, so the default is exact. Witness = the column itself (single
   statement — nothing earlier could report it finished).
2. **Input shape — `absentWeeks: number[]` (1-based), NOT a per-row flag on `sessions[]`.** `sessions[]` is
   TASK-095's per-row *override* channel (date/teacher/subject/time); overloading it with status would mix two
   concerns and break the `sessions.length === size` rule the FE relies on. A parallel array also matches how the
   REQ talks ("marked-absent **weeks**") and how TASK-149 will render it.
3. **Create path:** each absent index is inserted `SICK_LEAVE` + `plannedAtCreation:true` (via a small
   `status`/`plannedAtCreation` passthrough in `insertBooking` — everything else keeps the `PENDING` default),
   then **`reconcileCoursePlan` runs once** — the same engine the plan editor uses, so live sessions == `size`
   and the end date moves out by one week per absence. "One behaviour", not a second appender.
4. **Ceiling (AC-3):** deliberately **not** a second implementation. `reconcileCoursePlan` already refuses an
   append past `MAX_WEEK_BY_SIZE` with `EXTENSION_CEILING` and the ceiling-named message; because the create runs
   in one transaction, that throw **rolls the whole course back** — refused, never trimmed. The preview also
   returns `exceedsCeiling` so the FE can stop the user before they commit.
5. **Quota (AC-5):** `leaveUsed += 1` is now skipped when the row is `plannedAtCreation` — at **both** sites
   (plan-editor mark-absence and the sick-leave branch). Creation itself never touches `leaveUsed` at all, so a
   course born with absences has **`leaveUsed = 0`, not locked**; a later *sick* leave on any normal row still
   consumes.
6. **Preview (AC-1/AC-2):** `previewCoursePackage` takes `absentWeeks` and returns per-session `absent` /
   `makeup` flags plus `liveCount`, `endDate`, `absentWeeks`, `exceedsCeiling` — i.e. "n sessions · absent d ·
   ends <date>" is computable without a save.
7. **Validation:** an absent week must be ≤ `size`, and **not every week** may be absent (that is not a course,
   and it would ask the engine to append `size` make-ups straight past the ceiling). Consecutive weeks allowed
   (Q2 = yes).

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **507 pass / 0 fail** (was 498). New tests: the engine owes
**exactly one** make-up per declared absence and keys it to that week · two consecutive absences → two make-ups ·
once the make-ups exist a re-run appends nothing (idempotent) · no absence → today's plan unchanged (AC-4) · the
four `absentWeeks` boundary rules.

⚠️ **NOT RUN — owner deploy step:** `db:migrate` / `db:verify` for `0019` (backup → migrate → verify: journal 20,
the `planned_at_creation` witness GREEN). I touch no real database. **Note for Porter's sequencing: `uat` is
still one migration behind on `0018` and its ledger is in the known-bad state, so `0019` must not go there until
that is resolved.**

## Questions
- Q1 (**AC-2, the one I can't fully guarantee**): the preview computes the make-up weeks as the next weekly
  slots; the save uses `findFreeExtensionDate`, which **skips a week if that teacher's slot is already taken**.
  With no clash they agree exactly; with a clash the saved make-up lands later than previewed. Options: (a)
  accept and have the FE re-read the saved plan (today's behaviour for every other append), (b) make the preview
  clash-aware (a real availability query per appended week), (c) have the save refuse rather than shift. I did
  **not** pick — (b)/(c) are behaviour decisions. AC-2 says "no re-shuffle on save", which (a) satisfies in the
  common case only.
- Q2: `absentWeeks` vs a per-row flag — item 2 above is my reading of "pick the cleaner shape". Say if you'd
  rather it rode `sessions[]`, since TASK-149 builds against whichever you ratify.

  > **answers (Sober 2026-08-18):**
  > **Q2 — ratified. `absentWeeks: number[]` is the right shape.** `sessions[]` is TASK-095's per-row *override* channel
  > (date/teacher/subject/time) and carries the `length === size` contract the FE relies on; overloading it with status
  > would mix two concerns. A parallel `absentWeeks` array matches the REQ's "marked-absent **weeks**" language and how
  > TASK-149 renders. TASK-149 builds against `absentWeeks`.
  > **Q1 — (b): the preview MUST use the save's placement. Scoped REWORK.** This is the one thing blocking AC-2, and it
  > matters more than it looks: the preview's headline is the **end date** (`ends {date}`, AC-1), and if the save's
  > `findFreeExtensionDate` skips a taken week the previewed end date is **wrong**, not just a make-up shuffled. (a)
  > "accept + FE re-reads" would show staff an end date the save then changes — which defeats REQ-045's whole point
  > ("create it right the first time"). (c) refuse-on-clash is bad UX for a valid course. So **make
  > `previewCoursePackage` place each make-up through the same availability-aware logic the save uses**
  > (`findFreeExtensionDate`), **simulating the sequential placement** — track the tentatively-placed make-up dates and
  > treat them as occupied so multi-absence end dates are accurate. Reuse the engine, don't reimplement. Residual TOCTOU
  > (a booking made in that slot *between* preview and save) is acceptable — the save is authoritative and the FE
  > re-reads; that narrow race is not the AC-2 case. **Everything else in the task is accepted — this is preview-only.**

## Review
**Core PASS ✅ · preview REWORK (Sober 2026-08-18).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **507/0** (9 new).
- **Accepted, excellent:** `0019` flag migration (hand-authored, journal-registered, idempotent); the **birth-marker
  design works** — absent-at-creation rows are `SICK_LEAVE + plannedAtCreation:true` and the `leaveUsed += 1` is skipped
  **at both** sites (`:1631` mark-absence · `:1884` sick-leave) on the flag, so a course born with absences has
  `leaveUsed 0`, not locked, and a later sick leave still consumes (AC-5); creation routes through `reconcileCoursePlan`
  ("one behaviour"); the ceiling is **reused not reimplemented** — the in-tx `EXTENSION_CEILING` throw rolls the create
  back (AC-3); `absentWeeks` validation (≤ size, not-all-absent, consecutive allowed). Tests pin one-make-up-per-absence,
  two-consecutive, idempotent re-run, no-absence-unchanged (AC-4).
- 🔴 **REWORK (preview only):** `previewCoursePackage` places make-ups at naive weekly slots (`:1343`) while the save uses
  `findFreeExtensionDate` (`:1506`) → previewed **end date wrong on a clash**. Fix per Q1(b) above. AC-1/AC-2 close on it.
- ⚠️ Migration is an **owner-run deploy**; and Jason's flag stands — **`uat` is behind on `0018` + bad ledger, so `0019`
  must not go to uat until that's resolved** (→ @Porter sequencing).

## Rework (2026-08-19) — the preview now places make-ups the way the save does
Fixed per your Q1(b), by **sharing the placement rule rather than teaching the preview a second one**:

- **New `src/lib/extension-slot.ts` — `firstFreeWeeklySlot(fromDate, isOccupied, maxWeeks)`**, pure: step a week
  at a time until the caller's predicate says the slot is free. `findFreeExtensionDate` is now a thin wrapper
  around it (the predicate = the same DB clash query as before), so **the save's behaviour is unchanged** and
  there is exactly **one** definition of "where does a make-up land".
- **`previewCoursePackage`** now appends each make-up through `findFreeExtensionDate` — the same function the
  save calls — **sequentially**, passing the dates this preview has already claimed via a new optional
  `alreadyTaken` set. Without that set two absences would both be placed in the first free week and the
  previewed **end date** would be too early; with it, multi-absence end dates are accurate.
- The `size` booked weeks are still shown at their weekly-chain dates, deliberately: the save inserts those at
  exactly those dates and **refuses** a clash there (SLOT_TAKEN) rather than shifting, so previewing them
  shifted would be the lie in the other direction.
- **Residual TOCTOU accepted as you scoped it:** a booking made in that slot between preview and save. The save
  is authoritative and the FE re-reads; that narrow race is not the AC-2 case.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **559 pass / 0 fail** (67 files; +5 here). The new tests pin
the rule that was actually wrong: **two make-ups placed in sequence never share a slot** (09-08 then 09-15, not
09-08 twice), plus skip-a-taken-week, an async predicate, and the scan-window exhaustion handing back the last
candidate for `exceedsExtensionCeiling` to refuse — never a silently valid-looking date.

⚠️ Unchanged from the original: `0019` is an **owner-run deploy**, and it must not go to `uat` while that box is
behind on `0018` with a known-bad ledger.
