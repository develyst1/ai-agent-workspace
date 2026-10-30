# REQ-112: A worker gets every spec rule its card needs, not only the rules on its anchor part

- Status: **DELIVERED + COMMITTED** (2026-10-30 15:1x — Team A: blueprint-back ccd32af · blueprint-front 09f2717; Team B: caw-back 58ab883 · caw-front 7ef4a1e; all pushed, PM verified) · DELIVERED (2026-10-30 14:5x, the PM — QA's TEST_PASSED round 2; O-5 accepted) · was TEST_PASSED (round 2, 2026-10-30 14:43, QA Tanya — AC-1…AC-5, DEF-1 closed live; tested trees bp-back 2da175e+`1d9eb523d5e1` · bp-front 15283e1+`461b90ce3887` · caw-back 67dfe55 · caw-front 7359fa3; TEST-112 § Round 2) · was SPEC_DONE round 2 (Team A side, 2026-10-30 14:2x, Sober — TASK-117 r2 DONE, § AC check round 2) · was IN_SPEC round 2 (2026-10-30 14:1x, Sober — SPEC-106 § REQ-112 addition Round 2 / E17 → TASK-117 round 2) · was TEST_FAILED (joint + live, 2026-10-30 14:1x, QA Tanya — AC-1…AC-4 as written PASS, AC-3 live: the team-built page re-checks every 10 s; DEF-1 MAJOR: a card anchored on a work gets no rules from its steps, which stopped the live team (req 1); `tests/TEST-112-caw-card-rules-coverage.md` § Joint + live run) · was SPEC_DONE (Team A side 2026-10-30 13:4x, Sober — TASK-117 + TASK-141 DONE, § AC check; Team B side committed caw-back 58ab883 / caw-front 7ef4a1e) → QA joint run · was READY_FOR_SA (2026-10-29, the PM)
- Priority: HIGH `[PM-decided]` — it is why the live-built dashboard missed spec point 3 (TEST-106 P1-9 → P1-10)
- Requested: 2026-10-29 by the PM, from QA's live finding (REQ-108 phase 1). Stamp `team-proposed` (defect route). Owner intent it rests on: `DECISIONS.md` 10:51 (a)/(b) (Blueprint is the store; CAW builds from it).
- Teams: **A** (what Blueprint's seam serves for a part, `blueprint-back → src/seam/context.ts`) and **B** (how CAW cuts cards and builds a worker's context). 🔴 **The seam is Team A's contract; any change goes through the PM**, as in REQ-105. Each SA first says which side the fix belongs on (Q1).

## Problem / Goal

In the live test, the builder's card was anchored to the screen part (SCR-001). It received only the decisions covering
that part ("ข้อความบนหน้าเป็นภาษาไทย"). The rules "เช็คใหม่ทุก 10 วินาที" and "3 วินาทีถือว่าไม่ตอบ" covered another part
(STEP-002). They never reached the builder (`card_context` in trace C-4 has no "10 วินาที"), so the dashboard never re-checks
by itself. (`tests/TEST-106-e2e-live-dashboard.md` P1-9, P1-10.) QA notes part of the linking came from its own workaround.
An interview could produce the same shape, though, and the entry worker's 2-card split also skipped STEP-002.

## Requirement

1. When a worker starts a card, its context includes every rule (decision) in the spec that bears on what the card builds.
   That means the rules on parts the card's work touches, not only the rules on the anchor part.
2. If the cut leaves a spec part with rules that no card covers, that is visible (on the board or in the entry worker's proposal), not silently dropped.

## Acceptance Criteria

- [ ] **AC-1** — **Given** the REQ-108 Health Board spec (as entered in TEST-106: rules on STEP-002, the card anchored on SCR-001) **When** the builder's card starts **Then** its context contains the 10-second and 3-second rules.
  - Check: QA, `card_context` for that card (stub run is enough).
- [ ] **AC-2** — **Given** a spec part with a rule that no card covers **When** the cards are cut **Then** the board (or the proposal) shows that part as not covered.
  - Check: QA.
- [ ] **AC-3** (live) — **Given** REQ-108 phase 2 **When** real workers build the Health Board **Then** the built page re-checks by itself every 10 s (spec point 3).
  - Check: QA, in REQ-108 phase 2.
- [ ] **AC-4** (regression) — a card's context for a part with no extra rules is unchanged; seam calls in use still behave as before; both teams' suites pass.
  - Check: QA.
- [ ] **AC-5** (added 2026-10-30 14:2x, round 2 — TEST-112 DEF-1) — **Given** the Health Board spec (WRK-001 `has_step` STEP-001…003; DEC-001…003 on STEP-002) **When** a card anchored on **WRK-001** starts **Then** its context contains DEC-001, DEC-002 and DEC-003 (the rules on the work's own steps).
  - Check: QA, `card_context` (stub or real Blueprint) — no live hop needed. `[PM-decided]` — req 1 already says "parts the card's work touches"; a work touches its own steps.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| uncovered part on the board/proposal | ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป: {ชื่อส่วน} | No card covers this spec part yet: {part} |

## Constraints

- Per-topic commits: TASKs carry `Depends on: REQ-103 committed (<hash>)` / `REQ-104 committed (<hash>)` as their repo needs.
- Stub CLI for AC-1/2; live runs allowed (log each); no gateway.

## Out of Scope

- The interview producing better part links (REQ-110 covers storing; better linking is a later topic if needed).

## Questions

- **Q1 (PM → SA A and SA B, each answers for its own side — does not block design)** — where should the fix live: Blueprint's `partContext` serving the rules of related parts, CAW gathering context from more parts per card, or the entry worker's cut? Each SA says what its side can do and at what size; the PM decides and routes any seam change.
  > answer (SA A — Sober, 2026-10-29 15:0x, Blueprint side only):
  > - **The facts (read, not inferred):**
  >   - In TEST-106's spec, SCR-001 takes part in interactions under STEP-001, STEP-002 and STEP-003 (`tests/harness/test-106/step2-changeset.mjs:31,34,37`). So `partContext(SCR-001)` already returns WRK-001's flow with `at = [STEP-001, STEP-002, STEP-003]` (`blueprint-back → src/seam/context.ts`, the climb).
  >   - But its `decisions` holds only the decisions that cover SCR-001 itself, i.e. DEC-005 (`context.ts`: `to("covers", key)`).
  >   - The 10 s and 3 s rules (DEC-001…003) cover STEP-002, and DEC-004/006 cover WRK-001 (`step2-changeset.mjs:45-46`). Each is one hop along a path Blueprint already walks for `flows`.
  > - **What Blueprint can do (size S, my guess):** add one field to the part context, `relatedDecisions: [{ "via": "<key>", "decision": Part }]`. It holds every decision covering a step in the part's `flows[].at`, or a work in its `flows`, minus those already in `decisions`, de-duplicated and sorted by key.
  >   - `decisions` itself is unchanged, so AC-4's "unchanged for a part with no extra rules" holds: the new field is `[]` there.
  >   - It's additive in both the v1 versioned context and SPEC-106's v2 context. For TEST-106's shape it carries all five missing rules, so **AC-1 is met if CAW passes the field to the worker**.
  >   - Cap: 50 entries, with `relatedDecisionsMore: true` past that, so a huge spec can't flood a card.
  > - **What Blueprint can't do:** AC-2, the parts no card covers. That's the cut, CAW's side. A part that is on no path from the anchor (no shared step or work) also gets nothing from this; only the cut can catch it.
  > - **My recommendation:** do both. Blueprint's `relatedDecisions` (S, Team A) fixes AC-1 for anything linked through a flow. CAW's cut check (Team B's size) covers AC-2 and the unlinked rest. CAW must read the new field, so Team B confirms it accepts an additive field (as it did for the `requirement` kind, REQ-103 Q5).
  > - **Build:** after REQ-103 + REQ-110 are committed in blueprint-back. It touches `context.ts`, as SPEC-106 does, so it is either folded into SPEC-106/TASK-113 or cut after it, as the PM prefers. Default: fold into SPEC-106, one seam change, one Team B handover.
  > PM decision on Team A's side (2026-10-29 `[PM-decided]`): **yes to `relatedDecisions`** as described (additive, capped at 50). **Contract:** write it into SPEC-106's "Seam contract" as a clearly labelled REQ-112 addition, so Team B gets one contract document. **Build: its own TASK and its own commit**, cut after TASK-113 (REQ-105). Not folded into TASK-113: one TASK per topic keeps the owner's one-commit-per-topic rule (`DECISIONS.md` 12:41, `PROTOCOL.md` § Repo layout). The whole fix waits for SA B's answer on CAW's side (reads the field + AC-2 cut check).
  > answer (SA B — Silver, 2026-10-29 15:1x, CAW side only):
  > - **Reads the field: yes, with no CAW code change.** CAW passes Blueprint's part context through unread. `cardContext` returns
  >   `spec` = the seam body as returned (`caw-back → src/cards/service.ts:92,96-99`), and the route types it as `z.unknown()`, so nothing
  >   is stripped (`src/http/routes/cards.ts:29`). The worker gets it from MCP `card_context` (`src/mcp/server.ts:73-77`). REQ-105's
  >   pin and cache keep the body whole too (SPEC-107 D4/D5: the v2 body "as returned"). So `relatedDecisions` reaches the worker the day
  >   TASK-117 ships. **Additive field accepted.**
  > - **One small change I recommend (XS):** the worker prompt (`src/runner/prompt.ts:17`) says only "call `card_context` first". Add one
  >   line: "follow every rule in `spec.decisions` and `spec.relatedDecisions`". Also add the field to `card_context`'s MCP description.
  >   Not proven necessary — `inferred`: a haiku worker skimming a long JSON is the risk. The AC-1 stub check passes without it; AC-3 (live)
  >   is where it would show.
  > - **AC-2 (a part with rules that no card covers) is CAW's: size M.** Rule: a decision is covered when it is in some work card's anchor
  >   context, in `decisions` or `relatedDecisions`. Every uncovered decision's covered parts are listed with your sentence
  >   "ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป: {part}". It needs the whole spec's decision list → REQ-105's v2 `GET …/spec` read and its
  >   `spec_parts` cache (TASK-114), plus `relatedDecisions` (TASK-117). **Default: show it in both places** — on the open proposal
  >   (counted against its items' anchors, so the operator sees the gap before accepting) and on the board (against the cards). Board only is S
  >   and catches it only after accepting.
  > - **What CAW cannot do:** make a rule reach a card through a part linked to the anchor by nothing. Only the AC-2 list shows those.
  > - **Order:** after REQ-105 (B) is committed (needs TASK-114's v2 read) and after TASK-117 (Team A) ships. CAW's TASKs here = the prompt line (XS)
  >   + the AC-2 check (M, back + front). I cut them when the PM says go. Shared files with REQ-111 (`cards/view.ts`) → also after REQ-111's commit.
  > PM decision on Team B's side (2026-10-29 `[PM-decided]`): **yes to the prompt line** (XS; cheap insurance for a weaker model) and the MCP description. **AC-2 in both places** (proposal + board): the point is to see a gap before work starts. **Go:** cut the TASKs now; they carry `Depends on: REQ-111 committed`, `REQ-105 committed` and `TASK-117 shipped`, per your order. Team B order = REQ-111 → REQ-105 → REQ-112.
- **Note (SA B → PM, for QA's CAW-side run, 2026-10-30 10:2x)** — Team B's TASK-121/122 are DONE (uncommitted, on caw-back 27cbd1b / caw-front 4a071bc). The stand-in `tests/harness/stand-in-blueprint-105.ts` now has the REQ-112 knobs (header = usage): `snapshot`, `decisionsOn`, `related`, and two presets — `req112` (TEST-106's shape: DEC-001…003 cover STEP-002, DEC-005 covers SCR-001, no `relatedDecisions`) and `req112-related` (SCR-001's context also carries DEC-001…003). SA ran it with the real caw-back API (pglite memory, port 4531), one card on SCR-001: `req112` → `GET …/coverage` = `{"revision":2,"uncovered":[{"key":"STEP-002",…,"decisions":["DEC-001","DEC-002","DEC-003"]}]}`; `req112-related` → `{"revision":3,"uncovered":[]}`. Both servers stopped by pid, ports free. Synthetic — the real `relatedDecisions` is Team A's TASK-117 (AC-1 live proof). — Silver
- **Note (SA B → PM, CAW vs the REAL TASK-117, 2026-10-30 13:4x) — no difference.** Static: blueprint-back's emitted `SpecPartContext` and `PartContext` both require `relatedDecisions: [{ via: string, decision: Part }]` + `relatedDecisionsMore: boolean` (`blueprint-back → src/http/routes/seam.ts:32-33`) = what CAW reads (`caw-back → src/projects/coverage.ts:49`, `relatedDecisions[].decision` key) and what the stand-in fakes. caw-front reads no `relatedDecisions` (`grep -rln relatedDecisions caw-front/src` → none), so nothing on the front. Live: `tests/harness/seam-smoke-105.mjs` step 8 (added) — real blueprint-back 2da175e + Team A's 5 uncommitted paths (read only) and caw-back 67dfe55, both in-memory, gateway → dead port, no runner: Blueprint gets DEC-001 covering STEP-006 (a step card 1's screen SCR-001 takes part in) and DEC-002 covering STEP-002 (no card's) → CAW's card context carries `relatedDecisions [{"via":"STEP-006","decision":"DEC-001"}]`, `more false`; `GET …/coverage` → `uncovered [{"key":"STEP-002","decisions":["DEC-002"]}]` (DEC-001 covered via related). **ALL OK 15/15** (REQ-105 steps 1–7 too). No notify failures; stopped by pid; ports free; repos untouched. Ready for QA's joint run. — Silver

## AC check (SA A — Sober, Team A side, 2026-10-30 13:4x)

Team A's half is TASK-117 (blueprint-back, `relatedDecisions`) + TASK-141 (blueprint-front `gen:api`). Team B's rows (CAW's prompt line, MCP description, AC-2 cut check) are SA B's.

| AC | Where it is met (Team A deliverable) | Self-checked |
|---|---|---|
| AC-1 | `blueprint-back → src/seam/context.ts` `contextIn` adds `relatedDecisions` (decisions covering the part's flow steps/works, minus own, via = lowest key, cap 50) on v1 and v2 part context. `test/seam/related-decisions.test.ts`, TEST-106's shape: SCR-001 → `decisions` [DEC-005], `relatedDecisions` DEC-001/002/003 via STEP-002 + DEC-004/006 via WRK-001, v1 and v2 (my re-run, seam 56/0). The card's context carrying them is CAW's half (QA's stand-in PASS) → joint run on the real field. | yes (Blueprint side); joint → QA |
| AC-2 | — Team B (CAW's cut check). No Team A work. | n/a |
| AC-3 | live, REQ-108 phase 2. | no — live only |
| AC-4 | `decisions` and every other field unchanged; a part with nothing related → `relatedDecisions: []`, `relatedDecisionsMore: false` (test). `test/seam/context.test.ts` untouched, passes. back full suite 313/16/0, tsc 0 (TASK-117). front `check:api` matches, 238/0, typecheck 0 (TASK-141). | yes |

**Round 2 (SA A — Sober, 2026-10-30 14:2x):**

| AC | Where it is met (Team A deliverable) | Self-checked |
|---|---|---|
| AC-5 | SPEC-106 E17: a work anchor also touches its own steps (`src/seam/context.ts` `contextIn`, `namedSteps`). `test/seam/related-decisions.test.ts`, TEST-106's spec: **WRK-001** → `decisions` [DEC-004, DEC-006], `relatedDecisions` DEC-001/002/003 via STEP-002, v1 = v2 (TASK-117 r2; my re-run seam 59/0). That the live card on the work reads them is CAW's, unchanged, so it goes to the QA re-run. | yes (Blueprint side) |
| AC-1 | Unchanged: SCR-001 → DEC-001/002/003 via STEP-002, DEC-004/006 via WRK-001 (round-1 test untouched + a pinning test). | yes |
| AC-4 | No contract change (`openapi.json` same as round 1), front untouched (TASK-141 stands), back 316/16/0 (Jason), tsc 0. | yes |

## Verification (by QA)

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | CAW side PASS (stand-in) · real field NOT_TESTED | prompt line + MCP description name `spec.relatedDecisions`; with QA's stand-in sending the field (SPEC-106's rule, TEST-106's spec) the builder's card context carries DEC-002 (10 วินาที) and DEC-003 (3 วินาที) via STEP-002, passed through whole. Blueprint's real field = TASK-117 |
| AC-2 | PASS (stand-in) | one card on SCR-001: proposal block and board both show "ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป:" for STEP-002 and WRK-001, keys linked; accept not blocked; with the field on → none shown. O-1: the coverage memo stays stale until the spec revision moves (TEST-112) |
| AC-3 | **PASS (live, 2026-10-30 14:0x)** | real `claude` team via the screens; the builder card (#3, SCR-001) read the 10 s rule through Blueprint's real `relatedDecisions`; the page it built, run per its README on :3900, called `/api/health` at 0/10/20/30 s with no click, times moved |
| **Joint + live** (14:1x; bp-back 2da175e+`15fbcda12f05`, bp-front 15283e1+`461b90ce3887`, caw 67dfe55 / 7359fa3) | AC-1 real field PASS · AC-2 joint coverage `[]` · AC-4 suites green (bp-back 313/16/0, caw-back 874/1/1 known, fronts 238 / 346) · **DEF-1 MAJOR** | a card on WRK-001 gets `relatedDecisions []` — the SA on it asked live for the 4 services DEC-001 lists and the team stopped (req 1) |
| AC-4 | PASS | DATA-001 context unchanged but for `relatedDecisions []`; Blueprint down → 502, board fine; caw-back 872/1/1 (known execPath), caw-front 346/0 + e2e 273 |

Build: caw-back 27cbd1b + fp `731120f9b2fa` · caw-front 4a071bc + fp `78fc858510bf`. Detail: `tests/TEST-112-caw-card-rules-coverage.md`.
| **Round 2** (14:43) | AC-5 **PASS** · DEF-1 closed **live** · AC-4 PASS | WRK-001 card → DEC-001…003 via STEP-002 on the real field; one opus SA hop on a WRK-001 card planned with all the rules, no question; 17/23 part contexts identical to round 1, the rest per E17 (+ O-5); bp-back 316/16/0, front `check:api` matches |
