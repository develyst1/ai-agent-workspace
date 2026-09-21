# TASK-005: BE delivery → payout — evidence, deliver, parcel-arrived, received, auto-release, payout, fee settings
- Source: SPEC-001
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-004

## What to do
SPEC-001 endpoints 14, 15, 16, 17, 22, 23, 24 and the auto-release sweep. This
closes the happy path end to end.

1. `POST /api/v1/rooms/{code}/evidence` — seller only; `assertStatus(PAID_WAITING_DELIVERY)`;
   `storeUpload(kind: EVIDENCE)`; status unchanged; **no event** (the `DELIVERED` event
   is the record; evidence files are listed in `delivery.evidence`).
2. `POST /api/v1/rooms/{code}/deliver` `{ courier?, trackingNumber? }` — seller only;
   `assertStatus(PAID_WAITING_DELIVERY)`; **check order:** evidence count 0 →
   `422 EVIDENCE_REQUIRED`; then if `category.kind = PHYSICAL` and either field missing/blank
   → `422 TRACKING_REQUIRED`. IN_GAME → `DELIVERED_WAITING_CONFIRM`,
   `auto_release_at = now + AUTO_RELEASE_SECONDS`; PHYSICAL → `SHIPPED_WAITING_PARCEL`,
   store courier/tracking, `auto_release_at` null. `delivered_at = now`; event `DELIVERED` (SELLER).
3. `POST /api/v1/rooms/{code}/parcel-arrived` — buyer **or** admin (`403` for seller/others);
   `assertStatus(SHIPPED_WAITING_PARCEL)`; `parcel_arrived_at = now`,
   `auto_release_at = now + AUTO_RELEASE_SECONDS`; → `PARCEL_ARRIVED_WAITING_CONFIRM`;
   event `PARCEL_ARRIVED` with actorRole `BUYER` or `ADMIN` accordingly.
4. `POST /api/v1/rooms/{code}/received` — buyer only; `assertStatus(DELIVERED_WAITING_CONFIRM, PARCEL_ARRIVED_WAITING_CONFIRM)`;
   `released_at = now`, `released_by = 'BUYER'`, `auto_release_at = null`; → `WAITING_PAYOUT`;
   event `RECEIVED_CONFIRMED` (BUYER).
5. `src/jobs/autoRelease.ts` — `runAutoRelease(): number` exactly as SPEC "Auto-release sweep"
   (one transaction per room, event `AUTO_RELEASED` actorRole `SYSTEM`, `actor_user_id` null).
   `src/index.ts` starts `setInterval(runAutoRelease, SWEEP_INTERVAL_MS)` after boot and
   logs one line per run only when `released > 0`.
   `POST /api/v1/admin/jobs/auto-release` → `{ released }`.
6. `POST /api/v1/admin/rooms/{code}/payout` — `assertStatus(WAITING_PAYOUT)`;
   `paid_out_at = completed_at = now`; → `COMPLETED`; event `PAID_OUT` (ADMIN). Nothing
   else to write: credit is derived, and both parties' `goodCloseCount` must now read +1.
7. `PUT /api/v1/admin/fee-settings` `{ feeRatePercent 0..100, feeMinimum ≥ 0 }` → updates the
   single `settings` row, returns it. Existing rooms keep their frozen values (AC-5).
8. `bun test`: the state guards for each endpoint above, and `runAutoRelease` with
   `auto_release_at` in the past vs. future (two runs → second releases 0).

