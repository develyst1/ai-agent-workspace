# SPEC-050: Walk-in QR check-in page (architecture + decisions to sign off before build)
- Source: REQ-051
- Status: DRAFT — the biggest item in the batch; **security/modeling decisions below need Porter/owner
  sign-off before build tasks are cut** (a public, no-login, money-touching, PII-exposing surface).

## What it is
A poster/QR at the counter → phone opens a **no-app, no-login** web page → the walk-in **identifies by
phone** → picks their child → checks in; and a walk-in **leave inside REQ-047's cut-off** becomes
`PENDING_APPROVAL` + admin notified + an on-the-spot admin-code fast path (outside the cut-off = a normal
leave). A pending request must **never silently become a leave, and never silently vanish** (AC-10).

## What already exists (reuse) vs what's genuinely new
**Reuse:** the current `/checkin?token=` page is already no-login (the token IS the credential,
`CheckinContent.tsx`) but it is **per-booking** — a counter poster carries no booking, so it is not reusable
as-is. Phone→parent→children→today's-sessions all exist as functions (`parent.service.ts` `findParentByPhone`,
`checkin.service.ts:75` `findTodayBookingsForParent`) — but gated behind LINE identity / JWT today. The
`override` bypass on sick-leave (the admin fast-path hook) exists. The **REQ-020 approval pattern**
(`teacher_link_requests` table + `LinkRequestsContent` UI + count badge) is a proven template to clone.

**Genuinely new (the real work + the risk):**
1. A **public phone-lookup endpoint** (`phone + today → sessions per child`) — exposing PII-adjacent data with
   no auth. This is the new attack surface.
2. A **public walk-in check-in** (consume a session by phone-resolved booking id, not a token).
3. A **public walk-in leave** that branches inside/outside the cut-off.
4. A **pending-leave model** (`PENDING_APPROVAL`).
5. A **rate-limiter** — 🔴 **none exists in the codebase** (grep: only LINE-client 429 handling). Net-new.
6. A **new public FE page** (phone → list → per-child actions), bilingual, 375px, ≥44px targets.
7. A **source tag** on bookings (AC-7 "source = walk-in").

## SA recommendations (the calls I'd make — Porter/owner confirm the security ones)
- **Pending-leave = a `walkin_leave_requests` table** (mirror `teacher_link_requests`: status
  PENDING/APPROVED/REJECTED, decidedAt/decidedBy, bookingId), **not** a new `booking_status` enum value.
  Why: an explicit request row satisfies "never silently vanish" (AC-10), reuses the whole REQ-020 approval
  UI/service, and keeps the booking-status enum clean. **My recommendation.**
- **Check-in identity:** reuse the **same early-window + idempotency guards** as the token path
  (`checkin.service.ts`), keyed by the phone-resolved booking id, so a walk-in can't double-consume (AC-5).
- **PII guard:** mirror the LINE precedent (`line-webhook.service.ts:175`, TASK-047) — **nicknames only, a
  neutral message that doesn't confirm/deny a number, never full names**. Non-negotiable on a public endpoint.
- **Source tag:** a small structured `bookings.source` column (`WALKIN` vs default), not a `note` convention.

## 🔴 Decisions that gate the build (Porter → owner; a public money/PII surface needs the risk signed off)
1. **Admin-code security.** The only "admin code" today is the **shared static `"229"`** (`LINE_ADMIN_VERIFY_CODE`).
   Exposing that on a public counter device to fast-approve leaves is **weak — guessable, shoulder-surfable**.
   Options: (a) a **distinct, rotating/short-lived** walk-in code, (b) restrict the fast-path to a
   **staff-authenticated device** (the counter tablet is logged in; the parent's phone is not), (c) accept the
   static code with the risk noted. **Recommend (b)** — the fast-path is a staff action; it doesn't need to
   live on the parent's unauthenticated phone. **Owner's risk call.**
2. **Rate-limit model (AC-6).** No limiter exists — this must be **built and specified**, not defaulted:
   per-IP **and** per-phone thresholds + lockout on the lookup + check-in + leave endpoints, to blunt
   phone-enumeration and paid-session abuse. Owner/Porter confirm the thresholds & lockout behaviour.
3. **Is a public no-login page that can *consume a paid session* acceptable at all**, or should walk-in
   **check-in** also require the staff counter device (and only the *identify+leave-request* be truly public)?
   This is the core risk posture. **Owner's call** — it changes the whole surface.
4. **Sequencing:** REQ-051's "inside the cut-off" reads REQ-047's configurable cut-off → **land TASK-146
   (SPEC-048) first**; REQ-051 then `getSetting`s it.

## Phasing (once the decisions land)
- **Phase 1 — identify + walk-in check-in** (the smaller, if decision #3 allows a public check-in): phone
  lookup (PII-guarded, rate-limited) + check-in by resolved booking id (reuse the window/idempotency guards).
- **Phase 2 — walk-in leave + pending-approval:** the `walkin_leave_requests` table, the inside/outside-cut-off
  branch, admin notify, the admin-code fast path (per decision #1), and the admin approval screen (clone
  REQ-020). Plus the AC-10 resolution rule so a never-approved request is closed by the UC-012 end-of-day path,
  never silently applied.

## Honest scope note
This is **materially larger** than any other item in this batch — a new public surface + a rate-limiter from
scratch + a pending-approval subsystem + an admin screen. It should be sized and scheduled as its own arc, not
slipped in beside the FE polish REQs. Recommend the owner also confirm **priority** given the size.

## Tasks
- **None cut yet — by design.** Build tasks (BE endpoints + table + limiter, FE public page, admin screen)
  are cut once decisions #1–#3 are signed off and Phase 1 vs 1+2 is set. The architecture above is build-ready
  the moment the risk posture is confirmed.

## Questions → Porter/owner
Decisions #1 (admin-code), #2 (rate-limit model), #3 (public check-in acceptable, or staff-device only), and
the priority/size confirmation. #4 (sequencing after REQ-047) is settled.
