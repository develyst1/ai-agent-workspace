# REQ-5001: A presenter video for the 11-07 money meeting (the agenda, narrated in Thai)

**Status:** OPEN → @Sober · **Written:** 2026-11-03 by Porter (PM) · **Due:** a Tanya-passed MP4 in the owner's hands by **Fri 2026-11-06, 18:00**. The meeting is Sat 11-07.
**Origin (owner, 2026-11-03, verbatim):**
1. *"ไหนลองทำคลิปสิ เป็นคลิป ตาม agenda / ทำ vite เพิ่ม เพื่อ ประกอบคลิปให้จบก็ได้"*
2. *"ทำเหมือนกับนายเป็นคนพรีเซ้น หรือ ประชุมเอง"*
3. *"มีเสียงก็ได้"*

**Sources:**
- the agenda: `AGENDA-owner-backoffice-money-meeting-2026-11-07.md`;
- the deck and the screens: REQ-133. Both are final and Tanya-passed:
  - `som-balance-backoffice-spec/pricing-deck/dist/index.html` (md5 `604bde02…`);
  - `…/final-ui/dist/index.html` (md5 `1d0ce1f6…`).

## 1. The need
The owner wants the meeting's presentation as **one video** that plays through the agenda **as if a presenter were running the meeting**, with a Thai voice. He can then play it in the room, or watch it beforehand, instead of presenting every point himself.

## 2. What to deliver
1. **One MP4**, 1920×1080, H.264 + AAC, about **6–8 minutes**. It must play in Windows' default player and in Chrome.
2. **A Thai narration voice** reading the script in §4 word for word.
   - The voice is male, calm and polite, and ends sentences with ครับ.
   - It is a synthesized voice (TTS). The SA picks the engine.
3. **On-screen Thai subtitles** of the same script, burned in. The room may play the video quietly.
4. **The source:** a small **Vite** project in `som-balance-backoffice-spec/meeting-clip/` that builds the scenes and renders the MP4 (the owner suggested Vite). One command must re-render the MP4 from the script, so a wording change costs minutes.
5. **What each section shows** (it never shows a blank or a loading screen):
   - **Scenes 1, 3, 4, 5 and 6:** the REQ-133 **deck slides**.
   - **Scene 2:** a **screen recording of the final UI**, opening in DARK mode, that clicks through the pages the narration names.

## 3. Scenes (they follow the agenda, items 1–6, then the close)
| # | Agenda item | Visual | Target length |
|---|---|---|---|
| 1 | Opening: where we are | deck slides 1 and 8 | ~40 s |
| 2 | The new back office, 5 parts | deck slide 2, then a final-UI recording: Salary → Revenue → Stock → the front-office fixes → the role switch (CEO / Admin / Coach) | ~3 min |
| 3 | How the price is worked out | deck slide 9 | ~1 min |
| 4 | Payment | deck slide 10 (the installment table) | ~40 s |
| 5 | After delivery | deck slide 10 (the "ราคานี้รวม" line, highlighted) | ~30 s |
| 6 | Delivery order | deck slide 11 | ~40 s |
| 7 | Close: what we need today | deck slide 12 | ~30 s |

## 4. The narration script (Porter wrote it; read it word for word, change nothing)
> Customer-facing wording is the PM's. If a line does not fit its scene's timing, tell me through @Sober. Do not reword it yourselves.

**ฉาก 1 — เปิด**
สวัสดีครับ วันนี้เราจะมาคุยเรื่องระบบหลังบ้านใหม่ของ SOM BALANCE กันครับ ก่อนอื่นขอเล่าว่าตอนนี้เรามาถึงตรงไหนแล้ว กฎการทำงานทุกข้อ คุณขวัญยืนยันครบแล้ว หน้าจอตัวอย่างก็ผ่านการตรวจครบทุกหน้า และคำถามเรื่องเงินทั้งหกข้อ ก็ได้คำตอบครบแล้วครับ วันนี้จึงเหลือแค่สองเรื่อง คือตกลงราคา และกำหนดวันเริ่มครับ

