# ISO-LEDGER — every claim about this workforce, and whether it is true

> **Append-only.** Only Iso writes verdicts. Format and rules: `ISO.md` § The ledger.
> Open claims stay open until their consequence is carried out **and re-checked**.
> `PARK` = deliberately not checked yet, with an owner. `HOLD` = a change stopped until answered.
> The owner may lift any verdict with one word; the lift is recorded here with his words.

| Status | Meaning |
|---|---|
| `CERTIFIED` | the claim was run and held |
| `REFUTED` | the claim was run and failed |
| `NOT_VERIFIABLE` | cannot be run from here — says so instead of guessing |
| `HOLD` | a change failing its own purpose, stopped with evidence |
| `PARK` | not checked yet; owner and date named |
| `SELF-ERROR` | Iso's own miss |

---

## IV-001 · 2026-11-06 · "A workspace-level charter can be read at session start and still fit the boot budget"

- **Claim:** `MARIE.md:11-13` orders every Marie session to read *"Pending orders from Atlas and the
  Operations log below"* before anything else. The desk gate's budget for a role's startup read is
  **45 KB WARN / 90 KB FAIL** (`check-hygiene.mjs:109,121`).
- **Check:** `wc -c MARIE.md ATLAS.md OTTO.md BUNNY.md` · `sed -n '57,2784p' MARIE.md | wc -c` ·
  `sed -n '2785,5994p' MARIE.md | wc -c` · read `check-hygiene.mjs:95-140,570-610`.
- **Observed:** `MARIE.md` **522,418 B** = 189,654 B (Pending orders) + 329,422 B (Operations log),
  ≈ 130k tokens before her first action — **11.6×** the 45 KB warn, **5.8×** the FAIL. `ATLAS.md`
  **82,912 B**, also over the warn. The gate does **not** measure either file: its boot budget covers
  each desk's `PROTOCOL + role file + board + inbox` only (`check-hygiene.mjs:596-608`), and a
  workspace-root charter is in no desk's boot path.
- **Verdict:** `REFUTED` — not "Marie reads it anyway", which nobody measured, but "the workspace
  orders a read it has never budgeted". This is the mechanism `ATLAS.md` itself named on 2026-09-23:
  *whatever the gate measures gets pushed to where it does not* — here, the top of the system.
- **Consequence:** Atlas designs the fix (likely an index + pointer, nothing deleted); Marie executes
  and is the only hand on `MARIE.md`. Iso does not touch the charter. **Done** = the next Marie
  session's read is under the 45 KB warn and no fact was lost (spot-check against the archive).
  → open, owner: Atlas.

## IV-002 · 2026-11-06 · "README.md is the workspace map, and it is current"

- **Claim:** `README.md:1-6` ("A multi-session AI team workflow…") and § Projects is the entry point
  the workspace's own startup path sends a fresh session to (`CLAUDE.md` § Amnesia-first:
  `README.md` (map) → `SESSION-STARTERS.md`).
- **Check:** `ls -d */ai-worker` (the real desk set) vs `README.md:93-101` (the table);
  `grep -n "i-space\|buddy-screen\|smart-scheduler-atom\|Bunny\|Atom" README.md` → no hits.
- **Observed:** **10** desks exist; the table lists **7**. Missing: `i-space` (the owner's own
  product, the most active desk), `buddy-screen` (parked on disk, dropped from the active list
  2026-10-29), `smart-scheduler-atom` (Atom's fork desk, IDs from 5000). The identities line
  (`README.md:52-54`) names Atlas, Marie, Otto — **Bunny** (2026-10-21) and **Atom** (draft) absent.
- **Verdict:** `REFUTED`.
- **Consequence:** factual correction of the map by Iso (a map, not a rule) — registered in
  `README.md` the same day; the project descriptions must match each desk's own board. **Done** =
  every desk on disk has a row, and each row's team matches that desk's `TEAMS.md`.

## IV-003 · 2026-11-06 · "Every desk runs the current rules package"

- **Claim:** `check-harness` is the manifest of which desks are current; `ATLAS.md` (2026-11-01,
  ORDER 55 follow-up) records `smart-scheduler-atom` as **HELD** at 2.6.9 pending `ids.start 5000`
  on Atom's side.
- **Check:** `node scripts/check-harness.mjs` · `grep -n smart-scheduler-atom` in `ATLAS.md`.
- **Observed:** `harness 2.6.14: 10 desk(s), 1 not current` — `smart-scheduler-atom behind 2.6.14
  (desk has 2.6.9)`. The hold is recorded, with its condition, in `ATLAS.md:1015`.
- **Verdict:** `CERTIFIED` — the manifest tells the truth, and the single exception is deliberate
  and documented. A verifier who reports this as a failure would be manufacturing one.
- **Consequence:** none. Re-check when Atom's `ids.start 5000` exists; then Marie installs.

## IV-004 · 2026-11-06 · "This machine can resolve a code-repo path"

- **Claim:** `CLAUDE.md` § Paths & machines — code-repo paths live **only** in `machine.local.md`
  at the workspace root, git-ignored and per-machine; a missing entry means stop and ask the owner.
- **Check:** `ls -la machine.local.md` · `grep -n machine .gitignore`.
- **Observed:** `No such file or directory`. `.gitignore:150-151` confirms the file is per-machine
  and never synced. This box is a Mac (`entronica`) with no `tmux` and no running `claude`
  sessions — it is **not** the box that runs the desks.
- **Verdict:** `REFUTED` for this machine — the precondition is absent.
- **Consequence:** from here Iso can verify workspace files and git state, and **cannot** read any
  product repo. Owner to add the per-machine section, or say "workspace-only for this machine".
  → open, owner: the owner.

---

## Open items at birth

- `IV-001` (Marie/Atlas boot budget) — awaiting Atlas's design.
- `IV-004` (this machine's path map) — awaiting the owner.
- Planned, not installed: the gate line `N uncertified — call Iso` (Marie, an ORDER from Iso), and
  a weekly one-pager (owner's word on a scheduled task).
