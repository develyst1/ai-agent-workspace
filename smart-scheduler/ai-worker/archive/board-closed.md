# Closed board rows — smart-scheduler

> Rows that left `board.md` once their Status reached **DONE**, **DELIVERED**, or
> **CODE ACCEPTED**. They are copied here **verbatim** — same wording, same order,
> same table they sat in — and are never edited, re-worded, or re-statused afterwards.
>
> This file is **append-only**: each housekeeping sweep adds a new `## Swept <date>`
> section at the **bottom**. Older sections stay exactly as they were written.
>
> This is history, not a work list. Nothing here is waiting on anyone. For anything
> still in flight, read `board.md`.
>
> A byte-identical copy of the board as it stood immediately before the first sweep is
> kept at `archive/board-2026-08-31-pre-split.md`.

## Swept 2026-08-31

Moved off `board.md` on 2026-08-31: **22 Requirements rows + 168 Tasks rows = 190 rows**.
Board before the sweep: 41,754 bytes. No row was reworded, re-ordered, or re-statused.

### Requirements

| ID | Title | Prio | Status | Next step · tasks |
|----|-------|------|--------|-------------------|
| REQ-001 | Freelance pay as monthly budget-stock + cap | HIGH | **DELIVERED** | Live 07-20. Leftover: 2 scheduled tasks + real numbers. |
| REQ-002 | Backoffice admin auth (login + real JWT) | HIGH | **DELIVERED** | Live 07-20 (`SKIP_ADMIN_AUTH=false`). |
| REQ-004 | Freelance limit moved into the frontoffice | HIGH | **DELIVERED** | Confirmed 07-20. |
| REQ-005 | Standalone teacher management (REQ-003 minus ops sync) | HIGH | **DELIVERED** | Acceptance PASSED 07-28. TASK-029 DONE. |
| REQ-006 | Backoffice rebuild — universal "item" model, shared DB | HIGH | **DELIVERED** | Acceptance PASSED 07-28. TASK-028, TASK-030 DONE. |
| REQ-007 | Freelance cap on the calendar — strip + hide when full | MED | **DELIVERED** | PASSED 07-29. TASK-032 DONE (supersedes TASK-031). |
| REQ-008 | Bulk-confirm bookings (multi-select) | MED | **DELIVERED** | PASSED 07-29. TASK-036, TASK-037 DONE. |
| REQ-010 | Sport program shown on the bookings course list | MED | **DELIVERED** | PASSED 07-29. TASK-034, TASK-035 DONE. |
| REQ-011 | Student picker did not filter when typing | MED | **DELIVERED** | PASSED 07-29. TASK-033 DONE. |
| REQ-019 | People management on the frontoffice | MED | **DELIVERED** | Re-acceptance PASSED 08-01. TASK-052, TASK-056, TASK-057, TASK-051, TASK-048, TASK-049 DONE. Aggregation must LEFT-join an "unknown" bucket or the trial cohort vanishes from REQ-013. |
| REQ-030 | A course is an editable PLAN (teacher/date, inserts) | HIGH | **DELIVERED** (`sid` 08-10) | TASK-092, TASK-096, TASK-091 DONE. Notice is a `lib/` constant; its editability is REQ-031. |
| REQ-032 | Migrations must never fail silently; split ledgers | HIGHEST | **DELIVERED 08-02** | Witness seeding + self-verifying `db:migrate`. |
| REQ-036 | End a course early — the `ยกเลิกคอร์ส` button | HIGH | **DELIVERED 08-25** | Soft-cancel + write-guard on an ended course. TASK-185, TASK-183, TASK-188, TASK-189, TASK-186, TASK-181, TASK-182. |
| REQ-043 | Booking modal — one student picker on all tabs | MED–HI | **DELIVERED 08-23** | Verified on `uat`. TASK-131 DONE. |
| REQ-044 | The `คอร์ส` tab must say what it does | MED–HI | **DELIVERED 08-23** | Resolved by REMOVING the tab. TASK-143 DONE. |
| REQ-052 | Calendar cell must show program + booking type | MED–HI | **DELIVERED 08-25** | Built ONCE, bundled with REQ-068. TASK-142, TASK-141. |
| REQ-068 | A note on the session | MED | **DELIVERED 08-25** | Live on `uat` (`attendee_note`, `0022`). Follow-up → @Sober (TASK-142). |
| REQ-053 | `แก้ไขคาบ` must not change วิชา on a course session | HIGH | **DELIVERED 08-23** | Read-only + explanation line on `uat`. TASK-133, TASK-134. |
| REQ-054 | A course is created with ONE program | HIGH | **DELIVERED 08-23** | ~43 `uat` courses, no mixed case. TASK-138, TASK-139, TASK-140. |
| REQ-065 | `1st Trial` is not a program | MED–HI | **DELIVERED 08-23** | Filtered at `toTeacherDTO` ⇒ no FE change. TASK-173. |
| REQ-037 | EXTRA one-time paid session, outside the quota | HIGH | **DELIVERED** (`sid` 08-10) | Unlike REQ-030's Insert it does not shrink the tail. TASK-112. |
| REQ-016 | Teacher self-service — my schedule on LINE | MED | **DELIVERED** | PASSED 07-30 on the real OA. TASK-043. |

