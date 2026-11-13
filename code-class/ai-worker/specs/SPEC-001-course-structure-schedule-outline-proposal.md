# SPEC-001: First course: repo structure, front page, schedule and outline (the proposal for AC-1)
- Source: REQ-001
- Status: DRAFT, **revision 2**, 2026-11-12: re-cut to the owner's shape decision (`DECISIONS.md` 2026-11-12, "เอาตามนั้น"):
  the 12-class path stays the full course, and classes 01–04 follow option A (`talks/SA-SPEC-001-8-hour-shape-option-2026-11-12.md`).
  The repo carries no real dates. Revision 1 is kept verbatim at `archive/SPEC-001-v1-before-revision-2026-11-12.md`.
  The proposal still waits for the owner's AC-1 answer on the rest of the §6 pack.
- Author: the SA, 2026-11-12

## What I read

- `code-class-docs` on disk, 2026-11-12. Branch `main`, HEAD `54e1529 Initial commit`, `## main...origin/main` (clean).
  Only `README.md` exists, holding `# code-class-docs`. Greenfield.
- REQ-001 as READY_FOR_SA (AC-1..AC-10, Q1..Q5).
- `talks/QA-REQ-001-second-reading-and-ac-check-2026-11-12.md`.
- `SYSTEM-FACTS.md`, `DECISIONS.md` (5 lines, 2026-11-12).

## Overview

One course, kept in its own folder so a second course can sit beside it later (Q4). Everything is **Markdown**: GitHub
renders it, VS Code previews it on any machine, and it needs no build or tool. The front page is written for a person who
is talking with the owner now and is still deciding: their plan comes first, and a "start here" for the learner follows
(REQ-001 Q1 outcome). The schedule has 12 classes. Classes 01–04 are a complete first block that ends with one
working calculation program, so a buyer of 8 hours finishes something real. Every class starts from steps 1-2-3 in
plain Thai before any code; the learner asked for algorithm thinking. Each basics idea is the same in every language and
is shown in two named languages. There is a short AI slot in every class, plus AI-centred classes.

## 1. Folder tree `[SA-proposed]`

```
code-class-docs/
├── README.md                          ← front page (Thai): the plan for the person deciding, then "start here"
└── programming-basics-ai/             ← course 1 (a 2nd course gets a sibling folder; nothing moves)
    ├── README.md                      ← course overview: who, goal, approach, the two languages, how AI fits, tools
    ├── schedule.md                    ← the schedule table (12 rows) + class length and frequency
    ├── classes/
    │   ├── 01-from-steps-to-program/README.md
    │   ├── 02-decisions-and-repetition/README.md
    │   ├── 03-functions-lists-algorithms/README.md
    │   ├── 04-fixing-and-building-with-ai/README.md
    │   ├── 05-named-data/README.md
    │   ├── 06-files-and-saved-data/README.md
    │   ├── 07-using-others-code/README.md
    │   ├── 08-data-from-the-internet/README.md
    │   ├── 09-solving-bigger-problems/README.md
    │   ├── 10-a-web-page-for-your-program/README.md
    │   ├── 11-my-project-plan-and-build/README.md
    │   └── 12-my-project-finish-and-next/README.md
    └── extras/
        └── bonus-plan-your-own-idea.md  ← the bonus hour (any package that includes one); not a class row
```

Decisions inside the tree, with no effect on what a reader sees, so not asked `[SA-decided]`:
- **Folder and file names are English ASCII, lower-case, kebab-case, with a zero-padded number** (AC-5). Thai in a path
  becomes `%E0%B8…` in GitHub URLs and is awkward to type in a terminal. Thai titles go inside the files.
- **Every link targets a file (`…/README.md`), never a bare folder.** A link to a folder works on GitHub but not in the
  VS Code preview, which is QA's local check (QA talk §2, AC-2).
- **Each class folder holds one placeholder `README.md`** so that git keeps the folder (AC-5, AC-9). The placeholder holds
  only: the heading `คลาส NN — <topic>`, the schedule row's "after this class you can…" line, its AI part, and a link
  back to the schedule. No lesson content.
