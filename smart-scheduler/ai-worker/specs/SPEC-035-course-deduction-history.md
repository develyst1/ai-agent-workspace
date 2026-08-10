# SPEC-035 — Course deduction history (REQ-038 #5: ประวัติการตัดคอร์ส)

- Source: REQ-038 #5 (customer คุณปุ้ม, 2026-08-04) — the one genuine new build in the essential set 1–5.
- Status: DESIGN. Customer-essential; ships to the customer env after the REQ-030 set.
- Grounded in the `bookings` + `bo.movement` schema (read 2026-08-04).

## 1. The key finding — most of the history ALREADY exists as durable data (no new table for Tier 1)

Porter's question: does the data to reconstruct the history exist, or do we need an audit addition? **Answer: a
useful history is reconstructable from existing durable rows** — every deduction event leaves a permanent trace:

| Event | Durable source (exists today) |
|---|---|
| **Consumed** (attended) | an `ATTENDED` booking + its `date`; `usedSessions` |
| **No-show** (forfeit) | a `NO_SHOW` booking + `date` |
| **Cancelled** (re-owed) | a `CANCELLED` booking + `note` (the reason) + `updatedAt` (when) |
| **Sick-leave** (excused) | a `SICK_LEAVE` booking + `note` + `leaveUsed` |
| **Re-owed makeup** | an `EXTENDED` booking, `extendedFromId` → **which absence it replaces** |
| **Extra paid session** | a `SINGLE_SESSION` booking with this `courseId` (REQ-037) |
| **Freelance money drawn / refunded** | the **`bo.movement` ledger** — `refId=bookingId`, signed `qty`, `valueMinor`, `reason`, **`createdAt`** (a durable, timestamped ledger, indexed) |

So the "when + what + reason" of every consumption/cancellation/re-owe/extra is recoverable. **Tier 1 needs no
migration** — it's a read-only projection.

⚠️ **Two honest limits (state them on screen — don't imply a precision we don't have):**
1. **"Who" is not recorded** — one shared login today (the separate-logins gap flagged across REQ-031/105). The
   history shows *what + when + why*, not *who*. "Who" arrives with separate logins, not here.
2. **Intermediate transitions of a single booking are lost** — `bookings` stores only the **current** status +
   `updatedAt`, so a session that went CONFIRMED→SICK_LEAVE→ATTENDED shows its *current* state + last-change time,
   not every hop. A full hop-by-hop log needs Tier 2.

## 2. Tier 1 (recommended — ships to the customer now, no migration)

**`GET /courses/:id/history`** → a read-only, chronological timeline built from the course's bookings + the
`bo.movement` entries for those bookings. Each event: `{ at, kind, sessionDate?, status, teacher?, subject?,
reason?, makeupOfDate?, valueMinor? }`, ordered by `at`. Plus a header summary: `size · usedSessions · leaveUsed ·
remaining · liveEndDate`. Kinds derive from status/bookingType/`extendedFromId`/movement:
- `attended` / `no-show` / `cancelled(reason)` / `sick-leave(reason)` / `makeup-appended(of: <absence date>)` /
  `extra-session-added` / `freelance-drawn` / `freelance-refunded`.
- **FE:** a read-only "ประวัติการตัดคอร์ส" panel/tab on the course card (beside the plan) — a timeline list with a
  clear note that *who* isn't tracked yet. (Voucher gets the same shape from its bookings + hours movements — an easy
  extension; do course first.)

This answers the customer's ask — a history of what was consumed / cancelled / re-owed / extra-added, with **when +
reason** — from data we already keep.

## 3. Tier 2 (OPTIONAL — only if the owner wants the full hop-by-hop log; a migration)

A small append-only **`booking_events`** table — one row per status change: `{ bookingId, from, to, reason,
actor?, at }`, written wherever `updateBookingStatus` mutates status. Adds the intermediate-transition history a
single `updatedAt` can't hold. `actor` stays null until separate logins exist.
- **Recommendation: DEFER.** Tier 1 covers the stated need; Tier 2 is for a flip-flop-level audit the customer
  hasn't asked for. Add it only on an explicit "we need every transition, and who." @Porter routes if wanted.

## 4. Open items (@Porter → owner, non-blocking)
1. **Tier 1 vs Tier 1+2** — I recommend Tier 1 for the customer deploy (no migration, covers the ask). Confirm the
   owner doesn't need the hop-by-hop log now.
2. **"Who" gap** — acceptable to ship the history without an actor (shared login)? It's the same separate-logins
   prerequisite; the history just won't name a person until then.
3. **Voucher history** — course first; extend to voucher if the customer wants it (same shape).

## 5. Tasks (Tier 1 — cut on the Tier-1/2 confirm)
- **BE TASK-119** — `GET /courses/:id/history`: build the timeline from the course's bookings (all statuses) + the
  `bo.movement` entries (`refId` ∈ those bookings), derive `kind`, order by `at`, + the header summary. Read-only,
  **no migration**. Tests: an attended/sick-leave/makeup/cancel/extra course produces the expected ordered events.
- **FE TASK-120** — a read-only "ประวัติการตัดคอร์ส" timeline on the course card (with the "who not tracked yet" note).
