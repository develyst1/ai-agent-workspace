# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-29 (Marie housekeeping, owner-approved). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-QA-2026-09-29-pre-drain.md` (verbatim, 44.7 KB). Only messages
> still awaiting an action were kept below. **Second drain — the first was 2026-09-23.**

## 2026-09-29 — @Porter → @Tanya: sid redeployed (BE, TASK-556). Re-test **D8 ONLY**.
Migrate applied `0061_expiry_recording_marker`. Verify is green: 62/62, ledger 102.
1. **Your fixture course `47be0cc9`.**
   - Pass: the Undo forecast on the item-6 leave names the replacement make-up, and the Undo **proceeds**.
   - If it still refuses with the expiry message, that is a NEW finding. Report it.
2. **One older course (read only, do not act on it).** If you can find a real course whose last allowed leave is undoable only by preview, open the preview.
   - A refusal is CORRECT there.
   - Judge only whether the words tell an admin what to do. Report the text verbatim.

Details: `DEPLOY-sid-2026-09-29.md` §4. Afterwards, close out `47be0cc9` once Sober confirms he no longer needs it, and list the footprint. Screenshots go in `project-docs/qa-2026-09-29/`. Nothing else is in scope.

## 2026-09-29 — @Porter → @Tanya: standing rule from the owner.
Items done by **Palm** (the owner's friend on the front repo) are skipped entirely. You do not test them unless the owner asks. For now that means REQ-110 items 4, 9 and 11.

## 2026-09-30 — @Porter → @Tanya: sid is deployed with the REQ-110 batch (BE+FE). Verify is green: **65/65**, ledger 105.
The owner deployed it. It carries items 1, 3, 5, 6, 7, 10 and 12, plus TASK-553 (steps 1–2) and TASK-555. Read `inbox/PM.md` 09-29 → 09-30 for each item's "Tanya must check" lines. `DEPLOY-sid-2026-09-30.md` will follow from Sober.

**Test (sid, click-tested, evidence in `project-docs/qa-2026-09-30/`):**
1. **Item 1:** bulk confirm on the Bookings page lets you tick EXTENDED rows and confirms them.
2. **Item 7:** the Camp week editor at **1920px desktop**. The "Rate per coach" inputs must be fully visible and editable without sideways scroll. Khwan's screenshot is `project-docs/customer-2026-09-29-feedback/item7-camp-week-rate-cut-off.webp`.
3. **Item 12:** the camp-deduction notice to the PARENT only, in Khwan's format (REQ-110 §1). Evidence comes from the outbox, because the demo push quota resets 1 Oct.
4. **Item 5:** an ECA teacher change asks "this session only / from here on".
   - A one-session cover changes ONE session only.
   - The covering coach's rate applies.
   - Both the gaining and the losing coach are notified (outbox).
5. **Item 3:** extend a voucher's expiry. An ENDED voucher is refused (owner ruling).
6. **Item 6:** change the start date of a not-yet-started course. Check the preview and the recomputed expiry.
7. **Item 10:** the parent LINE register **form** (LIFF).
   - Every field is required, with no skip.
   - The duplicate-name warning appears.
   - A 2nd child is not asked for the address again.
   - The **chat** path is NOT yet fixed (ruling 4 is building), so do not fail it.
8. **TASK-555:** the 8 LINE-links page labels (COPY-REVIEW-2026-09-28 §D2).
9. **Quick smoke.**

**Out of scope:**
- camp Close/delete (item 8) and the advance-leave block (item 2): still building;
- Palm's items 4, 9 and 11: never ours.

**Fixtures:** sid only. Cancel them afterwards and list the footprint. No passwords in files.

## 2026-09-30 — @Porter → @Tanya: addendum on LINE OA demo (@125vuzsj), for the batch above.
- **Item 10:** test the register form **inside LINE on the demo phone**, opened from the demo OA the way a parent opens it, not only in a desktop browser. Replies and LIFF work today.
- **Items 12 and 5 (pushes):** today the outbox is enough evidence. The demo push quota resets 1 Oct. On 1 Oct, do ONE phone check that the camp notice and the coach cover notices actually arrive and look right.
- No rich-menu change this batch, so nothing to publish or relink.

## 2026-09-30 — @Porter → @Tanya: DATA REQUEST #5 results (the owner ran them on sid).
- **Booking `e0996d1b`:**
  - date 2026-10-21;
  - teacher `7c9bbc14…`;
  - **`teacher_rate_minor` 70000 ✅**;
  - status CANCELLED, which is your cleanup.
- **Outbox for `e0996d1b`:**
  - `teacher_unassigned` → teacher, SKIPPED, no account;
  - `teacher_assigned` → teacher, SKIPPED, no account;
  - both at 04:46:34. ✅ This is as you expected.
- **`camp_deduction` since 09-30:** the owner pasted **no result**. I am confirming with him whether it was empty and what time he ran it.
  - The kind name is correct in the code: `camp_deduction`.
  - If it was empty after the day-end, that is a finding on item 12.

Record item 5 as ✅ on data (the D10 screen fix is still pending). Hold the item-12 verdict.

## 2026-09-30 — @Porter → @Tanya: sid redeployed (BE+FE as one). Verify 65/65 green, ledger 105. **Re-test.**
Read Sober's entries in `inbox/PM.md` from "D10 and F-E fixed" through "GREEN. The deploy can go."

**Your five, re-test:**
- **D10:** a one-session cover with a rate box labelled with the covering coach's name → only that session, at that rate.
  - ALSO test an admin WITHOUT the rate permission: they get a yellow message, not a blank. Judge whether it reads as "ask someone with the permission", not as a reprimand.
- **F-E:** ONE duplicate-name box only.
- **D9:** the start-date move result shows a number, not `true`.
- **D11 + F-B:**
  - abandon registration after the phone step, then come back: they can finish;
  - a linked family can add a child;
  - a family at the limit gets an explaining sentence.
- **F-D:** address names show in THAI in both languages. This is by design (the owner accepted it).

**New behaviours (owner rulings):**
1. **Camp Close = stop new bookings only.**
   - Close, then Open: the week is exactly as before.
   - An Open button exists.
   - Delete works only on a week with no bookings, and a refusal shows the server's words.
   - Closed weeks show on the calendar strip, marked closed, on days with children.
2. **Advance leave (a FUTURE date):**
   - the day blocks new bookings;
   - existing classes are listed and NOT cancelled;
   - the teacher dialog offers no cancel ticks and says nothing was cancelled;
   - an admin sees the orange blocked-day strip in day and week views.
   - Judge: does the orange strip read as a different thing from the camp strip at a glance?
3. **Registration: the LINE CHAT now matches the form.**
   - No skip; `add <name>` enters the wizard.
   - Province + district + sub-district are required on both the form and the chat.
   - Use the demo phone.

**Smoke.** Evidence goes in `project-docs/qa-2026-09-30/`, recorded in TEST-076. Clean up fixtures and list the footprint.
**Out of scope:** Palm's items 4, 9 and 11.

## 2026-09-30 — @Porter → @Tanya: use the NEW phone for this re-test (owner's instruction).
- The owner wants this round tested on **another phone**, not the usual demo phone. It also has the **LINE demo OA (@125vuzsj)**.
- Before testing, note what its LINE account is linked as: unknown, parent, teacher or admin. It is a different LINE user from the old phone, so the old fixtures and links do not carry over. That actually suits the registration tests.
- If it shows a USB-debugging prompt or you need anything done on it by hand, tell me. I will ask the owner.
- Record the device model and browser in TEST-076.

## 2026-10-01 — @Porter → @Tanya: item-12 outbox result (the owner ran it on sid). 7 `camp_deduction` → parent rows, all at 2026-09-30 18:30:02.
- **Your fixture:** `temp`, date 2026-09-30, `remainingDays 0`, `totalDays 0.5`, has_account true, **status FAILED**.
- **The other 6** (Dc, Chateau, Davyn, Deft, Aran, Alex) are sid camp children:
  - 5 SKIPPED, with no account;
  - Dc (has an account) is FAILED.
- **My reading, UNVERIFIED:** both FAILED rows are the demo push quota, which was exhausted until 1 Oct; it was the same shape in DATA REQUEST #4.
  - If the outbox has an error column, write a one-line read-only query for it and I will send it to the owner.

**Verdict:** item 12 is ✅ on data (one row per family, parent only, the right payload).
- **Still to do:** the rendered message on a phone.
- The phone for the push check is pending with the owner. I recommended reconnecting the old demo phone.

## 2026-10-01 — @Porter → @Tanya: **you may create the test accounts yourself on sid** (owner: "ทำไม ไม่ให้tanya ใช้รหัส super admin เข้าไปสร้างรหัสเองล่ะ").
Use the sid super-admin login (from the credential file named in `machine.local.md`) → **Users**. Create:
1. **A QA admin with a role that has NO rate permission.** Use an existing no-rate role if one fits; otherwise create a QA role. Use it for D10b: the yellow box.
2. **A QA coach web account linked to a QA fixture teacher record,** e.g. qatt75. 🔴 **It MUST be linked to the teacher record**; an unlinked coach account sees every coach's classes. Use it for the advance-leave test.

**Rules:**
- **sid ONLY.** Never on uat.
- Give the accounts obvious QA names.
- **Put their passwords ONLY in the git-ignored credential file named in `machine.local.md`**. Never in TEST files, inboxes, logs or screenshots.
- List what you created in the footprint, and keep them for future rounds.

Then finish D10b and the advance-leave test.

## 2026-10-01 — @Porter → @Tanya: push check on the **OLD demo phone** (owner: "เครื่องเก่า ตามแนะนำ").
The push quota is back today (1 Oct). On the old phone, the demo family 0900000092, check that pushes **arrive and render correctly**:
- the camp-deduction notice, in Khwan's format;
- any coach cover notice that reaches a linked account.
The 09-30 rows are FAILED and are not retried, so **trigger ONE fresh instance** on sid if needed, with fixtures only. If the old phone shows a USB-debugging prompt, tell me.

## 2026-10-01 — @Porter → @Tanya: CHANGE. Do the push check on the **NEW phone** (the owner overrides the previous note).
- **Link the new phone's LINE as the existing demo parent** by registering with **0900000092**.
  - If the system refuses because another LINE already holds that parent, link it to a fresh QA parent on sid instead. Either is fine; say which.
- **Trigger fresh instances on sid with fixtures,** then check that they arrive and render on the phone:
  - the camp-deduction notice, in Khwan's format;
  - any parent notice this round touches.
- **The coach notices** are proven by the outbox (DATA REQUEST #5); no phone is needed for them.
- **Afterwards:** leave the new phone linked if that helps future rounds, and note it in the footprint.

## 2026-10-01 — @Porter → @Tanya: one question, and two things for you.
1. ❓ **Your missing make-up-cancelled push: was it an UNDO of a leave, or an ADMIN cancelling a make-up?**
   - Sober's reading from the code: an Undo tells only the coaches and **never** the family, by the owner's ruling, and structurally so.
   - If it was an Undo, **nothing was due** and the finding closes; I will drop DATA REQUEST #6's first half.
   - If it was an admin cancel, it is a real gap and he digs.
2. ✅ **Your 4c report was RIGHT.** The code links only when the first child is accepted, but the screen says *"Registration completed ✅"* at the phone step, and uses the same sentence when the account really is linked. One sentence, two opposite states. You did not misread the system; the system misled you. New wording is with the owner.
3. ✅ **Your Teacher-role finding was right too**, and it is bigger than sid. Roles and their keys are data an admin edits, not something the code ships ⇒ **uat must be checked, not assumed**. Granting the key by hand was the correct remedy.
A sid batch is ready; I will send your re-test scope when the owner deploys.

## 2026-10-01 — @Porter → @Tanya: sid redeployed (BE+FE as one). Verify 65/65 green, ledger 105. **Re-test only the fixed items.**
1. **D12 (blocker):** the parent register form shows NO developer comments between Date of birth and Province.
2. **The chat registration sentence:** after the phone step it must NOT say "Registration completed". The new wording is with the owner, so judge the behaviour, not the final words.
3. **The camp week view:** the per-day child count is right (your 1-child week shows 1, not 7), and a closed week carries its closed mark.
4. **The teacher's future-date leave dialog:** the stale same-day warning about parents being told and a make-up being added is gone, and nothing on that dialog contradicts "nothing was cancelled".
5. **F-E in Thai:** the duplicate-name box follows the page into ไทย.
6. **F-B:** the line above "Add a child" no longer says "Nothing more to do here".
7. **F-C:** District and Sub-district are starred.
8. **The chat address prompts** follow the chat's language.
9. **Your two judgement calls, once more:** the yellow permission box, and the orange blocked-day strip against the camp one.
10. **Smoke.**

**Also:** please answer my open question — was your missing push an UNDO of a leave, or an ADMIN cancelling a make-up?
**And a READ-ONLY job on uat** (you have read access there; change nothing): open **Roles** and tell me whether the shared **Teacher** role holds `action:calendar.teacher-leave`. It decides whether real coaches on uat can record leave at all.

## 2026-10-01 — @Porter → @Tanya: one READ-ONLY check on uat, before the uat list.
Open the **LINE links** page on uat (super-admin view, read only; do NOT remove anything) and tell me:
1. **How many LINE accounts hold admin rights?**
2. If none, say so plainly — it means every admin notice we ship there reaches nobody.
No SQL, no writes. The uat Teacher-role read you did already stands.

## 2026-10-01 — @Porter → @Tanya: sid redeployed (BE+FE). Verify 65/65 green. **Test TWO things only.**
1. **§19 — the chat registration sentence.**
   - A **NEW** phone, after the phone step: it must NOT say the registration is complete. Expect *"รับเบอร์แล้วค่ะ ✅ … ลงทะเบียนจะเสร็จสมบูรณ์เมื่อเพิ่มนักเรียนคนแรกค่ะ / Your registration is complete once you add your first student."*
   - An **EXISTING** phone: unchanged, the customer's own sentence.
   - The behaviour underneath must still be the one you proved: nothing is written until the first child is accepted.
2. **§12 — the attention row for a moved course.** It reads *"คอร์สที่เลื่อนแล้วแต่ยังไม่ได้ยืนยันใหม่ (ลูกค้ายังถือตารางเดิม)"* / *"Courses moved but not re-confirmed (the family still has the old dates)"*, and the dialog's own warning does not contradict it. The shorter wording must appear nowhere, including the LINE digest heading.

Nothing else is in scope. If both pass, this round's sid testing is finished and uat follows.
Clean up fixtures and list the footprint.

## 2026-10-01 — @Porter → @Tanya: **DATA REQUEST #6 is CLOSED — not a defect.** Please take it off your open list.
The owner ran it on sid:
- the cancelled make-up `bc1447f2` is **2026-11-12 10:00**; the re-added `4d7b292e` is **2026-11-12 10:00** — the same slot;
- `bc1447f2` has **no outbox rows at all**.
⇒ The family notice was suppressed by the owner's own same-slot ruling. Nothing was lost.
Also confirmed from the same output: the 09-30 camp FAILED rows read `LINE push failed 429: You have reached your monthly limit.` — the quota, as you expected — and the 10-01 rows include SENT.
**What stays as work, next round:** nobody can tell "suppressed on purpose" from "lost". That is TASK-599, and it came from your finding.
**The digest heading:** your read is accepted; no device check is needed for it this round.
sid testing for this round is **finished**. Thank you. Next is uat, on `DEPLOY-uat-2026-10-01.md`; I will send your uat scope when the owner deploys.

## 2026-10-02 — @Porter → @Tanya: ⚠️ one correction to `DEPLOY-uat-2026-10-01.md` §10 before you read it.
Its last bullet says the registration sentence after the phone step still reads *"Registration completed ✅"* and that §19 has not shipped. **That is stale.** The owner approved §19 on 10-01 and it is **in the build going to uat**, which you tested and passed on sid.
⇒ On uat, a NEW phone must show the new sentence. The old one there would be a FAULT, not a known behaviour. Every other bullet in §10 stands.

## 2026-10-02 — @Porter → @Tanya: sid redeployed with **Palm's merged front-end**. **Smoke only — do NOT re-run the full round.**
Palm is the owner's own developer on the front repo. His work was merged into the branch you tested, so the FE on sid is his code plus ours. The merge dropped exactly one of our identifiers, now fixed; type-check, 924 tests and the build are green.

**1. Regression smoke — the things you already passed, just confirm they still work:**
- the calendar day AND week views load, with the **orange blocked-day strip** and the **camp strip**, and a **closed camp week is still marked**;
- **clicking a camp block still opens it** (it was wired twice and pinned in neither — worth one real click);
- the **parent register form** on LINE: all three address parts required, the duplicate-name box, and the new phone-step sentence;
- bulk confirm with an EXTENDED row;
- one leave dialog and one check-in.

**2. Palm's new work — report what you SEE, do not judge it and do not raise defects on it unless it breaks something of ours:**
- a **time filter** on the schedule (REQ-110 item 4);
- a **"First" filter** (item 9);
- the **weekday on Manage plan** (item 11).
🔑 **The owner's standing rule: Palm's items are not ours.** Tell me whether they work, nothing more.

Everything else is out of scope. Evidence in `project-docs/qa-2026-10-02/`.

## 2026-10-02 — @Porter → @Tanya: **uat is deployed.** Short smoke on uat, then this round closes.
🔴 **uat is the real OA and real families. READ-ONLY except where noted; no fixtures on real students; every write is a DATA REQUEST.**
1. **Admin login works**, the schedule day and week views load, the camp page loads, Manage plan loads.
2. **The LINE-links page now exists** — tell me **how many LINE accounts hold admin rights** (Khwan was asked to link).
3. **Roles → Teacher: is `แจ้งลาสอน (ครู)` ticked?** Khwan was asked to tick it.
4. **The rich menus on the real OA:** a parent account shows the customer menu, a coach the teacher menu. Report what you can see without writing anything.
5. **Palm's three** (time filter, booking-type/1st Trial filter, weekday on Manage plan) are present.
🚫 Do not create bookings, do not take leave, do not check anyone in on uat. If something needs a write to prove, raise it as a DATA REQUEST and I take it to the owner.

## 2026-10-02 — @Porter → @Tanya: 🏁 **the round is CLOSED.** Thank you — D7 and D12 were both yours, and both were found by doing the ordinary thing a user does.
- uat is live and both data gates are confirmed.
- **Nothing is dispatched to you.** Do not start anything on uat or sid.
- **Keep for later:** the two QA accounts on sid, the phone linked to QA parent 0899990763, and course `47be0cc9` until Sober releases it.
- Next is the **backoffice** phase. I will send your scope when the owner opens it.
