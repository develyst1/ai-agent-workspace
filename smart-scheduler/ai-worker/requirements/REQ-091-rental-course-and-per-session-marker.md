# REQ-091 — Rental: whole-course rental recorded at creation + a per-session rental marker on the schedule (2026-09-17)

**Source:** the customer, via the owner, 2026-09-17 (the "rent" of the earlier "before rent/other"). **Status: RECORDED — PM reading + a current-state READ requested from @Sober before rulings. Nothing dispatched to build.**

## §0 — the customer's message, verbatim
> Rental
> 1. เช่าทั้งคอร์ส ต้องขึ้นตั้งแต่สร้างคอร์สเป็นการบันทึกค่ะ
> 2. เช่ารายครั้งขึ้นหน้า Schedule แบบที่ตอนนี้ แต่ต้องโชว์หน้าตารางด้วยค่ะ ว่ามีการเช่า เพราะแอดมินต้องไปเก็บเงินลูกค้าหน้าร้านค่ะ จะขึ้นเป็นสัญลักษณ์ หรือเป็นตัวอักษร R+ แบบนี้ก็ได้ค่ะ เพื่อให้แอดมินรู้ว่าต้องไปเก็บเงิน

## §1 — PM's reading (📖 = clear; ❓ = to settle)
- **Item 1 — whole-course rental, recorded at course CREATION.** 📖 Reading: the course-creation form gains a "rent the whole course" option; ticking it RECORDS the rental at creation (a rental sale), not later per session. 🔑 **Known fact (SYSTEM-FACTS): rental revenue already posts AT SALE via `recordSale`** (one of its four call sites), `quantity = hours`. ❓ So the question is whether a WHOLE-COURSE rental is a NEW kind of rental record tied to the course, or N per-session rentals booked at once — and what "การบันทึก" records exactly (one rental sale for the course? a rental line per session?). **@Sober's read of today's rental first.**
- **Item 2 — per-session rental already shows on the Schedule page ("แบบที่ตอนนี้"); ADD a marker on the CALENDAR GRID** so an admin scanning the timetable sees a session carries a rental — **because the admin collects the cash at the shop front.** 📖 Clear in intent: a badge/symbol on the grid cell, e.g. the letters `R+`, same pattern as the `Last` chip (REQ-089 §5). ❓ Only: the exact glyph (`R+` is the customer's own suggestion — acceptable) and whether it should also mark a WHOLE-COURSE-rental session (item 1) or only per-session rentals.

## §2 — READ requested from @Sober (no build)
1. **How does rental work TODAY?** Per-session/hourly rental — where is it created (the Schedule page, per the customer), what does it write, does it `recordSale` at that moment?
2. **Does a WHOLE-COURSE rental exist at all today, or is rental only per-session?** (Item 1 may be net-new.)
3. **Does a booking/session already carry a "has rental" fact the grid could read for the `R+` marker (item 2), or is that a new flag/join?**
4. **Money:** the owner's standing line is that revenue/expense management belongs to the BACKOFFICE (REQ-090 §5). Does item 1's "recording" post revenue in smart-scheduler (as rentals already do at sale), or is item 2's marker purely a COLLECT-CASH reminder with no posting? Name what each item touches so the owner rules cleanly.

## §3 — the customer's FULL spec, verbatim (2026-09-17, via the owner — "ตามที่ขวัญเขียนใน Sheet")
> ในส่วนของ Rent ตามที่ขวัญเขียนใน Sheet เลยค่ะ แต่จะขยายความเพิ่มเผื่อพี่โด่งจะไปดีไซน์เพิ่มเติมนะคะ
> **สิ่งที่เราต้องการคือ** 1. บันทึกการเช่าอุปกรณ์ 2. เตือนแอดมินให้เก็บค่าเช่าอปก 3. แจ้งเตือนคุณครู น้องเช่าอปกด้วยนะ
> **ประเภทลูกค้าที่เจอ** 1. เช่าทั้งคอร์ส จ่ายเงินมาแต่แรกครบทุกคลาส 2. เช่ารายครั้ง จะมาจ่ายหน้าร้าน 3. เช่าบางครั้ง ที่ลืมเอาอปกมาเอง
> **การเช่า** 50 บาท / เฉพาะสนับ หรือหมวก (Helmet or Pad Only) · 100 บาท / หมวก + สนับ (Helmet + Pad) · 150 บาท / Ride only เฉพาะสเกต, รองเท้า inline, จักรยาน · 200 บาท / ครบทั้งเซ็ท (Full Set) · **ถ้าเป็น full set / inline skate จะต้องมี remark เพิ่มเติมด้วยค่ะ** e.g. `Rent 200 / Full Set (inline skate size 18-19 CM)`
> **ถ้าตามการใช้งาน** คือต้องมีหน้าสร้างคอร์ส สำหรับเด็กที่จ่ายมาพร้อมค่าคอร์สเลยแต่แรก คอร์ส 10 ชั่วโมง เช่า 10 ครั้ง พร้อมขึ้นบันทึกหน้าตารางให้เลย · กับเช่ารายครั้ง อาจจะเป็นกล่องขึ้นมาเหมือน LAST แต่เป็น R ค่ะ **ยังไม่จ่ายเป็น R กล่องสีแดง ถ้าเราไปกดจ่ายเงินให้แล้ว ค่อยเปลี่ยนเป็น R กล่องสีเขียวค่ะ** แต่พี่โด่งจะดีไซน์แบบอื่นก็ได้นะคะ

## §4 — PM's structured reading (the spec is now buildable; the remaining questions are money + price source)
**Three capabilities:** (1) RECORD an equipment rental · (2) REMIND the admin to collect the fee (the grid marker) · (3) NOTIFY the teacher the student is renting.
**Rental TIERS (fixed prices, the customer's list):** `50 = Helmet or Pad Only` · `100 = Helmet + Pad` · `150 = Ride only (skate / inline shoes / bike)` · `200 = Full Set`. **Full Set OR inline skate ⇒ a REMARK is required** (e.g. size), printed as `Rent 200 / Full Set (inline skate size 18-19 CM)`.
**Three rental patterns:**
- **A — whole course, paid upfront.** On the course-creation page: mark the course as rented ⇒ a rental for EVERY session (10-hour course = 10 rentals), recorded, and each session shows on the schedule already PAID. One tier for the course.
- **B — per session, pays at the shop.** A marker on the grid cell like the `Last` chip but `R`: **UNPAID = red `R`; after the admin marks it paid = green `R`.** This is capability 2 (the collect-cash reminder) made visual.
- **C — occasional (forgot own gear).** Same as B — a one-off per-session rental added on the day.
**Teacher notice (capability 3):** when a session carries a rental, the teacher is told "the student is also renting equipment" — a new outbox kind, STYLE mirrors the existing formats (REQ-089 §6 rule).

## §5 — the questions that still need the OWNER (money boundary + price source)
1. 🔴 **MONEY: does marking a per-session rental PAID (red→green) post revenue inside smart-scheduler** (rentals already `recordSale` at sale today, qty=hours) **, or is "paid" only a STATUS here and the money lives in the backoffice?** Same question for the whole-course upfront rental (post at creation vs status only). The owner's standing line puts revenue/expense in the backoffice — but rentals currently post here. **His ruling decides whether REQ-091 touches `recordSale` at all.**
2. **Prices (50/100/150/200): fixed in the app for now, or must an admin be able to change them?** (Editing prices is the kind of thing the owner has assigned to the backoffice; default = a fixed tier list here, and price changes are a separate/backoffice concern.)
3. **Confirm the whole-course rental uses ONE tier for all its sessions** (not a different tier per session), and that "10 hours = 10 rentals" means one rental per session-hour.
4. **`R+` vs `R`:** the first message said `R+`, this one says `R` red/green. Take **`R` with the red/green paid-state** (this is the fuller spec)? 

## §6 — OWNER, 2026-09-17
1. ✅ **MONEY POSTS HERE.** *"1.ใช่"* — marking a per-session rental PAID (red→green) posts revenue in smart-scheduler via `recordSale`, as rentals already do; the whole-course upfront rental posts at creation. **REQ-091 DOES touch `recordSale`.** (This is the one exception-by-existing-precedent to the backoffice-owns-money boundary: rentals have always posted here.)
2. ✅ **Prices FIXED in the app for now**; changing prices is a later BACKOFFICE capability. *"แก้ราคาจากฝั่ง backoffice later ฝังตายตัวไปก่อน"* — a fixed tier list (50/100/150/200), no price editor here.
3. ⏳ **Owner will ASK THE CUSTOMER** — he wants the exact question (below).
4. ✅ **`R` with the red(unpaid)/green(paid) state** — the fuller spec. *"อันหลังเลย"* — not `R+`.

### §6.3 — QUESTION for the customer (whole-course rental — tier per course vs per session), drafted for the owner to forward
> เรื่อง **เช่าทั้งคอร์ส** (จ่ายครบแต่แรก) ขอถามให้ชัดนิดนึงค่ะ:
> เด็กที่เช่าทั้งคอร์ส ใช้ **อุปกรณ์ชุดเดิม/ราคาเดิมทุกคาบ** เลยไหมคะ (เช่น Full Set 200 เท่ากันทั้ง 10 คาบ) — หรือ **บางคาบใช้ไม่เหมือนกัน** (เช่นบางคาบ Ride only 150 บางคาบ Full Set 200)?
> • ถ้าเหมือนกันทุกคาบ ⇒ ตอนสร้างคอร์สเลือกชุดเช่า **ครั้งเดียว** ระบบลงให้ครบทุกคาบอัตโนมัติ
> • ถ้าต่างกันได้ ⇒ ต้องเลือกชุดเช่า **รายคาบ** (งานจะใหญ่ขึ้นนิดนึง)

### §6.3 — ANSWERED by the customer, 2026-09-17: **ONE tier per course, same every session.**
> *"ปกติ เหมือนเดิมทุกคาบค่ะ ส่วนใหญ่เช่าทั้งเซ็ททุกคาบ หรือเช่าเฉพาะจักรยานทุกคาบ แบบนี้ค่ะ"*
✅ **A whole-course rental picks ONE tier at course creation and applies it to EVERY session** (Full Set every class, or bike-only every class). No per-session tier for the whole-course case. The SPEC IS NOW COMPLETE — the simpler build.

## §7 — @Sober's READ + sized plan (2026-09-17)
**Today:** a rental is ONLY a ledger post (`POST /rentals`→`recordRental`→`recordSale`, qty=hours); no rental table, no paid/unpaid state (posting IS paid), no remark, no course-level rental. `hasRental` exists on the calendar DTO but the FE renders nothing. Tiers = 4 codes (`rental-set` 200 · `rental-ride` 150 · `rental-helmet` 50 · `rental-pads` 50); **the customer's `100 Helmet+Pad` is NOT one item today** ⇒ Sober recommends a 5th code `rental-helmet-pads` 100.
**Shape:** a new `booking_rentals` row per booking (code, remark, `paid_at`); money still posts ONLY through `recordRental` — on the paid press (per-session) or at creation (whole-course, one `recordSale(code,size)`, refId=courseId). Grid reads the ROW (red=no `paid_at`, green=has). One migration ⇒ 36.
**Plan — 4 tasks, 2 deploys (Sober's rec):** **Deploy A** = T1 (BE: table+migration, `POST rental` unpaid, `POST rental/paid`, 5th code, DTO) + T2 (FE: `R` red/green chip + modal add/mark-paid) — the per-session collect-cash case. **Deploy B** = T3 (BE: whole-course rental at creation, one paid row per session) + T4 (FE create-course rental picker + BE teacher notice, copy gated). One deploy also possible.

## §8 — questions for the OWNER (Sober's two, + a price FYI)
1. 🔴 **Teacher notice — WHEN?** Sober's rec: **put a `Rental : Full Set (size…)` line into the teacher's EXISTING daily reminder** for that session (zero new messages) **and send a separate notice only for a rental added on the DAY** (after the reminder went). Alternative: a separate message on every rental (same effort, noisier).
2. 🔴 **Historic rentals** (posted before this ships) have no row ⇒ show **no `R`** (they were already paid, nothing to collect). OK, or backfill (a DATA REQUEST)?
3. 📌 FYI (price domain): the `100 = Helmet + Pad` tier does not exist as one item today ⇒ a NEW 5th sale code `rental-helmet-pads` 100 is added (one tier = one report line). Just so the ledger gains one product row.

## §9 — OWNER, 2026-09-17
1. ✅ **Teacher notice = Sober's recommendation:** a `Rental : …` line in the teacher's EXISTING daily reminder for that session, PLUS a separate notice only for a rental added on the DAY (after the reminder went). *"เอาตามแนะนำ"*
2. ✅ **Historic rentals: leave them** — no `R`, no backfill. *"อันเก่าๆปล่อยไป"*
3. ✅ 5th code `rental-helmet-pads` 100 accepted (unopposed). Deploy split = TWO (A then B) unless the owner collapses it.

## §10 — deploy plan, owner 2026-09-17
- Deploy A (T1+T2) is QA-green on `sid`; **it will NOT go to `uat` alone — bundled with Deploy B** (owner: *"รอรวมกับ B ทีเดียว"*). So `uat` gets A+B in ONE deploy, ONE migration run (`0035` still un-run on `uat`) + `sale:ensure-items` on `uat`.

## §11 — OWNER, 2026-09-17: Deploy B copy + audience
- ✅ **`RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️` copy APPROVED** as drafted. Strings land; send path final.
- ✅ **The `Rental : …` reminder line prints to BOTH teacher AND parent** (kept as built — the parent pays at the shop). Not teacher-only.

## §12 — LIVE on uat 2026-09-17
🟢 **REQ-091 (A+B) deployed to `uat`** — ledger reconciled via the TASK-085 repair (seed-ledger --apply → migrate 0035 → verify=36), `sale:ensure-items` added `rental-helmet-pads` 100, BE+FE restarted. Per-session `R` marker (red→green paid), whole-course rental at creation, teacher+parent notice all live. Only open thread: the owner verifies the `Rental :` / `RENTAL ADDED` LINE text on a real linked recipient (item 4/7 — read-blocked on sid); string-only edits if any.

## §13 — ACCEPTANCE PASSED, 2026-09-17
✅ **@Tanya acceptance re-confirm on `sid`: the built feature MATCHES the customer message point-by-point** (3 goals · 3 types · 5 prices · remark · print format · R red/green · whole-course 10h⇒10 R). Two wording notes accepted AS-BUILT by the owner (*"ตามนี้ก่อน"*): (1) the 50-tier stays TWO items `Helmet`/`Pad` (not one "Helmet or Pad Only"); (2) Ride-only keeps remark-required (stricter than the customer text, intended — needs a size). Only open thread: the owner verifies the teacher/parent notice TEXT on `uat` (read-blocked on `sid`). **REQ-091 COMPLETE.**

## §14 — RENTAL feedback round 2 (customer via owner, 2026-09-18)
> feedback RENT — 1. ต้องให้แจ้งเตือนครูด้วยค่ะ ทั้งในคอนเฟิร์มทั้งคอร์สและการแจ้งเตือนตารางสอนรายวัน · 2. ตอนสร้างคอร์สแบบนี้โอเคค่ะ แต่อยากให้มีต้องการเช่าทั้งคอร์สแบบยังไม่จ่ายด้วยค่ะ มีคุณแม่เช่าทั้งคอร์ส แต่ขอจ่ายเป็นรายครั้งด้วยค่ะ · 3. มีบางบ้านเช่าทั้งคอร์สไว้ แต่เรียนไปซักครึ่งคอร์ส หรือ 2-3 ครั้ง แล้วไม่เช่าแล้ว เราเอาออกในครั้งที่เหลือได้หรือเปล่าคะ (ถ้าถามเรื่องเงิน... ไม่มีการคืนเงิน... ไม่ต้องหักเงินออกจากในระบบนะคะ แค่ยกเลิกเตือนเรื่องน้องเช่าอุปกรณ์ / หรือเอา R ออกจากตาราง เพราะเลิกเช่าแล้วค่ะ) · ที่เหลือตามนี้เลยค่ะ โอเคแล้วค่ะ
### §14.1 — teacher told of a rental in the COURSE-CONFIRM message too
Today the rental reaches the teacher via the daily reminder line + the same-day RENTAL ADDED (§6/§9). Add the rental line to the **whole-course confirmation** message to the teacher as well. 📖 Clear.
### §14.2 — whole-course rental, UNPAID variant (pay per session)
Today a whole-course rental is born PAID (green `R`, one sale at creation). Add: rent the whole course but **NOT prepaid** ⇒ every session born **RED `R`** (unpaid), collected per session at the shop (each mark-paid posts that session's sale). A creation choice: paid-upfront vs pay-per-session. 📖 Clear.
### §14.3 — remove rental from the REMAINING sessions mid-course, NO money change
A family rented the whole course, then stops renting after 2-3 sessions ⇒ **remove the rental (`R` + the teacher notice) from the REMAINING/future sessions**. 🔑 **MONEY: owner-ruled NO deduction/refund** — "ไม่มีการคืนเงิน... ไม่ต้องหักเงินออกจากในระบบ" (they keep it as credit/discount outside the system). So this only clears the `R` and the notice on future sessions; paid past sessions and their ledger rows are untouched. 📖 Clear (money settled by the customer).
