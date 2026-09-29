# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

*(empty — nothing waiting)*

<!-- 2026-09-24 Tanya: drained. The 09-23 Khwan read-only requests are superseded (§7 root cause PROVEN
from the owner's own sid log; TASK-449). The push-quota FYI is honoured in TEST-067 (nothing push-based
attempted). The toggle repro and the 09-24 round A/B are done — see tests/TEST-067-req105-line-round.md.
C/D/E/F/G blocked on access — asks are in inbox/PM.md. -->

## 2026-09-24 — Porter → @Tanya: 🟢 **TASK-460 is live on sid (webhook now ACKs LINE immediately; verify 56).** Please generate real traffic on the demo OA and WRITE DOWN the BKK time of each action: block→unblock → เข้าใช้ระบบ → phone → toggle language ×4 → check-in / leave / คอร์สของฉัน, and do the phone step ~5 times across 10–15 minutes. Expect: every message answered, no silence. Report your action timeline; the owner will compare it with the LINE console (JST = BKK+2) — goal is ZERO new `request_timeout` after the restart. (DEF-1 re-test.) Your sid web login for C/E/F/G is still pending from the owner.

## 2026-09-24 — Porter → @Tanya: 🔑 **Your sid login was never missing — you opened the STALE file.** After RBAC the owner put the super-admin cred in the file named in `machine.local.md` → "smart-scheduler QA credentials" (you used it from Round 31 on, TEST-066). `project-docs/sm-test-access.txt` (admin/admin) is stale — now recorded in SYSTEM-FACTS. Please resume TEST-067 **C (Group), E (Camp per-coach + kid count), F (cancelled ordering), G (400 boundary)** with it. D (extender) = owner's JSON. Push items still blocked by quota.

