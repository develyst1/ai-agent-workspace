# REQ-101: Understand all the code (Blueprint + CAW)

- Status: DELIVERED (2026-10-29, the PM — after QA's TEST_PASSED 01:20; PM re-checked AC-11 git state in all four repos and the AC-3 counts in `tests/harness/test-101/`) · Thai overview for the owner: `../project-docs/overview-th.md` · CAW map accuracy notes S-F1/S-F2/S-F6/O-2 routed to SA (B), non-blocking
- Priority: HIGH `[PM-decided: the owner named it the first work, 2026-10-29 00:00 and 00:24]`
- Requested: 2026-10-29 by the owner (โด่ง), relayed by Atom — stamp: `operator` (MARIE.md ORDER 39). **NOT customer-validated** — this desk has no customer seat (`SEATS.md`).
- Deadline: none
- Depends on: none
- Filed: 2026-10-29 by Marie at desk-open (the need, verbatim). ACs written 2026-10-29 by the PM. Numbered 101, not 001: the code already cites the old team's REQ-001…017 (`legacy/README.md`).
- Split: **Team A (SA Sober)** = Blueprint (`blueprint-back`, `blueprint-front`) · **Team B (SA Silver)** = CAW (`caw-back`, `caw-front`) · the seam (AC-5) is done by **both**, each from its own side. `[PM-decided]`

## The need (owner, 2026-10-29 00:00, via Atom — verbatim)

*"อันนี้ cloneลง สี่อันได้เลย ทำความเข้าใจโค้ดทั้งหมด และ ปรึกษาATLAS เปิดตัวทำงานนี้ว่าต้องใช้เอสเอกี่ทีม"*

and at open (00:24): *"แล้วก็ตอนเปิดก็สั่งพีเอ็ม ให้เขาไปสั่งเอสเอทำก็ได้"*

## Problem / Goal

The four repos were built by another AI desk whose memory (SPEC/REQ/DECISIONS) is not here yet
(`legacy/README.md`), and this desk forgets everything between sessions (workspace `CLAUDE.md`,
amnesia-first). So "the team understands the code" only counts if the understanding is **written
into this desk's files**, checked against the running code, so that any later REQ on Blueprint or
CAW can be designed without re-reading 45k lines from zero.

**The PM's reading** (MINE, see `## Second reading`): the one who must understand is **the team**
(both SAs, and through them the engineers); the deliverable is a **written, evidence-backed code
map per product**, plus the seam between them. Nothing in the product changes.

## Requirement

1. Each team must produce a written code map of its own product — what each part of the code is
   for, where it lives, and how the parts call each other. (Team A: Blueprint · Team B: CAW)
2. Each team must find out, by running it on this machine, how its repos are installed, tested and
   started locally, and what the tests actually report today.
3. Each team must describe its product's main user flows as they actually render on screen, step
   by step, from the screen the user touches to the code that answers it.
4. Both teams must describe the Blueprint ↔ CAW seams (the read API and the front link) from their
   own side, so the two descriptions can be compared.
5. Team B must show where CAW starts Claude CLI and how local tests avoid a live run.
6. Each team must check the `[team-proposed, Atlas read 2026-10-29]` lines in `SYSTEM-FACTS.md`
   that concern its product, and say for each one: confirmed or wrong, with evidence.
7. Each team must list what the code does not explain or looks wrong (failing tests, dead code,
   TODOs, contradictions, risks) — **listed, not fixed**.
8. The code must be left exactly as it was found.

## Acceptance Criteria

Where an AC says "the map", it means the files the team's SA writes for this REQ, under
`i-space/ai-worker/` (file names and shape are the SA's choice). Every claim in the map carries
`file:line` (repo by logical name) or the command that showed it.

- [ ] **AC-1** (req 1) — **Given** Blueprint's map **When** a reader picks any top-level folder under `src/` in `blueprint-back` or `blueprint-front` **Then** the map names that folder and says in one line what it is for, with a file citation.
  - Check: QA, by listing `src/` top-level folders in both repos and finding each one in the map; a folder missing = fail.
- [ ] **AC-2** (req 1) — same as AC-1 for CAW (`caw-back` including its MCP server and runner, and `caw-front`).
  - Check: QA, as AC-1.
- [ ] **AC-3** (req 2) — **Given** a fresh shell on this machine **When** a reader runs the install, test and start commands the map gives for each of the four repos **Then** each command behaves as the map says, including the test count (passed / failed / skipped) the map recorded on its date.
  - Check: QA runs them; numbers must match the map, or the difference is explained by a change on `atom` since then.
- [ ] **AC-4** (req 2, unhappy path) — **Given** a test that fails, a command that does not work, or a step that needs something this machine lacks (an env var, a service, a key) **When** the team meets it **Then** the map records it as observed, with the real output — the team does not fix it, skip it silently, or invent the missing value.
  - Check: QA reads the map's run section against its own run of AC-3.
- [ ] **AC-5** (req 4) — **Given** Team A's description of the read API (from `blueprint-back`'s side) and Team B's (from `caw-back`'s side) **When** QA lays them side by side **Then** every call (today, per `SYSTEM-FACTS.md`: getProject / getVersion / partContext / versionsAfter / locate / amend) appears in both, with its inputs and outputs, and every disagreement between the two sides is listed as a finding, not resolved by either team. The front link (blueprint-front ready screen → caw-front `/start`) is described the same way.
  - Check: QA, side-by-side comparison of the two maps.
