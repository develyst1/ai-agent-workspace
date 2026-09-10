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

## Swept from board.md on 2026-09-05 — 27 DONE task rows (Porter, hygiene FAIL: board >40KB)

> Verbatim, nothing edited. These are **DONE (code)** rows; deploy state lives in the board's PENDING DEPLOY block, not here.

| Task | What | Source | State | Owner |
|---|---|---|---|---|

## Swept from board.md on 2026-09-05 — 27 DONE task rows (Porter; hygiene FAIL: board >40KB)

> Verbatim, nothing edited. These are **DONE (code)** rows — **deploy state is NOT here**, it lives in the board's PENDING DEPLOY block. A row being archived says the code landed, never that it shipped.

| Task | What | Source | State | Owner |
|---|---|---|---|---|
| TASK-147 | FE: dict keys (label/help TH+EN) for the 2… | SPEC-048/REQ-047 | ✅ **DONE — code** (Sober 09-01) · local login check = @Tanya | Fern |
| TASK-218 | BE: daily reminder — per-RECIPIENT idempotency… 🔴 **migration 0028** | Porter flag 08-29 | ✅ **DONE** (Sober 09-01) ✅ `0028` applied + witnessed on `sid` | @Jason |
| TASK-221 | BE: `GET /bookings/:id/posted-sale` — was this booking's revenue already posted? | SPEC-069 | ✅ **DONE** (Sober 09-01) · FE half = TASK-222 | @Jason |
| TASK-222 | FE: cancel dialog says what is already in the books (amount + date, and a loud "could not verify") | SPEC-069 | ✅ **DONE — code** (Sober 09-01) · Q1/Q2 answered · 3 rendered states + 375 = @Tanya | @Fern |
| TASK-223 | BE: `link-all` header documents a policy the owner revoked — `sid`-only, cannot unlink | Porter 08-29 | ✅ **DONE** (Sober 09-01) | @Jason |
| TASK-224 | BE: `OTHER` core — migration (enum + nullable student/subject + title/price cols) · validation · `displayName` · cancel enum · 🆕 `booking_teachers` (multi-teacher) · AC-21 no freelance draw | SPEC-070/REQ-078 | ✅ **DONE** (Sober 09-01) · `0029` applied + witnessed on `sid` ✅ · `uat` with the batch | @Jason |
| TASK-225 | BE: charging an อื่นๆ — typed amount OR catalogue item, posted at day-end on `rev:<bookingId>` | SPEC-070/REQ-078 | ✅ **DONE — code** (Sober 09-01) · follow-up TASK-229 | @Jason |
| TASK-226 | FE: the booking form — อื่นๆ, title, charge (amount OR item), consume · 🆕 several teachers (≥1) | SPEC-070/REQ-078 | ✅ **DONE — code** (Sober 09-01) · Q1/Q2 answered · local rendered check = @Tanya | @Fern |
| TASK-227 | FE: the อื่นๆ cell + one `displayName` everywhere a booking is named · 🆕 AC-18 one booking in every teacher’s column | SPEC-070/REQ-078 | ✅ **DONE — code** (Sober 09-01) · Q1/Q2/Q3 answered · 375 measurement = @Tanya | @Fern |
| TASK-228 | BE: teacher LINE for อื่นๆ — the typed title names it (AC-16 revised — EVERY assigned teacher; AC-17 WITHDRAWN) | SPEC-070/REQ-078 | ✅ **DONE — code** (Sober 09-01) · rendered LINE = @Tanya | @Jason |
| TASK-229 | BE: `/catalog-items` must not offer this repo’s own sale items (`IS DISTINCT FROM` — mind the NULL case) | SPEC-070 Q2 | ✅ **DONE** (Sober 09-01) · DATA REQUEST with @Porter | @Jason |
| TASK-236 | BE: DEF-3 — the bookings list COUNTS อื่นๆ rows then inner-joins them away (`getBookings` :768/:770) | REQ-078 DEF-3 | ✅ **DONE — code** (Sober 09-01) · re-test = @Tanya | Sober |
| TASK-237 | FE: DEF-1 + DEF-5 — the form dies on a null `.value` when the last teacher chip is removed | REQ-078 DEF-1/5 | ✅ **DONE — code** (Sober 09-01) · lead disproved, real cause was TASK-226's lazy updater · regression fails without the fix · DEF-5 re-walk = @Tanya | @Fern |
| TASK-238 | BE: AC-24 revised — the clash refusal names the teacher + the clashing booking · + the DEF-4 other-writer sweep | REQ-078 AC-24 | ✅ **DONE — code** (Sober 09-01) · sweep found an open door → TASK-239 | Sober |
| TASK-239 | BE: an ADDITIONAL teacher must not be double-booked — the door `bookings_teacher_slot_uq` does not guard | REQ-078 / TASK-238 sweep | ✅ **DONE — code** (Sober 09-01) · one definition of "live" left in the repo | Sober |
| TASK-241 | FE: DEF-6 — the confirm dialog must name EVERY assigned teacher (the SEND already fans out — proven from source) | REQ-078 DEF-6 | ✅ **DONE — code** (Sober 09-02) · 🏁 last build item on REQ-078 · chip ruling (Q1) + the count (Q2) → @Porter · rendered = LOCAL | @Fern |
| TASK-230 | BE: LINE — migration: `family_line_links` + `family_invites` + `muted_until`/`unexpected_count` | SPEC-071 | ✅ **DONE — code** (Sober 09-02) · 🔴 `0030` awaits the `sid` run → @Porter | Sober |
| TASK-231 | BE: LINE — 🔴 silence by default is a CHANGE to shipped behaviour (§16) + mute + two-strikes | SPEC-071 | ✅ **DONE — code** (Sober 09-02) · TTL at the source, touch is route-scoped · ⚠️ re-test needs 30 min of silence first | Sober |
| TASK-232 | BE: LINE — Flow 1 (invite → phone → children). Flow 2 DELETED; `parentChildrenNote` untouched | SPEC-071 | ✅ **DONE — code** (Sober 09-02) · 🔴 2FA ships OFF and **cannot be switched on** until the owner answers code DELIVERY | Sober |
| TASK-233 | BE: LINE — Flow 3 เพิ่มนักเรียน: summary before write, admin told, nothing partial | SPEC-071 | ✅ **DONE — code** (Sober 09-02) · `0031` pending on `sid` with `0030` | Sober |
| TASK-234 | BE: LINE — Flows 4–6 on the EXISTING pickers + the two rich menus | SPEC-071 | ✅ **DONE — code** (Sober 09-02) · 🔴 **menus NOT live** until published with images — see PENDING DEPLOY | Sober |
| TASK-243 | BE+FE: an admin must be able to CLEAR a family’s LINE link — today "contact an admin" points at nobody | TASK-232 Q3 | ✅ **DONE** (Sober 09-02) — BE + FE · 🏁 last open code in REQ-079 | Sober |
| TASK-245 | BE: **a parent is never stuck** — an exit at every step · reserved words mean what they say · rule 5 actually fires | Porter ORDER 09-02 | ✅ **DONE — code** (Sober 09-03) · one command list · exit checked before any step reads · strike sites **4→6** (the 4→11 in my review was a COMMENT count — corrected by Jason 09-03; pinned at 7 incl. declaration in `line-silence.test.ts`) | @Sober |
| TASK-246 | BE: **DEF-8 + §14** — a mute silences the bot’s initiative, never the parent’s way OUT or BACK IN | Porter DEF-8 09-03 | ✅ **DONE — code** (Sober 09-03 r2) · one `FLOW_CLEARED` for both writers · un-mute clears the flow, scoped to *muted-right-now* so an unmuted parent’s live flow survives · `สมัคร` ORDER pinned by test · 1278/0 · 🧪 DEF-8 replay + Round C need a PHONE ⇒ @Porter → owner (NOT @Tanya — owner 09-05) | @Porter |
| TASK-247 | BE: **REQ-079 rich menus** — two orange menus, AND the publish path that never created them | REQ-079 · Porter 09-05 | ✅ **DONE — code** (Sober 09-05) · publish creates **6**, default → **unknown**, `storeMenuIds` **merges** (pure `mergeMenuIds`) · generator↔code bounds test **with a permanent negative control** · 4 old PNGs byte-identical · tsc 0 · **1295/0** · 🚫 nothing published — see PENDING DEPLOY 2 + 4 | @Porter (deploy) |
| TASK-248 | BE: **DEF-9** — `เข้าใช้ระบบ` asks for a phone and sets no step, so nothing receives it | DEF-9 (owner 09-05) | ✅ **DONE — code** (Sober 09-05) · tsc 0 · 1316/0 · 🧪 phone run = **owner, not @Tanya** — see the TASK + log 09-05 | @Porter |
| TASK-249 | BE: **C-13 evidence** — the per-user menu link must follow the DB link state | C-13 · Porter 09-05 | ✅ **DONE — code** (Sober 09-05) · un-link on **both** clear paths (2nd case: departed teachers) · 🔴 a passing test had **pinned** the missing call — see the TASK + log 09-05 | @Sober |