**ฉาก 2 — ระบบหลังบ้านทำอะไรให้**
ระบบหลังบ้านใหม่มีห้าส่วน รวมอยู่ในที่เดียวครับ
ส่วนแรกคือเงินเดือน สิ้นเดือนระบบคิดเงินเดือนของแต่ละคนจากตารางสอนให้เอง ทั้งพนักงานประจำ พาร์ทไทม์ ฟรีแลนซ์ และสตาฟ CEO ดูยอดรวมทั้งเดือนได้ โค้ชเปิดดูสลิปของตัวเองแล้วกดยืนยันเอง และส่งออกเป็น Excel หรือ PDF ได้ครับ
ส่วนที่สองคือรายได้ เมื่อยืนยันคอร์ส คลาสทดลอง แคมป์ หรือขายของ รายได้จะลงให้อัตโนมัติ ถ้าต้องการลงเองก็ทำได้ ยกเลิกคอร์สพร้อมแจ้งผู้ปกครองได้ในขั้นตอนเดียว และดูรายงานรายวัน รายเดือน และทั้งปีได้ครับ
ส่วนที่สามคือสต็อก ขายของแบบตะกร้า ใส่ส่วนลดรายชิ้นได้ เลือกโค้ชที่ขาย แล้วระบบจะบันทึกค่าคอมให้ ของที่ใกล้หมดมีแจ้งเตือน และนำเข้ารายการสินค้าจาก Excel ได้ครับ
ส่วนที่สี่คือการเพิ่มสิ่งที่ขาดในหน้าบ้านที่ใช้อยู่ทุกวัน เช่น ระบุสาขาของการจอง เลือกวิธีชำระเงิน รู้ว่าใครเปลี่ยนจากคลาสทดลองเป็นคอร์ส รวมถึง Park Rent และการยืนยันแคมป์ครับ
และส่วนสุดท้ายคือสิทธิ์ผู้ใช้ แต่ละคนเห็นเท่าที่ควรเห็น CEO เห็นทุกอย่าง แอดมินไม่เห็นยอดเงินเดือน โค้ชทุกคนมีล็อกอินของตัวเอง และทุกอย่างเชื่อมกับระบบเดิม ไม่ต้องคีย์ข้อมูลซ้ำครับ

**ฉาก 3 — ราคาคิดอย่างไร**
เรื่องราคา เราใช้เรทเดิม ไม่ได้ขึ้นราคาครับ แพ็กเกจเดิมเจ็ดหมื่นสามพันบาท ได้งานประมาณสองร้อยเจ็ดสิบแปดวันทำงาน ตกวันละประมาณสองร้อยหกสิบสามบาท หลังบ้านใหม่ถ้าทำจากศูนย์คือสองร้อยวัน เราหักหลังบ้านเดิมที่มีอยู่แล้วออกห้าสิบเอ็ดวัน เหลืองานที่เพิ่มจริงหนึ่งร้อยสี่สิบเก้าวัน คูณสองร้อยหกสิบสามบาท ได้ประมาณสามหมื่นเก้าพันสองร้อยบาทครับ
ขอย้ำว่าหนึ่งร้อยสี่สิบเก้าวันคือขนาดของงาน ไม่ใช่เวลาที่ต้องรอนะครับ เราส่งได้ภายในสองถึงสามเดือน เพราะมีสองทีมทำพร้อมกัน มีการตรวจและทดสอบทุกขั้น และมีเครื่องมือช่วยให้ทำงานเร็วขึ้น ทุกตัวเลขมีคนตรวจซ้ำครับ

**ฉาก 4 — การจ่ายเงิน**
ข้อเสนอของเราคือครบทั้งห้าส่วน สามหมื่นเก้าพันสองร้อยบาท แบ่งจ่ายสามงวดตามการส่งมอบครับ งวดที่หนึ่ง เมื่อส่งมอบสต็อกและสิทธิ์ผู้ใช้ หนึ่งหมื่นหนึ่งพันเก้าร้อยบาท งวดที่สอง เมื่อส่งมอบรายได้และส่วนหน้าบ้าน หนึ่งหมื่นสามพันแปดร้อยบาท และงวดที่สาม เมื่อส่งมอบเงินเดือน หนึ่งหมื่นสามพันห้าร้อยบาท ไม่มีมัดจำครับ จ่ายเมื่อได้รับงานแต่ละส่วนเท่านั้น

**ฉาก 5 — หลังส่งมอบ**
ราคานี้รวมการแก้บั๊กตลอดโครงการ เพราะเราขึ้นระบบให้ทดสอบได้ตลอด และหลังจบโครงการ เราดูแลต่ออีกหกเดือนครับ ราคานี้ครอบคลุมขอบเขตที่ยืนยันกันแล้ว ถ้าต้องการเพิ่มอะไรในภายหลัง เราคิดด้วยเรทเดิม ตามขนาดของงานครับ

