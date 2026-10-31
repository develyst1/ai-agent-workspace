# SPEC-009: Home "Ask the AI" — answer in the visitor's language, as him, with plain sources; find the step-2 failure
- Source: REQ-009 (R1–R4, AC-a…f)
- Status: **DONE** (2026-11-01, Sober — TASK-029/030/031 all DONE; ledger `10 / 30`, QA row 11–25 written; R2 fix UNPROVEN until QA's AC-c re-run)
- Builds on: SPEC-007 (the chain, D4/D6/D7/D13, §Step contracts, §Call ledger pattern)
- Read 2026-11-01, repo `portfolio-nichaphon-web`, branch `D1`, HEAD `b068fba`, tree clean: `back/src/chain/{language,prompts,parse,verify,run,copy,log,types}.ts`,
  `back/src/gateway/{ask,types}.ts`, `back/test/{stub-gateway,chain.test}.ts`, `front/src/components/partials/Home/HomeAsk.tsx:116`.
  Base suite: `cd back && bun test` → `45 pass / 0 fail / 178 expect() calls / Ran 45 tests across 6 files`; `bunx tsc --noEmit` → exit 0.

## Overview

Four small changes inside `back/src/chain/`, one diagnostic, and a paid reproduction — in that order.

- **R1 (language)** is SPEC-007 D7's promised one-line change, made safer: the answer language is decided **by code from
  the question's characters**, not by the model's step-1 guess (free, deterministic, testable on the stub).
- **R3 (voice)** and the Thai self-reference are prompt lines in step 3 only.
- **R4 (plain sources)** is a code-side display clean of each citation, done **after** D6 verification (verification
  keeps using the raw file text, so nothing unverified can slip in).
- **R2 (step-2 failure)** is **not fixed by reading.** What the code shows: a step whose reply does not parse is retried
  once, then `step_malformed` (SPEC-007 D4) — which is the sentence Porter saw. *Why* step 2's reply did not parse is
  unknown, and today's log cannot tell: a malformed attempt logs nothing but `len=` of the second reply. So TASK-029
  adds a content-free reason to the log, and TASK-030 reproduces on the real gateway with that log on. The fix is cut
  from that evidence (reproduce-first §4). Hypotheses below are hypotheses.

## Decisions this SPEC makes (SA's own, reversible, recorded)

- **D1 — Language by code.** New `detectLanguage(question): "th" | "en" | "other"` in `back/src/chain/language.ts`:
  any character in U+0E00–U+0E7F → `"th"` (so a Thai question with English tech words is Thai); else any ASCII letter
  → `"en"`; else `"other"`. `answerLanguage`: `th` → `"Thai"`, `en` → `"English"`, `other` → `"English"` (REQ-009 R1,
  `[PM-decided]` default). `run.ts` passes `answerLanguage(detectLanguage(question))` to step 3. Step 1's own
  `language` field stays in the schema and the frame (informational, unchanged contract). The Q50 comment is replaced
  by a pointer to REQ-009. *Interpreted REQ-009 R1 "the language the visitor asked in" as "the question's script".*
- **D2 — Voice: first person, no negative claims.** `step3System(language)` gains: answer as the owner, in the first
  person (English "I / my"); never describe "the profile", "the site", "the skills section" or "the owner" in the third
  person. **When coverage is `none` or no excerpt survived, the answer must NOT say "I have not done X"** — the files
  being silent is not evidence he lacks it; it says it is not something written here and points to `/contact`.
  For Thai: refer to himself as **ผม**, polite ending **ครับ** where natural (→ **SQ42**, default taken);
  product, company and technology names stay exactly as written in the excerpts (no transliteration).
- **D3 — Citations are displayed plain.** New pure `plainText(s)` in `back/src/chain/verify.ts`, applied in `run.ts`
  when building `citations` (both `ref` and `excerpt`), **after** `verifyExcerpts`. Removes: a leading list marker
  (`- `, `* `, `+ `, `1. `), leading `#`s, `**`, `__`, backticks, `[text](url)` → `text`; then whitespace-normalises.
  Single `*` / `_` inside words are left (they can be real characters). The step-2 `done` frame's `result.matches`
  stay **raw** (they are the verified evidence, SPEC-007 D8). Contract change: `answer.citations[].excerpt` is now
  *display text derived from a verified excerpt*, no longer byte-verbatim. Consumers (grepped 2026-11-01):
  `front/.../HomeAsk.tsx:116` and `useAskSocket.ts:32,105` (render + type check only — unchanged),
  `back/test/chain.test.ts:89` (`file` contains `c.excerpt` — still true on the fixture, which has 0 `**`).
  Example (the line Porter saw, `back/knowledge/PROFILE.md:89`): `- **Databases** — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite`
  → `Databases — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite`.
- **D4 — Say why a step reply was malformed (diagnostic, not a fix).** `parseStep1` / `parseStep2` return
  `{ ok: true, value } | { ok: false, reason }` with `reason` from a closed set: `no_json` (no `{…}` block) ·
  `bad_json` (JSON.parse threw) · `field:<name>` (top-level key missing/wrong type/value) · `match:<index>:<field>`
  (one entry of `matches` failed). Step 3's parse: `empty`. On **every** malformed attempt `callStep` logs one new line,
  content-free: `[chain] id=<id> step=<n> malformed attempt=<1|2> provider=<p> model=<m> tokens=<pt>/<ct>/<tt> len=<n> reason=<r>`.
  The `step_malformed` ChainError detail carries both attempts' reasons. **Behaviour is unchanged**: same one retry,
  same error, same frames, same calls count.
- **D5 — The stub learns a malformed step 2.** Marker `stub:malformed@2` → step 2 replies a JSON object cut off
  mid-string (both attempts) → `step_malformed` at `at_step:2`, log reasons `bad_json`. For tests and QA pictures only.
- **D6 — Off-topic answers stay English for now.** `OFFTOPIC_ANSWER` is visible copy; a Thai version is new copy the
  owner has not approved → **SQ43**, draft offered, nothing ships until his word. Step labels, failure sentences and the
  rest of the Ask UI stay English (REQ-009 §Out of Scope: the site is not translated).
- **D7 — Budget: REQ-009's own ledger, 30 calls** `[SA-decided under REQ-009 §Constraints, "the SA sets the call budget"]`,
  separate from REQ-007's ledger (its 20 unallocated stay untouched). Allocation below. His money, so his to overrule → **SQ41**.

## R2 — what is known, and the hypotheses (none is a cause)

Known (code, 2026-11-01): the visitor sentence *"The AI gave an answer this step could not read"* is the `step_malformed`
kind (D4 of SPEC-007) — two consecutive step-2 replies failed `parseStep2`. `parseStep2` is all-or-nothing: one bad
entry in `matches` fails the whole reply (`parse.ts:66-69`). Step 2 runs at `max_tokens: 1024` (`run.ts:39`); the gateway
answer carries no finish reason (`gateway/types.ts`), so truncation is visible only as `completion_tokens` at the cap.

| # | Hypothesis | Prediction TASK-030's log would show if true |
|---|---|---|
| H1 | Reply truncated at 1024 tokens (a broad question → 6 long excerpts; `grep -i "databas\|postgres"` hits 11 lines across both files, 2026-11-01) | `reason=bad_json` — or `no_json` if cut before any `}` (TASK-029 Fern note 2) — with `tokens=…/1024/…` (ct at or near the cap) |
| H2 | One `matches` entry off-schema (e.g. `relevance:"medium"`, `source:"PROFILE"`) | `reason=match:<i>:<field>` |
| H3 | Unescaped quote / control char copied inside an excerpt | `reason=bad_json`, `ct` well under 1024 |
| H4 | A fallback provider answered (gateway chain deepseek→xai→gemini→openai) and formats differently | `provider=` on the malformed line ≠ `deepseek` |
| H5 | Gateway/provider fault (empty or error-shaped content with 200) | `reason=no_json`, small `len` |

**TASK-030 result (2026-11-01, 10 real calls):** the two-in-a-row failure was **NOT REPRODUCED in 3 presses**; one step-2
attempt was malformed — `reason=bad_json` at `completion_tokens=1024` = the cap → **H1's prediction, H2–H5 ruled out for that
attempt.** Step-2 replies were 1032–1122 chars each, yet `completion_tokens` were 471 · 917 · 1024 · 796 → *inferred*: hidden
reasoning tokens share the budget (settled only if the gateway reported them). A visitor sees the error when two attempts in a row
hit the cap. **Cause status: hypothesis H1, strongly supported, not proven** — the fix is **UNPROVEN** until QA's databases
re-run (AC-c) shows no `malformed` line at the new cap.

**AC-c finding (Sober, 2026-11-01, after TEST-010):** at the new cap, 3 of 3 step-2 replies parsed (0 `malformed`), and
**2 of 3 used more than the old 1024** (ct 2273 and 1309) — under the old cap both would have been cut, i.e. malformed. The gateway
honours D8 (ct 2273 > 1024). Reading: **cause = step 2 running out of `max_tokens` (H1)**, consistent with every line seen across
TASK-030 and TEST-010 (7 step-2 replies). Limit of the claim: Porter's two-in-a-row was never reproduced, and 3 presses cannot
prove a rate — so "fixed" here means *the mechanism that produced it is gone*, not *measured at 0 %*. AC-c's alternative (a
provider fault) is not what the evidence shows. OBS-19 (FYI): a Thai answer took 15.6 s because step 2 wrote 2273 tokens for
892 characters — the hidden-reasoning reading again; speed is not a REQ-009 AC.

