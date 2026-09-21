# TASK-003: BE rooms core — categories, fee settings/quote, open / get / mine / join / cancel, timeline, credit
- Source: SPEC-001
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-002

## What to do
SPEC-001 endpoints 5–12, the `Room` serializer, the fee function and the event log.
Read §Fee computation, §Domain vocabulary, §Shared shapes, §Endpoints 5–12, §Flow.

1. `src/domain/fee.ts` — `computeFee({ priceMode, feePayer, enteredPrice, ratePercent, minimum })`
   exactly as SPEC §Fee computation, including the FEE_INCLUDED search for the largest
   fitting B and the remainder-to-fee default (Q-D). Throws `AppError(400, VALIDATION_ERROR)`
   when no B ≥ 1 fits. **Unit test** every row of the SPEC reference table plus
   T=121/BUYER (expect B=100, fee=21, buyerPays=121, sellerReceives=100) and T=15/BUYER (error).
2. `src/domain/roomStatus.ts` — the status enum, `canCancel(status)`, and a
   `assertStatus(room, ...allowed)` helper that throws `409 INVALID_STATE` — every later
   transition uses it, so the guard lives in one place.
3. `src/domain/events.ts` — `addEvent(tx, roomId, type, actorRole, actorUserId?, note?)`.
   Every transition calls it inside the same transaction as the room update.
4. `src/serializers/room.ts` — `toRoom(row, viewerUserId, viewerRole, { withEvents })` producing
   exactly the SPEC `Room` shape (all keys present, `null` where empty, `myRole` computed,
   `events` ascending). `UserPublic.credit.goodCloseCount` from `domain/credit.ts`.
5. Routes:
   - `GET /api/v1/categories`, `GET /api/v1/fee/settings` (auth), `POST /api/v1/fee/quote` (no auth).
   - `POST /api/v1/rooms` — freeze `feeRatePercent`/`feeMinimum` from `settings` into the row;
     status per opener role; `ROOM_OPENED` event with the opener's party role; `201 Room`.
   - `GET /api/v1/rooms/mine`, `GET /api/v1/rooms/{code}` (non-member gets `myRole: null`, unknown → 404).
   - `POST /api/v1/rooms/{code}/join` — fills the empty seat; opener joining their own room or
     a member re-joining → `200` no-op; both seats taken by others → `409 ROOM_FULL`;
     `COMPLETED`/`CANCELLED` → `409 INVALID_STATE`. Transition → `WAITING_PAYMENT`, `ROOM_JOINED`.
   - `POST /api/v1/rooms/{code}/cancel` — member only (`403` otherwise); `canCancel` false → `409`.
6. Room code generation retries on UNIQUE collision.

## Definition of Done
- [x] `bun test` green, fee tests included — paste output listing the fee cases.
- [x] `POST /fee/quote {FEE_ADDED, BUYER, 100}` → `buyerPays 120, sellerReceives 100, fee 20`; `{FEE_ADDED, SPLIT, 100}` → `110/90/20`; `{FEE_INCLUDED, BUYER, 120}` → `basePrice 100`; `{FEE_ADDED, BUYER, 50}` → `fee 20, buyerPays 70` — paste all four (AC-1..4).
- [x] Open a room as user A (SELLER, categoryId 1, price 100, FEE_ADDED, BUYER) → `201`, status `WAITING_BUYER_JOIN`, `code` is 8 chars, `events[0].type = ROOM_OPENED`, `amounts.feeRatePercent = 20` — paste.
- [x] User B `GET /rooms/{code}` → `myRole: null`; B `POST /join` → status `WAITING_PAYMENT`, `buyer.displayName` = B, `myRole: "BUYER"`; user C `POST /join` → `409 ROOM_FULL` — paste all three (AC-6, AC-7).
- [x] B `POST /cancel` → `CANCELLED`, `canCancel false`, last event `ROOM_CANCELLED`; then A `POST /join` on it → `409 INVALID_STATE` — paste.
- [x] `GET /rooms/mine` as B lists the room — paste.
- [x] `GET /rooms/NOPE1234` → `404 NOT_FOUND`; non-member `POST /cancel` → `403 FORBIDDEN` — paste.

## Implementation Notes
(Jason, 2026-09-20. Local only, server `bun src/index.ts` on 3001, users A/B/C registered fresh (`a@local.test` …). No git write.)

