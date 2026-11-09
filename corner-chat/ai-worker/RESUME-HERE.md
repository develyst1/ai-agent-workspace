# RESUME HERE — where this project is right now

> 🔴 **THIS FILE IS REPLACED, NEVER APPENDED TO.** It is a snapshot, not a log. One page, ~4–6 KB.
> History → `log/`, decisions → `SYSTEM-FACTS.md` / `DECISIONS.md`, state → `board.md`.
> The PM rewrites it before ending any session; the PM and the SA Lead read it first.
> On opening, the PM checks it against `board.md` and today's log and reports any disagreement to the owner.
> Provenance on every line: `[owner-approved YYYY-MM-DD]` · `[team-proposed]` · `[customer-asked]` · `[carried-over]`.

**Written:** 2026-11-03 ~00:10 by the PM · **Newest log at the time:** `log/2026-11-02.md`

## Headline

- **Round 1 is DELIVERED and pushed.** REQ-001…005 are on branch `D1`: back `519ebf5`, front `2a90393`, app `21eb731`. [owner-approved 2026-11-02, "ขึ้น git"]
- **Otto deployed it to SIT** on 2026-11-02 at 23:13. [owner-approved 2026-11-02]
  - API: `cornerchat-api-sit.develyst.online`
  - Admin web: `cornerchat-sit.develyst.online`, behind Cloudflare Access
- **TEST-006 (SIT release pass) is TEST_PASSED for what was run.**
  - Passed: rows 1–8 and row 11 (the admin web, through the QA token).
  - DEF-1 (WebView debugging) is fixed in code by TASK-042 and the static check passes; checking it on a device needs a real phone.
  - Still NOT_TESTED: row 9 LINE, row 10 mail, and the AI filter called by a real message.

## How the desk works — read first

- **Don't ask the owner; decide, then list it** in `../project-docs/decisions-for-owner-review.md` §A (D1–D47). [owner-approved 2026-11-01]
- **Only the PM asks the owner anything.** No other seat puts a question or a button to him (CLAUDE.md rule 2, F-035). [owner-approved 2026-11-02]
- **Deploys are Otto's.** The desk builds and QA tests. The root files are `REQUEST-porter-to-otto-2026-11-02-corner-chat-deploy.md` and Otto's `…-deploy-plan.md`. [owner-approved 2026-11-02]
- **SIT shares the `corner_chat` DB with local** (owner: *"ใช้ร่วมกัน"*). [owner-approved 2026-11-02]
  - Local backs run with `MAIL_POLL_SECONDS=0`.
  - SIT test users are prefixed `qa-sit-`.
  - SIT is a listed environment in `PROTOCOL.md` → Environments. [PM-decided 2026-11-02]
- **No local Postgres, ever.** Env values come from the owner, and `.env.example` must be complete. The DB has no SSL; the owner accepts that for now. [owner-approved]
- **Git runs only on his command, relayed to the SA.** [owner-approved]
  - The commit convention is `<type>: <summary> (TASK-…)`.
  - Uncommitted now: TASK-041 part A (3 app files) and TASK-042. Both go up with his next `ขึ้น git`.
- **The app signing key** is in the folder named in `machine.local.md` (D47). The owner backs it up off this PC. [owner-approved 2026-11-02, "เครื่องนี้ + สำรอง"]
- **The latest release APK is `3edb05dc…7552`.**
- **Back tests run locally only**; CI runs no tests. [owner-approved 2026-11-02]

## Still open

| Thread | Waiting on | Note |
|---|---|---|
| LINE webhook → the SIT URL (unblocks row 9) | owner | `https://cornerchat-api-sit.develyst.online/api/v1/webhooks/line`; Tefany's `qa-sit-b1` user stays active for it |
| Gmail forward connected + mail poller on (unblocks row 10) | owner / Otto | SIT mail is incoming only; no code change |
| Back up the signing-key folder | owner | D47 |
| 13 unreviewed FAILURES (gate FAIL) | Atlas, via the owner | the owner was told |
| A real user-build phone (DEF-1 on device, vendor battery managers) | owner (optional) | only the emulator so far |
| LINE token reissue (F-021), B7 | owner (optional) | — |

## What we already tried that did NOT work

- Long or technical questions to the owner (F-001/F-002), env names missing from `.env.example` (F-019), and SA-to-SA relays (F-016). [carried-over]
- Ringing before the inbox line is on disk. A hook blocks chained drains and inbox writes, so write alone, verify, then ring. Rings cap at 10 until the owner types. [team-proposed]

## Session ids

| Role | Session id |
|---|---|
| Sober | `local_141a8abd-de14-479a-bb79-6802b154284d` |
| Silver | `local_2ffd5074-771c-41c5-b42d-cce8eb59ad23` |
| Tanya | `local_bc02b21f-42cd-4e52-aef6-a921efd6ef1d` |
| Tefany | `local_5907b956-b59f-4b33-8e20-a0f17f636f2a` |
| Marie | `local_74849403-0af7-46d3-bb65-1d34fb8013d9` |
| Atlas | `local_fa926441-1ff6-4b90-a1a2-6fab5323f313` |
| Otto | `local_fc8756ee-d808-48a0-b8a3-a263c295cacf` |
