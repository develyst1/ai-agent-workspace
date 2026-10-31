# TASK-003: Vite demo — parent LINE/LIFF screens, completeness and network check
- Source: SPEC-002 (§3–§5; REQ-002 AC-5, AC-7, AC-8 parent half, AC-9)
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: TASK-002 (scaffold, `strings.ts`, `fixtures.ts`, index)
- Repo: `buddy-screen-spec`, folder `demo/` only. **No git writes.**

## What to do
1. Parent screens in `demo/src/screens/parent/`, each drawn inside a phone-sized frame (LINE chat look for the `Line*` screens, a LIFF page look for the `Liff*` screens), all added to the index:
   - `LineOvertimeRequest` — the §13 overtime text with buttons **อนุมัติ / ไม่อนุมัติ**. อนุมัติ → shows a paid extension at 12.50 THB/h, billed per minute. ไม่อนุมัติ → shows the session ended (AC-8).
   - `LineBorrowed` — the §13 borrowed text, `{minutes}` from fixtures.
   - `LiffConsent` — explicit parental consent before any face registration (R-P-1).
   - `LiffQuotaSettings` — the §13 quota line; daily limit (default 5 ชม. 43 นาที); overtime on/off; a state where **Sunday's allowance is used up → only a paid extension offered**, with the §13 row "LIFF — Sunday allowance used up" (AC-8). (`ไม่อนุมัติ` → the TV shows §13 "overtime declined", built in TASK-002.)
   - `LiffSessionTimeline` — invented intervals with reasons (active / idle-present / idle-absent / sleep) and a "dispute" button (R-T-5).
   - `LiffGoals` — the topics of requirement §12, selectable.
   - `LiffReportChoice` — daily / weekly.
   - `LiffGiftChoice` — big / small / none by goal %, ≥ 70 % = small (≤ 40 % of the round's budget), budget 500 THB + carry-over shown.
   - `LiffRename` — the §13 rename text (99 บาท).
   - `LiffFriendConsent` — the §13 friend-consent text; Friend ต้นกล้า listed with a delete action.
2. Every visible string goes through `strings.ts` (§13 verbatim; anything else `draft` + ร่าง badge).
3. Synthetic data only: fixtures, no photos.

## Definition of Done (run in `demo/`, paste each command + real output)
- [ ] `npm test` and `npm run build` → pass / exit 0.
- [ ] In the browser you drive: every parent screen is reachable from the index, with 0 console errors. Paste screen → hash → loaded.
- [ ] AC-8 by hand: ไม่อนุมัติ → ended · Sunday used up → only paid extension · (TV `QuotaZero` from TASK-002 still loads).
- [ ] §13 text check, parent rows: `for s in "เล่นครบเวลาของวันนี้แล้วครับ ต้องการให้เล่นต่อไหม" "อนุมัติ" "ไม่อนุมัติ" "ไม่ได้รับคำตอบใน 3 ชั่วโมง ระบบยืมเวลาจากวันอาทิตย์" "เหลือเวลาสัปดาห์นี้" "เปลี่ยนชื่อ AI ครั้งละ 99 บาท" "ผู้ปกครองของเพื่อนตกลงให้ลงทะเบียนใบหน้าแล้ว (เก็บแค่ข้อมูลจำหน้า ไม่เก็บรูป)" "เวลาที่ยืมได้ของสัปดาห์นี้หมดแล้ว ซื้อเวลาเพิ่มได้ ชั่วโมงละ 12.50 บาท"; do grep -qF "$s" src/strings.ts && echo "OK $s" || echo "MISSING $s"; done` → 8 × `OK`.
- [ ] Every parent screen is checked at **375 × 667** (the size QA tests at, TEST-001): no horizontal scroll, buttons fully visible. Paste a screenshot list or the per-screen result.
- [ ] **AC-9 network:** load the index and click through every screen in the browser you drive while recording requests. Paste the list of request origins → only `http://localhost:5173`. Also `grep -rnE "getUserMedia|fetch\(|XMLHttpRequest|WebSocket|https?://" src index.html` → nothing outside comments.
- [ ] `git -C .. status --porcelain` → only `README.md`, `REQUIREMENTS-V1.md`, `diagrams/`, `demo/`; `git log --oneline -1` is still `0e6e911`; `buddy-screen-front` status clean.

## Implementation Notes
2026-10-28, Fern (FE). `buddy-screen-spec` `main`, HEAD `0e6e911` before and after; this TASK touched only `demo/` (+ `src/strings.ts`, `src/ui.tsx`, `src/screens/registry.tsx` additions from TASK-002). `buddy-screen-front` clean.
Files: `src/screens/parent/` — LineOvertimeRequest · LineBorrowed · LiffConsent · LiffQuotaSettings · LiffSessionTimeline · LiffGoals · LiffReportChoice · LiffGiftChoice · LiffRename · LiffFriendConsent (10, all in the index group "parent"). Phone frame 375 px wide, LINE look (green bar) vs LIFF look (white bar). Goal topics are the §12 catalogue as `goalTopics` in `strings.ts` (Thai wording = draft).

- `npm test` → `Tests 8 passed (8)`; `npm run build` → `✓ built in 458ms`, no TS errors.
- Browser walk, all 19 screens, 375×667 (`walk.mjs … all`): every `#/parent/<id>` → `loaded=yes`, `horizontalOverflowPx=0`, `buttonsUnder44px=[]`; `console errors: 0 []`. Ids: line-overtime-request · line-borrowed · liff-consent · liff-quota-settings · liff-session-timeline · liff-goals · liff-report-choice · liff-gift-choice · liff-rename · liff-friend-consent.
- AC-8 by hand (`ac8.mjs`): decline → `จบการเล่นแล้ว` (draft) · approve → `ต่อเวลาแบบชำระเงิน 12.50 บาทต่อชั่วโมง คิดเป็นรายนาที` (draft) · Sunday used up → §13 text `เวลาที่ยืมได้ของสัปดาห์นี้หมดแล้ว ซื้อเวลาเพิ่มได้ ชั่วโมงละ 12.50 บาท`, the only button left is `ซื้อเวลาเพิ่ม` · quota line filled `เหลือเวลาสัปดาห์นี้ 31 ชม. 20 นาที · วันนี้ใช้ไป 2 ชม. 10 นาที` · TV `#/tv/quota-zero` still loads with the §13 line.
- §13 parent rows: 8 × `OK`, 0 `MISSING`.
- AC-9 network: during the full walk the recorded request origins were `[ 'http://localhost:5173' ]` only. `grep -rnE "getUserMedia|fetch\(|XMLHttpRequest|WebSocket|https?://" src index.html` → no output.
- `git -C .. status --porcelain` → ` M README.md`, `?? REQUIREMENTS-V1.md`, `?? demo/`, `?? diagrams/`; HEAD `0e6e911`; `buddy-screen-front` status empty.

Draft strings (not in §13, shown with ร่าง, for the PM): screen titles, bar labels, consent body/buttons, daily-limit/overtime labels, timeline reasons, dispute, report/gift labels, rename confirm, friend list/delete, save — all in `src/strings.ts` under "draft: parent screens". The "5 ชม. 43 นาที", 500 / 120 / 99 / 12.50 numbers in draft strings are written as literals taken from the requirement, not computed.
Decisions (FE-internal): LiffGiftChoice shows the three tiers + budget 500 THB + carry-over 120 THB (carry-over value is invented fixture data); no gift catalogue (none in the requirement). LiffQuotaSettings' Sunday-used-up state is reached by a draft button **ดูกรณีวันอาทิตย์ใช้หมด** (a demo control).
UNVERIFIED — a real phone viewing the LIFF look inside LINE (only Chrome at 375×667); the Thai wording of every draft string (PM review).

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
Re-run by the SA: the build/test/§13/grep/git checks and the 19-screen walk recorded in TASK-002 § Review cover this TASK too (10 parent screens `loaded=yes` at 375×667, overflow 0, no button < 44 px, origins localhost:5173 only). `ac8.mjs` re-run: decline → `จบการเล่นแล้ว` · approve → paid extension 12.50/h per minute · Sunday used up → the §13 line and only `ซื้อเวลาเพิ่ม` left · TV quota-zero loads with its §13 line.
FE decisions (invented carry-over 120 THB fixture, the demo button for the Sunday case): accepted.
For the PM (REQ-002 Q-A): the draft strings are in `demo/src/strings.ts` under "draft: parent screens" and the TV drafts; `goalTopics` Thai wording is draft too.
Note: the FE's browser harness is in `ai-worker/tests/harness/fern/` (its 14 MB `node_modules/` is git-ignored by the workspace `.gitignore`); it stays outside the spec repo, which is right.
UNVERIFIED (as the FE says): a real phone inside LINE.
