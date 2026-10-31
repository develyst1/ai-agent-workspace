# SPEC-114: CAW ships its starter skills; the run report and the board name a review that holds work up
- Source: REQ-117 (Team B)
- Status: DONE — Silver (SA B), 2026-10-30 15:1x (TASK-143 + TASK-144 DONE after one rework round each — D3 clarified 14:4x)
- Read for it (caw-back 67dfe55, caw-front 7359fa3, both `atom`, 2026-10-30): `caw-back → src/runner/prompt.ts:32-40` (loadSkills),
  `src/runner/hop.ts:318-319` (stop on a missing skill), `src/runner/report.ts` (whole), `src/runner/main.ts:96-107`, `src/runner/api.ts:17-20`,
  `src/cards/view.ts` (`dependsOn: string[]` on the API card); `caw-front → src/lib/roles.ts:6` (ROLE_SKILLS), `src/lib/startingTeam.ts:28`,
  `src/components/Board.tsx:130-177`, `src/api/caw.ts:73` (`Card.dependsOn`); TEST-106 F-0b + Q6, TEST-112 live run 2 / O-4.

## Overview
1. **Skills.** "ใช้ทีมเริ่มต้น" gives each worker `skillsFor([role])` = `role-pm` / `role-sa` / `role-fe` / … (`front: src/lib/roles.ts:6`). The
   runner reads a skill only from `<CAW_WORKSPACE_ROOT>/.claude/skills/<name>/SKILL.md` and stops the hop when one is missing. CAW ships none,
   so a fresh install stops the first hop. **Design: caw-back ships its own six role skills, and the runner falls back to them.**
2. **Report.** `buildReport`'s "รอคุณ" lists only open question cards (`report.ts:51-54`). A card in review that others depend on is
   invisible, and the run ends `nothing_workable` saying "รอคุณ — ไม่มี". **Design: a review card that holds work up is a "รอคุณ" line, in the
   report and on the board.**

