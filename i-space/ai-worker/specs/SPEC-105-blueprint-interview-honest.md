# SPEC-105: Blueprint's interview — tell the model the kinds it may use, never claim a save on a rejected round, fail fast on timeout
- Source: REQ-110 (Team A)
- Status: DONE (2026-10-29 15:4x, Sober — SA, Team A) — TASK-109 and TASK-110 DONE; REQ-110 SPEC_DONE with AC-1 left to QA's live run (REQ-110 Q3)
- Repos read: `blueprint-back` at `atom` f60b934 and `blueprint-front` at e46322a (read with `git show f60b934:…` because TASK-107 is changing the working tree). Read 2026-10-29 by Sober.
- Evidence of the defect: `tests/TEST-106-e2e-live-dashboard.md` § Phase 1 (P1-1…P1-3).

## Root causes (read in code)

1. **The model is never told which part kinds exist.** `SYSTEM_PROMPT` (`back: src/interview/context.ts:11-21`) describes the JSON and the `Change` ops. Its only kind-specific lines are about `work.goal` and `role.duty`. The kinds the server accepts are `MODEL_KINDS` (`back: src/interview/round.ts:27`) and the registry (`back: src/spec/registry.ts`, `LINK_KINDS` `:92`), and neither is in the prompt. So the model invented `feature` (P1-1).
2. **A rejected round shows the model's own words.** The round asks for one correction (`round.ts:431-440`). When the correction is also refused, `fail("changes_rejected", reply, …)` stores **the model's reply text** as the bot row (`:400-404` → `finish` `:343-353`). That text was written as though its changes would land, so it says "saved" (P1-2). The front shows a rejected round's content like any other reply. Only `bot_could_not_answer` gets its own sentence (`front: src/features/chat/load.ts:72`).
3. ~~**A timeout costs up to 4 × 90 s.** … and the round asks again after a failed first call (`round.ts:417-422`). 382 s is consistent with that (P1-3).~~ **Corrected 2026-10-29 (TASK-109 finding 1, F-014):** a failed first call ends the round (`round.ts:417`; comment `:415`). The round asks again only for an unparseable reply (`:420-425`) or the one correction (`:431`). So a timeout cost **2 × 90 s** (the client retry, `client.ts:120`), and a slow chain of answered calls can reach about 3 × 90 s. 382 s was not reproduced; its exact path is unknown. Gateway timeout is 90 s (`back: src/gateway/client.ts:75`). The reason (`timeout`) is only logged (`:346`). It isn't stored, so the front can only say "บอทตอบไม่ได้ตอนนี้" (`front: src/features/chat/words.ts:32`).

## Design `[SA-decided]` (each cheap to reverse at review)

- **E1 — The prompt lists what the server accepts, generated from the registry.** A new block is appended to `SYSTEM_PROMPT`, built at module load from `MODEL_KINDS` ∩ `PART_KINDS` (each kind's body field names and which are required, read from its zod shape) and from `LINK_KINDS` (each kind's from → to kinds, ordered, labelled). It ends with: "ห้ามใช้ kind อื่นนอกจากนี้ — ถ้าไม่เข้ากับ kind ไหน ให้ถามเป็น question". Generated, so it can never drift from the registry, and it picks up REQ-103's `requirement` automatically if it ever joins `MODEL_KINDS` (it won't: SPEC-104 D6). It adds no words to the UI.
- **E2 — A rejected round never shows the model's text.** On `changes_rejected` the bot row's `content` is `""`, and the row stores **why**:
  - `round_reason` holds a code: `unknown_kind` · `needs_user_words` · `invalid_change` · `protocol`.
  - `round_note` holds a short detail, e.g. the kind name `feature`. It is never document text, and at most 60 characters.
  - The front composes REQ-110 § Wording's sentence from them. The model's text is not kept anywhere the user sees it. AC-3: an unknown kind is **rejected and named**; there is no mapping to another kind, because guessing a kind is the model's error, not ours to paper over.
