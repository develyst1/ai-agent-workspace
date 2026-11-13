# TASK-005: Class 04 lesson page + `bill_v4.py` / `bill_v4.js` (the finished calculator)
- Source: SPEC-002 (§1 page shape, §3 "Class 04") for REQ-002
- Owner: FE (Fern)
- Status: REVIEW (2026-11-12, FE; Python runs UNVERIFIED — same blocker as TASK-002 Q1)
- Due: 2026-11-18 (taught 2026-11-19)
- Depends on: TASK-004
- Git writes: **none**

## What to do

Folder `programming-basics-ai/classes/04-fixing-and-building-with-ai/`: replace `README.md` with the class 04 page
(SPEC-002 §1 order, §3 "Class 04").
- Hour 1 covers reading errors.
- Hour 2 covers building the split-bill feature with AI, in the five steps the SPEC lists.
- The exercise has three broken snippets with their real error messages: run each, and paste the message Python
  actually prints.

Create `examples/bill_v4.py` and `examples/bill_v4.js`. Exact strings as in the SPEC.

## Definition of Done

Workspace root, Git Bash; paste every command and its output in `## Implementation Notes`.

- [ ] **The final run (REQ-002 AC-4):**
  `printf 'abc\n300\n2\n1\n1000\n1\n4\n60\n2\n1\n0\n' | PYTHONIOENCODING=utf-8 python <repo>/…/04-fixing-and-building-with-ai/examples/bill_v4.py`
  The output shows, in this order:
  - `กรุณาพิมพ์ตัวเลข` once;
  - `ต้องจ่าย 570.00 บาท`;
  - `ต้องจ่าย 900.00 บาท`, then `คนละ 225.00 บาท`;
  - `ต้องจ่าย 120.00 บาท`;
  - the class 03 summary unchanged;
  - `ปิดโปรแกรม`.
- [ ] `node <repo>/…/examples/bill_v4.js` → shows `NaN` handled by the `Number.isNaN` check, plus the caught error's message.
- [ ] Each of the three broken snippets is run as-is: paste the real error. After the fix from `<details>`: paste the
  output, which must match the page.
- [ ] Every other "ผลที่ได้" block matches its run. The ขั้นตอน heading comes before the code. `check-links.sh` → only `check-done`.
- [ ] `git -C <repo> log --oneline` → still only `54e1529`.

## Implementation Notes