**Files:** `src/domain/fee.ts` (`computeFee`; FEE_INCLUDED = binary search for the largest B with `B + buyerShare(feeOf(B)) ≤ T`; Q-D default = remainder added to the fee — one line, `remainder` in `computeFee`), `src/domain/roomStatus.ts` (`ROOM_STATUSES`, `canCancel`, `assertStatus` → 409), `src/domain/events.ts` (`addEvent(tx, …)`, `EventType` open list), `src/db/settings.ts` (`getSettings`), `src/serializers/room.ts` (`toRoom`, `toFileRef`, `findRoomByCode` → 404, `myRoleIn`), routes `src/routes/categories.ts`, `src/routes/fee.ts` (also exports the shared zod enums), `src/routes/rooms.ts` (open / mine / get / join / cancel; `requireAuth` on the whole router; room-code retry ×5 on `UNIQUE constraint failed: rooms.code`). Mounted in `app.ts`.
Every transition = one `db.transaction` holding the room update + its `room_events` row.

**Two decisions Sober should confirm:**
1. **Join ordering.** SPEC says "already a member → no-op 200" and the DoD says "A joins the CANCELLED room → 409 INVALID_STATE" (A is a member). I resolved it as: closed room (CANCELLED/COMPLETED) → `INVALID_STATE` first, then member no-op, then both seats taken by others → `ROOM_FULL`, then the seat fill. So a third user on a `WAITING_PAYMENT` room gets `ROOM_FULL`, not `INVALID_STATE`.
2. **`myRole` for an admin who is also a member** → the party role wins (BUYER/SELLER), ADMIN only when not a member. Unknown `categoryId` → `400 VALIDATION_ERROR` (SPEC lists only that error for endpoint 8).

**`bun test`** — 32 pass / 0 fail across 4 files (`app`, `auth`, `domain/fee`, `routes/rooms`). Fee cases (`src/domain/fee.test.ts`, 13):
```
B=100 SELLER → 100/80/20 · B=100 BUYER → 120/100/20 · B=100 SPLIT → 110/90/20 · B=50 BUYER → fee 20 (minimum), buyer 70
FEE_INCLUDED T=120 BUYER → B=100 · rate 10% min 30, B=100 → fee 30 (AC-5) · FEE_INCLUDED T=121 BUYER → B=100, fee 21, buyerPays 121, sellerReceives 100
FEE_INCLUDED T=100 SELLER → B=100 · FEE_INCLUDED T=110 SPLIT → B=100 · SPLIT rounds half up: B=105 → fee 21, buyer share 11
every result balances: buyerPays − sellerReceives = fee · FEE_INCLUDED T=15 BUYER → VALIDATION_ERROR · enteredPrice < 1 or non-integer → VALIDATION_ERROR
 32 pass / 0 fail / 103 expect() calls — Ran 32 tests across 4 files.
```
`src/routes/rooms.test.ts` covers the same flow as the curls below (AC-1..4, 6, 7, 12, 13 guards). `bunx tsc --noEmit` → exit 0.

