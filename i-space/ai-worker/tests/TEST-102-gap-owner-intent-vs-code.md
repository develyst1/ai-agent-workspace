# TEST-102: Gap report — the owner's intent vs today's code
- Teams: A (Blueprint, SA Sober) · B (CAW, SA Silver) · no TASKs (each SA wrote its report alone, read-only)
- Source REQ: REQ-102 (ACs tested: AC-1, AC-2, AC-3, AC-3b, AC-4, AC-5, AC-6)
- Status: **TEST_PASSED** (round 2, 2026-10-29 12:02, Tanya), after DEF-1 was fixed by both SAs. Round 1 (11:58) was TEST_FAILED on AC-5. See § Verdict.
- Under test: `maps/blueprint-gap-102.md` (Team A) · `maps/caw-gap-102.md` (Team B), against the four repos on `atom` at f60b934 / e46322a / 102a130 / 4b58bf3
- Surfaces: code read + shell (`sed -n`, `grep`, `git`). The ACs ask whether each citation says what the line claims, so reading is the right instrument here; nothing needed running.
- Designed and tested: 2026-10-29 11:52–11:58 by Tanya

## Scope

- The deliverable is two short reports. The check per AC: (1) every cited `file:line` says what its line claims, (2) the marks and sizes the AC asks for are present, (3) the two sides of point b fit together.
- **Not judged:** whether a fits/differs mark is the *right* reading of the owner's words. Those readings are the owner's (REQ-102 Q1, Q2, Q-A1…A3, Q-B1…B4). They were answered 2026-10-29 11:41, "all defaults accepted" (`DECISIONS.md`). Not judged either: whether an S/M/L guess is right; it is the SA's guess by design.

## Instrument limits

