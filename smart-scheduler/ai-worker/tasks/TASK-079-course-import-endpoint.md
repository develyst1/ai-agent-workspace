# TASK-079: scheduling (BE) — import an in-progress course/voucher (entitlement, never revenue)
- Source: SPEC-025 (REQ-025)
- Status: DONE  (reviewed 2026-08-01 by Sober — verified myself: `skipRevenue` exists only in comments explaining its absence, `recordSale` has 3 call sites and no import touches `bo`, import routes registered before the literal ones, journal 18=18; detector exclusion asserted from generated SQL with BOTH halves tested + a guard that the check is still registered; tsc 0 / 336 tests)
- Depends on: TASK-066 (sales post at point of sale) · TASK-067 (the detector this must not trip)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
On go-live the school does not start from zero: children are mid-course **now** — 10 sessions bought in Excel,
4 attended, **6 remain**. Today a course can only be created by **selling** one, which always starts at
0 used. Without this, every mid-course child is a customer with **no entitlement** on day one, and staff must
either re-sell a course the family already paid for or book outside one — **the free-sessions hole TASK-052/055
closed.**

~20–36 families, so this is staff entry, not an importer. **No file parsing, no matching rules, no staging.**

## What to do

### 1. Migration — `source` on courses and vouchers
`course_packages.source` and `vouchers.source`: `SALE` | `IMPORT`, **default `SALE`** (every existing row is a
sale). Hand-authored, **journal-registered — no `db:generate`**.

### 2. 🔴 Import is a separate VERB, not a flag
**`POST /api/courses/import`** and **`POST /api/vouchers/import`** — not `skipRevenue: true` on the existing
endpoints.

> Since TASK-066 revenue posts at the point of sale, so anything creating entitlement through the sale path
> inherits it. Importing 30 families through a flagged sale path would post a **large, entirely fictional month
> of revenue** — money collected months ago, counted again. **A boolean is one forgotten default away from
> that**, in the week everyone is watching something else. Two verbs cannot be confused; a flag can.

Each accepts: student, subject, `size` (or `totalHours`), **`usedSessions`** (or `usedHours`), an **explicit
`expiryDate`**, and the teacher/date/time for the remaining sessions.

⚠️ **Take the expiry explicitly — do not compute it.** `courseExpiry` counts from the start date, and an
imported course started months ago; computing would silently extend or shorten what the family bought.

Create bookings for the **remaining** sessions only (`size − usedSessions`), forward from the chosen date.
**Do not create the sessions already taught** — we don't have that history and don't need it; the balance is
the point. **No `bo.movement` on either path. Ever.**

### 3. ⚠️ Exclude imports from `sales_not_posted` — this is the part that matters
Your TASK-067 check counts entitlements created in the last 7 days with **no matching `SALE` movement**. An
imported course has none **by design** — so on go-live morning the digest would list **~30 imported families as
revenue faults**, for a week.

**That's worse than noise: it's the detector that guards real revenue, and a detector that cries wolf gets
muted.** We'd spend the launch fortnight ignoring the one check that would tell us the sale path had broken
again. **The check must skip `source = 'IMPORT'`.**

### 4. What import must NOT bypass
- **The freelance ceiling** still draws for imported future sessions — the centre really does pay those teachers.
- **The suspend gate** still applies; refuse loudly.
- Pricing/availability (SPEC-024) don't apply — nothing is priced. **An off-card size is importable on
  purpose**: the family already bought it, whatever the card says today.

## Definition of Done
- [ ] Importing "10 sessions, 4 used, expires 2026-11-30" creates a course with `usedSessions = 4`, that exact
      expiry, `source = 'IMPORT'`, and **6** future bookings.
- [ ] **No `bo.movement` row is created by either import endpoint** — assert it, don't assume it.
- [ ] The imported course then behaves as a normal course: booking, quota, leave, extension, expiry, cap.
- [ ] `sales_not_posted` does **not** flag imported courses/vouchers, and **still flags a genuine unposted
      sale** — test both, or the exclusion is indistinguishable from breaking the check.
- [ ] Existing rows and the normal sale path are unchanged (`source` defaults to `SALE`).
- [ ] A suspended household is refused; the freelance ceiling still draws.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — remaining-sessions arithmetic as a **pure** function
      (`usedSessions ≥ size` → zero bookings, not negative).
