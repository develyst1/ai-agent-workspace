# TEST-124: chat questions answered one by one; a copy of an accepted plan cannot start; worker temp folders stay out of the product
- Source REQ: REQ-126 (Team B: SPEC-125, TASK-168 caw-back, TASK-169 caw-front) — from TEST-122 F-1, F-2, F-5
- Status: **Round 2: TEST_PASSED** (2026-10-31 05:08, Tanya — AC-7, AC-8, AC-9 PASS on the stub; DEF-2 fixed; see § Round 2) · Round 1: **TEST_FAILED** (2026-10-31 02:32, Tanya) — AC-4 only in part: temp **folders** are caught, a loose scratch **file** is not (DEF-1, MINOR); AC-1, AC-2, AC-3, AC-6 PASS; AC-5 (live) NOT_TESTED here — in REQ-124 round 2
- Environment: local (this machine) · stub `CLAUDE_BIN` (QA's open-worker stub, with a scripted chat) · no gateway (refusing stub :4396, 0 calls) · no live hop
- Tested: 2026-10-31 by Tanya · harness `tests/harness/test-126/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, start 02:19 and verdict 02:32 — **the same**, and the same as the PM's line):
  - `tree-fp caw-back HEAD 5779554 fp 32a65f35c337 (256 paths: 253 tracked, 3 untracked, 0 deleted)` (REQ-125 committed in HEAD)
  - `tree-fp caw-front HEAD ce5ca8d fp f91e9b59a4f2 (146 paths: 146 tracked, 0 untracked, 0 deleted)`
  - Run from clean HEAD exports + diff + untracked.

## Instruments
- `qa-claude.ts` = TEST-123's stub + a **scripted chat** (`<mode>.chat.json`: per chat turn, propose `<mode>.items.json` — located first — and/or ask questions) + actions `junk:<path>` (make a file/folder in the worker's folder), `clean:<dir>`, `env` (record `cwd`, `TMPDIR`, `XDG_CACHE_HOME`).
- `r126.mjs` = TEST-123's `r125.mjs` (S1–S17 = AC-6) + **S18** (AC-1/2/3, on the real chat screen) and **S19** (AC-4).
- Harness bugs of mine, fixed before the verdict (each first try kept as `r126-s18s19-try*.out`): `locate` matches text, not a key; every question needs ≥ 1 `cases`; I first expected the copy to be refused when **posted** — SPEC-125 D4 refuses it at **accept**, which is what AC-3 asks ("cannot start … from the screen"); S19 read the comment's result instead of the status change's, and its first layout let a refused `done` (+ comment = REQ-119 second turn) clean up inside run 1; a rewrite of S19 cut the REQ-122 helpers (restored).

## Cases

| # | AC | Type | Actual (`r126-s18s19.out`, `r126-s19.out`, `out/`) | Result |
|---|---|---|---|---|
| 1 | **AC-1** | happy | a chat message with **4 questions**; "ตามนั้น" on question 1 → **only** question 1 shows "ตอบแล้ว · Node.js ล้วน ไม่ใช้ framework"; questions 2–4 still show "คำตอบที่เสนอ", their defaults and their own "ตามนั้น" (3 pairs left); **nothing sent yet** (`s18-after-q1.png`) | PASS |
| 2 | **AC-2** | state | after 1 answer: "ตกลง เริ่มงาน" **disabled**, "ยังตอบคำถามไม่ครบ — เหลืออีก 3 ข้อ"; after 3: still disabled, "เหลืออีก 1 ข้อ" | PASS |
| 3 | **AC-2** | happy | question 4 answered with **"ตอบเอง…"** ("ไม่บังคับ ยาวได้ 200 ตัวอักษร (QA ตอบเอง)") → **ONE** message sent: "ข้อ 1: …\nข้อ 2: …\nข้อ 3: …\nข้อ 4: ไม่บังคับ ยาวได้ 200 ตัวอักษร (QA ตอบเอง)" — each with its own text; then "ตกลง เริ่มงาน" enabled (`s18-answers-message.txt`, `s18-all-answered.png`) | PASS |
| 4 | **AC-3** | state | the answer made ปลา post the same plan again **before** acceptance (2 open copies); "ตกลง เริ่มงาน" on one → the other shows **"แผนนี้ตกลงไปแล้ว"** with **no button**; **2 cards**, not 4 (`s18-after-accept.png`) | PASS |
| 5 | **AC-3** | negative | the same plan posted **after** acceptance (201, SPEC-125 D4): the screen shows "แผนนี้ตกลงไปแล้ว", no "ตกลง เริ่มงาน"; accepting it → **409 `plan_already_accepted`**; still 2 cards (`s18-copy-after-accept.png`, `s18-accept-copy.json`) | PASS |
| 6 | **AC-4** | negative | a worker leaves a **Chrome profile** (`qa-tmp-profile/` with "Local State") → its `done` → **409** "ยังส่งไม่ได้ — มีโฟลเดอร์ชั่วคราว qa-tmp-profile ในโฟลเดอร์งาน ให้ย้ายไปไว้ใน $TMPDIR หรือลบออกก่อน" (`s19-run1.json`) | PASS |
| 7 | **AC-4** | negative | an untracked **`.cache/`** → its review → 409 naming `.cache`; CAW deleted nothing (`.cache` was still there in run 2 until its worker removed it) | PASS |
| 8 | AC-4 | happy | the runner gives each worker its own `TMPDIR` / `XDG_CACHE_HOME` **outside** the product folder (`/tmp/caw-runner-…/worker-…/tmp`, `…/cache`) | PASS |
| 9 | AC-4 | state | once the folders are gone: `done` and review go through; the folder holds **no temp folder** (`s19-folder-after.txt`) | PASS |
| 10 | **AC-4** | negative | a loose scratch **file** (`qa-tmp-api.js`, the kind TEST-122's QA worker left) is **not caught**: the card went `done` and the file **stays in the product folder** → **DEF-1** | **FAIL** |
| 11 | AC-4 | observe | แบงค์ removed **its** profile, but its `done` was still refused — for **ฝน's** `.cache` in the same project folder: one worker's leftovers block another's card, and the message tells it to move or delete a folder that is not its own → **O-1** | — |
| 12 | **AC-6** | regression | S1–S17 (REQ-117/119/120/121/122/125): **58 checks OK, 0 BAD** (`r126-regression.out`) | PASS |
| 13 | AC-6 | suites | caw-back **1008 / 1 skip / 1 fail** — the known `withReadGuard` only · caw-front typecheck 0, **369 / 0**, build 0 | PASS |
| 14 | **AC-5** | live | REQ-124 round 2: 2 questions answered one by one on the live chat, one message; the finished folder holds no worker junk (scratch scripts went to the worker's own `TMPDIR`) (REQ-124 round 2, 2026-10-31 03:18, `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2) | PASS |
| 15 | req 3 | live | the same run: ปลา's reply to the answers posted a **reworded** plan for the same work (titles/anchors differ) → live "ตกลง เริ่มงาน", no "แผนนี้ตกลงไปแล้ว"; pressed → 9 more cards for the same work → **DEF-2** | **FAIL** |

