# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log.
> One page, ~4–6 KB. History in `log/`, facts in `SYSTEM-FACTS.md`, state in `board.md`.
> **Who writes it:** the PM, rewritten before ending any session. **Who reads it:** the PM and
> both SAs, first. On opening, the PM checks it against `board.md` and today's log and reports any
> disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[operator-delegated YYYY-MM-DD]` · `[team-proposed]` · `[carried-over]` · `[PM-decided]`

**Written:** 2026-10-31 18:3x by Porter (PM) (adds REQ-127; FAILURES gate now PASS after Atlas) · **Newest log:** `log/2026-10-31.md`

## What we are in the middle of

- **REQ-124 DELIVERED 2026-10-31 03:2x** — the owner's finish line met locally: new product "สมุดยืม-คืนหนังสือในออฟฟิศ", screens only, 8/8 points work, 0 interventions, 9/9 notes (TEST-122 § Round 2). REQ-125 AC-4 + REQ-126 AC-5 PASS live. `[PM-decided]` (DECISIONS 2026-10-31 03:2x)
- **REQ-126 round 2 DELIVERED + COMMITTED 2026-10-31 05:12** (caw-back 8271082 · caw-front e7a36eb, PM verified) — DEF-2 fixed: a reworded repost of work already on open cards is refused; only new work becomes cards (TEST-124 § Round 2, stub). O-2 accepted (an old open plan re-enabled after one of its cards is done). `[owner-approved 2026-10-31]` (git word) · `[PM-decided]` (O-2)
- **Nothing in flight on the desk.** Every REQ is DELIVERED or CANCELLED. `[PM-decided]`
- **รวมโค้ด done 2026-10-31 13:35** (owner typed by Atom 13:31) — all 4 repos atom = develop = origin: bp-back 08e1e4d · bp-front 6a64527 · caw-back 8271082 · caw-front e7a36eb; fast-forward, no deploy. Local `develop` tracks origin/main / origin/nichaphon (pre-existing, untouched). `[owner-approved 2026-10-31]`
- **REQ-127 DELIVERED 2026-10-31 18:3x** — Blueprint front builds standalone, back compiles a Linux binary (skill `deploy-ready-build`); TEST-125 PASS, AC-4 (Linux binary on a DB route) NOT_TESTED → owner's first server run. **COMMITTED 18:38 on `nichaphon`** (owner "ขึ้นgitเลย"): bp-front fbf3424 · bp-back d8df886, PM verified HEAD = origin/nichaphon, author develyst, no `.env`. `atom` does not have it. `[owner-approved 2026-10-31]` (checkout) · `[PM-decided]` (DECISIONS 16:5x–18:3x)
- **The owner's Windows box now has blueprint-back / blueprint-front in `machine.local.md`** (branch `nichaphon`, his `.env` in bp-back); the team's sessions run there. CAW repos not listed. `[PM-checked 2026-10-31 17:0x]`
- **Delivered + committed (PM-verified, hashes on the board / DECISIONS):** REQ-125 (caw 5779554 / ce5ca8d), REQ-126 (caw 5b49f65 / 7f68c42), REQ-122, 121, 120, 119, 118, 115, 108 and earlier. `[owner-approved 2026-10-31]`
- **REQ-123 CANCELLED** — removed from Blueprint (bp-back 08e1e4d · bp-front 6a64527), CAW uncommitted work discarded. `[owner-approved 2026-10-31]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| Next work | owner | 2026-10-31 05:1x | the owner's next order (watch list below rides the next live run) |
| FAILURES F-062 (PM), F-063 (QA) NEW | Atlas | 2026-10-31 | Atlas review |
| Gate WARNs: 29 closed board rows, log 2026-10-31 > 40 KB, boot reads > 45 KB | owner → Marie | 2026-10-30 | Marie housekeeping |

## Standing orders to remember

- **Desk goal** = finish I-Space itself: a new project built through I-Space, full loop, locally; every REQ closed. Deployment / server / pm2 / SIT / real `.env`: never touched. Deleting anything: show the owner the list first. `[owner-approved 2026-10-30]` (SYSTEM-FACTS 23:31–23:32)
- **Never stop and wait for the owner:** the PM decides and logs under `DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน"; scope: not deploy/money/customer, no git origination, gateway ≤ 6 per test round. `[owner-approved 2026-10-30]`
- **Git per REQ, only on the owner's words** typed in the PM pane — Atom typing = owner typing (`ATOM.md`, 914450f). Quote the words to the SA with QA's tree fp (`tools/tree-fp.sh`); verify HEAD = origin/atom, author, file count, tree-fp = QA's. `[owner-approved 2026-10-30]`
- Live Claude CLI for tests allowed (DECISIONS 2026-10-29 13:01); every live hand-off says "free -m first, stop < 3 GB". `[owner-approved 2026-10-29]` · `[PM-decided]` (threshold)

## Noted, not yet in a REQ

- Watch list for the next live run: TEST-124 r1 DEF-1 (loose scratch file) / O-1 (cross-worker temp-folder refusal), TEST-124 r2 O-2 (old open plan re-enabled → a requirement could get two card sets). Any of them seen live → a REQ-126 round. `[PM-decided]` (DECISIONS 02:3x, 05:1x)
- Later intent, not needed for the loop: typing into a worker's screen (11:41 item 9 step 2), login (10:51 "later"). `[owner-approved 2026-10-29]`

## What we already tried that did NOT work

- An inbox `>>` or `drain-inbox.mjs` combined with other commands in one Bash call is blocked by hooks — run each alone. `[PM-observed 2026-10-29]`
- A pre-git check written as `&& echo` under `set -e` does not stop the script (F-058) — verify tree-fp after the commit too. `[carried-over]`
- Two PM watchers at once (F-005): the script refuses a second (exit 3). `[carried-over]`
- Chasing a live model that fails differently each round — make the server check it deterministically (REQ-114 r2). `[PM-decided 2026-10-30]`
- Time stamps guessed or copied from another file (F-043…F-046) — every stamp from `date`. `[carried-over]`

## Open questions with the owner

- Review of the PM's own calls in `DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน". `[PM-decided]`
- Deploy design (CI/CD / auto deploy) — owner 16:17 "talk after this round"; deployment side off-limits since 23:31, so only when he raises it. `[owner-approved 2026-10-30]`
