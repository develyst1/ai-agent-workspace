# REQ-126: In CAW's chat each question gets its own answer, a plan is never left open twice, and workers leave no junk in the product
- Status: **Round 2 DELIVERED** (2026-10-31 05:1x, the PM — DECISIONS 05:1x; O-2 accepted; git word asked) · **Round 2 TEST_PASSED** (2026-10-31 05:08, QA Tanya — AC-7/8/9 PASS on the stub; DEF-2 fixed; O-2 noted; `tests/TEST-124-…` § Round 2) · **Round 2 READY_FOR_SA** (2026-10-31 03:2x, the PM — DEF-2, § Round 2) · **TEST_FAILED** (2026-10-31 03:18, QA Tanya — live: DEF-2 MAJOR, a reworded second plan can start the same work again (req 3); AC-5 PASS; earlier 02:32: DEF-1 MINOR, AC-1/2/3/6 PASS; `tests/TEST-124-chat-answers-plan-copy-temp-folders.md`) · READY_FOR_SA (2026-10-31 00:5x, the PM)
- Priority: HIGH `[operator]` (F-1 MAJOR)
- Requested: 2026-10-31 by the owner's goal (via Atom 00:24: *"รีบเก็บให้ครบร้อยเปอร์เซ็นต์"*). Source: REQ-124's rehearsal, TEST-122 F-1 (MAJOR), F-2, F-5. `[PM-decided]` (DECISIONS 2026-10-31 00:5x)
- Deadline: none · Team: **B (CAW)** · after REQ-125's commit (same caw-back / caw-front trees, F-013)

## Problem / Goal

In TEST-122 the chat worker ปลา asked the owner 4 questions, each with a default. The owner pressed "ตามนั้น" on question 1. All four then showed "ตอบแล้ว", only question 1's answer was stored, and "ตกลง เริ่มงาน" became enabled. So the owner never saw or chose the defaults of questions 2–4 (F-1). After the answer, ปลา posted the same 8-card plan a second time. It stayed open beside the accepted one, so the owner could press "ตกลง เริ่มงาน" twice (F-2, seen before in TEST-106). The QA worker also left a 58 MB browser profile inside the product folder, and it would ship with the product (F-5).

## Requirement

1. **Each question in the chat is answered on its own.** "ตามนั้น" (or a typed answer) on one question marks only that question answered, with its own answer kept. The others stay open and show their defaults.
2. **"ตกลง เริ่มงาน" stays disabled while any question is open**, and says how many are left.
3. **Once a plan is accepted, no second open plan for the same work can be accepted.** A later plan with the same items is either not shown as open, or shown as already accepted. Which of the two is the SA's design.
4. **A worker's own temporary files (browser profiles, scratch scripts, caches) never stay in the product folder** when its card is done. The product folder holds only the product.
5. Everything that works today keeps working (REQ-117…122, REQ-125 once committed).

## Acceptance Criteria

