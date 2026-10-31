# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log. One page, ~4–6 KB.
> History → `log/`, decisions → `SYSTEM-FACTS.md` / `DECISIONS.md`, state → `board.md`.
> The PM rewrites it before ending any session; the PM and the SA Lead read it first.
> On opening, the PM checks it against `board.md` and today's log and reports any disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[team-proposed]` · `[customer-asked]` · `[carried-over]`.

**Written:** 2026-11-01 by the PM (first PM session — boot only) · **Newest log at the time:** `log/2026-11-01.md`

## What we are in the middle of

- Understanding the owner's requirement before any REQ — owner 2026-11-01: *"ทำความเข้าใจ requirement ให้ชัดมากทึ่สุดก่อน"*.
  The PM's reading + 16 ranked open points with defaults: `../project-docs/requirement-understanding-2026-11-01.md`.
  Q1 answered 2026-11-01: wants two-way reply unless very hard, else one-way first [owner-approved 2026-11-01];
  first scope = gather + filter by team-set rules, AI helps — "แค่นั้นก่อน" [owner-approved 2026-11-01].
  SA: two-way = M ⇒ ข by the owner's rule [PM-decided]. Auto-reply out of the first scope [owner-approved 2026-11-01].
  Q1c (LINE quota / plan) asked 2026-11-01. [carried-over]
- No REQ, SPEC, TASK or TEST exists; REQ-001 waits until the readings are confirmed. [carried-over]

## What each thread is waiting on, and from whom

| Thread | Waiting on | Since | What unblocks it |
|---|---|---|---|
| Requirement understanding (Q1b, Q2–Q16) | the owner | 2026-11-01 | his answers, one decision at a time |
| LINE quota / plan (Q1c) — SA answered Q1-SA: two-way = M ⇒ ข by the owner's rule [PM-decided] | the owner (asked 2026-11-01) | 2026-11-01 | his answer to Q1c |
| The team's working branch (own branch like `dong`, or `atom`) | the owner, asked by the PM | 2026-11-01 | the owner names it — needed before the first `ขึ้น git` |

## Decided recently, not yet in a REQ

- App name **corner-chat** [owner-approved 2026-11-01] — `SYSTEM-FACTS.md`.
- Back = Bun + Hono or Bun + Elysia only, never NestJS, + Postgres; the SA picks in SPEC-001 [owner-approved 2026-11-01].
- AI through the owner's LLM gateway [owner-approved 2026-11-01].
- Real systems: read when needed; any send/change needs the owner's go each time; test accounts by default [owner-approved 2026-11-01].
- Two teams share both repos, split by the PM's batch claims [owner-approved 2026-11-01].
- The requirement's suggested order (core + Zimbra + LINE → AI Guard → Dashboard → Auto-reply → Discord → Web Chat → Teams) is the owner's document, not yet a REQ. [carried-over]

## What becomes urgent, and when

- No dates given by the owner yet. [carried-over]

## What we already tried that did NOT work

- Nothing tried yet.

## Open questions with the owner

- Which branch the team works on (`SYSTEM-FACTS.md` → Repos; board → Blocked / waiting). [carried-over]
