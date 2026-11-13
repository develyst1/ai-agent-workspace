# TASK-009: Front — AI proposals + summary page
- Source: SPEC-002 (§API rows G1, T2, S1, S2; §AI; §Front — pages rows `/projects/[id]` AI panel and `/projects/[id]/summary`; §Non-functional AC-8 timing)
- Owner: FE (Fern)
- Status: DONE (2026-11-08, SA review; 37/37 + the AC-11 idle proof against the real back + stand-in). Earlier: TODO (2026-11-08: TASK-006 and TASK-007 DONE). Layout B: the AI button lives on the board page; the summary page uses B's look.
  Prove it against the REAL back (`tests/harness/back-pglite/serve.ts`) + `gateway-stub/`, as TASK-007/008 did. Q-F3 failure rule applies.
- Depends on: TASK-006, TASK-007
- Git: none by you. The back points at the **stand-in** (`127.0.0.1:4399`) only.

## What to do
1. Owner's "ให้ AI ช่วยแตกงาน" → G1 → a panel: each proposal with a tick box (ticked by default) and an editable title. "บันทึกงานที่เลือก" → T2
   with the ticked titles only → the tasks appear, the panel closes. Leaving or reloading drops the proposal (D10, AC-7a). Asking again replaces it.
2. `/projects/[id]/summary`: S1 on load (no gateway call): the Stuck list (title + reason) and the stored AI text with
   "สรุปเมื่อ <วันที่ เวลา>" (Asia/Bangkok), or "ยังไม่มีสรุป กด \"สรุปใหม่\"". "สรุปใหม่" → S2 → replace.
3. While a call runs: the button is disabled + the loading string. 502 / front timeout 28 s → the AI error string, nothing else
   changes. 429 → the busy / rate-limited strings (Q-S2).
4. No polling, no call on page load except S1 (AC-11).

## Definition of Done
- [ ] Stub walk, with screenshots in `tests/harness/shots/TASK-009/`: mode `ok` → proposal → untick 2, edit 1, save → exactly the
      ticked ones with the edit, as ยังไม่เริ่ม (AC-7) · proposal open → reload → nothing added (AC-7a) · mode `hang` → the error
      within 30 s, the project unchanged (AC-8) · summary with 2 ติดอยู่ tasks lists both with reasons (AC-9). Paste the steps.
- [ ] AC-11: `curl -s -X DELETE 127.0.0.1:4399/calls`, keep the project + summary pages open 5 minutes, `curl -s 127.0.0.1:4399/calls` → `"count":0`;
      one "สรุปใหม่" press → `"count":1`. Paste.
- [ ] `bun run build` passes. Paste the last lines.

## Implementation Notes
**Fern, 2026-11-08.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). Q-F3 rule applied: a failure shows a string and the screen keeps what the person typed.

**What was built**
- `src/components/ai-panel.tsx` (owner only, on the board page under add-task): the button `ให้ AI ช่วยแตกงาน` → G1 → a panel headed `งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)`; each row has a tick (ticked by default) and an editable title; `บันทึกงานที่เลือก` → T2 with the ticked, trimmed titles only → the tasks join the board as ยังไม่เริ่ม and the panel closes; `ยกเลิก` drops it. The proposal lives only in component state (D10): reload or leave and it is gone; pressing again replaces it. Save is disabled while nothing is ticked, a ticked title is blank, or one is over 200 (that row shows the too-long string). A T2 failure keeps the panel and the edits.
- `/projects/[id]/summary` (any viewer): S1 on load (the page never calls the gateway), the stuck list (title + `ติดเพราะอะไร` + reason, taken from the project), then the stored AI text under `สรุปเมื่อ <วันที่ เวลา>` (Asia/Bangkok) or `ยังไม่มีสรุป กด "สรุปใหม่"`, and the button `สรุปใหม่` → S2 → replaces. The board has the link `สรุปงาน` for everyone (the page heading uses the same string).
- While a call runs: the button is disabled and reads `AI กำลังคิด…`. `aiMessageFor()`: 429 `AI_BUSY` → the busy string, 429 `RATE_LIMITED` → the too-many-presses string, 403/404 keep theirs, and **everything else (502, the 28 s front timeout, network, an empty or malformed answer) → `AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน`**, shown beside the button, nothing else changing (AC-8). No polling; the only call on page load is S1 (AC-11).
- Strings added to `strings.th.ts`, each from REQ-001's tables: aiTasks, saveSelected, aiProposalHeading, aiThinking, aiError, aiBusy, rateLimited, summaryNew, summaryNone, summaryAt, linkSummary. The checkbox and the title input have screen-reader labels from existing strings (the row's own title; `ชื่องาน`).

