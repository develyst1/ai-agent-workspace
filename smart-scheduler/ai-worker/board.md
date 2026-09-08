# Board — smart-scheduler

> **State only:** ID · title · status · owner · pointer. Detail, evidence and history live in `requirements/`,
> `tasks/`, `specs/`, `tests/`, `log/` — never in a cell.
> 🧹 **Compacted 2026-08-29 (Marie housekeeping, owner-approved). Nothing deleted:** the pre-compaction board is
> `archive/board-2026-08-29-pre-compaction.md` (verbatim), each row's old narrative was appended to its own REQ/TASK
> file, and prose belonging to no single file is in `archive/board-2026-08-29-parked-notes.md`.

## Project info

- Scheduling + back-office ERP for a balance/wheeled sports activity centre. Repos by logical name:
  `smart-scheduler-back` / `-front` / `-backoffice-back` /
  `-backoffice-front` (+ `smart-scheduler-requirement`). **Absolute paths on this machine are in `machine.local.md`
  at the workspace root** — never in a committed file.
- 🔴 **STANDING RULE (owner, 2026-08-28): `develop` is the CANONICAL central branch in every repo.** `dong`/`dong2`/
  `dong3` are no longer the reference. **Another team also builds on `develop`** — before speccing anything on
  shared ground (calendar, course card, cell, expiry, LINE), **read what `develop` already does**
  (`git show develop:<path>`) and re-apply only what is genuinely missing. Never build against a remembered tree.
  *(08-28: merged — front `dong`≡`develop`≡`origin/develop` @9ec5d35, back @d901dc7; one tree with our REQ-052/068
  cell + the TASK-191 toggle fix; only `hasRental` (TASK-190) was missing.)*
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, **:4006** → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, **:3016** → Fern
  - `smart-scheduler-backoffice-back` — finance API, **`bo` schema on the shared `smart_scheduler` DB**
    (`ops` RETIRED by REQ-006 / TASK-027), **:4010** → Jason
  - `smart-scheduler-backoffice-front` — admin money UI, Next.js, **:3018** → Fern
- **Read first**: `ai-worker/SYSTEM-FACTS.md` (owner-stated system behaviour), then
  `project-understanding.md` (as-built map, rewritten 08-01), then the monorepo root `CLAUDE.md` and
  `docs/` — newest wins. Docs calling this a "tutoring school" are wrong; it is a sports business.
- DB: one PostgreSQL — `public.*` (scheduling) + `bo.*` (finance). Reading schema from the Drizzle files is fine;
  the DATA REQUEST rule covers **real data and live environments**.
