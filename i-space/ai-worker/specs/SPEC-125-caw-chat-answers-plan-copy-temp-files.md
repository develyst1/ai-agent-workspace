# SPEC-125: Chat questions answered one by one and sent together; a plan cannot be accepted twice; workers keep temp files out of the product (REQ-126)
- Source: REQ-126 (Q1 (a)–(d) accepted with words by the PM 2026-10-31 01:4x)
- Status: DONE (2026-10-31 02:1x, Silver — TASK-168/169 DONE; REQ-126 SPEC_DONE) · was ACTIVE (2026-10-31 01:4x, Silver)
- Read: caw-front a009d2c+ce5ca8d: `src/components/chat/Chat.tsx:41-90,113-200`, `src/lib/crew.ts:29-44`, `src/components/Board.tsx:150-200`, `src/app/p/[id]/chat/page.tsx:39`, `src/words.ts:396-410`; caw-back 5779554: `src/proposals/service.ts:92-146`, `src/cards/service.ts` (`setStatus`), `src/runner/{hop,pool,prompt}.ts`, `src/runner/read-guard.ts:1-6`, `src/http/errors.ts:18`.

## Overview
| Part | Today (evidence) | Design |
|---|---|---|
| A — answers (F-1) | A worker message is open only until **any** operator message follows (`chat/page.tsx:39` `entryQuestions` → `openId`). "ตามนั้น" posts `ตามนั้น — <default>` at once (`Chat.tsx` `accept`) and closes all questions; `answeredWith` finds only that one (`crew.ts:33-35`). Every operator message starts a chat hop. | D1–D3 (front) |
| B — a plan accepted twice (F-2) | An open plan is superseded only by a newer one **on the same message** (`proposals/service.ts:105`); TEST-122's second copy hung on a later message and could be accepted too. | D4 (back) + D5 (front) |
| C — worker junk (F-5) | Workers inherit the runner's `TMPDIR` (`hop.ts:169` `CHILD_ENV`); nothing keeps a browser profile out of the product folder. | D6 + D7 (back) |

## D1 — answers kept on the screen (caw-front, TASK-169)
- In `Chat.tsx`, the open message's questions keep a **local** map `answers: Map<index, string>` (component state; lost on reload, accepted Q1 a).
  - "ตามนั้น" sets `answers[i] = q.proposedDefault`. **Nothing is posted.**
  - `ตอบเอง…` opens a small box **under that question** (placeholder `พิมพ์คำตอบของข้อนี้`) with a button `ใช้คำตอบนี้`, which sets `answers[i]` to the typed text (trimmed, non-empty). The main chat box is not used for this.
  - An answered question shows `ตอบแล้ว · <answer>` (`oneAnswer.answered`) with a small link-style button `แก้`, which clears `answers[i]` and shows the pair again. It is possible until the message is sent.
- When the **last** question gets its answer, the screen posts **one** message: the lines `ข้อ <n>: <answer>` (n = 1-based, in question order), joined by `\n`, through the existing `postMessage` action. That is one chat hop.
- Words (`src/words.ts` `oneAnswer`, PM 01:4x): `line: (n, answer) => \`ข้อ ${n}: ${answer}\`` · `ownPlaceholder: "พิมพ์คำตอบของข้อนี้"` · `useOwn: "ใช้คำตอบนี้"` · `edit: "แก้"`. **Keep `posted` (`ตามนั้น — …`)** so old chats still read.
- **Board** (`Board.tsx:155,199`): "ตามนั้นทุกข้อ" posts the same one-message form, `ข้อ n: <default>` per question (it answers all at once, so it is sent at once). The Board's single-question AskSheet path posts `ข้อ 1: <answer>`.

## D2 — reading answers back (caw-front, TASK-169)
`crew.ts` `answeredWith(chat, asked, q)` becomes **per question index**: `answeredWith(chat, asked, i)`. In the first operator message after `asked`:
1. the line `ข้อ <i+1>: <text>` → `<text>`;
2. else the old form: a line equal to `ตามนั้น — <q.proposedDefault>` → the default;
3. else, when the message has none of either form and the asked message had exactly one question, the whole text (a typed answer from before this change);
4. else `null` → `ตอบแล้ว` with no answer.
Result table (spec-rules §3): `ข้อ 2: x` for a 4-question message → q2 `x`, the others by their own lines · the old `ตามนั้น — d1` only → q1 `d1`, q2–q4 `null` · a typed single answer to 1 question → that text · a typed text to 4 questions → all `null` (the old chats show `ตอบแล้ว`).

## D3 — "ตกลง เริ่มงาน" waits for every answer (caw-front, TASK-169)
In `ProposalCard`, a new prop `unanswered: number` = the number of questions on the open message (`openId`) without an answer in D1's map. With `unanswered > 0`, the button is disabled, and `data-agree-why` shows `ยังตอบคำถามไม่ครบ — เหลืออีก {n} ข้อ` (words `agreeStart.left(n)`). This replaces today's `answerFirst(waitFor)` while questions are open. After the one message is sent, the message is no longer open: today's `waitFor` rule applies (the worker is answering).

## D4 — a plan cannot be accepted twice (caw-back, TASK-168)
`proposals/service.ts` `accept`: inside the decision, before writing, if any **accepted** proposal of the project has the **same items** as this one → **409 `plan_already_accepted`**, message `แผนนี้ตกลงไปแล้ว`, nothing written. "Same items" = same length, and for every index equal `title` (trimmed), `anchor.key` and `workerId`. Both the check and the code go in `errors.ts`'s 409 list.

