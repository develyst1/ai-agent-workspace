# REQ-116: Blueprint's URL catcher reads a Thai-written address correctly
- Status: **DELIVERED + COMMITTED** (2026-10-30 15:5x — blueprint-back f10f8cb, pushed, PM verified) · DELIVERED (2026-10-30 15:3x, the PM — QA's TEST_PASSED; TEST-114 Q1/Q2 defaults accepted) · was TEST_PASSED (2026-10-30 15:17, QA Tanya — AC-1…AC-3; tested tree blueprint-back ccd32af+`329169c658bb`; Q1/Q2 non-blocking; `tests/TEST-114-blueprint-url-catcher-edges.md`) · was SPEC_DONE (2026-10-30 14:5x, Sober — TASK-142 DONE, § AC check) · was IN_SPEC (2026-10-30 13:2x, Sober — SPEC-113 → TASK-142 cut, ON HOLD behind TASK-117's commit) · was READY_FOR_SA (2026-10-30, the PM)
- Priority: MEDIUM `[PM-decided]` — Thai users often type a word right after a URL with no space. Team A takes it after TASK-117 (REQ-112), before REQ-115. Build order stays the SA's.
- Requested: 2026-10-30 by the PM, from QA's TEST-111 round 2 DEF-2 / DEF-3 (REQ-114 delivered with them open). Stamp `team-proposed` (defect route); decided under the owner's 08:40 standing order (`DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" 2026-10-30 13:1x).
- Deadline: none · Team: **A (Blueprint)**

## Problem / Goal

REQ-114 round 2 made Blueprint keep every URL the user wrote. QA found two edges (`tests/TEST-111-blueprint-stores-service-urls.md` § Round 2):
- **DEF-2:** Thai written right after a URL is taken as part of it — `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที` keeps `http://127.0.0.1:4500/healthทุก`.
- **DEF-3:** an address counts as already held when a part holds a longer address that starts with it — a part with `:31000` hides the user's `:3100`.

## Requirement

1. A URL ends where Thai text (or any non-URL character) starts; the kept address is exactly the URL.
2. An address counts as held only when a part holds that same address (same host, port and path), not one that merely starts with it.
3. REQ-114 behaviour stays (AC-1…AC-4).

## Acceptance Criteria

- [ ] **AC-1** — **Given** the message `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที` and no part holding it **When** the round runs (stub) **Then** `http://127.0.0.1:4500/health` is kept, exactly.
- [ ] **AC-2** — **Given** a part holding `http://127.0.0.1:31000` and the user's `http://127.0.0.1:3100` **When** the round runs (stub) **Then** `:3100` is kept.
- [ ] **AC-3** (regression) — REQ-114 AC-1, AC-3, AC-4 and TEST-111 round 2's edge cases still pass; suites green.
  - Check (all): QA, stub — no live call.

## User-facing wording

No new sentence.

## Out of Scope

- TEST-111 O-2 (the app's own address kept as an API part) — accepted as is; the user can edit or remove the part. · host:port without a scheme (TEST-111 Q1).

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## AC check (SA A — Sober, 2026-10-30 14:5x)

| AC | Where it is met (deliverable) | Self-checked |
|---|---|---|
| AC-1 | `blueprint-back → src/interview/round.ts` `URL_RE` (SPEC-113 E15, ASCII URL characters only). `test/interview/url-catcher.test.ts`: QA's exact message → api part `path` exactly `http://127.0.0.1:4500/health`, `url_kept` title the same; Thai on both sides (`ดูที่http://h.test:7/xแล้วนะ`) → `http://h.test:7/x` (TASK-142). | yes |
| AC-2 | `uncaughtUrls` held = same address (E16, set of `addressesIn`, no substring). Test: a part with `http://127.0.0.1:31000` + message `:3100` → `:3100` kept; also `…:9/api` does not hold `…:9`, `…:9/` does (TASK-142). | yes |
| AC-3 | REQ-114: `url-catcher.test.ts` 6 original tests unchanged and passing (AC-4 replay, timeout, retry, edges), `service-urls.test.ts` (AC-1) passing; `test/interview` 97/0, full suite 320/16/0, tsc 0, `openapi.json` unchanged → front untouched. | yes |

## Verification (by QA)

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที` → kept exactly `…/health`; Thai on both sides; query/fragment and percent-encoded paths whole. Q1: a raw Thai path is cut to its host |
| AC-2 | PASS | `:31000` no longer hides `:3100`; exact and trailing-slash holders count as held; a longer path does not hold its base. Q2: a query makes a different address |
| AC-3 | PASS | REQ-114 AC-1/AC-4 + TEST-111 round 2 edges (DEF-2/3 lines now OK); REQ-110 scripts 49 OK; bp-back 320/16/0; front check:api + 238/0 |
