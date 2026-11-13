# REQ-001: First course — a course repo a Fastwork client can read, with its schedule and outline
- Status: READY_FOR_SA (2026-11-12, after the second-reading round)
- Priority: HIGH `[operator 2026-11-12 — "งานแรก"]`
- Requested: 2026-11-12 by the owner — stamp: `operator` (to Atlas, recorded in `MARIE.md` ORDER 65 and `SYSTEM-FACTS.md`)
- Deadline: 2026-11-15 (the structure must be in place before class 01 on 2026-11-16) `[PM-decided 2026-11-12, from the sold timetable]`
- Depends on: none
- Source: `SYSTEM-FACTS.md` § "The owner's words at desk-open"; `DECISIONS.md` lines of 2026-11-12

## Problem / Goal

The owner takes freelance work teaching programming and AI, and finds clients on Fastwork. He has his first learner
and nothing to show: the course repo `code-class-docs` holds only a title README (`I checked:` `git log` →
`54e1529 Initial commit`, README only, 2026-11-12).

The first learner is an adult who is not studying for a qualification, is bored with the day job, and wants to build
their own projects. The owner wants them to learn the programming basics that are the same in every language, with AI
added so they keep learning faster and build projects faster later.

When this REQ is done, the owner can open the repo and show what the course is, in what order it runs and what each
class covers — and it looks good enough to put in front of a Fastwork client.

> "งานแรก สอน ลูกค้าที่ไม่ได้เรียนเพื่อการเรียน เขาแค่เบื่องานประจำ แล้วอยากทำโปรเจคตัวเอง
> อยากให้  design folder structure ให้ดูดี ใช้สำหรับการให้คุย fastwork แทน
> ให้สร้างตารางเรียน  ว่าจะเรียนอะไรบ้าง
> ฉันตั้งใจจะให้เรียน โปรแกรมมิ่งพื้นฐาน เพราะว่าจะได้เข้าใจ พื้นฐาน ที่ทุกภาษาเหมือนกัน
> แต่ก็แถมเรื่องเอไอ ติดไปด้วย เขาจะได้ เรียนรู้ต่อ ได้ไว ขึ้น และสร้างโปรเจคได้ไวขึ้นในอนาคต" (owner, 2026-11-12)

> "ให้ทีม https://github.com/develyst1/code-class-docs.git clone ลงไปตรงที่ฉันทำประจำแล้วทำงานได้เลย" (owner, 2026-11-12)

## Requirement

1. **Folder structure.** `code-class-docs` must have a folder structure that a person opening the repo for the first
   time (a Fastwork client) can follow without explanation: where the course overview is, where the schedule is, where
   each class's material will live. `[operator]`
2. **Front page.** The repo's front page (what GitHub shows first) must say, in Thai, what the course is, who it is
   for, what the learner can do at the end, and link to the schedule. `[team-proposed — follows from 1 and "ดูดี"]`
3. **Class schedule.** A schedule table must list every class in order, each with: its number, its topic, what the
   learner can do after it, and where AI comes into it. `[operator: "ให้สร้างตารางเรียน ว่าจะเรียนอะไรบ้าง"]`
   Number of classes, class length and how often they run are proposed by the SA and approved by the owner
   `[team-proposed]` — see Q2.
4. **Course outline — basics.** The core of the outline is programming basics that are the same in every language,
   so the learner understands the foundation rather than one language's syntax. `[operator]`
5. **Course outline — AI.** AI is part of the course as an addition to the basics, aimed at learning on one's own and
   building projects faster after the course. `[operator: "แถมเรื่องเอไอ ติดไปด้วย"]` How much of the schedule it
   takes, and where, is the SA's proposal for the owner to approve. `[team-proposed]`
6. **Fit for this learner.** Topics and wording fit an adult beginner with no study goal who wants to build their
   own things — no exam-style or university-style framing. `[operator — learner profile]`
7. **Approval before content.** The SA's proposal (structure, schedule, outline, file format) reaches the owner
   through the PM and is approved **before** any class material is written. `[operator — DECISIONS 2026-11-12]`
8. **Privacy.** No learner's name, contact or other personal detail appears anywhere in the repo.
   `[operator — SYSTEM-FACTS "Privacy"]`

## Acceptance Criteria

