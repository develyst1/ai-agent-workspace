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

**Batch 2026-11-08 (REQ-120 wk 1, owner GO):** Team A (Sober) → backoffice-back `src/routes/auth.ts` · `src/middleware/auth.ts` · new users/roles service + probe route · backoffice-front shell + sign-in + role context (TASK-856/857, SPEC-097) · **shared, Team A holds first:** backoffice-back `src/db/schema.ts`, `drizzle/` journal (first slot via `MIGRATION-QUEUE.md`), `src/routes/api.ts` router registration — another team edits these only after A's line in MIGRATION-QUEUE says `applied · verified`, one at a time, append-only · Team B (Silver, cut 11-08) → smart-scheduler-back: `course_packages` / `vouchers` / `teachers` columns in `src/db/schema.ts`, the sale paths `createCoursePackage` + `createVoucher`, TASK-838's `runCourseTeacherTimeChange`, the day-end first-coach step in `jobs.service.ts`, new `src/lib/first-coach.ts`, the system-teacher exclusion lines (TASK-861 §2c files), `.env.example` · smart-scheduler-front: the teacher pickers / calendar column / roster (TASK-861 §3) · backoffice-front: `src/app/(admin)/salary/{people,person,settings,my-slip,entries,daily}` · `components/partials/Salary/**` (not Fern's Pay run / Slip) · `services/salary.service.ts` + fixture · `types/app/salary.ts` (TASK-862, after Fern's shell) · backoffice-back: new `src/db/schema-salary-b-read.ts` · `src/lib/bonus-rules.ts` · `src/services/bonus-candidates.service.ts` (TASK-863, no migration, no route) · `src/services/bonus-lines.service.ts` (TASK-867) · `src/db/schema-salary-b.ts` + 1 `drizzle.config.ts` array entry + `transport-pricing.ts` / `transport.service.ts` / `routes/transport.ts` (TASK-868) · **one route line each in Jason's salary router, only after TASK-865 DONE** · **shared, hunks inside named functions only:** back `scheduler.service.ts`, `jobs.service.ts`, `calendar.service.ts`, `drizzle/` journal (via `MIGRATION-QUEUE.md`) — F4 goes first there, then C1 / F2 (TASK-860/861) · Team C (Sector, cut 11-08: SPEC-098, TASK-858/859) → BB `src/db/schema-revenue.ts` · `src/lib/revenue-ledger*` · `src/services/revenue.service*` · `src/routes/revenue*` · `src/middleware/revenue-access.ts` · Team C's migration via `MIGRATION-QUEUE.md` · BB `drizzle.config.ts` schema-array line (granted, DECISIONS row 3) · BF `src/app/(admin)/revenue/{summary,detail,manual,categories}/**` · `src/components/partials/RevenueLedger/**` · `src/services/revenue-ledger.service.ts` · `src/types/app/revenue-ledger.ts` · BB `api.ts` `/revenue` mount only after TASK-856 DONE · NOT C's: BB `schema.ts`, `middleware/auth.ts`, `routes/auth.ts`, `.env.example` (Team A), BF `AdminLayout.config.ts`, `(admin)/layout.tsx`, the old `/revenue` page · **Team C wk 2 (Sector, TASK-864 C1 slice 1, 11-08)** → smart-scheduler-back new `src/db/bo-revenue.ts` · `src/lib/revenue-line.ts` (+test) · `src/lib/booking-sale-amount.ts` (+test) · hunks inside `applyConfirm` / `confirmCourse` / `createVoucher` (`scheduler.service.ts`) · one hunk in `rental.service.ts`. `createVoucher` passes from B to C now that F4 (TASK-860) is DONE; Team B's TASK-861 keeps its system-teacher exclusion hunks only — two teams never edit the same function at once · **Team A money-grade spine (Sober, SPEC-101, TASK-871, 11-08)** → backoffice-back `schema.ts` (new `pay_class_type` enum + `fl_rate` table + 3 profile cols + 2 period cols) · `drizzle/` journal (next queue slot) · `src/services/salary*.ts` · `src/routes/salary.ts` · `src/lib/pay-period.ts` — NO scheduler file · **hours reader (SPEC-101 §5) → Team C / Brew, TASK-872** (DECISIONS row 16): new read-only `src/services/hours-reader.ts` (+test, +fixtures) · new `src/db/pub-timetable.ts` (read-only, not in drizzle config) in backoffice-back; not blocked on TASK-871 (keys on class-type strings) · Ports: A 4006/4010 · B back 4106 / BB 4110 · C SB 4306 / SF 3306 / BB 4310 / BF 3310.

