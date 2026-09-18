# TASK-374 — Rental tier + remark on the course-creation form, and the two Deploy-A QA nits (`REQ-091` Deploy B, T4-FE) — FE

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-17)
**Contract (proposed to @Jason, TASK-373; confirmation reaches you through me):** `POST /courses { …, rental?: { code, remark? } }` — same remark rule (set + ride); the course DTO / plan response gains `rental: { code, remark } | null`; every session born with the course carries a PAID row (green `R` from day one); `409 RENTAL_EXISTS` on a per-session add to a rented course.
**Size S–M.** ⛔ Chain stopped. Ships with TASK-373 + TASK-375; A + B go to `uat` together.

---

## §1 The picker
- `CreatePlanFlow` — after the plan (dates/absences), before confirm: **`Equipment rental` (off by default)** ⇒ the same tier `Select` + remark as `RentalSection` (**one component/one options source — extract what you need from `RentalSection`, do not copy the five labels or the price join**). The confirm summary shows `Rent 200 / Full Set (…) × {size} sessions` — the print shape × the count, so the admin sees the money before the tap (the course sale's own confirm precedent).
- Send `rental` only when ON (asserted on the request shape); OFF ⇒ no key.
- The course card / plan view shows the course's rental line when `rental` is non-null.

## §2 The two QA nits from Deploy A (Tanya, `sid`) — fold in, cheap
- (a) **`Add rental` on a CANCELLED/PAUSED session** — hide the button when the booking's status is in the hidden set (the server still refuses; this is the honest UI; one predicate that reads `status`, mirroring the server's `rentalBookingLive` — say the two agree).
- (b) **The cancelled TRAY's compact row does not render the `R` chip** — add `RentalStamp` to the tray row (paid rentals survive a cancel and the admin should see the green there).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Picker: OFF ⇒ no `rental` key; ON ⇒ `{ code, remark? }`; summary line × size — asserted
- [ ] (a) hidden on cancelled/paused, shown on attended/live · (b) chip in the tray row — rendered assertions
- [ ] Keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Should a rented course's sessions show the green `R` at all (it is paid — nothing to collect), or only the unpaid red ones matter to the admin scanning for cash? Say what the grid looks like with 10 green `R`s; build as ruled (green shows).

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-17. **The whole-course rental on course creation (one picker, one options source), the summary × size, the course card's line — and the two Deploy-A nits folded in.**

```
bunx tsc --noEmit → exit 0
bun test          →  383 pass / 0 fail   (was 377; +6 — new lib/scheduler/course-rental.test.ts)
bun run build     → ok
git status        →  10 modified · 2 new (Rental/RentalTierPicker.tsx · lib/scheduler/course-rental.test.ts)
```
Built against @Jason's CONFIRMED contract (BE done, 2266/0): `POST /courses { …, rental?: { code, remark? } }`, the
remark rule the server's and refused BEFORE the course is written; the course DTO's `rental: { code, remark } | null`;
every live session born with a PAID row; `409 RENTAL_EXISTS` on a per-session add to a rented course; a resume's new
rows do not inherit (named by him, not built).

### `§1` — the picker
- **ONE picker, ONE options source — `Rental/RentalTierPicker.tsx`** (new): `useRentalPrices()` (the price join over
  the server's `rentalItems`, the same source `RentalModal` reads), `rentalPrintLine` (moved here; `RentalSection`
  re-exports it so TASK-372's pin still holds), and the `RentalTierPicker` component (the five-tier `Select` labelled
  `{tier} — {price}` + the remark field). **`RentalSection` now renders it instead of its own copy**; the five labels
  and the price join exist in exactly one file — asserted by absence in both callers (`RENTAL_CODES.map`,
  `rentalItems.find`, `rental.tierLabel` nowhere else); mutation 8 (a copied Select in the create flow) fails.
- **Where:** after the plan, before confirm — `PlanModal` (create mode) gained two slots, `createExtras` (rendered
  ABOVE the AC-1 preview line) and `createSummaryLine` (rendered UNDER it). `CreatePlanFlow` owns the state and fills
  them: a `Checkbox` **`Equipment rental for the whole course`** / **`เช่าอุปกรณ์ทั้งคอร์ส`**, OFF by default
  (mutation 1 fails), revealing the shared picker; and the summary **`Rent 200 / Full Set (inline skate size 18-19 CM)
  × 8 sessions`** — the customer's print shape × the count, so the admin sees the money before the tap (asserted;
  mutation 7 — the line without the count — fails).