- **The bonus hour lives in `extras/`, not in `classes/`** `[SA-decided, cheap to change]`. Every package tier has bonus
  hours (8 h + 1 bonus if reviewed · 16 h + 1 · 24 h + 2), and the bonus is not part of the class path. A folder `05-bonus`
  would collide with class 05 of the full course, and would break REQ-001 AC-5 (folder count = schedule rows). REQ-002
  Requirement 1 says "05 for the bonus hour". I read that as "the fifth page this learner gets", not as a folder number.
- Nothing else at the root: no `assets/`, no `LICENSE`, no `.github/`. Add them when a REQ needs them.

## 2. Format of the material `[SA-proposed]` (the format question in SYSTEM-FACTS § Repos)

| What | Format | How the owner and QA open it |
|---|---|---|
| Front page, overview, schedule, lesson pages | Markdown (`.md`) | GitHub, or the VS Code Markdown preview (free, on Windows and Mac) |
| Example code (next REQ) | `.py` and `.js` files beside the lesson, in `classes/NN-…/examples/` | Run with `python file.py` / `node file.js` |
| Slides | **Not proposed now.** The lesson page is the teaching page. If the owner wants slides, the next REQ can make them from the same Markdown (e.g. Marp) without another tool in the repo | — |

## 3. The two example languages `[SA-proposed]` (makes AC-4 checkable)

**Python** (used first in class) and **JavaScript** (shown beside it as "the same idea, spelled differently"). Why: both
are free and run on Windows and Mac. Python reads most like plain English for a first-time learner. JavaScript is what
runs every web page, so it is the shortest road to "my own project" that other people can open. Every basics topic below
exists in both:

| Basics topic (class) | Python | JavaScript |
|---|---|---|
| Steps → algorithm (every class, starting in 01) | written in plain Thai first, then code | the same |
| Output / input (01) | `print`, `input` | `console.log`, `readline` (Node) |
| Values, variables, types (01) | `x = 5`, `str` `int` `float` `bool` | `let x = 5`, string number boolean |
| Conditions (02) | `if` / `elif` / `else` | `if` / `else if` / `else` |
| Loops (02) | `for`, `while` | `for`, `while`, `for…of` |
| Functions (03) | `def` | `function` / `=>` |
| Lists + sum / max / search / sort by hand (03) | `list` | `Array` |
| Errors (04) | `try` / `except`, tracebacks | `try` / `catch`, stack traces |
| Named data (05) | `dict` | object `{}` |
| Files and JSON (06) | `open`, `json` | `fs`, `JSON` |
| Libraries (07) | `pip` | `npm` |
| Data from the internet (08) | `requests` | `fetch` |

Class 10 (a web page for your program) is a **project class, not a basics topic**. It uses JavaScript in the browser, so it
sits outside this table and outside AC-4. Classes 09, 11 and 12 reuse topics from the table.
Deliberately left out because they do not exist in the same form in both: classes/OOP, list comprehensions, pointers and async.

## 4. Schedule (Q2 and Q3)

**12 classes · 2 hours each** `[operator 2026-11-12: the 12-class path is the full course = 24 h]`. **Days and times are
agreed with each learner** `[SA-proposed]`. The first learner's four evenings in a row show that a fixed "once a week"
would be wrong. The schedule page says "คลาสละ 2 ชั่วโมง · นัดวันและเวลากับผู้สอน" and shows no dates
(`DECISIONS.md` 2026-11-12: no real dates).

**Blocks that end with something working** `[SA-proposed]`, so every package tier stops at a finished result:
- **01–04 (8 h):** one calculation program that grows each class and works at the end of 04 `[operator — option A]`.
- **05–08 (16 h):** the program remembers data (05–06), uses others' code (07) and gets data from the internet (08).
- **09–12 (24 h):** bigger problems (09), a web page (10; the learner wants web apps), and the learner's own project (11–12).

**How much is AI** (Requirement 5): classes 01–03 and 05–10 each end with a ~20-minute AI slot on that class's topic. In
class 04 the whole second hour is about AI, and classes 11–12 are built around it. That is about one third of the
course. The AI tool is **any free AI chat**, so the learner pays nothing. Calling an AI from code (it needs an API key,
which costs money) is deliberately left out.

