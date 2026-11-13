# TEST-001: req-001-first-release
- Source REQ: REQ-001 (`../requirements/REQ-001-god-plan-first-release.md`, ACs as of 2026-11-08 incl. AC-11..17; decisions D1–D16 in `../talks/BRAINSTORM-2026-11-08-req-001-open-decisions.md` §Outcome)
- Status: **TEST_PASSED on the real `god_plan` back (round 5, 2026-11-09 22:31–23:26 local): DEF-2 and DEF-3 closed.** Still NOT_TESTED: a real phone, keyboard and screen reader. See §Round 5. ~~TEST_FAILED (round 4, 2026-11-09) — DEF-2 MAJOR on the real `god_plan` back (sign-in fails in bursts with 500 INTERNAL); DEF-3 MINOR.** The PGlite regression of the refactored trees passed. See §Round 4. ~~TEST_PASSED, scoped: local · PGlite · stand-in gateway (round 3, 2026-11-09) + D11 live AI run 4/4 PASS (2026-11-09 14:55).~~ DEF-1 was not reproduced while the machine was quiet. **NOT_TESTED** list unchanged. See §Round 3 and §Verdict. ~~TEST_FAILED (round 2, 2026-11-08) — AC-8, DEF-1~~ ~~TEST_PASSED, scoped (round 1)~~
- Build under test (round 3): back unchanged (`277bcc9`, tree `0c35bb045e54`). Front `a41cbd0` + uncommitted tree `3650621bb7af` (after TASK-014: own `src/app/api/[...path]/route.ts`; `grep -c rewrites next.config.ts` → 0).
- Build under test (round 2): back unchanged (`277bcc9`, tree `0c35bb045e54`). Front `a41cbd0` + uncommitted tree `be1fb93c1caa` (after TASK-013; `src/lib/api.ts` md5 `8af1b6ae`).
- Environment (round 1): local. Front `next dev -p 4300` → real back on `harness/back-pglite` (in-memory PGlite, `INVITE_TTL_SECONDS=60`) → `harness/gateway-stub` :4399. **Not** the `god_plan` dev database (TASK-001 not run). No live gateway.
- Build under test (round 1): `god-plan-back` branch `atom` HEAD `277bcc9`, uncommitted tree; content hash of the 37 tracked + untracked files = `0c35bb045e54`. `god-plan-front` branch `atom` HEAD `a41cbd0`, uncommitted tree, 32 files, hash `4d07bf86dab0`. (Hash = `git ls-files -co --exclude-standard | sort | xargs sha256sum | sha256sum`.)
- Tested: 2026-11-08 20:3x–22:0x by Tanya (QA). Headless Google Chrome via `harness/cdp.mjs` at 1280×900 and 375×812 (emulated phone); API cases with Node fetch.

## Scope
Our team's change only: `god-plan-back` + `god-plan-front` as built from SPEC-002 / TASK-002..009. AC-10 (comp) is the owner's, not run here.
Surface: desktop web 1280 px and mobile web 375 px (Chromium, Playwright harness in `harness/`). Evidence: screenshots + recorded API responses + stand-in logs, under `harness/out/TEST-001/<round>/`.

## Prerequisites — what the build must give me (asked of the SA via the PM)
| # | Need | Why / AC | If missing |
|---|---|---|---|
| P1 | The stand-in gateway with modes **ok · 500 · hang > 30 s · empty/malformed**, switchable without a code change | AC-7, AC-8, AC-9 (D11) | those cases NOT_TESTED |
| P2 | The stand-in **records every request body and counts calls**, readable by me (file or endpoint) | AC-11, AC-12 | AC-11/12 NOT_TESTED |
| P3 | **Invite-link lifetime configurable** (env) — I set ~1 min locally | AC-13 expiry (D8) | expiry case NOT_TESTED |
| P4 | The **owner-create command** (D14) run with a synthetic owner on dev; I get his sign-in through a git-ignored local file, never in a tracked file | every AC | stop — no owner, no round |
| P5 | `.env.example` lists every key with one line each (workspace rule 4) | setup | reported as a finding |

## Test people — synthetic only (Req 9)
| Id | Role | Email (sign-in name) |
|---|---|---|
| O | owner (D14 command) | `owner@gp.example.test` |
| A | invited to P (and later Q) | `a.tester@gp.example.test` |
| C | invited to P | `c.tester@gp.example.test` |
| B | never invited to P (invited to Q only, so B has an account) | `b.tester@gp.example.test` |
Reserved `.test` domain: even an accidental send reaches nobody. Display names `ทดสอบ A`, `ทดสอบ B`, `ทดสอบ C`.

## Cases
Types: H happy · N negative · E edge/boundary · S state · R regression. All results start NOT_TESTED.

