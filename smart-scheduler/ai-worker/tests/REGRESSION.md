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
