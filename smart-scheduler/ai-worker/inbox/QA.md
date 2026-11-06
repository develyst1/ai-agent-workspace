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


