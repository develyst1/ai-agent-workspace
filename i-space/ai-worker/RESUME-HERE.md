# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log.
> One page, ~4–6 KB. History in `log/`, facts in `SYSTEM-FACTS.md`, state in `board.md`.
> **Who writes it:** the PM, rewritten before ending any session. **Who reads it:** the PM and
> both SAs, first. On opening, the PM checks it against `board.md` and today's log and reports any
> disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[operator-delegated YYYY-MM-DD]` · `[team-proposed]` · `[carried-over]` · `[PM-decided]`

**Written:** 2026-10-30 15:3x by Porter (PM), after the memory-card /clear (PILOT row 15:28) · **Newest log:** `log/2026-10-30.md`

## What we are in the middle of

- **Delivered + committed (all PM-verified, hashes on the board):** REQ-103, 104, 105, 110, 111, 112, 113, 114, 116, 117. Delivered, no code: REQ-101, 102, 107. `[owner-approved 2026-10-30]`
- **REQ-108 phase 2 TEST_FAILED** 15:29 (TEST-106 § Phase 2): pipeline works end to end; AC-4 fails because a hand-entered spec never reaches the workers. → **REQ-118** (joint A+B, seam) and **REQ-119** (Team B: honest run end, hand-off by name), both READY_FOR_SA 15:3x; phase 3 (AC-4 live) after both commit (DECISIONS 2026-10-30 15:3x). `[PM-decided]`
- **REQ-115** (gateway model per task) — IN_SPEC, SPEC-112; TASK-134 (Jason) hold met by REQ-116 commit f10f8cb, SA A releases it; TASK-135 (Fern) after TASK-134's openapi. `[team-proposed]`
- **Team B:** REQ-119 + REQ-118's CAW side (since 15:3x). `[PM-decided]`
- **Owner's order:** 105 → 112 → 108 (DECISIONS 2026-10-30 02:4x) — 105 and 112 done, 108 in test. `[owner-approved 2026-10-30]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| REQ-118 | SA A (contract) + SA B (CAW side) | 2026-10-30 15:3x | SPECs → TASKs → QA stub ACs → owner's git |
| REQ-119 | SA B | 2026-10-30 15:3x | SPEC → TASKs → QA stub → owner's git |
| REQ-108 phase 3 | REQ-118 + REQ-119 committed | 2026-10-30 15:3x | QA live re-run of AC-4 |
| REQ-115 | SA A (Sober) → Jason TASK-134, then Fern TASK-135 | 2026-10-30 15:21 | build + review → SPEC_DONE → QA (live proof ≤ 6 gateway calls) → owner's git |
| Atlas's fixes from the F-027…F-042 review (gate PASS 16:3x, PM-checked) | Marie, ORDER 45 | 2026-10-30 16:3x | re-read lines arrive in the inboxes |
| Gate WARNs: log 106 KB, board 55 closed rows, boot reads > 45 KB, TASK-109 patch 226 KB | owner → Marie | 2026-10-30 15:27 | Marie housekeeping |

## Standing orders to remember

- **Desk goal = the owner's "100%"** (16:13): he deploys to SIT, creates a real project through I-Space, full loop, the team finishes it like he would. Plan: `../project-docs/plan-sit-th.md` — 115 → 119 → 118 → REQ-108 ph. 3 → REQ-106 → REQ-109 → local dress rehearsal → owner's SIT. SIT untouched until recorded. `[owner-approved 2026-10-30]` (goal) · `[PM-decided]` (order)
- **Never stop and wait for the owner:** the PM decides and logs under `DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน"; scope: not deploy/money/customer, no git origination, gateway ≤ 6 per test round. `[owner-approved 2026-10-30]`
- **Git per topic, only on the owner's words** typed in the PM pane — Atom typing = owner typing (`ATOM.md` "Ruled by the owner — 2026-10-29", 914450f). Quote the words to the SA with QA's tree fp; verify HEAD = origin/atom, author, file count. `[owner-approved 2026-10-30]`
- **Gateway model per task** (owner 09:49) → REQ-115. `[owner-approved 2026-10-30]`

## Decided recently, not yet in a REQ

- **End goal = deploy-ready on Linux** (owner 2026-10-29 13:04) → REQ-109 (to write, last): no Mac-only paths/flags (known: blueprint-front `scripts/check-required.ts:180` `cp -cR`), env-only config, setup/env docs for all four repos. `[owner-approved 2026-10-29]`
- REQ-106 (persistent CLI per worker, parallel team; fold in REQ-107's wake design) planned, not written. `[owner-approved 2026-10-29]` (intent)

## What we already tried that did NOT work

- SendMessage / ListAgents find no peers; each role's `watch-inbox.sh` wakes it. Ring fallback lines go in `inbox/WAKE.md`. `[PM-observed 2026-10-29]`
- An inbox `>>` or `drain-inbox.mjs` combined with other commands in one Bash call is blocked by hooks — run each alone. `[PM-observed 2026-10-29]`
- Edit scripts with JS `replace(a, b)` where `b` holds `$` pasted whole files (F-025). Use the editor tool. `[carried-over]`
- Two PM watchers at once (F-005): the script refuses a second (exit 3). `[carried-over]`
- Chasing a live model that fails differently each round — make the server check it deterministically instead (REQ-114 r2). `[PM-decided 2026-10-30]`

## Open questions with the owner

- **Deploy design (CI/CD / auto deploy)** — owner 16:17: not designed; talk after this round's work (PM raises it after the dress rehearsal, before the first SIT). Today he deploys by hand: clone → build → server → `pm2 restart`. `[owner-approved 2026-10-30]`
- Atlas's Q1–Q5 (FAILURES review fixes) — Atlas put them to the owner, not the PM. `[carried-over]`
- Review of the PM's own calls in `DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" (08:4x … 14:2x). `[PM-decided]`