- Code reading proves that a cited line says X. It does not prove that the running product does X. The ACs ask only for the first. Where TEST-101 already ran the same behaviour (the seam, the push, `/start`), I say so.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-1: point a, three sub-claims present and marked | happy | read Team A § Point a | where edited/added · how versions are made · audit who/when/what, each marked with `file:line` | a1–a7 cover all three (a1–a3 where, a4 versions, a5–a7 audit what/when/who). Each is marked, each is cited | PASS |
| 2 | AC-1: citations real | negative | `sed -n` on every cited line of a1–a7 (both Blueprint repos) | each says what its line claims | all match. Extra check of a2: `grep` shows blueprint-front never calls `POST …/change-sets` (only GET `chat/load.ts:186` and undo `chat/actions.ts:66`), so "no screen calls it" holds. Nit: a7 lists cause kinds "operator / message / source / undo", but `spec/types.ts:88-91` has only three. `undo` is written separately at `spec/store.ts:326`. The claim is still true | PASS |
| 3 | AC-2: side by side, per call | happy | Team A b1–b8 vs Team B b1–b6 | the two agree, or the disagreement is listed | agree on every fact: getVersion, partContext and versionsAfter are tied to a confirmed version on both sides · locate uses the latest confirmed version (A b5), and CAW sends no version (B b1) · amend writes chat only (A b6), and CAW sends no version (B b1) · the push only on `version.confirmed`: A b7 = B b3 (`follow.ts:11` literal) · the front link and `/start` both need `version=<n>` (A b8 = B b4). **One difference in marking: G-F1** (§ Observations) | PASS |
| 4 | AC-2: CAW side has per-call + push + when | happy | Team B b1–b6 | per call, plus `/v1/notify` | b1 per call; b3 the push and the 30 s timer pull (`index.ts:23-24` = 30_000, checked) | PASS |
| 5 | AC-3: point c lines | happy | Team B c1–c6 | how the CLI starts · team → sessions · where it runs · gateway use, each marked | c1 partly · c2 "depends on Q2" (see note) · c3 partly · c4 partly · c5 fits · c6 fits. **Note:** c2 is not one of the three marks. REQ-102 Q2 told both SAs to "report what the code does; do not pick", and c2 reports both readings with evidence. I read that as meeting the AC: `Interpreted REQ-102 Q2 as allowing c2's "depends" mark`, cheap to reverse | PASS |
| 6 | AC-3: citations real | negative | `sed -n` on every c-line cite | each says what it claims | all match: `-p` per hop `hop.ts:141`, `--no-session-persistence` `:154`, launch `main.ts:116-134`, one hop per project `plan.ts:20`, no auth `actor.ts:3`, `config.ts:30-32,42`, limit `stream.ts`. **Nit (c5):** the report says its grep returns "only sample folder paths in `mock.ts:267-268`". My same grep also returns test and fixture lines (`runner/api.test.ts:60` "Bad gateway", `hop.test.ts:346` `ANTHROPIC_API_KEY` in a redaction test, `fixtures/*.stream.jsonl`). None is a gateway call, so the conclusion "fits" holds | PASS |
| 7 | AC-3b: point d lines | happy | Team B d1–d3 | per-worker screen · output captured/streamed · what a user sees now, each marked | d1 partly · d2 differs · d3 partly | PASS |
| 8 | AC-3b: citations real | negative | `sed -n` on every d-line cite (both CAW repos) | each says what it claims | all match: heartbeat only, `HEARTBEAT_MS = 30_000` (`hop.ts:76`, checked); `hop.heartbeat {hopId}` `events.ts:84`; `hop.finished` note `:92`; trace stays on the runner's machine, "never sent anywhere" `trace.ts:1-2`; `quietMinutes` `crew.ts:125-133`; 3 s refresh `LiveRefresh.tsx:2`. **Nit:** d1's `CrewStrip.tsx:10` is an import line (`quietMinutes`, `SeatState`). It supports the claim only weakly | PASS |
| 9 | AC-4: every Blueprint gateway caller listed | happy | `grep -rn -E '\b\w*[gG]ateway\w*\??\.(chat|listModels)\('` in blueprint-back `src/`, outside `src/gateway/`; `grep createGateway(`; blueprint-front checked for direct gateway calls | the grep's set = g1–g4 | grep = exactly 4: `interview/round.ts:359` (g1), `quiz/answer.ts:57` (g2), `http/routes/models.ts:24` (g3), `projects/service.ts:157` (g4). The gateway is built only at `app.ts:22`. blueprint-front: no gateway URL or call. Not marked fits/differs, as the AC says | PASS |
| 10 | AC-5: every partly/differs line has a sentence + an S/M/L | negative | count | all present | **Team A 10/11:** a2 M · a4 M · a5 S–M · a7 L/M · b2 M · b3 M · b4 S · b5 S · b7 S · b8 S. **a3 — no size** ("Size unknown until answered"). **Team B 10/12:** b1 M · b2 M · b3 S · b4 S · b6 S · c1 L · c3 M · c4 M · d1 M · d2 L. **b5 — no size** ("same change as b1/b2"). **d3 — no size** ("follows from d2; then the view in d1"). (c2 carries sizes, L / see c1.) | Round 1: **FAIL** (3 lines) |
| 10b | AC-5 re-check after the DEF-1 fix (round 2, 12:02) | regression | re-read a3, CAW b5, CAW d3; scan the size cell of **every** partly/differs row in both reports, not only the three | 23/23 sized | a3 now has a sentence + **S** ("add a `requirement` part kind… **S**", after Q-A1). Its new citation is checked: `registry.ts` `PART_KIND_NAMES` = work step interaction role screen api system data decision question contradiction, no requirement kind (run with `bun`). CAW b5 **S** ("on its own — the work is counted in b1/b2's M"), d3 **S** ("on its own — counted in d2's L and d1's M"). Scan: Team A 11/11 and Team B 12/12 rows carry a size, the same row set as round 1, so nothing else moved. Repos still at baseline, 0 tracked changes | PASS |
| 11 | AC-6: repos unchanged | regression | per repo: branch, `git log -1`, `git status --porcelain` (11:53) | `atom`, baseline HEAD, nothing tracked changed | all four `atom` at f60b934 / e46322a / 102a130 / 4b58bf3, 0 tracked changes | PASS |
| 12 | AC-6: no live call or run | negative | the teams' own evidence: Team A report l.5 "Nothing was run"; Team B l.4 "no run of the runner, no live Claude CLI, no gateway call"; no TASK was cut for REQ-102; today's log | none | no run is recorded or claimed by either team. QA ran nothing either (read-only round) | PASS |

