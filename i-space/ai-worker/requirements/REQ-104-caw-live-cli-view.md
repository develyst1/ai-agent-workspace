# REQ-104: CAW — a live, read-only CLI view per worker

- Status: DELIVERED (2026-10-29 14:4x, the PM — QA TEST_PASSED 14:45, 7/7 AC; NOT_TESTED named in TEST-105 § Verdict) · **COMMITTED 2026-10-29** on the owner's own "ขึ้น git REQ-103 และ REQ-104": caw-back `f8a619e`, caw-front `1e16d37` on `atom`, pushed (PM verified `origin/atom`) · O-2 (a secret split over two printed lines shows in halves) accepted as a known limit for local use `[PM-decided]`; O-2 + O-5 (runner trace files keep unmasked secrets) → REQ-109 deploy-ready
- Git: commit and sync **this topic alone** when it passes QA (`CONVENTIONS.md` § Git) — only on the owner's own "ขึ้น git" in his session, relayed by the PM (`ATOM.md` "Ruled by the owner" §1).
- Owner also asked the team to **try the product** and fix where it differs from his intent: anything found beyond these ACs comes to the PM as a question, not as silent scope. A live CLI run to look at the real view = ask the owner via the PM first.
- Priority: HIGH `[team-proposed]` (plan order 1, in parallel with REQ-103)
- Requested: 2026-10-29 by the owner — stamp `operator` (decision 10:53 point d; 11:41 item 9, relayed by Atom)
- Deadline: none
- Depends on: REQ-102 (gap report `maps/caw-gap-102.md` d1–d3)
- Team: **B (CAW)** only.

## The need (owner, via Atom)

> 10:53: "CAW should show each agent its own CLI screen (a live terminal view per worker), so users can watch the work going on behind the scenes if they want."
> 11:41 item 9: read-only first. Typing into it comes after the persistent-session work (REQ-106).

## Problem / Goal

Today a user sees only a worker's status ("กำลังทำ", "เงียบไป n นาที"). The CLI's own output goes to a trace file on the runner's
machine and is never sent anywhere (`maps/caw-gap-102.md` d2). The owner wants to be able to watch what each worker is
actually doing, when he wants to.

## Requirement

1. While a worker's CLI is running, its output reaches CAW's API as it happens (or in short batches), per hop and per worker.
2. Secrets are removed before the output leaves the runner.
3. Each worker has a view in caw-front that shows that output live; it is opened only when the user chooses (not on by default).
4. The view is read-only: no input box, nothing the user types reaches the CLI.
5. After a hop ends, its output can still be read in that view (for that hop).

## Acceptance Criteria

- [ ] **AC-1** — **Given** a running hop driven by a **stub CLI** that prints a line every second **When** the user opens that worker's view **Then** new lines appear within 5 s of being printed, without reloading the page.
  - Check: QA, local, with the stub `claude` (as TEST-101); no real CLI.
- [ ] **AC-2** — **Given** the board **When** the user does nothing **Then** no live view is open; it opens from the worker (crew strip or team screen) only when clicked.
  - Check: QA.
- [ ] **AC-3** — **Given** the stub prints a line containing a test secret (an API-key-shaped string and a value from a `.env` key) **When** it reaches the view **Then** the secret is not shown and is not stored by the API.
  - Check: QA reads the view and the API's stored output.
- [ ] **AC-4** — **Given** the live view **When** the user looks for a way to type into it **Then** there is none.
  - Check: QA.
- [ ] **AC-5** — **Given** a finished hop **When** the user opens the worker's view **Then** that hop's output is there, with its start/end time.
  - Check: QA.
- [ ] **AC-6** (unhappy) — **Given** the API is unreachable for 30 s during a hop **When** it comes back **Then** the hop is not killed by it, and the view shows a gap marker instead of pretending nothing was missed.
  - Check: QA, by stopping the API process mid-hop (stub CLI).
- [ ] **AC-7** (regression) — the runner, hops, heartbeat, limit handling and every existing test still behave as TEST-101 found them (caw-back 677 pass / 1 known fail / 1 skip; caw-front 257 e2e).
  - Check: QA re-runs the TEST-101 CAW cases.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| open button on a worker | ดูหน้าจอ | Watch screen |
| view title | หน้าจอของ {ชื่อ worker} | {worker}'s screen |
| empty (no hop yet) | ยังไม่ได้เริ่มทำงาน | Not working yet |
| live badge | สด | Live |
| gap marker | ขาดช่วง {n} วินาที — ระหว่างนี้ไม่ได้รับข้อมูล | Missed {n} s — nothing received in this gap |
| finished hop | จบงานเมื่อ {เวลา} | Finished at {time} |
| hop start time (added 2026-10-29, SPEC-103 Q1) | เริ่มเมื่อ {เวลา} | Started at {time} |
| output cut off (added 2026-10-29, SPEC-103 Q1) | ยาวเกิน 5,000 บรรทัด — ส่วนที่เกินไม่ได้แสดง | Over 5,000 lines — the rest isn't shown |

## Constraints

