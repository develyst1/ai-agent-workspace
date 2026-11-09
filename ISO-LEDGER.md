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
  - **Re-check 2026-11-08 (this box):** `MARIE.md` **550,385 B** (was 522,418 B on 2026-11-06,
    +5.4 %), `ATLAS.md` **96,378 B** (was 82,912 B). `check-hygiene.mjs:109,616-629` is unchanged:
    the boot gate still measures PROTOCOL + board + role charter + that role's inbox only, so no
    workspace charter is in any desk's boot path. The finding is older and larger; verdict stands.

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
  - **Re-check 2026-11-08:** `node scripts/check-harness.mjs` → `harness 2.6.17: 10 desk(s), 1 not
    current` (`smart-scheduler-atom` behind 2.6.17, desk has 2.6.9). Same single exception, same
    documented hold (`ATLAS.md:1015`). The condition is Atom-side and cannot be run from here, so
    the hold still stands. Verdict unchanged.

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

## IV-005 · 2026-11-08 · "This machine has no path map, so no code repo can be resolved from here"

- **Claim:** IV-004 above recorded `machine.local.md` absent and this box a Mac (`entronica`);
  `CLAUDE.md` § Paths & machines makes that file the only place an absolute repo path may live.
- **Check:** `Test-Path machine.local.md` · `(Get-Item machine.local.md).Length` · every `H:\…` path
  extracted from `machine.local.md:18-111` tested with `Test-Path -LiteralPath` · existence-only
  check of `C:\Users\KUYDONG\ci-secrets\corner-chat-qa-token.txt` and `H:\sm-test-access.txt` ·
  `node scripts/check-harness.mjs`.
- **Observed:** the file is present, **10,253 B**, header names machine `KUYDONG` (Windows 10),
  workspace at `H:\ai-agent-workplace\ai-agent-workspace` (`machine.local.md:9`, matches reality).
  **30/30 real paths exist**; one regex
  match (`H:\…`) was a mojibake ellipsis in prose, not a path. Both credential files exist (not
  opened, not printed). Harness **2.6.17**, 10 desks, 1 not current (IV-003 re-check).
- **Verdict:** `CERTIFIED` — for **this** box. IV-004's precondition is a property of the machine,
  not of the workspace.
- **Consequence:** IV-004 is closed as a Mac-box record and stays as that record. A session on any
  other box re-runs this check before claiming a repo path. Nothing for a desk to act on.

## IV-006 · 2026-11-08 · "Iso is a workspace identity in the rulebook, not only in his own file and starter"

- **Claim:** `ISO.md:126-145` — the `CLAUDE.md` / `ROLES.md` registration is the one step that needs
  the owner's keystroke (it re-hashes `ruleFiles` in `harness.json`); until it exists, "this file is
  the identity and the owner's starter is the way in".
- **Check:** `Select-String -Path CLAUDE.md,ROLES.md,SESSION-STARTERS.md -Pattern 'Iso|ISO'`.
- **Observed:** `CLAUDE.md` **0** hits, `ROLES.md` **0** hits — the identities section still reads
  "Four standing identities". `SESSION-STARTERS.md:48-58` carries the starter and the session title
  `Iso - workspace`. The route in exists; the rulebook does not name the seat.
- **Verdict:** `PARK` — not a failure: the patch is written and waiting, and applying it without his
  word is the one thing `ISO.md` forbids. Any claim that "Iso is a standing identity like Atlas" is
  unstated until then.
- **Consequence:** the owner says go → Marie applies the exact patch (`ISO.md:136-145`), bumps the
  manifest, installs on every desk → Iso certifies the **presence** of the lines by grep (not the
  install, not the bump). → open, owner: the owner.

---

## Open items

- `IV-001` (Marie/Atlas boot budget) — awaiting Atlas's design.
- `IV-004` (this machine's path map) — awaiting the owner.
- Planned, not installed: the gate line `N uncertified — call Iso` (Marie, an ORDER from Iso), and
  a weekly one-pager (owner's word on a scheduled task).

## Open items — 2026-11-08

- `IV-001` — Marie/Atlas boot budget. Awaiting Atlas's design; **grew** since (MARIE.md 550 KB).
- `IV-006` — Iso's registration in `CLAUDE.md` / `ROLES.md`. Awaiting the owner's word.
- Closed this session: `IV-004` (re-checked as `IV-005`, this box resolves every path); `IV-002` and
  `IV-003` verified still true in passing (README lists all 10 desks incl. Bunny/Iso/Atom; harness
  2.6.17 with the one documented hold).
- Still not measured — Iso's own first three audits, none started: (1) boot budget as **tokens per
  role** across all charters, not just Marie's; (2) the announced-vs-installed sweep over every ORDER
  and desk `FAILURES.md`; (3) the maps (`README.md` done; `SESSION-STARTERS.md` and desk `TEAMS.md`
  vs reality not yet). The gate line above remains uninstalled, so nothing reminds anyone of them.
