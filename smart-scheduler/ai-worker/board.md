# Board — smart-scheduler

## 🔴 DEADLINE — the round finishes FRI 16 OCT 2026 (owner, 2026-10-06 — was SUN 11, then WED 14)

> → The past deadline (16 Oct) moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## TASK number blocks (Porter, 2026-10-04 — after @Bob and @Silver both took TASK-623)

> Each SA allocates TASK numbers only from the block @Porter issued it; numbers are never reused. The old blocks were moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## Batch claims

**📦 Final front-office release LIVE on uat 2026-10-12** (back `5aa0f1c` / front `efb8551`, Journal 70): Team A 708–719 + 800–802 · Team B 725–736 — per `DEPLOY-uat-2026-10-12-final-front-office.md`. Rows below that still say "DONE/TODO/awaiting commit" for those numbers are stale wording; this line is the status (@Porter 2026-10-13). Then 803 (`ec820c5`) and 737/738 (`be2b34f` + front `89774a9`) on uat 2026-10-13.
**🏗️ Back office (REQ-120 + REQ-122): see `STATUS-BACKOFFICE-SPEC.md`, the one place for where the spec stands (updated 2026-10-25).** Rules 100 % agreed; v3 screens being confirmed by Khwan (pages 1–5 + 8 of 31 so far); price ≈ 39,200 ฿ (owner + Palm to talk to the customer); build starts on the owner's GO.

> **State only — one line per ACTIVE batch.** Porter claims a file area per team
> **before either team starts** (ORDER 14.3 step 3). Format:
> `Batch YYYY-MM-DD: Team A → <areas> · Team B → <areas>`
> An item spanning both claimed areas is not split — it goes to one team whole.

> → The closed batches (2026-10-02, 10-05, 10-08 REQ-116, 10-12 REQ-119) moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## Project context — state and pointers only (restored from SYSTEM-FACTS.md, Marie ORDER 12.5, 2026-09-28)

> → The project context (state as of late September) moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## Project info → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 2026-09-09).**

## Requirements

