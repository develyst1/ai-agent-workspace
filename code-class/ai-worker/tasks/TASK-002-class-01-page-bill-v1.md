# TASK-002: Class 01 lesson page + `bill_v1.py` / `bill_v1.js`
- Source: SPEC-002 (§1 page shape, §2 tools, §3 "Class 01") for REQ-002
- Owner: FE (Fern)
- Status: BLOCKED (2026-11-12, waiting: SA — no Python on this machine for the DoD runs; page + files written, see Q1)
- Due: **2026-11-15** (taught 2026-11-16)
- Depends on: TASK-001 (the class folder exists)
- Git writes: **none**

## What to do

In `code-class-docs` (path: `machine.local.md`), folder `programming-basics-ai/classes/01-from-steps-to-program/`:

1. Replace `README.md` (TASK-001's placeholder) with the class 01 lesson page, in the SPEC-002 §1 order, with the
   content of SPEC-002 §3 "Class 01". Section 5 of the page includes the install steps from SPEC-002 §2: Windows and Mac,
   the PATH tick, the Microsoft Store trap, `python`/`python3`.
2. Create `examples/bill_v1.py` and `examples/bill_v1.js`, the complete programs at the end of class 01, with the exact
   prompts and messages in SPEC-002 §3.
3. The exercise 1 answer lives only inside the page's `<details>` block; no answer file.

Thai prose is yours to write from the SPEC. The PM reviews the words before QA (SPEC-002 §1 "Writing"). Do not change a
prompt or message string; if one reads wrong, write it in `## Questions`.

## Definition of Done

From the workspace root, Git Bash. Paste every command and its real output in `## Implementation Notes`.

- [ ] `printf '50\n3\n' | PYTHONIOENCODING=utf-8 python <repo>/programming-basics-ai/classes/01-from-steps-to-program/examples/bill_v1.py`
  → output ends with `ยอดรวม 150.00 บาท`.
- [ ] Also run it once **without** `PYTHONIOENCODING` and paste what happens. This settles a SPEC-002 risk; either result
  is fine, just report it.
- [ ] `node <repo>/…/01-from-steps-to-program/examples/bill_v1.js` → `ยอดรวม 150.00 บาท`.
- [ ] Exercise 1: the answer code from `<details>`, saved to `code-class/ai-worker/tests/harness/ex01.py` (not in the
  repo), run with `printf '50\n3\n200\n'` → output ends with `เงินทอน 50.00 บาท`.
- [ ] Every other code block on the page that the page says to run: run it, and paste its output next to the page's
  "ผลที่ได้" for that block. They must match.
- [ ] Page order: `grep -n '^## ' <page>` shows the ขั้นตอน 1-2-3 heading before the first code heading.
- [ ] `bash code-class/ai-worker/tests/harness/check-links.sh <repo>` → only `check-done`.
- [ ] The VS Code Markdown preview of the page renders, and the `<details>` block opens. Write what you saw.
- [ ] `git -C <repo> log --oneline` → still only `54e1529 Initial commit`.

## Implementation Notes
(The FE fills this in: what changed, how it was verified, real output.
Anything not actually run is written as `UNVERIFIED — <what would settle it>`.)

**Fern (FE), 2026-11-12. Written; the Python evidence is blocked (see Q1).**

What changed (in `programming-basics-ai/classes/01-from-steps-to-program/` only):
- `README.md`: the placeholder is replaced by the lesson page in SPEC-002 §1 order: เป้าหมาย · โจทย์วันนี้ · ขั้นตอน 1-2-3 ·
  แปลงเป็นโค้ด (Python: install for Windows/Mac with the PATH tick, the Store trap quoted from the real message on this machine,
  `python`/`python3`; then print → variables → `input` and the `"50" * 2` → `5050` trap → `float()`/`int()` → f-string → full v1) ·
  เรื่องเดียวกันใน JavaScript (fixed values, plus a 4-row Python/JS table) · แบบฝึกหัด 1 (code) and 2 (steps only), answers in
  `<details>` · ช่วงใช้ AI (the SPEC's prompt, 3 checks, the never-paste line) · สรุป (3 lines + links).
- `examples/bill_v1.py` and `examples/bill_v1.js`: prompts and messages exactly as SPEC-002 §3. The step numbers ①–④ are
  comments on each line.
- The Thai prose is mine, written from the SPEC, and needs the PM's word review. New words get a one-line explanation the first time
  they appear: อัลกอริทึม, โปรแกรม, terminal, ตัวแปร, str/int/float, f-string, คอมเมนต์, AI.

Evidence (2026-11-12, Git Bash, workspace root, `P=<repo>/programming-basics-ai/classes/01-from-steps-to-program`):
```
$ node $P/examples/bill_v1.js
ยอดรวม 150.00 บาท
$ printf '50\n3\n' | python $P/examples/bill_v1.py          # without PYTHONIOENCODING
Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.
exit=49
$ grep -n '^## ' $P/README.md
7:## โจทย์วันนี้
11:## ขั้นตอน 1-2-3
22:## แปลงเป็นโค้ด (Python)
149:## เรื่องเดียวกันใน JavaScript
179:## แบบฝึกหัด
225:## ช่วงใช้ AI
239:## สรุป
$ bash code-class/ai-worker/tests/harness/check-links.sh <repo>
check-done
$ git -C <repo> log --oneline
54e1529 Initial commit
```
- The JS block on the page and `node` give the same output: `ยอดรวม 150.00 บาท` ✓.
- Content greps: no HTML other than `<details>`/`<summary>`, no PII pattern, and no สอบ/เกรด/นักเรียน/การบ้าน (all exit 1).
- `tests/harness/ex01.py` is extracted by awk from the page's exercise-1 `<details>` block, so it is the page's code byte for byte.

UNVERIFIED (each one settled by running it on a machine with Python 3.12+; Q1):
- `bill_v1.py` with `PYTHONIOENCODING=utf-8` → expect `ยอดรวม 150.00 บาท`; and the same without it (the SPEC-002 encoding risk).
- `ex01.py` with `printf '50\n3\n200\n'` → expect `เงินทอน 50.00 บาท`.
- The page's five Python "ผลที่ได้" blocks (`สวัสดีร้านค้า` · `150` · `5050` · `100.0` · `ยอดรวม 150.00 บาท`) are worked out
  by hand, not run.
- The VS Code preview and the `<details>` toggle: this session cannot drive the preview (same as TASK-001; QA's).

## Questions

- **Q1 — ENV REQUEST: there is no Python on this machine.** `python` resolves to the Windows Store stub
  (`C:\Users\…\WindowsApps\python.exe`, exit 49); there is no `py`, and nothing under `Programs\Python`. Node v22.23.2 is present.
  I have not installed Python, because that changes the owner's machine and no TASK or desk rule lets me do it.
  Need one of: (a) the owner installs Python 3.12+ from python.org with "Add python.exe to PATH", and I re-run the DoD;
  or (b) you say I may install it myself (winget `Python.Python.3.12`). TASK-003…005 hit the same wall. I'm on TASK-006
  (no code) meanwhile. @Sober
  > answer (SA, 2026-11-12): confirmed by running it myself: `python --version` → the Store stub message, `py` not found,
  > no `Programs\Python`, `node --version` → `v22.23.2`. **Not (b).** Installing software on the owner's machine is his
  > call, and I cannot grant it. Going with (a): it is routed to the PM as an env request (`inbox/PM.md`, 2026-11-12). The
  > SPEC should have checked this before choosing Python (F-003). Keep TASK-002 BLOCKED on this item only, carry on with
  > TASK-006, and re-run the Python DoD lines as soon as `python --version` prints 3.12+. Leave the rest of the page as it
  > is: the PM reviews its words in the meantime.

## Review
(The SA fills this in at REVIEW: verdict + reasons.)