**ฉาก 6 — ลำดับการส่งมอบ**
เราจะเริ่มจากสต็อก เพื่อให้ใช้งานได้ก่อนครับ งวดแรกใช้เวลาประมาณสามถึงสี่สัปดาห์ งวดที่สองประมาณสี่ถึงห้าสัปดาห์ และงวดสุดท้ายประมาณสามสัปดาห์ ทุกงวดรวมการทดสอบ การติดตั้ง และช่วงทดลองใช้แล้ว ระยะเวลานับจากวันที่เราได้ข้อมูลครบ ทั้งหมดเสร็จภายในสองถึงสามเดือนครับ

**ฉาก 7 — ปิด**
สุดท้าย มีสองอย่างที่อยากได้จากการประชุมวันนี้ครับ อย่างแรกคือวันที่จะเริ่มใช้ระบบ เพราะมีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ อย่างที่สองคือไฟล์ Excel รายการสินค้าจริงพร้อมจำนวนคงเหลือ เพื่อเริ่มงานสต็อกได้ทันทีครับ ขอบคุณครับ

## 5. Acceptance criteria (Tanya checks each one on the rendered MP4)
1. The MP4 plays from start to end in Chrome and in Windows' default player. It is 1920×1080, and about 4–5 minutes long: the script at a natural pace, with no slowed speech and no padding silence (changed 11-03, A1).
2. The audio is the §4 script, **word for word, in order**. Every number is spoken correctly: 73,000 · 278 · 263 · 200 · 51 · 149 · 39,200 · 11,900 · 13,800 · 13,500 · 6 months · 3–4 / 4–5 / 3 weeks · 2–3 months.
3. The subtitles match the audio and are readable: no line runs off screen, and Thai vowels and tone marks are not clipped.
4. Each scene shows the visual named in §3, in sync with the narration: the slide on screen is the one being talked about, and the UI page being clicked is the one being named.
5. The UI recording is in DARK mode. It shows **only the invented names and numbers** already in the final UI. No real staff or child name appears anywhere.
6. **Nothing internal appears**, in sound or on screen. That means:
   - nothing from the agenda's "ระวัง" or ถาม–ตอบ parts;
   - no "ไม่มีส่วนลด";
   - no 25,700 / Salary-later option;
   - no +5 days / +1,300 ฿.
7. Re-running the documented single command rebuilds the same MP4 from the script in `meeting-clip/`.
8. The REQ-133 deck and final-UI `dist/` files are unchanged. Their md5s are still `604bde02…` and `1d0ce1f6…`.

## 6. Out of scope
- Any change to the deck, the final UI or their wording (REQ-133 is final).
- A video of anyone's real face or real voice.
- Hosting or uploading the video anywhere.
- The meeting itself. The owner runs it.

## 7. Constraints
- **The TTS engine needs no paid account and no key.** If the only good Thai voice needs one, stop and ask me through @Sober. I ask the owner. Never create an account, and never invent a key.
- The script text may go to a TTS service. It holds prices for this customer but no personal data. If the SA prefers an offline engine, that is fine too.
- **No git** (the spec folder is not a repo). No server, no deploy.
- Thai fonts: use the same family as the deck, so the video looks like one piece with it.

## Questions
_(Sober, SA, 2026-11-03. Checked: REQ-5001 §2–§7, DECISIONS: nothing on clip length, voice or pronunciation. Measured with a spike; SPEC-096 §0. **The build has started on my defaults**; each answer is a config change, not a rebuild of the design.)_

**Q1. Length (AC-1 says 6–8 min).** The §4 script, read word for word by the voice at its normal pace, is **3.8 min** (scene 2 is 78 s, not ~3 min). I will **pace it naturally with short pauses ⇒ ≈ 4–4½ min**, and let AC-1 read "the script's natural length".
- Case: keep 6–8 min with the script as is ⇒ ≈ 2 min of silence or slowed speech (it sounds dragged). I advise against it.
- Case: the owner wants ≈ 6 min ⇒ you (the PM) lengthen the script, mostly scene 2 (one or two sentences per part as the screens are shown). I fit any new lines; it's a re-render in minutes.
- Correct only the line that's wrong.

**Q2. The voice.**
- **Default: Microsoft Pattara**, a male Thai voice built into Windows. Offline, no account, no key (§7 ✓).
- It's an older, flatter voice than the newest "neural" ones. **Hear it: `som-balance-backoffice-spec/meeting-clip/samples/voice-pattara-scene1.wav`** (scene 1, 24 s; it opens in Windows' player).
- The better-sounding option, Microsoft's neural "Niwat" voice, works only through an online, unofficial endpoint (no key, but not a supported service; it may stop working). I don't default to it.
- If the owner rejects Pattara after hearing it, tell me, and I'll size the Niwat route (≈ +0.25 d).

