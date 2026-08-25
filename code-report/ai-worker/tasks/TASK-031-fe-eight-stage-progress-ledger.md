# TASK-031: FE — show AI_CURIOUSNESS + AI_UNDERSTANDING as their own progress steps
- Source: SPEC-008
- Status: DONE
- Depends on: none (see acceptance note — full end-to-end highlight needs TASK-030 too)

## What to do

Mirror the eight-stage wire list on the frontend and label the two new steps.
Repo: `code-report/code-report-front`.

1. **`src/types/api/main/report.ts` — `REPORT_STAGES`.** Insert
   `"AI_CURIOUSNESS"` and `"AI_UNDERSTANDING"` in the same order the backend now
   emits (matching SPEC-008 exactly):
   ```
   "CLONING", "READING_CODEBASE", "READING_COMMITS",
   "AI_PROJECT", "AI_COMMITS", "AI_CURIOUSNESS", "AI_UNDERSTANDING", "AI_WRITING"
   ```
   Fix the stale comment above it (currently "SPEC-001 `stage` — the seven-step
   worker"; it lists six) to describe the eight stages.

2. **`src/constant/text/dictionaries.ts` — labels.** Add a `reports.view.stage.`
   entry for **both** new stages in **both** the `th` and the `en` dictionary,
   placed next to the existing stage labels (after `AI_COMMITS`, before
   `AI_WRITING`), using the **DRAFT** wording from SPEC-008 §Labels:
   - `th`: `"reports.view.stage.AI_CURIOUSNESS": "สำรวจโค้ดเพิ่มเติม"`,
     `"reports.view.stage.AI_UNDERSTANDING": "ทำความเข้าใจข้อมูล"`
   - `en`: `"reports.view.stage.AI_CURIOUSNESS": "Exploring the codebase"`,
     `"reports.view.stage.AI_UNDERSTANDING": "Making sense of the findings"`

   **These labels are DRAFTS pending stakeholder confirmation (Q-REQ009-1 /
   Q-SA-26).** Build with them now so the screen is complete and testable; the
   final text, if the stakeholder changes it, is a one-line edit to these two
   `th` values (and/or `en`) later — do not block on it. Both keys must exist in
   both languages so no raw stage key is ever shown (REQ-009 AC 3).

3. **`ReportProgress.tsx` — no structural change.** It already renders one row
   per `REPORT_STAGES` entry, derives `total`/`current` from `job.progress` (or
   falls back to the list), numbers rows `${index+1}.0`, and highlights the
   current row — all of which now cover eight rows automatically. Only update
   the stale doc comments in this file (header: "the six stages numbered
   `1.0 … 6.0`", and "the six-stage logic below") to say eight / `1.0 … 8.0`.
   Do not change the render logic.

Optional (only if you are otherwise touching the file): the "six"/`1.0 … 6.0`
comments in `ReportViewContent.tsx` and `globals.css` are now stale too; updating
them is welcome but not required by this task — the numerals are generated
dynamically, so nothing there is functionally wrong.

Do **not**: add sub-progress, stream reasoning content, or restyle the ledger
(REQ-009 Out of Scope). This is two list entries + two labels + comment fixes.

## Definition of Done
- [ ] `REPORT_STAGES` has the eight stages in the order above (matching SPEC-008
      / the backend wire strings verbatim).
- [ ] Both new stages have a `th` (primary) and `en` (secondary) label in
      `dictionaries.ts`; no key is missing in either language.
- [ ] `ReportProgress` renders eight numbered rows with the two new steps
      between "Analysing the work done" and "Writing the report"; the six→eight
      doc comments in `report.ts` + `ReportProgress.tsx` are corrected.
- [ ] `bun run typecheck` exits 0 (run in `code-report/code-report-front`).
- [ ] `bun run build` succeeds (same gate as TASK-021/023).
- [ ] Committed on its own commit; `git status --porcelain` clean; record the
      commit hash + exact files changed in §Implementation Notes.

## Acceptance note (not a DoD blocker for this task)
The end-to-end REQ-009 check — the highlight tracking a live job through all
eight steps, current-step correct at `AI_CURIOUSNESS` and `AI_UNDERSTANDING`,
labels in Thai, no `-1`/raw-key — requires the backend to be emitting the eight
stages, i.e. **TASK-030 also DONE**. That combined local verification is a
follow-up once both tasks are DONE (same shape as TASK-009's acceptance run),
not a gate on this FE task's own build/typecheck DoD above.

## Implementation Notes (Fern, 2026-08-25)

Repo `code-report-front`, branch `develop`, commit **`e75346e`** (parent
`68a1475`), `git status --porcelain` clean. Exactly three files changed:

1. **`src/types/api/main/report.ts`** — inserted `"AI_CURIOUSNESS"` and
   `"AI_UNDERSTANDING"` into `REPORT_STAGES` after `"AI_COMMITS"`, before
   `"AI_WRITING"`, matching the SPEC-008 wire order verbatim (now eight). Replaced
   the stale "seven-step worker" / six-item comment with one describing the
   eight-stage un-folded list. `ReportStage` type follows automatically
   (`(typeof REPORT_STAGES)[number]`).
2. **`src/constant/text/dictionaries.ts`** — added
   `reports.view.stage.AI_CURIOUSNESS` and `reports.view.stage.AI_UNDERSTANDING`
   to **both** `th` and `en`, placed after `AI_COMMITS` / before `AI_WRITING`,
   with the DRAFT wording from SPEC-008 §Labels (`th`: "สำรวจโค้ดเพิ่มเติม" /
   "ทำความเข้าใจข้อมูล"; `en`: "Exploring the codebase" / "Making sense of the
   findings"). Because `MessageKey = keyof typeof th` and `en: Record<MessageKey,
   string>`, both languages must carry both keys — they do, so no raw stage key
   can be shown (REQ-009 AC 3).
3. **`src/components/partials/ReportView/ReportProgress.tsx`** — doc comments
   only: "six stages numbered `1.0 … 6.0`" → "eight … `1.0 … 8.0`", and the
   "six-stage logic below" note → list-driven, grew six→eight, no structural
   change. Render logic untouched (it already maps one row per `REPORT_STAGES`
   entry and derives current/total from `job.progress`).

Did **not** touch the optional stale "six" comments in `ReportViewContent.tsx` /
`globals.css` (numerals are generated dynamically; nothing functionally wrong),
and added no sub-progress / streaming / restyle (REQ-009 Out of Scope).

**Verification (gates from the DoD, run in `code-report-front`):**
- `bun run typecheck` → `tsc --noEmit`, **exit 0**.
- `bun run build` → `next build` (Next.js 16.3.2), **Compiled successfully**,
  TypeScript finished, all 5 pages generated, no errors/warnings.
- `git status --porcelain` clean after the commit; only the three named files in
  the diff (no `AGENTS.md`/`next dev` block churn).

**Labels are DRAFTS** pending stakeholder confirm via Q-SA-26 / Q-REQ009-1 —
the task itself instructs building with them now; final wording, if changed, is a
one-line dictionary edit, not rework. No questions, no assumptions of my own; the
wire strings and draft labels are all fixed by SPEC-008.

**Acceptance note (not my DoD):** end-to-end live-highlight through all eight
steps against a real BE run is the combined REQ-009 check (needs TASK-030 too,
now DONE) — a follow-up, not gated on this FE build.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE — reviewed 2026-08-25 by Sober at `e75346e`** (branch `develop`,
parent `68a1475`, `git status --porcelain` clean, HEAD confirmed `e75346e`).
Review only — no code written, no SQL, no environment touched.

**Verified, not trusted.** `git show --stat e75346e` = exactly the three named
files (`report.ts` +9/−1, `dictionaries.ts` +4, `ReportProgress.tsx` +4/−3);
nothing else in the diff (no `AGENTS.md`/`next dev` churn). Gates **re-run by me**
in `code-report-front`: `bun run typecheck` (`tsc --noEmit`) exit 0;
`bun run build` (`next build`, Next 16.3.2) Compiled successfully, all 5 pages
generated, no errors — matches Fern's evidence.

**Conformance traced read-only vs SPEC-008 + all DoD rows:**
- `REPORT_STAGES` = the eight stages in the exact order above, and **byte-for-byte
  equal to the backend `JOB_STAGES`** at `code-report-back` HEAD `803a44c`
  (TASK-030 DONE) — cross-checked both lists: `CLONING, READING_CODEBASE,
  READING_COMMITS, AI_PROJECT, AI_COMMITS, AI_CURIOUSNESS, AI_UNDERSTANDING,
  AI_WRITING`. `ReportStage` type follows the list (`(typeof REPORT_STAGES)[number]`),
  no literal count anywhere.
- Both new keys (`reports.view.stage.AI_CURIOUSNESS`/`AI_UNDERSTANDING`) added to
  **both** `th` and `en`, placed after `AI_COMMITS` / before `AI_WRITING`. Since
  `MessageKey = keyof typeof th` and `en: Record<MessageKey, string>`, a key missing
  in either language would fail typecheck — typecheck is green, so no raw stage key
  can ever show (REQ-009 AC 3, the one hard correctness point in the SPEC).
- `ReportProgress.tsx` is render-unchanged: the ledger `.map`s over `REPORT_STAGES`,
  derives `total`/`currentIndex` from `job.progress`/`REPORT_STAGES.indexOf(job.stage)`,
  and labels via `t(reports.view.stage.${stage})` — so eight rows render automatically,
  the two reasoning steps sit between "Analysing the work done" and "Writing the
  report", and `indexOf` never returns `-1` for a real stage now that both are in the
  list. Only the six→eight doc comments changed (verified by diff).
- Out of scope and untouched (confirmed by diff): no sub-progress, no reasoning
  streaming, no restyle (REQ-009 Out of Scope). The optional stale "six"/`1.0 … 6.0`
  comments in `ReportViewContent.tsx`/`globals.css` were correctly left (numerals are
  generated dynamically — nothing functionally wrong; not a DoD item).

**Labels remain DRAFTS** (Q-SA-26 / Q-REQ009-1, NON-BLOCKING): building with them
now is exactly what the task instructs; final wording is a one-line dictionary edit,
not rework. No questions either side; no user-facing string invented by the engineer
beyond the SPEC-008 drafts.

**Acceptance note:** the combined REQ-009 end-to-end live-highlight run (a real job
tracked through all eight steps, current-step correct at `AI_CURIOUSNESS`/
`AI_UNDERSTANDING`, Thai labels, no `-1`/raw-key) — with both TASK-030 and TASK-031
now DONE — is a follow-up local acceptance check (same shape as TASK-009), a
Porter/human pre-ship gate, **not** a gate on this task's own DoD (which is build +
typecheck, both green).
