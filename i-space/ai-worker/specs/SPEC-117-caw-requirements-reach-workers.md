# SPEC-117: every requirement reaches every CAW worker (Team B side of REQ-118)
- Source: REQ-118 (TEST-106 phase 2 P2-1) · consumes the contract of **SPEC-115** (Team A, final: `requirements: Part[]` in both part-context routes)
- Status: ACTIVE (2026-10-30 16:0x, Silver)
- Team: B (CAW). **No seam change asked for** beyond SPEC-115; CAW reads two seam routes that already exist.

## Read before designing (caw-back `4cc3241`, caw-front `b4f2659`, branch `atom`, 2026-10-30; blueprint-back `f10f8cb` read only)
- SPEC-115 § API: both part-context routes gain `requirements` = every `requirement` part, full `Part` (`body.text`), sorted by key, always present.
- caw-back `src/cards/service.ts:104-108` — `card_context.spec` = Blueprint's v2 part context **as returned**, through `readLatestPart` (`src/blueprint/latest.ts:32`, live read, cached per key as fallback) or the hop's **pin** (`latest.ts:54-71`, `hop_spec`, written at hop start `src/http/routes/hops.ts:47`). ⇒ once TASK-145 lands, `spec.requirements` reaches `card_context`, the cache and the pin with **no CAW code** (AC-1; DECISIONS 2026-10-29 11:41 "a running hop keeps its starting spec" holds for requirements too).
- Seam route 1 `GET /v1/projects/{id}/spec` already returns every part, `requirement` parts included (SPEC-106 § route 1: *"They include `requirement` parts (REQ-103 Q5: CAW accepts the kind)"*; blueprint-back `src/seam/spec.ts:36-40`); caw-back reads it as `blueprint.spec()` (`src/blueprint/client.ts:27,88`) in `coverage.ts:32`. A requirement part = `{ key: "REQ-nnn", kind: "requirement", title, body: { text } }` (blueprint-back `src/spec/registry.ts:86`; TEST-106 `phase2/out/card-1-context.json` `spec.part`).
- Entry chat: `src/runner/prompt.ts:95-130` `buildChatPrompt` — it tells the worker to `locate`, and to propose **only on located keys** (`:119`), enforced in `src/proposals/service.ts:53-56` (422 `anchor_not_located`). A requirement that `locate` does not return can never be anchored. The prompt goes in argv (`hop.ts:206` `-p`); the role skills go in a file (`hop.ts:325`, `--append-system-prompt-file` `:218`).
- Card hop prompt: `prompt.ts:19-20` names `spec.decisions` / `spec.relatedDecisions` only. Shipped skills, line 5 of each `skills/role-*/SKILL.md` (6 files): *"Before you ask the operator anything, read the card's `spec.decisions` and `spec.relatedDecisions`; ask only what they do not answer."* (REQ-117 Q1).
- Coverage: `src/projects/coverage.ts:30` anchors = every work card's anchor + the proposal's item anchors; `:53-58` uncovered = decisions only.
- Follow: `src/follow/pull.ts:83` flags (`spec.revised.cardIds`) only cards whose **own anchor** key changed/was removed. The flag only shows, it does not stop a card (`src/cards/view.ts:25`, REQ-105 D7).

## D1 — card hop: the worker is told to follow `spec.requirements` (REQ-118 req 1; PM's Q1 answer: REQUIRED)
- `buildPrompt` line 2 becomes:
  `2. Follow every requirement in \`spec.requirements\` and every rule in \`spec.decisions\` and \`spec.relatedDecisions\` of your card's context — the requirements bind every card, whatever its anchor; a rule on a related part applies to your card too.`
- Line 5 of all six shipped skills becomes:
  `Before you ask the operator anything, read the card's \`spec.requirements\`, \`spec.decisions\` and \`spec.relatedDecisions\`; ask only what they do not answer.`
- No other CAW code for AC-1 (pass-through).

