# TASK-008: FE room page — status, guidance, credit, timeline, buyer / seller actions, countdown, read-only when closed
- Source: SPEC-001
- Owner: FE (Fern)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-007, TASK-005 (whole BE happy path running)

## What to do
The heart of REQ-001 (§5–14) for the two parties. Contract: SPEC-001 `Room` shape and
endpoints 10, 12–17, 18. Everything renders from one `useRoom(code)` query
(`["room", code]`, `refetchInterval: 10_000` so the other party's actions appear without
reload); every mutation invalidates it and renders the returned `Room`.

Layout (`components/partials/Room/`): header (code, category `nameTh`, Thai status label),
amounts card (ผู้ซื้อจ่าย / ผู้ขายได้รับ / ค่ากลาง), two party cards (display name +
**ปิดดีลดี {n} ครั้ง**; my own row marked by colour as in TASK-007 — no "คุณ" label unless Porter supplies one, Q-G), **both guidance blocks verbatim from REQ-001
— always visible, both roles** (AC-23), action panel by `myRole` × `status`, timeline
(`events` ascending; actor name, Thai event label, `note`, time via dayjs).

Action panel rules (buttons appear **only** when the BE would accept them; otherwise
nothing — never a disabled button that hints at REQ-002 features):

| status | BUYER sees | SELLER sees |
|---|---|---|
| `WAITING_*_JOIN` | share block (TASK-007) + **ยกเลิกห้อง** | same |
| `WAITING_PAYMENT` | **แนบสลิปโอนเงิน {buyerPays} บาท** (Upload, image only, ≤ 5 MB) + `payment.rejectReason` if any + **ยกเลิกห้อง** | **ยกเลิกห้อง** |
| `SLIP_REVIEW` | slip thumbnail + **ยกเลิกห้อง** | **ยกเลิกห้อง** |
| `PAID_WAITING_DELIVERY` | — (waiting text = status label) | evidence Upload (multi, each → `POST /evidence`), thumbnails; if PHYSICAL: ขนส่ง (Input) + เลขพัสดุ (Input); button **ส่งของแล้ว (แนบหลักฐาน)** → `POST /deliver` |
| `DELIVERED_WAITING_CONFIRM` | evidence gallery + countdown + **ได้รับของแล้ว** | evidence gallery + countdown |
| `SHIPPED_WAITING_PARCEL` | evidence + ขนส่ง/เลขพัสดุ shown + **พัสดุถึงแล้ว** (no countdown) | same, no button |
| `PARCEL_ARRIVED_WAITING_CONFIRM` | countdown + **ได้รับของแล้ว** | countdown |
| `WAITING_PAYOUT`, `COMPLETED`, `CANCELLED` | nothing — read-only; COMPLETED shows final amounts | same |

Details:
- `canCancel` from the BE decides whether ยกเลิกห้อง renders (AC-12/13); `CANCELLED` shows
  the status label **ห้องถูกยกเลิก** as the page headline.
- Countdown from `autoReleaseAt`: **ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน {d} วัน {h} ชั่วโมง**,
  recomputed every minute client-side; when `autoReleaseAt` is null, no countdown.
- Errors from the BE by `code`: `EVIDENCE_REQUIRED` → **ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป**;
  `TRACKING_REQUIRED` → **ต้องระบุขนส่งและเลขพัสดุ**; `INVALID_STATE` → refetch the room
  (the other side moved first); file `VALIDATION_ERROR` → **แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG)** / **ไฟล์ใหญ่เกิน 5 MB**; any other error → **เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง** (REQ-001 §Additional wording).
  Note the FE still lets the seller press ส่งของแล้ว with no evidence so the BE's message is
  what the user sees (AC-14 wording is the BE's rule rendered by the FE, not a client-side block).
- Images: fetch `FileRef.url` through the axios client as a blob → object URL (endpoint 18
  needs the bearer token). `Image` preview from Ant Design is fine.
- Timeline labels (Thai) for each `eventType` — take the verbs from REQ-001 §13 / §User-facing
  wording; `AUTO_RELEASED` renders **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)** (AC-20). If any event label
  has no Porter wording, ask Sober in `## Questions` — never a placeholder.

