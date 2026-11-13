# SPEC-002: Lesson pages for classes 01–04 and the bonus hour, built around one growing bill calculator
- Source: REQ-002
- Status: ACTIVE, 2026-11-12. The language and format rest on SPEC-001 §2–§3, which are still AC-1 for the owner. If he
  changes either, §2 and every TASK here change.
- Author: the SA, 2026-11-12

## What I read

REQ-002 (READY_FOR_SA, 2026-11-12) · `talks/2026-11-12-learner-fastwork-chat-summary.md` ·
`talks/SA-SPEC-001-8-hour-shape-option-2026-11-12.md` · SPEC-001 revision 2 · `DECISIONS.md` (6 lines) ·
`code-class-docs` on disk (main @ `54e1529`, README only).

## Overview

Over the four evenings the learner builds **one program: a shop bill calculator** (`โปรแกรมคิดเงิน`). They asked for a
"โปรแกรมคำนวณ" and for something they could picture. It grows once per class, and every version runs.

| Class | The program after this class (`bill_v1..v4.py`) |
|---|---|
| 01 | asks the price and quantity, and prints the total |
| 02 | applies discount tiers and serves customers one after another until 0 is typed |
| 03 | split into functions; keeps the history of bills and prints a summary at the end (count, sum, largest, sorted) |
| 04 | survives bad input (asks again), and splits a bill between friends, a feature built with AI |

**Every page follows the same shape** (§1), so the owner teaches from one page and the learner can redo it alone.

## 1. Page shape: every lesson page, in this order

`classes/NN-…/README.md`, replacing TASK-001's placeholder:

1. `# คลาส NN — <topic>` and **เป้าหมาย**: the schedule row's "เรียนจบคลาสนี้แล้วคุณ…" line.
2. **ทวนคลาสที่แล้ว** (02–04): 3–5 lines, plus the previous program file.
3. **โจทย์วันนี้**: the problem in one or two sentences, in shop terms.
4. **ขั้นตอน 1-2-3**: the solution as numbered steps in plain Thai, with no code. **It comes before any code** (REQ-002 AC-5).
5. **แปลงเป็นโค้ด (Python)**: one step at a time. Each code block is followed by **ผลที่ได้**: the exact input typed
   and the exact output (AC-2). New words get a one-line explanation the first time they appear (Requirement 6).
6. **เรื่องเดียวกันใน JavaScript**: the same logic, read and run only. It uses **fixed values instead of typed input**,
   because input in Node needs code beyond class 01's level. It runs with `node` and its output is shown.
7. **แบบฝึกหัด**: at least one exercise, each with its input and the expected result (AC-3). Answers sit in a
   collapsed `<details>` block under the exercise; GitHub and the VS Code preview both render it.
8. **ช่วงใช้ AI**: the exact prompt to copy, and what to check in the AI's answer before trusting it.
9. **สรุป** in 3 lines, plus links to the example files and back to the schedule.

Example files sit beside the page: `classes/NN-…/examples/bill_vN.py` and `bill_vN.js`, each the **complete** program
at the end of that class. They run from the repo root:
`python programming-basics-ai/classes/NN-…/examples/bill_vN.py`.

**Writing:** the FE writes the Thai prose from this SPEC, and the PM reviews the words before QA runs (REQ-002
§ User-facing wording). `Interpreted:` REQ-002 says "the SA's draft wording". The SA designs content and code
behaviour here, and the FE turns it into page text. The FE's "no invented copy" rule is covered by the PM's review of
the page. This needs no new decision, only the PM's review step.

## 2. Tools (class 01 install, REQ-002 AC-6)

- **VS Code** (code.visualstudio.com) · **Python 3.12 or newer** (python.org) · **Node.js LTS** (nodejs.org).
- Windows: in the Python installer, **tick "Add python.exe to PATH"**. Typing `python` before installing opens the
  Microsoft Store; the page says so. Check: `python --version` and `node --version` in the VS Code terminal.
