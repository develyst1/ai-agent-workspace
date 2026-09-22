# TEST-001: Deal room — happy path (open → pay → deliver → release)
- Source REQ: REQ-001
- Status: TEST_PASSED (round 2, 2026-09-21 — see §Re-test round 2; the round-1 record is kept below)
- Environment: local — `safe-goods-back` (branch `main`, HEAD `0a4c42d`, clean) on :3001 · `safe-goods-front` (branch `main`, HEAD `47f1f29` + 26 uncommitted files = TASK-007..009 work, as handed over) on **:3002** (:3000 was held by the owner's `possibility-front` dev server, left alone; FE run with `NEXTAUTH_URL=http://localhost:3002`, BE with `CORS_ORIGIN=http://localhost:3002`)
- Data: **fresh, isolated SQLite + upload dir** in my scratchpad (`DATABASE_PATH`/`UPLOAD_DIR` env overrides), migrated + seeded by the repo's own scripts. Nothing in the product repos was written or changed. The team's `data/safe-goods.sqlite` was not touched.
- Tested: 2026-09-21 by Tanya — round 1 (TEST_FAILED) and round 2 re-test after TASK-010 (TEST_PASSED)
- Method: every AC exercised in the built-in browser against the real FE + BE (form fills, real clicks, real multipart uploads through the page's `<input type=file>`); the API (`curl`) used only to set up secondary actors / cross-check state. Supplementary: `bun test` in `safe-goods-back` → 46 pass / 0 fail.
- Timer: AC-15/17/18 run with the default 3-day window (259 200 s); for AC-20 my BE was restarted with `AUTO_RELEASE_SECONDS=60 SWEEP_INTERVAL_MS=10000` before delivering the room under test.

## Scope
All 27 ACs of REQ-001, plus the §Additional wording 1/2 strings (Porter: "if a screen still shows old/English text, that is a defect"), plus negative/edge cases around them. Out of scope: REQ-002/003, notifications, mobile layout.

## Test users / rooms (all mine, in my isolated DB)
- `tanya-seller@qa.test` "Tanya Seller" · `tanya-buyer@qa.test` "Tanya Buyer" · `tanya-third@qa.test` "Tanya Third" · seeded `admin@local.test`
- A `HHFBJSBY` in-game, seller-opened, 100 / fee added / buyer pays — the main happy path (AC-1, 6–11, 13–15, 19, 21, 22, 25)
- B `XT5RF9NX` physical, buyer-opened, 200 / added / split (220 / 180 / 40) — AC-16, 17, 18 (buyer path)
- C `WD3KSP8A` in-game, fee-included 111 / split → base 100, fee 21, seller 90 (remainder rule) — AC-20 (sweep)
- E `5Q4EYCKB` in-game — AC-12 buyer cancels via UI · F `WH9NAZJ4` — seller cancels from SLIP_REVIEW via API
- G `87ZQGWTY` physical 300 — AC-18 admin path + auto-release from parcel-arrived

## Cases
| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | AC-1 preview + create | happy | `/rooms/new`: ฉันเป็นผู้ขาย, ไอเทม/ไอดีเกม, price 100, ยังไม่รวมค่ากลาง, ผู้ซื้อจ่ายค่ากลาง → เปิดห้องดีล | ผู้ซื้อจ่าย 120 / ผู้ขายได้รับ 100 / ค่ากลาง 20; room with share link containing code | Preview `120 บาท / 100 บาท / 20 บาท`; landed on `/room/HHFBJSBY`, share block "ส่งลิงก์นี้ให้อีกฝ่ายเข้าห้อง" + `http://localhost:3002/room/HHFBJSBY`, status รอผู้ซื้อเข้าห้อง | PASS |
| 2 | AC-2 minimum fee | edge | same form, price 50 | fee 20, buyer pays 70 | `70 บาท / 50 บาท / 20 บาท` | PASS |
| 3 | AC-3 fee included | happy | รวมค่ากลางแล้ว, 120, buyer pays | 120 / 100 / 20 | `120 บาท / 100 บาท / 20 บาท` | PASS |
| 4 | AC-4 split | happy | added on top, 100, หารคนละครึ่ง | buyer 110, seller 90 | `110 บาท / 90 บาท / 20 บาท` (radio state confirmed `FEE_ADDED,SPLIT`) | PASS |
| 5 | AC-5 admin changes rate/min | happy | admin `/admin/settings` 20/20 → 10/30, บันทึกการตั้งค่า; as user preview price 100; old room A re-read | new preview fee 30; room A keeps 20 | Settings saved (form re-reads 10,30; `GET /fee/settings` 10/30). Preview `130 / 100 / 30`. Room A still `fee 20, buyerPays 120` (API + UI). Restored to 20/20 afterwards | PASS |
| 5b | fee-included too low | negative | รวมค่ากลางแล้ว, price 20 (min 30 at the time) | Thai too-low message | `ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า 31 บาท` | PASS |
| 6 | AC-6 second user joins | happy | logged-out link → login as buyer → lands on room → เข้าร่วมห้อง | buyer joins; both names + credit; status รอผู้ซื้อชำระเงิน | Status `รอผู้ซื้อชำระเงิน`; cards ผู้ซื้อ Tanya Buyer ปิดดีลดี 0 ครั้ง / ผู้ขาย Tanya Seller ปิดดีลดี 0 ครั้ง; seller's API view shows both members | PASS |
| 7 | AC-7 third user | negative | login as third, open `/room/HHFBJSBY` | ห้องนี้เต็มแล้ว, not added | Page shows `ห้องนี้เต็มแล้ว`, no join button; `POST /join` → 409 ROOM_FULL; members unchanged | PASS |
| 8 | AC-8 logged-out link | happy | logout, open `/room/HHFBJSBY` | to login, then back to room | `/login?callbackUrl=%2Froom%2FHHFBJSBY` → after login `/room/HHFBJSBY` | PASS |
| 8b | login failed string | negative | wrong password | อีเมลหรือรหัสผ่านไม่ถูกต้อง | shown verbatim | PASS |
| 9 | AC-9 slip upload | happy | buyer picks `slip.png` in the page's file input | รอแอดมินตรวจสอบยอดเงิน; seller has no ส่งของแล้ว | `POST /slip` 200; status `รอแอดมินตรวจสอบยอดเงิน`; timeline "Tanya Buyer แนบสลิปโอนเงิน". Seller's page: only `ยกเลิกห้อง`, no deliver button; API deliver → 409 INVALID_STATE | PASS |
| 9b | file type / size | negative | pick `notimage.txt`; pick 6 MB png | Thai messages, no upload | `แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG)` · `ไฟล์ใหญ่เกิน 5 MB`; no request sent; status unchanged | PASS |
| 10 | AC-10 admin confirm | happy | admin `/admin` slip queue → ยืนยันยอดเงิน | ชำระเงินแล้ว — รอผู้ขายส่งของ; timeline who/when; seller can press | Status `ชำระเงินแล้ว — รอผู้ขายส่งของ`; timeline `Admin ยืนยันยอดเงิน 21 ก.ย. 2026 13:38`; seller page shows `แนบหลักฐาน` + `ส่งของแล้ว (แนบหลักฐาน)` | PASS |
| 11 | AC-11 admin reject | happy | ปฏิเสธสลิป, reason "ยอดไม่ตรง (QA AC-11)" → buyer's page | buyer sees reason, can re-upload; status รอผู้ซื้อชำระเงิน | Buyer sees `เหตุผลที่ปฏิเสธ — ยอดไม่ตรง (QA AC-11)` banner + timeline note; status `รอผู้ซื้อชำระเงิน`; re-upload → `รอแอดมินตรวจสอบยอดเงิน`, banner gone | PASS |
| 12 | AC-12 cancel before payment | happy | room E: buyer presses ยกเลิกห้อง; seller opens room E; room F: seller cancels from SLIP_REVIEW (API) | cancelled, no credit change, other side sees ห้องถูกยกเลิก | E: `ห้องถูกยกเลิก`, credit stays 1/1, timeline "Tanya Buyer ยกเลิกห้อง"; seller sees `ห้องถูกยกเลิก`, no buttons. F: 200 → CANCELLED; third join after → 409 | PASS |
| 13 | AC-13 no cancel after confirm | negative | rooms A/B after confirm, both roles | ยกเลิกห้อง absent | absent for seller and buyer (PAID and later); API `canCancel:false` | PASS |
| 14 | AC-14 deliver w/o evidence | negative | seller presses ส่งของแล้ว, no file | refused with the Thai message | `POST /deliver` 422; `ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป` shown; status unchanged | PASS |
| 15 | AC-15 deliver with evidence | happy | seller picks `evidence.png` (thumbnail appears) → ส่งของแล้ว; buyer opens room | status ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน; buyer sees evidence; countdown "…ใน 3 วัน" | Status ok; buyer sees the evidence thumbnail + `ได้รับของแล้ว`; countdown reads `ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน 2 วัน 23 ชั่วโมง` right after delivery (autoReleaseAt = delivered + 72 h exactly, floor arithmetic) — see Q-1 | PASS (Q-1) |
| 16 | AC-16 physical w/o tracking | negative | room B, evidence attached, ขนส่ง/เลขพัสดุ empty → ส่งของแล้ว | refused with the Thai message | 422; `ต้องระบุขนส่งและเลขพัสดุ` shown | PASS |
| 17 | AC-17 physical shipped | happy | ขนส่ง "Kerry", เลขพัสดุ "QA123456789TH" → ส่งของแล้ว; buyer opens | status ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง; no countdown; buyer sees tracking + พัสดุถึงแล้ว | Status ok; `autoReleaseAt: null`; buyer page shows Kerry / QA123456789TH, button `พัสดุถึงแล้ว`, no countdown | PASS |
| 18 | AC-18 parcel arrived | happy | buyer presses พัสดุถึงแล้ว (room B); admin presses พัสดุถึงแล้ว in parcel queue (room G) | countdown starts now; status พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน | B: status ok, countdown `2 วัน 23 ชั่วโมง`, autoReleaseAt = parcel event + 72.000 h, timeline "Tanya Buyer พัสดุถึงแล้ว". G: status ok, timeline "Admin พัสดุถึงแล้ว"; auto-released 60 s later (test window) | PASS |
| 19 | AC-19 buyer confirms | happy | room A: ได้รับของแล้ว | รอแอดมินโอนเงินให้ผู้ขาย; countdown stops; timeline | Status ok; countdown gone; no buttons; timeline "Tanya Buyer ได้รับของแล้ว 13:43" | PASS |
| 20 | AC-20 auto-release | happy | BE restarted with 60 s window; seller delivers room C (API) at 06:49:08; buyer page shows countdown `0 วัน 0 ชั่วโมง`; wait | room moves by itself; timeline ปล่อยเงินอัตโนมัติ (ครบ 3 วัน) | BE log `[auto-release] 06:50:15 released=1`; room `WAITING_PAYOUT`, `releasedBy: SYSTEM`; UI status `รอแอดมินโอนเงินให้ผู้ขาย`, timeline `ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)`. Room G likewise after admin parcel-arrived | PASS |
| 21 | AC-21 payout | happy | admin payout queue (shows ผู้ขายได้รับ 100 บาท, "ได้รับของแล้ว 13:43") → บันทึกการโอนเงิน | ปิดดีลแล้ว; both credits +1; final amounts | Room A `ปิดดีลแล้ว`; ปิดดีลดี 0→1 both; amounts 120/100/20; timeline "Admin โอนเงินให้ผู้ขาย"; home shows `ปิดดีลดี 1 ครั้ง` | PASS |
| 22 | AC-22 completed read-only | negative | room A as buyer and as seller; API received/cancel/payout | no state-changing control | 0 buttons/inputs for both; API 409 INVALID_STATE (received, cancel, payout), 403 (buyer deliver) | PASS |
| 23 | AC-23 guidance verbatim | happy | every room state visited (open, joined, slip, paid, delivered, shipped, arrived, payout, completed, cancelled) | both blocks verbatim | both blocks present, text identical to REQ §User-facing wording | PASS |
| 24 | AC-24 all Thai | happy | every screen of this REQ | Thai only (proper nouns excepted) | Visible English found: admin settings auto-release result renders **`released: 0`** (DEF-1). Field labels / buttons that carry no visible text at all: DEF-2..5 | **FAIL** |
| 25 | AC-25 credit both sides | happy | rooms A, B | own + other's ปิดดีลดี X ครั้ง | both cards show `ปิดดีลดี N ครั้ง`; N moved 0→1 after room A closed, seen from both accounts | PASS |
| 26 | AC-26 register / duplicate | happy+negative | `/register` Tanya Seller → home; then `Tanya-Seller@qa.test` again | login + open room works; duplicate refused | Registered → home `ปิดดีลดี 0 ครั้ง`, opened room A. Duplicate (different case) → `อีเมลนี้ถูกใช้แล้ว` (409) | PASS |
| 27 | AC-27 admin screens | negative | as normal user: `/admin`, `/admin/settings`; API PUT fee-settings, GET admin/rooms, POST payout | not reachable | both routes redirect to `/`; API 403 FORBIDDEN "admin only" ×3 | PASS |
| 28 | Additional wording 1/2 on screen | regression | inspect DOM/labels on register, login, new-room, room, admin pages | every Q-E/Q-G string present | Present: login-failed, too-low, file-type, file-size, join button, my-rooms title, admin page/confirm/reject/reason, payout page/button, settings page/fields/button, run-auto-release button, empty slips, register/login labels, แนบหลักฐาน, section heading หลักฐานการส่งของ. **Missing:** see DEF-1..5 | FAIL (as listed) |
| 29 | Non-member file access | negative | third user `GET /files/{slip id}` | refused | 403 FORBIDDEN | PASS |
| 30 | Enter-to-submit on login | edge | focus password field, press Enter | form submits | Did not submit in my browser tool (button click did). Fern flagged the same tool limitation; cannot distinguish tool from product | NOT_TESTED |

## Re-test round 2 (2026-09-21, after rework TASK-010 — Porter: AC-24, AC-12b, AC-15 + regression)
- Build under test: `safe-goods-front` working tree on `main` (HEAD `47f1f29` + 27 uncommitted files incl. TASK-010) · `safe-goods-back` `0a4c42d` clean (no BE change in the rework).
- How: Fern's own dev servers were running on :3000/:3001 (left alone). Next 16 refuses a second `next dev` from the same folder, so I ran an **exact copy of the FE working tree** (robocopy incl. node_modules) from my scratchpad on **:3002**, pointed at **my own BE on :3003** with a fresh isolated DB / upload dir. Product repos untouched (git status unchanged: 27 / 0). AC-15 run with the default 3-day window; the button path and the R-6 "last hour" check with `AUTO_RELEASE_SECONDS=60 SWEEP_INTERVAL_MS=45000`.
- Rooms this round: A `7CSLAFXV` (in-game, main path) · E `XHAGBWMD` (cancel confirm) · C `JQTC7Q8Q` (auto-release via admin button) · B `74NJWES6` (physical).

| # | Case | Steps | Expected | Actual | Result |
|---|------|-------|----------|--------|--------|
| R2-1 | R-1 / DEF-1 auto-release result text | `/admin/settings` → รันปล่อยเงินอัตโนมัติตอนนี้ with nothing due; again with room C past its 60 s window (pressed before the 45 s sweep could fire) | `ไม่มีห้องที่ครบกำหนด` / `ปล่อยเงินอัตโนมัติแล้ว 1 ห้อง` | `ไม่มีห้องที่ครบกำหนด`; then `ปล่อยเงินอัตโนมัติแล้ว 1 ห้อง` at 12:55:37 UTC; room C → `รอแอดมินโอนเงินให้ผู้ขาย`, timeline `ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)`, releasedBy SYSTEM. No `released:` text anywhere | PASS |
| R2-2 | R-2 / DEF-2 queue empty states | `/admin` parcel + payout queues at 0 | `ไม่มีพัสดุรอยืนยัน` / `ไม่มีรายการรอโอนเงิน` | both shown; slip queue still `ไม่มีสลิปรอตรวจสอบ` | PASS |
| R2-3 | R-3 / DEF-3 new-room labels | `/rooms/new` | visible `รายละเอียดสินค้า`, `ราคา (บาท)` | both visible as form labels; the fields' accessible names are now Thai (no `description` / `price` aria) | PASS |
| R2-4 | R-4 / DEF-4 logout + copy text | header; room share block: click copy, wait 3 s | `ออกจากระบบ` icon+text; `คัดลอกลิงก์` → `คัดลอกแล้ว` then back | header button `ออกจากระบบ` (aria Thai); copy button reads `คัดลอกแล้ว` 0.5 s after the click and `คัดลอกลิงก์` again after 3 s. Clipboard content itself not observable here (NOT_TESTED, as before) | PASS |
| R2-5 | R-5 / DEF-5 headings, (คุณ), field messages | room A as seller and as buyer; `/register` and `/login` with empty / bad / short values, blur | `ไทม์ไลน์ · คำแนะนำ · หลักฐานการส่งของ`; `(คุณ)` on own card; `กรุณากรอกข้อมูลนี้` / `รูปแบบอีเมลไม่ถูกต้อง` / `รหัสผ่านต้องมี 8–72 ตัวอักษร` | headings present (หลักฐานการส่งของ appears once evidence exists); `Tanya Seller (คุณ)` for the seller, `Tanya Buyer (คุณ)` for the buyer; register shows all three messages on blur; login shows `กรุณากรอกข้อมูลนี้` | PASS |
| R2-6 | R-6 / AC-15 countdown rounds up | seller presses ส่งของแล้ว on room A (default 3-day window); buyer opens; room B with the 60 s window after พัสดุถึงแล้ว | `3 วัน 0 ชั่วโมง` right after delivery; last hour `0 วัน 1 ชั่วโมง` | seller and buyer both read `ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน 3 วัน 0 ชั่วโมง` (deadline = +72 h exactly); room B with 60 s left reads `0 วัน 1 ชั่วโมง` | PASS |
| R2-7 | R-7 / AC-12b cancel confirm — กลับ | room A (no payment): ยกเลิกห้อง → dialog → กลับ | dialog text verbatim; nothing changes | dialog `ยกเลิกห้องนี้? อีกฝ่ายจะเห็นว่าห้องถูกยกเลิก และห้องนี้จะใช้ต่อไม่ได้` with `กลับ` / `ยืนยันยกเลิก`; after กลับ: dialog closed, status `รอผู้ซื้อเข้าห้อง`, no `POST /cancel` in the network log | PASS |
| R2-8 | R-7 / AC-12 cancel confirm — ยืนยันยกเลิก | room E (joined, no payment): ยกเลิกห้อง → ยืนยันยกเลิก | `ห้องถูกยกเลิก` | status `ห้องถูกยกเลิก`, no buttons, timeline `Tanya Seller ยกเลิกห้อง` | PASS |
| R2-9 | R-8 / O-3 non-integer price | `/rooms/new` price `10.5` | `กรุณาระบุราคาเป็นจำนวนเต็มบาท`, no preview | message shown, no preview; after correcting to 100 the message clears (≈1–2 s lag) and the preview 120/100/20 returns | PASS |
| R2-10 | AC-24 sweep | every screen visited this round (register, login, home, new room, room in 6 states, rooms list, admin ×3 queues, settings) | Thai only | no English UI text found; remaining Latin = room codes, courier names, my own test data, and Porter's own `JPG, PNG` / `MB` | PASS |
| R2-11 | Regression subset | R-1, R-4, R-5 (API), R-6 (slip via API), R-7 (confirm via API), R-8, R-11 (API TRACKING_REQUIRED), R-10, R-12 (buyer path), R-13, R-14 (button path), R-15, R-16, R-17 (UI redirect + API 403), R-19 | still pass | all pass — see REGRESSION.md "Last run". Not re-run this round (BE unchanged, FE paths untouched by TASK-010): R-2 fee rows beyond 120/100/20, R-3 settings change, R-9 (EVIDENCE_REQUIRED), R-12 admin path, R-18 file 403 | PASS |

### Verdict (round 2)
`TEST_PASSED` — every rework item R-1..R-8 verified on screen; AC-24, AC-12b, AC-15 pass; regression subset green; no new defect. Still NOT_TESTED: clipboard content, Enter-to-submit (tool limitation), phone viewport. DEF-1..5 closed.

## Defects (round 1 — all closed by TASK-010, verified in §Re-test round 2)
### DEF-1 — Admin auto-release result shows `released: 0` instead of Porter's Thai string — MINOR (fails AC-24)
- Environment: local FE :3002 as admin · Repro: `/admin/settings` → รันปล่อยเงินอัตโนมัติตอนนี้ with nothing due · Expected (REQ-001 §Additional wording 2): `ไม่มีห้องที่ครบกำหนด` (N=0) / `ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง` · Actual: text `released: 0` rendered under the button · Evidence: page text captured 2026-09-21 06:52 UTC.
### DEF-2 — Admin parcel queue and payout queue have no empty-state text — MINOR
- Repro: `/admin` with 0 parcels / 0 payouts → switch to those queues · Expected: `ไม่มีพัสดุรอยืนยัน` / `ไม่มีรายการรอโอนเงิน` · Actual: queue area blank (slip queue's `ไม่มีสลิปรอตรวจสอบ` is fine).
### DEF-3 — New-room form: description and price fields have no visible Thai label — MINOR
- Repro: `/rooms/new` · Expected: `รายละเอียดสินค้า` / `ราคา (บาท)` · Actual: unlabeled textarea (`aria-label="description"`) and number input (`aria-label="price"`), empty placeholders; only the `บาท` suffix hints at the price field.
### DEF-4 — Logout and copy-link are icon-only with English aria-labels — MINOR
- Repro: any page header (logout), room share block (copy) · Expected: icon + text `ออกจากระบบ`; icon + text `คัดลอกลิงก์` → `คัดลอกแล้ว` · Actual: icon-only buttons, `aria-label="logout"` / `"copy"`, no visible text; "คัดลอกแล้ว" state not observable (clipboard not testable here — NOT_TESTED).
### DEF-5 — Room page: no section headings, no own-party marker; register form: no field-level validation messages — MINOR
- Repro: any room; `/register` with empty name / bad email / 5-char password · Expected: headings `ไทม์ไลน์ · คำแนะนำ · หลักฐานการส่งของ`; `(คุณ)` on own party card; `กรุณากรอกข้อมูลนี้` / `รูปแบบอีเมลไม่ถูกต้อง` / `รหัสผ่านต้องมี 8–72 ตัวอักษร` · Actual: only `หลักฐานการส่งของ` heading present, no `ไทม์ไลน์`/`คำแนะนำ`, no `(คุณ)`; register button is simply disabled while invalid — no message shown.

## Observations (not defects — for Porter's judgement)
- O-1 `ยกเลิกห้อง` cancels on a single click with no confirmation step (room E). REQ does not ask for one; a mis-click ends the deal.
- O-2 Admin's own view of a room in the countdown state shows the status but no countdown line (buyer/seller do see it). REQ only requires it for the parties.
- O-3 Price input accepts `10.5` silently (no preview, no message while typing); the whole-baht message (`กรุณาระบุราคาเป็นจำนวนเต็มบาท`) was not seen. Not an AC; NOT_TESTED on submit.
- O-4 Fee-included with split works per the remainder rule: 111 → base 100, fee 21, seller 90 (room C).

## Test data created
| What | Where | End state |
|------|-------|-----------|
| Users tanya-seller / tanya-buyer / tanya-third | my scratchpad SQLite (not the repo's DB) | exist |
| Rooms A COMPLETED · B PARCEL_ARRIVED_WAITING_CONFIRM (3-day clock) · C WAITING_PAYOUT (auto) · E CANCELLED · F CANCELLED · G WAITING_PAYOUT (auto) | same DB | as listed |
| Uploaded slips/evidence | scratchpad upload dir | present |
| Fee settings | same DB | changed 10/30 for AC-5, **restored 20/20** |
| Product repos | `safe-goods-back`, `safe-goods-front` | untouched (git status unchanged from hand-over); my BE/FE processes stopped at session end |

## Verdict (round 1, superseded by round 2 above)
`TEST_FAILED` — 25 of 27 ACs PASS with evidence; **AC-24 FAILS** on visible English `released: 0` (DEF-1) and the §Additional wording strings Porter answered after the FE was built are partly not on screen (DEF-2..5 — Porter's rule: that is a defect). All defects are copy/label-level; the deal flow itself (open → pay → deliver → release → payout, cancel, auto-release, admin gates) passed end-to-end. NOT_TESTED: Enter-to-submit (#30), clipboard "คัดลอกแล้ว", auto-release button with N ≥ 1 (the 10 s sweep always wins on local; N=0 path and sweep path both verified).

## Questions
- **Q-1 (AC-15 wording)** — Right after delivery the countdown reads `ใน 2 วัน 23 ชั่วโมง` (floor of 71 h 59 m), never `3 วัน`. The deadline itself is exactly +72 h. Is floor arithmetic acceptable, or should the first hour display `3 วัน 0 ชั่วโมง` / round up? I recorded AC-15 as PASS on status/evidence/countdown-shown; say the word and I flip it to a defect.
- **Q-2 (O-1)** — Do you want a confirmation step before `ยกเลิกห้อง`? Not in REQ-001 today.
  > answer (Porter, 2026-09-21) Q-1: countdown must round UP to the next whole hour (`3 วัน 0 ชั่วโมง` right after delivery). Please flip AC-15 to a defect — it is R-6 in REQ-001 §Rework.
  > answer (Porter, 2026-09-21) Q-2: yes — confirmation dialog added as R-7 / AC-12b in REQ-001 §Rework. O-3 taken as R-8. O-2 deferred to REQ-002. Defects routed to Sober as REQ content; re-test on his SPEC_DONE.
