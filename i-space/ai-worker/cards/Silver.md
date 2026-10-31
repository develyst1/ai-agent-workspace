# Card — Silver (SA, Team B, i-space)

> **For Silver only** — the memory-card pilot (MARIE.md ORDER 43, owner GO 2026-10-30 14:43). Injected into
> Silver's context at every session start (scripts/hooks/memory-cards.sh), so it is what survives a `/clear`.
> **Cap 4 KB** (check-hygiene WARNs above it). **Only Silver edits this card**, at a distill review
> (`node scripts/memory/distill.mjs Silver` → review `cards/Silver.proposed.md` → move kept lines here →
> `node scripts/memory/distill.mjs Silver --done`).
> One line per item: `- <habit / correction / owner preference / decision> — source: <quote> (<log line | transcript file:line | DECISIONS/REQ/TASK pointer>)`.
> Pointers, never copied content.

- correction: a shape change's consumers = `tools/probe-change.sh <repo> <patch>` (patch from a scratch copy, kept in `tests/harness/`), each hit → TASK; a changed user-visible string, or a changed meaning of a state (`status === "open"`), also gets a `git grep` of its literal incl. tests; a mock/fixture behaviour change goes INTO the probe patch (types alone miss tests that pin behaviour) → each reader on a closed list — source: spec-rules §1; F-035/F-042; F-055; F-057; F-059
- correction: a threshold on model usage is checked against a real multi-call trace in `tests/harness/`, and a probe's number says what the probe could not show (1 call: sum = context) — source: F-054 (TEST-121 DEF-1)
- correction: every NEW file a TASK names is checked with `git check-ignore -v <path>` at cut time (exit 1 = fine) — source: FAILURES F-033
- correction: every file a TASK's DoD names is on its closed list — source: FAILURES F-047 (TASK-149 Q1)
- correction: a SPEC rule that derives a state from the same data as an existing rule (waiting vs workable) cites that rule's line and works one boundary case — source: FAILURES F-038 (SPEC-114 D3)
- habit: edit scripts use `replace(a, () => b)` (never a string `b` with `$`), then read the changed lines back with grep/sed — source: F-025 (whole file pasted into SPEC-110)
- habit: no experimental git command in a team's working tree; the one fingerprint is `tools/tree-fp.sh <repo>` (read-only), compared with the value in QA's verdict before git — source: F-031; spec-rules §4
- habit: at review I re-run the decisive checks myself (tests, tsc, scope via `git status --untracked-files=all`, e2e/screenshot when left UNVERIFIED); a whole-suite fail under load from other sessions → each extra file alone, then the whole suite alone — source: TASK-116/122/139/144/170 § Review
- habit: every DoD base is a real run on the current tree, refreshed when a held TASK is released — source: "DoD 5's base result has to be a real run, not my expectation" (TASK-143 DoD 5; PROTOCOL § Evidence)
- owner-preference: git only on the owner's OWN words (a DECISIONS row), tree = QA's fp (abs path, check exits — F-058), secret scan, stage by name, `git -c user.name=develyst -c user.email=develyst1@hotmail.com commit`, hashes to the PM — source: DECISIONS 2026-10-30 09:1x; CONVENTIONS.md § Git
- habit: distill again after ANY later log entry — ready-to-clear compares the two — source: Atom 2026-10-30 15:1x, 18:02
- correction: a SPEC claim about a value's uniqueness, nullability or range cites the schema line that decides it (`grep -n` on the table) — source: FAILURES F-040
- habit: caw-back commands run as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …` — source: SYSTEM-FACTS 12:54
- correction: every HH:MM I write into a file comes from `date` printed in that same turn (best: the `date` in the write call itself) — never estimated — source: FAILURES F-046, F-043, F-060
- habit: drain an inbox only with `drain-inbox.mjs`, never in the same command as an inbox `>>` (both hook-blocked) — source: hooks 2026-10-30
- correction: my review build in a team's tree uses the TASK's own `NEXT_DIST_DIR` (`.next-f`), never a new name — Next writes it into the tracked tsconfig.json — source: F-056 (SYSTEM-FACTS F-003)
