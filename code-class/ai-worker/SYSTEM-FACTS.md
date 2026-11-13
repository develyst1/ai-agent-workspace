# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-11-12, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative, environment facts.
>
> **The rule that makes it work — the PM's, binding on the PM:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the `operator` seat — the workspace owner (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-11-12)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## The owner's words at desk-open (verbatim, to Atlas, 2026-11-12; `MARIE.md` ORDER 65)

- *"เปิดโต๊ะให้หน่อยพอดีฉันมีงานฟรีแลนซ์ในการรับสอนเขียนโปรแกรมสอนโปรแกรมมิ่งหรือว่าสอน AI พวกเนี้ยเปิดโต๊ะให้หน่อย"*
- *"งานแรก สอน ลูกค้าที่ไม่ได้เรียนเพื่อการเรียน เขาแค่เบื่องานประจำ แล้วอยากทำโปรเจคตัวเอง
  อยากให้  design folder structure ให้ดูดี ใช้สำหรับการให้คุย fastwork แทน
  ให้สร้างตารางเรียน  ว่าจะเรียนอะไรบ้าง
  ฉันตั้งใจจะให้เรียน โปรแกรมมิ่งพื้นฐาน เพราะว่าจะได้เข้าใจ พื้นฐาน ที่ทุกภาษาเหมือนกัน
  แต่ก็แถมเรื่องเอไอ ติดไปด้วย เขาจะได้ เรียนรู้ต่อ ได้ไว ขึ้น และสร้างโปรเจคได้ไวขึ้นในอนาคต"*
- *"ให้ทีม https://github.com/develyst1/code-class-docs.git clone ลงไปตรงที่ฉันทำประจำแล้วทำงานได้เลย"*

## What the desk makes [operator 2026-11-12]

- **Teaching material, not an app.** The owner takes freelance work teaching programming and AI.
- **A course repo (`code-class-docs`) that looks good enough to show clients while talking on Fastwork** (owner:
  *"ใช้สำหรับการให้คุย fastwork แทน"*; what exactly it replaces is not recorded — ask, don't infer).
- **A class schedule:** what is learned, in what order.
- **The first learner:** an adult who is not studying for a qualification, is bored with the day job and wants to build
  their own projects.
- **Content:** programming basics that are the same in every language, **plus AI** as a bonus, so the learner keeps
  learning faster and builds projects faster later.
- **Privacy:** no learner's name, contact or personal detail in the repo or any desk file beyond "the learner"; the
  repo may be shown to other clients.
- **The learner is reached only through the owner** (clients talk to him on Fastwork). Their words reach the desk
  stamped `customer-asked` / `customer-validated (date + channel)`.

## Repos and environments

- **`code-class-docs`** — the course repo. Remote `https://github.com/develyst1/code-class-docs.git`. Path: workspace-root
  `machine.local.md` only. (Marie, read-only survey 2026-11-12) Branch `main` only, one commit `54e1529 Initial
  commit`, one file `README.md` containing just the title `# code-class-docs`. Greenfield.
- **Git:** `CLAUDE.md` §6. The repo has only `main`; the owner's standard branches come only from his `ตั้ง branch`
  command, if he wants them. The team works on `main` until he says otherwise.
- **Stack / format** of the material (Markdown, slides tool, example-code languages): **TBD — the SA proposes in
  REQ-001's SPEC; the owner approves through the PM.**
- **Environments:** local only. No server, no deploy; publishing anywhere is the owner's.

## Team [operator 2026-11-12]

- One team, manual mode, sessions `<Name>-CLS`: Porter (PM) · Sober (SA — curriculum + repo folder structure) ·
  Fern (FE — slides, lesson pages, example code) · Tanya (QA — tries every exercise). No BE seat. Roster: `TEAMS.md`.

## Fastwork chat [operator 2026-11-12, to the PM]

- The owner wants the desk to read his Fastwork chat, analyse it, turn it into the course documents (approach,
  schedule) and answer the chat for him: *"Fastwork.co มี API มั้ย ถ้าไม่มีเปิด fastwork.co รหัสฉันเข้าไปดูแชท
  วิเคราะห์ แล้วนำมาเอกสาร ต่างๆ แนวการเรียน คารางเรียน รวมถึงตอบแชทแทนฉัน"* (owner, 2026-11-12).
- (PM, 2026-11-12) No public Fastwork developer API was found by web search (two searches, EN + TH, no Fastwork result).
  Not proof that none exists. UNVERIFIED.
- (PM, 2026-11-12, safety limits, not the owner's decision) An agent never types the owner's password: he signs in
  himself in the app's browser pane. Every chat reply is drafted by the PM and sent only after the owner's yes on that
  exact text. Chat contents reach desk files summarised, with no learner name or contact (§ Privacy above).

## The first learner's order [customer-validated 2026-11-12, Fastwork order + chat; read by the PM]

- Sold: 1,500 THB = **8 teaching hours**, paid 2026-11-12. Owner's tiers: 1,500 = 8 h · 3,000 = 16 h + 1 · 4,500 = 24 h + 2;
  max 3 h a day; online. Detail: `talks/2026-11-12-learner-fastwork-chat-summary.md`.
- Timetable agreed: **2026-11-16 → 2026-11-19, 18:30–20:30 daily**, plus a bonus hour 2026-11-20 18:30–19:30 if the
  learner reviews on Fastwork first. **Class 1 is 2026-11-16.**
- Learner wants basics + algorithms for a personal project; tried before and gave up because they could not see how
  steps become a project. AI is fine, but they want to be able to read code.

## Open questions for the owner — asked by the PM, answered here

*(none yet)*
