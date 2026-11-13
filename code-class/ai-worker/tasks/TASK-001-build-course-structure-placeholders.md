# TASK-001: Build the course structure in `code-class-docs` (front page, overview, schedule, placeholders)
- Source: SPEC-001 (revision 2, 2026-11-12) for REQ-001
- Owner: FE (Fern)
- Status: DONE (2026-11-12, SA review, A1 included)
- Depends on: none to start. The owner's AC-1 answer and the PM's final Thai words arrive as an amendment to this TASK.
  Until then, the Thai text below is the draft to build with.
- Git writes: **none**. Leave everything uncommitted on `main`.

## What to do

Repo `code-class-docs` (path: workspace-root `machine.local.md`), branch `main`. Base checked by the SA 2026-11-12:
`git status -sb` → `## main...origin/main`, one file `README.md` = `# code-class-docs`.

Create exactly these files and nothing else (SPEC-001 §1):

1. `README.md` — **replace** its content with SPEC-001 §5a, the block between the ```` ```markdown ```` fences, verbatim.
2. `programming-basics-ai/schedule.md` — the line under SPEC-001 §5b heading as the first paragraph, under a heading
   `# ตารางเรียน`, then the 12-row table verbatim, then a link back: `[← กลับหน้าแรก](../README.md)`.
   In the **หัวข้อ** cell of each row, make the topic a link to that class's page, e.g.
   `[จากขั้นตอนสู่โปรแกรม: …](classes/01-from-steps-to-program/README.md)` (AC-5: one click from the schedule).
3. `programming-basics-ai/README.md` — the overview, the draft text in "Overview text" below, verbatim.
4. `programming-basics-ai/classes/<NN-name>/README.md` × 12, folder names exactly as SPEC-001 §1. Each holds only:
   ```markdown
   # คลาส NN — <หัวข้อ from the schedule row>

   **เรียนจบคลาสนี้แล้วคุณ:** <the row's "เรียนจบคลาสนี้แล้วคุณ…" cell>

   **ช่วงใช้ AI:** <the row's AI cell>

   > เนื้อหาคลาสนี้กำลังจัดทำ

   [← ตารางเรียน](../../schedule.md)
   ```
5. `programming-basics-ai/extras/bonus-plan-your-own-idea.md`, holding only:
   ```markdown
   # ชั่วโมงพิเศษ — นำไอเดียของตัวเองมาแตกเป็นขั้นตอน 1-2-3 ร่วมกับ AI

   > เนื้อหากำลังจัดทำ

   [← ตารางเรียน](../schedule.md)
   ```

Rules: every link targets a **file**, never a folder. No HTML, no images, and no other file (no `.gitkeep`, no
`LICENSE`). Plain GitHub tables. Do not change a word of the Thai text. If something reads wrong, write it in
`## Questions`.

### Overview text (draft; the PM owns the final words)

```markdown
# ภาพรวมคอร์ส: เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน + ใช้ AI เป็นผู้ช่วย

## เหมาะกับใคร
คนทำงานที่อยากสร้างโปรเจคของตัวเอง ไม่ต้องมีพื้นฐานมาก่อน เคยลองเรียนเองแล้วไม่เห็นภาพก็เริ่มที่นี่ได้

## เรียนแบบไหน
- ทุกเรื่องเริ่มจากเขียน "ขั้นตอน 1-2-3" เป็นภาษาไทย แล้วค่อยแปลงเป็นโค้ด ขั้นตอนแบบนี้เรียกว่า อัลกอริทึม (algorithm)
- เขียนโค้ดจริงด้วยภาษา Python และดูเรื่องเดียวกันในภาษา JavaScript ควบคู่กัน จะได้เห็นว่าหลักคิดเหมือนกันทุกภาษา ต่างกันแค่วิธีเขียน
- ทุกคลาสมีช่วงฝึกใช้ AI (โปรแกรมแชตที่ตอบคำถามได้ ใช้แบบฟรีได้) ให้ช่วยอธิบาย หาจุดผิด และช่วยเขียน แล้วเราตรวจเองว่าถูกหรือไม่

## คอร์สแบ่งเป็น 3 ช่วง ช่วงละ 4 คลาส ทุกช่วงจบด้วยงานที่ใช้ได้จริง
| ช่วง | คลาส | จบช่วงนี้แล้วได้ |
|---|---|---|
| 1 | 01–04 | โปรแกรมคำนวณของตัวเอง ที่เติบโตขึ้นทุกคลาส |
| 2 | 05–08 | โปรแกรมที่จำข้อมูลได้ ใช้โค้ดสำเร็จรูป และดึงข้อมูลจากอินเทอร์เน็ตได้ |
| 3 | 09–12 | หน้าเว็บสำหรับโปรแกรมของเรา และโปรเจคของตัวเอง 1 ชิ้น |

## หลักพื้นฐานที่เรียน (มีในทั้งสองภาษา)
<the SPEC-001 §3 table, verbatim, with the header row translated as: | หลักพื้นฐาน (คลาส) | Python | JavaScript |>

## สิ่งที่ต้องมี
คอมพิวเตอร์ Windows หรือ Mac · อินเทอร์เน็ต · โปรแกรมเขียนโค้ดฟรีชื่อ VS Code (ส่วนที่เหลือติดตั้งด้วยกันในคลาส 01)

[ตารางเรียน](schedule.md) · [← กลับหน้าแรก](../README.md)
```

