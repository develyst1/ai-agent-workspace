# TASK-009: FE admin — slip queue confirm / reject, parcel arrived, payout, fee settings, auto-release trigger
- Source: SPEC-001
- Owner: FE (Fern)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-008

## What to do
The minimum admin screens REQ-001 §Constraints allows (everything else admin is
REQ-003). Contract: SPEC-001 endpoints 16, 19–24. Route group `/admin/**`, guarded by
the middleware from TASK-006 (role `ADMIN`) — the BE guards too.

1. `/admin` — three tabs/sections driven by `GET /admin/rooms?status=…`:
   - **Slip review** (`SLIP_REVIEW`): table of rooms (code, buyer, seller, buyerPays, slip
     thumbnail via the authenticated blob loader, uploaded time). Row actions: confirm →
     `POST …/payment/confirm`; reject → Modal with a reason `TextArea` (1..200) →
     `POST …/payment/reject`. Table refetches after each.
   - **Parcels** (`SHIPPED_WAITING_PARCEL`): code, parties, courier + tracking; action →
     `POST /rooms/{code}/parcel-arrived` (admin passes the role check).
   - **Payouts** (`WAITING_PAYOUT`): code, seller display name, **sellerReceives** (the
     amount the admin transfers manually), releasedBy (ผู้ซื้อยืนยัน / อัตโนมัติ), releasedAt;
     action → `POST …/payout`.
2. `/admin/settings` — form with feeRatePercent (0..100) and feeMinimum (≥ 0) prefilled from
   `GET /fee/settings`; save → `PUT /admin/fee-settings`. Plus a button that calls
   `POST /admin/jobs/auto-release` and shows `{ released }` (Tanya's AC-20 lever).
3. Room link on every row → `/room/{code}` (the admin sees the room with `myRole: "ADMIN"` —
   TASK-008's page must render without an action panel for ADMIN; adjust there if it doesn't
   and say so in the notes).
4. All titles, buttons, labels and empty states are in **REQ-001 §Additional wording (items 7–8)**:
   แอดมิน — ตรวจสอบสลิป · ยืนยันยอดเงิน · ปฏิเสธสลิป · เหตุผลที่ปฏิเสธ · โอนเงินให้ผู้ขาย / บันทึกการโอนเงิน ·
   ตั้งค่าค่ากลาง (อัตราค่ากลาง (%), ค่ากลางขั้นต่ำ (บาท)) / บันทึกการตั้งค่า · รันปล่อยเงินอัตโนมัติตอนนี้ ·
   ไม่มีสลิปรอตรวจสอบ. Copy verbatim; nothing to invent.

## Definition of Done
Logged in as the seeded admin, BE running; use rooms created via the FE by two normal users.
- [x] `npm run build` + `npm run lint` clean — paste.
- [x] Slip review tab lists a room in `SLIP_REVIEW` with the slip image visible; **confirm** moves it out of the tab and the buyer/seller room page shows **ชำระเงินแล้ว — รอผู้ขายส่งของ** (AC-10) — screenshots.
- [x] **Reject** with reason "ยอดไม่ตรง" → the buyer's room page shows the reason (AC-11) — screenshot.
- [x] Parcels tab: admin marks a physical room's parcel arrived → the buyer's room shows **พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน** and the timeline's actor is the admin (AC-18).
- [x] Payouts tab shows **sellerReceives** for a `WAITING_PAYOUT` room; **payout** → room **ปิดดีลแล้ว**; both parties' credit +1 (AC-21).
- [x] Settings: set 10 / 30, open `/rooms/new` as a user with price 100 → ค่ากลาง 30; the old room still shows ค่ากลาง 20 (AC-5). Restore 20 / 20 — screenshots.
- [x] Auto-release button: with `AUTO_RELEASE_SECONDS=5`, a room past its time → button shows `released: 1`; the room page shows **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)** (AC-20).
- [x] As a normal user, typing `/admin` and `/admin/settings` in the URL bar → redirected to `/` (AC-27).
- [~] (impeccable yes; frontend-design not installed — Q-F) Implementation Notes state that `frontend-design` + `impeccable` were invoked (owner 2026-09-21); admin screens are designed, not the AntD default table look.

