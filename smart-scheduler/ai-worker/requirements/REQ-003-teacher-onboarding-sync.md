# REQ-003: Unified teacher onboarding/offboarding — one action, auto-synced across both systems
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-07-20 by คุณฟีน (stakeholder)
- Deadline: none

## Problem / Goal
Today a teacher's **identity** lives in the frontoffice (scheduling `public.teachers`)
while their **money** (freelance budget+rate, or FT/PT salary) is created **separately
by hand** in the backoffice and linked by id. As teachers join and leave over time, this
means **double data entry** and risk of the two systems drifting out of sync (a teacher
with no money set up, or a budget/salary left orphaned after a teacher is removed).

Make managing a teacher a **single action in the frontoffice that auto-syncs to the
backoffice** (create / edit / change-type / remove), linked by id — with **safe rules**
so nothing is lost or left dangling, especially when removing a teacher who still has
bookings. (Chosen "Path B": frontoffice stays the source of truth for teacher identity;
the backoffice party + money are kept in sync automatically. We are **not** moving the
teacher roster into the backoffice.)

## Requirement

### 1. Add a teacher
1.1 Creating a teacher in the frontoffice **auto-creates the linked backoffice party**
    (`externalSource=smart-scheduler`, `externalRef=<teacherId>`) — no manual pairing.
1.2 **Money can be set later** (stakeholder choice). A new teacher starts in a
    **"setup incomplete"** state until their money is configured:
    - FT/PT → monthly salary not yet set; FL → budget + rate not yet set.
1.3 A teacher with **incomplete money setup is NOT bookable** and is clearly flagged on
    the teachers screen ("ตั้งเงินก่อนจึงจะจองได้"), so no un-costed freelance work or
    missing-salary teacher slips through.
1.4 **No half-created records:** if the backoffice party can't be created, the add
    fails cleanly (no teacher left without a party, no party without a teacher).

### 2. Edit a teacher
2.1 Editing name/type/etc. **syncs to the backoffice** (e.g. party name) automatically.

### 3. Change teacher type (FL ↔ FT/PT) — supported
3.1 Changing type is allowed and **handled safely, effective-dated** (past months never change):
    - **FL → FT/PT:** stop/close the freelance budget going forward; set up a monthly
      salary from the change month onward (may be set later per #1.2).
    - **FT/PT → FL:** end the salary at the change month (effective-to); set up a
      budget + rate going forward (may be set later).
3.2 All prior expenses/salary already posted to the P&L stay untouched.

### 4. Remove a teacher (offboard) — the critical, safety-first case
4.1 **Block removal if the teacher still has active/future bookings.** Warn the admin to
    **reassign or remove those bookings first**; do not remove until they are cleared.
4.2 "Remove" = **archive / deactivate (soft), never hard-delete.** All history is kept:
    past bookings, salary/budget history, and every P&L record.
4.3 On archive: the teacher is **hidden from booking + the active teacher list**, and the
    linked backoffice party is **deactivated**; salary/budget **stops from the offboard
    month** (effective-to), past months unchanged.
4.4 An archived teacher can be **viewed in an archived list** and **re-activated** later.

### 5. Keep the two systems consistent (principle)
5.1 Every cross-system action is **idempotent**; a partial failure surfaces a clear error
    and leaves **no orphans** (teacher without party, or party/money without a teacher).
5.2 There should be a way to **detect/repair drift** between the two sides (e.g. a
    reconcile check) — design detail for SA.

## Acceptance Criteria
- [ ] Adding a teacher in the frontoffice creates the linked backoffice party automatically.
- [ ] A new teacher with no money set is flagged "setup incomplete" and **cannot be booked**
      until salary (FT/PT) or budget+rate (FL) is set.
- [ ] If the backoffice call fails on add, the teacher is **not** created half-way (no orphan).
- [ ] Editing a teacher's name/type syncs to the backoffice.
- [ ] Changing FL↔FT/PT switches the money model **effective-dated**; past P&L unchanged.
- [ ] Trying to remove a teacher **who has active/future bookings is blocked** with a clear
      warning to clear those bookings first.
- [ ] Removing a teacher (with no active bookings) **archives** them: hidden from booking +
      active list, backoffice party deactivated, salary/budget stopped going forward,
      **all history retained**; can be re-activated.
- [ ] No action leaves an orphaned party or orphaned budget/salary.

## Constraints
- **Teacher master stays in the frontoffice** (`public.teachers`); the backoffice party is
  linked by `externalRef=<teacherId>` (existing pattern). Do NOT move the roster into the
  backoffice (Path A rejected as too heavy / against the ops "generic finance" design).
- Reuse the existing **effective-dated salary** (SPEC-002) and **budget-stock** (SPEC-001)
  mechanics; cross-system via `OPS_API_URL` + `SERVICE_TOKEN` (existing bridge).

## Out of Scope
- Moving the teacher roster to the backoffice as the source of truth.
- Bulk import / migration of teachers.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: Confirm the exact rule for #1.3 — **block booking entirely** until money is set
  (Porter's proposal, safest) vs allow-but-warn? Route to Porter if it's a UX/business call.
  > SA (Sober): **Confirm block-entirely** — it's the safest and reuses the exact mechanism
  > already live (a teacher with no bookable money state is dropped from the booking columns, like
  > the freelance `overLimit` auto-hide). "Setup incomplete" = FL has no budget item / FT-PT has no
  > salary row in ops. Design uses the same hide-from-booking + flag path. Not a new business call.
- SA: Confirm the definition of "active/future bookings" that blocks removal (#4.1) —
  future-dated non-cancelled bookings only, or any non-cancelled? Porter's assumption:
  future-dated, non-cancelled (past/attended are history and don't block).
  > SA (Sober): **Confirm future-dated, non-cancelled** blocks removal. Concretely: any booking with
  > `date >= today` and status NOT IN (CANCELLED, NO_SHOW) — i.e. PENDING/CONFIRMED/EXTENDED/SICK_LEAVE
  > in the future. Past + attended + cancelled are history and don't block (they're retained on archive).
  > (I'll pin the exact status set against the booking_status enum in the SPEC.)
