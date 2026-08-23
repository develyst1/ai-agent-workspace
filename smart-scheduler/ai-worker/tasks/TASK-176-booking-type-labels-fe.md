# TASK-176: Rename booking-type labels to `1st Trial` / `1 HR` (REQ-067 Part A) (FE)

- Source: REQ-067 Part A. MEDIUM — labels only, but read on every booking. Behind REQ-069/067B in the queue.
- Status: TODO → @Fern (FE)
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