- [ ] **AC-1** — **Given** the SA's proposal shown to the owner as one screen — the folder tree plus a mock of the
  front page and the schedule table — **When** the owner looks at it, **Then** he says yes (or says what to change).
  - Check: the owner only, via the PM; recorded verbatim in `DECISIONS.md`. No team member ticks this.
> **AMENDED 2026-11-12 by the PM, before hand-off** (nobody had worked to the ACs yet): AC-2..AC-7 reworded and
> AC-8..AC-10 added from the QA's check, `talks/QA-REQ-001-second-reading-and-ac-check-2026-11-12.md` §2 `[PM-decided]`.

- [ ] **AC-2** — **Given** the approved proposal is built in the repo, **When** someone opens the front page, **Then**
  it shows, **in Thai**: what the course is, who it is for, what the learner can do at the end, and a working link to
  the schedule.
  - Check: QA in VS Code Markdown preview on the local clone. The GitHub view is checked after the owner pushes; until
    then it is reported `NOT_TESTED`.
- [ ] **AC-3** — **Given** the schedule page, **When** a reader reads it, **Then** the classes are numbered 1..N with no
  gap, and every class has a topic, "after this class you can …", and its AI part (or "none") — no empty cell. The
  class length and frequency approved at AC-1 (Q2) appear on the schedule page.
  - Check: QA reads every row.
- [ ] **AC-4** — **Given** the outline, where the SPEC names two example languages, **When** QA checks each basics
  topic, **Then** every basics topic exists in both named languages.
  - Check: QA, topic by topic; a FAIL names the topic.
- [ ] **AC-5** — **Given** the folder tree, **When** a reader looks for the material of class N, **Then** they reach its
  folder from the schedule in one click, the folder name starts with the class number (zero-padded), the folder is
  not empty (it holds at least a placeholder with the class number and topic, so it survives git), and the number of
  class folders equals the number of schedule rows.
  - Check: QA tries the first, a middle and the last class, and counts folders against rows.
- [ ] **AC-6** — unhappy path: **Given** the repo after the build, **When** QA checks it for personal details, **Then**
  none is found: no phone number, email, LINE id or social handle (searched), and no person's name other than the
  owner as teacher (every file read). The owner's own contact is not on the front page either (see Q5).
  - Check: QA pastes the search command and result into the TEST, and lists the files read.
- [ ] **AC-7** — regression: **Given** the build, **When** QA looks at git, **Then** the root commit `54e1529` is
  unchanged, any newer commit is one the owner ordered (hash in the log), and no new branch exists.
  - Check: QA runs `git log --oneline`, `git status -sb`, `git branch -a` — read-only, no fetch.
- [ ] **AC-8** — **Given** the front page and the schedule, **When** QA reads them, **Then** there is no exam, grade,
  semester or credit wording, and no technical term is used before it is explained (Requirement 6).
  - Check: QA reads both pages; each hit is a finding.
- [ ] **AC-9** — **Given** the build, **When** QA lists the class folders, **Then** they hold only placeholders — no
  lesson, slide, exercise or example-code file (Requirement 7 and Out of Scope).
  - Check: QA lists every file under the class folders.
- [ ] **AC-10** — **Given** the front page, **When** a reader looks for the course overview and the schedule, **Then**
  each is one click away (Requirement 1).
  - Check: QA clicks both from the front page.

## User-facing wording

The front page and the schedule are read by clients and the learner, in Thai. The SA's proposal (AC-1) includes the
draft Thai text of the front page; the PM owns the final words and sets them before the build. No other strings yet.

## Constraints

- Repo `code-class-docs`, branch `main` only; the team works on `main` (`SYSTEM-FACTS.md` § Repos).
- Git only on the owner's command (`CLAUDE.md` §6). The repo becomes visible to a client only after he pushes it.
- Local only; publishing anywhere is the owner's (`SYSTEM-FACTS.md` § Environments).
- The format of the material (Markdown, slides tool, example-code language) is TBD — the SA proposes it in the SPEC,
  the owner approves (`SYSTEM-FACTS.md` § Repos).

## Out of Scope

- Writing the class material itself — lessons, slides, exercises, example code. That is the next REQ, after AC-1.
- Prices, packages and the Fastwork listing text — the owner's business, not asked for.
- Anything about a specific learner beyond the profile above.
- A website or app; this is a repo.

## Questions