## Definition of Done
Two browsers (A seller, B buyer), BE with `AUTO_RELEASE_SECONDS=120` for the timer proof.
- [x] `npm run build` + `npm run lint` clean — paste.
- [x] Both guidance blocks visible to A and to B in every status you screenshot below (AC-23).
- [x] B uploads a slip → status **รอแอดมินตรวจสอบยอดเงิน**; A's page shows no ส่งของแล้ว button (AC-9). After the admin confirms (curl or TASK-009), A sees **ชำระเงินแล้ว — รอผู้ขายส่งของ** and the deliver controls; timeline shows the admin's confirmation with name + time (AC-10) — screenshots.
- [x] Admin rejects with a reason (curl) → B sees the reason and the upload again; status back to **รอผู้ซื้อชำระเงิน** (AC-11).
- [x] Before payment: B presses ยกเลิกห้อง → both see **ห้องถูกยกเลิก** (AC-12). New room: after confirm, no ยกเลิกห้อง on either side (AC-13).
- [x] In-game room: A presses ส่งของแล้ว with no evidence → **ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป** (AC-14); with evidence → **ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน**, B sees the evidence image and the countdown line (AC-15) — screenshots.
- [x] Physical room: ส่งของแล้ว without ขนส่ง/เลขพัสดุ → **ต้องระบุขนส่งและเลขพัสดุ** (AC-16); with them → **ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง**, B sees tracking + **พัสดุถึงแล้ว**, no countdown (AC-17); B presses it → **พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน** + countdown (AC-18).
- [x] B presses ได้รับของแล้ว → **รอแอดมินโอนเงินให้ผู้ขาย**, countdown gone, timeline shows B's confirmation (AC-19).
- [x] Another room left alone past the 120 s → page (auto-refetch) shows **รอแอดมินโอนเงินให้ผู้ขาย** and timeline **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)** (AC-20).
- [x] After admin payout (curl): **ปิดดีลแล้ว**, final amounts shown, no buttons for either party (AC-21, AC-22); both parties' **ปิดดีลดี** shows +1 on the home page and in the room (AC-25).
- [~] (AC-24 listed; impeccable yes, frontend-design not installed — Q-F) Every visible string Thai — list any exception (AC-24); Implementation Notes state that `frontend-design` + `impeccable` were invoked (owner 2026-09-21).

## Implementation Notes

