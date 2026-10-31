# REQ-108: Live end-to-end proof — a small monitoring dashboard built through Blueprint → CAW → real CLI workers

- Status: **DELIVERED** (2026-10-30 18:0x, the PM — tested trees are today's commits, no git needed; P3-1/P3-2 → REQ-121) · was TEST_PASSED (phase 3, 2026-10-30 18:03, QA Tanya — AC-4 PASS live: the built dashboard on :3900, 4 services, "ไม่ตอบ" in 6.9 s; AC-1/2/3/6/7/8 PASS, AC-5 from phase 2; TEST-106 § Phase 3) · TEST_FAILED (phase 2, 2026-10-30 15:29, QA Tanya — AC-4 FAIL: a hand-entered spec never reached the workers, who built a different dashboard (P2-1, MAJOR); AC-1/2/3/5/6/7/8 PASS; `tests/TEST-106-e2e-live-dashboard.md` § Phase 2) · TEST_FAILED — phase 1 (2026-10-29 14:55, QA Tanya — `tests/TEST-106-e2e-live-dashboard.md`; AC-1 via interview + AC-4 fail; phase 2 not run) · was READY (2026-10-29 13:05, the PM) — phase 1 unblocked: owner allowed the gateway for this test (Q1). QA designs and runs.
- Priority: HIGH `[PM-decided: owner asked 13:02]`
- Requested: 2026-10-29 13:02 by the owner, relayed by Atom — stamp `operator`
- Deadline: none
- Depends on: Phase 1 none (today's code). Phase 2: REQ-103 (hand-entered requirements, labels) + REQ-104 (live CLI view) DELIVERED; REQ-105 (latest spec) if done by then.
- Who runs it: **the QA**, end to end across both products (QA has full access on local). **Both SAs on standby**: a defect goes PM → owning SA as REQ content, as always. `[PM-decided]`

## The ask (owner via Atom, 13:02 — as relayed)

> *"ทดสอบทำโปรเจคนึงก็ได้ ทำ web dashboard เว็บสัญญาณ อะไรบางอย่างเพื่อ monitorก็ได้"* — "Use this as the live end-to-end test project for CAW: put a small spec/requirements for a monitoring web dashboard (some signal/status monitor, your pick, keep it small) into Blueprint, then have CAW pick it up and build it with real Claude CLI workers, with the per-worker CLI view on. Goal: prove the whole Blueprint -> CAW -> CLI workers flow works per the owner requirements. Plan it in, report the plan and results."

## The test project — "I-Space Health Board" (the PM's pick, kept small) `[PM-decided]`

The spec QA enters into Blueprint, as written here (the PM owns this content):

> **ชื่อ:** I-Space Health Board — หน้าเว็บเดียว ดูว่าบริการของ I-Space ตัวไหนเปิดอยู่
> 1. แสดง 4 บริการ: Blueprint API (`http://127.0.0.1:4200/health`), Blueprint เว็บ (`http://127.0.0.1:3100`), CAW API (`http://127.0.0.1:4500/health`), CAW เว็บ (`http://127.0.0.1:3500`).
> 2. แต่ละบริการแสดง: ชื่อ · สถานะ "ทำงาน" (เขียว) หรือ "ไม่ตอบ" (แดง) · เวลาตอบเป็น ms · เวลาที่เช็คล่าสุด.
> 3. เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้".
> 4. ถ้าบริการไม่ตอบภายใน 3 วินาที ให้ถือว่า "ไม่ตอบ".
> 5. รันในเครื่องที่ `http://127.0.0.1:3900` ไม่ต้อง login ไม่ต้องมีฐานข้อมูล.
> 6. ข้อความบนหน้าเป็นภาษาไทย.
> **ไม่ทำ:** login, การแจ้งเตือน, เก็บประวัติ, deploy.

Where CAW's workers build it: a new folder under `CAW_WORKSPACE_ROOT` (`/workspace/caw-workspaces/…`). It is **not** one of the desk's four repos, and nobody runs git there. The owner will open a git repo for it later (via Atom 13:02: *"เดี๋ยวเปิด git repo code base ให้ทีหลัง"*). Until then it is a local folder only: no remote, no push.

## Plan — two phases `[PM-decided]`

- **Phase 1 — today's code, now:** run the whole flow on the code as it is, with real Claude CLI workers (allowed, `DECISIONS.md` 13:01). The point is to find where today's product differs from the owner's intent while it is used for real. The live view does not exist yet, so AC-5 is `NOT_TESTED` in this phase. **Needs Q1** (the interview goes through the gateway).
- **Phase 2 — after REQ-103 + REQ-104 (and REQ-105 if ready):** the same project again. Requirements are entered by hand (no gateway needed), and the per-worker CLI view is on. This is the proof the owner asked for.

## Requirement

1. The Health Board spec above gets into Blueprint, and the project gets a version (phase 1: confirmed; phase 2: a hand label).
2. CAW receives it through Blueprint's "ส่งไปสร้างที่ CAW" button. No hand-made CAW project.
3. A CAW team is set up, and **real** Claude CLI workers build the dashboard in a workspace folder.
4. The built dashboard runs and does what the spec says.
5. Phase 2: the user can watch each worker's live CLI screen while it works.
6. Every live run is logged; quota/limit signals are reported.
7. Every point where the flow differs from the owner's intent (`DECISIONS.md` 10:51, 10:53, 11:41) is listed as a finding.

## Acceptance Criteria

- [ ] **AC-1** — **Given** Blueprint locally **When** QA enters the Health Board spec (phase 1: AI interview; phase 2: hand-entered requirements) **Then** the spec pages show all 6 points and the "ไม่ทำ" list, and the project has a version/label.
  - Check: QA, screenshots of the spec pages.
- [ ] **AC-2** — **Given** that project **When** QA clicks "ส่งไปสร้างที่ CAW" **Then** CAW opens a board for it, with cards that come from the spec.
  - Check: QA, screenshot + CAW API read.
- [ ] **AC-3** — **Given** a CAW team with at least 2 workers and a workspace folder **When** the run starts **Then** real Claude CLI hops run (no stub), and files appear in the workspace folder.
  - Check: QA, runner log (process list shows the real `claude`), hop list, `ls` of the folder.
- [ ] **AC-4** — **Given** the workers report done **When** QA starts the built dashboard and opens `http://127.0.0.1:3900` **Then** it shows the 4 services with the right status. When QA stops one service, it turns "ไม่ตอบ" within 10 s plus 3 s.
  - Check: QA, screenshots before/after stopping a service.
- [ ] **AC-5** (phase 2) — **Given** a worker is running **When** QA opens its screen **Then** its CLI output streams live, as REQ-104 says.
  - Check: QA, screenshot/recording.
- [ ] **AC-6** — every live run has a line in the TEST file (start, end, hops, tokens if shown), and any limit/quota signal was reported to the PM.
  - Check: the PM reads the TEST file.
- [ ] **AC-7** — the TEST file has a findings list: each step where the flow needed a workaround, broke, or behaved against the owner's intent, with evidence.
  - Check: the PM. Findings become REQ content for the owning SA.
- [ ] **AC-8** (regression) — the desk's four repos are left as found (no tracked change from this test). The workspace folder and test data may stay.
  - Check: QA, `git status` per repo.

## Constraints

- **LLM gateway: allowed for this test project only** (owner 13:05, Q1). Keep usage reasonable; never print keys. Claude CLI: allowed (13:01).
- **DB:** QA's call: the local pglite, or the remote TEST DB once `PROTOCOL.md` § Environments lists it. Never print `DATABASE_URL`.
- Never run the runner with a blank `CLAUDE_BIN` by accident: QA sets it explicitly to the real binary for this test, and logs it (`SYSTEM-FACTS.md` § Environment).
- Nothing is deployed. The dashboard runs on this machine only.

## Out of Scope

- Making the dashboard production-grade. · Fixing findings inside this REQ (they become REQs). · Git in the workspace folder.

## Questions

- **Q1 (PM → owner — BLOCKS phase 1)** — Phase 1 needs Blueprint's AI interview (and quiz) to put the spec in and confirm a version, and that calls the LLM gateway `ai.develyst.online`. May QA use the gateway **for this one test project only**?
  > recommendation `[PM-decided]`: yes, this project only. Otherwise phase 1 waits for REQ-103's hand-entered requirements.
  > answer: **ANSWERED 2026-10-29 13:05 by the owner via Atom, `[operator]`** — *"ให้ใช้ LLM gateway ทดสอบ REQ-108 ได้"*: yes, for this test project; keep usage reasonable; never print keys.

## Verification (by QA)

Phase 1, 2026-10-29 13:08–14:53. Detail: `tests/TEST-106-e2e-live-dashboard.md` § Phase 1 results by AC, ledger, findings P1-1…P1-11.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | **FAIL** via the interview (3 rounds, 0 parts stored, bot claimed it saved) · spec in only via the change-set API workaround | P1-1, P1-2, P1-5 |
| AC-2 | PASS | real-gateway quiz → v1 → button → CAW board; the real worker proposed 2 cards from the spec; accepted on screen |
| AC-3 | PASS | real `claude` hops (haiku/low), 3 files in the build folder, nothing written outside it; two runs, each ended by a stop (P1-7, P1-8) |
| AC-4 | **FAIL** | the dashboard works on load and "เช็คตอนนี้", but never re-checks by itself; a stopped service still "ทำงาน" after 13 s (P1-10, caused by P1-9) |
| AC-5 | phase 2 | — |
| AC-6 | PASS | ledger: gateway batches G-1…G-5, real hops C-1…C-4 (≈ 381 k in / 2.5 k out), no limit signal |
| AC-7 | PASS | findings list with evidence |
| AC-8 | PASS | repos untouched by QA (exports/snapshots only) |

Phase 2, 2026-10-30 15:20–15:29 (clean HEADs bp ccd32af/09f2717, caw 4cc3241/b4f2659; real `claude`; 6 hops; gateway 0). Detail: TEST-106 § Phase 2.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | the spec typed in by hand on the requirements page (6 points + "ไม่ทำ", verbatim), label v1 |
| AC-2 | PASS | Blueprint's button → CAW board; starting team runs (REQ-117 live); 4 cards from the spec, accepted after ปลา's question |
| AC-3 | PASS | real opus/sonnet hops; server/, services.json, package.json, README in the folder; nothing outside |
| AC-4 | **FAIL** | :3900 refuses; the built server checks "Health Board" :3000 and "ระบบล็อกอิน" :3001 — every card was anchored on REQ-001 and no card saw the other requirements (P2-1) |
| AC-5 | PASS | "หน้าจอของ ใบเตย · สด" streamed the running hop's calls without a reload |
| AC-6 | PASS | ledger C2-1…C2-6, ≈ 21.3 k out; no limit signal |
| AC-7 | PASS | findings P2-1 (MAJOR), P2-2, P2-3, O-1 |
| AC-8 | PASS | exports only; repos clean |

Phase 3, 2026-10-30 17:53–18:03 (committed HEADs bp 6123018/6692a16, caw 3efcc1a/1287772; real `claude`; 5 hops; gateway 0). Detail: TEST-106 § Phase 3.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | the 8 requirements typed on Blueprint's page, label v1 |
| AC-2 | PASS | Blueprint's button → CAW board; ปลา proposed 8 cards, one per requirement; every card's context holds the whole spec |
| AC-3 | PASS | real opus/sonnet hops; SA → BE → QA by name, no operator question; files in `health-board-108p3` |
| AC-4 | **PASS** | `node server.js` (README) → the page shows the 4 services ทำงาน with ms and time; QA's caw-web stopped → "CAW เว็บ · ไม่ตอบ" in 6.9 s, by itself |
| AC-5 | PASS (phase 2) | not re-run in phase 3 |
| AC-6 | PASS | ledger C3-1…C3-5, ≈ 30.9 k out; no limit signal |
| AC-7 | PASS | P2-1/2/3 fixed live; P3-1 (BE cannot hand to FE in the starting chain, so BE wrote the page), P3-2 (whole product built in card #1) |
| AC-8 | PASS | QA ran from exports; caw-back's 5 modified paths are Team B's REQ-120 (18:01), after QA's export |