**Evidence (all run by me)** — REAL back (`back-pglite`) on :4310 + the AI stand-in (`gateway-stub`) on :4399 + the front on :4300; passwords were random command-line values, never written down; all my servers stopped by pid afterwards.
- **Walk: `node ai-worker/tests/harness/task-009.mjs` → 37/37 passed** (headless Chrome, real clicks and typing; `mode.txt` switched between steps):
  - **AC-7:** mode `ok` → a proposal of 5 rows, all ticked; I unticked 2, edited 1 title, saved → exactly the 3 ticked rows were added, with the edit, in ยังไม่เริ่ม, and they were still there after a reload.
  - **AC-7a:** a proposal left open, then a reload → nothing added; `ยกเลิก` → nothing added; asking again replaced the proposal (my edit was gone).
  - **AC-8:** gateway modes `500`, `empty`, `malformed` each → the AI error string and the project unchanged (the same string); mode `hang` → the string after **25 091 ms** (≤ 30 s), the button disabled with `AI กำลังคิด…` meanwhile, the project unchanged. On the summary page `hang` → the string after 25 040 ms and the **earlier summary still shown**.
  - **AC-9:** the summary lists both ติดอยู่ tasks with their reasons; before any press `ยังไม่มีสรุป กด "สรุปใหม่"`; opening it made 0 calls; one `สรุปใหม่` → text + `สรุปเมื่อ 8 พ.ย. 20:03`, exactly 1 call; after a reload the stored summary is still there with no new call. As invitee A: the same stuck list and the stored summary; A sees the summary link and no AI task button.
  - **AC-11:** opening the project page → 0 calls; one press → 1 call; saving the ticked rows → no extra call.
  - 390 px: 0 px of sideways page scroll on the summary and with the proposal open.
- **AC-11 idle, `node ai-worker/tests/harness/task-009-idle.mjs`:** `DELETE /calls`, project page open, then the summary page open with nobody pressing anything. Output: `summary page open at +67s; calls=0` · `after 513 s with the pages open and no press: calls=0` · `PASS AC-11: 0 gateway calls while idle` · `PASS AC-11: one press of สรุปใหม่ → calls=1`. (513 s wall-clock from the first page load; the script's two waits were 60 s and 300 s, the rest is timer drift. The summary page was open for about 446 s of it.) I used the stand-in's own `/calls` endpoint as the TASK's `curl` lines do.
- **Faked, not real:** the two 429 cases (`AI_BUSY`, `RATE_LIMITED`) are produced by CDP request interception, because the back needs a second concurrent call or 10 presses a minute to return them. They prove the front's strings, not the back's guards (TASK-006's).
- Shots, `ls -l` bytes, in `ai-worker/tests/harness/shots/TASK-009/`: `proposal-1280.png 117890` · `proposal-edited-1280.png 118731` · `proposal-390.png 84888` · `ai-thinking-1280.png 96797` · `ai-error-1280.png 123819` · `summary-empty-1280.png 34971` · `summary-1280.png 41696` · `summary-390.png 37021`. I opened `proposal-edited`, `summary` and `ai-error`. All synthetic (`*@godplan.test`; the AI texts are the stand-in's).
- `bun run build` → `✓ Compiled successfully`; routes `/ · /_not-found · /invite/[token] · /projects/[id] · /projects/[id]/members · /projects/[id]/summary · /reset/[token] · /sign-in`; `[postbuild] copied .next/static into .next/standalone`. `ls -l .next/standalone/server.js` → `6940 B`; `ls .next/standalone/.next/static` → `B4bk6a-_v4ShgutFpHhho  chunks  media`. `bunx tsc --noEmit` → `TSC_OK` (also after the build).
- `grep -rn dangerouslySetInnerHTML src` → none; `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → none (two Thai words in comments were reworded to get there); no `#hex` in `src`; one React (`@heroui/react@3.1.0 · next@16.2.9 · react@19.2.7 · react-dom@19.2.7`); `git check-ignore -v .env.local` → `.gitignore:5:.env*.local`; `git status --short` → ` M README.md`, `?? .env.example .gitignore bun.lock next.config.ts package.json postcss.config.mjs scripts/ src/ tsconfig.json`; branch `atom`, HEAD `a41cbd0`.
- The back pointed at the **stand-in only** (the harness fixes `LLM_GATEWAY_URL` to :4399); no live gateway was called. I left `gateway-stub/mode.txt` set to `ok`; `calls.jsonl` and `mode.txt` are the stand-in's own scratch files.

**Decisions I made (internal)**
- The proposal panel is inline on the board page (a card under the add-task row), not a drawer: the drawer is the thread's.
- The AI error shows beside the button that was pressed, and a proposal already on screen is left alone if a second press fails.
- Rows with a blank ticked title block save instead of being dropped silently.

**UNVERIFIED**
- `/impeccable` audit (not in my session), real phone, keyboard-only / screen-reader pass, hit targets measured (classes are `min-h-11`).
- AI wording quality (the stand-in's texts are not real); the live gateway is the owner's D11 run.
- The back's own busy / rate-limit guards were not exercised from the front (TASK-006 covers them).

## Questions
- None open.

## Review
**DONE — Sober (SA), 2026-11-08.**
- Re-checked: `dangerouslySetInnerHTML` → 0 · Thai in `.tsx` → 0 · `/projects/[id]/summary` exists. I opened `proposal-edited-1280.png`
  (ticked/unticked rows, an edited title, save + cancel) and `summary-1280.png` (both ติดอยู่ tasks with reasons from the project, then
  `สรุปเมื่อ 8 พ.ย. 20:03` + the stored text + `สรุปใหม่`). Both match your evidence and SPEC-002.
- Your **37/37 walk against the real back + the stand-in** covers AC-7, AC-7a, AC-8 (500/empty/malformed, and hang at about 25 s, with the
  earlier summary kept) and AC-9 as owner and invitee. The **idle run** (0 calls with the pages open for about 7½ min, then 1 call per press) covers AC-11.
  Accepted. The 429 strings proved by interception are accepted as the front's mapping only, as you stated. The back's guards are TASK-006's.
- Decisions accepted. Blocking save on a blank ticked title is better than silently dropping it.
- `UNVERIFIED` carried to the release gate: `/impeccable`, real phone, keyboard / screen reader, and the live AI wording (D11, the owner's).
