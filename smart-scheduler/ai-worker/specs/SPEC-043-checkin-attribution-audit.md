# SPEC-043: Check-in attribution — audit + proposed fix scope
- Source: REQ-050 ("audit first, then fix")
- Status: DRAFT (audit complete; fix scope proposed — two decisions routed to owner before tasks are cut)

## Audit result (grounded) — the main worry is a NON-issue
**The primary LINE and QR check-in flows already attribute to the right child + right session.** The
owner's fear (a multi-child parent's check-in lands on the wrong child) does **not** happen on the
paths staff/parents actually use:

- **LINE button/postback flow (the primary path):** `doCheckin` (`line-webhook.service.ts:232-238`)
  loads *all* the parent's CONFIRMED bookings today across *all* their children
  (`findTodayBookingsForParent`, `checkin.service.ts:75-91`); if exactly one → checks it in; if **>1 →
  a tappable picker**, one button per booking carrying that booking's own `id`. The tap →
  `doCheckinBooking` **re-fetches and matches by id** (an ownership check), then checks in *that* booking.
  Choice is carried by **id, not list position** — so a 2-child parent (AC-1) and a 1-child/2-session
  day (AC-2) are both disambiguated. No position-drift bug.
- **QR/token path:** the token is stored **per booking** (`bookings.checkinToken`) and looked up by
  token → identifies exactly one booking = one child + one slot. Inherently unambiguous. The FE success
  page already names student · subject · teacher · date · time (**AC-3-compliant on this path**).

**Investigation answers (REQ-050 Q1/Q2):** Q1 — the flow already asks / is id-keyed, not first-child.
Q2 — a definitive *historical* audit isn't possible from stored data: there is no record of "who the
parent meant" beyond the resulting ATTENDED row, so silent mis-attribution on the primary path is
structurally unlikely and not detectable after the fact. Worth telling the owner plainly.

## Three real gaps the audit DID find (ranked)
1. **🔴 Gap C — correctness (money/count): correcting a wrong check-in does not return the consumed
   session/hour.** `attend` increments `coursePackages.usedSessions` / `vouchers.usedHours`
   (`scheduler.service.ts:1731/1738`); **there is no decrement anywhere** (sole writers). When staff
   cancel an ATTENDED booking to correct it, the freelance draw is released and a course re-owes a
   make-up, but the **used counter is not rolled back** — for a **voucher** the hour stays consumed with
   no make-up mechanism. This is a genuine defect and the one with money impact (AC-5).
2. **🟠 Gap A — `qr` keyword silently picks the first child.** `handleParentCommand` (`:354-363`): typing
   `qr`/`คิวอาร์` returns a QR link for `today[0]` only. It writes no attendance (just shows a link), so
   no wrong record — but a 2-child parent can only ever reach child #1's QR. Violates requirement 5
   ("every path obeys 1–3").
3. **🟡 AC-3 thin LINE copy + Gap B.** The LINE picker label + `checkin_ok` name only `name + time` (no
   date/teacher/program), vs the REQ's `{time} · ครู{teacher} · {program}`. And the numeric keyword
   `เช็คอิน N` (`:367-373`) is typed-number selection (REQ-015 prefers taps).

## Proposed fix scope (tasks NOT cut yet — two owner decisions first)
- **Forward-safe, no owner input needed** (would become BE tasks in `line-webhook.service.ts` +
  `line-reply.ts` + `line-i18n.ts`): make the `qr` keyword use the same picker when >1 (Gap A); enrich
  the check-in picker label + `checkin_ok` to date·time·teacher·program (AC-3); optionally convert the
  numeric keyword to taps (Gap B).
- **🛑 Needs a decision before I cut the task:**
  1. **Gap C money semantics (→ Porter/owner + money side):** confirm that correcting/cancelling an
     ATTENDED booking should **return** the `usedSessions` / `usedHours` it consumed (almost certainly
     yes, but it's a ledger/money-model call, and the fix must land in the same transaction as the
     existing freelance reconcile, `scheduler.service.ts:1742-1773`). This is the highest-value fix.
  2. **REQ-050 Q3 (→ owner):** whether **historical** wrong check-ins (if any) are corrected/annotated —
     this decides whether Gap C also needs a one-time back-fill in addition to the forward release logic.

## Recommendation to Porter
Lead with the good news (primary flow is correct — no wrong-child bug where it counts). Then get the
owner's call on Gap C (return the hour on correction — the real defect) and Q3 (historical). On the go,
I cut: TASK for Gap C (BE correctness, the priority), TASK for Gap A + AC-3 copy (BE LINE UX). Gap B is
opportunistic.

## Non-functional / notes
All fixes are BE (LINE + scheduler.service); FE token page already AC-3-compliant. Any counter-release
change is transactional and needs unit tests (attend→correct→counter restored; voucher hour restored).

## Questions
(Porter/owner decisions above. Fern/Jason: none until tasks are cut.)
