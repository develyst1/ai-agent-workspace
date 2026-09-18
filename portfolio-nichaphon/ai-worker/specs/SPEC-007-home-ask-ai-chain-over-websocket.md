# SPEC-007: Home "ask the AI about me" — a three-step gateway chain over a real WebSocket
- Source: REQ-007
- Status: **DONE** (2026-09-13, Sober — TASK-024/025/026/027 all DONE; ledger `10 / 30` after TEST-009's 3 filled 2026-09-13, 20 unallocated; AC-a real-browser half + AC-d QA sample verified by TEST-009 `TEST_PASSED`)
- Builds on: SPEC-006 (`askGateway()`, `GatewayError`, the stub, `guard()`), SPEC-005 D1/D5
  (`back/knowledge/PROFILE.md`, and the eleven `projects.ts` entries as the second file)

## Overview

One visitor question on Home becomes **three ordered gateway calls**, each with its own job
(REQ-007 R2): **understand → match → answer**. The chain runs inside `back/`, in a pure
orchestrator that calls SPEC-006's `askGateway()` once per step, and reports each step to
the browser **as it completes** over a **real WebSocket** (owner-mandated, Q37b). The browser
paints the steps as they arrive (idea B), then the answer with citations (C), the
provider/model/latency badge per step (D), and honest text for every way the chain can fail
(G, H, R5). Nothing is stored (Q38/Q44, AC-f); the no-op cap point from SPEC-006 D8 is
called once per question from the WebSocket path too (R6).

Why this shape: the owner's own sentence — *"ใช้ llm gate ซ้อนกันหลายครั้งได้ เพื่อเป็น step
การคิด"* — **is** the architecture. The chain is not hidden behind one answer; it is what the
visitor watches. Everything that could invent a fact is fenced on the server: step 3 only
ever sees excerpts that step 2 quoted **and that the code verified are verbatim substrings
of the knowledge files** (D6). The LLM never writes a citation; the code does, from
verified excerpts. That is how AC-d becomes checkable rather than hoped for.

**Ledger: this SPEC's first three tasks fire ZERO real calls.** Every step, failure and picture is
produced against SPEC-006's stub, extended with step-aware replies (D10). The first real
chain run is TASK-027, `BLOCKED` until `PROFILE.md` exists (TASK-021) and TASK-026 is DONE.
**Q49 answered 2026-09-13: the budget is 30 real calls** (REQ-007 §Owner decisions) — the
ledger below reads `0 / 30`. Nobody fires at `https://ai.develyst.online` before TASK-027.

## Decisions this SPEC makes (SA's own, reversible, recorded)

- **D1 — Transport is Bun's native WebSocket via `createBunWebSocket` from `hono/bun`**, on
  the same `Bun.serve` as the HTTP routes (SPEC-006 D1 decided this; confirmed present in
  the installed `hono@4.13.7`). Route: `GET /ws` (upgrade). No fallback to HTTP streaming
  (owner's Q37b). `POST /ask` stays as-is for SPEC-006 (single call, dev placeholder).
- **D2 — The chain is a transport-free module `back/src/chain/`**, same rule as `askGateway`:
  imports nothing from `hono`; takes `(question, deps, onEvent, signal)`; the WS handler is
  its only production caller. Tests drive it directly against the stub.
- **D3 — Three steps, fixed order, one `askGateway` each; off-topic stops after step 1.**
  If step 1 says the question is not about the owner, the chain ends there with a stated
  boundary (idea G) — one paid call, not three. On-topic questions always run all three
  (AC-b). → **SQ37** (FYI to Porter, reversible).
- **D4 — Step outputs are JSON with a fixed schema (steps 1–2) or plain text (step 3).**
  Parsing is tolerant (code fences stripped, first `{…}` block taken). A step whose reply
  does not parse is retried **exactly once**; a second failure is the chain error
  `step_malformed`. Worst case per question: 5 calls; typical: 3.
- **D5 — Knowledge = exactly two files, loaded once at start, read-only.**
  `back/knowledge/PROFILE.md` (SPEC-005 D1 — content pending the owner, path fixed) and
  `back/knowledge/PROJECTS.md` (SPEC-005 D5). **PROJECTS.md is generated, not copy-pasted:**
  `back/scripts/build-projects-md.ts` imports `front/src/constant/content/projects.ts`
  (Bun runs TS; its only import is `import type`, erased) and writes one section per entry —
  title, id, summary, highlights, tech stack, link. A test regenerates and diffs, so drift
  from `projects.ts` fails `bun test`. Refines D5's "copy-paste" — zero hand-typed content.
  A missing file is a **startup warning + `knowledge_missing` answer**, never a crash
  (PROFILE.md lands only when TASK-021 runs).
- **D6 — Citations are built by code from verified excerpts, never by the LLM.** Step 2
  must quote excerpts verbatim; the chain keeps only those that are substrings of the
  loaded knowledge (whitespace-normalised). Unverifiable ones are dropped and counted
  (`dropped: n`, sent in the step-2 frame). Step 3 receives **only** verified excerpts.
  Citation link: `profile` → `/about`; `projects` → `/portfolio` (no deep-link exists on
  `/portfolio` today and building one is out of scope; the project title is shown as text).
- **D7 — Answer language is one function.** `back/src/chain/language.ts` exports
  `answerLanguage(detected: "th" | "en" | "other"): "English" | "Thai"` and today returns
  `"English"` unconditionally, with Q50 quoted above it. Step 1 still detects the visitor's
  language (cheap, informational, shown nowhere). Q50's one-word answer later = one line.
- **D8 — Intermediate results travel in the WebSocket frames, not the logs.** REQ-007 AC-b
  wants each step inspectable; SPEC-006 D9 forbids content in logs and AC-f forbids storing
  anything. So each `step` frame carries that step's parsed result, and the log line per
  step carries only kind/shape/lengths (`[chain] step=<n> ok provider=… tokens=… len=…`).
  → **SQ37** (FYI). QA inspects the chain by reading the frames (browser devtools or the
  `bun run ws-client` helper, D11).
- **D9 — Failure kinds over the WS = SPEC-006's six + three chain kinds**:
  `step_malformed` (D4) · `knowledge_missing` (D5) · `busy` (a second `ask` while one runs).
  Every error frame names `at_step`. The browser shows a short fixed sentence per kind and
  marks every step not `done` as `interrupted`. A half-finished chain is never shown as an
  answer (R5) — the answer area renders only on an `answer` frame.
- **D10 — The stub learns the steps.** SPEC-006's stub, default mode `ok`, inspects the
  first message: if it starts with `STEP: understand|match|answer`, it replies with a canned
  body for that step; otherwise the recorded call-2 body as before (SPEC-006 tests unchanged).
  Scenario markers in the **user** text drive the zero-cost demos (QA types them):
  `stub:none` → step 2 answers `coverage:"none"` · `stub:offtopic` → step 1 answers
  `about_owner:false` · `stub:malformed` → step 1 replies prose (twice → `step_malformed`) ·
  `stub:fail@2` → the `all_failed` 500 at step 2 · `stub:slow` → each step waits 2 s (for
  pictures). The stub's canned excerpts must be **verbatim lines from the fixture
  knowledge** so D6 verification passes on the stub.
- **D11 — The browser finds `back/` through one constant.** `front/src/constant/ask.ts`:
  `ASK_WS_URL = process.env.NEXT_PUBLIC_ASK_WS_URL ?? 'ws://localhost:3001/ws'`. Local only
  (Q43 default). This is the **`back/` URL, not the gateway URL** — AC-g's grep for
  `ai.develyst.online` in `front/.next` stays empty. Deploy-day facts → **SQ36**.
  A tiny CLI `back/scripts/ws-client.ts` (`bun run ws-client "<question>"`) prints every
  frame, so the chain can be inspected without a browser.
- **D12 — Placement and copy.** Q46 default: a new Home section **between `HomeHero` and
  `HomeStats`** (below the hero, nothing removed or re-ordered, hero untouched → AC-h). All
  visible strings live in `front/src/components/partials/Home/Ask.config.ts`; the two
  starter chips are the owner's own Q37 examples in Porter's English (REQ-007 idea A row);
  chips 3–6 → **SQ34**. Idea H ships as **H1** (no new claims): "the live AI is resting" +
  links to `/about`, `/portfolio`, `/contact`; pre-written chip answers (**H2**) are new copy
  about him and wait on his words → **SQ35**.
- **D13 — Prompts are server-side files** (`back/src/chain/prompts.ts`), never sent to the
  browser, never logged (AC-g). Their contract is fixed below; wording is Fern's within it.
  Every system prompt's first line is `STEP: <name>` (the stub's routing key, D10).
- **D14 — Budget discipline.** Every real call to the gateway still needs a ledger row
  **before** firing. SPEC-006's ledger is closed (3/5, REQ-006's); REQ-007's ledger is
  this file's §Call ledger — **opened 2026-09-13 at `0 / 30` (Q49 = 30, his word)**. Only
  TASK-027 may add rows; TASK-024/025/026 stay at zero by DoD.
