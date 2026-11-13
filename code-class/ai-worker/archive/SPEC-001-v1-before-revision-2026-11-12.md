# SPEC-001: First course: repo structure, front page, schedule and outline (the proposal for AC-1)
- Source: REQ-001
- Status: DRAFT: the proposal waits for the owner's AC-1 answer through the PM. No TASK is cut until then (REQ-001 Requirement 7).
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
(REQ-001 Q1 outcome). The schedule has 12 classes. Each class teaches one idea that is the same in every language. It is
shown in two named languages, with a short AI slot in every class and two classes built around AI at the end.

## 1. Folder tree `[SA-proposed]`

```
code-class-docs/
├── README.md                          ← front page (Thai): the plan for the person deciding, then "start here"
└── programming-basics-ai/             ← course 1 (a 2nd course gets a sibling folder; nothing moves)
    ├── README.md                      ← course overview: who, goal, approach, the two languages, how AI fits, tools
    ├── schedule.md                    ← the schedule table (12 rows) + class length and frequency
    └── classes/
        ├── 01-how-programs-think/README.md
        ├── 02-values-and-variables/README.md
        ├── 03-making-decisions/README.md
        ├── 04-repeating-work/README.md
        ├── 05-functions/README.md
        ├── 06-lists/README.md
        ├── 07-named-data/README.md
        ├── 08-finding-mistakes/README.md
        ├── 09-files-and-data/README.md
        ├── 10-using-others-code/README.md
        ├── 11-building-with-ai/README.md
        └── 12-my-own-project/README.md
```

Decisions inside the tree, with no effect on what a reader sees, so not asked `[SA-decided]`:
- **Folder and file names are English ASCII, lower-case, kebab-case, with a zero-padded number** (AC-5). Thai in a path
  becomes `%E0%B8…` in GitHub URLs and is awkward to type in a terminal. Thai titles go inside the files.
- **Every link targets a file (`…/README.md`), never a bare folder.** A link to a folder works on GitHub but not in the
  VS Code preview, which is QA's local check (QA talk §2, AC-2).
- **Each class folder holds one placeholder `README.md`** so that git keeps the folder (AC-5, AC-9). The placeholder holds
  only: the heading `คลาส NN — <topic>`, the schedule row's "after this class you can…" line, its AI part, and a link
  back to the schedule. No lesson content.
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
| Output / input (1) | `print`, `input` | `console.log`, `prompt` / `readline` |
| Values, variables, types (2) | `x = 5`, `str` `int` `float` `bool` | `let x = 5`, string number boolean |
| Conditions (3) | `if` / `elif` / `else` | `if` / `else if` / `else` |
| Loops (4) | `for`, `while` | `for`, `while`, `for…of` |
| Functions (5) | `def` | `function` / `=>` |
| Lists (6) | `list` | `Array` |
| Named data (7) | `dict` | object `{}` |
| Errors (8) | `try` / `except`, tracebacks | `try` / `catch`, stack traces |
| Files and JSON (9) | `open`, `json` | `fs`, `JSON` |
| Libraries and APIs (10) | `pip`, `requests` | `npm`, `fetch` |

Deliberately left out because they do not exist in the same form in both: classes/OOP, list comprehensions, pointers and async.

## 4. Schedule `[SA-proposed]` (Q2 and Q3)

**12 classes · 2 hours each · once a week (about 3 months).** Why: the learner has a day job, so one evening or weekend
slot a week is sustainable, and a week between classes leaves time to practise. Twelve classes cover ten basics topics
plus two AI-centred classes. **Alternative for the owner:** twice a week gives 6 weeks for the same content.

**How much is AI** (Requirement 5): classes 1–10 each end with a ~20-minute AI slot on that class's topic. Classes 11–12
are built around AI. That is about one third of the course time. The AI tool is **any free AI chat**, so the learner pays
nothing. Calling an AI from code (it needs an API key, which costs money) is deliberately left out.

**Class 12 is `team-proposed` (Q3).** If the owner says no, the course is 11 classes, and class 11 ends with "where to
go next".

## 5. Mock for AC-1: one screen for the owner (draft Thai; **the PM owns the final words**)

### 5a. Front page, `README.md`

