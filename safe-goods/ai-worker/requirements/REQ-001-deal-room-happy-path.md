# REQ-001: Deal room — happy path (open → pay → deliver → release)
- Status: DELIVERED (2026-09-21, Porter — TEST_PASSED round 2; NOT_TESTED: clipboard text, Enter-to-submit, phone viewport)
- Priority: HIGH
- Requested: 2026-09-20 by the owner
- Deadline: none
- Source: `SYSTEM-FACTS.md` §What the product is (owner, 2026-09-20). Slice agreed by the owner 2026-09-20 (*"ตกลง"*): REQ-001 = normal deal room, no dispute; REQ-002 = "it's not ok" + admin room; REQ-003 = admin back-office.

## Problem / Goal
Buyers and sellers who met elsewhere (Facebook, LINE, Discord…) have no safe way to exchange money for goods — one side must trust first. **เว็บกลาง** holds the buyer's money until the seller has proven delivery, then pays the seller. This REQ delivers the whole normal path with no dispute: a room is opened, both parties join, the buyer pays in (slip + admin confirmation), the seller delivers with evidence, the buyer confirms (or 3 days pass), an admin pays the seller out, and both get +1 credit.

Users: **buyer**, **seller** (both ordinary registered users — a user can be either, per room), **admin** (site staff).