**Q3. How the voice says the English words.** The script has SOM BALANCE, CEO, Excel, PDF, Park Rent (and "Stock" is written in Thai). A Thai voice may misread them.
- I can change **only what is said, never the words or the subtitles**: e.g. CEO → "ซีอีโอ", Excel → "เอ็กเซล", PDF → "พีดีเอฟ", Park Rent → "พาร์ค เร้นท์".
- **"SOM BALANCE": how do they say it?** I won't guess a brand name.
- Default: leave all five as the engine reads them. Tanya flags any that sound wrong, then you approve each spoken form.

### Answers — Porter (PM), 2026-11-03
- **A1 Length: your default is accepted.** Use the natural pace with short pauses, ≈ 4–4½ min. The owner never asked for 6–8 min; that number was mine. **AC-1 now reads: "about 4–5 minutes, the script at a natural pace; no slowed speech, no padding silence."** `[team-proposed 2026-11-03]`
- **A2 Voice: Pattara stays the default for now.** I sent the owner your scene-1 sample today. If he rejects it, I tell you, and you size the Niwat route. Do not wait for his answer; keep building on Pattara.
- **A3 Spoken forms:**
  - **Approved now** (the subtitles keep the English): CEO → "ซีอีโอ", Excel → "เอ็กเซล", PDF → "พีดีเอฟ", Park Rent → "พาร์ค เร้นท์". `[team-proposed 2026-11-03]`
  - **"SOM BALANCE": asked the owner.** Until he answers, leave it as the engine reads it.
- **Owner's answers, 2026-11-03:** *"เสียงใช้ได้ อ่านว่า ส้มบาลานซ์"*
  - the voice is **Pattara, final**;
  - SOM BALANCE is spoken as **"ส้มบาลานซ์"**; the subtitles keep "SOM BALANCE". `[owner-approved 2026-11-03]`

**SA status, Sober 2026-11-03: SPEC_DONE.** TASK-848 + TASK-849 DONE. MP4 `som-balance-backoffice-spec/meeting-clip/out/meeting-clip.mp4`, 4 min 39 s, md5 `1996f7a72083b14d674581b6fe8faf12`. Re-render: `npm run render` in `meeting-clip/` (README).

## 8. Amendment, 2026-11-03: Khwan wants an agenda, and to choose the order of the parts
**Owner (2026-11-03, verbatim):** *"คือฉันคิดว่าน่าจะต้องปรับแต่งสคริปต์หรือว่าพรีเซนต์นิดหน่อยเพราะว่าตัวคุณขวัญเขาอยากได้อเจนดาเพื่อที่จะเขาจะได้ไปรู้ว่ามันมีเซสชันยังไงบ้างแล้วเขาอาจจะได้ขอเราในการว่าเอาอะไรก่อนอะไรหลังอะไรเงี้ยเพราะว่าเขาเห็นว่าเราทำอีก2-3 เดือนอ่ะเขาบอกว่าอยากได้เร็วๆอะไรเงี้ยแล้วเขาบอกว่างั้นขอแบบอะไรก่อนอะไรหลังเป็นคนเลือกได้ไหมเพราะฉะนั้นนายต้องทำ agenda ได้เขา"*

**What changes:**
1. **A customer-facing agenda for Khwan**, which Porter writes. It lists the parts ("sessions") of the build, what each holds and how long each takes, so she can choose what comes first.
2. **The deck's slide 11 and the clip's scene 6 stop saying "Stock first, fixed".** They say the order is hers to choose, within the dependencies the SAs give. The script line is rewritten by Porter once the SA data below is in.

**Waiting on @Sober + @Silver** (inbox 11-03): the per-part calendar weeks, the dependencies between parts, the fastest total with both teams, and how the installments follow her order.

### 8.1 Owner decisions, 2026-11-03: *"ได้ทั้ง 2 ข้อ ประมาณ 3 เดือน งวดตามก้อน"* `[owner-approved 2026-11-03]`
- **D1:** the whole build is "about 3 months" (it was 2–3 months).
- **D2:** the installments follow the block Khwan receives, in her order.
  - The blocks: STOCK 8,300 · REVENUE + front desk 13,800 · SALARY + coach side 13,500.
  - Roles 3,600 is paid with the first block.
- **The agenda for Khwan:** `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` (Tanya TEST-132 PASS).
- **The deck + clip changes:** GO to @Sober 11-03. Ready for QA by Thu 11-05 18:00.

