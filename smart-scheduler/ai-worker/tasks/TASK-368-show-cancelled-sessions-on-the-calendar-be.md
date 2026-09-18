# TASK-368 — Show CANCELLED sessions on the admin calendar when asked (`REQ-089 §5`, item 4 re-scoped) — BE

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-16)
**Owner (`REQ-089 §5`):** a toggle on the admin calendar that, when ON, shows the `CANCELLED` sessions the calendar hides today — EVERY reason. Struck/greyed, reason shown. 🚫 **DISPLAY ONLY — no new cancel reason, no money, no re-owe, nothing else moves.**
**Size XS–S.** ⛔ Chain stopped. Batch: 4/5/7 → one `sid` deploy.

---

## §1 The prior fact
`getCalendar` (`:485`) excludes `CALENDAR_HIDDEN_STATUSES = ["CANCELLED", "PAUSED"]` (`schema.ts:107`) — the NAMED list, TASK-260's. `calendarQuery` is `{ date, view }`.

## §2 The contract (for @Fern, building TASK-369 in parallel — confirm/correct first)
- **`GET /calendar?…&includeCancelled=true`** (`z.coerce.boolean().default(false)` — say the exact coercion; `"false"` must be false) ⇒ the same rows PLUS the `CANCELLED` ones in range. **`PAUSED` stays hidden** (it is in the tray, TASK-260; the owner said cancelled). 🚫 Absent/false ⇒ byte-for-byte today's response — the default path is the untouched one.
- The DTO already carries `status`, `cancelReason` (the closed code) and `note` (the human sentence) — **confirm both ride on the calendar DTO today; if `cancelReason`/`note` are stripped there, add them, nothing else.** `courseLast` is `false` on a cancelled row by construction (not live).
- 🔑 **Subtract, don't branch:** the cleanest shape is the hidden list minus `CANCELLED` when the flag is on — one `notInArray` with a computed list, not a second query. Say what you did.
- 🚫 `SLOT_INACTIVE_STATUSES`, the unique index, availability — untouched; the rentals/`courseLast` grouped reads unchanged.

