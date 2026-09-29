# TEST-070: REQ-107 — rich menu v2 on the DEMO OA (TASK-466…472)

- Source: REQ-107 (§3 formats, §6 rulings) + RUNBOOK-richmenu-v2-demo-publish step 5. Customer wording:
  `project-docs/customer-2026-09-25-richmenu/rich-menu-messages.html`.
- Status: **PASS on every driven check** (the linked customer 6-cell menu is fully correct, incl. both key
  rulings). Two items not driven from a single linked phone — reasons + offer below.
- Surface: owner's demo phone (CPH2735, adb `BUR8GMX4C6CYNNIF`), demo OA **SOM-Balance-Demo (@125vuzsj)**,
  linked account 0900000092 → **customer (6-cell)**. Demo phone only; never the real OA, never another chat.
  Push is at quota (till 1 Oct) but replies are free — every tap answered.
- Tested: 2026-09-25 by Tanya. Menu chat bar = **`เมนู | Menu`** ✓.

## Cases
| # | Check | Result | Evidence |
|---|-------|--------|----------|
| menu | 6-cell customer menu renders, bilingual, all 6 cells | ✅ แจ้งลา/Request Leave · เช็คอิน/Check In · คอร์สของฉัน/My Course · เพิ่มนักเรียน/Add Student · ภาษา/ช่วยเหลือ/Language·Help · คุยกับแอดมิน/Chat with Admin | `req107-menu-6cell-full.png` |
| 5 | Image sharpness (full-screen, uncropped) | ✅ icons + text crisp and legible; not obviously soft/banded/flat (owner judges from the uncropped shot) | `req107-menu-6cell-full.png` |
| 2·course | คอร์สของฉัน format `[Remain: x/y] *EXPIRE: dd.mm.yy`, **no leave-quota** | ✅ e.g. "asda: Private SURFSKATE / Teacher Bank [Remain: 4/4] *EXPIRE: 15.10.26" — the old "สิทธิ์ลาเหลือ / leave left" is GONE | `req107-mycourse.png` |
| 2·checkin | เช็คอิน: pick-class or "No class today" | ✅ "วันนี้ไม่มีคลาส / No class today" (correct — no class today for this parent). The "Pick class 👇 / Program / Teacher @ time" format is identical to the leave flow's, verified there. | `req107-checkin.png` |
| 2·leave | แจ้งลา: Which child → Pick class → confirmation **with child name**, NOT "moves to the end of the course" | ✅ "กรุณาเลือกนักเรียนค่ะ"/"Which child? 👇" → child buttons → "Pick class 👇 · SAT 24/10 @ 15:00 : Balance Play (Group) / Teacher Camp" → **"บันทึกการลา : asda — SAT 24/10 @ 15:00 : Balance Play (Group) / Teacher Camp"** (names the child "asda"; no "moves to end" phrasing; over-quota → "admin unlock" warning). TASK-471 ruling met. (GROUP session ⇒ one name; DUO-names-both not exercised — no DUO for this fixture.) | `req107-leave-1-whichchild.png`, `req107-leave-2-pickclass.png`, `req107-leave-3-confirm.png` |
| 2·add | เพิ่มนักเรียน: LIFF link message, TH + EN | ✅ "กรุณากดที่ลิ้งค์... / Please click the link below to add a student" + `liff.line.me/2011571495-uCrah47D` + SOM SCHEDULE card | `req107-addstudent.png` |
| 2·lang | ภาษา/ช่วยเหลือ: toggle + short command list; **MENU PICTURE UNCHANGED** | ✅ "Switched to English ✅" + Available Commands (Add Student · My Course · Check-in · Request Leave); the 6-cell picture is **identical** after toggle — only the bot language + chat-bar label ("‹ Menu") changed | `req107-language-toggle.png` |
| 2·admin | คุยกับแอดมิน: existing admin/mute (the "closes menu" change is ON HOLD — not failed) | ✅ "แจ้งแอดมินให้แล้ว... / I have told an admin — someone will reply here shortly 🙏 (To use the bot again, type: reopen)"; menu stays shown (hold change correctly not applied); typing "reopen" un-mutes | `req107-chatadmin.png` |
| 3 | Typed commands "My Course" / "Request Leave" now work | ✅ "My Course" → the course list; "Request Leave" → "Which child? 👇" leave flow | `req107-typed-mycourse.png`, `req107-typed-requestleave.png` |

