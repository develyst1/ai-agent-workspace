# TASK-005: Fix TEST-001 defects DEF-1..4 (TV decline screen, diagrams, buy-back, no face emoji)
- Source: SPEC-002 + REQ-002 § Defects to fix — round 2 (TEST-001 TEST_FAILED 2026-10-28); QA detail in `tests/TEST-001-spec-repo-and-vite-demo.md` § Defects
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: TASK-004 (DONE)
- Repo: `buddy-screen-spec`. Closed file list:
  - `diagrams/02-engagement-states.md`, `diagrams/03-overtime-borrowing.md`, `diagrams/04-childrens-data.md`;
  - `demo/src/strings.ts`, `demo/src/screens/registry.tsx`;
  - `demo/src/screens/tv/OvertimeDeclined.tsx` (new), `demo/src/screens/tv/OffTask.tsx`, `demo/src/screens/tv/GoingToSleep.tsx`;
  - `demo/src/screens/parent/LineOvertimeRequest.tsx`, `demo/src/screens/parent/LineBorrowed.tsx`, `demo/src/screens/parent/LiffQuotaSettings.tsx`;
  - `demo/src/ui.tsx` only if a link style is needed.

  **No git writes.**

## What to do
1. **DEF-1 (MAJOR): the TV side of a decline.**
   - New TV screen `OvertimeDeclined`, hash `#/tv/overtime-declined`, in the index (TV group, after `quota-zero`).
   - It shows the §13 line `strings.overtimeDeclinedTv` ("วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย") with a non-face icon (🌙). It is a session-ending screen like `QuotaZero`.
   - In `LineOvertimeRequest`, after **ไม่อนุมัติ**, show under the result a link to `#/tv/overtime-declined` (a plain `<a href>`, ≥ 44 px tall) so the decline path reaches the TV line.
2. **DEF-2 (MINOR): diagrams carry every decided rule.** Requirement wording is in `REQUIREMENTS-V1.md` §6, §7 R-Q-5 and §10.
   - `02-engagement-states.md`:
     - the entry arrow becomes `[*] --> sleep`;
     - the `active --> sleep` label becomes `activity ends or child says stop`;
     - the `sleep --> active` label says recognised **and** (gesture, or name call confirmed, or invitation accepted).
   - `03-overtime-borrowing.md`: the no-answer edge label becomes `no answer within 3 h from the LINE send`.
   - `04-childrens-data.md`:
     - the templates node (`SRV`) adds `kept until deleted, or 30 days after the subscription ends`;
     - add a node `Names (child nickname, AI name, friend nicknames)<br/>server, while subscribed`.
3. **DEF-3 (MINOR): buy-back.**
   - `LineBorrowed`: under the §13 bubble (text unchanged), add a link to `#/parent/liff-quota-settings` (the "เมนูโควต้า" the message names).
   - `LiffQuotaSettings`: add a buy-back block, always visible. It shows:
     - the borrowed time (`fixtures.borrowedMinutes`, 30);
     - the price: 12.50 THB/h, billed per minute;
     - the amount `borrowedMinutes × 12.5 ÷ 60`, shown with 2 decimals (30 → **6.25 บาท**);
     - a button that, when pressed, shows a "bought back" status.
   - Do not demo any rounding rule beyond this exact fixture.
4. **DEF-4 (MINOR): no face for the AI (R-AI-1).**
   - `OffTask`: 🤔 → ❓.
   - `GoingToSleep`: 😴 → 🌙.
   - No other emoji changes. The allowed icons are 🎙️ 🌙 ⏰ ❓.
