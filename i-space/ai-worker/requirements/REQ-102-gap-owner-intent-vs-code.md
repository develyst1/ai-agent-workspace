# REQ-102: Gap report — the owner's product intent vs today's code

- Status: DELIVERED (2026-10-29, the PM — after QA's TEST_PASSED 12:02 round 2; PM re-checked AC-6: four repos on atom at baseline HEADs, 0 tracked changes) · round 1 TEST_FAILED 11:58 (AC-5, 3 lines, fixed) · owner's answers filed `DECISIONS.md` 11:41
- Priority: HIGH `[PM-decided: the owner's next step after REQ-101]`
- Requested: 2026-10-29 10:51 by the owner, relayed by Atom in English — stamp: `operator` (the owner's own Thai words not seen by the PM)
- Deadline: none
- Depends on: REQ-101 (DELIVERED; `maps/blueprint.md`, `maps/caw.md`)
- Split: **Team A (Sober)** = point a + Blueprint's side of b + what Blueprint uses the gateway for · **Team B (Silver)** = CAW's side of b + point c + point d (added 10:53). `[PM-decided]`

## The ask (owner via Atom, 2026-10-29 10:51 — as relayed)

> "Please record these as owner decisions, then have both SAs compare them with the current code and report the gaps (what fits, what differs) in short form. No code changes yet."

The three points, as relayed (also in `SYSTEM-FACTS.md` § "Owner's corrections, 2026-10-29 10:51"):

- **(a)** "Blueprint is the store of spec and requirements; the PM edits and adds there. No arbitrary version splitting. The SA/PM using the site put version labels on by hand. Every edit or addition MUST keep an audit log."
- **(b)** "So CAW must always see the LATEST spec immediately, not separate versions; a version label is only a tag for work."
- **(c)** "CAW = Cloud Agent Workspace. The main AI work opens a CLI per user, per the team set up, and works like Atom does (CLI opened on the server). The LLM gateway is only for small parts and decision AI."

- **(d)** — **AMENDED 2026-10-29 10:53 by the PM** (owner via Atom 10:53): "CAW should show each agent its own CLI screen (a live terminal view per worker), so users can watch the work going on behind the scenes if they want. Please record it with the others and include it in the SA gap check." → Team B.

## Problem / Goal

REQ-101 mapped what the code does. The owner says parts of it are not what the product is meant to be.
Before anyone changes code, the owner needs a short, evidence-backed list per point: **what already fits,
what differs, and how far apart they are**, so he can decide what to build first.

## Requirement

1. For each owner point, each responsible team writes **fits / differs / partly**, per sub-claim, with `file:line` evidence.
2. The report is short: at most ~1 screen per point, one line per sub-claim. Detail stays in the existing maps.
3. Each "differs" line says in one plain sentence what would have to change. It is a size guess marked as the SA's (S/M/L), not a design.
4. Anything the owner's words leave open (where a reading of his point could go two ways) is listed as a question, not settled.
5. No code changes, no live gateway call, no live Claude CLI run.

## Acceptance Criteria

- [ ] **AC-1** (a) — **Given** Team A's report **When** the reader looks at point a **Then** there is one line each for: where spec/requirements are edited and added · whether versions are created only by a person's hand-applied label, or also automatically/by a gate · whether every edit and addition writes an audit record (who, when, what changed) — each marked fits/differs/partly with `file:line`.
  - Check: QA opens each cited `file:line` and confirms it says what the line claims.
- [ ] **AC-2** (b) — **Given** both reports **When** the reader looks at point b **Then** Team A says what the seam serves (latest draft vs a confirmed snapshot, per call) and Team B says what CAW reads and when it sees a change (per call, plus the `/v1/notify` push) — and the two agree, or the disagreement is listed.
  - Check: QA lays the two side by side, as in TEST-101 AC-5.
- [ ] **AC-3** (c) — **Given** Team B's report **When** the reader looks at point c **Then** there is one line each for: how CAW starts the CLI today (per hop? per worker? per user?) · how a "team" maps to CLI sessions · where it expects to run (server vs local) · whether CAW itself calls the LLM gateway, and for what — each marked fits/differs/partly with `file:line`.
  - Check: QA, as AC-1.
- [ ] **AC-4** (c, Blueprint side) — **Given** Team A's report **When** the reader looks for gateway use **Then** every place Blueprint calls the LLM gateway is listed with what it is used for (interview, quiz, locate, …). It is **not** marked fits/differs: whether that counts as "small parts and decision AI" is the owner's call (Q1).
  - Check: QA greps blueprint-back for the gateway client's callers and finds each one listed.
- [ ] **AC-3b** (d — added 2026-10-29 10:53) — **Given** Team B's report **When** the reader looks at point d **Then** there is one line each for: whether caw-front shows anything per worker today (which screen) · whether the CLI's live output is captured or streamed anywhere (runner → API → front) · what a user sees of a running hop now — each marked fits/differs/partly with `file:line`.
  - Check: QA, as AC-1.
- [ ] **AC-5** — **Given** each "differs" or "partly" line **When** the reader looks at it **Then** it has one sentence on what would have to change and an S/M/L guess labelled as the SA's.
  - Check: QA counts. A missing sentence or size fails the line.
- [ ] **AC-6** (regression) — **Given** the four repos on `atom` at f60b934 / e46322a / 102a130 / 4b58bf3 **When** REQ-102 is done **Then** no tracked file changed and no live gateway call or Claude CLI run happened.
  - Check: QA, `git status` / `git log -1` per repo, plus the teams' TASK evidence.

## User-facing wording

None.

## Constraints

- No code changes (owner 10:51: *"No code changes yet"*). No live LLM gateway call, no live Claude CLI run (REQ-101 Constraints carry over).
- Each team reads only its own two repos; the seam is compared by QA (same reason as REQ-101 AC-5).
- Short form: the owner asked for it. The PM turns the two reports into one Thai summary for him.

## Out of Scope

- Designing or building the changes. That is a later REQ, after the owner chooses.
- Overview risks 1, 3 and 4 (owner 10:51: later).
- Changing how the gateway is called (owner 10:51: live defaults are correct).

## Questions

- **Q1 (PM → owner — does not block)** — Blueprint's AI interview (and quiz) runs through the LLM gateway today. Does that count as "small parts and decision AI", or should it also move to the CLI-per-user way?
  > recommendation `[PM-decided]`: ask after the reports land, with AC-4's list in hand, so the owner decides on facts.
  > answer: _(pending)_
- **Q2 (PM → owner — does not block)** — "a CLI per user": does "user" mean each person logged into CAW, or each AI worker in the team? Both SAs: report what the code does; do not pick.
  > recommendation `[PM-decided]`: ask together with Q1 once the reports are in.
  > answer: _(pending)_

- **Owner decision pack (2026-10-29, the PM)** — Q1, Q2 and the SAs' Q-A1…A3 and Q-B1…B4, plus one for c3 (a team working in parallel), sent to the owner as one Thai file with the PM's default per line: `../project-docs/gap-102-th.md`. Answers will be filed in `DECISIONS.md` with their scope.
  > answer: **ANSWERED 2026-10-29 11:41 by the owner via Atom, `[operator]`** — *"ใช้ตามที่ Porter แนะนำทุกข้อ ไปเลย"*: all 10 defaults accepted as written (`DECISIONS.md` 2026-10-29 11:41).

## Verification (by QA)

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | a1–a7 cover where / versions / audit; opened every cited line in both Blueprint repos, all match (TEST-102 #1–2) |
| AC-2 | PASS | side by side, every fact agrees; one marking difference listed, G-F1 (getProject "fits" vs CAW reading only `name`) (#3–4) |
| AC-3 | PASS | c1–c6 present and cited, all lines match; c2's "depends on Q2" read as REQ Q2 asked (#5–6) |
| AC-3b | PASS | d1–d3 present and cited, all match; 30 s heartbeat checked (#7–8) |
| AC-4 | PASS | my grep finds exactly g1–g4 (interview, quiz, 2 × model list) (#9) |
| AC-5 | PASS (round 2, 12:02) | round 1 FAIL: a3, B b5, B d3 lacked S/M/L (DEF-1). After the fix, 23/23 partly/differs rows carry a sentence + size; a3's new `registry.ts` claim checked by running it (#10, #10b) |
| AC-6 | PASS | four repos at baseline HEAD, nothing tracked changed; no run claimed or recorded (#11–12) |
