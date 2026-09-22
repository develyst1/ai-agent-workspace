# SPEC-088 — `REQ-101` ECA manage-plan · `REQ-102` RBAC money visibility — ANALYSIS + sizes for the three-way (Sober, 2026-09-21). No build.

---
## Part A — `REQ-101` ECA manage-plan

### §A0 What an ECA is today (Stage 1, TASK-394/395)
- An ECA/Free/KOL schedule = **N independent `OTHER` booking rows** (one per date, one hour each), made in one call by `POST /bookings/other-series` (title · kind · head count · teacher + `additionalTeacherIds` + per-teacher rates · start time · `dates[]`). **There is no series object**: nothing ties the rows together afterwards except the shared title (a GROUP series has a `group_key`; an OTHER series does not).
- **Can a schedule hold several teachers? YES, already** — the primary `teacher_id` + any number of extras in `booking_teachers` (each holding its own slot; `attachAdditionalTeachers`, the clash check per extra). But that is set **at creation, per row**: `PATCH /bookings/:id/other` edits kind / head count / rates on ONE row and cannot add a teacher; the only per-row teacher change is the ordinary move (`PATCH /bookings/:id`, the primary, one row). **So the customer's question has a true answer: today, adding a teacher to an existing ECA means creating a new series (or moving rows one by one)** — there is no Add-teacher on an existing schedule, and no place that shows the schedule as one thing.
- Confirm: an OTHER row is born PENDING and confirms per row like any booking (the modal / bulk-confirm) — no whole-series confirm. Notices: the coach is told on confirm/cancel per row (the OTHER rows carry no student, so no family side). Cancel-all: none — per row.
- Free/KOL: the same rows with a different `other_kind` — **everything below generalises to the three kinds by construction** (the kind is a tag on the row).