**Claim 2026-11-10, Team C TASK-935 (BB English sweep), Porter's grant, written by Sector:** BB `src/lib/http.ts` (3 defaults) · `src/routes/{notifications,stock,revenue-ledger}.ts` · the in-scope services (TASK-935 §Scope) · their tests + mutation pins · new `src/lib/english-errors-task935.test.ts`. **Text-only edits. No edit until Sober's bundle commit lands.**
- SB `src/lib/som-contract.ts`, `src/services/som-contract.service.ts` and `src/types/contract.ts` (the SOM DTO).
- Plus one new test file.
- The 946/947 claim on `scheduler.service.ts` was released when SB 8ee821a was committed. No overlap.

**Claim 2026-11-13, Team C TASK-959/960 (REQ-5013 close a day B, SPEC-105), requested by Sector, GRANTED by Porter 2026-11-13 (his grant line below):** SB `scheduler.service.ts` (`assertTeacherBookable`, `insertBooking` head, `findFreeExtensionDate`) · `jobs.service.ts` (extender) · `attention.ts`/`attention.service.ts` · `routes/api.ts` + `validation.ts` (3 routes) · `line-i18n.ts` · `db/schema.ts` + one new migration (⚠ numbering vs TASK-942) · SF `Calendar/CalendarContent.tsx` + new Calendar files · `attention-link.ts` · `contract.ts` · `dictionaries.ts`.

- SB `src/services/scheduler.service.ts`: two hunks only, the `coachOff` build in the single cancel (~:4757) and in the group cancel (~:4712).
- Plus their tests.
- No other seat holds this file today; the desk is otherwise stopped.
- **Extended 2026-11-11 for TASK-947 (F2, owner "แก้ให้ถูกอ่ะ"; 946 is green).** SB:
  - `scheduler.service.ts`: confirmMakeupAtBirth; the undo-leave and expiry notices; classCancelledFamilyAccounts; announceMove; the confirmCourse payload;
  - `src/lib/line-message.ts`: one course_confirmed renderer line;
  - `src/lib/line-i18n.ts`: the «ขยายคาบ» / "Extended" label strings, text only (added 2026-11-11);
  - `src/services/undo.service.ts`: one hunk, so an undo-leave restores PENDING while the course is unconfirmed. Added 2026-11-11 for defect O-152-1, a rework inside 947;
  - `src/services/jobs.service.ts`: the parent-copy gate in the daily reminder. This replaced `src/lib/daily-reminder.ts` in the claim, on 2026-11-11 at Sector's request;
  - plus their tests.

**Claim 2026-11-13, Team C TASK-959 (Brew, SB) + TASK-960 (Flash, SF), REQ-5013 close-a-day B (paid), Porter's grant:** the files listed in `specs/SPEC-105-close-a-day-option-b.md`. SB migration via `MIGRATION-QUEUE.md`; it must not clash with Team B's TASK-942 migration, so whichever lands second renumbers.
**Claim 2026-11-09, Team C TASK-892 (refund cancel, SPEC-099 §10), Porter's grant, written by Sector:** SB `src/routes/internal.ts`: ONE `/refund-cancel` route, **append-only** (Jason's TASK-888 `/internal/salary-remind*` lines stay untouched) · new `src/lib/refund-cancel.ts` (+ test).
- SB `scheduler.service.ts` (`createCoursePackage` / `createVoucher`, next to `recordSale`) waits until Silver says Bob's TASK-861/870 hunks there are in REVIEW.
- SF `CreatePlanFlow.tsx` / `PlanModal.tsx` / `VoucherPanel.tsx` wait until Silver says Fanta's TASK-870 FE is in REVIEW.
- SB `index.ts` (one `app.route` line) and `route-access.ts` (three entries) are append-only.

**F1 (branch for booking, 7.2 d) = Team C (Sector)**, the default, as REQ-120's Revenue pile. Revenue needs the branch on every line, and the payment card sits in the same SF screens; Bob's queue is already serial. Silver hands his REQ-5010 #7 wording note to Sector: branch on every booking, picked at create; a one-off move in Move session; a whole-course change next to Change teacher. Whole-course is parked on Trolley.

> → The closed batches (2026-10-02, 10-05, 10-08 REQ-116, 10-12 REQ-119) moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## Project context — state and pointers only (restored from SYSTEM-FACTS.md, Marie ORDER 12.5, 2026-09-28)

> → The project context (state as of late September) moved verbatim to `archive/board-2026-11-01-sections.md` (2026-11-01, ORDER 51).

## Project info → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 2026-09-09).**

## Requirements

