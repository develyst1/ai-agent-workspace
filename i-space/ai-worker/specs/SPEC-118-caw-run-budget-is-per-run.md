# SPEC-118: The number typed for "อัตโนมัติ" is this run's steps — the project-wide budget check goes
- Source: REQ-120
- Status: DONE (2026-10-30 18:10, Silver — TASK-152 DONE)
- Team: B · repos: `caw-back` only (caw-front: no work — § Front)
- Read on `caw-back` `atom` 3efcc1a and `caw-front` `atom` 1287772, 2026-10-30 17:5x.

## Overview

**Design choice (REQ-120 req 1, the SA's choice): the per-run budget** — the PM's preference, and what the
screen already says. The one project-wide check in the hop API is removed; the run's own check stays and becomes
the only budget. No wording change, no shape change.

Why the second run ends at once today (read, and reproduced by QA in TEST-117 O-1):
- The budget dialog sends the typed number twice: `PATCH …/mode {hopBudget}` (sets `Project.hopBudget`) and
  `POST …/runs {hopBudget}` (the run's own) — `caw-front → src/app/p/[id]/actions.ts:20-23`.
- `caw-back → src/hops/service.ts:50-52` refuses any card hop in `dispatcher` mode when
  `project.hopsUsed >= project.hopBudget`. `Project.hopsUsed` is a lifetime count (`src/core/reduce.ts:260`, never
  reset — REQ-011 AC-6, `src/projects/service.ts:57`). Run 1 used 2 of 2 → `hopsUsed` 2; run 2 typed 2 again →
  `hopBudget` 2 → the first hop of run 2 is refused `409 no_budget`.
- The runner turns that refusal into `endRun(…, "budget_spent")` (`src/runner/main.ts:278`), so the report says
  `0 ก้าว จากงบ 2 · เหตุที่จบรอบ: ใช้งบครบแล้ว`.
- The run's own check (`src/hops/service.ts:53-55`, and the plan's `src/runner/plan.ts:54`) already counts only
  this run's card hops.

What the user sees about budgets is already per run: the header shows the open run's `งบ / ใช้ไป`
(`caw-front → src/components/ModeControl.tsx:95`, `budget(lastRun.hopBudget, lastRun.hopsUsed)`), the runs list
each run's (`src/components/runs/RunsList.tsx:68`). `Project.hopsUsed` is passed to `ModeControl` (`page.tsx:49`)
but never rendered (`ModeControl.tsx` uses only `lastRun.hopsUsed`).

## D1 — remove the project-wide check (caw-back `src/hops/service.ts`)

Delete lines 50-52 (`if (!message && project.mode === "dispatcher" && project.hopsUsed >= project.hopBudget) …
"the project's hop budget (…) is spent"`). Keep line 49's comment, extended to say the run's budget is the only
one. Nothing else in `startHop` changes.

Kept as they are (decided, not open):
- `Project.hopBudget` = the last number typed — the dialog's default next time (`ModeControl.tsx:32`) and the
  runner's fallback run budget (`src/runner/main.ts:252`). `Project.hopsUsed` stays a lifetime counter (REQ-011
  AC-6: never reset; `test/core/events.test.ts`, rebuild-check). Both API fields keep their shape.
- `no_budget` stays a code of `POST …/hops` (the run's check). `openapi.json` unchanged.
- The runner still ends a run `budget_spent` on a `no_budget` refusal (`main.ts:278`) — now only a race (the run
  filled since the listing); its comment is corrected.

Result per kind of hop (`startHop`; §3 per-kind table). "Before" = 3efcc1a; "After" = D1:

| Hop | Before | After |
|---|---|---|
| chat hop (has `messageId`), any mode, any run | never budget-checked (D-055, line 49) | same |
| card hop with `runId`, mode `dispatcher` | refused if project `hopsUsed ≥ hopBudget` **or** the run's card hops ≥ `run.hopBudget` | refused only if the run's card hops ≥ `run.hopBudget` |
| card hop with `runId`, mode `manual` (the runner can hold a run open in manual, TASK-B-056) | run check only | same |
| card hop, no run, mode `manual` (ทำต่อ, `crew.ts:49`) | no check | same |
| card hop, no run, mode `dispatcher` | refused if project `hopsUsed ≥ hopBudget` | no check — the screen never sends this (ทำต่อ renders only when `canCarryOn` is true, `caw-front → src/components/Board.tsx:163,90`, and that needs `mode === "manual"`, `src/lib/crew.ts:49`; the runner always sends `runId`, `main.ts:274`) |

Boundary case through both rules (REQ-120 AC-1): project `hopBudget` 2, `hopsUsed` 2 (run 1 used 2 of 2); run 2
opened with `hopBudget` 2, 0 card hops in it. Before: line 50 refuses the first hop (2 ≥ 2). After: line 53
counts 0 < 2 → 201; the second hop 1 < 2 → 201; the third 2 ≥ 2 → `409 no_budget` — but the plan
(`plan.ts:54`, `hopsInRun.length >= hopBudget`) finishes the run `budget_spent` before asking. Run 2 report:
`- 2 ก้าว จากงบ 2` and `- เหตุที่จบรอบ: ใช้งบครบแล้ว` (true now).

AC-2 (report numbers are this run's): already so — `src/runner/report.ts:86-98` counts `i.hops`, the hops of this
run (`:17-18`), against `i.run.hopBudget`. D1 makes a `budget_spent` end mean this run's budget only. Proven by
the new runner test (TASK DoD).

Consumers (probe): probe-change.sh caw-back spec120-probe.patch → 3 errors
caw-back → src/runner/main.test.ts:195 (fail) tick — automatic mode (TASK-C-031) > the PROJECT's budget can refuse a hop the run's budget would allow (409 no_budget) → the run ends budget_spent → TASK-152
caw-back → test/http/chat-hops-budget.test.ts:29 (fail) dispatcher, hopsUsed = hopBudget: a CARD hop → 409 no_budget, a CHAT hop → 201 → TASK-152
caw-back → test/http/hops-runs.test.ts:80 (fail) budget (dispatcher only): hopsUsed ≥ hopBudget → 409 no_budget; manual mode has no limit; switching modes never resets hopsUsed → TASK-152

(patch `tests/harness/spec120-probe.patch`, run 2026-10-30 17:5x on caw-back 3efcc1a content, defaults tsc + bun
test; paired caw-front not run — `openapi.json` the same before and after; real repos untouched, fp before = after.)
Grep, prose only: `src/hops/service.ts:1-3` header ("counts in the project's hopsUsed") stays true · `caw-front →
src/api/mock.ts:433` comment ("`no_budget` is not modelled") stays true.

## Front

No caw-front work: no shape change (`openapi.json` unchanged — probe), no new words. The dialog's number already
goes to the run (`actions.ts:23`) and the screen already shows per-run numbers. REQ-120's § Wording line is for
the project-wide design only, which is not chosen.

Consumers (probe): probe-change.sh caw-back spec120-probe.patch → 0 errors

(caw-front: the probe's paired-front step did not run because the patched `openapi.json` equals the base — nothing for caw-front to consume.)

## Non-functional

None beyond: no live Claude run, no gateway call (stub `CLAUDE_BIN`, `pglite:memory`).

## Tasks

- TASK-152: caw-back — remove the project-wide budget check; the three pinned tests now pin per-run — owner: BE
  Bob (B) (depends on: REQ-118 committed 3efcc1a ✓)

## Questions

None. Interpreted: REQ-120 req 1 "the SA chooses" → per-run, the PM's stated preference; the § Wording line is
then unused.