| ID | Title | Prio | Status | Next step · tasks |
|----|-------|------|--------|-------------------|
| REQ-003 | Teacher onboarding/offboarding, synced both systems | HIGH | **ON HOLD** | Do NOT deploy — the backoffice sync is moot. |
| REQ-009 | Close the freelance ceiling on teacher type-change | LOW | **TEST_PASSED** (08-04) | @Porter — acceptance. TASK-060, TASK-061 DONE. |
| REQ-020 | Secure the LINE pairing — approval, collision, control | MED–HI | **QA PARTIAL** | LINE claim path untested; needs the owner's phone. TASK-075+076 pair; TASK-047 DONE. |
| REQ-021 | Badge/tagging system — gaps from the 07-31 audit | LOW | **BACKLOG — parked** | Do not start. Revenue-by-branch is impossible today — decide with REQ-014. |
| REQ-022 | Booking modal — type drives the form + filtering | MED | **TEST_PASSED** (08-04) | Closed on prevention (owner's ruling). @Porter — acceptance. |
| REQ-023 | Daily admin digest — 08:00 LINE + attention view | MED | **QA PARTIAL** | Delivery untested; register the 08:00 task first. TASK-053 DONE. |
| REQ-024 | Bookings page — search & filtering on every tab | MED–HI | **TEST_PASSED** (08-04) | @Porter — acceptance. TASK-070+071 ship together. |
| REQ-025 | Go-live: continue a part-way-through course | HIGH | **SPEC_DONE** | Needs ONE real import on `sid`, not on the day. TASK-080, TASK-067 DONE. |
| REQ-026 | Nav tidy — four "statistics" menus is too many | MED | Stage 1 **TEST_PASSED** | Old entry hidden, not deleted. Stage 2 unscheduled. |
| REQ-027 | Enforce the price card — sizes + voucher exclusions | HIGH | **SPEC_DONE** SPEC-030 | (a) live; (b) → TASK-106. @Sober. |
| REQ-028 | Equipment rental as recorded revenue (owner calls it "REQ-004") | MED–HI | **SPEC_DONE** SPEC-031 | Retest 08-29 → `tests/TEST-062`: live ✅, ledger DATA REQUEST open → owner. TASK-108. |
| REQ-029 | Booking modal — a voucher must CHOOSE its program | HIGH | **SPEC_DONE** | @Porter — acceptance. TASK-088, TASK-089 DONE. |
| REQ-031 | Business rules as editable settings | MED–HI | BE **DONE** SPEC-029 | Defaults in code, overrides in `app_settings`. TASK-101, TASK-102, TASK-094. |
| REQ-034 | SOM dashboard — filter figures by booking type | MED | **SPEC_DONE** SPEC-032 | Post-go-live; 2 owner confirms open. TASK-110. |
| REQ-035 | Sell side of the item model (catalog → stock + revenue) | HIGH | **READY_FOR_SA** | Behind REQ-030/031/037. Stock-limited items BLOCK at 0. TASK-116. |
| REQ-045 | Course CREATION must allow planned absences | HIGH | **IN_SPEC** SPEC-049 | No data distinction planned vs unplanned today. TASK-148, TASK-149. |
| REQ-047 | Leave closes 3 h before the session, as a setting | MED–HI | **IN_SPEC** SPEC-048 | `leave_cutoff_hours_fulltime` + `_freelance`. TASK-146, TASK-147, TASK-136. |
| REQ-049 | Notify on leave — admin always, teacher optional | HIGH | code-complete **DONE** | TASK-137. Firing not yet re-verified. |
| REQ-051 | Walk-in QR check-in page | MED–HI | **SPEC-050 DRAFT** | **3 security decisions → @Porter/owner before any build.** |
| REQ-063 | ส่วนลด — discount a sale (% or บาท) | HIGHEST | **TEST_PASSED** (`sid`, 08-23) — NOT delivered | Scope, the 5 types / 2 moments, Q1/Q2 + AC-6 risk: REQ file. 🔴 Blocked on the owner **confirming his own assumptions**. SPEC-059; TASK-159/160/161/162. |
| REQ-066 | Every program has a 1-hour price (REQ-061's guard) | HIGHEST | cut → @Jason | `bike-skate` gains `1: THB(1390)`. TASK-174. |
| REQ-069 | Week must be Mon→Sun; Sunday is always missing | HIGHEST | cut → @Jason | Fix `weekRange` at source. TASK-175; with REQ-067 Part B. |
| REQ-067 | Booking-type labels + LINE schedule readability | MED | cut → @Fern | A = labels only; B rides TASK-175. TASK-176. |
| REQ-064 | Imported course plan invents free sessions | HIGHEST | SPEC-060 cut | Plan engine ignores imported prior sessions. TASK-165, TASK-166, TASK-167. |
| REQ-062 | ลาล่วงหน้าในไลน์ — pick a future session | HIGH | **READY_FOR_SA** | `checkin.service.ts` matches exactly today. @Sober. |
| REQ-061 | Onewheel pricing wrong vs the price card | HIGH | SPEC-058 cut | TASK-158. BOTH boxes wrong; found while mapping REQ-058. |
| REQ-057 | Scoped cleanup tool for test data on `uat` | HIGH | **GO** — hold lifted 08-23 | @Sober to cut; scope named by the `uat` DATA REQUEST. |
| REQ-058 | Nine new programs | HIGH | **TEST_PASSED** (`sid`, 08-30) — AC-9/AC-10 `NOT_TESTED` | `tests/TEST-063` + verdict in the REQ file. AC-9/10 need the owner's `link-all` dry-run ⇒ not `DELIVERED`. TASK-155, TASK-153. |
| REQ-059 | The importer must UPDATE in place | HIGH | SPEC-056 cut | 31 names edited ⇒ a `(phone,name)` key forks the roster. TASK-156. |
| REQ-060 | Imported gender + nationality are invisible | HIGH | Part A **DONE**; B.1 cut | Porter's "not a defect" verdict is retracted. TASK-157. |
| REQ-055 | GO-LIVE: wipe test data, import real families | HIGHEST | **WAVE 1 DELIVERED `uat` 08-22** | TASK-150. The wipe is the REQ-040 reset (owner-run). |
| REQ-038 | "Standard Timetable" feedback — 9 items, 1–5 essential | QUEUED | #4 **TEST_PASSED** · #3 **TEST_FAILED** fixed | DEF-2 closed by TASK-124. TASK-125, TASK-107, TASK-109, TASK-121, TASK-119, TASK-120. |
| REQ-042 | LINE role change did not switch the rich menu | HIGH | **FIXED & owner-verified 08-16** | Not yet DELIVERED. Empty `line_rich_menu_ids`. TASK-130. |
| REQ-013 | SOM dashboard — customer / activity / attendance | MED | **SPEC_DONE** | Warn the owner: low coverage, large "unknown". TASK-062, TASK-063. |
| REQ-014 | Backoffice — revenue by activity + customer spend | MED | **SPEC_DONE** | Acceptance: open a real month, confirm its reconciliation. |
| REQ-017 | Teacher bookings → phone calendar feed | MED | **DEPLOYED — acceptance INCOMPLETE** | NOT delivered; LINE does not linkify `webcal://`. TASK-044. |
| REQ-078 | การจองแบบ **อื่นๆ** (owner's REQ-005) — 🔢 **owner's #1** | HIGHEST | 🅿️ **PARKED at TEST_FAILED — narrowly** (`sid`, 09-02) · ⏳ **money round LIVE 09-05** — `tests/TEST-064` §Round 4 (verdict + PARK NOTE) and §Round 5 | ✅ 4 defects fixed; 18 ACs pass. 🔴 Blocking: DEF-4 reopened (display-only) · DEF-7. ⏳ ฿20 fixtures CONFIRMED for tonight’s 18:30 pass — see `tests/TEST-064` … **see the TASK.** |
| REQ-079 | LINE chatbot — ผปค ลงทะเบียน/ลา/เช็คอินเอง (owner's **REQ-016**) — 🔢 **#2** | HIGH | 🧪 **`TEST_PASSED` 16/26 (09-05) — NOT a REQ-079 pass** · `tests/TEST-065` §Round 4 | 🎉 AC-2 closes (real button = a different branch). ✅ DEF-9 · DEF-8 · AC-25 strong · C-13 answered. 🔴🔴 **All 16 were on … **see the TASK.** |
| REQ-077 | LINE OA + rich menu + notification set (owner's REQ-014) — 🔢 **#5** | HIGH | 🟢 **NOTIFICATION HALF DONE on `sid` (09-06)** · OA/menu half **DRAFT** | Six messages live, customer's format, **7 Porter decisions each one line to revert**. 🔴 Not on `uat` yet. Menu half: the customer took our menus off their OA 09-05. |
| REQ-080 | QA read-only on **both** `uat` hosts — narrow the `mint-session.mjs` guard on `frontoffice`, **extend** it to `backoffice` | HIGH | **READY_FOR_SA** (09-04) | 🔴 `backoffice` is **unguarded today** — see REQ §4b. @Sober — Q1/Q3 open, Q2 answered. |
| REQ-082 | ขยับวันหมดอายุได้ทุกคอร์ส (owner's **REQ-017**) | LOW | **DRAFT — 1 question** | Which courses cannot be moved today? *"ทุกคอร์ส" is an answer to something.* Pairs with REQ-084. |
| REQ-084 | ปุ่มนำคอร์สที่พักกลับมา (owner's **FIX-009**) + 🐛 a paused course still offers `พักคอร์ส` | MED | **DRAFT — 2 questions** | The defect half is blocked on **nothing** and can ship alone. AC-C: the same bug is probably in lists/cards/search. |

> 🔢 **Owner's order (2026-08-30): REQ-078 → REQ-076 → REQ-051 → REQ-077 → REQ-028 → the `REQ-BO` block.**
> His own numbering and the customer-facing status list live in **`OWNER-LIST.md`** — read it before answering
> "what is left". REQ-051 is his **REQ-015**; REQ-028 (rental) is his REQ-004 and is **REOPENED**.

> 22 closed rows swept to archive/board-closed.md (2026-08-31); 3 more on 2026-09-23 (ORDER 6).

> 📎 The early-project sequence notes and the 2026-07-20 decisions (Path A item-centric P&L, the LINE-first order,
> SPEC-001/002, and the revenue-recognition question that blocked TASK-007) are archived verbatim in
> `archive/board-2026-08-29-pre-compaction.md`.

## Tasks

| ID | Title | Source | Status | Assignee |
|----|-------|--------|--------|----------|
| TASK-068 | bo-BE: put `GET /bo/reports/pl` behind… | SPEC-021 | REVIEW | Jason |
| TASK-104 | BE: owner reversal — SICK_LEAVE no longer draws… | SPEC-028 §11.1 | REVIEW | Jason |
| TASK-105 | BE+FE: owner reversals — every course cancel… | SPEC-028 §11.2/§11.3 | REVIEW | Jason+Fern |
| TASK-106 | BE: voucher program exclusion… | SPEC-030 | REVIEW | Jason |
| TASK-108 | BE: equipment rental as revenue — 4 codes… | SPEC-031 | REVIEW | Jason |
| REQ-041 item 6 | FE: heading type-pairing (display face ≠ body) | REQ-041 | HELD | Fern |
| TASK-110 | BE: booking-type filter on `GET… | SPEC-032 | TODO | Jason |
| TASK-111 | FE: SOM dashboard booking-type control + render… | SPEC-032 | BLOCKED (TASK-110) | Fern |
| TASK-112 | BE: REQ-037 extra paid session — the… | SPEC-033 | REVIEW · see TASK-113 | Jason |
| TASK-114 | BE: OBS-3=(A) — `insertable` flag on the plan… | SPEC-028 §12 | REVIEW · see TASK-115, TASK-097 | Jason |
| TASK-116 | bo-BE: structural `kind` column on `bo.item… | SPEC-034 | TODO | Jason |
| TASK-118 | bo-FE: Items-screen stock field… | SPEC-034 | BLOCKED (TASK-116) | Fern |
| TASK-094 | BE: teacher-change 3-day notice rule (pure… | SPEC-028 | REVIEW | Jason |
| TASK-101 | BE: settings mechanism — `lib/settings.ts… | SPEC-029 | REVIEW | Jason |
| TASK-100 | BE+FE: soft warning when a teacher workDays… | SPEC-028 | REVIEW | Jason+Fern |
| TASK-179 | FE: REQ-068 note input + admin view… | SPEC-063/REQ-068 | PARTIAL · see TASK-184 | Fern |
| TASK-181 | BE: REQ-036 end a course early — `POST… | SPEC-064/REQ-036 | REVIEW | Sober |
| TASK-184 | BE: REQ-068 unblock — `toSessionRow… | SPEC-063/REQ-068 | REVIEW | Sober |
| TASK-185 | BE: REQ-036 Part B / B1 — an ended course… | SPEC-064/REQ-036 B | REVIEW | Sober |
| TASK-188 | BE: REQ-036 B3 (owner-ruled) — one computed… | SPEC-064/REQ-036 B3 | REVIEW | Sober |
| TASK-190 | BE: REQ-052 — `hasRental` on the booking DTO so… | SPEC-045/REQ-052 | REVIEW · see TASK-187 | Sober |
| TASK-195 | BE: FIX-007 — course expiry COMPUTED on the… | FIX-007 | REVIEW | Sober |
| TASK-197 | BE: `courseExpiry` off by one week — the… | FIX-007 | REVIEW | Sober |
| TASK-198 | BE: Drop / resume a course — `0024… | SPEC-065 | REVIEW | Sober |
| TASK-200 | BE: the expiry repair must NOT touch imported… | FIX-007 | REVIEW | Sober |
| TASK-201 | BE: REQ-072 parts 1–2 — `POST… | SPEC-066/REQ-072 | REVIEW | Sober |
| TASK-205 | BE: the DROPPED chip counted 0 while every row… | SPEC-065 | REVIEW · see TASK-204 | Sober |
| TASK-206 | BE: REQ-072 part-2 fix — the course-confirm… | SPEC-066/REQ-072 | REVIEW | Sober |
| TASK-207 | BE: REQ-072 part 3A — on confirm (whole-course… | SPEC-066/REQ-072 | REVIEW | Sober |
| TASK-208 | BE: REQ-072 part 3B — daily 08:15 "class today"… | SPEC-066/REQ-072 | REVIEW | Sober |
| TASK-244 | BE: a durable trail for the ONE act that can move a LINE account between families (today: a log line) | TASK-243 Q1 | **TODO** 🟢 after the REQ-079 deploy | @Jason |
| TASK-242 | FE: the post-confirm chip claims more than it knows → `ส่ง LINE ถึงครูหลักแล้ว` | REQ-078 DEF-6 §2 | 🔒 **HELD** — only if QA forces an FE touch, else with the follow-up | @Fern |
| TASK-240 | BE: course search drops a studentless course (count ≠ rows) — same shape as DEF-3, pre-existing | TASK-236 sweep | **TODO** 🟢 after the release | @Jason |
| REQ-065 | 1st Trial shows up as a selectable program (a booking TYPE in the picker) | SPEC-061 | see the Requirements table | @Sober |
| TASK-282 | BE: 🔴🔴 **DEF-2 — course resume RELOCATED the plan** (reshaped to the owner's RE-PLAN ruling) | owner on `sid` 09-08 · owner's ruling | 🔴🔴 **REOPENED — TEST_FAILED (@Tanya, UI round 09-08)**: 4 → 8 rows through the BUTTONS on the release build, same as the API path · the re-shape did NOT close DEF-2 · fixture `b7dc8ace` held alive on `sid` · **see the TASK** | — |
| TASK-284 | BE: **`Remark` does not render on the course-level `CONFIRMED SCHEDULE`** | owner reproduced 09-08 | 🔴🔴 **REOPENED 09-10 — NOT FIXED.** Owner: *note renders on the 1 HR message, NOT on the course-wide one* — **the ORIGINAL defect, after the fix shipped and reviewed green** · ⛔ **FRONT of the queue** · **see the TASK** | @Jason |
| TASK-287 | FE: **resume asks the scheduling question and STATES the expiry it moved** | owner ruling 09-08, ships with TASK-282 | 🔴 **FAILED (@Tanya 09-08)** — the post-resume summary dialog did not appear (PAUSE dialog re-rendered EMPTY) · the resume form pre-fills `10:00` on a `17:00` course · **see the TASK** | — |
| TASK-294 | FE: **two OPPOSITE English facts share ONE Thai sentence** | @Fern s sweep on TASK-293 | 🆕 **TODO — no clock** → @Fern (Sober 09-08) · 🔴 **`plan.noLiveEnd` and `plan.noSessions` are the SAME Thai sentence** — *none left* vs *not begun*, **opposite meanings** · `REQ-036` fixed the CASE, left the COLLISION · **see the TASK** | @Fern |
| SPEC-078 | 📐 **`REQ-086` design: the customer edits the WORDS, not the messages** | `REQ-086` + the four built `§7` formats | 📐 **WRITTEN** → @Sober (09-09) · 🔑 **a notification is already a TITLE + an ORDERED field list, each field carrying a label, a value source and an EMPTY RULE** ⇒ **edit the title per** … **see the TASK** | @Porter |
| TASK-328 | BE: **the labelling convention lives in NINE branches — and can it even MOVE?** (`TASK-257 §3`) | @Jason’s TASK-325 candidate 4 | ⛔ **CUT AND HELD — released only when @Tanya’s `uat` round closes** → @Jason (Sober 09-10) · ⚠️ **it changes VISIBLE labels on three messages she is reading now** · 🔴 **the obvious** … **see the TASK** | @Jason |
| — | BE: **`line()` vs `extra()` — nine branches choosing a LABELLING CONVENTION by hand** (`TASK-257 §3`) | @Jason’s TASK-325 Question (candidate 4) | ⛔ **HELD until after the `uat` round** · full note verbatim in `archive/board-2026-10-02-parked-notes.md` (no TASK file of its own) | — |
| TASK-286 | FE: **a `Record` proves completeness; nothing proves a SUBSET is still the right subset** | @Fern's Q2 on TASK-274 | 🆕 **TODO — no clock, blocks nothing** → @Fern (Sober 09-08) · 🔑 **her sentence is the task: "nothi … **see the TASK.** | @Fern |
| TASK-500 | BE: the intermittent full-run failure RECURRED (~1 in 5, two machines) | TASK-488 · ticketed 09-26 | ⏪ PRELOAD REVERTED per the owner (Jason 09-26) · spin-offs TASK-503/504 both DONE, **no closing status was ever stated** → owner to confirm · tasks/TASK-500-intermittent-suite-failure-diagnose-be.md | @Jason |
| TASK-511 | BE: the public docs login example is `admin`/`admin` | @Jason in TASK-509 · ticketed @Sober 09-26 | 🟡 REPORTED — awaiting @Sober's review (Jason 09-26) · tasks/TASK-511-openapi-login-example-be.md | @Jason |
| TASK-518 | FE: build the admin Undo control (roster + plan editor) | Tanya TEST-075 B via @Porter 09-27 | 🔴 REOPENED as TASK-531 (09-27); TASK-531 has since closed DONE but **this row was never re-closed** → owner to confirm · tasks/TASK-518-admin-undo-control-fe.md | @Fern |
| TASK-552 | BE: a cancelled make-up is not a make-up | @Jason D7 root cause in TASK-551 · ruled (a) by @Sober | ✅ (B) DONE — REVIEWED by @Sober (09-29) · ⏳ **owed: the `sid` repair (DATA REQUEST) is untouched; part (A) is TASK-553** · tasks/TASK-552-a-cancelled-makeup-is-not-a-makeup-be.md | @Jason |
| TASK-597 | FE: **a string written for one branch, rendered on another** | (@Fern offer in TASK-595; SA queued it) | ⏸️ **NEXT ROUND — not dispatched** · detail: `tasks/TASK-597-a-string-written-for-one-branch-fe.md` | @Fern |
| TASK-598 | BE: **the LINE leave window is NARROWER than the act** (+ Tanya "no class today") | (Khwan + Tanya, via @Porter; diagnosed by @Sober) | ⏸️ **SIZED S/M, NOT DISPATCHED** · ➕ 10-02: Tanya's "no class today" is the SAME ROOT — re-homed to the TASK file §4 · detail: `tasks/TASK-598-the-leave-window-is-narrower-than-the-act-be.md` | @Jason |
| TASK-599 | BE: **a deliberate suppression must be VISIBLE** | (Tanya day on a notice never due; owner put it NEXT round) | ⏸️ **SIZED S, not dispatched** · detail: `tasks/TASK-599-a-deliberate-suppression-must-be-visible-be.md` | @Jason |
| TASK-600 | BE: **what on this box reaches NOBODY** | (@Sober proposal; two instances in two days) | ⏸️ **SIZED S, not dispatched** · detail: `tasks/TASK-600-what-on-this-box-reaches-nobody-be.md` | @Jason |
| TASK-604 | FE: **the 27 remaining DRAFT markers** | (@Fern flag in TASK-602; SA queued it) | ⏸️ **QUEUED, not in this batch** · detail: `tasks/TASK-604-the-27-draft-markers-fe.md` | @Fern |
| TASK-606 | BE: **the Daily report cannot agree with the schedule** | (Tanya, via @Porter; diagnosed by @Sober) | ⏸️ **DIAGNOSED, sized S, NOT dispatched** · 🚫 no TASK file yet — full diagnosis verbatim in `archive/board-2026-10-02-parked-notes.md` | @Jason |
| TASK-610 | 🔴 **STOP: the FRONT claim names a directory that does not exist** | (@Sober, 10-02 — blocks C and F screens) | ⛔ **WITH @PORTER — no FE work in this batch until it is restated** → full: `tasks/TASK-610-board-record.md` § Board row | — |
| TASK-612 | **REQ-111 E — Swap must let you pick WHICH teacher goes out** | (Khwan via owner, 10-02) | 📏 **SIZED S — NOT CUT, waiting on @Porter release.** `SIZING-REQ-111-E-2026-10-02.md` → full: `tasks/TASK-612-board-record.md` § Board row | — |
| TASK-613 | 🔴 **a "from here on" swap pays the NEW teacher at the OLD teacher RATE** | (@Sober, 10-02 — found reading for E) | 🆕 **NOT SIZED — @Porter asked whether to size this round or next** → full: `tasks/TASK-613-board-record.md` § Board row | — |
| TASK-614 | ⚠️ **ONE human event, FOUR notification kinds** | (@Sober, 10-02 — found reading for E) | 🆕 **NOT SIZED — backlog, not a blocker** → full: `tasks/TASK-614-board-record.md` § Board row | — |
| TASK-615 | 🔴 **a `:param` route SWALLOWS a literal sibling — the guard and Hono pick OPPOSITE matches** | (@Sober, 10-03 — found verifying TASK-608) | 🆕 **NOT SIZED — still open as the CLASS, and now it has a TEMPLATE** → full: `tasks/TASK-615-board-record.md` § Board row | — |
| TASK-616 | ⚠️ **owner question: may an admin record a leave on a day belonging to an ENDED course?** | (@Sober, 10-03 — forced by our own rule set) | ✅ **CLOSED by @Sober, 10-03 — the question DISSOLVED; 🚫 do NOT take it to the owner.** 🔑 **The ACT did not change, only the CALLER did: `POST /teachers/me/leave` and its lift …** → full: `tasks/TASK-616-board-record.md` § Board row | — |
| TASK-617 | ⚠️ **ONE red test that is NOT this batch — and it blocks the words "clean run" for BOTH teams** | (@Sober, 10-03 — verified pre-existing) | ▶️ **ASSIGNED — @Porter extended Team A claim to this file for ONE line (10-03); cut as `TASK-626` to @Jason** → full: `tasks/TASK-617-board-record.md` § Board row | @Jason 
/g, "
")`, the convention 43 files already apply** · ✅ **multi-line assertion untouched, no `.gitattributes`** · ⚠️ **the WHY is written in the file so the next person does not delete the `replace` as noise** · 🔑 **no second problem found in that file — nothing else touched** · ✅ **suite 3749 · 0 fail at the fix ⇒ "clean run" available to BOTH teams** · ⚠️ **never a product defect: nothing shipped was wrong and nothing shipped changed** · 📌 **@Sober's to verify** | @Jason |
| TASK-628 | ⛔ **the ONE live-DB suite run — @Porter schedules it, because KHWAN IS TESTING ON SID** | (@Sober, 10-03) | 🚫 **CANCELLED by OWNER RULING, 10-04 — 🚫 do NOT revive this; the reason is below so nobody re-opens it next month** → full: `tasks/TASK-628-board-record.md` § Board row | — (closed) |
| TASK-630 | 📌 **RECORDED DESIGN (not work): if a WITHDRAWN pre-start declaration should return to the pool** | (@Sober, 10-04 — so nobody re-derives it) | 📌 **A ROW, NOT A TASK — it exists so the answer survives the session** → full: `tasks/TASK-630-board-record.md` § Board row | — |
| TASK-631 | 📋 **THREE copy items with the owner — one REPLACES a shipped sentence** | (@Sober, 10-04 — `COPY-REVIEW-2026-09-29.md`) | ⛔ **WITH @PORTER — 🚫 none of them blocks code; all three are drafts and nothing ships until he brings them back** → full: `tasks/TASK-631-board-record.md` § Board row || "คาบอื่น"`` → full: `tasks/TASK-631-board-record.md` § Board row | — |
| TASK-633 | 📌 **OWNER QUESTION (not work): should changing a session coach CLEAR the rate already stored on it?** | (@Jason flagged, claimed none — @Sober, 10-04) | ⛔ **WITH @PORTER — a QUESTION, 🚫 not sized, 🚫 nobody touches the code** → full: `tasks/TASK-633-board-record.md` § Board row | — |
| TASK-636 | 🔴 **KHWAN: abolish the leave COUNTER — the course EXPIRY becomes the only control** | (screenshot to @Sober direct, 10-04; answer routed UP via @Porter) | ✅ **§1 RULED by the owner 2026-10-04: TAKE THE CAP OUT** (→ `TASK-643`) → full: `tasks/TASK-636-board-record.md` § Board row | — (Q2–4 open) |
| TASK-638 | 🔴 **@Porter: ONE line — does a claim on an IMPLEMENTATION file include its TESTS?** | (@Sober, 10-04 — third claim fault this week) | ✅ **RULED by @Porter 2026-10-04: a claim on a file INCLUDES its co-located test file, automatically, same team. No exceptions, no list-reading required** → full: `tasks/TASK-638-board-record.md` § Board row | — (closed) |
| TASK-639 | BE: **a pass over the REGION PINS — and the helper that makes the next one impossible** | (@Jason offered it; @Sober scoped it, 10-04) | ⏭️ **AFTER THE BATCH — 🚫 deliberately not now** → full: `tasks/TASK-639-board-record.md` § Board row | @Jason |
| TASK-640 | ⚠️ **should EVERY owner-approved string be PINNED?** | (@Sober, 10-04 — out of @Fern near-miss) | ⛔ **WITH @PORTER — a QUESTION, 🚫 not work, 🚫 not sized** → full: `tasks/TASK-640-board-record.md` § Board row | — |
| TASK-641 | 🔴 **LIVE ON UAT: a parent with CONFIRMED future sessions is told she has NONE — one family, TWO doors, ONE cause** | (@Porter, 10-04; Khwan: *“คนเดียวกัน”*) | 🔴 **CAUSE PROVEN** → full: `tasks/TASK-641-board-record.md` § Board row | — (owner decides per row) |
| TASK-642 | 📌 **(c) — a child nobody can reach must be FINDABLE** (the `TASK-641` prevention half) | (@Sober; evidence from @Porter screenshots, 10-04) | 📌 **RECORDED, 🚫 NOT sized, 🚫 not cut, nobody is building anything** → full: `tasks/TASK-642-board-record.md` § Board row | — |
| TASK-696 | FE: **create a family and link in one go** (from the link-a-parent dialog; reuses ParentFormModal + 669 confirm; no BE, no new words) | sizing §3 · owner pull-forward via Porter 10-07 | REVIEW — 2026-10-07, Fanta · Q1 :69 + Q2 :70 done as granted · full 1085/0, tsc 0, build ok · count + NAME + file re-proved (set 3/3 BITES) · no new words · `tasks/TASK-696-create-a-family-and-link-in-one-go-fe.md` | @Fanta |
| TASK-697 | FE: **the swap dialog's rate box waits for the coach** (no "ค่าสอนของ สำหรับตารางนี้" with a blank name; group swap + ECA cover) | TEST-081 :11 · Porter ruling 10-07: defect in our own work | REVIEW — 2026-10-07, Fanta · Q1 :227 done as granted · full 1088/0, tsc 0, build ok, set 2/2 BITES · no new words · `tasks/TASK-697-swap-rate-label-waits-for-the-coach-fe.md` | @Fanta |
| TASK-698 | FE: **after a create, every refusal in the link dialog names BOTH halves** (`สร้างครอบครัวเบอร์ {phone} แล้ว แต่ยังผูก {child} ไม่สำเร็จ` + the server reason) | TEST-081 case C · owner-approved TH 10-07 (COPY-REVIEW:504) | REVIEW — 2026-10-07, Fanta · TH + EN approved verbatim, one key · 7/0, set 6/6 BITES, full 1095/0, tsc 0, build ok · by-value (phone + child IN the sentence) · `tasks/TASK-698-link-refusal-names-both-halves-fe.md` | @Fanta |
| TASK-723 | BE: **Daily report — ONE source in the back; camp = the CHILDREN who came, coach-hours OUT of the totals** (+ scope) | Khwan 17 vs 9 · REPRODUCED TEST-092 · SIZING addendum 10-11 | 🚫 CANCELLED — handed to Palm (owner 2026-10-11: all reports are Palm's; REQ-117 not ours) · `tasks/TASK-723-daily-report-one-source-camp-children-be.md` | @Bob |
| TASK-724 | FE: **Daily report screen renders the back's ONE count** (no /calendar recount; all 6 type rows + a camp row; no new words) | as 723 | 🚫 CANCELLED — handed to Palm (owner 2026-10-11) · `tasks/TASK-724-daily-report-screen-renders-the-one-source-fe.md` | @Fanta |
| TASK-729 | BE: **P43/P44 — the last two «คุยกับแอดมิน» admin notices** (LINE display name at send time; fallback `ผู้ใช้ LINE` + time) | COPY-SET P43/P44 · Khwan Q7 · Porter overnight 10-12 | ✅ ENGINEERING DONE (Silver 10-12; 4512/0, set 9/9) · 📋 DRAFT, ships only if Khwan's Q7 matches · `tasks/TASK-729-admin-ask-p43-p44-fallback-be.md` | @Bob |
| TASK-734 | BE: **option A — `displayText` on the «คุยกับแอดมิน» cell** (the chat surfaces; 729's fallback becomes findable) | owner-delegated A 10-12 | ✅ ENGINEERING DONE (set 5/5) · in `9fa5eb2` · ⏳ the owner's phone proof on sid · `tasks/TASK-734-admin-cell-displaytext-be.md` | @Bob |
| TASK-737 | BE: **REQ-119 — `GET /reports/daily` serves Palm's contract** (new pure counters; teacherId on every counter; byTeacher incl. extra coaches; seats never counted) | REQ-119 · Palm §2–§8 | ✅ CLOSED 2026-10-13 — LIVE on uat (back `be2b34f` + front `89774a9`) · Tanya TEST-101 PASS on sid AND uat (read-only, 78 reports, screen = API, TB = Conf + Leave) · `tasks/TASK-737-*.md` | — |
| TASK-738 | BE: **REQ-119 ❓ ruled A — Total booked = Confirmed + On leave** (flip `TOTAL_BOOKED_INCLUDES_PENDING` to false + its pin) | Khwan 10-13 · Porter | ✅ CLOSED 2026-10-13 — LIVE on uat (back `be2b34f` + front `89774a9`) · Tanya TEST-101 PASS on sid AND uat (read-only, 78 reports, screen = API, TB = Conf + Leave) · `tasks/TASK-738-*.md` | — |
| TASK-702 | BE: **REQ-115 — a make-up is a NORMAL class: born CONFIRMED + a durable MARKER (T1) + a migration that checks itself** (P1–P4, RAISE ⇒ rollback; owner's before/after counts; own release) | REQ-115 (below "REPLACED") · SPEC-REQ-115 (corrected) · Porter GO 10-07 | ✅ LIVE ON uat 2026-10-08 (back 6f7a40f → full: `tasks/TASK-702-makeup-born-confirmed-with-marker-be.md` § Board row | @Porter |
| TASK-703 | FE: **REQ-115 — the «ขยายคาบ» badge reads `isMakeup`, not the status (Team A half: BookingBadges + Calendar.config [granted] + Team A dialogs + plan preview + types)** | REQ-115 · Porter grant 10-07 | ✅ LIVE ON uat 2026-10-08 (back 6f7a40f → full: `tasks/TASK-703-makeup-badge-reads-the-marker-fe.md` § Board row | @Porter |
| TASK-704 | BE: **REQ-115 F1 — a make-up the family was told about is cancelled ⇒ the family is told, in the make-up's own approved words** (family sender reads `isMakeup`; the Undo tells the family) | TEST-084 F1 (Tanya) · Porter 10-07 | ✅ LIVE ON uat 2026-10-08 (back 6f7a40f → full: `tasks/TASK-704-cancelled-makeup-tells-the-family-be.md` § Board row | @Porter |
| TASK-705 | BE: **REQ-115 F2 — a class cancelled because the coach is OFF never gets its replacement on that coach's day off** (re-plan `coachOff` option from coach leave · its seats · admin cancel «ครูลา»; TASK-551 untouched) | TEST-085 F2 (Tanya) · Porter 10-08 | ✅ LIVE ON uat 2026-10-08 (back 6f7a40f → full: `tasks/TASK-705-replan-never-books-on-the-coach-day-off-be.md` § Board row | @Porter |
| TASK-706 | BE: **F3 — cancelling a GROUP date tells the families of its CONFIRMED seats, even when the group row is PENDING** (decide by the pre-cancel seats; non-group byte-identical) | TEST-086 F3 (Tanya) · Porter "cut" 10-08 | ✅ sid PASSED (TEST-088) · CLEARED for uat WITH 707 in `DEPLOY-uat-2026-10-08-706-707.md` (back a2185b2) · `tasks/TASK-706-pending-group-date-cancel-tells-confirmed-seats-be.md` | @Porter |
| TASK-707 | FE: **REQ-116 — saving a camp day sends each coach's hours WHOLE** (own hours ⇒ both times; day's hours ⇒ neither; never half) — fixes the false clash, the silent widening and the half-window refusal | REQ-116 (Khwan, LIVE on uat) · Porter 10-08 | ✅ sid PASSED (TEST-089 Part 2, 4/4; Part 1 reproduced) · CLEARED for uat WITH 706 in `DEPLOY-uat-2026-10-08-706-707.md` (front 2db1c57) · `tasks/TASK-707-camp-day-save-sends-whole-coach-windows-fe.md` | @Porter |
| TASK-803 | BE: **REQ-118 follow-up — wrong English area names fixed by a DOPA-cited override list in OUR repo** (upstream untouched; exhaustive check; unclear rows listed) | owner "แก้" 10-12 via Porter · TEST-099 🟡 | ✅ CLOSED 2026-10-12 — back `ec820c5` on sid + uat · Tanya PASS both (uat GET only): 380101 = Bueng Kan, 380102–09 corrected, Bangkok/Chiang Mai unchanged, People card EN OK (TEST-100 §803) · note: reached uat before its sid check | — |
| TASK-805 | BE: **`GET /api/subjects`, every ACTIVE program (id, name, kind)**, Teachers menu only (REQ-121, LIVE) | Porter 10-15 | ✅ CLOSED 2026-10-15 — LIVE on uat (back `d29e9d0` + front `d1d0a99`) · TEST-103 PASS sid + uat (read-only) | — |
| TASK-806 | FE: **teacher form Subjects picker reads `GET /api/subjects`** instead of the roster union, so a program nobody teaches (DUO) can be ticked (REQ-121, LIVE) | Porter 10-15 | ✅ CLOSED 2026-10-15 — LIVE on uat (back `d29e9d0` + front `d1d0a99`) · TEST-103 PASS sid + uat (read-only) | — |
| TASK-808 | FE: **clickable BO spec: SALARY pages** (8 pages) (REQ-122 · REQ-120 §1) | Porter 10-16 | 🟢 BUILT · VERIFIED by @Sober 10-16 (12 pages × 3 roles: 0 errors · 0 dead · Admin sees no pay) · Person-page question removed (QS13), fix checked | @Fern |
| TASK-824 | BE: **take one teacher off one class** (extra off / main → next eligible by name, GROUP via swap internals, D3/D4) (REQ-125 B) | Porter 10-20 (owner: D1–D5 as rec., 7 strings approved) | 🟢 VERIFIED by @Sober 10-20 (4979/0 · 824 11/11 · 632/634 unchanged) | @Jason |
| TASK-825 | BE: **same-day leave on ruling B** (co-taught continues, no family notice; last teacher unchanged) | Porter 10-20 (owner: D1–D5 as rec., 7 strings approved) | 🟢 VERIFIED by @Sober 10-20 (4997/0 · 825 10/10) | @Jason |
| TASK-826 | BE: **advance leave + ranges on ruling B** + `teacher_leave_removals` (**migration 0071**) + Cancel leave restores as extra | Porter 10-20 (owner: D1–D5 as rec., 7 strings approved) | 🟢 VERIFIED by @Sober 10-20 (5030/0 · 826 15/15 · migration 0071, journal 72) | @Jason |
| TASK-827 | BE: **ruling B LINE notices** (remaining coaches, one per day; `teacher_leave_recorded` + co-taught line) | Porter 10-20 (owner: D1–D5 as rec., 7 strings approved) | 🟢 VERIFIED by @Sober 10-20 (5048/0 · 827 13/13) · ruling B back end complete | @Jason |
| TASK-828 | FE: **ruling B on the screens** (P7 split · "continues with" rows · strip counts only to-handle) | Porter 10-20 (owner: D1–D5 as rec., 7 strings approved) | 🟢 VERIFIED by @Sober 10-20 (1302/0 · build 0 · 828 22/22) · ✅ committed `3e4a337` · TEST-111 rule PASS · 🔧 rework F1/F2 VERIFIED 10-21 (1309/0) · O1 (approved) in progress · ✅ F3 VERIFIED 10-21 (1343/0 · 828 30/30) · front list with 830 | @Fern |
| TASK-829 | BE + FE: **after a teacher's same-day leave: the result view + an admin LINE alert for a class left as is (D4)** (REQ-125 K1, owner 'K1 b') | Porter 10-21 | ✅ COMMITTED (back `fa1a04c` · front `99d27a5`) · sid → Tanya; uat with F3 + 830 | @Jason · @Fern |
| TASK-830 | FE: **the address picker shows ENGLISH area names on the EN page** (register page + admin parent form; saved data unchanged) (REQ-118 follow-up, Khwan 10-21) | Porter 10-21 | 🟢 VERIFIED by @Sober 10-21 (1348/0 · build 0 · 830 10/10) · READY for commit with F3 (`DEPLOY-F3-and-TASK-830-front-2026-10-21.md`) | @Fern |
| TASK-831 | FE: **REQ-122 v3 — SHELL v3 + single-file delivery** (new answer key · ALL CAPS menu · FRONT OFFICE group + label · dates · month picker · [?] ask slot · build) | REQ-122 §8 · Porter 10-21 | ▶️ GO 10-21 (Porter) · FIRST · 1.1 d | @Fern |
| TASK-836 | BE + FE: **REQ-128 L1, one 7-day login**: the API token 12 h → 7 d; the front session ends at the token's own exp (owner "A. 7 วัน") | REQ-128 · Porter 10-25 | ⬆️ COMMITTED on `dong` 10-25 (back `43da846` · front `46c6ee1`) · TEST-119 ✅ · deploy + env step = the owner's | @Jason · @Fern |
| TASK-837 | BE + FE: **REQ-126 "ตัดจบคอร์ส"**: the approved button + a course-only 5th end reason (migration 0072); behaviour unchanged | REQ-126 · Porter 10-25 | ▶️ GO 10-25 · 4 dialog strings «copy pending» (drafts → owner) · BE 0.45 + FE 0.2 d | @Jason · @Fern |
| TASK-838 | BE + FE: **REQ-127 ONE act "เปลี่ยนครู / เวลา ทั้งคอร์ส"**: the remaining sessions move in place to a new teacher / day / time | REQ-127 · Porter 10-25 | ⬆️ COMMITTED with 837 on `dong` 10-25 (back `5b5f483` · front `f9f7f9c`) · deploy + db:migrate 0072 = the owner's, after Tanya | @Jason · @Fern |
| TASK-839 | BE: **REQ-131 the leave-refused admin alert names the child** (the 3rd argument to `notifyAdmins` + a renderer fallback) | REQ-131 · Porter 10-25 | ⬆️ COMMITTED on `dong` 10-25 (back `8db9f74`) · deploy = the owner's, after Tanya | @Jason |
| TASK-840 | BE: **REQ-132 the Attention items ("ใกล้ใช้ครบ" + "ใกล้หมดอายุ") name the child** + a `link` target; the LINE digest unchanged | REQ-132 · Porter 10-27 (owner "B") | ✅ COMMITTED 10-27 on the owner's "ขึ้น git": back `31cd2d0` (with 842) · TEST-126 PASS on sid · uat deploy = owner | @Jason |
| TASK-841 | FE: **REQ-132 each such Attention item links to its course** (`/scheduler/bookings?course=<id>` opens the plan window) | REQ-132 · Porter 10-27 | ✅ COMMITTED 10-27 on the owner's "ขึ้น git": front `e44c38a` · TEST-126 PASS on sid · uat deploy = owner | @Fern |
| TASK-842 | BE: **REQ-132 🟡 the two Attention course checks count ACTIVE courses only** (not ended / paused); rides with REQ-132 | REQ-132 · Porter 10-27 (owner "ก") | ✅ COMMITTED 10-27 on the owner's "ขึ้น git": back `31cd2d0` (with 840) · TEST-126 PASS on sid · uat deploy = owner | @Jason |
| TASK-844 | FE: **REQ-133 final UI: Salary 8 pages**, all of Khwan's v3 notes | REQ-133 | 🟢 READY FOR QA 10-27 with 843 + 845 (rework verified; md5 `a33a3b43…`) → Porter → Tanya | @Fern |
| TASK-845 | FE: **REQ-133 final UI: Notify 2 + front office 7** (`fo: true`) | REQ-133 | 🟢 READY FOR QA 10-27 with 843 + 844 (Team A's 17 pages; md5 `a33a3b43…`) → Porter → Tanya · full-UI pass after Silver's Fri 11-06 | @Fern |
| TASK-847 | FE: **REQ-133 final UI opens in DARK mode** (default dark + header toggle; shell Tailwind tokens follow the scheme; dark 5-shot set for the deck) | REQ-133 · owner 10-27 *"backoffice start with dark mode first"* | 🟢 READY FOR QA 10-27 (md5 `64831c0d…`; dark on first open, toggle, 5 dark shots checked) · Team B fix pending: `revenue/Detail.tsx:129` red-0 rows (Silver) · then GO deck batch 2 | @Fern |
| TASK-846 | **REQ-133 pricing-meeting deck** (static React, `pricing.ts`; payment 3 installments owner-OK'd 10-27) | REQ-133 · Porter GO 10-27 | 🟢 EDIT BATCH 2 (owner's answers + dark shots) + the slide-3 R0 fix, READY FOR QA 10-27 (md5 `d6ae0949…`, frozen) → Tanya → owner | @Jason |
| (admin LINE) | BE + FE: **admin LINE tied to the web user** | FINAL ROUND item 5 · `SIZING-admin-line-link-to-web-user-2026-10-07.md` | ➡️ MOVED TO TEAM B 2026-10-11 (Porter: in parallel) — Silver cuts from his block; Team A touches nothing · 714/715 NOT used | @Silver |
| TASK-671 | BE: **camp clash refusal: `ครู {ชื่อ}` with a space** (owner ruling; Team B's site of six) | owner 10-06 via Porter | TODO — GO (req104 :73,:95 granted) · `tasks/TASK-671-camp-clash-message-teacher-spacing-be.md` | @Bob |
| TASK-649 | 🟠 **copy from TEST-077: F4 · F5 · the coach's generic FORBIDDEN** | (Tanya on sid, 10-04) | ✅ **RESOLVED 10-04** → full: `tasks/TASK-649-board-record.md` § Board row | — |
| TASK-652 | 📌 **NEXT ROUND, IF the owner wants it: check teacher-SCOPE first for linked accounts, on EVERY route** | (owner ruled item 4 = (c), 10-04) | ⏭️ **RECORDED, 🚫 NOT sized, 🚫 not started — so the reasoning survives** → full: `tasks/TASK-652-board-record.md` § Board row | — |
| TASK-653 | 📌 **NEXT ROUND: move the leave DIALOG's pins out of `teacher-scope.test.ts` into the dialog's OWN test** | (@Porter ruled the claim question, 10-04) | ⏭️ **RECORDED, 🚫 not sized** → full: `tasks/TASK-653-board-record.md` § Board row | @Fern (next round) |
`; `core.autocrlf=true` ⇒ the working copy is CRLF** ⇒ **the sentence IS present and identical; only the invisible characters differ** · ✅ **CONFIRMED pre-existing: it was already red in @Sober baseline run BEFORE @Jason touched anything** · ✅ **the fix is the convention 43 other test files already apply (`.replace(/
/g, "
")`)** 🚫 **never a `.gitattributes` change — that rewrites working copies repo-wide to solve one assertion** · 🚫 **@Jason was NOT allowed to take it (outside the batch claim), even though he offered and it is one line** — 📌 *a red test in a tree BOTH teams share means NEITHER can report a clean run, and that gets fixed once by its owner, not by whichever engineer tripped over it first* | — |

> 168 closed rows swept to archive/board-closed.md (2026-08-31); 33 more on 2026-09-23 (ORDER 6);
> **104 more on 2026-09-29** — all 104 came from the 112 orphan rows found above the board title.
> **46 more on 2026-10-02 (ORDER 15.1)** — 11 orphan rows from above the title + 35 closed Tasks rows.
> ⚠️ **TASK-551 and TASK-552 read closed but were KEPT here** — each still carries
> an `⏳ owed` obligation in its own cell.
> ✅ Checked 2026-09-29: TASK-329 … TASK-445 all have a row in `archive/board-closed.md` — no gap there.

## Blocked / waiting

Full text of every item is in `archive/board-2026-08-29-pre-compaction.md`.

| Item | Waiting on | Note (short) |
|------|-----------|--------------|
| `course-cleanup-plan.ts`'s "has LINE ⇒ not test data" refusal | @Sober, when REQ-057's script is next touched | 🔴 Reads `parents.line_user_id`. After TASK-259 a family linked ONLY via `family_line_links` slips p … **see the TASK.** |
| `moveRosterLink` leaves a `family_line_links` row behind | @Sober, low | `roster-link.ts:24` nulls `parents.line_user_id WHERE line_user_id = <id>`; a **non-primary** account matches nothing, s … **see the TASK.** |
| `env -u DATABASE_URL bun run …` does NOT isolate from the real DB | Everyone — now in `PROTOCOL.md` | Bun auto-loads `.env`, which points at live `sid`. Jason, 08-02. |
| Has `sale:ensure-items` already run on `sid`? | Human / @Porter, before the batch | It never updates an existing item ⇒ voucher items may sit at placeholder prices. |
| What does ONE HOUR of Bike / Surfskate / Skateboard / Inline cost? | คุณกุ้ง via Porter | No 1-hour row for `bike-skate`; now carried by REQ-066. |
| URL-persisted tab + filters on the Bookings page — keep deferred? | คุณฟีน via Porter | REQ-024 said include; Fern deferred (the tab is already crowded). |
| DATA REQUEST — is any historical sale data worth recovering? | Human via Porter | Read-only: `bo.movement` rows with `ref_type='SALE'`, range, and their `owner_ref`. |
| Course & voucher revenue was never recorded, in all history | คุณปุ้ม / คุณฟีน via Porter | Trial/single posted until 07-28; `course-*` / `voucher-*` never posted. |
| Decision: re-post the un-recorded days? | คุณปุ้ม via Porter | Reconstructable from `public`, but it is a finance decision. |
| TASK-064 — SPEC-021's input did not exist when raised (08-01) | Sober | No SALE rows to attribute, no `externalRef` to key on; TASK-066 created them. |
| REQ needed: self-service unlink / switch role on LINE | Porter | The bug half is TASK-046; the rest is a product decision. |
| Real numbers (placeholders live) | พี่ฟีน → Porter | Placeholders: FL 70k@500, FT 50k, PT 15k, Trial/Single 1,390. |
| repo lint (both FE) | Porter / maint | `bun run lint` broken — `next lint` removed in Next 16. Pre-existing. |
| drizzle snapshot chain incomplete (scheduling-back) | maint / future task | `meta/` holds 0000–0003, journal 0000–0012 ⇒ `db:generate` re-emits everything. |
| REQ-003 subjects (known limit) | Porter → พี่ฟีน | The teacher form lists existing subjects only. See REQ-058. |

## 📋 OWNER'S NEXT BATCH — he is assembling it; **nothing here is dispatched until he says so** (opened 2026-09-08)
> *"อยู่ในลิสต์นะ จดไว้ เดี๋ยวจะส่งงานชุดวันนี้ให้ทำให้หมด"* ⇒ **@Porter holds this list. Do NOT route any of it
> to @Sober early** — he sends the batch as one, and a half-sent batch is how build order gets set by accident.

| # | Item | State | Note |
|---|---|---|---|
| 1 | **`TASK-284` — `Remark` does not reach the course-level confirmation message** | TODO, @Jason | 🔑 **he reproduced it himself**; a KNOWN limitation from `TASK-269 §2` that was deliberately not fixed — **his finding overrides that decision** |
| 2 | **The `ON LEAVE` row keeps its OLD time after a re-plan** | ❓ **@Sober still owes the ruling** | on the screen he verified himself; **3rd time this week a leave sat at the edge of a rule** |
| 3 | **The toast header is ENGLISH** — *"Something went wrong"* over a Thai body | not filed | **a Thai admin's first line is in the wrong language, and says less than the line beneath it** |
| 4 | **`TASK-292`** — the client computes a COUNT on a bulk act | TODO, @Fern | **same class as the `9`-vs-`5` we just fixed** |
| 5 | **`TASK-294`** — `ยังไม่มีคาบ` means two OPPOSITE things | TODO, @Fern | *none left* vs *not begun*; **no English-side review can catch it** |
| 6 | **`TASK-297`** — three paths answer without reaching the error handler | TODO, @Jason | 🚫 **no admin can see any of them** |
| 7 | **`REQ-080` — narrow the guard so QA can READ `uat`** | `READY_FOR_SA`, never shipped | 🔴 **@Tanya was blocked out of tonight's `uat` confirmation by this exact gap** — `mint-session.mjs` refuses `uat` BY DESIGN and there is no `uat` entry in the access file |
| 8 | **A READ of `ecosystem.cjs`** — what ELSE is hard-coded there? | @Porter's ask | **not a task**; the LINE credentials cost us days |

### 🔴 DECISIONS, not defects — these are HIS to answer, and no agent may settle them
- **13+ `CANCELLED` rows accumulate per paused course and nothing prunes them.** 🟢 The count correctly excludes them ⇒ **not the old defect.**
- **An OVER-QUOTA leave is locked with no make-up** ⇒ a re-plan lays out one MORE than the pause cancelled, **spending the lock.**
- **The extension ceiling measures from the PURCHASE start date** ⇒ after a long pause, a later make-up can be refused on a course that legitimately moved.
- **`resume/preview`** — the admin reads the moved dates AFTER confirming. **@Sober and @Porter both recommend NOT building it.**
