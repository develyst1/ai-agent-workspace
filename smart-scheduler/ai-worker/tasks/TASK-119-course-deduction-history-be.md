# TASK-119: scheduling (BE) — course deduction history endpoint (read-only, no migration)
- Source: SPEC-035 (REQ-038 #5)
- Status: DONE ✅ (SA-reviewed 2026-08-04 — tsc 0, 5/5 tests reproduced; refType strings verified vs the real ledger writer)
- Depends on: — (reads existing bookings + `bo.movement`)
- Assignee: @Jason (smart-scheduler-back)

## What to build
**`GET /courses/:id/history`** — a read-only chronological timeline reconstructed from **existing durable data**
(no new table):
- The course's **bookings** (ALL statuses incl. CANCELLED/SICK_LEAVE/NO_SHOW/EXTENDED/SINGLE_SESSION), each an event:
  `date · status · teacher · subject · bookingType · note(reason) · extendedFromId(makeup-of) · updatedAt`.
- The **`bo.movement`** entries whose `refId` ∈ the course's bookings — the freelance draw/refund ledger:
  `qty · valueMinor · reason · createdAt`.
- Derive a `kind` per event (attended / no-show / cancelled / sick-leave / makeup-appended(of <date>) /
  extra-session-added / freelance-drawn / freelance-refunded); order by `at`.
- Header summary: `size · usedSessions · leaveUsed · remaining · liveEndDate`.

⚠️ **Two honest limits to encode (not hide):** no **actor** ("who" — shared login; leave null until separate logins),
and only the **current** status per booking is known (intermediate transitions aren't logged — that's Tier 2 / a
`booking_events` table, deferred).

## Definition of Done
- [ ] `GET /courses/:id/history` returns an ordered event timeline + the header summary; **read-only, no migration**.
- [ ] Events cover attended / sick-leave(+reason) / makeup(→ which absence) / cancel(+reason) / extra-session / the
      freelance draw+refund ledger — verified with a course that has each.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (the kind-derivation is the piece to unit-test).