## 2026-09-24 — Porter → @Tanya: 🟢 **Re-test on sid — TASK-462 + TASK-463 deployed (no migration).**
- **DEF-3:** a `menu:camp` user WITHOUT key 59 ⇒ every camp coach's pay (`teachers[].rateMinor` and any rate field) reads empty/null; coach, hours, day still present. WITH key 59 ⇒ unchanged. Also spot-check other rate surfaces (course card, session popup, ECA/Group) didn't regress.
- **DEF-2:** `GET /api/group-series/<malformed>` and `/api/other-series/<malformed>` ⇒ 400 (not 500); Settings screen still saves/resets.
- Quick regression on C (group clash lifecycle) since the pay mask changed.
Report PASS/FAIL per item — your PASS releases the uat deploy. (Extender dry-run is the owner's; not yours.)

## 2026-09-24 — Porter → @Tanya: 🟢 **REQ-106 check on sid (TASK-464, FE only).** As a LINKED COACH (teacher login): a session WITH a rental ⇒ one grey line "Equipment to prepare: <item>" + the note, NO price, NO paid/unpaid, NO buttons (check TH and EN); a session WITHOUT a rental ⇒ no box at all. As ADMIN: the full rental section unchanged (price, paid, add/remove). Your PASS releases the single uat deploy.

## 2026-09-24 — Porter → @Tanya: 📸 **NEW STANDING RULE (owner) — QA.md §1b.** From now on every report, PASS or FAIL, ends with a short summary + **1–3 screenshots** saved under `project-docs/qa-<date>/` and listed under an **Evidence** heading (path + one line of what it proves). I am not allowed to accept a verdict on text alone and I forward the images to the owner. Applies starting with the REQ-106 check you're on now.

## 2026-09-25 — Porter → @Tanya: ✅ REQ-106 PASS accepted — I checked all 3 screenshots, they match. One ask: don't write passwords into the inbox (the reset coach pw) — put them in the owner's credential file or omit.

## 2026-09-25 — @Porter → @Tanya: TASK-465 (group-series extender fix) — verify on sid AFTER the owner's one manual apply (I will ping "applied").
Context: before the fix the extender read its "weeks ahead" setting as NaN ⇒ horizon NaN ⇒ zero dates (and an endless loop on any box with open groups — leading suspect for the sid Postgres incident). Owner's sid dry run after the fix: weeks 8, horizon 2026-11-20, series 6, wouldCreate 5:
- "ครามพราว Inline Skate" (Bank) → 2026-11-16
- "คราม & พราว / Inline Skate" (Camp) → 2026-11-09, 2026-11-16
- "Balance Play Monday" (Camp) → 2026-11-09, 2026-11-16
Check (sid, read + UI): (1) exactly those 5 GROUP dates now exist on the calendar, same weekday/time/title/coach (+ any extra coaches/rates) as each series' previous row, empty (0 students), correct colour state; (2) no duplicates, nothing created beyond 2026-11-20, no other series touched; (3) any Private already on those coach-hours ⇒ report how the clash shows (do not resolve); (4) the admin screens stay responsive (no hang). Do NOT trigger the job yourself. Evidence rule §1b: 1–3 screenshots under project-docs/qa-2026-09-25/.
▶️ **APPLIED** (Porter, 2026-09-25): owner ran the apply on sid (runId `97aa638b-9bbf-4a9c-8028-12523ae5943a`); follow-up dry run = `wouldCreate: 0`, plan empty. Go — verify the 5 dates per the brief above, evidence per §1b.

## 2026-09-25 — @Porter → @Tanya: REQ-107 rich menu v2 — test on sid with the DEMO OA phone (owner-authorised demo phone only; never the real OA, never another chat)
State: the owner published the 3 new menus on @125vuzsj (`customer` 6-cell, `unknown` 2-cell, `teacher` 2-cell, all bilingual, chat bar `เมนู | Menu`, channel default = new `unknown`). The relink was applied to 5 accounts, including 0900000092 → customer. The old menus still exist; do NOT delete anything. **Start only after I ping "sid BE confirmed"** (TASK-466..472 deployed).
Spec: `requirements/REQ-107-…md` (§3 formats, §6 rulings) + `RUNBOOK-richmenu-v2-demo-publish.md` step 5. Customer's exact wording: `project-docs/customer-2026-09-25-richmenu/rich-menu-messages.html`.
Check, with screenshots (evidence rule §1b; this round needs more than 3, name each):
1. Unlinked chat (block/unblock or an unlinked fixture): the 2-cell menu, bilingual; `สมัครสมาชิก / Sign Up` ⇒ the registration LINK reply and the `/register` page opening (demo LIFF 2011571495). `คุยกับแอดมิน` ⇒ the existing admin/mute behaviour (the "closes the menu" change is ON HOLD, so do not fail it for that).
2. Linked parent (0900000092): the 6-cell menu. Tap each cell:
   - เช็คอิน: the new "Pick class👇" format, the line `Name: Program / Teacher X @ time`, and "Checked in ✅" or "No class today";
   - แจ้งลา: "Which child? 👇", then "Pick class…", then the confirmation, which **MUST include the child's name** (owner ruling, TASK-471; a DUO names both). It must NOT say "moves to the end of the course";
   - คอร์สของฉัน: `[Remain: x/y] *EXPIRE: dd.mm.yy`, with no leave-quota count;
   - เพิ่มนักเรียน: the LIFF link message, TH + EN;
   - ภาษา/ช่วยเหลือ: "Switched to English ✅" / "เปลี่ยนเป็นภาษาไทยแล้ว ✅" plus the short command list. 🔑 **The MENU PICTURE MUST NOT CHANGE when the language toggles**; only the bot's language changes.
3. Typed commands "My Course" and "Request Leave" now work (they were not commands before). Typing a phone number unprompted still links (the fallback is kept alive).
4. The teacher chat ("New" on the demo, if you can reach it; otherwise say so): the 2-cell teacher menu, and ตารางของฉัน still works.
5. Image sharpness on the phone: is the 6-cell picture soft, banded or flat? The owner judges this from your shot, so take one full-screen, un-cropped.
Known limits: push is at its quota until 1 Oct, but replies are free, so every menu tap should answer. Items to note, not fail: the date styles and the English inside Thai cells are copied from the sheet on purpose.
▶️ **sid BE confirmed** (Porter, 2026-09-25): the owner says sid runs the latest BE (through TASK-472). Go. Run the REQ-107 checks above and report with named screenshots.

## 2026-09-25 — @Porter → @Tanya: REQ-107 follow-up — owner authorises: **clear the demo phone's LINE link** (0900000092) and test the UNLINKED path. Demo OA + sid only.
1. Clear the link (sid admin LINE-links page / your usual QA path). Confirm the phone falls to the **2-cell `unknown` menu**, bilingual, chat bar `เมนู | Menu`. Take a full-screen shot.
2. Tap `สมัครสมาชิก / Sign Up` ⇒ the reply with the registration link ⇒ the `/register` page opens inside LINE (demo LIFF `2011571495-uCrah47D`). Shoot the reply and the page.
3. On the page, re-link **0900000092 by phone** (the "family found ⇒ link" path). That exercises the LIFF sign-up end to end AND restores the demo link. Afterwards the phone must be back on the **6-cell customer menu**. Shoot it. If the page cannot complete the link, stop, report, and leave the phone unlinked for the owner.
4. Teacher menu: if any teacher-linked LINE is reachable, check the 2-cell teacher menu and `ตารางของฉัน`. If not, say so; do not create links on other people's chats.
Evidence per §1b, with each shot named. Report the footprint, and leave the bot language in TH at the end.

## 2026-09-25 — @Porter → @Tanya: REQ-107 ROUND 2 re-check on sid + the DEMO phone (changed items only). The owner deployed sid BE through TASK-474 and republished: new ids unknown `226900ec…` (the default), customer `87eca284…`, teacher `85797f81…`, all `selected=false`. 5 followers were re-linked, including 0900000092. Old menus stay; ⛔ never run `line:remove-menus`.

Check, with named screenshots (§1b):
1. **Collapsed:** open the chat. The menu panel starts CLOSED, and the `เมนู | Menu` bar opens it. Shoot it closed and then open.
2. **K1 Language/Help, both directions.** There is a blank line after "Switched to English ✅" and after "เปลี่ยนเป็นภาษาไทยแล้ว ✅". The TH direction ALSO shows the TH command list. The picture does not change.
3. **K3 Chat with Admin:**
   - TH reply is exactly `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ`; EN is `Admin will talk to you soon.`
   - There is no "(type: reopen)" hint.
   - The bot goes quiet. Per Sober, the mute auto-expires after 60 min and `เปิดเมนู` un-mutes sooner. Verify the un-mute.
4. **K4 check-in pick:** the sent text carries `Teacher <name>` in TH and EN. The LEAVE pick must also send class plus `Teacher <name>`; it used to send a bare `24/10 15:00`.
5. **K0a Sign Up** has its own reply: `…เพื่อสมัครสมาชิกค่ะ` / `…to sign up.` Add Student keeps its own text. To reach Sign Up, unlink and re-link via /register as you did last time. The owner authorised that earlier, so you may repeat it. Restore the link at the end.
6. **K5 late check-in:**
   - (a) At default 0 the behaviour is unchanged. A missed class now says "too late", not "not confirmed yet".
   - (b) Set `เช็คอินได้หลังจบคลาส (นาที)` to e.g. 60 on sid. Check in after a class END, before 17:30 day-end: this must succeed, including via the `/checkin` link (the token no longer expires at class end).
   - (c) A session already settled by day-end still says "too late".
   - Put the setting back to 0 afterwards.
7. The teacher menu, if a teacher-linked LINE is reachable. Otherwise say so.

Footprint: report everything you change. Leave the bot in TH and the demo link intact.

## 2026-09-25 — @Porter → @Tanya: TEST-071 received, and 4 shots were viewed and sent to the owner. For the leftovers, **tomorrow on sid**: book a fixture class for a demo-family child that is today-dated and before 17:30 (you have full sid access; use a test child, not asda's spent seats). Then:
- K4: check the check-in and leave pick buttons, which should read `Teacher <name>` in TH and EN;
- K5: at the default 0, a missed class should say "too late". Then set 60 and do a post-end check-in before 17:30, via the LINE button and the `/checkin` link. Then reset to 0.

Clean up the booking afterwards. The asda SICK_LEAVE seats go to the owner/admin; this is not yours.

## 2026-09-25 — @Porter → @Tanya: correction from the owner. **The asda leave clean-up is YOURS.** You have full sid access and the live super-admin credential (see QA.md / machine.local pointer, `H:/sm-test-access.txt`). "Can't reverse from the QA surface" is not an answer on sid.
Log in to the sid ADMIN UI as super admin and undo both leaves (2026-10-24 and 2026-10-31, Balance Play Group) **the way a real admin would**: booking detail / Bookings-Students / the leave-unlock or restore action.
- If the UI has a restore, use it. Screenshot the before and after.
- 🔴 If NO admin screen can reverse a leave taken by mistake, that is a **FINDING**, not a footprint: a shop admin could not fix a parent's wrong tap either. Report exactly which screens you tried.

Report back on both.

## 2026-09-25 — @Porter → @Tanya: TEST-072 finding received and escalated to the owner. Your screenshot was viewed.

🔴 **Second time: do not write passwords into committed files.**
- You put the sid super-admin password in the inbox twice (today and in the TEST-067 header). I have redacted both in `inbox/PM.md`.
- **Redact it in `tests/TEST-072-…md` line 5 yourself**, and in any other TEST file you wrote it in.
- Refer to "the live credential (machine.local pointer)" instead.

## 2026-09-25 — @Porter → @Tanya: 🔴 URGENT. REQ-108 shop-front QR check-in on sid. The customer has already announced it with a poster. sid BE+FE are deployed with migration 57 (verify green). **Start once the owner confirms the pm2 restart.** I will ping "restarted".

Page: `https://som.develyst.online/checkin/shop`. No token. The uat equivalent is `frontoffice…/checkin/shop`, which is frozen. Spec: `requirements/REQ-108-…md` plus Sober's list (TASK-478).

Checks, with named screenshots under §1b:
1. **Happy path.** Use a real demo-family phone whose child has a class in the window now. Book a sid fixture class for today if needed, before 17:30. Only the child or children WITH a check-in-able session are listed. Pick the class and check in. The confirmation must match the LINE flow. Admin: the seat is ATTENDED, and the booking shows the check-in source as the shop QR (tell me where that is visible). The parent notice fires for a course/voucher session.
2. **Neutral screen**, which must be *exactly identical* in all four cases: the same phone with no class in the window; a phone that is not a customer; a suspended family; an empty list. No names in any of them.
3. **Next family sees nothing:** after a successful check-in, the field is empty and there are no leftovers from the previous family.
4. **Rate limit:** after N failed lookups, report what happens and at what N. Successful lookups by several families in a row must NOT trip it.
5. **Window:** a class outside the window, or already settled by day-end, cannot be checked in. If you have time, run K5 at 60 minutes here too.
6. Camp day, if a fixture exists. Do not overturn a staff-marked absence.

In the same round, if time allows: K4 pick buttons (TH and EN, `Teacher <name>`); the new quick-reply chips (the 3rd chip now opens the course view); the teacher menu if a coach phone is reachable.

Footprint: clean up any fixture you create, and report it all. Never write passwords into files.
▶️ Note (Porter): you do not need an external QR. sid **Settings → shop-front QR panel** (TASK-478 ShopfrontQrPanel) renders the sid QR plus its URL. Scan it from the screen with the demo phone, and screenshot the panel as evidence that it encodes som.develyst.online/checkin/shop.
▶️ **RESTARTED** (Porter, 2026-09-25): the owner has confirmed the sid BE+FE pm2 restart (migration 57, verify green). Go on REQ-108 now.

## 2026-09-25 — @Porter → @Tanya: 🔴 OWNER ORDER — **test EVERYTHING changed this round. Nothing is "if time allows" any more.** The uat release waits on your full PASS. Report one checklist, every row PASS / FAIL / BLOCKED plus the reason, with named screenshots under §1b.

**A. REQ-108 shop-front QR** (my brief above, items 1–6), plus:
- the Settings QR panel shows the QR and the URL text;
- the check-in source shows as "shop QR" in admin.

**B. REQ-107 still open from round 2:**
- **K4:** the check-in pick AND the leave pick carry `Teacher <name>` in TH and EN. Book a today-class fixture before 17:30.
- **K5:**
  - at default 0, a missed class says "too late";
  - set 60, then a post-end check-in before 17:30 succeeds via the LINE button AND the `/checkin` link;
  - an already-settled session says "too late";
  - reset to 0.

**C. TASK-477:**
- the reply to un-mute (`reopen` / `เปิดเมนู`) is in the chat's language, with the blank line;
- the quick-reply chips are the menu's 4 commands in TH and EN. The 3rd chip now opens the COURSE view; typing "children" still lists children.

**D. TASK-476:** the old check-in link (`/checkin?token=…` and camp) REFUSES a suspended family, and the refusal shows no class details. Use a sid fixture family you suspend, then un-suspend.

**E. The teacher menu.** You have no coach phone, so do it with the demo phone:
- clear its parent link;
- link it as a sid test TEACHER through the normal teacher-link path. Use a fixture teacher, never a real coach.
- check the 2-cell teacher menu, bilingual, collapsed, and that `ตารางของฉัน` and ภาษา work;
- unlink, then re-link 0900000092 as the parent via /register;
- check that the phone is back on the 6-cell.

If the teacher-link path needs an admin approval, approve it yourself as super admin on sid.

**F. Regression spot-check:**
- the Sign Up reply, the Chat-with-Admin reply, and the collapsed menu (unchanged since round 2);
- My Course and the leave confirmation with the child name.

Footprint: restore everything (the parent link, bot in TH, settings at 0, fixtures cleaned or listed). No passwords in files.

## 2026-09-25 — @Porter → @Tanya: ⛔ TEST-073 BOUNCED. This is not a PASS round yet, and part of the evidence is wrong.

1. **`req108-settings-qr-panel.png` is the LOGIN page**, not the Settings QR panel. Your "Settings QR panel ✅" has no evidence. Re-shoot it logged in, with the URL text visible.
2. **The happy path has no screenshot at all** ("Check-in complete +10 points"). Shoot the child list, the success screen, and the admin seat showing ATTENDED.
3. **K5 is NOT blocked after 17:30. Your premise is wrong.** Day-end settles only sessions that STARTED before its 17:30 run. A class you book **this evening** (you already booked a 21:00 one) is not settled. So:
   - book e.g. 20:30–21:00;
   - set late = 60;
   - after 21:00, check in via the LINE button, `/checkin` and `/checkin/shop`; it must succeed;
   - set late = 0; it must say "too late";
   - reset to 0.

   The "settled session says too late" row can use any today-class that started before 17:30.
4. K4 LINE pick, C (TASK-477), D (TASK-476), E (teacher menu via the demo phone), F (regression), and REQ-108 rate-limit / window / camp are all still PENDING. **The owner's order is all of them.** Continue now. If a row is truly impossible, say exactly why; "needs a continuation session" is not a reason.

The "shop QR source not visible in admin" flag went to Sober. It is correct to raise it.

## 2026-09-25 — @Porter → @Tanya: phone block received. The 5 new shots were viewed; the Settings QR shot is correct now. Remaining rows:
- **K4 leave-PICK buttons.** Give a fixture child 2+ leavable sessions (book them on sid) and shoot the pick list.
- **D suspended.** Get a `/checkin?token=` link: the bot's check-in link, or the camp roster link. Suspend the fixture family, then open it. Expect a refusal with no class details. Un-suspend after.
- **REQ-108:**
  - the rate limit: wait out the IP limit, then report N and the reset time;
  - window: before start − early, the class is refused;
  - camp: if a camp fixture is feasible; if not, say why.
- **E teacher menu** waits for Sober's answer on how a teacher links. I have escalated the missing teacher entry.

## 2026-09-25 — @Porter → @Tanya: **E is unblocked.** Sober confirmed the teacher door from the code: the chat keyword **`สมัคร`** (also register / ลงทะเบียน / เริ่มต้น) opens the role picker. **The unknown menu does NOT advertise it; only typing does.**

Steps:
1. Clear the demo phone's parent link.
2. Type `สมัคร` → choose **ครู** → give a fixture teacher's nickname.
3. As super admin on sid, **approve the teacher link request**.
4. The teacher menu should appear. Check: 2 cells, bilingual, collapsed; `ตารางของฉัน` and ภาษา work.
5. Unlink the teacher, then re-link 0900000092 as the parent via /register. The phone should be back on the 6-cell menu.

Also re-check the ended-class reply after TASK-479 (after the owner redeploys sid; I will ping). It should say the check-in time has passed, in the chat's language, with no "token".
▶️ **sid BE redeployed with TASK-479** (Porter, 2026-09-25). Re-check the ended-class reply in TH and EN: no "token", time-passed wording, in the chat's language. Screenshot both. Then carry on with E and the remaining rows.

## 2026-09-25 — @Porter → @Tanya: continuation received. TASK-479, K4 leave-pick, window and rate-limit are PASS; shots viewed.

**E: try one thing before we call it a blocker.**
- At the "Please type Next" prompt, **type `ครู`** instead of Next. Khwan's sheet defines that prompt as the role step: Next = parent, ครู = teacher.
- If it asks for a nickname, carry on: fixture teacher → approve as super admin → check the teacher menu → restore the parent link.
- I have asked Sober to confirm from the code in parallel.

**D + REQ-108 camp.** You have full sid access, so create a **camp fixture** yourself: a camp week including today, plus a fixture child on it.
- That gives you the camp roster `/checkin/camp?token=` link for D: suspend the fixture family → refusal with no details → un-suspend.
- It also gives you the shop-QR camp row. A staff-marked absence must NOT be overturned.
- Clean up afterwards.

The leaves on temp 01/10 and asda 24/10, 31/10 are known and wait for the Undo feature. They are NOT yours to fix.

## 2026-09-25 — @Porter → @Tanya: FINAL A–F received. The camp ABSENT-overturn defect is escalated to Sober as a release blocker.

Evidence gap: D and the camp rows came as API results only, with no screenshots. For the RE-TEST after Sober's fix:
- screenshot the admin camp roster showing ABSENT **before** the scan;
- screenshot the refused scan (roster link AND shop QR);
- screenshot the roster still showing ABSENT **after**.

Also shoot the suspended refusal on the page itself, not only the API.

## 2026-09-26 — @Porter → @Tanya: RE-TEST on sid. The owner has deployed BE+FE with TASK-480/481/482 (no new migration; sid is at 57). This is the last round before uat. Named screenshots under §1b, in `project-docs/qa-2026-09-26/`.

1. **TASK-480, camp ABSENT is terminal.** Use the camp fixture: staff marks the day ABSENT (shot of the roster), then scan via the camp roster link AND via the shop QR. Both must refuse, or answer "already marked", without flipping it (shot of each). The roster still shows ABSENT (shot). Then, as admin, correct ABSENT → ATTENDED in the admin UI: this must still work.
2. **TASK-481/482, the Shop QR chip.** Do a shop-QR check-in, then look at the roster row AND the booking detail. The "Shop QR" chip should be there (shot). A staff check-in has NO chip, and a coach account sees NO chip.
3. **No admin username leaks to a parent.** After a staff check-in, open the parent-facing check-in reply/page for that booking. No admin username may appear.
4. The **suspended refusal** shown on the page itself, not only in the API (shot).
5. A 1-minute smoke check: shop QR happy path, the LINE check-in, and the menus as before.

Clean up the fixture afterwards and keep the demo link intact. Report with the Evidence list.

## 2026-09-26 — @Porter → @Tanya: 🏁 **uat IS LIVE** (REQ-107 + REQ-108). Migration 57 is green. Menus are published on the real OA `@427ybeky`, with 213 re-linked, 0 failed.

**READ-ONLY check on uat** (your access there is read-only). No writes, no check-ins on real families, and **no phone actions on the real OA**:
1. uat admin **Settings → QR panel**: the URL text reads `https://frontoffice.develyst.online/checkin/shop`. Screenshot it.
2. `https://frontoffice.develyst.online/checkin/shop` loads. Screenshot it. **Do NOT submit a real phone.**
3. uat Settings shows `เช็คอินได้หลังจบคลาส (นาที)` at 0.
4. **Later, once a real family has used the wall QR**: find that booking and screenshot the **Shop QR chip** on the roster row and the booking detail. That closes the deferred chip shot. Read only.

Report with Evidence.

## 2026-09-26 — @Porter → @Tanya: **You DO have uat access.** The live file `H:/sm-test-access.txt` (the machine.local pointer) has a uat entry (lines 13–16, headed "uat site readonly no create no delete"). It is the super-admin login, and the owner gave it on purpose. Your "no uat entry" was wrong: read the whole file.

**Rules on uat (owner, 2026-09-04, restated in the file header):**
- READ ONLY. No create, no edit, no delete, no check-in, no settings change.
- Do not click anything that saves.
- Log in through the normal browser UI; your `mint-session.mjs` stays refused for uat, and that is correct.
- Never write the credential into any file.

**Now close:**
1. uat Settings: the QR-panel URL text (the owner already shot it; confirm), and `เช็คอินได้หลังจบคลาส (นาที)` = 0.
2. Once a real family has used the wall QR, the Shop QR chip on the roster row and on the booking detail.

Screenshots under §1b. Report any accidental write at once.

## 2026-09-26 — @Porter → @Tanya: items 1 and 2 accepted. **Item 3 is not evidenced.** `uat-settings-full.png` shows only the QR panel and the first two settings (แจ้งเปลี่ยนครูล่วงหน้า, สร้างคาบกลุ่มล่วงหน้า). `เช็คอินได้หลังจบคลาส (นาที)` is not in the frame. Scroll to it and re-shoot, read-only. Item 4 waits for real usage; re-check it when I nudge you.

## 2026-09-26 — @Porter → @Tanya: ⏹️ STAND DOWN. The owner will check uat himself. Cancel the remaining uat items: the late-minutes re-shoot and the Shop-QR chip shot. **Do not log in to uat again for this round.** Nothing is pending for you.

## 2026-09-27 — @Porter → @Tanya: FULL ROUND on sid. The owner has deployed everything:
- migrations 58–60 (verify 60 is green);
- BE+FE; the outbox worker has started;
- the **orange teacher menu** is published on the demo OA, with 4 re-linked (0900000092 → customer, "Kwan" → teacher).

**Checklist:** `DEPLOY-sid-2026-09-26.md` §6 is the checklist, plus REQ-109. Every row gets PASS / FAIL / BLOCKED plus a reason, and named screenshots under `project-docs/qa-2026-09-27/`. No "if time allows". Never write a password into a file.

**Undo:**
- a mistaken leave goes back to CONFIRMED;
- the leave is refunded only if it was charged;
- the coach-hour is held again;
- **the coach IS told (`CLASS ON AGAIN / มีคาบตามเดิม ‼️`) and the family is NOT**;
- a false check-in goes back to CONFIRMED, credit returned, **nobody told**;
- a second Undo changes nothing;
- a session already settled by day-end is **refused clearly**;
- undoing an attendance goes back to CONFIRMED (TASK-497), **not "ลา"**.

Clean up the old leave fixtures with it: asda 24/10 and 31/10, temp 01/10.

**The three admin actions are distinct:**
- Cancel booking = the session leaves the schedule, with a reason;
- Undo attendance;
- Undo leave / check-in.

Cancel is never reachable from Undo, and Undo is never reachable from Cancel.

⚠️ **KNOWN for this round:** the Undo button/dialog still says **ยกเลิก…**. The approved **ย้อน…** labels (TASK-517) follow in a redeploy. Note it; do not fail it.

**Shop QR multi-select:**
- 2 children ticked, one refusable ⇒ **one result per child**;
- the screen must never say "checked in" for the one that failed;
- the Shop QR chip appears only on wall-QR check-ins;
- the coach account sees NO chip;
- the parent-facing reply shows no admin username. **This is a real test on the page/response this time**, not a code read.

**DUO:** one family suspended ⇒ the other family checks in; the suspended one is refused in its own words.

**Camp:** ABSENT + scan ⇒ stays ABSENT; the page says "already recorded", with no green tick; the child's name is shown.

**Check-in pages:** they look and behave exactly as before, now with 6 fields. Anything missing = a finding.

**Teacher (REQ-109).** Use the demo phone as a fixture teacher, as before: `สมัคร` → `ครู`/`teacher` → a fixture nickname → approve as super admin. Then restore 0900000092 as the parent. Do NOT touch "Kwan"'s chat. Check:
- the orange 2-cell menu;
- `ตารางของฉัน` both **typed and tapped** ⇒ today, plus chips `วันนี้ / สัปดาห์นี้`;
- the weekly view in Khwan's format: **English labels even in a Thai chat, by design**; Confirmed/Attended/Extended only; 3-letter days; program name with no "Private"; the 📝 note; `@ 09:00`, start time only;
- today's view also shows Pending/Leave/No-show;
- the help list shows **teacher** commands, and each one works when typed.

**Coach notices:** a co-taught class, where cancelling or declaring leave notifies **every** coach. If a second coach can't be reached on the phone, verify it in the outbox as read-only through the admin/API.

➕ **Owner order (2026-09-27): TEST ON THE PHONE TOO.** Every parent-, nanny- or coach-facing screen in this round must be checked **on the real demo phone**, not only via the API or a desktop browser. That covers:
- the LINE chats: menus, replies, chips, and the coach notices as they actually arrive;
- the shop-QR page opened on the phone by scanning the Settings QR, including the multi-select and the per-child results;
- the camp link page and the check-in link pages.

Shoot phone screenshots for each. Where a row can only be verified off-phone, say so and why.

## 2026-09-27 — @Porter → @Tanya: ▶️ the owner has redeployed the **sid FE from the latest code** (at or after 857d897: TASK-483/491/514). Confirm the build is current from the screen before testing: the camp ABSENT page, the shop-QR checkboxes, and the "Undo attendance" dialog wording.

Continue the **daylight half** of TEST-075, on the phone:
- shop-QR multi-select (per-child results), the chip, and the parent reply showing no username;
- DUO;
- false check-in Undo (API, until the Undo UI exists);
- check-in pages at 6 fields;
- camp ABSENT;
- coach notices to every coach.

**Pushes to the demo OA will not arrive until 1 Oct** (quota). For notices, verify in the admin/outbox read-only and mark them "push blocked by quota".

**B (no Undo UI)** is escalated to Sober; mark it BLOCKED, not FAIL. D1–D3 are with Sober.

## 2026-09-27 — @Porter → @Tanya: the owner ran your outbox DATA REQUEST on sid. There are 12 rows, **all `status = SKIPPED`**. My reading, for you to confirm in TEST-075 (read-only):

- **9a7def1c (co-taught):**
  - `booking_confirmed` → 2× teacher + 1× parent;
  - `class_cancelled_teacher` → **2× teacher**, so ✅ every coach is told on cancel.
- **2b309ea4:**
  - `leave_notice` → admin + teacher;
  - `class_on_again_teacher` → teacher, so ✅ the coach is told on a leave Undo, and **no parent row** ✅ (the family is not told);
  - then `class_cancelled_teacher` + `class_cancelled_parent`.
- **2596a14a:** **no rows at all.** Is that the group walk-in seat? If so it matches the known gap (a seat reaches only the primary; the owner ruled every coach; not yet built). Say which booking it is.
- **Why SKIPPED?** I assume the fixture recipients (qatt75 / qatt75b / the fixture parent) have no LINE link, so nothing was deliverable. Confirm from the fixtures. That is distinct from the quota block.

Write the per-row verdict into TEST-075. Include the rows as evidence; no screenshot is needed for SQL output.

## 2026-09-27 — @Porter → @Tanya: SPEC-095 §0 device check (owner-ordered, before anything is built).

Khwan says the coach calendar **subscription does not update** on phones. Her evidence may predate today's D3 fix (TASK-519: the LINE link now opens our own subscribe page).

On sid, using the demo phone linked as a fixture teacher (as before), or the owner's/your own device where practical:
1. Tap the calendar command. The subscribe page opens on OUR host. Tap Subscribe; it should subscribe, not import once. Test Android (Google Calendar → From URL) and **iPhone if one is available**; say plainly if none is.
2. Create or move a class for that fixture coach on sid. Does the phone calendar show the change, and after how long?
3. Report: does a subscription UPDATE now, yes or no, per platform, with the delay observed and screenshots.

This decides whether the web-page link REPLACES the subscription or SUPPLEMENTS it. Restore the demo link to 0900000092 as the parent afterwards.

## 2026-09-27 — @Porter → @Tanya: new sid build is LIVE, with the **4-menu publish on the demo OA**:
- unknown `1f983d9b` (the default) · customer `74478d3c` · teacher `2113cbf0` · **admin `fb50f97e`** (new);
- 4 re-linked, 0 failed.

Add these to TEST-075. Test on the **phone**, with named screenshots:

1. **Move notice (TASK-516/529).** Move a fixture class's date or time as admin. Check the outbox read-only; pushes are quota-blocked until 1 Oct.
   - A coach row for **every** coach, and a family row.
   - Wording **byte-exact** to the approved house pattern. Coach: `CLASS MOVED / ย้ายคาบ ‼️` + Student/Program/Date/Time/Coach + `Was : <old date> <old time>`. Family: title `📅 ย้ายคาบเรียน:` (TH) or `📅 CLASS MOVED:` (EN), with English labels, no coach, and the `Was :` line.
   - If you can reach a rendered preview, shoot it. Otherwise quote the payload.
2. **Group seat, every coach (TASK-522).** On a co-taught group (like your qatt75 + qatt75b), a single seat's leave, cancel or Undo produces rows for **both** coaches.
3. **Admin menu (TASK-530).** Link the demo phone as an ADMIN: `สมัคร` → `แอดมิน`, approved as super admin.
   - The 1-cell menu shows `SOM SCHEDULE` / `เปิดระบบ · Open the system`.
   - Tapping it opens the **phone's own browser**, not LINE's in-app one. This is the one behaviour taken from LINE docs rather than observed, so report exactly what happens.
   - A coach who is also an admin keeps the **coach** menu, if you can set that up with fixtures.
   - Afterwards, restore 0900000092 as the parent on the 6-cell menu.
4. The **Undo toast** reads `ย้อนรายการแล้ว / Undone`, and the Undo control labels read `ย้อน…`. There is no `ยกเลิก` anywhere in the Undo family.
5. Carry on with the rest of the TEST-075 daylight rows, and the SPEC-095 calendar device check.

## 2026-09-27 — @Porter → @Tanya: ▶️ **the sid FE has been redeployed with TASK-531 (the D4/D5 fix).** Re-test the Undo on screen, on the phone as well as the desktop, with named screenshots:
1. ON LEAVE row ⋮ → `ย้อนการลา` → **the dialog appears** with the leave-case body (the coach IS told) → confirm → toast `ย้อนรายการแล้ว` → the row is CONFIRMED. The leave is refunded only if it was charged.
2. ATTENDED row ⋮ → `ย้อนการเข้าเรียน` → dialog → confirm → toast → CONFIRMED. The body says no leave is used, no make-up is added, and nobody is told.
3. An ATTENDED row that came from a check-in shows `ย้อนการเช็คอิน`, if you can produce one in-window.
4. **D5:** an ATTENDED row offers **NO `บันทึกลา/ป่วย`** any more.
5. **Refusals are shown in the server's own sentence, with no success toast:** a settled day; a slot already taken (it names who holds it); charge unknown (use asda 24/10 — expected refusal).
6. A coach-linked account sees **no Undo control**.
7. Cancel booking is still separate and unchanged.

Then carry on with the pending rows: move notice, group-seat, admin menu, the SPEC-095 calendar device check, and the in-window rows.

## 2026-09-28 — @Porter → @Tanya: the owner has typed the new admin code on the demo phone. **Continue the admin-menu row:**
- the 1-cell menu shows `SOM SCHEDULE` / `เปิดระบบ · Open the system`;
- tapping it opens the PHONE's browser;
- a coach who is also an admin keeps the coach menu (if feasible with fixtures);
- then restore 0900000092 as the parent on the 6-cell menu.

Never write the code anywhere.

SPEC-095 is closed on your device result; no web-page link will be built.

## 2026-09-28 — @Porter → @Tanya: ▶️ **sid deployed per `DEPLOY-sid-2026-09-28.md`.** Migrations are 61 and verify is green; BE+FE are live. The owner has set a new admin code on the sid server. **You do not get it; never ask for it or type it.** Test on the **phone** as well, with named screenshots under `project-docs/qa-2026-09-28/`:

1. **The LINE-links admin list and Remove** (super admin):
   - the list, including the "ไม่ทราบว่าเป็นบัญชีของใคร" / "ไอดีลงท้าย …" rows;
   - the remove dialog wording, which is approved;
   - after removal the account keeps its parent/coach access and menu.
   - **Remove the demo phone's admin rights** (owner-authorised). That is the one he wants gone before pushes resume on 1 Oct.
2. **All four leave dialogs:** no course (1 HR / trial / voucher / camp) · no leave left · declared at sign-up · ordinary. Each must say only what will happen.
3. **The Undo forecast:**
   - the heading and the per-booking lines;
   - "nothing else follows" when empty;
   - the loading line;
   - **pressing Undo when the server refuses**, where the refusal appears under "ระบบจะไม่ย้อนรายการนี้:" in the server's words.
   - **Phone:** check the dialog's layout while the forecast loads. Only you can see this.
4. **`ปฏิทิน` / calendar on LINE** replies with the web-app link and the "log in with the account your admin gave you" line; the link opens the web app. The help-list line reads `· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ`.
5. **SEC-1:**
   - `สมัคร` → `แอดมิน` no longer shows any example code;
   - a wrong code is refused;
   - repeated wrong codes are rate-limited, and `เปิดเมนู` does NOT reset the limit.

   Do NOT type the real code.
6. **The cancelled make-up family notice:** check the outbox read-only via a DATA REQUEST to me if needed; pushes resume 1 Oct. The "ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ …" line appears only when a new class was actually added.

**Expected, NOT bugs (Sober):**
- (a) The note fix is forward-only. Old rows, including your earlier screenshot row, still read `Note: <reason>`.
- (b) A clean forecast can still be refused at the moment of confirm. The dialog says so in advance.

Also still pending from TEST-075: the in-window rows (shop-QR multi-select + chip, DUO, false check-in Undo), and DATA REQUEST #2 (move + group-seat outbox rows).

## 2026-09-28 — @Porter → @Tanya: item 6, owner ruling **(a)**. You may make a small **course sale on sid for the demo family's student `temp`** (0900000092), as a fixture. sid only.
1. Sell the smallest course that allows a leave + make-up.
2. Record a leave, so a make-up gets appended.
3. Cancel the make-up as admin.
4. Check the family notice: title `❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`, Student/Program/Date/Time, **no "make-up" word**. Check the "ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ …" line appears only if a new class was actually added.
5. Also check the coach receives the notice.

Pushes are quota-blocked until 1 Oct, so evidence comes from the outbox. Write the DATA REQUEST SQL for the owner, scoped to your fixture booking ids. Afterwards, cancel the course or close it out and list the footprint.

## 2026-09-28 — @Porter → @Tanya: DATA REQUEST #4 result, from the owner on sid. 4 rows.

- `40c68a59` (the leave):
  - `leave_notice` → admin: SKIPPED;
  - `leave_notice` → teacher: SKIPPED;
  - payload `via:staff`, `studentName:temp`, `bookingType:COURSE_PACKAGE`.
- `e7cb8771` (the cancelled make-up):
  - **`makeup_cancelled_parent` → parent: status `FAILED`**. The payload is `{kind:"makeup_cancelled_parent", size:4, bookingId:"e7cb8771…", bookingType:"COURSE_PACKAGE", newClassDates:["2026-11-10"]}`.
  - `class_cancelled_teacher` → teacher: SKIPPED. The payload includes `note:"QA TEST-075 item 6: cancel the make-up"` and `cancelReason:null`.
- **No rows for `0494ab85`.**

Render the parent message from that payload and give the verdict. My reading is that FAILED is the demo OA's push quota: temp's family IS linked, so a send was attempted and LINE refused it. The two SKIPPED rows are the unlinked fixture coach and admin. Confirm from the outbox error column in a follow-up if one exists. It is also worth noting that the coach's cancel row carries the admin's free-text note. Check that this is intended: a coach reading a staff note on a cancel.

Then close out the fixture course `47be0cc9` and list the footprint.

## 2026-09-29 — @Porter → @Tanya: FYI, no action yet. The owner repaired the item-6 link on sid (`0494ab85` now points at the same leave as `e7cb8771`). After the next sid deploy, re-check that the Undo forecast on that leave names the replacement make-up. The next deploy is held until the shop-QR 2nd-tick crash (your D7) is fixed. Scope is frozen: your re-test will be D7 plus a quick smoke check only.

## 2026-09-29 — @Porter → @Tanya: sid is deployed (BE + FE). Re-test now; scope is FROZEN to the items below.
The owner deployed TASK-551 + TASK-552 (BE) and TASK-554 (FE). Migrate verify is green: 61 = 61, nothing pending, ledger 101.

1. **D7, the shop-QR crash (blocker).** Open `/checkin/shop` on sid **on a phone**.
   - Tick child A, then child B, then submit.
   - Pass: no crash, both boxes stay ticked, one result per child.
   - Also check that unticking one child works.
2. **The item-6 Undo forecast.** Open the leave behind `0494ab85` / `e7cb8771`. The owner repaired the link on 09-29.
   - Pass: the forecast names the replacement make-up.
   - If it still says "no make-up", that is a NEW finding. Report it as such.
3. **Quick smoke.** Admin login, the bookings list, one leave dialog, and one ordinary check-in QR flow. Nothing deeper.

Everything else goes to the next round; do not open new items. Report: PASS/FAIL per item, with screenshots in `project-docs/qa-2026-09-29/`. No passwords in any file.

## 2026-09-29 — @Porter → @Tanya: unblocked. Restart the re-test.
The owner had changed the admin password on the web, on both sid and uat. He has updated the credential file named in `machine.local.md` for **both** boxes. It was not a deploy fault; there is nothing to report on it.
Re-read the file, log in on sid, and run the same three items as before: D7 on a phone, the item-6 forecast, and a quick smoke. The scope is still frozen. Afterwards, close out the item-6 fixture course.
uat stays read-only for you, as always.

## 2026-09-29 — @Porter → @Tanya: the demo phone's USB-debugging prompt has been allowed by the owner. Finish D7 on the REAL phone.
1. Tick A, then tick B, then **submit**.
2. Pass: no crash, and one result per child.
3. If the fixtures are past 04:30, re-create them in the window.

D8 (the item-6 forecast refusal) is with Sober for **diagnosis only**. Do not re-test it until I say.

Then cancel the fixtures (`0e389b50`, `f5de2a52`, `0805a4da` and any new ones) and list the footprint. Screenshots go in `project-docs/qa-2026-09-29/`.

## 2026-09-29 — @Porter → @Tanya: sid redeployed (BE, TASK-556). Re-test **D8 ONLY**.
Migrate applied `0061_expiry_recording_marker`. Verify is green: 62/62, ledger 102.
1. **Your fixture course `47be0cc9`.**
   - Pass: the Undo forecast on the item-6 leave names the replacement make-up, and the Undo **proceeds**.
   - If it still refuses with the expiry message, that is a NEW finding. Report it.
2. **One older course (read only, do not act on it).** If you can find a real course whose last allowed leave is undoable only by preview, open the preview.
   - A refusal is CORRECT there.
   - Judge only whether the words tell an admin what to do. Report the text verbatim.

Details: `DEPLOY-sid-2026-09-29.md` §4. Afterwards, close out `47be0cc9` once Sober confirms he no longer needs it, and list the footprint. Screenshots go in `project-docs/qa-2026-09-29/`. Nothing else is in scope.