### 8.2 The new narration lines (Porter; they replace scenes 3, 4, 6 and 7 of §4 word for word. Scenes 1, 2 and 5 are unchanged)
**ฉาก 3: ราคาคิดอย่างไร** (only the second paragraph changes)
เรื่องราคา เราใช้เรทเดิม ไม่ได้ขึ้นราคาครับ แพ็กเกจเดิมเจ็ดหมื่นสามพันบาท ได้งานประมาณสองร้อยเจ็ดสิบแปดวันทำงาน ตกวันละประมาณสองร้อยหกสิบสามบาท หลังบ้านใหม่ถ้าทำจากศูนย์คือสองร้อยวัน เราหักหลังบ้านเดิมที่มีอยู่แล้วออกห้าสิบเอ็ดวัน เหลืองานที่เพิ่มจริงหนึ่งร้อยสี่สิบเก้าวัน คูณสองร้อยหกสิบสามบาท ได้ประมาณสามหมื่นเก้าพันสองร้อยบาทครับ
ขอย้ำว่าหนึ่งร้อยสี่สิบเก้าวันคือขนาดของงาน ไม่ใช่เวลาที่ต้องรอนะครับ ทั้งหมดเสร็จในประมาณสามเดือน เพราะมีสองทีมทำพร้อมกัน และมีการตรวจและทดสอบทุกขั้น ทุกตัวเลขมีคนตรวจซ้ำครับ

**ฉาก 4: การจ่ายเงิน**
ข้อเสนอของเราคือครบทั้งห้าส่วน สามหมื่นเก้าพันสองร้อยบาท จ่ายตามก้อนที่ได้รับครับ งานแบ่งเป็นสามก้อน ก้อนสต็อกแปดพันสามร้อยบาท ก้อนรายได้และหน้าบ้านหนึ่งหมื่นสามพันแปดร้อยบาท และก้อนเงินเดือนกับฝั่งโค้ชหนึ่งหมื่นสามพันห้าร้อยบาท ส่วนระบบสิทธิ์ผู้ใช้สามพันหกร้อยบาท จ่ายพร้อมก้อนแรก ไม่มีมัดจำครับ จ่ายเมื่อได้รับงานแต่ละก้อนเท่านั้น

**ฉาก 6: ลำดับการส่งมอบ**
ลำดับการส่งมอบ คุณขวัญเลือกได้ครับ ถ้าเลือกสต็อกก่อน ส่วนแรกใช้ได้ในประมาณสี่สัปดาห์ ซึ่งเร็วที่สุด และครบทั้งก้อนในประมาณเจ็ดถึงแปดสัปดาห์ ถ้าเลือกรายได้ก่อน ใช้ได้ในประมาณหกสัปดาห์ ครบทั้งก้อนรวมหน้าบ้านประมาณสิบสัปดาห์ ถ้าเลือกเงินเดือนก่อน สลิปแรกได้ในประมาณห้าถึงหกสัปดาห์ และครบทุกรายการรวมโบนัสประมาณสิบถึงสิบเอ็ดสัปดาห์ ระบบสิทธิ์ผู้ใช้มากับก้อนแรกเสมอ ทั้งหมดเสร็จในประมาณสามเดือน นับจากวันที่เราได้ข้อมูลครบครับ

**ฉาก 7: ปิด**
สุดท้าย มีสามอย่างที่อยากได้จากการประชุมวันนี้ครับ อย่างแรกคือลำดับก้อนที่คุณขวัญเลือก ว่าอยากได้ก้อนไหนก่อน อย่างที่สองคือวันที่จะเริ่มใช้ระบบ เพราะมีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ อย่างที่สามคือไฟล์ Excel รายการสินค้าจริงพร้อมจำนวนคงเหลือ ถ้าเลือกสต็อกก่อน เราจะเริ่มได้ทันทีครับ ขอบคุณครับ

**Change to AC-2's number list:**
- out: "2–3 months", the old installments (11,900), and 3–4 / 4–5 / 3 weeks;
- in: 8,300 · 13,800 · 13,500 · 3,600 · about 3 months · 4 / 7–8 / 6 / 10 / 5–6 / 10–11 weeks.

**Note on dropping a phrase:** scene 3 no longer says "มีเครื่องมือช่วยให้ทำงานเร็วขึ้น". The total is no longer "fast", so the line would invite the dangerous question in brief §7 #2.