**DoD curls (AC-1..4):**
```
> {"priceMode":"FEE_ADDED","feePayer":"BUYER","enteredPrice":100}
{"success":true,"data":{"basePrice":100,"fee":20,"buyerPays":120,"sellerReceives":100,"feeRatePercent":20,"feeMinimum":20}}
> {"priceMode":"FEE_ADDED","feePayer":"SPLIT","enteredPrice":100}
{"success":true,"data":{"basePrice":100,"fee":20,"buyerPays":110,"sellerReceives":90,"feeRatePercent":20,"feeMinimum":20}}
> {"priceMode":"FEE_INCLUDED","feePayer":"BUYER","enteredPrice":120}
{"success":true,"data":{"basePrice":100,"fee":20,"buyerPays":120,"sellerReceives":100,"feeRatePercent":20,"feeMinimum":20}}
> {"priceMode":"FEE_ADDED","feePayer":"BUYER","enteredPrice":50}
{"success":true,"data":{"basePrice":50,"fee":20,"buyerPays":70,"sellerReceives":50,"feeRatePercent":20,"feeMinimum":20}}
```
**Open as A (SELLER, cat 1, 100, FEE_ADDED, BUYER) → 201:**
```
{"success":true,"data":{"id":"b7a85bb6-dda4-4c6a-8d74-9850d8dd041f","code":"T43Y3MPU","status":"WAITING_BUYER_JOIN","category":{"id":1,"kind":"IN_GAME","nameTh":"ไอเทม/ไอดีเกม"},"description":"Sword +5","priceMode":"FEE_ADDED","feePayer":"BUYER","amounts":{"enteredPrice":100,"basePrice":100,"fee":20,"buyerPays":120,"sellerReceives":100,"feeRatePercent":20,"feeMinimum":20},"buyer":null,"seller":{"id":"f63bdd1d-3866-478b-a09c-ba86d88fc8a9","displayName":"A-seller","credit":{"goodCloseCount":0}},"openedByRole":"SELLER","myRole":"SELLER","payment":{"slip":null,"rejectReason":null,"confirmedAt":null},"delivery":{"evidence":[],"courier":null,"trackingNumber":null,"deliveredAt":null,"parcelArrivedAt":null},"autoReleaseAt":null,"releasedAt":null,"releasedBy":null,"paidOutAt":null,"completedAt":null,"cancelledAt":null,"canCancel":true,"events":[{"id":1,"type":"ROOM_OPENED","actorRole":"SELLER","actorDisplayName":"A-seller","note":null,"createdAt":"2026-09-20T16:46:00.828Z"}],"createdAt":"2026-09-20T16:46:00.827Z","updatedAt":"2026-09-20T16:46:00.827Z"}}
HTTP 201
```
**Join / full / cancel / mine / 404 / 403** (full `Room` bodies condensed to the fields the DoD names; the `bun test` file asserts the whole shape):
```
B GET /rooms/T43Y3MPU        → 200 {"status":"WAITING_BUYER_JOIN","myRole":null,"buyer":null,"seller":"A-seller","events":["ROOM_OPENED/SELLER"]}
B POST /join                 → 200 {"status":"WAITING_PAYMENT","myRole":"BUYER","buyer":"B-buyer","seller":"A-seller","canCancel":true,"events":["ROOM_OPENED/SELLER","ROOM_JOINED/BUYER"]}
C POST /join                 → 409 {"success":false,"error":{"code":"ROOM_FULL","message":"room already has a buyer and a seller"}}
C POST /cancel (non-member)  → 403 {"success":false,"error":{"code":"FORBIDDEN","message":"not a member of this room"}}
B POST /cancel               → 200 {"status":"CANCELLED","canCancel":false,"cancelledAt":"2026-09-20T16:46:12.603Z","events":["ROOM_OPENED/SELLER","ROOM_JOINED/BUYER","ROOM_CANCELLED/BUYER"]}
A POST /join (cancelled)     → 409 {"success":false,"error":{"code":"INVALID_STATE","message":"room T43Y3MPU is CANCELLED; allowed: WAITING_BUYER_JOIN, WAITING_SELLER_JOIN"}}
B GET /rooms/mine            → 200 [{"code":"T43Y3MPU","status":"CANCELLED","myRole":"BUYER","events":[]}]
A GET /rooms/NOPE1234        → 404 {"success":false,"error":{"code":"NOT_FOUND","message":"room NOPE1234 not found"}}
A GET /categories            → {"success":true,"data":[{"id":1,"kind":"IN_GAME","nameTh":"ไอเทม/ไอดีเกม"},{"id":2,"kind":"PHYSICAL","nameTh":"สินค้าส่งพัสดุ"}]}
A GET /fee/settings          → {"success":true,"data":{"feeRatePercent":20,"feeMinimum":20}}
```
**`git status --short`:** unchanged set (` M .gitignore`, ` M README.md`, `?? …`) — no commit/branch/tag.

**UNVERIFIED:** the room-code UNIQUE-collision retry (would settle it: stub `roomCode()` to return a fixed code twice — with 32^8 codes it cannot be provoked by hand).

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Fee function read line by line against SPEC §Fee computation — correct, including the binary search and the Q-D remainder in one line as asked; I also quoted `FEE_INCLUDED/SPLIT/111` live → 100 / 21 / 111 / 90 (balances). Room serializer emits every key of the SPEC `Room` shape with the exact casing. 32→46 tests green on my machine.
Rulings on the two decisions — **both accepted and written into SPEC-001 §Endpoints (row 8, row 11) and §Shared shapes**: (1) join order = closed room → INVALID_STATE, then member no-op, then ROOM_FULL, then seat fill; (2) `myRole`: party role wins over ADMIN; unknown `categoryId` → 400 VALIDATION_ERROR. UNIQUE-collision retry stays UNVERIFIED by hand — acceptable (code path read, 5 attempts).
