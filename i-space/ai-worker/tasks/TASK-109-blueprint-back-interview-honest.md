# TASK-109: blueprint-back — kinds list in the prompt, honest rejected rounds, no retry on timeout, round reason stored
- Source: SPEC-105 (REQ-110, Team A)
- Owner: BE (Jason)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: TASK-107 (DONE)
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom`, on top of TASK-107's tree. **No git write.**

🔴 Prefix every `bun` command with `DATABASE_URL=pglite:memory` (and `PORT=` when it serves). Never print `.env`. No live gateway: stub only. (SPEC-104 G5b, SPEC-105 Guardrails)

The contract is SPEC-105 § Design (E1–E4), § API / Interface Design and § Data Model.

## Files (closed list — anything else → `## Questions` first)

- `src/interview/context.ts` (generated kinds block, E1)
- `src/interview/round.ts` (E2 content/reason/note, E3 no ask-again on timeout, E4 reason stored)
- `src/gateway/client.ts` (E3: no client retry when the first failure is `timeout`)
- `src/db/schema.ts` + one new migration in `src/db/migrations/` (+ `meta/`)
- `src/http/routes/rounds.ts` (response fields) · `openapi.json` (via `openapi:emit`)
- `test/interview/**`, `test/gateway/**` — new tests; existing tests changed only where E2/E3 change the asserted behaviour (list each, DoD 4)

## What to do

1. E1: build the kinds block from `MODEL_KINDS` ∩ `PART_KINDS` (body fields and which are required, from the zod shape) and `LINK_KINDS` (from → to, ordered, labelled), then append it to `SYSTEM_PROMPT`. Paste the generated block into Notes.
2. E2: on `changes_rejected` the bot row has `content: ""`, `round_reason` set from the refusal per SPEC-105's code table, and `round_note` set (kind name, ≤ 60 chars). The `Round` response has `reply: null`, `reason`, `note`.
3. E3: client doesn't retry after `timeout`; the round doesn't ask again after a `timeout`. Other reasons behave as today.
4. E4: store `round_reason` on `bot_could_not_answer` rows too. Return both fields in `GET …/messages`.
5. Migration, then `openapi:emit`. Paste the generated SQL and `git diff --stat openapi.json`. Write "DoD 6 landed" in Notes: TASK-110's `gen:api` waits on it.

## Definition of Done (each with its command and real output, pasted)

1. Base: `bun test --timeout 30000` (full env prefix) on TASK-107's DONE tree. Paste the summary line.
2. After: same command → 0 fail. `bunx tsc --noEmit` → 0 errors.
3. New tests, named in Notes:
   - the prompt holds every model kind and every link kind, and no kind outside the registry;
   - a fake model proposing `feature` (twice, so the correction is also refused) → `changes_rejected`, reply `null`, bot row content `""`, reason `unknown_kind`, note `feature`, 0 parts, 0 change sets;
   - a provenance refusal → `needs_user_words`;
   - an unparseable correction → `protocol`;
   - a stub gateway that sleeps past a short `timeoutMs` → exactly **1** gateway call, `bot_could_not_answer`, reason `timeout`;
   - a `network` failure is still retried once (R8 unchanged there);
   - `GET …/messages` returns `roundReason` / `roundNote`, and null on old-style rows.
