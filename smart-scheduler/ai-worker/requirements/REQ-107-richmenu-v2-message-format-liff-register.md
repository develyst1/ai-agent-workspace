# REQ-107 — Rich menu v2: new artwork, message formats, LIFF registration

- **Source:** customer Khwan, via owner, 2026-09-25. The originals are archived in `project-docs/customer-2026-09-25-richmenu/`:
  - `rich-menu-messages.html` is the customer's sheet (current text in column B, wanted EN in D, wanted TH in F, notes under them);
  - `menu-unlinked-2cell.jpg` is the unlinked menu artwork;
  - `menu-linked-6cell.png` is the linked parent menu artwork.
- **Status:** INTAKE. Sober analyses it first. Nothing gets built until the owner rules on the open questions (§5).
- **Order:** owner, 09-25: "เสร็จ แล้วจะพาไปทำ richmenu ต่อ". This is the next round after TASK-465 reaches uat. The rich-menu topic was parked earlier the same day until the other work settled.
- **Related:**
  - REQ-077 is the original rich menu and notifications.
  - REQ-105 §7 is the LINE silence and the menu families.
  - TASK-446/448/452 cover menu linking and the account guard.
  - SYSTEM-FACTS has the demo OA push quota.
  - Real OA fact, 09-25 inspect: all 4 stored menu ids are **NOT FOUND** on @427ybeky, there is no default menu, and the channel has 0 menus. On the real OA this round is therefore a fresh **publish**, not a relink.

## 1. Artwork (owner's words: "ui richmenu")
- **Unlinked menu, 2 cells:** `สมัครสมาชิก / Sign Up` · `คุยกับแอดมิน / Chat with Admin`.
- **Linked parent menu, 6 cells (3×2):**
  - top row: `แจ้งลา / Request Leave` · `เช็คอิน / Check In` · `คอร์สของฉัน / My Course`
  - bottom row: `เพิ่มนักเรียน / Add Student` · `ภาษา/ช่วยเหลือ / Language / Help` · `คุยกับแอดมิน / Chat with Admin`
- 📌 **Both images are BILINGUAL (TH + EN on one image).** That may close the long-open "no EN known artwork" gap, because one image could serve both languages. Sober to state what that means for the TH/EN menu-family model.
- No teacher menu artwork was supplied (see §5).

## 2. Sign-up: phone typing becomes LIFF (owner's words)
- Today the login button (`เข้าใช้ระบบ` / sign-up) makes the bot ask the parent to **type their phone** in chat.
- The customer wants it replaced by a **LINE LIFF registration page**.
- The sheet also changes **Add Student**: today the bot flow is started by typing `สมัคร`. Instead, the bot sends a link:
  - EN "Please click the link below to add a student."
  - TH "กรุณากดที่ลิ้งค์ด้านล่างเพื่อเพิ่มนักเรียนค่ะ"
  - link: `https://liff.line.me/2011577840-zelD9mEA`
- The LIFF id comes from the customer's sheet. Who owns it, and what is behind it, is unknown (§5).

## 3. Message formats (per the customer's sheet; exact wording lives in the archived html)
- **Check In**
  - Prompt: "Pick class👇" / "กรุณาเลือกคลาส 👇".
  - Class line format: `Feen: Duo Private BALLET / Teacher KK @ 10.00`, meaning student name first, then program, then teacher, then `@ time`.
  - Put a blank line between classes when there are several.
  - Success: "Checked in ✅" plus the same class line.
  - No class: "No class today" / "วันนี้ไม่มีคลาส".
- **Request Leave**
  - Child prompt: "Which child? 👇" / "กรุณาเลือกนักเรียนค่ะ".
  - Class prompt: "Pick class to request leave 👇".
  - Line format: `· FRI 25/09 @ 16:00 : Duo Private BALLET / Teacher KK`, with a blank line between items.
  - Success: "Record Leave: …" / "บันทึการลา : …" (sic).
  - **Do NOT mention "moves to the end of the course"** (customer note).
- **My Course**
  - Heading: "My Course:" / "คอร์สของฉัน :".
  - Line format: `Feen: Duo Private BALLET / Teacher KK [Remain: 4/6] *EXPIRE: 27.10.26`.
  - Show the student name.
  - Show only remaining sessions and expiry.
  - **Remove the leave-quota count.**
  - Put a blank line between courses.