## Defects

### DEF-1 — three "partly" lines have no S/M/L size — MINOR — **FIXED, re-tested PASS 2026-10-29 12:02 (#10b)**
- Build: `maps/blueprint-gap-102.md`, `maps/caw-gap-102.md` as of 2026-10-29 11:52.
- Repro: open each report and find the line in the size column of § Point a (A) / § Point b and § Point d (B).
  1. Team A **a3** (partly): "Open: … → **Q-A1** below. Size unknown until answered."
  2. Team B **b5** (partly): "keep the fields as tags; stop using them to pick content (same change as b1/b2)".
  3. Team B **d3** (partly): "follows from d2; then the view in d1".
- Expected: REQ-102 AC-5. Each partly/differs line has one sentence on what would change and an S/M/L guess labelled as the SA's. *"A missing sentence or size fails the line."*
- Actual: a sentence is there in b5 and d3, and a3 has a question instead of a sentence. **None of the three has an S, M or L.**
- Frequency: always (static text).
- Context, not an excuse: a3's size waited on Q-A1, which the owner answered at 11:41 (defaults accepted). b5 and d3 point at sizes given on other lines. Each fix is a few words.
- Linked case: #10.

## Observations (not ours)

- **G-F1 (AC-2) — the two teams mark getProject differently.** Team A b1 marks getProject **fits**:
  it serves the latest draft. Team B b1 shows that CAW uses getProject for `project.name` only
  (`caw-back → src/blueprint/client.ts:62-65`), so no spec content reaches CAW through it today.
  Both facts are right. A reader of Team A's table alone could think CAW already sees the latest
  spec through one call; it does not. TEST-101 S-F4 found the same.
- Nits that do not change any verdict: a7's cause-kind list (#2) · c5's grep description (#6) · d1's import-line citation (#8).
- **Already shown by running, in TEST-101:** the push only on confirm and CAW's version moving after it (TEST-101 #14b), and `/start` needing a version (#18). This round needed no new run.

## Test data created

| What | Where | End state |
|---|---|---|
| none — read-only round | — | — |

## Verdict

**Round 2 (2026-10-29 12:02): `TEST_PASSED`.** All 7 ACs pass. AC-5 now holds on all 23
partly/differs lines (#10b).

Round 1 (11:58), kept as history: `TEST_FAILED`. AC-5 failed on three lines (DEF-1, MINOR): a3,
CAW b5 and CAW d3 lacked the S/M/L the AC requires.
**PASS:** AC-1, AC-2 (one marking difference listed, G-F1), AC-3 (c2's "depends" read as REQ Q2
asked), AC-3b, AC-4 (my grep = their list, 4/4) and AC-6.
NOT_TESTED: none. Every cited line was opened. Nothing in this REQ needed a run.

DEF-1 was routed by the PM and fixed by both SAs (inbox 11:56). No acceptance in writing was needed.

## Evidence (decisive)

- The two reports' size columns at a3, b5, d3 — the three lines that fail AC-5.
- The gateway grep in #9: four callers, which equals g1–g4.
- `git status --porcelain` empty × 4 at 11:53 — AC-6.

## Questions

(none — the one interpretation, c2, is recorded in #5 and is cheap to reverse)
