---
name: rat-semantic-keys
description: "Mandatory when designing (SA), implementing (FE) or verifying (QA) semantic keys / UI-automation identifiers in a Rationalize (usb-oda, ODA Flutter) repo — the team's way, learned from the team's own fix b7948af. Covers: finding the repo's existing automation home, wrap-only edits to screen files, key names per the lead's convention §3 with placement and wrap-only per b7948af, the Cml tap/slot pattern, the diff-shape check (scripts/diff-shape.sh) before any hand-off, git handling for these repos, and the web verification recipe. Use alongside the role skill and the team kit (~/shared-skill-rat). Do NOT use for other projects or for non-automation changes."
---

# Semantic keys in Rationalize repos — the team's way

> Origin (2026-10-06, desk usb-oda): our first key change (`0801349`, taxonomy JE leave-page dialog)
> passed every test and QA web check, and was still wrong — it **moved other developers' `onPressed`
> bodies** and built a **parallel automation stack** beside the repo's own. A team developer rewrote it
> within 1.5 h as **`b7948af`**; the operator: *"เขาแก้ให้แล้ว จงเรียนรู้จากเขา"*. Every check we ran
> measured behaviour; none looked at what a reviewer sees. This skill makes that view a required check.
>
> Read with it: the handoff (`machine.local.md` → `usb-oda-semantic-keys`: README + convention + examples)
> and the team kit (`~/shared-skill-rat/core/CLAUDE.md`, `oda/CLAUDE.md`). This skill does not restate
> them. **Operator's ruling (desk `DECISIONS.md` 2026-10-06 "Semantic-key style settled"): code
> placement and wrap-only follow `b7948af`; key *names* follow the convention §3.**
> Study the reference: `git -C <taxonomy JE repo> show b7948af`.

## 1. Find the repo's automation home before designing anything (SA, then FE)

```bash
grep -rln "AutomateKey\b\|class .*AutomateKey" lib/        # existing key class
grep -rln "class .*Automate" lib/                          # existing wrapper widgets
grep -rn "Semantics(identifier" lib/ | head                # how ids are attached today
```