## Swept from board.md 2026-09-06 by Porter — 14 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-250 | BE: **`line:remove-menus`** — take our rich menus off an account, **reviewably** (owner refused the raw API calls) | Owner → Porter 09-05 | ✅ **DONE — code** (Sober 09-05) · dry-run default, `--apply` needs `REMOVE <n>` typed · 🔴 Jason caught: a **foreign** default is reported and LEFT, not cancelled · 🚫 nobody here has run it. Detail in the TASK. | @Porter (owner runs it) |
| TASK-251 | BE: **REQ-079 §16** — the role step stops accepting bare numbers, becomes a picker | Customer → Porter 09-05 | ✅ **DONE — code** (Sober 09-06) · `rolePicker` postbacks; `parseRoleChoice` refuses `1/2/3` **and `๑`** · 🔴 **the first-strike re-ask now re-sends the PICKER** — chips vanish on typing, so the buttons were offered once, *to everyone except the person who just proved they needed them* · label↔parser tied by a test (the drift only a PC user hitting a renamed label would find) · deviation accepted: `action=role&role=X` keeps the product's one dispatch style · 🔴 **my Q2 quoted a SYSTEM-FACTS line the same file had already corrected** · tsc 0 · **1485/0** | @Porter |
| TASK-252 | BE: **a menu is OURS by its NAME**, not by a row we own and mutate | Porter 09-05 → Sober 09-06 | ✅ **DONE — code** (Jason 09-06) · one predicate `ourMenuMatch` in `line-rich-menu.ts`, **id OR name**, derived from the defs · both readers rewired, **asserted neither keeps a copy** (`ChannelMenu` is now an alias, not a twin) · 🔴 **a TASK-250 test had to be CORRECTED — it asserted `toDelete: []` / 6 foreign for six menus we made**: the defect written down as an expectation, invisible to every other test because they all store ids first · ➕ `matchedBy` printed per row — §5 permits a name match *because a human reviews*, so the review must show which rows rest on a convention · **Q: 6 vs 8, both derived** (`NAME_TO_KEY` = must be present; `OUR_MENU_NAMES` = did we name it) — collapsing them breaks `adopt` in one direction and re-creates this bug in the other · `publish` now **reports** the litter, deletes nothing · tsc 0 · **1505/0** · 🚫 no OA touched, no SQL | @Sober (review) |
| TASK-253 | BE: **REQ-077 notifications** — the renderer learns WHO it writes to, + the template fields | SPEC-072 · owner priority 09-06 | ✅ **DONE — code** (Sober 09-06) · `visibleFields = TEMPLATE_FIELDS − TYPE_OMITS − AUDIENCE_OMITS` ⇒ Porter’s per-type + teacher-privacy rules are structural, not asserted. tsc 0 · 1359/0. Detail in the TASK. | @Porter (customer Q) |
| TASK-254 | BE: **REQ-077 `COURSE DEDUCTION`** — the one new message, and it has **two** triggers | SPEC-072 §3 | ✅ **DONE — code** (Sober 09-06) · `COURSE DEDUCTION` fires from **both** deduction paths (manual check-in + day-end auto-attend), one helper, `Remaining` read from the write. tsc 0 · 1377/0. Detail in the TASK. | @Porter (customer Q) |
| TASK-255 | BE: **a family with TWO linked LINE accounts** — messages reach one phone, the other cannot use the bot at all | Jason's read 09-06 · Porter | ➡️ **SUPERSEDED by TASK-259** · the read that found it is preserved in this file · 🔴 **DEFECT, not a refactor:** a 2-account family was messaged on the **last-linked phone only**; the other account could not use the bot. Detail in the TASK. | @Sober (spec) |
| TASK-256 | BE: **REQ-077 `TODAY'S SCHEDULE`** — blocks under a shared header (Decision 6) | REQ-077 Decision 6 · Porter 09-06 | ✅ **DONE — code** (Sober 09-06) · hoisting is **computed**, not hardcoded · @Jason closed the half Sober missed. tsc 0 · 1395/0 · `renderSchedule` untouched, so the old list survives as a fallback. Detail in the TASK. | @Porter (customer review) |
| TASK-257 | BE: **REQ-077 `CONFIRMED SCHEDULE`** — three format defects found on a phone (+1 with the same cause) | Owner's phone 09-06 → Porter | ✅ **DONE — code** (Sober 09-06) · 🔑 `Time` asserted by **comparing the two messages** (the defect was their disagreement) · `Sessions`+`Note` were **one** bug, fixed by a net · @Jason covered the pre-deploy outbox window. tsc 0 · 1402/0. Detail in the TASK. | @Porter |
| TASK-258 | BE: **REQ-083 undo an attendance** — entitlement back · revenue reversed · no leave quota spent | SPEC-073 · REQ-083 | ✅ **DONE — code** (Sober 09-06) · generation keys (`rev`/`rev-undo`/`discount`), gen 0 = the un-suffixed legacy key ⇒ **history stays readable and a replay cannot double-post.** Detail in the TASK. | @Porter (note) |
| TASK-259 | BE: **a family's SECOND LINE account** must receive messages **and** be able to use the bot | SPEC-074 · Jason's read 09-06 | ✅ **DONE — code** (Sober 09-06) · **both halves** · the primary keeps the un-suffixed key ⇒ **no existing family is re-notified on deploy.** Detail in the TASK. | @Porter |
| TASK-260 | BE: **REQ-076 pause/resume a single booking** — 1HR · Voucher · 1st Trial | SPEC-075 · REQ-076 | ✅ **DONE — code** (Sober 09-06) · ⛔ **ships with TASK-261** · migrations are **0032/0033** — he **re-counted** instead of trusting my draft (0031 had landed since) · witness on the index **PREDICATE**, with `not.toBe("index")` asserting the wrong witness cannot be used · 🔴 **found a THIRD status list** (`findFreeExtensionDate`) that would have blocked a make-up from a slot the pause just released · **two more left deliberately, with reasons** (a paused booking IS a voucher use) · **AC-16 needed no code — the falsifier came back clean** · tsc 0 · **1469/0** · 34 sql = 34 tags | @Porter (deploy) |
| TASK-261 | FE: **REQ-076 the `รายการที่พักไว้` tray** + pause/resume controls | SPEC-075 §4 · REQ-076 | ✅ **DONE — code** (Sober 09-06) · ⛔ **ships with TASK-260** · 🔴 **Q3: the contract did not exist — my omission**; Fern took REQ-071's course-pause shapes, now ratified in **TASK-260 §8** · **no-body pause ⇒ AC-8's reason cannot be sent even by accident** · rail only at **2xl**: at 1280 a rail would cut the already-overflowing grid from 5.4 to **3.5 day columns** — *she changed her own answer because of a number* · one `OFF_CALENDAR_STATUSES` read by BOTH grids · tsc 0 · 99/0 · ⏳ **deployed measurement OWED → batch check** | @Porter (batch check) |
| TASK-262 | FE: **REQ-084 defect half** — a `DROPPED` course must stop offering `พักคอร์ส` | REQ-084 AC-A/B/C | ✅ **DONE — code** (Sober 09-06) · 🔴 **the root cause was a MISSING PAYLOAD FIELD, not the control** — the plan summary carries no `status`, so `courseDropped` was false on **every** course ⇒ **both** owner symptoms (pause never hid · resume rendered on nothing) · AC-C found a **second surface** (unlock/relock gated on leave state, never lifecycle) · `undefined` is an **explicit case, not a default** — both defaults are wrong in opposite directions · tsc 0 · 109/0 | @Porter |
| TASK-263 | BE: **the entitlement plan summary must carry `status`/`endedAt`** — one field, the root cause | Fern's Q1 on TASK-262 | ✅ **DONE — code** (Sober 09-06) · 🔴 **it was THREE fields** — `endReason` too, and `SummaryBar`'s "course has ended" notice could never render: **a third symptom nobody had connected** · the whole summary is **spread**, never projected — `toCourseSummary` was already called on the line above · **TASK-205's finding, third time in this file** · 📌 the FE type's own comment named `lib/leave.ts` — **the FE was written against the builder, believing it was the payload** · deviation from §3 taken **with evidence, not an argument** · tsc 0 · **1514/0** · 34 = 34 | @Porter (deploy) |