## Implementation Notes

**Fern, 2026-09-21.** `safe-goods-front` only; no git commands. BE run from its README with `AUTO_RELEASE_SECONDS=5 SWEEP_INTERVAL_MS=600000` (env only — the interval sweep effectively off so the **button** is what releases; `.env` untouched).

**Skills:** `impeccable` (this session's craft flow, same system). **`frontend-design` still not installed** (Q-F) — not invoked; DoD line marked partial.

**Design:** admin is a work queue, so `/admin` is three queues behind one `Segmented` switch (with live counts), one visible at a time, the h1 = that queue's REQ-001 title. Rows, not an AntD table: slip rows lead with the 112 px slip thumbnail (bearer-fetched), then code (link to the room) · goods · ผู้ซื้อ / ผู้ขาย · upload time, the buyer's amount large, and the two actions stacked (ยืนยันยอดเงิน primary, ปฏิเสธสลิป outlined danger). Reject = a small `Modal` titled **เหตุผลที่ปฏิเสธ** with a 200-char `TextArea` and one danger button **ปฏิเสธสลิป** (no other copy exists; the X closes it). Parcel rows show ขนส่ง / เลขพัสดุ + **พัสดุถึงแล้ว**. Payout rows show **ผู้ขายได้รับ {n} บาท** in teal (the number the admin transfers), how it was released in REQ words (**ได้รับของแล้ว** or **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)**) + time, and **บันทึกการโอนเงิน**. `/admin/settings` = the two-field form + save with a small "✓ 20% · 20 บาท" confirmation, and below a rule the **รันปล่อยเงินอัตโนมัติตอนนี้** button with a `released: N` pill. Admins get a header link **แอดมิน — ตรวจสอบสลิป** (REQ page title) on every page; the lists poll every 15 s.

**Files:** `src/lib/api/api-main.ts` (+ endpoints 19–24) · `src/services/admin.service.ts` · `src/hooks/admin/useAdmin.ts` (`useAdminRooms`, `useAdminActions` — confirm / reject / parcelArrived / payout / autoRelease, each invalidating all admin lists + the room; `useUpdateFeeSettings` writes the fee-settings cache) · `src/components/partials/Admin/{AdminQueues,AdminSettings}.tsx` · pages `src/app/admin/page.tsx`, `src/app/admin/settings/page.tsx` · `AppHeader` (+ `isAdmin` link), `PageShell` / `HomeContent` pass the role.

**Step 3 (admin on the room page):** TASK-008's `ActionPanel` already returns null for `myRole === "ADMIN"` — verified on `HT8FQGUX` as admin: heading, receipt, parties, guidance, timeline, no buttons. No change needed. Observed, not changed: the admin therefore also does not see the evidence gallery on the room page (it lives inside the panel) — the queues show what the admin acts on; say if you want it.

**Copy:** every visible string is REQ-001's — §Additional wording 7–8 for the admin screens; the parcel queue's title/tab is the status label **ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง**; released-by uses the two REQ event/button strings above. **Two gaps (Q1):** REQ-001 has no empty-state string for the parcel and payout queues (only **ไม่มีสลิปรอตรวจสอบ**) — those show an empty dashed rule with no words; and the auto-release result is the TASK's literal `released: N` (English word — listed under AC-24 exceptions).

**`npm run lint`** → `> eslint` (exit 0). **`npm run build`** →
```
✓ Compiled successfully in 5.3s   ✓ Generating static pages (10/10)
┌ ƒ /  ├ ○ /_not-found  ├ ○ /admin  ├ ○ /admin/settings  ├ ƒ /api/auth/[...nextauth]  ├ ○ /login  ├ ○ /register  ├ ƒ /room/[code]  ├ ○ /rooms  └ ○ /rooms/new   ƒ Proxy (Middleware)
```

