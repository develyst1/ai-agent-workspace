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
- **Read first**: `project-understanding.md` (as-built map, rewritten 08-01), then the monorepo root `CLAUDE.md` and
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
  - 🔴 **Open for the human:** a dev-server URL + test staff account + an **isolatable LINE test recipient** in
    `../project-docs/`. Still blocks every LINE-touching test.

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

### 🚦 DEPLOY RULES (standing)

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
| REQ-001 | Freelance pay as monthly budget-stock + cap | HIGH | **DELIVERED** | Live 07-20. Leftover: 2 scheduled tasks + real numbers. |
| REQ-002 | Backoffice admin auth (login + real JWT) | HIGH | **DELIVERED** | Live 07-20 (`SKIP_ADMIN_AUTH=false`). |
| REQ-003 | Teacher onboarding/offboarding, synced both systems | HIGH | **ON HOLD** | Do NOT deploy — the backoffice sync is moot. |
| REQ-004 | Freelance limit moved into the frontoffice | HIGH | **DELIVERED** | Confirmed 07-20. |
| REQ-005 | Standalone teacher management (REQ-003 minus ops sync) | HIGH | **DELIVERED** | Acceptance PASSED 07-28. TASK-029 DONE. |
| REQ-006 | Backoffice rebuild — universal "item" model, shared DB | HIGH | **DELIVERED** | Acceptance PASSED 07-28. TASK-028, TASK-030 DONE. |
| REQ-007 | Freelance cap on the calendar — strip + hide when full | MED | **DELIVERED** | PASSED 07-29. TASK-032 DONE (supersedes TASK-031). |
| REQ-008 | Bulk-confirm bookings (multi-select) | MED | **DELIVERED** | PASSED 07-29. TASK-036, TASK-037 DONE. |
| REQ-009 | Close the freelance ceiling on teacher type-change | LOW | **TEST_PASSED** (08-04) | @Porter — acceptance. TASK-060, TASK-061 DONE. |
| REQ-010 | Sport program shown on the bookings course list | MED | **DELIVERED** | PASSED 07-29. TASK-034, TASK-035 DONE. |
| REQ-011 | Student picker did not filter when typing | MED | **DELIVERED** | PASSED 07-29. TASK-033 DONE. |
| ~~REQ-012~~ | ~~LINE registration form capturing demographics~~ | — | **SUPERSEDED by REQ-019** | Demographics live on in REQ-019. |
| ~~REQ-018~~ | ~~LINE account unlink + dual-role~~ | — | **SUPERSEDED by REQ-020** | Became REQ-020 Q3. |
| REQ-019 | People management on the frontoffice | MED | **DELIVERED** | Re-acceptance PASSED 08-01. TASK-052, TASK-056, TASK-057, TASK-051, TASK-048, TASK-049 DONE. Aggregation must LEFT-join an "unknown" bucket or the trial cohort vanishes from REQ-013. |
| REQ-020 | Secure the LINE pairing — approval, collision, control | MED–HI | **QA PARTIAL** | LINE claim path untested; needs the owner's phone. TASK-075+076 pair; TASK-047 DONE. |
| REQ-021 | Badge/tagging system — gaps from the 07-31 audit | LOW | **BACKLOG — parked** | Do not start. Revenue-by-branch is impossible today — decide with REQ-014. |
| REQ-022 | Booking modal — type drives the form + filtering | MED | **TEST_PASSED** (08-04) | Closed on prevention (owner's ruling). @Porter — acceptance. |
| REQ-023 | Daily admin digest — 08:00 LINE + attention view | MED | **QA PARTIAL** | Delivery untested; register the 08:00 task first. TASK-053 DONE. |
| REQ-024 | Bookings page — search & filtering on every tab | MED–HI | **TEST_PASSED** (08-04) | @Porter — acceptance. TASK-070+071 ship together. |
| REQ-025 | Go-live: continue a part-way-through course | HIGH | **SPEC_DONE** | Needs ONE real import on `sid`, not on the day. TASK-080, TASK-067 DONE. |
| REQ-026 | Nav tidy — four "statistics" menus is too many | MED | Stage 1 **TEST_PASSED** | Old entry hidden, not deleted. Stage 2 unscheduled. |
| REQ-027 | Enforce the price card — sizes + voucher exclusions | HIGH | **SPEC_DONE** SPEC-030 | (a) live; (b) → TASK-106. @Sober. |
| REQ-028 | Equipment rental as recorded revenue | MED–HI | **SPEC_DONE** SPEC-031 | The voucher card excludes gear ⇒ it is a rental sale. TASK-108. |
| REQ-029 | Booking modal — a voucher must CHOOSE its program | HIGH | **SPEC_DONE** | @Porter — acceptance. TASK-088, TASK-089 DONE. |
| REQ-030 | A course is an editable PLAN (teacher/date, inserts) | HIGH | **DELIVERED** (`sid` 08-10) | TASK-092, TASK-096, TASK-091 DONE. Notice is a `lib/` constant; its editability is REQ-031. |
| REQ-031 | Business rules as editable settings | MED–HI | BE **DONE** SPEC-029 | Defaults in code, overrides in `app_settings`. TASK-101, TASK-102, TASK-094. |
| REQ-032 | Migrations must never fail silently; split ledgers | HIGHEST | **DELIVERED 08-02** | Witness seeding + self-verifying `db:migrate`. |
| REQ-033 | Captured from the 08-01 customer presentation | BACKLOG | **CAPTURED — not READY_FOR_SA** | @Porter holds; do NOT build. Handled: REQ-022 · REQ-015/016 · REQ-029 · REQ-030. |
| REQ-034 | SOM dashboard — filter figures by booking type | MED | **SPEC_DONE** SPEC-032 | Post-go-live; 2 owner confirms open. TASK-110. |
| REQ-035 | Sell side of the item model (catalog → stock + revenue) | HIGH | **READY_FOR_SA** | Behind REQ-030/031/037. Stock-limited items BLOCK at 0. TASK-116. |
| REQ-036 | End a course early — the `ยกเลิกคอร์ส` button | HIGH | **DELIVERED 08-25** | Soft-cancel + write-guard on an ended course. TASK-185, TASK-183, TASK-188, TASK-189, TASK-186, TASK-181, TASK-182. |
| REQ-043 | Booking modal — one student picker on all tabs | MED–HI | **DELIVERED 08-23** | Verified on `uat`. TASK-131 DONE. |
| REQ-044 | The `คอร์ส` tab must say what it does | MED–HI | **DELIVERED 08-23** | Resolved by REMOVING the tab. TASK-143 DONE. |
| REQ-045 | Course CREATION must allow planned absences | HIGH | **IN_SPEC** SPEC-049 | No data distinction planned vs unplanned today. TASK-148, TASK-149. |
| REQ-046 | A leave must name the session, not the day | HIGH | code **DONE** | Already session-level everywhere. TASK-135. |
| REQ-047 | Leave closes 3 h before the session, as a setting | MED–HI | **IN_SPEC** SPEC-048 | `leave_cutoff_hours_fulltime` + `_freelance`. TASK-146, TASK-147, TASK-136. |
| REQ-048 | A voucher session must let staff choose the TIME | HIGH | code **DONE** | The branch never rendered the control. TASK-132. |
| REQ-049 | Notify on leave — admin always, teacher optional | HIGH | code-complete **DONE** | TASK-137. Firing not yet re-verified. |
| REQ-050 | Check-in must land on the right child + session | HIGH | code-complete **DONE** | TASK-144 (money) + TASK-145 (picker/labels). |
| REQ-051 | Walk-in QR check-in page | MED–HI | **SPEC-050 DRAFT** | **3 security decisions → @Porter/owner before any build.** |
| REQ-052 | Calendar cell must show program + booking type | MED–HI | **DELIVERED 08-25** | Built ONCE, bundled with REQ-068. TASK-142, TASK-141. |
| REQ-068 | A note on the session | MED | **DELIVERED 08-25** | Live on `uat` (`attendee_note`, `0022`). Follow-up → @Sober (TASK-142). |
| REQ-053 | `แก้ไขคาบ` must not change วิชา on a course session | HIGH | **DELIVERED 08-23** | Read-only + explanation line on `uat`. TASK-133, TASK-134. |
| REQ-054 | A course is created with ONE program | HIGH | **DELIVERED 08-23** | ~43 `uat` courses, no mixed case. TASK-138, TASK-139, TASK-140. |
| REQ-063 | ส่วนลด — discount a sale (% or บาท) | HIGHEST | 🔨 **SPEC-059 + 4 tasks cut (Sober 08-22) — spans 3 repos.** RE-SCOPED owner-final to **FIVE types, TWO moments**: at-sale course·voucher·rental (TASK-160), day-end 1st Trial·single-session (TASK-162); FE covers all five forms (TASK-161); backoffice actor/note + gross·discount·net (TASK-159) | @Sober. **TASK-161 (FE forms) needs Fern — @Porter stand up.** The four requirement answers are the OWNER’S ASSUMPTIONS, not the customer’s — **must be confirmed before DELIVERED**. Tanya TEST_PASSED (sid) 08-23 — NOT delivered; owner assumptions unconfirmed. Q1/Q2 + AC-6 risk: REQ file. |
| REQ-065 | `1st Trial` is not a program | MED–HI | **DELIVERED 08-23** | Filtered at `toTeacherDTO` ⇒ no FE change. TASK-173. |
| REQ-066 | Every program has a 1-hour price (REQ-061's guard) | HIGHEST | cut → @Jason | `bike-skate` gains `1: THB(1390)`. TASK-174. |
| REQ-069 | Week must be Mon→Sun; Sunday is always missing | HIGHEST | cut → @Jason | Fix `weekRange` at source. TASK-175; with REQ-067 Part B. |
| REQ-067 | Booking-type labels + LINE schedule readability | MED | cut → @Fern | A = labels only; B rides TASK-175. TASK-176. |
| REQ-064 | Imported course plan invents free sessions | HIGHEST | SPEC-060 cut | Plan engine ignores imported prior sessions. TASK-165, TASK-166, TASK-167. |
| REQ-062 | ลาล่วงหน้าในไลน์ — pick a future session | HIGH | **READY_FOR_SA** | `checkin.service.ts` matches exactly today. @Sober. |
| REQ-061 | Onewheel pricing wrong vs the price card | HIGH | SPEC-058 cut | TASK-158. BOTH boxes wrong; found while mapping REQ-058. |
| REQ-057 | Scoped cleanup tool for test data on `uat` | HIGH | **GO** — hold lifted 08-23 | @Sober to cut; scope named by the `uat` DATA REQUEST. |
| REQ-058 | Nine new programs | HIGH | **IN_TEST** — 19 live both boxes | `sid`=`uat`=19. Subjects exist only in `db/seed.ts`. TASK-155, TASK-153. |
| REQ-059 | The importer must UPDATE in place | HIGH | SPEC-056 cut | 31 names edited ⇒ a `(phone,name)` key forks the roster. TASK-156. |
| REQ-060 | Imported gender + nationality are invisible | HIGH | Part A **DONE**; B.1 cut | Porter's "not a defect" verdict is retracted. TASK-157. |
| REQ-055 | GO-LIVE: wipe test data, import real families | HIGHEST | **WAVE 1 DELIVERED `uat` 08-22** | TASK-150. The wipe is the REQ-040 reset (owner-run). |
| REQ-037 | EXTRA one-time paid session, outside the quota | HIGH | **DELIVERED** (`sid` 08-10) | Unlike REQ-030's Insert it does not shrink the tail. TASK-112. |
| REQ-038 | "Standard Timetable" feedback — 9 items, 1–5 essential | QUEUED | #4 **TEST_PASSED** · #3 **TEST_FAILED** fixed | DEF-2 closed by TASK-124. TASK-125, TASK-107, TASK-109, TASK-121, TASK-119, TASK-120. |
| REQ-039 | Dashboard consolidation — one Dashboard | MED | **CAPTURED — QUEUED** | Design with REQ-034. @Porter holds. |
| REQ-042 | LINE role change did not switch the rich menu | HIGH | **FIXED & owner-verified 08-16** | Not yet DELIVERED. Empty `line_rich_menu_ids`. TASK-130. |
| REQ-013 | SOM dashboard — customer / activity / attendance | MED | **SPEC_DONE** | Warn the owner: low coverage, large "unknown". TASK-062, TASK-063. |
| REQ-014 | Backoffice — revenue by activity + customer spend | MED | **SPEC_DONE** | Acceptance: open a real month, confirm its reconciliation. |
| REQ-015 | LINE OA — pretty & bilingual (rich menu / flex) | HIGH | **DELIVERED** (+1 fix pending) | TASK-046 needs a `sid` deploy + repro. TASK-045, TASK-038, TASK-040, TASK-041, TASK-039. |
| REQ-016 | Teacher self-service — my schedule on LINE | MED | **DELIVERED** | PASSED 07-30 on the real OA. TASK-043. |
| REQ-017 | Teacher bookings → phone calendar feed | MED | **DEPLOYED — acceptance INCOMPLETE** | NOT delivered; LINE does not linkify `webcal://`. TASK-044. |

> 📎 The early-project sequence notes and the 2026-07-20 decisions (Path A item-centric P&L, the LINE-first order,
> SPEC-001/002, and the revenue-recognition question that blocked TASK-007) are archived verbatim in
> `archive/board-2026-08-29-pre-compaction.md`.

## Tasks

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
| TASK-068 | bo-BE: put `GET /bo/reports/pl` behind… | SPEC-021 | REVIEW | Jason |
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
| TASK-103 | BE: POST-GO-LIVE — route the LINE-bot leave… | SPEC-028 | TODO | Jason |
| TASK-104 | BE: owner reversal — SICK_LEAVE no longer draws… | SPEC-028 §11.1 | REVIEW | Jason |
| TASK-105 | BE+FE: owner reversals — every course cancel… | SPEC-028 §11.2/§11.3 | REVIEW | Jason+Fern |
| TASK-106 | BE: voucher program exclusion… | SPEC-030 | REVIEW | Jason |
| TASK-107 | FE: voucher program picker… | SPEC-030 | DONE | Fern |
| TASK-108 | BE: equipment rental as revenue — 4 codes… | SPEC-031 | REVIEW | Jason |
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
| TASK-147 | FE: dict keys (label/help TH+EN) for the 2… | SPEC-048/REQ-047 | TODO | Fern |
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
| REQ-041 item 6 | FE: heading type-pairing (display face ≠ body) | REQ-041 | HELD | Fern |
| TASK-125 | FE: expiry tiebreaker in the… | OBS-5 | DONE | Fern |
| TASK-110 | BE: booking-type filter on `GET… | SPEC-032 | TODO | Jason |
| TASK-111 | FE: SOM dashboard booking-type control + render… | SPEC-032 | BLOCKED (TASK-110) | Fern |
| TASK-112 | BE: REQ-037 extra paid session — the… | SPEC-033 | REVIEW · see TASK-113 | Jason |
| TASK-113 | FE: visibly-separate "Add… | SPEC-033 | DONE | Fern |
| TASK-114 | BE: OBS-3=(A) — `insertable` flag on the plan… | SPEC-028 §12 | REVIEW · see TASK-115, TASK-097 | Jason |
| TASK-115 | FE: disable Insert only when… | SPEC-028 §12 | DONE | Fern |
| TASK-116 | bo-BE: structural `kind` column on `bo.item… | SPEC-034 | TODO | Jason |
| TASK-117 | BE: LIVE MONEY — atomic sale stock-draw +… | SPEC-034 | TODO | Jason |
| TASK-118 | bo-FE: Items-screen stock field… | SPEC-034 | BLOCKED (TASK-116) | Fern |
| TASK-094 | BE: teacher-change 3-day notice rule (pure… | SPEC-028 | REVIEW | Jason |
| TASK-095 | BE: purchase-time endpoints… | SPEC-028 | DONE | Jason |
| TASK-096 | BE: `orphaned_sessions… | SPEC-028 | DONE | Jason |
| TASK-097 | BE: per-entitlement plan DTO… | SPEC-028 | DONE | Jason |
| TASK-099 | FE: THE SHARED plan-modal… | SPEC-028 | DONE · see TASK-098 | Fern |
| TASK-098 | FE: purchase-time create-mode… | SPEC-028 | DONE | Fern |
| TASK-101 | BE: settings mechanism — `lib/settings.ts… | SPEC-029 | REVIEW | Jason |
| TASK-102 | FE: Settings screen — list… | SPEC-029 | DONE · see TASK-122 | Fern |
| TASK-122 | BE: `DELETE /api/settings/:key… | SPEC-029 | DONE | Jason |
| TASK-100 | BE+FE: soft warning when a teacher workDays… | SPEC-028 | REVIEW | Jason+Fern |
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
| TASK-179 | FE: REQ-068 note input + admin view… | SPEC-063/REQ-068 | PARTIAL · see TASK-184 | Fern |
| TASK-180 | BE: REQ-070 kill NO_SHOW… | REQ-070 | DONE | Sober |
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
| TASK-209 | BE: the daily-reminder must ALWAYS write a… | SPEC-066/REQ-072 | REVIEW | Sober |
| TASK-211 | BE: REQ-074 — cancel a 1HR / Voucher booking… | SPEC-067/REQ-074 | REVIEW · see TASK-212 | Sober |
| TASK-213 | BE: import-form batch — off-card size 500s →… | SPEC-068 | REVIEW | Sober |
| TASK-215 | BE: import-form batch — `leaveQuota` missing… | SPEC-068 | REVIEW · see TASK-217 | Sober |
| TASK-217 | BE: off-card import 500s — `course_size_chk… | SPEC-068 | REVIEW | Sober |
| TASK-219 | BE: REQ-007's missing half — the attendee note… | SPEC-066 | REVIEW | Sober |
| TASK-220 | scheduler-front + scheduler-back: cancel a… | SPEC-067/REQ-074 | REVIEW | Sober |
| REQ-065 | 1st Trial shows up as a selectable program (a booking TYPE in the picker) | SPEC-061 | see the Requirements table | @Sober |

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