- [ ] Journal audit count stated.

## Implementation Notes

### Two verbs, and nothing that could ever become a flag
`POST /api/courses/import` and `POST /api/vouchers/import`, with their **own** zod schemas. There is no
`skipRevenue` anywhere in the codebase — I checked. **Neither import function touches `bo` at all**:
grep-verified, `recordSale` has exactly three call sites and all three are the sale/day-end paths
(`createCoursePackage:913`, `createVoucher:1003`, `jobs.service:99`).

Registered **before** `/courses` and `/vouchers` so the literal path can never be read as anything else — the
TASK-029 lesson, applied deliberately rather than discovered again.

### Migration — `source` on both tables (0017)
Hand-authored, **journal idx 17, no `db:generate`**. ✅ **Journal audit: 18 entries = 18 `.sql` files.**
`text NOT NULL DEFAULT 'SALE'` + a CHECK, matching the `job_runs`/`teacher_link_requests` house style. Every
existing row is a sale, so the default makes this a no-op for the normal path.

### 🔴 The detector exclusion — done so it's provable, not just present
Your point that this is the part that matters is right, so I made it **testable rather than trusted**. The two
candidate queries moved into `services/search.queries.ts` as exported builders — `soldCoursesSince` /
`soldVouchersSince` — so the `source = 'SALE'` filter is asserted **from the generated SQL**, without a DB.
That module is also the one nobody stubs (TASK-070), so the assertion can't be broken by another test file.

**Both halves are tested, exactly as the DoD demands**, because an exclusion and a switched-off check look
identical from one side:
- the filter is in **both** queries, alongside the window (not instead of it), **and**
- `isSaleUnposted` still flags a genuine SALE-sourced entitlement with no movement.

Plus a third: a test asserting `sales_not_posted` is **still registered**, so nobody "fixes" go-live noise by
deleting the check.

### Nothing is bypassed — and mostly by construction, not by re-implementing it
- **The suspend gate**: `assertHouseholdNotSuspended` on both import paths, same as the sale paths.
- **The freelance ceiling**: nothing special needed. The draw happens in `updateBookingStatus:1183`, not at
  insert, and import creates its remaining sessions through the **same `insertBooking`** — so an imported
  session draws the ceiling exactly like a sold one when it's confirmed. **The centre really does pay those
  teachers, and it still does.**
- **Pricing/availability (SPEC-024) deliberately do not apply.** `size` is `1..100`, **not** restricted to
  4/6/10: an off-card size is importable **on purpose** — the family already bought it, whatever the card says
  today. Nothing is priced, so nothing can be mispriced.

### ⚠️ Expiry is taken, never computed
`expiryDate` is **required** in both schemas. `courseExpiry` counts forward from the start date, and an
imported course started months ago — computing it would silently extend or shorten what the family actually
bought. There is no code path in either import that calls `courseExpiry`.

### The balance, not the history
`remainingSessions(size, used)` is pure and `Math.max(0, …)`, so a finished course imports with **zero**
future bookings rather than a negative loop bound — your call, and I agree: staff may still want the record.
**I did not create the sessions already taught.** We don't have that history, and inventing it to make a
number look right would put fictional attendance into the daily report, the SOM dashboard and the no-show
counts. That's the thing you told me to stop and flag if I felt tempted by; I didn't need to.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **336 pass / 0 fail** (46 files, was 326 — **+10**).
- ✅ **Journal audit: 18 = 18.**
- New `lib/import-entitlement.test.ts`: the task's own example (10 bought, 4 used → **6**, and six weekly
  dates from the resume date) · **finished course → zero, never negative** (incl. `used > size`) · junk input
  can't go negative or fractional · and the three detector assertions above.
- ⚠️ **"No `bo.movement` row is created" — I could not assert this against a database** (brownfield; I don't
  touch real environments). What I *did* is stronger than an assumption and weaker than a DB test, stated
  plainly: **grep-verified that `recordSale` has three call sites and none is an import path**, and the import
  functions reference neither `boItem` nor `boMovement`. **Deploy smoke closes it:** import a course, then
  confirm `SELECT count(*) FROM bo.movement WHERE ref_id = '<course id>'` is **0**.