## Defects
### DEF-1 — a worker's loose scratch file stays in the product folder; only temp FOLDERS are checked — MINOR
- Repro: a worker writes `qa-tmp-api.js` at its project folder's top level, then moves its card to `done` → accepted; the file stays (`s19-folder-after.txt`: `["qa-tmp-api.js"]`).
- Expected (REQ-126 req 4 "a worker's own temporary files (browser profiles, **scratch scripts**, caches) never stay in the product folder when its card is done"; AC-4 "a browser profile **or temp files**").
- Actual: `src/cards/temp-folders.ts` looks only at top-level **directories** (a Chrome profile, or a fixed list of names); a file is never looked at. The 58 MB profile of TEST-122 F-5 **is** caught now — the gap is the loose scripts.

### DEF-2 — a reworded second plan for the same work can still be started — MAJOR (found live, 2026-10-31 03:16)
- Detail and repro: TEST-122 § Round 2 → Defects. The copy check matches identical titles + anchors only; a live reword slips through (cards 9 → 18).

## Observations
- **O-1** — the temp-folder check reads the whole shared project folder, so a worker can be refused for another worker's folder (case 11); the message ("ให้ย้ายไปไว้ใน $TMPDIR หรือลบออกก่อน") then invites it to touch another worker's files.

## Test data created
| What | Where | End state |
|---|---|---|
| ~20 CAW projects (S1–S19), cards, stub hops; S19's folder (with `qa-tmp-api.js`) | `pglite:file` / folders in `/tmp/qa119-…` | left in /tmp |
| servers 4292 / 4541 / 3541, runners, stub 4396 | this machine | stopped; `ss`/`ps` clear 02:32 |
| scripts, outputs, screens | `tests/harness/test-126/` | left, as evidence |

