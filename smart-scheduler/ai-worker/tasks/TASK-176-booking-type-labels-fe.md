# TASK-176: Rename booking-type labels to `1st Trial` / `1 HR` (REQ-067 Part A) (FE)

- Source: REQ-067 Part A. MEDIUM — labels only, but read on every booking. Behind REQ-069/067B in the queue.
- Status: DONE (FE code — SA-reviewed Sober 2026-08-24). Rendered read-through rides @Tanya.

## Review — PASS ✅ (Sober 2026-08-24)
Reproduced: front tsc **0** · build ok · `bun test src/lib/scheduler/ src/services/` **40/0**. Four dictionary lines: `FIRST_TRIAL:"1st Trial"`, `SINGLE_SESSION:"1 HR"` in **both** dictionaries (Thai carries the English product names — AC-1, off the printed card, not translated). **AC-3 grep-verified:** every staff-facing surface renders through the `bookingType.*` key family (one definition per language), so four lines is the whole change; the only old-literal hits are a mock note + comments (not user-facing). **AC-2:** `FIRST_TRIAL`/`SINGLE_SESSION` values untouched — request-body tests still assert `bookingType` on the wire. **REQ-067 Part A code DONE.**
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**. Labels/i18n only.

## What to do
Rename the two booking-type tabs to the words on the customer's printed price card:
- `ทดลองเรียน` / `Trial` → **`1st Trial`**
- `จองรายครั้ง` / `Single session` → **`1 HR`**

- 🔴 **Labels ONLY (AC-2):** `bookingType` values (`FIRST_TRIAL` / `SINGLE_SESSION`), stored data, reports and sale
  codes are **untouched**. This is an i18n/label change, not a data-model change.
- **AC-1:** both read `1st Trial` and `1 HR` in **TH and EN** — they are product names on a printed card, **not
  translated** (Thai keeps `1st Trial` / `1 HR`).
- **AC-3:** the same two words **everywhere** these types are named to staff — tab, calendar legend, booking
  detail, REQ-052's type label, daily report. One vocabulary everywhere, or it's worse than before. Grep the repo
  for the old strings/keys so none is missed.

## Definition of Done
- [ ] Tabs + every staff-facing naming of the two types read `1st Trial` / `1 HR`, TH and EN (via `t(...)`, no raw key).
- [ ] `bookingType` values / stored data / reports / sale codes unchanged (AC-2) — verify nothing but display text moved.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok.

## Notes / Questions
(Fern fills in. AC-3 is the trap — the two words must reach the calendar legend, booking detail, REQ-052 label and
daily report too, not just the tab. A grep for the old labels/keys is the way to be sure.)

---

## Implementation Notes (Fern 2026-08-23)
**Four dictionary lines. Nothing else.**

`bookingType.FIRST_TRIAL` → **`1st Trial`**, `bookingType.SINGLE_SESSION` → **`1 HR`**, in **both** dictionaries —
**the Thai entries carry the same English strings on purpose (AC-1)**: they are product names off the customer's
printed card, not phrases to translate.

**AC-3 verified by grep before changing anything, not assumed:** every surface that names a booking type to staff
renders through the `bookingType.*` key family — `BookingTypeChip` (calendar cells, bookings table, booking detail),
the New-booking tabs, the bookings-table filter, and all three Overview/report call-sites. There is exactly **one**
definition of each label per language, so these four lines are the whole change. Also grepped the repo for the old
literal strings: the only hits are a mock note (`ทักมาทาง Line ขอทดลองเรียน` — a sentence, not a label) and two
source comments; neither is user-facing, so both stay.

**AC-2:** the `FIRST_TRIAL` / `SINGLE_SESSION` **values** are untouched — no data, report, sale code or payload
changed. Confirmed by the suite still passing, including the request-body tests that assert `bookingType` on the wire.

**Evidence:** `bunx tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40 pass / 0 fail**.
🔴 Rendered read-through → @Tanya (cheap to fold into any other pass): the two words should now read identically on
the tab, the calendar chip, the bookings table + its filter, and the Overview stats — in **both** languages.
