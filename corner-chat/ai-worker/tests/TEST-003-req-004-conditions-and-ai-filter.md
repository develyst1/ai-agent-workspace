# TEST-003: Each message is judged against the user's own conditions
- Team: A · TASKs: — (not cut yet; no SPEC)
- Source REQ: REQ-004 (ACs tested: AC-1 … AC-10, plus requirements 2(c), 5, 7)
- Status: DRAFT — designed 2026-11-01 from the REQ, before the build; no verdict before SPEC_DONE
- Build under test: `corner-chat-back`, `corner-chat-app` — branch and HEAD sha filled at run time
- Surfaces: local back end with the AI **stubbed** (exact cases) · local back end with the **real owner's gateway**
  (corpus, AC-6/AC-10; key B4 — not given yet) · Android app on emulator (reason, bar, corrections)
- Tested: — (designed 2026-11-01 by Tanya)

## Scope
- In: fixed rules decide with no AI call, rule order, bar logic at its boundary, the decision record, fail open,
  bar change, corrections, model as a setting, the about line, and the labelled corpus run.
- Risk call: **a wrong hold is the costly defect** (a real message the user never hears about). AC-5 (fail open) and
  AC-6 (0 wrong holds) get the most cases. Wrong passes are measured but cost less.
- Notification **delivery** (LINE push, app push) is REQ-003 / REQ-005, Team B's. Here "notify" is checked as the
  stored decision = notify and a notification handed to the sender side; the user actually receiving it is Tefany's.
- Not in this round: auto-reply, learning from corrections, per-channel bars, English (Out of Scope).

## Instrument limits
- **AI stubbed** (fixed %, malformed answer, timeout — seam: Q1): proves the code's decision logic exactly. Proves
  nothing about the AI's judgement.
- **Real gateway, corpus:** proves the judgement **on these 30 made-up messages, with these models and this prompt
  version** — not on real traffic. A model/prompt change voids the result until the corpus is re-run.
- Temperature 0 does not make a model deterministic; that is why each run is 3×.
- The about line "says what it is about" is a human judgement (PM + me), recorded as such, never as an automatic PASS.

## The corpus (AC-6, AC-10)
`tests/harness/corpus-req-004/corpus.md` — 30 made-up messages, one test user profile, **labels proposed by me,
to be confirmed by the PM before the first run** (Q2). Scoring method is in that file.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 "from sender → always notify" | happy | back end (AI-call log) | rule on sender X; message from X with ad-like text | notify; reason "กฎของคุณ: …"; **0 AI calls** for it | | | |
| 2 | AC-2 "contains 'โปรโมชั่น' → never notify" | happy | back end + app | message "มีโปรโมชั่นพิเศษ" | held, "กฎของคุณ: …", 0 AI calls | | | |
| 3 | AC-2 word spelt differently / as part of a word | boundary | back end | "โปรโมชัน" · "โปรโมชั่นส์" · "PROMOTION" for rule "promotion" | reported per matching rule chosen (Q3 default: plain substring, case-insensitive Latin) | | | |
| 4 | Rule kind "from this group → …" | happy | back end | LINE group rule | decided by the rule, 0 AI calls | | | |
| 5 | Two rules disagree | boundary | back end | "always" on sender X + "never" on a word, message matches both | Q3 default: **always notify wins** | | | |
| 6 | No rule matches | state | back end | — | goes to layer 1 then layer 2 | | | |
| 7 | AC-3 bar−1 | boundary | stub | bar 70, stub % = 69 | held | | | |
| 8 | AC-3 bar | boundary | stub | stub % = 70 | notify | | | |
| 9 | AC-3 bar+1 | boundary | stub | stub % = 71 | notify | | | |
| 10 | AC-3 ends | boundary | stub | bar 0 with % 0 · bar 100 with % 100 and 99 | notify · notify / held | | | |
| 11 | Req. 2(c) layer 2 runs even if layer 1 says spam | state | stub (call log) | stub layer 1 = spam | layer 2 is still called | | | |
| 12 | AC-4 record present | happy | app + back end | any AI-judged message | whole-number % 0–100, reason, summary, model per layer, prompt version, bar used; reason readable under "ทำไมถึงแจ้ง / ทำไมไม่แจ้ง" | | | |
| 13 | AC-4 AI returns 70.5 / "70%" / 120 / -5 / missing % | negative | stub | each | never stored as given: treated as a broken answer → fail open (AC-5) | | | |
| 14 | AC-5 gateway down | negative | local, gateway URL → closed port (Q1) | message arrives | notified, marked "AI ไม่ได้ตรวจ"; decision record says so | | | |
| 15 | AC-5 gateway times out | negative | stub (slow) | stub never answers | after the timeout: notified "AI ไม่ได้ตรวจ" — the timeout length recorded | | | |
| 16 | AC-5 broken answer | negative | stub | stub returns non-JSON / wrong shape | notified "AI ไม่ได้ตรวจ" | | | |
| 17 | AC-5 layer 1 ok, layer 2 down | negative | stub | — | notified "AI ไม่ได้ตรวจ" (nothing silently held, req. 7) | | | |
| 18 | AC-6 corpus run | statistical | real gateway | corpus × 3 runs, no fixed rules on the test user | **0 wrong holds on must-notify · ≤ 2 wrong passes · 0 flips on must-notify** at the bar found; per-message %s recorded | | | |
| 19 | AC-6 default bar | statistical | from #18's recorded %s | compute outcomes for every bar 0–100 offline | default = highest bar meeting the pass line; if **no** bar meets it → `TEST_FAILED` (not a bar to lower) | | | |
| 20 | AC-7 change bar | state | app | 70 → 80; a message the stub scores 75 | held under 80 (was notify under 70) | | | |
| 21 | AC-7 bar outside 0–100 / not whole | negative | app + API | 101, -1, 70.5 via API | refused at the server; app does not offer them | | | |
| 22 | AC-8 held → "แจ้ง" | state | app | correct a held message | moves to the notified list; correction recorded with who/when | | | |
| 23 | AC-8 passed → "ไม่ต้องแจ้ง" | state | app | correct a passed one | moves to held; recorded; nothing new sent | | | |
| 24 | AC-8 no learning | regression | stub | after #22, a similar message | judged as before (no auto-learning, D4) | | | |
| 25 | AC-9 model as a setting | happy | back end + app | change layer-1 and layer-2 model in settings, no code change, no rebuild | the next decision shows the new models | | | |
| 26 | AC-10 about line shape | happy | real gateway, corpus | all 30 | present, Thai, one line, ≤ 80 characters (Q4), form `[channel · group or sender] <summary>` | | | |
| 27 | AC-10 about line meaning | eye check | corpus | 10 samples, PM + me | says what it is about; no invented facts — recorded as a human check | | | |
| 28 | Isolation | regression | API | TEST-001 #8 for rules, sentences, bar, decisions | U1 never reaches U2's | | | |