- [ ] **AC-6** (req 3) — **Given** Blueprint's map **When** a reader follows its main flow (sources → AI interview → confirmed spec version → ready screen → "ส่งไปสร้างที่ CAW") **Then** each step names the screen the user sees, the route/page file that renders it, and the API call behind it — and a step that exists in code but no screen reaches is marked "not reachable from the UI".
  - Check: QA opens blueprint-front locally (mocked backends allowed) and walks the flow against the map.
- [ ] **AC-7** (req 3) — same as AC-6 for CAW's main flow (`/start` with a confirmed version → a run → workers → result shown).
  - Check: QA opens caw-front locally with mocks/fixtures and walks the flow against the map.
- [ ] **AC-8** (req 5) — **Given** CAW's map **When** a reader looks for how Claude CLI is started **Then** the map cites where CAW launches it, what it passes, and which mock/fixture the tests use instead — and **no live Claude CLI run happened** while doing this REQ.
  - Check: QA reads the citations in code; the team's TASK evidence and log show no live run. A live run without the owner's word (asked through the PM) = fail of the whole REQ.
- [ ] **AC-9** (req 6) — **Given** every `[team-proposed, Atlas read 2026-10-29]` line in `SYSTEM-FACTS.md` about the team's product (stack, ports, sizes, seams, old spec-ID series) **When** the team checks it **Then** the map says per line "confirmed" or "wrong — actually <x>", with evidence. The team does not edit `SYSTEM-FACTS.md`; the PM records the results there.
  - Check: QA, one line at a time.
- [ ] **AC-10** (req 7) — **Given** the map **When** a reader looks for open questions and risks **Then** there is one list per product, each item with evidence and a severity guess marked as the SA's, and nothing on it has been changed in code.
  - Check: QA reads the list; the PM reads it for anything to raise with the owner.
- [ ] **AC-11** (req 8, regression) — **Given** the four repos on branch `atom` at the HEADs recorded in `SYSTEM-FACTS.md` (blueprint-back f60b934 · blueprint-front e46322a · caw-back 102a130 · caw-front 4b58bf3) **When** this REQ is done **Then** each repo is still on `atom`, at the same HEAD, with no tracked file modified (build output and installed dependencies that git ignores are fine).
  - Check: QA, `git status` and `git log -1` in each repo (reading git state only).

## User-facing wording

None — this REQ changes nothing a user sees.

## Constraints