For the §3 table rows, keep the code tokens (`print`, `def`, …) as they are. Translate only the first column's topic
names, using the schedule's wording: ขั้นตอน → อัลกอริทึม · รับค่าและแสดงผล · ข้อมูล ตัวแปร ชนิดข้อมูล · เงื่อนไข · การทำซ้ำ (ลูป) ·
ฟังก์ชัน · รายการข้อมูล + ผลรวม/ค่ามากสุด/ค้นหา/เรียงลำดับ · ข้อผิดพลาด · ข้อมูลแบบมีชื่อกำกับ · ไฟล์และ JSON ·
ชุดโค้ดสำเร็จรูป (library) · ดึงข้อมูลจากอินเทอร์เน็ต. Drop the sentences under the table (they are SA notes, not page text).

## Definition of Done

Run each command from the workspace root; paste the command and its real output in `## Implementation Notes`.

- [ ] **Links and pages:** `bash code-class/ai-worker/tests/harness/check-links.sh <path-to-code-class-docs>` → prints
  only `check-done`. (Base, run by the SA 2026-11-12: four `MISSING` lines, then `check-done`.)
- [ ] **12 class folders = 12 schedule rows:** `ls <repo>/programming-basics-ai/classes | wc -l` → `12`, and
  `grep -c '^| [0-9][0-9] |' <repo>/programming-basics-ai/schedule.md` → `12`.
- [ ] **Only placeholders, no lesson files** (REQ-001 AC-9): `find <repo>/programming-basics-ai -type f | sort` → exactly
  15 files: `README.md`, `schedule.md`, 12 × `classes/*/README.md`, and `extras/bonus-plan-your-own-idea.md`.
- [ ] **No git writes** (AC-7): `git -C <repo> status -sb` → `## main...origin/main`, ` M README.md`,
  `?? programming-basics-ai/`; `git -C <repo> log --oneline` → still only `54e1529 Initial commit`.
- [ ] **Renders:** open `README.md`, `schedule.md` and one class page in the VS Code Markdown preview. Click overview →
  schedule → class 01 → back. Write what you saw. A screenshot is optional; if a click fails, it is a finding.
  (The GitHub view is `UNVERIFIED` until the owner pushes.)
- [ ] **No personal data:** `grep -rnE '[0-9]{3}-?[0-9]{3}-?[0-9]{4}|@[A-Za-z0-9_.]+|line\.me' <repo> --include=*.md` →
  no output.

## Implementation Notes
(The FE fills this in: what changed, how it was verified, real output.
Anything not actually run is written as `UNVERIFIED — <what would settle it>`.)

**Fern (FE), 2026-11-12.** Base before: `## main...origin/main`, `54e1529 Initial commit`, `README.md` = `# code-class-docs`.

What changed (15 files under `programming-basics-ai/` + `README.md`, nothing else):
- `README.md` replaced with SPEC-001 §5a verbatim. Diffed against the SPEC block → identical.
- `schedule.md`: `# ตารางเรียน`, the §5b line as a plain paragraph (backticks dropped, see Q2), the 12 rows with each
  topic linked to its class file, then `[← กลับหน้าแรก](../README.md)`. Rows with links stripped, diffed against SPEC §5b → identical.
- `README.md` (overview): the draft text, with the §3 table placed per the translation list (see Q1).
- 12 placeholders: generated by a one-off node script that reads `schedule.md` rows into the TASK's template, so each one's
  text is copied from the schedule, not retyped. Folder names diffed against SPEC §1 → identical.
- `extras/bonus-plan-your-own-idea.md` as given.

Evidence (run 2026-11-12, workspace root, `R=<code-class-docs>`):
```
$ bash code-class/ai-worker/tests/harness/check-links.sh $R
check-done
$ ls $R/programming-basics-ai/classes | wc -l
12
$ grep -c '^| [0-9][0-9] |' $R/programming-basics-ai/schedule.md
12
$ find $R/programming-basics-ai -type f | wc -l
15     (README.md, schedule.md, 12 × classes/*/README.md, extras/bonus-plan-your-own-idea.md)
$ git -C $R status -sb ; git -C $R log --oneline
## main...origin/main
 M README.md
?? programming-basics-ai/
54e1529 Initial commit
$ grep -rnE '[0-9]{3}-?[0-9]{3}-?[0-9]{4}|@[A-Za-z0-9_.]+|line\.me' $R --include=*.md
(no output, exit 1)
$ grep -rnE '<[a-zA-Z]|!\[' $R --include=*.md      # no HTML, no images
(no output, exit 1)
```
- **Renders: UNVERIFIED.** This session cannot drive the VS Code Markdown preview. The link check shows every link
  points at a file that exists. *Settled by:* QA (or anyone with VS Code open) clicking overview → schedule → class 01 → back
  in the preview, and the GitHub view after the owner pushes.
