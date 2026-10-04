# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-10-04, on the day this desk opened, by Marie (workspace operations) —
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
> **The rule that makes it work — Porter's, binding on himself:**
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
> means the owner, develyst — the only person who has ever talked to this team** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-10-04)** was read out of the repos on the day the desk opened and is evidence of
> what is *there* — not of any decision.

---

## What the product is (owner, 2026-10-04)

- **A local control plane for THIS workspace** — a console that shows, for every project
  in it, the agent chain, who holds the ball, and whether the rules are being kept.
- 🔴 **THE ONE ARCHITECTURAL RULE, and everything else bends to it: the files stay the
  truth; the console is a LENS.** It reads the same repo the agents read. Git stays the
  record. **There is NO database holding a second copy of state.** (owner / Atlas,
  `CONSOLE-PLAN.md`, 2026-10-04)
  - 🔑 *Why it is written as a hard rule and not a preference: a second store is the
    drift problem one level up, and this workspace has already paid for that lesson
    three times — board vs knowledge file, knowledge file vs archive, personal config
    vs repo.* **A proposal that introduces a second store is refused, not sized.**
- **The owner is the first user.** He is building it for himself, with his 13 live
  projects as the test bed: *"if it does not help him, it will not help a company."*
  (owner, 2026-10-04)
- **The measure of success is already set, and it is not a feature list:** if the console
  **does not change how the owner's own week feels within two weeks**, v2 and v3 are not
  worth building. (owner / Atlas, `CONSOLE-PLAN.md`, 2026-10-04)

## Scope — v1 ONLY (owner, 2026-10-04)

- 🔴 **v1 is READ + RUN. Nothing else.** The owner scoped this himself when opening the
  desk. **v2 (chain graph, stale-rule detection, the autonomy dial) and v3 (editing the
  rules from the screen) are NOT in scope and must not be started, designed in, or
  "prepared for" by building hooks nobody asked for.**
- 🔴 **v1 WRITES NOTHING. The console may not overwrite, create, or modify ANY file in
  the workspace.** (owner, 2026-10-04, stated when opening this desk.) Read-only, plus
  running the gate as a child process.
  - 🔑 *This is the safety property the whole v1 rests on: a read-only lens cannot
    corrupt the thing it is looking at. The moment it can write, every bug in it becomes
    a workspace-integrity bug.*
- **The design input is `CONSOLE-PLAN.md` at the WORKSPACE ROOT** (Atlas, 2026-10-04).
  It is the design input, **not a requirement** — the owner writes the requirement, and
  Porter turns it into REQ files. It is **not copied into this desk on purpose**: one
  copy, no drift.

## What the console reads (owner, 2026-10-04)