```markdown
# เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน + ใช้ AI เป็นผู้ช่วย

คอร์สสอนตัวต่อตัว สำหรับคนทำงานที่อยากสร้างโปรเจคของตัวเอง ไม่ต้องมีพื้นฐานมาก่อน ไม่มีสอบ ไม่มีเกรด

## แผนการเรียน
- 12 คลาส คลาสละ 2 ชั่วโมง สัปดาห์ละครั้ง (ประมาณ 3 เดือน)
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

No contact and no price on the page (REQ-001 Q5 and Out of Scope). The last "เรียนจบแล้ว" bullet depends on class 12 (Q3).

### 5b. Schedule, `programming-basics-ai/schedule.md`

`12 คลาส · คลาสละ 2 ชั่วโมง · สัปดาห์ละครั้ง`

| คลาส | หัวข้อ | เรียนจบคลาสนี้แล้วคุณ… | ช่วงใช้ AI |
|---|---|---|---|
| 01 | โปรแกรมคิดอย่างไร + เตรียมเครื่องมือ | รันโปรแกรมแรกของตัวเองได้ ทั้งใน Python และ JavaScript | รู้จัก AI ผู้ช่วย: ให้อธิบายโค้ดทีละบรรทัด และรู้ว่าอะไรห้ามส่งให้ AI (รหัสผ่าน ข้อมูลส่วนตัว) |
| 02 | ข้อมูลและตัวแปร | เก็บตัวเลข ข้อความ และค่าจริง/เท็จ แล้วนำมาคำนวณได้ | ให้ AI ออกโจทย์ฝึกให้ตรงระดับของเรา |
| 03 | การตัดสินใจ (เงื่อนไข) | เขียนโปรแกรมที่ทำต่างกันตามข้อมูลที่ได้รับ | ให้ AI ช่วยคิดว่าควรลองป้อนข้อมูลอะไร โปรแกรมถึงจะพิสูจน์ได้ว่าถูก |
| 04 | การทำซ้ำ (ลูป) | สั่งให้โปรแกรมทำงานซ้ำ ๆ แทนเราได้ | ให้ AI ไล่การทำงานทีละรอบ แล้วเทียบกับที่เราคิด |
| 05 | ฟังก์ชัน | แบ่งโปรแกรมเป็นชิ้นเล็กที่ตั้งชื่อและเรียกใช้ซ้ำได้ | ให้ AI ช่วยดูว่าชื่อและการแบ่งชิ้นเข้าใจง่ายไหม |
| 06 | รายการข้อมูล | เก็บข้อมูลหลายชิ้นในรายการเดียว แล้วค้นหา เรียง และคัดกรองได้ | ให้ AI สร้างข้อมูลตัวอย่างไว้ฝึก |
| 07 | ข้อมูลแบบมีชื่อกำกับ | เก็บข้อมูลแบบ "ชื่อ: ค่า" เช่น ข้อมูลสินค้าหนึ่งชิ้น | ให้ AI เทียบให้ดูว่าเรื่องเดียวกันเขียนใน Python และ JavaScript ต่างกันอย่างไร |
| 08 | หาจุดผิดและแก้ไข | อ่านข้อความแจ้งข้อผิดพลาดแล้วหาจุดผิดได้เอง | ส่งข้อผิดพลาดให้ AI ถามหาสาเหตุ แล้วพิสูจน์เองว่าคำตอบถูก |
| 09 | ไฟล์และข้อมูล | อ่านและบันทึกข้อมูลลงไฟล์ได้ | ให้ AI เขียนโค้ดอ่านไฟล์ แล้วเราตรวจและแก้เอง |
| 10 | ใช้โค้ดของคนอื่น | ติดตั้งชุดโค้ดสำเร็จรูป (library) และดึงข้อมูลจากอินเทอร์เน็ตได้ | ให้ AI อ่านคู่มือของ library แล้วสรุปวิธีใช้ให้ |
| 11 | สร้างงานกับ AI | แตกไอเดียเป็นขั้นตอน ให้ AI เขียนทีละส่วน แล้วทดสอบเองได้ | ทั้งคลาส |
| 12 | โปรเจคของฉัน | มีโปรเจคเล็ก ๆ ที่ใช้งานได้จริง 1 ชิ้น และแผนเรียนต่อด้วยตัวเอง | ทั้งคลาส ตั้งแต่วางแผนจนถึงทดสอบ |

### 5c. Course overview, `programming-basics-ai/README.md` (sections only; written at build)

Who it is for · what you will be able to do · how we learn (one idea per class, Python first, JavaScript beside it) ·
the §3 topic table · how AI fits (§4) · what you need (a computer with Windows or Mac, internet, VS Code; the rest is
installed in class 1) · links to the schedule and the front page.

## 6. Decision pack for the owner (through the PM, at AC-1)

`Checked: DECISIONS 2026-11-12 (5 lines) · SYSTEM-FACTS § What the desk makes / § Repos · REQ-001 Q1–Q5 — none of these are covered.`
The owner corrects only the line that is wrong:

1. **Length:** 12 classes · 2 hours each · once a week (alternative: twice a week, 6 weeks). (Q2)
2. **Class 12, "my own project":** yes. If no, the course has 11 classes and the last "เรียนจบแล้ว" bullet is removed. (Q3)
3. **One repo for several courses:** the course lives in its own folder, so a second course goes beside it. (Q4)
4. **Languages:** Python first, JavaScript beside it.
5. **AI:** about one third of the time. Any free AI chat; no paid AI API.
6. **Format:** Markdown only; no slides for now.
7. **Course name on the front page:** "เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน + ใช้ AI เป็นผู้ช่วย" (PM's wording call).

## 7. Tasks: cut after the owner's AC-1 yes, not before

- **TASK-001 (FE):** build §1 in `code-class-docs`: the front page (5a, final words from the PM), the overview (5c), the
  schedule (5b), and 12 placeholders (the §1 rule). No commit. The DoD maps to AC-2, AC-3, AC-5, AC-8, AC-9, AC-10, and
  includes `git status -sb` showing only untracked/modified files on `main`. It depends on: the owner's AC-1 answer, and
  the PM's final Thai text.
- AC-4 is carried by §3, which the overview prints. AC-6 is carried by the front page holding no contact. AC-7 is
  carried by "no git in the TASK".
- If the owner changes the number of classes, only §1's class list and §5b change; everything else holds.

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