### 8.3 Owner, 2026-11-03: keep the pricing METHOD out, say only the price and that it uses the old rate `[owner-approved 2026-11-03]`
**Verbatim:** *"ตรง วิธีคิด เก็บไว้ เป็น เผื่อเขาถามค่อยบอกเถอะ บอก แค่ ราคา และบอกว่าคิดจากราคาเดิม หรือ ประเมิณค่าแรงตามราคคาเดิมเลย"*
- **Deck slide 9:**
  - remove the method (73,000 / 278 days / 263 ฿ a day / 200 − 51 = 149 / the "149 × 263" equation / "149 วันคือขนาดของงาน…");
  - it shows only **39,200 บาท**, "ประเมินค่าแรงตามเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา" and "เสร็จในประมาณ 3 เดือน".
  - The method stays in the owner's brief §3 / §7, for when he is asked.
- **Scene 3 narration** replaces §8.2 scene 3, word for word:
  > **ฉาก 3: ราคา**
  > เรื่องราคา ระบบหลังบ้านใหม่ครบทั้งห้าส่วน ราคาสามหมื่นเก้าพันสองร้อยบาทครับ ราคานี้ประเมินค่าแรงด้วยเรทเดิมของแพ็กเกจที่ใช้อยู่ ไม่ได้ขึ้นราคา และทั้งหมดเสร็จในประมาณสามเดือนครับ
- **AC-2's number list:** drop 73,000 · 278 · 263 · 200 · 51 · 149. AC-6 gains these: none of those numbers may appear in sound or on screen.
- **Khwan's agenda item 3:** "ราคาและวิธีคิด" → "ราคา (ประเมินค่าแรงตามเรทเดิม)".

### 8.4 Owner, 2026-11-03: stop centring Khwan; there are several decision-makers `[owner-approved 2026-11-03]`
**Verbatim:** *"เลิกอ้างขวัญสักที คนตัดสินมีหลายคน ขวัญแค่พนักงานคนนึง มีพี่ฟีน คือเจ้าของบริษัท มี พี่กุ้ง แอดมินเท่าๆ กับขวัญ"*
**Rule:** no customer-facing line names Khwan as the one who confirms or chooses. Use neutral wording: "ยืนยันกันครบแล้ว", "เลือกลำดับได้", "ลำดับก้อนที่เลือก".
- **Deck:**
  - slide 8 "คุณขวัญยืนยันกฎครบแล้ว" → "ยืนยันกฎครบแล้ว";
  - slide 11 "ขวัญเลือกลำดับได้" → "เลือกลำดับได้";
  - slide 12 "ลำดับก้อนที่ขวัญเลือก" → "ลำดับก้อนที่เลือก".
  - Grep the whole deck for "ขวัญ": 0 hits allowed.
- **Narration, word for word:**
  - **scene 1:** "กฎการทำงานทุกข้อ คุณขวัญยืนยันครบแล้ว" → "กฎการทำงานทุกข้อ ยืนยันกันครบแล้ว";
  - **scene 6:** "ลำดับการส่งมอบ คุณขวัญเลือกได้ครับ" → "ลำดับการส่งมอบ เลือกได้ครับ";
  - **scene 7:** "อย่างแรกคือลำดับก้อนที่คุณขวัญเลือก ว่าอยากได้ก้อนไหนก่อน" → "อย่างแรกคือลำดับก้อนที่เลือก ว่าอยากได้ก้อนไหนก่อน".
- **AC-6 gains:** "ขวัญ" appears nowhere in sound or on screen.

### 8.5 Owner, 2026-11-03: the agenda as a pretty page to screenshot (Vite preview) `[owner-approved 2026-11-03]`
**Verbatim:** *"ทำเป็น vite preview สวยๆ ดูง่ายๆ มี UI ฉันจะเข้าไปแคปเป็นรูป"*
- **What:** one Vite page in `som-balance-backoffice-spec/agenda-card/`. The owner opens it with `npm run preview`, screenshots it, and posts the image to the customer's LINE group.
- **Text:** the message body of `COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` (Tanya TEST-132 PASS, md5 `8118a042…`), word for word, from "สวัสดีครับ" to "เจอกันวันเสาร์ครับ". Nothing added, nothing removed, **no prices**, no "ขวัญ".
- **Look:**
  - easy to read on a phone in LINE;
  - visually one family with the pricing deck (its fonts and colours);
  - the 6 topics as a clear list;
  - the 3 blocks as 3 cards, each showing "มีอะไร" and "ถ้าเลือกเป็นก้อนแรก";
  - the 4 notes below.
- **Shape:** portrait, about 1080 px wide. If it is too tall for one readable image, split it into 2 screens (topics / blocks), each a clean screenshot. Light background unless the deck's dark reads better as an image; the builder's call.
- **Done when:** Tanya confirms the rendered text matches the draft word for word, every Thai mark renders, nothing is clipped at 1080 px, and `npm run preview` works from a clean checkout. No git, no deploy.

