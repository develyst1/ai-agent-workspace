# REGRESSION — smart-scheduler

> Owner: Tanya (QA). The checklist of everything the product must **still** do.
> Started 2026-08-01, seeded from the REQs already marked DELIVERED on `board.md`.
>
> **Status of this list: UNVERIFIED BASELINE.** Every line below was derived from
> the board's own acceptance notes — *not* from a run by me. None of it carries a
> QA verdict yet. The first time each item is actually exercised, it gets a date
> and an environment; until then treat "Last verified" as hearsay.

## How to use it

- Run the **Core** set before any deploy batch, and the **full** set after a
  release that touched shared code (booking insert path, `bo` money, LINE).
- One line = one observable behaviour a staff member or a parent/teacher would
  notice breaking. If a line can't be checked without reading code, it's a bad
  line — rewrite it.
- Every escaped defect adds the case that would have caught it (`Added by` column).

Env legend: **L** = local · **D** = dev server (`sid` / som.develyst.online). Production is never used.

---

## Core (run before every deploy batch)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| C1 | Calendar loads and shows all teachers across the 09:00–18:00 slots | baseline | L/D | 2026-08-02 `sid` — `GET /calendar` 200 (API; not the painted grid) |
| C2 | Create a booking (New booking → student, teacher, slot) → it appears on the calendar as PENDING | baseline | L/D | — |
| C3 | Confirm a booking → status CONFIRMED, teacher gets exactly **one** LINE push (retry does not double-send) | baseline | D | — |
| C4 | Check-in → ATTENDED, and the entitlement it came from is drawn down by one | REQ-022 | L/D | — |
| C5 | Backoffice admin login works and `/api/v1/bo/**` refuses an unauthenticated request — **reads included** | REQ-002 / TASK-068 | D | — |
| C6 | Frontoffice pages load with no console error after a deploy (smoke) | ops | D | — |
| C7 | `GET /teachers` returns 200 (the 2026-08-01 outage signature: a migration not applied) | outage 2026-08-01 | D | 2026-08-02 `sid` — **PASS** 200 (also `/bookings` 200 post-0015–0017) |

