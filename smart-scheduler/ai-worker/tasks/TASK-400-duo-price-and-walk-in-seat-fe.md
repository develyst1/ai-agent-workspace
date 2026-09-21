# TASK-400 — DUO prices on the course form + the walk-in seat door on a group, FE (`REQ-095` Stage 2b)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size S.** Builds against TASK-399's contract once CONFIRMED (I will paste the final lines here). ⏳ Pure parts now; wire after Jason's report. `sid`; a later `uat` deploy.

## §0 The contract — CONFIRMED 2026-09-19 (TASK-399)
- `GET /sellable-packages` gains the four `balance-duo` items (1h 1,900 · 4 6,800 · 6 9,360 · 10 14,200). **The group DTO gains `priceGroup`** (`"balance-duo"` | `"balance-group"`) — the course form inside a group shows the card for `group.priceGroup`; solo as today. **The FE never maps kind → price group and never holds a price.**
- Walk-in seat: `POST /api/bookings { bookingType: "SINGLE_SESSION", groupId, student, teacherId, date, startTime, subjectId, … }` — the existing single-session body + `groupId` ⇒ `201 { booking }` | `404 "ไม่พบกลุ่ม"` | `400 "คาบต้องใช้ครู/วัน/เวลาเดียวกับกลุ่ม"` | `409 GROUP_FULL` naming the date. The seat's price is the group's 1h tier, posted at ATTENDED like Private (server-side; nothing for the FE).

## §1
- **The course form inside a group** (TASK-398's locked `CreatePlanFlow` with `group`): the size choices and the "ราคาเต็ม" line come from the card for the GROUP's kind — DUO shows 4/6/10, Group shows 6/10. If the card endpoint is keyed by subject today, ask me (via the report) — the server may need to take `groupKind`; do not hardcode a price.
- **`Walk-in seat`** — a door on the GROUP row's details beside *Sell a course into this group*, by the existing single-session create key: the existing single-session form with teacher/date/time **locked to the group row**, `groupId` in the body; the 409/400/404 sentences are the server's. 🚫 No second single-session form.
- The roster shows a walk-in seat with a `1h` chip (from `courseId: null` on the seat) — one word, both languages.
- Snapshot unchanged (no new key). Copy counted.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (the walk-in body carries `groupId` and the locked three; the course form's sizes follow the card, not a constant) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **The course form inside a group prices by the GROUP's card (`group.priceGroup`, from the server); a `Walk-in seat` door on the group row through the EXISTING single-session form (locked + `groupId`); the `1h` chip on a walk-in seat.**

```
bunx tsc --noEmit → exit 0
bun test          →  446 pass / 0 fail   (was 442; +4 — new lib/scheduler/group-walkin.test.ts)
bun run build     → ok
git status        →  10 modified · 1 new
```
Built against §0 as confirmed (TASK-399, 2480/0). Snapshot unchanged (50 = 50). 🚫 No deploy asked.

- **The card is NOT keyed by subject only** — every package carries `priceGroup` (and its `subjects`), and the four
  `balance-duo` packages carry **no subject at all** (no program is priced as a DUO). So the solo readers
  (`courseSizesFor` / `packageFor`, by subject) cannot find them — which is exactly why two new pure readers exist:
  **`courseSizesForGroup(card, priceGroup)`** / **`packageForGroup`** pick the packages whose `priceGroup` is the
  group's **`priceGroup` from the DTO** (the 1h tier excluded from the course sizes; mutation 1 fails). Value-tested
  on a card fixture: DUO ⇒ 4/6/10, Group ⇒ 6/10, unknown ⇒ nothing. 🔴 **The FE never maps kind → price group and
  holds no price** (negatives on `sellable.ts` and the flow: no `DUO`, no `balance-*`, no four-digit number;
  mutation 2 fails). ⇒ **no BE change needed** for the card.
- **The course form inside a group** (`CreatePlanFlow` with `group`, TASK-398) reads the group's card: the size choices
  and the *ราคาเต็ม* line (and so the discount's base) come from `group.priceGroup`; solo stays by program, untouched
  (mutation 3 fails). The program picker stays — the course still names its program; only the price follows the group.
- **`Walk-in seat`** — a door on the GROUP row's details beside *Sell a course into this group*, by the existing
  **`calendar.book`** key (mutation 4 fails two tests) ⇒ the calendar opens **the SAME create form** (`openWalkIn`,
  the overbook door's shape) with a `groupSeat` on the slot: the tabs give way to one teal line (*"Walk-in seat into X —
  teacher, date and time are the group's; one session, paid like a private hour"*), the teacher and the time are
  locked (`disabled={!!walkIn}` ×2; the date is the slot's and never a control; mutation 5 fails), and **`groupId`
  rides in the body** — the service literal, single-session only (mutations 6 and 7 fail). 📌 One thing the door had
  to skip: the form's own pre-flight slot check (`detectConflict`) would find the GROUP row in that slot and block the
  create as "taken" — on a walk-in it is skipped and the server decides (`404` / `400` mismatch / `409 GROUP_FULL`,
  the sentences shown as is; mutation 8 fails). 🚫 No second single-session form (asserted).
- **The `1h` chip** on a roster seat with `courseId: null` (mutation 9 fails) — one word, both languages.
- Copy: `booking.*` +3 ×2.

### 🔑 Break-and-watch — ten mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the group reader lets the 1h tier in as a course size | **1 fail** |
| 2 | the FE maps kind → price group itself | **1 fail** |
| 3 | the form inside a group still prices by program | **1 fail** |
| 4 | the walk-in door ignores the key | **2 fail** |
| 5 | the time stays editable on a walk-in | **1 fail** |
| 6 | `groupId` leaves the wire | **1 fail** |
| 7 | `groupId` rides on every type | **1 fail** |
| 8 | the client's slot check runs on a walk-in | **1 fail** |
| 9 | the `1h` chip on every seat | **1 fail** |
| 10 | the door opens without the group | **1 fail** |
`md5` identical on all five mutated files. Two TASK-398 pins moved with the reason (the `group` prop gained
`priceGroup`; the "no `groupId` in the calendar partials" pin now allows the door on the content page and forbids a
filter); the sweep 77 → 78.

### ⚠️ Not seen on a screen
For @Tanya on `sid` (after `sale:ensure-items`): open a DUO row ⇒ *Sell a course* ⇒ the size box offers 4 · 6 · 10 with the
DUO prices (6,800 / 9,360 / 14,200), a Group row 6 · 10; *Walk-in seat* ⇒ the form shows one teal line, no tabs, greyed
teacher and time ⇒ pick a student and program ⇒ save ⇒ `Seats n+1/cap`, the roster row wears `1h`; a full group ⇒
`GROUP_FULL`'s sentence in the form; the seat's price posts at ATTENDED like a private hour (the ledger — QA's check).