## Swept from board.md 2026-09-06 by Porter — 4 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-264 | BE: **REQ-082 edit a course's expiry** + the audit record + **(ข)** conditional `EXPIRY_REQUIRED` | SPEC-076 · REQ-082 · owner 09-06 | ✅ **DONE — code** (Sober 09-06) · migration **`0034`** · 35 sql = 35 tags · 🔑 **witness is the index PREDICATE, not its existence** — the trap that would give a false green on `uat`. Detail in the TASK. | @Fern (FE half) |
| TASK-265 | FE: **REQ-082 expiry control + warning**, and **REQ-084's resume button** | SPEC-076 §6 · REQ-082 · REQ-084 | ✅ **DONE — code** (Sober 09-06) · @Fern moved the control from `PlanModal` to the course card — **where it was specified it would have been unreachable in exactly the case REQ-084 needs it.** 4 deployed checks → @Tanya. Detail in the TASK. | @Porter (batch check) |
| TASK-266 | BE: **`db:migrate` REFUSES a batch it cannot apply in one run** (preflight + split command) | `sid` failure 09-06 | ✅ **DONE — code** (Sober 09-06) · `db:preflight` **fails closed** — refuses and instructs · 🔴 a **FRESH database is broken today** (same pair at `0001`/`0002`) · 🔴 **batch no longer atomic — run 1 commits**. Commands: PENDING DEPLOY 8. | @Porter (deploy note) |
| TASK-267 | BE: **`db:migrate:through` cannot resolve `drizzle-kit`** — and it had never been RUN | owner's `sid` run 09-06 | ✅ **DONE — code** (Sober 09-06, **`--plan` executed by both of us**) · scratch folder now inside the repo, gitignored, removed on **four** exit paths · 🔴 **his first `--plan` printed a ✓ over the exact failure** (`Bun.resolveSync` finds the global cache) ⇒ replaced with **node's own walk-up**, *"break the thing it guards and watch"* · 🔴 **`process.exit()` inside the `try` meant `finally` never ran** — cleanup written, never executed · a false-red on Windows pinned as its own case · **1568/0** | @Porter (deploy) |


