# REQ-002: Class material for the first learner's four evenings (classes 01–04 + bonus)
- Status: READY_FOR_SA (2026-11-12)
- Priority: HIGH — class 01 is taught 2026-11-16 18:30
- Requested: 2026-11-12 by the owner — stamp: `operator` ("เอาตามนั้น" on the PM's recommendation, which included
  "ทีมจะเร่งทำเนื้อหาคลาส 1 ให้เสร็จก่อนวันจันทร์"; `DECISIONS.md` 2026-11-12)
- Deadline per class `[PM-decided from the sold timetable]`: 01 → 2026-11-15 · 02 → 2026-11-16 · 03 → 2026-11-17 ·
  04 → 2026-11-18 · bonus 05 → 2026-11-19. Each is ready the day before it is taught.
- Depends on: REQ-001 AC-1 (the owner's yes on languages, format and the class list). Class 01 cannot be final before it.
- Source: `talks/2026-11-12-learner-fastwork-chat-summary.md`, `talks/SA-SPEC-001-8-hour-shape-option-2026-11-12.md`

## Problem / Goal

The first learner has paid for 8 hours: 4 evenings × 2 h, 2026-11-16..19, plus a 1 h bonus on 2026-11-20 if they leave
a review. They tried to learn alone before and gave up because they could not see how steps turn into a project:
> "จำจุดไม่ถูกว่าสเตป1 2 3 ต้องไปยังไงถึงจะเห็นภาพครับ" (learner, Fastwork chat 2026-11-10) `[customer-asked]`
> "Aiก็ได้ครับแต่อยากได้พวกอัลกอริทึมเวลาอ่านโค้ดจะได้เข้าใจด้วยครับ" (learner, 2026-11-11) `[customer-asked]`

When this is done, the owner can teach each evening from one page, and the learner leaves each evening with something
that runs and with steps they can follow again alone.

## Requirement

1. One lesson page per class (01–04, and 05 for the bonus hour), inside the folder REQ-001 sets up. `[operator]`
2. Each class starts from **steps 1-2-3 in plain Thai** for the problem, then turns them into code. `[customer-asked]`
3. Across 01–04 the learner builds **one small calculation program that grows each evening**, and it works at the end
   of class 04. `[operator — DECISIONS 2026-11-12]`
4. Each class has: the example code, at least one exercise with its expected result, and its AI part. `[team-proposed]`
5. Example code is written in the language the owner approves at REQ-001 AC-1 and runs as written. `[team-proposed]`
6. Wording fits an adult beginner: Thai, no exam or school framing, every technical term explained at first use.
   `[operator — learner profile]`
7. No learner name, contact or personal detail anywhere. `[operator — SYSTEM-FACTS § Privacy]`

## Acceptance Criteria

- [ ] **AC-1** — **Given** the class 01 page, **When** the owner reads it before 2026-11-15 ends, **Then** he says he can
  teach from it (or says what to change).
  - Check: the owner only, via the PM. No team member ticks this.
- [ ] **AC-2** — **Given** any class page, **When** QA runs every code example exactly as the page says, **Then** each runs
  and prints what the page says it prints.
  - Check: QA, on a clean local setup that follows the class 01 install steps; command + output pasted in the TEST.
- [ ] **AC-3** — **Given** any exercise, **When** QA solves it using only that page and earlier pages, **Then** the result
  matches the expected result written on the page.
  - Check: QA, per exercise.
- [ ] **AC-4** — **Given** class 04's page, **When** QA follows classes 01–04 in order, **Then** the calculation program
  works at the end with the features the four pages promise.
  - Check: QA runs the final program with the inputs the page lists.
- [ ] **AC-5** — **Given** each page, **When** QA reads it, **Then** the "steps 1-2-3 in plain Thai" section comes before
  the code for the main problem.
  - Check: QA reads each page.
- [ ] **AC-6** — unhappy path: **Given** class 01's install steps, **When** QA follows them on Windows, **Then** the
  learner's first program runs; any step that fails is a finding.
  - Check: QA on Windows. Mac is `NOT_TESTED` unless a Mac is available.
- [ ] **AC-7** — **Given** all pages, **When** QA searches and reads them, **Then** there is no personal data and no exam,
  grade or semester wording.
  - Check: QA search + read, as in REQ-001 AC-6 / AC-8.
- [ ] **AC-8** — regression: **Given** the build, **When** QA checks git, **Then** nothing was committed or pushed by the
  team (same as REQ-001 AC-7).
  - Check: QA, read-only git.

## User-facing wording

Lesson pages are Thai. The SA's draft wording is reviewed by the PM before QA's run; the PM owns the final words.

## Constraints

- Class 01 waits only on REQ-001 AC-1; the team prepares it in parallel so the owner's yes is the last step.
- Git only on the owner's command. The learner sees the pages only after the owner pushes (`CLAUDE.md` §6).

## Out of Scope

- Classes 05–12 of the full course (except the bonus hour page).
- Slides, video, a website.
- Messages to the learner in Fastwork — the PM drafts them separately, and the owner approves each before it is sent.

## Questions

*(none yet)*

## Verification (written when the work comes back)

| AC | Verdict | What I checked myself |
|---|---|---|