- [ ] **AC-1** — **Given** a chat message with 4 questions **When** the owner presses "ตามนั้น" on question 1 **Then** only question 1 shows "ตอบแล้ว"; questions 2–4 still show their defaults and their own "ตามนั้น". Check: QA, the screen (stub chat).
- [ ] **AC-2** — **Given** 3 of 4 questions answered **Then** "ตกลง เริ่มงาน" is disabled and shows the line below. **When** the 4th is answered **Then** it is enabled, and the 4 answers are kept, each with its own text. Check: QA, screen + stored answers.
- [ ] **AC-3** — **Given** an accepted plan **When** the chat worker posts the same plan again **Then** the owner cannot start the same work a second time from the screen. Check: QA, stub.
- [ ] **AC-4** — **Given** a worker that creates a browser profile or temp files in the product folder (stub) **When** its card is done **Then** those files are not in the product folder. Check: QA, a folder listing.
- [ ] **AC-5** (live, may share REQ-124 round 2's run) — a new project's chat with several questions is answered one by one, and the finished product folder holds no worker junk. Check: QA, live.
- [ ] **AC-6** (regression) — suites; REQ-117…122, 125 cases.

## User-facing wording (the PM)

| Where | TH |
|---|---|
| "ตกลง เริ่มงาน" disabled, questions left | ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ |
| a second copy of an accepted plan (if shown) | แผนนี้ตกลงไปแล้ว |

## Out of Scope

- Anything on the deployment side. · How good the chat worker's questions are. · Deleting a product's real files (only the worker's own temporary files).

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Q1 (SA B, 2026-10-31 01:4x) — one decision pack, three parts. Checked:** DECISIONS 2026-10-31 00:2x / 00:5x, D-105 (REQ-016's "one question, one way to answer", the words in `caw-front → src/words.ts:396-402`), SYSTEM-FACTS — none settles these. **What the code does today (read 01:4x):** a worker's message stays "open" only until **any** operator message follows it (`Chat.tsx` `openId`). "ตามนั้น" posts `ตามนั้น — <default>` as a new message, which closes all its questions, and `answeredWith` finds an answer for that one question only (`crew.ts:33-35`). **Every operator message starts a new chat hop** for the entry worker (`runner/main.ts` `pendingMessage`). An open plan is superseded only by a newer one **on the same message** (`proposals/service.ts:105`); TEST-122's second plan hung on a later message. Workers get the runner's own `TMPDIR` (`hop.ts:169`) and no folder of their own for temp files. **I design on these defaults; correct only the line that is wrong:**
  - **(a) Answers stay on the screen until all are given, then go as one message.** Each "ตามนั้น" or own answer marks only that question (shown as `ตอบแล้ว · <answer>`), and nothing is sent yet. When the **last** one is answered, the screen sends **one** message, one line per question, `ข้อ <n>: <answer>`. That gives one chat hop, not four, and the worker reads every answer at once. An own answer is typed in a small box **under that question** (not the main chat box). *Alternative:* send each answer at once — 4 hops, and the worker may act after the first answer, which is TEST-122's harm again. New words for the PM: the line format `ข้อ {n}: {answer}`, and the own-answer box's placeholder. A screen that reloads before the last answer forgets the given ones (they live only on the screen) — acceptable?
  - **(b) "ตกลง เริ่มงาน" is disabled while any question on the open message is unanswered**, with the PM's line `ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ` (`{n}` = unanswered questions on that message).
  - **(c) A second copy of an accepted plan:** **caw-back refuses** to accept a proposal whose items (titles + anchors, in order) equal an already **accepted** proposal's in the same project — 409, as a safety net — **and caw-front** shows such a proposal with `แผนนี้ตกลงไปแล้ว` and no start button. Both, because the screen alone can be raced (two tabs).
  - **(d) Worker junk:** CAW gives each worker its **own temp folder outside the product** (`TMPDIR`, plus `XDG_CACHE_HOME` and `PLAYWRIGHT_BROWSERS_PATH`'s profile area, all under the worker's runner folder), and the card prompt says "temporary files and browser profiles go in $TMPDIR, never in the project folder". CAW **does not delete anything** in the product folder itself (Out of Scope: no product files deleted; it cannot tell a worker's file from the product's). AC-4's stub that writes into the product folder on purpose would then **fail** AC-4. *Alternative (needs your yes):* at `review`/`done`, CAW refuses the move while a top-level folder that looks like a browser profile or cache (`*profile*`, `.cache`, `tmp`, `node_modules/.cache` — a fixed list) is **new since the card's first hop**, and tells the worker to remove it. That is like REQ-125's refusal, and it never deletes. **My default: both** — the temp folder prevents it, and the refusal catches what slips through. The fixed list is in the SPEC.
  > answer (Porter, PM, 2026-10-31 01:4x) `[PM-decided]`: **(a) accepted** — answers stay on the screen until all are given, then go as one message. Words: each line `ข้อ {n}: {answer}` · own-answer box placeholder `พิมพ์คำตอบของข้อนี้` · its button `ใช้คำตอบนี้` · an answered question shows `ตอบแล้ว · {answer}` with a small `แก้` to change it before the last one is given. Losing the given answers on a reload is **accepted** for now, since the owner is the only user. If it bites in REQ-124 r2, it becomes a round. **(b) accepted.** **(c) accepted** (both caw-back and caw-front). **(d) accepted — both** (own temp folder + the refusal at review/done; never a delete). The worker-facing refusal: `ยังส่งไม่ได้ — มีโฟลเดอร์ชั่วคราว {name} ในโฟลเดอร์งาน ให้ย้ายไปไว้ใน $TMPDIR หรือลบออกก่อน`. The fixed list goes in the SPEC. Q1 unblocked.
- **Q2 (SA B, 2026-10-31 03:4x) — round 2, one decision: which cards count as "already on the board"? Checked:** DECISIONS 2026-10-31 03:2x (round 2: judge by the requirements cards carry, never wording; 3d removed cards don't count), 2026-10-29 11:41 (Blueprint holds the requirements; CAW follows the latest spec), SYSTEM-FACTS. They do not say whether a **done** card still blocks new work on its requirement. **What I read (03:4x):** a plan becomes cards only by "ตกลง เริ่มงาน" — caw-front has no screen to make a card by hand (`POST /cards` exists, no caller in caw-front). So whatever blocks a plan blocks the owner's only way to get that work. TEST-122 r2's second plan anchored REQ-007/004/008/003/002/004/005/006/001, all already on the 9 fresh `todo` cards (`tests/harness/test-124/r2/out/proposal.json` vs the chat trace) → refused under any option below. **I design on this default — correct it if wrong:**
  - **Default (C): "on the board" = a work card with that requirement key that is not `done`** (todo · doing · review · stuck), and not removed (3d). Cases: DEF-2's repost right after the accept → refused (`แผนนี้ตกลงไปแล้ว` / 409) · a plan that brings one new requirement → only that becomes cards, line `มีงานนี้บนบอร์ดแล้ว {n} งาน — จะเพิ่มเฉพาะงานใหม่ {m} งาน` · a follow-up on a requirement **whose cards are all done** (the owner edited it in Blueprint, or asks for more) → accepted as new work · a follow-up **while its card is still open** (e.g. in รอตรวจ) → counted as on the board; the owner finishes or reviews that card first · the chat worker reposting the same plan **after** all its cards are done → would be accepted again (I judge this rare: TEST-106/122 reposts came seconds after the accept).
  - *Alternative (A): any work card counts, done included.* It also catches a repost after everything is done, but then a requirement that already has a done card can **never** get new work through the chat again, since there is no other screen.
  - Either way: a requirement is matched by its key only (not by role or worker — TEST-122 r2 put REQ-004 on the BE as well as the FE) · question cards don't count · a new card that depended on a skipped item waits for the open card(s) of that requirement · the plan's estimate line still shows the whole plan, while the line above the button (`จะได้ … การ์ด` / `ทีมจะเริ่มทำ … การ์ด`) counts only the new cards.
  > answer (Porter, PM, 2026-10-31 03:4x) `[PM-decided]`: **(C) accepted, with every case as written.** Only open work cards (todo · doing · review · stuck, not removed) count as "on the board"; a requirement whose cards are all done can get new work through the chat again — the chat is the owner's only way to ask for more, so (A) would lock him out. A repost after everything is done is accepted as rare (both seen reposts came seconds after the accept). Match by requirement key only; question cards don't count; the line above the button counts only the new cards. 3a–3c read with "on the board" = (C). Q2 unblocked.

## AC check
(SA B, Silver, 2026-10-31 02:1x — SPEC-125; TASK-168/169 DONE, uncommitted: caw-back 5779554 fp `32a65f35c337` · caw-front ce5ca8d fp `f91e9b59a4f2`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | `caw-front → src/components/chat/Chat.tsx` local `answers` per question: "ตามนั้น" marks only that one, nothing posted; the others keep their pair — screenshot `tests/harness/task169/a-after-q1-1280.png` (opened by me) + e2e "answers together · four open questions" (Fanta) | yes |
| AC-2 | "ตกลง เริ่มงาน" disabled with `ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ` (`ProposalCard` `unanswered`); the last answer posts ONE message of `ข้อ n:` lines; `answeredWith` reads each back by index (`crew.ts`, SPEC-125 D2 table, `crew.test.ts`) | yes; the stored answers through a real caw-back = QA |
| AC-3 | caw-back 409 `plan_already_accepted` for a plan equal to an accepted one (`proposals/service.ts`, `test/http/plan-copy.test.ts`); the screen shows `แผนนี้ตกลงไปแล้ว` with no button and the Board's notice skips it (`crew.ts` `isPlanCopy`, `proposalWaits`) | yes; the badge on screen = QA |
| AC-4 | each worker's own `TMPDIR` / `XDG_CACHE_HOME` + rule 8 naming the folder (`hop.ts`, `prompt.ts:38`); review/done refused with the PM's words while a Chrome profile or an untracked fixed-list folder sits in a writable root, never deleted (`cards/temp-folders.ts`, `test/http/temp-folders.test.ts`) | yes — stub; a real git repo with a tracked `tmp/` = QA |
| AC-5 | live — the design above, unchanged on a real CLI | yes — design; the live proof is QA's ("Check: QA, live") |
| AC-6 | caw-back whole `1008 pass · 1 skip · 1 fail` (known withReadGuard); caw-front `369 pass · 0 fail`, typecheck 0, e2e 279 (Fanta) | yes |

**Round 2** (SA B, Silver, 2026-10-31 04:28 — SPEC-126; TASK-170/171 DONE, uncommitted: caw-back 5b49f65 fp `8beff9850492` · caw-front 7f68c42 fp `aa5f4bea3ba7`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-7 | caw-back `onBoard` (open work cards not done, by requirement key) + accept 409 `plan_already_accepted` when all are on the board (`proposals/service.ts`); test "AC-7 (TEST-122 round 2, word for word)" in `test/http/plan-copy.test.ts`: the 9 + 9 live plans → `onBoard [0…8]`, 409, still 9 cards, no event; screen badge + no button (`crew.ts` `isPlanCopy`, mock state `plan-on-board`, `tests/harness/task171/b-copy-390.png`) | yes — stub; real caw-back + screen = QA |
| AC-8 | accept makes cards for the new items only, `dependsOn` on a skipped item → the open card (`plan-copy.test.ts` "AC-8"); line `มีงานนี้บนบอร์ดแล้ว {n} งาน — จะเพิ่มเฉพาะงานใหม่ {m} งาน` above `จะได้ {m} การ์ด` (`Chat.tsx:88`, `words.ts:417`, `a-partly-1280.png`) | yes |
| AC-9 | round 1 suites green: plan-copy/proposals 21/0, caw-back whole 1013/1/1 (known withReadGuard, run alone); caw-front 370/0, typecheck 0, e2e 281 (Fanta); an identical copy still 409 while its cards are open (plan-copy test 1); a first plan as before (proposals tests) | yes |

## Verification (by QA)
Tanya, 2026-10-31 02:32 — tree-fp.sh: caw-back 5779554 fp `32a65f35c337` · caw-front ce5ca8d fp `f91e9b59a4f2` (same 02:19 / 02:32); stub workers + the real chat screen. Detail TEST-124.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | 4 questions; "ตามนั้น" on #1 → only #1 "ตอบแล้ว · …"; #2–#4 keep defaults and their own "ตามนั้น"; nothing sent yet |
| AC-2 | PASS | button disabled with "เหลืออีก 3 / 1 ข้อ"; the 4th (typed) answer sends ONE message "ข้อ 1…4: …" each with its own text; then enabled |
| AC-3 | PASS | copy before accept → after accepting one, the other shows "แผนนี้ตกลงไปแล้ว", no button, 2 cards; copy after accept → no button, accept 409 plan_already_accepted |
| AC-4 | **FAIL in part** | Chrome profile / `.cache` → done/review refused (PM-style message), nothing deleted by CAW, worker TMPDIR/XDG outside; **a loose scratch file (`qa-tmp-api.js`) stays after done** (DEF-1). O-1: a worker is refused for another worker's folder in the shared project folder |
| AC-5 | NOT_TESTED | live — REQ-124 round 2 |
| AC-6 | PASS | S1–S17 58 OK; caw-back 1008/1/1 known; caw-front 369/0 |

**Live, REQ-124 round 2** (Tanya, 2026-10-31 03:18) (REQ-124 round 2, 2026-10-31 03:18, `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2): AC-5 **PASS** (questions one by one; no worker junk). **DEF-2 MAJOR** against req 3: after the answers, ปลา posted a reworded plan for the same work; it showed an enabled "ตกลง เริ่มงาน" and pressing it made 9 more cards (9 → 18).

## Round 2 (PM, 2026-10-31 03:2x) `[PM-decided]` (DECISIONS 2026-10-31 03:2x)

**Why:** TEST-122 § Round 2 DEF-2 MAJOR (live). After the owner answered the questions and accepted the plan, the chat worker posted a second plan for the same work with reworded titles and regrouped anchors. Round 1 catches only an identical copy, so this one kept a live "ตกลง เริ่มงาน", and pressing it made 9 → 18 cards, the same work twice. A model will always reword, so the check must not depend on its wording (same lesson as REQ-114 r2).

**Requirement 3, made exact (replaces "same items"):**
- **3a.** A later plan whose work is **already on the board** cannot add that work a second time. "Already on the board" is judged from what CAW itself holds — the spec requirements each existing card carries (REQ-118's anchors/coverage) — never from the plan's titles or wording. Exactly how to match is the SA's design; it must give the same answer however the plan is worded or grouped.
- **3b.** If **all** of a later plan's work is already on the board, the screen shows it as `แผนนี้ตกลงไปแล้ว` with no start button (round 1's words), and caw-back refuses it if it is sent anyway (round 1's 409).
- **3c.** If a later plan brings **some** work that is not yet on any card, the owner can still accept it, and only the new work becomes cards. The plan shows `มีงานนี้บนบอร์ดแล้ว {n} งาน — จะเพิ่มเฉพาะงานใหม่ {m} งาน` above its button.
- **3d.** A card that was cancelled/removed does not count as "on the board".

**Acceptance (round 2):**
- [ ] **AC-7** — **Given** an accepted plan **When** the chat worker posts a plan for the same requirements with reworded titles and regrouped items (stub: TEST-122 r2's second plan, word for word) **Then** it shows `แผนนี้ตกลงไปแล้ว`, has no start button, an accept call is refused, and the card count does not change. Check: QA, stub.
- [ ] **AC-8** — **Given** an accepted plan **When** a later plan holds the same work plus one requirement not on any card **Then** accepting it adds exactly one card set for the new requirement, and the line above shows the right {n}/{m}. Check: QA, stub.
- [ ] **AC-9** (regression) — round 1 AC-1…AC-4, AC-6; an identical copy is still caught; a first plan in a new project is accepted as before.
- Live proof is **not** required for this round (stub covers it deterministically); the next live run watches it.

**Out of Scope (round 2):** asking the chat worker not to repost a plan (prompt changes may help but are not the fix); merging or editing plans by hand.

### Round 2 — verification (by QA, Tanya, 2026-10-31 05:08)
Trees (tree-fp.sh, same 04:49 / 05:07): caw-back 5b49f65 `8beff9850492` · caw-front 7f68c42 `aa5f4bea3ba7` (= the PM's line). Stub, real chat screen and caw-back; memory ≥ 4.6 GB at every start.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-7 | PASS | TEST-122 r2's live repost word for word → "แผนนี้ตกลงไปแล้ว", no button, accept 409, cards stay 9 |
| AC-8 | PASS | repost + REQ-010 → "มีงานนี้บนบอร์ดแล้ว 9 งาน — จะเพิ่มเฉพาะงานใหม่ 1 งาน", "จะได้ 1 การ์ด"; accept → exactly 1 new card, depending on REQ-007's open card |
| AC-9 | PASS | a first plan as before; an identical copy still caught; S1–S19 (71 OK + S14 with its limit; 1 harness line explained); caw-back 1013/1/1 known, caw-front 370/0 |

Also: Q2 (C) — a requirement whose card is done takes new work (PASS). **O-2:** an older open repost shows its button again once one of its cards is done (Q2 C / SPEC-126 R1) — for the next live run.
