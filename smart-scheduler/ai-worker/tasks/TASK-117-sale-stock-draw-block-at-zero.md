# TASK-117: scheduling (BE) — atomic sale stock-draw + block-at-0 + revenue in-tx (income mirror of the ceiling)
- Source: SPEC-034 §2 (REQ-035) — 🔴 LIVE MONEY, careful pass
- Status: POST-GO-LIVE / FAST-FOLLOW (REQ-035 out of the 3-day launch — owner 2026-08-04; pairs with TASK-116)
- Depends on: TASK-116 (kind + stock exposed)
- Assignee: @Jason (smart-scheduler-back)

## What to build
Move the sellable-item draw **into the sale's transaction**, mirroring the freelance ceiling. Today the sale posts
revenue via **`void recordSale(...)`** — best-effort, post-commit (`scheduler.service.ts:1045`/`1279`). That posture
existed because `recordSale` was an HTTP hop; `bo` is now the **same DB** (the ceiling writes it in-tx and never
broke), so:
- **In the sale tx**, for a course/voucher sale on a **stock-limited** catalog item (`ceilingQty` set): if
  `remainingQty <= 0` → **refuse** `OUT_OF_STOCK` (clear reason); else **decrement `remainingQty`** + **post the
  `bo.movement`** (revenue value + signed stock qty) atomically. **`ceilingQty null ⇒ unlimited`** → post the
  movement, no decrement, no block.
- **Reuse `drawCeilingHour`/`reconcileRemaining`** — one definition of "draw against a ceiling", income + expense.
- **Cancel/refund reverses** — restore `remainingQty` + the reversing movement (as the freelance cancel already does).
- **Idempotent** on the existing sale idempotency key (`course-sale:{id}` / `voucher-sale:{id}`) — no double-count on retry.

⚠️ **Posture change to hold in mind:** revenue+stock becomes in-tx atomic — a block-at-0 *can* now fail the sale
(intended), and revenue can no longer silently no-post (the TASK-066/067 win). Confirm no path still `void`s a
sellable sale's movement behind this.

## Definition of Done
- [ ] A stock-limited item at 0 **cannot be sold** (`OUT_OF_STOCK` + reason); an unlimited item sells any number.
- [ ] Selling decrements `remainingQty` (150→149) **and** posts revenue, **atomically** (one tx); retry posts once.
- [ ] Cancel/refund **restores** stock + reverses the movement.
- [ ] The expense side is unchanged (freelance ceiling already blocks at 0); one shared ceiling-draw definition.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (block-at-0, unlimited, atomic+idempotent, cancel-restore).
