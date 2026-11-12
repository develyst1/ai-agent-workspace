# TEST-001: REQ-001 — course repo structure, schedule and outline
- Source REQ: REQ-001 (ACs as amended 2026-11-12, AC-2..AC-10)
- Status: DRAFT — cases designed from the REQ **before** the build; nothing has been run yet
- Environment: local only — the `code-class-docs` clone (path: workspace-root `machine.local.md`), branch `main`.
  GitHub view: only after the owner pushes; until then `NOT_TESTED`.
- Designed: 2026-11-12 by Tanya (QA) · Tested: — (not run)

## Scope

- **Ours to judge:** the files the SA's SPEC-001 / FE's TASKs add to `code-class-docs` for REQ-001: the front page
  (`README.md`), the course overview, the schedule page, the class folders with their placeholders.
- **Not QA's:** AC-1 (owner's approval; the PM records it in `DECISIONS.md`). TEST-001 starts only after AC-1 is
  recorded. A build without it is reported to the PM and not tested.
- **Not ours:** the root commit `54e1529` and anything the owner commits himself. Those go under Observations.
- **Inputs I will need from the SPEC before running:** the path of the overview and the schedule pages, the class
  folder naming pattern, the two example languages (AC-4), and the approved class length and frequency (AC-3, Q2).

## Instruments — what each can and cannot prove

| Instrument | Proves | Does not prove |
|---|---|---|
| VS Code Markdown preview on the local clone | the page renders, the text is there, relative links open the target | how GitHub renders it (folder links, tables, Thai line-breaking). The GitHub half is `NOT_TESTED` until the push |
| `git ls-files`, `git status -sb`, `git log`, `git branch -a` (read-only, no fetch) | what git would carry, i.e. what the client will see after a push; that history is untouched | anything on the remote (no fetch) |
| `grep -rEn` over the repo | that the listed patterns of personal data are absent | names. Those are checked by reading every file (AC-6) |
| Running a minimal snippet per topic in each of the two named languages | the topic really exists in both (AC-4) | that the outline teaches it well. That is not an AC |

## Cases

| # | AC | Type | Steps | Expected | Actual | Result |
|---|----|------|-------|----------|--------|--------|
| 1 | AC-2 | happy | Open `README.md` in VS Code preview | In Thai: what the course is · who it is for · what the learner can do at the end · a link to the schedule. The course plan is on top and "start here" is below (REQ Q1 outcome) | | NOT_TESTED |
| 2 | AC-2 | happy | Click the schedule link in the preview | The schedule page opens (no 404, not a folder listing) | | NOT_TESTED |
| 3 | AC-2 | regression | Same as 1–2 on GitHub after the owner pushes | Same | | NOT_TESTED — waits on the owner's push |
| 4 | AC-3 | boundary | Read the schedule table row by row | Numbered 1..N, no gap, no duplicate. Every row has topic · "after this class you can …" · AI part (or "none"). No empty cell | | NOT_TESTED |
| 5 | AC-3 | happy | Find the class length and frequency on the schedule page | Present, and equal to what the owner approved at AC-1 (`DECISIONS.md`) | | NOT_TESTED |
| 6 | AC-4 | happy | For each basics topic in the outline, write and run a minimal snippet in each of the two languages the SPEC names (throwaway, in `tests/harness/`, never in the repo) | Every topic runs in both. A FAIL names the topic and the language | | NOT_TESTED |
| 7 | AC-5 | happy | From the schedule, click class 1, a middle class and class N | Each opens its folder in one click | | NOT_TESTED |
| 8 | AC-5 | boundary | Compare each class folder name with its schedule row | Starts with the zero-padded class number, the same number as the row | | NOT_TESTED |
| 9 | AC-5 | negative | `git ls-files` per class folder (what survives a push), plus a count of class folders vs schedule rows | Every class folder has ≥1 tracked-able file (a placeholder with number + topic). Folder count = row count | | NOT_TESTED |
| 10 | AC-6 | negative | `grep -rEn` for phone numbers, emails, `line`/`LINE ID`, `@handle`, social URLs over every file, excluding `.git/` | No hit (or each hit is explained and is not personal data) | | NOT_TESTED |
| 11 | AC-6 | negative | Read every file in full and list them in this TEST | No person's name except the owner as teacher. No owner contact on the front page (Q5) | | NOT_TESTED |
| 12 | AC-7 | regression | `git log --oneline`, `git status -sb`, `git branch -a` in the repo | Root `54e1529` unchanged. Any newer commit has its hash in a log line from an owner-ordered `ขึ้น git`. No new branch | | NOT_TESTED |
| 13 | AC-8 | negative | Read the front page and the schedule | No exam / grade / semester / credit wording (Thai: สอบ, เกรด, คะแนน, เทอม, หน่วยกิต). No technical term before it is explained. Each hit is listed | | NOT_TESTED |
| 14 | AC-9 | negative | List every file under the class folders | Placeholders only. No lesson, slide, exercise or example-code file (no `.py`, `.js`, etc. in a class folder) | | NOT_TESTED |
| 15 | AC-10 | happy | From the front page, click to the overview and to the schedule | Each is one click away | | NOT_TESTED |

**Deliberately not tested:** how good the teaching is, and whether the schedule length fits the learner. Those are the
owner's call at AC-1, not ACs. Any placement of AI beyond "the AI cell is filled" is the same.

**Interpretation, cheap to reverse `[QA-proposed]`:** a "placeholder" (AC-5, AC-9) = a file stating the class number
and topic, plus at most a one-line "material coming" note. Anything that teaches (an explanation, an exercise, code)
is material and fails AC-9.

## Defects

*(none — not run)*

## Observations (not ours)

*(none yet)*

## Test data created

None. Read-only on the repo. Throwaway snippets for case 6 go in `ai-worker/tests/harness/` and are listed here when made.

## Verdict

Not run yet — DRAFT. Runs once the SA reports SPEC-001 built and AC-1 is recorded.

## Questions

*(none open. Q5 was answered in REQ-001 on 2026-11-12: no owner contact on the front page.)*
