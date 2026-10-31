# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-11-01, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative, environment facts.
>
> **The rule that makes it work — the PM's, binding on the PM:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the `operator` seat — the workspace owner, โด่ง (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-11-01)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.
>
> **Where the owner's words came from:** he said them to Atlas on 2026-11-01; Atlas wrote them
> into `MARIE.md` → ORDER 48, and Marie copied them here.

---

## What the product is (owner, 2026-11-01)

- `[operator 2026-11-01]` *"อยากเปิดโต๊ะใหม่อ่ะทำเป็นแหล่งรวมแชตอ่ะจะส่งรีควอร์เมนต์ให้"* — a unified
  inbox: messages from several platforms in one place, with AI as a guard before they reach people.
- `[operator 2026-11-01]` The requirement he pasted is kept verbatim in
  `../project-docs/requirements-from-owner-2026-11-01.md` (Unified Inbox with AI Guard). It is the
  source for the first REQ. Its §6 line "NestJS + TypeORM" is **overridden** — see Stack below.
- `[operator 2026-11-01]` *"ขอแอปชื่อว่า corner-chat แทนแล้วกัน"* — the app is called **corner-chat**.
- `[operator 2026-11-01, to the PM]` What it is for, first: *"เกิดมา เพื่อรวม และ กรอง ตามกฏ กติกาที่เราตั้งไว้ เอไอ
  ทำการกรองช่วย แค่นั้นก่อน"* — gather messages in one place and filter them by rules the team sets, with AI helping
  the filtering; "แค่นั้นก่อน" = that is the first scope. (Whether auto-reply is inside "แค่นั้นก่อน" is asked
  separately — `../project-docs/requirement-understanding-2026-11-01.md` Q1b.)
- `[operator 2026-11-01, to the PM]` Replying to the sender (understanding doc Q1): *"แบบ ข คืออยากได้ ดูก่อนว่ายากมากมั้ย
  ถ้า ยากมากให้ เอาแบบ แรกก่อน"* — he **wants two-way** (staff reply from corner-chat and it is sent back on the
  sender's channel), **if it is not very hard**; if it is very hard, **one-way first** (corner-chat notifies,
  staff reply in the original app). How hard it is = the SA's assessment, asked 2026-11-01.
- `[operator 2026-11-01, to the PM]` Auto-reply (understanding doc Q1b — "auto-reply such as out-of-hours or keyword
  replies is not in the first round, later?"): *"ใช่ ไว้ทีหลัง"* — **auto-reply is out of the first scope; later.**

## Repos and environments

- `[operator 2026-11-01]` Two repos: `corner-chat-back` and `corner-chat-front` (absolute paths only in the
  workspace-root `machine.local.md`).
- (Marie, read-only survey 2026-11-01) Both repos are empty: one commit "Initial commit" holding only
  `README.md`; ~~branch `main` only (local and `origin/main`), no `develop`~~ (superseded the same day —
  next line); origin `github.com/develyst1/corner-chat-back` and `github.com/develyst1/corner-chat-front`.
  ⇒ **greenfield.**
- `[operator 2026-11-01, via Atlas]` **Branches:** the owner created `atom`, `develop`, `sit`, `uat` and
  `production` on both repos, all from `main`, pushed to origin. The repos are still checked out on
  `main`. (Marie re-read both repos 2026-11-01: all six branches at the initial commit, each tracking
  its `origin/` twin — back `d1152f1`, front `0f8c0bc`.)
- **The team's working branch is UNDECIDED** — a new own branch like smart-scheduler's `dong`, or
  `atom`. The PM settles it with the owner before the first `ขึ้น git` (board → Blocked / waiting).
- `[operator 2026-11-01]` **Stack — back:** *"back ไม่ใช้ nest ใช้ bun hono หรือ bun elysia เท่านั้น"* —
  **Bun + Hono or Bun + Elysia only, never NestJS**, with Postgres. Atlas recommends Hono; **the choice is
  the SA's, in SPEC-001.**
- `[operator 2026-11-01]` **Stack — front:** Dashboard + Web Chat; its stack is decided in SPEC-001.
- `[operator 2026-11-01]` **AI:** through the owner's LLM gateway (the `llm-gateway` skill), as the
  requirement says ("ใช้ LLM Gateway ที่มีอยู่แล้วของทีม").
- `[operator 2026-11-01]` **Real systems:** *"ใช่ แต่ก็แตะของจริงได้บ้าง หากจำเป็น"* — **reading** a real
  system is allowed when needed. **Sending or changing anything real** (a LINE message, an email to a
  real person, a real Discord post, the real Zimbra mailbox on the owner's mail host) **needs the
  owner's go each time**, by DATA REQUEST through the PM. Build and test against test accounts by default.
- `[operator 2026-11-01]` **Secrets:** LINE, Discord and gateway tokens and the Zimbra password live only
  in each repo's `.env`, never in git.

## Team (owner, 2026-11-01)

- `[operator 2026-11-01]` *"น่าจะต้องมีทีม engineer สองทีม เทสเตอร์สองคน"* — two engineer teams, two
  testers. Who is who: `TEAMS.md`.
- `[operator 2026-11-01]` *"ทำไมจะทำrepo ด้วยกันไม่ได้ smart scheduler ยังทำได้เลย TESTER tefany"* —
  **both teams share both repos**, as smart-scheduler does, split by file area through the PM's batch
  claims (`board.md` → `## Batch claims`). Team B's tester is Tefany.
- `[operator 2026-11-01]` Mode: **manual** — one session per role (`DECISIONS.md`).

## Open questions for the owner — asked by the PM, answered here

- ~~**Branches (open, the owner's):** the repos have only `main` and no `develop`, while the git commands
  (`CLAUDE.md` §6 — `รวมโค้ด`, `release code`) assume `develop` plus `merge-workflow.sh`. Branch
  creation is the owner's; no role creates a branch.~~ **Answered 2026-11-01:** the owner created
  `develop` (and `atom`, `sit`, `uat`, `production`) — see Repos above. Still open: **which branch the
  team works on** (the PM asks the owner before the first `ขึ้น git`). No role creates a branch.
