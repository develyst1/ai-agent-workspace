# Board — layout-pattern-app

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here.

## Project info

- Description: **Electron desktop app for photo pattern / collage templates.**
  Two modes — (1) *Layout Designer*: a Konva stage (default canvas 1080x1920)
  where the user adds, drags, resizes, names, colours and z-orders rectangular
  slots, then saves/loads the layout as JSON; (2) *Use Template*: pick a saved
  template, drop images into its slots (cover / centre-crop), and generate a
  full-resolution PNG saved through a native dialog.
- Human's original brief (Thai, verbatim as delivered):
  `../project-docs/project-brief-from-human.md` — this is the source material
  for Porter's first REQ.
- Code repository (single repo, greenfield):
  `H:\layout-pattern-app\layout-pattern-app`
  — on `develop`: `e6faa0f` (TASK-004, verified by Sober 2026-08-23 read-only, evidence in
  SPEC-002 §0) → `fc9ba21` (TASK-005; id + clean tree confirmed by the human 2026-08-23,
  REQ-002 §Questions Q15, not yet re-verified against the packet) → `6879acf`
  (TASK-006 + TASK-007; id + clean tree confirmed by the human 2026-08-23, REQ-002 §Q17,
  matching Sober's own read-only check of all 10 packet hashes, TASK-006 §Review D) →
  `de33ff9` (TASK-008's 8-file packet; id + clean tree confirmed by the human 2026-08-23,
  REQ-002 §Q20, matching Sober's own read-only check of all 8 packet hashes, TASK-008 §Review A)
  → `b9389e1` (TASK-009's accepted 3-file packet; id + clean tree confirmed by the human
  2026-08-23, REQ-002 §Q23, matching Sober's own read-only check of all 3 packet hashes,
  TASK-010 §Review) → an **unnamed commit** (TASK-010's accepted 1-file packet;
  *"commit แล้ว"* 2026-08-23, no id for the 5th time and unseen by anyone on the team,
  REQ-002 §Q25, non-blocking).
  From 2026-08-22 no role makes any git write, so work is handed
  off **uncommitted** as a base SHA + porcelain + sha256 packet: SPEC-001 §10.
- Stack named by the human: Electron (latest) · React 18 + TypeScript · Vite ·
  Konva + react-konva · Zustand · Tailwind (optional). Anything the brief does
  not pin down is a technical call for Sober, in a SPEC.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE — Electron main/preload, IPC,
  filesystem + native dialogs, packaging) · Fern (FE — React renderer, Konva
  canvas, Zustand, UI/dark mode). **No QA role on this project** (the human is
  the acceptance tester, via Porter); no deployed environment — local only.
  Repo split and the IPC seam: PROTOCOL.md "Repo layout & ownership".
- 🤖 Run mode: **DISPATCHER** (workspace-root `DISPATCHER.md`) — one session
  spawns the roles as subagents. Files remain the only channel; PROTOCOL
  unchanged. Dispatcher run log: `dispatcher-state.md`.
- Standing rules: no irreversible actions by any role (no global installs, no
  deleting anything outside the repo). **Git writes are the human's alone** — no
  role runs `git add`, `git commit`, branch creation or `git push` (REQ-001 Q23,
  answered 2026-08-22); editing files, e.g. `.gitignore`, is still the team's.
  Real-world material arrives via DATA REQUEST into `../project-docs/`.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Project foundation + working Layout Designer | HIGH | DELIVERED — 2026-08-23, Porter — human's second on-screen round 6/6 + trim not vetoed; all 17 criteria ticked, verdict in REQ-001 §Acceptance Criteria, answers in §Questions Q24/Q25 | — (delivered) |
| REQ-002 | Use Template — compose photos into a saved layout and export a PNG | HIGH | SPEC_DONE — 2026-08-23, Porter — delivery scope ruled by the human: `DELIVERED` includes TASK-010 (REQ-002 §Questions Q24); acceptance pass still out, split of ownership in REQ-002 §Acceptance Criteria | Human (via Porter) — on-screen acceptance pass |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Project foundation — Electron+Vite+React+TS skeleton that runs | SPEC-001 | DONE — 2026-08-22, Sober — accepted at `bae3f6c` (Electron 43.4.1); verdict + notes N1/N2 in TASK-001 §Review | — | — |
| TASK-002 | IPC seam — shared contract, preload API, save/open handlers | SPEC-001 | DONE — 2026-08-22, Sober — accepted at `097c045`; my own 45/45 vectors, typecheck+build 0, Q-BE-8 answered, note N5 (padded names → TASK-004); verdict in TASK-002 §Review "Round 2" | — | TASK-001 (DONE) |
| TASK-003 | Layout Designer canvas + slot model | SPEC-001 | DONE — 2026-08-22, Sober — accepted at `77673af`; verdict, my own 44-assertion re-verification, 5 answers and notes N1–N3 in TASK-003 §Review / §Questions | — | TASK-001 (DONE) |
| TASK-004 | Save/load wiring, template name, mode shell, dark mode | SPEC-001 | DONE — 2026-08-23, Sober — accepted at base `1d07fc8` + packet; my own 141 assertions, typecheck+build 0, note N6; verdict in TASK-004 §Review "Round 2" | — | TASK-002, TASK-003 (DONE) |
| TASK-005 | Contract v2 + `image:pick` / `png:save` handlers + preload | SPEC-002 | DONE — 2026-08-23, Sober — accepted at base `e6faa0f` + packet; my own 120 assertions, Q-BE-1 answered, notes N-SA-1/N-SA-2; verdict in TASK-005 §Review | — | — |
| TASK-006 | Designer — per-slot required/optional, saved and loaded | SPEC-002 | DONE — 2026-08-23, Sober — accepted as it stands in `6879acf`; my own 202 assertions, 6 mutations, typecheck+build 0, Q-FE-1 ruled (ค); verdict in TASK-006 §Review | — | TASK-005 (DONE) |
| TASK-007 | Use Template shell — enable the mode, pick a template, preview | SPEC-002 | DONE — 2026-08-23, Sober — accepted as it stands in `6879acf`; my own 253 assertions, 14 mutations, typecheck+build 0, Q-FE-2/3/4 answered; verdict in TASK-007 §Review | — | TASK-005 (DONE) |
| TASK-008 | Photos into slots — one at a time, several at once, replace, remove | SPEC-002 | DONE — 2026-08-23, Sober — accepted as it stands in `de33ff9`; my own 171 assertions, 20 mutations, typecheck+build 0, Q-FE-5/6/7 answered, notes N-SA-4/N-SA-5; verdict in TASK-008 §Review | — | TASK-007 (DONE) |
| TASK-009 | Generate — compose at full resolution and save the PNG | SPEC-002 | DONE — 2026-08-23, Sober — accepted at base `de33ff9` + packet; my own 137 assertions, 22 mutations, typecheck+build 0, Q-FE-8 ruled (ก) = B-13, notes N-SA-6/N-SA-7; verdict in TASK-009 §Review | — | TASK-006, TASK-008 (both DONE) |
| TASK-010 | Refusal message must render slot names literally (N-SA-6) | SPEC-002 | DONE — 2026-08-23, Sober — accepted at base `b9389e1` + packet; my own 137 assertions, 6 mutations, typecheck+build 0, Q-FE-9 answered (keep), B-9 amended; verdict in TASK-010 §Review | — | — |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-002 acceptance pass | Human (via Porter) | BLOCKS `DELIVERED` — 9 on-screen checks (B1, B3, B4, B5, B7, B9, B12, B14, B15) + the N-SA-1 seam risk + 1 optional look (TASK-010 §Review F); asked again 2026-08-23, list in TASK-009 §Review G, ownership + scope ruling in REQ-002 §Acceptance Criteria. |
| Q25 (REQ-002) | Human (via Porter) | NON-BLOCKING — id + tree state of the commit holding TASK-010's packet (*"commit แล้ว"*, no id, 5th time). REQ-002 §Questions Q25. |
| `shared/` byte-type fix (Q-FE-7) | Sober (SA) | NON-BLOCKING — settled at TASK-009's review: **one site**, the inbound cast in `src/lib/photo.ts`. A one-word BE TASK, still unwritten, blocks nobody. TASK-009 §Questions. |
