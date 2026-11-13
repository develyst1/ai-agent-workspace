# REQ-001: God Plan first release — the owner plans, the people he works with can see and comment
- Status: **DELIVERED** (2026-11-10, PM — local release 1; owner via Atom 16:52: "ประกาศ DELIVERED ได้เลย ย้ายเทสมือถือ/คีย์บอร์ด/screen reader ไปไว้ก่อน deploy". PM re-checked `api-real-5c/results.json` 34 PASS + 1 UI-only. Carried to the deploy gate: real phone / keyboard / screen reader, /impeccable, sign-in throttle, proxy read timeout > 25 s. Not deployed.) ~~TEST_PASSED~~ (2026-11-09 round 5, QA — on the real `god_plan` dev database with the stand-in gateway; DEF-2 and DEF-3 closed; live AI proven in D11 4/4; still NOT_TESTED: real phone / keyboard / screen reader; `../tests/TEST-001-req-001-first-release.md` §Round 5, §Verdict). ~~TEST_FAILED~~ (2026-11-09 round 4, QA — DEF-2 MAJOR: sign-in on the real `god_plan` back fails in bursts with 500 INTERNAL; DEF-3 MINOR: typed task title erased during a save; PGlite regression after the SPEC-003 refactor passed; `../tests/TEST-001-req-001-first-release.md` §Round 4). ~~TEST_PASSED — scoped: local · PGlite · stand-in gateway~~ (2026-11-09 round 3, QA — DEF-1 not reproduced while the machine was quiet; OBS-2 machine pauses; `../tests/TEST-001-req-001-first-release.md` §Verdict). Live AI (D11, 4 calls, 2026-11-09 14:55): AC-7 PASS, AC-9 PASS ×3, OBS-3/OBS-4 open. **NOT_TESTED, gating DELIVERED:** real Postgres (TASK-001), ~~live AI wording (D11)~~, real phone / keyboard / screen reader. ~~TEST_FAILED (2026-11-08 round 2, QA — AC-8, DEF-1)~~ ~~TEST_PASSED — scoped: local · PGlite · stand-in gateway~~ (2026-11-08 round 1, QA — `../tests/TEST-001-req-001-first-release.md` §Verdict). **NOT_TESTED, gating DELIVERED:** real Postgres (TASK-001), live AI wording (D11), real phone / keyboard / screen reader. ~~READY_FOR_SA (2026-11-08, PM — Q1/Q2/Q4 answered by the owner; Q3/Q5/Q6 + D1–D16 decided under his 01:25 delegation; pre-flight run).~~ Rounds: `../talks/BRAINSTORM-2026-11-08-req-001.md`, `../talks/BRAINSTORM-2026-11-08-req-001-open-decisions.md`
- Business priority for the SA (value, not build order): the owner's own loop first (projects, tasks, Stuck + reason), then invite + view + comment, then AI. AC-10's comp comes before the full build.
- Full TEST_PASSED needs the owner's yes to D11's 4-call live run; until then AI wording is NOT_TESTED.
- Priority: HIGH `[team-proposed]` — it is the desk's only item
- Requested: 2026-11-07 by the owner, via Atom — stamp: `operator`
- Deadline: none stated
- Depends on: none
- Source: `../../project-docs/requirements-from-owner-2026-11-07.md` (verbatim, 12:16) · `../../project-docs/owner-facts-via-atom-2026-11-07.md` · `../SYSTEM-FACTS.md`

## The ask in one sentence
The owner wants a place where he creates his projects and tasks, and the people he works with — family and his team —
can see how the work is going and where it is stuck, and comment on it, like Trello or Jira, with AI help through his own gateway. `[PM restatement]`

> "การสร้างโปรเจกต์และสร้างทาร์กของฉันได้และให้คนอื่นเข้ามารู้ได้ เพราะว่า...เวลาฉันทำงานกับคนอื่น ไม่ว่าจะเป็นพี่ฉัน น้องฉัน
> หรือว่าทีมงานของฉันเนี่ย ที่เป็นมนุษย์เนี่ยเขาจะได้รู้ว่าตอนนี้ฉันเดินงานยังไงติดตรงไหนได้ และช่วยฉันคอมเมนต์ต่าง ๆ ได้เหมือนกับเป็นเทนโล่หรือว่าจีระเลย
> แต่ฉันอยากจะทำให้มันมีเอไอช่วยด้วย อาจจะเป็น อ่า LM Gateway ของฉันที่เอาไปปลั๊กด้วย" (owner via Atom, 2026-11-07 12:16)

