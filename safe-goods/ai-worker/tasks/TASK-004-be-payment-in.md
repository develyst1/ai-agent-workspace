# TASK-004: BE payment-in — slip upload, file serving, admin confirm / reject, admin room list
- Source: SPEC-001
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-003

## What to do
SPEC-001 endpoints 13, 18, 19, 20, 21 plus the shared file-storage module that
TASK-005 reuses for evidence.

1. `src/lib/files.ts` — `storeUpload(c, { roomId, kind, uploadedBy })`: reads multipart
   field `file`; accepts `image/jpeg | image/png | image/webp`, ≤ 5 MB (5 242 880 bytes),
   else `400 VALIDATION_ERROR`; writes `UPLOAD_DIR/<roomId>/<fileId>.<ext>` (mkdir -p);
   inserts a `files` row; returns the `FileRef` (`url = "/api/v1/files/<id>"`).
2. `POST /api/v1/rooms/{code}/slip` — buyer only (`403` for seller/others);
   `assertStatus(WAITING_PAYMENT)`; store as `SLIP`; set `rooms.slip_file_id`, clear
   `reject_reason`; status → `SLIP_REVIEW`; event `SLIP_UPLOADED` (BUYER). A re-upload after
   a reject replaces `slip_file_id` (old file row stays — history).
3. `GET /api/v1/files/{id}` — auth; caller must be the room's buyer/seller or ADMIN, else `403`;
   streams the file with its stored `Content-Type` and `Cache-Control: private, no-store`.
4. Admin (all under `requireAdmin`):
   - `GET /api/v1/admin/rooms?status=` — optional filter, newest first, `events: []`,
     `myRole: "ADMIN"`.
   - `POST /api/v1/admin/rooms/{code}/payment/confirm` — `assertStatus(SLIP_REVIEW)`;
     `payment_confirmed_at = now`; status → `PAID_WAITING_DELIVERY`; event `PAYMENT_CONFIRMED` (ADMIN).
   - `POST /api/v1/admin/rooms/{code}/payment/reject` `{ reason 1..200 }` — `assertStatus(SLIP_REVIEW)`;
     `reject_reason = reason`; status → `WAITING_PAYMENT`; event `PAYMENT_REJECTED` with `note = reason`.
5. Serializer: `payment.slip` resolves `slip_file_id` → `FileRef`; `payment.rejectReason`, `payment.confirmedAt`.

## Definition of Done
Use a room from TASK-003's flow (A seller, B buyer, joined). Put a small PNG in
`ai-worker/tests/harness/` for uploads if you need one (throwaway, never in the product repo).
- [x] B `curl -F file=@slip.png .../rooms/{code}/slip` → `SLIP_REVIEW`, `payment.slip.url` set, `payment.rejectReason null`, last event `SLIP_UPLOADED` — paste (AC-9).
- [x] A (seller) tries the same → `403`; B uploads a `.txt` → `400 VALIDATION_ERROR`; B uploads a 6 MB file → `400` — paste.
- [x] Admin `GET /admin/rooms?status=SLIP_REVIEW` lists it; normal user on the same URL → `403` — paste both (AC-27).
- [x] Admin `reject {"reason":"ยอดไม่ตรง"}` → `WAITING_PAYMENT`, `payment.rejectReason = "ยอดไม่ตรง"`, event `PAYMENT_REJECTED.note` = same — paste (AC-11).
- [x] B re-uploads → `SLIP_REVIEW`, `rejectReason null`; admin `confirm` → `PAID_WAITING_DELIVERY`, `payment.confirmedAt` set, event `PAYMENT_CONFIRMED` with `actorRole ADMIN` and `actorDisplayName` — paste (AC-10).
- [x] After confirm: B `POST /cancel` → `409 INVALID_STATE` and `canCancel false` in the room — paste (AC-13).
- [x] `GET /files/{slipId}` as B → 200 with `content-type: image/png`; as user C → `403`; unknown id → `404` — paste headers.
- [x] `bun test` green (add: slip state guard + admin guard).

## Implementation Notes
(Jason, 2026-09-20. Local only — server `bun src/index.ts` on 3001, room `6P9DSUFB` (A seller / B buyer, from the TASK-003 users), admin = seeded `admin@local.test`. Upload fixture: `ai-worker/tests/harness/slip.png` (70-byte 1×1 PNG). No git write.)

**Files:** `src/lib/files.ts` (`storeUpload` — multipart `file`, jpeg/png/webp, ≤ 5 242 880 bytes else `400 VALIDATION_ERROR`; writes `UPLOAD_DIR/<roomId>/<fileId>.<ext>`, inserts `files`, returns `FileRef`; `absoluteUploadPath`), `src/routes/files.ts` (endpoint 18: member or admin, else 403; binary with stored `Content-Type` + `Cache-Control: private, no-store`), `src/routes/admin.ts` (`requireAuth`+`requireAdmin` on the router; endpoints 19/20/21), `POST /rooms/{code}/slip` added to `src/routes/rooms.ts`, `assertParty(room, viewer, …roles)` → 403 added to `src/serializers/room.ts` (TASK-005 reuses it). Serializer already resolved `payment.slip` / `rejectReason` / `confirmedAt` in TASK-003. Test setup now points `UPLOAD_DIR` at the OS temp dir.
Note on atomicity: `storeUpload` is async (disk write) and bun-sqlite transactions are sync, so the `files` row is inserted first and the room update + event run in one transaction after it. A failure in between leaves an orphan file row, never a half-updated room.
`GET /admin/rooms?status=` validates `status` against the enum (`400` on an unknown value).