### 8.6 The stock Excel was already received (ฟีน, LINE, 10-30), so scene 7 and slide 12 must stop asking for it `[team-proposed 2026-11-03]`
**Facts:** `STOCK-EXCEL-CHECK-feen-2026-10-30.md` (Sober). It fits the first Stock slice as it is. Two columns are missing for selling: ราคาขาย and กลุ่มค่าคอม.
- **Slide 12** ("ที่ต้องได้จากการประชุมวันนี้") becomes 2 items + 1 note:
  - 1. ลำดับก้อนที่เลือก
  - 2. วันที่จะเริ่มใช้ระบบ (มีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ)
  - **note:** "ไฟล์ Excel สต็อก: ได้รับแล้ว ✓ · ขอเพิ่ม 2 คอลัมน์ ราคาขาย + กลุ่มค่าคอม ก่อนเริ่มขายผ่านระบบ"
- **Scene 7 narration** replaces §8.2's scene 7, word for word (the §8.4 rule holds; no names):
  > **ฉาก 7: ปิด**
  > สุดท้าย มีสองอย่างที่อยากได้จากการประชุมวันนี้ครับ อย่างแรกคือลำดับก้อนที่เลือก ว่าอยากได้ก้อนไหนก่อน อย่างที่สองคือวันที่จะเริ่มใช้ระบบ เพราะมีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ ส่วนไฟล์ Excel สต็อกที่ส่งมา เราได้รับแล้วครับ ใช้เริ่มงานสต็อกได้ทันที ขอเพิ่มอีกแค่สองคอลัมน์ คือราคาขายกับกลุ่มค่าคอมของแต่ละสินค้า ก่อนเริ่มขายผ่านระบบครับ ขอบคุณครับ
- **AC-2 gains:** "สองคอลัมน์". It drops nothing else.

### 8.7 Owner, 2026-11-05: *"ทำการแก้ไขมา ให้เป็นตามนี้ ทั้ง สไลด์ หรือ อะไรต่างๆ"*: everything follows the customer's stated order `[owner-approved 2026-11-05]`
**Source:** `requirements/REQ-120-*.md` §11 (LINE 11-05 00:11). Order = เงินเดือน → รายได้ → สต็อก. First Salary slice = ฐานเงินเดือน + Extra Hour + Bonus 100; Bonus 50 later. Revenue includes ECA. §8.4 still holds: no names. §8.3 still holds: no method.
**Prices (DELIVERY-FACTS Q5):** 17,100 (13,500 + Roles 3,600) · 13,800 · 8,300 = 39,200.
**The weeks:** from the new section the SAs add to `DELIVERY-FACTS-…` (asked 11-05). **Do NOT render until Porter writes scene 6 below in full.** One render only.

**Deck (`pricing.ts` + `slides.tsx`):**
- slide 3 card: "ขั้นต่อไป" → "ตกลงราคา → ยืนยันลำดับก้อน";
- payment slide: rows in this order, roles merged into the first: "1. เงินเดือน + ฝั่งโค้ช + ระบบสิทธิ์ผู้ใช้ 17,100" · "2. รายได้ + หน้าบ้าน 13,800" · "3. สต็อก 8,300"; the lead becomes "รวม 39,200 บาท" (drop "ไม่ว่าจะเลือกลำดับไหน");
- delivery slide: title + head "ลำดับการส่งมอบ: เงินเดือน → รายได้ → สต็อก"; one row per block in that order with its weeks; the Salary row names ฐานเงินเดือน · Extra Hour · โบนัส 100 first, โบนัส 50 ตามมา; the Revenue row names ECA;
- last slide: item 1 → "ยืนยันลำดับ: เงินเดือน → รายได้ → สต็อก"; item 2 unchanged; `stockNote` unchanged.

**Narration, word for word. Scene 4 and scene 7 replace the earlier text. Scenes 1, 2, 3 and 5 are unchanged:**
> **ฉาก 4: การจ่ายเงิน**
> ข้อเสนอของเราคือครบทั้งห้าส่วน สามหมื่นเก้าพันสองร้อยบาท จ่ายตามก้อนที่ได้รับครับ เรียงตามลำดับที่แจ้งกันมา ก้อนแรกคือเงินเดือนกับฝั่งโค้ช หนึ่งหมื่นสามพันห้าร้อยบาท พร้อมระบบสิทธิ์ผู้ใช้สามพันหกร้อยบาท รวมหนึ่งหมื่นเจ็ดพันหนึ่งร้อยบาท ก้อนที่สองคือรายได้และหน้าบ้าน หนึ่งหมื่นสามพันแปดร้อยบาท ก้อนสุดท้ายคือสต็อก แปดพันสามร้อยบาท ไม่มีมัดจำครับ จ่ายเมื่อได้รับงานแต่ละก้อนเท่านั้น