| # | AC | Type | Steps (as) | Expected | Actual | Result |
|---|----|------|------------|----------|--------|--------|
| 1 | AC-1 | H | O: create project P, then tasks T1, T2, T3 | P listed; T1–T3 listed, each ยังไม่เริ่ม | | NOT_TESTED |
| 2 | AC-1/D16 | E | O: project name of exactly 100 chars; then 101 | 100 saved; 101 refused with the limit message | | NOT_TESTED |
| 3 | AC-2 | H | O: T1 → ติดอยู่ with reason "รอผลตรวจ"; then view as A and as C | Stuck + reason shown to O, A, C | | NOT_TESTED |
| 4 | AC-2a | N | O: T2 → ติดอยู่ with empty reason; also reason of only spaces | refused; T2 keeps its old status | | NOT_TESTED |
| 5 | AC-3a | H | O: copy invite link for A; A (fresh browser) opens it, sets 8-char password, signs in | A sees P; stand-in/app logs show no mail sent; `.env.example`/config has no mail key (static — labelled so) | | NOT_TESTED |
| 6 | AC-3a/D7 | N | A sets a 7-char password | refused | | NOT_TESTED |
| 7 | AC-3 | H | A signs out, signs in with `A.Tester@GP.example.test` (other case) | sign-in works (case-insensitive); A sees P, tasks, statuses, blockers | | NOT_TESTED |
| 8 | AC-4 | N | B signs in; looks at the project list | P absent | | NOT_TESTED |
| 9 | AC-4 | N | B opens P's address directly; B calls P's project/tasks/comments API directly | no P name, task or comment in page or response body (saved as evidence); page is Thai (D6) | | NOT_TESTED |
| 10 | AC-4/D3 | N | B requests P's summary and "สรุปใหม่" by direct request | refused; stand-in call count unchanged (0) | | NOT_TESTED |
| 11 | AC-4 | N | signed-out browser opens P's address and API | sign-in page / refused; nothing of P | | NOT_TESTED |
| 12 | AC-5 | H | A comments on T1; view as O and as C | comment shows "ทดสอบ A" + time (Asia/Bangkok, matches clock ±1 min) | | NOT_TESTED |
| 13 | AC-6 | N | A: look for create-project / create / edit / delete task controls | none on screen (both widths) | | NOT_TESTED |
| 14 | AC-6 | N | A: direct requests — create project, create task, edit task, change status, delete task | each refused; P unchanged (before/after snapshot) | | NOT_TESTED |
| 15 | AC-7 | H | stand-in ok; O asks AI to break P2 (name + description) into tasks | proposal list shown; P2 unchanged | | NOT_TESTED |
| 16 | AC-7 | H | O unticks 2 items, edits 1 title, saves | exactly ticked items added as ยังไม่เริ่ม, edited title as edited; unticked absent | | NOT_TESTED |
| 17 | AC-7 | N | while proposal unsaved, A opens P2 | A sees no proposed items | | NOT_TESTED |
| 18 | AC-7a/D10 | S | O leaves the proposal unsaved; returns; asks again | nothing added; new proposal has none of the first one's items | | NOT_TESTED |
| 19 | AC-8 | N | gateway URL → nothing listening; O asks AI tasks, then summary | gateway-error message ≤ 30 s (timed); project unchanged | | NOT_TESTED |
| 20 | AC-8 | N | stand-in 500; repeat both AI actions | same message ≤ 30 s; unchanged | | NOT_TESTED |
| 21 | AC-8 | N | stand-in hang > 30 s | message shown by 30 s (timed), not a spinner past it; unchanged | | NOT_TESTED |
| 22 | AC-8 | N | stand-in `empty` (200, content "") and `malformed` (HTTP 200, body not valid JSON — SPEC-002 §Testability, amended 2026-11-08); each for **both** AI tasks (G1) and สรุปใหม่ (S2) | same message on both; nothing saved; stored summary unchanged | | NOT_TESTED |
| 23 | AC-9 | H | P with mixed statuses, two ติดอยู่; open summary screen as O, then as A | both Stuck tasks + reasons listed exactly as in P; last stored summary + time, or "none yet"; **0 calls** on opening | | NOT_TESTED |
| 24 | AC-9 | S | A presses สรุปใหม่ | exactly 1 call; new summary replaces old with new time; O sees the same stored one without a call | | NOT_TESTED |
| 25 | AC-11/D1 | S | open project + summary screens, idle 5 min (timed) | 0 calls; then one press → 1 call | | NOT_TESTED |
| 26 | AC-11/D1 | E | press AI button rapidly 12 times in 1 min | ≤ 1 call in flight per project; ≤ 10 accepted per person per min; no auto-retry | | NOT_TESTED |
| 27 | AC-12/D2 | N | plant markers `MRK-COMMENT-7731` (comment), `MRK-NAME-7731` (A's display name), `MRK-MAIL-7731@gp.example.test` (an invitee's email); run AI tasks + summary | 0 hits in recorded request bodies; project name/description/titles/statuses/reasons present (what D2 says is sent) | | NOT_TESTED |
| 28 | AC-13/D8 | N | A2 uses an invite link once; opens it again | refused with invite-link message | | NOT_TESTED |
| 29 | AC-13/D8 | N | lifetime set short (P3); open link after it | refused | | NOT_TESTED |
| 30 | AC-13/D8 | N | O makes link L1 for A3, then L2 for A3; open L1 | L1 refused; L2 works | | NOT_TESTED |
| 31 | AC-18 | N | A signed in; opens an unused invite link made for A4; then A4 (fresh browser) opens the same link | A sees "ตอนนี้เข้าระบบอยู่ในชื่อคนอื่น ออกจากระบบก่อนแล้วเปิดลิงก์นี้อีกครั้ง"; A's projects unchanged; A4 can still use the link | | NOT_TESTED |
| 32 | AC-14/D13 | H | A (account from P) opens invite link for Q | signs in with existing password; sees P and Q; no second account (A's sign-in still one person) | | NOT_TESTED |
| 33 | AC-15/D9 | H | O makes reset link for A; A sets new password | old password fails; new works | | NOT_TESTED |
| 34 | AC-15 | N | reset link used twice | second use refused | | NOT_TESTED |
| 35 | AC-16/D15 | N | empty comment; comment of spaces only | refused with message | | NOT_TESTED |
| 36 | AC-16/D16 | E | comment 2,000 / 2,001 chars; task title 200 / 201; Stuck reason 500 / 501; description 2,000 / 2,001 (Thai text) | at limit saved; over limit refused with message | | NOT_TESTED |
| 37 | AC-16/D15 | N | comment `<script>alert(1)</script><b>x</b>` as A; view as O | shown as literal text; no dialog, no bold | | NOT_TESTED |
| 38 | D15 | N | A tries to edit / delete own comment (screen + direct request) | no way to do it | | NOT_TESTED |
| 39 | AC-17/D12 | S | T1 ติดอยู่ with reason → กำลังทำ; view as O and A; then back to ติดอยู่ | reason gone; back to Stuck asks for a new reason | | NOT_TESTED |
| 40 | D5 | S | O moves a task เสร็จแล้ว → ยังไม่เริ่ม | allowed | | NOT_TESTED |
| 41 | D6 | E | visit an unknown address; force an error page | Thai 404 / error page; any English left on screen listed | | NOT_TESTED |
| 42 | D14 | N | look for public sign-up page / call sign-up API | none exists / refused | | NOT_TESTED |
| 43 | all | E | repeat 1, 3, 12, 23 at 375 px | usable; nothing off-screen (hit-test + screenshot) | | NOT_TESTED |
| — | AC-10 | — | the owner's eye on the comp | not QA's | | n/a |
| — | AI wording quality (AC-7, AC-9 live) | — | needs the D11 live run (4 calls) | — | | NOT_TESTED until owner says yes |

## Dry run 2026-11-08 19:4x — harness check, NOT a verdict
- **Why not a verdict:** REQ-001 is not at SPEC_DONE, the front is still in build, and this is **API level only**. It proves what the back does, not what a person sees on the screen. Every case above stays NOT_TESTED until the UI round.
- **Build:** `god-plan-back` on branch `atom`, HEAD `277bcc9` + uncommitted working tree (`git diff HEAD | sha256` = `dc5ffc333b05`). It ran on `harness/back-pglite/serve.ts` (in-memory PGlite, TASK-011) with `INVITE_TTL_SECONDS=60`, plus `harness/gateway-stub/` on 127.0.0.1:4399. The front was not used.
- **Harness:** `harness/test-001-api.mjs <round>`. It refuses any host that is not 127.0.0.1. It reads the seed passwords from the environment and never prints them. Evidence: `harness/out/TEST-001/<round>/results.json`, plus `case27-calls.json` (the stand-in's recorded request bodies).
- **dry-run-1:** 33 PASS · 1 FAIL · 1 NOT_TESTED. The FAIL (case 27) was **my harness**, not the build. Earlier cases had used up the owner's 10 AI presses per minute (D1 guard), so the second call got 429. Case 26 hit the same thing (200×0). Fix: the harness now waits 61 s before the cases that count calls.
- **dry-run-2, on a fresh back:** **34 PASS · 0 FAIL · 1 NOT_TESTED** (case 37: the API stores the HTML exactly as typed; whether it shows as plain text can only be checked on screen).
- **API-level cases run:** 1–4, 6, 8–12, 14–16, 20–24, 26–34, 36–40, 42.
- **UI-only, not run:** 5, 7, 13, 17, 18, 19 (gateway address pointed at nothing), 25 (5 min idle with the screens open), 37 (rendering), 41, 43.
- **Notes for the UI round:**
  - With the stand-in in `hang` mode, the back gave up at about **25 s** (25 005 ms) and returned 502 `AI_UNAVAILABLE`. That is inside AC-8's 30 s, but the screen time still needs measuring.
  - ~~The 429 from the D1 guard has no wording in REQ-001's table yet.~~ **Wrong — corrected 2026-11-08 19:59 (F-007):** REQ-001 lines 129–130 already have `RATE_LIMITED` "กดถี่เกินไป รอสักนาทีแล้วลองใหม่" and `AI_BUSY` "AI กำลังทำงานให้โปรเจกต์นี้อยู่ รอสักครู่แล้วลองใหม่". In the UI round, case 26 checks that the screen shows those exact strings.

## Round 1 — 2026-11-08, REQ-001 at SPEC_DONE — results
What it can prove: behaviour of the **real** back and front (no mock in the path), on PGlite, against the stand-in gateway.
What it cannot prove: the real Postgres, live AI wording, a real phone, keyboard or screen-reader use.

**Runs.** All harnesses are in `harness/`. Evidence is in `harness/out/TEST-001/<run>/` (`results.json` + screenshots).
| Run | Harness | Result |
|---|---|---|
| ui-1 | `local-test-001-ui.mjs` | 2 PASS · 1 FAIL · 23 HARNESS_ERROR — **the harness was at fault**: it read pages while they were still loading. Fix: wait until the page settles. Not counted. |
| ui-2 | same, fresh back | 27 PASS · 3 FAIL. Case 5 and case 3c: the harness again read before the page loaded (screenshot `05-ac3a-joined.png` shows skeletons). Case 21: see OBS-1. |
| **ui-3** | same, fresh back | **30 PASS · 0 FAIL** |
| case19 | `local-test-001-case19.mjs`, stand-in stopped | PASS. Error after 3 ms (G1) and 1 ms (S2); tasks and summary unchanged. |
| case25 | `local-test-001-case25.mjs` | PASS. 304 s idle with the project and summary screens open → **0 calls**; one press → **1 call**. |
| gaps | `local-test-001-gaps.mjs` | PASS. AC-16 messages on screen (empty, comment > 2000, title > 200); AC-14 through the invite screen. |
| **api-r1** | `test-001-api.mjs`, fresh back | **34 PASS · 0 FAIL · 1 UI-only** (case 37, which passed in ui-3) |

**By AC.** Every case named was PASS in the run(s) named.
| AC | Cases → runs | Result |
|---|---|---|
| AC-1 | 1 (ui-3, api) · 2 (api) | PASS |
| AC-2 | 3o, 3c (ui-3) · 3 (api) | PASS |
| AC-2a | 4 (ui-3, api) | PASS |
| AC-3 | 7 (ui-3: A signs in with an upper-case email and sees statuses and blockers) | PASS |
| AC-3a | 5 (ui-3) · 6 (api) · no mail key in either `.env.example` and no mail library in `src`/`package.json` (**static** check) | PASS |
| AC-4 | 8, 9, 9s, 11 (ui-3) · 8–11 (api; summary press as B → 404, 0 calls) | PASS |
| AC-5 | 12 (ui-3: owner and C see A's comment with A's name and the Bangkok time 21:05) · 12 (api) | PASS |
| AC-6 | 13 (ui-3: no controls on screen) · 14 (api: 8 direct requests → 403, P1 unchanged) | PASS |
| AC-7 | 15, 16, 17 (ui-3; 17 used a second browser as invitee A4) · 15, 16 (api) | PASS (stand-in) |
| AC-7a | 18 (ui-3) | PASS |
| AC-8 | 19 (case19) · 20, 21, 22a, 22b (ui-3: hang → error at 24.9 s on both buttons) · 20–22b (api) | PASS (stand-in). **OBS-1** below |
| AC-9 | 23, 24 (ui-3: A opens → 0 calls; presses → 1 call; owner sees the same stored summary with 0 calls) · api | PASS (stand-in) |
| AC-11 | 25 (case25) · 26 (ui-3: Thai rate message after 10 presses, calls = 10) · 26 (api) | PASS |
| AC-12 | 27 (api: 0 marker hits in recorded gateway bodies; project name present) | PASS |
| AC-13 | 28 (ui-3, api) · 29 expiry at 60 s (api) · 30 new link cancels old (api) | PASS |
| AC-14 | 32 (api; gaps through the screen) | PASS |
| AC-15 | 33 (ui-3, api: old password fails, new works, old session signed out) · 34 (api) | PASS |
| AC-16 | 35, 36 (api; gaps on screen) · 37 (ui-3: `<script>`/`<b>` shown as text, no script run) · 38 (api: no comment edit/delete) | PASS |
| AC-17 | 39 (ui-3 as owner and A; api) | PASS |
| AC-18 | 31 (ui-3: A sees the signed-in-as-someone-else message; A4 then uses the link) · api | PASS |
| AC-10 | the owner's (layout B, 15:53, per SPEC-002 §Close-out) | not QA's |
| D5 / D6 / D14 | 40 (api) / 41 (ui-3: Thai 404) / 42 (api: no sign-up route) | PASS |
| Phone 375 | 43 (ui-3): no sideways page scroll on board, summary or members pages. The columns swipe inside their own container (`overflow-x: auto`, 1216 px wide in a 343 px box). The status, comment, send and AI buttons each pass the hit test. | PASS — **emulated**, not a real phone |

### OBS-1 — case 21 (stand-in `hang`, the "ให้ AI ช่วยแตกงาน" button) failed once in four runs; not reproduced since
- **ui-2:** after 35 s the button still read "AI กำลังคิด…" and no error text had appeared (screenshot `ui-2/21-ac8-hang-tasks.png`). In the same step, "สรุปใหม่" showed the error at 24.9 s.
- **Since then it passed every time:**
  - in isolation, in a browser: 25.2 s (`repro-21-ui.png`);
  - replaying 500 → empty → malformed → hang in the same browser: 25.1 s;
  - the full ui-3 round: 24.9 s.
  - Through the front's `/api` proxy and directly on the back, all three AI calls answered 502 at about 25 s.
- **Not a defect report:** I cannot reproduce it from a clean state, and I propose no cause.
- **Not passed over either:** the owner would see a spinner past the 30 s AC-8 promises. If it happens again, the repro script is `harness/repro-case21-ui.mjs` (`SEQ=` replays earlier modes first).

## Round 2 — 2026-11-08 ~21:5x–22:5x, re-test after TASK-013 (PM's ask: AC-8 cases 19–22b, case 21 ×4, ui regression)
Same setup as round 1: front `next dev -p 4300` → back-pglite :4310 → gateway-stub :4399. Front build: see the header.
| Run | Result |
|---|---|
| **ui-4** (full ui regression, fresh back) | 29 PASS · **1 FAIL: case 21**. After 35 s there was still no error on screen and the button was enabled again. The screenshot, taken just after, shows the error had just appeared (`ui-4/21-ac8-hang-tasks.png`). |
| case 21 ×4, isolated (`repro-case21-ui.mjs`, fresh browser each time) | runs 1, 2, 4: error at 25.2 / 25.2 / 26.6 s. **Run 3: the task-proposals request ran 40,489 ms and ended with status 0 (network failure); error shown at 40.6 s.** |
| case 19 (stand-in stopped) | PASS: error after 4 ms / 3 ms; nothing changed |
| cases 20, 22a, 22b (ui-4) | PASS |
| TASK-013 recipe (`task-013-recipe.mjs`, front → `stall-body` :4312), run by me | PASS for that path: error and button re-enabled at 28,532 ms; board 6/6 unchanged. **TASK-013's own gap is closed.** |
| Layer isolation (`repro-def1-proxy.mjs`, 3 runs × 3 calls per layer, stand-in `hang`) | **Direct to the back: 9/9 → 502 `AI_UNAVAILABLE` at 25.0 s.** **Through the front's `/api` proxy: 4/9 at about 25 s, 5/9 late:** 500 "Internal Server Error" after 42.2 / 54.2 / 58.6 / 172.7 s, and 502 after 236.7 s. The front dev log has `Failed to proxy http://127.0.0.1:4310/api/projects/…/ai/task-proposals Error: socket hang up (ECONNRESET)` 10 times in this session. |

**OBS-1 is now reproduced. It is DEF-1.**

## Round 3 — 2026-11-09 13:10–13:45 (06:10–06:45 UTC), after TASK-014, with `timer-stall-detector.mjs` running beside every run (Q-F6)
**The rule applied (Q-F6, SA via the PM):** a late call while the detector is quiet is a real defect. A late call during a logged stall is the machine. All times below are UTC. Each detector line is logged when the stall ends.
| Run | Calls | Detector |
|---|---|---|
| `repro-def1-proxy.mjs` ×3 (stand-in `hang`), **direct to the back** | 9/9 → 502 `AI_UNAVAILABLE` at 25.0 s | quiet during all 9 |
| same, **through the new `/api` route** | **4 on time:** 25.7 / 25.0 / 25.0 / 25.1 s, detector quiet. **1 at 26.9 s:** an 8.3 s stall ended at the same second (06:19:19). **4 late:** 504 `UPSTREAM_TIMEOUT` after 40.3 / 247.3 / 131.4 / 302.3 s, ending 06:12:39 / 06:16:46 / 06:21:31 / 06:28:39 | stalls of **28.1 / 236.4 / 110.3 / 287.8 s**, logged at 06:12:39 / 06:16:46 / 06:21:29 / 06:28:39, one inside each late call, ending with it. Late call minus stall = 12–14.5 s for each. |
| `repro-case21-ui.mjs` ×4 (browser) | runs 1, 2, 4: error on screen at **25.2 / 25.2 / 25.2 s** (request 25.0–25.1 s). Run 3: no error within its window (92 s). | quiet for 1, 2, 4. **Run 3: an 80.5 s stall ended 06:32:14**, 2 s before the run ended. |
| **ui-5** (full ui regression, fresh back; the new route carries every sign-in, cookie and sign-out) | **30/30 PASS**. Case 21: error at 24.8 s on both AI buttons. | 2 stalls (207.0 s ending 06:38:20, 174.3 s ending 06:43:47). Neither fell in a timed case: all timed cases passed within their limits. |

**Reading:**
- **No late call while the detector was quiet:** 9 direct, 4 proxy, 3 browser presses, and every timed case in ui-5.
- **Every late call contained a stall that ended when the call ended.** With the stall subtracted, each one finished in about 13 s.
- **DEF-1 is not reproduced on this build.** Its round-2 occurrences had no detector beside them, so they cannot be told apart from stalls now. The cause is not established (TASK-014 §Review agrees).

**OBS-2 — this machine pauses for up to 288 s (round 3: 8 stalls in about 35 min).** Timing results here are valid only for stretches where the detector is quiet.
- **Correlation only, not established as a cause:** every stall overlapped activity that involved the front (proxy calls, browser runs, ui-5). None overlapped the 9 direct calls. The direct calls covered only about 225 s against about 25 min of front-involved time, so this proves nothing yet.
- **Machine state at 13:28 (read-only):** 2.4 GB of 16 GB available, no swap, load average 10.0 on 8 cores, many agent sessions running on this box.
- The detector's `ps` elapsed time was 17:24 after about 35 min of wall clock. That fits whole-machine pauses, but I am not interpreting it further.

## D11 live run — 2026-11-09 14:55 (07:55:31–07:55:57 UTC), exactly 4 live gateway calls
- **Authority:** owner 2026-11-09 14:52, *"ให้เรียก AI จริง 4 ครั้งได้"* (DECISIONS.md line 27): exactly 4 calls, AC-7 ×1 and AC-9 ×3. Synthetic data. An error counts toward the 4.
- **Setup:** front `next dev` → back-pglite (fresh seed) → **`harness/live-gateway-cap.mjs` on :4399** → `https://ai.develyst.online/chat`.
  - The forwarder passes calls 1–4 to the live gateway and refuses a 5th without forwarding it. It logs every request and answer to `out/TEST-001/d11-live/calls.jsonl`.
  - The presses were made through the screens (`harness/local-test-001-d11-live.mjs`), as the owner, each pressed once.
  - Same front and back trees as round 3. The stall detector was quiet throughout.
- **Count: forwarded 4, refused 0.** All 4 answered HTTP 200 from `deepseek` / `deepseek-flash`, in 5.0 / 2.0 / 2.7 / 2.5 s. Tokens: 530 + 367 + 399 + 409 = 1,705 in total.
- **What was sent (AC-12 / D2, live path):**
  - G1 sends the project name and description.
  - S2 sends the project name plus each task's title, status and Stuck reason.
  - None of the seed's names (สมศรี, สมชาย, เจ้าของทดสอบ), no `@godplan.test` email, no comment text and no `displayName` appear in any of the 4 request bodies.

| Press | AC | On screen | Reading |
|---|---|---|---|
| 1 | AC-7 | Proposal panel after 5.3 s: **15 Thai task titles**, e.g. วางแผนและจัดงบประมาณ · จัดหารถขนย้าย · แพ็คของใส่กล่อง · แจ้งย้ายบริการสาธารณูปโภค · ทำความสะอาดบ้านใหม่ · คืนกุญแจบ้านหลังเก่า · ฉลองขึ้นบ้านใหม่ (`ac7-proposal.png`) | **PASS.** Short, Thai, on-topic for "ย้ายบ้านใหม่", within 1–20 items and 200 characters. I pressed ยกเลิก, so nothing was saved. **OBS-3:** see below. |
| 2–4 | AC-9 | Each press: a new summary with a new time, beside the data-backed Stuck list (`ac9-summary-1..3.png`) | **PASS ×3.** Every run names **both** Stuck tasks with their **exact** reasons (ย้ายอินเทอร์เน็ต / รอช่างนัดวัน; โอนทะเบียนบ้าน / รอเอกสารจากเจ้าของเดิม). The other statuses are stated correctly (packing in progress, old-house cleaning done, truck booking not started). Each is 3–5 plain Thai sentences, as the prompt asks. **OBS-4:** see below. |

- **OBS-3 (product question, not a fail):** G1 sends only the name and description, so the proposals ignore the tasks already in the project. About 3 of the 15 overlap existing ones: จัดหารถขนย้าย ≈ จองรถขนของ, แพ็คของใส่กล่อง ≈ แพ็คของห้องนอน/ห้องครัว, แจ้งย้ายบริการสาธารณูปโภค ≈ ย้ายอินเทอร์เน็ต. AC-7 is met, because the owner unticks what he doesn't want. Whether he would want the AI to know the existing tasks is his call.
- **OBS-4 (not a fail):** the prose adds an overall judgement that is not in the data, and it varies between runs: "ภาพรวมคืบหน้าดี" (run 2) vs "ความคืบหน้าอยู่ในระดับกลาง" (run 3). The facts were correct in all 3 runs.
- The owner's own eye on the wording is still his (AC-10 spirit). These 4 answers are kept verbatim in `calls.jsonl` for him or the PM to read.

## Round 4 — 2026-11-09 15:59–17:46 (08:59–10:46 UTC): regression after the SPEC-003 refactor (TASK-016/017), on PGlite and on the real `god_plan` back
- **Build:** `god-plan-back` `277bcc9` + tree `cb00b41404eb`; `god-plan-front` `a41cbd0` + tree `5bc5b373d182` (re-checked unchanged at the end). The front ran `next dev` with `BACK_ORIGIN=http://127.0.0.1:4310` (now required). The stall detector ran beside every run. No live AI (the owner's 4 calls are used up; TASK-015's live switch was not used).

### Part 1 — PGlite (back-pglite + gateway-stub): **all pass**
| Run | Result | Detector |
|---|---|---|
| api-r4 (`test-001-api.mjs`) | **34/34 PASS** (case 37 is UI-only) | one 85.5 s stall, in no timed case |
| ui-6 (`local-test-001-ui.mjs`) | 29/30. Case 21's summary press showed no error within 35 s. | stalls of 132 s and 150 s; the second very likely covered case 21 (case 24's summary stamp is 16:11, just after it ended). This harness records no per-case times, hence the next run. |
| AC-8 hang ×4, both buttons, with UTC times (`local-test-001-ac8-hang.mjs`) | **5 presses with the detector quiet: error at 25.1–25.3 s, PASS.** 3 presses LATE: G1 #1 ended 09:15:14, S2 #1 ended 09:17:49, S2 #4 ended 09:22:57. | stalls of 79.4 s, 143.1 s and 171.7 s, ending 09:15:14, 09:17:48 and 09:22:57: **the same seconds as the 3 late presses** → machine (Q-F6) |
| case 25 | PASS. 0 calls in 483 s idle (stretched by stalls); 1 press → 1 call. | — |
| case 19 (stand-in stopped) | PASS. Error after 2 ms on both buttons; nothing changed. | — |
| gaps (AC-14 through the screens, AC-16 messages) | PASS | — |
SA's carried item (TASK-017 §Review, the 48.6 s summary press): every AC-8 press with the detector quiet ended at about 25 s. **Not reproduced.**

### Part 2 — the real `god_plan` back (`bun src/index.ts`, its `.env`; database name `god_plan`, gateway = the stand-in): **TEST_FAILED**
- **Access:** through the app only, synthetic people, no SQL (SYSTEM-FACTS line 83 and workspace `CLAUDE.md` rule 4). The owner's sign-in came from the out-of-repo `god-plan-qa.env` and was never printed.
- **Seed:** made through the app's API by `harness/real-db-seed.mjs`, tag `-qa4`. P1 `ย้ายบ้านใหม่-qa4`, P2 `งานสวนหลังบ้าน-qa4`, A `invitee-a-qa4@godplan.test`, B `invitee-b-qa4@godplan.test`.
- **Latency:** about 0.8–1.3 s per call, against about 2 ms on PGlite.
- **ui-real-1 (fixed-sleep harness):** 21 PASS · 2 FAIL · 6 HARNESS_ERROR.
  - **PASS on the real back:** AC-2a, AC-2 (owner), AC-4 (8, 9, 9s, 11), D6, AC-17, AC-7 (15–18), AC-8 (20, 22a, 22b, 21: 25.9 s and 26.4 s), AC-9 (23, 24), AC-11 (26), phone 375 (43).
  - The harness's fixed waits could not judge cases 1, 3c, 5, 7, 12, 31, 33 and 37 at this latency. That led to `harness/local-test-001-real-gaps.mjs`, which waits for each step's own visible result, counts polls rather than wall time (so a freeze can't use up a wait), and logs UTC per case.
- **real-gaps runs 1–7:**
  - **Case 1 (AC-1) PASS**: 3 tasks added through the screen, each waited for, all in ยังไม่เริ่ม after a reload.
  - **Case 1b FAIL → DEF-3.**
  - The other real-DB cases (3c, 5, 7, 12, 31, 28, 33, 37) **could not be completed**. Each run was stopped by DEF-2 (sign-in failing) or by a machine stall (100 / 138 / 369 / 158 s). They are **NOT_TESTED on the real back.** The same cases PASS on PGlite (ui-6, gaps).
- **API harness on the real back:** not run. Its sign-in would hit DEF-2 the same way. NOT_TESTED.

## Round 5 — 2026-11-09 15:31–16:26 UTC, re-test after TASK-018 (DEF-2) and TASK-019 (DEF-3 + sign-in message), on the REAL `god_plan` back
- **Build:** `god-plan-back` `277bcc9` + tree `ea756fe1c3c4`; `god-plan-front` `a41cbd0` + tree `5750febf1b80` (both re-checked unchanged at the end).
- **Setup:** `bun src/index.ts` with its `.env` (database `god_plan`, gateway = stand-in, `INVITE_TTL_SECONDS=60`). Front `next dev`, `BACK_ORIGIN=http://127.0.0.1:4310`.
- Stall detector beside every run. App only, synthetic people, no SQL, no live AI.
| Run | Result | Detector |
|---|---|---|
| **DEF-2 soak** (`repro-def2-soak.mjs`, 30 min, owner sign-in every 20 s, alternating direct and via `/api`) | **50/50 → 200, 0 × 500.** Back log: 0 `unhandled`. One `db-retry attempt 1 code 23505` at 15:55:43: TASK-018's auth retry recovered, and the caller saw 200. | 4 stalls (122–244 s). That is why it made 50 calls, not 90. |
| **DEF-3 v2** (`repro-fast-add-v2.mjs`, corrected per SA: type the next title while the previous saves; no overwriting of a refused title) ×2 | **PASS ×2.** The text typed during the save is still in the box after the save lands ("ไว 2", "ไว 3"). After a reload, all 3 titles exist. | ran during the soak; functional, not timed |
| **Sign-in failure message** (`local-test-001-signin-string.mjs`, CDP interception, back untouched) | 500 `INTERNAL`, 502 `UPSTREAM_UNAVAILABLE` and a network failure each show **"เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"**. A wrong password (real back) still shows "อีเมลหรือรหัสผ่านไม่ถูกต้อง". PASS. | — |
| ui-real-5 (`local-test-001-ui.mjs`, seed `-qa5`) | 22 PASS: AC-2a, AC-2, AC-3 (7), AC-4 (8, 9, 9s, 11), AC-6 (13), D6, AC-17, AC-7 (15–18), AC-8 (20, 22a, 22b, 21 at 26.3 s), AC-9 (23, 24), AC-11 (26), phone 375 (43). 2 FAIL + 5 HARNESS_ERROR, which are this harness's fixed waits at real latency (same as round 4), covered by the next run. | quiet |
| **real-gaps-r5** (`local-test-001-real-gaps.mjs`, waits on visible results) | **PASS:** 1 (AC-1), 5/3c (AC-3a + AC-2 as invitee), 7 (AC-3 upper-case sign-in), 12 (AC-5), 37 (AC-16), 31 (AC-18), 28 (AC-13), 33 (AC-15). **0 sign-in failures.** Case 1b (2/3) is the v1 flaw SA described: the script typed "เร็ว 3" over its own refused "เร็ว 2". **Superseded by DEF-3 v2, not a defect.** | 2 stalls (89 s, 150 s), no case failed |
| **api-real-5c** (`test-001-api.mjs`, seed `-qa5c`) | **34/34 PASS** (case 37 is UI-only; PASS in real-gaps-r5). Back: 0 errors, 0 retries. | quiet |
- **Harness faults on the way, not product:**
  - api-real-5 failed on its first step: the UI round had already moved P1's only to-do task, and the real database keeps state. I re-seeded.
  - The `-qa5b` seed was killed partway by my own 200 s wall-clock `timeout` during a 205 s freeze. I re-seeded as `-qa5c`.
- **Not re-run in round 5:** case 19 (stand-in stopped), case 25 (5-min idle), and the AC-16 too-long messages and AC-14 through the screen (`gaps`). All PASS in round 4 on the refactored trees; TASK-018/019 do not touch those paths. Their harnesses are hard-wired to the PGlite seed, so they need the same env change before the next real-DB round.

## Defects
### DEF-2 — CLOSED 2026-11-09 (round 5): 50/50 sign-ins in a 30-min soak on the real back; 0 sign-in failures in the full UI and API regression; TASK-018's retry seen recovering once (23505). The front half (sign-in message) PASS.
### DEF-3 — CLOSED 2026-11-09 (round 5): the corrected recipe PASS ×2; the typed text survives the save.
### DEF-2 — Sign-in on the real `god_plan` back fails in bursts with 500 `INTERNAL`; the screen says "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" — MAJOR
- **AC:** every AC that starts with signing in (AC-1 … AC-18). **The real Postgres run is the DELIVERED gate.**
- **Environment:** `god-plan-back` tree `cb00b41404eb`, `bun src/index.ts` with its `.env` (database `god_plan` on the owner's dev Postgres; gateway = stand-in), `INVITE_TTL_SECONDS=60`. Front `next dev`.
- **Seen, each time with the stall detector quiet:**
  - **through the screen:** 10:14:12, 10:30:17, 10:30:24, 10:43:41, 10:43:47, 10:43:51 UTC;
  - **POST /api/auth/sign-in through the front's /api:** 500 once around 10:14 and 3/3 around 10:44;
  - **direct to the back:** 2/3 around 10:44.
- **Signature:** the back answers `500 {"error":{"code":"INTERNAL"}}` and writes `unhandled error: Error` (no other detail) to its stdout. The count of those lines matched the count of failed calls in the 10:43–10:44 burst. 3 more such lines appeared during 10:15–10:26, while all 10 of my direct sign-ins in that window returned 200.
- **Between bursts, the same calls succeed:** owner, A, B ×2 each → 200, wrong password → 401, at about 10:46. It is not tied to one account, and not to the proxy (direct calls failed too).
- **Repro (bursty, not on demand):**
  1. Start the real back as above.
  2. Sign the owner in repeatedly over about 30 min, with `harness/repro-real-db-idle.mjs` or `local-test-001-real-gaps.mjs` (env as in §Round 4).
  3. Watch for 500s, and count `unhandled error` lines in the back's output.
- **Expected:** sign-in answers 200 (or 401 for a wrong password) every time.
- **Actual:** bursts of 500 `INTERNAL`. The user sees the generic save error on the sign-in form, which also does not describe what happened.
- **Never seen on PGlite:** about 9 rounds, hundreds of sign-ins.
- **What I tried that did NOT trigger it:** idle gaps of 5–240 s before a sign-in (10/10 fine).
- **No cause or fix proposed.** The back's log line carries no detail, so its own log can't show the cause either. That is an observation, not a proposal.

### DEF-3 — Text typed in the add-task box while the previous add is still saving is erased when that save finishes — MINOR
- **AC:** AC-1 (the owner adds tasks). Only reachable at real latency (about 1 s per save). On PGlite the save is about 2 ms.
- **Repro** (`harness/repro-fast-add.mjs`, real back): type "ด่วน 1", press เพิ่มงาน, and within about 1 s type the next title in the box.
- **Observed, 300 ms after each press:**
  - after "ด่วน 1": box `"ด่วน 1"`, button disabled;
  - after "ด่วน 2": box `"ด่วน 2"`, button disabled, so the press did nothing;
  - after "ด่วน 3": **box `""`**. The first save finished and cleared the box, erasing what was typed.
  - After a reload, only "ด่วน 1" exists. No message at any point.
  - Also seen in real-gaps-5, case 1b: 1 of 3 kept, screenshot `real-gaps-5/1b-fast-adds.png`.
- **Expected:** what the person typed is either saved or kept in the box. **Actual:** silently erased.
- My harness typed by replacing the box's text, which contributed to "ด่วน 2" being lost. The defect stated here is only the clearing, as seen in the third line.
- **Note for the PM ("is it right"):** whether a person should be able to type while a save runs is a product question. Losing the typed text silently is not.

### DEF-1 — CLOSED 2026-11-09 (round 3) — re-checked in round 4: still not reproduced while the machine was quiet.
### DEF-1 — CLOSED 2026-11-09 (round 3): NOT REPRODUCED with the machine quiet; cause not established. Reopens if any AI call is late while `timer-stall-detector.mjs` is quiet.
### (round 2 text, kept) DEF-1 — An AI press can wait 40 s to 4 min instead of showing the error within 30 s, when the gateway hangs — MAJOR
- **AC:** AC-8. When the gateway is slow or hangs, the owner must see the error within 30 s. Both AI actions are affected: AI task proposals (G1) and สรุปใหม่ (S2).
- **Environment:** local. `god-plan-front` (tree `be1fb93c1caa`), `next dev -p 4300`, `/api` proxied to back-pglite :4310 (`god-plan-back` tree `0c35bb045e54`), `gateway-stub` :4399 in mode `hang`.
- **Repro from a clean state:**
  1. Start `gateway-stub`, back-pglite (seed) and the front (`bun run dev`).
  2. `echo hang > tests/harness/gateway-stub/mode.txt`
  3. From `god-plan/ai-worker`, with the seed owner password in the environment: `node tests/harness/repro-def1-proxy.mjs`. It makes 3 AI calls direct to the back, then the same 3 through `localhost:4300/api`. **Run it 3 times.**
  4. In the browser: `node tests/harness/repro-case21-ui.mjs`, **4 times**.
- **Expected:** every call through `/api` behaves like the direct call (502 `AI_UNAVAILABLE` at about 25 s). On screen, "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน" appears within 30 s.
- **Actual:**
  - Direct to the back: 9/9 calls answered at 25 s.
  - Through `/api`: 5/9 calls answered after 42–237 s, as 500 "Internal Server Error" or a late 502.
  - The front log shows `socket hang up` / `ECONNRESET`.
  - In the browser, 1 press in 4 waited 40.6 s, with the request ending as a network failure. The front's 28 s bound did not end it.
  - It was also seen in rounds ui-2 and ui-4.
- **Frequency:** about half of the hung calls through the proxy, and 1 browser press in 4 (plus 2 of 4 full rounds).
- **Evidence:** `out/TEST-001/ui-4/21-ac8-hang-tasks.png` · `out/TEST-001/repro-21-ui.png` · the outputs above (the `repro-def1-proxy.mjs` lines) · the front dev log lines quoted above.
- **Not proposed:** a cause or a fix (QA's rule). What I *can* say, from where it happens: it lies between the front's `/api` proxy and the back. The back alone always answers on time.
- **What I did not establish:** whether `next start` (the production server) behaves the same way, since D4's run method is `next dev`.

## Test data created
| What | Where | End state |
|------|-------|-----------|
| **round 5, real `god_plan` (via the app only):** seeds `-qa5`, `-qa5c` (complete) and `-qa5b` (partial, killed mid-seed): projects `ย้ายบ้านใหม่-qa5*`, `งานสวนหลังบ้าน-qa5*`; `QA ทดสอบ AC-1-qa5`, `QA AC-1 real-qa5-<n>`, `QA fast-add-v2-qa5-<n>` ×2, `QA-TEST-001 โปรเจกต์ทดสอบ`, `QA desc` ×1 (+ the over-limit one refused); `ก`×100 name project; their tasks, comments (incl. `<script>` text), invites and resets; users `invitee-a/b-qa5*@godplan.test`, `c.tester-qa5@`, `c2.tester-qa5@`, `a4.tester-qa5@`, `a5.tester-qa5@gp.example.test`, `MRK-MAIL-7731-qa5c@`, `a4-qa5c@godplan.test` (no `x2-qa5c` account: that reuse was refused 410) (no `pw7-qa5c` account: its 7-character password was refused); sessions | the owner's dev Postgres, `god_plan` | **LEFT IN PLACE**: synthetic, tagged `-qa5*`, with no delete path and no SQL from me. Removal = a DATA REQUEST (tags `-qa4`, `-qa5`, `-qa5b`, `-qa5c`). |
| round 5 servers, detectors, Chrome | 4300 / 4310 / 4399, 5 detectors, debug ports 9441 / 9451 | all stopped by PID; `calls.jsonl` emptied; `mode.txt` = `ok`. The headless Chrome on :9335 is still not mine, still left alone. |
| **round 4, real `god_plan` dev database (via the app only):** projects `ย้ายบ้านใหม่-qa4`, `งานสวนหลังบ้าน-qa4`, `QA ทดสอบ AC-1-qa4`, `QA AC-1 real-qa4-<n>` (several), `QA fast-add-qa4-<n>` (2), the tasks, comments and invites inside them; users `invitee-a-qa4@godplan.test`, `invitee-b-qa4@godplan.test`, and possibly `c.tester-qa4@`, `c2.tester-qa4@`, `a4.tester-qa4@`, `a5.tester-qa4@gp.example.test`; sessions for these and for the synthetic owner | the owner's dev Postgres, database `god_plan` | **LEFT IN PLACE.** All synthetic, all tagged `-qa4`. The app has no delete for projects or users, and I run no SQL. If removal is wanted: a DATA REQUEST to the owner (tag `-qa4`). |
| round 4 PGlite rows | in memory | gone (backs stopped by PID) |
| servers, detectors, Chrome | my ports 4300/4310/4399; 12 detectors; debug ports 9411–9431 | all stopped by PID; `calls.jsonl` emptied; `mode.txt` = `ok`. **Not mine, left running:** a headless Chrome on debug port 9335, started about 1h15m before the cleanup (not one of my ports). |
| round 1: synthetic owner/A/B from the seed; C `c.tester@gp.example.test`, A4 `a4.tester@gp.example.test`, project "QA ทดสอบ AC-1", tasks, comments (incl. `<script>` text), invites, resets | in-memory PGlite, restarted fresh for ui-2, ui-3, api-r1, gaps | all gone. Each back was stopped by its port PID; the last one at about 22:0x. |
| front dev server | `god-plan-front`, `next dev -p 4300`, started by me | stopped by its port PID. **Nothing written to the repo by me** (`.next/` build cache only). |
| stand-in | `harness/gateway-stub` | `calls.jsonl` emptied (0 bytes); `mode.txt` = `ok`; stopped by its port PID |
| headless Chrome profiles | OS temp folder (`cdp-*`) | processes closed (0 left running) |
| new harness scripts | `harness/local-test-001-ui.mjs`, `-case19`, `-case25`, `-gaps`, `repro-case21-ui.mjs` | kept: workspace only, synthetic only, no secrets |
| synthetic projects, tasks, comments, invitees (`*@godplan.test`, `MRK-*-7731` markers) | in-memory PGlite (back-pglite) | gone — I stopped the process on port 4310 (by its PID) |
| stand-in call log | `harness/gateway-stub/calls.jsonl` | emptied (`DELETE /calls` → 200); `mode.txt` left at `ok`; stand-in on port 4399 stopped by its PID |
| seed passwords (random, synthetic) | session scratchpad, outside the workspace | never written to the workspace (grep of `harness/out/` for each value: 0 hits) |
| results | `harness/out/TEST-001/dry-run-1`, `dry-run-2` | kept as evidence; synthetic only |

## Verdict
**Round 5 (2026-11-09): `TEST_PASSED` — REQ-001 on the real `god_plan` dev database** (the DELIVERED gate), with the stand-in gateway. The live AI was proven separately in D11 (4/4).
- DEF-2 and DEF-3 are closed. Every AC from AC-1 to AC-18 except AC-10 (the owner's) passed on the real back in this round, or in round 4 on the same paths (cases 19, 25 and the gaps; see §Round 5).
- **Still NOT_TESTED:** a real phone, keyboard and screen reader (carried to the release gate).
- **Open observations, not blocking:** OBS-2 (machine pauses), OBS-3 and OBS-4 (AI wording), and synthetic rows left in `god_plan`.

**Round 4 (2026-11-09): `TEST_FAILED` — DEF-2 (MAJOR) on the real `god_plan` back; DEF-3 (MINOR).**
- On PGlite, the refactor changed no behaviour: api 34/34, ui 29/30 + the AC-8 recheck, case 19, case 25 and the gaps all pass. AC-8 is on time whenever the machine is quiet. SA's carried 48.6 s item was not reproduced.
- **On the real database, which is the DELIVERED gate:** sign-in fails in bursts (DEF-2). Several ACs could not be completed there because of it and the machine stalls. **This stops the line.**
- **Re-test after a fix:** `real-db-seed.mjs` (new tag), `local-test-001-real-gaps.mjs` ×2, `test-001-api.mjs` and `local-test-001-ui.mjs` on the real back, each with the detector.
- **Still NOT_TESTED:** a real phone, keyboard and screen reader.

**Round 3 (2026-11-09): `TEST_PASSED` — scoped to local · PGlite · stand-in gateway, on the TASK-014 front.**
- ui-5 passed 30/30. Case 19 and AC-8's other modes passed in round 2 on the same paths, and api-r1 passed in round 1. The back has not changed since, and the API harness calls the back directly.
- AC-8 is on time in every call the machine did not pause.
- **DEF-1 is closed as not reproduced.** It reopens on any late call while the detector is quiet.
- **OBS-2 is open:** machine pauses of up to 288 s make timing checks on this box valid only alongside the detector. QT-3 asks the PM about it.
- **The NOT_TESTED list below still gates DELIVERED.** (Real Postgres · live AI wording · real phone, keyboard and screen reader.)
- **Update 2026-11-09 14:55 — D11 live run done: 4/4 calls, AC-7 PASS, AC-9 PASS ×3, OBS-3 and OBS-4 open (§D11 live run).** Live AI wording is no longer NOT_TESTED. **Still NOT_TESTED, gating DELIVERED:** real Postgres (TASK-001), and a real phone, keyboard and screen reader.

~~**Round 2 (2026-11-08): `TEST_FAILED` — AC-8, DEF-1 (MAJOR).**~~ Superseded by round 3:
- When the gateway hangs, about half of the AI calls through the front's `/api` proxy take 42–237 s.
- On screen, 1 press in 4 showed the error at 40.6 s; AC-8 promises 30 s.
- Everything else in the ui regression (ui-4) passed: 29 of 30 cases. Case 19, cases 20/22a/22b and TASK-013's stalled-body recipe also passed.
- **This stops the line for REQ-001** until DEF-1 is fixed and the round 2 recipe passes. On re-test I will run `repro-def1-proxy.mjs` ×3, `repro-case21-ui.mjs` ×4 and ui-5.
- The NOT_TESTED list below still stands.

~~**`TEST_PASSED` — scoped to local · PGlite · stand-in gateway (round 1, 2026-11-08).** Every AC from AC-1 to AC-18 except AC-10 (the owner's) passed on the real back and front, on desktop and on an emulated phone. There were no defects. One observation is open: OBS-1, which failed once and has not reproduced.~~ Superseded by round 2: OBS-1 became DEF-1.

**NOT_TESTED — each of these gates DELIVERED:**
| What | Why | What would settle it |
|---|---|---|
| The real Postgres (`god_plan` dev database) | TASK-001 has not been run; it is the owner's run | TASK-001, then TASK-003 steps 6–7, then a QA re-run of `test-001-api.mjs` plus the ui round on that back |
| Live AI wording (AC-7, AC-9 text quality) | D11: live gateway calls need the owner's yes | the 4-call live run (AC-7 ×1, AC-9 ×3), read by QA and the owner |
| A real phone, keyboard and screen reader | carried to the release gate (SPEC-002 §Close-out) | a human with a phone (click-script on request) |

**Decisive evidence:**
1. `harness/out/TEST-001/ui-3/results.json`: 30 of 30 UI cases pass on the real back and front.
2. `harness/out/TEST-001/api-r1/case27-calls.json`: what the gateway actually received. No comment text, name or email marker is in it (AC-12, D2).
3. `harness/out/TEST-001/ui-3/43-375-board.png` with the case 43 numbers: the phone board, no page side-scroll, every key control passes the hit test.

## Questions
(For the PM; the PM answers as `> answer: ...`)
- **QT-1** — An unused invite link opened while already signed in as someone else: refused, sign that person out first, or attach the project to the signed-in account? My default: show "sign out first" and change nothing. Does not block the round; case 31 records what the build does.
  > answer (Porter, PM, 2026-11-08) `[operator-delegated 2026-11-08 01:25]`: your default — show the message, change nothing, the link stays unused. Wording added to REQ-001 (AC-18 + wording table).
- **QT-2** — P1–P4 above are seams the SA's design must provide. Please confirm they are in SPEC-002 / TASK-005/006 (or route to the SA). Without P4 nothing can run; without P1–P3 the named cases are NOT_TESTED.
  > answer (Porter, PM, 2026-11-08): routed — P1–P5 are now REQ-001 §Constraints "Testability" (requirement content for the SA), pointer in inbox/SA.md. Whether they land in SPEC-002 / which TASK is the SA's; check SPEC-002 when it is written.
- **QT-3 (2026-11-09, does not block this verdict)** — This dev machine pauses for up to 288 s (OBS-2). In round 3 there were 8 pauses in about 35 min. Any timing check here (AC-8's 30 s, AC-11's idle window) is only valid with the stall detector running beside it. **Does someone look at the machine?** It is the owner's box; Otto's, if he wants it. My defaults:
  - I keep running the detector beside every timed check, and I treat a late call during a stall as the machine.
  - The real-Postgres re-test (TASK-001) gets the detector too.
  - If the pauses turn out to be caused by our own front (OBS-2's correlation), that becomes a defect.
  > answer (Porter, PM, 2026-11-09): your three defaults stand. The machine is the owner's (Otto's if he asks him) — I told the owner 2026-11-09 with your numbers, labelled as yours. The desk does not touch the machine.