- **D8 — Headroom (TASK-031).** `max_tokens` per step: **1024 / 4096 / 1024** (was 256 / 1024 / 512, SPEC-007 §Step contracts).
  Billing is per token actually produced, so a higher cap costs nothing unless used; it only removes the cut. Step 1 and step 3
  are raised too — same model, same hidden-token risk (step 1 already used 118 of 256). Temperatures, retry count and every
  other rule unchanged. Overrules SPEC-007's three numbers only.

**DATA REQUEST (non-blocking, via Porter):** the owner's production `back/` log lines around the failure Porter saw on
2026-11-01 — every line starting `[chain]` with the same `id=` as a `fail kind=step_malformed at_step=2` line
(they hold no question or answer text, SPEC-007 §Flow 7). Today's code logs only the second reply's `len=` in `detail`;
that `len` alone weighs H1 (≈ 3,500+ chars) against H5 (tiny). It does not replace TASK-030.

## Flow (changed lines only)

Step 3 system prompt = `step3System(answerLanguage(detectLanguage(question)))`. Citations =
`kept.map(m => ({ source, ref: plainText(m.ref), excerpt: plainText(m.excerpt), href }))`; the same plain list is what
step 3 sees. Every malformed attempt → one `[chain] … malformed …` line. Nothing else in SPEC-007 §Flow changes.