- **No live Claude CLI run** — it spends the owner's subscription quota; only on his word, asked through the PM (`PROTOCOL.md` § Hard boundaries, `DECISIONS.md` 2026-10-29 00:19).
- **No live LLM gateway call** — **AMENDED 2026-10-29 by the PM** after Team A's map (`maps/blueprint.md` §6): blueprint-back calls the real gateway `https://ai.develyst.online` by default, so a plain `bun run dev` plus an interview round spends real calls. Start blueprint-back only with the gateway pointed away or the interview step not triggered; a step that needs a live LLM answer is recorded `NOT_TESTED — needs a live gateway call (owner's word)`. `[PM-decided]` Same rule as the Claude CLI line below.
- This machine only; no dev server, no deploy server (`PROTOCOL.md` § Environments).
- **No git command of any kind that writes** (`CLAUDE.md` §6); no branch.
- Each team reads and runs only its own two repos — the seam included: each side is described from its own repo only, so AC-5's comparison means something `[PM-decided]`.
- No real data, no SQL against anything real; tests' own pglite is fine.

## Out of Scope

- Fixing anything found — bugs, failing tests, dead code. They go on the AC-10 list; fixing is a later REQ the owner decides.
- Refactor or redesign proposals beyond one line per risk.
- Importing the old team's SPEC/REQ/DECISIONS (`legacy/README.md` — a later order, Atom brings the folder).
- Mapping each old ID (`SPEC-A-…`, `TASK-B-…`, `D-…`) to its meaning — the old folder will tell us; the map may cite them where the code does.
- Any live Claude CLI run, deploy, or production check.
- ~~A document written for the owner to read. If he wants one, that is a new ask (see `## Second reading`).~~
  **AMENDED 2026-10-29 by the PM** (Q1 answered): a short Thai overview for the owner **is** wanted
  after this REQ is done — **the PM writes it** from the QA-checked maps. It stays out of scope for
  the SAs; their deliverable does not change.

## Second reading — who must understand the code

- **What I read it as:** the team must understand it, and that understanding must live in desk files so the next session has it.
- **The strongest other reading:** the owner wants to understand his own product again — a readable overview *for him*, judged by him.
- **What would tell them apart:** the owner's own word. Cheap to reverse: the team's map is the input either way; a summary for the owner can be written from it later.
- **Asking:** @Sober · @Silver — one reply each in `inbox/PM.md` if your reading differs; silence = my reading holds for the SA side. I tell the owner my reading in one line and he can correct it.

## Questions

- **Q1 (PM → owner — does not block)** — is the map for the team, or do you also want an overview to read yourself?
  > recommendation `[PM-decided]`: for the team; build on it, summarise for the owner only if asked.
  > answer: **ANSWERED 2026-10-29 00:43 by Atom for the owner, `[operator-delegated]`** — the map is for the team, and when REQ-101 is done a short Thai overview of the whole system is written for the owner to read. (`DECISIONS.md` 2026-10-29 00:43) The PM writes the overview; nothing changes for the SAs.

## Verification (written when the work comes back — by QA)

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | 15/15 Blueprint `src/` folders in the map; 16 citations opened, all match (TEST-101 #2–3) |
| AC-2 | PASS | 21/21 CAW folders incl. `mcp` and `runner`; 30 citations opened, all match (#4–5) |
| AC-3 | PASS | ran install, test and start in all four repos: 677/1/1 · 328 + 257 e2e · 218/16/0 · 186 + 4 + 34 + 1; start lines as mapped (#6–8) |
| AC-4 | PASS | every failure I hit is in the maps with its real output; the 16 skips split 1 + 15 (#9–10) |
| AC-5 | PASS | 6 calls on both sides with I/O; also run end to end (button → CAW board, all calls, push). 5 seam observations S-F1…S-F5, none a broken call (#11–14b) |
| AC-6 | PASS | Blueprint flow walked by clicks; unreachable marks hold. Interview with a real model NOT_TESTED (live gateway) (#15–16) |
| AC-7 | PASS | CAW flow walked by clicks on the mock; /start negatives as mapped; nit S-F6 (#17–18) |
| AC-8 | PASS | launch site and arguments as cited; `claude` stub log 0 bytes across all runs; no live run in the TASK evidence (#19–21) |
| AC-9 | PASS | re-counted every Atlas number myself, all agree; no SA edit of SYSTEM-FACTS (#22–23) |
| AC-10 | PASS | one list per product, with evidence and the SA's severity; nothing fixed (#24–25) |
| AC-11 | PASS | all four `atom` at the recorded HEADs, no team change. QA's own `tsconfig.json` side effect in caw-front was removed and checked byte-identical (F-003) (#1, #26) |
