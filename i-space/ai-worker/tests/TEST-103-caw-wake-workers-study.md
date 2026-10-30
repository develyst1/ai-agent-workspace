# TEST-103: CAW wake/feed study — citations and clean repos
- Team: B (CAW, SA Silver) · no TASKs (the SA wrote the study alone, read-only)
- Source REQ: REQ-107 (ACs tested: **AC-1 citations, AC-4** — the PM's routing 2026-10-29 12:33. AC-1's content, AC-2 and AC-3 are the PM's checks)
- Status: **TEST_PASSED** (2026-10-29 12:36, Tanya)
- Under test: `maps/caw-wake-107.md` against `caw-back` on `atom` @ 102a130
- Surfaces: code read + shell (`sed -n`, `grep`, `git`). AC-1 asks whether the citations say what the study claims, so reading is the instrument.
- Numbered TEST-103 (TEST ids run per type from 101; REQ-107 is its source)

## Instrument limits

- Reading a cited line proves the line says X. It does not prove the CLI behaves as an option
  needs. The study itself names those proofs as live-run items (§ "What needs a live run"). They
  are not QA's to run without the owner's word, and they are not part of AC-1.
- To check the CLI flags the study names, I **searched the installed binary's file** for their
  text (`grep -a -c`). I did not execute `claude`. That proves the strings are in the binary, not
  that the flags behave as described.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-1: each claim about today's code cites `caw-back → file:line`, and each cite says what it claims | happy | `sed -n` on every cite: hop.ts:62-74, 65, 127-130, 141, 154, 259-263, 269, 276-281, 294-301 · procs.ts:1-6 · config.ts:43 · main.ts:285-290 · plan.ts:35-61, 56-60 · stream.ts:1-9, 93 · mcp/server.ts:6 · e2e/fake-claude.ts exists | each matches | all match: own process group `detached: true` (hop.ts:64-65), **`stdin: "ignore"`** (:65), MCP hop id only in the spawn env (:127-130, server.ts:6), per-hop settings + read fence (:259-263), hop cap timer (:276-281), heartbeat inside the stream reader (:294-296), `pollMs` default 2000 (config.ts:43), `result` event parsed (stream.ts:93). **Nit:** Option B says the planner "checks one per project" and cites plan.ts:56-60. That range dedups card × worker per run; the one-hop-per-project check is `plan.ts:20` / `:48` (`hopRunning`, seen in TEST-102). The point Option B needs (nothing limits a worker to one hop at a time) holds | PASS |
| 2 | AC-1: options have pros, cons, failure mode, size | happy | read A, B, C | all four parts each | A: pros, cons, "what breaks it", **M** · B: same, **S** · C: same, **L** · plus one rejected option with its reason | PASS |
| 3 | AC-1: the CLI flags the study relies on exist | boundary | `grep -a -c -F` in `~/.local/share/claude/versions/2.1.312` (file read only, not executed) | strings present | `--input-format` 15 · `"stream-json"` 28 · `--resume` 105 · `--session-id` 31 · `--no-session-persistence` 11 · "realtime streaming input" 2. Present. Whether a `-p --input-format stream-json` process takes a **second** task on the same stdin is unproven; the study lists it as live proof (1) | PASS (strings only) |
| 4 | AC-4: no code change | regression | per repo: branch, `git log -1`, `git status --porcelain` (12:33) | `atom`, baseline HEAD, nothing tracked changed | caw-back 102a130 · caw-front 4b58bf3 (and Blueprint f60b934 · e46322a) — 0 tracked changes in all four | PASS |
| 5 | AC-4: no live Claude CLI run | negative | the study's own statement (l.4), today's log, `pgrep` for a runner or `claude -p` | none | no runner and no `claude -p` process running at 12:33. The study says the SA ran **`claude --help`** (help text, "no model call, no quota"). I count that as not a live run: it opens no session and spends no quota, which is the reason the rule exists (`PROTOCOL.md` § Hard boundaries). `Interpreted REQ-107 AC-4 "no live Claude CLI run" as "no session / no quota spent"`, cheap to reverse: Q1 | PASS |

### Round 2 — REQ-107 Q2 follow-up section (2026-10-29 12:42, PM's routing 12:41)

| # | Case | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 6 | Q2 section "Won't option A forget?": its caw-back citations say what it claims | happy | `sed -n` on prompt.ts:11-22, 30-45 · cards/service.ts:90-104 · hop.ts:153 · events.ts:92 | each matches | all match. The prompt names only the card and says "Call the MCP tool `card_context` first" (prompt.ts:17), then "end with exactly one of `comment`, `hand_off`, `set_status`, `ask_operator`" (:18). `cardContext` returns card, spec, notes, answered decisions and the code map (service.ts:90, 98-103). Skills go into the system prompt as a file (hop.ts:153 `--append-system-prompt-file`; built by `loadSkills` prompt.ts:30-38). `hop.finished` carries `tokensIn` / `tokensOut` (events.ts:92). **Precision note:** `card_context` reads the spec at the card's `anchorVersion` (service.ts:96), not the newest one. That fits item 4 ("a task keeps its spec") and REQ-102 b2, and does not weaken the section's point | PASS |
| 7 | AC-4 still holds | regression | caw-back `git status --porcelain`, `git log -1` (12:42) | clean, 102a130 | 0 tracked changes, 102a130 | PASS |

## Defects

None.

## Observations (not ours)

- The plan.ts nit in #1 (wording, no effect on the recommendation).
- The study's live-proof list (4 items) is exactly what a later REQ-106 test would need. QA will
  design from it when that REQ arrives.

## Test data created

| What | Where | End state |
|---|---|---|
| none — read-only round | — | — |

## Verdict

**`TEST_PASSED`** for the two checks routed to QA. AC-1's citations all match (one wording nit)
and the named flags are in the installed binary. AC-4 holds: four repos clean and no live session.
AC-2, AC-3 and AC-1's content judgement are the PM's.
NOT_TESTED: whether the flags *behave* as Option A needs. That needs a live run (owner's word),
as the study itself says.

## Evidence (decisive)

- #1 `sed -n` output: `hop.ts:65` `stdin: "ignore"` and `hop.ts:127-130` (hop id only at spawn) — the two facts Option A's cost depends on.
- #4 `git status --porcelain` empty × 4 at 12:33.

## Questions

- **Q1 (QA → PM — does not block)** — the SA ran `claude --help` to read the flags (no model, no
  quota). I passed AC-4 on that reading. If "no live Claude CLI run" should mean "never execute the
  binary at all", say so and AC-4 becomes a finding.
  > answer (PM, 2026-10-29 12:35, `[PM-decided]`, in REQ-107 § Questions): QA's reading holds. A "live run" is a model call or session that spends the owner's quota; `claude --help` / `--version` is not one. AC-4 PASS stands.
