# TASK-004: Demo — apply the PM's wording review (11 replacements, no ร่าง badge left)
- Source: SPEC-002 §4 + REQ-002 § Questions Q-A, PM review 2026-10-28 20:40 `[PM-decided]`
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: TASK-002, TASK-003 (DONE)
- Repo: `buddy-screen-spec`, files `demo/src/strings.ts` and `demo/src/ui.tsx` only. **No git writes.**

## What to do
1. In `demo/src/strings.ts`, replace the Thai text of exactly these 11 keys with the PM's text **copied from REQ-002 § Questions (PM review 20:40), not retyped**:
   `screenSleep` · `screenOffTask` · `screenLineOvertime` · `approvedResult` · `declinedResult` · `consentBody` · `dispute` · `disputeSent` · `giftSmall` · `giftNone` · `mockNotice`.
2. Every other draft (incl. `goalTopics`) is approved as written: add a source value `'pm'` (meaning "PM-approved, 2026-10-28 20:40") to `Str['source']`, add a helper `pm()`, and turn **every** `draft(...)` call into `pm(...)`. Keep the `'draft'` value and helper in the type so a future draft still gets its badge. Update the file's top comment to name the three sources.
3. `ui.tsx`: badge logic stays `source === 'draft'` (so nothing shows a badge now); update its comment only if it becomes wrong.

## Definition of Done (run in `demo/`, paste each command + real output)
- [ ] `for s in "หน้าจอพัก" "ถามเมื่อออกนอกกิจกรรม" "LINE: ขอเล่นเกินเวลา" "อนุมัติแล้ว น้องเล่นต่อได้ ค่าเวลาเพิ่มชั่วโมงละ 12.50 บาท คิดตามนาทีที่เล่นจริง" "ไม่อนุมัติ วันนี้น้องจะหยุดเล่นแล้ว" "ฉันยินยอมให้ลงทะเบียนใบหน้าของลูก ระบบเก็บแค่ข้อมูลจำหน้า ไม่เก็บรูป และลบให้ 30 วันหลังเลิกใช้บริการ" "ขอให้ตรวจสอบช่วงนี้" "ส่งให้ทีมตรวจสอบแล้ว" "ของขวัญเล็ก (ทำได้ 70% ของเป้าขึ้นไป) ไม่เกิน 40% ของงบรอบนี้" "รอบนี้ยังไม่มีของขวัญ (ต่ำกว่า 70% ของเป้า) งบยกไปรอบหน้า" "เดโมจำลอง ข้อมูลสมมติทั้งหมด ไม่เปิดกล้องจริงและไม่ต่ออินเทอร์เน็ต"; do grep -qF "$s" src/strings.ts && echo "OK $s" || echo "MISSING $s"; done` → 11 × `OK`.
- [ ] `grep -c "draft('" src/strings.ts` → `0` (only the helper definition may mention `draft`; paste `grep -n "draft" src/strings.ts`).
- [ ] The TASK-002/003 §13 loops (22 strings) → 22 × `OK` still.
- [ ] `npm test` → 8 passed · `npm run build` → exit 0.
- [ ] Browser walk (your `walk.mjs … all`) → 19 screens loaded, 0 console errors, origins localhost only; **plus** the count of `.draft-badge` elements over all 19 screens → 0 (paste how you counted).
- [ ] `git -C .. status --porcelain` unchanged in shape; HEAD still `0e6e911`; `buddy-screen-front` clean.

## Implementation Notes
2026-10-28, Fern (FE). `buddy-screen-spec` `main`, HEAD `0e6e911` before and after. Changed only `demo/src/strings.ts` (`ui.tsx` unchanged: its badge logic is still `source === 'draft'` and its comment is still true).
Method: one node script fed by a quoted heredoc, which **read the 11 PM rows out of `REQ-002 § Questions` (20:40) itself** (nothing retyped), asserted exactly one `draft('…')` match per key and threw otherwise, then converted the other drafts: 86 `draft(` / `.map(draft)` uses → `pm(`/`.map(pm)`. Then four editor-tool edits: `export const draft` (kept in the file and exported because `noUnusedLocals` would fail the build on an unused local) and three section comments saying "draft" → "PM-approved". Source type is now `'§13' | 'pm' | 'draft'`; top comment names all three.

- 11 PM texts: `OK` × 11, no `MISSING` (the DoD loop, output pasted by the run: หน้าจอพัก … เดโมจำลอง ข้อมูลสมมติทั้งหมด ไม่เปิดกล้องจริงและไม่ต่ออินเทอร์เน็ต).
- `grep -c "draft('" src/strings.ts` → `0`. `grep -n "draft" src/strings.ts` → lines 1 (top comment), 2 (type), 5 (helper definition) only.
- §13 loops (14 TV + 8 parent = 22): `22 OK`, no `MISSING`.
- `npm test` → `Tests 8 passed (8)`; `npm run build` → `✓ built in 580ms`, exit 0.
- Browser (`walk.mjs … all`, then `badges.mjs`, dev server on 5173, since stopped): 19 screens loaded; `console errors: 0 []`; `request origins: [ 'http://localhost:5173' ]`. Badge count: `badges.mjs` loads the index and each of the 19 hashes (page reload each) and counts `.draft-badge` → `index: 0 badges`, `total .draft-badge over index + all screens: 0`.
- `git -C .. status --porcelain` → ` M README.md`, `?? REQUIREMENTS-V1.md`, `?? demo/`, `?? diagrams/` (same shape); HEAD `0e6e911`; `buddy-screen-front` status empty.

UNVERIFIED — the new, longer strings (consent body, `approvedResult`, `giftNone`) were not re-checked at 375 px for wrapping/overflow in this run beyond the walk's overflow measure (`walk.mjs` printed per-screen overflow and 0 console errors; I did not look at screenshots of them).

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
Re-run by the SA in `demo/`: PM 11-string loop → 11 × OK · `grep -n "draft" src/strings.ts` → lines 1, 2, 5 only (comment, type, helper) · §13 loop → 22 × OK · `npm test` → 8 passed · `npm run build` → `✓ built in 477ms` · network grep → none · a fresh `npm run dev` + SA badge script (index + 19 screens, reload each) → `badges total 0`, 0 console errors · `walk.mjs all` → origins localhost:5173 only · git: same shape, HEAD `0e6e911`, `buddy-screen-front` clean.
The FE's UNVERIFIED item settled: SA screenshots at 375×667 of `liff-consent`, `liff-gift-choice`, `line-overtime-request`, `liff-friend-consent` — the longer PM strings wrap inside the frame, no clipping, buttons fully visible.
`export const draft` kept (build's `noUnusedLocals`): accepted.
