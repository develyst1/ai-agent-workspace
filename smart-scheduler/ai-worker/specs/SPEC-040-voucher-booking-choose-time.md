# SPEC-040: Voucher booking must let staff choose the session time
- Source: REQ-048
- Status: ACTIVE

## Overview
FE-only, one file. On the New-booking modal
(`smart-scheduler-front/src/components/partials/Calendar/Modal/BookingModal.tsx`, `CreateForm`) the
**voucher** branch does not render a time control — it shows a read-only `<Alert>` (`booking.voucherNoSlot`,
~L870-878) and the payload's `startTime` is wired to the clicked cell (`createSlot.time`, ~L686), with
validity keyed off `createSlot.time` (~L677). So the time is pinned to whatever row staff clicked;
"09:00" is just the row the owner clicked. This is a **missing field**, not a hardcoded default — the
same class of gap SPEC-026 fixed for the voucher *subject*.

**Fix:** render the same time `<Select>` the course/trial branches already use, bound to the existing
`startTime`/`setStartTime` state, and read `startTime` in the voucher payload + validity. **No backend
change** — `POST /bookings` already accepts any in-schema `HH:mm` `startTime` for a voucher
(`validation.ts` `TIME` regex; `insertBooking` writes it verbatim; the 09:00–18:00 window is a
FE-grid concern, enforced only by the `TIME_SLOTS`-backed `<Select>`, not the API).

## Interface / component design (FE)
In the `isVoucher` branch of `CreateForm`:
- Replace the read-only time `<Alert>` (~L870-878) with the **same** time `<Select>` used by the course
  branch (~L891-898): `label={t("booking.time")}`, `data={TIME_SLOTS.map(...)}`, `value={startTime}`,
  `onChange={(v) => setStartTime(v ?? "")}`, `allowDeselect={false}`, `searchable`. Reuse the existing
  control — do not introduce a free-text time input (the `TIME_SLOTS` Select is what keeps voucher
  times inside the centre's 09:00–18:00 slots, since the BE doesn't enforce that window — answers
  Porter's Q2).
- Keep the informational line that a voucher has no teacher pick (the teacher stays the clicked column,
  `createSlot.teacherId`) — the domain rule is "voucher = cannot pick a **teacher**", not "cannot pick a
  time". Only the time becomes selectable.
- Voucher payload + validity now read the chosen `startTime`:
  - `startTime: createSlot.time` → `startTime` (~L686)
  - validity `!!createSlot.time` → `!!startTime` (~L677)
- `startTime` state already exists (`useState(createSlot.time)`, ~L572) and is reset in `changeTab`
  (~L646). SA note: seeding it to the clicked time is fine (staff can change it); a deliberate-empty
  start is optional and not required by the REQ — keep the seed for fewer clicks unless Fern finds it
  confusing.

## Data / API
None. No endpoint, schema, payload, or DB change. `insertBooking`/`prepareVoucherBooking` already write
an arbitrary in-schema time; clash protection (`SLOT_TAKEN` 409 + the FE `detect` pre-check) already
covers a chosen time landing on a taken slot — reuse the existing refusal wording, don't add a second.

## Flow
Voucher tab → pick eligible entitlement → pick program (SPEC-026, unchanged) → **pick the time** (new)
→ Save. Teacher = the clicked column (unchanged). A taken slot is refused with the existing
`SLOT_TAKEN` message.

## Non-functional
FE-only; `bunx tsc --noEmit` = 0; `bun run build` ok; FRONTEND-STANDARD applies (reuse the existing
Select — no new styling). Bilingual via existing `t("booking.time")`. Self-run `hallmark audit` before
REVIEW.

## Tasks
- **TASK-132 (FE, Fern)** — the change above. No dependency. (Touches the same file as TASK-131/REQ-043
  and TASK-133/REQ-044 — see Tasks note there; sequence to avoid merge churn.)

## Questions
(Fern asks here; Sober answers as `> answer: ...`.)
- Porter's **Q2 (voucher time free vs restricted to slots)** is answered in-spec: use the existing
  `TIME_SLOTS` `<Select>`, so voucher times stay within 09:00–18:00 exactly like course/trial. If the
  owner later wants off-grid voucher times, that's a separate REQ (the BE already permits it).