**Classes 11–12, "my own project", are `team-proposed` (Q3).** If the owner says no, 11–12 become two more guided
projects.

## 5. Mock for AC-1: one screen for the owner (draft Thai; **the PM owns the final words**)

### 5a. Front page, `README.md`

```markdown
# เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน + ใช้ AI เป็นผู้ช่วย

คอร์สสอนตัวต่อตัว สำหรับคนทำงานที่อยากสร้างโปรเจคของตัวเอง ไม่ต้องมีพื้นฐานมาก่อน ไม่มีสอบ ไม่มีเกรด

## แผนการเรียน
- คอร์สเต็ม 12 คลาส คลาสละ 2 ชั่วโมง นัดวันและเวลาเรียนกับผู้สอนได้
- ทุก 4 คลาสจบด้วยงานที่ใช้ได้จริง: คลาส 1–4 ได้โปรแกรมคำนวณของตัวเอง · คลาส 5–8 โปรแกรมจำข้อมูลได้และดึงข้อมูลจากอินเทอร์เน็ตได้ · คลาส 9–12 ได้หน้าเว็บและโปรเจคของตัวเอง
- ทุกเรื่องเริ่มจากเขียน "ขั้นตอน 1-2-3" เป็นภาษาไทยก่อน แล้วค่อยแปลงเป็นโค้ด จะได้เห็นภาพว่าโปรแกรมเกิดขึ้นได้อย่างไร
- เรียน "หลักคิด" ของการเขียนโปรแกรมที่เหมือนกันทุกภาษา แล้วดูตัวอย่างจริงในสองภาษาที่คนใช้มากที่สุด คือ Python และ JavaScript
- ทุกคลาสมีช่วงฝึกใช้ AI (โปรแกรมแชตที่ตอบคำถามได้) ให้ช่วยอธิบาย ช่วยหาจุดผิด และช่วยเขียน แล้วเราตรวจเองได้ว่าที่ AI ตอบถูกหรือไม่

## เรียนจบแล้วทำอะไรได้
- อ่านและเขียนโปรแกรมสั้น ๆ ได้เอง
- อ่านข้อความแจ้งข้อผิดพลาดของโปรแกรม แล้วรู้ว่าต้องแก้ตรงไหน
- เริ่มเรียนภาษาโปรแกรมใหม่ได้เร็ว เพราะเข้าใจหลักที่ทุกภาษาใช้ร่วมกัน
- ใช้ AI ช่วยวางแผนและเขียนโปรเจคของตัวเอง และตรวจงานที่ AI เขียนให้ได้
- มีโปรเจคเล็ก ๆ ของตัวเองที่ใช้งานได้จริง 1 ชิ้น

👉 [ภาพรวมคอร์ส](programming-basics-ai/README.md) · [ตารางเรียน 12 คลาส](programming-basics-ai/schedule.md)

## เริ่มตรงนี้ (สำหรับผู้เรียน)
1. เปิด [ตารางเรียน](programming-basics-ai/schedule.md) ดูว่าแต่ละคลาสจะได้อะไร
2. ก่อนคลาสแรก: ติดตั้งโปรแกรมเขียนโค้ดฟรีชื่อ VS Code ส่วนที่เหลือเราติดตั้งด้วยกันในคลาส 1
3. เนื้อหาของแต่ละคลาสอยู่ในโฟลเดอร์ `classes/` เรียงตามเลขคลาส
```

No contact, no price and no dates on the page (REQ-001 Q5, Out of Scope, `DECISIONS.md` 2026-11-12). The last
"เรียนจบแล้ว" bullet depends on classes 11–12 (Q3).

### 5b. Schedule, `programming-basics-ai/schedule.md`

`คอร์สเต็ม 12 คลาส · คลาสละ 2 ชั่วโมง · นัดวันและเวลากับผู้สอน`