- **Add Student:** the LIFF link message from §2.
- **Language / Help**
  - "Switched to English ✅" / "เปลี่ยนเป็นภาษาไทยแล้ว ✅".
  - A shorter command list: Add Student — Up to 5 · My Course · Check-in · Request Leave.
  - The TH list has the same items.
  - (The current `qr` and `menu` lines are gone from the wanted text.)
- **Chat with Admin:** the customer's note says it "closes the rich menu and becomes chat with admin". Sober to state what "closes" means against today's mute behaviour (REQ-105 / TASK-447 Help/mute notes).

## 4. Out of scope unless the owner says otherwise
The same customer folder also held `Notice.html`, `เชื่อมระบบ.html`, `Authorize.html`, `Other.html` and `Rent + Schedule.html`. They are older status sheets (several items are marked Completed), and the owner pointed only at the rich-menu sheet. They are NOT part of this REQ. Porter will ask the owner before treating any of them as new.

## 5. Open questions for the owner (Sober may add to these)
1. **LIFF `2011577840-zelD9mEA`:**
   - Who created it, and under which LINE Login channel?
   - Is there already a page behind it, or do we build the registration page?
   - Is it one LIFF for both Sign-up and Add Student?
2. **Teachers:** teacher menus are also dead on the real OA and no teacher artwork was sent. Does the teacher menu stay as it is (and need re-publishing), or is new artwork coming?
3. **Publish on the real OA:** menus go up only after sid proof, and only with `LINE_OA_WRITE_ALLOW=@427ybeky` plus `--account @427ybeky`, run by the owner.

## 6. Answers, 2026-09-25
- **Owner, on §5 Q1:** `https://liff.line.me/2011577840-zelD9mEA` belongs to the **REAL OA**. The **DEMO OA** LIFF is `https://liff.line.me/2011571495-uCrah47D`.
- **Porter, read-only look:**
  - The LIFF sign-up page **already exists**: REQ-088, "Registration by link, not by typing", front `/register` (TASK-348).
  - The back env files already carry both ids: `.env.sid` has the demo LIFF active, `.env.uat` has the real LIFF active.
  - ⇒ §2 is most likely **"point the menu cell / bot replies at the existing `/register` LIFF"**, not "build a LIFF page".
  - Sober to confirm, and to confirm that `/register` covers both Sign-up (link a family by phone) and Add Student (new child).
- §5 Q2 (teacher menu) is still open with the owner.
- **Owner, on §5 Q2 (09-25):** "เมนูครูใช้แบบเดิมไปก่อน". The teacher menu keeps its **existing artwork and cells** for now. ⚠️ The teacher ids are also dead on the real OA, so "as before" still means the existing teacher artwork must be **re-published** on @427ybeky in this round.
- **Owner, 09-25, LIFF mapping confirmed:**
  - `2011577840-zelD9mEA` is the **real OA (uat)**. Its endpoint is currently on sid and must move to `https://frontoffice.develyst.online/register` at go-live.
  - `2011571495-uCrah47D` is the **demo OA (sid)**.
- **Owner rulings, 09-25:**
  1. Khwan has **not** shared the real-OA LIFF link, so nothing has landed on sid.
  2. The chat-bar label is **`เมนู | Menu`** for everyone.
  3. The "Chat with Admin closes the menu" item goes back to Khwan in these words: LINE cannot force-close a menu; we can offer a menu that is collapsed by default, plus the existing bot mute. Her answer is pending.
  4. **Keep the typed-phone sign-up working**. The menu stops advertising it.
- ⇒ **Released to build**: one menu per role (bilingual), the teacher menu re-published as-is, the LIFF wiring, and the 4 message formats. Only the "Chat with Admin" behaviour waits for Khwan.
- **Owner, 09-25, on the TASK-470 wording items:**
  1. **KEEP the child's name** in the leave confirmation. TASK-135 stands over the sheet.
  2. Drop the "an admin will reply 🙏" line, as the sheet says.
  3. The English text inside Thai cells is copied as-is.
  4. The sheet's date styles are copied as-is.

  Items 3 and 4 get shown to Khwan with Tanya's screenshots, and she decides whether to change them.
