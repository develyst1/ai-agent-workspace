# TEST-122: full-loop rehearsal on a new product, through the screens only — "สมุดรายจ่ายประจำวัน"
- Source REQ: REQ-124 (QA first; the SAs get its findings) · + Porter's add-on (GO 2026-10-31 00:2x): the clean-blue "✓" button after the fonts went back to Google
- Status: **Round 2: TEST_PASSED** (2026-10-31 03:18, Tanya — the owner's finish line met; REQ-125 AC-4 PASS; REQ-126 AC-5 PASS; new DEF-2 for REQ-126 req 3, see § Round 2) · Round 1: **TEST_FAILED** (2026-10-31 00:54, Tanya) — AC-3 (watch items still happen: 4 cards reached review with no note; the BE routed its server cards through the FE); AC-1, AC-2, AC-4 PASS; 5 findings
- Environment: local (this machine), standard ports 4200 / 3100 / 4500 / 3500, the product on :3920 · **live `claude` 2.1.314** (`CLAUDE_BIN=/home/box/.local/bin/claude`, logged), default worker settings · Blueprint gateway = refusing stub (2 `GET /models` from the new-project dialog's model picker; **0 chat calls**) · 1 live run (of ≤ 2) · `free -m` 8,749 MB before the run
- Tested: 2026-10-31 00:33–00:54 by Tanya · harness `tests/harness/test-124/` (named after the REQ; the TEST number came from `new-id.mjs`) · stop order 23:34 obeyed; GO verified in DECISIONS 2026-10-31 00:2x (owner 00:24)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 00:35 and the verdict 00:54 — **the same**; all four committed and clean; run from exports of HEAD — the REQ-123 B work is not in them):
  - `tree-fp blueprint-back HEAD 08e1e4d fp c51f8477e700 (157 paths)` · `tree-fp blueprint-front HEAD 6a64527 fp 3a86ddf81dbf (305 paths)`
  - `tree-fp caw-back HEAD 2426d9a fp e1be4e88f4d1 (252 paths)` · `tree-fp caw-front HEAD a009d2c fp 3ce60b3d3217 (146 paths)`

## The product (written down first, 00:34, `test-124/spec.txt` — the owner's words)
สมุดรายจ่ายประจำวัน — เว็บหน้าเดียวไว้จดรายจ่ายของแต่ละวัน · 1. ใส่รายจ่าย (จำนวนเงิน หมวด อาหาร/เดินทาง/ของใช้/อื่นๆ หมายเหตุ ปุ่ม "บันทึก") · 2. รายการของวันนี้ ล่าสุดอยู่บนสุด พร้อมเวลา · 3. ยอดรวมวันนี้ และแยกตามหมวด · 4. ลบได้ ถามยืนยันก่อน · 5. เก็บในไฟล์ JSON ปิดเปิด server ข้อมูลยังอยู่ · 6. จำนวนเงิน > 0 ผิดขึ้นข้อความไทย ไม่บันทึก · 7. :3920 ไม่ login ไม่มีฐานข้อมูล ข้อความไทยทั้งหมด · ไม่ทำ: หลายผู้ใช้, กราฟ, ส่งออก, แจ้งเตือน, deploy. (Not Health Board: a form, a server API, a data file, a confirm dialog, validation.)

## The loop, as the owner (every step through a screen; QA's API use = reads only, to notice state)
| Step | Screen | What happened |
|---|---|---|
| 1 | Blueprint home: "+ โปรเจกต์ใหม่" → name, theme, "สร้าง" | project created (clean-blue); the dialog offers 4 theme choices (`create-dialog.png`) |
| 2 | requirements page: "เพิ่ม requirement" ×9 | the title, 7 points and "ไม่ทำ", verbatim; every point shows on the page (`ac1-requirements.png`) |
| 3 | ready page: "ใส่ป้าย version" | v1 by โด่ง |
| 4 | "ส่งไปสร้างที่ CAW" → CAW board → "ใช้ทีมเริ่มต้น" → folder `expense-124` | 5 seats; workspace set |
| 5 | CAW chat: "ช่วยสร้างสมุดรายจ่ายประจำวันตาม spec ทั้งหมดให้หน่อย" | ปลา (opus) proposed **8 cards, one per requirement, right roles** (server ×3 → แบงค์, page ×4 → ฝน, test → มิ้นท์); only "ไม่ทำ" uncovered — then **4 questions** in a second message 10 s later → **F-1** |
| 6 | "ตามนั้น" on question 1 → "ตกลง เริ่มงาน" | 8 cards; ปลา's reply then left a **second open proposal** → **F-2** |
| 7 | "อัตโนมัติ", 30 | one run: 11 card hops + 2 chat hops, 12 min 39 s, all 8 cards done, "รอคุณ — ไม่มี", `nothing_workable` (true) |
| 8 | each card in "รอตรวจ" → its card page → "สถานะ" → "เสร็จ" | **8 reviews, all through the card screen** (`reviewer.mjs`, `review-card-N.txt/.png`) |
| 9 | the product's README: `node server.js` → http://127.0.0.1:3920 | runs; checked by hand below |

## Cases

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | **AC-1** point 1 | added 120 อาหาร "ข้าวมันไก่", 45 เดินทาง "รถเมล์", 89.50 ของใช้ "สบู่" through the form → all three listed (`product-3-added.png`) | works |
| 2 | AC-1 point 2 | order สบู่ → รถเมล์ → ข้าวมันไก่ (latest on top), each with "00:51 น." | works |
| 3 | AC-1 point 3 | "รวมทั้งหมด 254.50 บาท · อาหาร 120.00 · เดินทาง 45.00 · ของใช้ 89.50 · อื่นๆ 0.00" | works |
| 4 | AC-1 point 4 | "ลบ" → confirm "ต้องการลบรายการนี้ใช่ไหม? ของใช้ 89.50 บาท (สบู่)"; cancel → stays; OK → gone (`product-after-delete.png`) | works |
| 5 | AC-1 point 5 | `data/expenses.json` holds the 2 entries; QA stopped the server (pid) and started it again per the README → both still listed, the deleted one still gone (`product-after-restart.png`) | works |
| 6 | AC-1 point 6 | 0, -5, "abc", empty → "จำนวนเงินต้องมากกว่า 0" each time, nothing saved (`product-bad-amount.png`) | works |
| 7 | AC-1 point 7 | :3920, no login, no English word on the page | works |
| 8 | **AC-2** | owner steps beyond the flow and the reviews the system asked for: **0** — no guess, no wait, no hand fix, no question to the team. The two places the owner was decided for (F-1) or confused (F-2) are findings, not interventions | PASS (count 0) |
| 9 | **AC-3** notes | cards' last note in review: #1, #2, #3 (แบงค์), #8 (มิ้นท์) say what was done **and how to try it** ("รัน: … node server.js → เปิด http://127.0.0.1:3920"; curl lines; a full test list); **#4, #5, #6, #7 (ฝน) — no note at all**: the owner reviewed 4 of 8 cards blind → **F-3** (TEST-119 O-3 watch: not fixed in these HEADs) | **FAIL** |
| 10 | **AC-3** roles | the work stayed with the right role (แบงค์ wrote `server.js` on #1–#3; ฝน wrote `public/*` on #4–#7; มิ้นท์ tested on #8) — but **แบงค์ handed each of its 3 server cards to ฝน**, who only moved it to review (3 extra hops, no file written) → **F-4** (TEST-119 O-1 / TEST-121 O-2 watch: not fixed in these HEADs) | **FAIL** |
| 11 | AC-3 (REQ-122) | open workers: แบงค์ 3 tasks in one session (`8557697f`); ฝน 5 tasks in `0d3994eb` then restarted on the rule "it has done 5 tasks" (2 more in `25de1086`); มิ้นท์ 1 — 1 restart, by the task limit | (as designed) |
| 12 | **AC-4** | after QA stopped everything: no port held, no runner, no `--input-format` worker left (`ps`); memory 5,094 → 6,443 MB available | PASS |
| 13 | add-on | the clean-blue "✓" confirm button after the fonts went back to Google: font `Anuphan`, the **check mark is back** (3× zoom `out/tick-now.png` = TEST-120 r2's "before") — TEST-120 DEF-2 gone with the revert | PASS |

## Findings (for the PM to route; no fix proposed)
- **F-1 — one "ตามนั้น" marked all four of ปลา's questions answered — MAJOR.** Screen: CAW chat. ปลา's second message held 4 questions (stack; "วันนี้" = Bangkok time; decimals up to 2; note optional ≤ 100 chars). The owner pressed "ตามนั้น" on question 1; the chat then showed **all four "ตอบแล้ว"**, with only question 1's answer text, and "ตกลง เริ่มงาน" became enabled — the owner never saw or chose the defaults of questions 2–4 (`ac2-after-answer.png`, `chat` messages). Expected: each question is answered on its own; the button waits for all.
- **F-2 — after the answer, ปลา posted a second open proposal (the same 8 items) after the cards already existed — MINOR.** Screen: CAW chat. Proposal `…f459` stays open beside the accepted one; an owner could press "ตกลง เริ่มงาน" twice. Seen before (TEST-106 phase 2 "Also seen").
- **F-3 — 4 of 8 cards reached review with no note (ฝน's page cards #4–#7) — MAJOR for the loop** (AC-3; TEST-119 O-3 watch). The owner cannot tell what was done or how to try it.
- **F-4 — the BE handed each finished server card to the FE, who only moved it to review — MINOR** (AC-3; TEST-119 O-1, TEST-121 O-2 watch): 3 extra hops; the FE "reviewed" BE work.
- **F-5 — the QA worker left a 58 MB Chrome profile (`qa-tmp-profile/`, 32 entries) in the product folder — MINOR.** It deleted its own temp scripts but not this; it would ship with the product. QA did not touch it (no file edits in the product folder).
- Observation: no `package.json` this time; the README says `node server.js` — enough to run.

## Live-run ledger
1 run · 13 hops with usage (opus 3: chat ×2 + มิ้นท์; sonnet 10: แบงค์ ×3, ฝน ×7) · **≈ 47.5 k out** · 00:38–00:51 · gateway 0 chat calls · no limit signal · memory: 8,749 MB before, lowest reading 4,363 MB (00:50), never below 3 GB.

## Test data created
| What | Where | End state |
|---|---|---|
| Blueprint project "สมุดรายจ่ายประจำวัน" | `pglite:memory` (:4200) | gone: stopped |
| CAW project, 8 cards, 13 hops | `pglite:file` in QA scratch `t124/run-caw` | left on disk, unserved |
| the product | `/workspace/caw-workspaces/expense-124` (with its `data/expenses.json` holding QA's 2 test entries, and F-5's folder) | left, as evidence |
| servers 4200 / 3100 / 4500 / 3500 / 3920 / 4396, runner, open workers | this machine | stopped; `ss`/`ps` clear 00:54 |
| scripts, outputs, screens, traces | `tests/harness/test-124/` | left, as evidence |

## Verdict
**`TEST_FAILED`** — on AC-3 only: in a full loop on a new product, 4 of 8 cards reached review with no note (F-3) and the BE routed its server cards through the FE (F-4) — the two watch items are still there in these committed HEADs (DECISIONS 00:2x lists their fixes as decided, not yet in the code tested). **AC-1 PASS** — the team built a product it had never seen, from a hand-typed spec, through the screens only, and **all 7 points work** by hand; **AC-2 PASS** — 0 owner interventions beyond the flow; **AC-4 PASS**. Findings F-1 (MAJOR: one "ตามนั้น" answered four questions), F-2, F-5 for the PM. The ✓ button is right again. **Tested trees (tree-fp.sh, same 00:35 and 00:54):** blueprint-back 08e1e4d `c51f8477e700` · blueprint-front 6a64527 `3a86ddf81dbf` · caw-back 2426d9a `e1be4e88f4d1` · caw-front a009d2c `3ce60b3d3217`.

## Questions
(none)

---

## Round 2 — 2026-10-31 02:56–03:18, "สมุดยืม-คืนหนังสือในออฟฟิศ" (REQ-124 § Round 2)
- Build under test (`tree-fp.sh`, start 02:57 and verdict 03:18 — **the same**; all four committed, 0 uncommitted; run from `git archive HEAD` exports): blueprint-back **08e1e4d `c51f8477e700`** · blueprint-front **6a64527 `3a86ddf81dbf`** · caw-back **5b49f65 `32a65f35c337`** · caw-front **7f68c42 `f91e9b59a4f2`** (`test-124/r2/out/tree-fp-start.txt`, `tree-fp-end.txt`)
- Environment: as round 1 — ports 4200 / 3100 / 4500 / 3500, product on :3930 · live `claude` 2.1.314 (`CLAUDE_BIN=/home/box/.local/bin/claude`), default worker settings · gateway = refusing stub, **1 call** (`GET /models` from the new-project dialog), **0 chat calls** · **1 live run** (of ≤ 2) · `free -m` 10,444 MB before the run
- Harness `tests/harness/test-124/r2/` (round 1's scripts with the new product's name and text; `accept-q2.mjs` answers each question with its own "ตามนั้น", no reload; `product-check.mjs` rewritten for this product; `press-second.mjs`)
- The product, written down first (02:56, `r2/spec.txt`): a page to see which office book is with whom — 1 add (title, author, "เพิ่มหนังสือ") · 2 list with "ว่าง"/"ถูกยืม" and the borrower · 3 borrow: name → borrowed, with the date · 4 return, confirm first · 5 search title/author, filters as you type · 6 JSON file, survives a restart · 7 title and borrower must not be empty, Thai message, nothing saved · 8 :3930, no login, no database, Thai only · not: overdue alerts, branches, export, deploy

### The loop, as the owner (screens only)
| Step | What happened |
|---|---|
| 1–3 | Blueprint: new project → 10 requirements typed by hand (title, 8 points, "ไม่ทำ") — each shown on the page → label v1 |
| 4 | "ส่งไปสร้างที่ CAW" → "ใช้ทีมเริ่มต้น" (5 seats) → folder `books-124r2` |
| 5 | chat: "ช่วยสร้างสมุดยืม-คืนหนังสือในออฟฟิศตาม spec ทั้งหมดให้หน่อย" → ปลา: **9 cards** (server ×3 → แบงค์, page ×5 → ฝน, test → มิ้นท์) + **2 questions** in the same message (author required? · borrow date format) |
| 6 | **"ตามนั้น" on question 1 → only question 1 marked** (`[true,false]`), "เหลืออีก 1 ข้อ"; "ตามนั้น" on question 2 → **one** message "ข้อ 1: ไม่บังคับ ปล่อยว่างได้\nข้อ 2: แสดงเป็นวันที่แบบไทย เช่น 31 ต.ค. 2569 ไม่มีเวลา" (`r2-questions-answered.png`) → "ตกลง เริ่มงาน" → 9 cards. ปลา's reply to the answers posted **a second plan** for the same work → DEF-2 |
| 7 | "อัตโนมัติ", 30 → one run: **9 hops**, 10 min 49 s, all 9 cards done, "รอคุณ — ไม่มี", `nothing_workable` (true); tokens in 4,504,492 / **out 36,057** (run report; traces: 11 results, 44,784 out incl. chat) |
| 8 | each card in "รอตรวจ" → its card page → "สถานะ" → "เสร็จ": **9 reviews through the card screen** (`reviewer.out`) |
| 9 | `node server.js` → http://127.0.0.1:3930, checked by hand (below) |

### Cases
| # | AC | Actual | Result |
|---|---|---|---|
| 1 | **AC-1** pt 1 | 3 books added through the form (one with no author) → all listed with authors (`product-3-added.png`) | works |
| 2 | AC-1 pt 2 | rows show "ว่าง" / "ถูกยืม" and "ผู้ยืม: วิภา" | works |
| 3 | AC-1 pt 3 | "ยืม" → "ชื่อคนยืม" + "ยืนยันการยืม" → "ถูกยืม", borrower and the borrow date (`product-borrowed.png`) | works |
| 4 | AC-1 pt 4 | "คืน" → confirm "ยืนยันการคืนหนังสือ "…" จาก วิภา …"; cancel → still borrowed; OK → "ว่าง" | works |
| 5 | AC-1 pt 5 | "สุดา" (author) → only her book; "เวลา" (title) → only that book; as you type | works |
| 6 | AC-1 pt 6 | `data/books.json`; QA stopped the server (pid) and started it again → all books, and "ถูกยืม · ก้อง", still there (`product-after-restart.png`) | works |
| 7 | AC-1 pt 7 | empty title → "กรุณาใส่ชื่อหนังสือ", not saved; empty borrower → "กรุณาใส่ชื่อ…", the book stays "ว่าง" | works |
| 8 | AC-1 pt 8 | :3930, no login, **no English word** on the page | works |
| 9 | **AC-2** | owner steps beyond the flow and the reviews it asked for: **0** | PASS |
| 10 | **AC-3 / REQ-125 AC-4** notes | **9 of 9** cards reached review with a note holding **both** "ทำแล้ว:" and "ลองได้โดย:" (round 1: 4 had none) | PASS |
| 11 | **AC-3 / REQ-125 AC-4** roles | each card worked by its own role in **one hop**: แบงค์ #1–#3 (`server.js`), ฝน #4–#8 (`public/index.html`), มิ้นท์ #9 (test) — **no BE → FE hand-off**, no card closed without work (round 1: 3) | PASS |
| 12 | **REQ-126 AC-5** questions | 2 questions answered one by one on the live chat; one message with each answer | PASS |
| 13 | **REQ-126 AC-5** junk | the finished folder holds only `server.js`, `public/index.html`, `data/books.json` (QA's test data). The workers' scratch scripts went **outside**: ฝน `…/worker-…/tmp/check.js`, มิ้นท์ `…/worker-…/tmp/test.js` (traces). TEST-124 DEF-1 and O-1 did not arise in this run | PASS |
| 14 | REQ-126 req 3 | the second open plan (9 items, **reworded titles and other anchors**, e.g. "ตั้ง server ที่ 127.0.0.1:3930 และเก็บข้อมูลในไฟล์ JSON") kept a live "ตกลง เริ่มงาน" and no "แผนนี้ตกลงไปแล้ว" after the first was accepted; QA pressed it as the owner could → **cards 9 → 18**, #10–#18 the same work again (`r2-second-plan-pressed.png`) → **DEF-2** | **FAIL** (REQ-126) |
| 15 | **AC-4** | after QA stopped everything by pid (runner, 3 open workers, 6 servers): `ss` clear, no runner / `--input-format` worker / `next start` left; memory back to 8,402 MB | PASS |

### Defects
**DEF-2 — after the answers, ปลา posts a reworded plan for the same work, and it can be started again — MAJOR (REQ-126 req 3).** Repro: a chat with questions → answer them → accept the plan → ปลา's reply posts a second plan for the same requirements with slightly reworded titles / regrouped anchors → it shows "ตกลง เริ่มงาน" (enabled) → press → a second set of cards for the same work. Expected (REQ-126 req 3): "Once a plan is accepted, no second open plan for the same work can be accepted." Actual: the copy check matches only **identical** titles + anchors (REQ-126 § design (c)); a live reword slips through. Round 1's F-2 was the identical case; that one is now caught (TEST-124 case 4–5).

### Observations
- Memory: lowest reading **2,555 MB at 03:07:10** (under 3 GB from 03:06:49, ≥ 21 s, `r2/out/procs.log`, 3 s samples); the 3 open workers held ≈ 250 MB each, so the rest was a worker's own tool run. QA's check at 03:10 read 6.6 GB and the run went on. The pre-run check (10,444 MB) was the rule; the dip is noted, not breached.
- The 9 extra cards from case 14 are left `todo` in this test project (no run started).

### Live-run ledger
1 run · 9 card hops + 2 chat hops · ≈ 44.8 k out · 03:01–03:12 · gateway 1 `GET /models`, 0 chat calls · no limit signal.

### Test data created
| What | Where | End state |
|---|---|---|
| Blueprint project "สมุดยืม-คืนหนังสือในออฟฟิศ" | `pglite:memory` (:4200) | gone: stopped |
| CAW project, 18 cards (9 + DEF-2's 9), 11 hops | `pglite:file` in QA scratch `t124r2/run-caw` | left on disk, unserved |
| the product, with QA's test books in `data/books.json` | `/workspace/caw-workspaces/books-124r2` | left, as evidence |
| servers, runner, open workers, product :3930 | this machine | stopped by pid; clear 03:18 |

### Verdict (round 2)
**`TEST_PASSED`** — the owner's finish line: a product the team had never seen, from a hand-typed spec, built through the screens only, **0 owner interventions**, **all 8 points work** by hand, **every card reviewable from its note** (9/9 both parts), every card worked by its own role. **REQ-125 AC-4 PASS** (F-3, F-4 gone). **REQ-126 AC-5 PASS** (questions one by one; no worker junk in the product). One new defect for REQ-126: **DEF-2 MAJOR** — a reworded second plan can still start the same work again. **Tested trees (tree-fp.sh, same 02:57 and 03:18):** blueprint-back 08e1e4d `c51f8477e700` · blueprint-front 6a64527 `3a86ddf81dbf` · caw-back 5b49f65 `32a65f35c337` · caw-front 7f68c42 `f91e9b59a4f2`.