| คลาส | หัวข้อ | เรียนจบคลาสนี้แล้วคุณ… | ช่วงใช้ AI |
|---|---|---|---|
| 01 | จากขั้นตอนสู่โปรแกรม: เครื่องมือ ข้อมูล ตัวแปร รับค่า-คำนวณ-แสดงผล | เขียนขั้นตอน 1-2-3 ของโจทย์ แล้วแปลงเป็นโปรแกรมคำนวณตัวแรกที่รันได้ | ให้ AI อธิบายโค้ดทีละบรรทัด และรู้ว่าอะไรห้ามส่งให้ AI (รหัสผ่าน ข้อมูลส่วนตัว) |
| 02 | การตัดสินใจและการทำซ้ำ | ให้โปรแกรมคำนวณเลือกทำตามเงื่อนไข (เช่น ส่วนลด) และถามซ้ำจนกว่าจะสั่งเลิก | ให้ AI ช่วยคิดว่าควรลองป้อนข้อมูลอะไร แล้วเทียบการไล่ทีละรอบของ AI กับของเรา |
| 03 | ฟังก์ชัน รายการข้อมูล และอัลกอริทึมพื้นฐาน | แบ่งโปรแกรมเป็นชิ้นที่ตั้งชื่อได้ เก็บประวัติผลคำนวณ และหาผลรวม ค่ามากสุด ค้นหา เรียงลำดับได้เอง | ให้ AI ไล่การทำงานของลูปทีละขั้น แล้วเทียบกับที่เราไล่เอง |
| 04 | หาจุดผิด และสร้างงานกับ AI | อ่านข้อความแจ้งข้อผิดพลาดแล้วแก้เองได้ และโปรแกรมคำนวณของตัวเองเสร็จใช้งานได้ | ทั้งชั่วโมงที่สอง: แตกงานเป็นขั้นตอน ให้ AI เขียนทีละส่วน แล้วทดสอบเอง |
| 05 | ข้อมูลแบบมีชื่อกำกับ | เก็บข้อมูลแบบ "ชื่อ: ค่า" เช่น รายการสินค้าหนึ่งชิ้น | ให้ AI เทียบให้ดูว่าเรื่องเดียวกันเขียนใน Python และ JavaScript ต่างกันอย่างไร |
| 06 | ไฟล์และการบันทึกข้อมูล | ให้โปรแกรมจำข้อมูลไว้ได้ แม้ปิดแล้วเปิดใหม่ | ให้ AI เขียนโค้ดอ่านไฟล์ แล้วเราตรวจและแก้เอง |
| 07 | ใช้โค้ดของคนอื่น | ติดตั้งชุดโค้ดสำเร็จรูป (library) แล้วใช้งานตามคู่มือได้ | ให้ AI อ่านคู่มือของ library แล้วสรุปวิธีใช้ให้ |
| 08 | ดึงข้อมูลจากอินเทอร์เน็ต | ให้โปรแกรมดึงข้อมูลจริง เช่น อัตราแลกเปลี่ยน มาคำนวณได้ | ส่งข้อผิดพลาดให้ AI ถามหาสาเหตุ แล้วพิสูจน์เองว่าคำตอบถูก |
| 09 | แก้โจทย์ที่ใหญ่ขึ้น | แตกโจทย์ใหญ่เป็นโจทย์ย่อย และเลือกวิธีที่เหมาะกับข้อมูล | ให้ AI เสนอหลายวิธี แล้วเราเลือกและอธิบายได้ว่าทำไม |
| 10 | หน้าเว็บสำหรับโปรแกรมของเรา | ทำหน้าเว็บง่าย ๆ ให้คนอื่นกดใช้โปรแกรมของเราได้ | ให้ AI ช่วยจัดหน้าตา แล้วเราอ่านและปรับโค้ดเอง |
| 11 | โปรเจคของฉัน: วางแผนและลงมือ | แปลงไอเดียของตัวเองเป็นขั้นตอน แล้วสร้างส่วนแรกให้ทำงานได้ | ทั้งคลาส |
| 12 | โปรเจคของฉัน: ทำให้เสร็จ และเรียนต่อเอง | มีโปรเจคเล็ก ๆ ที่ใช้งานได้จริง 1 ชิ้น และแผนเรียนต่อด้วยตัวเอง | ทั้งคลาส ตั้งแต่วางแผนจนถึงทดสอบ |

Bonus page `extras/bonus-plan-your-own-idea.md` (not a schedule row): "ชั่วโมงพิเศษ: นำไอเดียของตัวเองมาแตกเป็นขั้นตอน 1-2-3 ร่วมกับ AI".

