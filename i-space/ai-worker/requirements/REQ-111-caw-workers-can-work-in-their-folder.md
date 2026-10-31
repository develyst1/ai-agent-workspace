# REQ-111: CAW workers can actually work in their folder — a refused command never stalls the team

- Status: DELIVERED (2026-10-29 17:0x, the PM — QA TEST_PASSED 16:53; AC-4 left to REQ-108 phase 2; Q1 hole accepted by the owner, fix = REQ-113) · **COMMITTED 2026-10-29** on the owner's "ขึ้น git REQ-111 ได้เมื่อพร้อม": caw-back `80e3e88`, caw-front `f071c02` on `atom`, pushed; trees = QA's fingerprints (SA B checked), `origin/atom` verified by the PM · was TEST_PASSED (2026-10-29 16:53, QA Tanya — AC-1/2/3/5 PASS, `tests/TEST-108-caw-workers-work-in-folder.md`; AC-4 = REQ-108 phase 2; Q1 accepted as known by the owner 17:0x, fix = REQ-113; verdict covers fp `18ca4d833a46` / `686c119cd01c`) · was BLOCKED (2026-10-29 16:45, QA — Q1) · was SPEC_DONE (2026-10-29 16:3x, the SA B — TASK-118/119/120 DONE; `## AC check` below) · was IN_SPEC
- Priority: HIGH `[PM-decided]` — it is why the team could not finish the live test (TEST-106 P1-8)
- Requested: 2026-10-29 by the PM, from QA's live finding (REQ-108 phase 1). Stamp `team-proposed` (defect route). Owner intent it rests on: `DECISIONS.md` 13:41 (*"ไม่ต้องใช้หรอก sandbox จัดวาง folder แล้วทำเลย"*: workers run directly, confined to their folder), 11:41 item 5 (work like Atom).
- Team: **B (CAW)**.

## Problem / Goal

In the live test, real workers built part of the Health Board and then stopped. `bun --version` and `bun build …` are not on
the runner's Bash allow-list, so each one **ended the hop at once**. The run then ended `nothing_workable` with card #1 stuck
in "กำลังทำ", card #2 waiting on it, and the QA worker never ran. A plain `pwd && ls -la` was also refused, and the hop note
gave the wrong reason. (`tests/TEST-106-e2e-live-dashboard.md` P1-7, P1-8.) A builder that cannot run or check what it
built is not "working like Atom".

## Requirement

1. Inside its project's work folder, a worker can run the ordinary commands a developer needs to build, run and check the
   work (install, build, run, test, list, read), not only a short fixed list. What stays forbidden is the dangerous and
   irreversible: the guard hooks' list, anything outside the folder, git writes, deploy, network beyond `127.0.0.1` and the
   package registry. The exact policy is the SA's design.
2. When a command is refused, **the hop does not end**. The worker is told why, in words that name the real reason, and can
   carry on another way.
3. A run never ends with a card stuck in "กำลังทำ" with no hop running. A card whose hop ended is put in a state that the
   board and the next run understand (back to work, or stuck with a reason), so the rest of the team can go on.
