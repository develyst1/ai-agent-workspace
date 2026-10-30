# TASK-110: blueprint-front — show "nothing saved" and "AI didn't answer in time" from the stored round reason
- Source: SPEC-105 (REQ-110, Team A)
- Owner: FE (Fern)
- Status: DONE (2026-10-29, Sober — see § Review). *(Hold lifted 15:3x: REQ-103 is committed in blueprint-front, `a52e022`.)*
- Depends on: **REQ-103 committed in blueprint-front (`a52e022`, 2026-10-29 15:2x, owner's "ขึ้น git")** · TASK-109 DoD 6 (openapi, landed 13:5x). *(Updated 14:4x per ORDER 42: the next topic waits for the previous topic's commit.)*
- Repo: `blueprint-front` (path: `machine.local.md`), branch `atom`, on top of TASK-108's tree. **No git write.**

The contract is SPEC-105 § Front. Wording: REQ-110 § User-facing wording, plus SPEC-105 Q2's reason words (accepted by the PM as written, 2026-10-29 — final). Invent no wording.

## Files (closed list — anything else → `## Questions` first)

- `src/features/chat/load.ts` (`:72` and wherever a bot row's text is chosen) · `src/features/chat/words.ts` · `src/features/chat/contract.ts` if the VM needs the reason
- `src/themes/luxury-gold/client/ChatDesk.tsx` (it reads `roundStatus` itself, `:112`) — only if the new text doesn't reach it otherwise
- `src/core/api/schema.d.ts` (only via `bun run gen:api`)
- tests next to these; `tests/states.spec.ts` only if a chat state it asserts changes

## What to do

1. `changes_rejected` → the REQ-110 "round rejected" sentence, with `{reason}` from `roundReason`/`roundNote` (SPEC-105 Q2's words). The bot row's own content is never shown for that status.
2. `bot_could_not_answer` + `timeout` → the "model timeout" sentence, with the existing retry and change-model controls. Other reasons are unchanged.
3. After TASK-109 DoD 6: run `gen:api`, then typecheck and the unit tests. Then run against the real TASK-109 back end with a stub gateway, starting the back end with the full `DATABASE_URL=pglite:memory …` prefix:
   - force a rejected round with a stub that proposes `feature`;
   - force a timeout with a stub that sleeps.
   Paste the rendered chat text of both.

## Definition of Done (each with its command and real output, pasted)

1. Base lines on the REQ-103-committed tree: `bun test src` → 0 fail (base: `212 pass / 0 fail, Ran 212 tests across 10 files`, Sober 14:0x on TASK-108's DONE tree) · `bun run typecheck` → exit 0 (base: exit 0, Sober 14:0x) · `git status --short` → empty (base: n/a — 51 entries until REQ-103's front commit exists).
2. After: `bun test src` → 0 fail (base: 212/0, as above) · `bun run typecheck` → exit 0 (base: exit 0) · `bun run test:states` → all pass (base: `34 passed (43.4s)`, Fern's TASK-108 rework run 14:00 — not run by me). Paste each summary line.
3. Unit tests: rejected + `unknown_kind` + note → the sentence naming the kind; rejected + each other code; timeout → the timeout sentence plus retry and model controls; a null reason → as today. (base: n/a — new: these states have no sentence before this TASK.)
4. The two pasted chat renders (step 3), in at least clean-blue and luxury-gold. (base: n/a — new.)
5. `git status --short` → only closed-list files (base: n/a — measured after REQ-103's commit). `ss -ltnp | grep -E ':(3101|3102|4299|4298|4296)\b'` → empty (base: n/a — other sessions hold ports on this machine; empty for yours).

## Implementation Notes

Fern (FE, A), 2026-10-29 15:32–15:44. Repo `blueprint-front` on `atom` @ a52e022 (REQ-103's commit), tree clean at the start; nothing committed by me.

**What changed (4 files, all on the closed list):** `src/core/api/schema.d.ts` (via `gen:api`: `roundNote`/`roundReason` on the round's message) · `src/features/chat/words.ts` (`roundRejected`, `rejectReason`, `modelTimeout` — the PM's words, verbatim) · `src/features/chat/load.ts` · `src/features/chat/load.test.ts`.
 - `changes_rejected` → `rejectedText(roundReason, roundNote)`: `unknown_kind` + note → "…AI เสนอข้อมูลแบบ “{note}” ที่ Blueprint ยังไม่รองรับ…"; `needs_user_words` / `invalid_change` / `protocol` → their lines, all inside "รอบนี้ยังไม่ได้บันทึกอะไรเลย — {reason} ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ". The bot row's own content is never shown for this status (checked before the content test).
 - `bot_could_not_answer` + `timeout` → "AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า" as the bot's line; any other reason is unchanged.
 - **Design choice (internal, say if you object):** the timeout sentence rides on the bot's own row, and for a timeout that newest failed row is no longer filtered out (it was hidden because the alert already says "บอทตอบไม่ได้ตอนนี้"). So **no theme file was touched** (`ChatDesk.tsx` in luxury-gold only sets a `data-failed` attribute): the alert with ลองใหม่ / เปลี่ยนโมเดล stays, and the timeout sentence appears as the bot's message beside it. The page therefore reads the alert and the sentence together for a timeout.
 - A reason this build has no word for, a rejected round with a null reason, or `unknown_kind` with no note → as before (no sentence); the PM's four words cover the four codes the back end can store (`round.ts:32`).

### DoD 1 — base (15:32, on a52e022)
```
git status --short → (empty)    bun test src → 212 pass / 0 fail — Ran 212 tests across 10 files    bun run typecheck → exit 0
bun run gen:api → ../blueprint-back/openapi.json → src/core/api/schema.d.ts [92.6ms]   (git diff --stat: 7 insertions, 1 deletion)
```
### DoD 2 — after (15:42–15:44)
```
bun test src      → 219 pass / 0 fail — Ran 219 tests across 10 files   (212 → 219: +7)
bun run typecheck → exit 0
bun run test:states → 34 passed (34.7s)        (run on PLAYWRIGHT_PORT=3102; the first attempt failed only because my own stub gateway was holding :4296, the spec's stub port — stopped, rerun green)
bun run test:isolation → 4 passed (5.9s)
```
### DoD 3 — unit tests (`chat/load.test.ts`, one `describe`, 7 tests)
words verbatim · rejected + `unknown_kind` + note "feature" → the sentence naming it · rejected + each of `needs_user_words` / `invalid_change` / `protocol` · a rejected row with content never shows it · null / unknown reason and `unknown_kind` with no note → as before (empty row left out; a failed bot with a null reason keeps "บอทตอบไม่ได้ตอนนี้", also with no field at all from an older back end) · timeout → the sentence is kept on the page beside the failed alert, another reason is filtered as before · a rejected round is not a failed bot (no alert).
### DoD 4 — real renders (TASK-109 back end from the working tree with `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:4296 CAW_NOTIFY_URL= HOST= PORT=4299`, stub gateway `tests/harness/stub-gateway-110.mjs` (proposes kind `feature`; sleeps 100 s past the 90 s limit on "TIMEOUT-ME"), front on :3101; `tests/harness/walk-110.ts`, screenshots `tests/harness/task-110/`)
```
stored bot row (API, all four themes):  {"content":"","roundStatus":"changes_rejected","roundReason":"unknown_kind","roundNote":"feature"}
rejected — default / clean-blue / luxury-gold / minimal-mono, the bot's line:
  "รอบนี้ยังไม่ได้บันทึกอะไรเลย — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ"     (no alert, no retry button: it is not a failed bot)
timeout — the same four themes: alert "บอทตอบไม่ได้ตอนนี้" + buttons ["ลองใหม่","เปลี่ยนโมเดล"], and the bot's line
  "AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า"
```
(Observed: the reason arrived as `unknown_kind`/`feature` — the correction call from the stub returned the same bad kind — so the other three reason codes are covered by unit tests only, `UNVERIFIED` on a real round.)
### DoD 5 — end state
```
git status --short → M src/core/api/schema.d.ts · M src/features/chat/{load.test.ts,load.ts,words.ts}   (4 files, 101 insertions, 10 deletions)
env | grep -c BLUEPRINT_GATEWAY_LIVE → 0
ss -ltnp | grep -E ':(3100|3101|3102|4200|4299|4298|4296)\b' → empty   (my stub 1105181, back end 1105218, front 1105567 and the leftover 4298 back end 1113228 stopped by pid)
```
Not done: `/impeccable audit` (not available in this session; no new layout — the sentences are existing message rows).

## Questions

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 15:4x)

**Re-run by me:** `bun test src` → **219 pass / 0 fail** `[6.45s]`; `bun run typecheck` → exit 0; `git status --porcelain` → exactly the 4 files on the list, on top of `a52e022`.

**Accepted:**
- **DoD 1–5 on the evidence.** The real renders in all four themes come from the TASK-109 back end. The stored row is `content ""`, `unknown_kind`/`feature`. `test:states` 34, isolation 4. Ports were freed by pid.
- **The design choice (timeout sentence on the bot's own row, beside the existing "บอทตอบไม่ได้ตอนนี้" alert, with no theme touched).** It meets AC-4: the timeout sentence, plus retry and change-model. The alert and the sentence say similar things. Reversible, and noted for the PM in case the owner finds it doubled.
- **The other three reason codes are covered by unit tests only** (`UNVERIFIED` on a real round, as stated). Acceptable: the back end's TASK-109 tests produce each code.

The work stays in the tree. No git until REQ-110 passes QA and the owner says "ขึ้น git".