## Definition of Done
Run with `AUTO_RELEASE_SECONDS=5` in `.env` for the timer checks and say so in the notes.
Rooms: R1 = IN_GAME (A seller, B buyer, payment confirmed); R2 = PHYSICAL (same, categoryId 2).
- [x] R1: A `deliver` with no evidence → `422 EVIDENCE_REQUIRED`; A uploads one evidence PNG → `delivery.evidence.length 1`, status unchanged; A `deliver {}` → `DELIVERED_WAITING_CONFIRM`, `autoReleaseAt` ≈ now+5 s, event `DELIVERED` — paste (AC-14, AC-15).
- [x] R2: A uploads evidence, `deliver {}` → `422 TRACKING_REQUIRED`; `deliver {"courier":"Kerry","trackingNumber":"KE123"}` → `SHIPPED_WAITING_PARCEL`, `autoReleaseAt null`, tracking fields set — paste (AC-16, AC-17).
- [x] R2: B `parcel-arrived` → `PARCEL_ARRIVED_WAITING_CONFIRM`, `autoReleaseAt` set, event `PARCEL_ARRIVED` actorRole `BUYER` — paste (AC-18). (Also show an admin doing it on a third room, actorRole `ADMIN`.)
- [x] R2: B `received` → `WAITING_PAYOUT`, `releasedBy "BUYER"`, `autoReleaseAt null`, event `RECEIVED_CONFIRMED` — paste (AC-19).
- [x] R1: wait > 5 s, admin `POST /admin/jobs/auto-release` → `{ released: 1 }`; room → `WAITING_PAYOUT`, `releasedBy "SYSTEM"`, event `AUTO_RELEASED` actorRole `SYSTEM`; call again → `{ released: 0 }` — paste (AC-20). Also paste the server log line showing the interval sweep firing on its own (set `SWEEP_INTERVAL_MS=2000` for this).
- [x] Admin `payout` on R1 → `COMPLETED`, `paidOutAt`/`completedAt` set; `GET /auth/me` as A and as B both show `credit.goodCloseCount` increased by exactly 1 vs. before; `GET /rooms/{R1}` shows each party's credit in `buyer`/`seller` — paste before/after (AC-21, AC-25).
- [x] On R1 (COMPLETED): `deliver`, `received`, `cancel`, `parcel-arrived`, `slip`, `payout` all → `409 INVALID_STATE` — paste the six status lines (AC-22).
- [x] `PUT /admin/fee-settings {10, 30}` → `{10, 30}`; `POST /fee/quote {FEE_ADDED, BUYER, 100}` → `fee 30`; `GET /rooms/{R1}` still `amounts.fee 20`; normal user `PUT` → `403` — paste (AC-5). Restore `{20, 20}` afterwards and paste.
- [x] `bun test` green — paste.

## Implementation Notes
(Jason, 2026-09-20. Local only. Timer checks ran with **`AUTO_RELEASE_SECONDS=5`** (and `SWEEP_INTERVAL_MS=2000` for the interval proof) passed as env to `bun src/index.ts`; `.env` itself keeps the SPEC defaults. Users A (seller) / B (buyer) / seeded admin. Rooms: R1 `DHBHLP9C` IN_GAME · R2 `KPPHE2LH` PHYSICAL · R3 `9ZVXFPN3` PHYSICAL (admin marks parcel) · R4 `F35734RB` IN_GAME (manual-job proof). No git write.)

**Files:** `src/routes/rooms.ts` + endpoints 14 `evidence` (seller; no status change, no event), 15 `deliver` (order: party → status → evidence count → PHYSICAL tracking; blank/whitespace tracking counts as missing), 16 `parcel-arrived` (buyer or admin; `actorRole` from `assertParty`), 17 `received`; `src/jobs/autoRelease.ts` (`runAutoRelease()` — one transaction per due room, `AUTO_RELEASED` by SYSTEM with `actor_user_id` null; idempotent by construction: it selects only `*_WAITING_CONFIRM` rows with `auto_release_at ≤ now`); `src/index.ts` `setInterval(runAutoRelease, SWEEP_INTERVAL_MS)`, logs `[auto-release] <iso> released=N` only when N > 0; `src/routes/admin.ts` + endpoints 22 `payout`, 23 `PUT /fee-settings`, 24 `POST /jobs/auto-release`; `src/db/settings.ts` + `updateSettings`.
Guard order everywhere is **party (403) before status (409)** — e.g. the seller calling `received` on a COMPLETED room gets 403, the buyer gets 409. Sober: say if you want status first.

**`bun test`** (`src/routes/delivery.test.ts` added, 7 tests: R1 evidence/deliver incl. timer ≈ now+AUTO_RELEASE_SECONDS, R2 tracking/parcel/received, admin parcel-arrived, `runAutoRelease` future → 0 / past → 1 / again → 0 via a row with `auto_release_at` set to the past, payout + credit +1 on `me` and on `buyer`/`seller`, eight actions on the COMPLETED room → all 409 INVALID_STATE, fee settings 403/400/new-rooms-only/restore):
```
 46 pass
 0 fail
 220 expect() calls
Ran 46 tests across 6 files. [3.33s]
```
`bunx tsc --noEmit` → exit 0.

