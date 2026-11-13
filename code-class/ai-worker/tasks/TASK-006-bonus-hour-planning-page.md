# TASK-006: Bonus hour page — plan your own idea
- Source: SPEC-002 (§3 "Bonus hour") and SPEC-001 §1 (`extras/`) for REQ-002
- Owner: FE (Fern)
- Status: DONE (2026-11-12, SA review)
- Due: 2026-11-19 (bonus hour 2026-11-20, only if the learner leaves a review)
- Depends on: TASK-001
- Git writes: **none**

## What to do

Replace `programming-basics-ai/extras/bonus-plan-your-own-idea.md` (TASK-001's placeholder) with the planning sheet:
- the five parts in SPEC-002 §3 "Bonus hour";
- the worked example "โปรแกรมบันทึกรายจ่าย" with all five parts filled;
- the AI prompt and what to check;
- an empty five-part template for the learner;
- a link back to the schedule.

There is no code file. Do not add the bonus page to the schedule table (SPEC-001 §1: it is not a class).

## Definition of Done

- [ ] `grep -c '^| [0-9][0-9] |' <repo>/programming-basics-ai/schedule.md` → still `12`.
- [ ] The worked example fills all five parts; in step ④, every topic it names exists in classes 01–04 or is marked
  `เรียนเพิ่ม`. List them in Implementation Notes.
- [ ] `check-links.sh` → only `check-done`. The VS Code preview renders the page; write what you saw.
- [ ] `git -C <repo> log --oneline` → still only `54e1529`.

## Implementation Notes

**Fern (FE), 2026-11-12.** Replaced `extras/bonus-plan-your-own-idea.md`; no other file was touched and there is no code file.
Page: intro (no new code; you leave knowing where to start and what to learn next) · the five parts (SPEC-002 §3) · worked example
"โปรแกรมบันทึกรายจ่าย" with all five filled · ช่วงใช้ AI (the SPEC prompt verbatim; checks: map each step to 01–04 or mark
เรียนเพิ่ม, split steps that are too big, compare with your own part 3; no personal/work data) · an empty five-part template · a link
back to the schedule. The Thai prose is mine, written from the SPEC; it needs the PM's word review.

Step ④ topics in the worked example (each class link is checked by check-links):
- `input` + `float()`: class 01 · `try`/`except` asking again: class 04 · `list` + `append`: class 03 · `while` + `break`: class 02 ·
  sum and largest: class 03.
- Marked **เรียนเพิ่ม**: name + amount as "ชื่อ: ค่า" (class 05), saving to a file (class 06).
- Part ⑤ (smallest version) uses only steps 1, 4 and 5, which are all class 01–04 topics.

```
$ grep -c '^| [0-9][0-9] |' <repo>/programming-basics-ai/schedule.md
12
$ bash code-class/ai-worker/tests/harness/check-links.sh <repo>
check-done
$ git -C <repo> log --oneline
54e1529 Initial commit
$ grep -nE '<[a-zA-Z]|สอบ|เกรด|นักเรียน|การบ้าน|<phone>|@…' <page>     # no HTML, school words or PII
(no output, exit 1)
```
- VS Code preview: **UNVERIFIED**. This session cannot drive the preview; QA's click-through settles it.

## Questions

## Review

**SA, 2026-11-12 — DONE.**
- Re-ran the checks: `grep -c` of the schedule rows → `12`; `check-links.sh` → `check-done`; `git log` → only `54e1529`.
- Read the whole page against SPEC-002 §3 "Bonus hour". It has the five parts, the worked example with all five filled
  in, the SPEC's AI prompt verbatim with the checks, an empty template, and a link back.
- Every step ④ topic maps correctly to classes 01–04 (`input`/`float` 01, `while`/`break` 02, `list`/`append` and
  sum/largest 03, `try`/`except` 04). Named data (05) and files (06) are marked เรียนเพิ่ม, and part ⑤ uses only steps
  that need 01–04.
- No code, no school wording, no personal data, and it is not added to the schedule.
- The VS Code preview is `UNVERIFIED`, accepted: it goes to QA's click-through. The Thai words await the PM's review.
- Security review: none needed. Markdown only.
