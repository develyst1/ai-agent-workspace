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
  - 🔴 **Open for the human (QA):** **backoffice read access** (`backoffice-som.develyst.online`) — without it
    Tanya cannot read what any day-end actually posted, so every money AC stays `NOT_TESTED` even after the job
    runs. Access lives in `../project-docs/`, never in a tracked file.

### 📏 STANDING RULE — FE layout IS verifiable here (08-01, TASK-081)

The in-app browser does not *paint* but it does **compute layout**. **Any FE change that adds or resizes a control
in a shared row must measure that row at 1600 / 1280 / 768 / 375 and report the numbers.** Anything painted stays
out of reach — **a deployed look is the only full detector**, so ship in small slices.

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

### 🚦 DEPLOY RULES (standing)

> 🔴 **PENDING DEPLOY — REQ-079 (added 2026-09-02; items 1–2 CLEARED and item 5 added 09-05).**
> 1. ✅ **DONE 09-05 (owner).** `0030` + `0031` applied on `sid`; `db:verify` ✅ — journal 32 · **32 witnessed**.
> 2. ✅ **DONE 09-05 (owner).** All six menus published; `unknown-TH` is the account default, `known-TH` links per user. **Both states confirmed ON A PHONE** — menu A on a fresh follow (13:47), menu B after linking (13:53). 🔴 The one dead cell is **DEF-9 / TASK-248**, not a publish fault.
> 3. **2FA cannot be switched on at all** until the owner answers how the six digits reach the parent — there is no SMS, and LINE cannot verify LINE.
> 4. ✅ **Trigger fired** (the menus now exist on the OA) ⇒ `NAME_TO_KEY` is folded into **TASK-249 §4**. No longer a loose deploy item.
> 5. 🔴 **NEW — the backfill, and it is the owner's.** Families linked **before** the 09-05 publish never had `linkKnownRichMenu` run for menus that did not exist. **Two wrong populations:** an **old** per-user link still resolves to the **old parent menu** (those menus still exist on the channel — the 01:23 screenshot), and **no** per-user link now shows **unknown**. **Neither shows menu B.** A one-off re-link runs against real customer chats ⇒ **deploy action, owner's call.** @Sober cuts a script task only if he asks for one.

1. **`bun run db:migrate`** in the repo owning the schema, **before** restarting anything; then **`bun run db:verify`
   — BLOCKING, do not restart until it prints ✅.** `db:migrate` can report success and exit 0 having applied
   **nothing** (TASK-085/086) — that took the customer's calendar down on both boxes on 08-24. If `db:verify` is
   red: `db:seed-ledger` (dry-run) → read → `--apply` → `db:migrate` → `db:verify` ✅.
2. Deploy `smart-scheduler-back` (:4006) → `pm2 restart`, then `smart-scheduler-front` (:3016) **in the same
   sitting**; `backoffice-back` (:4010) + `backoffice-front` (:3018) follow, order free (TASK-083/084).
3. 🟠 **Never ship a new server-side gate without the screen that opens it.** Completeness ≠ order. Canonical pairs:
   **TASK-075 + 076** (backend alone means nobody can link at all) · **TASK-077 + 078** · **TASK-079 + 080**.
4. **PENDING DEPLOY discipline:** add a line here **the moment a task is DONE**, not at deploy time — a stale
   manifest has bitten us three times.
5. **The old Dashboard nav entry stays gone** (TASK-082 — hidden, not deleted).

### 🔴 MIGRATION CHECK — before every single deploy. No exceptions.

> **"No migration" is a CLAIM, not a state. It expires the moment another task lands. Nobody may write or repeat it
> without re-counting the migration files at that moment.**

On 08-01 the site went down because this board said *"no DB migration in this batch"* — true when written, then
**TASK-066 added `0005_bo_item_external_ref`** and nobody updated the line. The check, no DB access needed: count
`drizzle/*.sql` in each backend repo against the `"tag"` count in its `drizzle/meta/_journal.json`. **They must be
equal** — a `.sql` missing from the journal is **silently skipped** (TASK-042). Then compare the newest file with
what is applied on the server; a newer one means **this batch HAS a migration**. `db:migrate` applies schema
migrations; `migrate:bo` only moves DATA `ops.*` → `bo.*` — **not** interchangeable.
**Never accept "the command said success" — load the page and confirm.**

