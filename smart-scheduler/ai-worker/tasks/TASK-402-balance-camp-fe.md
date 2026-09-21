# TASK-402 — Balance camp: the Camp menu (weeks · per-day roster · sell · redeem · mark), the student's Camp card, the calendar day banner, FE (`REQ-095` Stage 3a, `SPEC-082`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size L.** Builds against TASK-401's contract once CONFIRMED (I will paste the final lines here). ⏳ Pure parts (units arithmetic, credit display, the banner's date math) now; wire after Jason's report. `sid`; a later `uat` deploy. Starts after TASK-400.

## §0 The contract — CONFIRMED 2026-09-19 (TASK-401)
`/api/camp`: `GET /weeks?from&to` ⇒ `{ weeks: [{ id, name, startDate, endDate, capacity, teacherIds, status, dayCounts: { [date]: n } }] }` · `POST /weeks { name, startDate, endDate, capacity?, teacherIds? }` (1–7 consecutive days) · `PATCH /weeks/:id { name?, capacity?, teacherIds?, status? }` · `GET /weeks/:id/days` ⇒ `{ week, days: [{ date, entries: [{ dayId, packageId, studentId, studentName, kind, half, units, status }], count, capacity }] }` · `POST /packages { studentId, kind: FULL|HALF, plan: FULL_WEEK|DAILY, days? (DAILY only, 1..30), discount?, firstWeek?: { weekId, dates[], half } }` ⇒ `201 { package, planned }` (early bird = the existing discount block, `BAHT 1000`, reason typed — no special field, no date rule) · `GET /packages?studentId` ⇒ `{ packages: [{ id, kind, plan, totalUnits, usedUnits, plannedUnits, credit, days: [{ dayId, weekId, weekName, date, half, units, status }], discount, createdAt }] }` — the Camp card reads THIS · `POST /packages/:id/days { weekId, dates[], half }` ⇒ `201 { planned, package }` | `409 CAMP_WEEK_CLOSED` | `409 CAMP_FULL` | `409 CAMP_DAY_TAKEN` | `409 CAMP_NO_CREDIT` (each naming the date) | `400` a date outside the week · `PATCH /days/:id { status: ATTENDED|ABSENT|CANCELLED }` from PLANNED; ATTENDED ↔ ABSENT same day; CANCELLED refused once the day has started (`409 CAMP_DAY_STARTED`) · **`GET /camp/prices`** ⇒ the four items (never a constant) · the calendar payload gains `campWeeks: [{ id, name, startDate, endDate, dayCounts }]`. Units: half 1 · full 2, ONE currency; FULL_WEEK = 5 days. Keys: `menu:camp` (nav after Badges, before SOM) + `action:camp.week-open|sell|redeem|day-mark` (13 / 54 — the snapshot moves 50 → 54 with the reason); the sell's discount also needs `action:sales.discount` as every discount does.