**DoD curls** (bodies condensed to `{status, autoReleaseAt, releasedAt, releasedBy, delivery, lastEvent=type/actorRole/actorDisplayName}`):
```
R1  A deliver {} (no evidence) → 422 {"success":false,"error":{"code":"EVIDENCE_REQUIRED","message":"attach at least one evidence image before delivering"}}
R1  A evidence slip.png        → 200 {"status":"PAID_WAITING_DELIVERY","autoReleaseAt":null,"delivery":{"evidence":1,…,"deliveredAt":null},"lastEvent":"PAYMENT_CONFIRMED/ADMIN/Admin"}   (no new event)
    now = 2026-09-20T16:54:56Z
R1  A deliver {}               → 200 {"status":"DELIVERED_WAITING_CONFIRM","autoReleaseAt":"2026-09-20T16:55:01.231Z","delivery":{"evidence":1,"deliveredAt":"2026-09-20T16:54:56.231Z"},"lastEvent":"DELIVERED/SELLER/A-seller"}   (= deliveredAt + 5 s)
R2  A deliver {} (evidence ok) → 422 {"success":false,"error":{"code":"TRACKING_REQUIRED","message":"courier and trackingNumber are required for physical goods"}}
R2  A deliver Kerry/KE123      → 200 {"status":"SHIPPED_WAITING_PARCEL","autoReleaseAt":null,"delivery":{"evidence":1,"courier":"Kerry","trackingNumber":"KE123","deliveredAt":"2026-09-20T16:54:56.518Z","parcelArrivedAt":null},"lastEvent":"DELIVERED/SELLER/A-seller"}
R2  B parcel-arrived           → 200 {"status":"PARCEL_ARRIVED_WAITING_CONFIRM","autoReleaseAt":"2026-09-20T16:55:01.681Z","delivery":{…,"parcelArrivedAt":"2026-09-20T16:54:56.681Z"},"lastEvent":"PARCEL_ARRIVED/BUYER/B-buyer"}
R2  B received                 → 200 {"status":"WAITING_PAYOUT","autoReleaseAt":null,"releasedAt":"2026-09-20T16:54:56.948Z","releasedBy":"BUYER","lastEvent":"RECEIVED_CONFIRMED/BUYER/B-buyer"}
R3  ADMIN parcel-arrived       → 200 {"status":"PARCEL_ARRIVED_WAITING_CONFIRM","autoReleaseAt":"2026-09-20T16:55:02.232Z","delivery":{"courier":"Flash","trackingNumber":"FL1",…},"lastEvent":"PARCEL_ARRIVED/ADMIN/Admin"}
```
**Interval sweep on its own** (`SWEEP_INTERVAL_MS=2000`; R1 and R3 were due at 16:55:01/02 — server stdout, then the rooms):
```
safe-goods-back listening on http://localhost:3001
[auto-release] 2026-09-20T16:55:02.947Z released=2
R1 {"status":"WAITING_PAYOUT","releasedBy":"SYSTEM","releasedAt":"2026-09-20T16:55:02.936Z","autoReleaseAt":null,"lastEvent":{"id":32,"type":"AUTO_RELEASED","actorRole":"SYSTEM","actorDisplayName":null,…}}
R3 {"status":"WAITING_PAYOUT","releasedBy":"SYSTEM","releasedAt":"2026-09-20T16:55:02.936Z","autoReleaseAt":null,"lastEvent":{"id":33,"type":"AUTO_RELEASED","actorRole":"SYSTEM",…}}
```
**Manual job (AC-20)** — server restarted with `AUTO_RELEASE_SECONDS=5` and the default 60 s interval so it cannot race; fresh R4 delivered at 16:55:41:
```
R4 deliver → {"status":"DELIVERED_WAITING_CONFIRM","autoReleaseAt":"2026-09-20T16:55:46.516Z"}
ADMIN POST /admin/jobs/auto-release (immediately) → {"success":true,"data":{"released":0}}
(wait 6 s)
ADMIN POST /admin/jobs/auto-release → {"success":true,"data":{"released":1}}
R4 → {"status":"WAITING_PAYOUT","releasedBy":"SYSTEM","autoReleaseAt":null,"lastEvent":{"id":39,"type":"AUTO_RELEASED","actorRole":"SYSTEM","actorDisplayName":null,…}}
ADMIN POST /admin/jobs/auto-release → {"success":true,"data":{"released":0}}
B     POST /admin/jobs/auto-release → 403 {"success":false,"error":{"code":"FORBIDDEN","message":"admin only"}}
```
**Payout + credit (AC-21, AC-25)** on R1:
```
GET /auth/me before: A-seller {"goodCloseCount":0} · B-buyer {"goodCloseCount":0}
ADMIN POST /admin/rooms/DHBHLP9C/payout → {"status":"COMPLETED","paidOutAt":"2026-09-20T16:55:48.494Z","completedAt":"2026-09-20T16:55:48.494Z","buyer":{"displayName":"B-buyer","credit":{"goodCloseCount":1}},"seller":{"displayName":"A-seller","credit":{"goodCloseCount":1}},"lastEvent":{"id":40,"type":"PAID_OUT","actorRole":"ADMIN","actorDisplayName":"Admin",…}}
GET /auth/me after:  A-seller {"goodCloseCount":1} · B-buyer {"goodCloseCount":1}
```
**COMPLETED room rejects everything (AC-22)** — R1, each with its proper actor:
```
A  deliver        HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; allowed: PAID_WAITING_DELIVERY"}
B  received       HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; allowed: DELIVERED_WAITING_CONFIRM, PARCEL_ARRIVED_WAITING_CONFIRM"}
A  cancel         HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; cannot cancel"}
B  parcel-arrived HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; allowed: SHIPPED_WAITING_PARCEL"}
B  slip           HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; allowed: WAITING_PAYMENT"}
AD payout         HTTP 409 {"code":"INVALID_STATE","message":"room DHBHLP9C is COMPLETED; allowed: WAITING_PAYOUT"}
(the wrong actor — e.g. the seller calling received — gets 403 FORBIDDEN first; see guard order above)
```
**Fee settings (AC-5):**
```
B  PUT /admin/fee-settings {10,30}   → 403 {"success":false,"error":{"code":"FORBIDDEN","message":"admin only"}}
AD PUT /admin/fee-settings {10,30}   → {"success":true,"data":{"feeRatePercent":10,"feeMinimum":30}}
   POST /fee/quote FEE_ADDED/BUYER/100 → {"success":true,"data":{"basePrice":100,"fee":30,"buyerPays":130,"sellerReceives":100,"feeRatePercent":10,"feeMinimum":30}}
B  GET /rooms/DHBHLP9C amounts       → {"enteredPrice":100,"basePrice":100,"fee":20,"buyerPays":120,"sellerReceives":100,"feeRatePercent":20,"feeMinimum":20}   (frozen)
AD PUT /admin/fee-settings {20,20}   → {"success":true,"data":{"feeRatePercent":20,"feeMinimum":20}}   (restored)
```
**`git status --short`:** unchanged set — no commit/branch/tag.

**UNVERIFIED:** nothing in the DoD. The real 3-day window is only ever exercised with the default env (259 200 s); its arithmetic is the same `autoReleaseFrom(now)` the 5-second run used.

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Evidence covers AC-14..22, AC-5, AC-25 with the timer proven twice (interval sweep released=2 on its own; manual job 0→1→0). `runAutoRelease` is synchronous end to end (bun:sqlite), so select-then-update cannot interleave with a buyer's `received` — idempotency holds. Credit derived, +1 on both parties confirmed in the pasted before/after.
Ruling: **guard order party (403) → status (409) accepted** for every endpoint, written into SPEC-001 §Envelope & errors so Fern maps it the same way. With this, TASK-001..005 are DONE and the BE side of REQ-001 is complete; REQ-001 stays IN_SPEC until Fern's TASK-006..009 are DONE.