## Swept from board.md 2026-09-06 by Porter — 1 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-269 | BE: `CONFIRMED SCHEDULE` — **`Sessions` is the course as bought · the note is `Remark` · the teacher's copy is the parent's** | owner's two LIVE `sid` messages 09-07 · REQ-077 §CONFIRMED SCHEDULE · SPEC-072 §8 | ✅ **DONE — code** (Sober 09-07, **mutated twice by both of us**) · `Sessions` reads **`size`, the field `programLabel` already reads** — the message had printed `Program : Surfskate 10 HR` and `Sessions : 8` **in one breath** · `confirmed` off the payload, **still gates the send** · `ob_f_note` → **`Remark`** (`ob_l_note` byte-frozen, untouched) · 🔻 Decision 5 REVERSED ⇒ `AUDIENCE_OMITS` both `[]`, **kept and pinned by teacher==parent byte-identical** · 🔴 **EIGHT tests pinned the old rule, not the four I listed — `course_deduction` and `todays_schedule` too, because the table is per-AUDIENCE and my own §3 said so** · 🔴 **the fixture had `size: 6` AND `confirmed: 6`, so it passed either way** — the suite had the same defect as the message · **1578/0** · ⏸️ Q2 partial-confirm **HELD by @Sober**, SPEC-072 §8.6 | — (ships with the next back deploy) |