- **09-25:** Tanya PASS on the demo OA (TEST-070). This covers the parent 6-cell menu, the unlinked 2-cell menu, the LIFF sign-up end to end, all formats, and the language toggle leaving the picture unchanged. The teacher 2-cell menu was not reachable.
  - The owner ruled that Sign Up gets its own reply wording.
  - Khwan has been sent the screenshots and asked about: the date and English-in-Thai styles, the child name in the leave confirmation, and the chat-with-admin behaviour (collapsed by default plus the mute).
  - **The real-OA publish is on hold until she answers**, so the publish runs once.

## 7. Khwan's fix-list after the demo screenshots (2026-09-25). Collecting; NOT dispatched until the owner says the list is complete
**K1. Language/Help reply: add a blank line after the first line, in both languages.** Customer's words: "2 บับเบิ้ลนี้ต้องเว้นบรรทัดใหม่ค่ะ". Wanted:
```
Switched to English ✅

Available Commands:
· Add Student — Up to 5
· My Course — Registered Course
· Check-in — Check in today's class
· Request Leave
```
```
เปลี่ยนเป็นภาษาไทยแล้ว ✅

คำสั่งที่ใช้ได้:
· เพิ่มนักเรียน — สูงสุด 5 คน
· คอร์สของฉัน — คอร์สเรียนที่มี
· เช็คอิน — ลงทะเบียนเข้าเรียน
· แจ้งลา
```
The TH reply must show the TH list. Today's TH toggle showed only "เปลี่ยนเป็นภาษาไทยแล้ว ✅" in one of Tanya's shots, so Sober should check that the TH toggle also sends the list.

Also queued for the same batch, owner-approved earlier:
- **K0a:** the Sign Up reply gets its own wording (§6);
- **K0b:** the `line-publish-menus` printout prints `undefined` for the old keys.

**K2. Date styles: NO CHANGE.** The owner showed Khwan the two marked spots on her own phone test:
- My Course `*EXPIRE: 02.11.26`
- the leave list `WED 30/09 @ 09:00`

Khwan: "ถ้า 2 อันนี้ ไม่แก้ค่ะ". The formats stay exactly as built. The English-in-Thai cells also stay, since they were part of the same question.

**K3. Chat with Admin: Khwan accepts the proposal (menu collapsed by default plus the existing bot mute), with her own reply wording:**
- TH: `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ`
- EN: `Admin will talk to you soon.`

⇒ The held "closes the menu" item is now released as **menus published COLLAPSED** (`selected: false`). That means a republish plus a sweep on the demo too.

⚠️ For Sober: today's admin reply also carries the "(type: reopen)" hint, and her wording drops it.
- How does a muted parent get the bot back?
- Does the mute expire on its own?

Say whether the hint must survive in some form. This is an owner decision if it conflicts with her words.

**K4. Check-in: the text sent when a class is picked must say "Teacher <name>", in BOTH languages.** When the parent taps a class, the chat shows the text that the tap sends. Today:
- TH: `ปลางา · 17:00 · ครูEk · Private FREESKATE`
- EN: `เหมียว · 15:00 · Ek · Private ONEWHEEL E-SKATE`

The EN version has no prefix at all, and the TH version uses `ครู`. Khwan wants `Teacher Ek` in both.

Sober should state:
- whether this is the quick-reply `displayText`/label, and whether the leave flow's pick text needs the same (she only named check-in);
- LINE's quick-reply label limit, 20 characters. Keep the full text in `displayText` if the label is capped.

**K5. Check-in allowed after the class ends. Khwan asked, 09-25; the owner rules "ทำรวมรอบนี้เลย ตามแนะนำ".**
- Today the window is the same day only, from start − `checkin_early_minutes` until the class END, and the end is fixed.
- Add a Settings item: `checkin_late_minutes` "เช็คอินได้หลังจบคลาส (นาที)", next to the early one.
  - **Default 0**, which is exactly today's behaviour.
  - The admin sets it, e.g. 60.
- It applies to every check-in path: the LINE button, the typed command, the `/checkin` link, and camp.
- The "window closed" message must quote the new end.
- **2026-09-26, CORRECTION (owner's console screenshot):** the real LIFF `2011577840-zelD9mEA` ("SOM BALANCE SCHOOL-LIFF") **already has its Endpoint at `https://frontoffice.develyst.online/register`**. The 09-25 note saying it pointed at sid was wrong: Porter read "= sid = som.develyst" as a statement of the endpoint and never asked for the console value. Runbook §2 is therefore ALREADY DONE, and nothing ever registered into sid through it.