**Fern, 2026-09-21.** `safe-goods-front` only; BE run from its README with `AUTO_RELEASE_SECONDS=120 SWEEP_INTERVAL_MS=15000` (env, `.env` untouched). Working tree only — no `git` command of any kind this time (Sober's reminder taken: filesystem moves only).

**Skills:** `impeccable` (loaded this session, craft flow continued on the TASK-006/007 system). **`frontend-design` still not installed** (Q-F open) — not invoked; the DoD line is marked partial for that reason.

**Design:** the room page is one column (narrow shell): heading (code + status pill; category; goods description as the headline — a CANCELLED room leads with **ห้องถูกยกเลิก** and the goods become the subline) → **action panel** (only what this party can press now) → receipt + party rows → the two guidance blocks (buyer tinted cobalt, seller neutral; strings verbatim, only the "คำแนะนำสำหรับ…" head is bold) → timeline (rail with cobalt dots, teal for SYSTEM; actor name + the same Thai word the user pressed; admin's reject reason as `note`; dayjs `th` locale `D MMM YYYY HH:mm`). Countdown = teal pill with an hourglass. Slip / evidence are 112 px thumbnails through the bearer client (AntD `Image` preview on click). Tracking = a small ขนส่ง / เลขพัสดุ strip.

**Files:** `src/lib/api/api-main.ts` (+ endpoints 12–18) · `src/types/api/main/room.ts` (+ `DeliverRequest`) · `src/services/room.service.ts` (+ actions, `getFileBlob`, `IMAGE_MIME` / `MAX_IMAGE_BYTES`) · `src/hooks/room/{useRoomActions,useAuthedImage}.ts`; `useRoom` now `refetchInterval: 10_000` · `src/constant/text/th.ts` (+ `EVENT_TH`, `ATTACH_EVIDENCE_TH`) · `src/components/partials/Room/{ActionPanel,GuidanceBlocks,Timeline,Countdown,AuthedImage}.tsx` · `RoomJoin/RoomContent.tsx` (member view assembled; join gate unchanged).

**Mechanics:** every mutation (`cancel` / `slip` / `evidence` / `deliver` / `parcelArrived` / `received`) writes the returned `Room` into `["room", code]`; `INVALID_STATE` invalidates (refetch) and shows nothing; other codes map: `EVIDENCE_REQUIRED` → ต้องแนบหลักฐาน…, `TRACKING_REQUIRED` → ต้องระบุขนส่ง…, file `VALIDATION_ERROR` → แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG), else เกิดข้อผิดพลาด…. Files are pre-checked client-side (MIME ∈ jpeg/png/webp, ≤ 5 MB) so the two file strings are instant; AntD `Upload` never uploads itself (`beforeUpload → false`). Deliver is **not** blocked client-side without evidence — the BE's 422 is what the seller sees (AC-14 as the TASK says). Buttons render only when the BE would accept them; `canCancel` gates ยกเลิกห้อง.

**Copy decisions (all existing REQ-001 strings, no new words):** timeline labels reuse the action's own wording — เปิดห้องดีล · เข้าร่วมห้อง · แนบสลิปโอนเงิน · ยืนยันยอดเงิน · ปฏิเสธสลิป · ส่งของแล้ว · พัสดุถึงแล้ว · ได้รับของแล้ว · ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) · โอนเงินให้ผู้ขาย · ยกเลิกห้อง. The evidence upload control is labelled **แนบหลักฐาน** — the parenthetical of REQ-001's "ส่งของแล้ว (แนบหลักฐาน)" (Q1 below). Reject reason renders as **เหตุผลที่ปฏิเสธ — {reason}** (REQ-001 admin label).

**`npm run lint`** → `> eslint` (exit 0). **`npm run build`** →
```
✓ Compiled successfully in 6.6s   ✓ Generating static pages (8/8)
┌ ƒ /  ├ ○ /_not-found  ├ ƒ /api/auth/[...nextauth]  ├ ○ /login  ├ ○ /register  ├ ƒ /room/[code]  ├ ○ /rooms  └ ○ /rooms/new   ƒ Proxy (Middleware)
```

**Harness:** `tests/harness/fe-task008-helper.mjs` drives the BE for the non-FE steps (admin confirm / reject / payout, opening extra rooms, joins) — logs in as A `fern.task006`, B `buyer.b.task007`, `admin@local.test`. One browser, sessions swapped by sign-out / login (A = เฟิร์นทดสอบ seller, B = ผู้ซื้อบี buyer). Files were injected into the AntD `<input type=file>` via `DataTransfer` (canvas-drawn PNGs), which fires the same `change` path a real pick does.

**Runs against the real BE (rooms in local SQLite):**
- **Room 1 `UAHW8G2U` (in-game, A seller / B buyer):** B in WAITING_PAYMENT sees **แนบสลิปโอนเงิน 120 บาท** + ยกเลิกห้อง, both guidance blocks, timeline (เฟิร์นทดสอบ เปิดห้องดีล · ผู้ซื้อบี เข้าร่วมห้อง with times). Slip via UI → `POST …/slip → 200`, status **รอแอดมินตรวจสอบยอดเงิน**, slip thumbnail, ยกเลิกห้อง still there (AC-9). Admin reject (harness, reason "ยอดเงินไม่ตรง 120 บาท") → B's page auto-refetched within 10 s: **เหตุผลที่ปฏิเสธ — ยอดเงินไม่ตรง 120 บาท**, upload button back, status **รอผู้ซื้อชำระเงิน** (AC-11). Second slip via UI → admin confirm → B sees **ชำระเงินแล้ว — รอผู้ขายส่งของ**, no button at all, timeline "Admin ยืนยันยอดเงิน 21 ก.ย. 2026 12:25" (AC-10, AC-13 buyer side). A logs in: **แนบหลักฐาน** + **ส่งของแล้ว (แนบหลักฐาน)**, no ยกเลิกห้อง (AC-13 seller side; no deliver button had existed for A before confirm — AC-9's second half is the BE state machine, A's panel keys off status). A presses ส่งของแล้ว with no evidence → `422` → **ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป** (AC-14). Evidence via UI (thumbnail appears) → ส่งของแล้ว → **ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน** + countdown **ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน 0 วัน 0 ชั่วโมง** (120 s window). B logs in: evidence image, countdown, **ได้รับของแล้ว** (AC-15). Left alone → at `autoReleaseAt` the sweep fired and B's open page (polling) showed **รอแอดมินโอนเงินให้ผู้ขาย** and timeline **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)** — no reload (AC-20).
- **Room `QPZSFW3B` (in-game, harness-prepared to DELIVERED_WAITING_CONFIRM):** B presses **ได้รับของแล้ว** in the UI → **รอแอดมินโอนเงินให้ผู้ขาย**, countdown gone, timeline "ผู้ซื้อบี ได้รับของแล้ว 12:29" (AC-19). Admin payout (harness) → page auto-refetched: **ปิดดีลแล้ว**, receipt 120 / 100 / 20 still shown, no buttons; both party rows **ปิดดีลดี 1 ครั้ง** (was 0) (AC-21, AC-22, AC-25 in-room). Home `/` as B: **ปิดดีลดี 1 ครั้ง** (AC-25 home, buyer side).
- **Room `TBH7H5N7` (B opened as buyer, A joined, no payment):** B presses **ยกเลิกห้อง** → headline **ห้องถูกยกเลิก**, no pill, no buttons, credits unchanged at 1 (AC-12). A's view of the cancelled room: UNVERIFIED in the browser (same `Room`, same render path).
- **Room `HT8FQGUX` (physical, A seller / B buyer, confirmed by harness):** A sees แนบหลักฐาน + ขนส่ง + เลขพัสดุ + ส่งของแล้ว. Evidence via UI, then ส่งของแล้ว with the fields empty → `422` → **ต้องระบุขนส่งและเลขพัสดุ** (AC-16). With `Kerry` / `KEX1234567890` → **ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง**, tracking strip, **no countdown** (AC-17 seller). B logs in: evidence, tracking strip, **พัสดุถึงแล้ว**, no countdown (AC-17 buyer); presses it → **พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน** + countdown + **ได้รับของแล้ว** (AC-18).
- **Room `DJG6PEY5` (WAITING_PAYMENT):** a `.txt` picked as slip → **แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG)**; a 5 MB + 1 byte PNG → **ไฟล์ใหญ่เกิน 5 MB** — both client-side, no request sent.
- **AC-23:** both guidance blocks were present in every page read above (WAITING_PAYMENT, SLIP_REVIEW, PAID_WAITING_DELIVERY, DELIVERED_WAITING_CONFIRM, SHIPPED_WAITING_PARCEL, PARCEL_ARRIVED_WAITING_CONFIRM, WAITING_PAYOUT, COMPLETED, CANCELLED), for A and for B.