## Requirement
1. The system must let a person register and log in, and must let an admin account exist (seeded — no admin self-registration).
2. The system must let a logged-in user **open a room** by stating: their role (buyer / seller), the goods **category** (in-game / physical, from an admin-managed list — a fixed seed list for this REQ, see Constraints), a short description of the goods, the **price**, the **price mode** (fee added on top / fee included), and **who pays the fee** (seller / buyer / split equally).
3. The system must compute the fee and show, before the room is created, exactly **what the buyer pays** and **what the seller receives**, using the fee model in §Fee model. Fee rate (20%) and minimum (20 THB) are admin-editable values, not constants in the UI.
4. The system must give the opener a **room link (with a room code)** to send to the other party; a logged-in user who opens the link joins as the remaining role. A room has exactly one buyer and one seller; a third user cannot join.
5. Every room must show **guidance for the buyer and guidance for the seller** (wording in §User-facing wording) at all times.
6. The system must let the **buyer** upload a payment slip (image) for the exact "buyer pays" amount, and must let an **admin** confirm or reject that slip. Money is considered held only after admin confirmation.
7. The system must let the **seller**, only after payment is confirmed, mark the goods as delivered ("ส่งของแล้ว" = the owner's *ready*) — and only if at least one evidence file (image) is attached. For a **physical** category the seller must also enter a **courier + tracking number**.
8. The system must let the **buyer** press **"ได้รับของแล้ว"** after the seller marked delivered; this releases the money to the seller (status → awaiting payout).
9. If the buyer does not press anything, the system must **auto-release after 3 days**, where the clock starts:
   - in-game category: when the seller marked delivered;
   - physical category: when the parcel is marked **delivered** (by the buyer pressing "พัสดุถึงแล้ว", or by an admin) — not when the seller marked delivered.
10. The system must let an **admin** record the payout to the seller (amount = "seller receives"; admin transfers manually outside the system) — this closes the room as **completed**.
11. On a completed room the system must add **+1 credit to both** buyer and seller.
12. The system must show each user's credit to the other party inside the room as **"ปิดดีลดี X ครั้ง"** (and, once REQ-002 exists, **"มีปัญหา Y ครั้ง"**).
13. The system must record **who did what and when** for every room step (opened, joined, slip uploaded, payment confirmed/rejected, delivered, parcel delivered, received, auto-released, paid out, cancelled) and show that timeline in the room to both parties and admin.
14. Either party must be able to **cancel** the room while no payment has been confirmed; after payment is confirmed, cancel is not available in this REQ (that is REQ-002's territory).
15. Every screen the user sees must be in **Thai**; English only where a Thai word does not exist (e.g. "LINE", courier names).

### Fee model (confirmed by the owner 2026-09-20 — see Questions Q-A)
- **Base price B** = what the goods cost. **Fee F = max(rate × B, minimum)**, rate 20%, minimum 20 THB, rounded **up** to whole baht.
- **Who pays** decides the buyer's share `bs` of F: seller pays → bs = 0; buyer pays → bs = F; split → bs = F/2 (round half up to whole baht; seller's share = F − bs).
- **Buyer pays** = B + bs. **Seller receives** = B − (F − bs). **Site keeps** = F.
- **Price mode "fee added on top"**: the user enters B.
- **Price mode "fee included"**: the user enters the total the buyer will pay, T; the system derives B so that B + bs = T.

Example, B = 100 THB (fee 20):

| Who pays | Buyer pays | Seller receives | Site keeps |
|---|---|---|---|
| Seller | 100 | 80 | 20 |
| Buyer | 120 | 100 | 20 |
| Split | 110 | 90 | 20 |

Same deal entered as "fee included" with T = 120 and "buyer pays" → B = 100, same table row.
- **Remainder rule (Porter, 2026-09-21, from SPEC-001 Q-D):** when T has no exact B, take the largest B that fits and add the remainder (max 1 baht) to the fee — the buyer always pays exactly the number typed.

## Acceptance Criteria
**Room creation & join**
- [ ] AC-1 — **Given** a logged-in user **When** they open a room with role = seller, category = in-game, price 100, mode = fee added on top, who pays = buyer **Then** the preview shows "ผู้ซื้อจ่าย 120 บาท / ผู้ขายได้รับ 100 บาท / ค่ากลาง 20 บาท" and, on confirm, a room exists with a shareable link containing the room code.
- [ ] AC-2 — **Given** the same inputs but price 50 **Then** fee = 20 (the minimum), buyer pays 70.
- [ ] AC-3 — **Given** mode = fee included, price 120, who pays = buyer **Then** the preview shows buyer pays 120, seller receives 100, fee 20.
- [ ] AC-4 — **Given** who pays = split, price 100, mode = added on top **Then** buyer pays 110, seller receives 90.
- [ ] AC-5 — **Given** an admin has changed the rate to 10% and the minimum to 30 **When** a new room is previewed with price 100 **Then** the fee shown is 30 (minimum wins), and rooms created before the change keep their original fee.
- [ ] AC-6 — **Given** a room opened by a seller **When** a second logged-in user opens the link **Then** they become the buyer, both see each other's display name and credit, and the room status is "รอผู้ซื้อชำระเงิน".
- [ ] AC-7 — **Given** a room already has a buyer and a seller **When** a third logged-in user opens the link **Then** they see "ห้องนี้เต็มแล้ว" and are not added.
- [ ] AC-8 — **Given** a not-logged-in visitor opens a room link **Then** they are sent to log in and land in the room afterwards.

**Payment in**
- [ ] AC-9 — **Given** a joined room **When** the buyer uploads a slip image **Then** the status becomes "รอแอดมินตรวจสอบยอดเงิน" and the seller cannot yet press "ส่งของแล้ว".
- [ ] AC-10 — **Given** a slip is waiting **When** an admin confirms it **Then** status = "ชำระเงินแล้ว — รอผู้ขายส่งของ", the timeline shows who confirmed and when, and the seller can now press "ส่งของแล้ว".
- [ ] AC-11 — **Given** a slip is waiting **When** an admin rejects it with a reason **Then** the buyer sees the reason and can upload a new slip; status returns to "รอผู้ซื้อชำระเงิน".
- [ ] AC-12 — **Given** a room with no confirmed payment **When** either party presses "ยกเลิกห้อง" **Then** the room is closed as cancelled, no credit changes, the other party sees "ห้องถูกยกเลิก".
- [ ] AC-13 — **Given** payment is confirmed **Then** "ยกเลิกห้อง" is not shown to either party.

**Delivery**
- [ ] AC-14 — **Given** payment confirmed, category in-game **When** the seller presses "ส่งของแล้ว" without attaching evidence **Then** the action is refused with "ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป".
- [ ] AC-15 — **Given** payment confirmed, category in-game **When** the seller attaches evidence and presses "ส่งของแล้ว" **Then** status = "ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน", the buyer sees the evidence, and a countdown "ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน 3 วัน" is shown.
- [ ] AC-16 — **Given** payment confirmed, category physical **When** the seller presses "ส่งของแล้ว" without courier + tracking number **Then** the action is refused with "ต้องระบุขนส่งและเลขพัสดุ".
- [ ] AC-17 — **Given** a physical room where the seller marked delivered with tracking **Then** no 3-day countdown runs yet; status = "ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง"; the buyer sees the tracking number and a button "พัสดุถึงแล้ว".
- [ ] AC-18 — **Given** AC-17 **When** the buyer presses "พัสดุถึงแล้ว" (or an admin marks the parcel delivered) **Then** the 3-day countdown starts from that moment and status = "พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน".

**Release & payout**
- [ ] AC-19 — **Given** status "รอผู้ซื้อยืนยัน" **When** the buyer presses "ได้รับของแล้ว" **Then** status = "รอแอดมินโอนเงินให้ผู้ขาย", the countdown stops, and the timeline records the buyer's confirmation.
- [ ] AC-20 — **Given** status "รอผู้ซื้อยืนยัน" and 3 full days pass with no buyer action **Then** the system moves the room to "รอแอดมินโอนเงินให้ผู้ขาย" by itself, and the timeline shows "ปล่อยเงินอัตโนมัติ (ครบ 3 วัน)". (Tanya: the 3-day clock must be adjustable in test so this is executable.)
- [ ] AC-21 — **Given** status "รอแอดมินโอนเงินให้ผู้ขาย" **When** an admin records the payout **Then** status = "ปิดดีลแล้ว", both parties' credit "ปิดดีลดี" increases by exactly 1, and the room shows the final amounts (buyer paid / seller received / fee).
- [ ] AC-22 — **Given** a completed room **Then** no button on it changes state any more (read-only for both parties).

**Room content & language**
- [ ] AC-23 — **Given** any open room **Then** both parties see the buyer guidance and seller guidance text from §User-facing wording, verbatim.
- [ ] AC-24 — **Given** any screen in this REQ **Then** every label, button, status and message is Thai (English allowed only for proper nouns).
- [ ] AC-25 — **Given** a user viewing a room **Then** they see the other party's "ปิดดีลดี X ครั้ง" count, and their own.

**Accounts**
- [ ] AC-26 — **Given** a visitor **When** they register with a display name, email and password **Then** they can log in and open a room. Duplicate email is refused with "อีเมลนี้ถูกใช้แล้ว".
- [ ] AC-27 — **Given** a normal user **Then** they cannot reach any admin screen (slip confirmation, payout, fee settings).

## User-facing wording (Porter as UX writer)
Site name: **เว็บกลาง** (never "safe-goods" on screen).

| Where | Thai (primary) |
|---|---|
| Open-room button | เปิดห้องดีล |
| Role choice | ฉันเป็นผู้ซื้อ / ฉันเป็นผู้ขาย |
| Category | หมวดหมู่สินค้า — ไอเทม/ไอดีเกม · สินค้าส่งพัสดุ |
| Price mode | ราคานี้ยังไม่รวมค่ากลาง / ราคานี้รวมค่ากลางแล้ว |
| Who pays | ผู้ขายจ่ายค่ากลาง / ผู้ซื้อจ่ายค่ากลาง / หารคนละครึ่ง |
| Preview | ผู้ซื้อจ่าย {x} บาท · ผู้ขายได้รับ {y} บาท · ค่ากลาง {f} บาท |
| Share | ส่งลิงก์นี้ให้อีกฝ่ายเข้าห้อง |
| Buyer: upload slip | แนบสลิปโอนเงิน {x} บาท |
| Seller: deliver | ส่งของแล้ว (แนบหลักฐาน) |
| Physical extra fields | ขนส่ง / เลขพัสดุ |
| Buyer: parcel arrived | พัสดุถึงแล้ว |
| Buyer: confirm | ได้รับของแล้ว |
| Cancel | ยกเลิกห้อง |
| Statuses | รอผู้ซื้อเข้าห้อง · รอผู้ขายเข้าห้อง · รอผู้ซื้อชำระเงิน · รอแอดมินตรวจสอบยอดเงิน · ชำระเงินแล้ว — รอผู้ขายส่งของ · ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน · ผู้ขายส่งพัสดุแล้ว — รอพัสดุถึง · พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน · รอแอดมินโอนเงินให้ผู้ขาย · ปิดดีลแล้ว · ห้องถูกยกเลิก |
| Countdown | ระบบจะโอนเงินให้ผู้ขายอัตโนมัติใน {d} วัน {h} ชั่วโมง |
| Credit | ปิดดีลดี {n} ครั้ง |
| Errors | ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป · ต้องระบุขนส่งและเลขพัสดุ · ห้องนี้เต็มแล้ว · อีเมลนี้ถูกใช้แล้ว |

**Buyer guidance (shown in every room):**
> คำแนะนำสำหรับผู้ซื้อ — ถ่ายวิดีโอหรือติดกล้องตอนรับของทุกครั้ง · ระวังการหลอกเรื่องเบอร์โทรและขนส่ง — ตรวจสอบและติดตามสถานะพัสดุตลอด · โอนเงินเข้าบัญชีเว็บกลางเท่านั้น ห้ามโอนตรงให้ผู้ขาย

**Seller guidance (shown in every room):**
> คำแนะนำสำหรับผู้ขาย — แนบหลักฐานการส่งของให้แน่นหนาทุกครั้ง (ภาพหน้าจอ, วิดีโอ, เลขพัสดุ) เพื่อป้องกันการกด "ไม่โอเค" มั่ว ๆ · อย่าส่งของก่อนเห็นสถานะ "ชำระเงินแล้ว"

(Source of intent: owner 2026-09-20, `SYSTEM-FACTS.md` §What the product is. "ไม่โอเค" is the Thai name for the owner's "it's not ok" button; the button itself is REQ-002.)

## Constraints
- Stack per `SYSTEM-FACTS.md` §Stack: Bun + Hono API, Next.js + Ant Design front, `main` branch, local only. No payment gateway; no in-site wallet.
- Fee rate and minimum are admin-editable values with defaults 20% / 20 THB; a room freezes the values in force when it was created.
- Categories for this REQ: a seeded list of exactly two — **ไอเทม/ไอดีเกม** (in-game) and **สินค้าส่งพัสดุ** (physical). Admin category management is REQ-003.
- Admin screens in this REQ are the minimum to run the path: slip confirm/reject, mark parcel delivered, record payout, edit fee rate/minimum. Everything else admin is REQ-003.
- All money in whole THB; amounts shown with "บาท".
- Timeline / audit is the base for REQ-002's "who pressed first" — design it so a later "ไม่โอเค" event fits in.

## Out of Scope
- "it's not ok" button, admin dispute room, +10% surcharge, confiscation, −1 credit (REQ-002).
- Admin back-office beyond the minimum above; category management; reports (REQ-003).
- Marketplace, listings, search, chat inside the room, notifications (email/LINE), refunds after payment confirmed.
- English UI.

## Questions
- **Q-A (owner, via Porter) — Fee model.** Is §Fee model (base price B, F = max(20%·B, 20), buyer's share by who-pays, "fee included" = enter the buyer's total) the intended reading? Especially: is the 20% taken on the **goods price B**, not on the buyer's total? — asked 2026-09-20.
  > answer (owner, 2026-09-20): "ถูก" — confirmed exactly as written in §Fee model.
- **Q-B (owner, via Porter) — Registration.** REQ assumes email + password + display name. Owner may prefer phone number or LINE login. — Porter's assumption until answered; not blocking SA.
- **Q-C (owner, via Porter) — Physical "delivered".** REQ assumes buyer presses "พัสดุถึงแล้ว" or admin marks it; no courier-API tracking. — Porter's assumption; not blocking SA.

### Additional wording (Porter, 2026-09-21 — answers SPEC-001 Q-E)
| Where | Thai |
|---|---|
| Login failed | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| Price not a whole baht | กรุณาระบุราคาเป็นจำนวนเต็มบาท |
| Price too low (fee included) | ราคานี้ต่ำเกินไป — ต้องไม่น้อยกว่า {min} บาท |
| File not an image | แนบได้เฉพาะไฟล์รูปภาพ (JPG, PNG) |
| File over 5 MB | ไฟล์ใหญ่เกิน 5 MB |
| Unknown room code | ไม่พบห้องนี้ — ตรวจสอบลิงก์อีกครั้ง |
| Generic error | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |
| Join button / my rooms title | เข้าร่วมห้อง / ห้องดีลของฉัน |
| Admin slip page / confirm / reject / reason | แอดมิน — ตรวจสอบสลิป / ยืนยันยอดเงิน / ปฏิเสธสลิป / เหตุผลที่ปฏิเสธ |
| Admin payout page / button | โอนเงินให้ผู้ขาย / บันทึกการโอนเงิน |
| Admin fee settings page / fields / button | ตั้งค่าค่ากลาง / อัตราค่ากลาง (%) · ค่ากลางขั้นต่ำ (บาท) / บันทึกการตั้งค่า |
| Admin run auto-release | รันปล่อยเงินอัตโนมัติตอนนี้ |
| Empty: no rooms / no slips | ยังไม่มีห้องดีล — กด "เปิดห้องดีล" เพื่อเริ่ม / ไม่มีสลิปรอตรวจสอบ |
| Register/login labels | ชื่อที่แสดง · อีเมล · รหัสผ่าน · สมัครสมาชิก · เข้าสู่ระบบ · มีบัญชีแล้ว? เข้าสู่ระบบ · ยังไม่มีบัญชี? สมัครสมาชิก |

### Additional wording 2 (Porter, 2026-09-21 — answers SPEC-001 Q-G)
| Where | Thai |
|---|---|
| Field required / invalid email / password length | กรุณากรอกข้อมูลนี้ / รูปแบบอีเมลไม่ถูกต้อง / รหัสผ่านต้องมี 8–72 ตัวอักษร |
| Logout (icon + text) | ออกจากระบบ |
| Goods description / price fields | รายละเอียดสินค้า / ราคา (บาท) |
| Copy link (icon + text) / after copy | คัดลอกลิงก์ / คัดลอกแล้ว |
| Own party-card marker | (คุณ) |
| Evidence upload label | แนบหลักฐาน |
| Section headings | ไทม์ไลน์ · คำแนะนำ · หลักฐานการส่งของ |
| Empty: parcel queue / payout queue | ไม่มีพัสดุรอยืนยัน / ไม่มีรายการรอโอนเงิน |
| Auto-release result | ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง · N=0: ไม่มีห้องที่ครบกำหนด |

## Rework from TEST-001 (Porter, 2026-09-21 — TEST_FAILED, detail in `tests/TEST-001-deal-room-happy-path.md` §Defects)
Attribution: DEF-1..5 are the result of **Porter's Thai copy arriving after the FE was built** (Q-E/Q-G answered 09-21 after TASK-006..009 were DONE) — the mistake is late UX copy, not engineering. Now that the strings exist, the screens must match them.
- **R-1 (DEF-1)** admin auto-release result must read `ปล่อยเงินอัตโนมัติแล้ว {N} ห้อง` / `ไม่มีห้องที่ครบกำหนด` — no `released: N`.
- **R-2 (DEF-2)** parcel queue / payout queue empty states: `ไม่มีพัสดุรอยืนยัน` / `ไม่มีรายการรอโอนเงิน`.
- **R-3 (DEF-3)** new-room form shows visible labels `รายละเอียดสินค้า` and `ราคา (บาท)`.
- **R-4 (DEF-4)** logout and copy-link are icon **+ text** (`ออกจากระบบ`, `คัดลอกลิงก์` → `คัดลอกแล้ว` for 2 s); aria-labels in Thai.
- **R-5 (DEF-5)** room page headings `ไทม์ไลน์` / `คำแนะนำ` / `หลักฐานการส่งของ`; `(คุณ)` after the viewer's own name on the party card; register form shows field messages `กรุณากรอกข้อมูลนี้` / `รูปแบบอีเมลไม่ถูกต้อง` / `รหัสผ่านต้องมี 8–72 ตัวอักษร` on blur/submit (not only a disabled button).
- **R-6 (Tanya Q-1, Porter's ruling)** countdown rounds **up** to the next whole hour: right after delivery it reads `ใน 3 วัน 0 ชั่วโมง`; last hour reads `ใน 0 วัน 1 ชั่วโมง`; never shows a value below the true remaining time. AC-15 wording stands ("3 วัน").
- **R-7 (Tanya Q-2 / O-1, Porter's ruling — small scope add)** `ยกเลิกห้อง` asks for confirmation first: dialog text **ยกเลิกห้องนี้? อีกฝ่ายจะเห็นว่าห้องถูกยกเลิก และห้องนี้จะใช้ต่อไม่ได้** · buttons **ยืนยันยกเลิก** / **กลับ**. Adds AC-12b: **Given** a room with no confirmed payment **When** a party presses "ยกเลิกห้อง" and then "กลับ" **Then** nothing changes.
- **R-8 (Tanya O-3)** price input with a non-integer (e.g. 10.5) shows `กรุณาระบุราคาเป็นจำนวนเต็มบาท` and no preview.
- Not rework: O-2 (admin countdown line — REQ-002 will cover admin's room view), O-4 (remainder rule works as specified).

New/updated ACs for re-test: AC-24 (all strings above on screen), AC-12b, AC-15 (countdown reads 3 วัน 0 ชั่วโมง right after delivery).
