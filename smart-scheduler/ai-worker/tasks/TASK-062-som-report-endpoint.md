# TASK-062: scheduling (BE) — `GET /api/reports/som` (the five dashboard sections, unknowns included)
- Source: SPEC-020 (REQ-013)
- Status: DONE  (reviewed 2026-08-01 by Sober — he caught + fixed a UTC month-boundary bug himself; unknown bucket always emitted, province LEFT-join real, `ageFrom` null-not-zero, reuse holds; tsc 0 / 255 tests)
- Depends on: none (verified — every field exists)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
One authenticated endpoint returning **all five** sections in one response, so they describe the same instant
and the FE stays a renderer:

**`GET /api/reports/som`** → `{ existingCustomers, sportShare, newVsRenewing, demographics, today, generatedAt }`

**No parameters.** "Today" and "this month" are **Bangkok-relative and computed server-side** — otherwise two
staff at a month boundary see different months and both think the dashboard is wrong.

| Section | Definition |
|---|---|
| `existingCustomers` | distinct students with (a) an eligible **course**, (b) an eligible **voucher**, (c) a **FIRST_TRIAL booking in the last 3 months** |
| `sportShare` | share of students by their **primary** sport |
| `newVsRenewing` | this month: **new by first trial** and **new by registration** (**two separate numbers**), plus **renewing** = a course/voucher created this month for a student who already had an earlier one |
| `demographics` | gender · **age band** · province · nationality |
| `today` | expected vs attended |

### Reuse — no second definitions
- **(a)/(b) use `courseEligible` / `voucherEligible`** from `lib/eligibility.ts` (TASK-051) — the same rule the
  booking picker uses. *(This also settles the REQ's "un-started voucher" question: `voucherEligible` already
  counts it as usable, so we inherit the answer instead of inventing one.)*
- **`today` is `getDailyReport(bangkokNow().date)` verbatim** (`scheduler.service.ts:496`) — it already returns
  `totalBooked` / `attended`. **Do not write a second daily count.**
- **Ages are derived from `birth_date` at read time, never stored** — the rule from SPEC-016.

**Primary sport:** the subject the student has the **most bookings** in, ties broken by the **most recent**
booking. One student contributes exactly **one** unit, so the shares sum to 100%.

## ⚠️ Unknowns are a first-class category — this is the requirement, not a nicety
- **Every breakdown LEFT-joins and carries an explicit `unknown` bucket.** `students.parent_id` is **nullable by
  design** (walk-in / First-Trial) and gender/DOB/nationality are **all optional**. An inner join would delete
  the walk-in cohort and flatter every percentage — the failure already found once in the badge report.
- **Every breakdown also reports `{ known, unknown, total }`**, so the FE can say "based on 12 of 48 students".
  Right after launch most demographics are blank, and a bare percentage would be accurate and completely
  misleading at the same time.
- Shape each breakdown as `{ buckets: [{ key, label?, count }], known, unknown, total }`.

**Read-only.** No writes, no migration, no change to booking, entitlements, the freelance cap or the suspend
gate.

## Definition of Done
- [ ] All five sections in **one** response; no query parameters; "today"/"this month" resolved in Bangkok time.
- [ ] (a)/(b) use `courseEligible`/`voucherEligible` and `today` uses `getDailyReport` — **no second definition
      of "active" or "attended" anywhere in this task**.
- [ ] Every breakdown has an `unknown` bucket **and** `{ known, unknown, total }`; a **walk-in student with no
      parent** appears in the unknown province bucket rather than vanishing.
- [ ] A student with two sports contributes **one** unit to `sportShare` (shares sum to 100%).
- [ ] `newVsRenewing` reports **first-trial-this-month** and **registered-this-month** as **separate** numbers.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — the **bucketing helpers are pure and tested independently
      of the queries**: no-parent → unknown, missing gender/DOB/nationality → unknown, age-band boundaries,
      primary-sport tie-break, and a student with **zero** bookings not breaking `sportShare`.

