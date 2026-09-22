# SPEC-001: Deal room — happy path (foundation + open → pay → deliver → release)
- Source: REQ-001 (`requirements/REQ-001-deal-room-happy-path.md`)
- Status: DONE (2026-09-21 — TASK-001..010 DONE; REQ-001 SPEC_DONE, re-test by Tanya via Porter)
- Author: Sober (SA), 2026-09-20

## Overview

REQ-001 is the first slice of **เว็บกลาง** (repo name: safe-goods): an escrow room
with no dispute. This SPEC does two things at once, because the repos are empty:

1. **Applies the owner's stack decision** (`SYSTEM-FACTS.md` §Stack, owner
   2026-09-20 — nothing here is a proposal): Bun + Hono API in `safe-goods-back`,
   Next.js + Ant Design front in `safe-goods-front` via the house
   `nextjs-antd-pattern` skill, working branch `main`, local only.
2. **Fixes the BE↔FE contract** for the whole happy path so Jason and Fern can
   build in parallel without talking to each other.

Where the owner left the *technical* choice open (database, auth mechanism, file
storage, timers), this SPEC decides it — those are SA decisions, listed in §Technical
decisions with the reason. Product rules are taken from REQ-001 verbatim; none are
invented here. Anything I could not derive is in §Questions.

### Technical decisions (SA, 2026-09-20)

| Area | Decision | Why |
|---|---|---|
| Runtime / framework | **Bun 1.3.x + Hono 4.x**, TypeScript | owner's decision |
| Database | **SQLite** via `bun:sqlite`, **Drizzle ORM** + `drizzle-kit` SQL migrations committed under `drizzle/` | local-only, no server to run; `*.sqlite` already git-ignored in the repo; the DDL in §Data Model is the source of truth, Drizzle just applies it |
| Validation | `zod` + `@hono/zod-validator` | one schema per endpoint, errors become the standard error body |
| Passwords | `Bun.password.hash` / `verify` (argon2id, built in) | no extra dependency |
| Auth token | **JWT HS256** issued by BE (`hono/jwt`), 24 h, claims `{ sub: userId, role }`; FE sends `Authorization: Bearer <token>` | stateless, fits the house FE pattern (NextAuth Credentials provider holds the token) |
| Files (slips, evidence) | multipart upload to BE, stored on local disk under `uploads/` (git-ignored), served back **only through an authenticated endpoint** | slips show bank details; no public URLs |
| Money | **integer THB** everywhere (no decimals) | REQ Constraints: whole THB |
| JSON casing | **camelCase** for every field, both directions; enums UPPER_SNAKE_CASE strings; timestamps ISO-8601 UTC strings (`2026-09-20T16:11:00.000Z`) | stated once, here; a field read under another name is a defect in the reading side |
| Response envelope | `{ "success": true, "data": … }` / `{ "success": false, "error": { "code", "message", "details"? } }` | matches the house FE `ApiResponse<T>` type |
| 3-day timer | `autoReleaseAt` stored on the room; a sweep runs every `SWEEP_INTERVAL_MS` (default 60 000) and an admin endpoint triggers the same sweep on demand; the window is `AUTO_RELEASE_SECONDS` (default 259 200 = 3 days) | AC-20 demands a clock Tanya can shrink; env + manual trigger make it executable without waiting 3 days |
| Ports | BE `http://localhost:3001`, FE `http://localhost:3000`; BE CORS allows `http://localhost:3000` | fixed so both sides' `.env.example` agree |
| Credit | **derived, never stored**: `goodCloseCount = COUNT(rooms COMPLETED where user is buyer or seller)` | owner: credit *is* how deals closed; REQ-002 adds the −1 counts from `room_events` the same way |
| IDs | `users.id`, `rooms.id`, `files.id` = UUID v4 strings (`crypto.randomUUID()`); `rooms.code` = 8 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I), unique | the code is what goes in the share link |

## Domain vocabulary (codes ↔ Porter's Thai)

Every status has **one code** on the wire; the **Thai label is rendered by the FE**
from `constant/text/th.ts`, copied verbatim from REQ-001 §User-facing wording. The BE
never sends Thai.

| `status` code | Thai (REQ-001) | Who can act |
|---|---|---|
| `WAITING_BUYER_JOIN` | รอผู้ซื้อเข้าห้อง | anyone with the link joins as buyer |
| `WAITING_SELLER_JOIN` | รอผู้ขายเข้าห้อง | anyone with the link joins as seller |
| `WAITING_PAYMENT` | รอผู้ซื้อชำระเงิน | buyer uploads slip; either party cancels |
| `SLIP_REVIEW` | รอแอดมินตรวจสอบยอดเงิน | admin confirms / rejects; either party cancels |
| `PAID_WAITING_DELIVERY` | ชำระเงินแล้ว — รอผู้ขายส่งของ | seller marks delivered (evidence; + tracking if physical) |
| `DELIVERED_WAITING_CONFIRM` | ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน | (in-game) buyer confirms; timer running |
| `SHIPPED_WAITING_PARCEL` | ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง | (physical) buyer or admin marks parcel arrived; **no timer** |
| `PARCEL_ARRIVED_WAITING_CONFIRM` | พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน | (physical) buyer confirms; timer running |
| `WAITING_PAYOUT` | รอแอดมินโอนเงินให้ผู้ขาย | admin records payout |
| `COMPLETED` | ปิดดีลแล้ว | nobody — read-only (AC-22) |
| `CANCELLED` | ห้องถูกยกเลิก | nobody |