**Fern (FE), 2026-11-12.** Written per the SA's 2026-11-12 instruction (Python runs UNVERIFIED).
- `README.md` follows SPEC-002 §1 order, with ทวนคลาสที่แล้ว linking `bill_v3.py`. ขั้นตอน has two lists: "when the program breaks" (last line → line
  number → guess → `print` → fix) and the split-bill steps from class 01 ex 2.
  - **Hour 1:** the v3 `abc` crash traceback read bottom-up · a table of `ValueError`/`NameError`/`TypeError`/`SyntaxError`/`IndentationError` ·
    `try`/`except` · `ask_number`.
  - **Hour 2:** the SPEC's five steps, with a prompt for only `split_bill`, and a known-answer test (900 / 4 → 225.0).
  - Then the full v4, the JS (`NaN` + `Number.isNaN`, and `try`/`catch` on a typo'd function), the 3 broken snippets with their messages and
    fixes, AI (paste a traceback, then *prove* the fix by running it), and สรุป.
- `bill_v4.py` = v3 + `ask_number` (try/except loop) + `split_bill` + the `หารกี่คน (1 = ไม่หาร): ` prompt; `> 1` prints `คนละ … บาท`.
  `[FE-decided]` quantity and people also go through `ask_number`, so they are floats now (v1–v3 used `int()` for the quantity).
  The output for the SPEC inputs is unchanged, but typing `2.5` pieces is now accepted. Flagged in Q1.
- `bill_v4.js`: my first draft used a `?:` ternary, which no class teaches, so I rewrote it as `if`. The `เกิดข้อผิดพลาด: ` label is my
  copy, for the PM to review.
- The page's full program blocks are byte-identical to `bill_v4.py` / `.js`.

Evidence (2026-11-12):
```
$ node <repo>/…/04-fixing-and-building-with-ai/examples/bill_v4.js
NaN
กรุณาพิมพ์ตัวเลข
เกิดข้อผิดพลาด: calcDiscont is not defined
30
$ grep -n '^## ' <page>      → 5 ทวน · 12 โจทย์ · 16 ขั้นตอน 1-2-3 · 30 แปลงเป็นโค้ด (Python) …
$ check-links.sh <repo>      → check-done
$ git -C <repo> log --oneline → 54e1529 Initial commit
```
- Harness files `ex04_{1,2,3}_broken.py` and `ex04_{1,2,3}_fixed.py` are extracted from the page.
- **UNVERIFIED — no Python (TASK-002 Q1):**
  - The AC-4 final run with `printf 'abc\n300\n2\n1\n1000\n1\n4\n60\n2\n1\n0\n'`. Hand trace: one `กรุณาพิมพ์ตัวเลข` · 570.00 · 900.00 then
    `คนละ 225.00 บาท` · 120.00 · the class 03 summary · `ปิดโปรแกรม`.
  - **The four tracebacks on the page (the v3 `abc` crash and the three snippets) are my best rendering of Python 3.12 output, NOT a real
    run.** The caret lines (`^^^^`, `~~~~~~~^~~~~`) and their alignment under Thai text are the likeliest to differ. The TASK says
    paste the real message, so on the first Python run each one gets replaced with the real text.
  - The page's other Python "ผลที่ได้" blocks.
- VS Code preview / `<details>`: UNVERIFIED (QA).

**B1 + Q1 line (Fern, 2026-11-12):** B1 is applied to `bill_v4.py` and this page (evidence in TASK-003 "B1"; bill_v4 page vs file → `true`).
The decimal-quantity line was added under the full v4 block (page line 196), in my Thai wording for the PM's review:
"ตั้งแต่รุ่นนี้ จำนวนชิ้นถามด้วย `ask_number` แทน `int()` จึงพิมพ์ทศนิยมได้ เช่น `2.5` สำหรับของที่ขายเป็นกิโลกรัม".
The v3 `abc` traceback on this page now shows the B1 prompt in its code line. Its caret line is still hand-written and gets replaced on the first
Python run.

## Questions

- **Q1 (behaviour, non-blocking):** in v4 the quantity and people are read as floats through one `ask_number`, so `2.5` pieces is
  accepted. Keep it simple like this, or add an `int` version (`ask_whole_number`) so the quantity stays whole as in v1–v3? Either way
  the SPEC's expected outputs hold. @Sober
  > answer (SA, 2026-11-12): keep the single `ask_number`, which is simpler for a beginner. Add one line on the page where
  > `ask_number` replaces `int()`: from now on the quantity can be a decimal, e.g. 2.5 kg for goods sold by weight (SPEC-002
  > §3 is updated). Amendment B1 (in TASK-003) also touches `bill_v4.py` and this page.

## Review

**SA, 2026-11-12 — interim; not DONE yet.** I read `bill_v4.py` against SPEC-002 §3. It has the `ask_number` try/except
loop with `กรุณาพิมพ์ตัวเลข`, `split_bill`, the people prompt, and `> 1` → `คนละ … บาท`; with people `0` or `1` it does not
divide. Reading it, my hand trace of the AC-4 inputs matches yours. **DONE needs:**
- B1;
- the one page line on decimal quantity (Q1);
- the AC-4 run and the Python DoD lines, with real output;
- the four hand-rendered tracebacks replaced with the real ones from the first Python run.

The tracebacks are the riskiest part. Until they are real, this page must not reach QA.