- Footprint: no test data, no files outside the list. The generator script was not saved (it ran from stdin).
- No `/impeccable audit` was run: there is no UI here, only Markdown text the PM owns.

**A1 (Fern, 2026-11-12):** replaced the six cells exactly as the amendment says; nothing else changed.
```
$ grep -nE 'written in plain|the same|tracebacks|stack traces' $R/programming-basics-ai/README.md
(no output, exit 1)
$ bash code-class/ai-worker/tests/harness/check-links.sh $R
check-done
```
Read back: row 21 `| ขั้นตอน → อัลกอริทึม (ทุกคลาส เริ่มคลาส 01) | เขียนเป็นภาษาไทยก่อน แล้วค่อยเขียนเป็นโค้ด | เหมือนกัน |`, row 23 JS cell
`` `let x = 5`, ข้อความ ตัวเลข จริง/เท็จ (string number boolean) ``, row 28 both `อ่านข้อความแจ้งข้อผิดพลาด (traceback / stack trace)` cells.

## Questions

- **Q1 (overview §3 table, row 1):** the TASK says translate only the first column, so row 1's other cells are still
  English ("written in plain Thai first, then code" / "the same") on a Thai page. I also shortened "(every class,
  starting in 01)" to "(01)", because I had no Thai words for it. Both need the PM's Thai text. Not blocking; the PM's
  amendment can carry it. @Sober
  > answer (SA, 2026-11-12): right. That was a gap in my TASK, not yours: I left English cells in the table and told
  > you not to translate them. Apply **amendment A1** below. The words are a draft, and the PM reviews them with the
  > rest of the page text.
- **Q2 (schedule first line):** SPEC §5b shows the line in backticks. I wrote it as a plain paragraph, because the TASK calls it
  "the first paragraph" and code font would look odd to a client. Say if you want the backticks.
  > answer (SA, 2026-11-12): plain paragraph is correct. The backticks in SPEC-001 §5b only marked the line inside
  > the SPEC.

## Amendment A1 (SA, 2026-11-12) — Thai text for the overview's basics table

In `programming-basics-ai/README.md`, § หลักพื้นฐานที่เรียน, replace these cells exactly and touch nothing else:

| Row (first column) | Column | Replace | With |
|---|---|---|---|
| `ขั้นตอน → อัลกอริทึม (01)` | first column | `ขั้นตอน → อัลกอริทึม (01)` | `ขั้นตอน → อัลกอริทึม (ทุกคลาส เริ่มคลาส 01)` |
| same row | Python | `written in plain Thai first, then code` | `เขียนเป็นภาษาไทยก่อน แล้วค่อยเขียนเป็นโค้ด` |
| same row | JavaScript | `the same` | `เหมือนกัน` |
| `ข้อมูล ตัวแปร ชนิดข้อมูล (01)` | JavaScript | `let x = 5`, string number boolean | `let x = 5`, ข้อความ ตัวเลข จริง/เท็จ (string number boolean) |
| `ข้อผิดพลาด (04)` | Python | `try` / `except`, tracebacks | `try` / `except`, อ่านข้อความแจ้งข้อผิดพลาด (traceback) |
| `ข้อผิดพลาด (04)` | JavaScript | `try` / `catch`, stack traces | `try` / `catch`, อ่านข้อความแจ้งข้อผิดพลาด (stack trace) |

DoD for A1: `grep -nE 'written in plain|the same|tracebacks|stack traces' <repo>/programming-basics-ai/README.md` → no
output, and `check-links.sh` → only `check-done`. Paste both under Implementation Notes as "A1".

## Review
(The SA fills this in at REVIEW: verdict + reasons.)

**SA, 2026-11-12 — DONE for the scope as written. A1 is open as a small follow-up in this TASK.**
- Re-ran the decisive checks myself:
  - `check-links.sh` → `check-done`;
  - `find … -type f` → exactly the 15 expected files;
  - `git status -sb` → `## main...origin/main` / ` M README.md` / `?? programming-basics-ai/`;
  - `git log --oneline` → only `54e1529`;
  - `git branch -a` → `main` only.
  They match the FE's evidence.
- Read the schedule's first rows, the class 01 placeholder and the whole overview against SPEC-001 §5b/§5c and this
  TASK: as specified. The placeholders hold no lesson content (REQ-001 AC-9).
- The English cells (Q1) come from my instruction, so they are not a defect in the FE's work; A1 fixes them.
- Renders in the VS Code preview: `UNVERIFIED`, accepted. The link check proves every target exists, and the preview
  click-through is QA's (TEST-001). The GitHub view comes after the owner's push.
- Security review: none needed. Markdown only, with no code, input, secrets or auth.

**SA, 2026-11-12 — A1 DONE.** Re-ran the checks:
- `grep -nE 'written in plain|the same|tracebacks|stack traces'` on the overview → no output (exit 1);
- `check-links.sh` → `check-done`;
- `grep` on the new strings shows overview lines 21, 23 and 28 holding all 6 cells exactly as A1 lists them;
- `git status -sb` and `git log` → unchanged (uncommitted, only `54e1529`).
