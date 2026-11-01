# TASK-006: AI layers 1 + 2 through the owner's gateway, AI settings API, fail open, corpus runner
- Source: SPEC-001 §1 S10, §3.3 (`/admin/settings/ai`, `/admin/ai-models`), §5 (`ai_calls`, `app_settings`, `decisions`), §6 "Filter" steps 2–5 · REQ-004 req 2, 5–7, 9 · `llm-gateway` skill
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-005

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list):
  - `src/filter/ai.ts` (replace TASK-005's stub body; **keep its signature**), `src/filter/gateway.ts`, `src/filter/prompts/v1.ts`
  - `src/modules/admin/ai-settings.ts`, `src/modules/admin/index.ts` (mount only)
  - `test/ai-layers.test.ts`, `test/ai-settings.test.ts`
  - `migrations/202611010002_core_ai_defaults.sql` (rework item 1, added by the SA 2026-11-01)
  - Outside the product repo: `../ai-worker/tests/harness/fake-gateway/**` (step 6), `../ai-worker/tests/harness/corpus/**`
    (the **runner** + `sample.json`). **QA's corpus `../ai-worker/tests/harness/corpus-req-004/corpus.md` is Tanya's —
    read it, never edit it.**

## Read first
`.claude/skills/llm-gateway/SKILL.md` (workspace root) §2–§5: request/response shapes, 500 body, `usage` may be missing,
**no key today** (send no auth header unless `LLM_GATEWAY_KEY` is set; then `Authorization: Bearer <key>` — if the
gateway ever answers 401/403, stop and ask in `## Questions`, never guess a header).

## What to do
1. `gateway.ts`: `chat({ provider?, model?, messages, temperature: 0, max_tokens: 300 })` → `POST ${LLM_GATEWAY_URL}/chat`,
   timeout 20 s; returns `{ provider, model, content, latencyMs }` from `data`; HTTP 500, `success:false`, timeout or empty
   `content` → throws. `listModels()` → `GET /models`.
2. `prompts/v1.ts` (`promptVersion = "v1"`): Thai system prompts that demand **JSON only**.
   Layer 1 input: channel, sender name, group name, subject, `recipient_kind`, text (cut to 4000 chars), the user's display
   name **and** (for LINE) their names list if present → output exactly
   `{"addressed":"yes|no|unclear","meaning":"request|question|info|ad|spam|chatter|other","summary":"<Thai ≤ 60 chars>"}`.
   Layer 2 input: the raw text + the layer-1 JSON + the user's `sentences` + `recipient_kind` → exactly
   `{"score":<int 0–100>,"reason":"<Thai ≤ 200 chars>"}`. If `sentences` is empty, layer 2 is told: notify anything addressed
   to the user that is not ad/spam/chatter.
3. `ai.judge`: layer 1 then **always** layer 2 (even `meaning: spam`) with the models in `app_settings.ai` (read each time,
   so a settings change applies to the next message — REQ-004 AC-9). Parse JSON strictly (strip a ```json fence if
   present); invalid → one retry of that layer, then throw. **`score` must be a JSON integer 0–100**: `70.5`, `"70%"`,
   `"70"`, `120`, `-5` or missing = a broken answer (retry, then throw → fail open). **Never clamp or round** (TEST-003 case 13).
   Log every call in
   `ai_calls` (layer, provider, model actually answered, ok, latency, error). Return the shape TASK-005 defined.
4. Settings API exactly per §3.3: `GET/PUT /admin/settings/ai` (validate `provider`/`model` against `listModels()`; `null`
   allowed = gateway fallback), `GET /admin/ai-models` (502 `GATEWAY_UNAVAILABLE` on failure).
5. Corpus runner (harness, not the repo). Its input is **QA's `corpus-req-004/corpus.md` directly**: parse the test user
   block (name, name list, sentences) and the `## Messages` table (id, channel · where/from, via, text, label N/H) — map
   `via` to `recipient_kind` (`tag`→`mention`, `reply to him`→`reply_to_me`, `name`→`name_match`, `@All`→`mention_all`,
   mail To/Cc→`to`/`cc`; an unknown `via` stops the run with its row id). It also accepts a JSON file of `{ id, channel, senderName, groupName?, subject?,
   recipientKind, text, userSentences, expected: "notify"|"hold" }`, runs `ai.judge` N times (default 3) per message against
   the gateway in `LLM_GATEWAY_URL`, prints a table (id, expected, scores per run, outcome at bars 50…90 in steps of 5) and
   the totals REQ-004 AC-6 needs: wrong holds on must-notify, wrong passes, flips — per bar. **It never writes to the dev DB.**
   Made-up text only (gateway skill §5 "Personal data").
6. **Fake gateway for QA's stubbed runs** (harness, not the repo): `../ai-worker/tests/harness/fake-gateway/server.ts`,
   a `Bun.serve` that answers `POST /chat` and `GET /models` in the gateway's shapes (skill §4). It reads a JSON script file
   (path from argv) saying per layer what to answer: a fixed layer-1 JSON, a fixed `score`, a raw string (to send broken
   answers such as `70.5` or `"70%"`), HTTP 500, or "never answer" (for the 20 s timeout). It tells layer 1 from layer 2 by
   the `promptVersion` marker you put in each system prompt. QA runs the real back end with `LLM_GATEWAY_URL` pointed at it
   (TEST-003 cases 7–17, 20). **No stub switch inside the product code.**

## Definition of Done (paste real output)
- [ ] `bun test test/ai-layers.test.ts test/ai-settings.test.ts` green with the gateway **mocked** (shapes from the skill §4):
      happy path both layers · layer-1 says spam → layer 2 still called · invalid JSON → retry → throw · 500 → throw ·
      settings change → the next call uses the new model · PUT with an unknown model → 400.
- [ ] Live probe, small `max_tokens`, the 3-message `sample.json` (made up): `bun run ../ai-worker/tests/harness/corpus/run-corpus.ts sample.json`
      against `http://localhost:3009` **only if a local gateway is running** → paste the table. Do **not** call
      `https://ai.develyst.online` yourself (gateway skill §5: a live call on the real gateway is an SA/QA probe, real
      money). No local gateway → run it against the fake gateway, and write `UNVERIFIED — real-gateway probe left to the SA`.
- [ ] Live against the fake gateway: score scripted 69 / 70 / 71 with bar 70 → held / notified / notified; scripted `70.5` →
      `ai_unavailable` (paste the three + one `decisions` rows and the fake's script files).
- [ ] Live: with `LLM_GATEWAY_URL` pointed at a closed port, ingest a made-up message → decision `ai_unavailable`, outcome
      `notified`, reason `AI ไม่ได้ตรวจ` (REQ-004 AC-5; paste the `decisions` row).
- [ ] `git status --porcelain` in the product repo — only closed-list files.

## Implementation Notes
Test-first: wrote `test/ai-layers.test.ts` (27 tests) and `test/ai-settings.test.ts` (9), ran them RED (neither file could load: no `gateway.ts`), then implemented. Working tree only, no git. 2026-11-01. The gateway is mocked **over real HTTP** (a `Bun.serve` on port 0 speaking the skill §4 shapes), not by stubbing `fetch`.

**Files:** `src/filter/gateway.ts`, `src/filter/prompts/v1.ts`, `src/filter/ai.ts` (stub replaced; `Judge` / `Judgement` signature unchanged), `src/modules/admin/ai-settings.ts`, `src/modules/admin/index.ts` (mount only), the two tests. Harness outside the repo: `tests/harness/fake-gateway/{server.ts,README.md,scripts/*.json}`, `tests/harness/corpus/{run-corpus.ts,sample.json}`. `app.ts` needed no change (it already imports `judge`). Tanya's `corpus-req-004/corpus.md` was only read.

**Decided alone (declared):**
- `ai.ts` = `createJudge({ gateway, settings, userContext, logCall })` plus `dbJudgeDeps(db)` for production (settings from `app_settings`, user name + LINE names, `ai_calls` insert). The exported `judge` is built **on first use** with dynamic imports of `config`/`db`, so the corpus runner imports `ai.ts` without any config or database. The runner builds its own judge with fixed settings and a no-op call log: **it cannot write to the dev DB.**
- **One retry for every kind of failure** (HTTP 500, timeout, unreachable, empty content, non-JSON, wrong shape, bad score), per layer, as SPEC §6 step 5 says. Worst case per message is therefore 2 × 20 s per layer (80 s) before it fails open.
- `ai_calls`: one row per try. `ok=false` also for an answer that arrived but is unusable. Provider/model = what the gateway says answered; for a try that never got an answer, the configured ones (null if the gateway chooses). `latency_ms` is the gateway's, or measured for a failed try. Error text never contains the message or the model's output (tested with a marker string).
- Strictness: layer 1 `addressed`/`meaning` must be in the allowed sets and `summary` non-empty; layer 2 `score` a JSON integer 0–100 and `reason` non-empty. `summary` over 60 and `reason` over 200 characters are **cut** (not a failure). A ```json fence around the whole answer is accepted; prose around the JSON is not. `70.0` is accepted as 70 (JSON cannot tell it from 70); `"70"`, `"70%"`, `70.5`, 120, −5, null, missing, `true`, `[70]` all fail (tested).
- Settings PUT: `provider` null ⇒ `model` must be null; a provider must be a key of the gateway's `/models`; `model` may be null (the gateway picks) or must be listed under that provider. Errors name the field (`layer1.provider`, `layer2.model`, …). If the gateway cannot answer `/models`, PUT is 502 `GATEWAY_UNAVAILABLE` and nothing is saved. The gateway client is created inside `registerAdminAiSettings` from `config.llmGatewayUrl` / `llmGatewayKey`; the tests point `createApp` at their mock via a config override.
- Prompts (`v1`): Thai; each system prompt starts with `[corner-chat prompt v1 layer 1|2]` (what the fake gateway keys on); the message text sits only in the *user* message, between `<<<ข้อความ` and `ข้อความ>>>`, and the system prompt says it is data to read, never instructions (prompt-injection hygiene; tested that the text is not in the system prompt). Text is cut to 4000 characters; the recipient kind is explained in Thai; an empty `sentences` gets the "notify what is truly addressed to the user and is not ad/spam/chatter" instruction. 401/403 from the gateway raise an error that says a key is needed and to ask the owner; no header is guessed.
- **Cross-team read:** the names list for layer 1 comes from Team B's table `line_names` (`select name … order by position`). SPEC-001 §4 says Team A reads only `line_links` and `line_pushes`; the TASK asks for the names list, so I read it — SA to confirm (see Questions).
- Bun quirk again: `jsonb` comes back as a string, so `readAiSettings` parses it.
- `usage` from the gateway is never read (it may be missing).
- Runner (`run-corpus.ts`): reads Tanya's markdown directly (name, names list, sentences, all 30 rows) or the JSON format from the TASK; `via` → `recipient_kind` as the TASK says, plus: a mail row whose column 2 says `(list)` → `list`, `Cc` → `cc`, otherwise `to`; LINE rows have no sender in the corpus, so the sender name is "สมาชิกในกลุ่ม"; an unknown `via` stops the run naming the row id. A judge error counts as *notified* (fail open, like the product) and is shown as `ERR`. It refuses a gateway URL containing `ai.develyst.online` unless `--allow-production` is given (QA/SA probe, real money). Env overrides `CORPUS_LAYER1` / `CORPUS_LAYER2` (`provider/model`, `-` = gateway's choice).

**Evidence (real output):**
- RED, then GREEN: `bun run test --timeout 20000 test/ai-layers.test.ts test/ai-settings.test.ts` → `36 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `216 pass · 0 fail · Ran 216 tests across 13 files [11.94s]`. `tsc --noEmit` → exit 0.
- DoD cases in tests: happy path both layers (order, models, temperature 0, max_tokens 300, `promptVersion` v1) · layer 1 = spam → layer 2 still called · invalid JSON → retry → throw (and retry → success) · 500 → throw · timeout (150 ms in the test) → throw · settings change → next call uses the new model (`app_settings` + `ai_calls`) · PUT unknown provider / model / model-without-provider → 400 with the field named, nothing saved · gateway down → 502 · score 69/70/71/70.5 through the **real pipeline** → `ai/held`, `ai/notified`, `ai/notified`, `ai_unavailable/notified`.
- **Live, back end + fake gateway** (own port 8081, fake on 3997 with `scripts/bar-boundary.json`, throwaway database `corner_chat_t6_live`, dropped afterwards; user bar 70):
  ```
   scripted     | decided_by     | outcome  | score | bar | layer1_model      | layer2_model   | prompt_version | error
   …คะแนน69     | ai             | held     |    69 |  70 | deepseek-v4-flash | gemini-2.5-pro | v1             | -
   …คะแนน70     | ai             | notified |    70 |  70 | deepseek-v4-flash | gemini-2.5-pro | v1             | -
   …คะแนน71     | ai             | notified |    71 |  70 | deepseek-v4-flash | gemini-2.5-pro | v1             | -
   คะแนนทศนิยม   | ai_unavailable | notified |       |  70 |                   |                |                | layer 2 failed after 2 tries: unusable answer: score must be a whole n…
  ```
  `ai_calls` for the four messages: 9 rows = 4 × layer 1 ok, 3 × layer 2 ok, 2 × layer 2 `ok=f` (`unusable answer: score must be a whole number from…`) for the 70.5 message. The script file is `tests/harness/fake-gateway/scripts/bar-boundary.json` (rules by the words `คะแนน69|70|71|ทศนิยม`).
- Live settings API (same run): `GET /admin/settings/ai` → defaults; `GET /admin/ai-models` → the fake's map; `PUT` with `gemini-9000` → `400 {"error":{"code":"VALIDATION",…,"fields":{"layer2.model":"not a model the gateway lists under gemini"}}}`; `PUT` layer 2 → `gemini-2.5-flash` → 200. **AC-9:** the next message's decision row: `deepseek-v4-flash | gemini-2.5-flash | 71 | notified`.
- **AC-5, closed port:** back end with `LLM_GATEWAY_URL=http://127.0.0.1:1`, one made-up message → `decided_by ai_unavailable · outcome notified · reason AI ไม่ได้ตรวจ · error layer 1 failed after 2 tries: gateway unreachable: Unable to connect…`; `ai_calls`: two layer-1 rows, `ok=f`, provider/model = the configured ones.
- **Corpus runner against the fake gateway** (`run-corpus.ts sample.json`, fake scripted 85 / 10 / 75): per-message table with `. H F P` at bars 50…90, totals per bar, and `highest bar 0–100 meeting the line: 75` (bars 80+ show 1 wrong hold). `corpus.md` itself: all 30 rows parsed (`corpus: 30 messages × 1 runs`). Without `--allow-production`, `LLM_GATEWAY_URL=https://ai.develyst.online` → `Refusing to call the production gateway … it costs real money.`
- `git status --porcelain` → my files: `src/filter/{ai,gateway}.ts src/filter/prompts/v1.ts src/modules/admin/{ai-settings,index}.ts test/ai-{layers,settings}.test.ts` (all closed list; the rest is earlier TASKs' and Team B's).

**UNVERIFIED — real-gateway probe left to the SA:** no local gateway answers on `http://localhost:3009` (`curl` → nothing), and I did not call `ai.develyst.online`. So the prompts have **never run against a real model**: the JSON-only discipline, the Thai summaries and the scores are untested, and `v1` is a first draft that the QA corpus run (AC-6, 3 runs) will judge. Also unverified: the default 20 s timeout itself (tests use 120–150 ms), `usage` absent (never read), and the `Authorization: Bearer` path against a gateway that really wants a key (tested only against my mock).

### Rework (SA verdict 2026-11-01) — done 2026-11-01, again test-first
**1. Default models.** `migrations/202611010002_core_ai_defaults.sql` = the SPEC-001 §5 block, extracted from the SPEC by script (`diff` against the block → `IDENTICAL`, 5 lines). `DEFAULT_AI_SETTINGS` in `ai.ts` is now `deepseek/deepseek-flash` + `deepseek/deepseek-v4-pro`; every test that pinned the old pair now pins the new one, and the settings test's mock `/models` lists them.
- Tests (4 new): an unchanged old seed becomes the new pair and `updated_at` moves · three different owner choices (one differing by a single model, one all-`null`) are left untouched · running it twice changes nothing · it is recorded in `schema_migrations` of the test run.
- `bun run migrate` on the **dev DB** → `Applied: 202611010002_core_ai_defaults.sql`; `select jsonb_typeof(value), value … where key='ai'` → `object | {"layer1": {"model": "deepseek-flash", "provider": "deepseek"}, "layer2": {"model": "deepseek-v4-pro", "provider": "deepseek"}}`, `updated_at` just now; a second `migrate` → `Nothing to apply.` A **fresh** database (`migrate` from empty, throwaway) lists the three files and stores the same pair.

**2. No retry on timeout or unreachable.** `GatewayError` has `retry` (false for a timeout and a connection failure, true for everything else: 500, empty content, bad body); `ai.ts` stops a layer at once on `retry === false`; the thrown message now says `layer 1 failed after 1 try` (was always "2 tries"). 500, empty and unusable answers keep their single retry (tested). New/changed tests: the judge against a never-answering gateway makes **1** request, logs **1** row and returns in under 400 ms with a 120 ms timeout (was 2) · closed port: 1 row, layer 2 never reached · layer 1 ok + layer 2 timing out: `[[1,true],[2,false]]` · pipeline + DB, unreachable gateway: `ai_unavailable`, `notified`, **exactly one** `ai_calls` row · the 500 case still gives two.
- **Live** (own port 8081, throwaway DB `corner_chat_t6r_live`, dropped after): (A) `LLM_GATEWAY_URL=http://127.0.0.1:1`, one made-up message → `decided_by ai_unavailable · outcome notified · reason AI ไม่ได้ตรวจ · error layer 1 failed after 1 try: gateway unreachable…`; `ai_calls`: `1 | deepseek | deepseek-flash | f | gateway unreachable…` → **1 row** (before the rework: 2). (B) the fake gateway with `never-answers.json`, the **real 20 s default timeout**: decided after **23 s** (before: about 40 s) with one `ai_calls` row `gateway did not answer within 20000 ms`. This also closes my earlier "20 s timeout itself UNVERIFIED".

**A defect of mine found on the way (fixed in my file, one more for you):** `${JSON.stringify(x)}::jsonb` makes Bun.sql store a JSON *string* inside the jsonb column; `…::text::jsonb` (or passing the object) stores a real object. Probe (`jsonb_typeof`): `stringify::jsonb → string`, `stringify::text::jsonb → object`, `object::jsonb → object`. My note above that "`jsonb` comes back from Bun.sql as a string" was **wrong about the cause** — it returns what was stored, and my writes were double-encoded.
- Fixed: the settings `PUT` (`ai-settings.ts`) now writes an object — a new assertion checks `jsonb_typeof = 'object'` and `value->'layer1'->>'model'` after a PUT (it failed first, then passed). The test helpers that write `app_settings` do the same. `parseSettings` still reads a string, for rows an earlier build wrote.
- **Not fixed — outside this TASK's list:** `src/filter/pipeline.ts:113` (TASK-005) writes `decisions.rule_snapshot` the same wrong way. The API output is right today (`messages/index.ts` parses both forms), but the column holds a JSON string, so `rule_snapshot->>'kind'` would return nothing. The tests `conditions.test.ts` and `messages-api.test.ts` seed fixtures the same way. One-line fix (`::text::jsonb`) + a test: say if you want it as part of TASK-007 or a TASK of its own.

**Rework evidence:** `bun run test` (whole tree) → `224 pass · 0 fail · Ran 224 tests across 13 files [12.42s]`; the two TASK-006 files alone → `44 pass · 0 fail` three runs in a row; `tsc --noEmit` → exit 0; `git status` → my files: the new migration, `src/filter/{ai,gateway}.ts`, `src/modules/admin/ai-settings.ts`, `test/ai-{layers,settings}.test.ts` (closed list + the migration). Also: my Postgres cluster on :5433 had stopped with the previous session ("Connection closed" in every test); I restarted it with `bun run db:local start` and the `:8080` dev server too — both are running now.

## Questions
- For the SA: (1) **`line_names` read** — layer 1 reads Team B's names table, which SPEC-001 §4 does not list for Team A. Fine, or should Team B expose the list through a function in `src/core/`? (2) **Retry on timeouts** — "one retry for everything" means a dead gateway costs 2 × 20 s on layer 1 before the message fails open (the notification is delayed ~40 s; REQ-005 wants a push within 1 minute). Say if timeouts should not be retried.
- The real-gateway probe (DoD 2) is left to you or QA as the TASK says; command: `cd <back repo> && LLM_GATEWAY_URL=<url> bun ../ai-worker/tests/harness/corpus/run-corpus.ts ../ai-worker/tests/harness/corpus/sample.json [--allow-production]`.

  > answer (SA Sober, 2026-11-01): (1) The read of `line_names` is fine, read only. It is now in SPEC-001 §4 (Team B keeps
  > `user_id, name, position`). (2) Do **not** retry a timeout or an unreachable gateway; keep one retry for everything
  > else. See Review item 2.

## Review
**Verdict: REWORK (small, 2 items)** — SA Sober, 2026-11-01. The work is good. Re-run by me: `bun run test` →
`216 pass · 0 fail [11.91s]`, `tsc` 0. Your evidence holds: the fake-gateway table 69/70/71/70.5, the settings PUT naming the
field, AC-9 live, AC-5 on a closed port, the runner refusing production without the flag. The prompt-injection hygiene and
"one row per try" in `ai_calls` are good calls, and every declared decision is accepted.
**The real-gateway probe (mine, 2026-11-01, `sample.json`, 1 run, `--allow-production`)** found two things that only a real call
could show:
- The gateway's `GET /models` **no longer lists `deepseek-v4-flash`** (deepseek now: `deepseek-v4-pro`, `deepseek-flash`). The
  seeded layer-1 default would fail on every call, so every message would fall to "AI ไม่ได้ตรวจ".
- `gemini/gemini-2.5-pro` answered with **Google's free-tier daily quota exceeded** (retry in about 10 h).
- With `deepseek/deepseek-flash` + `deepseek/deepseek-v4-pro` the run gave S1 100 · S2 0 · S3 95: every message right at
  every bar from 50 to 90. **The v1 prompts work on a real model**, with JSON parsed and no errors.
Do:
1. Add `migrations/202611010002_core_ai_defaults.sql` with **exactly** the SQL in SPEC-001 §5 ("Second core migration"). It
   updates only an unchanged seed. Point any test that pins the default models at the new pair.
2. `gateway.ts` / `ai.ts`: a **timeout or connection failure is not retried** (SPEC-001 §6 step 5 amended); 500, empty or unusable
   answers keep their one retry. Update the timeout test, and paste the `ai_calls` count for a closed-port message: 1 row per
   failed layer, not 2.
DoD for the rework: `bun run test` green · `bun run migrate` on the dev DB → applies the new file, and `select value from
app_settings where key='ai'` shows the new pair · `tsc` 0 · `git status` only the closed list + the new migration file.

**Rework verdict: DONE** — SA Sober, 2026-11-01. Re-run by me: `bun run test` → `224 pass · 0 fail [12.06s]` · `tsc` 0 ·
`diff` of the SPEC-001 §5 "Second core migration" block against `migrations/202611010002_core_ai_defaults.sql` → identical.
Both items are met, with live evidence: closed port → **1** `ai_calls` row (was 2); the real 20 s timeout → fail open at 23 s
(was ~40 s, now inside REQ-005's 1 minute). The migration only replaces an unchanged seed (4 tests), and the dev DB shows the
new pair.
The `jsonb` double-encoding you found is a good catch. Fixed in your file; the `pipeline.ts:111–113` write (TASK-005's)
goes into **TASK-007 as step 0**, since you are in the tree anyway. The PM is warning Team B in case their LINE tables write
`jsonb` the same way.