- It reads the workspace at the path recorded for `ai-agent-workspace` in the
  workspace-root **`machine.local.md`** — on this machine `H:\ai-agent-workplace\ai-agent-workspace`.
  🔴 **That absolute path must never be hard-coded in committed code or in any file in
  this desk.** It is read from configuration at run time; `machine.local.md` is the only
  place an absolute workspace path is allowed to live (workspace `CLAUDE.md`, "Paths &
  machines").
- **`check-hygiene.mjs` at the workspace root is the API, not a thing to re-implement.**
  The plan's key design decision: the gate already knows how to find and parse every
  coordination file, so the console **shells out to it per project and renders the
  result** instead of writing a second markdown parser in the UI.
  - ⚠️ **Its `--json` output does NOT exist yet.** The gate prints human lines today.
    `--json` is **Marie's tooling and Marie's hands** (`MARIE.md`, scope item 3) — the
    team does not add it, and does not work around its absence by parsing the printed
    text into a second schema. **If v1 needs it, Porter asks the owner to have Marie add
    it.** (Marie, 2026-10-04)
- The four pains v1 exists to remove — each one measured in this workspace, none
  speculative: **nobody runs the gate** (smart-scheduler went FAIL 12 → 19 in two days
  while the gate sat there correct and unread) · **`RESUME-HERE.md` went 9 days stale** ·
  **inboxes reached ~1 MB and a boot read 755 KB per session** · **the owner is the
  router**, poking 8 sessions to find out who is waiting. (`CONSOLE-PLAN.md`, 2026-10-04)
  - 🔑 **None of the four needs an LLM and none needs write capability** — that is the
    actual argument for why v1 is read-and-run, and it is worth keeping in front of
    anyone who proposes adding either.

## Repos and environments

- **`harness-console-front`** — the single repo for this desk, owned by **Fern (FE)**.
  Absolute path in the workspace-root `machine.local.md`; never in a committed file.
- **Greenfield, and genuinely empty** (Marie, read-only survey 2026-10-04): one commit
  `ec34c62 "Initial commit"`, branch **`main`** (the only branch; `origin/main` tracks
  it), containing **`README.md` (one line) and a Next.js-style `.gitignore` — no
  `package.json`, no source, no `node_modules`.** The app is scaffolded from nothing.
- **Branch: `main`.** It is the only branch that exists. (Marie, read-only survey
  2026-10-04 — if the owner wants a different working branch he says so and it is
  recorded here.)
- **Stack: Next.js 16 + React 19 + Ant Design v6 — the house pattern** (owner,
  2026-10-04). **One Next.js app, App Router, reading the filesystem server-side. No
  separate backend service** — for a local single-user tool a second service is pure
  cost. (`CONSOLE-PLAN.md`)
- **Environments: LOCAL ONLY.** There is no dev server, no staging and no production for
  this product; it runs on the owner's machine against his own workspace. **Nothing here
  is deployed, and no role touches a real environment.** (owner, 2026-10-04)

## Team (owner, 2026-10-04)

- **Porter (PM/BA)** · **Sober (SA Lead)** · **Fern (FE)**. **No BE role and no QA role
  on this desk** — there is no backend, and the owner did not open a Tester seat.
- **Mode: dispatcher** (`DISPATCHER.md` spawns the roles; same files either way).
- ⚠️ **No QA means nothing here is verified by an independent role.** The engineer's own
  command output plus the owner's eyes are the verification, and `DELIVERED` is the
  owner's word — **not Fern's, and not Sober's review.** (See PROTOCOL.md "Evidence".)

## Open questions for the owner — asked by Porter, answered here

*(none yet)*

## The first requirement (owner, 2026-10-05) — detail in `requirements/REQ-001-v1-two-screens.md`

- **v1 is exactly two screens** — *"ทำ v1 ตาม CONSOLE-PLAN.md — แค่ 2 จอ"*: ① an overview with one card per project (PASS/FAIL + the worst 3 lines + last-moved date); ② a project page (gate detail + file-health table + who holds the ball). (owner, 2026-10-05)
- **The console's data comes ONLY from `check-hygiene.mjs --json` — no parser of its own** — *"อ่านข้อมูลจาก check-hygiene.mjs --json เท่านั้น ห้ามเขียน parser เอง"*. This answers the desk-open question "`--json` before Fern starts, or spec against the printed text?": **`--json` it is.** (owner, 2026-10-05)
- **Refresh every 60 seconds; v1 is read-only and writes nothing in the workspace** — *"refresh ทุก 60 วิ · v1 อ่านอย่างเดียว ห้ามเขียนอะไรใน workspace"* (restates the 2026-10-04 rule). (owner, 2026-10-05)
- **Gate behaviour today: `node check-hygiene.mjs <project> --json` does NOT fail — it ignores the flag and prints the same human `RESULT:` line, exit 0.** So "it ran without error" proves nothing about JSON. (Porter checked 2026-10-05: command output; `grep -n json check-hygiene.mjs` → no hits.)

## Owner's answers to Porter's first questions (owner, 2026-10-05) — verbatim: *"Q1=ได้, Q2=อังกฤษ, สมมติฐาน A ถูก, ไปเลย"*

- **Marie adds `check-hygiene.mjs --json`, covering what REQ-001 §C-2 lists** — Q1 *"ได้"*. The order to Marie is already written: `MARIE.md` → ORDER 16 ① ("YES, build it first, before Fern starts"; human output byte-identical). Only the owner can open Marie. Porter checked 2026-10-05 00:26: `grep -c -- --json check-hygiene.mjs` → 0; the flag is still ignored (exit 0). (owner, 2026-10-05)
- **Console UI wording is English** — Q2 *"อังกฤษ"*. The wording table in REQ-001 is approved; gate lines are shown verbatim, never translated. (owner, 2026-10-05)
- **Assumption A is correct: CONSOLE-PLAN v1 items the owner did not name are OUT of REQ-001** — mode on the card, `FAILURES.md` NEW entries, click-to-open-file, the call-Marie button. (owner, 2026-10-05)

## Owner's answers to Sober's questions (owner, 2026-10-05) — verbatim: *"Q-3=ข, สมมติฐาน A ถูก, ไปเลย"*

- **The AC-7 message names the setting, not `machine.local.md`** — Q-3 *"ข"* (options were ก = keep `Workspace path not found — check machine.local.md` / ข = name the `HARNESS_WORKSPACE_PATH` setting). Exact replacement text is Porter's (UX writer), recorded in REQ-001 wording table. (owner, 2026-10-05)
- **A workspace path that exists but has no `check-hygiene.mjs` shows the same AC-7 message** — Sober's assumption A, *"สมมติฐาน A ถูก"*. (owner, 2026-10-05)
- Not answered in this round: Q-4 (text after `Gate error — ` on timeout / non-JSON). Q-5 is for the owner to hand Marie with ORDER 16 ①; as of 2026-10-05 00:37 `--json` is still not built (`grep -c -- --json check-hygiene.mjs` → 0). (Porter checked)

## Owner's answers to Q-4 and the AC-7 text (owner, 2026-10-05) — verbatim: *"Q-4 ได้, AC-7 ได้, ไปเลย"*

- **Gate error texts approved as Porter proposed** — Q-4 *"ได้"*: on a gate timeout (15 s) the card shows `Gate error — no answer after 15 s`; on output that is not JSON it shows `Gate error — output was not JSON`. (owner, 2026-10-05)
- **AC-7 text approved** — *"AC-7 ได้"*: `Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local`. (owner, 2026-10-05)
- As of 2026-10-05 00:40 `--json` is still not built (`grep -c -- --json check-hygiene.mjs` → 0; the gate prints the plain `RESULT:` line). (Porter checked)

## Owner's answers to Q-6, Q-7 and assumption B (owner, 2026-10-05) — verbatim: *"ตามนั้น"*, accepting the line *"Q-6=ใช่ ถ้าไม่มี log ให้ขึ้น '—', Q-7=ก, Q-8 ให้ Porter เสนอ, สมมติฐาน B ถูก, ไปเลย"*

- **"Last moved" = the gate's `newestLogDate`** (the date of the project's newest dated log file) — Q-6 *"ใช่"*. **When the gate gives none (no log), the card shows `—`** — *"ถ้าไม่มี log ให้ขึ้น '—'"*. (owner, 2026-10-05)
- **The file-health table shows name · size · limit only — no per-file verdict**; the PASS/WARN/FAIL judgements stay in the `Gate` section as the gate's lines — Q-7 *"ก"*. Nothing is asked of Marie for this. (owner, 2026-10-05)
- **"Who holds the ball" = every board row the gate returns (`id` · `title` · `status` · `ball`), verbatim, in board order** — Sober's assumption B, *"สมมติฐาน B ถูก"*. (owner, 2026-10-05)
- **Q-8 wording: the owner asked Porter to propose it** — *"Q-8 ให้ Porter เสนอ"*. The proposal is `[team-proposed]` in REQ-001 §Q-8 and is NOT approved until he says so. (owner, 2026-10-05)
