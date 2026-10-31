# REQ-121: CAW's starting team works card by card, each role on its own card
- Status: **DELIVERED + COMMITTED** (2026-10-30 18:5x — caw-back d33e586 · caw-front 04e2874, pushed, PM verified) · DELIVERED (2026-10-30 18:4x, the PM — O-1…O-4 accepted, DECISIONS 18:4x; tested caw-back 3795236 fp `9ce8cc10134e` · caw-front 1287772 fp `868b4b0843c5`) · was TEST_PASSED (2026-10-30 18:45, QA Tanya — AC-1/2/4 stub, AC-3 live one run; `tests/TEST-119-caw-team-works-card-by-card.md`) · READY_FOR_SA (2026-10-30 18:0x, the PM)
- Priority: HIGH `[PM-decided]` — the owner's "100%" is a team that finishes the work the way he would; in REQ-108 phase 3 the FE never ran and 7 of 8 cards were left to redo card #1.
- Requested: 2026-10-30 by the PM, from QA's TEST-106 phase 3 P3-1 and P3-2. Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` 2026-10-30 18:0x).
- Deadline: none · Team: **B (CAW)** · before REQ-106 in `../project-docs/plan-sit-th.md`

## Problem / Goal

`tests/TEST-106-e2e-live-dashboard.md` § Phase 3 (TEST_PASSED live; these are its findings):
1. **P3-1** — the starting team's chain lets แบงค์ (BE) hand off only to มิ้นท์ (QA), so the BE wrote the page and ฝน (FE) never ran. แบงค์ said so: *"ผมส่งต่อให้ ฝน ไม่ได้ เพราะ chain ส่งได้แค่หา มิ้นท์"*.
2. **P3-2** — the whole product was built inside card #1 ("วางโครงโปรเจกต์และกำหนด API"). Cards #2–#8, one per requirement, then waited on the owner's review of #1 and would have found their work already done.

## Requirement

1. In the starting team, each role can hand work to the role that does the next part: BE ↔ FE as well as BE/FE → QA. A page or screen card goes to the FE. `[PM-decided]`
2. A worker on a card does **that card's** work and leaves the other cards' work to their cards. When it sees more work that has no card, it says so (a comment or a proposed card); it does not do that work itself.
3. Nothing else in the run changes (REQ-117/118/119/120 behaviour kept).

How is the SA's design. A model's behaviour cannot be forced, so if req 2 can only be asked of the model, the SA says what the code does to back it up (for example, what the worker is shown or allowed), and the live check below is the proof.

## Acceptance Criteria

- [ ] **AC-1** — **Given** the starting team **When** a BE worker is offered hand-off recipients (stub) **Then** the FE is among them, and a hand-off BE → FE works.
- [ ] **AC-2** — **Given** a card's hop (stub) **When** the worker is given its instructions **Then** they say to do only this card's work and to propose a card (not do it) for anything else. Check: QA reads the prompt the stub received.
- [ ] **AC-3** (live, ≤ 1 run) — **Given** REQ-108's hand-typed spec **When** the team runs (live CLI) **Then** the FE writes the page on its own card, and card #1 does not build what cards #2–#8 hold (each later card has its own work left when its turn comes). Check: QA, live; files and trace per card.
- [ ] **AC-4** (regression) — caw-back + caw-front suites pass; REQ-108's AC-4 result still reachable.

## User-facing wording (the PM)

No new words expected. If the SA's design adds a line the user reads, the PM writes it.

## Out of Scope

- A team shape other than the starting team. · Persistent workers / parallel team (REQ-106). · The owner's review step on card #1 itself.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## AC check
(Silver, SA B, 2026-10-30 18:27 — SPEC-119; TASK-153 + TASK-154 DONE, uncommitted: caw-back 3795236 + 4 paths fp `9ce8cc10134e` · caw-front 1287772 + 2 paths fp `868b4b0843c5`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | `caw-front → src/lib/startingTeam.ts:12` STARTING_EDGES + BE→FE, FE→BE (8 edges; `startingTeam.test.ts` pins them, 9/0); caw-back follows edges for hand-off (`src/cards/service.ts:143-157`) and lists their targets in the prompt (`src/runner/hop.ts` recipientsOf) | yes (mock + unit; the real stub run is QA's) |
| AC-2 | `caw-back → src/runner/prompt.ts` rule 2 "Do only your card's work…", other-cards line, rule 7 "…say so in a `comment` … do not build it yourself"; `src/runner/hop.test.ts` "REQ-121 AC-2: a card hop's prompt holds rule 2, rule 7 and the other-cards line…" reads the prompt the stub received (117/0) | yes |
| AC-3 | Live, ≤ 1 run — QA's. The code that backs it: AC-1 (FE reachable) + AC-2 (told own card only, shown the other cards) + chat rule 3 (page → FE, `prompt.ts` chat rule 3) — SPEC-119 D1–D3 | yes as design; the live proof is QA's (P3-2's cause is inferred, SPEC-119 § Overview) |
| AC-4 | caw-back whole suite 922/1 skip/1 fail (known withReadGuard); caw-front `bun test src` 355/0; REQ-117/118/119/120 lines untouched (only rule 2's wording changed — REQ-118's "every requirement binds every card" kept as a rule, SPEC-119 D2.1) | yes |

## Verification (by QA)
Tanya, 2026-10-30 18:45 — tree-fp.sh: caw-back 3795236 fp `9ce8cc10134e`, caw-front 1287772 fp `868b4b0843c5` (same at 18:28 and 18:45); live also bp 6123018 / 6692a16 committed. Detail TEST-119.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | stub: แบงค์'s prompt offers "ฝน (FE), มิ้นท์ (QA)"; hand-off แบงค์ → ฝน by name 200; ฝน offered "แบงค์ (BE)" back |
| AC-2 | PASS | stub: each card hop's prompt holds rule 2 ("Do only your card's work…"), rule 7 ("…do not build it yourself") and the other-cards line ("#2 ทำหน้าเว็บ (ฝน FE, todo)") |
| AC-3 | PASS | live, one run, new project: page cards → ฝน, who wrote index.html/style.css/app.js on #4–#6; card #1 wrote only a static server + placeholders ("ฝนเติมต่อ"); #2/#3 added the checks and the 3 s rule on their own cards; all 8 done, 0 operator questions (QA approved the reviews as owner) |
| AC-4 | PASS | REQ-108 AC-4 on this build: 4 services, "ไม่ตอบ" in 6.9 s; REQ-117/119/120 cases all OK; caw-back 922/1/1 known, caw-front 355/0 |

O-1…O-4 (TEST-119): BE handed the server card to FE who closed it with no work; FE edited server.js for Thai words; #5 reviewed with no note; no README this time.