- **The request:** the form sends `rental: rentalOn && rentalCode ? { code, remark: trimmed || undefined } :
  undefined`; the service maps `rental: input.rental ? { code, ...(remark ? { remark } : {}) } : undefined`. **OFF ⇒
  `undefined` ⇒ the key is ABSENT on the wire** — JSON drops it, exactly the mechanism `discount` and `absentWeeks`
  already rely on (asserted with a `JSON.stringify` round-trip beside the source pins); mutations 2 (sent when OFF)
  and 3 (`: {}` — an empty object on the wire) fail. 🚫 No remark rule on the create path — asserted by absence.
  📌 *The `wire-names` sweep (§A) caught my first cut* — a spread `...(rental ? {rental} : {})` hides the key from
  its top-level scan; rewritten to the `discount` pattern so the sweep sees `rental` as a forwarded key. The sweep
  proved its reach; nothing loosened.
- **The course card** (`CoursePackagePanel`): a `Rental: Rent 200 / Full Set (…)` line under the program when
  `c.rental` is non-null; the wire (`CourseSummary.rental?`), the view type, and `dtoToCourseView` (`?? null`,
  value-asserted) carry it. On the create's return and the list, as the contract says.

### `§2` — the two QA nits
- **(a) `Add rental` on a CANCELLED/PAUSED session** — hidden by **`canAdd = !OFF_CALENDAR_STATUSES.includes(status)`**:
  the ONE literal both grids already use for "off the calendar" (`CANCELLED · PAUSED`), which is exactly the
  complement of the server's `rentalBookingLive` (= not in `CALENDAR_HIDDEN_STATUSES`) — **the two agree by being
  the same two statuses**, asserted (`["CANCELLED","PAUSED"]`), and no second literal (`status === "…"`) appears
  (mutation 4 fails). An ATTENDED session still offers it, on both sides. An EXISTING row on a cancelled session is
  not gated — it still renders and can be marked paid (asserted; mutation 5 — always shown — fails).
- **(b) the tray row** — `RentalStamp size="sm"` beside the type chip in `PausedTray`'s row (both variants: a paused
  booking can carry a rental too). **Rendered-asserted on the cancelled variant:** a paid rental on a cancelled row ⇒
  green `R`; no row ⇒ no chip. Mutation 6 fails.
- Copy: **2 keys × 2** (`rental.courseToggle` · `rental.courseSummary`).

### 🔑 Break-and-watch — eight mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the toggle ON by default | **1 fail** |
| 2 | `rental` sent when OFF | **1 fail** |
| 3 | the service sends `rental: {}` when OFF | **1 fail** |
| 4 | a second status literal in the hide rule | **1 fail** |
| 5 | `Add rental` shown on every status | **1 fail** |
| 6 | the tray row drops the chip | **1 fail** |
| 7 | the summary without `× size` | **1 fail** |
| 8 | the create flow copies its own tier Select | **1 fail** |
`md5` identical on all mutated files (five in the batch run, the service in its own run — the batch's anchor for
#3 missed a doc comment and was re-cut; result recorded from the second run).

### Definition of Done
- [x] **383 / 0** · `tsc` 0 · build ok
- [x] Picker: OFF ⇒ no `rental` key; ON ⇒ `{ code, remark? }`; summary line × size — asserted
- [x] (a) hidden on cancelled/paused, shown on attended/live · (b) chip in the tray row — rendered assertions
- [x] Keys counted: 2 × 2
- [x] 🔑 Break-and-watch — eight, `finally`, checksum

### ⚠️ Not seen on a screen
The checkbox + picker inside the plan review modal above the preview line; the summary line's wrap on a narrow
modal with a long remark. For @Tanya via you on `sid` (after TASK-373's deploy): create a course with the toggle ON,
Full Set, no remark ⇒ the server's sentence before any course exists; with a remark ⇒ the course, every live
session green `R` on the grid, the course card's `Rental:` line; toggle OFF ⇒ the request carries no `rental`
(network tab); a per-session `Add rental` on that course ⇒ `RENTAL_EXISTS`; a cancelled session of it ⇒ the tray
row shows the green `R`, and its modal offers no `Add rental`.

## Question — **should a rented course's sessions show the green `R` at all, or only the unpaid red ones matter?** ⚠️ owner's list
**What the grid looks like, as ruled (green shows):** a rented 8- or 10-session course is ONE session per week, so
the "10 green `R`s" spread across ten week views — a single week view shows one green chip per rented course that
has a session that week. On a busy week with, say, six rented courses, that is six green chips among ~90 cells, each
on its own name row beside `Last`; the density that would hurt is "many rented courses", not "one course". **The
trade:** green is information (*this family paid for equipment — hand it over*) but it is not an action, whereas
red is the action (*collect*). If the admin's scan is for cash, every green chip is a chip they must read to
dismiss. **Built as ruled.** If the owner later prefers "red only", the cheapest lever is one line in `RentalStamp`
(render only when `!paid`) — or, keeping both, a `CellDisplay`-style toggle *"show paid rentals"* so the scan can
be narrowed per admin. Named, not built.
