# REQ-013: SOM dashboard (frontoffice) — customer / activity / attendance analytics
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-25 meeting (คุณปุ้ม) → relayed by stakeholder 2026-07-29
- Deadline: none
- Source: `smart-scheduler-requirement/20260725-{meeting,todo}.md` (Dashboard req §1–4). The **financial**
  parts (revenue-by-sport, per-customer spend, access control) are split out to REQ-014 (backoffice).

## Problem / Goal
The customer wants an at-a-glance **analytics dashboard** ("SOM report") on the frontoffice, covering the
non-financial picture of their customers, activities, and attendance.

## Requirement
The frontoffice dashboard must show:
1. **Existing customers** — counts of (a) students with a **non-expired course package** (4/6/10), (b) students
   with a **non-expired voucher**, (c) students who did a **FIRST_TRIAL within the last 3 months** (older than
   3 months no longer counts as current).
2. **Proportion of students by sport type** (skate / inline / bike / …) as a share of the whole.
3. **New vs renewing customers this month** — new customers (first trial + register this month) and existing
   customers who bought/renewed a course this month.
4. **Customer demographics** — gender, age, province (customer's province, not the branch's), nationality
   (Thai / foreign). **Depends on REQ-012** (the form capture).
5. **Daily attendance summary** — today, how many students are expected vs. how many showed up.

## Acceptance Criteria
- [ ] Dashboard shows the 3 existing-customer counts (course / voucher / trial-in-3-months).
- [ ] Shows the sport-type proportion.
- [ ] Shows this month's new-customer and renewal counts.
- [ ] Shows the demographics breakdown (once REQ-012 data exists; unknowns handled gracefully).
- [ ] Shows today's expected-vs-attended student count.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- Metrics **1, 2, 3, 5 are computable from existing `public` tables today** — just need **new read endpoints +
  FE** (no schema change): course_packages(size/expiryDate), vouchers(expiry), bookings(FIRST_TRIAL/date/subjectId/
  status), students(createdAt), course/voucher(createdAt), check-in / `GET /reports/daily`.
- **Metric 4 (demographics) needs REQ-012** (fields don't exist yet).
- The current front **Dashboard** page shows only a badge-report; **Reports** shows daily attendance
  (`/reports/daily`). The SOM report is a **new surface** (new endpoints + a new dashboard section).

## Constraints
- Reuse existing tables; add read-only report endpoints. No new financial data on the frontoffice (that's REQ-014).
- HOW (endpoints, charts, layout) is the SA's design.

## Out of Scope
- Revenue by sport, per-customer spend, finance access control → **REQ-014** (backoffice).
- Capturing the demographic fields → **REQ-012**.

## Questions
(SA Lead + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`, don't guess.)
- **Sport proportion for a mixed student** (does more than one sport) — count by their **primary/most-frequent**
  sport, or count each of their sports? (Recommend primary sport per student.)
- **Voucher "non-expired" caveat:** a voucher's real validity starts at its **first booking** (3/6/9-month rule);
  before that the stored expiry is provisional. Count un-started vouchers as current? (Recommend yes.)
- "New this month" = counts by **first trial**, by **registration date**, or both shown separately?

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-013 | SOM dashboard (frontoffice) — customer / activity / attendance analytics | MEDIUM | **SPEC_DONE** — build complete | **@Porter — deploy + acceptance (FE+BE, no migration). BUILD COMPLETE 2026-08-01: TASK-062 ✅ + TASK-063 ✅.** ⚠️ **Tell คุณฟีน BEFORE she opens it:** the demographics sections will show a **low coverage line and a large "unknown" slice on day one** — that is the dashboard being **honest, not broken**; the needs-attention panel lists exactly who is missing data and the number climbs as staff fill it in. SPEC-020 (2026-08-01). **✅ Metric 4 is no longer blocked** — the REQ says demographics depend on REQ-012, but REQ-012 was superseded and the fields shipped with REQ-019 (DELIVERED), so **all five metrics are computable now**. **✅ Metric 5 is already built** — `getDailyReport` (`:496`) already returns totalBooked vs attended; reuse it, do not write a second daily count. Design = **ONE endpoint, one snapshot** (`GET /api/reports/som`) so the sections describe the same instant and the FE stays a renderer; **no parameters** (today/this-month resolved in Bangkok server-side, so two staff at a month boundary cannot see different months); reuses `courseEligible`/`voucherEligible` (TASK-051). **No migration.** 🔴 **Unknowns are a first-class category, not a filtered-out remainder:** every breakdown LEFT-joins with an explicit `unknown` bucket (walk-in students have `parent_id = null` **by design**; gender/DOB/nationality are all optional) **and reports `{known, unknown, total}` which the FE must display** — right after launch most demographics are blank, and a clean pie over 12 of 48 students is accurate and completely misleading at once. The dashboard **shows** the hole; REQ-023 `incomplete_students` **chases** it. **2 of the REQ's 3 questions answered without spending คุณฟีน's attention** (primary-sport = the only option summing to 100%; un-started vouchers = whatever `voucherEligible` already says); "new this month" **shows both** first-trial and registration separately rather than picking. ⚠️ **One definitional call worth a line to her:** "existing customer with a course" reuses `courseEligible` (**not expired AND sessions remaining**), so a fully-used-but-unexpired course does not count — non-blocking, one predicate to change. _Porter's original:_ Sober — spec (2026-07-25 meeting §1–4). Metrics **1/2/3/5 computable now** (existing-customers by course/voucher/trial-3mo, sport %, new/renew this month, daily attendance) → **new read endpoints + FE**; metric **4 (demographics) depends on REQ-012**. Financial parts split to REQ-014. Qs: mixed-student sport rule; voucher-expiry caveat; "new this month" definition. |
```