4. A table of every existing test changed: file:line · old · new · SPEC-105 E-number.
5. `git status --short` shows only closed-list files plus TASK-107's. `env | grep -c BLUEPRINT_GATEWAY_LIVE` → 0. Test ports free.
6. `openapi:emit` landed (step 5).
7. **(added 14:0x by the SA — REQ-103 Q7, the owner's commit-per-topic rule)** A **REQ-110-only patch** of your own changes, so REQ-103 can be committed first:
   - Write it to `i-space/ai-worker/tasks/TASK-109-req110-only.patch`. That folder is never committed, and it stays readable by a later session.
   - It holds every hunk of this TASK and **no** hunk of TASK-107. Generated files (`openapi.json`) are left out; I re-emit them.
   - Prove it **without touching the real tree**: copy the repo to a scratch folder (`cp -a`, no git worktree, no branch) and run `git apply -R --check` and then `git apply -R` with the patch there. Then, with the full env prefix, run `bun test --timeout 30000` and `bunx tsc --noEmit` there, which is TASK-107's state. Paste both summary lines and delete the copy.
   - Never change the real tree for this.

## Implementation Notes

(Jason, 2026-10-29 13:45–14:30. Every `bun` command prefixed `DATABASE_URL=pglite:memory`; full env prefix `GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST=` on test runs; `.env` never printed, never copied into the scratch copies.)

### What was built
- **E1** `src/interview/context.ts`: `MODEL_KINDS` moved here from `round.ts` (so the prompt and the guard share one list without an import cycle; `round.ts` imports it). New `kindsBlock()` is generated from `MODEL_KINDS ∩ PART_KINDS` (body field names; `?` = the field accepts `undefined`, i.e. optional or defaulted) and `LINK_KINDS` (from → to, `[ordered]`, `[labelled]`), and is appended to `SYSTEM_PROMPT`. The generated block (815 characters, 24 lines; `SYSTEM_PROMPT` is now 2331 characters):
```
kind ที่ใช้ได้กับ part.add (ใน { } คือฟิลด์ของ body, ? = ไม่บังคับ):
- work { goal? }
- step { ends? }
- interaction { text, reply? }
- role { duty? }
- screen { fields?, actions?, states? }
- api { method, path, request?, responses? }
- system {}
- data { fields? }
- decision { rule, cases?, neighbouring?, open? }
kind ที่ใช้ได้กับ link.add (from → to):
- has_step: work → step [ordered]
- next: step → step [ordered] [labelled]
- has_interaction: step → interaction [ordered]
- from: interaction → role|screen|api|system
- to: interaction → role|screen|api|system
- carries: interaction → data
- reads: api → data
- writes: api → data
- shows: screen → data
- covers: decision → any
- about: question → any
- conflicts: contradiction → any
ห้ามใช้ kind อื่นนอกจากนี้ — ถ้าไม่เข้ากับ kind ไหน ให้ถามเป็น question
```
`requirement` is absent on purpose (not in `MODEL_KINDS`, SPEC-104 D6); so are `question` and `contradiction` (own channels).
- **E2** `src/interview/round.ts`: `build()` now returns a code with each refusal — `unknown_kind` (+ note = the kind, cut to 60) for a `part.add` whose kind is not in `MODEL_KINDS` and for a `link.add` whose kind is not in `LINK_KINDS`; `needs_user_words` for the three provenance refusals; `invalid_change` for everything else (incl. a `ValidationError` from the store); `protocol` when the correction is not the JSON. On `changes_rejected`, `fail()` shows `null` (bot row `content` `""`, `Round.reply` `null`) and keeps `round_reason` / `round_note` on the bot row — also on the path where the user's own decisions are kept (the bot row written in the change-set transaction). `Round` gains `reason` / `note` (null for applied / no_changes).
- **E3** `src/gateway/client.ts:122`: no second `chatOnce` when the first failure is `timeout`; every other reason keeps R8's one retry.
- **E4** `round_reason` is stored on `bot_could_not_answer` rows too (the gateway's reason: `timeout`, `network`, `http_500`, `protocol`, …). `GET …/messages` returns `roundReason` / `roundNote` on every message (null on old rows and on rows that did not fail). It uses a new `ChatMessage` schema; `MessageSchema` is unchanged, so the seam's `POST …/amendments` document and body are exactly as before.

### Migration (step 5) — `DATABASE_URL=pglite:memory bun run db:generate` → `src/db/migrations/0007_spooky_blur.sql`
```
ALTER TABLE "messages" ADD COLUMN "round_reason" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "round_note" text;
```
= SPEC-105 § Data Model exactly. Applied only on `pglite:memory` (by the tests); the remote DB was not touched.
```
$ DATABASE_URL=pglite:memory bun run openapi:emit        -> wrote …/openapi.json   (13:5x; re-emitted after the last src change: same stat)
$ git diff --stat openapi.json      (against HEAD, i.e. TASK-107 + TASK-109 together)
 openapi.json | 270 ++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 249 insertions(+), 21 deletions(-)
```
Against TASK-107's emit the only differences are: new schema `ChatMessage`; `Round` gains `reason` and `note` (both required, nullable); `GET …/messages` items now `$ref` `ChatMessage`. No seam route document changed.
**DoD 6 landed (13:5x): TASK-110's `gen:api` can run.**

### DoD
**1. Base** — TASK-107's DONE tree = my last TASK-107 run, 13:34:07–13:40:04: `236 pass / 16 skip / 0 fail`, `Ran 252 tests across 35 files. [357.27s]`. Checked before I started (13:4x) that no file under the repo (outside `node_modules`, `.git`) was newer than that run's output except a git-ignored `data/sources/…` file another session's server wrote; so it was still that tree when I started.
**2.** `bun test --timeout 30000` (full env prefix), 14:01:36–14:08:04, after all src changes:
```
 249 pass
 16 skip
 0 fail
 1266 expect() calls
Ran 265 tests across 36 files. [388.09s]      exit=0
```
= 236 + 13 new, same 16 skips. `bunx tsc --noEmit` → exit 0, no output (0 errors).
**3. New tests** — `test/interview/honest.test.ts` (13), by row:
| TASK row | test |
|---|---|
| prompt has every model kind + every link kind, none outside the registry | "E1: the prompt holds every model kind and every link kind, and no kind outside the registry" |
| `feature` twice → rejected, reply null, content `""`, `unknown_kind`, note `feature`, 0 parts, 0 change sets | "E2 / AC-3: a model that proposes `feature` (twice) → changes_rejected, no reply text, unknown_kind + note, nothing stored" (also asserts 2 gateway calls and that the model's "บันทึกให้แล้ว" is nowhere in the row) |
| provenance refusal → `needs_user_words` | "E2: a provenance refusal → needs_user_words" |
| unparseable correction → `protocol` | "E2: a correction that is not the JSON → protocol" |
| stub sleeping past a short `timeoutMs` → exactly 1 call, `bot_could_not_answer`, `timeout` | "E3 / AC-4: a gateway that is too slow → exactly 1 call, bot_could_not_answer, reason timeout" (`timeoutMs: 60`; also asserts the round ends in < 1 s) |
| `network` still retried once | "E3: the client does not retry after a timeout, but still retries a network failure once (R8)" (timeout → 1 call, network → 2 calls) |
| `GET …/messages` returns `roundReason` / `roundNote`, null on old-style rows | "GET …/messages returns roundReason / roundNote, and null on old-style rows" |
Extra, mine: unknown **link** kind (a 100-character kind name is cut to 60) · `invalid_change` · "if the correction call itself fails, the round keeps the code of the first refusal" · "a rejected round that also carries the user's own decisions keeps them and still shows no model text" · "E4: a network failure is stored as the reason of the failed bot row too" · "an applied round has no reason or note".
**4. Existing tests changed** — one:
| file:line (HEAD) | old | new | SPEC-105 |
|---|---|---|---|
| `test/interview/retry.test.ts:95` ("D-023: changes_rejected with an answer in the same turn…") | `[status, reply, typeof changeSetId]` = `["changes_rejected", "เพิ่มให้แล้ว", "string"]` | `["changes_rejected", null, "string"]` | E2 |
| `test/interview/retry.test.ts:99` (same test) | bot row `{ roundStatus: "changes_rejected", content: "เพิ่มให้แล้ว", changeSetId }` | `{ roundStatus: "changes_rejected", content: "", roundReason: "unknown_kind", roundNote: "question", changeSetId }` (the stub proposes a `question` add, which is not a model kind) | E2 |
No gateway test changed: the existing retry tests use network / http failures, which still retry. Everything else passed unchanged.
**5.** End state (14:2x): `git status --short` → 46 lines = TASK-107's 40 + TASK-109's: modified `src/interview/context.ts`, `src/gateway/client.ts`, `test/interview/retry.test.ts` (and the already-modified `round.ts`, `rounds.ts`, `schema.ts`, `_journal.json`, `openapi.json`), new `0007_spooky_blur.sql`, `meta/0007_snapshot.json`, `test/interview/honest.test.ts` — all on the closed list. `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`. Ports: `ss` shows only `127.0.0.1:4200` (pid 738998, the `bun run src/index.ts` server I did not start, still there from TASK-107); :4296/:4298/:4299 are free. My tests bind no fixed port.
**6.** `openapi:emit` landed — see above.
**7. REQ-110-only patch** → `i-space/ai-worker/tasks/TASK-109-req110-only.patch` (1715 lines, 10 files, paths `a/…` `b/…` for `git apply` from the repo root): `0007_spooky_blur.sql` and `meta/0007_snapshot.json` (new), `meta/_journal.json`, `src/db/schema.ts`, `src/gateway/client.ts`, `src/http/routes/rounds.ts`, `src/interview/context.ts`, `src/interview/round.ts`, `test/interview/honest.test.ts` (new), `test/interview/retry.test.ts`. `openapi.json` is left out, as asked.
How it was made, without touching the real tree: both TASKs sit uncommitted in one working tree, so I rebuilt TASK-107's state in a scratch copy (`cp -a` of the repo without `.env`): the three files only TASK-109 touched came from `git show HEAD:…`; `round.ts` = HEAD + TASK-107's three hunks only (checked: `git diff HEAD` on it shows exactly 3 hunks, at 255, 326, 372); `schema.ts`, `rounds.ts`, `_journal.json` = current minus TASK-109's lines; the three new files removed. The patch is the difference between that copy and the current tree.
Proof, in separate scratch copies (13 → 14:25):
```
copy of the current tree:  git apply -R --check <patch>  -> OK        git apply -R <patch> -> applied
diff -rq <rebuilt TASK-107 state> <reverse-applied copy>  (excl. node_modules, .git, openapi.json) -> IDENTICAL
copy of the TASK-107 state: git apply --check <patch> -> OK; git apply -> applied; diff -rq against the current tree (excl. openapi.json) -> IDENTICAL
in the reverse-applied copy (full env prefix):
$ bunx tsc --noEmit                 -> exit 0, no output
$ bun test --timeout 30000          (14:17:41–14:24:53)
 236 pass
 16 skip
 0 fail
 1182 expect() calls
Ran 252 tests across 35 files. [431.62s]
```
= exactly TASK-107's DONE numbers (236 / 16 / 0, 1182 expect() calls, 252 tests, 35 files). All scratch copies deleted; the real tree was never changed for this (`git status --short` still 46 lines). **Honest limit:** the "TASK-107 state" is my reconstruction, not a saved copy; what ties it to the real one is the matching test counts above and the 3-hunk check on `round.ts`.

### Findings for the SA (listed, not fixed)
1. **SPEC-105 root cause 3 is partly off.** It says the round "asks again after a failed first call (`round.ts:417-422`)". Read at HEAD: a failed first call returns immediately (`if (!first.ok) return fail(…)`); the round asks again only after a *received but unparseable* reply (`:420-425`) or for the one correction (`:431`). So E3's "the round does not ask again after a timeout" was already true and needed no round change; the only change is the client's retry (`client.ts:122`), and the test shows `calls == 1`. Before E3 a first-call timeout cost 2 × 90 s (client retry); a round of slow-but-answered calls (round + again + correction) could still total 3 × 90 s. That is by reading; I did not reproduce P1-3's 382 s.
2. **When the *correction* call fails (any transport reason, incl. a timeout) the round is `changes_rejected` with the code of the first refusal** (BE-decided; SPEC-105's table has no transport code). The user then sees the "nothing was saved" sentence, not the timeout sentence, even though the last thing that happened was a timeout. Test: "if the correction call itself fails…". One line to change if you want `bot_could_not_answer`/`timeout` there.
3. **A `link.add` with an unknown link kind is now refused in `build()`** (so it gets `unknown_kind`); before, the zod enum failure surfaced later as a generic validation error. The wording the model sees in the correction message changes from a zod message to `unknown link kind "…"`; the outcome (rejected) is the same.
4. **`Round` response now has two new required fields (`reason`, `note`).** Additive for a reader; TASK-110's front must read them. `GET …/messages` items too.
5. **The prompt grows by 815 characters per round** (`SYSTEM_PROMPT` 2331 total). It is fixed text, not part of the capped blocks (`CAPS`, `HEADINGS_MAX`), and the AC-11 size tests still pass.
6. `data/sources/…` appeared in the repo at about 13:4x (git-ignored `/data/`) — another session's server with the default `SOURCES_DIR`; not from my tests (they use a temp dir).

## Questions

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 14:3x)

**Re-run by me:**
- `bun test --timeout 30000` (full env prefix) on `test/interview/honest.test.ts`, `test/interview/retry.test.ts` and `test/seam` → **48 pass / 0 fail** `[78.11s]`.
- `bunx tsc --noEmit` → exit 0.
- `git apply -R --check tasks/TASK-109-req110-only.patch` in the real repo → OK (read-only check, nothing changed).
- I read `round.ts:414-426` at f60b934, which confirms finding 1.

**Against SPEC-105:**
- E1: the generated block is pasted, and it covers model kinds + link kinds with no `requirement`.
- E2: codes and notes are stored, the reply is null, the content is "".
- E3: the client doesn't retry on timeout, exactly 1 call. E4: reasons are stored.
- The migration equals § Data Model.
- The seam documents are unchanged (`MessageSchema` kept, `ChatMessage` new).
- One existing test changed, listed (retry.test.ts:95,99, E2).
- Full suite 249/16/0, up from 236.

**DoD 7 accepted.** Reverse-applying the patch reproduces TASK-107's exact numbers (236/16/0, 1182 expects). Jason's "honest limit" (the TASK-107 state is a reconstruction) is noted. That is why I re-prove it at commit time with a fresh copy, per REQ-103 Q7's recipe.

**Findings:**
- **1: right, and it is my error.** SPEC-105 root cause 3 is struck and corrected; F-014.
- **2: accepted** as written into SPEC-105 E3: "nothing saved" is honest there. Reversible.
- **3–6: noted.** For 4, TASK-110's front reads `reason`/`note`. For 5, the prompt growth is within the size tests.

The work stays in the tree. No git until REQ-103 is committed first and REQ-110 passes QA, each on the owner's own word.