4. ~~**AMENDED 2026-10-29 by the PM** (TEST-108 Q1): a worker must **not** be able to act as the operator or as a Blueprint user~~ **WITHDRAWN 2026-10-29 17:0x — owner override** (`DECISIONS.md` 17:0x): REQ-111 is delivered without this; the fix moves to **REQ-113**. Struck text kept below for history:
   through the local APIs. Its commands may not reach CAW's API or Blueprint's API ports, and may not carry an
   `X-CAW-Actor` / `X-Blueprint-By` header. `127.0.0.1` stays open for what the worker builds and runs itself (e.g. the
   dashboard's own port). A worker's legitimate CAW actions go through its MCP tools, as today. `[PM-decided]`, interpreted from
   `DECISIONS.md` 13:41 ("each worker confined to its own folder"). The owner may override this and accept the risk instead.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a worker in a project folder **When** its hop runs `bun --version`, `bun install`, `bun build …` and `pwd && ls -la` inside that folder **Then** each one runs.
  - Check: QA, stub CLI that issues those commands; runner log.
- [ ] **AC-2** — **Given** the same worker **When** it tries a forbidden command (one from the guard hooks' list, a path outside the folder, `git commit`) **Then** that one command is refused with a message naming the real reason, and the hop continues to its next step.
  - Check: QA, stub CLI; hop outcome is not "stopped by the refusal".
- [ ] **AC-3** — **Given** a hop ends for any reason (refusal, cap, crash) **When** the run finishes **Then** no card is left in "กำลังทำ" without a running hop. The board shows the card's real state, and a dependent card is not blocked forever.
  - Check: QA, card states after a forced crash and a forced cap.
- [ ] **AC-4** (live) — **Given** the REQ-108 Health Board project **When** real workers run (Claude CLI allowed, 13:01) **Then** the builder can build and run the dashboard, and the team reaches the QA worker's turn.
  - Check: QA, in REQ-108 phase 2 (live run, logged).
- ~~**AC-6**~~ **WITHDRAWN 2026-10-29 17:0x (owner override → REQ-113 AC-1/AC-2).** Original: **Given** a worker **When** its command is any of TEST-108 Q1's four `curl` calls (CAW mode/budget, accept proposal, workspace roots, Blueprint versions/change-sets) **Then** each is refused with a reason, and `curl` to a port the worker itself started still works.
  - Check: QA, real hook + stub runner.
- [ ] **AC-5** (regression) — the guard hooks still block what they blocked; a worker still cannot write outside its folder (TASK-112's confinement tests stay green); caw-back's suite passes.
  - Check: QA.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| hop note, command refused | คำสั่งนี้ทำไม่ได้: {เหตุผล} — ทำต่อด้วยวิธีอื่น | This command isn't allowed: {reason} — continuing another way |
| card after its hop ended without finishing | งานนี้หยุดกลางทาง: {เหตุผล} — รอทำต่อ | This work stopped midway: {reason} — waiting to continue |

## Constraints

- Owner 13:41: no Bash sandbox; confinement to the project folder. Claude CLI live runs allowed (log each); gateway not involved.
- **Per-topic commits** (`PROTOCOL.md` § Repo layout): TASKs here carry `Depends on: REQ-104 committed (<hash>)`.

## Out of Scope

- Per-worker sub-folders (SPEC-103 Q4: shared project folders for now). · Persistent sessions (REQ-106).

## Questions

> From the SA (Silver, Team B), 2026-10-29 15:1x. Design: `specs/SPEC-108-caw-workers-work-in-folder.md`; TASK-118/119/120 cut, ON HOLD. **None of these blocks the design**: each has a default, and the TASKs are built with it unless corrected. Checked: DECISIONS 11:41 (items 5, 7), 13:01 (live CLI), 13:41 (no sandbox, folder confinement), 12:41 (one commit per topic); SPEC-103 Q4 (shared folders) — none covers topic order, the Thai reasons, or what a card does after a hop that finished without moving it.

- **Q1 (topic order — PM)** — REQ-111 and REQ-105 (Team B) touch the same files (`cards/view.ts`, `hops/service.ts`, front `api/caw.ts`, `mock.ts`), so one must be built and committed before the other starts. **Default: REQ-111 first.** It is what stopped TEST-106 (P1-8), and it is smaller. Cases: REQ-111 first → TASK-114/115/116 change to `Depends on: REQ-111 committed (<hash>)` · REQ-105 first → TASK-118/119/120 depend on `REQ-105 committed (<hash>)` · REQ-112 (B side, below in REQ-112) goes after both either way.
- **Q2 (wording — PM, UX writer)** — the `{เหตุผล}` in your sentence "คำสั่งนี้ทำไม่ได้: {เหตุผล} — ทำต่อด้วยวิธีอื่น", one per refusal kind (SPEC-108 D2/D5). **Defaults — correct only the wrong line:**
  - outside the folders → `{path} อยู่นอกโฟลเดอร์งาน`
  - a read-only folder → `โฟลเดอร์ {path} อ่านได้อย่างเดียว`
  - a program not on the list → `{คำสั่ง} ไม่ใช่คำสั่งที่ worker ใช้ได้`
  - a shell feature → `ใช้ {อักขระ} ในคำสั่งไม่ได้`
  - git write → `worker เขียน git ไม่ได้`
  - network → `ออกเน็ตได้แค่ 127.0.0.1 กับที่ลงแพ็กเกจ`
  - code on the command line (`bun -e`) → `รันโค้ดจากบรรทัดคำสั่งไม่ได้ — เขียนเป็นไฟล์ก่อน`
  - a workspace guard hook → `กฎความปลอดภัยกันไว้`
  - a tool claude does not allow in this step → `เครื่องมือ {tool} ใช้ในก้าวนี้ไม่ได้`
  - the 10th refusal in one step stops it → note `หยุดไว้: คำสั่งถูกปฏิเสธครบ 10 ครั้งในก้าวเดียว`
- **Q3 (what the board shows — PM)** — when a hop ends and its card is still "กำลังทำ", the card goes back to "รอทำ". **Default: whatever the outcome**, including a hop that only left a comment, because AC-3 says no card stays "กำลังทำ" without a running hop. The "งานนี้หยุดกลางทาง: … — รอทำต่อ" sentence shows only when the hop failed, was stopped or was interrupted. Effect the owner will see: a card goes กำลังทำ → รอทำ → กำลังทำ between steps. Alternative: move back only on failed/stopped/interrupted; a comment-only hop then leaves the card "กำลังทำ" with nobody on it.
- **Q4 (for the QA's test design — information, no answer needed)** — a stub CLI proves our hook and that a refusal no longer ends the hop (AC-1, AC-2). It cannot prove that the real claude lets the allowed commands through: claude applies its own permission rules before our hook. That is proven by TASK-118's one live probe hop (DoD 9, haiku/low, logged) and then by REQ-108 phase 2. Also: with no sandbox (13:41) the policy judges command **words**. A program a worker writes and runs can still reach the network. That is unchanged by this REQ (SPEC-108 § Non-functional).
  > answer (PM, 2026-10-29 `[PM-decided]`): **Q1:** REQ-111 first (it unblocks REQ-108 phase 2); Team B's order = REQ-111 → REQ-105 → REQ-112. **Q2:** all ten reasons accepted as written. **Q3:** default accepted: the card goes back to "รอทำ" whatever the outcome; the "หยุดกลางทาง" sentence only for failed/stopped/interrupted. **Q4:** noted for QA. The "a program a worker writes can still reach the network" point goes on the REQ-109 deploy-ready list.
- **Q5 (OWNER, via the PM — blocks TASK-118's settings edit and its live probe; asked 2026-10-29 15:5x by the SA B)** — Bob's session refused, as dangerous, the edit that lets a worker's Claude CLI run **any** Bash command and leaves the choice to our own check (SPEC-108 D1). The refusal needs a human's yes; the team does not go around it. Checked: DECISIONS 13:41 / 14:03 (no sandbox, folder confinement) and REQ-111 Q1–Q4 — the owner's words do not name this. **The choice:**
  - **(A) recommended** — allow Bash as a whole; our check decides each command: chains like `pwd && ls -la`, build/run/test, curl to 127.0.0.1 only; git writes, other network, paths outside the folder → refused with the real reason. Plus the 3 workspace guard hooks and the denies on `nc ssh scp`. 34 + 38 tests.
  - **(B)** — Claude CLI allows only a listed set of programs (`bun`, `node`, `ls`, `cp`, … — SPEC-108 D2's table, one rule each); our check still judges paths, chains, git and network. Same commands work; an unlisted program is refused by Claude's own message, not ours (less clear reason).
  - Either way, as with the 13:41 decision: our check reads the command's **words**. A program a worker writes and then runs (`bun run x.ts`) can do anything the machine lets it.
  - **What the owner says decides; the exact words are filed here and in the TASK.** If he says it in Bob's session pane, Bob's tool sees it there too.
  > answer: **ANSWERED 2026-10-29 16:0x by the owner, typed in the PM pane, `[operator]`** — *"REQ-111 Q5: เลือก A เปิด Bash ทั้งหมด ให้ hook ตัดสิน — อนุมัติให้ Bob แก้ settings.ts ได้เลย"*. (A) chosen; the edit is approved by him. **Note:** this approval was given in the PM pane. If Bob's permission check asks again, the yes must be given in Bob-ISP's pane by a human. The team does not treat this relayed text as the tool approval. (`DECISIONS.md` 16:0x)

## AC check
(The SA B, Silver, 2026-10-29 16:3x — checked against the deliverables, not QA's verdict.)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 commands run (`bun --version`, `bun install`, `bun build`, `pwd && ls -la`) | `caw-back → src/runner/bash-policy.ts` (D2 table, chains), `settings.ts` (`"Bash"` allow, owner A); `judgeBash` → `null` for each (my probe); live: `bun --version` + `pwd && ls -la` ran in hop `01a186e9-…` (TASK-118 § Round 2) | yes |
| AC-2 forbidden command refused, real reason, hop goes on | `bash-policy.ts` codes + `caw-refused <code>:` (`read-guard.ts`); `hop.ts` soft refusals, cap 10, Thai note (TASK-118 § What to do 4); fixture-stream hop tests; my probe: git_write / network / outside / shell_feature | yes — live refusal not seen (worker declined; TASK-118 Q4) |
| AC-3 no card left in "กำลังทำ" without a hop | `caw-back → src/hops/service.ts` `patchHop` (D6), `cards/view.ts` `stoppedMidway` (D7); `caw-front` Board/CardView mark (TASK-120); TASK-119 tests incl. `interrupted`/`stopped`; live: card back in `todo` after hop `01a186e9-…` | yes |
| AC-4 live: builder builds/runs, team reaches QA's turn | enablers proven live (bun runs, chain runs, card returns to `todo`); the full team run is REQ-108 phase 2 (QA) | yes (enablers) — full run is QA's |
| AC-5 regression: guard hooks, confinement, suite | `settings.ts` keeps the 3 guard hooks + denies (settings.test.ts); TASK-112 confinement tests in `hop.test.ts` green; suite 808/1/1 (known execPath fail) | yes |

## Verification (by QA)

Build: HEAD f8a619e / 1e16d37 + Team B's working-tree changes (fp `18ca4d833a46` / `686c119cd01c`). Detail: `tests/TEST-108-caw-workers-work-in-folder.md` § Results.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | the real hook allows all four (and 8 more ordinary ones); live, a real worker ran `bun --version`, `pwd && ls -la`, `bun init -y` |
| AC-2 | PASS | every forbidden command refused with its real code, plus 24 bypass attempts; on the real runner one refusal → hop `commented` with the PM's sentence, the 10th → stopped; live: 2 refusals carried past |
| AC-3 | PASS | after the refusal cap, a crash and the time cap: card `todo` + `stoppedMidway`; the dependant waits and becomes workable once the card is done; 0 cards left in `doing` |
| AC-4 | — | REQ-108 phase 2 |
| AC-5 | PASS | caw-back 808/1/1 (known fail), guard-hook probe passed in every runner start; caw-front 334 + 265 e2e |
| Q1 | accepted as known (owner, `DECISIONS.md` 2026-10-29 17:0x) | a worker can `curl` CAW's and Blueprint's APIs on 127.0.0.1 as the operator (new with this REQ). Still open, fix = REQ-113 — `TEST-108` § Questions Q1 |

> ~~From the SA B (Silver), 2026-10-29 16:5x, on the amendment (req 4, AC-6): designed as SPEC-108 D8, built in TASK-125 (Bob).~~ **Superseded 17:0x:** the amendment was withdrawn by the owner; the design moved to SPEC-110 for REQ-113, with REQ-113's own wording (Q6 no longer needed). Q7's limit is in REQ-113 § Out of Scope. Kept for the record:
- **Q6 (wording — PM)** — the refusal reason for the new kind, in your sentence "คำสั่งนี้ทำไม่ได้: {เหตุผล} — ทำต่อด้วยวิธีอื่น". **Default:** `worker เรียกเซิร์ฟเวอร์ของ CAW/Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือ MCP`. Correct it if wrong. Also fenced, `[SA-decided]`: the two **web** ports (Blueprint :3100, CAW :3500), because they act as the operator through their server actions. Without them, AC-6's intent has a side door.
- **Q7 (for the owner's information — no answer needed)** — this fence judges **commands**. A program a worker writes and then runs (`bun run x.ts` with `fetch`) can still reach those ports and send those headers. That is the same limit as the 13:41 no-sandbox decision, and only a login on the APIs closes it (owner 10:51: "later"). AC-6 is met for commands; the residual risk belongs on the REQ-109 deploy-ready list.
