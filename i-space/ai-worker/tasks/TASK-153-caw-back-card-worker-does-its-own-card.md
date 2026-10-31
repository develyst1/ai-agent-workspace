# TASK-153: caw-back — a card worker does its own card: rule 2 reworded, an other-cards line, rule 7; chat rule 3 gives a page to the FE
- Source: SPEC-119 D2 + D3 (REQ-121)
- Owner: BE (Bob, Team B)
- Status: DONE (2026-10-30 18:27, Silver — § Review)
- Depends on: REQ-120 committed (caw-back 3795236) ✓

## What to do

Read SPEC-119 § Overview, D2 and D3 first. Base: caw-back `atom` 3795236 (REQ-120's commit — the same content as
3efcc1a + TASK-152's 5 paths, where the bases below were run). No git. The SA's probed reference patch is
`i-space/ai-worker/tests/harness/spec121-back.patch` — it reads the cards and the chain one after the other; **this TASK
reads them together** (step 2).

**Closed file list — exactly these 5:** `src/runner/prompt.ts` · `src/runner/hop.ts` · `src/runner/prompt.test.ts` ·
`src/runner/hop.test.ts` · `src/runner/main.test.ts` — every path the DoD names is on it.

1. `src/runner/prompt.ts`
   - New exported type `PromptOtherCard = { number: number; title: string; assignee: string | null; status: string }`
     beside `PromptRecipient`; `buildPrompt`'s input gets `others?: PromptOtherCard[]` (default `[]`).
   - Rule 2 (`:24`) → exactly SPEC-119 D2.1's text; extend the comment above it with the REQ-121 line (as in the patch).
   - Right after rule 2, when `others.length > 0`, the line of SPEC-119 D2.2 exactly:
     `Other cards hold their own work — leave it to them, even if you could do it now: ` + items joined by `"; "` + `.`,
     each item `#<number> <title> (<assignee ?? "ยังไม่มีคนรับ">, <status>)`.
   - Rule 7 after rule 6, exactly SPEC-119 D2.3's text.
   - Chat rule 3 (`:137`): insert SPEC-119 D3's clause after "each with your estimate of `hops`" (exact text in the patch).
2. `src/runner/hop.ts` — `otherCardsOf(deps, projectId, cardId)` as in the patch (filter: `kind === "work"`, not this
   card, `status !== "done"`, by `number`; assignee = chain member `name roles.join(" + ")`, else `null`; on error log the
   line in SPEC-119 D2.2 and return `[]`). At the card-hop call (`:351`), compute `recipients` and `others` **together**:
   `const [recipients, others] = await Promise.all([recipientsOf(…), otherCardsOf(…)])` (and read the chain once if you
   like — your call, say which).
3. `src/runner/prompt.test.ts:22-26` — the rule-2 pin: rename to `rule 2 (REQ-121 SPEC-119 D2.1): only this card's work; requirements and rules bind how — right after card_context`, pin D2.1's text exactly, keep the `relatedDecisions` order check. Add tests: (a) with `others` [2 cards, one with `assignee: null`] the D2.2 line is present exactly, right after rule 2 and before rule 3; (b) with `others: []` (and omitted) no line; (c) rule 7 present exactly; (d) the chat prompt's rule 3 holds D3's clause.
4. `src/runner/hop.test.ts` — **AC-2 through the stub**, beside the AC-2 test at `:611`: a project with 4 cards — the
   hop's own card, one `todo` (assigned), one `done`, one question card (if your helpers make one cheaply; else say so) —
   run one card hop and read the prompt the stub got (`c.spawned[…].cmd[2]`, as at `:529`): it holds rule 2 (D2.1),
   rule 7, and the other-cards line with the `todo` card (and its holder), not the own card, not the `done` one, not
   the question. Plus: a `cards` read that throws → the hop still runs, no line, the log line present.
5. `src/runner/main.test.ts:80-91` (`a hop the runner is still running is not started a second time on the next tick`):
   SA's diagnosis with the reference patch: `Expected length: 1 · Received length: 0` — after three ticks without
   waiting, the hop had not spawned yet. Keep the test's point (no second start): tick until `w.spawned.length === 1`
   (bounded, e.g. ≤ 20 ticks with a short `await` between), then tick twice more and expect still `1`; the rest unchanged.
   If it passes unchanged once step 2's reads are concurrent, leave it and say so.

## Definition of Done
- [ ] 1. Before: `git status --short --untracked-files=all | wc -l` → `0` (base: `0` on `3795236`, SA 18:18)
- [ ] 2. `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test src/runner/prompt.test.ts` → `0 fail`, 50 tests or more (base: `46 pass · 0 fail · Ran 46 tests across 1 file`, SA 18:16 on 3efcc1a + TASK-152)
- [ ] 3. Same form, `src/runner/hop.test.ts` → `0 fail`, 117 tests or more, the AC-2 card test named (base: `115 pass · 0 fail · Ran 115 tests across 1 file`, SA 18:16)
- [ ] 4. Same form, `src/runner/main.test.ts` → `0 fail`, 63 tests (base: `63 pass · 0 fail · Ran 63 tests across 1 file`, SA 18:16)
- [ ] 5. `grep -c 'Other cards hold their own work\|7. If you find work that no card holds' src/runner/prompt.ts` → `2` (base: `0`, SA 18:16)
- [ ] 6. `bunx tsc --noEmit -p .` → exit `0` (base: `0`, SA 17:58 / 18:10 on the same content)
- [ ] 7. Whole suite, same env form, `--timeout 30000` → `0 fail` except the known `withReadGuard` (base: `916 pass · 1 skip · 1 fail`, SA 18:10)
- [ ] 8. `bun run openapi:emit` then `git diff --stat openapi.json` → no output (base: empty, SA 18:10)
- [ ] 9. After: `git status --short --untracked-files=all` → exactly the 5 closed-list paths, all ` M`; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new: the list is this TASK's)

## Implementation Notes
Built in `caw-back` on `3795236`, nothing committed by me. **4 of the 5 closed-list paths changed — `main.test.ts` is untouched** (step 5 allowed that: see below). Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed**
- `prompt.ts`: exported `PromptOtherCard`; `buildPrompt` takes `others?` (default `[]`); rule 2 = SPEC-119 D2.1 exactly (comment extended with the REQ-121 line); the D2.2 line right after rule 2 only when `others.length > 0` (`#<n> <title> (<assignee ?? "ยังไม่มีคนรับ">, <status>)` joined by `"; "`); rule 7 after rule 6, exact; chat rule 3 carries D3's clause after "each with your estimate of `hops`". Same text as the SA's patch (compared while applying).
- `hop.ts`: `otherCardsOf` (kind `work`, not this card, not `done`, by number; assignee = chain member `name roles.join(" + ")` else `null`; a failed read → the D2.2 log line and `[]`). The card-hop call does `const [recipients, others] = await Promise.all([recipientsOf(…), otherCardsOf(…)])` (a chat hop skips both).
- Tests: `prompt.test.ts` rule-2 pin renamed and pinned to D2.1 exactly (the `relatedDecisions` order check kept) + (a) D2.2 line exact, right after rule 2 and before rule 3, one holder `null` → `ยังไม่มีคนรับ` · (b) absent for `[]` and omitted · (c) rule 7 exact, the last line · (d) chat rule 3's D3 clause. `hop.test.ts`: the AC-2 card test and the throwing-`cards` test.

**Declared decisions**
1. Chain is read twice at a card hop — once by `recipientsOf`, once inside `otherCardsOf` — but both in the same `Promise.all` (the SA's patch shape); I did not merge them into one read. One round of reads, so timing is as asked.
2. The AC-2 test makes the question card with `POST …/question` from the running hop's worker (the world's hop is still running), so it needs no new helper.
3. `main.test.ts:80-91` **left unchanged**: with the reads concurrent it passes as it stands; I ran just that test 6 times (`-t "is not started a second time"`) → `1 pass · 0 fail` each time, and it passes in the whole suite. This is the "passes unchanged → leave it and say so" case of step 5, so DoD 9 shows 4 paths, not 5.

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all | wc -l` → `0` at start (HEAD `3795236`).
- DoD 2: `prompt.test.ts` → `50 pass · 0 fail · Ran 50 tests across 1 file` (base 46).
- DoD 3: `hop.test.ts` → `117 pass · 0 fail · Ran 117 tests across 1 file` (base 115); the AC-2 card test is named `REQ-121 AC-2: a card hop's prompt holds rule 2, rule 7 and the other-cards line …`. It checks rule 2 and rule 7 and the exact other-cards line `#2 another card (Blew BE, todo).`, and that the `done` card and the question card are absent.
- DoD 4: `main.test.ts` → `63 pass · 0 fail · Ran 63 tests across 1 file`.
- DoD 5: `grep -c 'Other cards hold their own work\|7. If you find work that no card holds' src/runner/prompt.ts` → `2`.
- DoD 6: `bunx tsc --noEmit -p .` → exit `0`.
- DoD 7: whole suite `--timeout 30000` → `922 pass · 1 skip · 1 fail · Ran 924 tests across 72 files`; the fail = the known `withReadGuard … PreToolUse hook` (`settings.test.ts`).
- DoD 8: `bun run openapi:emit` → `wrote …/openapi.json`; `git diff --stat openapi.json | wc -l` → `0`.
- DoD 9: `git status --short --untracked-files=all` → ` M src/runner/hop.test.ts`, ` M src/runner/hop.ts`, ` M src/runner/prompt.test.ts`, ` M src/runner/prompt.ts`; `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED:** no live hop (guardrail) — whether a real worker now leaves the other cards alone (REQ-121 AC-2 on TEST-106's shape, 8 cards) is QA's joint run. The FE/BE routing in chat rule 3 (D3) has no test beyond the exact sentence.

## Questions

## Review
**DONE** — Silver, 2026-10-30 18:27. Re-run by me on caw-back 3795236 + 4 paths (uncommitted):
- Scope: ` M` hop.ts, hop.test.ts, prompt.ts, prompt.test.ts — 4 of the 5 listed; `main.test.ts` untouched, as step 5 allows. `prompt.ts` is byte-identical to the probed patch's copy; `hop.ts` = the patch's `otherCardsOf` + the concurrent `Promise.all` at the card-hop call (step 2). Bob's two declared decisions (chain read twice inside one `Promise.all`; question card made with `POST …/question`) accepted.
- Timing (the `main.test.ts:89` consumer): `-t "is not started a second time"` run 15 times while the whole suite ran beside it → `pass 15 fail 0`. Bob's 6/6 + my 15/15 + the whole suite: left unchanged is right.
- DoD 2 prompt 50/0 · DoD 3 hop 117/0 (the REQ-121 AC-2 card test + the throwing-cards test read: own card, `done` card and question card absent, holder `Blew BE`, log line once) · DoD 5 grep → 2 (Bob) · DoD 6 tsc 0 · DoD 7 whole suite `922 pass · 1 skip · 1 fail · Ran 924 tests across 72 files`, the fail = known `withReadGuard` · DoD 8 `openapi.json` diff empty · DoD 9 `pgrep` 0.
- tree-fp at review: caw-back 3795236 fp `9ce8cc10134e`.
UNVERIFIED (QA's): AC-2 by reading the prompt the stub got in a joint run; AC-3 live (whether a real worker leaves the other cards' work alone); D3's page → FE routing has only its exact-sentence pin.