- Team: Porter (PM/BA) · Sober (SA) · Jason (BE) · Fern (FE) · **Tanya (QA)**.
  - **QA trial, this project only.** Tanya talks to Porter only; tests on **local + `sid`** (never `uat`); owns
    `IN_TEST` / `TEST_PASSED` / `TEST_FAILED`. A REQ is `DELIVERED` only after a `TEST_PASSED` **and** a post-deploy
    re-check. She **may create test data on `sid`**, declaring and retiring the footprint in the TEST file.
  - 🧪 **QA verdict history 08-04 → 08-28 — parked verbatim** in `archive/board-2026-08-29-parked-notes.md`;
    evidence in `tests/TEST-055…TEST-060`. Verdicts exist, in board order, for: REQ-071 · REQ-072 · REQ-036 ·
    REQ-063 · REQ-064 / TASK-168 · REQ-046 · REQ-047 · REQ-049 / TASK-152 · REQ-044 · REQ-043 · REQ-048 · REQ-054 ·
    REQ-053 · DEF-5 → REQ-056 · DEF-3 → REQ-041 / TASK-090 · DEF-1 · TASK-129 · TASK-128 · REQ-030 ·
    REQ-037 / TASK-124 · REQ-038 / TASK-099 · REQ-024 · REQ-026 · REQ-020 · REQ-022 · REQ-009.
  - ✅ **LINE test recipient — CLOSED 2026-09-01** (open since 08-04). The owner linked **himself** on `sid` as
    teacher **Bank**; outbound LINE is testable, and AC-16 was fired from it the same day (`tests/TEST-064`
    §Round 3). The rule that the **2 real teachers are never messaged in rehearsal stands unchanged.**
    🔴 **Still short one thing:** only **ONE** recipient is linked, so *"every assigned teacher gets it"*
    (REQ-078 AC-16 revised) **cannot be proven** — a second linked device/teacher is needed.
  - 🔴🔴 **BLOCKING NOW (QA, 2026-09-06):** **the `sid` session harness will not run on this machine.** The minted
    cookie expired with the deploy; re-minting (`mint-session.mjs`, TASK-090) needs the owner's access file and the
    API login, and **QA's tooling refused that step — twice.** `sid` itself is UP (`/login` 200, `POST
    /api/auth/login` → 400 from the backend's own validator). ⇒ **the whole REQ-076/082/083/084 round is
    `NOT_TESTED` for an ACCESS reason, not a product one**, and since **`uat` is read-only**, every write-shaped
    AC is proven on `sid` or nowhere. **`tests/TEST-066-…` is open as a PLAN only** — `NOT_TESTED` on every line, no verdict in it, and it may not be quoted as evidence.
  - ✅ **CLOSED 2026-09-07 — backoffice access GRANTED** (owner: both `sid` hosts, full). QA authenticated via
    the API, never the login form. **28 items / 75 movements read.** It immediately closed `REQ-083` AC-6 and
    `REQ-076` AC-4, and proved `REQ-082` AC-5 against the ledger instead of by inference.
  - 🔴🔴 **DEF-2 (QA, 2026-09-08) — RELEASE-BLOCKING. Course RESUME regenerates the plan.** Reproduced twice on
    fresh 4-session fixtures: **4 rows → 4 (all flipped `CANCELLED` by pause) → 8 (originals + a brand-new plan).**
    🎯 **Isolated: PAUSE does not duplicate; RESUME does** — but pause writes the TERMINAL code `CANCELLED`, so
    resume has no plan to restore and builds one. Course history shows 4 `cancelled` then 4 `scheduled` events.
    🔴 **Second, worse half: the new plan starts from TODAY, not the course's own slot** — a course sold for
    `2026-11-11` came back as `2026-09-09`, and **this week's calendar now shows November sessions.**
    🟢 **NOT a money defect: exactly one `SALE` per course, pause/resume wrote nothing; entitlement intact.**
    Reproduction left live: course `dd78bd1e-…`. `tests/TEST-066` → DEF-2. @Sober.
  - ✅ **DEF-1 CLOSED 2026-09-08 (QA).** Post-redeploy retest: `?status=PAUSED` → **200** *(was 400)* and the
    tray on screen reads **`Paused bookings | 1 | KKTEST | 1 HR | Was: 08/Oct/26 16:00`**. **Verified BOTH via
    the API and on screen** — a 200 with an empty array would have read identically. ⇒ **`REQ-076` AC-1, AC-9
    and AC-12 all PASS.** The empty state is honest again. **Nothing from QA holds `uat`.**
  - ✅ **`REQ-083` AC-5 · AC-7 · AC-9 PASS (QA, 2026-09-08).** A swept `1 HR` posted **฿1,390**; undo wrote **one**
    `REVERSAL −139000` beside an unedited `SALE`; **the replay wrote nothing.** 🟢 **`end-of-day` DOES run on
    `sid`** — answered from movements, not `job_runs`.
  - 🔻 **QA RETRACTION (2026-09-08):** the 09-07 claim *"no movement is tied to a booking"* was **FALSE**.
    `postBookingSale` writes `refType: "SALE"` with `refId` = the **booking** id, so `refType` cannot
    discriminate. **@Sober called it before it could be measured.** The money thread is fine.
  - ⚠️ **FE width checks NOT_TESTED** — QA could not change the viewport (Chrome fixed at 1920, in-app browser
    refused). **DEF-1 also means the tray can only be measured EMPTY, so 1280-decides-AC-9 is unanswerable
    until the fix lands.** **Re-run them together.**
  - ⚠️ **`sid` was being written to by someone else during the QA round** (`ปกติ 13→18`; the QA fixture course
    was sold at 00:05). **Baselines must be re-read, never carried across hours.**
  - 🔴 **Open for the human (QA):** **backoffice read access** (`backoffice-som.develyst.online`) — without it
    Tanya cannot read what any day-end actually posted, so every money AC stays `NOT_TESTED` even after the job
    runs. Access lives in `../project-docs/`, never in a tracked file.

### 📏 STANDING RULE — FE layout IS verifiable here (08-01, TASK-081)

The in-app browser does not *paint* but it does **compute layout**. **Any FE change that adds or resizes a control
in a shared row must measure that row at 1600 / 1280 / 768 / 375 and report the numbers.** Anything painted stays
out of reach — **a deployed look is the only full detector**, so ship in small slices.

🔴 **HEIGHTS — added 09-08 (TASK-291 §2, @Porter's finding, @Sober's instruction; written in by @Fern, reword at
will).** **The four widths above were the whole rule, and nobody had ever checked a height — on any dialog.**
⇒ **Any change that makes a DIALOG taller is measured at 900 / 650, and its primary action must stay reachable
at 450.** *650 = a 1366×768 laptop after browser chrome, the commonest real admin screen. 450 = the harness
height that exposed this; a floor that only holds on real screens is not a floor.*
📌 **The reason is not the viewport: a dialog whose primary action can be unreachable cannot be VERIFIED.**

### ⚠️ ENVIRONMENTS — exactly TWO servers. Read before any deploy talk.

| | `sid` — where we build | `uat` — the customer's system |
|---|---|---|
| frontoffice | `som.develyst.online` | `frontoffice.develyst.online` |
| backoffice | `backoffice-som.develyst.online` | `backoffice.develyst.online` |
| who touches it | the team verifies here | **owner only** — the team never runs anything against it |

- **No third environment** (owner, REQ-042, 08-16): `frontoffice.develyst.online` = the owner's **UAT** = what older
  artifacts call "production". **Stop writing "prod".** The LINE webhook points there, and it carries **one build**
  — the 2026-08-11 deploy, which contains TASK-046. **One-directional: build → verify on `sid` → deploy to `uat`.**
- 🔴 **MIGRATION DISCIPLINE** (owner: *"หากเรามีการ migrate ก็ต้องลองที่ sid ก่อน ห้ามพลาด"*) — every migration is
  **run and verified on `sid` first**, then on `uat`. No rehearsal after that: since REQ-055 landed, `uat` holds the
  customer's **real families and real money**. `db:verify` / the witness ledger (REQ-032) is the mechanism, and **a
  migration TASK must state how it was proven on `sid`.**
- 🟠 **"sid first" is for SCHEMA/CODE migrations — NOT data imports** (Porter, 08-22). A migration changes structure
  identically on both boxes; an **import** writes different rows per box — re-running one on `sid` from a newer file
  hits the REQ-059 rename problem and **duplicates**. ⇒ **the run target is whichever box lacks the rows; say so in
  the TASK.**
- ⚠️ 08-16: the owner opened a **remote-DB whitelist line for his own machine** on `uat` for the REQ-042
  diagnostics. **It must be closed and verified closed when the LINE work is done.** Porter owns the reminder.
- Legacy caveat in older artifacts: **"DELIVERED" long meant "verified on `sid`"** — REQ-001 and its generation
  shipped to `sid` only. Separate DBs, so data diverges as well as code.
- Migrations older artifacts name: `0015_teacher_link_requests` · `0016_subjects_price_group` (per-program pricing,
  REQ-027/029) · `0017_entitlement_source` (REQ-025, import ≠ sale). ⚠️ **`0016` backfilled by exact subject NAME —
  check for NULL `price_group`;** a null price group is how a program silently loses its prices.

### 🔴 STANDING RULE — `teacher-subjects:link-all` is `sid`-ONLY (owner, 2026-08-29)

The board's REQ-058 record — *"every teacher can teach every program"* — **no longer holds on `uat`.** Adding a program
there on 08-29, the dry run showed `DC: +16 / =3` against everyone else's `+1 / =18`; the owner: **"ตั้งใจจำกัด"** — DC
and Pop are **deliberately** restricted. `--commit` would have granted DC 16 programs he is not meant to teach, and
**the tool can never unlink** — undoing it is manual work in the product, per teacher, per program.

- **`sid` (or any box where open-by-default still holds): use `link-all`. `uat`: NEVER.** There, link a new program to a
  **named list** — insert-only, `ON CONFLICT DO NOTHING`, after a `SELECT` that prints the exact names for the owner to
  read **before** anything is written. That is how the 08-29 addition was done: 26 teachers linked, DC excluded.
- 📌 **Per-row dry-run output is what made the outlier visible.** A summary line (*"46 links will be created"*) would
  have read as entirely normal. Worth keeping for anything that writes in bulk.
- ✅ The script now says so itself (**TASK-223** DONE 09-01): `sid`-only + "can never unlink" in the header, and the same warning printed on **both** the dry-run and `--commit` paths — where the decision is actually made.

### 🔴 STANDING RULE — the human COMMITS at the end of every batch (his decision, 2026-09-01)

**An uncommitted working tree is not storage.** Agents never commit (`CLAUDE.md` rule 6), so finished engineering
output lives **only** as uncommitted changes until the human commits. On 2026-08-31 a routine branch sweep
(`dong → develop → production → dong`, fast-forward + a clean) **silently destroyed three completed tasks**
(TASK-218 / 221 / 223) — identical mtimes across every touched file, new files gone, no stash.

🔴 **The dangerous part is not the loss, it is how it presents: a clean tree looks exactly like an engineer who
never built it.** Sober came within one step of recording that, which would have cost a re-cut task, a rewritten
spec, and a false line in a log everyone treats as history.

**🔴 UPDATED 2026-09-01, his instruction:** *"เลิกยุ่งเรื่อง commit ฉันจะทำเองเมื่อถึงเวลาของฉัน"*
**Nobody reports, chases, or asks about commit state** — not in the log, not in a hand-off, not as a reminder.
He commits on his own schedule; it is his repo and his call. *"This batch is code-complete"* is still worth
writing — that is ordinary status and it makes a natural commit point visible **without anyone being chased.**
**State your work; never request his.** *(Porter put commit state into the reporting loop and has removed it.)*

**What protects the work is OURS, not his, and it is unchanged:** ⇒
- **Engineers:** when a batch is code-complete, say so plainly in the log so the commit point is visible. Keep
  every load-bearing fact in the **TASK file's `## Implementation Notes`** — that is the only reason the three
  tasks were reviewable and rebuildable after the tree was swept. **Evidence in the TASK, never only in the log.**
