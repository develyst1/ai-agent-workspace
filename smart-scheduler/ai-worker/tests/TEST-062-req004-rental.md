# TEST-062: REQ-004 เช่าอุปกรณ์ (equipment rental) — retest on `sid`

- Source: Porter 2026-08-29 (owner's call — item carried at "In Progress (Testing)" for weeks, never tested). = board REQ-028 / SPEC-031.
- Environment: `sid` (frontoffice `/api`). Rental posts write `bo.movement` **directly** on the shared DB (`lib/sale-post.ts`, TASK-066) — no HTTP hop, no new money mechanism.
- Tester: Tanya, 2026-08-29.

## What it is (confirmed in code)
`POST /rentals` → `recordRental` → `recordSale(code, hours)` → one `bo.movement` on the code's `bo.item`. Four codes, VAT-inclusive, `hours` = quantity: **`rental-set` ฿200 · `rental-ride` ฿150 · `rental-helmet` ฿50 · `rental-pads` ฿50** (`lib/sale-items.ts`). `value_minor = hours × rate`. The rental items seed with **`metadata.revenueKind = "RENTAL"`**.

## ✅ Items exist (Porter's caveat cleared)
All four codes posted `201 recorded` — **not** `502 RENTAL_NOT_POSTED / item-missing`. So `sale:ensure-items` HAS been run for the rental codes on `sid` (the exact thing that silently 404'd for weeks on `uat`).

## Live checks (QA-runnable via `/rentals`)
| # | Check | Result |
|---|---|---|
| 3 | **Double-submit posts ONCE** (idempotency key) | **PASS** — same `idempotencyKey`+code: 1st `201 recorded`, 2nd `200 duplicate`. Key = `rental:{key}:{code}`. |
| 2/4 | **Unknown code → VISIBLE error, not silent 200** | **PASS** — `rental-jetpack` → **400** `"รหัสอุปกรณ์เช่าไม่ถูกต้อง"` (Thai, at validation). |
| 4 | **Non-positive / bad hours → rejected with a message, not a 500** | **PASS** — hours `0` → 400 (>0), `-1` → 400, `25` → 400 (max 24), `2.5` → 400 (int required). Every one a 400 message; **no 500, no silent 200.** |
| 2 | Failure surfaced for a KNOWN code whose post fails (item-missing / write error) | **PASS (code)** — `recordRental` throws **502 `RENTAL_NOT_POSTED`** ("...ยังไม่ได้ลงบัญชี...") when `recordSale` returns `ok:false`; the post IS the event, never a best-effort silent success. (Can't force item-missing while items exist — but the codepath is unambiguous.) |
| 1 | Amount multiplies by hours | Posted `rental-ride hours=3` → recorded (expect ฿450 in ledger — see DATA REQUEST). |

## Needs a DATA REQUEST — the ledger (checks 1 & 5; Porter: "do NOT trust the API's 200, read the ledger")
I posted 5 identifiable rows; QA cannot read `bo.movement`/`bo.item` (no read API, no backoffice creds). Confirm:
```sql
-- Checks 1 (amount per code), 3-ledger (dupe posted once), 5 (revenueKind on the item)
SELECT m.idempotency_key, i.external_ref, m.qty, m.value_minor,
       i.metadata->>'revenueKind' AS revenue_kind, m.reason, m.ref_type
FROM bo.movement m JOIN bo.item i ON i.id = m.item_id
WHERE m.idempotency_key LIKE 'rental:qa-rental-20260829-%'
ORDER BY m.idempotency_key;
-- expect value_minor (satang): set 20000 · ride 15000 · helmet 5000 · pads 5000 · ride3 45000
--        revenue_kind = 'RENTAL' for ALL; the '-dupe' key present EXACTLY ONCE
```
```sql
-- Check 5 direct: the four rental items carry the marker
SELECT external_ref, metadata->>'revenueKind'
FROM bo.item WHERE external_source='smart-scheduler' AND external_ref LIKE 'rental-%';
-- expect all four = 'RENTAL'
```
📌 Note: `revenueKind` is on the **`bo.item`** the movement points to (not the movement row) — a report separates rental revenue by the item join. That is the design; the marker still answers "is this rental vs tuition".

## Q2 — entry point (Porter's open question): **BOTH are implemented and FE-wired**
- **Standalone walk-in:** `BookingsContent` "rental.standaloneBtn" → `RentalModal` with no `refId` → mints an `idempotencyKey` per open (this is what I exercised; responses show `refId:null`).
- **Session add-on:** `BookingModal` "rental.addonBtn" → `RentalModal` with `refId = booking.id` → idempotent on booking+code.
- Money model identical either way (both → `recordRental` → `recordSale`). The validation comment already reads "owner Q2=both" — it is built that way.

## Footprint — declared (no reversal path)
Posted **6 rental movements** to `sid`'s `bo.movement` (dev ledger): 4 base codes (hours=1) + one `-dupe` (posted once) + one `ride3` (hours=3). Keys all `rental:qa-rental-20260829-*:*`. **There is no rental-reversal endpoint**, so these persist on the dev ledger — flagged in the DATA REQUEST so the owner can see/remove them. Rejection tests wrote nothing. Scope `sid`; `uat` untouched.

## Verdict
**REQ-004 works on `sid` for everything QA can drive:** items exist, idempotent double-submit, every bad input is a visible 400 (never a silent 200 or a 500), both entry points wired. **Two ledger facts (per-code amount + `revenueKind='RENTAL'`) need the one DATA REQUEST above** — the "read the ledger, don't trust the 200" part Porter insisted on.