**Runs (one browser; A = เฟิร์นทดสอบ seller, B = ผู้ซื้อบี buyer, seeded `admin@local.test` "Admin"; rooms opened/joined and slips attached by `tests/harness/fe-task008-helper.mjs` — those screens are TASK-007/008's; every admin action below was pressed in the admin UI):**
- **AC-27:** logged in as B, typed `/admin/settings` → `location.href` = `http://localhost:3000/`; typed `/admin` → `/`.
- **Slip queue:** as admin, `/admin` lists `NMD3JU3E` and `DJG6PEY5` (SLIP_REVIEW) with the slip image, ผู้ซื้อ/ผู้ขาย, upload time, **ผู้ซื้อจ่าย 120 บาท**, counts "แอดมิน — ตรวจสอบสลิป 2 · ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง 1 · โอนเงินให้ผู้ขาย 5".
  - **Reject** `NMD3JU3E` with "ยอดไม่ตรง" → row gone (count 1); B's room page: **เหตุผลที่ปฏิเสธ — ยอดไม่ตรง**, upload button back, status **รอผู้ซื้อชำระเงิน** (AC-11). BE timeline: `PAYMENT_REJECTED:ADMIN:Admin:ยอดไม่ตรง`.
  - **Confirm** `DJG6PEY5` → queue empty → **ไม่มีสลิปรอตรวจสอบ**; BE state `PAID_WAITING_DELIVERY`, event `PAYMENT_CONFIRMED:ADMIN:Admin` (AC-10). The buyer/seller page for this exact room was not opened — UNVERIFIED in the browser; TASK-008 proved that render on `UAHW8G2U` after the same endpoint.
- **Parcel queue:** `B7P8MQ8M` (physical, ขนส่ง Flash · เลขพัสดุ TH9988776655) → **พัสดุถึงแล้ว** → row gone. B's room page timeline: **Admin พัสดุถึงแล้ว 13:00** (AC-18, actor = admin); with the 5 s timer it then auto-released, so B sees **รอแอดมินโอนเงินให้ผู้ขาย** rather than the countdown state.
- **Payout queue:** 5 rows, each **ผู้ขายได้รับ 100 บาท** + released-by (ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) / ได้รับของแล้ว) + time. **บันทึกการโอนเงิน** on `HT8FQGUX` → row gone (count 4); room page as admin: **ปิดดีลแล้ว**, receipt, ผู้ซื้อบี **ปิดดีลดี 2 ครั้ง**, เฟิร์นทดสอบ **ปิดดีลดี 2 ครั้ง** (both were 1 — AC-21).
- **Settings (AC-5):** `/admin/settings` prefilled 20 / 20 → saved 10 / 30 (`PUT /admin/fee-settings → 200`, "✓ 10% · 30 บาท"); `/rooms/new` price 100 → receipt **130 / 100 / ค่ากลาง 30 บาท**; old room `UAHW8G2U` still **ค่ากลาง 20 บาท**. Restored 20 / 20 ("✓ 20% · 20 บาท"; `POST /fee/quote` 100 → fee 20 again). (The `/rooms/new` check was done in the admin's session, not a normal user's — same endpoint 7, no role difference.)
- **Auto-release (AC-20):** `HJCAR2ZB` delivered by harness with the 5 s window; **รันปล่อยเงินอัตโนมัติตอนนี้** → pill **released: 2** (`HJCAR2ZB` + `B7P8MQ8M`, which had passed its 5 s after the parcel step); `HJCAR2ZB` room page: **รอแอดมินโอนเงินให้ผู้ขาย**, timeline **ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) 13:01**.

**AC-24 — strings on the admin screens:** แอดมิน — ตรวจสอบสลิป · ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง · โอนเงินให้ผู้ขาย · ตั้งค่าค่ากลาง · ยืนยันยอดเงิน · ปฏิเสธสลิป · เหตุผลที่ปฏิเสธ · พัสดุถึงแล้ว · บันทึกการโอนเงิน · อัตราค่ากลาง (%) · ค่ากลางขั้นต่ำ (บาท) · บันทึกการตั้งค่า · รันปล่อยเงินอัตโนมัติตอนนี้ · ไม่มีสลิปรอตรวจสอบ · ผู้ซื้อ / ผู้ขาย / ผู้ซื้อจ่าย / ผู้ขายได้รับ / ขนส่ง / เลขพัสดุ · ได้รับของแล้ว / ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) · % / บาท · Thai dates. **Exceptions:** `released: N` (TASK wording, Q1); the seeded admin's display name `Admin`; user data; AntD `th_TH` internals.

