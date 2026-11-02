# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log. One page, ~4–6 KB.
> History → `log/`, decisions → `SYSTEM-FACTS.md` / `DECISIONS.md`, state → `board.md`.
> The PM rewrites it before ending any session; the PM and the SA Lead read it first.
> On opening, the PM checks it against `board.md` and today's log and reports any disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[team-proposed]` · `[customer-asked]` · `[carried-over]`.

**Written:** 2026-11-02 ~00:05 by the PM · **Newest log at the time:** `log/2026-11-02.md`

## Headline

**All 5 REQs of the first batch are DELIVERED** (REQ-001, 002, 003, 004 on 2026-11-01; REQ-005 on 2026-11-02), each with its
QA verdict and, where needed, a live check with the owner: the real-Zimbra window qa7k on 2026-11-01, and the real-LINE run
23:30–23:50 the same night. [team-proposed; the owner took part in the live runs]

## How the desk works — read first

- **Don't ask the owner; decide, then list it** in `../project-docs/decisions-for-owner-review.md` §A (D1–D46). [owner-approved 2026-11-01]
- **No deploy.** [owner-approved 2026-11-01] · **No local Postgres ever**: the DB is the owner's server, env values come from him, and
  `.env.example` must be complete (`CLAUDE.md` rule 4, D43). The server has no SSL; he said *"Unencrypted is fine"* (D45). [owner-approved]
- Real LINE only with `LINE_LIVE=1` on the command line (D44). The test OA is LifeStyle-Shop (@183qrfme), his test OA; its old
  shop bot is unused (*"นี่ใช้ทดสอบ"*). The webhook is now OFF. [owner-approved 2026-11-01]
- No Firebase (D41): the app polls every 30 s. The Android back key = in-app back; with a dialog open it closes the dialog (D46). [PM-decided]
- Git only on his command; he creates branches. The working branch is meant to be **D1**, still not created, and nothing has been
  committed in the 3 repos. [owner-approved 2026-11-01]
- FAILURES only through `add-failure.mjs`; new artifacts only through `new-id.mjs`. Log rollover is on. [carried-over]

## Still open

| Thread | Waiting on | Note |
|---|---|---|
| The back end does not reconnect after the owner's DB drops the connection | SA Sober (Team A) | Tefany's TEST-005 observation; may become a TASK |
| Branch D1 + `ขึ้น git` | owner | nothing is committed; all code is local in the 3 repos |
| LINE token reissue? | owner (decision only) | F-021 printed it into Jason's local transcript |
| Real phone / vendor battery managers | owner (optional) | only the emulator was tested; fake APK in `tests/harness/task-027/` |
| B7 (second OA refusal, REQ-003 AC-5) | owner (optional) | NOT_TESTED |

## What we already tried that did NOT work

- Long or technical questions to the owner (F-001/F-002). Env names not in `.env.example` (F-019). SA-to-SA relays (F-016).
  Live windows go better as numbered, copy-paste steps, with a screenshot asked back. [carried-over]

## Session ids

Sober `local_141a8abd-de14-479a-bb79-6802b154284d` · Silver `local_2ffd5074-771c-41c5-b42d-cce8eb59ad23` · Tanya `local_bc02b21f-42cd-4e52-aef6-a921efd6ef1d` ·
Tefany `local_5907b956-b59f-4b33-8e20-a0f17f636f2a` · Marie `local_74849403-0af7-46d3-bb65-1d34fb8013d9` · Atlas `local_fa926441-1ff6-4b90-a1a2-6fab5323f313`
