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
| TASK-292 | FE: **the client still computes a COUNT on a bulk act, and a NAME from an arbitrary row** | @Fern s answer on TASK-291 | 🟡 **§2 DONE · §1 STOPPED as instructed** (Fern 09-11) · **tsc 0 · 238/0 · build ok** · 🛑 **§1: NO `confirm/preview` exists — not built.** 🔴 **But the premise is wrong and the real divergence needs no endpoint: the plan DTO's `loadSessions` has NO `bookingType` filter, so it INCLUDES soft-linked `SINGLE_SESSION` extras, while `confirmCourse` filters `bookingType = COURSE_PACKAGE`** ⇒ a PENDING extra is counted by the button and never touched by the act · 🔻 **the `skips` panel is BLIND to it** (an extra is never loaded, so it produces no result) ⇒ `Confirm whole course (4)` → `Confirmed 3 sessions`, skips empty, nothing says why · **@Sober to re-cut** · ✅ **§2: `program` → `courseSlot?.subject?.name`** — the same row the server names from (`previewCourseEnd`'s `rows[0]` over COURSE_PACKAGE-only rows), **no second predicate** · 🔻 **NOT taken from the preview: its `program` IS `rows[0].subject` (not privileged) and exists only on the drop face — it would have fixed half a dialog** · 🔻 **`student` was NEVER `sessions[0]`; the task's "same shape" is wrong and it needed no change** · ✅ §3 checked: `createPreviewLine` renders only under `isCreate` · 🔑 break-and-watch, restore byte-identical by `md5sum` · 🔴 **Q: a THIRD exists and is SAFE — `bulkConfirmSelected` counts `selected.length` and the request CARRIES the ids** ⇒ **the shape is "a figure describing a set the SERVER chooses", testable as *does the request carry the set or only an id?*** | @Fern |
| TASK-294 | FE: **two OPPOSITE English facts share ONE Thai sentence** | @Fern s sweep on TASK-293 | 🆕 **TODO — no clock** → @Fern (Sober 09-08) · 🔴 **`plan.noLiveEnd` and `plan.noSessions` are the SAME Thai sentence** — *none left* vs *not begun*, **opposite meanings** · `REQ-036` fixed the CASE, left the COLLISION · **see the TASK** | @Fern |
| SPEC-078 | 📐 **`REQ-086` design: the customer edits the WORDS, not the messages** | `REQ-086` + the four built `§7` formats | 📐 **WRITTEN** → @Sober (09-09) · 🔑 **a notification is already a TITLE + an ORDERED field list, each field carrying a label, a value source and an EMPTY RULE** ⇒ **edit the title per** … **see the TASK** | @Porter |
| TASK-317 | FE: **`Ends` → `Last session` in the plan modal** (batch item 7a) | @Fern's own TASK-311 finding + @Porter | 🆕 **TODO — no clock** → @Fern (Sober 09-10) · **two date-shaped things on adjacent screens, only ONE clickable — the owner read them as the same** · ✅ **a LABEL change: the value is** … **see the TASK** | @Fern |
| TASK-318 | BE: **the LEAVE NOTICE, the customer’s own spec** (`REQ-085 §16d`/`§16e`) + `§16.4` + the ✅ | the customer verbatim, via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **1964/0**, 35=35, tsc 0, **all re-run by me** · ✅ **`Date : DD-MM-YYYY` via a SHARED `time.ddmmyyyy` — one transformation, two** … **see the TASK** | @Jason |
| TASK-319 | FE: **`Ends` is the wrong word, and the slot it names also takes a NON-DATE** (batch item 8a) | @Porter, from the owner’s round | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **196/0** · ✅ **`Last session {date}` / `คาบสุดท้าย {date}`** · 🔑 **option 2: new `noUpcomingSession`, and the date is now `string | null` ⇒ a non-date CANNOT enter the slot** (structural, not wording) · 🔴 **she found `noLiveEnd`’s SECOND caller (`diffSummary`) ⇒ the header had to stop using the string** · 🔑 **her rule: on the FE the risk arrives when the user’s PATH gains a second candidate, not when a screen does** | @Fern |
| TASK-320 | FE: **`TASK-284` reopened — the CREATION note is sent under the WRONG NAME** (`REQ-085 §3a`) | the owner via @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **196/0**, typecheck 0, **both re-run by me** · ✅ **one word: `note:` → `attendeeNote:`** · 🔑 **`note` is NOT also sent — the status** … **see the TASK** | @Fern |
| TASK-321 | FE: **`diffSummary` is the odd one out, and TASK-319 made it so** | @Fern’s own TASK-319 Question | ✅ **DONE — REVIEWED by @Sober** (09-10) · **222/0**, tsc 0, **re-run by me** · ✅ **`last session {end}` / `คาบสุดท้าย {end}` + NEW `diffSummaryNoEnd`** — **not the same fact: TENSE** … **see the TASK** | @Fern |
| TASK-322 | FE: **assert that a form value arrives under the NAME the reader uses** | @Fern’s own TASK-320 Question | ✅ **DONE — test-only** (Fern 09-10) · 🔻 **THE RESULT IS A CORRECTION: the check I proposed (§A, key sets agree) does NOT catch TASK-320** — the dialog sent `note:`, the service … **see the TASK** | @Fern |
| TASK-323 | BE: **two copy items, and each has a BOUNDARY the copy does not state** (batch items 3 · 6) | the customer + @Porter | ✅ **DONE — code, REVIEWED by @Sober** (09-10) · **1976/0**, 35=35, tsc 0, **all re-run by me** · ✅ **the hint off the birthdate + province PROMPTS; the BAD-BIRTHDATE RE-ASK KEEPS it —** … **see the TASK** | @Jason |
| TASK-324 | FE: **`15:00:00` — there is NO formatter for a time a human reads** (batch item 7) | the owner via @Porter | ✅ **DONE — REVIEWED by @Sober** (09-10) · **222/0** · ✅ **`formatTimeDisplay` beside `formatDateDisplay` — a TRIM, not a parse, and that is load-bearing** · 🔑 **my “four broken** … **see the TASK** | @Fern |
| TASK-325 | BE: **the trailing blank line, fixed where messages are BUILT** (`REQ-085 §16.3`, batch item 4) | @Porter, the owner | ✅ **DONE — REVIEWED by @Sober** (09-10) · **1983/0**, 35=35, tsc 0, **re-run by me** · ✅ **ONE trim at the builder; the five per-branch ones GONE, asserted as an absence on the switch** … **see the TASK** | @Jason |
| TASK-327 | BE: **no message can emit an un-interpolated `{placeholder}`** | @Jason’s own TASK-325 Question (candidate 3) | ✅ **DONE — REVIEWED by @Sober** (09-10) · **1990/0**, 35=35, tsc 0 · ✅ **ZERO product code — verified: `git status` is one new test file** ⇒ landed safely UNDER @Tanya’s round · 🔑 … **see the TASK** | @Jason |
| TASK-328 | BE: **the labelling convention lives in NINE branches — and can it even MOVE?** (`TASK-257 §3`) | @Jason’s TASK-325 candidate 4 | ⛔ **CUT AND HELD — released only when @Tanya’s `uat` round closes** → @Jason (Sober 09-10) · ⚠️ **it changes VISIBLE labels on three messages she is reading now** · 🔴 **the obvious** … **see the TASK** | @Jason |
| TASK-330 | BE: **the MAP — which invariants of an outbox message live in the BRANCHES?** | @Jason’s TASK-327 answer | ✅ **DONE — REVIEWED by @Sober** (09-10) · **ZERO changes in `src/`, verified clean** · 🔴 **THE FINDING: `Remaining : 0` cannot print — `||` not `??`, so a zero balance DELETES THE WHOLE LINE. Latent, un-asserted, SILENT, and the compiler looks like it is helping (`as string` on an `unknown`)** · 🔑 **@Sober counted the` … **see the TASK** | @Jason |
| TASK-331 | BE: **every field, rendered EMPTY and ZERO, read by a human** | @Jason’s TASK-330 §3/§4 | ✅ **DONE — REVIEWED by @Sober** (09-10) · **`git status` EMPTY, nothing in `src/`** · 🔻 **it CORRECTED @Sober: “thirteen-wide class” was a COUNT reported as a FINDING — ten can lose** … **see the TASK** ||` eats a zero, `??` lets an empty string through — the file has BOTH bugs, one per idiom** · 🟢 **nothing LIVE** | @Jason |
| TASK-332 | BE: **`Remaining` must be able to say ZERO** | @Jason’s TASK-331 §2 | ✅ **DONE — REVIEWED by @Sober** (09-10) · **2001/0**, 35=35, tsc 0, **re-run by me** · ✅ **a `fieldValue` HELPER, not an operator — THREE conditions and an operator states one** · 🔻 … **see the TASK** | @Jason |
| TASK-333 | BE: **the outbox payload is PARSED, not cast** | @Jason’s TASK-331 Question | ✅ **DESIGN HALF DONE — REVIEWED by @Sober** (09-10) · **nothing in `src/`** · ✅ **OBSERVE-ONLY parse: it does not gate rendering, it writes one log line ⇒ *the union’s first job is to** … **see the TASK** | @Jason |
| TASK-334 | BE: **THREE notifications send a meaningless line** (the generic `🔔 แจ้งเตือนจากระบบ` default) | @Jason’s TASK-333 inventory | ✅ **PART A DONE — REVIEWED by @Sober** (09-11) · **2017/0** · **a SPECIFIC `case`, not a `text` passthrough — @Porter: *a general one makes every future payload’s `text` silently** … **see the TASK** | @Jason |
| TASK-335 | BE: **the VOUCHER deduction says COURSE, and counts in Thai** (`REQ-087 §1a`/`§1c`) | the customer + the owner, via @Porter | ✅ **DONE — REVIEWED by @Sober** (09-11) · **2017/0**, 35=35, tsc 0, **re-run by me** · 🟢 **`uat` unblocked from our side** · 🔻 **@Sober’s “trap” was WRONG — the card never shared** … **see the TASK** | @Jason |
| TASK-336 | BE: **`Remark` on BOTH deductions** (`REQ-087 §1b`) | the OWNER via @Porter | ✅ **DONE — REVIEWED by @Sober** (09-11) · **2030/0**, 35=35, tsc 0, **re-run by me** · 🟢 **`uat` UNBLOCKED** · ✅ **read in `notifyCourseDeduction`, a PARAMETER not an input field — *an input field no caller sets reads as one somebody forgot*** · 🔴 **he corrected me: the DAY-END selects an explicit column list and does NOT have the note — the MAJORITY path** · ✅ **proved it is the SESSION’s note against a course with DIFFERENT notes per session** · 🔻 **his “whitespace hole is LIVE” is WRONG — zod `.trim()` makes it LATENT (@Sober verified by running it)** | @Jason |
| TASK-337 | BE: **the two sibling `Remark` guards, as DEFENCE IN DEPTH** | @Jason’s TASK-336 §4, premise corrected | ✅ **DONE — REVIEWED by @Sober** (09-11) · **2040/0**, 35=35, tsc 0 · ✅ **all FOUR note renderings now on one guard, two named upstreams (zod · `courseNote`)** · ✅ **safety asserted by comparing against the OLD EXPRESSION for every producible value** · 🔴🔴 **HE RAN `git checkout --` AND DESTROYED FOUR TASKS OF UNCOMMITTED WORK — recovered, and @Sober verified all four changes INDIVIDUALLY** · 🔑 **new rule: restore from your OWN byte copy, never from git** | @Jason |
| TASK-338 | BE: **two comments that describe the code as it was this morning** | @Sober, reviewing TASK-337 | ✅ **DONE — REVIEWED by @Sober** (09-11) · **2041/0**, tsc 0 · 🔑 **the CODE-STRIPPED DIFF IS EMPTY — comments only, verified** · 🔴 **a THIRD copy found in his own test header: the file disagreed with itself and BOTH HALVES PASSED, because one was prose** · ✅ **the `matching` sentence that misled @Sober rewritten to SHAPE ONLY** · 🔑 **the answer: GREP FOR THE LITERAL YOU JUST DELETED — one command, would have caught all three** | @Jason |
| — | BE: **`line()` vs `extra()` — nine branches choosing a LABELLING CONVENTION by hand** (`TASK-257 §3`) | @Jason’s TASK-325 Question (candidate 4) | ⛔ **HELD until after the `uat` round** · 🔑 **the better next task — same mechanism as `§16.3`, and it already has a defect history (`จำนวนคาบที่ยืนยัน` under eight English labels)** · ⚠️ **it changes VISIBLE labels on three messages and @Tanya is about to read them** | — |
`** · 📌 **`§7.1` was NOT one ⇒ the `📅CONFIRMED SCHEDULE` they photographed was the PER-SESSION message; their two reports were the COMPLETE list** · 🔴 **COMMIT `0d91b4d` CAPTURED MY MUTATED LINE — tree is correct and green, `git diff HEAD` is that one line; needs one fresh commit from the human** · 🔑 **new rule: mutation + restore in ONE tool call — the window is shared** · ❓ **twin found: `line()` vs `extra()` labelling, 9 of 14 by hand** · 1983/0 · 35 = 35 · tsc 0 | @Jason |
| TASK-326 | FE: **two raw time sites the sweep missed, and a lockstep file that is NOT** | @Fern’s TASK-324 report | ✅ **DONE — REVIEWED by @Sober** (09-10) · **227/0**, tsc 0, **re-run by me** · 🔑 **the count is NINE, not four or six — three hide from every grep: a `value=` PROP and two i18n** … **see the TASK** | @Fern |
| TASK-329 | FE: **the header STOPS promising lockstep, and the last three time sites** | @Fern’s TASK-326 report | ✅ **DONE — code** (Fern 09-10) · §1 header replaced (your wording + the CLAIM clause) and it **names the two facts that made the old promise false** — comment only, asserted · §2 `ExpiryWarningSession.startTime` → **`string \| null`**, matching the BE's `ExpiryCandidate`; 🔑 **honest, not looser: `HhMm` IS `string`, so the alias was a LABEL not a constraint — nothing widens, no call site changes, no` … **see the TASK** | @Fern |
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