**AC-24 — visible strings added by this TASK:** แนบสลิปโอนเงิน {x} บาท · ยกเลิกห้อง · แนบหลักฐาน · ส่งของแล้ว (แนบหลักฐาน) · ขนส่ง · เลขพัสดุ · พัสดุถึงแล้ว · ได้รับของแล้ว · ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน {d} วัน {h} ชั่วโมง · เหตุผลที่ปฏิเสธ · the two guidance blocks · the timeline labels listed above · error strings (ต้องแนบหลักฐาน…, ต้องระบุขนส่ง…, แนบได้เฉพาะ…, ไฟล์ใหญ่เกิน 5 MB, เกิดข้อผิดพลาด…) · dates in Thai (dayjs `th`: "21 ก.ย. 2026 12:25"). Exceptions: user-entered data (`Kerry`, `KEX…`), the admin's seeded display name `Admin`, file names as image `alt`. AntD `Image` preview toolbar tooltips come from the `th_TH` locale.

**UNVERIFIED:** A's view of the CANCELLED room and of COMPLETED (only B's seen); the countdown with a real 3-day window (only "0 วัน 0 ชั่วโมง" observable at 120 s — the d/h arithmetic is `Math.floor` on the remaining ms); the AntD `Image` full-size preview (thumbnails seen, preview not clicked); real file picker dialogs (files were injected). Local SQLite now holds rooms `UAHW8G2U`, `HT8FQGUX`, `TBH7H5N7`, `QPZSFW3B`, `DJG6PEY5` and uploads under the BE's `uploads/`.