> 📦 The 08-01/02 batch manifest, its outage post-mortems and the rest of rule 3's pairs are archived verbatim in
> `archive/board-2026-08-29-pre-compaction.md`: TASK-054 · TASK-050 · **TASK-070 + TASK-071** (breaking response
> shape) · TASK-064 · TASK-068 · TASK-055 · TASK-076 · **TASK-058 + TASK-059** (a `400` nobody can see is a Save
> button that silently does nothing — the defect the owner failed REQ-019 acceptance on).

🔴 **Acceptance that must not be skipped when the digest ships — REQ-023:** open `/scheduler/attention` **before**
registering the 08:00 task (it must show the red *"digest has never run"* warning), register it, then confirm a real
timestamp. Without those three distinct states, "quiet" and "dead" look identical.

## Requirements

| ID | Title | Prio | Status | Next step · tasks |
|----|-------|------|--------|-------------------|
| REQ-003 | Teacher onboarding/offboarding, synced both systems | HIGH | **ON HOLD** | Do NOT deploy — the backoffice sync is moot. |
| REQ-009 | Close the freelance ceiling on teacher type-change | LOW | **TEST_PASSED** (08-04) | @Porter — acceptance. TASK-060, TASK-061 DONE. |
| ~~REQ-012~~ | ~~LINE registration form capturing demographics~~ | — | **SUPERSEDED by REQ-019** | Demographics live on in REQ-019. |
| ~~REQ-018~~ | ~~LINE account unlink + dual-role~~ | — | **SUPERSEDED by REQ-020** | Became REQ-020 Q3. |
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
| REQ-033 | Captured from the 08-01 customer presentation | BACKLOG | **CAPTURED — not READY_FOR_SA** | @Porter holds; do NOT build. Handled: REQ-022 · REQ-015/016 · REQ-029 · REQ-030. |
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
| REQ-039 | Dashboard consolidation — one Dashboard | MED | **CAPTURED — QUEUED** | Design with REQ-034. @Porter holds. |
| REQ-042 | LINE role change did not switch the rich menu | HIGH | **FIXED & owner-verified 08-16** | Not yet DELIVERED. Empty `line_rich_menu_ids`. TASK-130. |
| REQ-013 | SOM dashboard — customer / activity / attendance | MED | **SPEC_DONE** | Warn the owner: low coverage, large "unknown". TASK-062, TASK-063. |
| REQ-014 | Backoffice — revenue by activity + customer spend | MED | **SPEC_DONE** | Acceptance: open a real month, confirm its reconciliation. |
| REQ-015 | LINE OA — pretty & bilingual (rich menu / flex) | HIGH | **DELIVERED** (+1 fix pending) | TASK-046 needs a `sid` deploy + repro. TASK-045, TASK-038, TASK-040, TASK-041, TASK-039. |
| REQ-017 | Teacher bookings → phone calendar feed | MED | **DEPLOYED — acceptance INCOMPLETE** | NOT delivered; LINE does not linkify `webcal://`. TASK-044. |
| REQ-078 | การจองแบบ **อื่นๆ** (owner's REQ-005) — 🔢 **owner's #1** | HIGHEST | 🅿️ **PARKED at TEST_FAILED — narrowly** (`sid`, 09-02) · ⏳ **money round LIVE 09-05** — `tests/TEST-064` §Round 4 (verdict + PARK NOTE) and §Round 5 | ✅ 4 defects fixed; 18 ACs pass. 🔴 Blocking: DEF-4 reopened (display-only) · DEF-7. ⏳ ฿20 fixtures CONFIRMED for tonight’s 18:30 pass — see `tests/TEST-064`. 🔴 AC-4/5 need a backoffice read QA cannot do; AC-21 needs one freelance rate. @Porter Q25–Q26. |
| REQ-076 | พักการจอง 1HR / Voucher / 1st Trial (owner's REQ-013) — 🔢 **#2** | HIGH | **DRAFT — 7 questions** | Do NOT build. Money-at-day-end is the sharp one. @Porter holds. |
| REQ-079 | LINE chatbot — ผปค ลงทะเบียน/ลา/เช็คอินเอง (owner's **REQ-016**) — 🔢 **#2** | HIGH | 🧪 **`TEST_PASSED` 15/26 (09-03) — NOT a REQ-079 pass** · `tests/TEST-065` §Round 3 | Proven: escapes · silence · per-chat mute · strikes · duplicate rule · clear→rebind (verified in data). 🔴 **Leave · check-in · course view · regressions UNOPENED.** @Porter Q23–Q24. |
| REQ-077 | LINE OA + rich menu + notification set (owner's REQ-014) — 🔢 **#5** | HIGH | **DRAFT** | Customer's list in; **5 of 6 already exist**, 1 new (check-in msg). Design first. @Porter holds. |
| REQ-080 | QA read-only on **both** `uat` hosts — narrow the `mint-session.mjs` guard on `frontoffice`, **extend** it to `backoffice` | HIGH | **READY_FOR_SA** (09-04) | 🔴 `backoffice` is **unguarded today** — see REQ §4b. @Sober — Q1/Q3 open, Q2 answered. |

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
| TASK-147 | FE: dict keys (label/help TH+EN) for the 2… | SPEC-048/REQ-047 | ✅ **DONE — code** (Sober 09-01) · local login check = @Tanya | Fern |
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
| TASK-244 | BE: a durable trail for the ONE act that can move a LINE account between families (today: a log line) | TASK-243 Q1 | **TODO** 🟢 after the REQ-079 deploy | @Jason |
| TASK-245 | BE: **a parent is never stuck** — an exit at every step · reserved words mean what they say · rule 5 actually fires | Porter ORDER 09-02 | ✅ **DONE — code** (Sober 09-03) · one command list · exit checked before any step reads · strike sites **4→6** (the 4→11 in my review was a COMMENT count — corrected by Jason 09-03; pinned at 7 incl. declaration in `line-silence.test.ts`) | @Sober |
| TASK-246 | BE: **DEF-8 + §14** — a mute silences the bot’s initiative, never the parent’s way OUT or BACK IN | Porter DEF-8 09-03 | ✅ **DONE — code** (Sober 09-03 r2) · one `FLOW_CLEARED` for both writers · un-mute clears the flow, scoped to *muted-right-now* so an unmuted parent’s live flow survives · `สมัคร` ORDER pinned by test · 1278/0 · 🧪 DEF-8 replay + Round C need a PHONE ⇒ @Porter → owner (NOT @Tanya — owner 09-05) | @Porter |
| TASK-247 | BE: **REQ-079 rich menus** — two orange menus, AND the publish path that never created them | REQ-079 · Porter 09-05 | ✅ **DONE — code** (Sober 09-05) · publish creates **6**, default → **unknown**, `storeMenuIds` **merges** (pure `mergeMenuIds`) · generator↔code bounds test **with a permanent negative control** · 4 old PNGs byte-identical · tsc 0 · **1295/0** · 🚫 nothing published — see PENDING DEPLOY 2 + 4 | @Porter (deploy) |
| TASK-248 | BE: **DEF-9** — `เข้าใช้ระบบ` asks for a phone and sets no step, so nothing receives it | DEF-9 (owner 09-05) | ✅ **DONE — code** (Sober 09-05) · tsc 0 · 1316/0 · 🧪 phone run = **owner, not @Tanya** — see the TASK + log 09-05 | @Porter |
| TASK-249 | BE: **C-13 evidence** — the per-user menu link must follow the DB link state | C-13 · Porter 09-05 | ✅ **DONE — code** (Sober 09-05) · un-link on **both** clear paths (2nd case: departed teachers) · 🔴 a passing test had **pinned** the missing call — see the TASK + log 09-05 | @Sober |
| TASK-235 | FE: the admin invite control on the People screen — now the ONLY way anyone joins | SPEC-071 | ⛔ **WITHDRAWN 09-02** — the invite is cut; nothing left to issue | @Fern |
| TASK-242 | FE: the post-confirm chip claims more than it knows → `ส่ง LINE ถึงครูหลักแล้ว` | REQ-078 DEF-6 §2 | 🔒 **HELD** — only if QA forces an FE touch, else with the follow-up | @Fern |
| TASK-240 | BE: course search drops a studentless course (count ≠ rows) — same shape as DEF-3, pre-existing | TASK-236 sweep | **TODO** 🟢 after the release | @Jason |
| REQ-065 | 1st Trial shows up as a selectable program (a booking TYPE in the picker) | SPEC-061 | see the Requirements table | @Sober |

> 168 closed rows swept to archive/board-closed.md (2026-08-31).

## Blocked / waiting

Full text of every item is in `archive/board-2026-08-29-pre-compaction.md`.

| Item | Waiting on | Note (short) |
|------|-----------|--------------|
| RESOLVED — `MAX_WEEK_BY_SIZE` 6-session = "week 8" (owner, REQ-030 Q2) | ~~คุณฟีน~~ | `lib/leave.ts:11` `{4:5, 6:8, 10:13}`; SPEC-028 §5 makes it a HARD ceiling. |
| `env -u DATABASE_URL bun run …` does NOT isolate from the real DB | Everyone — now in `PROTOCOL.md` | Bun auto-loads `.env`, which points at live `sid`. Jason, 08-02. |
| OUTAGE 08-02 — migrations silently skipped (shared ledger) | RECOVERED 08-02 | One shared `__drizzle_migrations`; closed by REQ-032. |
| Has `sale:ensure-items` already run on `sid`? | Human / @Porter, before the batch | It never updates an existing item ⇒ voucher items may sit at placeholder prices. |
| What does ONE HOUR of Bike / Surfskate / Skateboard / Inline cost? | คุณกุ้ง via Porter | No 1-hour row for `bike-skate`; now carried by REQ-066. |
| URL-persisted tab + filters on the Bookings page — keep deferred? | คุณฟีน via Porter | REQ-024 said include; Fern deferred (the tab is already crowded). |
| DATA REQUEST — is any historical sale data worth recovering? | Human via Porter | Read-only: `bo.movement` rows with `ref_type='SALE'`, range, and their `owner_ref`. |
| Course & voucher revenue was never recorded, in all history | คุณปุ้ม / คุณฟีน via Porter | Trial/single posted until 07-28; `course-*` / `voucher-*` never posted. |
| Decision: re-post the un-recorded days? | คุณปุ้ม via Porter | Reconstructable from `public`, but it is a finance decision. |
| TASK-064 — SPEC-021's input did not exist when raised (08-01) | Sober | No SALE rows to attribute, no `externalRef` to key on; TASK-066 created them. |
| REQ needed: self-service unlink / switch role on LINE | Porter | The bug half is TASK-046; the rest is a product decision. |
| ~~Why are the LINE rich-menu taps dead?~~ | CLOSED / MOOT 07-30 | Environmental: the webhook pointed at the stale server. |
| ~~`migrate:bo` failed: which DB is `DATABASE_URL` on?~~ | ANSWERED 07-28 | Config is CORRECT; the "wrong DB" hypothesis is disproven. |
| ~~REQ-006 BUG — freelance drawdown not idempotent~~ | RESOLVED — TASK-028 DONE | Reconcile-to-target: `held` from the ledger, `delta===0` no-op. |
| ~~REQ-001/002 acceptance blockers (auth 403, cap not showing)~~ | RESOLVED | Both fixed 07-20. |
| ~~Scheduled tasks not set up~~ DONE 08-01 | Human | All three on `sid`: digest 08:00 · end-of-day 23:30 · month-reset 1st 00:05. |
| Real numbers (placeholders live) | พี่ฟีน → Porter | Placeholders: FL 70k@500, FT 50k, PT 15k, Trial/Single 1,390. |
| repo lint (both FE) | Porter / maint | `bun run lint` broken — `next lint` removed in Next 16. Pre-existing. |
| drizzle snapshot chain incomplete (scheduling-back) | maint / future task | `meta/` holds 0000–0003, journal 0000–0012 ⇒ `db:generate` re-emits everything. |
| ~~REQ-003 deploy~~ | SUPERSEDED (closed 07-30) | Its value shipped via REQ-005. |
| ~~REQ-004 deploy~~ | DONE (closed 07-30) | Only leftover is the month-reset task above. |
| REQ-003 subjects (known limit) | Porter → พี่ฟีน | The teacher form lists existing subjects only. See REQ-058. |
| ~~Teacher archive/activate BROKEN (07-28)~~ | FIXED — TASK-029 DONE | Old ops-live backoffice errored on `ops.catalog_items`, plus a routing fault. |
| ~~Deploy fact from the 07-28 traces~~ | RESOLVED (closed 07-30) | REQ-006 re-deploy replaced the drifted build; TASK-030 skips drifted `ops`. |
| ~~Teacher type-change money = local no-op~~ | PROMOTED → REQ-009 (07-30) | Owner: close the budget **and warn the admin first**; history kept. |
| ~~REQ-001 deploy gate~~ | DONE (closed 07-30) | REQ-001 DELIVERED 07-20; migration applied, budgets entered. |
| ~~REQ-006 deploy — hard ordering~~ | DONE (closed 07-30) | Ran 07-28: `bo` migration → `migrate:bo` (TASK-030) → both backends restarted. |