## Scheduling & bookings

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S1 | Bookings search matches student **name, nickname, and parent phone** | REQ-011 / REQ-024 | D | 2026-08-01 `sid` — **PASS** (API: q=nickname→1, q=phone→16) |
| S2 | Bookings list page 1 starts at the **next** session, not the oldest row; clicking the date header flips the order and the **count does not change** | REQ-024 | D | 2026-08-02 `sid` — **PASS** (desc→2026-09-23 first, asc→2026-07-01, orders differ, NONSENSE→400; count invariant held 08-01). Painted date-*input* fix still unmeasured. |
| S2b | Custom date range filters at the API (arbitrary from/to) | REQ-024 | D | 2026-08-01 `sid` — **PASS** (Sep-only → 11 rows, all in range) |
| S3 | Custom date-range **inputs** on the Bookings page are usable (not collapsed to a few px) — measure at 1600/1280/768/375 | REQ-024 / TASK-081 | L | — (painted; needs composited browser) |
| S4 | Bulk-confirm: tick several PENDING → confirmed in one action, results modal reports each outcome, an over-budget freelance is **skipped and reported** (no rollback), retry sends no duplicate LINE | REQ-008 | L/D | — |
| S5 | Booking modal is **type-first tabs**; Course/Voucher tabs list only eligible students with their context; the Voucher tab offers **no** teacher/slot | REQ-022 | L/D | — |
| S6 | Booking from the Course tab → check-in → that course's **used** count goes up by one (course sessions are not free) | REQ-022 | L/D | — |
| S7 | An expired voucher booked past expiry is **refused** with reason "วอยเชอร์หมดอายุแล้ว" (backend) **and** shows the red reason alert (painted) | REQ-022 | L/D | 2026-08-02 `sid` — **backend PASS** (real expired voucher → 400, TEST-022b); **red alert still NOT TESTED** (painted; owner click-script #3) |
| S8 | Each `/scheduler/bookings` course card shows its sport program | REQ-010 | L/D | — |
| S9 | Leave → session cancelled + one auto-appended in a later week, within the package's quota; over quota locks until an admin unlocks | baseline | L/D | — |

## People, suspension & access

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| P1 | Create + edit a parent and a student, incl. gender / DOB / province / nationality; age is derived | REQ-019 | L/D | — |
| P2 | Suspend a household → their students disappear from **all four** booking tabs, stay **visible** in the course/voucher SALE modals and in full on the People screen | REQ-019 | L/D | — |
| P3 | Un-suspend → they return everywhere | REQ-019 | L/D | — |
| P4 | A **walk-in student (no parent)** stays visible throughout a suspend/un-suspend cycle | REQ-019 | L/D | — |
| P5 | A backend rejection on booking submit renders as a **red message** — never a Save button that silently does nothing | REQ-019 / TASK-052 | L/D | — |
| P6 | A suspended household **cannot buy** a course or a voucher, and **no revenue is posted** for the blocked sale | REQ-019 / TASK-058-059 | L/D | — |

## Teachers & freelance money

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| T1 | Teacher create / edit / archive / reactivate and active↔inactive all return 200 (were 502/500 before REQ-005) | REQ-005 | L/D | — |
| T2 | Freelance with a budget shows the %-used colour strip (🟢≤30 / 🟡30–70 / 🔴>70) | REQ-007 | L/D | — |
| T3 | A **full** freelance is hidden from the calendar; top-up / limit-override / monthly reset brings them back | REQ-007 | L/D | — |
| T4 | Toggling a booking ATTENDED↔SICK_LEAVE is a **no-op** on the freelance draw (no inflation) | REQ-006 / TASK-028 | L/D | — |
| T5 | The freelance limit works with the backoffice down — it is standalone in the frontoffice | REQ-004 | L/D | — |

## LINE

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| L1 | Rich-menu **taps** work (เช็คอิน / แจ้งลา / นักเรียนของฉัน) — postbacks, not just typed keywords | REQ-015 | D | — |
| L2 | Language toggle flips **both** ways and persists; menu and replies agree | REQ-015 | D | — |
| L3 | Regression on the old path: typed keywords and `/checkin?token=` still work | REQ-015 | D | — |
| L4 | A linked teacher gets 🗓️ ตารางวันนี้ / ตารางสัปดาห์นี้ with real bookings (`date · student · sport · status`), correct empty state, TH+EN | REQ-016 | D | — |
| L5 | Linking as a parent by phone replies with a **count**, never the children's names (PII) | REQ-020 St.1 | D | — |
| L6 | A teacher-nickname collision (>1 match) binds **nobody** and says staff must complete it | REQ-020 St.1 | D | — |
| L7 | ⚠️ Quick-reply **booking picker** — never covered by any acceptance round (no bookable slot existed) | REQ-015 | D | **NOT TESTED** |

## Money / backoffice

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| M1 | P&L, Items and Tags screens load on the `bo` item/movement model | REQ-006 | D | — |
| M2 | Revenue-by-activity: **buckets + unattributed = month total**, green badge; the reason amounts sum to the unattributed total | REQ-014 | D | — |
| M3 | The mismatch badge actually turns red on an inconsistent month | REQ-014 / TASK-084 | L/D | — |
| M4 | A course sale and a voucher sale each post a `bo.movement` SALE row (they never did before TASK-066) | REQ-014 / TASK-066 | D | — |
| M5 | Voucher sale prices match the price card — ⚠️ open risk: placeholder prices 30–55 % high if `sale:ensure-items` already ran | Blocked-item 2026-08-01 | D | **NOT TESTED** |

## Products & pricing (per-program price card)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| PR1 | All 8 named subjects carry a `price_group` after migration 0016 (name-match backfill) | REQ-027 / 0016 | D | 2026-08-02 `sid` — **PASS** (8/8; only `1st Trial` unpriced, likely by design — Q to Porter) |
| PR2 | Sellable combos correct: bike-skate 4/6/10 · onewheel no 10 · Balance Play (both) no 4 | REQ-027 | D | 2026-08-02 `sid` — **PASS** via `/sellable-packages` |
| PR3 | The **server** refuses a forbidden (program,size) combo, not just the dropdown | REQ-027 | D | 2026-08-02 `sid` — **PASS** (Onewheel-10 & Balance-4 → 400; allowed combo passes the gate) |

## Scheduled jobs

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| J1 | `/scheduler/attention` shows a **real timestamp** for the daily digest — not the red "never run" warning | REQ-023 | D | — |
| J2 | The 08:00 digest sends **one** LINE message to admins, and writes a `job_runs` row **even when it sends nothing** | REQ-023 | D | — |
| J3 | End-of-day (23:30) and month-reset (1st, 00:05) tasks are registered and have run | ops | D | — |

## Build-level (cheap, run first)

| # | Must still do | Command | Env |
|---|---------------|---------|-----|
| B1 | Scheduling API unit suite green | `bun test` in `smart-scheduler-back` | L |
| B2 | Backoffice API unit suite green | `bun test` in `smart-scheduler-backoffice-back` | L |
| B3 | Both frontends type-check and build | `bun run build` | L |
| B4 | Migration-file count = `"tag"` count in `drizzle/meta/_journal.json`, both backends | see board MIGRATION CHECK | L |

---

## Known holes in this list

- **Nothing here has a QA-run verdict yet** — see the header. The first real round
  replaces "—" with a date + environment.
- **Anything painted** (colour, contrast, overlap, font) is out of reach locally;
  only a deployed look catches it (board standing rule, 2026-08-01).
- **Production is never in scope** for me. A check that can only be done there is
  a DATA REQUEST to Porter.

## Layout regressions (measured, not eyeballed — board STANDING RULE)

Run `tests/harness/plan-modal-widths.mjs` + `tests/harness/voucher-manage-375.mjs` against a local
`next dev` in mock mode (a real compositing Chrome; no real env, no credential). Env: **L**.

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| L1 | Voucher table's **Manage** button is reachable at 375 (visible **or** the table scrolls) — today it is **NOT**: table `scrollWidth` 624 vs card `clientWidth` 341, `overflow-x: hidden`, `elementFromPoint()` → `null` | TASK-099 / DEF-1 | L | 🔴 **FAIL 2026-08-04** |
| L2 | Course card "Manage plan" button stays full-width at 1600/1280/768/375 (379/273/310/301) | TASK-099 | L | ✅ 2026-08-04 |
| L3 | Plan-modal session table scrolls rather than clips at 375 (`Table.ScrollContainer`, `overflow-x:auto`; Edit + Mark absence reachable) | TASK-099 | L | ✅ 2026-08-04 |
| L4 | REQ-024 custom date inputs are **176 px**, not 26/36 (the original collapsed-input defect) | TASK-081 | D | — (needs `sid`) |

**Escaped-defect case added by DEF-1:** a table that gains a column must be checked at 375 for
*clipping*, not just for narrowness — a `Card` with `overflow-x: hidden` swallows the overflow silently
and the page shows no horizontal scrollbar to hint at it.

## Verified on `sid` 2026-08-04 (first entries in this file carrying a QA verdict)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S1 | A clashing plan-modal move is refused **and the modal prints the server's own reason** (`SLOT_TAKEN` → "ครูมีคาบในช่วงเวลานี้แล้ว") | TASK-099 | D | ✅ 2026-08-04 |
| S2 | The availability view shows real states: `BOOKED · <clash owner>`, `NO BUDGET`, free | TASK-099 | D | ✅ 2026-08-04 |
| S3 | Mark-absence keeps a course at its size (absence + appended make-up, counted sessions unchanged) | TASK-099 | D | ✅ 2026-08-04 |
| S4 | A delivered (ATTENDED) session is read-only in the plan **and** the server refuses to move it (`SESSION_DELIVERED`) | TASK-099 | D | ✅ 2026-08-04 |
| S5 | REQ-024 CUSTOM date inputs measure **176 px** at 1600/1280/768/375 (old defect: 26/36) | TASK-081 | D | ✅ 2026-08-04 |
| S6 | Bookings search matches nickname **and** parent phone; date sort keeps the total (89=89); `sort=NONSENSE` → 400 | REQ-024 | D | ✅ 2026-08-04 |
| S7 | Nav has no bare "Dashboard"; SOM dashboard / Needs attention / Daily report all load | REQ-026 | D | ✅ 2026-08-04 |
| S8 | The attention panel shows a real "Digest last sent" stamp, with per-check counts | REQ-023 | D | ✅ 2026-08-04 |
| S9 | An **expired** voucher's student is not offered in the Voucher tab (prevention path — see FIND-1) | REQ-022 | D | ✅ 2026-08-04 (behaviour recorded, intent pending Porter) |

## REQ-030 batch — verified on `sid` after the 2026-08-04 deploy

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S10 | A planned absence keeps a course at size (absent row leaves, one appended takes its place) | REQ-030 | D | ✅ 2026-08-04 |
| S11 | A teacher change inside 3 days is refused (`TEACHER_CHANGE_TOO_LATE`); the same change further out is allowed; `override` bypasses | REQ-030 | D | ✅ 2026-08-04 |
| S12 | A delivered row refuses edit/move (`SESSION_DELIVERED`) but **offers Cancel**; cancel without a reason → `REASON_REQUIRED`; with a reason → cancels + re-owes | REQ-030 | D | ✅ 2026-08-04 |
| S13 | A live-row cancel re-owes a make-up (a cancel is a reschedule, never a forfeit) | REQ-030 | D | ✅ 2026-08-04 |
| S14 | `GET /teachers/:id/work-days/impact` reports `orphanCount` + the affected future LIVE sessions | REQ-030 | D | ✅ 2026-08-04 |
| S15 | "Add extra (charged)" is a visibly separate control from "Insert make-up" (different label + colour) | REQ-037 | D | ✅ 2026-08-04 |
| S16 | An extra session is a `SINGLE_SESSION`, badged EXTRA, with no Mark absence; course size/end unchanged; its cancel does **not** re-owe | REQ-037 | D | ✅ 2026-08-04 |
| S17 | Every course move/insert/absence shows a plan-diff **before** commit ("Your plan will become: … ends …"); backing out writes nothing | OBS-3 | D | ✅ 2026-08-04 |
| S18 | `/plan/preview` is a true dry run and refuses with the SAME typed reason as the real apply | OBS-3 | D | ✅ 2026-08-04 |
| S19 | Insert is disabled only on a genuinely-full course (`insertable=false`); post-absence at owed 0 stays enabled | OBS-3 | D | ✅ 2026-08-04 |
| S20 | Plan times render `HH:mm` (no raw `13:00:00`) | OBS-4 | D | ✅ 2026-08-04 |
| S21 | Changing a freelance teacher to FT/PT warns, naming the budget + remaining ("This closes X's freelance budget (remaining ฿N)"); cancel changes nothing; confirm closes the ceiling; switching back re-arms `NO_BUDGET` | REQ-009 | D | ✅ 2026-08-04 |

**Escaped-defect case added:** a QA harness must scope DOM row-targeting to a row-sized container — walking
to the page root opened another teacher's dialog (no write occurred; see the footprint ledger).

## Verified on `sid` 2026-08-10

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S22 | A voucher booking carries and DISPLAYS its class/subject — API rows all populated, Subject column filled in the bookings table, and per-session in the voucher plan modal | REQ-029 / REQ-038 #4 | D | ✅ 2026-08-10 |
| S23 | The plan modal renders the **voucher** shape for a voucher: `kind=voucher`, hours summary, `insertable=false`, **only** an Edit action (no Insert / Mark absence / Add extra), and the "one at a time (no make-up chain)" note | REQ-030 | D | ✅ 2026-08-10 |
| S24 | 🔴 The timetable page (`/scheduler/calendar`) offers a **student search** — **currently FAILS**: teacher/type/badge filters only (DEF-2, essential-set #3, unbuilt) | REQ-038 #3 | D | 🔴 **FAIL 2026-08-10** |

**Mapping trap added by DEF-2:** "REQ-x is DELIVERED" does not prove a *derived* customer item is done —
REQ-011 delivered student search **in the booking modal**, which is not the same screen as the timetable.
Verify derived items at runtime, on the screen the customer named.

## Verified on `sid` 2026-08-10 (afternoon deploy)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S25 | `GET /courses/:id/history` returns `{courseId, summary, events}`, the modal renders dated entries with teacher/subject, **no raw i18n key leaks** (`kindNo-show` style), and the "who isn't tracked yet" note is shown | REQ-038 #5 / TASK-119+120 | D | ✅ 2026-08-10 |
| S26 | The calendar course-picker labels each of a student's courses with subject + used/size | REQ-038 #2 / TASK-121 | D | ✅ 2026-08-10 |
| S27 | The voucher program picker omits every group outside `voucherAllowedGroups`; an unclassifiable program stays selectable and the server refuses it (`409 VOUCHER_PROGRAM_EXCLUDED`) | REQ-027(b) / TASK-107 | D | ✅ 2026-08-10 |
| S28 | "Record rental" opens the standalone rental form from the All-bookings tab | REQ-028 / TASK-109 | D | ✅ 2026-08-10 |
| S29 | A setting can be overridden and **reset** back to its default (`isOverridden` returns to false) | REQ-031 / TASK-102+122 | D | ✅ 2026-08-10 |

**Harness rule learned 2026-08-10:** derive an expected set from the server's own contract
(`voucherAllowedGroups`), never from a name regex — `/balance/i` matched "Balance **Cruiser**", an allowed
program, and produced a false FAIL. A red result from QA must survive checking before it is reported.

## Verified on `sid` 2026-08-10 (evening — scheduler-front deploy)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S24 | 🔁 **now PASSES** (was FAIL this morning): the timetable page offers a **student search** that filters the visible schedule — week view 6→2, case-insensitive, nonsense query → 0 cells, clear restores, and it applies in the **day** view too | REQ-038 #3 / TASK-124 | D | ✅ 2026-08-10 |
| S30 | The calendar filter row holds **four** controls without collapsing at 1600/1280/768/375 (wraps 2→3→4 lines, narrowest 115 px, no page overflow) | STANDING RULE / TASK-124 | D | ✅ 2026-08-10 |
| S31 | When one student holds two same-program courses, the picker distinguishes them (expiry tiebreaker) | OBS-5 / TASK-125 | D | ✅ 2026-08-10 |

**Second harness rule learned 2026-08-10:** read UI cells format-agnostically — the week grid renders
`10:00 | Student` while the day grid renders `Student | Subject | TYPE` with no time, so a time-anchored
regex reports an empty day grid and looks like a product defect. And count only what the UI actually
paints (cancelled bookings are not drawn) before claiming the grid is missing rows.

## REQ-041 token system — verified on customer-prod 2026-08-11

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S32 | Tailwind opacity modifiers compose on the var-backed tokens — `bg-content1/80` → `rgba(255,255,255,.8)`, `hover:bg-muted-100/60` → `rgba(241,245,249,.6)`, `bg-muted-100/50` · `bg-muted-50/40` · `bg-muted-50/80` all paint | DEF-3 / TASK-128 | **P** | ✅ 2026-08-11 |
| S33 | The app header keeps its translucent backdrop (`<header>` computes `rgba(255,255,255,0.8)`) | DEF-3 | **P** | ✅ 2026-08-11 |
| S34 | Plain `bg-muted-*` values are unchanged by the token migration (value-preserving) | TASK-128 | **P** | ✅ 2026-08-11 |
| S35 | Pinned columns · no truncated badges · no clipped cells · `DD/MMM/YY` · `tabular-nums` · no page h-scroll — at 1440/768/375 | 63f734d + TASK-129 | **P** | ✅ 2026-08-11 |

**Harness rule earned the hard way (3 false negatives): a synthetic probe only proves something about a
class Tailwind actually GENERATED.** Before concluding a utility is broken, check (a) that the class exists
in `src` at all, and (b) which *variant* it is used with — `hover:bg-x/60` generates
`.hover\:bg-x\/60:hover`, never the bare `.bg-x\/60`. Injecting the bare class then "proves" a bug that
isn't there. Same family as the day-grid time-anchored regex and the `bg-paper/50` probe.

## REQ-058 programs — verified on `sid` 2026-08-30 (`TEST-063`)

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S36 | The program picker lists **all active programs** on every booking path — Course · 1 HR · 1st Trial — with the customer's exact spelling, combined `X & Y` names included | REQ-058 AC-1/AC-2 | D | ✅ 2026-08-30 |
| S37 | The **Voucher** program list drops exactly `Onewheel E-Skate`, `Balance Play (Private)`, `Balance Play (Group)` and keeps everything on `bike-skate` | REQ-027 / REQ-058 AC-2 | D | ✅ 2026-08-30 |
| S38 | A **combined** program (`Bike & Scooter`, `Surfskate & Freeskate`) can be booked to a teacher and saves — and the calendar cell renders the `&` in the name without escaping damage | REQ-058 AC-3 / REQ-052 | D | ✅ 2026-08-30 |
| S39 | A `bike-skate` course prices **4,790 / 6,490 / 9,790** at sizes 4 / 6 / 10 with leave quota 1→wk5 · 2→wk8 · 3→wk13 — identically for a pre-existing program (`Surfskate`) and a REQ-058 one (`Surfskate & Inline Skate`) | REQ-058 AC-4/AC-5 | D | ✅ 2026-08-30 |
| S40 | A **1-hour** session on a `bike-skate` program prices at **฿1,390** and Save is enabled (the gap REQ-058 note 3 raised; closed by REQ-066/TASK-174) | REQ-066 | D | ✅ 2026-08-30 |
| S41 | The KEPT combined program `Bike / Scooter / Balance Cruiser` is still selectable and its live courses still point at it — never renamed, merged or migrated | REQ-058 owner decision 08-22 | D | ✅ 2026-08-30 |
| S42 | A program added later by command (`Surfskate & Skateboard`, 08-29) shows up in **all four** pickers with no FE change | REQ-058 AC-6 | D | ✅ 2026-08-30 |

**Harness note 2026-08-30:** the booking-modal option lists live in a **portal outside `<main>`**, so
`get_page_text` (which reads `main`) returns the calendar and silently shows *nothing* of the open dropdown —
which reads exactly like "the picker is empty". Read `[role="option"]` from the document instead, and filter to
the **visible** listbox: several closed listboxes (teachers, students, times, branches) stay in the DOM and a
naive query returns all of them mixed together. Same family as the day-grid regex lesson above — the probe has
to match what the page actually is, or it invents a defect.

## REQ-078 อื่นๆ — from the 2026-09-01 FAILED round (`TEST-064`). Re-run every line after the fix.

⚠️ REQ-078 is **not delivered**. S43–S46 passed on `sid` and must keep passing; **S47–S50 are the four defects**
and are written as the checks that must go green before this type ships.

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S43 | An อื่นๆ booking with **several teachers** shows in **every** assigned teacher's column, names the others (`With X, Y`), reads as **one** booking, and **one cancel clears all of them** | REQ-078 AC-18 | D | ✅ 2026-09-01 |
| S44 | A **studentless** อื่นๆ is named on the calendar by the **admin's typed title** — never "อื่นๆ"/"Other", never blank; Thai titles render | REQ-078 AC-2 | D | ✅ 2026-09-01 |
| S45 | อื่นๆ negatives all refuse with a message and book nothing: no title · amount `0` / negative / non-numeric. The two price sources are **one segmented control** so both can never be set | REQ-078 AC-10/11/12 | D | ✅ 2026-09-01 |
| S46 | The other four types still take **exactly one** teacher, and a **1 HR with no student is still refused** — the guard `0029` moved out of the DB and into code | REQ-078 AC-14/AC-20 | D | ✅ 2026-09-01 (client-side) |
| S47 | 🔴 Removing the **last teacher chip** on an อื่นๆ and then typing must leave the form standing — no uncaught `TypeError`, no "This page couldn't load" | DEF-1 / AC-19 | D | ❌ **FAILS 2026-09-01** |
| S48 | 🔴 An อื่นๆ clashing with a teacher's existing booking must **warn, name the teacher and the clashing booking, and still allow the save** — never refuse; and **no warning** when there is no clash | DEF-2 / AC-24+25 | D | ❌ **FAILS 2026-09-01** (refuses instead) |
| S49 | 🔴 `All bookings` → Type=**Other** must render the rows it counts — a studentless booking is reviewable somewhere | DEF-3 / AC-13 | D | ❌ **FAILS 2026-09-01** ("2 found", 0 rows) |
| S50 | 🔴 Booking an อื่นๆ over an existing session must **not hide that session** on the calendar | DEF-4 | D | ❌ **FAILS 2026-09-01** (display only; data intact) |

**Harness note 2026-09-01 (cost me three false starts):** this app's modals **re-flow when a validation banner
appears or disappears**, so a coordinate captured before typing can land on a different control after. Two of my
"crashes" were really mis-aimed clicks. **Screenshot immediately before every click in a modal**, and confirm what
was actually hit before calling anything a defect — the one real crash (S47) only became credible once it survived
that discipline three times. Same family as the day-grid regex and the Tailwind-probe lessons above.

### REQ-078 update after the 2026-09-02 defect build (`TEST-064` §Round 4)

S47–S50 were written on 2026-09-01 as the four checks that had to go green. Re-run on the deployed build:

| # | Now | Note |
|---|---|---|
| **S47** | ✅ **PASSES 2026-09-02** | remove the last teacher chip then type — form survives, no `TypeError`. Held through repeated add/remove/type/toggle cycles |
| **S48** | ⚠️ **PARTIAL** | the rule was changed by the owner (warn → **refuse**, AC-24 revised). The refusal now **names the clashing booking** ✅ but **never which teacher** ❌ — identical message when only one of several teachers clashes. **DEF-7** |
| **S49** | ✅ **PASSES 2026-09-02** | `All bookings` → Type=Other: `6 found` → 6 rows rendered; studentless rows show the typed title and every teacher |
| **S50** | ❌ **STILL FAILS** | narrowed but alive: an อื่นๆ over an **on-leave** session still hides that session (the *sanctioned* overbook path). **Display only — data proven intact** by the session reappearing on cancel |

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S51 | Toggling `คิดเงินรายการนี้` and then typing in the title must not kill the page (DEF-5's second path) | DEF-5 / TASK-237 | D | ✅ 2026-09-02 |
| S52 | The confirm dialog on a multi-teacher อื่นๆ names **every** assigned teacher **and** states the count (`…to 3 teachers: Bank, Camp, Dewy`) | DEF-6 / TASK-241 | D | ✅ 2026-09-02 |
| S53 | An อื่นๆ with an **additional teacher** over an **on-leave** session still SAVES — the slot guard must not be widened into UC-004 overbooking | TASK-239 | D | ✅ 2026-09-02 |
| S54 | The อื่นๆ form's Thai strings match REQ-078's wording table exactly (อื่นๆ · ครู · นักเรียน (ไม่บังคับ) · ชื่อรายการ · เช่น ประชุมทีม, ปิดปรับปรุงลาน · คิดเงินรายการนี้ · ตัดสิทธิ์จากคอร์ส / Voucher · กรุณาระบุชื่อรายการ) | REQ-078 wording | D | ✅ 2026-09-02 |
| S55 | An unmarked อื่นๆ session becomes ATTENDED at the 23:30 day-end **the same as every other type** | REQ-078 AC-9 | D | ❌ **UNVERIFIED** — F1/F2 sat `PENDING` overnight. ⚠️ Do **not** re-file as a defect before checking `job_runs`: it may be that the job only promotes `CONFIRMED`, in which case the fixture shape was wrong, not the product |

**Harness note 2026-09-02:** a fixture that "should" have been swept overnight and wasn't is **not evidence of a
skipped job** until you know what the job does to that *status*. I built F1/F2 as `PENDING` and only afterwards
realised `PENDING` may never have been in scope — the comparison row, or the `job_runs` entry, is the evidence;
the fixture alone is not. Same family as the earlier lessons: **match the probe to what the system actually is.**

## REQ-079 LINE chatbot — from the 2026-09-03 verdict (`TEST-065` §Round 2)

⚠️ REQ-079 is **not delivered**: only 14 of 26 ACs were exercised. These are the ones now proven on `sid`.
🔴 **Every line below needs a LINE-capable tester** — QA has no LINE account (`SYSTEM-FACTS.md`), so the owner is
the hands. **S61–S62 are the exception: they are checked from the admin screens and QA can run them alone.**

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S56 | An **idle** chat stays **silent** — stray text gets no reply at all | REQ-079 AC-1 | D | ✅ 2026-09-03 |
| S57 | Every flow step offers an exit (`หรือพิมพ์ ยกเลิก เพื่อออก`) — incl. the **rejection re-prompt** and the **duplicate-name** prompt — and `ยกเลิก` deletes the draft **and says so** | REQ-079 AC-19 | D | ✅ 2026-09-03 |
| S58 | A word the bot advertises (`เมนู`) is **refused as a student name**, names the escape, **and never reaches the database** | REQ-079 AC-20 | D | ✅ 2026-09-03 |
| S59 | Two consecutive unexpected replies **hand the chat to a human**; a **duplicate name is NOT a strike** — it asks for a surname | REQ-079 AC-14/21 + §6a | D | ✅ 2026-09-03 |
| S60 | A muted chat stays silent **even on a command word the bot advertises**, tells the parent `เปิดเมนู`, and `เปิดเมนู` really works and starts nothing | REQ-079 AC-13/23/24/26 | D | ✅ 2026-09-03 |
| S61 | 🔵 **QA-runnable:** a parent who abandons mid-flow leaves **no partial student** — search the abandoned name on `People`; the parent count must be unchanged | REQ-079 AC-9 | D | ✅ 2026-09-03 |
| S62 | 🔵 **QA-runnable:** `Clear LINE link` states the link state **before** the admin acts — `Cancel`-only when nothing is linked; when linked it names the count and says students/bookings/notes/history are kept and the account may rebind to **a different family** | TASK-243 | D | ✅ 2026-09-03 |
| S63 | 🔴 A **muted** chat stays silent against typed text (**distinct from S56's idle state** — the mute path was rewritten by TASK-246) | REQ-079 AC-25 | D | ❌ **UNVERIFIED on this build** — QA asked for it 09-03 |
| S64 | 🔴 A mute in one chat leaves **every other family's chat working normally** | REQ-079 AC-13 2nd half | D | ❌ **UNVERIFIED** — needs a **second linked chat** (same missing fixture as REQ-078 AC-16) |
| S65 | 🔴 Clearing a family's LINE link lets that account **rebind to a different family**, with students/bookings/history intact | REQ-079 AC-4 / TASK-243 | D | ❌ **UNVERIFIED** — QA will not clear the owner's live account; his to run |

**Harness note 2026-09-03 — how to trust a negative.** Three of this round's passes (S58, S61) rest on a search
returning **nothing**. Before reporting any of them I searched a name I *knew* existed and confirmed the box
returns students, not just parents. **An empty result from a broken filter looks exactly like a clean database** —
and on this project I have twice nearly filed my own mistake as a product defect. **Prove the instrument works
before you trust it to say "nothing is there."**

### REQ-079 update after the 2026-09-03 night run (`TEST-065` §Round 3)

| # | Now | Note |
|---|---|---|
| **S63** | ✅ **PASSES 2026-09-03** — in the **strong** form | a muted chat stayed silent against `awdw` · `สวัสดี` · **`นักเรียน`** · **`เมนู`** — including two commands the bot advertises itself |
| **S64** | ✅ **PASSES 2026-09-03** | one chat muted while another was **served** ⇒ the mute is **per-chat, not account-wide**. ⚠️ residual: the second chat was *unlinked*, so the fully-equivalent linked-parent case is unexercised. Judged very low — account-wide muting would have silenced it regardless of link state |
| **S65** | ✅ **PASSES 2026-09-03** | cleared → re-bound to a **different** family, **verified from both ends in the admin data**, students intact |

| # | Must still do | From | Env | Last verified |
|---|---------------|------|-----|---------------|
| S66 | An already-linked LINE account entering **another family's phone** is **refused** — and the refusal must **not** name the other family **nor reveal whether the number exists** | REQ-079 AC-4 | D | ✅ 2026-09-03 |
| S67 | 🔵 **QA-runnable:** clearing a family's LINE link removes **only** the link — its students, bookings, notes and history all survive; the admin screen shows **not linked** afterwards, and the family it moved to shows **1 linked** | TASK-243 / AC-4 | D | ✅ 2026-09-03 |
| S68 | 🔴 The **four existing notifications** still fire after this REQ rewired their shared message path — teacher schedule · course-confirm · booking-confirm · **the 08:15 daily** | REQ-079 AC-17 | D | ❌ **UNVERIFIED.** The 08:15 job has been *known-unverified* on this project since before the QA role existed. **The cheapest remaining AC and the one QA would hold a ship for** |
| S69 | 🔴 Entry via the **`[เข้าใช้ระบบ]` rich-menu button** (not typed `สมัคร`) shows that family's children | REQ-079 AC-2 | D | ❌ **UNVERIFIED** — outcome proven by typing, but a **postback and a text message are different handler branches**, and Rule 2 says only a button starts a flow. Closes when the menus are published |

**Harness note 2026-09-03 (late) — two different facts.** The bot replying *"ผูกบัญชีสำเร็จ ✅"* and the admin
screen agreeing that the link moved are **not the same fact**, and a half-written link is exactly what hides
between them. I checked **both ends** (old family → not linked, new family → 1 linked) before ruling. 📌 And I
**declined** an offer to close S64 by reading the mute key from source: **reading code is not testing** — a
source read says the implementation looks right, it adds no fact to what the two chats demonstrated.
