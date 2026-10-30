# SPEC-116: a run never ends "nothing workable" while a card is workable; hand-off names its people
- Source: REQ-119 (TEST-106 phase 2 P2-2, P2-3)
- Status: DONE round 2 (2026-10-30 16:4x, Silver — TASK-151 DONE) · was ACTIVE round 2 (2026-10-30 16:4x, Silver — D4, TASK-151 TODO; round 1 committed caw-back 7956aa7 · caw-front 7a2a6a5) · was DONE round 1 (2026-10-30 16:1x [corrected 16:4x, was written "17:2x" — F-043], Silver — TASK-147, TASK-148 DONE)
- Team: B (CAW) only — no seam change.

## Read before designing (caw-back `4cc3241`, caw-front `b4f2659`, branch `atom`, 2026-10-30, both trees clean)
- `caw-back → src/runner/plan.ts:53-60` — a card gets **one turn per worker per run** (any ended outcome but `interrupted`); when no card is left to pick, the run ends `nothing_workable` — **also when a workable card is still on the board** (it only had its turn). Test that pins it: `plan.test.ts:74-76`. ⇒ cause of P2-2 (the SA's hop only `commented`, #1 back in `todo`, workable, run ended). Reproduced by that test as written.
- `src/runner/main.ts:27-35` — `stopWords` (REQ-012's words) · `:98-114` `endRun` builds the report with those words · `:226` carries `finish_run` out.
- `src/runner/report.ts:93` — the report's line `- เหตุที่จบรอบ: {reasonWords}`.
- `src/cards/view.ts:25-28` — workable = work card, anchor not removed, `todo`/`doing`, every dependency `done`.
- Stop-reason list, 6 places: `src/db/schema.ts:124` (DB check) · `src/core/events.ts:52` · `src/http/routes/hops.ts:14` (zod enum → `openapi.json`) · `src/runner/api.ts:23` · `src/runner/plan.ts:5` · `main.ts:27-35`. Front: `caw-front → src/api/caw.ts:16`, `src/words.ts:108-115` (`stopReason`, shown through `runStopped` `:122` in `ModeControl.tsx:100` and `app/p/[id]/runs/page.tsx`), `src/api/schema.d.ts:3290,3991` (generated), `RunsList.test.tsx:13`, `words.test.ts:26`.
- Hand-off: `src/cards/service.ts:137-155` — the allowed recipients are `edges` from the card's assignee; refused → 409 `chain_broken`, details `{ from, allowed: [ids] }` (ids only). `cardContext` (`:96-115`) carries **no** chain at all; `src/runner/prompt.ts:12-26` (card hop prompt) names no recipient; `src/mcp/server.ts:85-89` `hand_off` asks for `toWorkerId`. ⇒ cause of P2-3: the only place a worker learns whom it may hand to is the refusal, as bare ids (TEST-106 run 2: *"ระบบบอกแค่รหัสผู้รับ 2 คน"*).
- Workers: `src/core/reduce.ts:16` `{ id, name, roles[] … deletedAt }`; the starting team's roles are `["SA"]`, `["BE"]` … (`caw-front → src/lib/startingTeam.ts:28`, test `:31`). Chain read: `GET /v1/projects/{id}/chain` (`src/http/routes/chain.ts:21`, `chainView` `src/chain/service.ts:15-19`: members + edges).

## D1 — a commented card gets a second turn (P2-2, REQ-119 req 1)
`plan.ts`: a card's turns per (card, worker) in the open run, counting ended hops except `interrupted`:
- a hop that ended **`commented`** (status unchanged, no hand-off) counts as half a turn: the pair is used up after **2** `commented` hops;
- any other ended outcome (`failed`, `stopped`, `handed_off`, `status`, `asked`) uses the pair up at once (as today — a failing card is not hopped in a loop, SPEC-C-003 § 3).
- **Order:** a card with no turn yet goes first (lowest number), and only then a card's second turn (lowest number) — so `plan.test.ts:65-67` (#1 commented → #2 is taken) stays as it is; `:74-76` (the only card, commented once, budget 9) becomes `start_hop` c1, and a new case (commented twice) ends `no_progress`.
`[SA-decided]` — TEST-106 run 2 shows the same SA on the same card got on with it on its next go (the operator had to press อัตโนมัติ for it). One extra hop at most per card per worker per run, inside the run's `hopBudget` (`plan.ts:51` still ends it first). Reversible (one constant `COMMENT_TURNS = 2`).

## D2 — new stop reason `no_progress` (REQ-119 req 1, AC-1)
When D1 leaves no card to pick:
- **no workable card with an assignee** → `nothing_workable` (unchanged);
- **at least one workable card with an assignee is still there** → `finish_run` with reason **`no_progress`** and **`cardId`** = the lowest-numbered such card.
`Action` gains `cardId?: string` on `finish_run` (only `no_progress` sets it).

Stop reason `no_progress` is added in all six back places and the front (§ Front). Exact code: `no_progress`.

**Report line** (`endRun` words for `no_progress`, built in `main.ts` from the card and the run's hops):
`#{number} {title} ยังทำต่อได้ แต่ทำ {n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู`
- `{n}` = the card's ended hops in this run, any worker, `interrupted` not counted.
- In the report it follows the existing label: `- เหตุที่จบรอบ: #1 ออกแบบ … ยังทำต่อได้ แต่ทำ 2 รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู`.
- `Interpreted` the PM's sentence (REQ-119 § Wording) **without its leading `หยุดรอบ: `**, because the report line already reads `เหตุที่จบรอบ:` — see Q1. `{ชื่องาน}` = `#{number} {title}`, the form every other report line uses (`report.ts:46`).
- `stopWords.no_progress` (when the card cannot be read): `มีงานที่ยังทำต่อได้ แต่ไม่คืบ` (same as the front word, Q2).
- Several stuck cards → only the lowest-numbered is named (the board shows the rest). `Interpreted`, Q1.

**Data Model — exact SQL** (drizzle `db:generate` from `schema.ts:124`; migration `0013`):
```sql
ALTER TABLE "caw"."runs" DROP CONSTRAINT "runs_stop_reason";
ALTER TABLE "caw"."runs" ADD CONSTRAINT "runs_stop_reason" CHECK ("caw"."runs"."stop_reason" is null or "caw"."runs"."stop_reason" in ('budget_spent','nothing_workable','failed_review_twice','limit_reached','operator_stopped','error','no_progress'));
```
Existing rows: untouched (every stored value stays allowed). Who runs it: CAW's own migrate on start, locally (pglite in tests). On the remote TEST DB it runs when the owner/QA starts the API there (SYSTEM-FACTS 12:54 — allowed). Never by an agent on anything else.

Consumers: `grep -rn "failed_review_twice" src test` in caw-back and caw-front (2026-10-30) → the 6 back places above + `plan.test.ts:80-121`, `main.test.ts:390-398`, `runner/e2e/auto.ts:7` (comment, untouched) · front `caw.ts:16`, `words.ts:111`, `words.test.ts:26`, `RunsList.test.tsx:13`, `schema.d.ts:3290,3991`. Every one is in TASK-147 or TASK-148, or named untouched.

## D3 — every recipient by name and role (P2-3, REQ-119 req 2, AC-2)
Wherever a worker is told whom it may hand off to:
1. **Card context** — `GET /v1/cards/{cardId}/context` (`card_context`) gains **`handOffTo`**: `{ id: string; name: string; roles: string[] }[]` = the workers the card's assignee has an edge to, not deleted, in `chainView` order (by id). No assignee or no edge → `[]`. Exact casing `handOffTo`.
2. **The card hop's prompt** (`buildPrompt`) gains one line after line 3, only when the worker has at least one recipient:
   `You may hand off to: แบงค์ (BE), ฝน (FE) — pass the name (or the id) as \`toWorkerId\` of \`hand_off\`.`
   Each recipient = `{name} ({roles joined " + "})` — the form line 1 of the prompt already uses for the worker itself (`prompt.ts:15`). The runner reads the chain with `GET /v1/projects/{id}/chain` (new `api.chain`) and the workers it already reads (`main.ts:119`).
3. **The refusal** — 409 `chain_broken` details become `{ from, allowed: [ids], allowedWorkers: [{ id, name, roles }] }` (`allowed` unchanged, first; `allowedWorkers` same order), and its message ends `— you may hand to: แบงค์ (BE) <id>, ฝน (FE) <id>` (`nobody` when empty). The recorded `card.handoff_refused` event and the note keep `allowed` ids only (unchanged — `handoff-refused.test.ts:27,33`).
4. **By name or id** — `handOff` resolves `toWorkerId`: an allowed id → as now; else the value, trimmed, equal to the `name` of **exactly one** allowed recipient → that worker's id; else 409 `chain_broken` as above. The stored `card.handed_off.toWorkerId` is always the id. `hand_off`'s MCP description and the route's body description say "the worker's id or name".
~~`[SA-decided]` — names are not unique by construction, so a name matching two recipients is refused like an unknown one, with both listed.~~ **Corrected 16:4x (Bob, TASK-147 Q2):** live workers' names ARE unique (`src/db/schema.ts:24` `workers_name_live`, `409 name_taken` `src/workers/service.ts:32`) and recipients are live, so a name matches at most one recipient; the `exactly one` check stays as the only reachable case.

Consumers (`grep -rln "chain_broken" src test`, caw-back) → `src/cards/service.ts`, `src/mcp/server.ts`, `src/http/errors.ts` (generic, untouched), `src/core/events.ts` (event shape, untouched); tests pinning `details` with `toEqual`: `test/http/cards.test.ts:150,166`, `test/http/handoff-refused.test.ts:22`, `test/mcp/server.test.ts:140` → updated in TASK-147; `test/http/worker-delete.test.ts`, `test/http/hop-guard.test.ts` (code only) → untouched. Card-context consumers: `CardContextSchema` `src/http/routes/cards.ts:33-42` (+ `openapi.json`); no test pins the context's key list (`grep -rn "Object.keys" test` → only chat context `chat-tools.test.ts:58`, projects, notes). Front: `schema.d.ts` regenerated (TASK-148); the front does not render `allowed` (`grep -rn "allowed" caw-front/src --include=*.tsx` → class names only).

## Front (TASK-148)
- `src/api/caw.ts:16` `StopReason` + `no_progress`; `src/words.ts` `stopReason.no_progress = "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"` → the strip reads `การรันหยุดแล้ว: มีงานที่ยังทำต่อได้ แต่ไม่คืบ · กด อัตโนมัติ เพื่อเริ่มรอบใหม่` (Q2); `gen:api` after TASK-147's `openapi.json`; tests that list every reason (`RunsList.test.tsx:13`, `words.test.ts:26`) gain it.

## AC map (REQ-119)
| AC | Where |
|---|---|
| AC-1 commented card, run continues; if it stops, not "ไม่มีงานที่ทำต่อได้", names the card | D1 + D2 — TASK-147 (plan + main tests, stub runner test), TASK-148 (strip word) |
| AC-2 recipients as name + role; hand-off by name or id works | D3 — TASK-147 |
| AC-3 REQ-117 review line and "รอคุณ — ไม่มี" unchanged; suites pass | TASK-147 DoD (report tests untouched, full suite), TASK-148 DoD |

## Risks / unknowns
- R1 — D1 spends at most one more hop per (card, worker) per run. Bounded by `hopBudget`. Would change: the owner wants zero extra hops → `COMMENT_TURNS = 1` (then every such stop is D2's honest line).
- R2 — a card the API **refused** to start a hop for (`main.ts` `refused`, filtered before `planTick`) is not "workable" to the planner; a run can still end `nothing_workable` beside it. `inferred` rare (no refusal seen in TEST-106/112); out of REQ-119's hop-only case (AC-1 Given). Settled by: a refusal in a live run → its own REQ.
- ~~R3 — two workers with the same name: D3.4 refuses the name, lists both.~~ Not possible among live workers (D3.4 correction).

## Order (F-013)
REQ-119 first, then REQ-118's Team B side (SPEC-117): both change `src/runner/prompt.ts`, `src/runner/hop.ts`, `src/runner/api.ts` and `openapi.json` in caw-back, and `schema.d.ts` in caw-front. `[SA-decided]` — REQ-119 can be tested and committed now; REQ-118's joint run waits for Team A's TASK-145 (behind REQ-115) anyway.

## Tasks
- TASK-147: caw-back — second turn for a commented card, `no_progress` with the card named, recipients by name + role, hand-off by name — owner: BE Bob (depends on: REQ-117 committed `4cc3241` ✓)
- TASK-148: caw-front — `no_progress` word + gen:api — owner: FE Fanta (depends on: TASK-147 DoD `openapi.json` · REQ-117 front committed `b4f2659` ✓)

## D4 — round 2: `{turns}` counts only the turns since the card's last progress (REQ-119 § Round 2, req 4 / AC-4; TEST-116 DEF-1)
Read (caw-back `4cc3241` + round 1's 21 paths, 2026-10-30 16:4x): `src/runner/main.ts:235` — `n` = every ended, non-`interrupted` hop of the run on the card, so a hand-off turn is counted as "no progress" (DEF-1). Hop ids are UUIDv7 (`src/core/ids.ts:3`), so id order = start order; `listHops` returns newest first (`src/hops/service.ts:118`); `main.ts:198` already sorts by id the same way. Card-hop outcomes: `src/runner/api.ts:28`.

**Rule:** walk the run's ended hops on that card **newest first** (by id), skip `interrupted`, and count until the first hop whose outcome is **progress**; `{turns}` = that count. Progress = what D1 already treats as more than a comment.

| Card-hop outcome (`api.ts:28`) | Progress? | Why |
|---|---|---|
| `handed_off` | **yes** — stops the count | REQ-119 req 4 "a hand-off" |
| `status` | **yes** — stops the count | req 4 "a status change" |
| `commented` | no — counted | D1: status unchanged, no hand-off |
| `asked` | no — counted | not in req 4's list; the card did not move |
| `failed`, `stopped` | no — counted | the hop did nothing to the card (round 1 counted them too) |
| `interrupted` | skipped, not counted | as round 1 (D1, D2) |
| `replied`, `proposed`, `amended`, `proposed_and_amended` | never seen here | chat hops: `cardId` is null, so not on the card |

`Interpreted` (reversible, one set in `main.ts`): req 4's third kind of progress, "a file written", is not something the runner can see — a hop that writes files and changes nothing on the card ends `commented` (`hop.ts:454`, outcome from card events only). So a file write alone does not stop the count. AC-4's case does not depend on it. Told to the PM, not blocking.

**Boundary cases worked through both rules (plan D1 + this count):**
- AC-4 / TEST-116 S2 — hops oldest→newest: SA `commented`, SA `handed_off`, BE `commented`, BE `commented` → plan: BE's pair used up, the card is workable → `no_progress`; newest first: BE c, BE c, SA `handed_off` (stop) → **2** ("ทำ 2 รอบแล้วไม่คืบ"). Round 1 said 4.
- A single worker: `commented`, `commented` → **2** (as round 1, `main.test.ts:331` stays green unchanged).
- Stopped once, still workable (`main.test.ts:458`): `stopped` → **1** (as round 1, unchanged).
- **Reachable 0:** a worker's one hop moves the card `todo → doing` (`status`). The card is still workable (`src/cards/view.ts:25-28`: `todo`/`doing`), D1 spends the pair at once (`plan.ts:65`), so the run ends `no_progress` with that card, and newest first the first hop is `status` → count **0**. "ทำ 0 รอบแล้วไม่คืบ" is not true. **Default `[SA-decided]`, Q4 to the PM:** count 0 → end with the generic words `stopWords.no_progress` (`มีงานที่ยังทำต่อได้ แต่ไม่คืบ`, PM's Q2 word, already used when the card cannot be read), so no number is shown. Round 1 printed 1 here. **Q4a and Q4b accepted by the PM 16:4x `[PM-decided]`** (REQ-119 § Questions Q4; req 4's "a file written" struck), so TASK-151 stands as written.

Placeholder sources (spec-rules §5): `{cardNo}` ← `card.number` · `{title}` ← `card.title` · `{turns}` ← this count. The sentence is unchanged (PM's Q1).
Consumers: no shape changes (one local number in `main.ts`), so no probe (spec-rules §1 is for shape changes). `grep -n "รอบแล้วไม่คืบ" -r src test` → `src/runner/main.ts:236`, `src/runner/main.test.ts:331,458` (both stay green unchanged; one new case is added).
**Plan side unchanged:** `plan.ts` still gives turns per (card, worker), so a worker who gets the card back later in the same run after handing it off has no turn left. That is round 1's rule and outside req 4; "Nothing else in the run changes" (req 3).

**Task / order:** TASK-151 (BE Bob, XS): `src/runner/main.ts` + `src/runner/main.test.ts` only. Depends on: REQ-119 round 1 committed. TASK-149 (REQ-118 B) does not list either file, so the two may be built after the same commit and staged by name, one topic per commit (F-013 holds: no shared file).

## Questions (→ the PM; non-blocking — the defaults are built unless the PM corrects them)
> **Answered (PM, 2026-10-30 16:2x `[PM-decided]`, REQ-119 § Questions): Q1, Q2, Q3 accepted as written below.** The PM's one fix (card number and turn count are two values) is how D2 already reads: `#{number}` and `{n}` = turns; TASK-147 step 3 = `${card.number}` / `${n}`.
- **Q1 — the report line's wording.** I will write `- เหตุที่จบรอบ: #{number} {title} ยังทำต่อได้ แต่ทำ {n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู` — your sentence without `หยุดรอบ: ` (the line already says `เหตุที่จบรอบ:`). Cases: several stuck cards → only the lowest-numbered named · `{ชื่องาน}` = `#n title` like the report's other lines · n counts every worker's hops on that card in the run. Correct only the line that is wrong.
- **Q2 — the run strip's short word** (ModeControl / runs page, `runStopped`): `มีงานที่ยังทำต่อได้ แต่ไม่คืบ` → `การรันหยุดแล้ว: มีงานที่ยังทำต่อได้ แต่ไม่คืบ · กด อัตโนมัติ เพื่อเริ่มรอบใหม่`. User-facing copy is yours; correct or accept.
- **Q3 — D1's second turn** (one more hop of quota per commented card) — default yes; say no to make it `1` (then a commented card always ends the run with the honest line).
