# REQ-108 — A fixed QR on the shop front for self check-in

- **Source:** customer Khwan, via the owner, 2026-09-25.
- **Status:** QUEUED. Owner: "ต่อคิว ไป". It comes after REQ-107. Sober analyses it only when REQ-107 is through.

## What exists today (Porter checked the code, 09-25)
- `/checkin?token=…` is the per-session check-in page. A parent opens it from a LINE link the bot sends, and the token is the credential.
- `/checkin/camp?token=…` is the same page for a camp day.
- The Camp page has a QR dialog (`QrDialog`, TASK-404). That is the only QR image in the app.
- The rich-menu `เช็คอิน` button checks in inside the chat. REQ-107 changes its wording only.
- **Missing:** one fixed QR that stays on the shop wall for every session.

## The customer's flow (verbatim)
```
จากนั้น
—> กรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้ในระบบ LINE
—> เลือกชื่อนักเรียน
—> เลือกคลาสที่ต้องการเข้าเรียน
—> กด Check-in ✅
```
The step before this is a scan of a fixed QR printed at the shop front.

## Porter's notes for the analysis (not rulings)
- 🔴 **The only credential is a phone number.** Anyone who knows a family's phone could check their child in, and could also see the child names (the same PII question as TEST-067).
  - Sober should propose the guard. Options include: today's sessions only; a short window around start time; and whether a QR that rotates daily, or a code at the counter, is worth it.
  - The answer is an owner decision.
- "Registered in the LINE system": does the flow require the phone to be LINE-linked, or is any family phone enough?
- The flow must also cover camp days, given the camp check-in page and credit rules (REQ-104).
- What the admin sees afterwards: the same ATTENDED state as the other check-in paths, plus any parent notification.

## Owner, 2026-09-25: released. It SHIPS WITH REQ-107
Owner: "ใช่ เพราะมันต้องไปด้วยกัน ขวัญอยากได้". REQ-108 is no longer queued behind REQ-107. It goes to uat in the **same release** as the rich menu v2 round.
- Sober analyses it now.
- The phone-only-credential guard comes back to the owner as options plus a recommendation BEFORE anything is built.

## Owner ruling, 2026-09-25: no LINE identity
Owner: "ไม่ได้ มันไม่สามารถเปิดกับไลน์ได้ ต้องรองรับลูกค้าที่ไม่ใช่ ผปค เป็นแค่พี่เลี้ยงเด็ก พาเด็กมาเรียนด้วย".
- The person at the counter may be a **nanny or driver**, not the LINE-linked parent.
- ⇒ Sober's option A (LIFF identity) is **rejected**.
- ⇒ Option B (a code pushed to the family's LINE) fails for the same reason: the code lands on the parent's phone.
- ⇒ The flow stays **phone-based, as Khwan drew it**.

**Guards Porter proposes** (the owner decides; all of them work for a nanny):
1. **Today and in-window only.** The phone shows only sessions that are check-in-able right now.
2. **Show only the children who have such a session.** Never the whole family list. Nothing to check in ⇒ a neutral "no class to check in right now", with no names.
3. **The parent is told on LINE at once.** This path already exists. Misuse becomes visible within seconds, and the admin can reverse it.
4. **A light rate limit** on phone lookups from one device or IP.
- **Owner, 09-25:** "เอาตามแนะนำ". Phone-based flow with guards 1–4 above. **Released to build.** It ships with REQ-107 to uat.
- **Owner rulings, 09-25:**
  1. **Accept the guard-3 gap for this release.** The instant notice covers only course and voucher sessions of LINE-linked families. Provenance is recorded instead. A check-in notice for every session type is a possible later task.
  2. **A false check-in is reversed by the new admin "Undo" action.** The seat goes back to CONFIRMED, the credit is returned, and NO message goes to anyone. Cancel and sick-leave are not used for this.
  3. **DUO:** only the suspended family is refused. The non-suspended family's child CAN check in.
- **09-25, the fixed poster URL (Sober, frozen with a test): `https://frontoffice.develyst.online/checkin/shop`.** No token. The poster may be printed now, but should go on the wall only after the uat page is confirmed live.
  - TASK-475/476: backend, migration 57.
  - TASK-478: FE page, 586/0.
  - The split was agreed: REQ-107 + REQ-108 go to uat first; Undo leave/check-in and the DUO change follow right after.
- **09-25, Khwan:** "ในคิวอา เลือกหลายคลาสได้ไหมคะ ถ้ามีลูก 2 คน". Porter read the page (`ShopfrontCheckinContent.tsx`):
  - today it offers **one pick, then check-in, then the success view**;
  - a second child means entering the phone again.
  - Proposal: multi-select, meaning checkboxes plus one Check-in button. The owner decides the timing: this release, or the follow-up with Undo/DUO.
- **Owner, 09-25: shop-QR multi-select goes in the NEXT round**, together with Undo leave/check-in and the DUO change. It is NOT in the current uat release.
