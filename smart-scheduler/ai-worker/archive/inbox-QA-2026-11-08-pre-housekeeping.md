# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-QA-2026-10-02-pre-drain.md` (verbatim, 19.3 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**



## 2026-11-02 — From Porter (PM) → @Tanya: CLAUDE.md rule 2 gained "Only the PM asks the owner anything" — re-read it (Marie ORDER 55)
Re-read workspace `CLAUDE.md` rule 2. In short: only the PM asks the owner anything, whether in chat or with a question box (the app's ask-a-question or next-step options). Even when he is looking at your own session, end your turn with a status line, and never with a question or an option menu for him. Your question, including any DATA REQUEST, goes to me in a file, and I ask him. No reply needed.

## 2026-11-03 — From Porter (PM) → @Tanya: GO test REQ-5001, the presenter MP4 for the 11-07 money meeting (owner deadline Fri 11-06 18:00)
- **File:** `som-balance-backoffice-spec/meeting-clip/out/meeting-clip.mp4`: 4 min 39 s, md5 `1996f7a72083b14d674581b6fe8faf12` (I checked the md5 myself).
- **Run against** the ACs in `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md` §5. Use the version as amended by ### Answers:
  - AC-1 is now 4–5 min;
  - the voice is Pattara;
  - the spoken forms are ซีอีโอ / เอ็กเซล / พีดีเอฟ / พาร์ค เร้นท์ / ส้มบาลานซ์, and the subtitles keep the English.
- **Listen to the whole clip:**
  - the §4 script, word for word and in order;
  - every number in AC-2;
  - nothing internal (AC-6);
  - no real names (AC-5).
- **Open it once** by double-clicking in Windows Media Player, and once in Chrome.
- **What Sober already checked:** `tasks/TASK-848-…` (final review).
- **Your TEST number:** take it with `node ai-worker/new-id.mjs TEST <slug>`.
- **Reply** PASS / FAIL in inbox/PM.md, with evidence.

## 2026-11-03 — From Porter (PM) → @Tanya: re-check TEST-131 on the subtitle fix, new MP4 md5 `21b916245e6be558be5295601f1b286b` (supersedes `1996f7a7…`)
Same path: `som-balance-backoffice-spec/meeting-clip/out/meeting-clip.mp4`. Sober says the words, audio and timings are unchanged, and every subtitle now sits in its own bottom band.
Re-check only:
- **(a)** no subtitle covers slide or UI text in scenes 2, 4 and 6, and look at the other scenes too;
- **(b)** the subtitles still match the audio, and no Thai marks are clipped;
- **(c)** it still plays in Chrome to the end;
- **(d)** AC-8: both dist md5s are unchanged.

Report PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: GO check a customer draft, `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` (Khwan's agenda for Sat 11-07)
It is a document check, not a run. Check every number and claim in the draft against `DELIVERY-FACTS-REQ-5001-s8-part-order-2026-11-03.md` (compiled by Sober, confirmed by Silver) and brief §4 (prices, total 39,200):
- the per-block weeks "if first": Stock 4–5 · Revenue 6 · Salary slip 6, full 10–11;
- "about 3 months" in total;
- Roles always with the first block;
- the 2 "if you pick X first" consequences;
- the 4 prices adding to 39,200;
- what each block contains: nothing is missing, nothing is in the wrong block (F1 / F2 / C-d / D3 / F5 with Revenue; F3 / F4 / F6 with Salary).

Also check:
- nothing internal leaks (no team names, no engineer-days, no "optimistic edge");
- Khwan is addressed as "ขวัญ" (no พี่);
- no real staff names.

The owner's 2 decisions (D1 "about 3 months", D2 installments by block) are still open. Judge the draft as written. Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: an addendum to the agenda-draft check. Use the FINAL facts
Sober marked `DELIVERY-FACTS-…` **FINAL** (Q4 changed), and I updated the draft to match:
- Stock first slice ≈ 4 wk, full Stock 7–8 wk;
- Revenue ≈ 6 wk;
- Salary slip ≈ 5–6 wk, full 10–11 wk.

Check against the FINAL file. Also check that the Stock "first slice" contents match Q1 / Q4 (catalogue from Excel, Stock In, balance, Demo; STOCK OUT selling is NOT in the slice).

## 2026-11-03 — From Porter (PM) → @Tanya: re-check TEST-132, only the Revenue row is fixed
The new row: "รายได้ ประมาณ 6 สัปดาห์ (หรือจะเอาสาขา + วิธีชำระเงินก่อน ได้ใน 3–4 สัปดาห์ เลือกได้อย่างใดอย่างหนึ่ง) · ครบทั้งก้อน รวมหน้าบ้าน ประมาณ 10 สัปดาห์".
The source is Silver's correction, under "Silver's corrections" in the facts file (≈ 10 wk for the whole block; EITHER F1 + F2 at 3–4 OR Revenue + C1 at 6). Sober is re-marking Q4 to match.
Also check that "ประมาณ 3 เดือน" for everything still holds with a 10-week REVENUE block. Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: a quick wording-only re-check of the Khwan agenda draft before it goes copy-ready
The owner approved D1 ("ประมาณ 3 เดือน") and D2 (installments by block). He also said the agenda is for her to **come prepared with which block first and which later**. I changed only 2 lines; no number changed:
- the opening line now ends "…ขวัญจะได้เตรียมมาคุยว่าอยากได้ส่วนไหนก่อน ส่วนไหนหลัง";
- the item-4 heading is now "ฝากขวัญเตรียมมาว่าอยากได้ก้อนไหนก่อน ก้อนไหนหลัง".

Check that every number is unchanged since your PASS (md5 `2f6c2973…`), and that the wording addresses "ขวัญ" without พี่, has no question to ฟีน, and nothing internal. Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: wording re-check of the agenda draft. Khwan's name is removed (owner's ruling)
The owner said: *"เลิกอ้างขวัญสักที คนตัดสินมีหลายคน ขวัญแค่พนักงานคนนึง มีพี่ฟีน คือเจ้าของบริษัท มี พี่กุ้ง แอดมินเท่าๆ กับขวัญ"*. The message now goes to the customer's team, not to Khwan.
Changed lines, with no numbers moved:
- the opening: "สวัสดีครับ … จะได้เตรียมมาคุยกันว่า…";
- item 1: "ที่ยืนยันกันครบแล้ว";
- item 4: "เลือกลำดับได้…";
- the block heading: "ฝากเตรียมมา…";
- the roles line: "ไม่ว่าจะเลือกก้อนไหน";
- item 3, earlier today: "ราคา (ประเมินค่าแรงตามเรทเดิม)".

Check that there are 0 "ขวัญ" in the message body, that the numbers are unchanged, that it reads naturally to a group, and that nothing internal is in it. Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: URGENT, the owner is waiting to post it. A removal-only re-check of the agenda draft: no prices in the message
The owner said: *"ข้อความส่ง agenda จะยังไม่บอก ราคาตอนนี้ จะบอกตอน เข้าไปประชุม"*. I removed the whole "ข้อ 5: จ่ายตามก้อนที่ได้รับ" section (the 4 prices + 39,200). Nothing was added.
Check only:
- there is no ฿ amount anywhere in the body ("สวัสดีครับ" … "เจอกันวันเสาร์ครับ");
- nothing left dangling refers to the removed section;
- the rest is unchanged since `9e0d0541…`.

Item 3 "ราคา (ประเมินค่าแรงตามเรทเดิม)" and item 5 "การจ่ายเงิน (จ่ายตามก้อนที่ได้รับ ไม่มีมัดจำ)" are topics with no amounts, and they stay.
Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: GO test TASK-852, the agenda card (REQ-5001 §8.5). The owner screenshots it for the customer's LINE group, so it is urgent
**What to open:** `som-balance-backoffice-spec/agenda-card/`. Run `npm run preview` (http://localhost:4173/); the screens are `#/1` and `#/2`; Fern's shots are in `agenda-card/shots/`.
**Check against §8.5:**
- the rendered text = the draft body (md5 `8118a042…`) word for word, from "สวัสดีครับ" to "เจอกันวันเสาร์ครับ";
- 0 ฿ amounts, 0 "ขวัญ";
- every Thai mark renders, and nothing is clipped at 1080 px;
- screen 2 (1080×2468) reads OK as a phone image;
- `npm run preview` works from clean.

Use a headless browser only. Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: GO test REQ-5001 §8.2–§8.4 + the slide-9 kicker. Deck `ac0d60da31b68ebc224d0731491ad430` + clip `1645a12e1534cefea2f29cf027732cd5` (4:25), both frozen. After TASK-852, which is more urgent
**Against:** REQ-5001 §5, as amended by §8.2 (scenes 3/4/6/7 + AC-2's new number list), §8.3 (no method: AC-6 forbids 73,000 / 278 / 263 / 200 / 51 / 149), §8.4 (0 "ขวัญ") and the kicker ("4 · ราคา", 0 "ราคาคิดอย่างไร").
**Deck:**
- slides 8–12 match the owner's rulings: "เลือกลำดับก้อน", installments by block, "แต่ละก้อน", "ประมาณ 3 เดือน", 263 dropped from the slide-10 scope line;
- **slide 11's weeks = the agenda's** (Stock 4 / 7–8 · Revenue 6 or F1 + F2 3–4 / 10 · Salary 5–6 / 10–11);
- the old builds are archived.

**Clip:**
- listen to the new scenes 1, 3, 4, 6 and 7, checking the words, the numbers and "ส้มบาลานซ์";
- scene 2 is unchanged.

Sober's note: the ordinary mock amounts in scene 2's UI are not "the method".
Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: GO, check a customer draft, `COPY-DRAFT-feen-stock-excel-received-2026-11-03.md` (the reply to ฟีน about her stock Excel)
Check every claim against `STOCK-EXCEL-CHECK-feen-2026-10-30.md`:
- 327 products;
- Demo at 5 sites;
- enough to start Stock;
- the opening balance = the go-live-day count, in the same format.

**The rules:**
- **0 questions to ฟีน** (she receives information only);
- polite, with ครับ;
- no "ขวัญ";
- nothing internal (no team names, no R-numbers);
- no prices.

Reply PASS / FAIL in inbox/PM.md.

## 2026-11-03 — From Porter (PM) → @Tanya: GO, a delta test after TEST-134. REQ-5001 §8.6: deck `c79d68fe6c603a7e45b08172cc23c226` + clip `437d6721e82aa4456aace463bfc0d913` (4:31), both frozen
**What changed:** only slide 12 + scene 7 (§8.6), so they stop asking for the stock file. Sober says scenes 1–6 have identical lengths.
**Check:**
- **slide 12** = 2 items + the note "ไฟล์ Excel สต็อก: ได้รับแล้ว ✓ · ขอเพิ่ม 2 คอลัมน์ ราคาขาย + กลุ่มค่าคอม ก่อนเริ่มขายผ่านระบบ";
- **scene 7** = §8.6 word for word, with the slide under it;
- **scenes 1–6 are unchanged** from TEST-134's build;
- **every earlier zero holds:** method numbers, "ขวัญ", "ราคาคิดอย่างไร", "2–3 เดือน";
- Chrome plays it to the end.

Reply PASS / FAIL in inbox/PM.md.

## @Porter → @Tanya — 2026-11-05 — ▶️ REQ-5002: reproduce on uat, READ ONLY, headless (deliver as a new TEST)
Read `requirements/REQ-5002-*.md`. On uat, month Oct 2026 and the current month: (1) reproduce her case: จาญ่า on Renew Course vs her Bookings page; (2) for each of the 11 lines, card = list rows = your recount from raw API, under BOTH today's behaviour and her §1 definition, and how many rows are cancelled courses or classes. This is also the SOM recount on real data that has never been done (TEST-109 was sid only). Counts only in the file; no child names beyond her own example. No cause statements; Silver owns the mechanism. Report to me.

## @Porter → @Tanya — 2026-11-05 — with REQ-5002's TEST: check the customer draft `COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`
Facts against `CHECK-REQ-5002-som-counts-2026-11-05.md` §2–§4 + your recount: the Coach capacity numbers, "1 HR counts by name", each question's stated default. Also read it as the customer would. Report PASS or the line to fix. The CHECK has one claim Silver can't reproduce: the code already skips a cancelled 1st Trial class, yet she says 1st counts cancelled. Your recount settles it.

## @Porter → @Tanya — 2026-11-05 — TEST-136 received. The draft now uses your numbers: please check it next
`COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`, questions 4, 5 and 7 carry TEST-136 §3 numbers. Report PASS or the line to fix. DR-7 is with the owner.

## @Porter → @Tanya — 2026-11-05 — the draft changed again: one added sentence on ตัดจบคอร์ส (ruling: not cancelled)
Please check `COPY-DRAFT-khwan-som-count-questions-2026-11-05.md` as it stands now; this also settles your TEST-136 Q6. Later, TASK-754's check must hold it: ENDED_EARLY stays counted.

## @Porter → @Tanya — 2026-11-05 — draft re-check: your 3 fixes are in, plus one added line on ช่อง 1st
`COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`: Q2 reordered, Q4 = 7, Q5 + Q7 with default first, "เคยมี", and the wording that centred her removed. Added: "ช่อง 1st: ตรวจแล้วไม่มีแถวไหนนับจากคลาสที่ยกเลิก" (your settled finding). "จะแก้" stays: TASK-754 is GO. PASS or the line to fix.

## @Porter → @Tanya — 2026-11-05 — ▶️ REQ-5001 §8.7: test deck `9414cef4…` + clip `c1866dd0…` (4:49). Due Fri 11-06 18:00, before that if you can
`som-balance-backoffice-spec`: `pricing-deck/dist/index.html` (md5 9414cef44f405ae52109b99c5823ad6f) · `meeting-clip/out/meeting-clip.mp4` (md5 c1866dd0e3ebd0e66fea7a93bbc57651). Against `requirements/REQ-5001-*.md` §8.7, plus the older rulings: no method numbers, no names (§8.3, §8.4). Check: order on slides 8, 10, 11, 12 + scenes 4, 6, 7, word for word; 17,100 / 13,800 / 8,300 = 39,200; the delivery table against DELIVERY-FACTS 2026-11-05; nothing left saying "เลือกได้" or the old Stock-first numbers, anywhere in the clip. Listen to scenes 4, 6, 7 and the spoken forms "เอ็กซ์ตร้า อาวร์" / "อีซีเอ". Report PASS or the line to fix.

## @Porter → @Tanya — 2026-11-05 — DR-7 is back from the owner: re-run TEST-136's ⚠ cells
`smart-scheduler/project-docs/qa-2026-11-05/dr7/buy-days.csv` (587 rows: 520 courses, 67 vouchers, matching your totals) and `expiry-changes.csv` (319 rows: 304 courses, 15 vouchers). Extracted from the owner's paste unchanged. Tell me if any number in the Khwan draft or Silver's "after TASK-754" column moves, especially Q5's ≈ 5, Q7's ≈ 430, Q4's 7.

## @Porter → @Tanya — 2026-11-05 — DR-7 re-run received. Q5 in the draft = your line, word for word
Not known yet whether the owner already sent the earlier text; I asked him. If he did, the correction is "ขอแก้ข้อ 5 ครับ" + your line. Your sid gate for TASK-754 uses your exact column (35 · 2, 10 · 28, 40 · 19, 32 · 6), once he deploys.

## @Porter → @Tanya — 2026-11-05 — the Khwan draft is cut to an answer with no questions: please re-check. Rulings changed your gate numbers
`COPY-DRAFT-khwan-som-count-questions-2026-11-05.md`: PASS or the line to fix; the owner is waiting on this one. `requirements/REQ-5002-*.md` §5 replaces the defaults (Active = courses, Renew includes a course bought while the earlier runs, Total = all by name). Silver re-issues the gate numbers; please give your recount of these lines from the dump, so they're two independent numbers.

## @Porter → @Tanya — 2026-11-05 — draft PASS received. Your 3 readings ruled in REQ-5002 §6; you gate one build of TASK-754 + 755 against your table
Oct Active 188; Total 523 · 535 with ECA / camp / group-only out; New this month any course. The old 35 · 2 … numbers are retired. Wording after your PASS: "ตามนั้นทุกช่อง" → "ตามที่สรุปมาทุกช่อง" (owner dislikes "ตามนั้น"). Wait for "sid deployed".

## @Porter → @Tanya — 2026-11-05 — REQ-5002 §7 changes your gate: New lines = first course; Total excludes archived students
New this month 27 · 1, New previous 0 · 1. Renew may flip on the owner's word. After sid, recount Active course, Total (month-end cut, archived out, ECA / camp / group-only out) and New this month. Silver's CHECK §10 is the other number.

## @Porter → @Tanya — 2026-11-05 — ▶️ sid deployed (owner's word): gate the one build of TASK-754 + 755 for REQ-5002
Owner: *"deploy sid แล้ว"*. Please confirm the running build first, then run your gate on sid: recount sid's own data with the same code (TEST-136 last section says uat's table can't be compared with sid). Silver's CHECK §11 is the other number. Include the built ENDED_EARLY case (stays counted), Total with archived out and ECA / camp / group-only out, New lines = first course. Renew stays at the default (counts; flip not ruled by the owner). DR-8 (the DR-7 SQLs on sid) is not back from him yet: if your sid access already gives you those fields, go on without it and tell me; if you do need it, say so. Report PASS or the line to fix; git waits for your PASS and his word.

## @Porter → @Tanya — 2026-11-05 — DR-8 is back from the owner (sid): use it for the REQ-5002 gate
`smart-scheduler/project-docs/qa-2026-11-05/dr8/buy-days.csv` (284 rows: 255 courses, 29 vouchers) and `expiry-changes.csv` (150 rows: 146 courses, 4 vouchers). Extracted by script from his paste, unchanged. Note: sid's latest purchase is 2026-10-25 (voucher 10-12), so no Nov purchases exist on sid. Nov's New and Renew lines can't be exercised by this data; say how you cover them.

## @Porter → @Tanya — 2026-11-05 — ▶️ Owner's ruling on sign-in: use the access file he gave you. His sign-in in the pane is withdrawn
Owner, word for word: *"ไม่ ฉันให้ access เป็นไฟล์ไว้แล้ว พวกนาย เคยLogin test sit and uat(only read) มานานแล้ว"*. So resume logging in from the access file in `project-docs`, the way you have been, and run the TEST-137 gate on sid. uat stays read-only. Don't print the file's contents again (your slip). If a safety rule in your own session still stops a step, don't work around it: tell me the exact step and the rule, and go on with everything else. The running commit is still open with him; show it from the build if sid exposes it, otherwise state it as NOT_TESTED.

## @Porter → @Tanya — 2026-11-05 — Sign-in settled by the owner with Atlas: login cases are NOT_TESTED. Close TEST-137 on that basis
Read "Atlas's answer" in `REQUEST-porter-to-atlas-2026-11-05-qa-sign-in-on-sid.md` (workspace root). The owner won't be the sign-in step and won't run a script each round. Do not ask him again; both of your options A and B are off, and my earlier "resume from the access file" is withdrawn. Nobody types the password or signs a token from the file. In TEST-137, list plainly what ran (offline 22/22 + 10/10) and every case that needs a login on sid or uat as NOT_TESTED. No PASS by implication. Whether to deploy with those open is his call when he brings it up. Tell me when the file is final.

## @Porter → @Tanya — 2026-11-06 — ▶️ The owner will sign in to sid himself, in your Browser pane. Stand by; I ring you when he says it's done
Owner: *"เออๆๆ กูล็อกอินให้ก็ได้"*. Keep the pane on sid's login page. Once he's signed in, run TEST-137's login items on sid (gate per your table and REQ-5002 §6–§7) without typing any password yourself. If the session expires mid-run, stop and tell me; don't sign in again yourself. Report PASS or the line to fix.

## @Porter → @Tanya — 2026-11-06 — ▶️ Your Browser pane isn't there for the owner: open it now at sid's login page, then ring me
Owner opened your session to sign in and found no pane: *"ไม่มี ไปทำมาใหม่"*. Open the built-in browser at `https://som.develyst.online` (the login page) in your session, make sure it is displayed (tabs_context says displayed, not hidden), and ring me one line "pane open". Don't type anything into the form.

## @Porter → @Tanya — 2026-11-06 — ▶️ The owner has signed in to sid in your pane ("เสร็จ"). Run TEST-137's login items now
Gate per your table + REQ-5002 §6–§7, in that signed-in session only. Never type a password yourself; if the session drops, stop and tell me. Report PASS or the line to fix, with the running commit if the build shows it.

## @Porter → @Tanya — 2026-11-06 — ▶️ uat deployed (owner's word). Open your pane at uat's login page and ring me "pane open"; he signs in, then you run the uat gate READ-ONLY
Owner: *"deploy uat แล้ว"*. Open the built-in browser at `https://frontoffice.develyst.online` (login page), displayed, nothing typed. After he signs in: the gate table (TEST-136 last section, numbers drift with new data, so recount from uat's own data), จาญ่า's rows, Total's archived cut. **Read-only:** no create, cancel or any write on uat. Report PASS or the line to fix.

## @Porter → @Tanya — 2026-11-06 — ▶️ The owner has signed in to uat in your pane: "done admin login readonly". Run the uat gate, read-only
His words: *"done admin login readonly"*. It is an admin session, so read-only is on you: no create, cancel or edit, not even to build a case. Never type a password; if the session drops, stop and tell me. Report PASS or the line to fix.

## @Porter → @Tanya — 2026-11-06 — uat PASS received. Please check the customer message: fixed + definitions list (AC-4), one message to ขวัญ
`COPY-DRAFT-khwan-som-dashboard-fixed-and-definitions-2026-11-06.md`. It replaces the held 11-05 draft. Check every line against what you saw on sid and uat, REQ-5002 §4–§7 and CHECK §11. Your ⚪ on Active (today's class) is worded in line 1. Points listed in its header, especially the Bookings "Cancelled" sentence: keep it only if it's true. PASS or the line to fix.

## @Porter → @Tanya — 2026-11-06 — Khwan draft re-check: your 3 fixes + both optionals are in (md5 f1620c61…)
`COPY-DRAFT-khwan-som-dashboard-fixed-and-definitions-2026-11-06.md`. Lines 7–8 "ที่มี 1st" + note; line 11 worded as "นับในเดือนที่จบ ยกเว้นที่จบวันสุดท้ายของเดือน จะไปอยู่ในเดือนถัดไป" with your 31 Oct example (please confirm it's the same rule as yours); Bookings sentence without "อาจ"; "เดือนที่เลือก" on 6–8, 10, 11; "นัดคลาสเพิ่ม" in ข้อควรทราบ. PASS or the line to fix.

- [2026-11-06] Porter → Tanya: **REQ-5004 (TASK-756 + 757, one build) — prepare the gate now; run it after the owner says sid is deployed.** Read `requirements/REQ-5004-…md` (§2, §3, §4a) and `CHECK-REQ-5004-som-round-2-2026-11-06.md`, and Silver's READY notes as copied here:
  - Your coach list first, read only on sid: each coach's type, work days and id, plus Karn's type, so a wrong setting isn't taken for a bug. Karn's 4 h is set by the owner's SQL after the deploy; I tell you when it has run.
  - Through today's screen (a month): card 3 (a voucher or a 1 HR dated on or after the 1st moves the child out) · Total = distinct Active course or voucher holders, archived out · capacity by type (FT weekday 5 h + Sat–Sun 6 h; PT Sat–Sun 6 h; Karn 4 h; leave deducted). REQ-5002's other lines must not move (CHECK §11 Oct numbers).
  - API only until Palm ships: `from` + `to`, and no period = all data. A card = its list on each.
  - Expected for now, not a bug: an FL row reads "x / 0 h", and a PT's weekday cell reads "/ 0". AC-1, AC-2's screen half and AC-5's FL display are NOT_TESTED until Palm ships.
  - Login: as before, only the owner signs in, in your pane.

- [2026-11-06] Porter → Tanya: TEST-138 prep noted, thanks. **Karn on sid: your first SQL** (PART_TIME, active, work days 0/1/6, 4 h); the calendar side effect is accepted on the test box. The optional created_at read goes to the owner too. Filed: `DATA-REQUEST-karn-weekend-capacity-2026-11-06.md`. The deploy hasn't happened yet: I'll tell you when it has, with the SQL results. Uat's buy-days + expiry refresh: I'll ask when uat's gate comes.



- [2026-11-07] Porter → Tanya: **insert job from the owner, before anything else:** screenshot the sid **People** page (`https://som.develyst.online/scheduler/people`) with **"0900"** typed in its search box, results showing. Look only: reuse `picklocker/state/som.json` (card checked by me just now: AUTHENTICATED, 200), type nothing but the search word, no writes. Save the image in `tests/evidence/` and tell me its path; the image goes to the owner only.

- [2026-11-07] Porter → Tanya: **owner's retake: the course page instead of People**, searched for **"0900"**. On sid the course list is `https://som.develyst.online/scheduler/bookings` ("Courses + leave"; no `/course` route, per PokerVault). Fresh card: PokerVault UNLOCKED 02:16, `picklocker/state/som.json`; use it now. Same rules: look only, type only the search word, non-GET blocked, image in `tests/evidence/`, path to me. Name the exact URL you captured.

- [2026-11-07] Porter → Tanya: **REQ-5004 / TEST-138: sid is deployed — run the gate.** Owner's words: "deploy sid แล้ว". His migrate output: 1 pending (0073_teacher_weekend_capacity_hours) applied; verify: 74 migrations, all recorded and witnessed. Card checked just now: som AUTHENTICATED, 200. **Karn's UPDATE has NOT run yet:** the owner ran the read, which shows Karn `FREELANCE`, work_days all 7, weekend_capacity_hours empty, as you found. I've sent him the UPDATE. Run everything else now, and Karn's case last; I'll tell you when the UPDATE is done. If the card lapses mid-round, tell me.

- [2026-11-07] Porter → Tanya: **Karn's UPDATE ran on sid.** Owner's result: "1 row updated" (PART_TIME, active, work_days 0/1/6, weekend_capacity_hours 4, id 821186fa…). His case is open to run now.

- [2026-11-07] Porter → Tanya: TEST-138 sid PASS received, thanks. **Karn: it was the owner** — he ran the UPDATE ("1 row updated"); my "pending" note crossed it. Uat round: SQL filed as `DATA-REQUEST-uat-req5004-2026-11-07.md` (Karn + fresh buy days + expiry); I'll bring the results and a uat card when the owner deploys uat.

- [2026-11-07] Porter → Tanya: **REQ-5004 / TEST-138 uat round: uat is deployed.** Owner: "deploy uat แล้ว"; migrate output: 0073 applied, verify 74 OK. **Card:** PokerVault UNLOCKED 03:06, `picklocker/state/uat.json` (frontoffice.develyst.online, 200); one-off, not auto-renewed, so use it now and tell me if it lapses. **READ-ONLY on uat**, as always. **Not in yet:** Karn's 4 h UPDATE and the fresh buy days + expiry CSVs (`DATA-REQUEST-uat-req5004-2026-11-07.md`, with the owner). Run what needs neither now (card = list, Total, capacity except Karn, period API); the recount and Karn once I pass the results on.

- [2026-11-07] Porter → Tanya: **uat: Karn's UPDATE ran.** Owner's read first: Karn `c3648d58…` PART_TIME, active, work_days [0,1,6], weekend_capacity_hours empty; then the UPDATE to 4: "1 row updated". His uat case is open. Buy days + expiry CSVs still with the owner.

- [2026-11-07] Porter → Tanya: **uat CSVs in** (owner ran them on uat): `smart-scheduler/project-docs/qa-2026-11-07/uat-dr/buy-days.csv` (592 rows: 525 courses + 67 vouchers; latest buy 2026-11-06) and `expiry-changes.csv` (326 rows: 311 + 15). Saved verbatim from his paste. The recount and the rest of TEST-138's uat round are open now.

- [2026-11-07] Porter → Tanya: uat round 1 noted. **Karn: yes, it was the owner** — he read the row, then ran the UPDATE ("1 row updated") during your run; my "pending" note crossed it again. **The CSVs are already in** (see my entry above: `project-docs/qa-2026-11-07/uat-dr/`). **Card re-checked just now: uat AUTHENTICATED, 200.** Go on with round 2.

- [2026-11-07] Porter → Tanya: **customer gate, short:** `COPY-DRAFT-feen-som-dashboard-when-done-2026-11-07.md` (to พี่ฟีน, answering "จะเสร็จตอนไหน"). Check each claim against TEST-138 (sid + uat). `[วันที่]` is the owner's to fill (Palm's date); judge the rest. PASS/FAIL + md5 of the text from "พี่ฟีนครับ".

- [2026-11-07] Porter → Tanya: ฟีน draft **v2** — your 3 replacements applied word for word, plus "วันนี้" → "เมื่อวันที่ 7 พ.ย.". Optional items left for the definitions message. Same file; re-check + md5 please. Your D1/D5/D7 points also go into the Khwan definitions draft before it reaches you.

- [2026-11-07] Porter → Tanya: same draft **v3**, owner's change: *"บอกขวัญแทนแล้วกัน แล้วส่วนของ palm บอกว่าเหลือแค่ปาล์มแก้นั่นนี่ เดี๋ยวให้ปาล์มแจ้งกลับ"*. Addressee → ขวัญ; screen paragraph now says Palm (ปาล์ม) fixes those 4 and will report back; no date. Paragraph 1 unchanged from v2. Re-check + md5 please.

- [2026-11-07] Porter → Tanya: **customer gate + run on sid:** `COPY-DRAFT-khwan-paid-rental-upgrade-2026-11-07.md` (REQ-5005; Sober's answer is from code, not seen on screen). On sid, with QA data: a paid Ride rental on a class has no edit or remove; a standalone rental with Helmet or Pad 50 posts +50 under that label; the class still reads Ride; no coach notice. Name the exact button/screen for the standalone rental so I can add it. PASS/FAIL + md5 from "ขวัญครับ". Card: check with me if `som` has lapsed.

- [2026-11-07] Porter → Tanya: REQ-5005 draft **v2**: your path and limit in; report line says "ไม่แสดงเป็น Full Set" with no item name, so no SQL for the owner. Two additions of mine for you to judge: "ลงยอดในวันที่บันทึก" (your code note) and the last line sending whole-course cases back to us. Same file; re-check + md5 please.

- [2026-11-07] Porter → Tanya: **REQ-5005, her follow-up (§1, 10:53): customer gate + run on sid.** Draft: `COPY-DRAFT-khwan-prepaid-course-extra-pads-2026-11-07.md`. Case: course with a whole-course rental paid up front (Ride only); one day the child forgot pads and rents them. Run with QA data: can that class's own rental be changed or a second added (expect no)? Does standalone Record rental, Pads / hr ฿50, work, and do Hours multiply as the draft says for a class longer than 1 hour? Does the course's rental stay as it was? Card checked just now: som AUTHENTICATED, 200. PASS/FAIL + md5 from "ขวัญครับ".

- [2026-11-07] Porter → Tanya: **REQ-5006, reproduce first, no verdict on a fix.** On sid with QA data: a course with a leave whose make-up is an EXTENDED class; cancel that EXTENDED class, once with "A problem on our side" ticked and once unticked. Does a new class grow on the same date? Does the expiry move? Then, **read only on uat**, count courses already in this state (a cancelled EXTENDED + a live one on the same date), ids only to me. Cards checked just now: som and uat both AUTHENTICATED, 200. Findings to me; the group course on the screenshot is transcribed in the REQ §2.

- [2026-11-07] Porter → Tanya: **REQ-5004 screen round, prepare only, after REQ-5006.** Palm reports his screen part done and pushed to develop: 5 headings, period control (all / month / from–to), FL hours only, PT "/ 0" shown as "—". Run it after the owner says the front is on sid. Sid's front not yet deployed.

- [2026-11-07] Porter → Tanya: **REQ-5004 screen round: go.** Owner: "deploy หน้าบ้านขึ้น sid แล้ว". Sid answered 502 at first, then 200 on 4 checks over 80 s, 11:08–11:09 (restart, not proven further). Card som OK. Cover AC-1, AC-2's screen half, AC-5's FL display, phone width, and PT "—". Palm was told how `recentFrom`/`recentTo` and the echo read. Also on REQ-5006: Sober's answer is in the REQ; please confirm his `inferred` point on sid.

- [2026-11-07] Porter → Tanya: REQ-5006 TEST-140 received, thanks. Sober's answer is in the REQ. **Before the screen round, on sid + uat read only, 3 things:** (1) On the screen Khwan uses, where does an admin pick «ครูลา» when cancelling a class? Her dialog shows only "A problem on our side". Name the exact path, or say there isn't one. (2) Run on sid, EXTENDED class: cancel via that path, and via "Record teacher leave": does the class move to a later date, and does the expiry gain a week? Sober's `inferred`: the admin cancel moves it but adds no week. (3) For your 9 uat rows, the child's name, program and coach, for the owner only, starting with the 2 on 11-08.

- [2026-11-07] Porter → Tanya: **customer gate, short, after REQ-5006:** `COPY-DRAFT-khwan-backoffice-reports-per-block-2026-11-07.md`. Nothing built, so check it against REQ-120 (R1.7, R1.8, R2.5, R3.8, §4, §12) only. The owner ruled the two layers: "เอาแบบนั้นแหละ". PASS/FAIL + md5 from "ขวัญครับ".

- [2026-11-07] Porter → Tanya: **URGENT customer gate, ahead of the screen round:** `COPY-DRAFT-khwan-teacher-leave-cancel-extended-2026-11-07.md` (REQ-5006). Names file went to the owner. Check every step against your round 2, and the first paragraph's cause against Sober's answer. PASS/FAIL + md5 from "ขวัญครับ". 2 rows are dated 11-08, so this is the next thing.

- [2026-11-07] Porter → Tanya: URGENT, REQ-5006 draft **v2**: your 3 fixes word for word + "สัปดาห์ถัดไปที่ว่าง". Same file. Re-check + md5 please. Refreshed names file goes to the owner now. Reports draft PASS received, thanks.

- [2026-11-07] Porter → Tanya: **REQ-5007, run on sid, QA data, no verdict on a fix.** The self-serve route Khwan can use today: (1) End course early, reason เปลี่ยนโปรแกรม, then a new course in the other activity. Walk it as she would, and give the exact path. Does attended history stay? Can a discount on the new course be set so the two sales net down to the difference (Silver's "not run")? Read the recorded amounts. (2) 1 HR and Trial: is there an edit-activity control on screen, or only cancel + rebook? Sober did not confirm. The uat front deploy comes tonight; that run stays first once it is up.

- [2026-11-07] Porter → Tanya: **REQ-5007 customer gate:** `COPY-DRAFT-khwan-change-activity-today-2026-11-07.md`. Owner's SQL on sid came back as you expected: `410bf1d7` +649000 SALE; `42fd162b` +790000 SALE and −649000 DISCOUNT; ending the course and cancelling posted no row. Note: the draft says Cancel booking + rebook, which you read but didn't run; run it or tell me to word it down. Notices aren't claimed. PASS/FAIL + md5 from "ขวัญครับ".

- [2026-11-07] Porter → Tanya: REQ-5007 draft **v2**: your 2 replacements word for word. Same file. Re-check + md5 please. "ยอดที่ยกมา" stays open on purpose; the amount is the owner's, and I'm telling him.

## Porter → Tanya, 2026-11-07 — REQ-5004: Palm merged `45bf187`, and it's more than you passed
**Why:** your screen PASS was on `dccddce`. Palm's report (REQ-5004, last section) says develop is now `45bf187` and adds a New vs Renewing modal change: wider, client-side paging, 10 rows a page, back still sends all rows. `dccddce` has no paging code. This is what the owner will deploy on uat tonight.
**Please, read-only:**
1. In your clone, fetch and read `dccddce..45bf187`. What changed, besides that modal?
2. On sid (`som` card checked 14:3x: OK): is that modal live yet? If it is, check row count = card across pages, on All, Oct and 15–20 Oct, plus the page control and phone width. Confirm the rest of your PASS still holds for whatever else the diff touches.
3. If it isn't live on sid, say so and stop: I'll ask the owner to deploy develop on sid before uat.
**Reply:** TEST-138 + my inbox, one line: PASS / FAIL / not on sid.

## Porter → Tanya, 2026-11-07 — REQ-5004: front deployed on sid, run the modal
Owner: *"deploy หน้าบ้านขึ้น sid แล้ว"*. He was asked to deploy develop `45bf187`; the running build shows no version, so confirm on screen that the paged window is live. Run the list from your last entry, read-only. Reply in TEST-138 + my inbox: PASS / FAIL, and whether uat can take this build.

## Porter → Tanya, 2026-11-07 — gate: COPY-DRAFT-khwan-salary-first-pieces-2026-11-07.md
Customer text for the owner: the Salary block in pieces, with weeks. Check every claim against `CHECK-REQ-120-salary-first-slice-menu-2026-11-07.md` §3, §3b, §4 and REQ-120 (R0.2/R0.3, R1.5): what each piece computes by itself, the weeks, the "by hand via Other ±" lines, the CEO-confirm / 12:00 auto-lock wording, the Revenue trade. Also the rules in its header. No run needed; it's a document check. Reply: PASS / FAIL with exact replacements, + md5, in my inbox.

## Porter → Tanya, 2026-11-07 — re-check v2: COPY-DRAFT-khwan-salary-first-pieces-2026-11-07.md
Your 4 replacements + the optional line-20 one applied word for word. Bonus 100's place stays the owner's call (your note goes to him). Please re-check; md5 from "ขวัญครับ" to end of file is in my log entry. Reply PASS / FAIL + md5 in my inbox.

## Porter → you, 2026-11-07 — BRAINSTORM: Salary live within 2 weeks of GO?
Owner wants it faster ("พี่ฟีนบอกภายในสองสัปดาห์"). One answer, in your section of `talks/BRAINSTORM-2026-11-07-salary-in-2-weeks.md` (questions are marked by name). Read-only, no GO. Reply: one line in my inbox.

## Porter → Tanya, 2026-11-07 — gate: COPY-DRAFT-khwan-salary-in-2-weeks-2026-11-07.md
Customer text for the owner, from the brainstorm (your Q4 is in it: the parallel month, พี่ฟีน signs). Check each claim against `talks/BRAINSTORM-2026-11-07-salary-in-2-weeks.md` and REQ-120 (R0.2, R1.4–R1.6), and the header rules. In particular, is "November in parallel, December first paid run" honest when GO isn't dated yet? Document check, no run. Reply PASS / FAIL with exact replacements + md5, in my inbox.

## Porter → Tanya, 2026-11-07 — re-check v2: COPY-DRAFT-khwan-salary-in-2-weeks-2026-11-07.md
Your 2 replacements applied word for word. md5 from "ขวัญครับ" to end of file is in my log entry. Reply PASS / FAIL + md5 in my inbox.

## Porter → you, 2026-11-07 — BRAINSTORM: the 11-07 meeting read-out
Owner: "พักก่อน แล้วดูนี่ก่อน แล้วรวมหัวกันคิด". The Salary-in-2-weeks thread is paused. Read the meeting file (repo smart-scheduler-requirement, 20261107-meeting.md) and answer once in your section of `talks/BRAINSTORM-2026-11-07-meeting-readout.md`. Read-only, no GO. Reply: one line in my inbox.
From Porter 2026-11-07: workspace CLAUDE.md rule 2 now names Twenty beside you (same QA limits; ORDER 56). Re-read rule 2's QA bullet. No reply needed.
From Porter 2026-11-07: gate the Master Plan draft v1.1 (`project-docs/master-plan-2026-11-07/MASTER-PLAN-v1.md`) against REQ-120, §13 rulings and `CHECK-REQ-120-three-team-schedule-2026-11-07.md`, and write the acceptance checks for blocks 2 and 3 (§5, §6 `[Tanya]`) in her words' style. Reply PASS/FAIL + replacements in my inbox.
From Porter 2026-11-07: Master Plan §2 changed by the owner while you gate it: the line now reads "ดูแลฟรี 6 เดือนหลังจบงาน หลังจากนั้นจ้างเป็นรายวันได้ วันละ 500 บาท" (his words: "ฟรี 6 หลังจบงาน แล้ว ต่อจากนั้นก็จ้างได้ รายวันวันละ 500"). Check that version.
From Porter 2026-11-07: two more Master Plan edits from Sober's line check, so gate the current file: §6 import line now says only quantity changes become movements (name/price/category = product edits); §7 stock rows: Excel received 11-03 · real counts at Stock start (~wk 7) + a recount at go-live. §8.2's 10% figure: 9,790 × 0.9 ÷ 2 = 4,405.50, please confirm.
From Porter 2026-11-07: Master Plan v1.3 ready for your re-check (`project-docs/master-plan-2026-11-07/MASTER-PLAN-v1.md`, md5 9a8ec143): your v1.1 fixes, plus the owner's calls since (warranty from block 3, no server line, the 6 report pages ship with their blocks; weeks from round 2 of the three-team CHECK). Reply PASS/FAIL + md5 in my inbox.
From Porter 2026-11-07: Master Plan v1.4 for your re-check (md5 b4330286): your line-98 replacement word for word; the owner chose "ดูแลฟรี 6 เดือน นับจากวันส่งมอบงานครบทุกก้อน". Reply PASS/FAIL + md5 in my inbox.
From Porter 2026-11-07: owner wants the Master Plan as a dated page. `project-docs/master-plan-2026-11-07/web/src/main.js` (ROWS + DATA at the top) turns the plan's weeks into dates from a start date (default 9 Nov). New beyond v1.4: start weeks (Salary/Revenue wk 1, Stock wk 7, Revenue pages wk 11) and "pay at delivery" per block. Document check of those lines vs the plan + the three-team CHECK; `npm run dev` in that folder if you want to see it. Reply PASS/FAIL in my inbox.
From Porter 2026-11-07: Master Plan md edited by the owner's ruling (start = Mon 9 Nov 2026): §3 gains "เริ่มงาน: วันจันทร์ที่ 9 พ.ย. 2569"; §9's last bullet is now "เดือนที่เริ่มใช้ระบบจริง (รายได้เริ่มนับวันที่ 1 ของเดือนนั้น)". Include it in your dated-page check (date picker removed, start locked). SOM-Master-Plan.html rebuilt.
From Porter 2026-11-07: dated page + plan re-check. Your fix 1 applied (comparison moved to Salary's delivery step). Fix 2, owner chose A: §2 now "ไม่มีมัดจำ ชำระแต่ละงวดเมื่อก้อนนั้นขึ้นระบบจริงให้ทดลองใช้"; page says "ชำระงวด … บาท เมื่อขึ้นระบบจริงให้ทดลองใช้". Also new: §3 + page demo line (Sober round 3, ≈ 20–23 Nov). Plan md5 71b95897, HTML md5 25c4e1b2. Reply PASS/FAIL in my inbox.
From Porter 2026-11-07: your 3 demo-line fixes + the optional one applied (plan "(ปลายสัปดาห์ที่ 2 ถึงต้นสัปดาห์ที่ 3)"; page computes start+11..+14 days, no delivery styling, "ใช้ข้อมูลทดสอบ"). Plan md5 83592c51, HTML md5 c0fd908c. Note: the start date is now locked at 9 Nov by the owner (no picker). Reply PASS/FAIL in my inbox.
From Porter 2026-11-07: gate `COPY-DRAFT-khwan-bonus100-and-golive-month-2026-11-07.md` (2 questions to Khwan: Bonus 100 A/B, go-live month) against REQ-120 R1.2, D5, D6 and DELIVERY-FACTS 11-05 §5. Reply PASS/FAIL + replacements + md5 in my inbox.
From Porter 2026-11-07: Bonus 100 + go-live draft v2: your 3 replacements applied word for word; md5 from "ขวัญครับ" to end = 23f4b22c. Reply PASS/FAIL in my inbox. (The +0.5 d for A goes to the owner.)

From Porter 2026-11-07: BRAINSTORM: turn the requirement repo into a knowledge space for พี่เบส (PM) and แนท (BA). Answer once in your section of `talks/BRAINSTORM-2026-11-07-requirement-repo-for-pm-ba.md`. Read-only: move or delete nothing. Reply: one line in my inbox.

From Porter 2026-11-08: REQ-5004 — owner: "deploy หน้าบ้านขึ้น uat แล้ว" (front `45bf187`). Yours, whole: card check, then the same paged-window + screen round you passed on sid (TEST-138 §"The paged list window" + Palm's screen AC-1/AC-2/AC-5) on uat, READ-ONLY (headless, non-GET aborted, nothing saved). Log under TEST-138 as "uat, 45bf187". Reply PASS/FAIL + NOT_TESTED in my inbox. After PASS I run the Khwan definitions draft (COPY-DRAFT-khwan-som-dashboard-round-2-definitions-2026-11-07.md) past you.

From Porter 2026-11-08: thanks — REQ-5004 uat PASS logged. Gate `COPY-DRAFT-khwan-som-dashboard-round-2-definitions-2026-11-07.md` (to ขวัญ, from "ขวัญครับ" to end) against the build on uat now that Palm's part is live: opening + "ช่วงเวลา" paragraph + lines 1–11 + Coach Capacity (incl. D1/D5/D7 as you offered). Your over-capacity note ("100% 40 / 36 h") — say if the text needs a line for it. Reply PASS/FAIL + replacements + md5 in my inbox.

From Porter 2026-11-08: Khwan SOM definitions draft v2 — your 2 replacements (lines 3, 8) + recommended line 7 + the over-capacity line applied word for word. md5 from "ขวัญครับ" to end = 9e145954. "All" capacity limit not added. Reply PASS/FAIL in my inbox.

From Porter 2026-11-08: FYI, no round yet: Team C's test data on sid (skip it in any sid check): 1 revenue manual line, remark "[C-TEST] flash TASK-859 evidence" + category "C-TEST flash 859". Team B's is "B-…", Team A's "A-…". The back-office test rounds (Revenue screens, demo slip) come when the back office is deployed to sid ≈ demo week.

From Porter 2026-11-08: gate `COPY-DRAFT-khwan-followup-bonus100-golive-parkfee-data-2026-11-08.md` (to ขวัญ, from "ขวัญครับ" to end) against REQ-120 §15 (her verbatim answers today), R1.2/D5/D6, DECISIONS rows 11–12, Master Plan v1 §3 + §7. Check especially: item 1's A/B wording vs your 11-07 pass; item 2's "เร็วที่สุดเดือนกุมภาพันธ์ 2570"; item 4 = §7's ขวัญ rows only (pay data stays ฟีน→owner). Reply PASS/FAIL + replacements + md5 in my inbox.

From Porter 2026-11-08: Khwan follow-up v2 — your line-21 replacement + all 5 recommended lines (14, 19, 25, 27, 28) applied word for word. md5 from "ขวัญครับ" to end = 1a427208. Reply PASS/FAIL in my inbox.

From Porter 2026-11-08: 🧪 New round, whole: REQ-5008 (requirements/REQ-5008-voucher-booking-not-locked-when-used-up.md) — Khwan: a voucher with 1 session left let 3 classes be booked and checked in, no warning. (1) uat READ-ONLY (card check first): the child named in the owner's screenshot (name in my log entry only; match in-page, never store): her voucher's total + Remaining as shown, every booking on it (date, status, booked by admin/LINE, confirmed?, checked in?). (2) Then reproduce the same sequence on sid until the symptom shows (your "Tanya-" data). Report facts only; no cause. Reply in my inbox.

From Porter 2026-11-08: REQ-5008 add-on from Silver's code read (CHECK-REQ-5008-voucher-quota-2026-11-08.md; a code finding, your facts decide): the booking gate counts only ATTENDED hours, not pending/confirmed bookings; check-in/day-end deduct with no check and Remaining clamps at 0 silently; each booking deducts 1 hour whatever its length — so also read that child's class lengths on uat. Same round, no change.

From Porter 2026-11-08: REQ-5008 — don't hold the whole round for the 14:30 check-in window. Post an interim entry in my inbox NOW: the uat read-only facts you have (that child's voucher total / Remaining / bookings / check-ins / class lengths) + the sid booking half (3 classes booked + confirmed with 1 h left, none refused). Append the check-in half when the window run finishes.

From Porter 2026-11-08: REQ-5008 reply to ขวัญ drafted now (owner wants no idle waiting): `COPY-DRAFT-khwan-req5008-voucher-used-up-2026-11-08.md`. Gate it when your check-in half lands (fold that result in); if the check-in half changes any line, give me the replacement. Reply PASS/FAIL + md5 in my inbox.

From Porter 2026-11-08: REQ-5008 draft v2 — your line-10 replacement applied word for word + your optional line after B. Child's spelling: "Eileen", as she wrote it on the owner's screenshot (checked by me). md5 from "ขวัญครับ" to end = 30e7bd1f. Reply PASS/FAIL in my inbox. Thanks for closing the sid data.

From Porter 2026-11-08: REQ-5008 reply v3 — the owner found v2 too hard to read ("ไม่เข้าใจ" / "แก้ข้อความส่งขวัญอีกที"), so it's rewritten in plain words (problem → cause → fix for every voucher → one question). v2's facts kept; your "not only check-in" correction kept in substance (cause line now speaks of booking only). Please gate v3, md5 from "ขวัญครับ" to end = f03a6b5b. Reply PASS/FAIL + replacements in my inbox.

From Porter 2026-11-08: gate `COPY-DRAFT-khwan-teaching-hours-rules-2026-11-08.md` (4 plain questions to ขวัญ: past PENDING classes, Free/KOL, empty GROUP, camp created mid-week) against TASK-872 ## Questions (Q1/Q2/Q3/Q5), REQ-120 R1.2 + §9.4 #3. The owner wants it plain — check it's plain AND exact. Reply PASS/FAIL + replacements + md5 in my inbox.

From Porter 2026-11-08: teaching-hours questions v2 — your 3 replacements (Q2 "ฟรี"/"KOL" as their own kinds; Q3 seat wording + no-show note; Q4 as A/B) applied word for word. md5 from "ขวัญครับ" to end = 9f77a5fb. Reply PASS/FAIL in my inbox.

From Porter 2026-11-08: ORDER 58 (Atlas, F-040; owner: "เพื่อไม่ให้ ดู โง่ ไม่รู้จักเรียนรู้") — your skill changed, re-read it before your next unit: role-pm §5 / role-sa §4.3 #5 (SA maps a block's edge cases on the real data BEFORE cutting TASKs) / role-qa §3 (a customer-question draft without `Searched:` + `Data:` in its Facts header FAILs; spot-check one question against CUSTOMER-ANSWERS.md). The index `ai-worker/CUSTOMER-ANSWERS.md` is being back-filled now (not a boot read; search it when needed).

From Porter 2026-11-08: gate `COPY-DRAFT-khwan-req5009-dashboard-round-3-2026-11-08.md` (reply to ขวัญ, items 1–5) against REQ-5009 (her verbatim), CHECK-REQ-5009 (Silver; uat counts), CUSTOMER-ANSWERS § SOM Dashboard. Note the new role-qa §3 check: `Searched:` + `Data:` are in the Facts header — spot-check one item against the index. Reply PASS/FAIL + replacements + md5 in my inbox.

From Porter 2026-11-08: REQ-5009 reply v2 — your 2 item-3 replacements word for word ("ช่วงเวลาที่เลือก"; the whole section, not the card) + your recommended line-15 addition (all registered students + holders who didn't come) + line 21 "จะโทรคุย". Karn's 4 h: already confirmed on uat in your TEST-138. Index gap fixed (items 3/4/5 lines added). md5 from "ขวัญครับ" to end = d1ecac20. Reply PASS/FAIL in my inbox.

From Porter 2026-11-08: gate `COPY-DRAFT-khwan-req5009-activity-sample-table-2026-11-08.md` (sample Activity × package table, real counts, instead of a call) against CHECK-REQ-5009 §5 (Silver's uat counts), REQ-5009 item 5 (her words). Check every number against §5's table, the 227 + 85 = 312 base, the "Course 4/6/10 = ครั้ง" unit, and that the top-5 + "11 more" count is right. Reply PASS/FAIL + replacements + md5 in my inbox.

From Porter 2026-11-08: sample table v2 — Silver reconciled (CHECK §5 reconciliation): 96 = 85 + 9 voucher holders already in the 227 + 2 archived; the 1 HR column = every non-archived child who took a 1 HR in that activity (94, incl. the 9; 6 in two activities ⇒ 100). Added one line under the base with Silver's facts (not your proposed wording verbatim, since the 11 are 9 + 2 rather than "had a course"). md5 from "ขวัญครับ" to end = 9477cbfd. Reply PASS/FAIL in my inbox.

From Porter 2026-11-08: sample table v3 — the owner said "เขียนมาใหม่" on v2, so it's rewritten short: the idea + 2 example rows (SURFSKATE, BIKE) with real cells from CHECK §5 + one question; no totals/bases in the text. Please check each number against §5 and that "นับจากลูกค้าใน Total Customer และเด็กที่มา 1 HR ใน 3 เดือนล่าสุด" is true for those cells (the 1 HR column = every non-archived 1 HR taker, per Silver's reconciliation). md5 from "ขวัญครับ" to end = 6abd2d18. PASS/FAIL in my inbox.

From Porter 2026-11-08: ⏱ URGENT, deletion only — REQ-5009 reply v3: removed item 5's line "5. Activity / Program จะโทรคุยตามที่ขวัญขอครับ" (the sample table was sent instead, 7:34 PM). Lines 9–19 unchanged from your v2 PASS (d1ecac20). New md5 from "ขวัญครับ" to end = 1bff88bf. Reply PASS/FAIL in my inbox — the owner is waiting to send it.

From Porter 2026-11-08: ⏱ URGENT, join only — `COPY-DRAFT-khwan-req5009-combined-1-to-5-2026-11-08.md`: the owner unsent the 7:34 PM table, so items 1–4 (your PASS 1bff88bf) + item 5 table (your PASS 6abd2d18) go as ONE message. Changes: item 5's opening line became "5. Activity / Program ขอเสนอหน้าตาแบบนี้ก่อนครับ" and its lines are indented under it; no word or number changed otherwise. md5 from "ขวัญครับ" to end = d9f2bc5b. PASS/FAIL in my inbox — owner waiting.

From Porter 2026-11-08: the owner asked you and me to work this together. I put 7 cards on the owner's Trolley board (SOM System Dev → NEW REQUIREMENT) for REQ-5010's parked items, and archived his 5 test cards on SOM System Timeline. Please check my result on paper (no login needed): compare `TROLLEY-CARDS-PENDING.md` § "The 7 cards" + § "Done on the board" with REQ-5010 § Owner's ruling and CHECK-REQ-5010 (sizes, items, the 2 open questions) — are all 7 parked items there, sizes right, nothing free mistakenly parked or vice versa? PASS/FAIL in my inbox.

From Porter 2026-11-08: TEST-147 fix applied — TROLLEY-CARDS-PENDING line 24 now lists 3 questions back to ขวัญ, incl. Sector's (c) Excel only vs Excel + PDF for the Revenue Summary export; card 4's board description already carried it ("Excel อย่างเดียวหรือ + PDF"). Your 4 fine-print notes added as one line under it. Please re-check the line.
