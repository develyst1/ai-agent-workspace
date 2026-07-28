# TASK-013: AI notes summarization endpoint (OPTIONAL — "may also")
- Source: SPEC-003
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-012

## What to do
In `manager-gold-back`, reusing the TASK-012 AI Center client:
- `POST /api/people/:id/summary` — `getOwnedPerson` → 404. If the person's `notes` is empty/null
  → `400 {error:"validation", fields:{notes:"nothing to summarize"}}`. Else build a summarize
  prompt (system = "summarize these notes about a person into a concise profile summary"; user =
  `notes`), call the gateway, → `200 { summary:{content, provider, model} }`. Gateway failure → `502
  ai_unavailable` (same as TASK-012).

This is the optional "may also" tier of REQ-003 — build only if TASK-012 is in and the deadline allows.

## Definition of Done
- [x] `bun test` (gateway mocked): 200 summary for a person with notes; 400 when notes empty;
      gateway failure → 502; not-owned → 404.
- [x] No real AI call in tests.

## Implementation Notes
Implemented by Jason on 2026-07-28 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `11ed8a2`). Gateway mocked — no real AI call.

**Files changed:**
- `src/ai/advice.ts` (mod) — `buildSummaryMessages(notes)`: system = "Summarize these
  notes about a person into a concise profile summary. Keep it factual and specific to
  the notes provided — do not invent details."; user = the raw notes.
- `src/ai/routes.ts` (mod) — `POST /api/people/:id/summary`: `getOwnedPerson`→404;
  `notes` empty/null → `400 {error:"validation", fields:{notes:"nothing to summarize"}}`;
  else `callChat` (reused from TASK-012) → `200 {summary:{content,provider,model}}`;
  `AiUnavailableError` → `502 {error:"ai_unavailable"}`.
- `test/ai-summary.test.ts` (new) — 4 tests.

**Verification — `bun test` → 49 pass / 0 fail (178 assertions):**
- 200 summary; the outgoing request hit `http://ai-center.test/ai/chat` with the person's
  **notes as the user message**.
- empty/absent notes → 400 `{fields:{notes:"nothing to summarize"}}` **and no gateway call**.
- gateway `{success:false}` → 502 `ai_unavailable`.
- another user's person → 404 **and no gateway call** (isolation).

**Notes for review:**
- Reuses the exact TASK-012 client (`callChat`) — the one already **proven live** against the
  real gateway; the summary path only swaps the prompt, so no separate live call was needed
  (DoD is mocked-only). Lower `temperature` (0.3) + `maxTokens` (400) for a tight summary.
- Commit local on `dong` only (not pushed), per baseline §6/§7.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `11ed8a2` on `dong`). Read `ai/advice.ts`
(`buildSummaryMessages`), the `/summary` route in `ai/routes.ts`, and `test/ai-summary.test.ts`:
- `POST /api/people/:id/summary`: `getOwnedPerson`→404; trimmed `notes` empty/null → `400
  {fields:{notes:"nothing to summarize"}}` (no gateway call); else `callChat` (reused, temp 0.3 /
  maxTokens 400) → `200 {summary:{content,provider,model}}`; `AiUnavailableError` → `502 ai_unavailable`.
- Prompt: "factual and specific to the notes … do not invent details" — good guard against fabrication.
- Tests: 200 (notes sent as the user message to `{base}/chat`); 400 empty notes + no call; gateway
  failure → 502; other user → 404 + no call. 49 total pass; gateway mocked (no real call).
- Reuses the TASK-012 client already proven live — mocked-only DoD is correct here.

DoD: both met. → TASK-015 (note-summary UI) unblocked.
