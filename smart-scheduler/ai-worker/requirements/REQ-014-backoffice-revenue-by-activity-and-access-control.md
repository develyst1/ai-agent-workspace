# REQ-014: Backoffice — revenue by activity + per-customer spend (executive-only by system, no new roles)
- Status: READY_FOR_SA  (⚠️ CLARIFIED 2026-07-29 — the "RBAC" question dissolved; see below)
- Priority: MEDIUM
- Requested: 2026-07-25 meeting (คุณกุ้ง) → relayed + clarified by stakeholder 2026-07-29
- Deadline: none
- Source: `smart-scheduler-requirement/20260725-{meeting,todo}.md` (Dashboard §5, §6 + access-control note).

## Problem / Goal
The customer wants **revenue split by sport/activity** and **per-customer spend history** — both financial, kept
on the **backoffice** (not the frontoffice), and visible only to **executive** level.

## ⚠️ Access-control clarification (stakeholder, 2026-07-29 — supersedes the earlier "build RBAC" reading)
There is **NO new role/RBAC system to build.** Access is already separated **by system**:
- The **backoffice login credential IS the executive's** — **only executive-level people access the backoffice.**
- **Front staff work only on the frontoffice** (calendar/bookings/…) and have **no backoffice login.**
So "finance data = executive-only" is satisfied simply by **keeping this data on the backoffice** (already
executive-only). Porter over-thought this earlier — corrected.

## Requirement
1. **Revenue by activity** — the backoffice shows **monthly total sales split by sport type** (e.g. of ฿100:
   bike ฿80, skate ฿10 …).
2. **Per-customer spend / history** — the backoffice shows each customer's **course/booking history** and
   **total spend**.
3. **Access:** both live on the **backoffice**, which is already executive-only (no new role code needed).

## Acceptance Criteria
- [ ] Backoffice shows monthly revenue broken down by sport/activity.
- [ ] Backoffice shows per-customer spend + course history.
- [ ] These are on the backoffice only (not exposed on the frontoffice) — access = the existing backoffice login.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- **Access control = ALREADY SATISFIED** by the frontoffice/backoffice split (backoffice = executive-only login,
  REQ-002). **Not new work.**
- **Monthly revenue total:** HAVE (`bo.movement` INCOME `valueMinor`). **Split by sport:** ⚠️ PARTIAL — sales are
  posted by product code (`course-{size}`/`voucher-{hours}`/trial) and the movement carries **no subject/sport**;
  prices live only in `bo.item`. Splitting by sport needs the **sale tagged with the subject** or an indirect
  join `bo.movement.refId → course/voucher/booking → subjectId`.
- **Per-customer spend:** PARTIAL — course/booking **counts** easy (`public` by studentId); **THB spend** needs
  the finance join (`bo.movement`/`accounts` back to the student).

## Constraints
- Keep money on the backoffice (per the meeting). Do NOT build a new multi-role system — the system-level split
  already provides "executive-only". HOW to attach sport to a sale is the SA's design.

## Out of Scope
- The frontoffice SOM dashboard (REQ-013).
- Any new role/permission model (explicitly not needed).

## Questions
(SA Lead + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`, don't guess.)
- ~~RBAC role model / what's gated~~ — **RESOLVED 2026-07-29:** no new roles; backoffice = executive-only by
  system separation.
- **Revenue-by-sport method** (SA design): tag each sale with its sport going forward (cleanest; past untagged
  sales split best-effort via the indirect join), or maintain per-subject income items? SA to pick.