## Swept from board.md "Blocked / waiting" 2026-09-07 by Porter — 16 resolved rows
> Verbatim. Resolved, closed, answered or recovered. Nothing edited.

| Item | Waiting on | Note |
|---|---|---|
| ~~REQ-012~~ | ~~LINE registration form capturing demographics~~ | — | **SUPERSEDED by REQ-019** | Demographics live on in REQ-019. |
| ~~REQ-018~~ | ~~LINE account unlink + dual-role~~ | — | **SUPERSEDED by REQ-020** | Became REQ-020 Q3. |
| RESOLVED — `MAX_WEEK_BY_SIZE` 6-session = "week 8" (owner, REQ-030 Q2) | ~~คุณฟีน~~ | `lib/leave.ts:11` `{4:5, 6:8, 10:13}`; SPEC-028 §5 makes it a HARD ceiling. |
| OUTAGE 08-02 — migrations silently skipped (shared ledger) | RECOVERED 08-02 | One shared `__drizzle_migrations`; closed by REQ-032. |
| ~~Why are the LINE rich-menu taps dead?~~ | CLOSED / MOOT 07-30 | Environmental: the webhook pointed at the stale server. |
| ~~`migrate:bo` failed: which DB is `DATABASE_URL` on?~~ | ANSWERED 07-28 | Config is CORRECT; the "wrong DB" hypothesis is disproven. |
| ~~REQ-006 BUG — freelance drawdown not idempotent~~ | RESOLVED — TASK-028 DONE | Reconcile-to-target: `held` from the ledger, `delta===0` no-op. |
| ~~REQ-001/002 acceptance blockers (auth 403, cap not showing)~~ | RESOLVED | Both fixed 07-20. |
| ~~Scheduled tasks not set up~~ DONE 08-01 | Human | All three on `sid`: digest 08:00 · end-of-day 23:30 · month-reset 1st 00:05. |
| ~~REQ-003 deploy~~ | SUPERSEDED (closed 07-30) | Its value shipped via REQ-005. |
| ~~REQ-004 deploy~~ | DONE (closed 07-30) | Only leftover is the month-reset task above. |
| ~~Teacher archive/activate BROKEN (07-28)~~ | FIXED — TASK-029 DONE | Old ops-live backoffice errored on `ops.catalog_items`, plus a routing fault. |
| ~~Deploy fact from the 07-28 traces~~ | RESOLVED (closed 07-30) | REQ-006 re-deploy replaced the drifted build; TASK-030 skips drifted `ops`. |
| ~~Teacher type-change money = local no-op~~ | PROMOTED → REQ-009 (07-30) | Owner: close the budget **and warn the admin first**; history kept. |
| ~~REQ-001 deploy gate~~ | DONE (closed 07-30) | REQ-001 DELIVERED 07-20; migration applied, budgets entered. |
| ~~REQ-006 deploy — hard ordering~~ | DONE (closed 07-30) | Ran 07-28: `bo` migration → `migrate:bo` (TASK-030) → both backends restarted. |


