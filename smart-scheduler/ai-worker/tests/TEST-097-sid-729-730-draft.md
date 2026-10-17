# TEST-097 — sid rebuilt from the working folder: DRAFT TASK-729 (P43/P44) + TASK-730 (D1 voucher sold)

**Tester:** Tanya (QA) · **Date:** 2026-10-12, 03:10–03:25 · **Env:** sid (rebuilt by the owner from the working folder = `d32bdc4` + uncommitted 729/730), admin, headless + the owner's phone (21ec5dd6, LINE = QA parent 0899990763) over adb · **Brief:** `inbox/QA.md` → "▶️ GO: the owner rebuilt sid … DRAFT 729 + 730"
**Verdict: 730 ✅ live and correct. 729 ⚪ live by code path, but P43/P44 NOT reachable on the one phone QA has** (why below). 711 + 727 regression ✅. **The old shared code is in no screenshot** (every image taken at the bottom of the chat and checked before saving).

## 0 · Build identity
- **730 is live:** a voucher sale now sends the family a message. No such message exists on `d32bdc4`.
- **729:** P43/P44 could not be triggered (§1). Its live presence is **not proven by behaviour**; it rides the same rebuild that carried 730.

## 1 · TASK-729 — P43/P44 (the «คุยกับแอดมิน» bell with the LINE display name / fallback)
- **The phone is NOT an unlinked person.** Porter's brief assumed it is unlinked since B6. B6 removed only its **admin** link; it is still the **linked parent** 0899990763. So it cannot produce **P44** (`unlinked_asked_for_admin`).
- **P43 attempt:** I re-linked the phone as admin (a fresh one-time code for `qa-norate-076`, burned on use), then tapped the rich-menu «คุยกับแอดมิน» (03:18). The bell that arrived (03:19) was **P41**, not P43:
  > `🔔 Please support Parent of Student QAChatOne & QAChatTwo & QA Link 080 C & QA Link 080 D.`

  An account that is **both** a parent and an admin is resolved as the **parent** for this button, so P43 cannot come from it. *(P41 itself is a 727 row and reads correctly: ✅.)*
- ⇒ **P43 needs an admin-ONLY LINE account; P44 needs a LINE account linked to nothing.** Neither exists on any device QA can drive. **⚪ Not testable here**, and the same applies to the fallback "ผู้ใช้ LINE · HH:mm". To close it: the owner (or a second phone) presses «คุยกับแอดมิน» from (a) a LINE that only an admin web user is linked to ⇒ P43, and (b) a LINE never registered with the OA ⇒ P44; then this phone (re-linked as admin) reads the bell.
- 🟡 **For the SA/owner, an observation:** a dual-role account's «คุยกับแอดมิน» is announced as a parent's. That is probably right (the parent is the one asking), but P43 is then only reachable by admin-only accounts.
- **"Never stored", by data:** QA has no read of `notification_outbox`, so this is a **DATA REQUEST for the owner** (bare SQL). Run it after a P43/P44 press:
  ```sql
  SELECT id, created_at, recipient_type, payload
  FROM notification_outbox
  WHERE payload->>'kind' IN ('admin_asked_for_admin', 'unlinked_asked_for_admin')
  ORDER BY created_at DESC
  LIMIT 10;
  ```
  PASS = the `payload` has a `lineUserId` and a `pressedAt`, and **no `chatName` / display name** anywhere. (By code: Bob's pins + Silver's re-run say the name is read only by the push worker and never written back.)
- Phone state restored: the chat was un-muted with `reopen` (the command list came back, 03:20); `qa-norate-076` is **unlinked** again (`lineLinked: false`, LINE admins panel empty).

## 2 · TASK-730 — D1, a voucher SOLD ⇒ the family's CONFIRMED SCHEDULE
| Act | On the phone | |
|---|---|---|
| **Sale:** `POST /vouchers` QAChatTwo, 5 h ⇒ voucher `dd88c8fd`, expiry 2027-01-12 (03:14) | `📅CONFIRMED SCHEDULE:` · `Student : QAChatTwo` · `Program : VOUCHER 5 HR` · `*Expiry date : 12-01-2027`: **the real date**, **no Remark line** (a sale has no note field, so the line never prints, as Bob declared), ONE message | ✅ |
| **Import:** `POST /vouchers/import` QAChatTwo, 5 h, expiry 2027-01-31 (03:15) | **no message** | ✅ |
Evidence `project-docs/qa-2026-10-12/test097/d1-voucher-sold.png`. Still DRAFT (Khwan Q5: expiry as a date vs "3 Months"; the Remark source).

## 3 · Regression
- **711:** course `d3027ffd` (QAChatTwo): leave 05/03/27 ⇒ Undo (03:21) ⇒ the make-up's cancel (09-04-2027), then `✅ มีคาบเรียนตามเดิม: … 05-03-2027 … Note : ยกเลิกการลาแล้ว เรียนคาบนี้ตามปกติค่ะ`, no Coach line ✅ (`711-on-again.png`).
- **727 sample:** P41 live as above ✅; D1 / P14 / R39 / R62 already live (TEST-095/096).

## Phone left
LINE on its home screen. The sid chat's bottom bar may be in **keyboard mode** (one ☰ tap restores the menu). The chat is **un-muted**. Two slips, both navigation only: a Back left the chat earlier than planned, and the following tap landed on LINE's home screen. Nothing was opened or changed.
## QA data added
Vouchers `dd88c8fd` (sold) and `4593f9d6` (imported) for QAChatTwo · a leave + Undo on `d3027ffd` 05/03/27 · admin leaves on `d3027ffd` 19/02 and 26/02/27 (B5/B6 triggers).