### 5c. Course overview, `programming-basics-ai/README.md` (sections only; written at build)

Who it is for · what you will be able to do · how we learn (steps 1-2-3 in Thai first, then Python, with JavaScript
beside it) · the three blocks of 4 classes (§4) ·
the §3 topic table · how AI fits (§4) · what you need (a computer with Windows or Mac, internet, VS Code; the rest is
installed in class 1) · links to the schedule and the front page.

## 6. Decision pack for the owner (through the PM, at AC-1)

`Checked: DECISIONS 2026-11-12 (6 lines; the 6th settles course shape, 01–04 for the first learner, no dates) ·
SYSTEM-FACTS § What the desk makes / § Repos / § The first learner's order · REQ-001 Q1–Q5 — lines below are not covered.`
Already decided, shown for the owner's eyes only: 12 classes × 2 h; 01–04 = one calculation program; no dates in the repo.
The owner corrects only the line that is wrong:

1. **Days and times:** set with each learner; the schedule page shows no fixed rhythm. (Q2)
2. **Blocks of 4 classes, each ending with something working** (01–04 calculation program · 05–08 a program that remembers
   and gets data from the internet · 09–12 a web page and the learner's own project). Matches the 8 / 16 / 24 h tiers.
3. **Classes 11–12, "my own project":** yes. If no, they become two more guided projects. (Q3)
4. **One repo for several courses:** the course lives in its own folder, so a second course goes beside it. (Q4)
5. **Languages:** Python first, JavaScript beside it (and in the browser for class 10).
6. **AI:** about one third of the time. Any free AI chat; no paid AI API.
7. **Format:** Markdown only; no slides for now. The bonus hour is a page in `extras/`, not a class.
8. **Course name on the front page:** "เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน + ใช้ AI เป็นผู้ช่วย" (PM's wording call).

## 7. Tasks

Class 01 is taught on 2026-11-16, and its material is due 2026-11-15 (REQ-002). So **TASK-001 is cut now (2026-11-12)**,
in parallel with AC-1, as REQ-002 § Constraints asks. It builds the structure only: placeholders and no lesson content,
so REQ-001 Requirement 7 holds. The owner's AC-1 answer changes words and class titles, which the FE then edits
before QA runs.

- **TASK-001 (FE):** build §1 in `code-class-docs`: the front page (5a), the overview (5c), the schedule (5b), 12
  placeholders and an empty-of-content `extras/` bonus page placeholder. No commit. The DoD maps to AC-2, AC-3, AC-5,
  AC-8, AC-9 and AC-10, and includes `git status -sb` showing only untracked/modified files on `main`. The PM's final
  Thai words, and any AC-1 correction, come as an amendment to the TASK.
- AC-4 is carried by §3, which the overview prints. AC-6 is carried by the front page holding no contact. AC-7 is
  carried by "no git in the TASK".
- If the owner changes the class list, only §1's class list and §5b change; everything else holds.

## Non-functional

- Renders the same on GitHub and in the VS Code preview: relative links to files only, plain GitHub-flavoured Markdown
  tables, no HTML and no embedded images in this REQ.
- No personal data (REQ-001 Requirement 8). The owner appears, if at all, only as the teacher.

## Risks, assumptions, unknowns

- **AC-8 (no jargon before it is explained):** the draft explains "AI", "VS Code" and "library" at first use. Python and
  JavaScript are introduced as "two programming languages". The PM's final wording must keep that. *Settled by:* QA's
  AC-8 read.
- **Assumed:** the learner has Windows or Mac and internet access. Linux and phone-only learners are not considered.
  *Settled by:* the owner at AC-1, if it matters.
- **Unknown:** whether the owner wants slides. *Settled by:* §6 line 6.
- **Inferred, not verified:** that GitHub renders Thai inside table cells without breaking the layout. It renders UTF-8
  Markdown in general, but nobody has run it on this repo. *Settled by:* QA's GitHub check after the owner's push
  (AC-2, reported `NOT_TESTED` until then).

## Questions

*(none for the PM. Everything open is in §6, for the owner at AC-1.)*
