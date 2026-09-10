# Board — smart-scheduler

> **State only:** ID · title · status · owner · pointer. Detail, evidence and history live in `requirements/`,
> `tasks/`, `specs/`, `tests/`, `log/` — never in a cell.
> 🧹 **Compacted 2026-08-29 (Marie housekeeping, owner-approved). Nothing deleted:** the pre-compaction board is
> `archive/board-2026-08-29-pre-compaction.md` (verbatim), each row's old narrative was appended to its own REQ/TASK
> file, and prose belonging to no single file is in `archive/board-2026-08-29-parked-notes.md`.

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
| REQ-046 | A leave must name the session, not the day | HIGH | code **DONE** | Already session-level everywhere. TASK-135. |
| REQ-047 | Leave closes 3 h before the session, as a setting | MED–HI | **IN_SPEC** SPEC-048 | `leave_cutoff_hours_fulltime` + `_freelance`. TASK-146, TASK-147, TASK-136. |
| REQ-048 | A voucher session must let staff choose the TIME | HIGH | code **DONE** | The branch never rendered the control. TASK-132. |
| REQ-049 | Notify on leave — admin always, teacher optional | HIGH | code-complete **DONE** | TASK-137. Firing not yet re-verified. |
| REQ-050 | Check-in must land on the right child + session | HIGH | code-complete **DONE** | TASK-144 (money) + TASK-145 (picker/labels). |
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
| REQ-015 | LINE OA — pretty & bilingual (rich menu / flex) | HIGH | **DELIVERED** (+1 fix pending) | TASK-046 needs a `sid` deploy + repro. TASK-045, TASK-038, TASK-040, TASK-041, TASK-039. |
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

> 22 closed rows swept to archive/board-closed.md (2026-08-31).

> 📎 The early-project sequence notes and the 2026-07-20 decisions (Path A item-centric P&L, the LINE-first order,
> SPEC-001/002, and the revenue-recognition question that blocked TASK-007) are archived verbatim in
> `archive/board-2026-08-29-pre-compaction.md`.

## Tasks

