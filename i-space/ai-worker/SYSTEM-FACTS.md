# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-10-29, on the day this desk opened, by Marie (workspace operations) —
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
> means the `operator` seat — โด่ง (harness `CLAUDE.md` §2)**; on this desk his words mostly
> arrive relayed by Atom · **⚠️ CONTESTED** means two sources disagree, both are recorded,
> and **neither may be acted on** until the owner settles it · a line marked
> **`[team-proposed, Atlas read 2026-10-29]`** was read out of the repos by Atlas before the
> desk opened and is evidence of what is *there* — not of any decision.

---

## What the product is (owner, 2026-10-29)

- **I-Space = Intelligent Space** — one big project made of two products, Blueprint and CAW.
  (owner via Atom 00:16: *"…สองโปรเจกต์นี้มันคือโปรเจกต์ใหญ่เดียวกัน เราจะเรียกโปรเจกต์นี้ว่า I space
  ย่อมาจาก Intelligent Space"*)
- It is the owner's own product. No customer seat (`SEATS.md`), so no `customer-validated` stamp
  ever. (ORDER 39 GO, 00:24)
- ~~**Blueprint** is a spec-authoring service: an AI interview turns sources into a confirmed spec
  version. **CAW** is the AI-workforce runner: it executes work from Blueprint's confirmed
  versions with Claude CLI workers. (owner's GO 00:24 on Atlas's description, ORDER 39)~~
  **CORRECTED 2026-10-29 10:51 by the owner** (relayed by Atom in English; the owner's own Thai
  words not seen by the PM) — see § "Owner's corrections, 2026-10-29 10:51" below. Versions are
  hand-applied labels, not separate snapshots, and CAW always reads the latest spec.
- **CAW runs on a Claude subscription:** in production it opens Claude CLI on the deploy server
  and takes orders the way Atom does — *"CAW คือเสมือน Atom"*. (owner via Atom 00:19: *"CAW จะใช้
  Claude แบบ Subscription เปิด Claude CLI ที่เซิร์ฟเวอร์ฝั่งที่ deploy แล้วสั่งงานเหมือนสั่ง Atom เลย
  CAW คือเสมือน Atom"*) ⇒ no per-call API money; a live run spends the subscription's quota, so
  every local live run is a question to the owner through the PM first. Tests use mocks/fixtures.
- **The code was built earlier by another AI desk.** Its SPEC/REQ/DECISIONS are to be moved here
  verbatim, keeping their IDs (owner via Atom 00:19: *"ให้ย้ายสเปคกับการตัดสินใจของทีมเก่าตามนั้นมาเลย"*).
  Not here yet — `legacy/README.md`.
- First work: understand all the code (owner via Atom 00:00: *"…ทำความเข้าใจโค้ดทั้งหมด…"*) —
  REQ-101; at open the PM hands it to both SAs (00:24: *"ตอนเปิดก็สั่งพีเอ็ม ให้เขาไปสั่งเอสเอทำก็ได้"*).

## Repos and environments

- Four repos, cloned from the owner's GitHub (`develyst1`) — logical names only, paths in
  `machine.local.md`. **Working branch `atom` in all four** (owner, Atom's note 2026-10-29); on
  2026-10-29 `develop` = `production` = `atom` in each, trees clean. HEADs on 2026-10-29
  (Marie, read-only): `blueprint-back` f60b934 · `blueprint-front` e46322a · `caw-back` 102a130 ·
  `caw-front` 4b58bf3 — each tip is "chore: add merge and release workflows", so each repo has
  `merge-workflow.sh` and `release-workflow.sh`.
- Each `atom` = the old latest code (`nichaphon` for blueprint, `main` for caw) plus that one
  workflow commit. `[team-proposed, Atlas read 2026-10-29]`
- Owner exception (via Atom 00:19): I-Space may have 4 active repos — *"เปิดพิเศษให้ใช้สี่ repo ได้"*
  (`codebases/RULES.md`, `ACTIVE.md`).
- **Git:** `CLAUDE.md` §6 — *"คอมมิตแอนด์ซิงค์ตามเดิม"* (owner via Atom 00:24). The old team's
  *"ไม่ต้องยุ่งกับ git เด็ดขาด"* (found in one plan file) does not apply to this desk.
- **Stack** — the same in all four: Bun, TypeScript; backs Hono + zod-openapi + Drizzle (pglite
  in tests); fronts Next 16 / React 19 (Playwright configs present).
  `[team-proposed, Atlas read 2026-10-29]`
- **Ports:** blueprint-back API :4200 · blueprint-front :3100 · caw-back API :4500 (plus MCP
  server and runner) · caw-front :3500. `[team-proposed, Atlas read 2026-10-29]` (Marie
  confirmed the defaults in `src/index.ts` / `package.json` 2026-10-29.)
- **Sizes** (lines of .ts/.tsx, src / tests): blueprint-back 4.1k / 4.4k · blueprint-front
  17.8k / 0.9k · caw-back 9.3k / 5.2k · caw-front 13.4k / 2.6k.
  `[team-proposed, Atlas read 2026-10-29]`
- **The seams** `[team-proposed, Atlas read 2026-10-29]`:
  - Read API: `caw-back/src/blueprint/client.ts` (88 lines) → `blueprint-back/src/seam/*`
    (about 290 lines). Calls: getProject / getVersion / partContext / versionsAfter / locate /
    amend. `BLUEPRINT_URL` defaults to `http://127.0.0.1:4200`. Blueprint owns the contract.
  - Front link: blueprint-front's ready screen button "ส่งไปสร้างที่ CAW" opens caw-front
    `/start` (`CAW_URL`, default :3500), with version confirmation.
- **Old spec-ID series cited in the code** `[team-proposed, Atlas read 2026-10-29]`: SPEC-A
  spans all four repos (backs and seam); SPEC-B covers both fronts (themes, overlays); SPEC-C
  covers blueprint-front screens and the caw-back runner settings. Full ranges, counted on
  `atom` by Marie 2026-10-29: `legacy/README.md`.
- **Environments:** this machine only, for local runs. No dev server recorded. Production /
  deploy server (where CAW runs Claude CLI) is the owner's alone. (ORDER 39 GO)

## Team (owner, 2026-10-29)

- One desk, two SA teams split by product: Team A = Blueprint, Team B = CAW; the PM (+BA) and
  the QA serve both. Names and inboxes: `TEAMS.md`. Short code ISP, sessions `<Name>-ISP`.
  (00:16 *"ใช่"* to one desk; 00:24 *"ใช้ชื่ออะไรก็แล้วแต่ เอาที่มันโอเค"*)
- Mode manual, one interactive CLI session per role in tmux, opened by Atom; never `claude -p`.
  Models: PM/SA/QA opus medium, engineers sonnet medium. Owner duties: design-approve, deploy.
  (ORDER 39 GO)

## Open questions for the owner — asked by the PM, answered here

- ~~Did *"ลบบัดดี้สกรีนออกไปเลย"* (00:19) mean more than dropping buddy-screen from
  `codebases/ACTIVE.md`? Its clones and its desk folder are kept, parked. (Atlas, to confirm)~~
  **CLOSED 2026-10-29:** no — it means only removing it from the active codebases list; its
  folders and repos are kept, like smart-scheduler. (Atom, owner-delegated, 00:40 →
  `DECISIONS.md` 2026-10-29 00:40)
- ~~Commit-message convention per repo, before the first ขึ้น git (`git-command` skill).~~
  **CLOSED 2026-10-29:** all four repos use `<type>: <summary> (REQ, TASK)`, author
  `develyst <develyst1@hotmail.com>` — written in `CONVENTIONS.md` § Git, where the
  `git-command` skill looks. The first ขึ้น git still needs the owner's own words (`ATOM.md`
  "Ruled by the owner" §1). (Atom, owner-delegated, 00:40 → `DECISIONS.md` 2026-10-29 00:40)
- **Old team's memory (Atom 00:40):** only md docs arrived (`legacy/intelligence-space/`); the
  old REQ/SPEC/TASK/D/STUDY texts exist only as citations in the code — `legacy/README.md`
  "What arrived / the gap". (`DECISIONS.md` 2026-10-29 00:40)
- ~~REQ-101 Q1 — is the code map for the team, or also an overview for the owner?~~
  **CLOSED 2026-10-29:** the map is for the team; **and** when REQ-101 is done, a short Thai
  overview of the whole system is written for the owner to read. (Atom, owner-delegated, 00:43
  → `DECISIONS.md` 2026-10-29 00:43)
- The BUD (buddy-screen) sessions are closed by Atom. (Atom 00:43)

## Owner's corrections, 2026-10-29 10:51 (relayed by Atom in English — owner's own Thai words not seen by the PM; stamp `operator`)

These are the owner's **intent**. Where today's code differs, that is a gap for REQ-102, not a fact about the code.

- **Blueprint is the store of spec and requirements.** The PM edits and adds there. No arbitrary
  version splitting: the SA/PM using the site puts version labels on by hand. **Every edit or
  addition must keep an audit log.** (owner via Atom 10:51, point a)
- **CAW must always see the LATEST spec immediately**, not separate versions; a version label is
  only a tag for work. (owner via Atom 10:51, point b)
- **CAW = Cloud Agent Workspace.** The main AI work opens a CLI per user, per the team that was set
  up, and works the way Atom does (CLI opened on the server). **The LLM gateway is only for small
  parts and decision AI.** (owner via Atom 10:51, point c)
- **The LLM gateway (`ai.develyst.online`) is treated like a third-party API, just with no auth.**
  Live defaults in the code are correct as they are. (owner via Atom 10:51, overview risk 2)
- **Overview risks 1 (no auth in blueprint-back), 3 (core-flow tests) and 4 (CAW maps a Blueprint
  refusal to "unreachable"): later.** The owner is the only tester now; risk 4 is not the main
  issue. (owner via Atom 10:51)
- **CAW shows each agent its own CLI screen** — a live terminal view per worker, so users can watch
  the work going on behind the scenes if they want. (owner via Atom 10:53, point d — added to the
  10:51 decisions, same stamp)
- **Owner accepted all 10 PM defaults in `project-docs/gap-102-th.md`** (via Atom 11:41: *"ใช้ตามที่ Porter แนะนำทุกข้อ ไปเลย"*): requirement = a spec part kind the PM edits by hand · version label any time, warnings only, CAW button always on · audit "who" = typed name, real login later · CAW sees every saved edit, a running hop keeps its starting spec · one long-lived CLI session per worker on the server · "per user" = per AI worker for now · the whole team works in parallel · no gateway "decision AI" in CAW for now · live CLI view read-only first · Blueprint interview/quiz stay on the gateway. Full scope: `DECISIONS.md` 2026-10-29 11:41.
## Environment: real `.env` files and a remote TEST database (owner via Atom, 2026-10-29 12:54)

- `blueprint-back/.env` and `caw-back/.env` exist (gitignored — PM checked `git check-ignore`; mode 600). Keys, PM-checked by name only: blueprint-back `DATABASE_URL PORT` · caw-back `DATABASE_URL PORT BLUEPRINT_URL CAW_POLL_MS CAW_WORKSPACE_ROOT BLUEPRINT_WEB_URL CAW_API_URL RUNNER_POLL_MS RUNNER_HOP_MAX_MS CLAUDE_BIN`. (owner via Atom 12:54; PM checked 12:5x)
- **Both `DATABASE_URL`s point to a remote PostgreSQL that the owner says is a TEST DB: the team may write and delete data and run migrations there.** **Never print, log or commit the `DATABASE_URL`.** (owner via Atom 12:54)
- `CAW_WORKSPACE_ROOT=/workspace/caw-workspaces` (was a Mac path). (owner via Atom 12:54; PM checked)
- 🔴 **Consequence the PM found (checked 12:5x):** `CLAUDE_BIN=` is **blank**, so the runner falls back to the real `~/.local/bin/claude` (`maps/caw.md`, `runner/config.ts:40`), and Bun loads `.env` by itself (`caw-back → src/index.ts:17`). With `CAW_WORKSPACE_ROOT` now set, a plain `bun run dev` / `bun run runner` in caw-back **starts real Claude CLI hops = a live run**. Every runner start must set `CLAUDE_BIN` to a stub unless the owner said yes to that live run. Likewise any `bun run dev` / `bun test` in either back now reads the remote `DATABASE_URL` unless overridden (e.g. `DATABASE_URL=pglite:memory`).
- ~~Live Claude CLI / gateway runs still need the owner's word via Atom, each time. (owner via Atom 12:54)~~
  **CHANGED 2026-10-29 13:01 for Claude CLI only** (owner via Atom: *"รันclaude จริงสิ ได้เลย ไปทดสอบ"*): live Claude CLI runs for testing are allowed without asking each time — purposeful, each one logged, report if session quota passes ~60%. **The LLM gateway still needs the owner's word via Atom each time.** (`DECISIONS.md` 13:01)
- `PROTOCOL.md` § Environments still says "no dev server recorded". Adding a "remote TEST DB" row there is Marie's edit (owner asks her).

- Next step the owner asked for: both SAs compare a/b/c (and d, 10:53) with the current code and report the gaps
  in short form; **no code changes yet** → REQ-102. (owner via Atom 10:51)

## Machine and repo facts from the FAILURES review (written by Marie, ORDER 42; owner via Atom 2026-10-29 14:20)

- **blueprint-back accepts only `DATABASE_URL=pglite:memory`** for a local in-memory DB; any other value,
  `pglite:file:<dir>` included, is read as a Postgres URL (→ `500 ECONNREFUSED` locally). caw-back's
  `pglite:file:<dir>` form does not carry over. (`blueprint-back → src/db/client.ts:12-20`; Marie re-read
  it 2026-10-29 14:2x) `[Atlas review 2026-10-29, F-010]`
- **caw-front: a `NEXT_DIST_DIR` name Next.js has not seen is added to the tracked `tsconfig.json`
  `include`.** Use the map's `.next-f` (already listed, `caw-front → tsconfig.json:41-42`), or another name
  `maps/caw.md` lists. `[Atlas review 2026-10-29, F-003]`
- **This box has no `lsof`; use `ss -ltn`** to see listening ports (Marie checked 2026-10-29 14:2x:
  `which lsof` → nothing, `ss` → `/usr/bin/ss`). `[Atlas review 2026-10-29, F-002]`

## Machine reboot, 2026-10-29 18:24 (owner's message in the PM pane; PM checked 18:3x)

- **A reboot of this box dropped `node_modules`** (and, per SA A, blueprint-front's generated `src/core/model/build/`); git HEADs and committed code were unchanged. PM checked 18:3x: none in blueprint-back, blueprint-front, caw-front; caw-back had one (restored or kept — not checked). After a reboot, each team reinstalls before any test run. `[PM-checked 2026-10-29; SA A reported]`

## LLM gateway model choice (owner via Atom, 2026-10-30 09:49)

- **The gateway model must be chosen per task, not one model for everything:** easy tasks (just decide, just answer) use a cheaper model to save money; the system may switch between models — e.g. deepseek or xai for easy work. (owner via Atom 09:49: *"ทำให้มัน dynamicนะ แล้วแต่เรื่องหรือสถานการณ์ เพราะ งานง่ายๆ โง่ๆ แค่ตัดสินใจ หรือ แค่ตอบ อยากให้ช่วยประหยัดลงหน่อย สลับไปมาแล้วแต่โมเดลได้ งานง่ายก็deepseek ตัวนี้ก็ได้หรือ ตัวนั้นก็ได้ หรือ xai บ้างก็ได้"*) → REQ-115.
- Today (Atom's note 09:49, not PM-checked): every gateway call uses the project's one model (default `tier:medium`; the gateway picked `deepseek/deepseek-flash` in TEST-106). Only Blueprint calls the gateway; CAW does not (`DECISIONS.md` 2026-10-29 11:41 item 8).

## The desk's definition of "100% done" (owner via Atom, 2026-10-30 16:13)

- **"100%" = the owner deploys I-Space to a SIT server, creates a real project through I-Space, full loop, and the team finishes the work the way he would himself.** (owner via Atom 16:13: *"โอเค เดี๋ยวจบ100% เดี๋ยวจะไปลง SIT server ให้ทำการทดสอบจริง สร้าง project ผ่าน ระบบ ispace นี้ full loop ดู ถ้าใช้ได้ 100% และ จบงานได้เหมือนฉันทำเอง 100% นั่นแหละ 100%"*) Atom's note: this is the desk's goal/DoD; deploy (REQ-109's deploy step) still waits for the owner's word.
- **The SIT server is not recorded yet** — no host, no access, nothing an agent may touch until it is written here and in `PROTOCOL.md` § Environments (Marie's edit). Deploy to it is the owner's alone. (`PROTOCOL.md` Environments; PM 16:1x)
- Plan to reach it: `../project-docs/plan-sit-th.md` `[PM-decided 2026-10-30]`.
- **The SIT test loop:** test the real web on SIT → if something is stuck, fix it at once **locally** → commit + sync → deploy. (owner via Atom 16:14: *"จะเป็นโฟลแบบว่า ทดสอบ เว็บจริงที่sit แล้วถ้าติด แล้วแก้ทันที ที่localแล้ว commit syncไป deploy"*) Atom's note: each git command and each deploy still needs the owner's word (via Atom), until he says otherwise. ⇒ fixes are always made and proven locally, never on SIT; SIT findings come to the desk as the owner's (or Atom's) report, like a DATA REQUEST answer.
- **Clarified 16:17:** the loop = use I-Space on SIT → stuck → fix at once → git → deploy → retest. **How deploy works today: the owner clones the code himself, builds, carries it to the server and runs `pm2 restart` himself.** The deploy process is **not designed yet**; he may want CI/CD or some auto-deploy — **open topic "Deploy design (CI/CD / auto deploy)", to discuss with him after this round's work is done.** Until then deploy stays the owner's own job. (owner via Atom 16:17: *"…ขั้นตอนdeploy ยังไม่ได้design เลย ไว้ ทำงานนี่จบก่อนค่อยมาคุยก็ได้ ปกติฉัน เป็นคน cloneโค้ดมาเอง แล้วbuild แล้วหิ้วไปขึ้นserverเอง แล้ว pm2 restart เองเลย เราอาจจะใช้ระบบแบบว่า ci cdหรืออะไรที่มันauto deployอะไรเทือกนั้น"*)

## Deployment side is off-limits (owner via Atom, 2026-10-30 23:31)

- **"เรื่องฝั่ง deployment ไม่ต้องแตะอะไรเลย"** — the team does not touch anything on the deployment side: no pm2, no deploy READMEs, no `.env` / Linux setup work, pm2 never run. REQ-123 stopped (both sides); its commits stay; its uncommitted work is kept, not committed. Waiting for the owner's ruling. (owner via Atom 23:31; `DECISIONS.md` 2026-10-30 23:3x)
- **"ให้ทำงานโปรเจคนี้ให้จบ แค่นั้น"** — the desk's job is to finish I-Space itself: Blueprint + CAW features and bugs until a project can be built through I-Space, full loop. Deployment / server / pm2 are not touched at all. (owner via Atom 23:32) ⇒ the SIT part of "100%" (16:13) stays the owner's; the team's finish line is the full loop working locally.