## Problem / Goal
When the owner works with other people (his older/younger siblings, his team), they cannot see how his work is going or
where it is stuck, so they cannot help or comment at the right moment. When this is solved, each of them can open the
owner's projects, see progress and blockers without asking him, and leave comments he reads. `[operator 2026-11-07]`

## Requirement
1. The owner can create a project, and create tasks inside it. `[operator 2026-11-07]`
2. Each task shows where it stands (its status) and whether it is stuck, and why. `[operator 2026-11-07 — "เดินงานยังไงติดตรงไหน"]`
   The exact status set is `[team-proposed]`: To do · Doing · Stuck · Done (Q5).
3. Only the owner creates projects and tasks. ~~`[SYSTEM-FACTS line 37 — but see the second reading: this is the PM's reading, not his words]`~~ `[operator 2026-11-08 01:18 — "ฉันสร้างโปรเจกต์ได้คนเดียว"]`
4. The owner can invite specific people to a project by copying an invite link and sending it himself; the app sends no email. The invitee opens the link and sets their own password; no Google login. Only invited people can see the project. `[operator 2026-11-08 01:18]`
5. An invited person can see the project's tasks, their status and blockers, and can comment on a task. `[operator 2026-11-07]`
6. The owner sees the comments on his tasks, with who wrote them and when. `[operator 2026-11-07]`
7. AI, through the owner's gateway (`llm-gateway` skill), can break a project into tasks. `[operator 2026-11-07, via Atom's summary]`
   ~~Whether it writes them directly or proposes them for his approval is **Q1**.~~ It **proposes**; the owner picks or edits, then saves; only saved items enter the project. `[operator 2026-11-08 00:43]`
8. AI, through the same gateway, can summarise a project's progress and blockers. `[operator 2026-11-07, via Atom's summary]`
9. Invited people's names and comments are personal data: every test uses synthetic people only. `[operator 2026-11-07, ORDER 57]`

10. Release-1 decisions D1–D16 (AI only on a press, what goes to AI, sign-in, invite and reset links, comments, limits):
    `../talks/BRAINSTORM-2026-11-08-req-001-open-decisions.md` §Outcome. `[operator-delegated 2026-11-08 01:25]`

## Acceptance Criteria
- [ ] **AC-1** — **Given** the owner is signed in **When** he creates a project and three tasks in it **Then** the project and its three tasks are listed, each with status "To do".
  - Check: QA, in the running app.
- [ ] **AC-2** — **Given** a task **When** the owner marks it Stuck and writes a reason **Then** the task shows Stuck and the reason, to him and to every invited person.
  - Check: QA, in the running app, as owner and as two synthetic invited people.
- [ ] **AC-2a** — unhappy path — **Given** a task **When** the owner marks it Stuck with an empty reason **Then** it is refused and the task keeps its old status. `[PM-decided 2026-11-08, QA-Q1]`
  - Check: QA, in the running app.
- [ ] **AC-3** — **Given** the owner invited synthetic person A to project P **When** A signs in **Then** A sees P, its tasks, statuses and blockers.
  - Check: QA, as A.
- [ ] **AC-3a** — **Given** the owner copied P's invite link **When** synthetic person A opens it and sets a password **Then** A can sign in with that password and sees P; no email was sent by the app. `[operator 2026-11-08 01:18]`
  - Check: QA, as A, from the copied link only.
- [ ] **AC-4** — unhappy path — **Given** synthetic person B was not invited to P **When** B signs in, or opens P's address directly **Then** B sees nothing of P — no name, task or comment of P, in the page or the response behind it.
  - Check: QA, as B, both by the list and by the direct address; and B asking for P's summary by direct request → refused, 0 gateway calls (D3).
- [ ] **AC-5** — **Given** A can see P **When** A comments on a task **Then** the owner, and every other person invited to P, sees the comment with A's name and the time (Asia/Bangkok). `[invitees see each other's comments: PM-decided 2026-11-08, QA-Q3]`
  - Check: QA, as A, then as owner and as C.
- [ ] **AC-6** — unhappy path — **Given** A is invited **When** A tries to create a project, or create, edit or delete a task **Then** there is no way to do it. `[operator 2026-11-08 01:18 — "ดูและคอมเมนต์ได้เท่านั้น"]`
  - Check: QA, as A, on the screen and by direct request.
- [ ] **AC-7** — **Given** a project with a name and a short description **When** the owner asks AI to break it into tasks **Then** a list of tasks appears, and they enter the project only as Q1 decides.
  - Check: QA, in the running app against the gateway.
  - AMENDED 2026-11-08 by the PM after Q1 `[operator 2026-11-08 00:43]`: **Then** a proposed task list appears that only the owner sees; the project is unchanged. **When** he unticks some items, edits the title of one, and saves **Then** exactly the ticked items, with his edit, are added as "To do"; unticked items are not added.
  - Check: QA, as owner — project before / after; and as A — A never sees the unsaved proposal. Against the stand-in; live NOT_TESTED until D11's run.
- [ ] **AC-7a** — unhappy path — **Given** an AI proposal is on screen **When** the owner leaves without saving **Then** nothing is added to the project.
  - Check: QA, as owner.
- [ ] **AC-8** — unhappy path — **Given** the gateway is unreachable or errors **When** the owner asks AI for anything **Then** within 30 seconds he sees the gateway-error message, and nothing in the project changes. `[30 s: PM-decided 2026-11-08, QA-Q4]`
  - Check: QA, with the gateway address pointed at nothing, and with the stand-in returning 500, hanging > 30 s, and returning an empty or malformed answer (same message, nothing saved — D11).
- [ ] ~~**AC-9** — **Given** a project with tasks in mixed statuses, two of them Stuck **When** anyone who can see it opens the summary **Then** it lists both Stuck tasks with their reasons, taken from the project itself, with the AI's written summary beside that list.~~
  - AMENDED 2026-11-08 by the PM (D1/D3 — "opens" clashed with "AI only on a press", SA + QA):
- [ ] **AC-9** — **Given** a project with tasks in mixed statuses, two of them Stuck **When** anyone who can see it opens the summary screen **Then** it lists both Stuck tasks with their reasons, taken from the project itself, plus the last stored AI summary with its time (or none yet). **When** they press "สรุปใหม่" **Then** a new AI summary replaces it, with the new time. `[operator-delegated 2026-11-08 01:25]`
  - Check: QA, as owner and as A — the list exactly; AI prose against the stand-in; live prose NOT_TESTED until D11's run.
- [ ] **AC-11** — **Given** the project and summary screens are open **When** nobody presses an AI button for 5 minutes **Then** the gateway receives 0 calls; one press gives exactly 1 call. `[operator-delegated 2026-11-08 01:25, D1]`
  - Check: QA, counting calls on the stand-in.
- [ ] **AC-12** — **Given** a synthetic comment, invitee name and invitee email each holding a marker string **When** AI tasks and AI summary run **Then** no request to the gateway contains any marker. `[operator-delegated 2026-11-08 01:25, D2]`
  - Check: QA, searching the stand-in's recorded request bodies → 0 hits.
- [ ] **AC-13** — **Given** an invite link **When** it is used once and then opened again, or opened after its lifetime, or after the owner made a new link for that person **Then** it is refused with the invite-link message. `[operator-delegated 2026-11-08 01:25, D8]`
  - Check: QA, with the lifetime set short on local.
- [ ] **AC-14** — **Given** A has an account from project P **When** A opens an invite link for project Q **Then** A signs in with the existing password and sees both P and Q; no second account exists. `[operator-delegated 2026-11-08 01:25, D13]`
  - Check: QA, as A.
- [ ] **AC-15** — **Given** A forgot the password **When** the owner makes a reset link for A and A opens it and sets a new one **Then** the old password fails and the new one works. `[operator-delegated 2026-11-08 01:25, D9]`
  - Check: QA, as owner then A.
- [ ] **AC-16** — unhappy path — **Given** a task or comment box **When** someone saves an empty comment, a text over its limit (D16), or text containing HTML/`<script>` **Then** empty and too-long are refused with their message, and HTML shows as plain text. `[operator-delegated 2026-11-08 01:25, D15/D16]`
  - Check: QA, as owner and as A.
- [ ] **AC-17** — **Given** a task is ติดอยู่ with a reason **When** the owner moves it to any other status **Then** the reason no longer shows. `[operator-delegated 2026-11-08 01:25, D12]`
  - Check: QA, as owner and as A.
- [ ] **AC-10** — **Given** a one-screen comp of the project page (tasks + status + comments), shown before the full build **When** the owner looks at it **Then** he says yes.
  - Check: the owner only; no team member ticks it.
  - **2026-11-08 13:17 — first comp REJECTED by the owner, via Atom `[operator]`:** "ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้". The next comp is built on HeroUI and clearly better-looking, mobile + desktop, shown to him again. Still his alone.
  - **2026-11-08 15:53 — MET by the owner, via Atom `[operator]`:** "เลือกแบบ B บอร์ดสี่สถานะ ให้ทีมพัฒนาต่อ" — layout B (`specs/comps/AC-10-heroui-b-*.png`). The front is built from B.
- [ ] **AC-18** — **Given** A is signed in **When** A opens an unused invite link made for someone else **Then** A sees the signed-in-as-someone-else message, nothing changes, and the link still works for its person. `[operator-delegated 2026-11-08 01:25, QT-1]`
  - Check: QA, as A then as the link's person.

## User-facing wording
Thai only (D6). Final for release 1 unless the comp (AC-10) changes them; any string not listed → ask the PM, never invent.
| Where | TH |
|---|---|
| Status | ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว |
| AI error (unreachable, error, > 30 s, empty) | AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน |
| AI tasks button / save | ให้ AI ช่วยแตกงาน · บันทึกงานที่เลือก |
| Summary button / no summary yet | สรุปใหม่ · ยังไม่มีสรุป กด "สรุปใหม่" |
| Summary time | สรุปเมื่อ <วันที่ เวลา> |
| Stuck reason empty | ใส่เหตุผลที่ติดก่อน |
| Comment empty | พิมพ์คอมเมนต์ก่อนส่ง |
| Too long | ยาวเกิน <N> ตัวอักษร ย่อให้สั้นลงหน่อย |
| Invite link used, expired or replaced | ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์ |
| Invite link opened while signed in as someone else | ตอนนี้เข้าระบบอยู่ในชื่อคนอื่น ออกจากระบบก่อนแล้วเปิดลิงก์นี้อีกครั้ง |

**Added 2026-11-08 for SPEC-002 Q-S2** `[PM as UX writer]`:
| Where | TH |
|---|---|
| Sign-in page title · email · password · button | เข้าสู่ระบบ · อีเมล · รหัสผ่าน · เข้าสู่ระบบ |
| Sign out | ออกจากระบบ |
| Project list title · empty | โปรเจกต์ · ยังไม่มีโปรเจกต์ |
| Empty list for an invitee | ยังไม่มีใครชวนคุณเข้าโปรเจกต์ |
| New project: name · description · create | ชื่อโปรเจกต์ · รายละเอียด (ไม่ใส่ก็ได้) · สร้างโปรเจกต์ |
| Task list empty | ยังไม่มีงานในโปรเจกต์นี้ |
| Add task: placeholder · button | ชื่องาน · เพิ่มงาน |
| Status control · Stuck reason | สถานะ · ติดเพราะอะไร |
| Save · cancel | บันทึก · ยกเลิก |
| Rename task · delete task · confirm | แก้ชื่องาน · ลบงาน · ลบงาน "<ชื่องาน>" ใช่ไหม ลบแล้วคอมเมนต์ของงานนี้หายไปด้วย |
| Comments heading · none yet | คอมเมนต์ · ยังไม่มีคอมเมนต์ |
| Comment placeholder · send · count | เขียนคอมเมนต์ · ส่ง · <n> คอมเมนต์ |
| Link to summary · to members | สรุปงาน · คนในโปรเจกต์ |
| Members page title · pending invites | คนในโปรเจกต์ · ลิงก์เชิญที่ยังไม่มีคนใช้ |
| Invitee name (owner types) | ชื่อคนที่จะชวน |
| Make invite link · make reset link · copied (reset) | สร้างลิงก์เชิญ · สร้างลิงก์ตั้งรหัสผ่านใหม่ · คัดลอกแล้ว ส่งให้เจ้าตัวได้เลย |
| Invite page heading | <ชื่อเจ้าของ> ชวนคุณเข้าโปรเจกต์ "<ชื่อโปรเจกต์>" |
| Invite page: your name · email · password · join | ชื่อของคุณ · อีเมล · ตั้งรหัสผ่าน · เข้าร่วม |
| Hint for an existing account | เคยมีบัญชีแล้ว ใช้อีเมลกับรหัสผ่านเดิมได้เลย |
| Reset page heading · new password · save · done | ตั้งรหัสผ่านใหม่ · รหัสผ่านใหม่ · บันทึกรหัสผ่าน · เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย |
| Reset link used, expired or replaced | ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์ |
| AI busy (`AI_BUSY`) | AI กำลังทำงานให้โปรเจกต์นี้อยู่ รอสักครู่แล้วลองใหม่ |
| Too many presses (`RATE_LIMITED`) | กดถี่เกินไป รอสักนาทีแล้วลองใหม่ |
| AI proposal heading · loading | งานที่ AI เสนอ (เลือกเฉพาะที่ใช้) · AI กำลังคิด… |
| Back to project list | กลับไปหน้าโปรเจกต์ |
| Close the comment panel (screen-reader label) | ปิดคอมเมนต์ |
| Save failed (network, server error, timeout) — what was typed stays | บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง |
| Page failed to load (server error; 404 keeps "ไม่พบหน้านี้") | โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง |
| Action not allowed (403) | คุณไม่มีสิทธิ์ทำรายการนี้ |

Note: "delete task" is the owner's only (AC-6). Deleting a task also deletes its comments `[PM-decided 2026-11-08]` — the confirm says so.
| Wrong sign-in | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| Sign-in failed for any other reason (server error, timeout) — added 2026-11-09 for DEF-2 | เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง |
| Password too short | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร |
| Page not found / no access | ไม่พบหน้านี้ |
| Copy invite link / copied | คัดลอกลิงก์เชิญ · คัดลอกแล้ว ส่งให้คนที่เชิญได้เลย |

## Constraints
- Synthetic people only in every test. `[operator 2026-11-07]`
- AI only through the owner's gateway; base URL from env, never a key in git. `[llm-gateway skill]`
- Never install or start a local Postgres; env values come only from the owner. `[workspace CLAUDE.md rule 4]`
- Repos `god-plan-back` (BE), `god-plan-front` (FE), branch `atom` once Atom creates it. `[operator 2026-11-07]`
- **The front's UI is based on HeroUI**, with a clearly better look than the first comp. `[operator 2026-11-08 13:17]`
- **Code standard, both repos** — AMENDED 2026-11-09 by the PM, after TEST_PASSED: "เขียน code ให้ professional นะ scalable , reusable , clean , config , ไม่มีการ hardcode ทั้ง front + back" `[operator 2026-11-09 14:59]`. Every setting from config/env (listed in `.env.example`), nothing hardcoded; front follows the owner's Next.js pattern skills where they fit HeroUI v3. Behaviour and wording unchanged. Checked by the SA's audit + QA's regression re-run.
- **Testability — the build must let QA run these** (QA's TEST-001 §Prerequisites, added 2026-11-08 by the PM): P1 stand-in gateway with modes ok · 500 · hang > 30 s · empty/malformed, switchable without a code change · P2 the stand-in records every request body and counts calls, readable by QA · P3 invite-link lifetime configurable for local testing · P4 the owner-create command run with a synthetic owner on dev, his sign-in in a git-ignored local file only · P5 `.env.example` lists every key with one line each. How is the SA's. `[PM-decided 2026-11-08]`

## Out of Scope (first release) `[team-proposed — the owner may move any line back in]`
- Invited people creating or moving tasks, or creating projects. `[operator 2026-11-08 01:18]`
- Google or any other outside login; the app sending email (invites, password reset). `[operator 2026-11-08 01:18]`
- Notifications (email, LINE, push) when someone comments.
- Removing an invited person from a project. `[PM-decided 2026-11-08, QA-Q2]`
- Attachments, due dates, assignees, time tracking, boards with drag and drop.
- Any deploy — local only until the owner chooses an environment.
- Public sign-up; more than one owner; editing or deleting comments; saved AI drafts; a spend cap in the app. `[operator-delegated 2026-11-08 01:25]`
- Live gateway calls while building or testing — stand-in only until the owner says yes to D11's 4-call run. `[Atom relay 2026-11-08 01:25]`

## Questions — for the owner, asked by the PM one at a time after the round
- **Q1 (PM → owner — BLOCKS AC-7)** — Does AI write tasks into the project directly, or propose them for his approval?
  > recommendation `[team-proposed]`: propose, the owner accepts or edits each before it enters. (Approval-first was also Atom's idea; the owner has not agreed.)
  > answer: **ANSWERED 2026-11-08 00:43 by the owner, via Atom, `[operator]`** — "ให้ AI เสนอรายการงานก่อน ฉันเลือกหรือแก้แล้วจึงบันทึก". Propose first. AC-7 amended. Scope: `DECISIONS.md` 2026-11-08 00:43.
- **Q2 (PM → owner — BLOCKS AC-3/4/6)** — How do invited people sign in, and what may each do (view only + comment, or more)?
  Also ask Tanya's third reading: does each person have their own projects and invite each other?
  > ~~recommendation `[team-proposed]`: the owner invites by email; each person has their own sign-in; they view and comment only.~~
  > AMENDED 2026-11-08 by the PM after the round: email needs a mail service, and email or Google sign-in would leave AC-3..6 NOT_TESTED.
  > recommendation `[team-proposed]`: the owner copies an invite link and sends it himself (LINE etc.); the person opens it and sets their own password; view + comment only.
  > answer: **ANSWERED 2026-11-08 01:18 by the owner, via Atom, `[operator]`** — "อนุมัติรุ่นแรก: เชิญด้วยลิงก์ที่ฉันคัดลอกไปส่งเอง ผู้รับเชิญตั้งรหัสผ่าน ไม่ใช้ Google login ดูและคอมเมนต์ได้เท่านั้น และฉันสร้างโปรเจกต์ได้คนเดียว". Req 3–4, AC-3a, AC-6, Out of Scope amended. Scope + open edges (link expiry, password reset): `DECISIONS.md` 2026-11-08 01:18.
- **Q3 (PM → owner — BLOCKS AC-7/9)** — The gateway needs no key (`llm-gateway` skill, owner 2026-10-28). Ask only: a monthly spend cap, and may real task text and comments (with names) go to the outside AI providers behind the gateway?
  > recommendation `[team-proposed]`: default chain, no cap set by the desk; real comments may go through — the owner names a cap or a no.
  > answer: **DECIDED 2026-11-08 by the PM, `[operator-delegated 2026-11-08 01:25]`** — D1 (no cap, press-only, guards) + D2 (no comments or account data to AI). Q5 → D5, Q6 → D6. BRAINSTORM-…-open-decisions §Outcome.
- **Q4 (PM → owner — BLOCKS any build) — asked first, 2026-11-08** — Stack, database (which server) and how the dev server runs.
  > recommendation `[SA-proposed]` (BRAINSTORM §Replies/SA §2): front Next.js · back Bun + Hono · a new `god_plan` database on his existing dev Postgres server via a `DATABASE_URL` he gives · locally `bun run dev` + `next dev`, nothing deployed · both repos in his standard deploy shape. Yes/no.
  > answer: **ANSWERED 2026-11-08 00:39 by the owner, via Atom, `[operator]`** — "ใช่ และฐานข้อมูลใช้ DB_URL แบบเดิมเลย แค่ สร้าง database ของโปรเจคนี้เอง". Stack + server + new database: yes. Dev-server method ⚠️ not settled (SYSTEM-FACTS §Stack and database). Scope: `DECISIONS.md` 2026-11-08 00:39.
- **Q5 (PM → owner — does not block)** — Is the status set To do · Doing · Stuck · Done enough?
- **Q6 (PM → owner — does not block)** — Thai only, or Thai + English?

## Defects to fix (routed by the PM)
### DEF-1 — 2026-11-08, from TEST-001 round 2 (TEST_FAILED), MAJOR, AC-8
- **What the owner must get (unchanged AC-8):** when the gateway hangs or errors, the AI error message within 30 s on screen, for both "ให้ AI ช่วยแตกงาน" and "สรุปใหม่", and nothing in the project changes.
- **What happens:** through the front, about half of hung calls end after 42–237 s (500 or a late 502); 1 browser press in 4 waited 40.6 s. Straight to the back, 9 of 9 end at 25 s. So the gap is on the way between the screen and the back, not in the back.
- **Reproduction recipe (QA's, from a clean state):** `../tests/TEST-001-req-001-first-release.md` §Defects DEF-1, steps 1–4 (`repro-def1-proxy.mjs` ×3, `repro-case21-ui.mjs` ×4). The fix is proven only when that recipe passes every time.
- **Also asked:** whether the same happens under `next start`, since a deploy would use it.
- **Not the PM's:** cause and fix — the SA's.

### DEF-2 — 2026-11-09, from TEST-001 round 4 (TEST_FAILED), MAJOR, every AC (sign-in) — the DELIVERED gate
- **What the owner must get:** on the real `god_plan` database, sign-in answers success (or "wrong password") every time. Never a server error.
- **What happens:** in bursts, sign-in returns a server error — through the screen and straight to the back, any account, with the machine quiet (stall detector). Never seen on the stand-in database. The back's log says only `unhandled error: Error`, so its own log can't show the cause.
- **Reproduction recipe (QA's):** `../tests/TEST-001-req-001-first-release.md` §Defects DEF-2 (real back, sign in repeatedly ~30 min, count 500s and `unhandled error` lines). Proven fixed only when that recipe runs clean.
- **Also required** `[PM-decided 2026-11-09]`: an unexpected server error is logged with enough detail to find its cause (no secrets, no passwords); and the sign-in screen shows "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง", not the save message.

### DEF-3 — 2026-11-09, from TEST-001 round 4, MINOR, AC-1
- **What happens:** at real speed (~1 s per save), text typed in the add-task box while the previous add is saving is silently erased when that save finishes.
- **Product rule** `[PM-decided 2026-11-09, operator-delegated 2026-11-08 01:25]`: **what a person typed is never lost silently.** The owner may type the next title while a save runs; when the save finishes, only the text that was saved leaves the box — anything typed since stays. Pressing เพิ่มงาน again while a save runs may wait or be refused, but must never drop the text.
- **Reproduction recipe (QA's):** `../tests/TEST-001-req-001-first-release.md` §Defects DEF-3 (`repro-fast-add.mjs`, real back).

## Follow-ups — not built; the project closes at release 1 (PM, 2026-11-13, `[operator-delegated 2026-11-13 09:33]`)
- **OBS-3:** AI task proposals see only the project name + description, so ~3 of 15 can repeat existing tasks. Later: also send existing task titles (titles already go to AI in the summary, so D2 holds).
- **OBS-4:** the AI summary adds an overall judgement ("คืบหน้าดี" vs "ระดับกลาง") that varies run to run. Later: prompt it to state facts only.
- **Deploy gate** (owner 2026-11-10): real phone, keyboard, screen reader, /impeccable, sign-in throttle, proxy read timeout > 25 s.
- Each needs the owner's go (and live AI calls for OBS-3/4). Source: `../tests/TEST-001-req-001-first-release.md` §D11 live run; `DECISIONS.md` 2026-11-13.

## Verification
_(written when the work comes back)_