## Defects
(none — not run)

## Observations (not ours)

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| corpus (30 made-up messages) | `tests/harness/corpus-req-004/` | kept — it is the regression gate (req. 9) |
| at run time: corpus text sent to the owner's gateway (outside providers) | owner's gateway | made-up text only (REQ-004 Constraints) |

## Verdict
Not run — `DRAFT`. Needs SPEC_DONE, the seam (Q1), B4 and the PM's confirmed labels (Q2).

## Evidence (decisive)
(at run time)

## Questions
(For the PM — answers as `> answer: ...`. Defaults are what I test if the answer is "yes".)
- **Q1 — test seams (for the SA, via you).** Cases #7–#17 need, on local only: **an AI stub mode** that returns a fixed
  %, a broken answer, or no answer per layer; and **the gateway URL as a setting**. Without them, AC-3 and AC-5 are
  `NOT_TESTED`. Same family as TEST-001 Q3 / TEST-002 Q1.
- **Q2 — corpus labels.** D6 says the team labels the corpus. I drafted 30 messages with proposed labels; the tester
  should not be the only one who sets the answer key she grades against. Default: **you confirm or change each label
  in `corpus.md` before the first run**; I do not run AC-6 on unconfirmed labels.
- **Q3 — rules.** (a) Two rules disagree → default **"always notify" wins** (nothing silently held, same spirit as D3).
  (b) "contains this word" → default **plain substring; Latin letters case-insensitive; no spelling variants** (the
  user adds both spellings). Checked: DECISIONS (AI filter shape — "a matching rule decides and wins") — the case of
  two matching rules is not covered.
- **Q4 — the 80 characters** (AC-10): default **the whole line, including `[channel · group or sender]`**.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction]`: Q1 → SA Team A (testability requirement:
> AI stub per layer — fixed % / broken / none — and the gateway URL as a setting). · **Q2 — labels: I read all 30 in
> `harness/corpus-req-004/corpus.md` and confirm every one as written (14 N / 16 H)**, `[PM-confirmed 2026-11-01]`;
> the owner may relabel later (D6). The pass line stays as REQ-004 AC-6. · Q3 (a) and (b) defaults accepted —
> "always notify" wins a tie; plain substring, Latin case-insensitive. · Q4 default accepted — whole line ≤ 80.