## Implementation Notes

**Your Question first: nothing was missing.** All five sections come from existing fields — your schema check
held. Read-only, no migration, no change to booking / entitlements / freelance cap / suspend gate.

**I took your "pure function over rows, not clever SQL" instruction literally**, which is why every rule below
is unit-tested without a database.

**`lib/som-report.ts` (pure)**
- **`breakdown(items, keyOf, labelOf?)`** → `{ buckets, known, unknown, total }`. `null`/`undefined`/**blank**
  all fall into `unknown`, and the **`unknown` bucket is always emitted (even at 0)** so the FE never has to
  infer it. Known buckets sort by count desc for a stable render.
- **`ageFrom` / `ageBand`** — age derived from `birth_date` **at read time, never stored** (SPEC-016). No DOB →
  `null` → unknown (**not** age 0, which would silently invent a cohort). Bands live in one `AGE_BANDS` block.
- **`primarySport(bookings)`** — most bookings wins, ties broken by the **most recent** booking (date, then
  time). **Zero bookings → `null`** so a brand-new student can't break the share.
- **`monthOf` / `inMonth`** — see the timezone note below.

**`services/som-report.service.ts`** loads students, parents, bookings, courses, vouchers and the daily report
**in parallel**, then assembles all five sections from the pure helpers. **"Today"/"this month" are resolved
server-side** from `bangkokNow()`; the endpoint takes **no parameters**.
- **Reuse, not re-derivation:** `existingCustomers` (a)/(b) filter with **`courseEligible`/`voucherEligible`**
  (the booking picker's rule — which, as you noted, also settles the un-started-voucher question by
  inheritance), and `today` is **`getDailyReport(today)` verbatim** — no second count of attendance anywhere.
- `existingCustomers` also returns a **distinct `total`** across all three groups (a student on both a course
  and a voucher is one customer), plus `recentTrialSince` so the FE can state the window.
- **`newVsRenewing` keeps the two "new" numbers separate** (`newByFirstTrial`, `newByRegistration`) — they
  answer different questions and one student can legitimately be in both. `renewing` = bought this month while
  already holding an earlier entitlement.

**⚠️ A real bug I caught and fixed while writing it — worth naming because it's the exact failure your "no
parameters, resolve server-side" rule exists to prevent.** My first `inMonth` compared `toISOString()`, i.e.
**UTC**. A course bought 01 Aug 02:00 Bangkok is 31 Jul 19:00 UTC, so for **the first 7 hours of every month**
new/renewing counts would have been filed under the previous month. It now shifts by a fixed +07:00 (Thailand
has no DST, so it's exact) and there's a test pinning both sides of that boundary.

**Unknowns — the requirement, treated as one:** `province` is bucketed over a **JS LEFT-join**
(`{student, parent: null}` for a parentless walk-in), so those students land in `unknown` instead of vanishing;
gender / ageBand / nationality bucket the same way. Every breakdown carries `{known, unknown, total}` so the FE
can render "based on X of Y" — which matters most right after launch, when a bare percentage would be accurate
and completely misleading at once.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **255 pass / 0 fail** (40 files).
- New `lib/som-report.test.ts` (16 cases) covers exactly the DoD list: **no-parent → unknown**, missing
  gender/DOB/nationality → unknown, the unknown bucket present even at 0, **age-band boundaries** (5/6/9/10/15/
  17/18), **primary-sport tie-break** by recency (and by time on the same date), a **zero-booking student →
  unknown, not a crash**, and the **Bangkok month-boundary** case above.
- ✅ **Assembled the breakdowns over representative rows** (4 students incl. one walk-in with no parent and one
  with no bookings) and asserted the guarantees in real output: shares **sum to the student count** (one unit
  each), a **two-sport student counted once**, the **walk-in in the unknown province bucket**, and coverage
  renderable as "2 of 4".
- ⚠️ The DB queries are **deploy smoke** (brownfield). **Smoke:** `GET /api/reports/som` returns all five
  sections with one `generatedAt`; cross-check `today.expected/attended` against `GET /api/reports/daily` (they
  must agree — same producer); confirm a walk-in student appears in `demographics.province.unknown`.

**Maintenance note (third time — flagging the pattern, not asking for anything):** importing `getDailyReport`
into a module `./api` reaches meant the whole-module stub in `api.teacher-routing.test.ts` had to gain that
export too, or the ESM link fails. Same cost I noted in TASK-053. If it recurs, replacing that one stub with a
narrower fake would stop it.

**DoD:** five sections in one response, no params, Bangkok-resolved ✓ · `courseEligible`/`voucherEligible` +
`getDailyReport` reused, no second definitions ✓ · every breakdown has an `unknown` bucket and
`{known, unknown, total}`, walk-in included ✓ · two-sport student = one unit ✓ · the two "new" numbers separate
✓ · tsc clean + `bun test` green with the bucketing helpers tested independently of the queries ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If a section turns out to need a field that isn't there, **flag it and build the other four** — I verified all
  five against the schema, so surprise me with evidence rather than a workaround.
- If any bucketing gets awkward in SQL, do it in a **pure function over rows** instead — I'd rather have it
  testable than clever.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **255/0** (my own run).

### The UTC month bug is the best thing in this task
You wrote `inMonth` against `toISOString()`, caught it yourself, and fixed it to shift +07:00 before comparing.
The failure would have been: **for the first 7 hours of every month**, a course bought at 01 Aug 02:00 Bangkok
files under July — so "new and renewing this month" quietly under-reports at exactly the moment someone opens
the dashboard to see how the month started. Silent, periodic, and self-healing by lunchtime, which is the
hardest kind to ever get reported. **You found it, named the mechanism, fixed it with a fixed offset (correct —
Thailand has no DST) and pinned both sides of the boundary with a test.** That's the whole reason the spec said
"no parameters, resolve server-side", and you found the version of the bug that rule doesn't cover on its own.

### Verified, not taken on trust
- **Unknowns are genuinely first-class.** `breakdown` pushes the `unknown` bucket **unconditionally, even at 0**
  (`:49`), so the FE never has to infer its absence, and blank strings are trimmed into unknown alongside
  null/undefined — the case that would otherwise show up as a bucket named `""`.
- **The province LEFT-join is real** (`som-report.service.ts:41-46`): `{student, parent: null}` for a parentless
  walk-in, so they land in `unknown` instead of vanishing. That was the condition I attached back when province
  moved to the parent, and it's now true in code rather than in a task file.
- **`ageFrom` returns `null` for a missing DOB, not 0.** Worth calling out: age 0 would have invented a cohort
  of infants out of missing data, which is exactly how a dashboard lies while every number is technically real.
- **Reuse holds**: `courseEligible`/`voucherEligible` for (a)/(b), `getDailyReport(today)` verbatim for section
  5. No second definition of "active" or "attended" anywhere in the file.
- **`primarySport` → `null` on zero bookings**, so a brand-new student is unknown rather than a crash, and one
  student contributes one unit so the shares still sum to 100%.
- `existingCustomers` also returning a **distinct** total (a student on both a course and a voucher counts once)
  and `recentTrialSince` so the FE can state the window — both beyond what I asked for, and both right.

**One thing I'm handling on my side, not yours:** `breakdown` hardcodes the unknown bucket's label as
`"ไม่ระบุ"`, so an English dashboard would show Thai. Not a defect — the bucket has a **stable `key`**, so the FE
can label it from its own dictionary, and I've added exactly that instruction to TASK-063. Same shape as the
`titleKey` gap I owned on TASK-053: the API supplies identity, the FE supplies language.

**TASK-062 → DONE. @Fern: TASK-063 unblocked** — `{ existingCustomers, sportShare, newVsRenewing, demographics,
today, generatedAt }`, every breakdown as `{ buckets, known, unknown, total }`.