5. **Words.**
   - §13 text is used verbatim, and nothing in §13 changes.
   - Each new label (the link texts, the buy-back title/amount/button/status, the new screen's index title) is added to `strings.ts` as `draft(...)`, so it shows the ร่าง badge. The PM reviews those before QA re-tests (REQ-002 Q-A process).
   - Keep the drafts to the minimum: about 6–8.

## Definition of Done (paste each command + real output)
- [ ] In `demo/`: `grep -rn "overtimeDeclinedTv" src --include=*.tsx` → at least one hit in `screens/tv/OvertimeDeclined.tsx` (base: no hit, exit 1 — SA ran it).
- [ ] Face emoji gone: `grep -rnP "[\x{1F600}-\x{1F64F}\x{1F910}-\x{1F92F}\x{1F970}-\x{1F97F}\x{1F9D0}-\x{1F9DF}\x{2639}\x{263A}]" src` → no output (base: 2 hits, OffTask 🤔 and GoingToSleep 😴 — SA ran it).
- [ ] The 11 PM strings (TASK-004 loop) → 11 × OK. The §13 loops (TASK-002 + TASK-003, 22 strings) → 22 × OK. Plus `grep -qF "วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย" src/strings.ts` is still OK.
- [ ] `npm test` → 8 passed · `npm run build` → exit 0.
- [ ] Browser, against a fresh `npm run dev`:
  - the walk shows 20 screens `loaded=yes`, 0 console errors, origins localhost:5173 only, no overflow at 375×667;
  - clicking through: LINE overtime → ไม่อนุมัติ → the link → the TV screen's text contains `วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย` (paste the text);
  - LINE borrowed → the link → quota screen → buy-back shows `6.25` → press → status shown (paste);
  - the `.draft-badge` count over all screens = the number of new draft keys (paste both numbers).
- [ ] Diagrams, from the repo root: the TASK-001 mermaid-cli loop renders all four to `/tmp` → four `✅`, no `FAIL`. Then `grep -nE "child says stop|\[\*\] --> sleep|from the LINE send|30 days after the subscription ends|while subscribed" diagrams/*.md` → each phrase is in the right file (paste).
- [ ] `git -C <spec repo> status --porcelain` → the same 4 entries as before; HEAD `0e6e911`; `buddy-screen-front` clean.

## Implementation Notes
2026-10-28, Fern (FE). `buddy-screen-spec` `main`, HEAD `0e6e911` before and after; `buddy-screen-front` status empty. Edited only files on the TASK's list (`diagrams/02,03,04`, `demo/src/strings.ts`, `screens/registry.tsx`, `screens/tv/OvertimeDeclined.tsx` new, `OffTask.tsx`, `GoingToSleep.tsx`, `screens/parent/LineOvertimeRequest.tsx`, `LineBorrowed.tsx`, `LiffQuotaSettings.tsx`, `ui.tsx`). Evidence scripts in `ai-worker/tests/harness/fern/` (`task005.mjs` new).

- **DEF-1:** `OvertimeDeclined` (🌙, `strings.overtimeDeclinedTv`) at `#/tv/overtime-declined`, in the index after `quota-zero`. `LineOvertimeRequest`: after ไม่อนุมัติ a plain `<a href="#/tv/overtime-declined">` (new `PhoneLink` in `ui.tsx`). Run: link height `44` px; click → url `#/tv/overtime-declined`, TV text `วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`.
- **DEF-2:** `02`: `[*] --> sleep`; `active --> sleep: activity ends or child says stop`; `sleep --> active: Buddy recognised and (gesture, or name call confirmed, or invitation accepted)`. `03`: edge `no answer within 3 h from the LINE send`. `04`: SRV node adds `kept until deleted, or 30 days after the subscription ends`; new node `NAMES["Names (child nickname, AI name, friend nicknames)<br/>server, while subscribed"]` (not linked to other nodes — it only states retention).
- **DEF-3:** `LineBorrowed`: §13 bubble unchanged + link to `#/parent/liff-quota-settings`. `LiffQuotaSettings`: always-visible buy-back block: title, `ยืมไป 30 นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีที่ใช้`, amount `(borrowedMinutes × extraPerHourThb ÷ 60).toFixed(2)`, button → status. Run: bubble text `…ยืมเวลาจากวันอาทิตย์ 30 นาทีแล้วครับ ซื้อคืนได้ที่เมนูโควต้า` → link → amount `ยอดที่ต้องชำระ 6.25 บาท` → press → `ซื้อคืนแล้ว`. No other rounding demonstrated.
- **DEF-4:** `OffTask` 🤔 → ❓; `GoingToSleep` 😴 → 🌙.
- `grep -rn "overtimeDeclinedTv" src --include=*.tsx` → `src/screens/tv/OvertimeDeclined.tsx:8`.
- Face-emoji grep (the DoD `-P` regex over `src`) → no output, `exit=1`.
- 11 PM + 22 §13 strings + the decline line, one loop over all 33 → `33 OK`, no `MISSING`.
- `npm test` → `Tests 8 passed (8)`; `npm run build` → `✓ built in 573ms`, exit 0.
- Walk (fresh `npm run dev`, 375×667): `index lists 20 screens`, `20` × `loaded=yes`, no overflow line printed, `console errors: 0 []`, origins `[ 'http://localhost:5173' ]`. Network grep over `src index.html` → no output.
- Diagrams: mermaid-cli loop → four `✅ /tmp/mmd-0N-….md`, no `FAIL`; the phrase grep hits each phrase in the right file (02 l.7/16, 03 l.12, 04 l.9/14).
- Draft badges: new draft keys = **8** (`grep -c "draft('"` → `8`). Badges counted by `task005.mjs` on a fresh load of each of the 20 screen pages = **5**: `line-borrowed` 1 (`linkToQuota`), `liff-quota-settings` 4 (`buyBackTitle`, `buyBackInfo`, `buyBackAmount`, `buyBackButton`). The other 3 keys are not on those page loads: `screenOvertimeDeclined` shows on the index page (the script does not count the index in this run), `linkToTv` only after ไม่อนุมัติ is pressed, `buyBackDone` only after ซื้อคืน is pressed. So 5 + 3 = 8 keys, but only 5 were counted by the script; the other 3 are accounted for by reading, not by a counted run. UNVERIFIED — counted total of 8.
- `git -C <spec> status --porcelain` → same 4 entries (` M README.md`, `?? REQUIREMENTS-V1.md`, `?? demo/`, `?? diagrams/`); HEAD `0e6e911`.

Decisions (FE-internal): the buy-back price line merges "borrowed minutes" and "price" into one draft (`buyBackInfo`) to keep drafts at 8; amount uses the existing fixture (`borrowedMinutes`, `extraPerHourThb`); link styling is inline in `PhoneLink` (no new CSS file, the file list excludes `index.css`).
UNVERIFIED — the look of the new buy-back block and the new TV screen in screenshots (not viewed this round); mermaid layout on GitHub's renderer; PM review of the 8 new drafts (REQ-002 Q-A process).

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
Re-run by the SA:
- `overtimeDeclinedTv` rendered at `OvertimeDeclined.tsx:8`;
- face-emoji grep → none (exit 1);
- 8 `draft('` keys (lines 112–119);
- `npm test` 8 passed · build ok · network grep none;
- git: same 4 entries, HEAD `0e6e911`, front clean.

SA click-through on a fresh dev server, 375×667:
- ไม่อนุมัติ → link → `#/tv/overtime-declined`, text `🌙วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`;
- LINE borrowed → link → `#/parent/liff-quota-settings` → `ยอดที่ต้องชำระ 6.25 บาท` → ซื้อคืน → `ซื้อคืนแล้ว`;
- **distinct ร่าง labels over the index + 20 screens + both clicked states = 8**, which settles the FE's UNVERIFIED count;
- 0 console errors;
- `walk.mjs`: 20 loaded, overflow 0, no button < 44 px, origins localhost only.

Screenshots of the TV decline screen and the buy-back block after the button press: laid out cleanly.

Diagrams:
- read against §6, R-Q-5 and §10: all DEF-2 items present;
- mermaid-cli → four ✅, outputs in the SA's scratchpad, nothing written into the repo.

FE decisions (merged `buyBackInfo`, inline `PhoneLink`, the free-standing NAMES node): accepted.

**For the PM before the QA re-test:** the 8 new drafts in `demo/src/strings.ts` lines 112–119 (REQ-002 Q-A).
