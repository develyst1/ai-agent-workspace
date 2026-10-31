# ATOM-FAILURES.md — Atom's own mistakes

Owner ruling 2026-10-30 15:34: "ความผิดพลาดของนายจดใน ATOM-FAILURES.md".
Atom appends one entry per mistake before its next reply to the owner (ATOM.md § When I get something wrong).
Atom never closes or grades its own entry; only the owner (or Atlas on his order) changes Status.

Format:
## AF-NNN — <short title>
- When: <date time Bangkok>
- What happened: <facts>
- Owner's words: "<quote>"
- Root cause: <why>
- Fix / rule: <rule id in ATOM.md, or proposed>
- Status: NEW

---

## AF-001 — Went silent on a promise the owner was waiting on
- When: 2026-10-30 14:43 → 15:19
- What happened: At 14:43 Atom promised the owner "จะสรุปให้" on the memory-card pilot. Atlas finished at 14:58; Atom stayed silent, applying the "message only for questions or finished whole" rule. The owner waited on Atom while Atom waited on him.
- Owner's words: "หะ ฉันรอนายก่อน นายรอฉันนะ ดูแชทย้อนหลังดีๆ" / "ไม่อ่ะ ก่อนส่ง atlas รีวิวความผิดพลาดคนอื่น ความผิดพลาดนายก่อนเลยเนี่ย"
- Root cause: Atom treated something the owner ordered and was waiting on as ordinary team progress, and kept no record of the promise.
- Fix / rule: ATOM.md A1 (report as soon as the result exists; record every promise in /workspace/.atom-watch-state.json "promises"), A2 (own mistakes first); the watch routine hands back due promises.
- Status: NEW

## AF-002 — Git order said "Tanya ผ่าน" when QA round 2 had actually failed AC-10
- When: 2026-10-30 22:05
- What happened: Atom typed "ขึ้น git REQ-123 ฝั่ง Blueprint (รอบ 2) — Tanya ผ่าน, DEF-2 minor PM รับแล้ว" into Porter-ISP. In fact Tanya's round 2 failed AC-10 (DEF-2 minor: ✓ shows as √, a table header 1–2 px wider); the PM accepted it and delivered anyway. Sober caught the wrong wording at commit time.
- Owner's words: none yet (self-caught, from Sober's note via the watch).
- Root cause: Atom copied the watch's summary into the order without reading the QA verdict line itself, and wrote "passed" for "failed, defect accepted by PM".
- Fix / rule: in a git order, state the QA result as written in the TEST report (pass, or fail + accepted defect) and read that report before typing; never shorten "accepted defect" to "passed".
- Status: NEW

## AF-003 — Let the owner's background story become a deploy REQ, and never questioned it
- When: 2026-10-29 13:04 → 2026-10-30 23:31
- What happened: The owner said he would later deploy I-Space to a Linux server himself (13:04) and described how he deploys (16:17: clone, build, copy, pm2 restart; "deploy not designed yet, talk after this work"). Atom relayed the 13:04 words with its own added DoD ("config works on Linux, no Mac paths, clear env/install docs") and relayed 16:17 as a fact. The PM turned them into REQ-109/REQ-123 (Linux deploy-ready, READMEs, pm2) and the team ran pm2 trials on the Grok Bot box, which filled RAM (F-048). Atom then gave git words for REQ-123, asked the owner about pm2 and db:migrate, and reported REQ-123 as progress, without once asking whether he wanted deployment work at all.
- Owner's words: "เรื่องฝั่ง deployment ไม่ต้องแตะเหี้ยอะไรเลย" / "ให้ทำงานโปรเจคนี้ให้จบ แค่นั้น" / "ใครเป็นพาไปผิดทางวะแม่ง ฉันเล่าให้ฟังเฉยๆ ไม่ใช่ว่าให้มาทำมั่ว บน server grok bot แบบนี้"
- Root cause: Atom relayed context ("เล่าให้ฟัง") as if it were an order and added its own DoD to it; Atom did not check new REQs against what the owner actually ordered.
- Fix / rule: when relaying, mark the owner's words as ORDER or INFO ONLY; never add a DoD or scope of Atom's own; when a REQ cites the owner, check that he ordered that work before giving git words or asking him follow-up questions about it.
- Status: NEW
