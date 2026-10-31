# REQ-009: Home "Ask the AI" — answer in the visitor's language, and answer reliably
- Status: DELIVERED (2026-11-01, Porter — on TEST-010 `TEST_PASSED`) · **SIGNED OFF 2026-11-01 by the owner: "ผ่าน"** (in chat, answering "Is the Ask AI language fix good to sign off?") · not committed, not deployed — §Delivery
- Priority: HIGH
- Requested: 2026-11-01 by the owner (Dong), in chat to Porter
- Deadline: none

## The ask, in his words `[operator]`

> *"ฉันอยากให้ พัฒนา เอไอ ที่ตอบหน้าเว็บให้ฉลาดขึ้น แต่นั้น ไม่ได้ยากหรอกมั้ง คือ ตอนนี้ ถามไทย แม่งตอบอังกฤษ นั่นคือ 1"*
> — owner, 2026-11-01

One sentence (Porter): a visitor who asks the Home AI in Thai must get a Thai answer; and the AI should be
"smarter" — what that means beyond language is Q1 below.

**This answers REQ-007 Q50** (open since 2026-09-09: which language does it answer in?). His word above settles
it: **mirror the visitor** — Thai in → Thai out. `[operator, 2026-11-01]`

## Problem / Goal

Thai visitors (Thai clients and employers are his market) ask in Thai and get English back, which reads as a
machine that did not listen. Goal: the answer reads like he would answer that visitor himself.

## Requirement

1. `[operator]` The answer is written in the language the visitor asked in: Thai question → Thai answer;
   English question → English answer. A question in any other language → English (Porter's default,
   `[PM-decided]`, cheap to change).
2. `[PM-decided, from Porter's own run on the live site 2026-11-01]` A question the AI can answer does not fail
   part-way. Seen: "Which databases have you worked with?" failed at step 2 with *"The AI gave an answer this
   step could not read"*, and the same chip pressed again answered fine (1 failure in 3 presses). Cause not
   known — the SA's to find; Porter states no cause.
3. `[PM-decided — Q1 may widen or cut]` The answer speaks as him, in the first person ("I built…"), not about
   the site ("The skills section lists…"). (Seen 2026-11-01 on the databases answer; OBS-14 named the same
   voice issue on 2026-09-13.)
4. `[PM-decided]` A source line under the answer shows plain text — no raw formatting marks (seen 2026-11-01:
   `- **Databases** — PostgreSQL · …`).

## Acceptance Criteria

- [ ] AC-a (R1): Given the Home page, when a visitor asks a Thai question about his work, then the answer is in
  Thai. **Check:** Tanya, one Thai question on a real gateway run, picture of the answer.
- [ ] AC-b (R1): Given the same, when the question is English, then the answer is English (regression).
  **Check:** Tanya, one English question, picture.
- [ ] AC-c (R2): The step-2 failure seen on 2026-11-01 is either reproduced and fixed, or shown to be a
  gateway/provider fault with what the visitor sees stated. **Check:** Sober's finding in the SPEC; Tanya re-runs
  the databases question.
- [ ] AC-d (R3): Answers to the two Home chips read in the first person. **Check:** Tanya, pictures.
- [ ] AC-e (R4): No `**` or other raw marks in any source line on the answers above. **Check:** Tanya, page text.
- [ ] AC-f: Real calls stay inside a ledger the SA writes before any run (same rule as SPEC-007). **Check:** Sober.

## Constraints

- Calls go through his gateway `https://ai.develyst.online` as today (REQ-006). Every real question spends his
  money — the SA sets the call budget before any test (SPEC-007 §Call ledger pattern).
- No usage cap and no storage this REQ (Q38 / Q44 stand).
- The team never touches production: the live site is his hands (PROTOCOL). Delivery = files on the repo.

## Out of Scope

- Fresh content for the AI to answer from — that is the admin system, **REQ-010**. Until REQ-010, the AI
  answers from the same profile files as today.
- Translating the site itself into Thai.

## QA brief — 2026-11-01, Porter → Tanya

Test REQ-009 AC-a…e from this REQ, not from the build. Real calls: SPEC-009 §Call ledger rows 11–25 are yours —
**three presses only, planned 9, hard cap 15**, run setup exactly as that row says (local `back/` working tree on
defaults, built `front/` with `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws`, real browser). Never production.
1. A Thai question of yours about his work → AC-a (Thai answer, ผม/ครับ voice per SQ42 default), AC-e.
2. Chip "Can you build a realtime site with WebSocket?" → AC-b (English), AC-d (first person), AC-e.
3. Chip "Which databases have you worked with?" → AC-c re-run, AC-d, AC-e.
Report: verdict per AC, pictures, the back log's `calls=` and every `[chain] … step=2 …` line (Sober reads them for
AC-c). A technical failure is the result — record it, no re-press. AC-f is Sober's ledger, not yours.

## Delivery — 2026-11-01, Porter

All 6 AC ticked: AC-a/b/c(re-run)/d/e on tests/TEST-010-req009-visitor-language-real-gateway.md (`TEST_PASSED` 7/7,
0 defects, `calls=9` of cap 15), accepted as written; AC-f = 9 ≤ 15 on SPEC-009 §Call ledger (rows to fill: Sober).
- **AC-c caveat (QA's own words, kept):** one press shows the fix holding; it cannot prove the old 1-in-3 rate is gone.
- **Not tested:** production (never in scope); off-topic Thai (SQ43 — English by design until he approves a sentence).
- **Lives only in the repo working tree on `D1`, uncommitted.** The live site still answers in English until he
  commits and deploys (his hands). Front still needs SQ40 or `NEXT_PUBLIC_ASK_WS_URL` set at build.
- For him at sign-off: OBS-17 (Thai answer keeps English phrases like "walk-in visitors"), OBS-18 (source excerpts cut
  mid-sentence), OBS-16 again (repeated source labels), OBS-19 (Thai answer took 15.6 s vs ~4 s).

## Questions

**Q1 (owner, non-blocking — R1 proceeds regardless) — "ฉลาดขึ้น" beyond language.** Porter's default is
R2 + R3 + R4 above. Anything else he means (longer answers, answering about things not on the site, remembering
the conversation) is his to add; until he does, the defaults stand.
