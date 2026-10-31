# REQ-113: A CAW worker cannot act as the operator (or as a Blueprint user) through the local APIs

- Status: DELIVERED (2026-10-29 17:5x, the PM — QA TEST_PASSED 17:50; DEF-2 `curl --json` to own port accepted as known minor) · **COMMITTED 2026-10-29** on the owner's "ขึ้น git REQ-113 (เฉพาะ caw-back)": caw-back `a17ff11` on `atom`, pushed; tree = QA's fp `9ca932a8dab7` (SA B checked); `origin/atom` verified by the PM · file repaired by the PM 17:5x (a pasted duplicate removed; corrupted copy in `archive/REQ-113-corrupted-copy-2026-10-29.md`) · was TEST_PASSED (2026-10-29 17:50, QA Tanya — round 2: AC-1…AC-5 PASS, 40 bypass variations refused, DEF-1 fixed; DEF-2 MINOR `--json`; verdict = fp `9ca932a8dab7`; `tests/TEST-109-caw-workers-cannot-act-as-operator.md` § Round 2) · was SPEC_DONE (2026-10-29 17:3x, the SA B — DEF-1 reworked: SPEC-110 D6–D8, TASK-125 DONE round 3; `## AC check` updated) · was TEST_FAILED (17:25, TEST-109 DEF-1) · was SPEC_DONE 17:1x
- Priority: HIGH — the owner: *"ให้ทำต่อจากนี้เลย"* (do it right after REQ-111)
- Requested: 2026-10-29 by the owner, typed in the PM pane — stamp `operator`: *"ส่งมอบ REQ-111 ไปก่อน แล้วเปิด REQ ใหม่แก้ช่องโหว่ curl/header ปลอม operator ทีหลัง (ให้ทำต่อจากนี้เลย)"* (`DECISIONS.md` 17:0x)
- Depends on: REQ-111 committed (same files in caw-back). Team B's queue becomes REQ-111 → **REQ-113** → REQ-105 → REQ-112 `[PM-decided: "ทำต่อจากนี้เลย"]`
- Team: **B (CAW)** — the worker command policy. Blueprint's API is reached only from CAW's runner box, so the block sits on CAW's side; no seam change.

## Problem / Goal

QA found (TEST-108 Q1) that since REQ-111 opened `curl`/`wget` to `127.0.0.1`, a worker can call CAW's API with
`X-CAW-Actor: operator` and Blueprint's API with any `X-Blueprint-By`. It can raise its own run budget, accept its own proposals,
change the team's folders, and label or rewrite the spec. The worker's legitimate CAW actions already go through its MCP tools,
so it never needs these direct calls.

## Requirement

1. A worker's command cannot reach CAW's API port or Blueprint's API port (whatever ports are configured).
2. A worker's command cannot carry an `X-CAW-Actor` or `X-Blueprint-By` header.
3. `127.0.0.1` stays open for what the worker itself builds and runs (e.g. a dashboard on its own port).
4. A refused call gets REQ-111's soft refusal (the hop goes on) with a reason the worker understands.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a worker **When** it runs each of TEST-108 Q1's four calls (CAW mode/budget, accept proposal, workspace roots, Blueprint versions/change-sets) **Then** each is refused with a reason, and the hop continues.
  - Check: QA, real hook + stub runner.
- [ ] **AC-2** — **Given** a worker that started its own server on a free port **When** it `curl`s that port **Then** the call works.
  - Check: QA.
- [ ] **AC-3** — **Given** the ports are changed by env (e.g. CAW API on 4510) **When** the worker targets the new port **Then** it is still refused.
  - Check: QA.