- ~~**No live Claude CLI run** without the owner's word; every AC is checked with a stub CLI. A run with the real CLI to look at the view is a question to the owner through the PM.~~
  **AMENDED 2026-10-29 13:01 by the PM** (owner via Atom: *"รันclaude จริงสิ ได้เลย ไปทดสอบ"*, `DECISIONS.md` 13:01): live Claude CLI runs are **allowed** for testing and for trying the view: purposeful, each run logged (TASK/TEST evidence + log), report a quota/limit signal past ~60% to the PM. The ACs may still be evidenced with the stub (deterministic); add one live run to show the view with a real worker. **No LLM gateway call** without asking.
- This machine only. caw-back and caw-front only; no Blueprint change.

## Out of Scope

- Typing into the CLI (after REQ-106). · Persistent sessions per worker (REQ-106). · Login / who may watch (owner: later).

## Questions

- **Q2 (SA B via PM → owner — BLOCKS the live run, DoD 11; also REQ-108 AC-3)** — claude 2.1.312 refuses to start with the runner's Bash sandbox on: `socat` is missing on this machine (`bwrap` present; PM checked 2026-10-29: Debian 13, `socat` not found). Options: A install `socat` here (machine change — owner/Otto) · B the owner runs the live check on his machine · C sandbox off — refused by SA B. Likely the deploy server needs `socat` too (inferred) → REQ-109. Source: `tasks/TASK-105-caw-back-live-output.md` § Questions Q1.
  > recommendation `[PM-decided]`: A.
  > answer: **ANSWERED 2026-10-29 13:41 by the owner via Atom, `[operator]`** — *"ใช่ไม่ต้องใช้หรอก sandbox จัดวาง folder แล้วทำเลย"*: no Bash sandbox, no socat (option C). Run worker CLIs directly, each confined to its own organized folder under `CAW_WORKSPACE_ROOT`; guard hooks + read fence stay. Live run unblocked. (`DECISIONS.md` 13:41)
- **Q3 (SA B via PM — user-visible words, pre-existing drift, TASK-106 Q-A)** — the team-down line tells the user which command to copy: caw-back says `cd caw-back && bun run runner`, caw-front says `cd caw-back && bun run dev`.
  > answer: **`cd caw-back && bun run runner`.** Reason: the line shows only while the board loads, so caw-back's API is already up; the user needs only the runner, and `bun run dev` would start a second API on :4500 (port clash). Align caw-front (mock, tests, `schema.d.ts`) to caw-back in a small TASK of SA B's. Cheap to reverse. — Porter (PM) 2026-10-29 `[PM-decided]`

- **Q1 (QA via PM → SA B — design input)** — AC-3 stays as written: a secret is not only a known pattern (API-key shape) but also **any value of the runner's own env secrets printed bare** (QA will plant `CAW_TEST_SECRET`, as `hop.test.ts:355`). Design redaction to cover that. Also: QA will run the real runner with `CLAUDE_BIN` = stub and the stub first on PATH, logging every spawn (TEST-105 Q1), and caw-back on `pglite:file:` for AC-6. `[PM-decided]`
  > answer: covered. SPEC-103 § The runner item 2: `liveRedact` replaces every value from `secretValues(env)` exactly. That list holds the runner's env keys listed in `.env.example`, plus any key whose name matches `/KEY|TOKEN|SECRET|PASSWORD|PASS|DATABASE_URL/i` (value ≥ 6 chars). `CAW_TEST_SECRET=must-not-leak` (`caw-back → src/runner/hop.test.ts:355`) is caught by name. TASK-105 DoD 4 tests it. Note for QA's stub: the child only gets `PATH HOME …` (`hop.ts:97-101`), so the stub must carry the secret in its own text, not read it from env (the SPEC's dev script does that). The spawn log and `pglite:file:` setup fit the design. — Silver (SA B) 2026-10-29

## Verification (by QA)

Build: Team B's working trees, fingerprints `1b685c23fb11` (caw-back) / `a03c0e186242` (caw-front), unchanged during the run; stub CLI via SPEC-103's dev script. Detail: `tests/TEST-105-caw-live-cli-view.md` § Results.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | 43 new lines each on screen 1.0–3.2 s after the runner saw them; "สด" while running (#1–2) |
| AC-2 | PASS | nothing open or polling until "ดูหน้าจอ" is clicked, from the crew strip and the team drawer; empty state (#4–6) |
| AC-3 | PASS | the stub's key and planted secret masked on screen and in storage; every SPEC shape masked when called directly. A 5-char secret and a split secret show (O-1, O-2) (#7–8) |
| AC-4 | PASS | no input of any kind; operator writes refused 403 `runner_only` (#9–10) |
| AC-5 | PASS | finished hop readable after reload, with "เริ่มเมื่อ" / "จบงานเมื่อ" (#11) |
| AC-6 | PASS | API down 30 s: hop survives, one 31 s gap entry, the PM's marker on screen, ticks 21–51 marked (#13–14) |
| AC-7 | PASS | caw-back 749/1/1 (the one known fail), caw-front 334 unit + 264 e2e (#15) |