## D5 — the screen shows the copy as accepted (caw-front, TASK-169)
`ProposalCard`: an **open** proposal whose items equal an accepted proposal's (D4's rule, in `crew.ts` `samePlan(a, b)`) shows the badge `แผนนี้ตกลงไปแล้ว` (words `agreeStart.alreadyAccepted`) in place of the agree block, so there is no button. `newestOpen` skips such a proposal.

## D6 — a worker's own temp folder (caw-back, TASK-168)
- The runner sets, for every worker process (open card worker and one-shot chat hop), `TMPDIR=<worker or hop folder>/tmp` and `XDG_CACHE_HOME=<…>/cache`, created 0700 before the spawn, in place of the inherited `TMPDIR`. They are under the folder that is already readable/writable to the worker (`readableDirs(roots, dir)`). **TASK-168 proves by a run that a worker's Bash may write there** (`bash-policy.ts`); if it may not, it stops and asks.
- ~~Prompt rule 8 (probed): `Temporary files, caches and browser profiles go in $TMPDIR, never in the project folder.`~~ **Changed 2026-10-31 01:5x (TASK-168 Q1, B):** `bash-policy.ts` refuses any `$` in a Bash command (`shell_feature`), so a worker typing `$TMPDIR` would be refused (Bob's proof run, TASK-168 § Implementation Notes). The policy stays as it is. Rule 8 names the real folder: `8. Temporary files, caches and browser profiles go in <dir>/tmp (never in the project folder) — write that path out, not $TMPDIR.` `buildPrompt` takes `tmpDir`. The env vars stay for programs. Consumers are unchanged: `prompt.test.ts:45` → TASK-168.

## D7 — refusal while a temp folder sits in the work folder (caw-back, TASK-168)
- New `src/cards/temp-folders.ts` `tempFolderIn(roots: string[], readOnly: string[]): string | null`: for each **writable** root, the top-level **directories** only (no recursion). One is a temp folder when either:
  - **(i)** it is a Chromium/Chrome profile: it holds a file `Local State`, or `Default/Preferences` (the 58 MB folder in TEST-122 F-5 was one); or
  - **(ii)** its name is in the fixed list `.cache`, `.tmp`, `tmp`, `.playwright`, `playwright-profile`, `chrome-profile`, `user-data-dir` **and** it is not tracked by git (`git -C <root> ls-files -- <name>` prints nothing; a root that is not a git work tree counts as untracked).
  It returns the first such name (sorted), or `null`.
- `setStatus`: a `worker:` actor moving a card to `review` **or** `done` → `tempFolderIn(project roots)`; a name → **409 `temp_folder_in_work`**, message `ยังส่งไม่ได้ — มีโฟลเดอร์ชั่วคราว {name} ในโฟลเดอร์งาน ให้ย้ายไปไว้ใน $TMPDIR หรือลบออกก่อน` (PM 01:4x), `details: { folder }`. **CAW never deletes anything.** The operator is never refused. The check runs after REQ-125's note check.
- **Not "new since the card's first hop"** (my Q1 d wording): CAW keeps no listing per card, and the two markers (a real profile's files, or an untracked folder with one of these names) cannot be part of a product. So the check is "present and not the product's". **[SA-decided; the PM told in the pointer.]**
- `src/cards/temp-folders.ts` reads the filesystem and runs `git`: the first API code to do so outside the runner. The roots are the project's own folders (checked inside `CAW_WORKSPACE_ROOT` at hop time). The call is read-only.

## API
- `POST …/proposals/{id}/accept` may answer **409 `plan_already_accepted`**. `PATCH …/cards/{id}/status` may answer **409 `temp_folder_in_work`**, `details.folder`. Bodies unchanged.
- `openapi.json` changes (the 409 list text) ⇒ caw-front `gen:api` + `typecheck` (in TASK-169).
Consumers (probe): probe-change.sh caw-back spec126.patch → 1 errors (errors.ts codes + prompt rule 8; SA 01:4x on 5779554, fp a8e76ef8bc69; paired caw-front: gen:api 0, typecheck 0, tests 0)
caw-back → src/runner/prompt.test.ts:45 (fail) buildPrompt (SPEC-C-003 § 2) > SPEC-119 D2.3: rule 7 is the last rule, exactly → TASK-168

## Risks
- **R1:** a reload before the last answer loses the given ones (accepted Q1 a).
- **R2:** `git` must be on the API's PATH for (ii). It is a prerequisite already (the repos are git). If it is missing, (ii) counts the folder as untracked, which is the stricter choice.
- **R3:** a live model may ignore rule 8. Then the D7 refusal tells it what to move.

## Tasks
- TASK-168: caw-back — D4, D6, D7, rule 8 (+ `prompt.test.ts:45`) — owner: BE Bob (depends on: REQ-125 committed 5779554 ✓)
- TASK-169: caw-front — D1, D2, D3, D5, words, `gen:api` — owner: FE Fanta (depends on: TASK-168's `openapi.json`, for `gen:api` only; D1–D3 may start now)
  Consumers (probe): probe-change.sh caw-back spec126.patch → 1 errors — the same run as § API (the hit → TASK-168); paired caw-front → 0 errors

AC map: AC-1/2 → D1–D3 (TASK-169) · AC-3 → D4 + D5 · AC-4 → D6 + D7 · AC-5 → QA live · AC-6 → both TASKs' suites.

## Questions