## Swept from board.md 2026-09-06 by Porter — 3 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-270 | BE: 🔴🔴 **DEF-1 — `PAUSED` never reached the API's status enum; FOUR copies of that list** | @Tanya on `sid` 09-07 · REQ-076 | ✅ **DONE — code** (Sober 09-07, mutated by both of us — **different mutations, different failure sets**) · the three now derive from `bookingStatus.enumValues`; `contract.ts` is `import type`, so it gains **no runtime import** · `?status=PAUSED` **and** `?status=NO_SHOW` parse · 🔴 **`tsc` did NOT light up, and the reason matters: `bookingEventKind` takes `{status: string}` — never exhaustive, so nothing was asking** · 🔴 **a FIFTH copy is live on the FE and is COMPLETE — the client was ahead of the server's own OpenAPI** ⇒ recorded, **deliberately NOT cut as a task** · **1588/0** | ⛔ ships with TASK-271 |
| TASK-271 | BE: **a paused session reaches a teacher's `ตาราง` and renders as the literal `status_PAUSED`** | @Jason's fifth enumeration, TASK-270 | ✅ **DONE — code** (Sober 09-07, **`tsc` mutation run by both of us**) · labels are now `Record<BookingStatus, Entry>` ⇒ **the compiler asks, and the union in the error is the DATABASE enum** · `checkin.service.ts` reads `CALENDAR_HIDDEN_STATUSES`, no sixth list · ⚠️ `PENDING_RESCHEDULE` = flagged **placeholder**, @Porter asking the customer · 🔑 **his `totalBooked` reasoning beat my question: it is the report's only NEGATIVE counter with no `paused` bucket, so excluding would make a paused row VANISH** ⇒ leave it; the fix would be to ADD a bucket · **1597/0** | ⛔ ships with 270 + 272 |
| TASK-272 | BE: 🔴 **a paused session stays on a teacher's phone calendar as `CONFIRMED`** | TASK-271 sweep | ✅ **DONE — code** (Sober 09-07, `tsc` mutation run by both of us) · `VEVENT_STATUS` is a total `Record<BookingStatus,…>`, **`PAUSED → CANCELLED`**, round trip asserted (same UID, rising SEQUENCE) · DESCRIPTION now carries the **label in the teacher's language** · 🔑 **he typed the INPUT as well as the map — "with a `string` parameter the map would still have needed a fallback, and the fallback is the defect"; I had asked for half the control** · 🔑 **and typing it broke a fixture that could build a booking whose status no longer existed — fixed by typing, not casting** · **1609/0** | ⛔ ships with 270 + 271 |


## Swept from board.md 2026-09-06 by Porter — 1 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-275 | BE: 🔴 **the CONVERSATION becomes bilingual** — bodies only; labels and menu keep the switch | REQ-079 §18 · SPEC-077 · owner: *"เอาให้จบคืนนี้ซะ"* | ✅ **DONE — code, REGISTRATION flow whole** (Sober 09-07) · `both(build)` / `tb(key)` **take no language, asserted by arity** · **12 label keys, both languages, none over 20**, list checked against the labels the code uses · notifications + ICS **byte-identical** · 🔴 **he replaced my `tb()` with `both()` — four keys are `\n`-prefixed FRAGMENTS appended to other bodies; "the fragment is not a message"** · 🔴 **`children_title` + `(3/5)` lands on the ENGLISH line only — silent** · 🔻 **THE ENGLISH IS OURS: the customer's 8-screen copy is NOT in the repo — §17 is @Porter's analysis; I wrote a DoD line citing a source I never opened** ⇒ 📨 DATA REQUEST · **1621/0** | @Porter (transcript) |


