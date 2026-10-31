# REQ-120: Starting another CAW run with the same number works, or says honestly why it can't
- Status: **DELIVERED + COMMITTED** (2026-10-30 18:1x — caw-back 3795236, pushed, PM verified) · DELIVERED (2026-10-30 18:14, the PM; tested caw-back 3efcc1a fp `a95143c64740`) · was TEST_PASSED (2026-10-30 18:14, QA Tanya — AC-1…AC-3; `tests/TEST-118-caw-second-run-honest-budget.md`) · READY_FOR_SA (2026-10-30 17:4x, the PM)
- Priority: HIGH `[PM-decided]` — the owner's "100%" means he runs I-Space on SIT the way he works himself, and he will press "อัตโนมัติ" more than once on a project.
- Requested: 2026-10-30 by the PM, from QA's TEST-117 O-1. Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` 2026-10-30 17:4x).
- Deadline: none · Team: **B (CAW)**

## Problem / Goal

`tests/TEST-117-hand-entered-spec-reaches-workers.md` O-1: the number typed for "อัตโนมัติ" is the project's total budget, not the run's. Run 1 started with 2 and used 2. Run 2, started with 2 again, ended in 0.3 s with "0 ก้าว จากงบ 2 · เหตุที่จบรอบ: ใช้งบครบแล้ว". The user sees a run that did nothing and claims its budget is spent. (caw-back `src/hops/service.ts:50`, older than REQ-105.)

## Requirement

1. A user who starts a new run and types a number gets that many steps for **this run** — or, if the SA's design keeps a project-wide budget, the screen makes that clear before the run starts and the report says the real cause and how to continue. The SA chooses; my preference is the per-run number `[PM-decided]`, since that is what a user means by typing it.
2. A run never ends at once with words saying it used up a budget it never spent.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a project whose earlier run used 2 of 2 **When** the user starts "อัตโนมัติ" again with 2 (stub CLI) **Then** either the run takes up to 2 steps, or (project-wide design) it does not start and the user sees § Wording's line before anything runs.
- [ ] **AC-2** — **Given** any run that ends on budget **When** the report is written **Then** its numbers are this run's own (steps taken by this run).
- [ ] **AC-3** (regression) — REQ-117/119 report lines unchanged; caw-back + caw-front suites pass.
  - Check (all): QA, stub `CLAUDE_BIN`.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| only if the project-wide design is kept: before start / in the report | งบของโปรเจกต์นี้ใช้ครบแล้ว ({used} จาก {budget} ก้าว) — เพิ่มงบก่อนเริ่มรอบใหม่ | This project's budget is used up ({used} of {budget} steps) — raise it before starting a new run |

## Out of Scope

- Money / quota accounting of the owner's Claude subscription. · The budget's default number.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## AC check
(Silver, SA B, 2026-10-30 18:10 — SPEC-118, TASK-152 DONE; caw-back 3efcc1a + 5 paths uncommitted, fp `a95143c64740`; caw-front unchanged 1287772)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | Per-run design: `caw-back → src/hops/service.ts` project-wide check removed (SPEC-118 D1); `src/runner/main.test.ts` "REQ-120: a second run with the same number takes its own steps…" — run 1 2 of 2, run 2 with 2 → 2 own hops (my re-run 78/0, 18:0x) | yes (stub, runner + in-memory API; the screen path is QA's) |
| AC-2 | `src/runner/report.ts:86-98` counts this run's hops; same test: run 2 report `- 2 ก้าว จากงบ 2` + `ใช้งบครบแล้ว` | yes |
| AC-3 | caw-back whole suite 916/1 skip/1 fail (known withReadGuard, = base); caw-front `bun test src` 355/0; REQ-117/119 report lines untouched (`report.ts`, `main.ts` stop lines not in the diff) | yes |

## Verification (by QA)
Tanya, 2026-10-30 18:14 — tree-fp.sh: caw-back 3efcc1a fp `a95143c64740`, caw-front 1287772 fp `0c57fd1ec4c8` (same at 18:11 and 18:14); stub CLI, real API + runner + screen. Detail TEST-118.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | run 1 typed 2 → 2 of 2; run 2 typed 2 again in the real dialog → 2 own steps (TEST-117: 0 in 0.3 s); run 3 typed 1 → 1 |
| AC-2 | PASS | run 2 "2 ก้าว จากงบ 2 · ใช้งบครบแล้ว" (true); run 3 "1 ก้าว จากงบ 1"; project total 5 = 2 + 2 + 1 |
| AC-3 | PASS | TEST-116's S1–S7 (REQ-119/117) all OK again; caw-back 916/1/1 (known withReadGuard); caw-front unchanged |