## Definition of Done
- [ ] Contract confirmed first
- [ ] Suite, **count** · tsc · **35 = 35**
- [ ] Pinned: flag absent ⇒ no `CANCELLED`, no `PAUSED` (today's pin, untouched) · flag on ⇒ `CANCELLED` present with `status`, `cancelReason`, `note`; `PAUSED` still absent · `"false"` ⇒ off
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ A cancelled COURSE session whose make-up was appended: with the toggle on, the admin sees BOTH the struck original and the live make-up. Is anything on the DTO linking them (`extendedFromId` points make-up → original)? Say whether it rides; build nothing.

---

## §3 📋 CONTRACT — verified against the tree, CONFIRMED with two corrections and one decision (@Jason, 2026-09-16, before building)

**Confirmed:** `GET /calendar?date&view&includeCancelled=true` ⇒ today's rows PLUS the range's `CANCELLED` rows; `PAUSED` stays hidden. **Coercion: NOT `z.coerce.boolean()`** — it turns the string `"false"` into `true` (any non-empty string is truthy). The house pattern is `teachersQuery.archived`: `z.enum(["true", "false"]).optional().transform((v) => v === "true")` — `"false"`, absent, and anything else (`"1"`, `"yes"` ⇒ 400) are off. Absent/false ⇒ **byte-for-byte today's response** (pinned: the DTO gains no key, the query the same list). 🚫 No migration (35 = 35); `SLOT_INACTIVE_STATUSES`, the index, availability, the rentals and `courseLast` reads untouched.

🔴 **Correction 1 — `cancelReason` does NOT ride the booking DTO today.** `toBookingDTO` carries `status` and `note` but never `cancelReason` (nor `extendedFromId`). Per your line *"if stripped, add them, nothing else"*: **`cancelReason: string | null` is added to the DTO — for every reader, always present, `null` on a live row.** That is a new key on the default path too, so "byte-for-byte" is true of the ROWS and the filter, and one nullable key wider on every booking — say if you want it only when the flag is on; I do not think a second DTO shape is worth one null.

🔴 **Correction 2 — a cancelled row can SHARE A CELL with the live booking that replaced it.** The grid is one booking per `date|teacher|startTime`; cancelling frees the slot (`SLOT_INACTIVE_STATUSES`), so the admin rebooks it — and with the flag on, both rows land on one key. Today's overlap rule knows only `SICK_LEAVE` vs live. **Decision, built: precedence LIVE > `SICK_LEAVE` > `CANCELLED` — a cancelled row never displaces anything and anything displaces it.** So a cancelled session whose slot was rebooked is NOT on the grid even with the flag on; the live class is what the admin needs to see in that cell. *The alternative — a `cancelled: []` array per slot beside `booking` — shows every struck row under the live one but is a new grid shape for @Fern; one word and I switch.* Two cancelled rows on one free key: the first read wins (no order is defined between them) — display only, so no fact is lost, the modal has each.

🔑 **Subtract, not branch — one list, one query:** `calendarHiddenStatuses(includeCancelled)` beside the constant in `schema.ts`: the named list minus `CANCELLED` when on, the list itself when off; the query is `notInArray(b.status, hidden)`. TASK-260's pin (`booking-pause.test.ts:91`) asserts the old literal — rewritten to the new one, still refusing a hand-written `ne(status, "CANCELLED")`; a reversal named, not a pin deleted.

📌 **Your question — what links a cancelled original to its make-up:** `bookings.extended_from_id` (make-up → original) exists in the schema and **does not ride the DTO**. With the flag on the admin sees the struck original and the live make-up as two unrelated cells. Not built (your line: say whether it rides).

▶️ Building now.

---

# 📤 REPORT — @Jason → @Sober (2026-09-16)

✅ **DONE (code), against §3 as confirmed.** **2199 pass / 0 fail**, **178 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**.

## §4 What was built
- `validation.ts`: `calendarQuery.includeCancelled` = `z.enum(["true","false"]).optional().transform(v => v === "true")` — the `archived` pattern. `"false"` and absent ⇒ off; `"1"`, `"yes"`, `""` ⇒ 400.
- `schema.ts`: **`calendarHiddenStatuses(includeCancelled)`** beside the constant — the named list minus `CANCELLED` when on, the list itself when off. `PAUSED` hidden on both.
- `scheduler.service.ts` `getCalendar`: `const hidden = calendarHiddenStatuses(input.includeCancelled ?? false)` once, the ONE `notInArray(b.status, hidden)` — no second query, no ternary on the flag (pinned). The cell rule is now **`cellRank`** (`lib/calendar-cell.ts`, pure): LIVE 2 > SICK_LEAVE 1 > CANCELLED 0, `if (!cur || cellRank(dto.status) > cellRank(cur.status))` — the UC-004 leave-vs-live outcome is byte-for-byte the old one (live displaces leave; leave never displaces live; equal ranks keep the first), pinned in both directions.
- `mappers.ts`: **`cancelReason: b.cancelReason ?? null`** on every booking DTO (it did not ride before).
- 🔻 **Two TASK-260 pins rewritten, named:** `booking-pause.test.ts` asserted the literal `notInArray(b.status, [...CALENDAR_HIDDEN_STATUSES])` → now asserts `notInArray(b.status, hidden)` + the `hidden` line, still refusing a hand-written `ne`; and the literal `cur.status === "SICK_LEAVE"` ("the overlap rule, untouched") → asserts the `cellRank` comparison ("extended, not removed"), with the leave-vs-live claim pinned by values in the new file.

## §5 Pinned (`lib/calendar-cell.test.ts`, 15 tests)
- **The flag with values:** `"true"` on · **`"false"` OFF** · absent off · `"1"`/`"yes"`/`""` refused · the source has no `coerce`.
- **The list:** off = the named list; on = `["PAUSED"]`; `SLOT_INACTIVE_STATUSES` untouched (the four-value literal) — cancelling still frees the slot.
- **The cell in both read orders:** cancelled yields to live and to leave; live displaces leave; leave never displaces live; equal ranks keep the first; every non-leave, non-cancel status is LIVE for the cell.
- **The DTO:** a cancelled row carries `status`, `cancelReason`, `note`, and `courseLast: false`; a live row's `cancelReason` is `null`.
- **The wiring:** `hidden` once, one `notInArray`, one `findMany`, no ternary on the flag, no hand-written `ne`; the `cellRank` line; the route passes the validated query; the calendar read never touches `SLOT_INACTIVE_STATUSES`.

## §6 🔑 Mutation — six, `finally`, checksum — all bite
A `z.coerce.boolean()` (`"false"` becomes true — 3 fail) · B the subtraction drops `PAUSED` too (the tray leaks onto the grid — 1) · C the flag ignored, cancelled always shown (the default path changes — 2, one of them TASK-260's own AC-1 pin) · D a cancelled row ranked live (displaces its replacement — 2) · E a leave ranked live (UC-004 regresses — 2) · F `cancelReason` stripped again (1). Every restore byte-identical.

## §7 ❓ The owner's-list question — answered in §3, nothing built
`extended_from_id` (make-up → original) exists on `bookings` and does not ride the DTO; with the flag on, the struck original and its live make-up are two unrelated cells. If the owner wants the link drawn, it is one nullable key on the DTO (`extendedFromId`) — say so.

---

## §8 🔴 RE-SHAPE (owner, `REQ-089 §5.1`, 2026-09-16) — a separate cancelled TRAY, not struck rows on the grid
The owner wants the cancelled sessions in **their own box beside the PAUSED tray**, never on the grid. ⇒ **your named alternative, at the top level:** with `includeCancelled=true` the calendar response gains **`cancelled: BookingDTO[]`** — EVERY `CANCELLED` row in the range (with `status`, `cancelReason`, `note`), in date/time order — **and the grid rows are exactly today's** (the hidden list is the constant again; `cellRank` and the LIVE > leave > CANCELLED precedence come OUT — a cancelled row no longer enters the cell map, so nothing is lost to a rebooked slot). Absent/false ⇒ no `cancelled` key (or `[]` — say which; the FE reads `?? []`). Rewrite the TASK-260 pins back toward the literal where the subtraction is gone; keep the flag's coercion pins. **XS. Report the new count; the contract line for @Fern is the sentence above.**

---

# 📤 REPORT (§8 re-shape) — @Jason → @Sober (2026-09-16)

✅ **DONE (code) — the cancelled TRAY, as the owner shaped it (`§5.1`).** **2213 pass / 0 fail**, **179 files** · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)**. *(2215 → 2213: the six cell-rule tests went out with `cellRank`; the tray's tests and TASK-370's byte-freeze came in.)*

## §9 What changed
- **The grid is exactly today's.** `notInArray(b.status, [...CALENDAR_HIDDEN_STATUSES])` — the constant, byte for byte; the UC-004 overlap literal back (`cur.status === "SICK_LEAVE"`); **`calendarHiddenStatuses` deleted from `schema.ts`, `lib/calendar-cell.ts` and its test deleted, `cellRank` gone.** A cancelled row never enters the cell map, so nothing is lost to a rebooked slot — the concern that forced the precedence rule no longer exists.
- **The tray:** `includeCancelled=true` ⇒ a SEPARATE read after the grid is built — every `CANCELLED` row in the same range, `orderBy date, startTime`, full `withBookingRelations`, its own rentals read, mapped by the same `toBookingDTO` (`status`, `cancelReason`, `note` ride; `courseLast` false by construction) — returned as **top-level `cancelled: BookingDTO[]`**. No `pendingSlot` filter: the tray is a list, not a grid.
- **Absent/false ⇒ NO `cancelled` key** (`...(cancelled ? { cancelled } : {})`) — today's response byte for byte; the FE reads `?? []`. Asked for ⇒ the key is present, `[]` when the range has none.
- 🔻 **The two TASK-260 pins go back to their literals** with a sentence that the subtraction existed and was ruled out — a pin that says why the literal is the literal.
- `cancelReason` on every DTO and the flag's coercion (`"false"` off) stay from the reviewed build.

## §10 Pinned (`lib/calendar-cancelled-tray-req089.test.ts`, 13 tests)
the flag (`"false"` OFF, junk 400, no `coerce`) · the DTO's cancelled shape · **the grid:** the constant literal, no `calendarHiddenStatuses`/`cellRank`/`hidden` in `getCalendar`, the UC-004 literal, the tray read is AFTER `idx.set` and never touches `idx` · **the tray:** the exact `where`, the `orderBy`, the relations, no `pendingSlot`, its own rentals, no `courseLast`, the key absent unless asked · the route.

## §11 🔑 Mutation — six, `finally`, checksum — all bite, one only after I fixed MY test
A CANCELLED subtracted from the grid's list (the tray leaks onto the grid — 2 fail, one of them TASK-260's own AC-1) · **B the flag ignored, the tray always sent — PASSED with 49 tests instead of 53:** my `region()` calls sat at `describe` level, so a moved anchor THREW before any test registered and the whole block vanished as "0 fail". 🔻 **Rewritten: every region is a lazy function called inside its test, so a moved anchor is a FAIL** — B now 3 fail; the sentence is in the test file so the next region is written lazily too · C the range forgotten (1) · D unordered (1) · E `[]` instead of absent when off (1) · F an approved TASK-370 stamp drifts by one byte (2, the byte-freeze). Every restore byte-identical.

📌 **The contract line for @Fern:** *`GET /calendar?…&includeCancelled=true` ⇒ the response gains `cancelled: BookingDTO[]` — every CANCELLED row in range, date/time order, each with `status`, `cancelReason`, `note`; the grid is unchanged; without the flag the key is absent (read `?? []`).*
