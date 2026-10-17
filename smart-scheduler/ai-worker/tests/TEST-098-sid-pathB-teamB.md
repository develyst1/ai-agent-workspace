# TEST-098 — sid on back `942321c` · front `10682a6` (`0068`, Journal 69): Team B's Path B rows (731 · 730 rework · 732/733) + the 734 proof

**Tester:** Tanya (QA) · **Date:** 2026-10-12 · **Env:** sid, headless + the owner's phone (21ec5dd6, LINE = QA parent 0899990763) over adb · **Brief:** `inbox/QA.md` → "NEXT sid build" + "▶️ GO: TEST-098"
**Verdict: ✅ PASS on everything reachable** — 734 (bubble after republish ✅; the OA-Manager bump is the owner's read) · 730 rework ✅ · 732/733 ✅ · 731 P11 ✅ (with a 🟡 on where Reason prints) · P33/P34 · R48 · R58 ⚪ not reachable from this phone. The old code is in no image.

## 734 · step 0 — the CURRENT (old) published menus, BEFORE any republish
- 19:38:07, the sid OA chat at the bottom, the parent's rich menu open ⇒ tap the **«คุยกับแอดมิน / Chat with Admin»** cell.
- **Result:** the chat shows **only the bot's reply** `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ / Admin will talk to you soon.` (19:38). **No message from the user side** (no "คุยกับแอดมิน" bubble) ⇒ Khwan's symptom reproduced: nothing for the OA Manager list to bump on. ✅ step 0 recorded (`project-docs/qa-2026-10-12/test098/734-step0-old-menu.png`; the old code is not on screen).
- ⏳ **The OA Manager side** (does the chat move to the top of the list?) is the owner's to look at in his OA Manager login.
- The chat is now muted (the bot's normal reaction to that button); it is un-muted with `reopen` after the proof.
- **Next (the owner):** `bun run line:publish-menus` then `bun run line:relink-menus` on sid (🚫 never `line:remove-menus`) ⇒ I press again ⇒ expect the user-side "คุยกับแอดมิน" bubble + the chat on top in OA Manager.

## 734 · after the owner's republish + relink (6 accounts re-linked, incl. this phone)
- Re-entered the chat (LINE reloads the menu), pressed **«คุยกับแอดมิน»** at **19:49:02**, told Porter at once for the OA Manager look.
- **The chat now shows the user's own bubble `คุยกับแอดมิน` (19:49)**, then the same bot reply `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ / Admin will talk to you soon.` ⇒ **displayText works; the bot flow is unchanged** ✅ (`734-after-republish-bubble.png`; step 0 = `734-step0-old-menu.png`, no bubble).
- ⏳ **The bump to the top of OA Manager is the owner's read** (asked via Porter at 19:49).

## 1 · Build identity
`{n} Months` in the voucher message, the sale form's note box (`data-voucher-note`), the user-side bubble after the republish, and P11 with `เหตุผล` all answer on sid. None of them exists on `d32bdc4`.

## 2 · 731 (Khwan's answers)
| Row | How | Result | |
|---|---|---|---|
| **P11** via the **coach's own leave** (course `47f7c357`, make-up today 20:00 ⇒ `qa-coach-qatt75` own leave, 19:47) | family, TH | `❌ ยกเลิกคาบเรียน:` · Student · Program · Date 12-10-2026 · Time 20:00-21:00 · **`เหตุผล : ครูลา`** · **`Note : ระบบเพิ่มคาบชดเชยให้แล้ว`**, **no new-class date** | ✅ |
| **P11** via the **admin's «ครูลา»** cancel of a COURSE make-up (`458f6b42`, 02/03/27, 19:39) | family, TH | Note with no date ✅, but **no Reason line** | 🟡 |
| P33 / P34 `LEAVE RECORDED` | a COACH push | ⚪ no coach LINE on any QA device |  |
| R48 `children_none` | a parent with NO child | ⚪ this parent has 4 children |  |
| R58 `{n} children found` | register ⇒ Next ⇒ 0899990763 (19:50) | the reply names the children (`พบข้อมูลของคุณแล้วค่ะ — QAChatOne, …` / `Found your children — …`), so the count line is not on this path ⚪. (The re-register itself: `ผูกบัญชีผู้ปกครองสำเร็จ ✅`, same parent, nothing changed.) | ⚪ |

🟡 **For the SA, read in code (`942321c`, `scheduler.service.ts` ≈ :4222 and :4328):** the admin cancel passes the reason to the family notice as `enumReason`, which is the reason code only for 1HR/voucher rows, or for a COURSE row when it is `SCHOOL_ISSUE`. **A COURSE make-up cancelled by an admin with «ครูลา» therefore carries no `cancelReason`, and P11 prints no `Reason`.** The coach's own-leave door passes `"TEACHER_LEAVE"` explicitly, so the Reason prints there. The class cancel has the same gate, so this is pre-existing. Whether Khwan's "มี Reason" should also cover the admin's «ครูลา» on a course make-up is her or the owner's call.

## 3 · 730 rework + 732/733 — the voucher-sold message
| Sale | On the phone | |
|---|---|---|
| **Through the real form** (Bookings → Vouchers → Issue voucher; QAChatTwo, 10 h, the note box `QA TEST-098 remark`) ⇒ POST `{"student":…,"totalHours":10,"note":"QA TEST-098 remark"}` 201 (19:44) | `📅CONFIRMED SCHEDULE:` · `Student : QAChatTwo` · `Program : VOUCHER 10 HR` · **`*Expiry date : 6 Months`** · **`Remark : QA TEST-098 remark`** | ✅ |
| By API, **no note** (5 h, 19:44) | `… VOUCHER 5 HR` · **`*Expiry date : 3 Months`** · **no Remark line** | ✅ |
(`730-732-733-voucher-and-p11-admin.png`, `733-form.png`)

## Phone left
In the sid OA chat, **un-muted** (the register reset it), rich-menu bar restored. The owner's old code is in no image.
## QA data added
Vouchers `b1365c00` (10 h, with note) and a 5 h one for QAChatTwo · course `47f7c357` (P11 coach door) · the admin «ครูลา» cancel on `458f6b42` 02/03/27.