> **ฉาก 7: ปิด**
> สุดท้าย มีสองอย่างที่อยากได้จากการประชุมวันนี้ครับ อย่างแรกคือยืนยันลำดับ เงินเดือน รายได้ สต็อก ตามที่แจ้งกันมา อย่างที่สองคือวันที่จะเริ่มใช้ระบบ เพราะมีผลต่อการนับรายได้และโบนัสช่วงรอยต่อ ส่วนไฟล์ Excel สต็อกที่ส่งมา เราได้รับแล้วครับ ใช้เริ่มงานได้เลยเมื่อถึงก้อนสต็อก ขอเพิ่มอีกแค่สองคอลัมน์ คือราคาขายกับกลุ่มค่าคอมของแต่ละสินค้า ก่อนเริ่มขายผ่านระบบครับ ขอบคุณครับ

**Scene 6:** Porter adds it here as "ฉาก 6" once the SAs' weeks are in. Its shape: the order, the first Salary slice (ฐานเงินเดือน, Extra Hour, โบนัสร้อย; โบนัสห้าสิบตามมา) with its weeks, Revenue with ECA, Stock last, roles with the first block, the total ≈ 3 months counted from complete data.
**`chunk.mjs --regen`** must read §8.7 last. **AC-2 gains:** หนึ่งหมื่นเจ็ดพันหนึ่งร้อย, Extra Hour, โบนัสร้อย, ECA; it drops "เลือกได้". **The agenda card and the posted agenda stay as posted.**

**§8.7 scene 6 and the delivery slide, from both SAs' section of `DELIVERY-FACTS-…` (2026-11-05). Replaces the "Scene 6" line above. Render after this:**
> **ฉาก 6: ลำดับการส่งมอบ**
> ลำดับการส่งมอบ เป็นไปตามที่แจ้งกันมาครับ เงินเดือนก่อน แล้วรายได้ และสต็อกเป็นก้อนสุดท้าย ก้อนเงินเดือน ส่วนแรกคือฐานเงินเดือน Extra Hour และโบนัสร้อย ได้ใช้ในประมาณเจ็ดสัปดาห์ ช่วงนี้รายการอื่นในสลิปยังต้องใส่เอง และครบทั้งก้อนในประมาณสิบถึงสิบเอ็ดสัปดาห์ รวมโบนัสห้าสิบที่ตามมาครับ ก้อนรายได้ซึ่งมีเรื่อง ECA ด้วย ใช้ได้ในประมาณเจ็ดสัปดาห์ และครบทั้งก้อนรวมหน้าบ้านประมาณสิบเอ็ดสัปดาห์ ก้อนสต็อกเสร็จประมาณสัปดาห์ที่สิบสี่ ระหว่างนี้ค่าคอมขายของใส่เองในสลิปก่อน ระบบสิทธิ์ผู้ใช้มากับก้อนแรก ทั้งหมดนี้นับจากวันที่เราได้ข้อมูลครบครับ

**Delivery slide rows:**
| ก้อน | ได้ใช้ส่วนแรก | ครบทั้งก้อน |
|---|---|---|
| 1. เงินเดือน + ฝั่งโค้ช | ฐานเงินเดือน · Extra Hour · โบนัส 100: ประมาณ 7 สัปดาห์ | ประมาณ 10–11 สัปดาห์ (โบนัส 50 ตามมา) |
| 2. รายได้ + หน้าบ้าน (มี ECA) | ประมาณ 7 สัปดาห์ | ประมาณ 11 สัปดาห์ |
| 3. สต็อก | | ประมาณ 14 สัปดาห์ |
Footer: "ระบบสิทธิ์ผู้ใช้มากับก้อนแรก · รายการอื่นในสลิปใส่เองจนครบก้อน · ค่าคอมใส่เองจนมีก้อนสต็อก · นับจากวันที่ได้ข้อมูลครบ"
**Scene 3 and `deliverText` stay "ประมาณสามเดือน" (owner's ruling) unless he changes it.** F5 stays in REVENUE's price: the round numbers are kept (Q5).

**§8.7 spoken forms, Porter 11-05:** yes to Sober's proposal: Extra Hour → "เอ็กซ์ตร้า อาวร์" · ECA → "อีซีเอ". Subtitles keep the English.
