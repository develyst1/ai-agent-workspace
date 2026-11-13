# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-11-08, on the day this desk opened, by Marie (workspace operations) —
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
> means the `operator` seat — โด่ง (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-11-08)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## What the product is (owner via Atom, 2026-11-07)

- The requirement, 12:16, verbatim: `../project-docs/requirements-from-owner-2026-11-07.md`. The later quotes, the repo URLs and Atom's summary (labelled as his summary, not the owner's words): `../project-docs/owner-facts-via-atom-2026-11-07.md`. [operator 2026-11-07]
- **What it is:** the owner alone creates projects and tasks. Family and team members, who are real people, view progress and blockers and comment, like Trello or Jira. AI comes through the owner's gateway (the `llm-gateway` skill). [operator 2026-11-07]
- **AI's two jobs** (Atom's summary of the owner, not his words): break projects into tasks, and summarise progress and blockers. Whether the AI writes directly or proposes for his approval is **not agreed** (open question below). [operator 2026-11-07, via Atom's summary]
- **Data:** invited people's names and comments are personal data, so tests use synthetic people only. [operator 2026-11-07, MARIE.md ORDER 57]

## Repos and environments

- `god-plan-back`, `god-plan-front` (GitHub, `develyst1`): only `main` on 2026-11-07 (Atom, ls-remote). **Not cloned yet**; Atom clones on branch `atom`. (Marie 2026-11-08: no repo on disk to survey)
- **UNDECIDED — the owner's, asked by the PM; never filled in by the desk** (owner via Atom 2026-11-08 00:27: *"ยังไม่กำหนด Postgres หรือวิธีรัน dev server แทนฉัน"*): the back/front stack, the database (Postgres or not, which server) and how the dev server is run are **UNDECIDED — the owner's**. Do **not** copy call-scribe's or corner-chat's choices in as facts. The workspace rule still holds: **never install or start a local Postgres** (`CLAUDE.md` rule 4). Env values come only from the owner. [operator 2026-11-07]
- **Git:** use branch `atom` once it exists; Atom creates branches (owner ruling, 2026-11-06 13:36), the team never does. Commit format `<type>: <summary> (REQ, TASK)`, author `develyst <develyst1@hotmail.com>`. Git runs only on the owner's three commands, relayed by the PM, typed by the SA. [operator 2026-11-07]
- **Environments:** local only today. No database, dev server or production chosen yet. [operator 2026-11-07]

## Team (owner via Atom, 2026-11-08 00:27)

- *"อนุมัติ God Plan ทีมเดียว Porter PM, Sober SA, Jason BE, Fern FE, Tanya QA ให้ Marie/PM/SA/QA ใช้ opus effort medium และ BE/FE ใช้ sonnet effort medium"*. Names: `TEAMS.md`; models: `DECISIONS.md`. [operator 2026-11-08]

## Open questions for the owner — asked by the PM, answered here

For the PM to ask the owner in REQ-001. **The desk never decides these.**
- Does the AI write tasks directly, or propose them for his approval? (Not agreed; approval-first was only Atom's suggestion.)
- How do invited people sign in, and what can each see or do?
- His word on paid gateway use.
- The stack, the database (Postgres or not, which server) and how the dev server is run (owner 2026-11-08 00:27: not decided yet).

## Stack and database — Q4 answered (owner via Atom, 2026-11-08 00:39)

- Verbatim: *"ใช่ และฐานข้อมูลใช้ DB_URL แบบเดิมเลย แค่ สร้าง database ของโปรเจคนี้เอง"* — "ใช่" answers the PM's 00:36 chat ask: front Next.js, back Bun + Hono, a new database on his existing dev Postgres server. [operator 2026-11-08]
- **Database:** the same dev Postgres server and connection the owner already gave the desks (source: the `.env` of the `call-scribe-back` repo — path in `machine.local.md`; values never copied into any file, log or chat). A **separate database for this project** (proposed name `god_plan`) — never call-scribe's database. [operator 2026-11-08]
- **Authorised:** creating that one new database. **Not authorised by this answer** (Atom's relay, not the owner's words): dropping or overwriting any existing database, touching other projects' data, new DB roles or credentials, deploy, git, cloning. [operator 2026-11-08, scope as relayed by Atom]
- ⚠️ **Dev-server method:** the PM's 00:36 ask said "dev server runs on the dev machine only, nothing deployed", and the owner said "ใช่"; Atom's relay says the dev-server decision is **not** covered. Both recorded; treat as **not yet decided** until the owner confirms. [PM note 2026-11-08]
- Database creation status 2026-11-08 00:4x: **requested, not performed** — routed to the SA. [PM 2026-11-08]
- Clarifies "values never copied into any file, log or chat" above: it means no committed file, log or chat. The app reads its `DATABASE_URL` from the repo's **git-ignored** `.env` (the owner's existing URL, database name changed to this project's); `.env.example` lists every key, no values. [PM 2026-11-08, answering SPEC-001 Q-S1]

## AI write mode — Q1 answered (owner via Atom, 2026-11-08 00:43)

- Verbatim: *"ให้ AI เสนอรายการงานก่อน ฉันเลือกหรือแก้แล้วจึงบันทึก"* — AI proposes a task list first; the owner picks or edits, and only then is it saved. Nothing the AI proposes enters a project without his step. [operator 2026-11-08]

## Invited people — Q2 answered (owner via Atom, 2026-11-08 01:18)

- Verbatim: *"อนุมัติรุ่นแรก: เชิญด้วยลิงก์ที่ฉันคัดลอกไปส่งเอง ผู้รับเชิญตั้งรหัสผ่าน ไม่ใช้ Google login ดูและคอมเมนต์ได้เท่านั้น และฉันสร้างโปรเจกต์ได้คนเดียว"* — first release: the owner copies an invite link and sends it himself; the invitee sets their own password; no Google login; invitees view and comment only; only the owner creates projects. [operator 2026-11-08]
- This settles the "owner alone creates" reading (line 37 above) for the first release, now in his own words. [operator 2026-11-08]
- 2026-11-08 01:25 owner via Atom: *"นายบอก porter ตัดสินใจเองได้เลยนะ แล้ว ลิส มาบอกฉันว่า มีการตัดสิน อะไรบ้าง แล้วทีมเลือกอะไรไป โดยการ team brainstorm"* — REQ-001's remaining open points are delegated to the PM, decided after a team brainstorm and listed back to him. Scope: `DECISIONS.md` 2026-11-08 01:25. [operator 2026-11-08]

## Release-1 decisions under delegation (PM, 2026-11-08, `[operator-delegated 2026-11-08 01:25]`)

- D1–D16 decided by the PM after a team round (Porter, Sober, Tanya): `talks/BRAINSTORM-2026-11-08-req-001-open-decisions.md` §Outcome. In REQ-001. The owner may overturn any line. [operator-delegated 2026-11-08 01:25]
- Closes the ⚠️ dev-server line above: local only, `bun run dev` + `next dev`, nothing deployed (D4). [operator-delegated 2026-11-08 01:25]
- QA's access to the `god_plan` dev database: through the running app only, synthetic rows only, never direct SQL. The `PROTOCOL.md` / `QA.md` Environments tables are not yet updated (rule files — Marie's). [operator-delegated 2026-11-08 01:25]
- Live gateway calls: none until the owner says yes to a 4-call run (D11). [Atom relay 2026-11-08 01:25]
- 2026-11-08 10:16 Atom: `god-plan-back` and `god-plan-front` cloned, branch `atom` created from `main` (initial commit only) and pushed. PM checked: both on `atom` (back 277bcc9, front a41cbd0). Paths in `machine.local.md`. [Atom 2026-11-08, PM-verified]

## AC-10 comp rejected — UI base HeroUI (owner via Atom, 2026-11-08 13:17)

- Verbatim: *"ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้"* — the AC-10 comp (`specs/comps/AC-10-project-page.html`, TASK-002) is **rejected**. The front's UI is to be **based on HeroUI**, and the look made clearly better. AC-10 stays his alone: revised mobile + desktop previews go back to him. [operator 2026-11-08]
- 2026-11-08 15:53 owner via Atom: *"เลือกแบบ B บอร์ดสี่สถานะ ให้ทีมพัฒนาต่อ"* — AC-10 **accepted on layout B** (HeroUI, four status columns, no drag-and-drop; previews `specs/comps/AC-10-heroui-b-*.png`). He had been told B shows only the first column on a phone until a swipe. Layout A is dropped. [operator 2026-11-08]
- 2026-11-09 14:51 owner via Atom: *"สร้างฐานข้อมูล god_plan ได้เลย"* — explicit go for TASK-001: create the separate `god_plan` database on the existing dev Postgres server (connection from `call-scribe-back`'s `.env`, path in `machine.local.md`, values never printed). Through the chain to the BE. Only that one CREATE; nothing else on the server. [operator 2026-11-09]
- 2026-11-09 14:52 owner via Atom: *"ให้เรียก AI จริง 4 ครั้งได้"* — D11 approved: exactly **4** live gateway calls (AC-7 ×1, AC-9 ×3), synthetic data only, no more. [operator 2026-11-09]
- 2026-11-09 14:58 Atom, under the owner's 14:51 go: ran `tests/harness/create-dev-db.sh` (call-scribe-back connection) himself; output, as Atom reported it: `god_plan: created`. The `god_plan` database exists on the owner's dev Postgres server. Not re-checked by the PM (the PM runs no SQL). [Atom 2026-11-09, owner-authorised]
- 2026-11-09 14:55 D11 live run (QA): exactly 4 gateway calls via `https://ai.develyst.online/chat`, all HTTP 200, answered by provider `deepseek`, model `deepseek-flash` (the gateway's default chain), 2.0–5.0 s, 1,705 tokens total. PM checked `tests/harness/out/TEST-001/d11-live/calls.jsonl`: calls n=1..4, status 200, provider deepseek; 0 hits for seed names / `@godplan.test`. [QA 2026-11-09, PM-verified]

## Code standard (owner via Atom, 2026-11-09 14:59)

- Verbatim: *"เขียน code ให้ professional นะ scalable , reusable , clean , config , ไม่มีการ hardcode ทั้ง front + back front ก็เรียกใช้ สกิล nextjs pattern generator ก็ได้ ถ้ามีนะ เพราะฉันจำได้ว่า ลงไว้"* — both repos: professional, scalable, reusable, clean code; settings in config/env, **no hardcoding**; the front may use the `nextjs-pattern-generator` skill (and `nextjs-heroui-pattern`, installed on this box per Atom). Standing rule for all code on this desk. [operator 2026-11-09]
- Known caveat (TASK-010, SA-checked 2026-11-08): the HeroUI skill's samples are v2; the repo runs `@heroui/react` 3.1.0 — the installed v3 API wins where they differ. [SA 2026-11-08]
- 2026-11-10 16:52 owner via Atom: *"ประกาศ DELIVERED ได้เลย ย้ายเทสมือถือ/คีย์บอร์ด/screen reader ไปไว้ก่อน deploy"* — REQ-001 DELIVERED (local release 1). Real phone, keyboard and screen-reader checks move to the deploy gate. [operator 2026-11-10]
- 2026-11-13 09:39 owner via Atom: *"เค ปิดโปรเจคได้"* — **God Plan is closed.** Final code: `god-plan-back` atom `cdcc8ed`, `god-plan-front` atom `0b40634` (both on origin; PM-checked 2026-11-13). Atom deletes the local codebases after this. The only uncommitted local file of value is back `.env` (owner's DB connection — his values, not ours). [operator 2026-11-13, PM-verified]