## Design `[SA-decided]` unless marked (each cheap to reverse)
- **D1 — Shipped skills, fallback not copy.** New folder in caw-back: `skills/<name>/SKILL.md` for the six names `role-pm`, `role-ba`,
  `role-sa`, `role-fe`, `role-be`, `role-qa` (exactly `ROLE_SKILLS`' values; `other` has none). `loadSkills(root, names)` looks in
  `<root>/.claude/skills/<name>/SKILL.md` **first**, then in the shipped folder (`new URL("../../skills/", import.meta.url)` from
  `src/runner/prompt.ts`); missing in both → `{ ok: false, missing }` as today. The name checks (`SAFE`, no `..`) apply before either read.
  - Why fallback, not "copy into the root at start": nothing is written into the user's folder, an operator's own `role-pm` still wins, a
    CAW update reaches every install, and the runner — the only reader — owns it. The text reaches the worker exactly as now (embedded in the
    hop's own `skills.md` in its temp dir, `hop.ts:325`), so no read fence changes.
- **D2 — The skill texts** — `[SA-proposed]`, the PM confirms or edits (Q1). English (like the rest of the prompt), each a short role stance;
  the mechanics stay in `buildPrompt`. Every one ends with two sentences, in this order: *"Before you ask the operator anything, read the
  card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."* (PM, Q1 answer 2026-10-30 14:3x — TEST-112 DEF-1)
  and *"Anything a user reads — card text, comments, questions — is in Thai, short and plain."* Drafts (the BE copies them verbatim; the PM may change the words, not the files):
  - `role-pm`: You are the team's PM. In chat you are the operator's partner: understand what they need, ask only what you cannot decide,
    then propose cards — each one testable piece, anchored to the spec part it builds, given to the right teammate, with its dependencies.
    On a card you plan and split work; you do not write code.
  - `role-ba`: You are the team's business analyst. Turn a card into clear, checkable expectations from its spec part and its rules
    (`spec.decisions`, `spec.relatedDecisions`); write them on the card; ask the operator only what the spec cannot answer.
  - `role-sa`: You are the team's solution architect. Decide how a card is built — files, data, contracts between front and back — and write
    it on the card before anyone builds; hand the card to the builder it needs.
  - `role-fe`: You are the team's front-end engineer. Build the screens the card asks for inside your working folder, run them, and check
    them the way a user would before you hand off.
  - `role-be`: You are the team's back-end engineer. Build the server and data the card asks for inside your working folder, run it, and
    check it with real requests before you hand off.
  - `role-qa`: You are the team's tester. Check the card's work against its spec part and every rule it must follow; say what you ran and
    what you saw; when it meets the card, set it to review; when it does not, hand it back with what failed. You never fix the code.
- **D3 — "A review holds work up".** For each work card in `review`, *waiting* = the work cards not `done` that depend on it, directly or
  through other cards **that are themselves not `done`** (walk `dependsOn` backwards and stop at a done card; each card counted once; a cycle
  cannot loop). *(Clarified 2026-10-30 14:4x, TASK-144 review: a card whose own dependencies are all done is workable — `back:
  src/cards/view.ts:1-2` — so it does not wait on the review, even if a done card between them depends on it.)* A review card with waiting ≥ 1 is one line
  under "รอคุณ", after the open questions, by card number: **`รอคุณตรวจ: {title} — มีอีก {n} งานรออยู่`** (REQ-117 § Wording; `{title}` =
  the card's title, `{n}` = waiting). A review card with waiting 0 is **not** listed (Q2 — default; it holds nothing up).
  "รอคุณ — ไม่มี" stays when there is neither an open question nor such a review (AC-3).
- **D4 — Board.** The same line, same rule, computed in caw-front from the cards the board already has (`Card.status`, `Card.dependsOn`,
  `front: src/api/caw.ts:73`) — no new API field, no seam. Shown in the notices area (`Board.tsx:176-177`, after `Uncovered`) **whenever it is
  true**, not only after a run ends (`[SA-decided]`: it is the board's current state; a run ending `nothing_workable` is just when it matters).
  Quiet notice style like `Uncovered`; the title is plain text.

## API / Interface
No route, schema or field changes. The runner's `Card` type (`back: src/runner/api.ts:17-20`) gains `dependsOn: string[]` — the API
already sends it (`back: src/cards/view.ts`, `dependsOn: depsOf(s, …)`); `ReportCard` gains `dependsOn?: string[]` (missing = none).
Consumers: `grep -rn 'buildReport(\|ReportCard' src test` (caw-back) → `src/runner/main.ts:107`, `src/runner/report.ts:7,16,33`,
`src/runner/report.test.ts` (11 calls via its `card()` helper — optional field, so none break); `grep -rn 'loadSkills(' src test` →
`src/runner/hop.ts:318`, `src/runner/prompt.test.ts:39,46,49,50,53` (signature unchanged: `(root, names, read?)`).
Front: `Board` props unchanged — it already takes `cards`.

## Data Model
None.

## AC → work
| AC | Work |
|---|---|
| AC-1 fresh root, first hop starts | TASK-143 D1 (shipped skills + fallback), test: empty root → `ok: true` with the shipped text; a root's own `role-pm` wins |
| AC-2 report + board name #1 and 2 waiting | TASK-143 D3 (report), TASK-144 D4 (board) |
| AC-3 suites + "รอคุณ — ไม่มี" kept | both TASKs' suites; TASK-143 keeps the existing "ไม่มี" test |

## Guardrails
G1 no live hop (stub `CLAUDE_BIN`); G2 every caw-back command `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … --no-env-file`;
G3 no git; G4 the desk's own role skills are never copied (REQ-117 Out of Scope) — D2's texts are new, CAW's own.

## Tasks
- TASK-143: caw-back — shipped role skills + loadSkills fallback; report "รอคุณตรวจ" line — owner: BE Bob (depends on: REQ-105 committed 67dfe55 ✓)
- TASK-144: caw-front — board notice "รอคุณตรวจ" — owner: FE Fanta (depends on: REQ-112/105 committed 7359fa3 ✓; independent of TASK-143)

## Questions
- **Q1 (SA B → PM) — the six skill texts (D2).** They are what CAW's AI workers are told their role is; I wrote neutral defaults. **Default:**
  use them as written. Correct any line. Does not block: the files can change any time without code.
  > answer (PM, 2026-10-30 14:3x `[PM-decided]`, REQ-117 § Questions): accepted, plus one sentence for every role — folded into D2 and TASK-143 step 1.
- **Q2 (SA B → PM) — a review card that holds nothing up.** **Default:** not listed (D3) — it waits for the operator but blocks nothing, and
  the board column "รอตรวจ" already shows it. Say if every review card should be listed (then: `รอคุณตรวจ: {title}` with no tail).
  > answer (PM, 2026-10-30 14:3x `[PM-decided]`): default accepted — D3/D4 as written.
