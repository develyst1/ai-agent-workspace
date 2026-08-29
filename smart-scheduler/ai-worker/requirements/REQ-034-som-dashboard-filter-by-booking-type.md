# REQ-034: SOM dashboard — filter the figures by booking type (trial / voucher / weekly course)

- Status: READY_FOR_SA
- Priority: **MEDIUM** — REQ-013 passed as built; this is the customer's follow-up after seeing it
- Requested: 2026-08-02 by the project owner, relaying คุณปุ้ม after he reviewed the delivered dashboard
- Deadline: none stated. **Not on the 2026-08-20 critical path** unless the owner moves it.
- Source: owner — *"เขาดูมาแล้วเขาขอเพิ่ม … อยากให้ filter ได้ว่าข้อมูลเหล่านั้นอยากให้เป็นของ first trial
  เท่านั้น หรือเอาแค่ voucher use หรือ weekly course · ใช้ลง activity share อะไรบ้าง skate, ski, onewheel บลาๆ"*

## Problem / Goal

REQ-013 shipped and **the owner has tested it and it passes** — the numbers are right and the screen reads well.
But it answers only one question: *"across everyone, what does the school look like?"*

The customer's follow-up is that **the interesting comparisons are between booking types.** "60 % of our students
do Surfskate" is a different fact depending on whether it describes **trial** students, **voucher** users, or
**weekly course** students — and it is the difference between *who walks in* and *who commits*. Today the
dashboard can only show all three added together.

Goal: **the same dashboard, answerable per booking type.**

## Requirement

1. The SOM dashboard can be **filtered by booking type** — at minimum **First Trial**, **Voucher**, and
   **Weekly Course** — with "all" remaining the default.
2. **Activity share (sport share) must respect the filter.** This is the one the customer named explicitly:
   *"ใช้ลง activity share อะไรบ้าง skate, ski, onewheel"*.
3. Where a section cannot honestly be split by booking type, **say so rather than showing an unfiltered number
   under a filter** — a figure that silently ignores the filter is worse than one that says it can't be filtered.
4. No regression to the delivered dashboard: **"all" must produce exactly the numbers the owner already
   accepted.**

## Acceptance Criteria

- [ ] A booking-type filter exists; default "all" reproduces today's accepted figures **unchanged**.
- [ ] Selecting **First Trial** changes activity share to trial students only; same for Voucher and Weekly Course.
- [ ] Every section either honours the filter or **visibly states that it does not apply**.
- [ ] Counts across the three types reconcile against "all" — or the difference is explained on screen
      (e.g. a student holding both a course and a voucher).

## Analysis / current state (Porter, read-only — for SA to verify)

- REQ-013's dashboard is **one snapshot from `GET /api/reports/som`** (SPEC-020) — the FE renders it as-is and
  does no recomputation. **So this is primarily a backend change**: the snapshot needs to accept a type filter,
  or return the breakdown pre-split.
- ⚠️ **A student can hold more than one entitlement at once** — the two-courses case REQ-029 just fixed proves it
  — so **"trial + voucher + course" will not always sum to "all"**. Decide once, up front, whether the filter
  counts *students* or *entitlements*, and put the answer on the screen. **Getting this wrong produces a
  dashboard whose columns don't add up, which destroys trust in every other number on it.**
- 🔴 **Sport share depends on `subjectId` being right on the booking — and it was NOT, for every voucher booking,
  until REQ-029 shipped today** (the program was auto-filled from the teacher's first subject). **So
  voucher-filtered sport share will be wrong for historical data**, and correctly so — the data is wrong, not the
  report. Whoever builds this should know it; whoever reads the chart should be told.
- The 2026-07-25 meeting already defines the customer cohorts (active course / active voucher / trial within
  3 months), which is the natural vocabulary for this filter rather than inventing a second one.

## Constraints

- Frontoffice + scheduling API. **This is counts, not money** — revenue by sport stays on the backoffice
  (REQ-014).
- Must not change the delivered "all" figures.
- HOW (query parameter vs pre-split payload, control placement) is the SA's design.

## Out of Scope

- Revenue split by sport → **REQ-014** (backoffice, already built).
- New chart types or metrics beyond filtering what exists.

## Questions

1. **Does the filter count students or entitlements?** *(Porter's lean: **students**, because every question the
   customer asked is about people — "what proportion of our students do Surfskate". But then a student with both
   a course and a voucher appears in two filters, and the three will not sum to "all". **Whichever is chosen,
   the screen must say which**, or the first person to add up the columns will stop trusting the dashboard.)*
2. **Which other sections should honour the filter** besides activity share — new vs renewing, demographics,
   existing customers? *(Porter's lean: all of them where it is meaningful; demographics by booking type is
   plausibly the most commercially interesting of the lot — who actually converts.)*

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-034 | SOM dashboard — filter the figures by booking type (trial / voucher / weekly course) | MEDIUM | **SPEC_DONE — `SPEC-032`; TASK-110/111 cut (POST-GO-LIVE)** | **@Porter — 2 non-blocking owner confirms (SPEC-032 §5).** Design: **unit = distinct students** (matches REQ-013's existing sport-share unit, so "All"=today's numbers by construction; a multi-entitlement student appears under each type ⇒ **doesn't sum to All**, stated on screen); one `?bookingType=` param on `GET /api/reports/som` (same computation, filtered input — no duplicated logic); **sport-share + demographics honour** the filter, new-vs-renewing/today carry `applicable=false` flags for what can't be split; **voucher historical caveat** (subjectId pre-REQ-029) surfaced. MEDIUM/off critical path. Prior: | **@Sober — (SPEC-032 done).** Owner 2026-08-02, relaying **คุณปุ้ม after he reviewed the delivered dashboard**: *"filter ได้ว่าข้อมูลเหล่านั้น … first trial เท่านั้น หรือเอาแค่ voucher use หรือ weekly course · ใช้ลง activity share อะไรบ้าง skate, ski, onewheel"*. ✅ **REQ-013 itself PASSED — the owner tested it and it reads well.** This is a follow-up, not a defect. **Mostly BE**: the FE renders `GET /api/reports/som` as-is and recomputes nothing, so the snapshot must accept the filter or pre-split. ⚠️ **A student can hold more than one entitlement** (the two-courses case REQ-029 just fixed proves it) ⇒ **trial + voucher + course will NOT sum to "all"**. Decide **students vs entitlements** once, up front, and **put the answer on the screen** — a dashboard whose columns don't add up destroys trust in every other number on it. 🔴 **And know this before building sport share by type: `subjectId` was WRONG on every voucher booking until REQ-029 shipped today** (auto-filled from the teacher's first subject) — so voucher-filtered sport share is wrong for historical data. **The data is wrong, not the report**; whoever reads that chart must be told. Default "all" must reproduce the accepted figures **unchanged**. ❓ students-or-entitlements (Porter's lean: students — every question he asked is about people) · which other sections honour it (lean: all where meaningful; **demographics by booking type is plausibly the most commercially interesting — who actually converts**). |
```