Other enums:
- `role` (per user, on `users.role`): `USER` | `ADMIN`
- `partyRole` (a user's role in a room): `BUYER` | `SELLER`
- `categoryKind`: `IN_GAME` | `PHYSICAL`
- `priceMode`: `FEE_ADDED` (ราคานี้ยังไม่รวมค่ากลาง) | `FEE_INCLUDED` (ราคานี้รวมค่ากลางแล้ว)
- `feePayer`: `SELLER` | `BUYER` | `SPLIT`
- `fileKind`: `SLIP` | `EVIDENCE`
- `eventType` (timeline, REQ-001 §13): `ROOM_OPENED` · `ROOM_JOINED` · `SLIP_UPLOADED` ·
  `PAYMENT_CONFIRMED` · `PAYMENT_REJECTED` · `DELIVERED` · `PARCEL_ARRIVED` ·
  `RECEIVED_CONFIRMED` · `AUTO_RELEASED` · `PAID_OUT` · `ROOM_CANCELLED`.
  REQ-002 will append e.g. `NOT_OK_PRESSED` / `NOT_OK_WITHDRAWN` to the same table —
  do not design anything that assumes this list is closed.

## Fee computation (single shared function — REQ-001 §Fee model, owner-confirmed)

Implemented **once** in BE (`src/domain/fee.ts`) and **once** in FE
(`src/lib/fee.ts`) for the live preview; both must produce identical results for
the table below. Tanya's AC-1..AC-5 are the acceptance test; Jason and Fern each
include the table as a unit test.

```
inputs : mode ∈ {FEE_ADDED, FEE_INCLUDED}, feePayer, enteredPrice (int ≥ 1), rate (0..1), minimum (int)
feeOf(B)      = max(ceil(rate × B), minimum)
buyerShare(F) = SELLER → 0 · BUYER → F · SPLIT → ceil(F / 2)      // "round half up" on a .5 = ceil
sellerShare   = F − buyerShare
FEE_ADDED     : B = enteredPrice
FEE_INCLUDED  : T = enteredPrice; B = the largest integer ≥ 1 with B + buyerShare(feeOf(B)) ≤ T
                if no such B exists → error VALIDATION_ERROR (price too low)
                if B + buyerShare(feeOf(B)) < T → the remainder is added to the fee, so buyerPays is
                exactly T (Q-D, answered 2026-09-21 — now a REQ-001 §Fee model rule)
outputs: basePrice B, fee F, buyerPays = B + buyerShare, sellerReceives = B − sellerShare, siteKeeps = F
```

Reference rows (rate 20 %, min 20): B=100 → SELLER 100/80/20 · BUYER 120/100/20 ·
SPLIT 110/90/20; B=50 BUYER → fee 20, buyer 70; FEE_INCLUDED T=120 BUYER → B=100;
rate 10 % min 30, B=100 → fee 30 (AC-5).

## API / Interface Design — the BE↔FE contract

Base URL `http://localhost:3001`, prefix `/api/v1`. All bodies JSON unless marked
multipart. Auth = `Authorization: Bearer <jwt>` on everything except `auth/register`,
`auth/login`, `health`, and `fee/quote`.

### Envelope & errors

```jsonc
// success
{ "success": true, "data": <payload> }
// failure
{ "success": false, "error": { "code": "ROOM_FULL", "message": "room already has a buyer and a seller", "details": { /* zod issues, optional */ } } }
```

`message` is an English developer string. **The FE maps `code` → Porter's Thai** and
never shows `message`. Codes and HTTP statuses:

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | zod failure, price < 1, FEE_INCLUDED price too low, bad file type/size |
| 401 | `UNAUTHENTICATED` | missing/invalid/expired token, or wrong email/password on login |
| 403 | `FORBIDDEN` | wrong role (normal user on admin route, AC-27), not a member of the room, wrong party for this action |
| 404 | `NOT_FOUND` | room code / file id unknown |
| 409 | `EMAIL_TAKEN` | register with existing email (AC-26 → "อีเมลนี้ถูกใช้แล้ว") |
| 409 | `ROOM_FULL` | third user joins (AC-7 → "ห้องนี้เต็มแล้ว") |
| 409 | `INVALID_STATE` | action not allowed in the room's current status (e.g. cancel after payment confirmed, deliver before payment) |
| 422 | `EVIDENCE_REQUIRED` | deliver with no evidence (AC-14 → "ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป") |
| 422 | `TRACKING_REQUIRED` | physical deliver without courier + trackingNumber (AC-16 → "ต้องระบุขนส่งและเลขพัสดุ") |
| 500 | `INTERNAL` | anything else; body never leaks a stack |

**Guard order (ruled 2026-09-21 at TASK-005 review): every room endpoint checks the caller first, then the state — a wrong party gets `403 FORBIDDEN` even on a closed room; the right party on the wrong status gets `409 INVALID_STATE`.** The FE therefore treats 403 as "not your button" and 409 as "refetch, the room moved".

### Shared shapes

```ts
// UserPublic — what one party sees of another (and of themselves)
{ "id": string, "displayName": string, "credit": { "goodCloseCount": number } }

// Me — GET /auth/me and login/register responses
{ "id": string, "email": string, "displayName": string, "role": "USER" | "ADMIN", "credit": { "goodCloseCount": number } }

// FileRef
{ "id": string, "kind": "SLIP" | "EVIDENCE", "fileName": string, "mimeType": string, "sizeBytes": number, "uploadedAt": string,
  "url": string }                        // always "/api/v1/files/{id}" — FE fetches it with the bearer token (see endpoint 18)

// RoomEvent
{ "id": number, "type": EventType, "actorRole": "BUYER" | "SELLER" | "ADMIN" | "SYSTEM", "actorDisplayName": string | null,
  "note": string | null, "createdAt": string }   // note = admin's reject reason; FE renders AUTO_RELEASED as "ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)"

// Room — the full room, same shape for buyer, seller and admin
{
  "id": string, "code": string, "status": Status,
  "category": { "id": number, "kind": "IN_GAME" | "PHYSICAL", "nameTh": string },
  "description": string,
  "priceMode": "FEE_ADDED" | "FEE_INCLUDED", "feePayer": "SELLER" | "BUYER" | "SPLIT",
  "amounts": { "enteredPrice": number, "basePrice": number, "fee": number, "buyerPays": number, "sellerReceives": number,
               "feeRatePercent": number, "feeMinimum": number },      // frozen at creation (AC-5)
  "buyer": UserPublic | null, "seller": UserPublic | null,
  "openedByRole": "BUYER" | "SELLER",
  "myRole": "BUYER" | "SELLER" | "ADMIN" | null,                       // the caller's relation to this room; party role wins — an admin who is also buyer/seller sees BUYER/SELLER
  "payment": { "slip": FileRef | null, "rejectReason": string | null, "confirmedAt": string | null },
  "delivery": { "evidence": FileRef[], "courier": string | null, "trackingNumber": string | null,
                "deliveredAt": string | null, "parcelArrivedAt": string | null },
  "autoReleaseAt": string | null,          // set only in *_WAITING_CONFIRM; FE renders the countdown from it
  "releasedAt": string | null, "releasedBy": "BUYER" | "SYSTEM" | null,
  "paidOutAt": string | null, "completedAt": string | null, "cancelledAt": string | null,
  "canCancel": boolean,                    // true only while status ∈ {WAITING_*_JOIN, WAITING_PAYMENT, SLIP_REVIEW} (AC-12/13)
  "events": RoomEvent[],                   // ascending by createdAt
  "createdAt": string, "updatedAt": string
}
```

### Endpoints

| # | Method & path | Auth | Request | 2xx response `data` | Errors |
|---|---|---|---|---|---|
| 1 | `GET /api/v1/health` | none | — | `{ "ok": true, "time": string }` | — |
| 2 | `POST /api/v1/auth/register` | none | `{ "displayName": string(1..50), "email": string(email), "password": string(8..72) }` | `201` `{ "token": string, "user": Me }` | `EMAIL_TAKEN`, `VALIDATION_ERROR` |
| 3 | `POST /api/v1/auth/login` | none | `{ "email", "password" }` | `{ "token", "user": Me }` | `401 UNAUTHENTICATED` (message "invalid credentials") |
| 4 | `GET /api/v1/auth/me` | user | — | `Me` | `UNAUTHENTICATED` |
| 5 | `GET /api/v1/categories` | user | — | `[{ "id": number, "kind": "IN_GAME" or "PHYSICAL", "nameTh": string }]` — seeded: `1 IN_GAME "ไอเทม/ไอดีเกม"`, `2 PHYSICAL "สินค้าส่งพัสดุ"` | — |
| 6 | `GET /api/v1/fee/settings` | user | — | `{ "feeRatePercent": number, "feeMinimum": number }` (current values; defaults 20 / 20) | — |
| 7 | `POST /api/v1/fee/quote` | none | `{ "priceMode", "feePayer", "enteredPrice": int ≥ 1 }` | `{ "basePrice", "fee", "buyerPays", "sellerReceives", "feeRatePercent", "feeMinimum" }` using **current** settings | `VALIDATION_ERROR` |
| 8 | `POST /api/v1/rooms` | user | `{ "myRole": "BUYER" or "SELLER", "categoryId": number, "description": string(1..500), "priceMode", "feePayer", "enteredPrice": int ≥ 1 }` | `201` `Room` (status `WAITING_BUYER_JOIN` if opener is SELLER, else `WAITING_SELLER_JOIN`; amounts frozen from current settings; event `ROOM_OPENED`) | `VALIDATION_ERROR` (incl. unknown `categoryId`) |
| 9 | `GET /api/v1/rooms/mine` | user | — | `Room[]` (rooms where caller is buyer or seller, newest first, `events: []`) | — |
| 10 | `GET /api/v1/rooms/{code}` | user | — | `Room` — members and admins get the full room; **a non-member gets the same shape with `myRole: null`** so the join page can show the room before joining | `NOT_FOUND` |
| 11 | `POST /api/v1/rooms/{code}/join` | user | — | `Room` (caller becomes the missing party; status → `WAITING_PAYMENT`; event `ROOM_JOINED`). Calling it when already a member is a no-op `200`. **Check order (ruled 2026-09-21):** CANCELLED/COMPLETED → `INVALID_STATE` (even for a member) → member no-op → both seats taken by others → `ROOM_FULL` → fill the seat | `INVALID_STATE`, `ROOM_FULL`, `NOT_FOUND` |
| 12 | `POST /api/v1/rooms/{code}/cancel` | member | — | `Room` (status → `CANCELLED`; event `ROOM_CANCELLED`) | `INVALID_STATE` if `canCancel` is false, `FORBIDDEN` if not a member |
| 13 | `POST /api/v1/rooms/{code}/slip` | buyer | multipart: `file` (image/jpeg, image/png, image/webp; ≤ 5 MB) | `Room` (status → `SLIP_REVIEW`; replaces any previous slip; `payment.rejectReason` cleared; event `SLIP_UPLOADED`) | allowed from `WAITING_PAYMENT` only → else `INVALID_STATE`; `VALIDATION_ERROR` on file |
| 14 | `POST /api/v1/rooms/{code}/evidence` | seller | multipart: `file` (same limits) | `Room` (appends to `delivery.evidence`; **does not change status**) | allowed from `PAID_WAITING_DELIVERY` only |
| 15 | `POST /api/v1/rooms/{code}/deliver` | seller | `{ "courier"?: string(1..50), "trackingNumber"?: string(1..50) }` | `Room` — IN_GAME: status → `DELIVERED_WAITING_CONFIRM`, `autoReleaseAt = now + AUTO_RELEASE_SECONDS`; PHYSICAL: status → `SHIPPED_WAITING_PARCEL`, `autoReleaseAt` stays null; event `DELIVERED` | `EVIDENCE_REQUIRED` if `delivery.evidence` is empty (checked first); `TRACKING_REQUIRED` if PHYSICAL and either field missing; `INVALID_STATE` unless `PAID_WAITING_DELIVERY` |
| 16 | `POST /api/v1/rooms/{code}/parcel-arrived` | buyer **or admin** | — | `Room` (status → `PARCEL_ARRIVED_WAITING_CONFIRM`, `autoReleaseAt = now + AUTO_RELEASE_SECONDS`; event `PARCEL_ARRIVED` with actorRole BUYER or ADMIN) | `INVALID_STATE` unless `SHIPPED_WAITING_PARCEL` |
| 17 | `POST /api/v1/rooms/{code}/received` | buyer | — | `Room` (status → `WAITING_PAYOUT`; `autoReleaseAt = null`, `releasedAt = now`, `releasedBy = "BUYER"`; event `RECEIVED_CONFIRMED`) | `INVALID_STATE` unless `DELIVERED_WAITING_CONFIRM` or `PARCEL_ARRIVED_WAITING_CONFIRM` |
| 18 | `GET /api/v1/files/{id}` | member of the file's room, or admin | — | the binary with its `Content-Type` (not the envelope) | `FORBIDDEN`, `NOT_FOUND` |
| 19 | `GET /api/v1/admin/rooms?status=SLIP_REVIEW` | admin | query `status` optional (any Status) | `Room[]` newest first (`events: []`) | `FORBIDDEN` |
| 20 | `POST /api/v1/admin/rooms/{code}/payment/confirm` | admin | — | `Room` (status → `PAID_WAITING_DELIVERY`; `payment.confirmedAt`; event `PAYMENT_CONFIRMED`) | `INVALID_STATE` unless `SLIP_REVIEW` |
| 21 | `POST /api/v1/admin/rooms/{code}/payment/reject` | admin | `{ "reason": string(1..200) }` | `Room` (status → `WAITING_PAYMENT`; `payment.rejectReason = reason`, slip kept for the record; event `PAYMENT_REJECTED` with `note = reason`) | `INVALID_STATE` unless `SLIP_REVIEW` |
| 22 | `POST /api/v1/admin/rooms/{code}/payout` | admin | — | `Room` (status → `COMPLETED`; `paidOutAt = completedAt = now`; event `PAID_OUT`). Credit needs no write — it is derived (§Technical decisions) | `INVALID_STATE` unless `WAITING_PAYOUT` |
| 23 | `PUT /api/v1/admin/fee-settings` | admin | `{ "feeRatePercent": int 0..100, "feeMinimum": int ≥ 0 }` | `{ "feeRatePercent", "feeMinimum" }` — affects **new** rooms only (AC-5) | `VALIDATION_ERROR` |
| 24 | `POST /api/v1/admin/jobs/auto-release` | admin | — | `{ "released": number }` — runs the same sweep as the timer, now | — |

Admin "mark parcel delivered" uses endpoint 16 (admin passes the role check there).

**Auto-release sweep (endpoint 24 and the interval):** for every room with
`status ∈ {DELIVERED_WAITING_CONFIRM, PARCEL_ARRIVED_WAITING_CONFIRM}` and
`autoReleaseAt ≤ now`: status → `WAITING_PAYOUT`, `releasedAt = now`,
`releasedBy = "SYSTEM"`, `autoReleaseAt = null`, event `AUTO_RELEASED`
(`actorRole: "SYSTEM"`). Idempotent — running twice releases nothing new.

### Auth from the FE side (house pattern)

- NextAuth 4 **Credentials** provider: `authorize()` calls endpoint 3, returns
  `{ id, email, displayName, role, accessToken }`; the `jwt`/`session` callbacks copy
  `accessToken` and `role` into the session.
- `lib/api/client.ts` (axios, `baseURL = process.env.NEXT_PUBLIC_API_URL`, default
  `http://localhost:3001`) attaches `Authorization: Bearer <session.accessToken>`; a
  `401` from the BE signs the user out and sends them to `/login`.
- AC-8: room pages under `/room/[code]` are protected by NextAuth `withAuth` in `src/proxy.ts` (Next 16 renamed the `middleware` convention to `proxy` — ruled 2026-09-21, TASK-006 review); the
  unauthenticated redirect is `/login?callbackUrl=/room/{code}` and login returns to it.
- Admin pages under `/admin/**` additionally require `session.role === "ADMIN"`; a
  normal user gets redirected to `/` (AC-27 is enforced by the BE too — the FE check is
  UX, the BE check is security).
- Images (slips / evidence) are loaded through the axios client as blobs (bearer header),
  never as a bare `<img src="http://localhost:3001/...">`, because endpoint 18 requires auth.

## Data Model (SQLite, applied by drizzle-kit migration `0000_init.sql`)

Jason writes this DDL as the first Drizzle migration; the human never runs anything —
it is local-only (`data/safe-goods.sqlite`, git-ignored). Existing rows: none (greenfield).
**Ruled 2026-09-21 (TASK-001 review):** drizzle cannot express `COLLATE NOCASE`, so `drizzle/0000_init.sql` carries it by hand; any later `db:generate` output is diffed against this DDL before it is applied and the hand edit is kept. The SQL below is the truth, drizzle is the applier.

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,                 -- uuid
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  created_at    TEXT NOT NULL,                    -- ISO-8601 UTC
  updated_at    TEXT NOT NULL
);

