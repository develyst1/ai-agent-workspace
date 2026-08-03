# TEST-027: Price-card product rules — sellable-size enforcement + migration outcome
- Source REQ: REQ-027 **part (a) only** (+ the 0016/0017 migration outcome, Round 1 item 1)
- Status: TEST_PASSED (for the scope below — **not** all of REQ-027)
- Environments: dev-server (`sid` = som.develyst.online), API level
- Tested: 2026-08-02 by Tanya

> ⚠️ **Scope / traceability note — read before trusting the status.** REQ-027 is `READY_FOR_SA` on the
> board (not yet specced or built). What this round verifies is **already live on `sid`** because it arrived
> via the **per-program pricing work (TASK-077 + migrations 0016/0017)**, which happens to satisfy REQ-027's
> **part (a)** ("a program may only be sold sizes it offers"). Porter scoped Round 1 item 2 to exactly that
> ("sellable combinations only"). **REQ-027 part (b) — "a voucher may not be spent on Onewheel or Balance
> Play" — is NOT built** (it's bound up with REQ-029's voucher-program-choice, also unbuilt), so it is out of
> scope here and REQ-027 as a whole is **not** passed. This TEST proves the migration + the size rule; it does
> not close the REQ.

## Scope

Covers two things Porter put at the top of Round 1:
1. **The migration outcome** (0016 backfills `subjects.price_group` by exact name; 0017 pricing) — every
   named subject present and priced, and the pages that died in both outages load.
2. **REQ-027 sellable-combination enforcement** — that the API, not just the dropdown, refuses a
   (program, size) that isn't on the price card.

Does **not** cover the painted FE dropdown itself (that a forbidden option is hidden in the browser) — that
is a separate FE round. Per Porter's own guidance, *"the UI hiding a choice is convenience; the API refusing
it is the guarantee"* — this round tests the guarantee.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | Migration 0016 — all 8 named subjects have a price group | happy | `GET /sellable-packages`, list distinct priced subjects | 8: Bike/Scooter/Balance Cruiser · Surfskate · Freeskate · Skateboard · Inline Skate · Onewheel E-Skate · Balance Play (Private) · Balance Play (Group) | exactly those 8, each in a group | **PASS** |
| 2 | No named subject silently NULL after the name-match backfill | edge | read `unpricedSubjects` | only non-per-program subjects, if any | `["1st Trial"]` only — see Q1 | **PASS** (with a question) |
| 3 | bike-skate offers 4 / 6 / 10 | happy | `GET /sellable-packages` | 4,6,10 | 4→฿4,790 · 6→฿6,490 · 10→฿9,790 | **PASS** |
| 4 | Onewheel offers **no 10 h** | happy | as above | sizes without 10 | 1→฿1,690 · 4→฿5,790 · 6→฿7,990 (no 10) | **PASS** |
| 5 | Balance Play (Private) offers **no 4 h** | happy | as above | sizes without 4 | 1→฿1,390 · 6→฿7,490 · 10→฿11,390 (no 4) | **PASS** |
| 6 | Balance Play (Group) offers **no 4 h** | happy | as above | sizes without 4 | 1→฿1,090 · 6→฿5,290 · 10→฿7,790 (no 4) | **PASS** |
| 7 | **Server** refuses a forbidden combo (Onewheel size 10) | negative | `POST /courses` Onewheel size 10 | 400, nothing created | 400 "ไม่มีแพ็กเกจ 10 ชั่วโมงตามราคาที่กำหนด", refused before the DB tx | **PASS** |
| 8 | **Server** refuses a forbidden combo (Balance Private size 4) | negative | `POST /courses` Balance Private size 4 | 400, nothing created | 400 "ไม่มีแพ็กเกจ 4 ชั่วโมงตามราคาที่กำหนด" | **PASS** |
| 9 | Enforcement is combo-specific, not a blanket reject | control | `POST /courses` Onewheel size **6** (allowed) with a nonexistent student | a *different* failure (passes the sellable gate, fails later), rolls back | 400 "ข้อมูลอ้างอิงไม่ถูกต้อง" — different message ⇒ size 6 passed the gate | **PASS** |
| 10 | Core pages load after the schema changed under them twice | regression | `GET /calendar`, `/bookings`, `/teachers` | 200 | 200 / 200 / 200 | **PASS** |

## Defects

None.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| (none) | `sid` | ✅ All three `POST /courses` in cases 7–9 were **rejected** — two before the transaction, one rolled back. No course, booking, or revenue row written. Logged in `DEV-SERVER-FOOTPRINT.md`. Read via the shared staff account. |

## Verdict

`TEST_PASSED` **for the scoped part only** — the migration landed cleanly (8/8 subjects priced, no
name-mismatch NULL among them, core pages up) and REQ-027 **part (a)** (sellable sizes) is enforced
**server-side**, with combo-specific messages and no residue on a rejected sale. The forbidden combinations
Porter named (Onewheel-10, Balance-4) are refused by the API, and an allowed combination provably passes the
same gate.

**This does NOT close REQ-027.** Part (b) — voucher exclusion on Onewheel / Balance Play — is unbuilt and
untested; and the behaviour verified here shipped via TASK-077, not via a REQ-027 build. When Sober specs
REQ-027, part (a) may already be done on `sid`; that's intelligence for the spec, not a QA sign-off on the REQ.

## Questions

- **@Porter — Q1 (confirm, I don't think it's a defect):** the only subject with a NULL price group is
  **`1st Trial`**. That reads as *by design* — the trial is its own product with its own price, not one of the
  eight per-program-group programs, and `0016` only name-matches those eight. So its NULL is expected and the
  `unpricedSubjects` field is doing its job. **But it is a subject a staff member could pick when selling** —
  can a course/voucher be sold against `1st Trial`, and if someone tries, is refusing it (as cases 7–8 refuse
  the others) the intended behaviour? One line from you closes this from "expected" to "confirmed".
