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
> **Who writes it:** the PM (Porter) **rewrites it before ending any session**.
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

**Written:** 2026-10-05 22:03 by Porter (PM), ninth PM session · **Newest log at the time:** `log/2026-10-05.md`

## What we are in the middle of

- **Nothing open.** REQ-001 (v1, two read-only screens) is **DELIVERED** — owner: "Q1=DELIVERED" (`SYSTEM-FACTS.md`). `[owner-approved 2026-10-05]`
- TASK-001..004 DONE, SPEC-001 DONE. The UNVERIFIED list he accepted stays in `requirements/REQ-001-v1-two-screens.md` §SPEC_DONE report. `[owner-approved 2026-10-05]`
- D-16 (untracked `AGENTS.md` / `CLAUDE.md` in `harness-console-front`): owner said "ignore" — no role acts. `[owner-approved 2026-10-05]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| The next requirement (v1 extras, or anything else) | **owner** | 2026-10-05 22:03 | he states it; Porter writes the REQ |

## Decided recently, not yet in a REQ

- *(nothing)* `[owner-approved 2026-10-05]`

## What becomes urgent, and when

- The owner's own measure: if the console has not changed how his week feels within two weeks of use, v2/v3 are not worth building. A judgement, not a deadline. `[owner-approved 2026-10-04]`
- Nothing deployed; no customer commitment. `[owner-approved 2026-10-04]`

## What we already tried that did NOT work

- Before gate v6, `--json` was silently ignored (exit 0 on plain text) — "it ran" proved nothing. `[team-proposed]` (Porter checked 2026-10-05)
- A second store of state has drifted in this workspace three times; a proposal that adds one is refused, not sized. `[carried-over]`

## Open questions with the owner

- None pending. Out of REQ-001 until he adds them: mode on card, FAILURES NEW, click→open file, call-Marie button. v2/v3 stay out of scope. `[owner-approved 2026-10-05]`
