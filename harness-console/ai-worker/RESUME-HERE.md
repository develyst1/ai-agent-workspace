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

**Written:** 2026-10-06 03:26 by Porter (PM), tenth PM session · **Newest log at the time:** `log/2026-10-06.md`

## What we are in the middle of

- **REQ-002 — split the console into pages / menus**, DRAFT. Owner: *"UI ขยะมาก ข้อมูลมากเกินไปรวดเดียว ... แยกหน้า แยกเมนูได้มั้ย"*. `[owner-approved 2026-10-06]` (the ask itself)
- Porter's proposed shape (side menu `Workspace` + projects; project page as `Gate` / `File health` / `Ball`, one at a time; overview unchanged) is **not approved** — REQ-002 Q-1. `[team-proposed]`
- REQ-001 stays DELIVERED; its ACs become REQ-002's regression ACs. `[owner-approved 2026-10-05]`

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| REQ-002 shape of the split | **owner** | 2026-10-06 03:25 | answer to Q-1; then Porter writes full ACs and hands to Sober |

## Decided recently, not yet in a REQ

- *(nothing)* `[carried-over]`

## What becomes urgent, and when

- The owner's own measure: if the console has not changed how his week feels within two weeks of use, v2/v3 are not worth building. REQ-002 is the first sign it is not yet usable. `[owner-approved 2026-10-04]`
- Nothing deployed; no customer commitment. `[owner-approved 2026-10-04]`

## What we already tried that did NOT work

- REQ-001 ACs covered data correctness only, no usability — owner found the UI unusable (F-001). `[team-proposed]`
- Before gate v6, `--json` was silently ignored (exit 0 on plain text). `[team-proposed]`
- A second store of state has drifted in this workspace three times; a proposal that adds one is refused, not sized. `[carried-over]`

## Open questions with the owner

- REQ-002 Q-1 — is the proposed split right, or is the overview too heavy too? `[team-proposed]`
- Still out until he adds them: mode on card, FAILURES NEW, click→open file, call-Marie button; v2/v3. `[owner-approved 2026-10-05]`