- **D15 — AC-d reading for capability conclusions (added 2026-09-13 at TASK-027 review, FQ50).** A
  yes/no conclusion ("Yes, she can build X") counts as **backed** when every fact it rests on is a
  verified line of the two files and it introduces **no skill, client, date, number or name** absent
  from them; a "yes" about a skill or project the files do not name is **unbacked** and fails AC-d.
  Reversible, the owner's to overrule → **SQ38**.

## API / Interface Design

### WebSocket `GET /ws` — frames (JSON text, one object per frame)

Client → server:
| Frame | Rule |
|---|---|
| `{ "type": "ask", "question": string }` | Same validation as `POST /ask` (1–2000 chars, non-blank, no other key) → shared `validateQuestion()` extracted from `index.ts`. One chain per socket at a time; a second `ask` while running → `error busy`. |
| anything else | `{ "type": "error", "kind": "bad_request", "message" }` — socket stays open. |

Server → client, in order:
| Frame | When |
|---|---|
| `{ "type": "accepted", "id": string }` | after validation + `guard(clientKey)`; `id` is a per-question random id, never stored |
| `{ "type": "step", "step": 1\|2\|3, "name": "understand"\|"match"\|"answer", "status": "started" }` | before each `askGateway` |
| `{ "type": "step", …, "status": "done", "provider", "model", "latency_ms", "wall_ms", "usage"?, "retried": boolean, "result": <StepResult> }` | after each; `result` is the parsed output (D8) — step 3's `result` is `{ "text_len": n }` only (the text goes in `answer`) |
| `{ "type": "answer", "text": string, "coverage": "covered"\|"partial"\|"none"\|"offtopic", "citations": [{ "source": "profile"\|"projects", "ref": string, "excerpt": string, "href": "/about"\|"/portfolio" }], "calls": n }` | end of a successful chain (also after D3's off-topic stop, with `citations: []`) |
| `{ "type": "error", "kind": GatewayFailureKind \| "step_malformed" \| "knowledge_missing" \| "busy" \| "bad_request", "message": string, "at_step": 0\|1\|2\|3 }` | any failure; `message` is a fixed sentence per kind (extend SPEC-006's map); the gateway `detail` goes to the log only |
| `{ "type": "done" }` | last frame of every **accepted** question, success or error — `done` closes exactly one `accepted`. `busy` and `bad_request` are rejected **before** `accepted` and get **no** `done` (amended 2026-09-13 per TASK-025 FQ42: a `done` after `busy` would end the still-running chain in the browser's eyes) |

Socket close with a chain in flight → the chain's `AbortController` aborts; the in-flight
`askGateway` is cancelled (the gateway may still bill that attempt — SPEC-006 §Flow 6, stated
honestly). Nothing is sent to a closed socket.

### Step contracts (`back/src/chain/`)
| Step | Input to the model | Output schema (the contract; wording is Fern's) |
|---|---|---|
| 1 `understand` | the question only | `{ "about_owner": boolean, "language": "th"\|"en"\|"other", "intent": string ≤ 200 chars in English, "topics": string[] ≤ 6 }` |
| 2 `match` | `intent`, `topics`, **both knowledge files whole** | `{ "coverage": "covered"\|"partial"\|"none", "matches": [{ "source": "profile"\|"projects", "ref": string (nearest heading / project title), "excerpt": string verbatim ≤ 300 chars, "relevance": "strong"\|"weak" }] ≤ 6 }` |
| 3 `answer` | the question, `intent`, `coverage`, the **verified** excerpts only, `answerLanguage(language)` | plain text, ≤ ~120 words; when `coverage` is `none` or no excerpt survived, it must say the profile does not cover this and point to `/contact` — no guessing |

Hard prompt rules (all three): answer only from what is given; never add a skill, client,
date, number or name that is not in the given text; say "not covered" rather than infer.
`temperature: 0` for steps 1–2, `0.2` for step 3. `max_tokens`: 256 / 1024 / 512.

### Knowledge loader (`back/src/knowledge/load.ts`)
`loadKnowledge(dir = config.KNOWLEDGE_DIR)` → `{ profile?: string, projects?: string,
missing: string[] }`, read once at process start (`--hot` reloads on file change anyway).
New env `KNOWLEDGE_DIR` (default `back/knowledge`); tests point it at
`back/test/fixtures/knowledge/`, whose `PROFILE.md` is **explicitly fictional and labelled
so on its first line** ("FIXTURE — not a real person — test data only") and is never under
`back/knowledge/`. The fixture `PROJECTS.md` may be the real generated one (approved copy).

### HTTP
Unchanged from SPEC-006, plus `GET /health` gains `"knowledge": { "profile": boolean,
"projects": boolean }` (no content, no paths).

### Frontend (`front/`)
- `front/src/constant/ask.ts` — `ASK_WS_URL` (D11), `ASK_CONNECT_TIMEOUT_MS = 5000`.
- `front/src/components/partials/Home/Ask.config.ts` — every visible string: eyebrow, title,
  lead, input label/placeholder, the two chips, step labels ("Understanding the question",
  "Matching against the profile", "Writing the answer"), the badge format, per-kind failure
  sentences (client-side copies for the two WS-only failures: never opened, dropped), H1 text.
- `front/src/components/partials/Home/HomeAsk.tsx` (`'use client'`) + `HomeAsk.module.css`
  + a `useAskSocket()` hook in the same folder: opens the socket **on first submit, not on
  page load** (no connection cost for visitors who never ask), 5 s open timeout → "never
  opened" state; `onclose` mid-chain → "dropped" state; every step not `done` → interrupted.
  Renders: chips (click = submit) · input + button · a 3-row step timeline (idle / running /
  done with provider · model · ms / interrupted) · the answer with citation links · the H1
  panel on any failure. Built only from `GlassPanel`, `SectionHeading`, `TechChip`/`ChipRow`
  and Mantine core; no new colour/font/spacing literal (theme rule).

## Data Model
None. Nothing stored — no transcript, no counter, no file write, no cookie, no
`localStorage`. The knowledge files are read-only inputs. `guard(clientKey)` is called once
per `ask` frame (R6/AC-f): still a no-op, still the single named point.

## Flow
1. Visitor clicks a chip or submits → `useAskSocket` opens `ASK_WS_URL` (if not open) →
   sends `ask`. No open within 5 s → state `never_opened`, H1 panel, page otherwise intact.
2. `back/` validates → `guard` → `accepted` → step 1 `started` → `askGateway` → parse →
   `done` frame with the result. `about_owner:false` → `answer` (coverage `offtopic`, fixed
   boundary text from server config) → `done`. End.
3. Step 2 `started` → both files whole + intent → parse → verify excerpts (D6) → `done`
   frame (`result` includes `dropped`). Zero verified excerpts → treated as `coverage:none`.
4. Step 3 `started` → verified excerpts only → plain text → `done` → `answer` frame with
   code-built citations → `done`.
5. Any `GatewayError` at step n → `error {kind, at_step:n}` → `done`; socket stays open so
   the visitor can retry. `step_malformed` after the one retry → same path.
6. Socket drops mid-chain: server aborts the chain; client marks interrupted, shows the
   "dropped" sentence, offers retry. Nothing partial is presented as an answer.
7. Logs, one line per step and one per chain: `[chain] id=<id> step=<n> ok provider=<p>
   model=<m> tokens=<pt>/<ct>/<tt> latency_ms=<n> wall_ms=<n> retried=<0|1> len=<n>` and
   `[chain] id=<id> end coverage=<c> calls=<n> wall_ms=<n>` / `[chain] id=<id> fail
   kind=<k> at_step=<n> …`. Never the question, excerpts or answer text (D9).

## Non-functional
- No auth (none asked; Q35/Q38). Local only (Q43). Nothing deployed by the team.
- AC-g check, mechanical: after `cd front && npm run build`, `grep -r "ai.develyst.online"
  front/.next` and `grep -r "STEP: " front/.next` both empty; `grep -rn "ai.develyst.online"
  back/src` = `config.ts` only (unchanged from SPEC-006).
- Tests: `cd back && bun test` — chain happy path (3 calls, citations verified), off-topic
  (1 call), `none`, `step_malformed` after one retry, a gateway failure at step 2 mapped
  with `at_step:2`, PROJECTS.md drift guard, WS round-trip over a real socket (`Bun.serve`
  on port 0 + the global `WebSocket` client): frame order, `busy`, abort on close.
- Phone: AC-h — 360px; the hero above is untouched; the section must not push the hero's
  fold (the DEF-2 fix in TASK-013 is the baseline).
- Cost note for Porter/QA: with a real gateway one question ≈ 3 calls (max 5 with retries);
  step 2 carries both knowledge files in the prompt (~3–5k tokens) — that is the expensive
  step. Deliberate; the alternative (retrieval) is a database or an index, both deferred.

## Call ledger — REQ-007 (budget **30** real calls — Q49, the owner's word `Q49=30`, 2026-09-13)
Separate from REQ-006's 5 (3 spent, 2 unspent, their disposition his — SQ31). A row is written
**before** each fire; one chain question = 3 calls typical, 5 worst case (D4), counted per call,
not per question. Only Sober writes here (Fern's rows 1–7 were TASK-027's, on its authorisation; a QA
row is written by Sober on Porter's ask — Tanya never edits this file, her TEST file is the count's second
record). Chain calls aborted by a closed socket still count as fired (the gateway may bill them — §Frames).
| # | Date | Who | Request | Result | Running total |
|---|------|-----|---------|--------|---------------|
| — | — | — | **Budget set 2026-09-13. Nothing fired before TASK-027 (TASK-021 + TASK-026 DONE 2026-09-13); its plan caps this task at 12 calls.** | — | 0 / 30 |
| 1–3 | 2026-09-13 | Fern (TASK-027 Run A) | `bun run ws-client "Can you build a realtime site with WebSocket?"` — `back/` on defaults, real `knowledge/` — **planned 3 (max 5)**, row written BEFORE the fire | **actual 3** (steps 1/2/3, `retried:false` each) — all `deepseek / deepseek-flash`; tokens 224/56/280 · 3504/251/3755 · 388/87/475; `coverage:"covered"`, 5 citations, `calls:3`; frames verbatim in TASK-027 §Implementation Notes | 3 / 30 |
| 4–6 | 2026-09-13 | Fern (TASK-027 Run B) | `bun run ws-client "Have you worked with Kubernetes?"` — same `back/` process, defaults — **planned 3 (max 5)**, row written BEFORE the fire | **actual 3** (`retried:false` each) — all `deepseek / deepseek-flash`; tokens 219/48/267 · 3495/10/3505 · 199/35/234; step 2 `coverage:"none", matches:[]`; answer says not covered → `/contact`, `citations:[]`, `calls:3`; no Kubernetes claim | 6 / 30 |
| 7 | 2026-09-13 | Fern (TASK-027 Run C) | `bun run ws-client "What is the weather in Bangkok today?"` — same `back/` process, defaults — **planned 1 (max 2)**, row written BEFORE the fire | **actual 1** (`retried:false`) — `deepseek / deepseek-flash`; tokens 221/42/263; step 1 `about_owner:false` → chain stopped (D3); answer `coverage:"offtopic"`, `citations:[]`, `calls:1` | **7 / 30** |
| — | 2026-09-13 | Fern | **TASK-027 closed its firing at 7 of its 12-call cap** (planned 7, zero retries, zero errors). `back/` stopped, 3001 freed. Nothing else fired. **23 unallocated remain — Sober's word only.** | — | **7 / 30** |
| — | 2026-09-13 | Sober (TASK-027 review) | **Fired nothing in review** — frames + `back.log` are the evidence (diff-identical to `project-docs/fe-task027-2026-09-13/`, 7 `step ok` lines, 0 retries). SPEC-007 `DONE`. **23 remain; any further row here (QA's real-browser run, ~3–5 calls) is on Sober's written word, asked via Porter.** | — | **7 / 30** |
| **8–10** (reserve **11–12**) | 2026-09-13 | **Tanya (TEST-009)** — row written by Sober BEFORE the fire, on Porter's ask (`inbox/SA.md` 2026-09-13; brief = REQ-007 §Acceptance pass) | **ONE real-browser question of her own** — not Run A/B/C's, answerable from `back/knowledge/` (both files hers to read first) — `back/` on **defaults** (real `knowledge/`, `/health` `profile:true, projects:true` first), the built `front/` served locally, a real browser. **Planned 3, hard cap 5** (D4: the chain's own one-retry-per-step is the only retry; none by hand). Question text + clock time + planned count go in `tests/TEST-009-…md` BEFORE Ask is pressed; her count = the `back/` log's `calls=` line (0 if no `[chain]` line was written). **One press of Ask, once** — unreachable / quota / timeout / `step_malformed` / `dropped` is the result: record, stop, report; no second question, no re-press. | **actual 3** (rows 8–10; rows 11–12 unused → unallocated) — `TEST_PASSED`, `calls=3`, planned 3, cap 5, 0 retries, one press; question `What did you build for the robotic kiosk, and how long did it take?`; AC-d 6/6 backed, AC-g 0 hits — relayed by Porter (`inbox/SA.md` 2026-09-13), second record = tests/TEST-009-…md | **10 / 30** |
| — | 2026-09-13 | Sober | **Allocation: 5 of the 23 unallocated are TEST-009's (ceiling row 12); 18 remain unallocated, Sober's word only.** Fired nothing writing this row. Any second QA question is a NEW row asked via Porter, not a re-use of this one. | — | **7 / 30** (actuals pending) |
| — | 2026-09-13 | Sober (actuals fill) | **Rows 8–10 filled at 3 on Porter's relay; reserve 11–12 released.** Spent 10 (Fern 7 + Tanya 3), 0 retries, 0 errors across all ten. **20 unallocated remain — Sober's word only**, any further row asked via Porter. Fired nothing writing this row. | — | **10 / 30** |

## Tasks
- TASK-024: Knowledge loader + generated `PROJECTS.md` + the three-step chain, on the stub (depends on: —) — **DONE 2026-09-13**
- TASK-025: `GET /ws` — the real WebSocket over the chain, frames, abort, `busy`, tests (depends on: TASK-024 `DONE`) — **DONE 2026-09-13**
- TASK-026: Home "Ask" section — chips, live steps, answer + citations, badge, the three failure pictures, phone (depends on: TASK-025 `DONE` — met) — **DONE 2026-09-13**
- TASK-027: The first real chain runs + REQ-007 AC checklist (depends on: TASK-026 `DONE`, TASK-021 `DONE` — both met 2026-09-13) — **DONE 2026-09-13** — 7 real calls (A 3 · B 3 · C 1), 0 retries, AC-d 7/7 + "Yes." backed (D15); §Review in the TASK

## Questions

**SQ34 (to Porter → owner, NON-blocking, default written) — starter chips 3–6.** Idea A said
4–6 chips; only two questions are his own words (Q37). Default until he answers: **the two
ship**, in Porter's English from the REQ ("Can you build a realtime site with WebSocket?",
"Which databases have you worked with?"). Four candidates he can tick, each grounded in an
already-approved `projects.ts` entry so the profile can answer them: "Have you built a RAG
chatbot?" (crm-rag-chatbot) · "What have you shipped with Bun and Hono?" (ong-match) ·
"Have you worked with NestJS, Prisma and PostgreSQL?" (learning-curve) · "What did the robotic
kiosk project involve?" (ai-voice-avatar / Home lead). Chips are a config array — adding one
later is one line.

**SQ35 (to Porter → owner, NON-blocking) — idea H's pre-written chip answers are new copy
about him.** H as approved says the chips "still answer from pre-written text" when the live
AI cannot. Those sentences are claims about a real person and need his words (PROTOCOL). This
round ships **H1**: honest "the live AI is resting" + links to `/about`, `/portfolio`,
`/contact` — no new claim. **H2** (one approved answer per chip) can ride on the REQ-005
sheet's next round or come as its own line; it is a config-only change when it lands.

**SQ36 (to Porter, FYI for deploy day — rides with Q43) — three facts the droplet will
need.** (a) the browser reaches `back/` via `NEXT_PUBLIC_ASK_WS_URL` at **build** time (a
static bundle bakes it; default is `ws://localhost:3001/ws`, i.e. local only); (b) nginx needs
the upgrade headers on `/ws` (already named in REQ-006 Q43); (c) over HTTPS the value must be
`wss://…` — browsers block `ws://` from an `https://` page. Nothing here is the team's to do.

**SQ37 (to Porter, FYI, two reversible SA calls).** (a) **Off-topic stops after step 1** (D3):
one paid call instead of three, and the boundary is stated (idea G) — if the owner wants all
three steps to run on every question for the demo's sake, that is a one-line change. **Rides with (a),
added 2026-09-13 (TASK-026 FQ46):** on an off-topic stop the Home timeline shows steps 2–3 as "Waiting" (true —
they never started); a `skipped` label is a one-string polish that only exists if (a) stays as is.
(b) **The chain's intermediate results travel in the WebSocket frames, not the logs** (D8):
AC-b's "recorded in a log or the response" is met by the response, because SPEC-006 D9 and
AC-f forbid content in logs and storage. QA reads frames (`bun run ws-client`).

**SQ38 (to Porter → owner, NON-blocking, default written) — is a capability "Yes" a backed claim?** Run A's
real answer opens "Yes." to his own example question (WebSocket). SA reads it as backed (D15: every fact under it is a
verified line — YodBarber, J:102/105/110 — and nothing new is named). **If the owner would rather the AI never say
"yes/no" and only state the evidence, that is a one-line step-3 prompt rule plus one paid re-run (3 calls) on SA's
ledger row.** (b) FYI, same run set: the `none` answer says "the owner" ("whether the owner has worked with it") — a
prompt echo, true but not the site's voice; if he wants "Nichaphon"/"she", it rides on QA's real-browser run, no
extra calls. Full text: TASK-027 §Questions FQ50 / FQ51.

**~~Q49 stands~~ — ANSWERED 2026-09-13: 30 real calls** (REQ-007 §Owner decisions; ledger above `0 / 30`).
TASK-024/025/026 spend nothing; TASK-027 now waits on `PROFILE.md` (TASK-021) and TASK-026 only.

(Fern asks below; Sober answers as `> answer: ...`)