## Swept from board.md 2026-09-06 by Porter — 6 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-268 | BE: **drop `bunx` from the deploy path** — check the binary the run actually uses | Jason's flag on TASK-267 | ✅ **DONE — code** (Sober 09-07, **`--plan` run by both of us**) · **zero `bunx` in any command**, asserted across three scripts **and every `package.json` script** · 🔑 **§3's `node_modules/.bin/drizzle-kit` DOES NOT EXIST** (`.exe` + `.bunx` on Windows, symlink on POSIX) ⇒ he read the package's own **`bin` field** instead — *"reverse-engineering a shim is exactly the 'agrees today' shape this task exists to remove"* · **PENDING DEPLOY 8 unchanged, quoted back and asserted** · 🔴 **third resolution named (`db:migrate`'s bare `drizzle-kit` via the script-runner PATH) — RULED no task: the `.bin` shim is GENERATED from the same `bin` field, so it is one fact seen twice, not two that agree** · **1694/0** | — |
| TASK-273 | BE: **the eleventh attention card will ship `att_my_new_card` as its heading** | @Jason's `t()` sweep, TASK-271 | ✅ **DONE — code** (Sober 09-07, mutation run by both of us) · `AttentionKey = (typeof CHECKS)[number]["key"]`, labels a `Record<AttentionKey, Entry>` ⇒ **an 11th card without a heading fails the build** · 🔑 **`as const satisfies` on the EXPORT narrowed away an optional field and broke four readers** ⇒ private `CHECKS` + re-export, **one array two views** · ➕ **he added the check I did not ask for: `titleKey === att_ + key`** — the digest builds its own key, so a typo would still render raw **with the Record in place** · 🔻 **my first mutation failed for the WRONG reason and would have "confirmed" nothing** · **1628/0** | — |
| TASK-276 | BE: **the remaining five conversational flows go bilingual** | @Jason's scope call on TASK-275 | ✅ **DONE — code. THE CONVERSATION IS BILINGUAL END TO END** (Sober 09-07) · 🔴 **`tsched_empty` is called by BOTH the teacher's `ตาราง` AND the daily-reminder outbox** ⇒ **my SPEC-077 §3 (`tb` per key) would have made a HELD notification bilingual, silently — §5 of my own document** · **his `both()` redesign, made on TASK-275 for an unrelated reason, is what kept the hold** · 🔑 **§2 answered with a number and then made the number irrelevant: 3,848 doubled vs 5,000, and the bound is the CAP not the data — asserted with a 40-row fixture so a raised cap fails** · children count asserted **per LINE**, with the broken shape written into the test · **1683/0** | — |
| TASK-277 | BE: 🔴 **the owner's birth-date ruling (`วัน-เดือน-ปี`) was UNBUILT since 09-06** — prompt AND parser | REQ-079 §17, closed by the owner 2026-09-06 | ✅ **DONE — code** (Sober 09-07) · the four-digit-first shape is **refused BEFORE the day-first pattern is tried**, so the parent reads a FORMAT sentence, not *"day 2024"* — 🔑 **the behaviour was already right; the MESSAGE was not, and the caller cannot tell a range failure from a format failure** · `ข้าม` kept · stored value still `YYYY-MM-DD` · 🔴 **two existing tests were actively DEFENDING the overruled format** — which is why a day of green builds hid it · **1639/0** | — |
| TASK-278 | BE: **apply the customer's English** (`REQ-079` §17b) + **the phone shown formatted** | @Porter's transcript · §3c | ✅ **DONE — code** (Sober 09-07) · every screen mapped; **screen 2 has NO applicable string** (their only line is the typed `Next` we replaced with buttons) — stated, not skipped · five literal-text traps all held (`withExit` prints once · `{list}`/`{phone}` · `{max}` · the DOB format + `skip` · no inline `Thai / English` labels) · `formatPhoneForDisplay` **beside `normalizePhone` with "it is NOT the inverse"**, three call sites **asserted by position** · ✅ **clean negative: no step in their copy that we lack** · **1659/0** | — |
| TASK-280 | BE: **the confirm step echoed a date format the parent did not type** | @Jason's finding on TASK-278 | ✅ **DONE — code** (Sober 09-07) · `formatBirthDateForDisplay` beside `parseBirthDate`, **one caller**, asserted by position · 🔑 **his test is better than my DoD: `03-04-2024` beside `04-03-2024`, asserting the two echoes DIFFER — the property, not the string** (mine would have passed a formatter that returned its input) · 🔴 **a test was pinning the ISO echo — SECOND time in two tasks that this file defended the wrong behaviour** · 🔑 **`parseImportDob` has been DAY-FIRST since it was written** ⇒ **TASK-277 REMOVED a divergence rather than creating one** — the ruling is a correction, not a preference · ⚠️ import accepts dots, LINE does not — **deliberate, recorded so nobody "aligns" it** · **1669/0** | — |


## Swept from board.md 2026-09-06 by Porter — 1 closed TASK rows
> Closed or superseded rows, moved verbatim. Nothing edited, nothing deleted.

| Task | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-281 | BE: 🛑 **`db:seed-ledger` refused to seed over a risk belonging to `db:migrate`** — the `uat` deploy was held on it | owner’s `uat` run 09-08 · @Porter | ✅ **DONE — code. `uat` UNBLOCKED** (Sober 09-08) · 🔻 **my PLACEMENT error: `blockers()`’s own comment said *"anything that would have `db:migrate` attempt…"* — a migrate guard inside a seed tool** … **detail in the TASK.** | — |


## Swept 2026-09-08 by Porter — 5 closed/ready rows
> Verbatim. Nothing edited.