- Mac: `python3 --version` (the Mac command is `python3`, not `python`). The page shows both forms.
- **Program output is Thai.** When output is piped (the QA's and FE's evidence runs, not the learner's typing), Windows
  may not print Thai. Evidence commands set `PYTHONIOENCODING=utf-8`; see each TASK's DoD.

## 3. Content per class: the contract the pages and files must meet

Money is printed with 2 decimals and the word บาท (`{x:.2f}` / `.toFixed(2)`). Prompts and messages below are the exact
strings, and the PM may reword them at review. The expected results are **the SA's hand calculation**: the FE's run
must match, and a mismatch is a `## Questions` entry, not a silent fix.

### Class 01 — from steps to a program (`01-from-steps-to-program`)
- Ideas: a program is steps the computer follows in order · `print` · variables · text vs number (`input` always gives
  text; show `"50" * 2` → `5050` as the reason for `float()`/`int()`) · f-string.
- Steps 1-2-3: ① ask the price per item ② ask how many ③ multiply ④ show the total.
- `bill_v1.py`: prompts `ราคาต่อชิ้น (บาท): `, `จำนวนชิ้น: `; prints `ยอดรวม <total> บาท`.
  Input `50`, `3` → `ยอดรวม 150.00 บาท`.
- `bill_v1.js`: `price = 50`, `qty = 3` → `ยอดรวม 150.00 บาท`.
- Exercise 1 (code): also ask `รับเงินมา (บาท): ` and print `เงินทอน <x> บาท`. Input `50`, `3`, `200` → `เงินทอน 50.00 บาท`.
- Exercise 2 (steps only, no code): write steps 1-2-3 for "split a bill equally between friends". Answer: ① ask the total
  ② ask how many people ③ divide ④ show each person's share. Class 04 builds this.
- AI: paste `bill_v1.py` and ask "อธิบายโค้ดนี้ทีละบรรทัดเป็นภาษาไทยสำหรับมือใหม่". Check it against what was learned.
  Never paste a password, personal data or work code into an AI chat.

### Class 02 — decisions and repetition (`02-decisions-and-repetition`)
- Ideas: comparison · `if` / `elif` / `else` · `while` and `break` · `for` with `range` · tracing a loop by hand in a table
  (one row per round, one column per variable). That table is the algorithm habit the learner asked for.
- Steps: ① ask the price (0 = close) ② ask the quantity ③ total ④ total ≥ 1000 → 10 % off; ≥ 500 → 5 % off; else none
  ⑤ show the total, discount and amount to pay ⑥ back to ①.
- **From v2 onward, the price prompt is `ราคาต่อชิ้น (บาท, 0 = ปิด): `** `[SA-decided 2026-11-12, TASK-003 Q1; PM may reword]`.
  The person at the keyboard has to see how to stop. v1 keeps `ราคาต่อชิ้น (บาท): ` because it has no loop.
- `bill_v2.py`, input sequence `300`,`2` · `1000`,`1` · `60`,`2` · `0` → per customer `ยอดรวม 600.00 บาท · ส่วนลด 30.00 บาท ·
  ต้องจ่าย 570.00 บาท`, then `… 1000.00 … 100.00 … 900.00`, then `… 120.00 … 0.00 … 120.00`, then `ปิดโปรแกรม`.
- `bill_v2.js`: one fixed total of `600` through the same `if` chain → `ต้องจ่าย 570.00 บาท`, plus a `for` loop
  printing `ลูกค้าคนที่ 1`…`ลูกค้าคนที่ 3`.
- Exercise 1: add a tier, total ≥ 2000 → 15 % off. Input `2000`,`1`,`0` → `ต้องจ่าย 1700.00 บาท`.
- Exercise 2 (trace): fill the trace table for the loop with inputs `300`,`2` then `0`. The answer table is in `<details>`.
- AI: ask "ควรลองป้อนตัวเลขอะไรบ้างเพื่อทดสอบส่วนลดของโปรแกรมนี้". Check that the answer includes the edges `499`/`500`/`999`/`1000`
  (as totals). If it misses them, that is the lesson.

### Class 03 — functions, lists and basic algorithms (`03-functions-lists-algorithms`)
- Ideas: `def` with `return` · lists · `append` · **by hand first, built-in second**: sum (start at 0, add each), largest
  (keep the best so far), search (check each), sort (by hand with numbers on paper, then `sorted`).
- Steps: v2's loop, but each bill's amount to pay goes into `history`. On `0`, print the summary.
- `bill_v3.py` has at least the functions `calc_discount(total)` and `summary(history)`. Same inputs as class 02 → the
  three customers as before, then `จำนวนบิล 3 · รวม 1590.00 บาท · บิลสูงสุด 900.00 บาท`, then
  `เรียงจากน้อยไปมาก: 120.00, 570.00, 900.00`.
- `bill_v3.js`: `const history = [570, 900, 120]`. Sum and largest are done by loop, and the sort uses `(a, b) => a - b`.
  Show why: without it, JavaScript sorts numbers as text, so `[100, 20, 3].sort()` gives `[100, 20, 3]`. Same idea,
  different trap.
- Exercise 1: write `my_min(history)` by loop. `[570, 900, 120]` → `120`.
- Exercise 2: write `has_bill(history, amount)`. Searching `900` → `พบ`; `50` → `ไม่พบ`.
- AI: ask the AI to trace `my_max` on `[570, 900, 120]` step by step, then compare with your own trace table.

### Class 04 — finding mistakes, then building with AI (`04-fixing-and-building-with-ai`)
- Hour 1, ideas: reading a Python traceback (last line first, then the line number) · `ValueError`, `NameError`,
  `TypeError`, `SyntaxError`/`IndentationError` · the loop *read → guess → print to check → fix* · `try` / `except`.
- Hour 2, building with AI: the feature "หารบิลกับเพื่อน", planned in class 01's exercise 2. ① Write the steps
  ② ask the AI for only that function ③ read it line by line ④ test with a known answer ⑤ put it into the program.
- From v4 on, the quantity and the number of people go through the same `ask_number` (a float), so `2.5` is accepted, as
  for goods sold by weight (2.5 kg). The page says so in one line `[SA-decided 2026-11-12, TASK-005 Q1]`. With no bills
  (`0` typed first), the summary prints zeros and an empty sorted line, and that is accepted `[SA-decided, TASK-004 Q1]`.
- `bill_v4.py` = v3 plus:
  - bad input asks again: typing `abc` for the price prints `กรุณาพิมพ์ตัวเลข` and asks again;
  - after each customer, `หารกี่คน (1 = ไม่หาร): `. A number above 1 prints `คนละ <x> บาท`.
- `bill_v4.js`: `Number("abc")` gives `NaN` with no error (a JavaScript trap), checked with `Number.isNaN`; plus a
  `try`/`catch` around a call to an undefined function, printing its message.
- **Final run, REQ-002 AC-4:** inputs `abc`,`300`,`2`,`1` · `1000`,`1`,`4` · `60`,`2`,`1` · `0` → `กรุณาพิมพ์ตัวเลข` once ·
  `ต้องจ่าย 570.00 บาท` · `ต้องจ่าย 900.00 บาท` then `คนละ 225.00 บาท` · `ต้องจ่าย 120.00 บาท` · the class 03 summary
  unchanged · `ปิดโปรแกรม`.
- Exercise: three short broken snippets, each with its error message (one `NameError` from a typo, one `TypeError` from
  `"ยอด " + 150`, one `IndentationError`). For each: find the line, fix it, and match the expected output in `<details>`.
- AI: hour 2 as above. Also paste the traceback of a broken snippet and ask for the cause, then *prove* the answer by
  running the fix.

### Bonus hour — `extras/bonus-plan-your-own-idea.md`
- Not a class and no new code. It is a one-hour planning sheet for the learner's own idea:
  ① the idea in one sentence ② who uses it ③ steps 1-2-3 of what the program does ④ which class topics each step needs
  ⑤ the smallest first version.
- A worked example: "โปรแกรมบันทึกรายจ่าย", with all five parts filled in.
- AI prompt: "ช่วยแตกไอเดียนี้เป็นขั้นตอนเล็ก ๆ ที่มือใหม่ทำได้ทีละขั้น: <ไอเดีย>". Check: does each step map to a topic from classes
  01–04? Mark the steps that do not as "เรียนเพิ่ม".
- Exercise: the learner fills the five parts for their own idea. There is no fixed answer, so QA checks the worked
  example only.

## Non-functional

- No personal data, and no school/exam wording (REQ-002 AC-7). Example names are generic (ลูกค้า, ร้าน); no person's name.
- All code is plain standard library. No `pip` or `npm` before class 07.

## Tasks

| TASK | Owner | Due (ready the day before teaching) | Depends on |
|---|---|---|---|
| TASK-002 class 01 page + `bill_v1.py/.js` | FE | **2026-11-15** | TASK-001 |
| TASK-003 class 02 page + `bill_v2.*` | FE | 2026-11-16 | TASK-002 |
| TASK-004 class 03 page + `bill_v3.*` | FE | 2026-11-17 | TASK-003 |
| TASK-005 class 04 page + `bill_v4.*` | FE | 2026-11-18 | TASK-004 |
| TASK-006 bonus page | FE | 2026-11-19 | TASK-001 |

Each later program builds on the earlier one, so the order is strict. The FE may run ahead of the dates.

## Risks, assumptions, unknowns

- **Language and format are not yet approved** (SPEC-001 §6 lines 5 and 7). If the owner picks another language, every
  page changes. *Settled by:* AC-1. Class 01 is due 2026-11-15, so the PM should get that line answered first.
- **Thai output when piped on Windows**: inferred from how Python picks its output encoding, not run on this desk.
  *Settled by:* the FE's first evidence run of `bill_v1.py` on Windows, with and without `PYTHONIOENCODING=utf-8`.
- **Two hours per class is assumed enough** for the content above. Class 03 is the fullest. *Settled by:* the owner's
  read at REQ-002 AC-1, as the teacher.
- **The learner's computer** (Windows or Mac) is unknown. Both are written for; only Windows is tested (REQ-002 AC-6).

## Questions

*(none for the PM; the language/format dependency is in Risks.)*
