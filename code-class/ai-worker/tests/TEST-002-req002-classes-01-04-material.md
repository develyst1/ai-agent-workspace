# TEST-002: REQ-002 — class material for classes 01–04 + bonus 05
- Source REQ: REQ-002 (READY_FOR_SA 2026-11-12, AC-2..AC-8; AC-1 is the owner's)
- Status: DRAFT — cases designed from the REQ **before** the build; nothing has been run yet
- Environment: local only. The `code-class-docs` clone, branch `main`, on this Windows 10 machine. Python: the version
  class 01 installs. Node: v22.23.2 is already installed (`node --version`, 2026-11-12). Mac: `NOT_TESTED` (none available).
- Designed: 2026-11-12 by Tanya (QA) · Tested: — (not run)

## Scope

- **Ours to judge:** the lesson pages for classes 01–04 and the bonus-hour page, and their example and exercise files, as
  the SA's SPEC/TASKs for REQ-002 add them. Per the Q-QA-2 answer, the bonus page is **not** class 05 and not a schedule row.
  Its place is set in the revised SPEC-001. "Pages 01–05" below means 01–04 + the bonus page.
- **Not QA's:** AC-1 (the owner reads class 01 and says he can teach from it).
- **Run order = class order, one class per round, each before its deadline** (REQ-002: 01 → 2026-11-15, 02 → 11-16,
  03 → 11-17, 04 → 11-18, 05 → 11-19). A class page is tested as soon as the PM says its wording is final.
  REQ-002 § "User-facing wording" says the PM reviews it before QA's run.
- **Solving discipline (AC-3):** I solve each exercise using only that page and the earlier pages, and nothing from my
  own knowledge. Every solution goes in `ai-worker/tests/harness/test-002/` (never in the repo) with the page section it
  relied on. If a step needs knowledge no page gave, that is a finding, even when I could solve it.

## Instruments — what each can and cannot prove

| Instrument | Proves | Does not prove |
|---|---|---|
| Running each example in a terminal on Windows, typing exactly what the page says | it runs and prints what the page claims, on Windows | Mac behaviour, which is `NOT_TESTED`. Also not the learner's experience of typing it by hand |
| Copy-paste of the code from the rendered page (VS Code preview) | the page's code is the code that runs, so no hidden characters from Thai text or smart quotes | GitHub rendering, which waits on the owner's push |
| Following class 01's install steps on this machine (AC-6) | a Windows learner can follow them | a fresh Windows. This machine is not clean: Node is already installed, so the Node install steps can't be proven here |
| `grep -rEn` + reading every page | the personal-data patterns and the exam/grade wording are absent | names. Those are checked by the full read |

## Cases

| # | AC | Type | Steps | Expected | Actual | Result |
|---|----|------|-------|----------|--------|--------|
| 1 | AC-6 | unhappy | Before installing: run `python --version` on this machine | Records the starting state. Today it prints *"Python was not found; run without arguments to install from the Microsoft Store…"*: the Windows Store alias stub, the same trap a real learner meets. Observed 2026-11-12 | | NOT_TESTED |
| 2 | AC-6 | unhappy | Follow class 01's install steps word for word, on Windows | After the steps, `python --version` prints a real version, and the page tells the learner what to do if they see the Store-stub message (case 1). A step that is missing or wrong is a finding | | NOT_TESTED — see Q-QA-1 |
| 3 | AC-6 | happy | Run the learner's first program as class 01 says | It runs and prints what the page says | | NOT_TESTED |
| 4 | AC-2 | happy | For every example on pages 01–05: copy from the preview, run it as the page says, with the page's inputs | Output = the output printed on the page. Command + output pasted here | | NOT_TESTED |
| 5 | AC-2 | negative | Any example that reads input when the page gives no input to type | A finding: the page must say what to type for its output to be checkable | | NOT_TESTED |
| 6 | AC-2 | boundary | JavaScript examples shown beside the Python ones (SA option A: "shown, read-only") | Each JS example the page presents as code also runs with `node` and prints what the page says. Input in Node needs `readline`, not `prompt`, so a browser-only `prompt` in a "run with node" example is a finding | | NOT_TESTED |
| 7 | AC-3 | happy | Every exercise: solve it using only this page and earlier ones, run it, and compare with the expected result on the page | Matches. A FAIL names the exercise and what was missing | | NOT_TESTED |
| 8 | AC-3 | negative | Every exercise has an expected result written on the page (Requirement 4) | Present for every exercise. One without it is a finding | | NOT_TESTED |
| 9 | AC-4 | happy | Build the calculation program by following 01→04 in order, carrying the code forward as the pages say. Then run the final program with the inputs class 04 lists | Every feature that pages 01–04 promise works. Each feature is listed with its input and its output | | NOT_TESTED |
| 10 | AC-4 | regression | After each class, the program from the end of the previous class still runs before the new step is added | The learner never has a broken program between evenings | | NOT_TESTED |
| 11 | AC-5 | happy | Each page: the "steps 1-2-3 in plain Thai" section comes before the main problem's code | Present and before the code, on all 5 pages | | NOT_TESTED |
| 12 | AC-7 | negative | `grep -rEn` for phone, email, LINE, `@handle` and social URLs over the new pages and files. Then read every page in full and list the files | No personal data. The learner is never named or described beyond "ผู้เรียน" | | NOT_TESTED |
| 13 | AC-7 + Req 6 | negative | Read every page for สอบ / เกรด / คะแนน / เทอม / หน่วยกิต and for a technical term used before it is explained | No hit. Each hit is listed | | NOT_TESTED |
| 14 | Req 4 | negative | Each class page has: example code · ≥1 exercise with its expected result · its AI part | All three on every page (REQ-002 has no separate AC for this; it is checked here and reported under the AC it supports, AC-3) | | NOT_TESTED |
| 15 | AC-8 | regression | `git log --oneline`, `git status -sb`, `git branch -a`: read-only, no fetch | Root `54e1529` unchanged. Any newer commit is owner-ordered (hash in the log). No new branch | | NOT_TESTED |

**Deliberately not tested:** whether the lessons fit into 2 hours, and whether the owner can teach from them (AC-1,
the owner's). Also how good the AI answers are. The AI part is checked only for being present, and for the page not
asking the learner to paste personal data or keys into an AI.

## Defects

*(none — not run)*

## Observations (not ours)

- **OBS-1 (2026-11-12): `python` on this machine is the Windows Store alias stub, not a Python.** `where python` →
  `…\Microsoft\WindowsApps\python.exe`. Running it prints the "install from the Microsoft Store" message. There is no `py`
  launcher. It is not a defect in our work, but class 01's install steps should expect this on a learner's Windows (case 2).

## Test data created

None yet. Planned: solutions and a carried-forward calculation program under `ai-worker/tests/harness/test-002/`
(coordination repo only). If Q-QA-1 is approved, also a Python install on this machine; its end state will be recorded here.

## Verdict

Not run yet — DRAFT.

## Questions

- **Q-QA-1 (QA → PM; blocks cases 2–9 for the Python examples, not the draft):** this machine has no real Python (OBS-1).
  AC-6 means following class 01's install steps, which installs Python on the owner's machine (a download from
  python.org or the Microsoft Store). May QA do that install here when class 01 is ready? Default if not approved: AC-6 and
  every Python example are `NOT_TESTED` and the owner runs the click-script I write for him instead.
  > answer: **pending the owner** — installing on his PC is his to allow. The PM asks it together with REQ-001 AC-1
  > (2026-11-12). Until he answers, use your default.
- **Q-QA-2 (QA → PM; changes what TEST-001 checks):** `DECISIONS.md` 2026-11-12 keeps the **12-class** path as the
  course, while REQ-002 re-cuts classes 01–04 to the SA's option A topics and adds "05 for the bonus hour". In SPEC-001 §1,
  `classes/05-…` is **functions**, and the topics of 01–04 differ from option A's. So which titles do the schedule rows and
  folder names for 01–05 carry, and where does the bonus page live? TEST-001 AC-3/AC-5 (rows = folders, names match) and
  TEST-002's page list both depend on it.
  > answer: **PM 2026-11-12 `[PM-decided, from DECISIONS 2026-11-12]`** — the 12-class course is re-cut: classes 01–04
  > carry the SA's option A topics, 05–12 carry the remaining topics (the SA's revised SPEC-001 names them). The bonus
  > hour is **not** class 05 and not a schedule row; it is an extra page whose place the SA sets in SPEC-001. So
  > schedule rows = class folders = 12. REQ-002's "05 for the bonus hour" means that extra page.
