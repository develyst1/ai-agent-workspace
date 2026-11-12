# SA: an 8-hour shape for the sold package (option for the owner's decision) — 2026-11-12, Sober

Written while SPEC-001 §4/§5 is ON HOLD (`inbox/SA.md`, Porter 2026-11-12). **SPEC-001 itself is not changed.** This is a
ready option so the owner's decision can land fast; the PM decides whether and how to show it. `[SA-proposed]`

Source: `talks/2026-11-12-learner-fastwork-chat-summary.md` — sold 8 h = 4 × 2 h, 2026-11-16..19, 18:30–20:30, + 1 h
bonus 2026-11-20 if reviewed; learner wants basics + algorithm thinking ("สเตป 1 2 3 … ถึงจะเห็นภาพ"), a calculation
program, AI is fine.

## Two ways to fit it — recommend A

- **A (recommended): the course *is* the 8 hours.** `programming-basics-ai/classes/` holds `01`–`04` + `05-bonus`.
  Matches what was paid; the schedule shows real dates. If the learner buys more hours later, classes `06…` append —
  nothing moves (SPEC-001 §7: only the class list and the schedule rows change).
- **B: keep the 12-class path as the catalogue** (= the 24 h / 4,500 THB tier) and mark this learner's 8 h as classes
  01–04. Cost: 4 classes' worth of content squeezed into slots titled for 1 topic each, or a schedule that does not
  match what the learner paid for. Only better if the owner wants the repo to show the full catalogue to the next buyer.

## Option A — 4 × 2 h + bonus, every class ends with something that runs

Thread through all four: **one small calculation program that grows each evening** (the learner's own wish), and every
topic starts as "steps 1-2-3 in plain Thai on paper" before code — the algorithm habit the learner asked for. Python is written;
JavaScript is shown beside each topic, read-only (keeps "the same in every language" and AC-4 without doubling the typing).

| Class | Date | Topic | After this class you can… | AI part |
|---|---|---|---|---|
| 01 | 2026-11-16 | From steps to a program: algorithm = recipe · tools · values, variables, input → calculate → output | write steps 1-2-3 for a problem and turn them into a first working calculator | ask AI to explain a line; what never to paste into AI |
| 02 | 2026-11-17 | Decisions and repetition: conditions, loops; tracing by hand | make the calculator choose (discount / VAT rules) and keep asking until "quit" | ask AI for test inputs; check its trace against yours |
| 03 | 2026-11-18 | Functions and lists; classic algorithms by hand: sum, max, search, sort | split the program into named pieces and keep a history of results | ask AI to trace a loop step by step; compare |
| 04 | 2026-11-19 | Finding mistakes + building with AI: read an error, break an idea into steps, AI writes a piece, you test it | finish "my calculation program" and know the path to a web or bigger project | the whole second hour |
| 05 (bonus, 1 h) | 2026-11-20 | Your own idea → a plan (conditional on the Fastwork review) | leave with your next project broken into steps 1-2-3 | plan it with AI |

Left out vs the 12-class path (fit a later package): dictionaries/objects, files/JSON, libraries/APIs.

## What changes in SPEC-001 if the owner picks A

§1 class list (5 folders), §4 (numbers + reasons), §5a "แผนการเรียน" and "เรียนจบแล้ว" bullets, §5b rows, §6 lines 1–2.
§2 format, §3 language table (rows 1–6 + 8 used), the folder rule and §7 hold. About 20 minutes of work once the owner answers.

## Open for the owner (via the PM)

1. A or B.
2. Does the repo show the real dates (they are not personal data, but they are this learner's timetable)? Default: no
   dates — "4 evenings × 2 hours" only, so the repo can be shown to the next buyer unchanged.
3. Class 01 starts 2026-11-16: the build (TASK-001) and the owner's push must land before then for the learner to use it.