## D2 — entry chat: every requirement in the hop's prompt (REQ-118 req 2, AC-2)
1. **New CAW route** `GET /v1/projects/{projectId}/requirements` (any actor that may read the project; read only):
   - 200 `{ "revision": number, "requirements": [ { "key": string, "title": string, "text": string } ] }` — from `blueprint.spec()` (route 1): parts with `kind === "requirement"`, `text = body.text`, sorted by key, numeric-aware (`REQ-002` before `REQ-010`: `a.key.localeCompare(b.key, "en", { numeric: true })`). No requirement → `[]`.
   - 404 `not_found` (no such CAW project) · 404 `blueprint_project_not_found` (route 1 said 404) · 502 `blueprint_unreachable` — the same three answers as `GET …/coverage` (`coverage.ts:27,32-33`).
   - Exact casing: `revision`, `requirements`, `key`, `title`, `text`.
2. **Runner, chat hop only:** before the claude process starts, `api.requirements(projectId)`; the block below is **appended to the hop's system-prompt file** (the skills file; created with the block alone when the worker has no skills). Not in argv: n × 4000 Thai characters can pass Linux's single-argument limit (MAX_ARG_STRLEN 128 KiB) — `inferred` from the kernel limit, not measured here.
   ```
   # The spec's requirements (Blueprint revision {revision}) — they bind the whole project

   ## REQ-001 — {title}
   {text}

   ## REQ-002 — {title}
   {text}
   ```
   `{text}` verbatim. No requirement → no block. The read fails (502/404) → the block is the one line `# The spec's requirements could not be read just now (Blueprint did not answer).`, one log line, and the hop goes on (its `locate` meets the same outage and the worker replies with what blocks it — `prompt.ts:122`).
3. **Chat prompt** (`buildChatPrompt`) gains, after step 2:
   `2b. The spec's requirements are in your system prompt (\`# The spec's requirements\`). Propose cards so that every requirement that asks for work is taken up by a card anchored on its key — a requirement key may be an anchor even when \`locate\` did not return it.`
   and step 3's "only for parts `locate` returned" reads "only for parts `locate` returned or requirement keys from your system prompt".
