# REQ-014: Backoffice — revenue by activity + per-customer spend (executive-only by system, no new roles)
- Status: READY_FOR_SA  (⚠️ CLARIFIED 2026-07-29 — the "RBAC" question dissolved; see below)
- Priority: MEDIUM
- Requested: 2026-07-25 meeting (คุณปุ้ม) → relayed + clarified by stakeholder 2026-07-29
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

---

## ✅ Access model RE-CONFIRMED with a harder fact (2026-08-01)

Porter re-checked this with the project owner after learning the backoffice has **one shared admin password**,
and the answer holds — **with a stronger reason than the one recorded on 2026-07-29**:

> **"ไม่ต้องแยกรหัส เขามีแค่คนเดียวที่เข้า backoffice ตอนนี้"**

- The backoffice has **one credential**, and **one person** using it today. The two people who will ever look at
  it are **คุณฟีน and คุณปุ้ม** (REQ-013/014's requester — the "พี่กุ้ง" of the meeting minutes, an AI
  transcription error corrected 2026-08-01).
- ⇒ **No per-user permissions, no roles, no second login. Nothing to build.** "Executive-only" is satisfied
  entirely by *which app the data lives in*, exactly as recorded on 2026-07-29.
- The system genuinely **cannot** distinguish users here, so any design that gates on *who is logged in* would be
  gating on a value that does not vary. If per-person access is ever wanted, **separate credentials are the
  prerequisite** and that is its own REQ — not a rider on this one.

📌 **Note for whoever reads this next:** this section adds no new decision. It exists because the "one shared
password" fact arrived later and is the sort of detail that makes people re-open a settled design; it is written
down so the question doesn't get asked a third time.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-014 | Backoffice — revenue by activity + per-customer spend (executive-only **by system**, no new roles) | MEDIUM | **SPEC_DONE** — build complete end to end | **@Porter — deploy + acceptance (backoffice only). COMPLETE 2026-08-01: TASK-064 ✅ · 065 ✅ · 066 ✅ · 067 ✅ · 068 ✅ · 083 ✅ · 084 ✅.** ⚠️ **Acceptance is one check:** open a real month and confirm the screen's own reconciliation — **buckets + unattributed = month total**, green badge — and that the reason amounts sum to the unattributed total. Both were only ever exercised against a stub. ⚠️ **And it can only report what was posted** — ฿0 until TASK-066 is deployed and `sale:ensure-items` has run, then forward-only. ✅ **REQ-014's remaining blocker is being closed by TASK-077** — per-program pricing makes the sale record the program, so revenue-by-sport becomes a **direct read of `external_ref`** instead of a join back through refId → course → bookings → subject. Better than SPEC-021's original design: a course sale's sport becomes known **at the moment of sale** rather than inferred later. I will rewrite SPEC-021's attribution to prefer the product code once TASK-077 lands, keeping the refId join only as a fallback for pre-rework sales. 🔐 **+ @Jason TASK-068: the P&L is readable with NO token** — every write in `bo.ts` is guarded, all reads are open, so this REQ's own access-control answer ("finance is executive-only because it lives on the backoffice") is **false at the API level**. Found by Jason while building TASK-064; the UI is not protection. _History:_ 🔴 **Jason blocked TASK-064 on a premise check and was right: no sale has been recorded since the REQ-006 rebuild (2026-07-28)** — `catalogRoutes` is mounted nowhere so `recordSale` 404s, and both call sites are `void recordSale(...)`, i.e. best-effort **by design**, so it failed with no voice. Built as specced the report would return **฿0 with the sum check PASSING** (0+0===0) — a green, empty, technically-correct revenue screen. **Two of the three breaks are MY errors:** (1) `bo.item.externalRef` never existed — I asserted a column from a function signature instead of opening the schema; (2) **"retroactive coverage over every historical sale" is NOT achievable** and I sold it as a reason to prefer the design — repair attributes sales **going forward only** — **@Porter correct this before คุณปุ้ม hears it.** → **TASK-066** (repair the write path, direct Drizzle like the freelance ceiling, + `external_ref` migration + the missing course/voucher INCOME items + **loud** failure logging) → **TASK-067** (8th digest check so it can never be silent again) → then TASK-064/065. SPEC-021 (2026-08-01). Design = **derive by joining, do NOT tag sales going forward and do NOT explode the item catalogue into per-subject income items**: every sale is a `bo.movement` `refType:"SALE"` whose **item product code** says what `refId` points at (`course-{size}`→course, `first-trial`/`single-session`→booking, `voucher-{hours}`→voucher), so **one attribution map** `(code, refId) → {studentId, subjectId or null}` answers **both** metrics — grouped by subject for revenue, by student for spend. **No migration, retroactive over every historical sale, nothing to keep in sync.** backoffice-back adds **read-only** `public` declarations (same DB since REQ-006; mirrors the direction REQ-006 already chose) — **it never writes or migrates `public`**. 🔴 **A voucher is structurally unattributable** (generic hours; its sessions may be different sports) ⇒ the report carries an explicit **`unattributed`** bucket and **`buckets + unattributed === total` is asserted by a test** — a finance report that silently drops what it cannot classify shows a tidy split that does not add up to the real month, and that is the number an executive acts on. ⚠️ **This delivers revenue by SPORT only — "ยอดตามสาขา / onsite-vs-online" remains structurally impossible** (REQ-021 finding 9: badges are on bookings, `bo.movement` has no badge link, no per-booking price) — @Porter please make sure that is not what คุณปุ้ม expects. **Method question answered without routing**; **one real finance question raised (non-blocking): when should voucher revenue belong to a sport?** — recognising it per session as consumed changes *when* revenue is recognised, which is คุณปุ้ม's call, not mine. _Porter's original:_ Sober — spec. **⚠️ RBAC DISSOLVED (stakeholder 2026-07-29): NO new role system** — the backoffice login **is** the executive's; only executives access the backoffice; front staff stay on the frontoffice → finance-on-backoffice = already executive-only (REQ-002). So REQ-014 = just **revenue-by-sport + per-customer spend on the backoffice**. Monthly revenue total HAVE; **split-by-sport PARTIAL** (sale carries no subject → SA tags sport on sales); per-customer spend PARTIAL (finance join). **No open business Q — UNBLOCKED.** |
```
