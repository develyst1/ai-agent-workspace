# SPEC-069: Cancelling a booking must SAY when its revenue is already in the books

- Source: **Porter's ORDER, 2026-08-29** (owner's question *"what if the money already went in?"*). No REQ file — same
  shape as TASK-220 (Porter's order → SA cut). Porter owns whether this gets a REQ number.
- Status: **ACTIVE**
- Repos: `smart-scheduler-back` (the read + the endpoint) · `smart-scheduler-front` (the sentence in the cancel dialog)
- Tasks: **TASK-221** (BE) → **TASK-222** (FE, depends on 221)

## Overview

A `FIRST_TRIAL` / `SINGLE_SESSION` that was `ATTENDED` has its revenue posted by the day-end job. Cancelling it the
next morning fixes the schedule, releases the freelance hold and returns the quota — **and leaves the sale in the
books, silently.** This spec adds **one read and one sentence**: when the cancel dialog opens on a booking that
already has a posted sale, it says so, **with the amount**.

🔴 **No automation.** Nothing here reverses money, and no reversal control appears in the frontoffice — the same line
the owner has held twice (REQ-036, the `ADMIN_ERROR` course cancels). Reversal stays a backoffice act. What changes is
only that the system stops being **silent** about what it did.

## What I verified in the code first (not assumed)

| Claim | Verified at |
|---|---|
| The day-end sale is keyed `rev:<bookingId>` | `smart-scheduler-back/src/services/jobs.service.ts:140` |
| Only `FIRST_TRIAL` + `SINGLE_SESSION` post at day-end, and only when `ATTENDED` | `jobs.service.ts:107` |
| Course posts at sale (`course-sale:<courseId>`), voucher at sale (`voucher-sale:<voucherId>`) — **not** keyed by booking | `scheduler.service.ts:1399`, `:1743` |
| A discount rides the same sale as `discount:<refId>`, `valueMinor = −discountMinor`, `qty 0` | `lib/discount-plan.ts:98` |
| A sale movement's `valueMinor` is **positive** (`−qty × unit_price`, `qty` negative = OUT) | `lib/sale-post.ts:29`, backoffice `lib/bo-money.ts:17` |
| `scheduler-back` reads `bo.movement` / `bo.item` **directly on the shared DB** — no HTTP hop, no new client | `lib/sale-post.ts:84`, `db/schema.ts:191` |
| The precedent for a booking → movement read already exists (`bookingsWithRentals`) | `services/scheduler.service.ts:408` |

⚠️ And one thing that is **not** true, which changes the wording — see the Limitation below.

## 🔴 Limitation: we can prove "posted". We CANNOT prove "still posted".

A reversal is a manual admin movement: `POST /bo/items/:id/movements` with a positive `qty`. The backoffice UI sends
**`{ qty, reason, allowNegative }` only — no `refId`**
(`smart-scheduler-backoffice-front/src/services/bo.service.ts:58`). So a reversal is **not attributable to the booking
it undoes**. The consequences are not cosmetic:

- We can state a fact: *"a sale of ฿X was posted for this session on <date>"*. That is always true and provable.
- We **cannot** state *"the money is still in the books"*, and we must not imply it. If an admin already reversed it, a
  flat *"go and reverse it at the backoffice"* invites a **second** reversal — revenue below zero, the exact class of
  silent money bug this order exists to end.
- ⇒ the sentence reports **what was posted** and sends staff to **check** the backoffice. Wording in TASK-222 / Q2.

## Design decision — a read endpoint, not a DTO field (and why, since Porter wrote "no new endpoint")

Porter's *"no new endpoint, no reversal button"* is about **reversal**, and that holds absolutely: nothing here writes.
For the **read**, the two options are not equal, and Porter's own hard requirement decides it:

> ⚠️ *"If the lookup fails, fail loud — do not silently drop the warning. A missing warning is the whole defect."*

- **Rejected — `postedSaleMinor` on `toBookingDTO`** (the `hasRental` pattern). It cannot express *"I could not
  check"*: a failed lookup arrives as an absent amount, which renders as **no warning at all** — precisely the defect.
  It also puts a money read on the calendar's hot path (~90 bookings a week) to serve a dialog almost nobody opens.
- **Chosen — `GET /bookings/:id/posted-sale`, called when the cancel dialog opens.** Three states instead of two:
  `posted` · `none` · **`error` → the dialog says it could not verify**. Zero cost on the calendar. It is a *read*; it
  adds no way to move money. **@Porter — veto this if you meant "no new endpoint" literally**; the fallback is the DTO
  field, and it costs us the fail-loud requirement.

## API / Interface

```
GET /api/v1/bookings/:id/posted-sale        (same auth as its neighbours in routes/api.ts)

200 { "posted": null }
200 { "posted": {
        "amountMinor": 139000,        // NET satang: sale valueMinor + discount valueMinor
        "listMinor":   139000,        // the sale movement alone
        "discountMinor":     0,       // > 0 when a discount was posted with it
        "productCode": "first-trial", // bo.item.external_ref
        "postedAt": "2026-08-29T16:30:12.000Z"
      } }
5xx  → the FE renders the "could not verify" state. A thrown error is CORRECT here; do not swallow it.
```

**Detection is by key, never by type / status / date** (Porter's rule): look up `bo.movement` where
`idempotency_key = 'rev:<bookingId>'`, then its `discount:<bookingId>` sibling. A `VOUCHER` simply has no such row and
returns `null` **by construction** — no booking-type list to keep in sync anywhere. That is the point: the enumeration
lives in the key the posting job actually writes, so a fourth type that starts posting at day-end is covered the day it
starts, with no second list to remember.

**Money crosses the wire in satang** (`amountMinor`), converted **once** on the FE. This project has already shipped a
100× baht/satang defect (TASK-169, `lib/scheduler/discount.ts:11`); the conversion gets a test, not a convention.

## Flow

1. Staff open the `⋯` menu on a booking → **Cancel booking** → `CancelBookingDialog` opens.
2. The dialog fires the read for that booking id (for every type it can open on — see above).
3. `posted` present → a **warning band above the reason picker**, carrying the amount and the posting date.
   `posted: null` → the dialog is exactly as it is today.
   **error** → a warning band saying the posted amount could not be checked, and to check the backoffice.
4. The cancel itself is **unchanged**: same `PATCH /bookings/:id/status`, same required `reasonCode`.
   🔴 **The warning never blocks the cancel** — it is information, not a gate (Porter: a warning, not automation).

## Non-functional

- **Read-only.** No write, no movement, no new mutation path.
- One query per dialog open. No change to `getCalendar`, `toBookingDTO`, or any list path.
- No migration.

## Out of scope (named, so nobody has to guess)

- **Reversing** the revenue — backoffice, human, a finance decision.
- **Course / voucher** sales: posted at sale under `course-sale:` / `voucher-sale:`, not keyed by booking. Porter
  already called them "a different question".
- **Rentals attached to the session** — see Q1. The same silence, a different sale; not ordered, so not assumed.

## Tasks

- **TASK-221** — BE: the `rev:<bookingId>` lookup + `GET /bookings/:id/posted-sale` (depends on: —) → @Jason
- **TASK-222** — FE: the warning band in `CancelBookingDialog` (depends on: TASK-221) → @Fern

## Questions

**Q1 — @Porter: does an equipment RENTAL on the cancelled session belong in this warning?**
A rental posts the moment it is added and is keyed to the booking (`rental.service.ts:21`, `bookingsWithRentals`). So a
cancelled session can leave **rental** money in the books by exactly the mechanism the order describes — but a rental is
not a booking type and it posts at sale, so your "different question" line may or may not cover it. I have **not** built
it. The lookup is by `refId = bookingId` either way, so adding rentals later is a filter, not a redesign. Please decide
with the owner: ฿1,390 that stays visible while ฿300 of gear stays hidden is a half-answer.

**Q2 — @Porter: confirm the sentence, given we cannot detect an existing reversal.**
Your draft: *"คาบนี้ลงบัญชีไปแล้ว ฿1,390 — การยกเลิกนี้ไม่ได้ถอนเงินออก ต้องไปกลับรายการที่หลังบ้าน"*.
The first half is provable. The second half **instructs**, and if an admin already reversed it we would be asking for a
double reversal we cannot see. Proposed instead (TASK-222 carries it):

> *"คาบนี้ลงบัญชีขายไปแล้ว ฿1,390 เมื่อ 29/08/2026 — การยกเลิกนี้ไม่ถอนเงินออกจากบัญชี **กรุณาตรวจสอบและกลับรายการที่หลังบ้าน**"*

It adds the posting **date** (so staff can find the row) and turns "go reverse" into "check, then reverse".
**Owner's call on the exact Thai** — I will not re-word a customer-facing sentence without it.

**Q3 — @Porter (lower priority, for the record):** should the backoffice reversal form carry `refId`, so that a
reversal is attributable at all? Today it is not, which is the only reason Q2 exists. That is a backoffice REQ, not this
one — flagged so it is written down rather than rediscovered.
