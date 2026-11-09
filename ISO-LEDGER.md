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

## IV-005 · 2026-11-09 · "A role wakes Iso with `nudge-session`, by session title"

- **Claim:** `ISO.md` § How anyone reaches you, as written 2026-11-06: *"The owner opens a session
  titled `Iso - workspace` (the title is how `nudge-session` finds you)"* — i.e. any Claude seat can
  wake this seat the same way it wakes Marie or a desk role.
- **Check:** this session's own skill catalog (DeepSeek Harness) · `ls .claude/skills` ·
  `POKERVAULT.md:95-111` · `ATLAS.md` 2026-11-01 (the nudge rule is written in Claude-session terms:
  `list_sessions` + `SendMessage`).
- **Observed:** `nudge-session` is **not in this session's catalog**; the skill exists only under
  `.claude/skills/`, which is Claude Code's path. `POKERVAULT.md:97-99` records the same for the
  other DeepSeek seat and names the only proven bridge (REQUEST file + background watcher). No
  cross-harness send has ever been demonstrated by anyone.
- **Verdict:** `SELF-ERROR` — the call path in my own birth file named a mechanism that does not
  exist on my harness. The exact defect this role exists to catch, in its first three days, in its
  own file.
- **Consequence:** fixed in `ISO.md` § How anyone reaches you (watcher + request file) the same day.
  **Lesson for the ledger:** a seat's birth file must name a wake mechanism that exists **on that
  seat's harness** — not the one every other desk uses.

## IV-006 · 2026-11-06 · "PokerVault's birth is registered, and no credential reached git"

- **Claim:** `POKERVAULT.md:143-147` — *"README.md and SESSION-STARTERS.md carry this seat now"*, and
  the credential store is git-ignored.
- **Check:** `grep -n PokerVault README.md SESSION-STARTERS.md` · `cat picklocker/.gitignore` ·
  `git ls-files picklocker`.
- **Observed:** registration present (`README.md:56`, `SESSION-STARTERS.md:60`). The tooling's own
  `.gitignore` excludes `state/`, `*.env`, `access.txt`, `node_modules/`. Tracked files are
  `.gitignore`, `README.md`, `login.mjs`, `package.json`, `sites.json` — **no credential, no saved
  session**. The `CLAUDE.md`/`ROLES.md` line is pending, as Iso's is.
- **Verdict:** `CERTIFIED`.
- **Consequence:** none. Re-check when the owner bumps the package.

## IV-007 · 2026-11-09 · "No workspace seat's startup read crosses the desk gate's FAIL line (90 KB)"

- **Claim:** the workspace's own charters are held to the standard the desk gate enforces — **45 KB
  WARN / 90 KB FAIL** (`check-hygiene.mjs:109,121`) — or at least to the bar Atlas accepted on
  2026-10-30: 47–53 KB is *"no evidence of harm"* and needs no slimming.
- **Check:** `wc -c` on every workspace seat's startup files, 2026-11-09.
- **Observed:**

  | seat | startup read | bytes | vs 90 KB FAIL |
  |---|---|---|---|
  | Marie | `MARIE.md` | **522,418** | **5.8×** |
  | Atlas | `ATLAS.md` (Standing knowledge) | **82,912** | 92 % — under the line, over the 45 KB warn |
  | Iso | `ISO.md` + `ISO-LEDGER.md` | 19,418 | 22 % |
  | Atom | `ATOM.md` | 17,935 | 20 % |
  | Otto | `OTTO.md` (then `SERVER-FACTS.md` on demand) | 10,467 | 12 % |
  | PokerVault | `POKERVAULT.md` + `POKERVAULT-LOG.md` | 11,826 | 13 % |
  | Bunny | `BUNNY.md` | 7,254 | 8 % |

- **Verdict:** `REFUTED` — by two seats. Marie fails outright; Atlas sits at 92 % of the line and
  the file only grows (it is append-only by its own rule).
- **The fix already exists in this workspace, and Otto is the proof:** `OTTO.md` is 10 KB because it
  sends the reader to `server-platform/readyidc/readyidc-vps.md` (a one-page handbook) and to
  `SERVER-FACTS.md` **on demand**, not at boot. That is exactly the progressive disclosure Atlas
  designed on 2026-10-20 and never applied to his own file. `SERVER-FACTS.md` is 75,460 B and that
  is *fine*, because nobody reads it at boot.
- **Consequence:** Atlas designs the index-and-pointer shape for `MARIE.md` (and decides whether
  `ATLAS.md` needs it before it crosses 90 KB); Marie executes and is the only hand on her charter.
  Nothing is deleted — every moved section is archived verbatim and pointed to. **Done** = the next
  Marie session's read is under the 45 KB warn and a spot-check of the archive matches the old text.
  → open, owner: Atlas. *(Atlas's own file: a check to schedule, not a change to make yet.)*

---

## Open items

- **IV-001 / IV-007** workspace charter boot budget — Atlas designs, Marie executes. **open**
  (IV-007 carries the full seat-by-seat table; IV-001 is the Marie entry it grew from).
- **IV-004** this machine's path map (`machine.local.md` absent) — the owner. **open.**
- **Registration** (Iso + PokerVault) in `CLAUDE.md`/`ROLES.md` — needs the owner's keystroke: it
  bumps `harness.json`'s hashes and needs an install on every desk. **open.**
- **Gate line** `N uncertified — call Iso` — an ORDER for Marie. **not installed.**
- **Weekly one-pager** — the owner's word on a scheduled task. **not installed.**
- **Iso's watcher** — armed 2026-11-09 in this session; it dies with this session. Re-arm every
  session (see `ISO.md` § How anyone reaches you).
