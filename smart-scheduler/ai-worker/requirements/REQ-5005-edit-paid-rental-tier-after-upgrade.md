# REQ-5005: A rental already marked paid: how to change it when the family upgrades (Ride → Full Set)
**Owner, 2026-11-07:** forwarded Khwan's LINE question as a screenshot. **Status:** OPEN: a question first; no build asked for. Sober answers from the code, read only.

## 1. Khwan's words (LINE, 09:28), verbatim
> พี่โด่งคะ สอบถามว่าค่าเช่าที่เราบันทึกไปแล้ว คือกด paid ไปแล้ว สามารถแก้ไขยังไงได้บ้างคะ มีพ่อแม่ตอนแรกเช่าแค่ Ride แต่ไปๆ มาๆ เช่าทั้งเซ็ท จ่ายเงินเพิ่มค่ะ

**10:53, her reply to our first answer (owner sent it, screenshot):**
> ถ้าเป็นคอร์สที่จ่ายค่าเช่าล่วงหน้ามาแล้วล่ะคะ มีเคสแบบนี้ค่า ตอนแรกอาจจะเช่าไว้เฉพาะแผ่น พกสนับมาเอง แต่มีวันที่ลืมเอาสนับมา จะขอเช่ากับทางเราแบบนี้ค่ะ

## 2. What the files already say (REQ-091)
- Tiers: Ride only 150 · Full Set 200 · Helmet or Pad 50 · Helmet + Pad 100. Full Set needs a remark.
- Marking a per-session rental paid posts revenue here (`recordSale`). A whole-course upfront rental posts at creation.
- §14: removing a course rental clears future sessions only and never touches the ledger; the owner ruled no refund in the system for that case.
- Nothing found on changing the tier of a row already paid.

## 3. For Sober (read only, no change)
1. Per-session and whole-course: can admin change a paid rental's tier today, or undo the paid mark? Name the screen and the steps as she would see them.
2. If not, what can she do herself today so the extra 50 baht is recorded and the class shows Full Set? What does each way do to the revenue report and the teacher notice?
3. If nothing works without a change: the smallest change, sized. No TASK until the owner says so.

## 4. Rules
Nothing to the customer before Sober answers and Tanya passes the text. Self-serve answer first (owner 10-04). No holding message.

## Answer (Sober, SA, read-only, 2026-11-07) — on back `7601560`
Read: `rental.service.ts` (whole), `routes/api.ts:518–587`, front `RentalSection.tsx:20–166`.

**1. Can she change a paid rental's tier, or undo the paid mark? NO — not per-session, not whole-course.**
- **Per session:** once the row is paid, the screen (`RentalSection`) shows only the green "ชำระแล้ว" state — the **Mark paid** and **Remove** buttons are hidden (`{!rental.paid && …}`), and there is no edit/change-tier control at all. The API has no edit either: the only rental endpoints are add (`POST /bookings/:id/rental`, no money), mark-paid (`/rental/paid`), remove (`DELETE …/rental`). **Remove refuses a paid row:** `RENTAL_PAID` → *"ชำระแล้ว — ลบไม่ได้ (เงินลงบัญชีแล้ว ให้หลังบ้านปรับ)"*. One rental per session (`RENTAL_EXISTS`), so she can't add a second row on that class either.
- **Whole-course:** `DELETE /courses/:id/rental` only strips the rental from the *remaining* sessions and **moves no money** (owner's §14 ruling); it changes no tier.
- So on that Ride row she already pressed paid, there is **no self-serve way to turn it into Full Set.**

**2. What she CAN do herself today, and what each does:**
- The one self-serve door that still records money is the **standalone rental** (`POST /rentals`, the Rental modal): record a separate rental for the **+50** difference, using the **"Helmet or Pad 50"** tier (the amount is exactly +50).
  - **Revenue:** +50 posts correctly, as a **standalone rental line labelled "Helmet or Pad"** — not "upgraded to Full Set".
  - **The class still reads "Ride":** the session row's tier cannot change, so the booking does **not** show Full Set.
  - **Teacher notice:** a standalone rental sends **none** (the coach notice fires only on a *session* rental added same-day). The coach is not told of the extra gear.
- There is **no** self-serve path that is both right in amount **and** shows the class as Full Set. The system's own message already points the honest way — *"ให้หลังบ้านปรับ"* — but that back-office adjustment is the unbuilt REQ-120 work.

**3. Smallest change, if the owner wants the clean fix (no TASK yet):**
- An **"edit a paid rental"** path: a new endpoint that changes the tier + remark on a paid row and posts the **price difference** as its own sale (Ride→Full Set = +50), idempotent on the row, upgrade-only (a downgrade would need the refund decision §14 already answered "no in-system refund"); re-notify the coach if the class is today; a small FE control on the paid row; one test.
- Rough size **≈ 2–3 engineer-days** (BE delta-post + idempotency, FE control, QA). It moves money, so it belongs with the REQ-120 Revenue/Stock build, not as a loose patch.
- **No build without the owner's word.**