CREATE TABLE categories (
  id       INTEGER PRIMARY KEY,
  kind     TEXT NOT NULL CHECK (kind IN ('IN_GAME','PHYSICAL')),
  name_th  TEXT NOT NULL,
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE settings (                           -- single row, id = 1
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  fee_rate_percent INTEGER NOT NULL DEFAULT 20,
  fee_minimum      INTEGER NOT NULL DEFAULT 20,
  updated_at       TEXT NOT NULL
);

CREATE TABLE rooms (
  id               TEXT PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL,
  category_id      INTEGER NOT NULL REFERENCES categories(id),
  description      TEXT NOT NULL,
  price_mode       TEXT NOT NULL CHECK (price_mode IN ('FEE_ADDED','FEE_INCLUDED')),
  fee_payer        TEXT NOT NULL CHECK (fee_payer IN ('SELLER','BUYER','SPLIT')),
  entered_price    INTEGER NOT NULL,
  base_price       INTEGER NOT NULL,
  fee              INTEGER NOT NULL,
  buyer_pays       INTEGER NOT NULL,
  seller_receives  INTEGER NOT NULL,
  fee_rate_percent INTEGER NOT NULL,              -- frozen copy of settings at creation
  fee_minimum      INTEGER NOT NULL,
  opened_by_role   TEXT NOT NULL CHECK (opened_by_role IN ('BUYER','SELLER')),
  buyer_id         TEXT REFERENCES users(id),
  seller_id        TEXT REFERENCES users(id),
  slip_file_id     TEXT,                          -- id in files, set on upload
  reject_reason    TEXT,
  payment_confirmed_at TEXT,
  courier          TEXT,
  tracking_number  TEXT,
  delivered_at     TEXT,
  parcel_arrived_at TEXT,
  auto_release_at  TEXT,
  released_at      TEXT,
  released_by      TEXT CHECK (released_by IN ('BUYER','SYSTEM')),
  paid_out_at      TEXT,
  completed_at     TEXT,
  cancelled_at     TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX rooms_status_auto_release ON rooms(status, auto_release_at);
CREATE INDEX rooms_buyer  ON rooms(buyer_id);
CREATE INDEX rooms_seller ON rooms(seller_id);

CREATE TABLE files (
  id           TEXT PRIMARY KEY,
  room_id      TEXT NOT NULL REFERENCES rooms(id),
  kind         TEXT NOT NULL CHECK (kind IN ('SLIP','EVIDENCE')),
  uploaded_by  TEXT NOT NULL REFERENCES users(id),
  file_name    TEXT NOT NULL,                     -- original name, display only
  storage_path TEXT NOT NULL,                     -- uploads/<room_id>/<id>.<ext>
  mime_type    TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX files_room ON files(room_id, kind);

CREATE TABLE room_events (                        -- REQ-001 §13 timeline; REQ-002 appends new types
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id    TEXT NOT NULL REFERENCES rooms(id),
  type       TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('BUYER','SELLER','ADMIN','SYSTEM')),
  actor_user_id TEXT REFERENCES users(id),        -- NULL for SYSTEM
  note       TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX room_events_room ON room_events(room_id, created_at);
```

**Seed** (`bun run seed`, idempotent): categories rows 1 and 2 as in endpoint 5;
settings row `(1, 20, 20)`; one admin from env `ADMIN_EMAIL` / `ADMIN_PASSWORD` /
`ADMIN_DISPLAY_NAME` (documented in `.env.example` with local-only placeholder values —
there is no real environment, so these are not secrets; the day one exists, the human
sets real ones and they never enter the repo).

## Flow

```
open (SELLER) ─► WAITING_BUYER_JOIN ─join─► WAITING_PAYMENT ─slip─► SLIP_REVIEW ─admin confirm─► PAID_WAITING_DELIVERY
open (BUYER)  ─► WAITING_SELLER_JOIN ─┘        ▲                       │ admin reject (reason)
                                               └───────────────────────┘
PAID_WAITING_DELIVERY ─evidence(1..n)─ deliver ─┬─ IN_GAME  ─► DELIVERED_WAITING_CONFIRM ─────────────────────────────────┐ (autoReleaseAt = +3d)
                                                └─ PHYSICAL ─► SHIPPED_WAITING_PARCEL ─parcel-arrived─► PARCEL_ARRIVED_WAITING_CONFIRM ─┤ (autoReleaseAt = +3d)
                                                                                                                                       ▼
   buyer "received" ──────────────────────────────────────────────────────────────────────────────────────────────► WAITING_PAYOUT ─admin payout─► COMPLETED
   sweep at autoReleaseAt (AUTO_RELEASED, actor SYSTEM) ─────────────────────────────────────────────────────────────┘
cancel (either member) allowed only from WAITING_*_JOIN / WAITING_PAYMENT / SLIP_REVIEW ─► CANCELLED
```

Every transition writes exactly one `room_events` row in the same transaction.
Every state-changing endpoint returns the **full `Room`** so the FE re-renders from one
source (React Query invalidates `["room", code]`).

## Non-functional

- **Local only.** Both apps read their config from a git-ignored `.env`; each repo
  commits a `.env.example`. BE: `PORT=3001`, `DATABASE_PATH=data/safe-goods.sqlite`,
  `UPLOAD_DIR=uploads`, `JWT_SECRET=<any local string>`, `AUTO_RELEASE_SECONDS=259200`,
  `SWEEP_INTERVAL_MS=60000`, `CORS_ORIGIN=http://localhost:3000`, `ADMIN_*`. FE:
  `NEXT_PUBLIC_API_URL=http://localhost:3001`, `NEXTAUTH_URL=http://localhost:3000`,
  `NEXTAUTH_SECRET=<any local string>`.
- **Versions pinned exact** (no `^`/`~`) in both repos — FE uses the lockset in the
  `nextjs-antd-pattern` skill verbatim; BE pins whatever exact versions `bun add` resolves
  and records them in TASK-001 Implementation Notes.
- **Frontend working method (owner, 2026-09-21 — `SYSTEM-FACTS.md` §Frontend working method, mandatory for every FE TASK):** Fern **must invoke `impeccable`** for every screen (`frontend-design` only if/when installed — owner Q15, 2026-09-21; the "fresh, not template" bar stands); the house `nextjs-antd-pattern` skill supplies the **project structure and the way Ant Design is wired in only** — it is not a visual template. Ant Design stands (Q11, Q14). The UI is designed fresh and beautiful for เว็บกลาง — a raw AntD-template look is a defect, not a delivery. Evidence per FE TASK: the skills invoked (say so in Implementation Notes) and screenshots.
- **Thai is FE-only.** All wire strings are codes/English; every visible string comes
  from `constant/text/th.ts` = REQ-001 §User-facing wording verbatim (AC-23/24).
- **Timezone:** BE stores/sends UTC; FE renders in the browser's zone with dayjs.
- **No git writes, no deploy, by anyone.** Evidence = command output + local screens.
- **Tests:** BE `bun test` for the fee table + state-machine guards; FE has no test
  runner in this SPEC — Fern proves with `npm run build`, `npm run lint`, and screens
  against the running BE.

## Tasks

Order matters within each column; FE integration tasks depend on BE tasks because
their evidence is a screen talking to the real API.

- TASK-001: BE scaffold — Bun + Hono, Drizzle/SQLite, envelope, migration `0000_init`, seed, health — owner: BE (depends on: —)
- TASK-002: BE auth — register / login / me, JWT middleware, role guard — owner: BE (depends on: TASK-001)
- TASK-003: BE rooms core — categories, fee settings/quote, open / get / mine / join / cancel, timeline, credit — owner: BE (depends on: TASK-002)
- TASK-004: BE payment-in — slip upload, file serving, admin confirm / reject, admin room list — owner: BE (depends on: TASK-003)
- TASK-005: BE delivery → payout — evidence, deliver, parcel-arrived, received, auto-release sweep + job, admin payout, admin fee settings — owner: BE (depends on: TASK-004)
- TASK-006: FE scaffold — Next.js + Ant Design house pattern, NextAuth Credentials against BE, axios client, Thai text constants, register / login pages — owner: FE (depends on: TASK-002)
- TASK-007: FE open room + join — open-room form with live fee preview, share link, join page, "my rooms" — owner: FE (depends on: TASK-006, TASK-003)
- TASK-008: FE room page — status, guidance, credit, timeline, buyer / seller actions, countdown, read-only when closed — owner: FE (depends on: TASK-007, TASK-005)
- TASK-009: FE admin — slip queue confirm / reject, parcel arrived, payout, fee settings, auto-release trigger — owner: FE (depends on: TASK-008)
- TASK-010: FE rework from TEST-001 — R-1..R-8 (copy on screen, countdown rounds up, cancel confirm + AC-12b, non-integer price) — owner: FE (depends on: —)

## Questions

- **Q-D (Sober → Porter, 2026-09-20) — FEE_INCLUDED remainder.** With "fee included"
  and payer BUYER or SPLIT, some totals have no exact base price (e.g. T = 121, buyer
  pays: B = 100 gives 120, B = 101 gives 122). §Fee computation takes the largest B that
  fits and, **by default, adds the 1-baht remainder to the fee** so the buyer pays exactly
  the number they typed. Alternative: give the remainder to the seller. Which does the
  owner want? Not blocking — the default is implemented and switchable in one line.
- **Q-D and Q-E are answered below (Porter, 2026-09-21); the Q-E strings also live in REQ-001 §Additional wording, which is where Fern copies from.**
- **Q-E (Sober → Porter, 2026-09-20) — Missing Thai copy.** REQ-001 has no wording for
  these user-visible states; Fern may not invent them: (1) login failed (wrong email /
  password); (2) price invalid or too low (FEE_INCLUDED, `VALIDATION_ERROR`); (3) file
  rejected (not an image / over 5 MB); (4) unknown room code (404); (5) generic
  "something went wrong" (500); (6) the join page's button and the "my rooms" list title;
  (7) admin screen titles/buttons: confirm slip / reject slip (+ reason field label) /
  record payout / save fee settings / run auto-release now; (8) empty states (no rooms
  yet, no slips waiting); (9) register/login page labels (display name, email, password,
  register button, login button). Needed before TASK-006's login page and TASK-009.
  > answer (Porter, 2026-09-21) Q-D: **remainder goes to the fee** (keep the default). The owner confirmed "fee rounded up to whole baht" (REQ-001 §Fee model, "ถูก" 09-20); the buyer must pay exactly the number they typed. Also added to REQ-001 §Fee model so it is a requirement, not a default.
  > answer (Porter, 2026-09-21) Q-E — Thai copy, exact strings (also appended to REQ-001 §User-facing wording; Fern copies from there):
  > 1. Login failed: **อีเมลหรือรหัสผ่านไม่ถูกต้อง**
  > 2. Price invalid / too low: **กรุณาระบุราคาเป็นจำนวนเต็มบาท** · too low for fee-included: **ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า {min} บาท**
  > 3. File rejected: **แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG)** · over 5 MB: **ไฟล์ใหญ่เกิน 5 MB**
  > 4. Unknown room code: **ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง**
  > 5. Generic error: **เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง**
  > 6. Join page button: **เข้าร่วมห้อง** · my rooms list title: **ห้องดีลของฉัน**
  > 7. Admin: page title **แอดมิน — ตรวจสอบสลิป** · confirm **ยืนยันยอดเงิน** · reject **ปฏิเสธสลิป** · reason label **เหตุผลที่ปฏิเสธ** · payout page **โอนเงินให้ผู้ขาย** / button **บันทึกการโอนเงิน** · fee settings page **ตั้งค่าค่ากลาง** (fields **อัตราค่ากลาง (%)**, **ค่ากลางขั้นต่ำ (บาท)**) / button **บันทึกการตั้งค่า** · auto-release **รันปล่อยเงินอัตโนมัติตอนนี้**
  > 8. Empty states: no rooms **ยังไม่มีห้องดีล — กด "เปิดห้องดีล" เพื่อเริ่ม** · no slips **ไม่มีสลิปรอตรวจสอบ**
  > 9. Register/login labels: **ชื่อที่แสดง** · **อีเมล** · **รหัสผ่าน** · register button **สมัครสมาชิก** · login button **เข้าสู่ระบบ** · page titles **สมัครสมาชิก** / **เข้าสู่ระบบ** · switch links **มีบัญชีแล้ว? เข้าสู่ระบบ** / **ยังไม่มีบัญชี? สมัครสมาชิก**
- **Q-F (Sober → Porter, 2026-09-21) — `frontend-design` skill is not installed on this machine.** The owner made it mandatory (SYSTEM-FACTS §Frontend working method); Fern cannot install skills. TASK-006 was built with `impeccable` + `nextjs-antd-pattern` and passes the "fresh, not template" bar on my review. Please ask the owner: (ก) install `frontend-design` — then Fern re-runs the design pass inside TASK-007..009; or (ข) `impeccable` alone satisfies the mandate. Not blocking TASK-007.
- **Q-G (Sober → Porter, 2026-09-21) — two more Thai strings REQ-001 lacks:** (1) client-side field validation: "required", "invalid email", "password must be 8–72 characters" (SPEC endpoint 2 limits); (2) the header logout control — label text, and icon-only vs icon + text. Shipped meanwhile: submit disabled until filled + generic error; icon-only logout with an English `aria-label`. Not blocking.
  > **Q-G addendum (Sober, 2026-09-21, from TASK-007):** also (3) field label for the goods description, (4) field label for the price, (5) label for the copy-link control (icon-only today), (6) optional: a marker word for "this row is me" on the party cards (TASK-008) — today colour only.
  > **Q-G addendum 2 (Sober, 2026-09-21, from TASK-008):** (7) confirm **แนบหลักฐาน** as the evidence-upload label (the parenthetical of "ส่งของแล้ว (แนบหลักฐาน)"); (8) optional section headings over timeline / guidance / evidence — none today.
  > **Q-G addendum 3 (Sober, 2026-09-21, from TASK-009):** (9) empty-state strings for the parcel queue and the payout queue (only the slip queue has one); (10) the auto-release result line — today literally `released: N`.
- **Q-H (Sober → Porter, 2026-09-21) — admin and evidence in the room.** In REQ-001 the admin sees a room without the evidence gallery (it lives in the party action panel). No AC asks for it, so nothing changes now — but an admin judging a dispute will need it; please make REQ-002 say so explicitly.
  > answer (Porter, 2026-09-21) Q-G — exact strings (also in REQ-001 §Additional wording 2): (1) required **กรุณากรอกข้อมูลนี้** · invalid email **รูปแบบอีเมลไม่ถูกต้อง** · password **รหัสผ่านต้องมี 8–72 ตัวอักษร** · (2) logout: icon + text **ออกจากระบบ** (not icon-only; aria-label the same Thai) · (3) **รายละเอียดสินค้า** · (4) **ราคา (บาท)** · (5) **คัดลอกลิงก์** — icon + text; after copy show **คัดลอกแล้ว** for 2 s · (6) marker word **(คุณ)** after the display name on the viewer's own party card, keep the colour · (7) **แนบหลักฐาน** confirmed · (8) headings: **ไทม์ไลน์** / **คำแนะนำ** / **หลักฐานการส่งของ** · (9) parcel queue empty **ไม่มีพัสดุรอยืนยัน** · payout queue empty **ไม่มีรายการรอโอนเงิน** · (10) auto-release result **ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง** (N = 0 → **ไม่มีห้องที่ครบกำหนด**).
  > answer (Porter, 2026-09-21) Q-H: noted — REQ-002 will require the admin to see all evidence and slips inside the room.
  > answer (Porter, 2026-09-21) Q-F: taken to the owner (SYSTEM-FACTS Q15). Until he answers, `impeccable` + Sober's "fresh, not template" review stands as the bar; no rework triggered by this question.
  > answer (Porter, 2026-09-21) Q-F: owner chose (ข) — `impeccable` alone satisfies the mandate (SYSTEM-FACTS Q15). No re-run of TASK-006..009. Please drop the `frontend-design` line from the FE DoD template for future TASKs.

## Rework rulings (Sober, 2026-09-21, from TEST-001 → REQ-001 §Rework)
- **Countdown (R-6):** `remainingHours = ceil(remainingMs / 3 600 000)`; `d = floor(h / 24)`, `h = h % 24`. The BE's `autoReleaseAt` is unchanged; this is FE rendering only.
- **Cancel confirm (R-7, AC-12b):** FE-only dialog before `POST /rooms/{code}/cancel`; the BE contract does not change.
- **Non-integer price (R-8):** FE-only validation (`Number.isInteger`), mirrors the BE's `VALIDATION_ERROR` message.
- All of R-1..R-8 touch `safe-goods-front` only → one TASK (TASK-010). No BE change.