**UNVERIFIED:** buyer/seller page of `DJG6PEY5` right after confirm (same path as TASK-008's AC-10); AC-5 check from a *normal* user's session; the queues on a phone viewport (desktop only this time); AntD `Image` full preview of a slip.

**`git status --short`:** modified `common/index.ts`, `layout/AppHeader/AppHeader.tsx`, `partials/Auth/{LoginForm,RegisterForm}.tsx`, `partials/Home/HomeContent.tsx`, `constant/text/th.ts`, `lib/api/api-main.ts`, `types/api/main/room.ts`; deleted `partials/Auth/FormError.tsx`; untracked `src/app/{admin,room,rooms}/`, `common/{CreditPill,FormError,PageShell}.tsx`, `partials/{Admin,Room,RoomJoin,RoomList,RoomNew}/`, `hooks/{admin,room}/`, `lib/fee.ts`, `services/{admin,room}.service.ts`, `types/app/` (TASK-007..009 uncommitted). `git diff --cached` empty. No commit. Local SQLite holds the test rooms/users listed in TASK-007/008 plus `NMD3JU3E`, `B7P8MQ8M`, `HJCAR2ZB`; fee settings are back at 20 / 20.

## Questions

- **Q1 (Fern → Sober, 2026-09-21) — two admin strings REQ-001 lacks:** (a) empty state for the parcel and payout queues (only the slip one exists) — shown wordless; (b) the auto-release result — shown as the TASK's `released: N`. Please add to Q-G. Not blocking.
- **Q2 (Fern → Sober, 2026-09-21) — admin's room page has no evidence gallery** (it sits inside the party action panel, which is off for ADMIN). The queues carry what the admin acts on, so I left it; say if REQ-001 wants the admin to see evidence in the room too.

## Review
**Verdict: DONE (Sober, 2026-09-21).** Verified on my machine: lint + tsc clean, `git diff --cached` empty. In the browser as the seeded admin: `/login?callbackUrl=/admin` lands on `/admin` titled **แอดมิน — ตรวจสอบสลิป**, the three queues with live counts (0 / 0 / 6), the slip queue's empty state **ไม่มีสลิปรอตรวจสอบ**, and the payout queue listing six WAITING_PAYOUT rooms each with **ผู้ขายได้รับ 100 บาท**, the released-by in REQ words (ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) / ได้รับของแล้ว) + time, and **บันทึกการโอนเงิน** — matching `GET /admin/rooms?status=WAITING_PAYOUT` from the BE. My payout click coincided with the local servers going down (another project's dev server then took port 3000 — an environment accident, not a defect); the payout path itself is proven by Fern on `HT8FQGUX` (credits 1 → 2) and by TASK-005's BE evidence. Settings page and auto-release button: Fern's evidence (10/30 → quote 130/100/30, old room frozen at 20, restore; `released: 2`) is complete and consistent with the BE I reviewed; accepted. AC-27 for both admin URLs evidenced.
Rulings:
- **Q1 (two admin strings):** added to Q-G — (9) empty state for the parcel and payout queues, (10) the auto-release result line (today the TASK's literal `released: N`, the one English word on the admin screens).
- **Q2 (admin sees no evidence gallery in the room):** REQ-001 has no AC for it — accepted as shipped, no rework. It will matter for REQ-002 (admin judging a dispute); noted in SPEC-001 §Questions as Q-H for Porter, so REQ-002 states it.
- UNVERIFIED items (buyer page right after confirm on that room, AC-5 from a normal user's session, phone viewport, full-size slip preview) are Tanya's.
With this, every TASK of SPEC-001 is DONE → REQ-001 SPEC_DONE.
