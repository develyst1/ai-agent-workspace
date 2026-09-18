# TASK-024: Knowledge loader + generated `PROJECTS.md` + the three-step chain (on the stub — NO real call)
- Source: SPEC-007
- Status: DONE (2026-09-13, Sober)
- Depends on: none (SPEC-006's `back/` is `DONE`; TASK-022/023 untouched by this)
- Owner: Fern (FE)

## What to do

All in `back/` of `portfolio-nichaphon-web`. **Zero requests to `https://ai.develyst.online`** —
run everything with `GATEWAY_BASE_URL` pointed at the stub or a dead port. No ledger row exists
for REQ-007 (Q49 unset), so there is nothing to spend. No WebSocket in this task (that is
TASK-025). Nothing in `front/` is edited **except** that `projects.ts` is *read* by the generator.

1. **Config.** Add `KNOWLEDGE_DIR` to `src/config.ts` (default: `<back>/knowledge`, resolved
   from the module's own location so `bun run dev` from `back/` and `bun test` agree). Document
   it in `back/README.md`'s env table.
2. **Generator `scripts/build-projects-md.ts`** (`bun run build:projects` in `package.json`):
   imports `../../front/src/constant/content/projects.ts` and writes `knowledge/PROJECTS.md`:
   a one-line header stating it is generated and from where, then per entry
   `## <title>` · `id: <id>` · `link: <link or "none">` · the summary paragraph · `Highlights:`
   as `- ` bullets · `Tech stack: a, b, c`. Deterministic byte-for-byte output, LF or CRLF —
   pick one and keep it (the drift test compares bytes). **Commit the generated file** (git write
   is the human's; you leave it on disk). Do not create `knowledge/PROFILE.md` — that is
   TASK-021's, on the owner's approval.
3. **Loader `src/knowledge/load.ts`** — `loadKnowledge(dir)` per SPEC-007 §Knowledge loader.
   Missing file → listed in `missing`, one `console.warn` at start, no crash. `GET /health`
   gains `knowledge: { profile: boolean, projects: boolean }`.
4. **Fixture `test/fixtures/knowledge/`**: `PROFILE.md` whose first line is
   `FIXTURE — not a real person — test data only`, 20–40 lines of obviously fictional profile
   prose with headings (name it something that cannot be mistaken for the owner); `PROJECTS.md`
   = a copy of the generated one (real, approved copy — fine to use).
5. **Chain `src/chain/`** — transport-free (imports nothing from `hono`):
   - `types.ts` — `StepName`, `Step1Result`, `Step2Result`, `Match`, `ChainEvent` (the
     server→client frames from SPEC-007 §Frames minus `accepted`/`done`, which the WS layer
     adds), `ChainError { kind, at_step, detail }` where `kind` = `GatewayFailureKind |
     "step_malformed" | "knowledge_missing"`.
   - `prompts.ts` — three system prompts, **first line exactly `STEP: understand` /
     `STEP: match` / `STEP: answer`**, wording yours within SPEC-007 §Step contracts and the
     hard rules there. Q50: the step-3 prompt takes the language from `answerLanguage()`.
   - `language.ts` — `answerLanguage()` per SPEC-007 D7, Q50 quoted in a comment above it.
   - `parse.ts` — tolerant JSON extraction (strip ``` fences, take the first `{`…`}` block),
     schema checks for steps 1–2 (unknown keys ignored, wrong types → malformed).
   - `verify.ts` — `verifyExcerpts(matches, knowledge)` → `{ kept, dropped }`: keep a match
     only if its `excerpt`, whitespace-normalised, is a substring of the named file,
     whitespace-normalised. Pure, unit-tested.
   - `run.ts` — `runChain(question, { knowledge, ask = askGateway }, onEvent, signal)`:
     the Flow in SPEC-007 §Flow 2–5 and D3/D4 (one retry on malformed). Emits `step
     started/done` and `answer`, throws `ChainError`. Builds citations from `kept` only
     (`href`: profile → `/about`, projects → `/portfolio`). `coverage` becomes `none` when
     zero excerpts survive. Off-topic → `answer` with a fixed server-side boundary sentence
     (put it in `src/chain/copy.ts`; it is UI copy, not a fact about him) and `citations: []`.
     Logging per SPEC-007 §Flow 7 — never content.
6. **Stub (`test/stub-gateway.ts`) grows step-awareness** per SPEC-007 D10: in mode `ok`, if
   `messages[0].content` starts with `STEP: `, reply with the canned body for that step; the
   scenario markers (`stub:none`, `stub:offtopic`, `stub:malformed`, `stub:fail@2`, `stub:slow`)
   are read from the **last user message**. The canned step-2 excerpts must be verbatim lines
   from `test/fixtures/knowledge/PROFILE.md` and `PROJECTS.md` so `verifyExcerpts` keeps them;
   add one deliberately non-verbatim excerpt so `dropped` is exercised. Existing SPEC-006 tests
   must still pass unchanged.
7. **Tests `test/chain.test.ts`** (stub in-process, `KNOWLEDGE_DIR` → fixtures), each named:
   happy path emits `step 1,2,3 started/done` then `answer` with ≥ 1 citation whose `excerpt`
   is in the fixture and `calls === 3` · off-topic → exactly 1 call, `coverage: "offtopic"` ·
   `stub:none` → `coverage: "none"`, `citations: []`, answer text mentions not covered ·
   `stub:malformed` → step 1 retried once then `ChainError step_malformed at_step 1` ·
   `stub:fail@2` → `ChainError` with a SPEC-006 kind and `at_step: 2` · `dropped` counted ·
   `knowledge_missing` when `KNOWLEDGE_DIR` is empty · abort via `signal` stops before the next
   step. Plus `test/projects-md.test.ts`: regenerate into memory and compare bytes with the
   committed `knowledge/PROJECTS.md`.

## Definition of Done
- [ ] `cd back && bun test` — all green; the new tests above exist **by name**; SPEC-006's 18 still pass.
- [ ] `bun run build:projects` is idempotent (run twice, `git status` shows no change after the first).
- [ ] `knowledge/PROJECTS.md` has 11 `## ` sections, ids match `projects.ts` in order.
- [ ] `grep -rn "from \"hono" src/chain src/knowledge` → 0 hits.
- [ ] `grep -rn "ai.develyst.online" src` → `config.ts` only.
- [ ] `bunx tsc --noEmit` → 0 errors.
- [ ] Own run: stub on 3999 + `KNOWLEDGE_DIR` at fixtures → `GET /health` shows both `true`;
      with the real `knowledge/` dir → `profile:false, projects:true` and one warn line, no crash.
- [ ] Zero requests reached `https://ai.develyst.online` — state it in §Implementation Notes.
- [ ] Nothing under `front/` modified (`git status` shows `?? back/` only, or only `back/` paths).
- [ ] CRLF/LF: whichever you pick for the generated file, state it.

## Implementation Notes
(Fern, 2026-09-13)

**Zero requests reached `https://ai.develyst.online`.** Every test and every own run had
`GATEWAY_BASE_URL` pinned to the in-process/local stub; `.env` files were neither read nor
opened. REQ-007 ledger stays `0 / ?`; SPEC-006's stays 3 / 5.

### Files — all under `back/` (nothing under `front/` modified; `git status` = `?? back/` only)
New:
- `scripts/build-projects-md.ts` — `renderProjectsMd()` + `PROJECTS_MD_PATH`; `import.meta.main` writes the file.
- `knowledge/PROJECTS.md` — generated, 11 `## ` sections, ids in `projects.ts` order, **CRLF**.
- `src/knowledge/load.ts` — `loadKnowledge(dir = config.KNOWLEDGE_DIR)` → `{ profile?, projects?, missing }`, one `console.warn` naming missing files (names only).
- `src/chain/types.ts` · `copy.ts` (off-topic boundary sentence) · `language.ts` (`answerLanguage()` → `"English"`, Q50 quoted) · `prompts.ts` (3 system prompts, first lines `STEP: understand|match|answer`, + user-message builders) · `parse.ts` (`extractJson`, `parseStep1`, `parseStep2`) · `verify.ts` (`verifyExcerpts`, `normalise`) · `log.ts` (§Flow 7 lines) · `run.ts` (`runChain`).
- `test/fixtures/knowledge/PROFILE.md` — 37 lines, first line `FIXTURE — not a real person — test data only`, subject "Zed Fixtureworth" at the "Fictional Testing Bureau"; `PROJECTS.md` = byte copy of the generated one.
- `test/chain.test.ts` (11 tests) · `test/projects-md.test.ts` (2 tests).
Edited:
- `src/config.ts` — `KNOWLEDGE_DIR` getter; default `resolve(import.meta.dir, "..", "knowledge")`.
- `src/index.ts` — `export const knowledge = loadKnowledge()` at start; `GET /health` gains `knowledge: { profile, projects }`. `POST /ask` untouched.
- `test/stub-gateway.ts` — step-aware in mode `ok` (D10): routes on `messages[0].content` first line; markers `stub:offtopic|malformed|none|fail@2|slow` read from the **last user message**; canned step-2 excerpts = 2 verbatim fixture lines + 1 deliberately non-verbatim; `Stub` gains `calls` / `resetCalls()`. Non-`STEP:` requests → the call-2 body as before.
- `tsconfig.json` — `include` + `scripts/**/*`; `paths: { "@/*": ["../front/src/*"] }` so tsc resolves `projects.ts`'s `import type '@/types/app/content'` (no `baseUrl` — removed in this tsc, TS5102).
- `package.json` — `"build:projects": "bun run scripts/build-projects-md.ts"`.
- `README.md` — env row, "Knowledge + the three-step chain" section, stub markers, tests paragraph.
Untouched: `src/gateway/*`, `src/limits.ts`, `test/ask.test.ts`, `test/classify.test.ts`.

### Design notes Sober should know
- `ChainEvent` = `step started` | `step done` | `answer`. `runChain` **throws** `ChainError { kind, at_step, detail, status? }`; the WS layer (TASK-025) turns that into the `error` frame + `done`. `at_step: 0` = before any call (`knowledge_missing`).
- Abort between steps → `ChainError("timeout", <next step>, "aborted by caller…")` — same kind SPEC-006 uses for our own aborts; nothing is sent to a closed socket anyway.
- Step-2 `done.result` = `{ coverage, matches: kept, dropped }`; `coverage` is forced to `none` when zero excerpts survive. Step-3 `done.result` = `{ text_len }`.
- Stub trick: the canned step-1 `intent` echoes the question, so a marker typed in the question also appears in step 2's user text (which otherwise carries no question). Markers are still read from the last user message only.
- Prompts make no claim about the owner — every fact comes from the files passed in at run time.

### DoD evidence (2026-09-13)
- `cd back && bun test` → **31 pass, 0 fail, 136 expects, 4 files** (SPEC-006's 18 unchanged + 13 new, all named as in the task).
- `bun run build:projects` twice → sha256 `8ca00b1d…` before and after both runs (idempotent; whole `back/` is untracked so `git status` cannot show a per-file change — hash used instead).
- `knowledge/PROJECTS.md`: 11 `## ` sections; `id:` lines = `learning-curve, ong-match, dte-platform, develyst-web, laichill, crm-rag-chatbot, backend-optimisation, yodbarber, ai-voice-avatar, develyst-ai, r1-bev` (projects.ts order).
- `grep -rn 'from "hono' src/chain src/knowledge` → 0 hits.
- `grep -rn "ai.develyst.online" src` → `src/config.ts:48` only.
- `bunx tsc --noEmit` → exit 0.
- Own run, stub on 3999, back on 3001 (3000 never touched, all processes stopped after): `KNOWLEDGE_DIR=test/fixtures/knowledge` → `/health` `{"knowledge":{"profile":true,"projects":true}}`; default dir → `{"profile":false,"projects":true}` + exactly one line `[knowledge] missing: PROFILE.md — …`, no crash; `POST /ask` on the stub still 200.
- `git status` → `?? back/` only.
- Line endings: **CRLF** for `knowledge/PROJECTS.md` (and every new file, matching the rest of `back/`).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**FQ40 (non-blocking, Sober's call) — CRLF drift risk across machines.** The generator writes CRLF and the drift test compares bytes. This repo has `core.autocrlf=true` and no `.gitattributes`, so after the human commits, a checkout on a Linux box (or a machine with `autocrlf=false`) would yield LF and `test/projects-md.test.ts` would fail there while the content is identical. Options: (a) accept — this project builds on the owner's Windows machines; (b) the human adds `back/knowledge/PROJECTS.md -text` (or `eol=crlf`) to a `.gitattributes` — a repo-root file, not mine; (c) compare after `\r\n`→`\n` normalisation (weakens "bytes" to "content"). I did (a) and kept the DoD's byte compare; say the word for (c).
> answer (Sober, 2026-09-13): **(a) stands for this task — DONE is not held on it — and the guard becomes
> EOL-agnostic as TASK-025 step 0, test-side only, two lines.** The purpose of the drift test is
> *content* drift from `projects.ts`, not line endings; (b) would need a `.gitattributes` the human
> owns; and an LF checkout would also fail your second test's "has CRLF" assertion, so (c) on test 1
> alone is not enough. Generator unchanged (still CRLF); `knowledge/PROJECTS.md` unchanged. Exact
> change written in `tasks/TASK-025-…md` step 0.

**FQ41 (non-blocking) — `ChainEvent` excludes `error`.** The TASK says "frames minus `accepted`/`done`"; I read `error` as the WS layer's too, since the chain signals failure by throwing `ChainError` (kind + `at_step` + detail). If you want an `error` event emitted as well, it is one `onEvent` call in `run.ts`'s catch.
> answer (Sober, 2026-09-13): **Your reading is the SPEC's — no `error` event.** D2/D9: the chain throws
> `ChainError { kind, at_step, detail, status? }`; the WS layer (TASK-025 step 2) maps it to the
> `error` frame + `done`, and the `detail` goes to the log only. Do not add the `onEvent` call.

## Review
(Sober, 2026-09-13) — **Verdict: DONE.**

**Zero requests reached `https://ai.develyst.online` in this review** — every command below ran with
`GATEWAY_BASE_URL=http://127.0.0.1:9` (dead port) or the local stub; no `.env*` exists or was opened.
REQ-007 ledger stays `0 / ?`; SPEC-006's 3 / 5 untouched.

Read every new/edited file under `back/` against SPEC-007 (D2–D8, D10, D13, §Step contracts, §Flow
2–5/7, §Knowledge loader), then re-ran every DoD line myself:
- `bun test` → **31 pass / 0 fail, 136 expects, 4 files**; the 11 chain tests + 2 drift tests exist by
  the names the task asked for; SPEC-006's 18 unchanged.
- `bunx tsc --noEmit` → 0. `from "hono` in `src/chain` + `src/knowledge` → 0 hits.
  `ai.develyst.online` in `src` → `config.ts:48` only; in `scripts` + `test` → 0.
- `bun run build:projects` twice → sha256 `8ca00b1d…` before, after run 1 and after run 2 (idempotent).
- `knowledge/PROJECTS.md`: 11 `## ` sections; `id:` order = `projects.ts` order (both lists printed,
  identical); `cmp` with the fixture copy → identical; CRLF by bytes (CR count = LF count = 153) — the
  same holds for every new file.
- Own run, stub on 3999, back on **3011** (3001/3000 untouched): fixtures → `/health` `profile:true,
  projects:true`; real dir → `profile:false, projects:true` + exactly one `[knowledge] missing:
  PROFILE.md` line, no crash; `POST /ask` on the stub still 200 deepseek/deepseek-flash. All my
  processes killed, both ports free after.
- `git status` → `?? back/` only; `front/` untouched; `projects.ts` has one `import type` only, erased.

Design points checked and accepted:
- Chain is transport-free; one `askGateway` per step with SPEC temps/max_tokens (0/0/0.2, 256/1024/512);
  off-topic ends after step 1 with `calls: 1`; D4 retry is exactly one, same messages; `ChainError`
  carries `at_step` (0 = `knowledge_missing`, before any call).
- D6 holds: citations built only from `kept`; `dropped` in the step-2 result; `coverage` forced `none`
  when nothing survives; step 3 receives verified excerpts only, `(no verified excerpts)` otherwise.
- Prompts make no claim about the owner; fixture profile is fictional and labelled on line 1 (37 lines).
- Logs: kinds/lengths/tokens only — verified in the test output; the gateway `detail` in the fail line
  is SPEC-006 D9's allowance.
- Two tolerances noted without objection (real-model behaviour is TASK-027's to observe): a single
  malformed match in step 2 rejects the whole step (retry, then `step_malformed`) rather than dropping
  that match; an empty step-3 reply is treated as malformed (retry, then `step_malformed` at step 3).
  Both are the stricter reading of D4 and cost at most one extra call.
- FQ40 → answered above: (a) stands; the EOL-agnostic guard is TASK-025 step 0. FQ41 → accepted as read.

**TASK-025 is unblocked.** Not touched by me: any code, TASK-021 (owner), Q49.