## Not driven from this phone (with reasons)
- **#1 — Unlinked 2-cell menu + `สมัครสมาชิก`/Sign Up + admin:** this phone's only chat is the LINKED customer
  account (0900000092 → customer 6-cell), set up by the owner for this demo. Seeing the `unknown` 2-cell menu
  needs either unlinking that account (would disturb the owner's deliberate demo state) or a separate unlinked
  fixture the phone doesn't have. **Offer:** on Porter's word I clear the LINE link (frontoffice API) → capture
  the 2-cell menu + the Sign-Up registration reply → then the owner re-links 0900000092 → customer. The
  admin/mute half of #1 IS verified (same handler, above).
- **#3 — typed phone still links:** not re-driven, to avoid re-pointing the demo link. The phone-shaped-text
  fallback was proven alive in the TASK-447/449 rounds (a phone typed in/out of the flow runs the link path).
- **#4 — teacher 2-cell menu + ตารางของฉัน:** not reachable — this phone is the parent's linked account; it
  can't also be the teacher "New" chat. Needs a phone/chat logged into a teacher-linked LINE account.

## Footprint
- **asda's 2026-10-24 15:00 Balance Play Group seat is now `SICK_LEAVE`** — from the แจ้งลา confirmation test
  (the brief required reaching the confirmation, which completes a leave). It was over-quota ("admin unlock").
  **I could not reverse it from the QA surface:** `PATCH /bookings/:id/status {action:"confirm"}` returns 200
  but leaves the status `SICK_LEAVE` (a no-op on a leave seat). ⚠️ **Residue — needs an admin restore/unlock.**
- Bot reply language left in **EN** (the owner had it on TH). One-tap flip; the MENU PICTURE is identical in
  either language, so the demo look is unchanged.
- **The demo link (0900000092 → customer 6-cell) is INTACT.** No menus deleted (the old menus still exist, as
  instructed). No push attempted (quota).

## Verdict
**PASS.** The customer 6-cell menu is correct end to end — chat bar `เมนู | Menu`, all six cells bilingual,
the new คอร์สของฉัน format without leave-quota, the leave confirmation that **names the child** and does not say
"moves to the end of the course", the LIFF add-student link, the language toggle that **does not change the menu
picture**, the admin/mute + reopen, and the new typed commands "My Course" / "Request Leave". Image looks
sharp (owner to confirm from the uncropped shot). Unlinked 2-cell (#1) and teacher 2-cell (#4) were not
driven from this single linked phone — #1 offered on Porter's word; #4 needs a teacher-linked chat.

## Evidence — `../project-docs/qa-2026-09-25/` (11 shots, named above)
req107-menu-6cell-full · req107-mycourse · req107-checkin · req107-leave-1-whichchild ·
req107-leave-2-pickclass · req107-leave-3-confirm · req107-addstudent · req107-language-toggle ·
req107-chatadmin · req107-typed-mycourse · req107-typed-requestleave

---

## Follow-up (2026-09-25) — UNLINKED path + LIFF sign-up re-link (owner-authorised)
Owner cleared me to unlink the demo phone (0900000092), test the unknown/sign-up flow, then re-link by phone
(which restores the demo). All on the demo OA + sid. **Result: PASS**, with one wording note.

| Step | Result | Evidence |
|---|--------|----------|
| Clear the LINE link (`POST /parents/07735dba…/clear-line-link` → `cleared:1`) ⇒ phone falls to the **2-cell `unknown` menu** | ✅ **สมัครสมาชิก / Sign Up** + **คุยกับแอดมิน / Chat with Admin**, bilingual, chat bar `เมนู | Menu` | `req107-unlinked-2cell-menu.png` |
| Tap **สมัครสมาชิก / Sign Up** ⇒ registration link reply | ✅ replies with the LIFF link `liff.line.me/2011571495-uCrah47D` + SOM SCHEDULE card. 🔸 **Wording note:** the message reads "Please click the link below to **add a student**" (same copy as เพิ่มนักเรียน) — for a brand-new Sign-Up a "register / sign up" phrasing reads better. The LINK is correct and the page says "Register". | `req107-unlinked-signup-reply.png` |
| The link opens `/register` inside LINE (demo LIFF 2011571495) | ✅ in-app page (som.develyst.online): **"Register"**, EN\|ไทย toggle, "Please enter your phone number" | `req107-unlinked-register-page.png` |
| Enter 0900000092 → Next ⇒ family found | ✅ "👥 **Found your family**": มิลล่า, มิลลิม, asda, temp · Phone 090-000-0092 · **Link this LINE account** | `req107-register-next-familyfound.png` |
| Tap **Link this LINE account** | ✅ "**Registration completed ✅** — Your children: มิลล่า, มิลลิม, asda, temp · Add a child · You can close this page" | `req107-register-linked-result.png` |
| Phone back on the **6-cell customer menu**; DB link restored | ✅ the 6-cell customer menu is back; `GET /parents?q=0900000092` → lineLinked `U287ecc7fd…` (restored) | `req107-relinked-6cell-menu.png` |
| **#4 Teacher 2-cell menu / ตารางของฉัน** | ⛔ **Not reachable** — this phone is the parent's linked account; I can't also be the teacher "New" chat, and I must not create links on other people's chats. Needs a teacher-linked LINE login. | — |
| Bot language left in **TH** (owner's instruction) | ✅ toggled to "เปลี่ยนเป็นภาษาไทยแล้ว ✅"; the 6-cell menu picture unchanged on the toggle | — |

## Updated footprint
- **Demo link 0900000092 → customer: CLEARED then RESTORED** via the LIFF re-link — net no change; the phone is
  back on the customer 6-cell menu, DB link intact, bot language **TH**.
- ⚠️ **Still open from the first round:** asda's 2026-10-24 Balance Play Group seat is `SICK_LEAVE`
  (over-quota, from the leave-confirmation test) — **needs an admin restore**; the re-link does not affect it.
- No menus deleted; no push used; no links touched on any other chat.

## Follow-up verdict
**PASS.** The unlinked path is correct: unknown 2-cell menu (Sign Up + Chat with Admin), the Sign-Up LIFF
registration opens and completes end to end, and re-linking by phone restores the customer 6-cell menu.
🔸 One copy nuance to consider: the Sign-Up reply text says "add a student" rather than "register / sign up"
(link + page are correct). #4 teacher menu remains unreachable from a parent phone.