### §A1 The design — an OTHER SERIES object (the GROUP precedent, `0049`)
1. **`bookings.other_series_key uuid NULL`** (+ partial index) stamped on every row the series creator makes (the `group_key` shape); the title/kind/head count stay per row (the series editor writes them to every live row of the key). Existing ECA rows on `uat` have no key — a **one-off backfill** groups rows by `(other_title, other_kind, start_time)` into keys (a script the human runs; or the editor offers "adopt these rows into one series").
2. **The Manage-plan page** (`/scheduler/other/:key`, `menu:calendar`): the series' rows in date order with status chips; per-row doors as today (move · cancel · confirm); series doors: **Confirm all** (bulk-confirm over the key's PENDING rows — the existing loop, one tx, the coach notices as per row), **Cancel all** (every live row ⇒ CANCELLED with a reason code, one tx; the coach told once per teacher with the row list), **Add teacher** (`POST /other-series/:key/teachers { teacherId, rateMinor?, fromDate? }` ⇒ `attachAdditionalTeachers` on every live row from the date on, each slot-checked — `409` naming the first clash, nothing written), **Remove teacher** (the reverse; the primary cannot be removed — swap instead), **Swap teacher** (the group swap's shape by key: `PATCH /other-series/:key/teacher { from, to, fromDate }`), **Add dates** (more rows into the key), **Edit title/kind/head count** for all rows.
3. **Notify the teacher on edit/move/remove "like a normal course":** the coach notice exists for confirm and cancel; a MOVE on an OTHER row tells the coach today? (`moveBooking` tells the teacher for lessons — verify for OTHER; TASK-406 found `moveBooking` sends nothing to families, the coach path exists). An Add/Remove-teacher notice is **net-new copy** (📖 placeholder, the owner's words) — `other_teacher_added` / `other_teacher_removed` kinds.
4. Keys: `action:calendar.other-series` (exists) covers create; the series doors ride `booking-edit` / `status` as the rows do; **one new key** `action:calendar.other-cancel-all` (57th) for the destructive door (recommend — a wrong entry wipes N rows; the owner may want it super-admin-ish).

### §A2 Sizes
| piece | BE | FE |
|---|---|---|
| the series key + creator stamps it + backfill script | S | — |
| Manage-plan page (rows, per-row doors, edit title/kind/heads) | S | M |
| Confirm all · Cancel all (+ key 57) | S | S |
| Add / Remove / Swap teacher on the series (slot-checked, one tx) | M | S |
| the two teacher notices (placeholder copy) | S | — |
**Total BE M+ (`0049` ⇒ 50, one key, two placeholder kinds) · FE M.** Generalises to Free/KOL for free.

### §A3 Owner decisions
1. Cancel-all behind its own key (recommend) or the ordinary `status` key.
2. Add-teacher default `fromDate` = today (future rows only) or the whole series incl. past rows (recommend: future only — past rows are history).
3. The backfill of existing ECA rows into series (a script, the human runs) vs "adopt into series" from the page (recommend the script, once).
4. The two notices' words (gated, the item-7 precedent).

---
## Part B — `REQ-102` RBAC money visibility

### §B0 What exists (the read)
- **There is NO money-visibility key.** RBAC has 12→13 menus and 56 actions; money is gated only by two ACTION keys on writes — `action:sales.discount` (a body field) and `action:teachers.budget` (set/top up a teacher's budget) — never on reads. **Every money figure is visible to anyone who holds the menu that shows it.**
- **In-scheduler surfaces that show money today** (vs the backoffice, which holds the ledger/P&L):
  1. **Teachers page** (`menu:teachers`, `GET /teachers`): each teacher's **`budgetMinor` / `remainingMinor` / `reorderMinor`** — the freelance salary ceiling and what is left (`freelance_budgets`, REQ-009). ⚠ `GET /teachers` is ALSO the lookup list for the calendar, bookings, link-requests and reports menus — so today **a Teacher-role user (REQ-097) receives every coach's budget in the payload** (their FE hides it only by not rendering it). This is the one leak worth closing regardless.
  2. **Price cards on the sale forms** (`GET /sellable-packages`, `/camp/prices`, the rental and voucher lists) — the customer-facing list prices; shown to whoever can sell.
  3. **The discount block** on every sale (`action:sales.discount` to give one; the "full price" line visible to anyone with the form).
  4. **Posted-sale read** on a booking (`GET /bookings/:id/posted-sale` — "was revenue posted, how much").
  5. **The coach rate** (`rate {…}` on course rows, `other.teacherRates` on OTHER/GROUP, `classRateMinor` on courses) — the §13.3 model; visible to anyone with the calendar/bookings menus.
  6. **Reports** (`menu:reports` daily revenue summary, `menu:som`, `menu:dashboard`).
- Money is thus spread over six surfaces behind four menus. Only (1) and (5) are STAFF-PAY figures; (2)–(4) are customer prices; (6) is revenue.

### §B1 Design — ONE key, applied at the DTO (fail-closed), not per surface
- **`action:money.view`** (57th/58th; TH `ดูตัวเลขเงิน` / EN `View money figures`) — **granted to nobody by default** (fail closed); the super admin holds everything as today. ONE `moneyMask(user)` applied where DTOs are built: without the key, every money field is **`null`** (`budgetMinor`, `remainingMinor`, `reorderMinor`, the `rate` object, `teacherRates`, `classRateMinor`, `priceMinor`/`fullPrice` on cards, the posted-sale amount) — the SHAPE stays, the values go; the FE renders `—`. Reports (`menu:reports/som/dashboard`) are revenue pages: they keep their menu gate AND require the key (a report without numbers is nothing).
- **Granular vs one key:** the surfaces split naturally into **pay** (budgets, coach rates) and **prices/revenue** (cards, discounts, posted sales, reports). The customer asked for "who can SEE money figures incl. the freelance ceiling" — one key answers it; if the owner wants a cashier who sees prices but not coach pay, that is TWO keys (`money.view-pay` · `money.view-sales`). *Recommend: start with ONE key (`money.view`) — it is the ask, and a second can be split out later without a migration (keys are code constants).*
- **Writes stay as they are:** `sales.discount` and `teachers.budget` still gate the acts; a user with `teachers.budget` but no `money.view` would edit a number they cannot see — the FE hides the budget door without `money.view` (hidden, never disabled) and the BE refuses the write without BOTH (fail closed).
- **The Teacher role** never holds it; the leak in §B0.1 closes by the mask (a linked teacher's `GET /teachers` returns null budgets).

### §B2 Sizes
**BE S–M** (one key, one mask at the DTO builders — ~6 sites: teacher DTO, booking `rate`/`other.teacherRates`, course `classRateMinor`, the price-list routes, posted-sale, the three report routes; the double gate on the two write acts; pinned that every `*Minor` field in a DTO passes the mask — a scan pin) · **FE S** (`—` rendering where a money field is null; the budget/rate/discount doors hidden without the key; the Roles matrix shows the new key). No migration.

### §B3 Owner decisions
1. ONE key vs two (pay / sales) — recommend one to start.
2. Default: nobody but the super admin (fail closed) — the owner grants it to the roles that price and pay.
3. Whether the customer-facing PRICE cards count as "money" (a front-desk role that sells must see prices — if the owner wants that without `money.view`, prices are excluded from the mask and the key covers pay + revenue only). *Recommend: exclude list prices from the mask (they are public); mask pay, discounts' amounts, posted sales, reports.*
4. The Teacher role: never granted (recommend) — a coach sees no one's pay, including their own rate? (The rate is the shop's number, not the coach's contract — recommend hidden.)
