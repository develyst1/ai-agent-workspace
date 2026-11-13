# TASK-003: Class 02 lesson page + `bill_v2.py` / `bill_v2.js`
- Source: SPEC-002 (§1 page shape, §3 "Class 02") for REQ-002
- Owner: FE (Fern)
- Status: REVIEW (2026-11-12, FE; Python runs UNVERIFIED — same blocker as TASK-002 Q1)
- Due: 2026-11-16 (taught 2026-11-17)
- Depends on: TASK-002 (`bill_v2.py` grows from `bill_v1.py`)
- Git writes: **none**

## What to do

Folder `programming-basics-ai/classes/02-decisions-and-repetition/`: replace `README.md` with the class 02 page (SPEC-002
§1 order, §3 "Class 02" content, including the trace-table method and the answer table in `<details>`). Create
`examples/bill_v2.py` and `examples/bill_v2.js`. Exact strings as in the SPEC; a string that reads wrong goes in
`## Questions`.

## Definition of Done

Workspace root, Git Bash; paste every command and its output in `## Implementation Notes`.

- [ ] `printf '300\n2\n1000\n1\n60\n2\n0\n' | PYTHONIOENCODING=utf-8 python <repo>/…/02-decisions-and-repetition/examples/bill_v2.py`
  → shows `ต้องจ่าย 570.00 บาท`, `ต้องจ่าย 900.00 บาท` and `ต้องจ่าย 120.00 บาท` (with discounts `30.00`, `100.00`, `0.00`),
  then `ปิดโปรแกรม`.
- [ ] `node <repo>/…/examples/bill_v2.js` → `ต้องจ่าย 570.00 บาท` and `ลูกค้าคนที่ 1`..`3`.
- [ ] Exercise 1 answer from `<details>`, saved to `tests/harness/ex02.py`, with `printf '2000\n1\n0\n'` → `ต้องจ่าย 1700.00 บาท`.
- [ ] Every other "ผลที่ได้" block on the page has been run and matches.
- [ ] The ขั้นตอน heading comes before the first code heading (`grep -n '^## '`). Links: `check-links.sh` → only `check-done`.
- [ ] `git -C <repo> log --oneline` → still only `54e1529`.

## Implementation Notes

**Fern (FE), 2026-11-12.** Written per the SA's 2026-11-12 instruction ("go on writing … marking each Python run UNVERIFIED").
- `README.md` follows SPEC-002 §1 order: เป้าหมาย · ทวนคลาสที่แล้ว (4 lines + link to `bill_v1.py`) · โจทย์วันนี้ · ขั้นตอน 1-2-3 (6 steps) ·
  Python (comparison → `if/elif/else` + indentation → `for`/`range` → the trace-table method on the `for` loop → `while`/`break` → full v2) ·
  JavaScript (fixed `600`, plus a `for` loop 1..3, plus a 4-row comparison table) · ex 1 (≥2000 → 15 %, with the answer and why the 2000 check
  comes first) · ex 2 (trace table for `300`,`2`,`0`, answer in `<details>`) · AI (the SPEC prompt, the 499/500/999/1000 edge check) · สรุป.
- `examples/bill_v2.py` and `.js`: strings exactly as SPEC-002 §3. The per-customer line is
  `ยอดรวม … บาท · ส่วนลด … บาท · ต้องจ่าย … บาท`. Discounts are written `total * 10 / 100` rather than `* 0.10`; this is `[FE-decided]`,
  so beginners read it as a percentage and no float noise appears.
- The prompts stay the v1 strings (`ราคาต่อชิ้น (บาท): `). The SPEC gives no "0 = close" hint string, so the page's
  โจทย์ and ขั้นตอน tell the learner instead (see Q1).
- The full program blocks on the page are byte-identical to `bill_v2.py` / `bill_v2.js` (node line-compare → `true` for both).

Evidence (2026-11-12, Git Bash, workspace root):
```
$ node <repo>/…/02-decisions-and-repetition/examples/bill_v2.js
ยอดรวม 600.00 บาท · ส่วนลด 30.00 บาท · ต้องจ่าย 570.00 บาท
ลูกค้าคนที่ 1
ลูกค้าคนที่ 2
ลูกค้าคนที่ 3
$ grep -n '^## ' <page>      → 5 ทวนคลาสที่แล้ว · 12 โจทย์วันนี้ · 16 ขั้นตอน 1-2-3 · 27 แปลงเป็นโค้ด (Python) …
$ bash code-class/ai-worker/tests/harness/check-links.sh <repo>
check-done
$ git -C <repo> log --oneline
54e1529 Initial commit
```
- `tests/harness/ex02.py` is extracted from the page's exercise-1 `<details>` block.
- **UNVERIFIED — no Python on this machine (TASK-002 Q1):** the `bill_v2.py` run with
  `printf '300\n2\n1000\n1\n60\n2\n0\n'`, `ex02.py` with `printf '2000\n1\n0\n'`, and the page's 5 Python "ผลที่ได้" blocks.
  Expected values were worked out by hand (600×5/100 = 30.0 → 570; 1000 → 100 → 900; 120 → 0; 2000×15/100 = 300 → 1700). Settled by
  running each block once `python --version` ≥ 3.12.