## §1
- **Menu `Camp`** (by `menu:camp`, hidden not disabled — the RBAC rule): **Weeks** (a list by month; `Open a week` by `week-open`: name, date range, capacity, teachers) → **a week's roster**: one column per date, the children with a kind/half chip and a status chip, the count vs capacity; `Mark` per child per day (`day-mark`: attended / absent / cancelled — the same three words as the server); a `Redeem into this week` door (`redeem`): pick a child with credit ⇒ tick dates (the shared `MultiDateField`, limited to the week's dates) + half ⇒ one call; the 409 names the date, the ticks stay.
- **Sell a camp** (`sell`): from the student's page and from the week's roster: kind × plan (DAILY ⇒ a `days` number), the price from the card, the existing discount block (early bird = a discount with its reason — no special field), optional first week + dates ⇒ one call.
- **The student's Camp card**: packages with `credit / total` in DAYS with the half shown (`4½ days left`), used, planned; a link to redeem.
- **The calendar day banner**: a strip above the day's hour grid for each open week covering that date: `name · n kids` — no cells; click ⇒ the week's roster.
- 🚫 No client rules (units, capacity, credit are the server's — the form shows the server's sentence); 🚫 no expiry shown anywhere (there is none).
- Copy both languages, counted; snapshot 54 = 54 by script.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (sell body; redeem body; mark body; the banner from `campWeeks`; credit arithmetic pure and value-tested incl. the half) · keys counted · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **The `Camp` menu (weeks by month → a week's roster with Mark · `Redeem into this week` · `Sell a camp` · open/edit/close), the student's Camp card (credit in days with the ½, from the server's units), the calendar day banner from `campWeeks`.**

```
bunx tsc --noEmit → exit 0
bun test          →  454 pass / 0 fail   (was 446; +8 — new lib/camp/camp.test.ts)
bun run build     → ok — `○ /scheduler/camp`
git status        →  since TASK-400: 17 modified · 10 new (app/(admin)/scheduler/camp/page.tsx · partials/Camp/{CampContent,WeekRoster,OpenWeekDialog,RedeemDialog,SellCampDialog,CampCardModal,campChips,index} ·
                     Calendar/CampDayBanner.tsx · hooks/scheduler/useCamp.ts · services/camp.{service,mock.service}.ts · lib/camp/{units.ts,camp.test.ts})
```
Built against §0 + @Jason's final DTO lines in TASK-401 (2499/0, 43 = 43). **Registries: 54 = 54 actions and 13 = 13
menus vs the BE, by script, in order** (`menu:camp` after Badges; the four `camp.*` after `badges.*`, before
`settings.*` — the BE's own order; the area list in `action-gate.test.ts` gained `camp` in that slot). 🚫 No deploy asked.

### `§1` — what was built
- **`lib/camp/units.ts` (pure, value-tested):** `creditDays` / `creditLabel` — UNITS → days + ½ by `floor(u/2)` and
  `u % 2` (9 ⇒ `4½`, 10 ⇒ `5`, 1 ⇒ `½`, never negative; mutation 1 — rounding — fails); `bannerWeeksFor` — only OPEN
  weeks covering the date, each with **that day's server count** `dayCounts[date]` (mutations 2 and 3 fail);
  `weeksByMonth`, `datesBetween`; the bodies `sellCampBody` (`days` only on DAILY, `firstWeek` only with ticks, dates
  sorted; mutation 4 fails) and `redeemBody`. 🚫 Nothing computes credit, capacity or a transition here.
- **The `Camp` menu** (`/scheduler/camp`, `menu:camp` on the nav after Badges — the route guard and the nav hide it as
  every menu; mutation 16, the entry without its key, fails four tests). Weeks by month (± a week so a straddling week
  shows), each with its dates, kid-days, cap, `Open`/`Closed`; **`Open a week`** (`camp.week-open`; mutation 10) ⇒ name,
  first/last day, capacity (empty = no cap), teachers ⇒ `POST /camp/weeks`; **edit** the same dialog ⇒ `PATCH` with
  only what changed; **close** = one tap, the same key (`status: CLOSED` — it only stops new redeems).
- **A week's roster** (`GET /camp/weeks/:id/days`): one card per date with **`count/cap` from the server** (the one
  comparison colours the badge red — nothing dims, disables or hides on it; mutation 9 — enforcing the cap — fails), the
  children with the kind/half chip and the status chip. **`Mark`** per child per day (`camp.day-mark`; mutation 8 fails
  three tests) — a menu of the three server words minus the current one ⇒ `PATCH /camp/days/:id { status }` (mutation
  13, a wrong body key, fails); the refusals (`CAMP_DAY_STARTED` with its "บันทึกขาดแทน", `CAMP_DAY_TRANSITION`) are the
  server's sentence as a notice. **`Redeem into this week`** (`camp.redeem`, OPEN weeks only) ⇒ `RedeemDialog`: pick a
  child ⇒ their packages **with credit > 0** (the server's number, offered as choices) ⇒ the half ⇒ **the SHARED
  `MultiDateField`, limited to the week's dates** (`minDate`/`maxDate` — a small addition to the shared picker;
  mutation 7 fails) ⇒ ONE `POST /camp/packages/:id/days`; a refusal names the date and **the ticks stay** (mutation 6).
- **`Sell a camp`** (`camp.sell`) from the roster (week preset) and from the student's card: kind × plan, `days` on
  DAILY, **the price from `GET /camp/prices`** — the card's item for kind × plan, a DAILY item × days, shown with its
  arithmetic; no number of its own (mutation 5 — a hard-coded 11,500 — fails); **the EXISTING `DiscountSection`** (early
  bird = a discount with its reason; nothing special, asserted); a note; an optional first week (an OPEN week + the
  half + the limited picker) ⇒ ONE `POST /camp/packages`; the discount also needs `sales.discount` (the block hides
  itself as everywhere).
- **The student's Camp card** — a teal tent icon on every student row on the People page ⇒ `CampCardModal`: each
  package as `kind · plan`, bought-on, a badge **`n½ days left`** from `creditLabel(p.credit)` (mutation 11 — computing
  credit on the card — fails), the line *`total bought · used · planned`* (each in days+½), the planned days with their
  week and chips; `Sell a camp` and a link to the Camp menu to redeem. 🚫 No expiry anywhere (asserted: no `expir` on the card).
- **The calendar day banner** — `CampDayBanner` above the DAY grid only (mutation 12 — on the week view too — fails),
  one teal strip per OPEN week covering the date: `name · n kids`, click ⇒ the Camp menu; nothing on an uncovered day
  (rendered assertion). From the payload's `campWeeks` (`CalendarResponse.campWeeks?`), no cells, no second call.
  Every camp write also invalidates the calendar key so the banner follows.
- Copy: **`camp.*` 60 · `nav.camp`** — both languages, counted.

### 🔑 Break-and-watch — sixteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | units ⇒ days rounds instead of floors | **1 fail** |
| 2 | the banner shows CLOSED weeks | **2 fail** |
| 3 | the banner counts something of its own | **1 fail** |
| 4 | the sell body sends `days` on FULL_WEEK | **1 fail** |
| 5 | the sell form holds a price of its own | **1 fail** |
| 6 | a 409 clears the redeem ticks | **1 fail** |
| 7 | the redeem picker is not limited to the week | **1 fail** |
| 8 | Mark ignores the key | **3 fail** |
| 9 | the roster enforces the cap itself | **1 fail** (📌 slipped first — the negative missed an `aria-disabled`/opacity shape; now "exactly one comparison, it colours a badge") |
| 10 | `Open a week` ignores the key | **2 fail** |
| 11 | the card computes credit itself | **1 fail** |
| 12 | the banner mounts on the week view | **1 fail** |
| 13 | the mark route sends the wrong body | **1 fail** |
| 14 | `menu:camp` lands after som | **2 fail** |
| 15 | the snapshot loses a camp key | **3 fail** |
| 16 | the nav entry loses its menu key | **4 fail** |
`md5` identical on all twelve mutated files. Pins moved with the reason: `MENU_KEYS` 12 → 13 (the literal list too),
the snapshot 50 → 54 + the `camp` area, the sweep 78 → 86 / 33 files, the matrix render 15 → 16 columns, TASK-365's
gap negative now starts at the EDIT tooltip (the Camp icon sits before it).

### Definition of Done
- [x] **454 / 0** · `tsc` 0 · build ok
- [x] Sell / redeem / mark bodies · the banner from `campWeeks` (rendered) · credit arithmetic pure and value-tested incl. the ½
- [x] Keys counted, both languages · 54 = 54 and 13 = 13 by script
- [x] 🔑 Break-and-watch — sixteen, `finally`, checksum

### ⚠️ Not seen on a screen
The roster at phone width (one card per date in a horizontal scroll — the plan-table pattern); the month nav; the
teal strip beside a full day grid; the sell dialog's first-week block. For @Tanya on `sid` (after `db:migrate` ⇒ 43 and
`sale:ensure-items` +4): open a week Mon–Fri cap 6 ⇒ it lists with `0 kid-days · cap 6`; sell a Full week to a child
with a ฿1,000 "early bird" discount and the first week ticked Mon–Wed ⇒ `Camp package sold — 3 days planned`, the card
reads `2 days left` and *5 days bought · 0 used · 3 planned*; the roster shows the child on three cards `1/6`; the
calendar's Monday shows the teal strip `name · 1 kids`; redeem Thu+Fri ⇒ `0 days left`; a sixth child on Monday ⇒
`CAMP_FULL`'s sentence, the ticks stay; Mark Monday attended, then cancel it ⇒ `CAMP_DAY_STARTED`'s sentence; close the
week ⇒ `Redeem into this week` disappears and the badge reads Closed.