- **Deploy smoke:** `bun run db:migrate` (0017) → import "10 sessions, 4 used, expires 2026-11-30" → course
  has `used_sessions = 4`, that **exact** expiry, `source = 'IMPORT'`, and **6** future bookings · **no
  `bo.movement`** for it · the 08:00 digest / `GET /api/attention` does **not** list it under
  `sales_not_posted`, while a real course sold with the backoffice down **is** listed · book/leave/extend the
  imported course → behaves as a normal course · import for a suspended household → refused · confirm an
  imported session with a freelance teacher → the ceiling draws.

**DoD:** import creates `usedSessions = 4`, exact expiry, `source = 'IMPORT'`, 6 future bookings ✓ (deploy
smoke) · **no `bo.movement`** — grep-verified in code, asserted in smoke, honestly caveated above ⚠️ · the
imported course is a normal course afterwards (same tables, same paths) ✓ · `sales_not_posted` skips imports
**and still flags a real unposted sale** — both tested ✓ · existing rows and the sale path unchanged
(`DEFAULT 'SALE'`) ✓ · suspend refused, ceiling still draws ✓ · remaining-sessions pure and tested, zero not
negative ✓ · **journal audit stated: 18 = 18** ✓.

### One thing I'd flag for after go-live (not built)
Nothing marks an imported course on the UI. Staff will know on day one; in three months "why does this course
have no sale?" is a reasonable question with the answer sitting in `source`. **A badge on the course card is a
small FE follow-up** — not scoped here, and not urgent.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Import the balance, not the history.** If you find yourself wanting to create past bookings to make a number
  look right, stop and tell me — that's a sign the model is wrong, not the data.
- If `usedSessions` equals or exceeds `size`, the course is finished: create it with **zero** future bookings
  rather than refusing. Staff may still want the record. Flag it if you disagree.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 · `bun test` **336/0** · journal **18 = 18**. My own runs.

**I verified the property this task exists for, not the claim about it:**
- **`skipRevenue` appears exactly twice in the codebase — both in comments explaining its deliberate absence.**
  That's better than not mentioning it: the next person who reaches for the obvious flag meets the reason first.
- **`recordSale` has three call sites** (`jobs.service:99`, `scheduler.service:913`, `:1003`) — the day-end job
  and the two **sale** paths. **Neither import function touches `bo` at all.**
- **Route order:** `/courses/import` (`:130`) before `POST /courses` (`:136`), `/vouchers/import` (`:133`)
  before `POST /vouchers` (`:142`). The TASK-029 lesson applied deliberately for the third time without being
  asked.

### The detector exclusion is the best-handled part, and you understood why
You moved the two candidate queries into `search.queries.ts` so the `source = 'SALE'` filter is asserted **from
generated SQL, without a DB** — *and* you put them in the one module nobody stubs (TASK-070's finding), so the
assertion can't be broken by an unrelated test file. That's two lessons from earlier tasks compounding.

**Testing both halves was the requirement and you saw why:** an exclusion and a switched-off check look
identical from one side. Then you added a third I hadn't thought of — **asserting `sales_not_posted` is still
registered**, so nobody "fixes" go-live noise by deleting the check. That's the failure mode I'd actually
expect in a busy launch week, and it's now impossible to do quietly.

### The freelance ceiling: right answer, and better than "handled"
Nothing special was needed, because the draw happens at `updateBookingStatus`, not at insert, and import creates
its sessions through the **same `insertBooking`** — so an imported session draws the ceiling exactly like a sold
one. **You got the outcome by not re-implementing anything**, which is the version least likely to drift.

### The DoD item you couldn't assert — correctly caveated
"No `bo.movement` row" needs a DB, and you said so plainly with a smoke step that closes it, rather than
asserting something weaker and calling it done. That is the standing rule and you applied it without prompting.
It's in the deploy smoke.

**TASK-079 → DONE. @Fern: TASK-080 unblocked.** ⏳ Deploy: `db:migrate` (0017) + restart :4006, in the go-live
batch. **Smoke, and this one is load-bearing:** import "10 sessions, 4 used" → 6 future bookings, `usedSessions
= 4`, the exact expiry, **and no new `bo.movement` row** · then check the digest **does not** list it · then
sell a course normally and confirm revenue **does** post. The last two together are what prove the exclusion
narrowed the check instead of breaking it.
