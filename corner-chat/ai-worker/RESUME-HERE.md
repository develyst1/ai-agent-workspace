# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log. One page, ~4–6 KB.
> History → `log/`, decisions → `SYSTEM-FACTS.md` / `DECISIONS.md`, state → `board.md`.
> The PM rewrites it before ending any session; the PM and the SA Lead read it first.
> On opening, the PM checks it against `board.md` and today's log and reports any disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[team-proposed]` · `[customer-asked]` · `[carried-over]`.

**Written:** 2026-11-01 by the PM · **Newest log at the time:** `log/2026-11-01.md`

## How the desk works now — read first

- **The owner does not want to be asked.** Goal = done and usable. A question → team round → decide → list it in
  `../project-docs/decisions-for-owner-review.md` §A. Keep going until truly blocked. [owner-approved 2026-11-01]
- **No deploy.** Develop to the end, locally. [owner-approved 2026-11-01]
- Hard lines unchanged: git only on his command; no send/change on a real system without his go. [carried-over]

## What we are in the middle of

- First round handed to both teams 2026-11-01: Team A (SA Sober) REQ-001 accounts+admin, REQ-002 Zimbra, REQ-004
  filter + back-end base + the API contract (SPEC-001); Team B (SA Silver) REQ-003 LINE, REQ-005 Android app.
  Claims on the board. QA Tanya (A) and Tefany (B) designing TESTs from the REQs. [team-proposed, D17]
- The product as the owner shaped it: `../project-docs/requirement-understanding-2026-11-01.md` §1c + `DECISIONS.md`. [owner-approved 2026-11-01]

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| REQ-001/-002/-004 SPECs + TASKs | SA Team A (Sober) | 2026-11-01 | SPEC-001 incl. the API contract |
| REQ-003/-005 SPECs + TASKs | SA Team B (Silver) | 2026-11-01 | Team A's API contract for the app |
| Team B TASK-020 (LINE notifier) — BLOCKED on Team A TASK-007 | PM relays | 2026-11-01 | **when Sober reports TASK-007 DONE → tell SA-B at once** |
| Team B TASK-014 (app toolchain) — FE Fanta's session running, no activity since 02:44 | the owner (her window) | 2026-11-01 | likely a permission prompt only he can answer |
| TESTs for all five REQs | QA Tanya (A), Tefany (B) | 2026-11-01 | their TEST files |
| Owner-only inputs B1–B4, B6 (test LINE OA, test mailboxes, Firebase, gateway key, branch) | the owner | 2026-11-01 | listed, not asked; needed before real-system testing / any commit |

## Decided recently, not yet in a REQ

- Everything decided so far is in REQ-001…005 or `DECISIONS.md`. [carried-over]

## What becomes urgent, and when

- No dates. The first owner-only input needed is the test accounts (B1, B2) — when the teams reach real-system tests. [carried-over]

## What we already tried that did NOT work

- Asking the owner long or technical questions: two misses on 2026-11-01 (F-001 long message, F-002 LINE quota before the
  flow was confirmed). Now moot: he is not asked; decisions are listed. [carried-over]

## Open questions with the owner

- None asked. Review list: `../project-docs/decisions-for-owner-review.md` (D1–D17, B1–B6). FAILURES F-001, F-002 await Atlas. [carried-over]
