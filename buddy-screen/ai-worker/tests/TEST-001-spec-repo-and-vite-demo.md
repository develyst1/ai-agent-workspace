# TEST-001: Full V1 requirement in buddy-screen-spec + Vite mock demo
- Source REQ: REQ-002 (ACs tested: AC-1 … AC-9)
- Oracle: `project-docs/requirements-v1.md` (read in full 2026-10-28; §13 = 17 rows after the PM's 20:10 addition) · `DECISIONS.md` (wins on conflict)
- TASKs: TASK-001 (md + diagrams) · TASK-002 (demo scaffold + engagement + TV) · TASK-003 (parent screens + network check) · TASK-004 (PM wording) — per SPEC-002 §AC map
- Status: **TEST_PASSED** (round 2, 2026-10-28 21:45) — round 1 TEST_FAILED 21:25, kept below as history; see § Round 2 and Verdict
- TASKs (round 2): TASK-005 (DEF-1..4 fixes) · TASK-006 (PM labels)
- Build under test: `buddy-screen-spec` `main` HEAD `0e6e911` + **uncommitted working tree** (README.md modified; REQUIREMENTS-V1.md, diagrams/×4, demo/ untracked — 43 files incl. hidden, copied 2026-10-28 21:16). `buddy-screen-front` `main` HEAD `8a3280c`, clean.
- Surfaces: local only · TV screens 1920×1080 · LINE/LIFF screens 375×667 and 1920×1080 · headless Google Chrome (`/usr/bin/google-chrome`) via playwright-core 1.49.1
- Tested: 2026-10-28 by Tanya

## Scope
- In: every AC of REQ-002 — the requirement md + 4 diagrams, the Vite mock demo (19 screens), its simulation panel, the 17 §13 strings, unhappy paths, the no-network / no-commit / synthetic-data line.
- Out (REQ-002 § Out of Scope): real product, backend, AI, speech, payment, LINE OA; visual design (owner approves later).
- Boundary: files named by TASK-001..004 in `buddy-screen-spec`; `buddy-screen-front` checked only for "untouched".

## Instrument limits
- **No fresh `git clone` was possible**: nothing is committed (owner's rule). Stand-in: `git ls-files -co --exclude-standard` copied the working tree (what a clone would hold after commit) into a scratch dir; `npm install` + `npm run dev` ran there with no `node_modules`. A real clone after `ขึ้น git` is NOT tested.
- Mock demo: proves screens exist, are reachable, show the right words/numbers, and the simulated state machine. Proves NOTHING about the real product (recognition, timing accuracy R-T-3, LINE, payment).
- AC-6 timings: Playwright polls every 100 ms with wall-clock timestamps; ±1 s tolerance (Q4). The demo ticks once per second, so transitions land 0–1 s early by design of the tick.
- Hit-tests: `document.elementFromPoint` at each control's centre + `scrollWidth` vs `clientWidth`. Headless Chrome; real LINE in-app browser not used.
- Mermaid: rendered with `@mermaid-js/mermaid-cli` 11.4.2 + Chrome; GitHub's renderer not used.

## Cases
Harness: `tests/harness/tanya/local-test001.mjs` · raw output `project-docs/qa-2026-10-28/run1.json` · screenshots `project-docs/qa-2026-10-28/` (E/ below).

| # | Case | Type | Surface | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|
| 1.1 | AC-1 md present, README points to it | H | spec | md + working link | `REQUIREMENTS-V1.md`; README links it + 4 diagrams + demo command | README | PASS (stand-in clone, see limits) |
| 1.2 | AC-1 content §1–§16 | H | spec | same rules/numbers/tags | `diff` vs oracle: **only the intro header (lines 3–13) differs**; §1–§16 byte-identical; 39 rule ids R-AI-1…R-T-6 present | E/ac1.diff | PASS |
| 1.3 | AC-1 self-contained (Q6) | N | spec | no reliance on desk files | header no longer cites `ai-worker/`, `DECISIONS.md`; grep for desk paths / absolute paths = 0. One residual provenance line `(rows added … answering TEST-001 Q1)` at §13 — provenance only | grep | PASS |
| 1.4 | AC-1 §13 17 rows | H | spec | identical | identical (inside the byte-identical §13) | E/ac1.diff | PASS |
| 2.1 | AC-2 4 diagrams exist | H | spec | 4 | 01 system-context · 02 engagement-states · 03 overtime-borrowing · 04 childrens-data | `diagrams/` | PASS |
| 2.2 | AC-2 render | H | spec | renders | 4/4 rendered to PNG, viewed | E/diagrams/*.png | PASS |
| 2.3 | AC-2 states diagram vs §6 | S | spec | 4 states, all transitions, counted marks | 4 states + counted marks + 10 s / 20 s ✓; **missing: active→sleep "child says stop"; start state is `active`, not `sleep`** | E/diagrams/02… | FAIL → DEF-2 |
| 2.4 | AC-2 overtime diagram vs §7 | S | spec | 3 h **from send**, Sunday, 12.50 | Approve/Decline, no-overtime→end, Sunday, 12.50 ×3, per minute ✓; **"no answer in 3 h" drops "from the moment the LINE message is sent"** | E/diagrams/03… | FAIL → DEF-2 |
| 2.5 | AC-2 data diagram vs §10 | N | spec | no image leaves home; §10 rows | frames → device → discarded ✓, only templates to server ✓, voice not stored ✓, transcripts 30 days ✓; **missing: names row; template retention ("until deleted, or 30 days after the subscription ends")** | E/diagrams/04… | FAIL → DEF-2 |
| 3.1 | AC-3 documented command | H | demo | starts, 0 errors | `cd demo && npm install && npm run dev` → `VITE v8.3.5 ready in 272 ms`, `http://localhost:5173/`; 0 console errors over all 29 screen loads + interactions (no auto-launch of a browser; URL printed) | run1.json `consoleErrors: []` | PASS |
| 3.2 | AC-3 clean state | B | demo | works without node_modules | install from empty: `added 48 packages`; dev ok. Extra: `npm test` 8/8 pass · `npm run build` ✓ | console | PASS |
| 3.3 | AC-3 no camera/mic | N | demo | no permission request | `getUserMedia` trapped: 0 calls on every screen | run1.json `mediaCalls: []` | PASS |
| 4.1 | AC-4 AI naming | H | TV | §13 text, example names, free | `อยากเรียกฉันว่าอะไรดี` + `ชื่อตัวอย่าง: ปุยฝ้าย · ดาว · โบ๊ะ`; confirm disabled until a name is chosen, enabled after; no price shown | E/tv-first-naming-1920.png | PASS |
| 4.2 | AC-4 face + gesture reg | H | TV | placeholder, 2 §13 texts | both texts verbatim; placeholder `(กรอบจำลอง ไม่เปิดกล้องจริง)`; 0 img/video/canvas | E/tv-face-gesture-registration-1920.png | PASS |
| 4.3 | AC-4 sleep screen | H | TV | `เรียกชื่อฉันได้เลยนะ` | verbatim; 🌙 | E/tv-sleep-1920.png | PASS |
| 4.4 | AC-4 name call | H | TV | `เรียกฉันรึเปล่า` | verbatim; 🎙️ | E/tv-name-call-1920.png | PASS |
| 4.5 | AC-4 invitations ×4 | H | TV | 4 filled invitations | all 4 exact: `มาเล่นด้วยกันไหม วันนี้เรามี ออกกำลังกาย นะ` … `ฝึกคิด นะ` | run1.json `invitations` | PASS |
| 4.6 | AC-4 activity with counted time | H | TV | counter rises | counter mm:ss rises 1/s | E/ac6-*.png | PASS |
| 4.7 | AC-4 off-task | H | TV | `ตอนนี้ทำอะไรอยู่จ๊ะ` | verbatim (own screen + shown in idle-present) | E/tv-off-task-1920.png | PASS |
| 4.8 | AC-4 going to sleep | H | TV | §13 text | verbatim (own screen + on sleep in activity) | E/tv-going-to-sleep-1920.png | PASS |
| 4.9 | AC-4 no face for the AI (R-AI-1) | N | TV | no face/character | **🤔 face emoji on off-task, 😴 face emoji on going-to-sleep** | E/tv-off-task-1920.png, E/tv-going-to-sleep-1920.png | FAIL (Q7 confirmed) → DEF-4 |
| 5.1 | AC-5 overtime message | H | LINE | §13 + 2 buttons | `น้องมะลิ เล่นครบเวลาของวันนี้แล้วครับ ต้องการให้เล่นต่อไหม`; อนุมัติ / ไม่อนุมัติ both clickable, hit-test ok at 375 | run1.json | PASS |
| 5.2 | AC-5 borrowed message | H | LINE | §13 filled | verbatim with 30 นาที. (Its pointer to buy-back leads nowhere — DEF-3) | E/parent-line-borrowed-375.png | PASS (AC wording) |
| 5.3 | AC-5 LIFF consent | H | LIFF | consent page | present; ยินยอม → `บันทึกความยินยอมแล้ว`. Gating registration behind consent is behaviour — not provable in a mock: NOT_TESTED | run1.json | PASS (presence) |
| 5.4 | AC-5 quota + daily + overtime | H | LIFF | §13 quota line, daily default, overtime setting | `เหลือเวลาสัปดาห์นี้ 31 ชม. 20 นาที · วันนี้ใช้ไป 2 ชม. 10 นาที`; `5 ชม. 43 นาที (ค่าเริ่มต้น)`; overtime toggle | E/parent-liff-quota-settings-375.png | PASS |
| 5.5 | AC-5 timeline | H | LIFF | why each interval, dispute | 5 intervals with reasons (idle-absent marked ไม่นับเวลา); dispute → `ส่งให้ทีมตรวจสอบแล้ว` | run1.json | PASS |
| 5.6 | AC-5 goals | H | LIFF | §12 topics | 6 areas, 23 topics = §12 count (3+4+4+4+4+4) | run1.json | PASS |
| 5.7 | AC-5 report choice | H | LIFF | daily/weekly | 2 radios รายวัน / รายสัปดาห์ | run1.json | PASS |
| 5.8 | AC-5 gifts | H | LIFF | big/small/none, carry-over, §9 numbers | 3 options; `งบรอบนี้ 500 บาท · ยอดยกมา 120 บาท`; 70 % / 40 % match §9 | run1.json | PASS |
| 5.9 | AC-5 rename | H | LIFF | `เปลี่ยนชื่อ AI ครั้งละ 99 บาท` | verbatim; confirm `ยืนยันและชำระ 99 บาท` | run1.json | PASS |
| 5.10 | AC-5 friend consent + delete | H | LIFF | §13 text, nickname, delete | verbatim; nickname ต้นกล้า only; ลบ → `ลบเพื่อนแล้ว`, nickname gone | run1.json | PASS |
| 5.11 | AC-5 phone reachability (Q5) | B | 375×667 | all controls hittable, no h-scroll | 10 parent screens × 2 widths: 0 bad hits, 0 horizontal scroll (also TV 9/9) | run1.json `screens[].badHits` | PASS |
| 6.1 | AC-6 silent → idle | S | TV sim | idle at 10 s ±1, counting | OFF 3.06 s → idle_present 12.67 s (**9.6 s**); counter kept rising | run1.json `ac6.silent` | PASS |
| 6.2 | AC-6 idle → sleep | S | TV sim | sleep at 30 s ±1, stops, ≤ 30 s added | sleep 32.66 s (**29.6 s** after OFF); counted 3 → 33 = **30 s** added, then frozen | `ac6.silent`, E/ac6-silent.png | PASS |
| 6.3 | AC-6 out of frame | S | TV sim | 0 s from first second; sleep after 20 s | OFF 5.13 s (counter 5) → idle_absent 5.65 s, counter **stays 5**; sleep 24.62 s (**19.5 s**) | `ac6.absent` | PASS |
| 6.4 | AC-6 idle → active | S | TV sim | back to active, continuous | idle 11.64 s, ON 16.09 s → active 16.60 s; counter 16 → 17 → … no gap | `ac6.recover` | PASS |
| 6.5 | AC-6 boundary under 10 s | B | TV sim | stays active | silent **8.8 s** (2.11 → 10.93), never idle | `ac6.nine` | PASS (8.8 s, not exactly 9.0) |
| 6.6 | AC-6 back in frame | S | TV sim | resumes; absent not counted | OFF 4.09 s (counter 4) → ON 14.04 s: counter still 4, then 5, 6 … | `ac6.backIn` | PASS |
| 6.7 | Friend alone (R-T-2) | N | TV sim | nothing counted | the sim has no Friend control | — | NOT_TESTED — not required by AC-6 |
| 7.1 | AC-7 all 17 §13 rows on screen | H | all | 17/17 verbatim | **16/17**. Missing everywhere: `วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย` (TV — overtime declined) | run1.json `s13` | FAIL → DEF-1 |
| 8.1 | AC-8 decline → session ends | N | LINE→TV | TV shows declined line, session ends | LINE shows `ไม่อนุมัติ วันนี้น้องจะหยุดเล่นแล้ว`; **no TV screen or state shows the declined line / the end** | E/parent-overtime-declined-375.png | FAIL → DEF-1 |
| 8.2 | AC-8 Sunday used up | N | LIFF | §13 text, only paid extension | verbatim; only `ซื้อเวลาเพิ่ม` offered | E/parent-sunday-used-up-375.png | PASS |
| 8.3 | AC-8 quota zero | N | TV | §13 text then sleep | `วันนี้เล่นครบเวลาแล้วนะ พรุ่งนี้มาเล่นกันใหม่นะ` → ถัดไป → `เรียกชื่อฉันได้เลยนะ` | run1.json | PASS |
| 8.4 | "no overtime per day" → ends (neighbour) | N | LINE→TV | session ends | not shown in the demo (toggle exists, no outcome screen) | — | NOT_TESTED — not in AC-8's list; observation |
| 9.1 | AC-9 no external network (Q3) | R | demo | 0 non-local requests | 1800 requests, **0 external** | run1.json `requests` | PASS |
| 9.2 | AC-9 no real child data | R | spec repo | no photos; invented names | 0 image/audio/video files in the repo (excl. node_modules); 0 img/video/canvas on any screen; names มะลิ / ต้นกล้า / ปุยฝ้าย·ดาว·โบ๊ะ invented (fixtures.ts says so) | find + run1.json | PASS |
| 9.3 | AC-9 no commit | R | both repos | HEADs unchanged | spec: `0e6e911`, 1 commit, branch `main` only, no tags/stash · front: `8a3280c`, 1 commit, `main` only | git log/branch/tag/stash | PASS |
| 9.4 | AC-9 front untouched | R | front | no change | `git status --short` empty | git | PASS |

Tally: 40 PASS · 6 FAIL (2.3, 2.4, 2.5, 4.9, 7.1, 8.1) · 2 NOT_TESTED (6.7, 8.4). Plus the gating part of 5.3, which I could not test.

## Defects
### DEF-1 — §13 "overtime declined (TV)" line is on no screen; decline has no TV side — MAJOR — ✅ FIXED, verified round 2 (R2-1, R2-2)
- Build: `buddy-screen-spec` working tree on 0e6e911, demo at `http://localhost:5173/`, Chrome 1920×1080 and 375×667.
- Repro: 1. `cd demo && npm install && npm run dev` 2. open `#/parent/line-overtime-request` 3. press **ไม่อนุมัติ** 4. look through every TV screen in the index (9) and every state of `#/tv/activity-in-progress`.
- Expected: AC-7, every §13 row appears exactly on its screen, incl. `TV — overtime declined: วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`; AC-8, after a decline the session ends, and the TV says that line.
- Actual: the line appears nowhere (harness searched the text of all 29 screen loads + all interactions: `MISSING: วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`). Decline only changes the LINE phone: `ไม่อนุมัติ วันนี้น้องจะหยุดเล่นแล้ว`. The string is defined in the demo's strings file under key `overtimeDeclinedTv` and never referenced (lead, not the verdict).
- Frequency: always. Evidence: `run1.json` → `s13`; `parent-overtime-declined-375.png`. Linked: 7.1, 8.1.

### DEF-2 — three diagrams leave out decided rules — MINOR — ✅ FIXED, verified round 2 (R2-3..5)
- Build: `diagrams/02…`, `03…`, `04…` (rendered PNGs in `project-docs/qa-2026-10-28/diagrams/`).
- Expected (AC-2: each state/number matches the requirement):
  - 02 vs §6: active → sleep on "activity ends **or the child says stop**"; an activity starts from **sleep** (sleep → active needs recognition + gesture / confirmed name call / accepted invitation).
  - 03 vs R-Q-5: the 3 h run **"from the moment the LINE message is sent"** (owner-approved 19:48).
  - 04 vs §10: rows for **names** (server, while subscribed) and **template retention** (until deleted, or 30 days after the subscription ends).
- Actual: 02 has only "activity ends", and its initial arrow `[*] → active`. 03 says "no answer in 3 h". 04 has no names node, and the templates have no retention.
- Every number that is present matches (10 s, 20 s, 3 h, Sunday, 12.50, 30 days). Linked: 2.3, 2.4, 2.5.

### DEF-3 — borrowed message sends the parent to a buy-back that does not exist — MINOR — ✅ FIXED, verified round 2 (R2-6)
- Repro: `#/parent/line-borrowed` says `… ซื้อคืนได้ที่เมนูโควต้า`; the bubble has 0 links. `#/parent/liff-quota-settings` has no buy-back control (only `ซื้อเวลาเพิ่ม` after "ดูกรณีวันอาทิตย์ใช้หมด").
- Expected: REQ-002 Requirement 3, "every V1 screen"; buy-back is a V1 rule (R-Q-7, 12.50 THB/h).
- AC-5 does not list buy-back, so this does not fail an AC. **In scope, per PM (Q8, 21:30).** Linked: 5.2.

### DEF-4 — face emoji stand in for the AI on two TV screens — MINOR (confirmed by PM, Q7 21:30) — ✅ FIXED, verified round 2 (R2-7)
- Repro: `#/tv/off-task` shows 🤔; `#/tv/going-to-sleep` shows 😴 (large, above the AI's words).
- Expected: R-AI-1, "No face or character on screen; only a voice and the camera."
- Actual: a face emoji is shown above the AI's line. See Q7, which decides whether this is a defect. Evidence: `tv-off-task-1920.png`, `tv-going-to-sleep-1920.png`. Linked: 4.9.

(No fixes proposed.)

## Observations (not ours / not judged)
- `PROTOCOL.md` still says `buddy-screen-spec` is read-only; `DECISIONS.md` 2026-10-28 19:58 lifts that for this work only.
- The "no overtime per day" toggle has no outcome screen (8.4). It is not in AC-8's list.
- The consent → registration order is not enforced in the mock: every screen is reachable from the index. That is expected for a mock.
- Vite does not open a browser by itself; it prints the URL. I read "opens in a browser" as "the URL opens".

## Test data created
| What | Where | End state |
|---|---|---|
| Scratch copy of the spec repo's working tree + its `node_modules`, `dist` | session scratchpad (outside every repo) | left; disposable, outside the workspace |
| Vite dev server, port 5173 | this machine | stopped 21:23 (curl → no server) |
| `tests/harness/tanya/` (local-test001.mjs, puppeteer.json, package.json; node_modules git-ignored) | desk | kept, re-runnable |
| Evidence: 42 PNG (incl. 4 diagram renders) + run1.json + ac1.diff | `project-docs/qa-2026-10-28/` | kept |
| Round 2: second scratch copy + node_modules/dist | session scratchpad | left; disposable, outside the workspace |
| Round 2: Vite dev server, port 5173 | this machine | stopped 21:44 (curl → no server) |
| Round 2 evidence: 45 PNG + run2.json + ac1.diff | `project-docs/qa-2026-10-28/r2/` | kept |
| Nothing written to `buddy-screen-spec` or `buddy-screen-front` | — | — |

## Round 2 — re-test after TASK-005/006 (2026-10-28 21:40–21:45, Tanya)
- Build: `buddy-screen-spec` HEAD `0e6e911` + working tree (44 files; new `demo/src/screens/tv/OvertimeDeclined.tsx`). Same clean-copy method as round 1, fresh `npm install` (48 packages), `npm test` 8/8, `npm run build` ✓.
- Scope check: `diff -r` round-1 copy vs round-2 copy shows changes only in the 3 diagrams (02/03/04), 6 demo screen/UI files, `strings.ts`, `registry.tsx` + the new screen. `REQUIREMENTS-V1.md` unchanged.
- Harness: same script, `ROUND=r2 node local-test001.mjs`, + new round-2 click paths. Raw output `project-docs/qa-2026-10-28/r2/run2.json`; 45 PNG in `r2/`.

| # | Re-test | Actual | Evidence | Result |
|---|---|---|---|---|
| R2-1 | DEF-1 / 7.1: all 17 §13 rows | 17/17 OK, incl. `วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย` | run2.json `s13` | PASS |
| R2-2 | DEF-1 / 8.1: decline → TV | ไม่อนุมัติ → link `ดูหน้าจอทีวี` (44 px, hit-test ok at 375) → `#/tv/overtime-declined` shows the §13 line + 🌙; LINE side still `ไม่อนุมัติ วันนี้น้องจะหยุดเล่นแล้ว` | r2/r2-decline-to-tv.png | PASS |
| R2-3 | DEF-2 / 2.3: diagram 02 | start `[*] → sleep`; `active → sleep: activity ends or child says stop`; sleep → active `Buddy recognised and (gesture, or name call confirmed, or invitation accepted)`; rendered + viewed | r2/diagrams/02… | PASS |
| R2-4 | DEF-2 / 2.4: diagram 03 | `no answer within 3 h from the LINE send`; rendered + viewed | r2/diagrams/03… | PASS |
| R2-5 | DEF-2 / 2.5: diagram 04 | templates `kept until deleted, or 30 days after the subscription ends`; names node `server, while subscribed`; still no image leaving home; rendered + viewed | r2/diagrams/04… | PASS |
| R2-6 | DEF-3: borrowed → buy-back | link `ไปที่เมนูโควต้า` (44 px, hit-test ok) → quota page: `ยืมเวลาวันอาทิตย์ไป 30 นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีจริง` · `ยอดที่ต้องชำระ 6.25 บาท` (= 30 × 12.50 ÷ 60, matches R-Q-7) · ซื้อคืน → `ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ`; 0 bad hits, no h-scroll | r2/r2-buyback-done-375.png | PASS |
| R2-7 | DEF-4 / 4.9: no face emoji | emoji scan of the text of all 30 screen loads: only 🌙 (sleep, going-to-sleep, overtime-declined) · 🎙 (name call) · ❓ (off-task) · ⏰ (quota zero); 0 faces | run2.json `screens[].emoji` | PASS |
| R2-8 | Regression: the whole round-1 suite re-run | 20 screens (was 19) render; 0 console errors; 0 camera/mic calls; 1961 requests, **0 external**; 0 bad hits / h-scroll at 375 and 1920; 0 img/video/canvas; interactions as round 1 (naming, 4 invitations, Sunday used up, quota zero, consent, friend delete, dispute, 6 areas / 23 topics, report) | run2.json | PASS |
| R2-9 | Regression AC-6 (real time) | silent: idle 9.5 s, sleep 29.6 s, counted 3 → 33 = 30 s · absent: counter frozen at 5, sleep 19.5 s · recover: back to active, continuous · 8.8 s silent: never idle · back in frame: 4 → 5…, absent 10 s not counted | run2.json `ac6` | PASS |
| R2-10 | Regression AC-1 | diff vs oracle identical to round 1 (header only) | r2/ac1.diff | PASS |
| R2-11 | Regression AC-9 git | spec `0e6e911`, front `8a3280c`; 1 commit, 1 branch, 0 tags, 0 stash each; front `git status` empty; 0 media files in spec repo | git | PASS |

Round-2 tally: the 6 round-1 FAILs (2.3, 2.4, 2.5, 4.9, 7.1, 8.1) now PASS; all 40 round-1 PASSes re-ran and still pass. NOT_TESTED unchanged: 6.7, 8.4, the consent gating in 5.3, a real `git clone`.

## Verdict
**Round 2: `TEST_PASSED`** (2026-10-28 21:45). DEF-1 to DEF-4 are fixed and verified in the running demo and the rendered diagrams. The full regression set still passes. All 9 ACs are met on this build: 46 of 48 cases PASS, 2 NOT_TESTED, both outside the ACs.
NOT_TESTED, named: 6.7 (no Friend control; not in AC-6) · 8.4 ("no overtime" outcome; not in AC-8) · the consent→registration order (behaviour; a mock cannot prove it) · a real `git clone` (nothing is committed; settle it by re-running this harness on a clone after the owner's `ขึ้น git`).
Instrument limit stands: this is a mock. It proves the screens, the words and the simulated timing, never the real product.

### Round 1 verdict (history, 2026-10-28 21:25)
**`TEST_FAILED`** — DEF-1 (MAJOR): AC-7 fails, since 1 of the 17 §13 strings is on no screen, and AC-8's decline path has no TV side. Four other ACs fully pass (AC-1, AC-3, AC-6, AC-9). AC-5 passes on what its wording lists, apart from DEF-3 and the consent gating I could not test. MINOR: DEF-2 (diagrams, AC-2), DEF-3 (in scope, Q8), and DEF-4 (confirmed, Q7; AC-4). Round 2 re-tests all four plus a full regression re-run of the harness.
NOT_TESTED: 6.7 (no Friend control; not in AC-6) · 8.4 (no outcome screen; not in AC-8) · the consent-gating part of 5.3 (behaviour; a mock cannot prove it) · a real `git clone` (nothing committed; settled by a re-run after `ขึ้น git`).

## Evidence (decisive)
Round 2:
- `project-docs/qa-2026-10-28/r2/run2.json` → `s13`: 17/17 "OK", and `interactions.declineToTv.tvLine = "วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย"` — proves DEF-1 fixed, reached by a tap from the LINE decline.
- `project-docs/qa-2026-10-28/r2/r2-buyback-done-375.png`: proves DEF-3, buy-back reachable at phone width, 6.25 บาท for 30 min.
- `project-docs/qa-2026-10-28/r2/diagrams/02-engagement-states-1.png`: proves DEF-2 (start in sleep, "child says stop").
Round 1:
- `project-docs/qa-2026-10-28/run1.json` → `s13["LINE overtime declined (TV)"] = "MISSING: วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย"`: proves DEF-1 over every screen and interaction the harness reached.
- `project-docs/qa-2026-10-28/ac1.diff` (15 lines, header only): proves §1–§16 are byte-identical to the oracle (AC-1).
- `run1.json` → `ac6` traces: idle at 9.6 s, sleep at 29.6 s with exactly 30 s counted, 0 s counted out of frame (AC-6).

## Questions
(For the PM; answers as `> answer: ...`. Each has my default — correct only the wrong ones. Checked: REQ-002, requirements-v1.md §4–§13, DECISIONS 2026-10-28 (all lines) — none of these is covered.)

- **Q1 — wording not in §13.** AC-4/AC-8 need Thai text §13 does not give: the 4 `{activity}` names, and the "quota zero — AI explains kindly" line (also the sleep-screen and registration screens). The FE may not invent user-facing words. Default: AC-7 checks only the 9 §13 rows; any other text is judged only as "present and meaningful", not verbatim — and I flag every string not from the PM as an observation for you. If you will write the extra strings, I will check them verbatim too.
  > answer (PM, 2026-10-28 20:10): I wrote the missing strings — 8 rows added to `project-docs/requirements-v1.md` §13 (activity names, naming, face/gesture registration, sleep, quota zero, declined, Sunday used up). Check all §13 rows verbatim. Any other text: your default.
- **Q2 — "one documented command" (AC-3).** `npm install` needs the internet once. Default: a documented one-time install step is allowed, then one run command must start the demo; the install step's network traffic is not counted against AC-9.
  > answer (PM): default accepted.
- **Q3 — "no network request leaves the browser" (AC-9).** The demo is served by the local Vite dev server, so requests to `localhost` (files, HMR websocket) always appear in the Network tab. Default: only requests to any other host fail AC-9.
  > answer (PM): default accepted.
- **Q4 — AC-6 stopwatch tolerance.** Default: each transition within ±1 s of 10 s / 30 s; out-of-frame adds 0 s within one display tick (≤ 1 s). A demo with a time-speed-up control is acceptable only if real-time is also available.
  > answer (PM): default accepted.
- **Q5 — phone width for LINE/LIFF screens.** LINE is used on phones. Default: parent screens are checked at 375×667 as well; a control that cannot be reached there is an AC-5 FAIL (layout beauty is not judged).
  > answer (PM): default accepted.
- **Q6 — "a reader with no other context" (AC-1).** Default: the md in `buddy-screen-spec` may mention desk files (`DECISIONS.md` etc.) only as provenance, not as places the reader must open to understand a rule; a rule that is only understandable by opening a desk file is an AC-1 FAIL.
  > answer (PM): default accepted.
- **Q7 — is a face emoji "a face on screen" (R-AI-1)?** (2026-10-28 21:25) The off-task screen shows 🤔 and the going-to-sleep screen 😴, right above the AI's words, so they read as the AI's face. Default: yes, it breaks R-AI-1, and DEF-4 stands at MINOR. Non-face icons (🌙, 🎙️, ⏰) are fine. If emoji faces are acceptable in the demo, say so and I will close DEF-4.
  > answer (PM, 2026-10-28 21:30): yes — a face emoji shown with the AI's words is a face on screen; it breaks R-AI-1. DEF-4 stands (MINOR); non-face icons are fine. `[PM-decided]`
- **Q8 — DEF-3 scope (2026-10-28 21:25).** Is buy-back of borrowed time a screen REQ-002 must show ("every V1 screen")? Default: yes, MINOR. If it is out of scope for this demo, I will move it to Observations.
  > answer (PM, 2026-10-28 21:30): yes, in scope — the borrowed message promises it, and R-Q-7 is a V1 rule. DEF-3 stands (MINOR). `[PM-decided]`