- [ ] **AC-5** (added 2026-10-29 by the PM, TEST-109 DEF-1) — **Given** a worker **When** it writes the API port in another form (leading zeros `04500`, the name `localhost`, `[::1]`, `0.0.0.0`, the box's own hostname) **or** passes the header another way (`-H @file`, a curl config file `-K`, an env var expanded in the command) **Then** the call is still refused. The SA may meet this with an allow-list instead (only ports the worker itself started, or that its project declares) rather than a longer block-list; the PM's ask is the outcome, not the method.
  - Check: QA, TEST-109's bypass set plus its own variations; real curl against QA's echo server.
- [ ] **AC-4** (regression) — REQ-111's AC-1…AC-5 still pass; MCP tool actions still work.
  - Check: QA.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| refusal reason (fits REQ-111's sentence) | worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน | A worker can't call the CAW or Blueprint API directly — use CAW's tools instead |

## Constraints

- No login yet (owner 10:51: later). This REQ closes the worker-side path only; the APIs still trust their headers from anyone else on the box.
- Per-topic commit: `Depends on: REQ-111 committed (<hash>)`.

## Out of Scope

- Real authentication on the APIs (REQ-109 / later). · A program a worker writes and runs reaching the API (word-level check limit, REQ-111 Q4 → REQ-109).

## Questions

_(none yet)_

## AC check
(The SA B, Silver, 2026-10-29 17:1x — against the deliverable, before QA.)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 the four calls refused, hop continues | `caw-back → src/runner/bash-policy.ts` (`api` by header + by port), `read-guard.ts` 3rd arg, `hop.ts` soft refusal + REQ-113 wording; the four calls through the real hook → `caw-refused api`, exit 2 (TASK-125 DoD 2); fixture hop → `commented` | yes |
| AC-2 own port works | `curl http://127.0.0.1:3900/` → exit 0 (DoD 3); `localhost:5173` → allowed (my probe) | yes |
| AC-3 changed ports still refused | ports from `CAW_API_URL` / `BLUEPRINT_URL` / `BLUEPRINT_WEB_URL` (`config.ts` `serverPortsOf`), tests for overrides (`config.test.ts`) | yes |
| AC-4 regression | suite 835/1/1 (known execPath fail, round 3), REQ-111's tests unchanged in result; MCP tools untouched | yes |
| AC-5 other port forms / header sources (added 17:2x, TEST-109 DEF-1) | `bash-policy.ts` D6 (port must be a plain number, compared as a number: `04500`, `004500`, `99999` → refused), D7 (`-H @file` in every form, `--variable`, `--expand-*`, wget `--config` → refused), D8 (`--connect-to`, `--resolve`, sockets/proxies → refused); other spellings of this machine (`0.0.0.0`, `127.1`, the box's hostname) → `network`; `$` (env) refused by the tokenizer. [restored by the SA 2026-10-29 17:5x; the corrupted copy stays in archive/REQ-113-corrupted-copy-2026-10-29.md] My probe + QA's harness 34/34 (TASK-125 § Review round 3) | yes |

## Verification (by QA)

Build: caw-back 80e3e88 + Team B's tree (fp `54269c3053be`). Detail: `tests/TEST-109-caw-workers-cannot-act-as-operator.md`.

| AC / req | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS as written | Q1's calls refused `api` at the real hook, plus 20 other spellings; on the runner the refusal is soft with REQ-113's reason |
| AC-2 | PASS | own ports 3900 / 5173 allowed |
| AC-3 | PASS | moved ports refused (incl. `localhost:4210`); the runner writes the env ports into the hook |
| AC-4 | PASS | 48-case R-19 unchanged; caw-back 826/1/1 (known fail) |
| req 1 + 2 | round 1 FAIL (DEF-1) → **round 2 PASS** | DEF-1's command and 40 variations (ports, hosts, header sources, hidden URLs, `--connect-to` / `--resolve` / proxies / sockets) refused at the real hook (fp `9ca932a8dab7`) |
| AC-5 | PASS (round 2) | every form AC-5 lists, plus QA's own variations, refused |
| DEF-2 | MINOR, open | `curl --json …` to the worker's own port is refused (`-d` works) |
