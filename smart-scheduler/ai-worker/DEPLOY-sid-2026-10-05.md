# DEPLOY — sid — 2026-10-05 (BOTH TEAMS: REQ-113 + Team B's batch)
**Written by @Sober for @Porter.** **Read it in order; the order is the instruction.**

> 🔴 **THIS IS sid ONLY. uat is NOT on this release.** **uat is on the PREVIOUS release — the REQ-111 batch (`DEPLOY-uat-2026-10-04.md`) — staged on the server and shipping separately.** 🚫 **Nothing in this note describes uat, and nothing here may be read as a uat step.**

✅ **Verified by @Sober on ONE tree holding BOTH teams' work — counts, not colours, every break-and-watch set re-run by him, not taken from either team's report.** 📌 **A sid batch is ONE batch: no team is reported green alone.**

---

## 0. 🔴 THE TWO SHIP-PAIRS — **a correctness constraint, not advice**
- 🔴 **`TASK-644` (back) + `TASK-662` (front) ship TOGETHER, or not at all.** **The server's specific refusal ("a new student needs a parent phone") rides only in the error's `details`, and only 662's front-end branch shows it.** ⇒ **644 alone shows a generic "invalid data" beside a phone label reading "(optional)" — worse than the defect it fixes.**
- 🔴 **`TASK-663` (back) + `TASK-664` (front) ship TOGETHER, route first.** **The People filter is nothing without the route behind it.** *(663 alone is harmless — one new optional parameter.)*
⇒ **In practice: deploy BOTH repos together, as always — that satisfies both pairs.**

## 1. Environment — 🚫 nothing new
**No new keys.** **The one standing grant (`teachers.budget-view`, from the REQ-111 batch) is already @Porter's.**

## 2. Migration — **none in this batch, but RUN IT AND VERIFY IT**
```bash
bun run db:migrate
```
**Expect `Journal: 65 migration(s)` and the green verify line.** 🔑 **If RED: missing ledger rows, not missing work — `bun run db:seed-ledger` (dry run, read every line), then `--apply`, then re-run.** 🚫 **Never start the app against a schema verify has called bad.**

## 3. Start the code — **BE and FE TOGETHER** (§0 is why)

## 4. What goes out
### Team A
1. **`TASK-645` (REQ-113) — the `LAST` badge now STAYS after the final session is checked in**, and on a `NO_SHOW` final session too. **The admin team's end-of-day "who finished?" review now finds them.** ⚠️ **It is PERMANENT on that cell — by the owner's ruling.** ✅ **The course's displayed END date is unchanged** (a separate rule, pinned).
### Team B
2. **`TASK-660` — a digit search no longer floods the bookings list** (`?q=2` stops returning everyone; a phone search still works).
3. **`TASK-661` — the check-in sentence reads A′**, owner-approved wording.
4. **`TASK-644` + `TASK-662` — a NEW student needs a parent phone** on bookings, new courses and new vouchers. ✅ **IMPORTS are EXEMPT** (owner ruling: off-card history may have no phone).
5. **`TASK-663` + `TASK-664` — children with no parent are MARKED and FINDABLE:** a grey **"ยังไม่มีผู้ปกครอง"** tag in the student picker, and a People switch **"นักเรียนที่ยังไม่มีผู้ปกครอง"** that lists them with a count.

## 5. ✅ The numbers — **both teams, one tree, re-run by @Sober**
**Back: `3974 pass · 0 fail` · type-check clean · `65 = 65`.** **Front: `991 pass · 0 fail` across 110 files · type-check clean · build clean.**
**Break-and-watch — ALL NINETEEN sets re-run by @Sober:**
- **Team A, back:** `608` 9/9 · `609` 7/7 · `625` 10/10 · `629` 12/12 · `632` 8/8 · `634` 10/10 · `645` 7/7 · `646` 8/8 · `647` 6/6 · `648` 6/6 · `650` 7/7
- **Team B, back:** `660` 6/6 · `661` 4/4 · `644` 6/6 · `663` 5/5
- **Team A, front:** `611` 24/24 · `634` 11/11
- **Team B, front:** `662` 9/9 · `664` 7/7
**0 survived · 0 inconclusive · every file restored byte-identical.**
⚠️ **Team B's two FRONT sets carry no test list inside the file** (the front runner cannot read one until `TASK-637`). **@Sober ran them with the lists Team B recorded in their own TASK files — 🚫 not guessed.**

## 6. 🔴 What Team B's work changes on a TEAM A screen — **checked, not assumed**
- **The booking modal (ours) now REQUIRES a parent phone for a NEW student** — the phone field it already showed becomes required. ✅ **Picking an existing student asks for nothing.**
- ⚠️ **An อื่นๆ (OTHER) booking with a typed NEW name now needs a phone too** (owner's ruling). **An OTHER booking with NO student is unchanged.**
- **Our booking modal's picker shows the grey "ยังไม่มีผู้ปกครอง" tag** on a parentless child — still pickable.
- ✅ **The shared error branch Team B added is scoped to ONE case** — a `VALIDATION` refusal whose detail sits at exactly `student.phone`. **Every other refusal on our screens (leave, swap, rate) reads exactly as before.** *(Read in the code and covered by Team B's own test.)*
- ✅ **No Team A test depended on the phone being optional — the full front suite is green on the combined tree.**

## 7. What @Tanya tests — **routes first, then screens** (Team B's list is in `HANDOFF-teamB-next-batch-2026-10-05.md`; Team A's below)
### 🔴 The one thing NOTHING automated covers — **she must SEE it**
**`TASK-645`'s own stated gap: the calendar screen's wiring into the LAST badge is proven by READING the code, not by a value test — the repo has no end-to-end test of the calendar read.** ▶️ **On sid: check in a course's LAST session, and look at the calendar. The `LAST` badge must still be on that cell — in BOTH the daily and the weekly grid.**
### Team A, the rest
- **A `NO_SHOW` on the final session ⇒ the badge stays.**
- **A `SICK_LEAVE` on the final date ⇒ NO badge on it; the lesson before it carries the badge.**
- **A make-up added AFTER the last attended session ⇒ the badge MOVES to the make-up** (correct — it is now the last lesson).
- **The course's END date shown on the plan is UNCHANGED** for an all-attended course.
### Where the teams meet — on OUR screen
- **The booking modal: a new name ⇒ phone required; an existing student ⇒ no phone; an OTHER booking with a new name ⇒ phone required; a refusal reads as the approved sentence, not "ข้อมูลที่กรอกไม่ถูกต้อง".**

## 8. Rollback — **both repos together; the database is left alone**
**No migration ⇒ nothing to undo.** **Students created after this deploy simply HAVE a parent; old code reads them fine.** ⚠️ **After a rollback the LAST badge vanishes at check-in again.**

## 9. ⚠️ Known and deliberate
- **The `LAST` badge is PERMANENT on the final cell once delivered** — the owner's ruling.
- **Imports may still create a student with no parent** — the owner's exemption; **Piece B's tag and People switch are what make those findable.**
- ✅ **The comment on the badge's DTO field (`src/db/mappers.ts`) now describes the REAL rule** — the last LESSON, its own rule, deliberately NOT the plan's displayed end. **Landed before commit, comment-only, and re-verified: back `3974 pass · 0 fail`, type-check clean, `65 = 65`.**
- 📌 **Team B's handoff still lists "REQ-113 LAST badge — which team, NO_SHOW?" as an open owner question. 🔴 It is ANSWERED and SHIPPED here (Team A, NO_SHOW keeps it). 🚫 Do not put it to the owner again.**