## Verdict
**`TEST_FAILED`** — AC-4 in part: temp **folders** (browser profile, caches) are refused before review/done and never deleted by CAW, and each worker's temp env is outside the product — but a loose scratch **file** stays in the product after its card is done (DEF-1, MINOR; REQ-126 req 4 names scratch scripts). **AC-1, AC-2 PASS** (each question answered on its own; the button waits and counts; one message with each answer's own text), **AC-3 PASS** (a copy of an accepted plan shows "แผนนี้ตกลงไปแล้ว", no button, accept refused), **AC-6 PASS**. AC-5 NOT_TESTED (REQ-124 round 2). The PM may accept DEF-1. **Tested trees (tree-fp.sh, same 02:19 and 02:32):** caw-back **5779554 fp `32a65f35c337`** · caw-front **ce5ca8d fp `f91e9b59a4f2`**.

## Questions
(none)

---

## Round 2 — 2026-10-31 04:44–05:08 (REQ-126 § Round 2: AC-7, AC-8, AC-9; SPEC-126, TASK-170/171) — stub, no live run
- Build under test (`tree-fp.sh`, start 04:49 and verdict 05:07 — **the same**, and the same as the PM's line): `caw-back HEAD 5b49f65 fp 8beff9850492` · `caw-front HEAD 7f68c42 fp aa5f4bea3ba7` (both: HEAD + an uncommitted diff, 0 untracked; run from `git archive HEAD` + `git apply` of the diff, `t126r2`) (`test-126/r2-tree-fp-start.txt`, `r2-tree-fp-end.txt`)
- Memory: the PM's line 3 GB held. 04:36 read 2.4–2.5 GB → not started (told the PM); 04:44 back to 6.7 GB → export + build; 04:53 down to 2.4–2.7 GB → waited (Monitor) until 3 reads ≥ 3.5 GB (04:56, 4.7 GB); every run after that started at ≥ 4.6 GB, no reading under 3 GB during a run.
- Instrument: `r126.mjs` + **S20** (the real chat screen and caw-back; the stub chat worker posts TEST-122 round 2's two live plans **word for word** from `../spec126-r2-plans.json`, on a Blueprint project with the same 10 requirements). Gateway: refusing stub :4396, 0 calls.
- My harness slips, fixed before the verdict (first tries kept): S20 turn 3 reused an item with `dependsOn [3]` in a one-item plan → 400 validation (`r126-s20-try1.out`); a full run S1–S20 put S20 first, and the stub's chat-turn count then ran past S18's script (`r126-r2-regression-try1.out`); I ran S14 without its `QA_RUNNER_ENV` limit (it says so in its header) → rerun with it (`r126-r2-s14.out`).

| # | AC | Type | Actual (`r126-s20.out`, `r126-r2-regression.out`, `r126-r2-s14.out`, `out/s20-*`) | Result |
|---|---|---|---|---|
| 1 | **AC-7** | negative | after the first live plan was accepted (9 cards), the **reworded, regrouped live repost** (word for word) → `onBoard [0…8]`; the screen shows **"แผนนี้ตกลงไปแล้ว"** and **no** "ตกลง เริ่มงาน" (`s20-ac7-repost.png`) | PASS |
| 2 | **AC-7** | negative | accepting it anyway → **409 `plan_already_accepted` "แผนนี้ตกลงไปแล้ว"**; cards stay **9**; the plan stays open (`s20-ac7.json`) | PASS |
| 3 | **AC-8** | happy | the repost **+ one item for REQ-010** (no card holds it) → the line **"มีงานนี้บนบอร์ดแล้ว 9 งาน — จะเพิ่มเฉพาะงานใหม่ 1 งาน"** above the button, and "จะได้ 1 การ์ด" (`s20-ac8-partly.png`) | PASS |
| 4 | **AC-8** | happy | "ตกลง เริ่มงาน" → cards 9 → **10**, the one new card is REQ-010's; its dependency on a skipped item (REQ-007) points at REQ-007's **open card** (`s20-ac8.json`) | PASS |
| 5 | Q2 (C) | neighbour | REQ-006's card set **done** → a plan for REQ-006 → `onBoard []`, its button shows, accept 200, **1 new card** — a requirement whose card is done takes new work through the chat | PASS |
| 6 | **AC-9** | regression | a first plan in a new project accepted as before (S20: 201, 9 cards) · an **identical** copy still caught (S18: before accept → badge, no button, 2 cards not 4; after accept → 409) · round 1 AC-1/2 (S18) all OK | PASS |
| 7 | AC-9 | regression | S1–S19: **71 OK**; S14 (REQ-122 task limit) OK when run with its limit; **1 BAD = my harness** (case 9 below) | PASS |
| 8 | AC-9 | suites | caw-back **1013 / 1 skip / 1 fail** — the known `withReadGuard` only · caw-front typecheck 0, **370 / 0** (`r2-caw-back-test.txt`, `r2-caw-front.txt`) | PASS |
| 9 | AC-9 (AC-4) | harness | S19's "Chrome profile … CAW deletes nothing" line is BAD: the refusal is right (409 naming `qa-tmp-profile`), but the check also asks that the folder still exists, and the stub worker's **own** second turn in run 1 (REQ-119) runs `clean:qa-tmp-profile` before the check reads it (hop records `/tmp/qa119-TzZUx7`). The worker removed it, not CAW. The same BAD line is in round 1's `r126-s19.out`; I wrote round 1's case 6 PASS without naming it → FAILURES | (harness) |

### Observations
- **O-2** — an **older** open repost becomes partly new when one of its cards is done: in S20, after REQ-006's card was done, the turn-1 repost (still open) showed its "ตกลง เริ่มงาน" again (8 of 9 on the board) beside the new REQ-006 plan — accepting both would have given REQ-006 two cards. This follows Q2 (C) and SPEC-126 R1 (accepted as rare); noted for the next live run.
- Not tested: REQ § 3d (a card whose requirement left the spec does not count) — not an AC here; caw-back's `plan-copy.test.ts` covers it, and this stub's Blueprint is not wired to tell CAW of a removal.

### Test data created
| What | Where | End state |
|---|---|---|
| ~21 CAW projects (S1–S20), cards, stub hops | `pglite:file` in `/tmp/qa119-…` | left in /tmp |
| servers 4292 / 4541 / 3541, runner, stub 4396, a read-only caw-back on 4549 (S20's db) | this machine | stopped by pid; clear 05:07 |
| exports + caw-front build | QA scratch `t126r2` | left |

### Verdict (round 2)
**`TEST_PASSED`** — **AC-7** (TEST-122 r2's reworded live repost, word for word: "แผนนี้ตกลงไปแล้ว", no button, accept 409, still 9 cards), **AC-8** (one new requirement → the right "9 / 1" line, exactly one new card, its dependency on the open card), **AC-9** (a first plan as before; an identical copy still caught; round 1's S1–S19 and both suites). DEF-2 is fixed. O-2 for the PM. **Tested trees (tree-fp.sh, same 04:49 and 05:07):** caw-back **5b49f65 fp `8beff9850492`** · caw-front **7f68c42 fp `aa5f4bea3ba7`**.
