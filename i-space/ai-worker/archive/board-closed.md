# Closed board rows — i-space

> Rows swept off `board.md` when they closed. Every row is byte-verbatim from the board; nothing
> reworded or dropped. A row here is closed, not deleted: its detail lives in the REQ / TASK / TEST file it
> points at. Newest sweep last.

## Swept from board.md on 2026-10-30 by Marie (MARIE.md ORDER 44) — 59 closed rows

> Byte-verbatim from `board.md` (rows whose status starts DONE / DELIVERED / CODE ACCEPTED, the gate's own
> test). Nothing reworded or dropped; detail lives in the REQ / TASK / TEST file each row points at.

### Requirements (13)

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-101 | Understand all the code (Blueprint + CAW) | HIGH (owner: first work) | DELIVERED (2026-10-29, PM; TEST-101 PASSED; owner overview `../project-docs/overview-th.md`) · CAW map nits folded (Silver, 2026-10-29) | — |
| REQ-102 | Gap report: owner intent (a/b/c) vs code | HIGH (owner 10:51) | DELIVERED (2026-10-29, PM; TEST-102 PASSED 12:02; `maps/*-gap-102.md`; owner answers DECISIONS 11:41) | — |
| REQ-103 | Blueprint as spec store (labels, requirements, audit) | HIGH (owner GO 12:41) | DELIVERED + COMMITTED (2026-10-29, owner's ขึ้น git; blueprint-back a4bf924 (REQ-103 only) · blueprint-front a52e022, pushed, PM verified) | — |
| REQ-104 | CAW live read-only CLI view per worker | HIGH (owner GO 12:41) | DELIVERED + COMMITTED (2026-10-29, owner's ขึ้น git; caw-back f8a619e · caw-front 1e16d37, pushed, PM verified) | — |
| REQ-107 | Study: how CAW wakes persistent CLI workers (no rings) | HIGH (owner 12:29) | DELIVERED (2026-10-29, PM; TEST-103 PASSED 12:36; `maps/caw-wake-107.md` — rec. option A, B fallback) | — |
| REQ-111 | CAW workers can work in their folder; a refusal never stalls the team | HIGH (PM, from TEST-106 P1-7/8) | DELIVERED + COMMITTED (2026-10-29; caw-back 80e3e88 · caw-front f071c02 = QA's tested tree, pushed, PM verified; Q1 hole → REQ-113) | — |
| REQ-112 | A card gets every rule it needs | HIGH (PM, from TEST-106 P1-9/10) | DELIVERED + COMMITTED (2026-10-30 15:1x; bp-back ccd32af · bp-front 09f2717 · caw 58ab883/7ef4a1e, PM verified) | —
| REQ-117 | CAW starting team runs; report names a review holding work up | HIGH (PM, from TEST-112 F-0b/O-4) | DELIVERED + COMMITTED (2026-10-30 15:2x; caw-back 4cc3241 · caw-front b4f2659, PM verified) | — |
| REQ-113 | CAW worker cannot act as operator via local APIs | HIGH (owner 17:0x "ทำต่อจากนี้เลย") | DELIVERED + COMMITTED (2026-10-29; caw-back a17ff11 = QA's tree, pushed, PM verified; DEF-2 accepted) | — |
| REQ-110 | Blueprint interview stores what it agrees; never claims a false save | HIGH (PM, from TEST-106 P1-1/2/3) | DELIVERED + COMMITTED (2026-10-30; owner's choice (ก), AC-1 point 1 → REQ-114; blueprint-back e2c3326 · blueprint-front b041cbd, pushed, PM verified) | — |
| REQ-114 | Blueprint interview stores a named service's address | HIGH (owner 2026-10-30) | DELIVERED + COMMITTED (2026-10-30; r1 9578d51 · r2 bp-back 2da175e · bp-front 15283e1, pushed, PM verified; DEF-2/3 → REQ-116) | — |
| REQ-116 | URL catcher reads a Thai-written address correctly | MEDIUM (PM, from TEST-111 DEF-2/3) | DELIVERED + COMMITTED (2026-10-30 15:5x; blueprint-back f10f8cb, PM verified) | — |
| REQ-105 | CAW always sees the latest spec; label = tag | HIGH (owner GO 12:41) | DELIVERED + COMMITTED (2026-10-30 12:2x; bp-back e4b2579 · bp-front 282e426 · caw-back 67dfe55 · caw-front 7359fa3, pushed, PM verified) | — |

### Tasks (46)

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-103 | caw-back — run, folder map | SPEC-102 | DONE (2026-10-29, Silver; `tasks/TASK-103-caw-back-study.md` § Review) | BE Bob (B) | — |
| TASK-104 | caw-front — run, folder map, main flow, /start | SPEC-102 | DONE (2026-10-29, Silver; `tasks/TASK-104-caw-front-study.md` § Review) | FE Fanta (B) | — |
| TASK-105 | caw-back — store/serve live CLI output (REQ-104) | SPEC-103 | DONE (2026-10-29, Silver; `tasks/TASK-105-caw-back-live-output.md` § Review round 2) — live run (DoD 11) blocked: no `socat` on this box → PM | BE Bob (B) | — |
| TASK-106 | caw-front — read-only worker screen (REQ-104) | SPEC-103 | DONE (2026-10-29, Silver; `tasks/TASK-106-caw-front-worker-screen.md` § Review round 2) | FE Fanta (B) | — |
| TASK-111 | caw-front — team-down command = `bun run runner` (REQ-104 Q3) | SPEC-103 | DONE (2026-10-29, Silver; `tasks/TASK-111-caw-front-team-down-command.md` § Review) | FE Fanta (B) | — |
| TASK-112 | caw-back — no Bash sandbox: Bash read fence + folder confinement (owner 13:41), then the one live run | SPEC-103 | DONE (2026-10-29, Silver; `tasks/TASK-112-caw-back-no-sandbox-confinement.md` § Review) | BE Bob (B) | TASK-105 |
| TASK-113 | blueprint-back — seam v2: revision, latest-spec reads, changes feed, spec.changed push (REQ-105) | SPEC-106 | DONE (2026-10-30 12:0x, Sober; `tasks/TASK-113-blueprint-back-seam-latest.md` § Review) — contract emitted | BE Jason (A) | REQ-114 r1 committed 9578d51 ✓ |
| TASK-140 | blueprint-front — gen:api for seam v2 routes (REQ-105 DEF-1) | SPEC-106 § Front (corrected) | DONE (2026-10-30 11:4x, Sober; `tasks/TASK-140-blueprint-front-gen-api-seam-v2.md` § Review) | FE Fern (A) | TASK-113 DONE ✓ |
| TASK-117 | blueprint-back — relatedDecisions in part context (REQ-112) | SPEC-106 | DONE round 2 (2026-10-30 14:2x, Sober; `tasks/TASK-117-blueprint-back-related-decisions.md` § Round 2 review) | BE Jason (A) | REQ-114 r2 committed 2da175e ✓ |
| TASK-141 | blueprint-front — gen:api for relatedDecisions (REQ-112) | SPEC-106 § REQ-112 addition | DONE (2026-10-30 13:4x, Sober; `tasks/TASK-141-blueprint-front-gen-api-related-decisions.md` § Review) | FE Fern (A) | TASK-117 DONE ✓ |
| TASK-142 | blueprint-back — URL catcher: stop at Thai, held = same address (REQ-116) | SPEC-113 | DONE (2026-10-30 14:5x, Sober; `tasks/TASK-142-blueprint-back-url-catcher-edges.md` § Review) | BE Jason (A) | TASK-117 committed ccd32af ✓ |
| TASK-123 | blueprint-back — store valid changes, drop + record refused ones (REQ-110 round 2) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-123-blueprint-back-interview-partial-apply.md` § Review) | BE Jason (A) | TASK-109 DONE (same topic) |
| TASK-124 | blueprint-front — "saved n, not saved m" + refused list (REQ-110 round 2) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-124-blueprint-front-interview-refused-list.md` § Review) | FE Fern (A) | — |
| TASK-126 | blueprint-back — field shapes in prompt, safe repairs, unreadable-reply record (REQ-110 round 3) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-126-blueprint-back-interview-shapes.md` § Review) | BE Jason (A) | TASK-123 DONE (same topic) |
| TASK-127 | blueprint-front — "saved, but field X left out" (REQ-110 round 3) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-127-blueprint-front-interview-field-dropped.md` § Review) | FE Fern (A) | — |
| TASK-128 | blueprint-front — restore build/ (6 files from a52e022) + bun install after 18:24 reboot (REQ-110) | SPEC-105 | DONE (2026-10-29 18:5x, Sober; `tasks/TASK-128-blueprint-front-restore-after-reboot.md` § Review) | FE Fern (A) | — |
| TASK-129 | blueprint-back — bun install after 18:24 reboot, re-prove 104/0 (REQ-110) | SPEC-105 | DONE (2026-10-29 18:5x, Sober; `tasks/TASK-129-blueprint-back-reinstall-after-reboot.md` § Review) | BE Jason (A) | — |
| TASK-130 | blueprint-back — read `type` as `op`, name `op` in prompt, 3-min first answer (REQ-110 round 4) | SPEC-105 | DONE (2026-10-30, Sober; `tasks/TASK-130-blueprint-back-interview-op-slip-and-wait.md` § Review) | BE Jason (A) | — |
| TASK-131 | blueprint-front — `op_renamed` into API types (REQ-110 round 4) | SPEC-105 | DONE (2026-10-30 00:4x, Sober; `tasks/TASK-131-blueprint-front-interview-op-renamed-type.md` § Review) | FE Fern (A) | TASK-130 DONE ✓ |
| TASK-132 | blueprint-back — `api.path` may be a full http(s) URL + prompt line + AC-1 replay (REQ-114) | SPEC-111 | DONE (2026-10-30 09:3x, Sober; `tasks/TASK-132-blueprint-back-api-path-full-url.md` § Review) | BE Jason (A) | REQ-110 committed e2c3326 ✓ |
| TASK-133 | blueprint-front — full-URL api renders in 4 themes (REQ-114) | SPEC-111 | DONE (2026-10-30 09:5x, Sober; `tasks/TASK-133-blueprint-front-api-full-url-render.md` § Review) | FE Fern (A) | TASK-132 DONE ✓ |
| TASK-134 | blueprint-back — heavy/light model per call, one fallback up, calls recorded, GATEWAY_LIGHT_MODEL (REQ-115) | SPEC-112 | DONE (2026-10-30 16:0x, Sober; re-run 329/16/0, tsc 0; `tasks/TASK-134-blueprint-back-gateway-light-heavy.md` § Review) | BE Jason (A) | REQ-116 committed f10f8cb ✓ |
| TASK-135 | blueprint-front — roundCalls/calls into API types (REQ-115) | SPEC-112 | DONE (2026-10-30 16:0x, Sober; re-run check:api, typecheck 0, 238/0; `tasks/TASK-135-blueprint-front-round-calls-type.md` § Review) | FE Fern (A) | TASK-134 openapi ✓ · front 09f2717 ✓ |
| TASK-147 | caw-back — 2nd turn for a commented card, `no_progress` names the card, hand-off by name + role (REQ-119) | SPEC-116 | DONE (2026-10-30 17:0x, Silver; `tasks/TASK-147-caw-back-no-progress-and-named-handoff.md` § Review) | BE Bob (B) | REQ-117 committed (4cc3241) ✓ |
| TASK-148 | caw-front — `no_progress` word + gen:api (REQ-119) | SPEC-116 | DONE (2026-10-30 17:2x, Silver; `tasks/TASK-148-caw-front-no-progress-word-and-types.md` § Review) | FE Fanta (B) | TASK-147 DONE ✓ |
| TASK-136 | blueprint-back — URL catcher: store every user-written address no part holds (REQ-114 r2) | SPEC-111 | DONE (2026-10-30 12:2x, Sober; `tasks/TASK-136-blueprint-back-url-catcher.md` § Review) | BE Jason (A) | REQ-105 committed e4b2579 ✓ |
| TASK-137 | blueprint-front — chat line per address Blueprint kept (REQ-114 r2) | SPEC-111 | DONE (2026-10-30 12:3x, Sober; `tasks/TASK-137-blueprint-front-url-kept-line.md` § Review) | FE Fern (A) | TASK-136 DONE ✓ |
| TASK-114 | caw-back — read the latest spec: client v2, cache, hop pin, no-label start (REQ-105) | SPEC-107 | DONE (2026-10-29 18:2x, Silver; `tasks/TASK-114-caw-back-read-latest-spec.md` § Review) | BE Bob (B) | SA Silver review |
| TASK-115 | caw-back — follow by revision, push spec.changed, project label/reachable, poll 10 s (REQ-105) | SPEC-107 | DONE (2026-10-29 19:2x, Silver; `tasks/TASK-115-caw-back-follow-by-revision.md` § Review) | BE Bob (B) | TASK-114 DONE ✓ |
| TASK-116 | caw-front — no-label start, label tag, card cut-at, unreachable sentence (REQ-105) | SPEC-107 | DONE (2026-10-29 19:4x, Silver; `tasks/TASK-116-caw-front-label-tag-latest-spec.md` § Review) | FE Fanta (B) | TASK-114 + TASK-115 DONE ✓ |
| TASK-118 | caw-back — command policy in the hook, soft refusals, real reasons, one live probe (REQ-111) | SPEC-108 | DONE (2026-10-29 16:3x, Silver; `tasks/TASK-118-caw-back-command-policy-soft-refusals.md` § Review round 2) | BE Bob (B) | REQ-104 committed (f8a619e) ✓ |
| TASK-119 | caw-back — finished hop sends `doing` card to `todo`; `stoppedMidway` (REQ-111) | SPEC-108 | DONE (2026-10-29 15:4x, Silver; `tasks/TASK-119-caw-back-card-back-to-todo.md` § Review) | BE Bob (B) | REQ-104 committed (f8a619e) ✓ |
| TASK-120 | caw-front — "stopped midway" sentence on board + card (REQ-111) | SPEC-108 | DONE (2026-10-29 15:5x, Silver; `tasks/TASK-120-caw-front-stopped-midway.md` § Review) | FE Fanta (B) | TASK-119 DONE ✓ |
| TASK-125 | caw-back — no curl/wget to I-Space server ports, no identity headers (REQ-113) | SPEC-110 | DONE (2026-10-29 17:3x, Silver; round 3 — `tasks/TASK-125-caw-back-no-api-from-workers.md` § Review) | BE Bob (B) | REQ-111 committed (80e3e88) ✓ |
| TASK-121 | caw-back — prompt line + GET …/coverage (REQ-112) | SPEC-109 | DONE (2026-10-30 10:0x, Silver; `tasks/TASK-121-caw-back-coverage-and-prompt.md` § Review) | BE Bob (B) | REQ-105 committed (27cbd1b) ✓ |
| TASK-122 | caw-front — uncovered parts on proposal + board (REQ-112) | SPEC-109 | DONE (2026-10-30 10:1x, Silver; `tasks/TASK-122-caw-front-uncovered-parts.md` § Review) | FE Fanta (B) | TASK-121 DONE ✓ · REQ-105 committed (4a071bc) ✓ |
| TASK-138 | caw-back — nameless label passes as null (REQ-105 Q6) | SPEC-107 D13 | DONE + COMMITTED caw-back 67dfe55 (2026-10-30 12:2x, Silver; `tasks/TASK-138-caw-back-nameless-label.md` § Review) | BE Bob (B) | REQ-112 committed (58ab883) ✓ |
| TASK-139 | caw-front — nameless label shows "ป้าย {version}" (REQ-105 Q6) | SPEC-107 D13 | DONE + COMMITTED caw-front 7359fa3 (2026-10-30 12:3x, Silver; `tasks/TASK-139-caw-front-nameless-label-tag.md` § Review) | FE Fanta (B) | TASK-138 DONE ✓ · REQ-112 committed (7ef4a1e) ✓ |
| TASK-143 | caw-back — shipped role skills + loadSkills fallback; report "รอคุณตรวจ" line (REQ-117) | SPEC-114 | DONE + COMMITTED caw-back 4cc3241 (2026-10-30 15:1x, Silver; `tasks/TASK-143-caw-back-starter-skills-and-review-line.md` § Review round 2) | BE Bob (B) | REQ-105 committed (67dfe55) ✓ |
| TASK-144 | caw-front — board notice "รอคุณตรวจ" (REQ-117) | SPEC-114 | DONE + COMMITTED caw-front b4f2659 (2026-10-30 15:1x, Silver; `tasks/TASK-144-caw-front-review-hold-notice.md` § Review round 2) | FE Fanta (B) | REQ-105/112 committed (7359fa3) ✓ |
| TASK-101 | blueprint-back study (run, folders, seam) | SPEC-101 | DONE (2026-10-29, Sober; `tasks/TASK-101-blueprint-back-study.md` § Review) | BE Jason (A) | — |
| TASK-102 | blueprint-front study (run, folders, flow, CAW link) | SPEC-101 | DONE (2026-10-29, Sober; `tasks/TASK-102-blueprint-front-study.md` § Review) | FE Fern (A) | TASK-101 DoD 2 (step 7 only) |
| TASK-107 | blueprint-back — name on writes, audit, labels, requirement kind, history (REQ-103) | SPEC-104 | DONE (2026-10-29, Sober; `tasks/TASK-107-blueprint-back-spec-store.md` § Review) | BE Jason (A) | — |
| TASK-108 | blueprint-front — name prompt, labels, requirements page, history; try the product (REQ-103) | SPEC-104 | DONE (2026-10-29, Sober; `tasks/TASK-108-blueprint-front-spec-store.md` § Review) | FE Fern (A) | — |
| TASK-109 | blueprint-back — kinds in prompt, honest rejected round, no retry on timeout (REQ-110) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-109-blueprint-back-interview-honest.md` § Review) — REQ-110-only patch proven | BE Jason (A) | TASK-107 DONE |
| TASK-110 | blueprint-front — "nothing saved" / timeout sentences (REQ-110) | SPEC-105 | DONE (2026-10-29, Sober; `tasks/TASK-110-blueprint-front-interview-honest.md` § Review) | FE Fern (A) | TASK-108 DONE · TASK-109 DoD 6 |