| ID | Title | Prio | Status | Next step · tasks |
|----|-------|------|--------|-------------------|
| REQ-003 | Teacher onboarding/offboarding, synced both systems | HIGH | **ON HOLD** | Do NOT deploy — the backoffice sync is moot. |
| REQ-020 | Secure the LINE pairing — approval, collision, control | MED–HI | **QA PARTIAL** | LINE claim path untested; needs the owner's phone. TASK-075+076 pair; TASK-047 DONE. |
| REQ-021 | Badge/tagging system — gaps from the 07-31 audit | LOW | **BACKLOG — parked** | Do not start. Revenue-by-branch is impossible today — decide with REQ-014. |
| REQ-023 | Daily admin digest — 08:00 LINE + attention view | MED | **QA PARTIAL** | Delivery untested; register the 08:00 task first. TASK-053 DONE. |
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
| REQ-042 | LINE role change did not switch the rich menu | HIGH | **FIXED & owner-verified 08-16** | Not yet DELIVERED. Empty `line_rich_menu_ids`. TASK-130. |
| REQ-013 | SOM dashboard — customer / activity / attendance | MED | **SPEC_DONE** | Warn the owner: low coverage, large "unknown". TASK-062, TASK-063. |
| REQ-014 | Backoffice — revenue by activity + customer spend | MED | **SPEC_DONE** | Acceptance: open a real month, confirm its reconciliation. |
| REQ-017 | Teacher bookings → phone calendar feed | MED | **DEPLOYED — acceptance INCOMPLETE** | NOT delivered; LINE does not linkify `webcal://`. TASK-044. |
| REQ-078 | การจองแบบ **อื่นๆ** (owner's REQ-005) — 🔢 **owner's #1** | HIGHEST | 🅿️ **PARKED at TEST_FAILED — narrowly** (`sid`, 09-02) · ⏳ **money round LIVE 09-05** — `tests/TEST-064` §Round 4 (verdict + PARK NOTE) and §Round 5 | ✅ 4 defects fixed; 18 ACs pass. 🔴 Blocking: DEF-4 reopened (display-only) · DEF-7. ⏳ ฿20 fixtures CONFIRMED for tonight’s 18:30 pass — see `tests/TEST-064` … **see the TASK.** |
| REQ-077 | LINE OA + rich menu + notification set (owner's REQ-014) — 🔢 **#5** | HIGH | 🟢 **NOTIFICATION HALF DONE on `sid` (09-06)** · OA/menu half **DRAFT** | Six messages live, customer's format, **7 Porter decisions each one line to revert**. 🔴 Not on `uat` yet. Menu half: the customer took our menus off their OA 09-05. |
| REQ-080 | QA read-only on **both** `uat` hosts — narrow the `mint-session.mjs` guard on `frontoffice`, **extend** it to `backoffice` | HIGH | **READY_FOR_SA** (09-04) | 🔴 `backoffice` is **unguarded today** — see REQ §4b. @Sober — Q1/Q3 open, Q2 answered. |
| REQ-082 | ขยับวันหมดอายุได้ทุกคอร์ส (owner's **REQ-017**) | LOW | **DRAFT — 1 question** | Which courses cannot be moved today? *"ทุกคอร์ส" is an answer to something.* Pairs with REQ-084. |
| REQ-084 | ปุ่มนำคอร์สที่พักกลับมา (owner's **FIX-009**) + 🐛 a paused course still offers `พักคอร์ส` | MED | **DRAFT — 2 questions** | The defect half is blocked on **nothing** and can ship alone. AC-C: the same bug is probably in lists/cards/search. |
| — | **Khwan's back-office report question:** per block or all at the end (REQ-120 §12); her cut-off line is now REQ-5007 | HIGH | Owner ruled two layers 11-07 (F-034); draft with Tanya; SAs confirm sizes include block reports | @Tanya · @Sober · @Silver |
| REQ-5008 | A used-up voucher can still be booked + checked in, no warning (Khwan 11-08: 1 left, 3 booked + 3 check-ins) | HIGH | NEW 11-08 · Tanya: uat read-only facts + sid reproduction · Silver: read-only code read + size · no customer reply until cause + gate | @Tanya · @Silver. `requirements/REQ-5008-…md` |
| REQ-5007 | Button to change a whole course's activity (+ 1 HR, Trial) and what it affects (Khwan; conflicts with REQ-053) | HIGH | SAs answered; recommendation in the REQ. **HELD: the owner talks to พี่เบส (his PM) first, 11-07.** No build. Tanya's sid run of today's route continues | @owner + พี่เบส. `requirements/REQ-5007-…md` |
| REQ-5006 | Cancelling a purple EXTENDED class grows a new one on the same date; expiry doesn't move (Khwan 11-07) | HIGH | Reproduced (TEST-140), Sober explained: same-slot regrow, no week; 9 rows on 8 uat courses. 10 rows now. Path found: Record teacher leave + Cancel ticked. Customer text READY (Tanya PASS); no build; a guard in the dialog is the owner's call | @owner (send; names file). `requirements/REQ-5006-…md` |
| REQ-5005 | Rental already marked paid: how to change it when a family upgrades (Khwan's question) | MED | Sober answered 11-07: no edit today; workaround = standalone +50 rental; clean fix ≈ 2–3 d (no TASK). Draft READY (Tanya PASS, TEST-139); clean fix with REQ-120 unless the owner says otherwise | @owner (send). `requirements/REQ-5005-…md` |

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
| REQ-041 item 6 | FE: heading type-pairing (display face ≠ body) | REQ-041 | HELD | Fern |
| TASK-110 | BE: booking-type filter on `GET… | SPEC-032 | TODO | Jason |
| TASK-111 | FE: SOM dashboard booking-type control + render… | SPEC-032 | BLOCKED (TASK-110) | Fern |
| TASK-116 | bo-BE: structural `kind` column on `bo.item… | SPEC-034 | TODO | Jason |
| TASK-118 | bo-FE: Items-screen stock field… | SPEC-034 | BLOCKED (TASK-116) | Fern |
| TASK-179 | FE: REQ-068 note input + admin view… | SPEC-063/REQ-068 | PARTIAL · see TASK-184 | Fern |
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
| TASK-617 | ⚠️ **ONE red test that is NOT this batch — and it blocks the words "clean run" for BOTH teams** | (@Sober, 10-03 — verified pre-existing) | ▶️ **ASSIGNED — @Porter extended Team A claim to this file for ONE line (10-03); cut as `TASK-626` to @Jason** → full: `tasks/TASK-617-board-record.md` § Board row | @Jason 
| TASK-861 | BE + FE: **F5 "No Teacher" system teacher** for park-fee blocks (back + front) | REQ-120 GO 11-08 | ✅ BE DONE 11-08 (Silver re-ran tsc 0 · SAFE 5412/0 · 0075 applied · verified on sid) · FE accepted on code · live check pending (with 870) | @Bob · @Fanta |
| TASK-942 | BE + FE: **park fee: several groups per hour** (`slot_exempt` flag + slot-index rebuild 0077; calendar stacks N blocks) (SB + SF, ≈ 1.5–2.5 d) | owner decision 11-10 (supersedes DECISIONS row 11's 1-per-hour) | 🔁 D-155-1 fixed 2026-11-13 (SB + SF reviewed) · deploy ask with Porter → Tanya re-runs TEST-155 case 4 | @Porter |
| TASK-962 | FE: **«เปลี่ยนกิจกรรม» dialog** — REOPENED (its swept row is in archive/board-closed.md) | REQ-5014 · TEST-157 | ✅ TEST-157 PASSED on sid 2026-11-13 (committed SF 6c52040) · ready to sweep | @Porter |
| TASK-961 A1 | BE: **a course on a typed-price activity can change again** (old price = the stored typed price) — TASK-961 § Amendment 1 | REQ-5014 · TEST-157 re-test · Porter [PM-decided] | ⏸ cut 2026-11-13 · starts AFTER the owner's uat deploy (tree frozen) | @Bob |
| TASK-933 | FE: **D-150-1 Team B half: Salary screens in English** (+ CEO not shown a refusing "Other Income") (backoffice-front, ≈ 0.5–1 d) | TEST-150 D-150-1 · Porter 22:23 | ✅ green on code 11-09 (Silver re-ran tsc 0 · 427/0) · rides the bundled BB/BF redeploy → Tanya · 2 words + Transport-notes call with Porter | @Fanta |
| TASK-879 | BE: **Payment Detail export** — slip Excel (section subtotals) + PDF (every line, Thai font), CEO-only, backoffice-back — Silver's spec, built by Jason | REQ-120 l.220/279 | ✅ Silver-accepted 11-09 (formula-injection guard on XLSX + the 865 CSV… (full text: its file § Board text 11-13) | @Jason |
| TASK-897 | FE: **self-host fonts** (swap `next/font/google` → `next/font/local`) — backoffice-front — 🔴 deploy blocker (no-internet box) | deploy 11-09 | 🟡 BLOCKED on OWNER 2026-11-09 — needs his yes to download the OFL fonts (Noto Sans Thai + IBM Plex Mono woff2); relayed via Porter. Shared `next build` now GREEN (Fanta's listDailyDays fixed). | @Fern |
| /salary/payrun menu row | FE: add the SALARY menu row so the order matches the final UI (TASK-862 § Review follow-up) — backoffice-front, nav/PAGE_RULES only | 11-09 | 🔵 GO 2026-11-09 · small, while 897 waits on owner · Sober reviews | @Fern |
| TASK-903 | BE: **`class_type` on fl_pay lines** — one line per (date × class), new nullable `bo.pay_class_type` column, so the slip/export split Freelance Teaching Pay by class (final UI) — backoffice-back, SPEC-101 §6 | REQ-120, Porter 11-09 (before demo) | 🔵 GO 2026-11-09 · additive migration · §10 hand-example re-work · Sober reviews · 879 export-split + FE render = follow-ons | @Jason |
| R1.6 reader | BE: **hours reader returns student names** ("who taught" itemisation, Khwan §1.3) — SPEC-101 §5 extension | REQ-120 R1.6 | 🧩 contract in SPEC-101 §5 (Sober); ✅ TASK-884 DONE (Brew, students-per-day); link-3 labels enhancement = post-demo (Sober, data-limited: camp no names, ECA ≤1) | @Brew |
| R1.5 confirm/remind | BE: **coach confirms own slip + CEO "remind now"** (status draft→confirmed; returns unconfirmed list) — SPEC-102 §5-E4 | REQ-120 R1.5 | 🧩 addendum in SPEC-102 §5-E4 (Sober) · **Silver cuts + reviews** for Bob (Team B) · Sober repo-fit · id pending Silver | @Bob |
| TASK-888 | BE: **R1.5 LINE reminders** — 09:00 + 11:00 scheduled pushes + remind-now send, via smart-scheduler-back's existing LINE integration | REQ-120 l.68–69/279 | 🔵 GO 2026-11-08 · 🔶 cross-repo (new reminder job in smart-scheduler-back — no sale-path edit) · HARD fail-closed off in dev/test · remind-now contract = Sober↔Silver · Sober reviews | @Jason |
| TASK-894 | FE: **Refund screen** (backoffice-front) from the final UI — SPEC-099 §10 | REQ-120 GO 11-08 | ACCEPTED on code 2026-11-09 (Sector) · still owed: Tanya's sid refund re-run after D-150-2 (owner sets SCHEDULER_API_URL/SECRET on BB sid; back office paused) · TASK-894 ## Review | @Flash |
| TASK-935 | BE: **BB API English sweep** — client-facing Thai error sentences → English (outside salary/users/auth), codes/statuses unchanged + a Thai-scan test (backoffice-back) | R0.5 · Sober's note · Porter 11-09 | TODO (still owed, ORDER 67 pass 11-13) · starts when the back office resumes and Sober's BB bundle is committed · after TASK-965 | @Brew |
| TASK-965 | BE: **REQ-5015 coach time ranges: part-day leave + working hours** (SB) — SPEC-108 | REQ-5015 · owner (free) 11-13 | ✅ DONE 2026-11-13 (Sector; re-run 6041/0, tsc 0) · 0080 on sid (81/129/81) · waits for TASK-966 then the full-tree gate · TASK-965 ## Review | @Brew |
| TASK-966 | FE: **REQ-5015: several coaches' leave + part-day leave + working hours** (SF) — SPEC-108 | REQ-5015 · owner (free) 11-13 | ✅ DONE on code 2026-11-13 (Sector; SF 1583/0, tsc 0) · UI proof in Tanya's round after the deploy · TASK-966 ## Review | @Flash |
| TASK-969 | BE: **REQ-5016 F1 (Team C slice): migration + course-pattern.ts (first) + create/preview + next-slot make-up + LINE** (SB) — SPEC-109 §8/§8a | REQ-5016 (paid) · Porter 11-13 | ✅ DONE 2026-11-13 (Sector; re-run SB 6092/0, tsc 0) · 0081 goes with the next joint deploy · 971 = Team B · TASK-969 ## Review | @Brew |
| TASK-973 | BE: **D-159-1 — the plan read carries `summary.slots`** (SB; `courseSlotsDto` one builder) — SPEC-109 §3.5 | REQ-5016 AC5/AC6 · TEST-159 | 🔍 REVIEW 2026-11-13 (Brew; SB tsc 0, suite 6138/0; scheduler.service.ts released) · TASK-973 Notes | @Brew |
| TASK-975 | BE: **D-159-2 — `expandPattern` lays rows out from a `fromDate` before the course start** (SB, course-pattern.ts only) — SPEC-109 §8b | REQ-5016 AC5 · TEST-159 | 🔍 REVIEW 2026-11-13 (Brew; SB tsc 0, suite 6144/0) · TASK-975 Notes | @Brew |
| TASK-979 | BE: **D-159-3 — the change-pattern act passes `{ startTime }` (part-day leave + working hours)** (SB, course-pattern-change.service.ts) — SPEC-109 §3.4 | REQ-5016 AC5 × REQ-5015 · TEST-159 Gap 1 | 🔍 REVIEW 2026-11-13 (Brew; SB tsc 0, suite 6150/0) · TASK-979 Notes | @Brew |
| TASK-970 | FE: **REQ-5016 F1 (Team C slice): WeeklyPatternEditor at sale + CreatePlanFlow + displays** (SF) — SPEC-109 §8 | REQ-5016 (paid) · Porter 11-13 | ✅ DONE on code 2026-11-13 (Sector; SF 1638/0, tsc 0) · real run with Tanya after the deploy · 972 = Team B · TASK-970 ## Review | @Flash |
| TASK-971 | BE: **REQ-5016 Team B slice: whole-day leave + quota per course week, change-pattern act + resume** (SB) — SPEC-109 § 8 | REQ-5016 · owner «ให้ทีม B ช่วยเลย» | ✅ DONE 2026-11-13 (rolled-back sid proof green; scheduler.service.ts released) · next joint gate → «ขึ้น git» → deploy → Tanya | @Porter |
| TASK-972 | FE: **REQ-5016 Team B slice: «ลาทั้งวัน» + change-pattern dialog** (SF) — SPEC-109 § 8 | REQ-5016 · owner «ให้ทีม B ช่วยเลย» | ✅ DONE 2026-11-13 (reviewed; real run = Tanya on sid after deploy) · next joint gate → «ขึ้น git» → deploy → Tanya | @Porter |
| TASK-967 | BE: **REQ-5015 follow-up O-158-1: a part-day leave refusal names the hours + Thai date** (SB) | TEST-158 · Porter 11-13 | ⏸ cut 2026-11-13 · starts after the owner's uat deploy (tree frozen) · ≈ 0.25 d | @Brew |
| TASK-968 | FE: **REQ-5015 follow-ups O-158-2 (dialog words follow the window) + O-158-3 (no «+» outside work hours)** (SF) | TEST-158 · Porter 11-13 | ⏸ cut 2026-11-13 · starts after the owner's uat deploy · ≈ 0.5 d | @Flash |
| TASK-963 | BE: **REQ-5014 Team C revenue pieces: M0 course subject · Detail activityChange · manual course link** (BB) — SPEC-107 | REQ-5014 · Porter 11-13 | ⏸ cut 2026-11-13 · starts when the back office resumes + TASK-961 on sid | @Brew |
| TASK-964 | FE: **REQ-5014 Team C revenue pieces: Detail «X → Y» + note · Add Manually deep link** (BF) — SPEC-107 | REQ-5014 · Porter 11-13 | ⏸ cut 2026-11-13 · after TASK-963 | @Flash |
| TASK-976 | FE: **GR round 13, Team A** (PayRun columns + title case · User Setting «menu» · Notification Setting hint) — final-ui | ขวัญ 13/11 · REQUEST gr-round-13 | ✅ DONE (Sober 2026-11-13) · r13b LIVE 20261113-091125 (md5 f12833e4, 401 ✓) · A 976 · B 978+Amd 1 · C 977+Amd 2 · with Tanya via Porter | @Fern |
| TASK-951 | BE: **/bo/reports/* CEO-only guard** (`adminAuth` → `requireRole("ceo")` on pl / revenue-by-activity / customer-spend + route tests) (backoffice-back) | Porter 11-11 (CHECK-2026-11-11-bo-reports-pl-guard) | TODO · **start after 14 Nov** · ships with the English back-office deploy | @Jason |
| TASK-906 | FE: **Stock Report base** — shell + period filter + Movement (on 904 movements) — backoffice-front, Stock block | REQ-120 R3.8 | ✅ **ACCEPTED on fixture 2026-11-09** (code-read: no money, type vocab=904's SALE/STOCK_IN/ADJUSTMENT/FROM_DEMO, /stock/reports ceo+admin, Sample-data notice; tsc 0, 15/15, 280/0) · Sales/Balance wiring follow-on · #19 PARKED · real-wire pending deploy · Sober reviewed · @Flash | @Flash |
| TASK-908 | FE: **Stock Import screen** — git-style diff → confirm (BF half of 904) — backoffice-front, Stock block | REQ-120 R3.4 | ✅ **ACCEPTED on fixture 2026-11-09** (category/commissionGroup added, /stock proxy line, tsc 0, bun 155/0, build 0; NEGATIVE_BALANCE+STALE+BATCH_NOT_FOUND+flags[] answered) · real-wire pending BB deploy · Sober reviewed | @Fern |
| TASK-910 | FE: **Stock OUT sell screen** — cart + per-item discount/commission + confirm (completes 905) — backoffice-front, Stock block | REQ-120 R3.5/§9 | ✅ **ACCEPTED on fixture 2026-11-09** (tsc 0, 179/0, build 0; atomic refusal, idempotent, R0 Total CEO-only, no commission math) · 4 Qs answered · method select (default Transfer) VERIFIED in code · real-wire pending 909+deploy · Sober reviewed | @Fanta |
| TASK-917 | BE: **Notification half** (R0.4, behind 914) — store · feed (own items) · role-derived read-only assignments (C-h) · createNotification/recipientsForType seam — backoffice-back | REQ-120 R0.4 | ✅ **ACCEPTED 2026-11-09** (code-read: feed own-only, recipients read-only CEO, NO assignment write route=C-h; seam exported+idempotent; 0020 ledger 22; 1139/0, 15/15 sid) · open: London username (owner), Salary events→Silver, FE "Extra Hour" · Sober reviewed · @Jason | @Jason |
| TASK-930 | BE: **R0.1 user/login management** — CEO-only create/list/reset-password/deactivate (coach needs teacherId) — backoffice-back | REQ-120 R0.1 / C4 | 🔴 GO 2026-11-09 (Porter) · BB has no create-user route (createBoUser seed-only) → blocks all admin/coach sign-in · **route-level tests mandatory** · reuse createBoUser hashing · @Jason/Bob via Silver · Sober reviews | _BE_ |
| TASK-931 | FE: **R0.1 People page login dialogs** — Create login/Reset password/Deactivate + logins list + login-text fix — backoffice-front | REQ-120 R0.1 | 🔴 GO 2026-11-09 (Porter) · final-UI People (TASK-809) · on 930's /v1/users · fixture seam · no password logged/echoed · Sober reviews · @Fern | @Fern |
| TASK-918 | FE: **Stock DEMO screen** (R3.6) — matrix · Move · Defect→Demo · Delete · Add/Order sites — backoffice-front | REQ-120 R3.6 | ✅ **ACCEPTED on fixture 2026-11-09** (built to 915 1:1; tsc 0, 249/0, 17/17 mut, build 0, live headless; NEGATIVE_BALANCE details via 908 fix; no sale↔Demo) · 3 Qs answered (whole-delete wording→Porter; who-map=BB) · real-wire pending deploy · Sober reviewed · @Fern | @Fern |
| TASK-912 | FE: **Stock IN (receive) screen** — product + qty + date → STOCK_IN movement (no cost/price) — backoffice-front, Stock block | REQ-120 R3.2 | ✅ **ACCEPTED on fixture 2026-11-09** (tsc 0, 197/0, build 0; no cost/price, sold-out pickable, future-date refused) · 3 Qs answered (occurred_on→911) · real-wire pending 911+deploy · Sober reviewed | @Fanta |
/g, "
")`, the convention 43 files already apply** · ✅ **multi-line assertion untouched, no `.gitattributes`** · ⚠️ **the WHY is written in the file so the next person does not delete the `replace` as noise** · 🔑 **no second problem found in that file — nothing else touched** · ✅ **suite 3749 · 0 fail at the fix ⇒ "clean run" available to BOTH teams** · ⚠️ **never a product defect: nothing shipped was wrong and nothing shipped changed** · 📌 **@Sober's to verify** | @Jason |
| TASK-630 | 📌 **RECORDED DESIGN (not work): if a WITHDRAWN pre-start declaration should return to the pool** | (@Sober, 10-04 — so nobody re-derives it) | 📌 **A ROW, NOT A TASK — it exists so the answer survives the session** → full: `tasks/TASK-630-board-record.md` § Board row | — |
| TASK-631 | 📋 **THREE copy items with the owner — one REPLACES a shipped sentence** | (@Sober, 10-04 — `COPY-REVIEW-2026-09-29.md`) | ⛔ **WITH @PORTER — 🚫 none of them blocks code; all three are drafts and nothing ships until he brings them back** → full: `tasks/TASK-631-board-record.md` § Board row || "คาบอื่น"`` → full: `tasks/TASK-631-board-record.md` § Board row | — |
| TASK-633 | 📌 **OWNER QUESTION (not work): should changing a session coach CLEAR the rate already stored on it?** | (@Jason flagged, claimed none — @Sober, 10-04) | ⛔ **WITH @PORTER — a QUESTION, 🚫 not sized, 🚫 nobody touches the code** → full: `tasks/TASK-633-board-record.md` § Board row | — |
| TASK-636 | 🔴 **KHWAN: abolish the leave COUNTER — the course EXPIRY becomes the only control** | (screenshot to @Sober direct, 10-04; answer routed UP via @Porter) | ✅ **§1 RULED by the owner 2026-10-04: TAKE THE CAP OUT** (→ `TASK-643`) → full: `tasks/TASK-636-board-record.md` § Board row | — (Q2–4 open) |
| TASK-638 | 🔴 **@Porter: ONE line — does a claim on an IMPLEMENTATION file include its TESTS?** | (@Sober, 10-04 — third claim fault this week) | ✅ **RULED by @Porter 2026-10-04: a claim on a file INCLUDES its co-located test file, automatically, same team. No exceptions, no list-reading required** → full: `tasks/TASK-638-board-record.md` § Board row | — (closed) |
| TASK-639 | BE: **a pass over the REGION PINS — and the helper that makes the next one impossible** | (@Jason offered it; @Sober scoped it, 10-04) | ⏭️ **AFTER THE BATCH — 🚫 deliberately not now** → full: `tasks/TASK-639-board-record.md` § Board row | @Jason |
| TASK-640 | ⚠️ **should EVERY owner-approved string be PINNED?** | (@Sober, 10-04 — out of @Fern near-miss) | ⛔ **WITH @PORTER — a QUESTION, 🚫 not work, 🚫 not sized** → full: `tasks/TASK-640-board-record.md` § Board row | — |
| TASK-641 | 🔴 **LIVE ON UAT: a parent with CONFIRMED future sessions is told she has NONE — one family, TWO doors, ONE cause** | (@Porter, 10-04; Khwan: *“คนเดียวกัน”*) | 🔴 **CAUSE PROVEN** → full: `tasks/TASK-641-board-record.md` § Board row | — (owner decides per row) |
| TASK-706 | BE: **F3 — cancelling a GROUP date tells the families of its CONFIRMED seats, even when the group row is PENDING** (decide by the pre-cancel seats; non-group byte-identical) | TEST-086 F3 (Tanya) · Porter "cut" 10-08 | ✅ sid PASSED (TEST-088) · CLEARED for uat WITH 707 in `DEPLOY-uat-2026-10-08-706-707.md` (back a2185b2) · `tasks/TASK-706-pending-group-date-cancel-tells-confirmed-seats-be.md` | @Porter |
| TASK-808 | FE: **clickable BO spec: SALARY pages** (8 pages) (REQ-122 · REQ-120 §1) | Porter 10-16 | 🟢 BUILT · VERIFIED by @Sober 10-16 (12 pages × 3 roles: 0 errors · 0 dead · Admin sees no pay) · Person-page question removed (QS13), fix checked | @Fern |
| TASK-831 | FE: **REQ-122 v3 — SHELL v3 + single-file delivery** (new answer key · ALL CAPS menu · FRONT OFFICE group + label · dates · month picker · [?] ask slot · build) | REQ-122 §8 · Porter 10-21 | ▶️ GO 10-21 (Porter) · FIRST · 1.1 d | @Fern |
| TASK-837 | BE + FE: **REQ-126 "ตัดจบคอร์ส"**: the approved button + a course-only 5th end reason (migration 0072); behaviour unchanged | REQ-126 · Porter 10-25 | ▶️ GO 10-25 · 4 dialog strings «copy pending» (drafts → owner) · BE 0.45 + FE 0.2 d | @Jason · @Fern |
| TASK-844 | FE: **REQ-133 final UI: Salary 8 pages**, all of Khwan's v3 notes | REQ-133 | 🟢 READY FOR QA 10-27 with 843 + 845 (rework verified; md5 `a33a3b43…`) → Porter → Tanya | @Fern |
| TASK-845 | FE: **REQ-133 final UI: Notify 2 + front office 7** (`fo: true`) | REQ-133 | 🟢 READY FOR QA 10-27 with 843 + 844 (Team A's 17 pages; md5 `a33a3b43…`) → Porter → Tanya · full-UI pass after Silver's Fri 11-06 | @Fern |
| TASK-847 | FE: **REQ-133 final UI opens in DARK mode** (default dark + header toggle; shell Tailwind tokens follow the scheme; dark 5-shot set for the deck) | REQ-133 · owner 10-27 *"backoffice start with dark mode first"* | 🟢 READY FOR QA 10-27 (md5 `64831c0d…`; dark on first open, toggle, 5 dark shots checked) · Team B fix pending: `revenue/Detail.tsx:129` red-0 rows (Silver) · then GO deck batch 2 | @Fern |
| TASK-846 | **REQ-133 pricing-meeting deck** (static React, `pricing.ts`; payment 3 installments owner-OK'd 10-27) | REQ-133 · Porter GO 10-27 | 🟢 EDIT BATCH 2 (owner's answers + dark shots) + the slide-3 R0 fix, READY FOR QA 10-27 (md5 `d6ae0949…`, frozen) → Tanya → owner | @Jason |
| (admin LINE) | BE + FE: **admin LINE tied to the web user** | FINAL ROUND item 5 · `SIZING-admin-line-link-to-web-user-2026-10-07.md` | ➡️ MOVED TO TEAM B 2026-10-11 (Porter: in parallel) — Silver cuts from his block; Team A touches nothing · 714/715 NOT used | @Silver |
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

## 📋 OWNER'S NEXT BATCH + DECISIONS for him → moved verbatim to `OWNER-NEXT-BATCH.md` (ORDER 67, 2026-11-13)

## REQ-5011 GR-web claim lines → moved verbatim to `archive/board-prose-2026-11-13.md` (ORDER 67)