- Both exist → **all new keys and wrappers go there** (this overrides convention §6.1/§6.2 by the
  operator's ruling). In the taxonomy JE that is
  `TaxoL2AutomateKey` (`lib/src/utils/constants/const_l2_identifier.dart`) and
  `lib/src/widgets/automation/taxo_l2_automate.dart`.
- Creating a new file or folder beside an existing home needs a written reason in the TASK's
  `## Questions`, decided by the operator.
- Nothing exists → the SA proposes a location in `## Questions` (the handoff's
  `lib/src/utils/automation/` layout is the default proposal) and waits for the decision.

## 2. Wrap-only in screen files

A screen file may gain **imports and wrapper lines**. Every existing callback body, label expression,
comment and widget property stays **byte-identical, in place**. Moving a callback into a function is
touching it. **Existing automation code is host code too** (operator ruling, DECISIONS 2026-10-06):
only add keys to elements that have **none**; never change, rename or re-wrap an existing key or
wrapper (`TaxoL3Automate(` → `TaxoL3AutomateTap(` was rejected), even to make it clickable — report it
in `## Questions` instead. When a wrapper needs the callback, the wrapper takes the widget's props and builds the
widget itself (§4), so the original `onPressed: () { … }` stays where it was.

## 3. Key naming — convention §3, stored the repo's way

Names follow the **convention §3**: `<type>.<module>-<screen>[-dlg]_<element>` — e.g. the taxonomy JE
leave-page dialog prefix is **`bt.taxonomy-leave-page-dlg_`**. They are *stored* the repo's way: one
**prefix constant per screen** in the existing key class, id = prefix + element name.
`b7948af`'s `bt.leavepagedlg_` is off-convention — the pattern to copy is its placement, not that name.
**Do not rename existing off-convention keys** (convention §9 — QA scripts may use them); new keys only.
Any other clash between the repo and the convention → the SA writes it in `## Questions`.

## 4. Cml widgets — tap and slot

A plain identifier on a `CmlButton` / `CmlButtonIcon` / `CmlCheckbox` does not run the callback on a
semantic tap (web automation clicks arrive as one). Pattern from `b7948af`:

- `…AutomateTap` — a `Semantics(identifier, container, button, enabled, label, onTap, excludeSemantics)`
  node that carries the real tap.
- `…AutomateCmlButtonSlot` — implements the slot interface the parent expects
  (`CmlPrimaryButtonSlot` / `CmlSecondaryButtonSlot`), takes `id, label, onPressed, type`, and builds
  `Tap(child: CmlButton(...))` with **the same `onPressed`**. The screen file only swaps the constructor:
  `primaryButton: CmlButton(` → `primaryButton: TaxoL2AutomateCmlButtonSlot(` plus one `id:` line.
- Test beside the widget (`test/src/widgets/automation/…`), proving a semantic tap runs the real callback.

## 5. Diff-shape check — before any hand-off (mandatory)

```bash
# run from the workspace root (the folder holding ATLAS.md) — cd there first
.claude/skills/rat-semantic-keys/scripts/diff-shape.sh <repo> <base> WORKTREE <screen files…>
```
(`$CLAUDE_PROJECT_DIR` is set for hooks only, not in an agent's Bash — do not use it here.)
**Base = the feature branch's fork point** (`git -C <repo> merge-base HEAD origin/<phase-branch>`), not an
older ref — the script counts every TOUCH in the range, including other developers' commits; judge only
the hunks the TASK made. The agent shell is **zsh**: read the exit code with `$?` on an unpiped command
(`${PIPESTATUS[0]}` is bash-only and prints nothing in zsh).

It classifies each hunk: **ADD** (only additions) · **SWAP** (one existing line replaced — must be the
wrapped widget's constructor) · **TOUCH** (two or more existing lines removed or moved). **A key change
has zero TOUCH hunks.** A SWAP is acceptable only where a **plain widget constructor with no key**
becomes our wrapper; a removed line that already carries automation (`*Automate*`, `identifier`) is
scored TOUCH by the script. Verified on the real history: `0801349` → TOUCH 3 in the dialog; `b7948af` →
the dialog is SWAP only (its other TOUCH hunks are unrelated tracking edits the developer made in the
same commit).

- **FE** pastes the output into Implementation Notes.
- **SA** reviews every SWAP line and rejects any TOUCH.
- **PM** shows the operator the output **before QA starts** — this is the reviewer's view.

## 6. Git in these repos

Per the desk's `DECISIONS.md` (2026-10-06): AI roles edit files only; **the operator does every git
write** (branch, commit, push). New work starts on a branch the operator creates from
`pre-sit/develop-<phase>` — the newest line that contains the app's pinned tag (team kit rule). The
TASK names the checked-out branch and stops at "edited, not committed". Tell the operator to check the
branch's upstream before pushing: an editor "Sync" once had the feature branch tracking
`pre-sit/develop-1d` and would push straight to the shared line.

## 7. Web verification recipe (QA)

1. Run the app per the desk's environment rules; open the screen through the main menu.
2. Enable Flutter semantics (the "Enable accessibility" placeholder sits off-screen — enable it with an
   eval click and say so in the evidence).
3. Find the node by `flt-semantics-identifier`; hit-test its centre to confirm the keyed node is on top.
4. Send a **trusted** CDP click (`Input.dispatchMouseEvent`) or type; assert the effect (page pops, value
   typed, state changes). Finding the node is not verification.
5. Check the CDP port with `curl 127.0.0.1:<port>/json` — a `flutter run -d chrome` Chrome uses its own
   random port. Harness on this desk: `usb-oda/ai-worker/tests/harness/cdp.mjs`.

## Anti-patterns (each one happened)

- A parallel `automation/` folder beside the repo's existing one.
- Extracting `onPressed` bodies "to share the callback" — the slot pattern exists for that.
- Calling the work done because tests and web clicks pass — behaviour was never the problem.
- Reporting "not pushed" without checking `git log origin/<branch>`.