**`bun test`** (`src/routes/payment.test.ts` added: 403 for seller/outsider, .txt + 5 MB+1 → 400 with room untouched, slip → SLIP_REVIEW + FileRef + re-upload 409, files 200/403/404/401 with byte-equal body, admin list + filter + `myRole ADMIN` + AC-27 403s, reject → reason on room and event (Thai, exact match) → re-upload clears → confirm → PAID_WAITING_DELIVERY, cancel/reject after confirm 409):
```
 39 pass
 0 fail
 151 expect() calls
Ran 39 tests across 5 files. [1110.00ms]
```
`bunx tsc --noEmit` → exit 0.

**DoD curls** (`Room` bodies condensed to `{code,status,canCancel,payment,lastEvent}`):
```
B  curl -F "file=@slip.png;type=image/png" /rooms/6P9DSUFB/slip → 200
   {"code":"6P9DSUFB","status":"SLIP_REVIEW","canCancel":true,"payment":{"slip":{"id":"088a06c7-23d6-492f-97ba-ff44d9938d47","kind":"SLIP","fileName":"slip.png","mimeType":"image/png","sizeBytes":70,"uploadedAt":"2026-09-20T16:50:40.528Z","url":"/api/v1/files/088a06c7-23d6-492f-97ba-ff44d9938d47"},"rejectReason":null,"confirmedAt":null},"lastEvent":{"id":6,"type":"SLIP_UPLOADED","actorRole":"BUYER","actorDisplayName":"B-buyer","note":null,"createdAt":"2026-09-20T16:50:40.542Z"}}
A  (seller) same upload → 403 {"success":false,"error":{"code":"FORBIDDEN","message":"this action is for BUYER of room 6P9DSUFB"}}
B  upload slip.txt (text/plain) → 400 {"success":false,"error":{"code":"VALIDATION_ERROR","message":"unsupported file type text/plain;charset=utf-8; allowed: image/jpeg, image/png, image/webp"}}
B  upload 6 MB png → 400 {"success":false,"error":{"code":"VALIDATION_ERROR","message":"file too large (6291456 bytes); max 5242880"}}
ADMIN GET /admin/rooms?status=SLIP_REVIEW → 200 [{"code":"6P9DSUFB","status":"SLIP_REVIEW","myRole":"ADMIN","events":[],"slip":"088a06c7-…"}]
B     GET /admin/rooms?status=SLIP_REVIEW → 403 {"success":false,"error":{"code":"FORBIDDEN","message":"admin only"}}
ADMIN POST /payment/reject {"reason":"ยอดไม่ตรง"} → 200
   {"code":"6P9DSUFB","status":"WAITING_PAYMENT","canCancel":true,"payment":{"slip":{"id":"088a06c7-…"},"rejectReason":"ยอดไม่ตรง","confirmedAt":null},"lastEvent":{"id":7,"type":"PAYMENT_REJECTED","actorRole":"ADMIN","actorDisplayName":"Admin","note":"ยอดไม่ตรง",…}}
   (first attempt with a `-d '…ยอดไม่ตรง…'` literal showed `?????????` — git-bash mangled the bytes before sending; re-run on room VJK2Y72E with `--data-binary @reason.json` (UTF-8):
   {"code":"VJK2Y72E","status":"WAITING_PAYMENT","rejectReason":"ยอดไม่ตรง","note":"ยอดไม่ตรง","type":"PAYMENT_REJECTED","equalsThai":true})
B  re-upload slip.png → 200 {"status":"SLIP_REVIEW","payment":{"slip":{"id":"1484e0df-23ba-4d88-86ab-b534f93d6e71",…},"rejectReason":null,…},"lastEvent":{"id":8,"type":"SLIP_UPLOADED","actorRole":"BUYER",…}}   (old file row 088a06c7 kept; both files on disk under uploads/<roomId>/)
ADMIN POST /payment/confirm → 200 {"status":"PAID_WAITING_DELIVERY","canCancel":false,"payment":{…,"confirmedAt":"2026-09-20T16:50:40.934Z"},"lastEvent":{"id":9,"type":"PAYMENT_CONFIRMED","actorRole":"ADMIN","actorDisplayName":"Admin",…}}
B  POST /cancel → 409 {"success":false,"error":{"code":"INVALID_STATE","message":"room 6P9DSUFB is PAID_WAITING_DELIVERY; cannot cancel"}}
B  GET /rooms/6P9DSUFB → {"status":"PAID_WAITING_DELIVERY","canCancel":false,"confirmedAt":"2026-09-20T16:50:40.934Z"}
B  curl -I /files/088a06c7-23d6-492f-97ba-ff44d9938d47 → HTTP/1.1 200 OK · Content-Type: image/png · Cache-Control: private, no-store · content-length: 70
C  same → HTTP/1.1 403 Forbidden
B  /files/00000000-0000-4000-8000-000000000000 → HTTP/1.1 404 Not Found
```
**`git status --short`:** unchanged set — no commit/branch/tag. `uploads/` is git-ignored (not listed).

**UNVERIFIED:** nothing in the DoD.

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** All DoD lines evidenced, Thai reject reason proven byte-exact (good catch on the git-bash mangling — Tanya will hit the same; note kept). File serving is auth-gated and uses ids for paths (no traversal). The files-row-before-transaction ordering is accepted as documented (orphan file row at worst).
Observed, **not** rework: the MIME check trusts the client's declared `file.type`. Fine for local and REQ-001; if the owner ever exposes this, a magic-bytes sniff is a one-line hardening. Logged here so it is not forgotten.