- **Q1 (PM → owner — does not block the SA starting; affects the front page)** — What does "ใช้สำหรับการให้คุย
  fastwork แทน" replace? My reading is in "Second reading" below.
  > recommendation `[team-proposed]`: write the front page for a prospective client first, with a clear "start here"
  > for the learner, so one repo works both ways. Asked only if the second-reading round cannot settle it.
  > answer: **SETTLED by the round 2026-11-12, not asked** `[PM-decided]` — one front page: on top, the course plan
  > written for a person who is talking with the owner now and still deciding (what they will learn, in what order,
  > how long), not a public sales page; below, "start here" for the learner. Either reading leaves the tree and the
  > schedule the same. See "Second reading" → Outcome.
- **Q2 (SA proposes → owner approves — does not block)** — How many classes, how long each, how often. Nothing is
  recorded. The SA proposes numbers with a reason; the owner approves them at AC-1.
  > answer: **ANSWERED 2026-11-12 by the owner, `[operator]`** — "เอาตามนั้น" on the PM's recommendation
  > (`DECISIONS.md` 2026-11-12): the full course is 12 classes × 2 h; the first learner takes 01–04 (4 evenings ×
  > 2 h, 2026-11-16..19) + a 1 h bonus. Classes 01–04 are re-cut to end with one small working calculation program.
  > The repo shows "4 evenings × 2 hours" style counts, no real dates `[PM-decided]`.
- **Q3 (SA proposes → owner approves — does not block)** — Should the course end with the learner's own small
  project? The owner said the learner wants their own projects and AI should help them build "ในอนาคต" (later), so
  this is not asked for. The SA may offer it as an option at AC-1, marked `team-proposed`.
  > answer: **ANSWERED 2026-11-12** — the first learner's 8 h end with one small working calculation program (owner's
  > "เอาตามนั้น", `DECISIONS.md`). Whether class 12 of the full course is "my own project" stays an AC-1 line.
- **Q4 (SA → owner — does not block)** — Is the repo for this one course, or the home of several courses later?
  > recommendation `[team-proposed]`: a structure that can take a second course without moving the first; build only
  > the first.
  > answer: _(pending)_
- **Q5 (QA → PM — does not block)** — May the owner's own contact (phone / LINE / email) be on the front page?
  > answer: **Not in this REQ** `[PM-decided 2026-11-12]` — Fastwork handles contact, and leaving it out is cheap to
  > undo. Interpreted the owner's privacy rule as also covering his own contact until he says otherwise.

## Second reading — what "ใช้สำหรับการให้คุย fastwork แทน" means

- **What I read it as:** the repo is the thing the owner sends or shows a client in the Fastwork chat, instead of
  explaining the course in messages — a brochure and portfolio for clients who have not hired him yet.
- **The strongest other reading:** the repo is how the owner works with *this* learner, who came through Fastwork —
  the schedule and material live there instead of being sent piece by piece in the Fastwork chat. The reader is the
  enrolled learner, not a prospect, and the front page is a "start here" for study, not a pitch.
- **What would tell them apart:** who reads the front page first — a client deciding whether to hire, or the learner
  who already paid. It changes the front page's tone and order, not the folder tree or the schedule. If both readers
  fit one page, there is nothing to ask the owner.
- **Asking:** @Sober · @Tanya — one reply each in `inbox/PM.md`: "holds because …" / "the other is stronger
  because …" / "a third: …" / "run <check>".
- **Replies (2026-11-12):** the SA — holds: "ดูดี" only matters to someone still deciding; one page can serve both
  (pitch on top, "start here" below), same tree and schedule. The QA — a third reading: the first reader is *this*
  client, mid-deal on Fastwork (the owner calls them "ลูกค้า" of "งานแรก"); one page still fits; write the pitch for a
  person talking with the owner now, not as a public sales page. Full reply:
  `talks/QA-REQ-001-second-reading-and-ac-check-2026-11-12.md`.
- **Outcome** `[PM-decided 2026-11-12]`: one front page — the course plan on top for a person still deciding (the
  QA's framing), "start here" below. No question to the owner: no answer to "already paid or not" changes a file in
  this REQ. The status line in `SYSTEM-FACTS.md` that "the repo may be shown to other clients" is a recorder's
  summary, not the owner's words; this REQ does not rely on it.

## Verification (written when the work comes back)

| AC | Verdict | What I checked myself |
|---|---|---|
