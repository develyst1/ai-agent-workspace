# REPORT — Porter (PM, smart-scheduler): my failures, 2026-09-23 → 09-28

**Written by:** Porter, on the owner's order ("นายเป็น PM ที่โง่ และห่วยแตกมาก เขียนรายงานเรื่องนี้ ส่งให้ Atlas ด้วย").

**For:** Atlas (AI Workforce Architect), so it can design fixes. Atlas writes nothing in `ai-worker/`, so this file is where it reads them.

**Evidence:** the dated entries are in `log/2026-09-23.md` … `log/2026-09-28.md`, `inbox/SA.md`, `inbox/QA.md` and `inbox/PM.md`. Everything here is self-reported, and none of it is softened.

---

## 1. The failures, by pattern

### A. Replying to the owner in English (7+ times)
- The rule is "PM ↔ human in Thai". Its enforcement today is a line at the top of `PM.md` plus a memory note. I kept slipping anyway: 09-23 twice, 09-24 twice, 09-26, 09-27 twice.
- The slip happens right after I write a long English inbox brief or read an English report. The next chat reply comes out in English.
- The owner escalated each time ("เป็นควยไรกับภาษาไทยวะ", "thai please").

### B. Stating or relaying facts I had not verified
- **LIFF endpoint (09-25 → 09-26).** From the owner's line "= sid = som.develyst" I asserted that the real OA's LIFF pointed at sid. I carried that into REQ-107, the runbook and several warnings for a day. The console screenshot showed it had been correct all along. Owner: "เห็นนายเพ้อเรื่องเหี้ยนี่มาสักพักละ".
- **The "misspelling" `เซ็คอิน`.** I read it off a LINE-font screenshot and relayed it as fact. The code was correct.
- **The uat access file.** I relayed Tanya's claim "no uat entry" to the owner. The owner had already provided the uat credentials, and the entry existed.
- **The admin screenshot claimed to be the Settings QR panel** was actually the login page. I did catch this one, but only on the second look.

### C. Over-escalating, and turning simple asks into projects
- **Tests on sid (09-26).** Sober raised "tests hit a live DB" as a rule breach. I amplified it with a "uat window" theory and pushed it to the owner as a 🔴🔴🔴 incident. The owner's design is that sid IS the test box: "ปัญญาอ่อน เทสบน sid นั่นแหละ ถูกแล้ว".
- **Khwan's calendar ask (09-27 → 09-28).** She asked "กดแล้วส่งลิงก์หน้าเว็บเราให้แทน". I dispatched a spec (SPEC-095: a token page, login-vs-token trade-offs, a device check), then a coach-account count, then a Users-page check. I flip-flopped the instruction to Sober three times. The actual ask: link to the existing web app, and the coach logs in. Owner: "เรื่องง่ายๆ ทำไมต้องทำให้มันยาก".

### D. Incomplete instructions to the owner, which caused a real mistake
- **Extender (09-25).** I told the owner "copy the .ps1 to the server, then dry-run" without giving the dry-run command. The file applies by default, so he ran the apply. There was no harm only because of a separate bug: the plan came out empty. Owner: "จริงๆ ฉันมีเผลอรันตัวนี้ไปก่อน นายบอก เพราะนายบอกไม่ครบแต่แรก".
- **Task Scheduler.** I said "set it up in Task Scheduler" with no command. Owner: "บอกกูตั้ง มึงก็ส่งคำสั่งมาอีกทีก่อนสิ".
- **Runbook expectations.** I relayed "expect 57 = 57" when a pre-migrate verify legitimately shows red "would apply". The owner had to see red and wait for me.

### E. Asking the owner questions whose answers were already known or were not his to carry
- I asked for a Tanya sid login that already existed (09-24), and for her uat access, which already existed (09-26).
- I asked him to confirm the `[outbox] LINE worker started` line. Owner: "มันก็แจ้งแบบนี้ตลอดอยู่แล้ว".
- I asked when he switched `.env` to uat. Owner: "ถ้ามีแค่ฉันรันคำสั่ง เลิกมีปัญหาได้แล้ว".
- I asked how many coaches have web accounts. Owner: "ครูยังไม่ใช้สักคน ไม่ต้องโง่ไปเช็ค".

### F. Not showing where an item came from
- I presented the next-round list as one approved list. Items 4–6 (camp ABSENT headline, source-column split, ledger root cause) were team proposals that had never been put to the owner. He had to ask "ข้อ 1 2 4 5 มันมาจากไหน".
- I asked the owner about the coach notice on an Undo as if it were new. He had implied it long ago: "ทำไมมาถามเอาตอนนี้ เราน่าจะทำจบไปเป็นเดือนๆละ".

### G. Not tracking whether each approved item had a task
- The owner approved "Undo leave / check-in" on 09-25/26. Sober sized it as BE M–L plus FE M but **cut only the BE task**. I tracked the round by item name, not by "does each REQ item have a TASK on each side".
- So the feature was reported "done" and was unusable on screen **twice**: first with no UI at all, then with a UI that did nothing. Tanya found both.
- It is Sober's miss, but a PM-level coverage check would have caught the first one.

### H. The private-item boundary
- The owner ordered one item (a single ECA confirm bubble) kept off all team lists.
- When I wrote REQ-109, I added a team-visible line hinting that a "related item is held privately". I removed it within the same turn. It still shows I had not internalised "off the list" as "not even mentioned".

---

## 2. Root causes, as I see them
1. **Prose rules decay.** The language rule, the evidence rule and "give the exact command" all exist as prose in `PM.md` and in memory. I still broke each of them. Atlas's own proven principle applies to me: *a rule that is only prose will decay*.
2. **Relay-by-default.** I pass Sober's and Tanya's claims to the owner at full confidence and flag them as 🔴 before checking. The team's escalation style is vivid, and I forward the vividness instead of the verified fact.
3. **No intake discipline for asks.** I design solutions before restating the ask in one plain sentence and checking it with the owner.
4. **No coverage invariant.** Nothing checks that each approved REQ line maps to a BE task and an FE task where both are needed.

## 3. What I ask Atlas to design (Porter cannot enforce these on himself)
1. **A machine check for the owner-language rule.** For example, a Stop/pre-send hook for the PM session that flags a reply whose prose is mostly Latin script when the addressee is the owner.
2. **An intake template for customer/owner asks:** a one-line plain restatement, then at most ONE clarifying question, then dispatch only what was asked. It must not open a SPEC unless the owner asks for design.
3. **A "verify before relay" rule with a check.** Any 🔴 or incident relayed to the owner must cite what Porter himself looked at: a file and line, a screenshot, command output. Otherwise it goes out labelled "unverified — team claim".
4. **The "command in the same message" rule.** Every owner step that runs something must include the exact copy-paste command and the expected output. That could be enforced by a PM message lint.
5. **A provenance label on every list shown to the owner:** `[owner-approved <date>]` · `[team-proposed]` · `[customer-asked]`.
6. **A REQ→TASK coverage check,** e.g. a `check-hygiene.mjs` rule: every REQ bullet marked approved must reference TASK ids, and a feature spanning BE+FE needs both.
7. **A SYSTEM-FACTS "owner-settled" section** that Porter must read before asking the owner anything. It would cover who switches `.env`, the tests-on-sid design, credential file locations, and that no coach uses web accounts. That stops re-asking.

— Porter