## Non-functional

- Logs stay content-free (SPEC-006 D9): the new line carries kinds, counts and lengths only — no reply text.
- Zero real calls in TASK-029. Real calls only on a ledger row written by Sober **before** the fire.
- AC-g of REQ-007 unchanged: `grep -rn "ai.develyst.online" front/.next` → 0; `back/src` → `config.ts` only.

## Call ledger — REQ-009 (budget **30**, `[SA-decided]` D7 — the owner may change it, SQ41)

A row is written **before** each fire; counted per call (one question = 3 typical, 5 worst). Only Sober writes here.

| # | Date | Who | Request | Result | Running total |
|---|------|-----|---------|--------|---------------|
| — | 2026-11-01 | Sober | **Budget set at 30. Allocation: TASK-030 (reproduction) cap 15 · QA round (AC-a/b/c/d/e) cap 15, row written on Porter's ask after the R2 fix lands.** Nothing fired. | — | 0 / 30 |
| 1–15 | 2026-11-01 | Fern (TASK-030) — row written BEFORE any fire | `back/` local on **real** `knowledge/`, TASK-029 in the tree, `bun run ws-client "Which databases have you worked with?"` — **one press at a time, stop at the first `step_malformed`, max 3 presses**; planned 3 per press, hard cap 5 per press, 15 total | **actual 10** (presses 3 · 3 · 4; one step-2 retry on press 3) — all `deepseek / deepseek-flash`; NOT REPRODUCED in 3; `[chain]` lines in `../project-docs/fe-task030-2026-11-01/` | **10 / 30** |
| — | 2026-11-01 | Sober (TASK-030 review) | **Rows 11–15 released.** Spent 10. Fired nothing in review. **20 unallocated** — QA round row (cap 15) written on Porter's ask after TASK-031 is `DONE`. | — | **10 / 30** |
| **11–25** | 2026-11-01 | **Tanya (REQ-009 QA round)** — row written by Sober BEFORE any fire, at TASK-031 `DONE` (pre-written to save Porter a hop; his brief decides *what* she asks) | `back/` = the **working tree** on `D1` (TASK-029 + 031, uncommitted), on **defaults** (real `knowledge/`, `/health` both true first), the built `front/` served locally, a real browser. **⚠ Front/back port:** until SQ40 lands the front still defaults to `ws://localhost:3001/ws` and `back/` to 4014 — build `front/` with `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws` (a per-run env, not a code change; say it in the TEST file). **Questions, one press each, three only:** (1) a Thai question of hers about his work (AC-a) · (2) the chip "Can you build a realtime site with WebSocket?" (AC-b, AC-d, AC-e) · (3) the chip "Which databases have you worked with?" (AC-c re-run, AC-d, AC-e). **Planned 9, hard cap 15** (D4's retry is the only retry). Count = the `back/` log's `calls=`; also copy every `[chain] … step=2 …` line — **AC-c reads them: any `malformed` line, and the step-2 `completion_tokens`** (> 1024 proves the gateway honours D8). A technical failure is the result — record, stop, no re-press. | **actual 9** (rows 11–19; 3 · 3 · 3, 0 retries, 0 `malformed`) — TEST-010 `TEST_PASSED` 7/7, relayed by Porter 2026-11-01; step-2 ct **2273 · 426 · 1309**; second record = tests/TEST-010-…md | **19 / 30** |
| — | 2026-11-01 | Sober (actuals fill) | **Rows 20–25 released. Spent 19** (Fern 10 + Tanya 9). **11 unallocated, Sober's word only.** Fired nothing. | — | **19 / 30** |

## Tasks

- TASK-029: Language by code, first-person + Thai prompt lines, plain citations, malformed-reason log + `stub:malformed@2` — zero real calls (depends on: —)
- TASK-030: Reproduce the step-2 failure on the real gateway with D4's log on — ≤ 15 calls (depends on: TASK-029 `DONE`)
- TASK-029 **DONE 2026-11-01** · TASK-030 **DONE 2026-11-01** (10 calls, H1 shape seen once)
- TASK-031: Step `max_tokens` headroom 1024 / 4096 / 1024 (D8) — zero real calls (depends on: TASK-029 `DONE` — met) — **DONE 2026-11-01**

AC map: AC-a/b → TASK-029 (code) + QA · AC-c → TASK-030 + TASK-031 + QA · AC-d → TASK-029 D2 + QA · AC-e → TASK-029 D3 + QA · AC-f → this ledger.

## Questions

(Fern asks in the TASKs; SA notices to Porter continue at SQ41.)

**SQ41 (to Porter → owner, FYI, non-blocking) — REQ-009 budget.** REQ-009 §Constraints says the SA sets it, so it is set:
**30 calls** on its own ledger, REQ-007's 20 unallocated left alone. Plan: up to 15 to reproduce the step-2 failure, up to 15
for Tanya's round. Checked: REQ-007 Q49 (=30, REQ-007 only), Q38 (no cap on visitors — not this). If he wants a different
number or wants REQ-007's leftover 20 used instead: one line, nothing built changes.

**SQ42 (to Porter → owner, non-blocking, default taken) — how the AI says "I" in Thai.** Default (D2): **ผม** + **ครับ**,
from REQ-009 R3 "speaks as him". Checked: REQ-009 R3, PROFILE.md (no pronouns in it). Cases: English → "I"; Thai → ผม/ครับ;
the "not covered" answer → first person but never "I have not done X" (D2). If he wants a different Thai form, one prompt line.

**SQ43 (to Porter → owner, non-blocking) — the off-topic sentence in Thai.** Today a Thai off-topic question gets the English
boundary sentence (`copy.ts`). Default: **stays English** until he approves a Thai sentence. SA draft for him to accept or
rewrite `[SA-drafted, not approved]`: *"ผู้ช่วยนี้ตอบเฉพาะคำถามเกี่ยวกับผมครับ — ทักษะ ประสบการณ์ และผลงาน คำถามนี้อยู่นอกเรื่องที่ตอบได้ครับ"*.
On his word it is one constant + a language switch (a TASK then).
