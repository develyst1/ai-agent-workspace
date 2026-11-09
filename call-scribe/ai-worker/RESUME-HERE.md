# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log.
> The moment you add a second "Where we are — <date>" block under the first, it
> stops being a snapshot and becomes another thing nobody can read. That is
> exactly how its predecessor died: `PROJECT-STATUS.md` reached 47.9 KB by
> stacking three dated blocks, sat outside `ai-worker/` where the hygiene gate
> never looked, and was **nine days stale** while a cold PM read it faithfully
> and looked lost.
>
> **One page. ~4–6 KB.** History belongs in `log/`, decisions in
> `SYSTEM-FACTS.md`, state in `board.md`. This file holds only the *situation*.
>
> **Who writes it:** the PM **rewrites it before ending any session**.
> **Who reads it:** the PM and the SA Lead, **first**, before the board and
> before the log. Engineers and QA do not read or write it — their context
> travels with their TASK.
>
> **On opening,** the PM checks it against `board.md` and today's log and
> **reports any disagreement to the owner** — never silently trusts it, never
> silently fixes it. A situation file that quietly drifts is worse than none.
>
> **Provenance on every line**, one of:
> `[owner-approved YYYY-MM-DD]` · `[team-proposed]` · `[customer-asked]` · `[carried-over]`
>
> The hygiene gate measures this file: over 8 KB warns, over 20 KB fails, more
> than one "RESUME HERE" heading fails, and being more than 2 days behind the
> newest log fails.

**Written:** 2026-11-07 by the PM · **Newest log at the time:** `log/2026-11-07.md`

## What we are in the middle of

- **PAUSED 2026-11-07 for a new project.** Owner (typed by Atom, 12:16): save all, `ขึ้น git`, `รวมโค้ด`, then God Plan. Notes only, verbatim: `../project-docs/god-plan-initial-notes-2026-11-07.md`. Nothing built from them. `[owner-approved 2026-11-07, typed by Atom]`
- REQ-101 stays `IN_SPEC`. **Nothing has passed a tester, run on a phone, or called a real AI.** `[team-proposed]`
- Git, branch `atom`: `call-scribe-back` 22d8de8 and `call-scribe-front` 4070f78, each also on `develop`; `develyst-ai` 6711807 on `atom` only, `develop` at f9699aa. Nothing deployed. **`develop` holds code no tester has passed.** TASK-115 is `DONE` per Sober, though commit 3bb7f2c's message wrongly says in progress (corrected in the TASK; F-023). `[team-proposed; the PM checked with ls-remote]`
- **This desk's folder is NOT on git.** `call-scribe/` is untracked in the workspace. No rule lets anyone here commit it: `CLAUDE.md` §6 bars every agent from committing `ai-worker/`; `ATOM.md:143` excludes another desk's folder from Atom's exception; the SA never runs git in the workspace. It needs the owner's own commit or his written exception. `[team-proposed]`

## On return, in this order

1. Back rerun on the real database; Jason does TASK-116 (orphan folders, AC-18), not started. `[team-proposed]`
2. Tanya proves her harness fixes, not yet proven, then reruns the stub cases, on a machine that does not pause. `[team-proposed]`
3. TASK-103 live, when the owner gives his word in the PM's pane: US$0.50, small models, no DeepSeek. Prep is `DONE`. `[team-proposed]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| `รวมโค้ด` on `develyst-ai` | Owner, Atom | 2026-11-07 | His word, and GitLab hooks shown not to deploy; 6 of the 7 commits are unreviewed here, including auth. PM recommended waiting |
| TASK-103 live, voices, 9 real TEST-102 cases | Owner: his own word in the PM's pane | 2026-11-07 | A relay does not count for money (`DECISIONS.md`) |
| Which machine | Owner | 2026-11-07 | PM recommended moving before more tests or paid runs: 14 pauses, 6.45 h lost in 8.35 h, plus 15 shorter gaps |
| AC-9, AC-10, AC-13, AC-17 | Owner: LINE call; deploy word | 2026-11-06 | His phone and word |
| FAILURES review, 22 unreviewed; gate FAIL | Owner: call Atlas | 2026-11-07 | Work was not held `[PM-decided]`; he has been told |
| Workspace commit of `call-scribe/` | Owner: his own commit, or a written exception | 2026-11-07 | Scan by the PM: 179 files, 3.0 MB, no media or `.env`, only fake local credentials; 3 files name absolute paths |
| `blueprint-front`: 6 uncommitted deletions | Owner, that desk | 2026-11-07 | Reported, untouched |

## Decided recently, not yet in a REQ

- Q11, Sober: 15 of 15 stalls in 8.4 h follow a pause; a request on a dead connection can hang up to about 15 minutes; TASK-115 bounds it at 10 s. Nothing yet shows it without a pause. Whether it explains Fern's stalls is unproven. `[team-proposed]`
- Lead: 2 audio folders with no database row, cause unknown; kept in Tanya's store as evidence. `[team-proposed]`

## What becomes urgent, and when

- Gemini rates in the sizing double on 2027-01-01 (Google's page, read 2026-11-06). `[team-proposed]`

## What we already tried that did NOT work

- Local Thai text-to-speech install: refused twice by Tanya's session check (TEST-102 Q1). Never try it from another session. `[carried-over]`
- No Android test has run anywhere; this box has no phone, adb or emulator. `[carried-over]`
- A web app should not be expected to capture a LINE call (Sober, Android docs, not run on his phone). `[carried-over]`

## Open questions with the owner

- All in the table above. `[team-proposed]`
