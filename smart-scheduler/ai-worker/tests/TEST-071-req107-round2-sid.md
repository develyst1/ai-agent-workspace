# TEST-071: REQ-107 ROUND 2 — changed items after TASK-474 + demo republish #2

- Source: Porter's REQ-107 round-2 brief (2026-09-25). sid BE through TASK-474; demo republished (new ids:
  unknown `226900ec` [default], customer `87eca284`, teacher `85797f81`, all `selected=false`). 5 followers
  re-linked incl 0900000092. Old menus kept (⛔ never `line:remove-menus`).
- Status: **PASS on the driven items** (1, K1, K3, K0a). **K4 partial** (footprint limit). **K5 not testable in
  this window.** **Teacher menu not reachable** (parent phone).
- Surface: demo OA SOM-Balance-Demo (@125vuzsj) on the owner's phone (adb `BUR8GMX4C6CYNNIF`). Replies free
  (push at quota). Tested 2026-09-25 ~18:53–19:06 by Tanya.

## Results
| Item | Check | Result | Evidence |
|---|---|---|---|
| **1** | Menu starts CLOSED; the `เมนู \| Menu` bar opens it | ✅ opens collapsed (`เมนู \| Menu ▲`); tapping the bar opens the customer 6-cell menu | `req107r2-menu-collapsed-closed.png`, `req107r2-menu-open-6cell.png` |
| **K1** | Language/Help both ways: **blank line** after the switch line; TH also shows the TH command list; picture unchanged | ✅ EN: "Switched to English ✅" + blank line + "Available Commands:" list. TH: "เปลี่ยนเป็นภาษาไทยแล้ว ✅" + blank line + "คำสั่งที่ใช้ได้:" **TH list**. Menu picture unchanged both directions. | `req107r2-K1-lang-EN.png`, `req107r2-K1-lang-TH.png` |
| **K3** | Chat-with-Admin exact wording; no "(type: reopen)" hint; bot goes quiet; un-mute works | ✅ exactly `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ` / `Admin will talk to you soon.`, **no reopen hint**. Bot muted: a free-text message ("test123") got **no reply**. `reopen` (typed) **un-muted** (command list returned). 🔸 Note: a rich-menu tap (คอร์สของฉัน) was **still answered during the mute** — menu postbacks aren't silenced, only free text. (`เปิดเมนู` is the documented TH un-mute keyword; adb cannot inject Thai text, so I verified the un-mute via `reopen`, which still works.) | `req107r2-K3-chatadmin.png`, `req107r2-K3-mute-reopen-unmute.png` |
| **K0a** | Sign Up has its OWN reply `…เพื่อสมัครสมาชิกค่ะ` / `…to sign up.` | ✅ **FIXED** — "กรุณากดที่ลิ้งค์ด้านล่างเพื่อ**สมัครสมาชิก**ค่ะ / Please click the link below to **sign up**." (round 1 wrongly said "add a student"). Add-Student keeps its own "add a student" copy. Reached by unlink → 2-cell menu → Sign Up; re-linked via /register after. | `req107r2-K0a-signup-reply.png` |
| **K4** | Check-in / Leave pick carries `Teacher <name>` (was bare `24/10 15:00`) | 🟡 **PARTIAL** — the leave **confirmation** carries it: "บันทึกการลา : asda — SAT 31/10 @ 15:00 : Balance Play (Group) / **Teacher Camp**", and the round-1 pick message already showed "· … / Teacher Camp". The multi-option pick **buttons** could NOT be re-captured: the asda fixture's two leavable Balance-Play-Group sessions are now spent (I leaved them across rounds), and reaching another child's pick step risks auto-completing a leave on a single-option child — I won't add more irreversible footprint. Check-in pick needs a same-day class (none today). Recommend the owner confirm the button payload, or restore the leaves and I re-run. | `req107r2-K4-leave-pick-teacher.png` |
| **K5** | Late check-in window (default 0 → "too late"; set 60 → success before 17:30; settled ⇒ "too late") | ⛔ **NOT testable in this window** — the fixture parent has **no class today** (kids' sessions are 2026-09-26+), and it is **past the 17:30 day-end** (tested ~19:00), so neither the "missed class" nor the "after class end, before 17:30" path can be exercised. I did not change the `เช็คอินได้หลังจบคลาส (นาที)` setting (no same-day class to check into). **Recommend:** run K5 on a day with a booked class, before 17:30. | — |
| **7 / teacher** | Teacher 2-cell menu + ตารางของฉัน | ⛔ **Not reachable** — this phone is the parent's linked account; can't also be the teacher chat, and I won't create links on other chats. | — |

## Footprint
- ⚠️ **Two leaves recorded on the demo customer account, could NOT be reversed from the QA surface:** asda's
  **2026-10-24** (round 1) AND **2026-10-31** (this round) Balance Play Group seats are `SICK_LEAVE` (both
  over-quota, "admin unlock"). `PATCH /status {action:confirm}` is a 200 no-op on a leave seat. **Needs an
  admin restore.**
- Free-text test messages sent to the demo chat: "test123", "reopen" (harmless).
- Demo link CLEARED (for K0a) then RESTORED via /register (parent detail `lineLinked: true`; phone on the
  6-cell customer menu). Net: link intact.
- Bot language: **TH** (the re-link defaults to TH, per the round-1 follow-up pattern).
- คุยกับแอดมิน alerted a human admin (as designed); I did not interact with any human. No menus deleted; no
  push used.

## Verdict
**PASS** on items 1, K1, K3, K0a — including the K0a Sign-Up wording fix I flagged in round 1, the K3 exact
wording with no reopen hint, and the K1 blank-line + TH command list. **K4 partial** (Teacher name confirmed
in the confirmation; the multi-option pick BUTTON payload not re-captured to avoid more irreversible leaves).
**K5 could not be tested** (no same-day class + past 17:30). **Teacher menu unreachable** from a parent phone.
Open for the owner/admin: restore asda's two leaves; decide whether to re-run K4's button payload and K5.

## Evidence — `../project-docs/qa-2026-09-25/` (8 named shots)
req107r2-menu-collapsed-closed · req107r2-menu-open-6cell · req107r2-K1-lang-EN · req107r2-K1-lang-TH ·
req107r2-K3-chatadmin · req107r2-K3-mute-reopen-unmute · req107r2-K4-leave-pick-teacher · req107r2-K0a-signup-reply
