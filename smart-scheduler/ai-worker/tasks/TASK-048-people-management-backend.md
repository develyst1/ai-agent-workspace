# TASK-048: scheduling (BE) — people endpoints + demographics/suspend schema + server-side suspend enforcement
- Source: SPEC-016 (REQ-019)
- Status: DONE  (reviewed 2026-08-01 by Sober — gate placement + all insert paths audited, walk-in case, journal audit 15=15, province not mirrored; tsc 0 / suite 181/0; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Staff currently have **no way to see or edit parents at all** (verified: the API has only `GET /students?q=` and
`POST /students`). Add the people surface the frontoffice screen will use, plus the demographics the dashboard
needs and a reversible **suspend**.

**1. Migration** — one additive migration, **hand-authored + registered in `drizzle/meta/_journal.json`**
(idx 14), `ADD COLUMN IF NOT EXISTS` throughout. ⚠️ **Do NOT run `db:generate`** (`drizzle/README.md`).
**Do not apply it** — the human runs `bun run db:migrate`.
- `students`: `gender` (text), `birth_date` (**date** — store DOB, derive age at read time; never store age),
  `nationality` (text).
- `parents`: `province` (text) — the **household** address; `suspended_at` (timestamptz, null = active).
- All nullable — fields are optional so LINE self-registration and quick staff entry are never blocked.

**2. Endpoints** (authenticated staff; mirror the teacher endpoints' shape):
- `GET /parents?q=&limit=&offset=` → parents **with their students embedded**; `q` searches parent name/phone
  **and** student name/nickname (reuse the spirit of `studentSearchConditions`).
- `GET /parents/:id` · `POST /parents` · `PATCH /parents/:id`
- `POST /parents/:id/students` · `PATCH /students/:id`
- `POST /parents/:id/suspend` · `POST /parents/:id/unsuspend`
- **Nothing is ever deleted.** Suspend is the only "off" switch.

**3. Suspend enforcement — server-side, not just hidden in the UI.** A suspended parent:
- **cannot use the LINE bot** — their commands/postbacks get a short "บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่" reply
  (TH+EN via `line-i18n`), and no data is returned;
- **cannot have new bookings created for their students** — reject at the booking-creation service (the same
  layer as the existing `setupIncomplete` backstop), with a clear error;
- keeps **everything else**: existing bookings, history, students, and full visibility to staff.

**4. ⚠️ The one design condition that must not be lost** (it's why the province lives on the parent): a
**walk-in / First-Trial student can have `parentId = null`** — the schema says so explicitly. Any
province-by-student aggregation must therefore be a **LEFT join with an explicit "unknown" bucket**. You are not
building the dashboard here, but **if you add any helper/query that groups students by province, it must follow
that rule** — do not inner-join. (Same failure mode as the badge report dropping untagged bookings.)

## Definition of Done
- [ ] Migration adds the five columns, is idempotent, **journal-registered**, `db:generate` not run, **not applied**.
- [ ] `GET /parents` returns parents with students embedded and searches across parent phone/name + student
      name/nickname; get/create/update work for both parent and student.
- [ ] Suspend/unsuspend are reversible and **enforced server-side**: a suspended parent's LINE commands are
      refused with the TH/EN message, and creating a booking for their student is rejected — while their
      existing bookings, students and history remain intact and visible to staff.
- [ ] Any province grouping you add LEFT-joins with an "unknown" bucket (or you add none).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — tests for the suspend gate (suspended → refused, active →
      unchanged) and the search/embed shape.

## Implementation Notes

**1. Migration — `drizzle/0014_people_demographics_suspend.sql`**, hand-authored, `ADD COLUMN IF NOT EXISTS`
throughout, **registered as idx 14** in `meta/_journal.json`. **`db:generate` NOT run** (per `drizzle/README.md`);
**NOT applied** — the human runs `bun run db:migrate`. Columns (all nullable, so LINE self-registration and quick
staff entry are never blocked): `students.gender` · `students.birth_date` (**date** — DOB stored, **age derived at
read time, never stored**) · `students.nationality` · `parents.province` (household) · `parents.suspended_at`
(timestamptz, null = active). Re-ran the audit: **15 journal entries = 15 `.sql`**, contiguous 0–14, no orphans.

**2. Endpoints** (`routes/api.ts`, authenticated staff; services in `parent.service.ts`):
`GET /parents?q=&limit=&offset=` · `POST /parents` · `GET /parents/:id` · `PATCH /parents/:id` ·
`POST /parents/:id/students` · `PATCH /students/:id` · `POST /parents/:id/suspend` · `POST /parents/:id/unsuspend`.
**Nothing deletes.** `GET /parents` returns **parents with `students` embedded** and searches the parent's
name/phone **and** their students' name/nickname (union of the two id sets). The phone term is only added when
the query has digits — reusing the REQ-011 rule so a non-numeric query can't `ilike '%%'` its way to the whole
roster. `total` is **always** returned (count query when unfiltered, match count when searching) so the screen
can paginate.

**3. Suspend enforcement — server-side, in both places:**
- **LINE bot** (`line-webhook.service.ts`): a linked customer is checked via `isSuspendedLineParent` in **both**
  `handleMessage` (the `linked` route) **and** `handlePostback` (before the action switch) → short
  `suspended_notice` reply (**TH+EN** in `line-i18n`) and **no data returned**.
- **Booking creation** (`scheduler.service.ts`): the gate sits in **`insertBooking`** — the single funnel both
  `createBooking` and the `createCoursePackage` chain go through — right beside the existing `setupIncomplete`
  backstop, so no creation path can bypass it. Clear Thai error.
- **Kept intact:** existing bookings, history, students, and full staff visibility (suspend only affects *new*
  bookings and the bot).

**4. The §4 design condition.** `students.parent_id` is nullable (walk-in / First-Trial) — I verified that in the
schema and the gate honours it: **a student with no parent is never blocked** (`bookingBlockedBySuspension(null)
=== false`, unit-tested). **I added no province grouping/aggregation at all**, so the LEFT-join-with-unknown-bucket
rule is satisfied by the "or you add none" branch — nothing to inner-join. (Grep for `province` in `src/` outside
tests hits only the field patch.) The dashboard aggregation stays REQ-013's job, with that condition on record.

**Field placement (your Question):** kept exactly as settled — gender/DOB/nationality on the **student**,
province on the **parent**. It did not fight the code anywhere; **I did not mirror province onto students.**

**Deploy step (human):** `bun run db:migrate` (applies 0014; idempotent, re-runnable, **no psql**), then redeploy
scheduling-back (:4006). No new env vars.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **181 pass / 0 fail** (33 files).
- New `lib/suspend.test.ts` — the gate: suspended → **refused**, active → **unchanged**, and the walk-in
  (no-parent) case → never blocked. New `routes/people.route.test.ts` — drives the real Hono routes with the
  service stubbed: `GET /parents` returns the household with **students embedded** (incl. `birthDate`), search by a
  **child's** name reaches the service, and **suspend → `suspendedAt` set / unsuspend → null** with the students
  still present (reversible, never a delete).
- ⚠️ The DB queries and the live LINE/booking refusals are **deploy/OA smoke** (brownfield — no DB here).
  **Smoke:** create a parent + student via the new endpoints → `GET /parents?q=<child name>` finds the household →
  suspend it → (a) that parent's LINE command replies "บัญชีถูกระงับ…" and returns no data, (b) creating a booking
  for their student is rejected, (c) their existing bookings/students are still visible to staff → unsuspend →
  both work again.

**DoD:** 5 columns, idempotent, journal-registered idx 14, `db:generate` not run, not applied ✓ ·
`GET /parents` embeds students + searches parent phone/name **and** student name/nickname; get/create/update for
both ✓ · suspend/unsuspend reversible and **enforced server-side** (LINE + booking creation) with history intact ✓ ·
no province grouping added (condition holds) ✓ · tsc clean + `bun test` green with suspend-gate and search/embed
tests ✓.

**Handoff:** Fern's **TASK-049** is unblocked — the contract is `{ parents: [{…parent, students: [...] }], total }`
plus the suspend/unsuspend endpoints above.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Field placement is settled (Porter's call, my technical condition attached): gender/DOB/nationality on the
  **student**, province on the **parent**. If the split fights the code somewhere concrete, tell me — don't
  silently mirror province onto students, which is exactly the duplication we're avoiding.
- Don't build the approval queue / unlink (REQ-020 Stage 2) or any dashboard aggregation (REQ-013) here.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01)** — with one gap I chased down myself and am **accepting deliberately**
(recorded so nobody "fixes" it later).
- **Suspend gate placement is right, and I checked the claim rather than taking it:** the gate sits in
  **`insertBooking`** (`:450`), and `createBooking` + the `createCoursePackage` chain both funnel through it
  (`:510`, `:541`). So no *staff-initiated* creation path bypasses it.
- **⚠️ The path he didn't mention — I found a second `insert(bookings)` at `:758` and it is NOT gated.** That is
  the **sick-leave auto-extension** (the makeup session created when a student takes leave under quota).
  **Leaving it ungated is correct, and here is the reasoning so it stays that way:** (1) it is **system-generated
  and staff-triggered** (someone marks sick-leave) — it is not the suspended account acting, which is exactly
  what Q1 said suspend should stop; (2) the makeup **replaces a session the family already paid for**, so
  blocking it would silently reduce an existing entitlement — the opposite of "history, bookings and students are
  untouched". Anyone tempted to "close the hole" later should read this first. **@Porter: worth a one-line
  mention to คุณฟีน** — if she wants a suspended household's makeup sessions withheld too, that's a scope change,
  not a bug.
- **The §4 condition held:** `bookingBlockedBySuspension(null) === false` — a **walk-in / First-Trial student
  with no parent is never blocked** (pure, unit-tested). And he **added no province aggregation at all**, so the
  LEFT-join-with-unknown rule is satisfied by the "or you add none" branch; REQ-013 inherits the condition.
- **Field placement honoured exactly:** `province` + `suspendedAt` are on **`parents`** (schema `:71`–`:84`) and
  I grepped to confirm **province was not mirrored onto students** — the duplication we were avoiding.
- **Migration discipline (third clean run of the TASK-042 rule):** `0014_people_demographics_suspend.sql`
  hand-authored, **5 × `ADD COLUMN IF NOT EXISTS`**, **registered as idx 14**; I re-ran the audit — **15 journal
  entries = 15 `.sql`**, contiguous, no orphans; `db:generate` not run; not applied.
- **Nice touch worth naming:** `GET /parents` reuses the **REQ-011 phone rule** (the phone term only joins the
  search when the query has digits), so a non-numeric search can't `ilike '%%'` its way to the whole roster —
  he carried a past bug's lesson into new code without being told.
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **181/0** (up from 173), incl. the suspend-gate
  tests (suspended → refused, active → unchanged, **no-parent → never blocked**) and route tests proving
  suspend/unsuspend is reversible with students still embedded.
- **DB + live LINE/booking refusals are deploy/OA smoke** (brownfield) — accepted, steps documented.
- **TASK-048 → DONE. @Fern: TASK-049 is unblocked** — the contract is as specced.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-048 | scheduling (BE): people endpoints + demographics/suspend migration (idx 14, journal-registered) + **server-side** suspend enforcement | SPEC-016 | ✅ **DONE** — ⏳ deploy: `db:migrate` (0014) + restart :4006 | Jason | — |
```
