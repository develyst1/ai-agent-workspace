# SPEC-020: SOM dashboard — customers, sports, new-vs-renewing, demographics, today's attendance
- Source: REQ-013
- Status: ACTIVE

## Overview
One frontoffice dashboard answering the non-financial questions the customer asked at the 2026-07-25 meeting:
who the existing customers are, what sports they do, who is new or renewing this month, who they are
demographically, and how today is going. Money stays out of it — that's REQ-014 (backoffice).

## As-built — what's already there, and one dependency that has dissolved
- **✅ Metric 4 is no longer blocked.** The REQ says demographics "depend on REQ-012"; REQ-012 was **superseded**
  and the fields shipped with **REQ-019/TASK-048** — `students.gender` / `birth_date` / `nationality` and
  `parents.province` are live and **DELIVERED**. All five metrics are computable now.
- **✅ Metric 5 is already built.** `getDailyReport(date)` (`scheduler.service.ts:496`) returns `totalBooked` /
  `attended` / `onLeave` / `noShow` / `pending` — that *is* expected-vs-attended, already served at
  `GET /reports/daily` and already on the Reports page. **Reuse it; do not write a second daily count.**
- **"Non-expired with something left" already has one definition:** `lib/eligibility.ts`'s `courseEligible` /
  `voucherEligible` (TASK-051), the same rule the booking picker uses. Metric 1 reuses them.

## Design decision — one endpoint, one snapshot
`GET /api/reports/som` returns **every section in one response**. Reasons: the sections are read together and
must describe the same instant (five endpoints could straddle a booking); it matches the shape the codebase
already uses for `runAttentionChecks` — one producer, one read; and it keeps the FE a renderer, not an
aggregator. No new table, **no migration**.

## The five sections
| Section | Definition | Source |
|---|---|---|
| `existingCustomers` | distinct students with (a) an eligible **course**, (b) an eligible **voucher**, (c) a **FIRST_TRIAL booking in the last 3 months** | `getCourses` / `getVouchers` + `courseEligible`/`voucherEligible`; `bookings` |
| `sportShare` | share of students per subject, by each student's **primary** sport | `bookings.subjectId`, counted per student |
| `newVsRenewing` | this month: **new** (first-ever FIRST_TRIAL this month · students created this month, **shown separately**) vs **renewing** (a course/voucher created this month for a student who already had one) | `bookings`, `students.createdAt`, course/voucher `createdAt` |
| `demographics` | gender · age band (derived from `birth_date`, **never stored**) · province (**from the parent**) · nationality | `students` + `parents` |
| `today` | expected vs attended | **`getDailyReport(today)` verbatim** |

**Primary sport for a mixed student:** the subject they have the **most bookings** in, ties broken by the most
recent booking. One student contributes **one** unit, so the shares sum to 100% and can be read as "share of
students" — counting every sport a student does would make the percentages sum past 100 and quietly answer a
different question. (Porter's recommendation; I'm taking it.)

## ⚠️ Unknowns are a first-class category, not a filtered-out remainder
This is the part that decides whether the dashboard is trusted, so it is a requirement, not a note.

1. **Every breakdown LEFT-joins and carries an explicit `unknown` bucket.** `students.parent_id` is **nullable
   by design** (walk-in / First-Trial), and gender/DOB/nationality are **all optional** — an inner join would
   silently delete the walk-in cohort and flatter every percentage. This is the condition I attached when Porter
   moved `province` to the parent, and it is the same failure that was already found once in the badge report.
2. **Each section reports its own coverage** — `{ known, unknown, total }` — and **the FE must show it**
   ("based on 12 of 48 students"). Right after launch **most demographics will be blank**, so a bare pie chart
   would be simultaneously accurate and completely misleading. A dashboard that overstates its own confidence is
   worse than one that admits a gap.
3. That gap is already actionable elsewhere: REQ-023's `incomplete_students` check lists exactly who is missing
   data. The dashboard **shows** the hole; the digest **chases** it. Don't duplicate the chasing here.

## API
**`GET /api/reports/som`** (authenticated staff) → `{ existingCustomers, sportShare, newVsRenewing,
demographics, today, generatedAt }`, each breakdown as `{ buckets: [{ key, label?, count }], known, unknown,
total }`. No parameters — "now" and "this month" are Bangkok-relative and computed server-side, so two staff
can't see different months at a boundary.

## Data Model
**None. No migration.** Every field exists.

## Non-functional
- Read-only. No writes, no change to booking, entitlements, the freelance cap or the suspend gate.
- Ages are **derived from `birth_date` at read time and never stored** (the rule set in SPEC-016).
- Reuse `courseEligible` / `voucherEligible` / `getDailyReport` — **no second definition** of active-or-attended.

## Tasks
- **TASK-062** (Jason, BE): `GET /api/reports/som` — the five sections, the unknown buckets + coverage counts,
  pure bucketing helpers tested independently of the queries.
- **TASK-063** (Fern, FE): the dashboard section — charts/cards, **coverage shown next to every breakdown**,
  TH+EN. (depends on TASK-062's shape) — **browser-checked** before DONE.

**Not staged.** Nothing is blocked any more (metric 4's dependency dissolved), and BE→FE is two tasks in one
delivery rather than two stages.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **Two of the REQ's three questions are answered without คุณฟีน, so I'm not spending her attention on them.**
   *Mixed-sport students* → **primary sport** (your recommendation; it's also the only option where the shares
   sum to 100%). *Un-started vouchers* → **counted as current**, which is what `voucherEligible` already says,
   so taking it needs no new rule.
2. **"New this month" — I'm showing both, separately**, rather than picking. "First trial this month" and
   "registered this month" answer different questions (marketing reach vs conversion), the data for both is
   right there, and choosing one would throw away the other for no saving. **Tell me if คุณปุ้ม wants a single
   headline number** and I'll say which one it should be.
3. **⚠️ One definitional call that changes a number on screen — worth one line to คุณฟีน.** "Existing customer
   with a course" reuses `courseEligible`, i.e. **not expired AND sessions remaining**. So a student whose
   course is fully used but not yet expired is **not** counted. I think that's right (they have nothing left to
   book), and the renewal-worthy segment is already surfaced by REQ-023's `nearly_finished_courses` check — but
   it's her definition of "customer", not mine. Non-blocking; the fix is one predicate.