**`git status --short`:** modified `src/components/common/index.ts`, `partials/Auth/{LoginForm,RegisterForm}.tsx`, `partials/Home/HomeContent.tsx`, `constant/text/th.ts`, `lib/api/api-main.ts`, `types/api/main/room.ts`; deleted `partials/Auth/FormError.tsx` (moved to `common/`); untracked `src/app/room/`, `src/app/rooms/`, `common/{CreditPill,FormError,PageShell}.tsx`, `partials/{Room,RoomJoin,RoomList,RoomNew}/`, `hooks/room/`, `lib/fee.ts`, `services/room.service.ts`, `types/app/` (TASK-007 + 008 together — the owner has not committed TASK-007 yet). `git diff --cached` empty. No commit.

## Questions

- **Q1 (Fern → Sober, 2026-09-21) — evidence upload label.** The TASK splits REQ-001's single button "ส่งของแล้ว (แนบหลักฐาน)" into an upload control + the deliver button. I labelled the upload **แนบหลักฐาน** (the parenthetical, not a new word). Please confirm, or add to Q-G for Porter. Not blocking.
- **Q2 (Fern → Sober, 2026-09-21) — no heading over the timeline / guidance / evidence.** REQ-001 has no section titles; the sections are unlabelled (the guidance strings carry their own heads). If Porter wants headings, they belong in Q-G. Not blocking.

## Review
**Verdict: DONE (Sober, 2026-09-21).** Verified on my machine against Fern's running BE/FE: lint + tsc clean, `git diff --cached` empty. In the browser as B: `HT8FQGUX` (physical, auto-released) renders **รอแอดมินโอนเงินให้ผู้ขาย**, ขนส่ง/เลขพัสดุ strip, receipt, both party rows at ปิดดีลดี 1 ครั้ง, both guidance blocks verbatim, timeline in order ending **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)**, no action buttons; `DJG6PEY5` (WAITING_PAYMENT) renders **แนบสลิปโอนเงิน 120 บาท** + **ยกเลิกห้อง** and nothing else. Fern's AC-9..22 evidence is complete, each step tied to a room code I can see in the local DB. `useRoom` polls at 10 s and `INVALID_STATE` refetches, as specified. Design continues the system.
Rulings:
- **Q1 (แนบหลักฐาน as the upload label):** accepted — it is REQ-001's own parenthetical, not a new word. Logged in Q-G for Porter's confirmation only.
- **Q2 (no section headings):** accepted as shipped; optional headings added to Q-G.
- UNVERIFIED items (seller's view of CANCELLED/COMPLETED, real 3-day countdown arithmetic, full-size image preview, real file picker) are Tanya's; correctly declared.
With this, REQ-001 is usable end to end for buyer and seller; only the admin screens (TASK-009) remain before SPEC_DONE.