### Tasks

| ID | Title | Source | Status | Assignee |
|----|-------|--------|--------|----------|
| TASK-001 | bo-BE: reversible P&L expense… | SPEC-001 | DONE | Jason |
| TASK-002 | BE: freelance draw-down at… | SPEC-001 | DONE | Jason |
| TASK-003 | bo-FE: "Freelance Budgets"… | SPEC-001 | DONE | Fern |
| TASK-004 | FE: baht remaining/budget +… | SPEC-001 | DONE · see TASK-008 | Fern |
| TASK-005 | bo-BE: recurring FT/PT salary… | SPEC-002 | DONE | Jason |
| TASK-006 | bo-FE: "FT/PT Salary" admin… | SPEC-002 | DONE | Fern |
| TASK-007 | BE: end-of-day REVENUE tally… | SPEC-001 | DONE | Jason |
| TASK-008 | BE: teacher DTO budget fields… | SPEC-001 | DONE | Jason |
| TASK-009 | bo-BE: PATCH /catalog/items/:i… | SPEC-001 | DONE | Jason |
| TASK-010 | bo-FE: Edit modal for… | SPEC-001 | DONE | Fern |
| TASK-011 | align cross-service port… | SPEC-001 | DONE | Jason |
| TASK-012 | bo-BE: seed first-trial /… | SPEC-001 | DONE | Jason |
| TASK-013 | bo-BE: admin login endpoint +… | SPEC-003 | DONE | Jason |
| TASK-014 | bo-FE: login page + cookie… | SPEC-003 | DONE | Fern |
| TASK-015 | bo-BE: serviceAuth… | SPEC-004 | DONE | Jason |
| TASK-016 | BE: teacher CRUD + archive +… | SPEC-004 | DONE | Jason |
| TASK-017 | FE: teacher add/edit/change-ty… | SPEC-004 | DONE | Fern |
| TASK-018 | BE: teacherops drift… | SPEC-004 | DONE | Jason |
| TASK-019 | BE: local freelance budget… | SPEC-005 | DONE | Jason |
| TASK-020 | FE: frontoffice freelance… | SPEC-005 | DONE | Fern |
| TASK-021 | bo-BE: `bo` schema +… | SPEC-006 | DONE | Jason |
| TASK-022 | bo-BE: universal item/movement… | SPEC-006 | DONE | Jason |
| TASK-023 | bo-FE: admin UI on the… | SPEC-006 | DONE | Fern |
| TASK-024 | BE: re-absorb freelance… | SPEC-006 | DONE | Jason |
| TASK-025 | bo-BE: data migration `ops.… | SPEC-006 | DONE | Jason |
| TASK-026 | FE: re-point freelance budget… | SPEC-006 | DONE | Fern |
| TASK-027 | bo-BE: shared-DB topology fix… | SPEC-006 | DONE | Jason |
| TASK-028 | BE: freelance-drawdown… | SPEC-006 | DONE · see TASK-104 | Jason |
| TASK-029 | BE: standalone teacher mgmt… | SPEC-007 | DONE | Jason |
| TASK-030 | bo-BE: make `migrate:bo… | SPEC-006 | DONE | Jason |
| TASK-031 | FE: freelance budget strip on… | SPEC-008 | DONE | Fern |
| TASK-032 | FE: REQ-007 revised… | SPEC-008 | DONE | Fern |
| TASK-033 | BE: fix student search… | SPEC-009 | DONE | Jason |
| TASK-034 | BE: add `subject… | SPEC-010 | DONE | Jason |
| TASK-035 | FE: render the sport-program… | SPEC-010 | DONE | Fern |
| TASK-036 | BE: `POST /bookings/bulk-confi… | SPEC-011 | DONE | Jason |
| TASK-037 | FE: multi-select PENDING rows… | SPEC-011 | DONE | Fern |
| TASK-038 | BE/LINE: tap UI… | SPEC-012 | DONE | Jason |
| TASK-039 | BE/LINE: bilingual TH/EN… | SPEC-012 | DONE | Jason |
| TASK-040 | BE/LINE: re-runnable `bun run… | SPEC-012 | DONE | Jason |
| TASK-041 | LINE artwork: 4 rich-menu… | SPEC-012 | DONE | Fern |
| TASK-042 | BE: register `0012_line_lang… | SPEC-012 | DONE | Jason |
| TASK-043 | BE/LINE: teacher "my… | SPEC-013 | DONE | Jason |
| TASK-048 | BE: people endpoints +… | SPEC-016 | DONE | Jason |
| TASK-049 | FE: `/scheduler/people… | SPEC-016 | DONE | Fern |
| TASK-050 | BE: small people-endpoint… | SPEC-016 | DONE | Jason |
| TASK-069 | FE: parent note field + drop… | SPEC-016 | DONE | Fern |
| TASK-070 | BE: one search rule + paging… | SPEC-022 | DONE | Jason |
| TASK-072 | BE: replace the leaky… | — | DONE | Jason |
| TASK-071 | FE: Bookings page… | SPEC-022 | DONE | Fern |
| TASK-073 | BE: `sort` param on… | SPEC-022 | DONE | Jason |
| TASK-074 | FE: date sort control on the… | SPEC-022 | DONE | Fern |
| TASK-075 | BE: teacher link REQUESTS +… | SPEC-023 | DONE | Jason |
| TASK-076 | FE: teacher link approval… | SPEC-023 | DONE | Fern |
| TASK-077 | BE: per-program pricing… | SPEC-024 | DONE | Jason |
| TASK-078 | FE: course creation offers… | SPEC-024 | DONE | Fern |
| TASK-079 | BE: import an in-progress… | SPEC-025 | DONE | Jason |
| TASK-080 | FE: the "already part-way… | SPEC-025 | DONE | Fern |
| TASK-081 | FE: REQ-024's last defect… | SPEC-022 | DONE | Fern |
| TASK-082 | FE: hide the old Dashboard… | REQ-026 | DONE | Fern |
| TASK-051 | BE: `GET /students/eligible?ty… | SPEC-017 | DONE | Jason |
| TASK-052 | FE: booking modal type-first… | SPEC-017 | DONE | Fern |
| TASK-056 | BE: REQ-019 acceptance… | SPEC-016 | DONE | Jason |
| TASK-057 | FE: booking picker passes… | SPEC-016 | DONE | Fern |
| TASK-058 | BE: sell-side suspend block… | SPEC-016 | DONE | Jason |
| TASK-059 | FE: drop the `bookable… | SPEC-016 | DONE | Fern |
| TASK-060 | BE: close the freelance… | SPEC-019 | DONE | Jason |
| TASK-061 | FE: confirm before a type… | SPEC-019 | DONE | Fern |
| TASK-062 | BE: `GET /api/reports/som… | SPEC-020 | DONE | Jason |
| TASK-063 | FE: the SOM dashboard section | SPEC-020 | DONE | Fern |
| TASK-066 | BE: REPAIR THE SALE WRITE… | SPEC-021 | DONE | Jason |
| TASK-067 | BE: 8th attention check… | SPEC-018 | DONE | Jason |
| TASK-064 | bo-BE: sale attribution map +… | SPEC-021 | DONE | Jason |
| TASK-065 | bo-FE: revenue-by-activity +… | SPEC-021 | DONE | Fern |
| TASK-083 | bo-BE: `unattributed` reason… | SPEC-021 | DONE | Jason |
| TASK-084 | bo-FE: render `unattributed… | SPEC-021 | DONE | Fern |
| TASK-085 | BOTH repos: per-repo… | — | DONE | Jason |
| TASK-086 | BOTH repos: seed the ledger… | — | DONE | Jason |
| TASK-087 | bo-BE: third verdict… | — | DONE | Jason |
| TASK-088 | BE: `q` on `GET /students/elig… | SPEC-026 | DONE | Jason |
| TASK-089 | FE: voucher program is now… | SPEC-026 | DONE | Fern |
| TASK-090 | FE: mint a QA session cookie… | SPEC-027 | DONE | Fern |
| TASK-091 | BE: LIVE MONEY BUG… | — | DONE | Jason |
| TASK-092 | BE: course-plan reconcile… | SPEC-028 | DONE · see TASK-093 | Jason |
| TASK-093 | BE: `applyPlanChange` atomic… | SPEC-028 | DONE · see TASK-103 | Jason |
| TASK-107 | FE: voucher program picker… | SPEC-030 | DONE | Fern |
| TASK-109 | FE: record a rental in a few… | SPEC-031 | DONE · see TASK-123 | Fern |
| TASK-123 | BE: expose `rentalItems:{code… | SPEC-031 | DONE | Jason |
| TASK-124 | FE: student search on… | REQ-038 #3 | DONE | Fern |
| TASK-126 | BE: `db:backup` script… | prod runbook | DONE | Jason |
| TASK-128 | FE: one colour token source… | SPEC-037/REQ-041 | DONE | Fern |
| TASK-150 | BE: GO-LIVE wave-1 importer… | SPEC-051/REQ-055 | DONE | Jason |
| TASK-152 | BE: `notifyAdmins` — when… | REQ-049 | DONE | Sober |
| TASK-153 | BE: `subjects:add… | SPEC-053/REQ-058 | DONE | Sober |
| TASK-154 | BE: REQ-060 Part A — importer… | SPEC-054/REQ-060 A | DONE | Sober |
| TASK-155 | BE: `teacher-subjects:link-all… | SPEC-055/REQ-058 | DONE | Sober |
| TASK-156 | BE: REQ-059 importer… | SPEC-056/REQ-059 | DONE | Sober |
| TASK-157 | BE: REQ-060 Part B.1… | SPEC-057/REQ-060 B | DONE | Sober |
| TASK-158 | BE: REQ-061 Onewheel price +… | SPEC-058/REQ-061 | DONE | Sober |
| TASK-159 | bo-BE: REQ-063 finance… | SPEC-059/REQ-063 | DONE | Sober |
| TASK-160 | BE: REQ-063 sale path… | SPEC-059/REQ-063 | DONE | Sober |
| TASK-161 | FE: REQ-063 discount form… | SPEC-059/REQ-063 | DONE · see TASK-164 | Fern |
| TASK-162 | BE: REQ-063 DAY-END moment… | SPEC-059/REQ-063 | DONE · see TASK-163 | Sober |
| TASK-163 | BE: REQ-063 follow-up… | SPEC-059/REQ-063 | DONE | Sober |
| TASK-164 | BE: REQ-063 unblock last 2… | SPEC-059/REQ-063 | DONE | Sober |
| TASK-165 | BE: REQ-064 core — new… | SPEC-060/REQ-064 | DONE | Sober |
| TASK-166 | BE: REQ-064 AC-7/Q2 read-only… | SPEC-060/REQ-064 | DONE | Sober |
| TASK-167 | FE: REQ-064 AC-8 — "Already… | SPEC-060/REQ-064 | DONE | Fern |
| TASK-168 | BE: REQ-063 baht/satang money… | REQ-063 AC-15/16 | DONE · see TASK-169 | Sober |
| TASK-169 | FE: REQ-063 baht/satang… | REQ-063 AC-15/16 | DONE | Fern |
| TASK-151 | BE: GO-LIVE BLOCKER… | SPEC-052/REQ-040 | DONE | Jason |
| TASK-149 | FE: create-mode Planned… | SPEC-049/REQ-045 | DONE | Fern |
| TASK-148 | BE: `bookings.planned_at_creat… | SPEC-049/REQ-045 | DONE | Jason |
| TASK-146 | BE: 2 number settings… | SPEC-048/REQ-047 | DONE | Sober |
| TASK-145 | BE: check-in Gap-A/AC-3… | SPEC-043/REQ-050 | DONE | Jason |
| TASK-144 | BE: check-in Gap-C (money)… | SPEC-043/REQ-050 | DONE | Jason |
| TASK-143 | FE: remove `COURSE_PACKAGE… | SPEC-047/REQ-044 | DONE | Fern |
| TASK-142 | FE: calendar cell = program+type+note under one… | SPEC-046+063 | CODE ACCEPTED | Fern |
| TASK-141 | BE: add `nickname` to the… | SPEC-046/REQ-052 | DONE | Jason |
| TASK-140 | BE: add `course_packages.subje… | SPEC-045/REQ-054 | DONE | Jason |
| TASK-139 | FE: course create — subject… | SPEC-045/REQ-054 | DONE | Fern |
| TASK-138 | BE: refuse creating a… | SPEC-045/REQ-054 | DONE | Jason |
| TASK-137 | FE: settings screen enum row… | SPEC-044/REQ-049 | DONE | Fern |
| TASK-136 | BE: notify-on-leave — extend… | SPEC-044/REQ-049 | DONE | Jason |
| TASK-135 | BE: LINE leave — enrich… | SPEC-041/REQ-046 | DONE | Jason |
| TASK-134 | BE: server refuse a subject… | SPEC-042/REQ-053 | DONE | Jason |
| TASK-133 | FE: PlanModal `SessionEditor… | SPEC-042/REQ-053 | DONE | Fern |
| TASK-132 | FE: voucher branch — render… | SPEC-040/REQ-048 | DONE | Fern |
| TASK-131 | FE: unify the Course/Voucher… | SPEC-039/REQ-043 | DONE | Fern |
| TASK-130 | BE: `line:adopt-menus… | SPEC-038/REQ-042 | DONE | Jason |
| TASK-129 | FE: `tabular-nums` on… | SPEC-037/REQ-041 | DONE | Fern |
| TASK-125 | FE: expiry tiebreaker in the… | OBS-5 | DONE | Fern |
| TASK-113 | FE: visibly-separate "Add… | SPEC-033 | DONE | Fern |
| TASK-115 | FE: disable Insert only when… | SPEC-028 §12 | DONE | Fern |
| TASK-095 | BE: purchase-time endpoints… | SPEC-028 | DONE | Jason |
| TASK-096 | BE: `orphaned_sessions… | SPEC-028 | DONE | Jason |
| TASK-097 | BE: per-entitlement plan DTO… | SPEC-028 | DONE | Jason |
| TASK-099 | FE: THE SHARED plan-modal… | SPEC-028 | DONE · see TASK-098 | Fern |
| TASK-098 | FE: purchase-time create-mode… | SPEC-028 | DONE | Fern |
| TASK-102 | FE: Settings screen — list… | SPEC-029 | DONE · see TASK-122 | Fern |
| TASK-122 | BE: `DELETE /api/settings/:key… | SPEC-029 | DONE | Jason |
| TASK-055 | BE: server backstop — require… | SPEC-017 | DONE | Jason |
| TASK-053 | BE: attention-check registry… | SPEC-018 | DONE | Jason |
| TASK-054 | FE: "needs attention" panel +… | SPEC-018 | DONE | Fern |
| TASK-047 | BE/LINE: stop the PII leak… | SPEC-015 | DONE | Jason |
| TASK-046 | BE/LINE: already-linked user… | SPEC-012 | DONE | Jason |
| TASK-045 | BE/LINE: diagnose dead… | SPEC-012 | DONE | Jason |
| TASK-044 | BE: per-teacher `.ics… | SPEC-014 | DONE | Jason |
| TASK-119 | BE: course deduction history… | SPEC-035 | DONE | Jason |
| TASK-120 | FE: read-only "ประวัติการตัดคอ… | SPEC-035 | DONE | Fern |
| TASK-121 | FE: course context in the… | SPEC-035 | DONE | Fern |
| TASK-170 | FE: REQ-063 booking discount… | REQ-063 | DONE · see TASK-171, TASK-172 | Fern |
| TASK-171 | BE: REQ-063 req8/AC-10… | REQ-063 | DONE | Sober |
| TASK-172 | FE: REQ-063 hardening… | REQ-063 | DONE | Fern |
| TASK-173 | BE: REQ-065 — filter… | SPEC-061/REQ-065 | DONE | Sober |
| TASK-174 | BE: REQ-066 (blocking)… | REQ-066 | DONE | Sober |
| TASK-175 | BE: REQ-069 + REQ-067 Part B… | REQ-069/067B | DONE | Sober |
| TASK-176 | FE: REQ-067 Part A — rename… | REQ-067 A | DONE | Fern |
| TASK-177 | BE: REQ-057 scoped course… | SPEC-062/REQ-057 | DONE | Sober |
| TASK-178 | BE: REQ-068 session note… | SPEC-063/REQ-068 | DONE · see TASK-179 | Sober |
| TASK-180 | BE: REQ-070 kill NO_SHOW… | REQ-070 | DONE | Sober |
| TASK-209 | BE: the daily-reminder must ALWAYS write a… | SPEC-066/REQ-072 | **DONE** (Sober 08-29) | Jason |
| TASK-211 | BE: REQ-074 — cancel a 1HR / Voucher booking… | SPEC-067/REQ-074 | **DONE** (Sober 08-29) · with TASK-212 | Jason |
| TASK-213 | BE: import-form batch — off-card size 500s →… | SPEC-068 | **DONE** (Sober 08-29) | Jason |
| TASK-215 | BE: import-form batch — `leaveQuota` missing… | SPEC-068 | **DONE** (Sober 08-29) · see TASK-217 | Jason |
| TASK-217 | BE: off-card import 500s — `course_size_chk… | SPEC-068 | **DONE** (Sober 08-29) | Jason |
| TASK-219 | BE: REQ-007's missing half — the attendee note… | SPEC-066 | **DONE** (Sober 08-29) | Jason |
| TASK-220 | scheduler-front + scheduler-back: cancel a… | SPEC-067/REQ-074 | **DONE** (Sober 08-29) | Fern + Jason |