- **E3 — A timeout is not retried by us.** On `timeout` the client does not retry (other failures keep R8's one retry), and the round does not ask again. Worst case is about 90 s instead of about 360 s. The bot row gets `round_status = bot_could_not_answer`, `round_reason = timeout`, and the front shows the timeout sentence plus the existing retry and change-model controls (`front: src/features/chat/words.ts:32`, `retry` / `changeModel`). AC-4's "retry on a lower tier" is the existing model control. *(Review note: the round part was already true; only the client change was needed. When the **correction** call fails on transport, the round stays `changes_rejected` with the first refusal's code, so the user sees "nothing saved". Accepted as honest, and reversible in one line. Ruled at the TASK-109 review, finding 2.)*
- **E4 — Other `bot_could_not_answer` reasons are stored too** (`network`, `http_<n>`, `protocol`, …), so the front can tell timeout apart from the rest. Only `timeout` gets a new sentence; the rest keep "บอทตอบไม่ได้ตอนนี้".

## API / Interface Design (blueprint-back)

- `messages`: two nullable columns, `round_reason text` and `round_note text`, set only on bot rows of `changes_rejected` / `bot_could_not_answer`.
- `GET /v1/projects/{projectId}/messages`: each message gains `roundReason: string | null` and `roundNote: string | null`.
- `POST /v1/projects/{projectId}/rounds`: the `Round` response gains `reason: string | null` and `note: string | null`. For `changes_rejected`, `reply` is `null`.
- Codes for `changes_rejected`, mapped from the refusal (`round.ts:142-159` and `applyChangeSet`'s `ValidationError`):

  | code | when | note |
  |---|---|---|
  | `unknown_kind` | `part.add`/`link.add` with a kind not in the registry or not in `MODEL_KINDS` | the kind, ≤ 60 chars |
  | `needs_user_words` | the provenance guard at `:149,151,155` | — |
  | `invalid_change` | any other validation refusal | — |
  | `protocol` | the correction reply is not the JSON (`:436`) | — |

- The seam is untouched. `amend` writes `caw` rows, which get no reason.

## Data Model

```sql
ALTER TABLE messages ADD COLUMN round_reason text;
ALTER TABLE messages ADD COLUMN round_note text;
```
A new drizzle migration **after** TASK-107's. Old rows stay null; the front treats a null reason exactly as today. Run on `pglite:memory` only (SPEC-104 G5b applies: `.env` points at a remote test DB).

## Front (blueprint-front)

- `front: src/features/chat/load.ts:72` today maps `bot_could_not_answer` → `botFailed.message`. It becomes:
  - `changes_rejected` → "รอบนี้ยังไม่ได้บันทึกอะไรเลย — {reason} ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ", where `{reason}` comes from the code and note (Q2 below);
  - `bot_could_not_answer` + `timeout` → "AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า", with the existing retry and change-model controls;
  - other reasons → unchanged.
- Every theme's chat renders whatever text `load.ts` builds (luxury-gold reads `roundStatus` itself at `front: src/themes/luxury-gold/client/ChatDesk.tsx:112`; FE checks it shows the new text too).
- `gen:api` after TASK-109's openapi emit.

## Guardrails

SPEC-104 G1–G7 and G5b, unchanged. Specifically:
- **no live gateway**: AC-2/3/4 use a stub gateway in tests. AC-1 is QA's live test, on the owner's word (REQ-110 Q1);
- every `bun` command in blueprint-back is prefixed with `DATABASE_URL=pglite:memory`.

## AC → work

| AC | Covered by |
|---|---|
| AC-1 (live: the spec gets stored) | TASK-109 E1 (prompt) — proven only by QA's live run (Q1). Stub test: the prompt contains every model kind and link kind and no other. |
| AC-2 honest rejection | TASK-109 E2 (content `""`, reason stored) + TASK-110 (sentence) |
| AC-3 `feature` | TASK-109 test: fake model proposes `feature` → `changes_rejected`, `unknown_kind`, note `feature`, 0 parts, chat shows the sentence naming it |
| AC-4 timeout | TASK-109 E3 (no retry on timeout, reason stored; test with a stub that sleeps past a short `timeoutMs`) + TASK-110 (sentence + controls) |
| AC-5 regression | both: full suites green (`bun test --timeout 30000`, front unit + states) |

## Round 2 — REQ-110 amended (req 4, 5; AC-6, AC-7) after TEST-107 DEF-1 (2026-10-29 16:2x, Sober)

**Why:** live, both rounds were `invalid_change` with 0 parts, and nothing recorded which change failed (TEST-107 DEF-1, O-4). This is the step § Risks named. Same topic (REQ-110), same uncommitted tree, so no commit sits in between.

**Design `[SA-decided]`:**
- **E5 — Keep what is valid, drop only what isn't.**
  - `build()` (`back: src/interview/round.ts:95`) checks **each** model item on its own (`changes[i]`, `questions[k]`, `contradictions[k]`), instead of returning at the first refusal (`:134-222`).
  - A refused item is removed together with every item that refers to its `$ref`, transitively. Those are recorded as `depends_on_refused`, naming the ref.
  - The remaining set goes to `applyChangeSet`. If the store still throws `ValidationError(index)` (`:389-408`; body schema, link rules), the item at that index is mapped back to its model item, dropped with its dependents (reason `invalid_change`, detail = the store's message), and the apply is retried. At most once per model item, all inside the same round: **no extra gateway call**.
  - The user's own decisions (accept, answers, park — server-made) are never dropped. If one fails, that is an integrity error, as today.
- **E5b — The correction call stays, and is no longer all-or-nothing.** Refusals in the first answer still trigger the one correction call (`:431`), and its answer is pruned the same way.
  - If the correction call fails (transport or protocol), the **first** answer is pruned and applied, instead of the whole round being thrown away.
  - This supersedes the TASK-109 review's finding-2 note: the user now gets the valid parts either way.
- **E5c — Status and text.**
  - Something applied → `applied`; nothing → `changes_rejected` as today.
  - When **anything** was refused, the model's reply text is **not** shown (it may describe refused items as saved, the same honesty rule as E2). The front composes "saved n, not saved m" plus the per-item list from the record.
  - Nothing refused → as today: the model's reply is shown.
- **E6 — Record every refused item** on the bot row, in `messages.round_refused jsonb NULL`: `[{ "item": "changes[3]", "op": "part.add", "kind": "step", "ref": "$s2" | null, "key": "STEP-004" | null, "title": "<≤ 80 chars>" | null, "reason": "unknown_kind" | "needs_user_words" | "invalid_change" | "depends_on_refused", "detail": "<server message, ≤ 200 chars>" }]`.
  - Capped at 50, with an extra last element `{ "item": "more", "count": n }` past that.
  - Only server-built text plus the model's own `title` (spec text the user sees anyway). No key, no secret, no full model answer.
  - Returned as `roundRefused` (null or array) on `GET …/messages`, plus `refused` on the `Round` response.
  - `round_reason`/`round_note` stay as they are (the all-refused summary).
  - **Added 16:4x (TASK-124 Q1; my gap): `messages.round_saved integer NULL`** = the number of **model items** (`changes[i]`, `questions[k]`, `contradictions[k]`) that were applied. That's the same unit as the refused list, so "saved n, not saved m" counts like with like. It excludes the user's own decisions and link rows counted separately. It's set on the bot row whenever `round_refused` is set, and null otherwise. Returned as `roundSaved` on `GET …/messages` and `saved` on `Round`.

**Consumers** (grepped 16:2x):
- back: `grep -rn "roundReason\|round_reason" src` → `src/db/schema.ts:125`, `src/http/routes/rounds.ts:38` (`ChatMessage`), `src/interview/round.ts:56,354,364,395,490`. Each gains `roundRefused` beside it, and all are in TASK-123's list.
- front: `grep -rn "roundReason\|roundNote" src` → `src/features/chat/load.ts:23` (+ its text choice), `src/features/chat/words.ts:37`, `src/features/chat/load.test.ts:405-442`. All in TASK-124's list.
- The seam's `MessageSchema`/`amendments` is untouched (`ChatMessage` is separate, TASK-109).

**Data Model:** `ALTER TABLE messages ADD COLUMN round_refused jsonb; ALTER TABLE messages ADD COLUMN round_saved integer;`. Existing rows are null, and the front treats null as today.

**Wording:** REQ-110 Q4 (PM), non-blocking. The front builds the defaults.

**AC → work:** AC-6 → TASK-123 (prune + apply) + TASK-124 (list) · AC-7 → TASK-123 (`round_refused` + API) · AC-1 → the live re-test on the owner's word.

## Round 3 — the model's shapes (TEST-107 round 2: AC-1 live 2 parts, 20 refused) (2026-10-29 17:4x, Sober)

**Diagnosis, from the stored record only** (`tests/harness/test-107/r2/ac1-bot-row.json`, no new call). The 8 invalid changes:
- 5 × a `ref` with hyphens (`$status-data`, `$step-view`, …) vs `^\$[A-Za-z0-9_]+$`;
- 1 × `system` with no `body`;
- 1 × `screen` with `fields`/`actions`/`states` as strings, where the registry wants lists of `{ name, … }` (`back: src/spec/registry.ts:15-23`);
- 1 × `decision` with `cases` a string (wants `string[]`) and `open` a boolean (wants string) (`:45-52`).

The 12 others were `depends_on_refused` on those. **Cause on our side:** `kindsBlock()` lists only field **names** and `?` (`back: src/interview/context.ts:20-21`). It says nothing about types, list shapes or the ref pattern, so the model guessed.

**O-6, re-read:** the round-2 bot row is `bot_could_not_answer` / `http_503`, with no refusals (`ac1-bot-row2.json`). That status comes only from the "ask once more" path, after an **unparseable** first reply (`round.ts:553-557`). A failed **correction** would have ended `changes_rejected` with the refusals kept (`:576-583`). So nothing refused was lost. The real gap: why the first reply was unreadable is kept nowhere, and the stored reason is the *last* failure (the cap's 503).

**Design `[SA-decided]`:**
- **E7 — Tell the model the shapes.** `kindsBlock()` prints each field's type from its zod schema: `string`, `boolean`, `number`, `string[]`, `[{ name, label?, type? }]`, `"GET"|"POST"|…`. It adds one line on refs: "ref คือ $ ตามด้วย a-z A-Z 0-9 _ เท่านั้น เช่น $step_view". Generated, so it can't drift. The block's growth is pasted in Notes, and must stay within the AC-11 size tests.
- **E8 — Repair only what has one reading, and record each repair.** This happens before validation, per item:
  - (a) a `$ref` with other characters → each run of them becomes `_`, applied to the same ref everywhere it appears in that answer (`ref`, link `from`/`to`, question `about`, contradiction `between`). If two different refs become equal, neither is renamed (they then fail as today);
  - (b) `part.add` with no `body` → `{}`;
  - (c) a string where the schema wants `string[]` → `[that string]`.
  - Nothing else is coerced: no boolean → string, and no string → list of objects. Each repair goes into a new record `messages.round_adjusted jsonb` (`[{ item, what: "ref_renamed"|"body_defaulted"|"wrapped_in_list"|"field_dropped", title, key, ref, field?, from?, to? }]`, with `title`/`key`/`ref` exactly as in `round_refused`, so a line can name the part (added 17:5x, TASK-127 Q1); cap 50 + `more`), returned as `roundAdjusted`.
- **E9 — Keep a part when only optional fields are wrong.** If a `part.add`/`part.update` still fails, and **every** failing path is an optional or defaulted top-level body field (`.optional()`/`.default()`), those fields are removed. The part is stored, and each removed field is recorded as `field_dropped` (item, field). Otherwise it's refused as today. In the live case, the decision would keep its `rule` and `cases` and lose only `open`, and the screen would be stored without its malformed lists. *Why:* the rules REQ-112 needs are decisions, and losing one over an optional field costs more than losing the field.
- **E10 — Keep why a reply was unreadable (O-6).** On a `protocol` failure, the bot row keeps `round_reason = "protocol"` (the **first** failure), with `round_note` = the later failure if the re-ask also failed (e.g. `"then http_503"`). It also stores the first ≤ 4000 characters of the unreadable reply in `messages.round_raw text`, for the team only: returned as `roundRaw` on `GET …/messages`, and **never shown in the UI**. It's the user's own spec content, already in the same database, so no key or secret is involved.
- **Front (small):** a `field_dropped` adjustment is shown under the saved/not-saved lines, one line per item: "{title} — บันทึกแล้ว แต่ตัดช่อง {field} ออก" (wording Q5). Every other adjustment is invisible to the user, and stays in the record for the team.

**Consumers** (grepped 17:4x): back `grep -rn "roundRefused\|round_refused" src` → `src/db/schema.ts:128`, `src/http/routes/rounds.ts:53`, `src/interview/round.ts:70-71,446,488,605`. Each gains `roundAdjusted`/`roundRaw` beside it. Front `grep -rn "roundRefused" src` → `src/features/chat/words.ts:52`, `load.ts`, `load.test.ts:449-489`. All are in the TASKs' lists.

**Data Model:** `ALTER TABLE messages ADD COLUMN round_adjusted jsonb; ALTER TABLE messages ADD COLUMN round_raw text;`.

**Live calls the next proof needs (for the PM to ask the owner):**
- **Ask for 6, expect 2–4.** AC-1 allows 2 rounds. Each takes 1 call, +1 for a correction, and +1 if a reply is unreadable. The client retries a failed transport once (R8), which can double a failing call.
- If round 1 stores the spec (the goal), round 2 isn't needed. If the 6 run out, the stored `roundRefused`/`roundAdjusted`/`roundRaw` say why, and nothing more is spent.

**AC → work:** AC-1 → E7 + E8 + E9 (proof: the live run) · req 5 / O-6 → E10 · AC-6/7 unchanged, plus tests for each repair.

## Round 4 — `type` for `op`, and a slow first answer (TEST-107 round 3 live: DEF-3, O-9; REQ-110 req 6–7, AC-8, AC-9) (2026-10-29 22:3x, Sober)

**What I read** (tree = QA's fp `3a8865972bb7`, restored by TASK-129):
- `back: src/interview/protocol.ts:12`: `change: z.looseObject({ op: z.string() })`. So a change with no `op` fails the whole reply, and `parseReply` (`:33-42`) returns `{ ok: false }` → `protocol` (`round.ts:656-665`).
- `back: src/interview/context.ts:64`: the prompt says "Change คือ part.add (…) · part.update (…) …". **It never names the field that carries the op.** The model has been guessing `op`. In the accept round it guessed `type`. This is a cause on our side, the same shape as F-023.
- The live reply (`tests/harness/test-107/r3/ac1-round3-accept-messages.json` → `roundRaw`, 4000 chars) ends inside the last key (`…], "contradictions`). Closed with `": [] }`, it parses to **9 changes** (SCR-001 `part.update`; `part.add` data `$data_check` holding the 4 URLs; decisions `$dec_status`, `$dec_timeout`, `$dec_scope`; 4 `link.add`) and 2 questions. **Every change uses `type`, none uses `op`.** Their bodies fit the registry (`back: src/spec/registry.ts:15-52`: `neighbouring`, `states[].note` and `fields[].note` are allowed).
- Inferred, for QA to confirm: the user's own accept **was** stored in that round. The response has `changeSetId 72171499…` (D-023, `round.ts:627-641`), and the final spec holds one `"answered"`. Only the model's parts were lost.
- Gateway limit: one `timeoutMs` per gateway, default 90 s (`back: src/gateway/client.ts:75`). The interview (`round.ts:557-558`) and the quiz (`src/quiz/answer.ts:57`) share it. The HTTP side already holds a 90 s round (QA's probe: 90.0 s).

**Design `[SA-decided]`:**
- **E11 — Read `type` as `op` when it can only mean that.** In `parseReply`, before `ModelReply.safeParse`, for each `changes[i].change`:
  - **if** it has no `op` key, **and** `type` is one of the six op names (`part.add`, `part.update`, `part.remove`, `link.add`, `link.update`, `link.remove`), then `type` is renamed to `op`;
  - nothing else is renamed: any other `type` value, a change that has both keys, or a change with neither is left alone and fails as today. A change never carries `type` at its top level (part bodies have `type` *inside* `body`, which is untouched);
  - `parseReply` returns `{ ok: true, reply, adjusted }`, where each rename is `{ item: "changes[i]", what: "op_renamed", from: "type", to: "op" }`. `runRound` puts these into the round's `round_adjusted` record, beside E8's (same record, same cap 50 + `more`, with `title`/`key`/`ref` filled as for E8). They count for the first answer **and** for the re-ask/correction answer the round actually uses. They are never shown to the user (front: only `field_dropped` is shown, E9).
- **E11b — Name the field in the prompt.** `context.ts:64` becomes "Change คือ object ที่มีช่อง \"op\" (ห้ามใช้ชื่ออื่น เช่น type) — op คือ part.add (…) · …", keeping the rest of the line. The prompt-size tests (AC-11) still pass.
- **E12 — The first answer may take up to 3 minutes.** `createGateway` gains `firstAnswerTimeoutMs` (default `180_000`). `Gateway.chat` gains an optional `{ firstAnswer?: boolean }`, and with it the call uses that limit instead of `timeoutMs`. **Only the round's first call passes `firstAnswer: true`** (`round.ts:653`). The re-ask, the correction and the quiz keep 90 s, so the worst case is about 3 + 1.5 min, never 3 × 3. E3 is unchanged: a timeout is never retried.

**Contract changes (blueprint-back):**
- `Adjusted.what` (`round.ts:40`) and its zod enum (`src/http/routes/rounds.ts:23`) gain `"op_renamed"`; `openapi.json` is re-emitted. Nothing else in the API changes.
- Consumers: `grep -rn "ref_renamed" src ../blueprint-front/src` (non-test) → back `src/interview/round.ts:40,203`, `src/http/routes/rounds.ts:23` (both in TASK-130) · front `src/features/chat/load.ts:31` (doc comment listing the values) and the generated `src/core/api/schema.d.ts` (TASK-131). Front `load.ts:113` shows only `field_dropped`, so a new value shows nothing. That is the intent.
- `Gateway` consumers: `grep -rn "timeoutMs" src test` → `src/gateway/client.ts:71,75,80`; tests `test/gateway/client.test.ts:61`, `test/interview/honest.test.ts:145,158`. Both honest tests drive a whole round, so their first call now uses `firstAnswerTimeoutMs`: each must also set it short (in TASK-130's list). Fakes that implement `Gateway` keep working, because the new argument is optional.
- No migration. No front behaviour change. The seam is untouched.

**AC → work:** AC-8 → E11 (+ E11b), proof: a stub replays the recorded reply (closed with `": [] }`) and stores all 9 changes · AC-9 → E12, proof: a short-limit unit test plus QA's 120 s stub · AC-1 → the live run · AC-5 → full suites.

**Live calls for the next AC-1 proof (REQ-110 Q (b)):** ask for **6** in total (the owner's 1 unspent counts, so 5 more), expect 3–4:
- round 1, the first message: 1 call, +1 correction if anything is refused;
- round 2, "ตามนั้น": 1 call, +1 correction, +1 re-ask if a reply is unreadable.
The 3-minute limit should save the call that L1 lost. If the 6 run out, the record says why, as before.

## Risks

- **E1 might not be enough for AC-1.** A model can still ignore the list. Then the round is honest about it (E2), but the spec still isn't stored. If QA's live run fails AC-1, the next step is applying the valid changes and reporting the refused ones. That is an M, because a refused `part.add` must also drop the links and questions that reference its `$ref`. Not designed here.
- E3 changes the old team's R8 ("a failed chat is tried once more") for timeouts only. Interpreted the owner's intent (honest, usable interview) as outranking R8 for that one case.

## Questions (to the PM — non-blocking; FE builds the defaults)

- **Q2 (wording, `{reason}` in REQ-110's sentence)** — defaults, one per code:
  - `unknown_kind`: "AI เสนอข้อมูลแบบ “{note}” ที่ Blueprint ยังไม่รองรับ"
  - `needs_user_words`: "การแก้หรือลบสิ่งที่คุณพูดไว้เองต้องใช้คำของคุณ"
  - `invalid_change`: "ข้อเสนอของ AI ไม่ผ่านการตรวจของระบบ"
  - `protocol`: "AI ตอบกลับมาในรูปแบบที่ระบบอ่านไม่ได้"
  > answer: all four accepted as written; they are part of REQ-110's decided wording. — Porter (PM) 2026-10-29 `[PM-decided]`