| ID | Title | Source | Status | Assignee |
|----|-------|--------|--------|----------|
| TASK-068 | bo-BE: put `GET /bo/reports/pl` behind… | SPEC-021 | REVIEW | Jason |
| TASK-103 | BE: POST-GO-LIVE — route the LINE-bot leave… | SPEC-028 | TODO | Jason |
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
| TASK-117 | BE: LIVE MONEY — atomic sale stock-draw +… | SPEC-034 | TODO | Jason |
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
| TASK-288 | FE: the resume form defaulted to a slot that is NOT this course s · the summary dialog never appeared · the pause copy was false | @Tanya UI round 09-08 | ✅ **DONE — code** (Sober 09-08) · the time now defaults to the **course own slot** · the summary dialog **exists** (it rendered 0 ms) · my pause copy replaced · ⏳ **awaits @Tanya** · **see the TASK** | - |
| TASK-292 | FE: **the client still computes a COUNT on a bulk act, and a NAME from an arbitrary row** | @Fern s answer on TASK-291 | 🆕 **TODO — no clock, blocks nothing** → @Fern (Sober 09-08) · 🔴 **`pendingCount` is a CLIENT count on a bulk-confirm button whose `skips` panel exists because the server confirms FEWER** ⇒ same class as tonight's `9 vs 5` · **see the TASK** | @Fern |
| TASK-294 | FE: **two OPPOSITE English facts share ONE Thai sentence** | @Fern s sweep on TASK-293 | 🆕 **TODO — no clock** → @Fern (Sober 09-08) · 🔴 **`plan.noLiveEnd` and `plan.noSessions` are the SAME Thai sentence** — *none left* vs *not begun*, **opposite meanings** · `REQ-036` fixed the CASE, left the COLLISION · **see the TASK** | @Fern |
| TASK-298 | BE: **the expiry warning arrives AFTER the save; `REQ-085 §11.3` requires it BEFORE** | owner's `§11.2`/`§11.3` via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · tsc 0 · **1797/0** · 🚫 no migration · `POST /courses/:id/expiry/preview`, **writes nothing** · 🔑 **agreement made UNFALSIFIABLE — exactly** … **see the TASK** | @Jason |
| TASK-297 | BE: **three paths answer WITHOUT reaching `app.onError`** — a bare-string 401, a plain 404, **and no `app.notFound` at all** | @Jason's §4 answer on TASK-296 | ✅ **DONE — code, REVIEWED · ⏳ NOT YET DEPLOYED** (Sober 09-08) · tsc 0 · **1762/0** · 🚫 no migration · **the three paths now reach the handler** · **see the TASK** | @Jason |
| TASK-299 | BE: **the extension ceiling is RE-DERIVED from the PURCHASE DATE, so an admin's edited expiry does nothing** | `REQ-085 §10` + the purchase-date item + `§11.2`'s purpose | 🔻 **PREMISE SUPERSEDED by `REQ-085 §12`** (09-09) — *the QUOTA is the only gate on leave; the ceiling may never refuse one.* **See TASK-308.** · ✅ **DONE — code, REVIEWED · ⏳ NOT YET DEPLOYED** (Sober 09-08) · tsc 0 · **1754/0** · 🚫 no migration (**35 = 35**) · **see the TASK** | @Jason |
| TASK-300 | BE: 🔴 **the make-up for a declared absence is booked ON the absent day** | @Jason's finding while answering @Sober's TASK-299 edge question | ✅ **DONE — PROVEN by the gate, then fixed; REVIEWED by @Sober** (09-08) · tsc 0 · **1775/0** · 🔴 **the gate FAILED: three make-ups on the three declared-absent dates exactly** — the … **see the TASK** | @Jason |
| TASK-301 | BE: 🔴 **a stretched course cannot use the quota leave its card promises — and the refusal names a week the check did not use** | owner on `sid` 09-08 via @Porter, on the deployed TASK-299 | 🔻 **PREMISE SUPERSEDED by `REQ-085 §12`** (09-09) — *the QUOTA is the only gate on leave; the ceiling may never refuse one.* **See TASK-308.** · ✅ **DONE — code, REVIEWED by @Sober** … **see the TASK** | @Jason |
| TASK-302 | BE: **a RE-PLANNED course has no room for the quota it still has** | @Jason's answer to TASK-301's Question | 🔻 **PREMISE SUPERSEDED by `REQ-085 §12`** (09-09) — *the QUOTA is the only gate on leave; the ceiling may never refuse one.* **See TASK-308.** · ✅ **DONE — code, REVIEWED by @Sober** … **see the TASK** | @Jason |
| TASK-303 | BE: **the per-session confirmation is REPLACED, not edited** (`REQ-085 §7.3`) | the customer's `§7.3`, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · tsc 0 · **1818/0** · 🚫 no migration · ✅ **pinned byte-for-byte to `§7.3`; `(-)` never appears; the calendar date is gone** · 🔑 **the** … **see the TASK** | @Jason |
| TASK-304 | BE: **the daily schedule — BOTH shapes gain `Remark`, only COMMAND loses a language** (`REQ-085 §7.2`) | the customer's `§7.2` + the owner's `§9`, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · tsc 0 · **1828/0** · 🚫 no migration · 🔴 **"one language" was a DEFECT — the COMMAND schedule was wrapped in `both()`, so a teacher got** … **see the TASK** | @Jason |
| TASK-305 | BE: 🔴 **the teacher is never told a student took leave** (`REQ-085 §2` + `§7.4` + `§9.1`) | the owner, raised TWICE, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1839/0** · typecheck clean · 🚫 no migration · 🎉 **all four `§7` formats now in** · 🔴 **it was NOT un-built — `leave_teacher` existed** … **see the TASK** | @Jason |
| TASK-306 | BE+FE: **the plan editor's leave notifies nobody, and a setting now controls nothing** | @Jason's Question answer on TASK-305 | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1843/0** · typecheck clean · 🚫 no migration · ✅ **one `sendLeaveNotice`, both doors, asserted by count** · **one notice per SESSION** · ✅ … **see the TASK** | @Jason |
| TASK-307 | BE: **a parent may SKIP past having a child, and the account can then do nothing** (`REQ-085 §6`) | the owner's `§6`, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1852/0** · typecheck clean · 🚫 no migration · 🔑 **the owner's two moments are ONE branch — `kids.length`, not the step** · ✅ **no new** … **see the TASK** | @Jason |
| SPEC-078 | 📐 **`REQ-086` design: the customer edits the WORDS, not the messages** | `REQ-086` + the four built `§7` formats | 📐 **WRITTEN** → @Sober (09-09) · 🔑 **a notification is already a TITLE + an ORDERED field list, each field carrying a label, a value source and an EMPTY RULE** ⇒ **edit the title per** … **see the TASK** | @Porter |
| TASK-308 | BE: 🔴 **the QUOTA is the ONLY gate on leave, and the expiry STRETCHES to fit** (`REQ-085 §12`) | the owner, THIRD report, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1854/0** · typecheck clean · 🚫 no migration · 🎉 **the owner CAN take his leave and the expiry MOVES — both asserted, and his** … **see the TASK** | @Jason |
| TASK-309 | BE: **the creation preview still refuses a plan, and a make-up can land SIX MONTHS out in silence** | @Jason's two findings on TASK-308 | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1863/0** · typecheck clean · 🚫 no migration · ✅ **no refusal left on ANY leave path; `exceedsCeiling` cannot be true BY CONSTRUCTION and** … **see the TASK** | @Jason |
| TASK-310 | BE: **the registration copy is the CUSTOMER'S words** (`REQ-085 §5` via `REQ-079 §17c`) | the customer, verbatim, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1877/0** · typecheck clean · 🚫 **no migration** · 🟢 **`§5` IS IN — the backend is COMPLETE and HANDED OVER; the owner's LINE round is** … **see the TASK** | @Jason |
| TASK-311 | FE: **the expiry must be clickable ON THE CARD, and a dead gate must go** (`REQ-085 §12.1` + `§12`) | the owner via @Porter · TASK-309 | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **183/0** · 🚫 `contract.ts` untouched (verified) · 🔑 **`§11.3` asks BEFORE saving, computing nothing; the preview ECHOES the date it** … **see the TASK** | @Fern |
| TASK-312 | BE: 🔴🔴 **the `add` prefix swallows `admin`, `address` and `Add Student`** (`REQ-085 §13`) | @Sober's inventory + @Porter's `§13` | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1894/0** · 🚫 no migration · 🔻 **@Sober’s `admin` claim RETRACTED, `SYSTEM-FACTS` corrected** · 🔴 **NEW, ours: our EN menu says `add**` … **see the TASK** | @Jason |
| TASK-313 | BE: 🔴 **what the product ADVERTISES is reserved — and the inline add NEVER checked** | @Porter's `add child` ruling + @Sober's search for his mechanism | ✅ **DONE — code + §5, REVIEWED by @Sober** (09-09) · **1905/0** · 🚫 no migration · 🔴 **`add เมนู` no longer writes a child** · 🔑 **the menu-parsing test found `เพิ่มนักเรียน` + `Add**` … **see the TASK** |child`), `add child Emily` → `Emily`, `child` NOT reserved** · 🔴 prose limit DECLARED · ❓ two more one-door guards → TASK-314 · **1905/0** · 35 = 35 · tsc 0 | @Jason |
| TASK-314 | BE: **two more rules that guard only the WIZARD door** | @Jason's Question answer on TASK-313 | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1914/0** · 🚫 no migration · ✅ **an inline add now NOTIFIES the admin; an inline duplicate ASKS for detail** · 🔴 **mutation B came back** … **see the TASK** | @Jason |
| TASK-315 | BE: 🔴 **a family with FOUR children is forced to add a fifth** (`REQ-085 §6.1`) | the owner's screenshot, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-09) · **1925/0** · 🚫 no migration · ✅ **FOUR children ⇒ no prompt; ZERO ⇒ prompt UNCHANGED** · 🔑 **one decision (`afterParentLink`) reached by** … **see the TASK** | @Jason |
| TASK-316 | BE: **`ลา` scans ONE DAY, and the picker labels a session by its RECURRING attributes** (`REQ-085 §14`) | the owner via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **1946/0** · 🚫 no migration · ✅ **BODY names the date, BUTTON is `22/09 15:00` — teacher/program dropped BECAUSE they are identical across** … **see the TASK** | @Jason |
| TASK-317 | FE: **`Ends` → `Last session` in the plan modal** (batch item 7a) | @Fern's own TASK-311 finding + @Porter | 🆕 **TODO — no clock** → @Fern (Sober 09-10) · **two date-shaped things on adjacent screens, only ONE clickable — the owner read them as the same** · ✅ **a LABEL change: the value is byte-identical and it stays uneditable** · 🚫 `deriveLiveEndDate` untouched · **see the TASK** · 🔴 **DUPLICATE of TASK-319 — flagged by @Fern 09-10: same change (`Ends` → `Last session`, both languages), and this ID has NO task file while 319 has one AND the deeper scope (§2’s non-date). The work is DONE under TASK-319.** ⚠️ **@Sober to close/merge — leaving it TODO means the next reader finds the change already made and no file saying why.** | @Fern |
| TASK-318 | BE: **the LEAVE NOTICE, the customer’s own spec** (`REQ-085 §16d`/`§16e`) + `§16.4` + the ✅ | the customer verbatim, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **1964/0**, 35=35, tsc 0, **all re-run by me** · ✅ **`Date : DD-MM-YYYY` via a SHARED `time.ddmmyyyy` — one transformation, two contracts (§16d + §17c)** · ✅ **`LEAVE NOTICE / แจ้งลา ‼️` with `§4`’s boundary in the code** · 🔻 **MY task page compressed `§16d`’s block and his pin failed against the REQUIREMENT — mine, and the rule is now: a TASK never re-transcribes a spec block** · 🔑 **`Time :` no-space NOT reproduced — ratified on TASK-257 §3, not on “looks like a typo”** | @Jason |
| TASK-319 | FE: **`Ends` is the wrong word, and the slot it names also takes a NON-DATE** (batch item 8a) | @Porter, from the owner’s round | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **196/0** · ✅ **`Last session {date}` / `คาบสุดท้าย {date}`** · 🔑 **option 2: new `noUpcomingSession`, and the date is now `string | null` ⇒ a non-date CANNOT enter the slot** (structural, not wording) · 🔴 **she found `noLiveEnd`’s SECOND caller (`diffSummary`) ⇒ the header had to stop using the string** · 🔑 **her rule: on the FE the risk arrives when the user’s PATH gains a second candidate, not when a screen does** | @Fern |
| TASK-320 | FE: **`TASK-284` reopened — the CREATION note is sent under the WRONG NAME** (`REQ-085 §3a`) | the owner via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **196/0**, typecheck 0, **both re-run by me** · ✅ **one word: `note:` → `attendeeNote:`** · 🔑 **`note` is NOT also sent — the status flows OWN and overwrite it, so a second copy would DIVERGE** (@Fern’s reason, better than mine) · **label now `Session note (optional) — added to every session`** · 🔻 **NOT retroactive — old courses keep their note in `note`; with @Porter for the owner** · 🔴 **she REFUSED my `แพ้ถั่ว` justification: the hint forbids medical details — escalated as a REQUIREMENT question** | @Fern |
| TASK-321 | FE: **`diffSummary` is the odd one out, and TASK-319 made it so** | @Fern’s own TASK-319 Question | ✅ **DONE — REVIEWED by @Sober** (09-10) · **222/0**, tsc 0, **re-run by me** · ✅ **`last session {end}` / `คาบสุดท้าย {end}` + NEW `diffSummaryNoEnd`** — **not the same fact: TENSE and AGENCY (what the change WOULD LEAVE, read while it can still be cancelled)** · 🔴 **`noLiveEnd` now has NO renderer — kept ON PURPOSE, TASK-294 is an open ruling, and all THREE states of the pin are recorded because its REASON went stale twice in two days** | @Fern |
| TASK-322 | FE: **assert that a form value arrives under the NAME the reader uses** | @Fern’s own TASK-320 Question | ✅ **DONE — test-only** (Fern 09-10) · 🔻 **THE RESULT IS A CORRECTION: the check I proposed (§A, key sets agree) does NOT catch TASK-320** — the dialog sent `note:`, the service forwards `note` faithfully, **the sets AGREED**; the defect was the *wrong VALID field* · ⚠️ **known only because the DoD made the demonstration mandatory** · ✅ **§B is what works: a field no form FEEDING THAT INPUT sets is a feature unreachable from the UI** · 🔻 **my first §B ALSO failed the demo** — it unioned every payload app-wide and the per-session editor's `attendeeNote` masked the create dialog's ⇒ **fixed by scope; anything wider lets one surface vouch for another** · 🔴 **REPORTED not fixed: (1) `ImportCourseInput.note` is a live orphan — the import form has no note box, the 2nd instance of TASK-320's shape; (2) `CreateCourseModal` has NO renderer and still sends `note:`, and TASK-287/288 cite it as the copy-from reference** · ⚪ left: pass-through services (**cannot mismatch by name**) and `BookingModal`'s branched payload · 📌 **Q: 78 absence assertions, but only ONE two-sided before this — a presence needs to know WHICH NAME the reader uses, and that lives in a third place neither FE test reads** · **tsc 0 · 212/0 · no product file changed** | @Fern |
| TASK-323 | BE: **two copy items, and each has a BOUNDARY the copy does not state** (batch items 3 · 6) | the customer + @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **1976/0**, 35=35, tsc 0, **all re-run by me** · ✅ **the hint off the birthdate + province PROMPTS; the BAD-BIRTHDATE RE-ASK KEEPS it — it is the exact branch TASK-245 exists because of** · 🔑 **`ยกเลิก` still works — asserted, and the mutation proved it** · 🔴 **§16g: SEPARATE keys with the COINCIDENCE ASSERTED — his third option, better than either of mine** · 📖 **the WEEKLY header shipped as a PLACEHOLDER — the new rule’s first use** · 🔻 **my “twelve call sites” was ELEVEN** | @Jason |
| TASK-324 | FE: **`15:00:00` — there is NO formatter for a time a human reads** (batch item 7) | the owner via @Porter | ✅ **DONE — REVIEWED by @Sober** (09-10) · **222/0** · ✅ **`formatTimeDisplay` beside `formatDateDisplay` — a TRIM, not a parse, and that is load-bearing** · 🔑 **my “four broken sites” was TWO: ONE payload with TWO renderers, the same list before and after a save** · 🔻 **and SIX raw sites exist, not four — my grep, not her reading** · 🔴 **her Question found MONEY: a shared formatter AND four local copies, on the surface where TASK-169’s 100× defect shipped** | @Fern |
| TASK-325 | BE: **the trailing blank line, fixed where messages are BUILT** (`REQ-085 §16.3`, batch item 4) | @Porter, the owner | 🔴 **TODO — the LAST OPEN BATCH ITEM** → @Jason (Sober 09-10) · 🔻 **open because @Sober TICKED IT OFF WITHOUT EVER DISPATCHING IT** · **`.trimEnd()` is in 5 branches of 14; there is NO trim at the builder** · 🔴 **the hard part is the PINS: artefact vs DELIBERATE trailing newline** · 🔑 **assert NO message ends in whitespace ACROSS ALL FOURTEEN — one property, one assertion** | @Jason |
| TASK-326 | FE: **two raw time sites the sweep missed, and a lockstep file that is NOT** | @Fern’s TASK-324 report | ⚪ **TODO — NO CLOCK, not in the batch** → @Fern (Sober 09-10) · **`CalendarWeekGrid:138` + `CheckinContent:108` — neither broken today; routed for HER reason** · ⚠️ **`CheckinContent` is a PUBLIC page with its own local type, outside the shared DTOs** · 🔻 **the FE contract copy says “keep in lockstep” and is missing the line — @Sober cited it TWICE from the wrong repo** | @Fern |
| TASK-286 | FE: **a `Record` proves completeness; nothing proves a SUBSET is still the right subset** | @Fern's Q2 on TASK-274 | 🆕 **TODO — no clock, blocks nothing** → @Fern (Sober 09-08) · 🔑 **her sentence is the task: "nothi … **see the TASK.** | @Fern |
| TASK-279 | **SA: sweep the requirements for CLOSED rulings that never became tasks** | two misses in REQ-079, both found by @Jason | ⏳ **IN PROGRESS — mine, blocks nothing** (Sober 09-07) · ✅ **REQ-079 SWEPT, written in as §19** — 11 … **see the TASK.** | @Sober |

> 168 closed rows swept to archive/board-closed.md (2026-08-31).

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