- VS Code preview / `<details>`: UNVERIFIED (QA's click-through).

**B1 (Fern, 2026-11-12):** `ราคาต่อชิ้น (บาท): ` → `ราคาต่อชิ้น (บาท, 0 = ปิด): ` in classes 02–04 (an asserting replace-all; counts:
02 page 11 · bill_v2.py 1 · 03 page 5 · bill_v3.py 1 · 04 page 11 · bill_v4.py 1). Class 01 is untouched, as required. `tests/harness/ex02.py`
is updated too, and diff vs the page's exercise block shows them the same.
```
$ grep -rn 'ราคาต่อชิ้น (บาท): ' <repo>/programming-basics-ai/classes/0[234]-*
(no output, exit 1)
$ grep -rln '0 = ปิด' <repo>/programming-basics-ai/classes/0[234]-*
…/02-decisions-and-repetition/examples/bill_v2.py
…/02-decisions-and-repetition/README.md
…/03-functions-lists-algorithms/examples/bill_v3.py
…/03-functions-lists-algorithms/README.md
…/04-fixing-and-building-with-ai/examples/bill_v4.py
…/04-fixing-and-building-with-ai/README.md
$ node line-compare (page block vs file)
bill_v2.py: true · bill_v2.js: true · bill_v3.py: true · bill_v3.js: true · bill_v4.py: true · bill_v4.js: true
$ check-links.sh <repo>        → check-done
$ git -C <repo> log --oneline   → 54e1529 Initial commit
```

## Questions

- **Q1 (copy, non-blocking):** the price prompt doesn't say that 0 closes the program. The page explains it, but the person at the
  keyboard won't see it. Should the PM add a hint string, e.g. `ราคาต่อชิ้น (บาท, 0 = ปิด): `? It would also change v3/v4 and
  the expected outputs. Left as SPEC'd. @Sober
  > answer (SA, 2026-11-12): yes, add it. Apply **amendment B1** below, which covers v2, v3 and v4 together (SPEC-002 §3
  > is updated). The result lines that the DoD checks do not change. Only the prompt text inside the output changes.

## Amendment B1 (SA, 2026-11-12) — the price prompt shows how to stop (v2, v3, v4)

In `bill_v2.py`, `bill_v3.py` and `bill_v4.py`, and in **every** page code block or ผลที่ได้ block of classes 02–04 that
shows this prompt, replace `ราคาต่อชิ้น (บาท): ` with `ราคาต่อชิ้น (บาท, 0 = ปิด): `. Leave class 01 / `bill_v1.py`
unchanged. Keep each page's full program block byte-identical to its file.
DoD: `grep -rn 'ราคาต่อชิ้น (บาท): ' <repo>/programming-basics-ai/classes/0[234]-*` → no output;
`grep -rln '0 = ปิด' <repo>/programming-basics-ai/classes/0[234]-*` → lists the three `.py` files and the three pages;
your existing line-compare of page block vs file → `true` for v2, v3 and v4. Paste them under Implementation Notes as "B1".

## Review

**SA, 2026-11-12 — interim; not DONE yet.** I read `bill_v2.py` against SPEC-002 §3: the tiers (≥1000 → 10 %, ≥500 → 5 %),
the 0 exit and the per-customer line match. Reading it, my hand trace gives 570.00 / 900.00 / 120.00, as yours does. The
node evidence matches the page. Reading is not a run, though: **DONE needs** amendment B1, plus the Python DoD lines run
with real output, once Python is installed (TASK-002 Q1, with the owner via the PM).

**SA, 2026-11-12 — B1 checked.** I re-ran the checks:
- the old-prompt `grep` over classes 02–04 → exit 1;
- `0 = ปิด` appears in the 3 `.py` files and the 3 pages;
- the class 04 page has the decimal-quantity line (line 196);
- `check-links.sh` → `check-done`; `git log` → only `54e1529`.

For TASK-003, 004 and 005, only the Python runs are left; `python --version` still shows the Store stub on 2026-11-12.
