# REQ-109: Teacher LINE round (menu artwork, help list, schedule formats)

- **Source:** customer Khwan, via the owner, 2026-09-26.
- **Originals:** `project-docs/customer-2026-09-26-teacher/`.
- **Status:** INTAKE, **HELD**. The owner has put the next round on hold. **Do not dispatch** until the owner says go. Open questions are in §4.

## 1. Teacher rich menu: new orange artwork
- The file is `teacher-menu-orange-2000x672.webp`. **Owner ruling, 09-26: use this file and stretch it to 2500×843.** There is no other original.
- Two cells, the same as today: `ตารางของฉัน / My Schedule` · `ภาษา/ช่วยเหลือ / Language / Help`. Orange, bilingual, matching the parent menus.
- It must be resized to 2500×843 and kept at 1 MB or less (the same as TASK-472).
- Then **republish on the demo OA and the real OA, and re-sweep 21 teachers**. Runbooks: `RUNBOOK-richmenu-v2-demo-publish.md` and `RUNBOOK-uat-real-oa-release.md`. Step 7 stays struck.

## 2. Teacher Language/Help reply: teacher commands, not customer ones
- **Today** a teacher sees the CUSTOMER command list (Add Student / My Course / Check-in / Leave), which a teacher cannot use (TEST-073 E nit).
- **Commands that really exist** for a linked teacher (`line-webhook.service.ts`, around lines 1356–1365): `ตาราง` (today's schedule), `ปฏิทิน` (calendar link) and `เมนู`.
- **Porter's draft** (owner to approve):
  - TH:
    ```
    เปลี่ยนเป็นภาษาไทยแล้ว ✅

    คำสั่งที่ใช้ได้:
    · ตารางของฉัน — ตารางสอนวันนี้
    · ปฏิทิน — ลิงก์ปฏิทินสอนทั้งหมด
    ```
  - EN:
    ```
    Switched to English ✅

    Available Commands:
    · My Schedule — Today's teaching schedule
    · Calendar — Link to your full teaching calendar
    ```

## 3. Teacher schedule message formats (Khwan's sample, verbatim)
```
⏱️ THIS WEEK'S SCHEDULE

▸ MON / 07/09
@ 09:00 / ของขวัญ
　FREESKATE / Attended

▸ WED / 09/09
@ 09:00 / มะขิด
　SURFSKATE / Attended
@ 17:00 / มะขิด
　SURFSKATE / Attended

▸ THU / 10/09
@ 11:00 / สโรนี
　SURFSKATE / Confirmed
@ 12:00 / มะขิด
　FREESKATE / Confirmed
@ 15:00 / ส้ม
　SURFSKATE / Confirmed
　📝 เตรียมอุปกรณ์ให้น้องด้วยค่ะ

▸ FRI / 11/09
@ 12:00 / ส้ม
　SKATEBOARD / Confirmed
@ 13:00 / ส้มตำ
　INLINE SKATE / Confirmed
　📝 เตรียมอุปกรณ์ให้น้องครบเซ็ทนะคะ
@ 14:00 / ปลางา
　INLINE SKATE / Confirmed
　📝 6y / No Experience
@ 15:00 / เหมียว
　ONEWHEEL E-SKATE / Attended
@ 16:00 / ส้ม
　BALANCE PLAY (Private) / Attended
　📝 คุณแม่ฝากให้น้องใส่แมสทุกคลาส

▸ SATURDAY / 12/09
@ 16:00 / Anya
　ONEWHEEL E-SKATE / Confirmed

▸ SUNDAY / 13/09
@ 10:00 / ดิววี่
　FREESKATE / Attended
```
Khwan's rules:
- **"ตารางสัปดาห์นี้" (this week):** do NOT show Leave. Show only **Confirmed** and **Attended**.
- **"ตารางวันนี้" (today):** the same format, but ALSO show **Pending** and **Leave**.

## 4. Open questions (owner or Khwan) before Sober sizes it
1. Is "ตารางสัปดาห์นี้" the Monday **weekly teacher digest** push (the job at 08:15), a new command or menu tap, or both? The teacher menu today only has ตารางของฉัน, which shows today.
2. **Day labels:** the sample uses `MON/WED/THU/FRI`, then `SATURDAY/SUNDAY` in full. Should all days use one style (3 letters)?
3. **Program name:** the sample has no "Private" prefix (e.g. `FREESKATE`) except `BALANCE PLAY (Private)`. The earlier customer rule (Rent+Schedule sheet, item 1, Completed) put "Private" before every program in the schedule and in notices to teachers and parents. Which one wins for the teacher messages?
4. **📝 line:** is it the booking's note/remark field? It shows only when one exists.
5. **Cancelled** sessions: hidden in both views? Nothing in the sample says otherwise.


## 5. Khwan's answers to §4 (2026-09-26, verbatim)
```
1. ออโต้ + ครูกดดูเมนูได้ด้วยค่ะ
2. ใช้ตัวย่อทั้งหมดค่ะ
3. เอาแค่ชื่อโปรแกรมค่ะ เพราะมันยาวกลัวครูดูยาก
4. ใช่ค่ะ
5. ใช่ค่ะ
```
Meaning:
1. **The weekly view goes both ways.** It is the automatic Monday digest, and the teacher can also open it from the menu. The menu has only 2 cells, so Porter's proposal is: the `ตารางของฉัน` tap answers with **today**, plus quick-reply chips `วันนี้ / สัปดาห์นี้` (`Today / This week`). No artwork change. Owner to confirm.
2. **All day labels use 3-letter abbreviations** (MON…SUN).
3. **Teacher messages show the program name ONLY, with no "Private" prefix.** This is deliberate for readability. It overrides the earlier "Private everywhere" rule **for the teacher schedule messages only**; parent messages and the admin schedule are unchanged.
4. The 📝 line is the booking note, shown only when a note exists.
5. Cancelled sessions are hidden in both views.

## 6. Owner rulings, 2026-09-26 ("ตามแนะนำ"). REQ-109 is COMPLETE and held until the next-round go
- **Weekly from the menu:**
  - the `ตารางของฉัน / My Schedule` tap answers with TODAY's schedule plus quick-reply chips `วันนี้ / สัปดาห์นี้` (`Today / This week`);
  - the Monday auto digest uses the same weekly format;
  - no artwork change.
- **The teacher Language/Help list is approved as follows.** It replaces the §2 draft.
  - TH:
    ```
    เปลี่ยนเป็นภาษาไทยแล้ว ✅

    คำสั่งที่ใช้ได้:
    · ตารางของฉัน — ตารางสอนวันนี้ / สัปดาห์นี้
    · ปฏิทิน — ลิงก์ปฏิทินสอนทั้งหมด
    ```
  - EN:
    ```
    Switched to English ✅

    Available Commands:
    · My Schedule — Today's / This week's schedule
    · Calendar — Link to your full teaching calendar
    ```
- **Artwork:** stretch the 2000×672 file (§1).

## 7. Owner answers, 2026-09-26 (given on Khwan's behalf)
- **Labels:** teacher schedule messages use the **ENGLISH header and status words exactly as in Khwan's sample**, for both TH and EN chats. There are no Thai labels.
- **Status table, as Sober/Porter proposed:**
  - Extended (make-up): shown in both views;
  - No-show and Awaiting reschedule: today only;
  - Paused: hidden;
  - Cancelled: hidden (per §5).

## 8. Follow-up, 2026-09-27
- **Owner rulings:**
  - admins get **NO rich menu**;
  - the root `develyst.online` is **the owner's own server**, so the D3 token only reached his own logs and **no calendar-token rotation is needed**;
  - no staff calendar-link surface is needed; coaches get their link from LINE only.
- **Khwan (new):** "อย่างไรส่วนนี้ก็ใช้ไม่ได้ เพราะมันไม่อัพเดทในปฏิทินโทรศัพท์ เปลี่ยนเป็นกดแล้วส่งลิงก์หน้าเว็บเราให้แทนได้ไหมคะ".
  - The calendar-subscription feature does not update on coaches' phones in practice.
  - She wants the calendar command/button to **send a link to OUR web page** showing the coach's schedule, **instead of** a phone-calendar subscription.
  - Sober is to analyse this: what that web page is (an existing coach view or a new token page), whether it needs a login, what it shows, and what happens to existing subscriptions. The owner decides.
- **Owner, 2026-09-28: DO what Khwan asked.** The coach's calendar command (`ปฏิทิน` / calendar) **sends a link to OUR web page showing that coach's own schedule**, replacing the phone-calendar subscription link. Porter's understanding, as confirmed with the owner:
  - Khwan does not want the phone calendar fixed. She wants the command to lead to our live web view.
  - The page is SPEC-095 option (b)/(c): a token page with **no login**, because coaches have no web accounts. It reuses the one schedule formatter, showing today and this week in the same statuses as REQ-109 §3/§7.
  - Known trade-off: the link shows named children's schedules, the same as the existing feed, and a coach can forward it.
- **CORRECTION, owner 2026-09-28 ("ก"):** "หน้าเว็บเรา" means the **EXISTING Schedule page in our web app** (som / frontoffice). A coach logs in and sees only their own classes. **No new token page.** The calendar command sends a link to that page.
