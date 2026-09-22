# SPEC-089 — `REQ-095 §13.4a` subject TYPE for DUO · `REQ-103` whole-voucher cancel — ANALYSIS + sizes (Sober, 2026-09-22). No build.

---
## Part A — `REQ-095 §13.4a` a subject TYPE, the DUO dropdown filtered by it

### §A0 What exists (the read)
- `subjects` = `id · name (unique) · active · price_group` (`schema.ts:290`). **`price_group` is already a data-driven category** ('bike-skate' | 'onewheel' | 'balance-private' | 'balance-group' | 'balance-duo'; NULL = not sellable) — and `balance-duo` is the DUO price line (TASK-399). There is NO name-prefix filter in either repo today (grep: none) — the DUO create's Program dropdown lists every subject; the DUO card is chosen by `priceGroupFor(true)` regardless of the subject. So §13.4 point 3 was never built as a word rule; §13.4a is the first filter.
- The two DUO subjects (Duo INLINE SKATE / Duo SURFSKATE) are not seeded in code (no `ensure-subjects`); they exist on `uat`/`sid` as data.

### §A1 Design — a `kind` column, not the price line
- **`subjects.kind text NOT NULL DEFAULT 'PRIVATE'`** (`0050`; CHECK ⇔ a closed `SUBJECT_KINDS = ['PRIVATE','DUO']`, NOT VALID + VALIDATE per the closed-set rule) — a category separate from money: `price_group` says what it COSTS, `kind` says what it IS (a future "Duo ONEWHEEL" may cost differently but is still a DUO program). Backoffice-clean: one column the backoffice's subject editor sets; nothing keyed on a name.
- **Seed:** `scripts/ensure-subjects.ts --dry-run|--apply` (the `ensure-sale-items` shape) upserts the two DUO subjects by name with `kind = DUO`, `price_group = balance-duo`; idempotent; the human runs it after `db:migrate`.
- **Filter:** the subject DTO carries `kind`; the DUO create's Program dropdown lists `kind === 'DUO'` only (FE, one predicate); the Private/course dropdown hides them — **owner decision A1** (recommend yes). **Server rule (recommend):** a DUO create with a non-DUO subject ⇒ `400 NOT_A_DUO_SUBJECT` (the FE filter is convenience, the server is the rule).
- 🚫 No change to pricing (`balance-duo` stays the DUO card's key), no RBAC change.

### §A2 Sizes
**BE S** (`0050` ⇒ 51 · the DTO field · the seed script · the server rule + pins) · **FE S** (the filter + `kind` on the subject type; no snapshot change). **Fold: yes** — inside the batch by the owner's gate; one migration.

### §A3 Owner decisions
1. Does the ordinary (Private) Program dropdown HIDE the DUO subjects? (recommend yes)
2. Should the server refuse a DUO course on a non-DUO subject? (recommend yes)

---
## Part B — `REQ-103` cancel a WHOLE voucher

### §B0 What exists (the read)
- A voucher = `vouchers { student · total_hours (5|10|15) · used_hours · expiry_date · source }` — **no status column, no end/drop columns, no cancel route**; routes: `GET /vouchers`, `POST /vouchers`, `POST /vouchers/import` only (`route-access.ts:137`). Its state is DERIVED: `remaining = total − used`, expired by date; the DTO (`mappers.ts:293`) carries `totalHours · usedHours · remaining · expiryDate · student`.
- Hours are consumed **at the day-end job** (`jobs.service.ts:105` `used_hours + 1` per attended draw) and returned on a single-row cancel/undo (`scheduler.service.ts:3476/3520`, REQ-100). So a FUTURE draw (PENDING/CONFIRMED on the schedule) has consumed nothing yet.
- **The whole-COURSE cancel** (`POST /courses/:id/cancel`, key `action:bookings.course-cancel`, `endCourse`): `ended_at · ended_by · end_reason` on the course (closed `END_REASONS`, CHECK `0023`), every future live session ⇒ `CANCELLED` with a fixed note, ONE `course_dropped_teacher` per coach (`cause: "ended"`) naming the CONFIRMED classes lost, a preview route (`/cancel/preview`) listing the doomed rows first. **No family notice** (the course end today).

### §B1 Design — the course-end shape, on the voucher
1. **`0051_voucher_end`:** `vouchers.ended_at timestamptz NULL · ended_by text NULL · end_reason text NULL` + CHECK ⇔ `END_REASONS` (NOT VALID + VALIDATE). No status column: `voucherStatus(v)` reads `ENDED` when `ended_at` is set (precedence over EXPIRED/EXHAUSTED, the course-status precedent), else as today.
2. **`POST /vouchers/:id/cancel { reasonCode, note? }`** + **`/cancel/preview`** (the course pair): one tx — every FUTURE live draw of the voucher (`voucher_id = :id AND status IN LIVE AND date ≥ today`) ⇒ `CANCELLED` (reason + a fixed note, holds reconciled); past/attended draws untouched (history; `used_hours` unchanged); the voucher stamped; ONE `course_dropped_teacher`-shaped notice per coach naming the CONFIRMED draws lost (`cause: "voucher_ended"` — the renderer's `Program` line reads the voucher; the same kind, a new cause value, no new bytes unless the owner wants voucher wording — decision B2). **The remaining balance is FROZEN, not zeroed** (`remaining` still reads N so the owner can convert/refund by hand outside the system — the customer said that is theirs); nothing may draw from an ENDED voucher (`assertVoucherUsable` in the booking creator ⇒ `409 VOUCHER_ENDED`; the Bookings-page editor hides the voucher's book door).
3. **Key:** reuse `action:bookings.course-cancel` — the other entitlement on the same page, the same people — **recommend reuse** (no 60th key; the label becomes `ยกเลิกคอร์ส/บัตรชั่วโมงทั้งใบ`) — decision B1; a new key `bookings.voucher-cancel` (60) if the owner wants them apart.
4. Reasons: the same closed `END_REASONS` (`PROGRAM_CHANGED · CUSTOMER_CANCELLED · ADMIN_ERROR · TEACHER_LEAVE`) — reused, no new set.
5. 🚫 No refund/conversion; no family notice (as the course end — decision B3); no change to REQ-100's single-draw cancel.

### §B2 Sizes
**BE S–M** (`0051` ⇒ 52 · the service pair · `voucherStatus` ENDED · the usable-assertion in the creator · the notice cause · pins) · **FE S** (the Cancel-voucher door + preview dialog on the voucher card, the ENDED chip, the book door hidden). **Fold: yes** (in the gate).

### §B3 Owner decisions
1. Key: reuse `bookings.course-cancel` (recommend) or a 60th `bookings.voucher-cancel`.
2. Coach notice: the course-end message with a voucher `Program` line (recommend; zero new bytes) or new wording.
3. Family: silent as the course end (recommend, consistent) or a notice (new bytes).
4. The frozen balance reads on the card as `ENDED · 7h left` (recommend) or hidden.