- **Nobody may conclude "it was never built" from an empty diff alone.** Check `git reflog` and file mtimes
  first — that is how the real cause was found.
- Interim artifact from that incident: `archive/patch-scheduler-back-TASK-218-221-223-224.diff` (base `7217599`).

*(Project-level record. If this should bind every project in the workspace, it belongs in the workspace
`CLAUDE.md` — the human's or Atlas's call, not Porter's.)*

### 🚦 DEPLOY RULES (standing) → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**

### 🔴 MIGRATION CHECK — before every single deploy → **MOVED VERBATIM to `SYSTEM-FACTS.md` (board hygiene 09-08). Read it there before any deploy.**

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
| TASK-235 | FE: the admin invite control on the People screen — now the ONLY way anyone joins | SPEC-071 | ⛔ **WITHDRAWN 09-02** — the invite is cut; nothing left to issue | @Fern |
| TASK-242 | FE: the post-confirm chip claims more than it knows → `ส่ง LINE ถึงครูหลักแล้ว` | REQ-078 DEF-6 §2 | 🔒 **HELD** — only if QA forces an FE touch, else with the follow-up | @Fern |
| TASK-240 | BE: course search drops a studentless course (count ≠ rows) — same shape as DEF-3, pre-existing | TASK-236 sweep | **TODO** 🟢 after the release | @Jason |
| REQ-065 | 1st Trial shows up as a selectable program (a booking TYPE in the picker) | SPEC-061 | see the Requirements table | @Sober |
| TASK-282 | BE: 🔴🔴 **DEF-2 — course resume RELOCATED the plan** (reshaped to the owner's RE-PLAN ruling) | owner on `sid` 09-08 · owner's ruling | 🔴🔴 **REOPENED — TEST_FAILED (@Tanya, UI round 09-08)**: 4 → 8 rows through the BUTTONS on the release build, same as the API path · the re-shape did NOT close DEF-2 · fixture `b7dc8ace` held alive on `sid` · **see the TASK** | — |
| TASK-284 | BE: **`Remark` does not render on the course-level `CONFIRMED SCHEDULE`** | owner reproduced 09-08 | 🆕 **TODO — after `uat`, not a blocker** → @Jason (Sober 09-08) · 🔻 **MY limitation, documented in TASK-269 §2 and deliberately not fixed:** the note … **detail in the TASK.** | @Jason |
| TASK-287 | FE: **resume asks the scheduling question and STATES the expiry it moved** | owner ruling 09-08, ships with TASK-282 | 🔴 **FAILED (@Tanya 09-08)** — the post-resume summary dialog did not appear (PAUSE dialog re-rendered EMPTY) · the resume form pre-fills `10:00` on a `17:00` course · **see the TASK** | — |
| TASK-288 | FE: the resume form defaulted to a slot that is NOT this course s · the summary dialog never appeared · the pause copy was false | @Tanya UI round 09-08 | ✅ **DONE — code** (Sober 09-08) · the time now defaults to the **course own slot** · the summary dialog **exists** (it rendered 0 ms) · my pause copy replaced · ⏳ **awaits @Tanya** · **see the TASK** | - |
| TASK-289 | FE: **the plan view showed a re-planned course s OLD cancelled sessions beside its new ones** | @Tanya UI round 09-08 | ✅ **DONE — code** (Sober 09-08) · `visiblePlanRows` filters **only what the TABLE receives, not the array** — filtering the array would have re-broken the `17:00` default silently · ⏳ **awaits @Tanya** · **see the TASK** | — |
| TASK-290 | BE: **the plan DTO could not say a session was cancelled BY A PAUSE** | @Fern §3 on TASK-289 | ✅ **DONE — code** (Sober 09-08) · `cancelledByPause`, **derived**, on the mapper and the contract ⇒ a HAND-cancelled row stays visible · ⏳ **awaits @Tanya check 2** · **see the TASK** | — |
| TASK-291 | FE: **the pause dialog said 9 where the pause cancels 4** · the summary dialog has still never been SEEN | @Tanya round 12 09-08 | ✅ **DONE — code** (Sober 09-08) · the count is **the server's** (`/cancel/preview`) ⇒ the dialog can no longer count rows the admin cannot see · 3 stale comments killed, now a TEST · ⏳ **awaits @Tanya on `sid`** · **see the TASK** | — |
| TASK-292 | FE: **the client still computes a COUNT on a bulk act, and a NAME from an arbitrary row** | @Fern s answer on TASK-291 | 🆕 **TODO — no clock, blocks nothing** → @Fern (Sober 09-08) · 🔴 **`pendingCount` is a CLIENT count on a bulk-confirm button whose `skips` panel exists because the server confirms FEWER** ⇒ same class as tonight's `9 vs 5` · **see the TASK** | @Fern |
| TASK-293 | FE: **two LABELS that outlived their values** — *“Resume this course?”* on a done act, and `Ends` on a non-date | owner s own screenshots, `sid` 09-08 | 🆕 **TODO — small, no clock** → @Fern (Sober 09-08) · 🎉 **the summary dialog EXISTS and reads true — NOT_TESTED closed by the OWNER** · 🔴 @Porter s defect, his copy verbatim: **title asks a question the body answers in the PAST TENSE, with only Close** ⇒ *“Course resumed”*; the PAUSE face keeps its question · 🟡 `Ends no live sessions` is a **category error — the value is right, the label is wrong**; `deriveLiveEndDate` must not change | @Fern |
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
