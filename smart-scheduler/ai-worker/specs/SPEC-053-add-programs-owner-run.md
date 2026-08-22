# SPEC-053: Add programs (subjects) via an owner-run, repeatable command

- Source: REQ-058 (add nine programs + a repeatable way to add the next one)
- Author: Sober (SA) 2026-08-22
- Status: READY — task cut (TASK-153). BE/data-only, **no FE change**.

## The decision up front (grounded, not assumed)

REQ-058 reads as three things — the nine programs, teacher attachment, pricing — but the code says most of it is
**data, and already wired**. Two facts settle the scope:

1. **The booking UI is driven by data, not by an FE list.** The subject dropdown in the booking modal is
   `selectedTeacher.subjectOptions` (`smart-scheduler-front/…/Calendar/Modal/BookingModal.tsx:596,607`), which comes
   from the API's `teacher_subjects`. So a new `subjects` row + a `teacher_subjects` link **appears in course /
   single / trial / voucher booking by construction — no frontend work, same "it's data, not strings" shape as
   REQ-056, this time in our favour.** ⇒ **AC-2 needs no code beyond creating the rows and linking a teacher.**
2. **Price + voucher eligibility key off `price_group`, not the subject.** `subjects.price_group` (`schema.ts:230`)
   is data; `voucherAllowsProgram("bike-skate")` is **`true`** (`sale-items.ts`, SPEC-030). All nine map to
   `bike-skate` (REQ-058, from the customer's card), so they are **priced 4,790 / 6,490 / 9,790 and
   voucher-eligible automatically** — no new price group, no `PriceGroup` union change, no new `bo.item`, **no
   deploy for the mapping.** ⇒ **AC-4 and Q3 are satisfied by the group; the owner only speaks up to EXCLUDE one.**

**What actually has to be built is small: the missing *mechanism*.** `subjects` rows are created **only** in
`db/seed.ts:46` — there is no API, no UI, no owner-runnable command. That absence (REQ-058's "actual defect") is the
one thing to fix; the nine rows are its first use. **SA's call on requirement 5 (proportionate path):** an
**owner-run, dry-run-first script** in the family of `db:reset` / `import:students`, **not** an admin screen. The
screen is real FE work for a monthly-at-most action; the script unblocks the live customer today and honestly
satisfies AC-6 (adding the tenth is a command, not a code edit). If the owner later wants the screen, that is its
own REQ — recorded as an option, not built on spec.

## Behaviour

A script `scripts/add-subject.ts`, wired as `subjects:add`, following the **exact house safety pattern of
`db:reset` / `import:students`** (this is why it is a script and not hand SQL):

- **Dry-run by default.** Prints the plan (which programs would be created, which already exist, the price group,
  any teacher link) inside a transaction, then **ROLLBACK**. Nothing is written without `--commit`.
- **Insert-if-missing by the unique `name`.** `onConflictDoNothing` on `subjects.name`. A program that already
  exists is reported **"already present — unchanged"** and never touched. This is what makes **AC-5 hold by
  construction**: the nine existing programs, and the KEPT combined `Bike / Scooter / Balance Cruiser`, cannot be
  renamed, re-grouped, or deleted by this tool — it only ever inserts.
- **`price_group` is validated against the four-member union** (`bike-skate | onewheel | balance-private |
  balance-group`) before any write. An unknown/typo group is **refused loudly** — the tool must not create an
  unsellable program (`price_group` NULL / wrong) by a spelling slip. `--group bike-skate` is required, not
  defaulted, so the choice is always explicit.
- **Optional `--teacher <nickname|id>`** attaches a `teacher_subjects` link (also insert-if-missing) in the same
  run, so **AC-3 is one command the moment the owner answers "who teaches which"** — no new code then.
- **Console prints program names + counts only.** Subject/teacher names are catalogue data, not PII (unlike the
  student importer), so they are safe to print and paste back. No student/parent data is read or written.
- **One transaction · no DDL anywhere · owner-run on `sid` first then `uat`**, like every environment action.

### Invocation for today's nine (documented in the task; owner runs it)

Each of the nine, `--group bike-skate`, dry-run then `--commit`:
`Bike · Balance Cruiser · Balance Bike · Scooter · Inline Skate & Bike · Surfskate & Bike ·
Surfskate & Inline Skate · Bike & Scooter · Surfskate & Freeskate`

Names **exactly** as the customer wrote them (AC-1) — the combined `X & Y` names are the customer's vocabulary and
are stored verbatim, not modelled as two programs.

## Acceptance mapping

- **AC-1** — the nine exist, exact spellings ⇐ the documented invocation, names copied from REQ-058 verbatim.
- **AC-2** — selectable in course / single / trial / voucher ⇐ by construction (teacher.subjectOptions is data);
  proven once a teacher is linked (AC-3).
- **AC-3** — ≥1 teacher per program ⇐ `--teacher` link; **WHO is owner-owed (REQ-058 Q2)** — the mechanism ships
  now, the links land when the owner answers, no further code.
- **AC-4 (money)** — `price_group='bike-skate'` ⇒ 4,790 / 6,490 / 9,790, verified against the card; no new items.
- **AC-5 (regression)** — insert-only, unique-name conflict = no-op ⇒ existing programs / teachers / prices /
  REQ-027 voucher exclusions unchanged; combined program KEPT, its 3 courses not migrated.
- **AC-6 (repeatable)** — program name + group are arguments ⇒ adding a tenth is `subjects:add --name … --group …`,
  **no code change, no deploy**.

## Explicitly OUT of scope (stated so nobody "tidies" it later)

- **No migration of the combined `Bike / Scooter / Balance Cruiser` or its 3 live courses** (owner-bound,
  REQ-058). Purely additive.
- **No reporting change** — REQ-013/014 will show the combined program as its own bucket; folding it into the split
  ones would rewrite what those 3 families bought.
- **No admin screen** (offered as a later REQ if the owner wants it).
- **Onewheel price faults** belong to REQ-061, not here.

## Open (does NOT block creating the programs)

- **Q2 (owner → customer): which teachers teach which of the nine.** Blocks AC-3 being *proven*, not the programs
  being *created*. Feed the `--teacher` flag when it lands.
- **Voucher exclusion:** default is *eligible* (bike-skate). Owner only acts to exclude a specific program; if he
  does, that is a REQ-027-style data/rule question raised separately.