4. **Proposals:** `check()` (`proposals/service.ts:53-56`) still refuses a not-located key **before** any Blueprint call — except a key starting `REQ-` (Blueprint's requirement prefix, `registry.ts:86`): such a key goes on to `checkAnchors` (it reads it anyway), and is accepted only if that read's `part.kind === "requirement"`; otherwise 422 `anchor_not_located` as today, with the same `details.keys`. A located key: unchanged.
- `[SA-decided]` why a CAW route and a file, not `chat_context`: AC-2's check is "the prompt the stub received" — a stub calls no MCP tool; and `chat_context`'s key list is pinned (`test/mcp/chat-tools.test.ts:58`), so it stays as it is.

## D3 — coverage lists requirements no card takes up (REQ-118 req 3, AC-3; PM's Q1 answer)
`coverage.ts`: after the decisions, every part of the current spec (`spec.parts`, already read at `:32`) with `kind === "requirement"` whose key is **not** in `anchors` (work cards any status + the proposal's items, `:30`) is uncovered, listed under itself:
`{ "key": "REQ-002", "kind": "requirement", "title": "…", "decisions": ["REQ-002"] }` — the shape of a decision that covers nothing (`:5,55`). Sorted with the rest by key. Seen in a context ≠ taken up (PM's Q1). A removed requirement is not in `spec.parts` → not listed.
Shape unchanged (`Uncovered`), so no front change: the board/proposal line is the REQ-112 sentence with key + title (`caw-front → src/components/Uncovered.tsx:5-16`, `words.ts:169-172`).

## D4 — an edited requirement reaches the next hop (REQ-118 AC-4)
- Text: every `card_context` read and every hop pin is a live read of the current spec (`latest.ts:32`, `hops.ts:47`) — the next hop sees the edit; a running hop keeps its pin. No code.
- Flag: `pull.ts:83` — a change set whose `added`, `changed` or `removed` holds a key starting `REQ-` flags **every** card with `anchorRevision < rev` (not only the cards anchored on it), because that requirement is in every card's context now (SPEC-115 AC map, AC-4). Show-only (REQ-105 D7), nothing stops. `card.anchor_removed` / `restored` stay per anchor key (unchanged).

## Consumers (`grep -rn … src test`, caw-back + caw-front, 2026-10-30)
- **Probe still owed (ORDER 45, `spec-rules.md` §1):** this list is grep-only (cut before the rule). Before TASK-149/150 are released, I run `tools/probe-change.sh caw-back <patch>` on the tree with REQ-119 committed (same files, F-013) and paste the `Consumers (probe):` lines into each shape-changing section the gate flags, each hit ticked to a TASK. (Silver, 2026-10-30 16:3x)
  REQ-119 r1 is committed (caw-back `7956aa7`). The patch is ready: `tests/harness/spec117-probe.patch` (made from `7956aa7` in a scratch copy: runner `api.requirements`, the new route + `RequirementsSchema` in `routes/projects.ts`, the prompt line 2, the six skills' line 5). It runs once TASK-151 (Bob, `main.ts` + `main.test.ts` only, no file shared with this SPEC) is at REVIEW, so the tree is not changing under the probe (exit 4). (Silver, 16:4x)
- `buildPrompt|buildChatPrompt` → `src/runner/prompt.ts`, `src/runner/hop.ts:326`, `src/runner/prompt.test.ts` (TASK-149).
- `Before you ask the operator` → `skills/role-{ba,be,fe,pm,qa,sa}/SKILL.md:5` (TASK-149); `prompt.test.ts` / `hop.test.ts` assertions on the skill text → TASK-149 updates any that pin it.
- `anchor_not_located` → `src/proposals/service.ts:56`, `test/http/proposals.test.ts`, `test/mcp/chat-tools.test.ts` (kept green; one new case each way).
- `uncovered` → `src/projects/coverage.ts`, `test/http/coverage.test.ts`, `src/runner/hop.test.ts` (words only) · front `Uncovered.tsx`, `chat/Chat.tsx`, `Board.tsx`, `app/p/[id]/page.tsx`, `api/caw.ts`, `api/mock.ts` — read `key`/`title` only → untouched.
- `spec.revised|cardIds` → `src/follow/pull.ts`, `test/follow/pull.test.ts` (TASK-149).
- New route → `src/http/routes/projects.ts`, `openapi.json`, `src/runner/api.ts` · front `schema.d.ts` (TASK-150 gen:api; the front calls nothing new).

## AC map (REQ-118, Team B)
| AC | Where |
|---|---|
| AC-1 card context holds all 8, two anchors | SPEC-115 TASK-145 (Team A) + D1 prompt line — TASK-149; joint check after TASK-145 committed |
| AC-2 entry chat prompt holds all 8 | D2 — TASK-149 (stub test reads the system-prompt file) |
| AC-3 uncovered requirements listed | D3 — TASK-149 |
| AC-4 edited requirement seen by the next hop | D4 — TASK-149 (pull test + context after edit, fake Blueprint) |
| AC-5 regression | TASK-149 full suite; TASK-150 typecheck/tests/schema match |
| AC-6 live | REQ-108 phase 3 (QA) — no TASK |

## Risks / unknowns
- R1 — a big requirement set enlarges every card's context and the chat's system prompt (SPEC-115 R1). Accepted (owner the only user).
- R2 — `REQ-` as "might be a requirement" is a prefix test only to decide whether to *read*; acceptance is the read's `kind`. If Blueprint ever gives another kind the `REQ` prefix, nothing wrong is accepted.
- R3 — until TASK-145 is committed, `spec.requirements` is absent: D1's prompt line names a field that is not there (harmless) and AC-1 cannot pass. TASK-149's own tests use a fake Blueprint that sends `requirements`.

## Order (F-013)
TASK-149 depends on **REQ-119 committed** in caw-back (same files: `prompt.ts`, `hop.ts`, `runner/api.ts`, `openapi.json`); TASK-150 on TASK-149's `openapi.json` and **REQ-119 front committed** (`schema.d.ts`). The joint QA run needs Team A's TASK-145 committed too.

## Tasks
- TASK-149: caw-back — requirements route, chat system-prompt block, requirement anchors, coverage, pull flag, prompt + skills line — owner: BE Bob (depends on: REQ-119 committed)
- TASK-150: caw-front — gen:api for the requirements route — owner: FE Fanta (depends on: TASK-149 `openapi.json` · REQ-119 front committed)

## Questions
- none for the PM — Q1 (REQ-118) answered 15:4x and carried in D3; D1 carries the PM's "required" line.
