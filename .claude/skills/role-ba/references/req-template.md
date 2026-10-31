# REQ template

File: the desk's requirements folder, `REQ-NNN-short-title.md`. One REQ = one deliverable
outcome. Status names and the folder come from the desk's `PROTOCOL.md`; the ones below are the
common set — use the desk's if they differ.

```markdown
# REQ-NNN: <short title — the outcome, not the solution>
- Status: DRAFT | <desk hand-off status, e.g. READY_FOR_SA> | … (desk's list)
- Priority: HIGH | MEDIUM | LOW            — set by the operator; your proposal is stamped team-proposed
- Requested: YYYY-MM-DD by <seat> — stamp: customer-asked | operator | operator-delegated (note when) | team-proposed
- Deadline: YYYY-MM-DD or "none"
- Depends on: REQ-… (or "none")
- Source: <where the ask came from — chat date, file, verification table, failure entry>

## Problem / Goal
Who has the problem, what goes wrong for them today, and what changes when it is solved.
Plain language. Quote the asker verbatim (original language) as evidence of intent:
> "<their exact words>" (<seat>, YYYY-MM-DD)

## Requirement
Numbered, testable statements of WHAT, never HOW. "The system must …"
1. …
2. …
Each line stamped if its provenance differs from the header, e.g. `[team-proposed]`.

## Acceptance Criteria
Each AC: one observable outcome · Given / When / Then · business language · a Check line.
- [ ] **AC-1** — **Given** <starting state> **When** <actor does X> **Then** <observable result>
  - Check: <who> by <how — page opened, command + expected output, field read, operator's yes>
- [ ] **AC-2** — unhappy path / edge case …
  - Check: …
- [ ] **AC-3** — regression: what must still work exactly as before …
  - Check: …
- [ ] **AC-n** — a proposal that the team may NOT tick (only a seat can) — say so in the AC.

Visual / "looks" asks: AC-1 is always
- [ ] **AC-1** — **Given** a one-screen comp of <the key screen>, shown before the full build,
  **When** the operator looks at it, **Then** they say yes. Check: the operator only; no team
  member ticks it.

## User-facing wording
Every new or changed string, exact, in every language the product ships.
| Where / when it appears | TH | EN | What it promises the user |
|---|---|---|---|
Strings not yet decided → `## Questions`, never invented (harness §10).

## Constraints
Fixed limits: environments that may not be touched, data that is read-only, legal/brand rules,
platforms. Facts only, each with its source.

## Out of Scope
Explicit cuts, each a business decision. "Not in this REQ" items that a reader might expect.

## Questions
Numbered. Each: who asks whom, whether it BLOCKS, the asker's options, your recommendation + stamp.
- **Q1 (<from> → <to> — BLOCKS | does not block)** — …
  > recommendation `[team-proposed]`: …
  > answer: _(pending)_ | **ANSWERED YYYY-MM-DD by <seat>, `[stamp]`** — "<their words>"

## Verification (written when the work comes back — by whoever the desk names)
| AC | Verdict (MET / PARTIAL / NOT MET / NOT_TESTED / n/a by design) | What I checked myself |
|---|---|---|
```

## Amending

- Never rewrite an AC someone has worked to. Strike it (`~~…~~`), write **AMENDED YYYY-MM-DD by
  <role>** and the reason underneath, then the replacement (`AC-6a`, `AC-6b`).
- If the amendment was your own defect, say so in the amendment and record it per the desk's
  failure log rule.
- A post-delivery correction (a delivered line turns out false) is appended as its own section;
  the delivered status stands if the ACs were met as written, and the section says what was wrong.

## Good and bad shapes (generic)

| Bad | Why | Better |
|---|---|---|
| "The page must be easy to read." | No checker, no check. | AC-1: operator's yes on a one-screen comp before the build. |
| "Every item is reachable from a persistent navigation." (on a "make it lighter" ask) | Checkable, and adds text the asker wants gone. | Ask first what "lighter" means; propose the nav in a comp. |
| "No content changes — presentation only." (asker never said it) | Your constraint; makes the goal unreachable. | Ask: may long prose fold or become a diagram? |
| "Require UC nodes." + Out of Scope "no TC nodes" | Gate fails any UC without a TC. | Read the gate; resolve the coupling in the REQ before hand-off. |
| "The user can compare packages in flow B." | Written from a route, not from the screen. | Verified against what the screen renders, with file:line. |