| Item | What | Source | Status | Owner |
|---|---|---|---|---|
| REQ-033 | Captured from the 08-01 customer presentation | BACKLOG | **CAPTURED — not READY_FOR_SA** | @Porter holds; do NOT build. Handled: REQ-022 · REQ-015/016 · REQ-029 · REQ-030. |
| REQ-039 | Dashboard consolidation — one Dashboard | MED | **CAPTURED — QUEUED** | Design with REQ-034. @Porter holds. |
| REQ-076 | พักการจอง 1HR / Voucher / 1st Trial (owner's REQ-013) — 🔢 **#3** | HIGH | ✅ **READY_FOR_SA (09-05)** — 18 ACs + wording | Owner answered all 3 same-day: all 3 types · voucher quota **held** · tray on the **calendar**. 🔴 AC-10: the tray is never a grid cell. |
| REQ-081 | ยกเลิก Voucher แล้วได้สิทธิ์คืน — split out of REQ-076 by the owner | — | **CAPTURED — not queued, not sized** | 🔴 **NOT on the owner's customer list.** May belong inside REQ-BO-006. Do not let it drift into REQ-076. |
| REQ-083 | เช็คอินแล้วเปลี่ยนเป็นลาป่วย (owner's **FIX-008**) | HIGH | ✅ **READY_FOR_SA (09-05)** — 10 ACs + wording | `C-24` answered + 3 follow-ups. 🔴 @Sober: **no `usedSessions - 1` anywhere and no reversal path** ⇒ a build, not a patch. |


## Swept 2026-09-08 by Porter — 3 closed/ready rows
> Verbatim. Nothing edited.

| Item | What | Source | Status | Owner |
|---|---|---|---|---|
| TASK-285 | FE: **hide the COURSE pause/resume control** so tonight's release ships without DEF-2 | @Porter's ship-tonight question, 09-08 | ✅ **DONE — code, READY** (Sober 09-08) · 🔑 **she REFUSED the gate I specified and was right: gating `courseDropped` would have made a paused course compute as ENDED and the screen say "this course has ended" — a FALSE claim** ⇒ the two BUTTONS are gated instead · 🔑 **revert = `PlanModal.tsx:79`, read by BOTH faces, so it cannot come back by halves** (I asked for one line; she made it un-half-revertable) · booking tray asserted untouched, **verified by me** · the temporary test announces its own expiry · **131/0** | — |
| TASK-283 | BE: **DEF-3 — `TODAY'S SCHEDULE` printed `09:00:00-10:00`** | owner's phone, `sid` 09-08 | ✅ **DONE — code** (Sober 09-08) · 🔑 **the cause was NOT "one end had no formatter" — the two ends of one range had two OWNERS and one did not exist**; `hhmm` **removed** from `jobs.service.ts` so one place owns both · 🔑 `TIME_OWNER` closes it **two** ways: a new template is a compile error, **and declaring `null` when it does print a `Time` FAILS** (the half I would have missed) · 🔴 **a test asserting `1) Time : 09:00:00` kept PASSING across the fix** — the first green-across-the-fix instance this week · **1723/0** | — |
| TASK-274 | FE: **the status label map is complete BY CARE, not by construction** | Sober's sweep across the wire, 09-07 | ✅ **DONE — code** (Sober 09-08) · 🔻 **my §2 asked for one control that ALREADY existed (`const th: typeof en`) and specified the other as an ANNOTATION, which would have widened `en` and traded the existing control away** — she used `satisfies` and checked it by re-running the break · 🔑 **break (a) throws TWO errors: dropping `PAUSED` from `en` makes the Thai one an EXCESS property — the two controls compose** · 🔴 **Q1 RULED and recorded: the two `BookingStatus` unions are deliberately separate, because her wire copy was RIGHT while ours was WRONG — derivation would have propagated our error into the screen** ⇒ **codegen is the WRONG option; a contract test is the only one** · **131/0** | — |


## Archived 2026-09-08 — the REQ-076/082/083/084 release, shipped to `uat` and QA-verified
| TASK-235 | FE: the admin invite control on the People screen — now the ONLY way anyone joins | SPEC-071 | ⛔ **WITHDRAWN 09-02** — the invite is cut; nothing left to issue | @Fern |
| TASK-289 | FE: **the plan view showed a re-planned course s OLD cancelled sessions beside its new ones** | @Tanya UI round 09-08 | ✅ **DONE — code** (Sober 09-08) · `visiblePlanRows` filters **only what the TABLE receives, not the array** — filtering the array would have re-broken the `17:00` default silently · ⏳ **awaits @Tanya** · **see the TASK** | — |
| TASK-290 | BE: **the plan DTO could not say a session was cancelled BY A PAUSE** | @Fern §3 on TASK-289 | ✅ **DONE — code** (Sober 09-08) · `cancelledByPause`, **derived**, on the mapper and the contract ⇒ a HAND-cancelled row stays visible · ⏳ **awaits @Tanya check 2** · **see the TASK** | — |
| TASK-291 | FE: **the pause dialog said 9 where the pause cancels 4** · the summary dialog has still never been SEEN | @Tanya round 12 09-08 | ✅ **DONE — code** (Sober 09-08) · the count is **the server's** (`/cancel/preview`) ⇒ the dialog can no longer count rows the admin cannot see · 3 stale comments killed, now a TEST · ⏳ **awaits @Tanya on `sid`** · **see the TASK** | — |
| TASK-293 | FE: **two LABELS that outlived their values** — a title asking after the act, `Ends` on a non-date | owner s screenshots, `sid` 09-08 | ✅ **DONE — code** (Sober 09-08) · 🔑 **@Porter's replacement copy ALREADY existed** (`endCourse.resumeDone`, since TASK-287) ⇒ reused, not duplicated · the owner's 4 sentences pinned as byte-for-byte tests · **see the TASK** | — |
| TASK-295 | FE: **DEF-5 — the resume form's `Time` field is EMPTY, and the admin can still submit** | owner on `uat` 09-08 via @Porter | ✅ **DONE — rebuilt after the discard, REVIEWED** (Sober 09-08) · tsc 0 · **170/0** · ✅✅ **VERIFIED ON A SCREEN by @Tanya: (a) `readOnly`, the course's own time · (b) picked `14:00` ≠ default ≠ original, landed on all four rows** · **see the TASK** | @Fern |
| TASK-296 | BE: **EVERY validation refusal in the product reached the admin as a RAW ZOD ARRAY** | owner's screenshot 09-08 via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-08) · tsc 0 · **1742/0** · 🚫 no migration · 🔑 **62 of 62 `zValidator` sites — a wrapper would have left 5 live** · ⏳ **awaits @Tanya on `sid`** · **see the TASK** | — |
