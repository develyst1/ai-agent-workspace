# TASK-004: Class 03 lesson page + `bill_v3.py` / `bill_v3.js`
- Source: SPEC-002 (§1 page shape, §3 "Class 03") for REQ-002
- Owner: FE (Fern)
- Status: REVIEW (2026-11-12, FE; Python runs UNVERIFIED — same blocker as TASK-002 Q1)
- Due: 2026-11-17 (taught 2026-11-18)
- Depends on: TASK-003
- Git writes: **none**

## What to do

Folder `programming-basics-ai/classes/03-functions-lists-algorithms/`: replace `README.md` with the class 03 page (SPEC-002
§1 order, §3 "Class 03"). Each algorithm (sum, largest, search, sort) is written **by hand with a loop first, built-in
second**. Create `examples/bill_v3.py` (with at least `calc_discount(total)` and `summary(history)`) and
`examples/bill_v3.js` (it includes the `[100, 20, 3].sort()` trap). Exact strings as in the SPEC.

## Definition of Done

Workspace root, Git Bash; paste every command and its output in `## Implementation Notes`.

- [ ] `printf '300\n2\n1000\n1\n60\n2\n0\n' | PYTHONIOENCODING=utf-8 python <repo>/…/03-functions-lists-algorithms/examples/bill_v3.py`
  → the three customers as in class 02, then `จำนวนบิล 3 · รวม 1590.00 บาท · บิลสูงสุด 900.00 บาท` and
  `เรียงจากน้อยไปมาก: 120.00, 570.00, 900.00`.
- [ ] `node <repo>/…/examples/bill_v3.js` → sum `1590`, largest `900`, sorted `120, 570, 900`, and the trap line
  showing `[ 100, 20, 3 ]` (paste the exact form Node prints).
- [ ] Exercises: `my_min([570, 900, 120])` → `120`; `has_bill(…, 900)` → `พบ`, `has_bill(…, 50)` → `ไม่พบ`. Run them
  from `tests/harness/ex03.py`.
- [ ] Every other "ผลที่ได้" block matches its run. The ขั้นตอน heading comes before the code. `check-links.sh` → only `check-done`.
- [ ] `git -C <repo> log --oneline` → still only `54e1529`.

## Implementation Notes

**Fern (FE), 2026-11-12.** Written per the SA's 2026-11-12 instruction (Python runs UNVERIFIED).
- `README.md` follows SPEC-002 §1 order, with ทวนคลาสที่แล้ว linking `bill_v2.py`. Python goes `def`/`return` (`calc_discount`) → `list`/`append`/`len`/`[0]` →
  **by hand first**: sum, largest (each with a trace table), search (a loop with a `found` flag), sort (on paper, a
  smallest-first table) → **built-in second**: `sum`/`max`/`in`/`sorted` → full v3. JS has the sum and largest loops, the
  `(a, b) => a - b` sort and the `[100, 20, 3].sort()` trap, explained, plus a 6-row comparison table. ex 1 `my_min` (the answer explains why
  it can't start at 0); ex 2 `has_bill` → พบ/ไม่พบ. AI: trace `my_max` on `[570, 900, 120]`, compare with the page's table. สรุป.
- `bill_v3.py` has `calc_discount`, `summary`, and also `my_sum` / `my_max` (the by-hand algorithms, so the AI step has a
  `my_max` to trace). The sorted line is built with a loop + `", ".join` (no comprehension; SPEC-001 §3 leaves those out).
- `[FE-decided]` `my_max` starts at `0`, because money is never negative. That also means an empty history (typing `0` first) prints
  `จำนวนบิล 0 · รวม 0.00 บาท · บิลสูงสุด 0.00 บาท` and `เรียงจากน้อยไปมาก: ` instead of crashing. The SPEC doesn't cover the empty case (Q1).
- The AI prompt text on the page is mine; the SPEC gives the instruction, not the words. It needs the PM's review.
- The page's full program blocks are byte-identical to `bill_v3.py` / `.js`.

Evidence (2026-11-12):
```
$ node <repo>/…/03-functions-lists-algorithms/examples/bill_v3.js
จำนวนบิล 3 · รวม 1590.00 บาท · บิลสูงสุด 900.00 บาท
เรียงจากน้อยไปมาก: 120, 570, 900
[ 100, 20, 3 ]
$ grep -n '^## ' <page>      → 5 ทวน · 12 โจทย์ · 16 ขั้นตอน 1-2-3 · 29 แปลงเป็นโค้ด (Python) …
$ check-links.sh <repo>      → check-done
$ git -C <repo> log --oneline → 54e1529 Initial commit
```
- The trap line Node prints is exactly `[ 100, 20, 3 ]`, and the page shows that form.
- `tests/harness/ex03.py` is `my_min` + `has_bill` with their prints, extracted from the two `<details>` blocks.
- **UNVERIFIED — no Python (TASK-002 Q1):** the `bill_v3.py` run (expected: 3 customers as in class 02, then
  `จำนวนบิล 3 · รวม 1590.00 บาท · บิลสูงสุด 900.00 บาท`, `เรียงจากน้อยไปมาก: 120.00, 570.00, 900.00`, `ปิดโปรแกรม`), `ex03.py`
  (expected `120` / `พบ` / `ไม่พบ`), and the page's 7 Python "ผลที่ได้" blocks, which are hand-traced.
- VS Code preview / `<details>`: UNVERIFIED (QA).

**B1 (Fern, 2026-11-12):** applied to `bill_v3.py` and this page. The evidence is in TASK-003 § Implementation Notes "B1"; bill_v3 page vs file → `true`.

## Questions

- **Q1 (behaviour, non-blocking):** typing `0` before any bill gives a zero summary (above). Is that acceptable, or does the PM
  want a message such as "no bills today"? That would be new copy. @Sober
  > answer (SA, 2026-11-12): acceptable as it is. No new copy is needed, and it does not crash (SPEC-002 §3 is updated).
  > `my_max` starting at 0, with a comment saying why, is fine, and it contrasts well with the `my_min` answer. Amendment
  > B1 (in TASK-003) also touches `bill_v3.py` and this page.

## Review

**SA, 2026-11-12 — interim; not DONE yet.** I read `bill_v3.py` against SPEC-002 §3. It has `calc_discount` and `summary`,
sum and largest written by loop, `sorted` used second, and no comprehension. The summary strings match the SPEC. The JS trap
output `[ 100, 20, 3 ]` was run by you and matches the page. **DONE needs** B1, plus the Python DoD lines run once Python
is installed.
