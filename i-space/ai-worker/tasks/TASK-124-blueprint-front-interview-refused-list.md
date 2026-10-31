# TASK-124: blueprint-front — show "saved n, not saved m" and each refused item from the round record
- Source: SPEC-105 § "Round 2" (E5c, E6) — REQ-110 amended, AC-6
- Owner: FE (Fern)
- Status: DONE (2026-10-29, Sober — see § Review, final verdict)
- Depends on: TASK-110 DONE (same topic REQ-110, same uncommitted tree — no commit in between) · TASK-123 DoD 5 (openapi with `roundRefused`) for steps 3–4
- Repo: `blueprint-front` (path: `machine.local.md`), branch `atom`, on top of `a52e022` + TASK-110's 4 files. **No git write.**

Wording: REQ-110 § User-facing wording, plus Q4's lines (accepted by the PM as written, 2026-10-29 — final; REQ-110 § Questions Q4). Invent no wording.

## Files (closed list — anything else → `## Questions` first)

- `src/features/chat/load.ts` · `src/features/chat/words.ts` · `src/features/chat/contract.ts` (if the VM needs the list) · `src/features/chat/load.test.ts`
- `src/core/api/schema.d.ts` (only via `bun run gen:api`)
- a theme chat file only if the list can't reach it through the VM; ask first.

## What to do

1. A bot row with `roundRefused` non-empty:
   - **applied** → header "saved n, not saved m" (Q4), then one line per refused item: its title (or `key`/`ref` when the title is null) and the reason word for its code. **The model's own text is not shown** (SPEC-105 E5c).
   - **changes_rejected** → today's "รอบนี้ยังไม่ได้บันทึกอะไรเลย — …" sentence, then the same per-item list.
   - The trailing `{ "item": "more", "count": n }` element → one line with Q4's "and n more" word.
2. `roundRefused` null or `[]` → exactly as today.
3. (after TASK-123 DoD 5) `gen:api`, typecheck, unit tests.
4. (after TASK-123 DoD 5) a real render against the TASK-123 back end with a stub gateway whose model proposes 5 changes, 1 invalid. Start the back end only with `DATABASE_URL=pglite:memory GATEWAY_URL=<stub> CAW_NOTIFY_URL= HOST= PORT=4299`. Paste the chat text in clean-blue and one other theme.

## Definition of Done (each with its command and real output, pasted)

1. `bun test src` → 0 fail (base: `219 pass / 0 fail, Ran 219 tests across 10 files`, Sober 15:4x on this tree) · `bun run typecheck` → exit 0 (base: exit 0, Sober 15:4x).
2. New unit tests (base: n/a — new: no list exists before this TASK): applied + 1 refused → header + the line, no model text · rejected + list → sentence + lines · `more` element → the "and n more" line · null and `[]` → as today.
3. `bun run test:states` → all pass (base: `34 passed (34.7s)`, Fern's TASK-110 run 15:4x — not run by me) · `bun run test:isolation` → 4 passed (base: `4 passed (5.9s)`, same run).
4. The real render (step 4) (base: n/a — new).
5. `git status --short` → only closed-list files plus TASK-110's 4 (base: the 4 TASK-110 files, Sober 15:4x). Ports you used → free (base: n/a — other sessions use this machine).

## Implementation Notes

Fern (FE, A), 2026-10-29 16:4x. Repo `blueprint-front` on `atom` @ a52e022 + TASK-110's 4 files. Nothing committed. **Steps 1–2 done; steps 3–4 (gen:api, the real render) are NOT done — TASK-123 DoD 5 had not landed** (TASK-123 `TODO` on the board at 16:4x). So DoD 3 (states/isolation) and DoD 4 are open; this TASK stays `IN_PROGRESS`.

**What I built (files: `chat/words.ts`, `chat/load.ts`, `chat/load.test.ts` — all on the list; `schema.d.ts` untouched so far):**
- Words (REQ-110 Q4 defaults, none invented): `savedHeader(n, m)` "บันทึกแล้ว {n} รายการ — ยังไม่ได้บันทึก {m} รายการ:", `refusedReason` (`unknown_kind` and `needs_user_words` = the already-accepted lines; `invalid_change` "ข้อมูลไม่ครบหรือไม่ถูกรูปแบบ"; `depends_on_refused` "ผูกกับรายการที่ไม่ได้บันทึก"), `refusedMore(n)` "และอีก {n} รายการ", each item "{name} — {reason}".
- `ApiMessage.roundRefused` + `ApiRefused` (hand-written until `gen:api` sees TASK-123's openapi); `refusedLines()` (name = title, else key, else ref, else the item path; the trailing `{item:"more", count}` → the "and n more" line), `refusedCount()` (m, the `more` element counted by its count).
- `textOf`: a bot row with a non-empty `roundRefused` shows **no model text**; `applied` → header + lines; `changes_rejected` → today's accepted sentence + the same lines; `null` / `[]` / no field → exactly as before.
- **Where "n" comes from (Sober's Q1 answer, 16:4x):** `n = roundSaved` on the bot row (model items applied); `null` or missing on a row that has `roundRefused` → the list alone, never a guessed header. My first version read change-set counts; **`savedCounts()` and its extra reads are removed** (`grep savedCounts` → none).
- **16:5x update:** `gen:api` ran on the openapi in blueprint-back's tree: **`roundRefused` is there** (`RefusedItem[] | null`, shape matches my hand-written `ApiRefused`: item/op/kind/key/ref/title/reason/detail, and `{item:"more", count}`), **`roundSaved` is not yet** (TASK-123 step 4 still open at 16:5x). `schema.d.ts` +24/−1; `bun run typecheck` exit 0; unit 227 / 0 after the change.

**Evidence (unit only, before the back end exists):**
```
bun test src      → 227 pass / 0 fail — Ran 227 tests across 10 files     (219 → 227: +8, all in chat/load.test.ts)
bun run typecheck → exit 0 (themes: clean-blue, luxury-gold, minimal-mono)
git status --short → M src/core/api/schema.d.ts (TASK-110) · M src/features/chat/{load.test.ts,load.ts,words.ts}
```
Tests (DoD 2): the Q4 words verbatim · applied + 1 refused → header + the line and **not** the model's text · name fallback title → key → ref → item path and each reason's word · rejected + list → sentence + lines · past 50 → "และอีก 3 รายการ", m = 53 · `null` / `[]` / no field → as today · n unknown → list alone · `savedCounts` asks only the right rows.

### Steps 3–4 (17:06–17:10) — after TASK-123 DONE
```
17:06 bun run gen:api → ../blueprint-back/openapi.json → src/core/api/schema.d.ts   (roundRefused: RefusedItem[] | null · roundSaved: number | null — as I typed them)
      bun run typecheck → exit 0 · bun test src → 227 pass / 0 fail — Ran 227 tests across 10 files
17:08 PLAYWRIGHT_PORT=3102 bun run test:states → 34 passed (38.0s)     PLAYWRIGHT_PORT=3102 bun run test:isolation → 4 passed (6.2s)
git status --short → M src/core/api/schema.d.ts · M src/features/chat/{load.test.ts,load.ts,words.ts}   (TASK-110's four files; nothing else)
env | grep -c BLUEPRINT_GATEWAY_LIVE → 0       ss -ltnp | grep -E ':(3100|3101|3102|4200|4299|4298|4296)\b' → empty (my stub 1277961, back end 1277997, front 1279291, leftover 4298 1280692 stopped by pid)
```
**DoD 4 — real render** (TASK-123 back end from blueprint-back's tree: `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:4296 CAW_NOTIFY_URL= HOST= PORT=4299`; stub `tests/harness/stub-gateway-124.mjs` — 5 proposed changes, 4 valid steps + 1 of kind `feature`, and a reply text that claims everything was saved; `tests/harness/walk-124.ts`; screenshots `tests/harness/task-124/`):
```
stored bot row (partial): {"status":"applied","content":"","roundSaved":4,"roundRefused":[{"item":"changes[4]","op":"part.add","kind":"feature","ref":"$e","key":null,"title":"แจ้งเตือนทางอีเมล","reason":"unknown_kind","detail":"a feature cannot be added as a change — …"}]}
clean-blue  (partial) → "บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ: แจ้งเตือนทางอีเมล — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ"   (+ the change card "เพิ่ม 4 · แก้ 0 · ลบ 0 · ย้อนกลับ")
luxury-gold (partial) → "บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:" / "แจ้งเตือนทางอีเมล — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ"   (two lines)
default, minimal-mono (partial) → the same two parts, on ONE wrapped line
all refused (stored: status changes_rejected, roundSaved 0, one refused item) — clean-blue / default / mono: "รอบนี้ยังไม่ได้บันทึกอะไรเลย — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ แจ้งเตือนทางอีเมล — … ” on one wrapped line; luxury-gold: sentence and item line on two lines
the model's own "เพิ่มให้ครบทั้งหมดแล้วครับ" → shown in NO theme (partial or all-refused)
```
**Finding (b) settled — the line breaks:** the text carries a `\n` between the header/sentence and each item line. luxury-gold's message text has `white-space: pre-wrap` and keeps them; **default, clean-blue and minimal-mono compute `white-space: normal`** and collapse them (measured on the bot message element: 50 px ≈ 2 wrapped lines vs gold's 89–119 px). The words and numbers are right in all four; with several refused items the lines would run together in three themes. The fix is one CSS declaration (`white-space: pre-line`) on the bot-message text in `src/features/chat/chat.module.css` (default), clean-blue's `Chat.tsx` message (its `<Clamp>`) and minimal-mono's chat css — **theme files, not on my list**, so I did not touch them (Q2).

**Not verified (UNVERIFIED — what would settle it):** the `more` element ("และอีก n รายการ") on a real round — it needs 51 refused items in one round; unit-tested only. `/impeccable audit` not available.

### Rework (17:12–17:20) — Sober's one item: `white-space: pre-line` on the bot message text in default, clean-blue, minimal-mono
Each file read first; one declaration each, on the bot message's rule only (user messages untouched): `src/features/chat/chat.module.css` (`.bot`), `src/themes/clean-blue/pages/chat.module.css` (`.bot`), `src/themes/minimal-mono/chat/chat.module.css` (`.messages .bot`). luxury-gold untouched.
Proof (same real render as before — pglite back end + `stub-gateway-124.mjs`; `tests/harness/walk-124.ts` now also asks whether the text after the first `\n` starts at the element's left edge, i.e. on a line of its own; screenshots `tests/harness/task-124/`):
```
              computed white-space   item line starts a line of its own
default       normal → pre-line      false → true   (partial)   true (all refused)
clean-blue    normal → pre-line      false → true   (partial)   n/a (all refused: the 2-row clamp cuts the text; "ดูรายละเอียด" expands it — existing behaviour)
minimal-mono  normal → pre-line      false → true   (partial)   true (all refused)
luxury-gold   pre-wrap (unchanged)   true            (partial)   true (all refused)
```
(The "before" column is the 17:08 measurement, `white-space: normal`, header and item on one wrapped line; the `true/false` before-values for the probe I added only now are inferred from that.) Real text, e.g. default: `บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:` ⏎ `แจ้งเตือนทางอีเมล — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ`.
```
bun test src → 227 pass / 0 fail — Ran 227 tests across 10 files       bun run typecheck → exit 0
PLAYWRIGHT_PORT=3102 bun run test:states → 34 passed (38.5s)           PLAYWRIGHT_PORT=3102 bun run test:isolation → 4 passed (6.3s)
git status --short → M src/core/api/schema.d.ts · M src/features/chat/{chat.module.css,load.test.ts,load.ts,words.ts} · M src/themes/clean-blue/pages/chat.module.css · M src/themes/minimal-mono/chat/chat.module.css
ss -ltnp | grep -E ':(3100|3101|3102|4200|4299|4298|4296)\b' → empty (my stub 1292872, back end 1292907, front 1293892 and the leftover 4298 back end 1296280 stopped by pid)     env | grep -c BLUEPRINT_GATEWAY_LIVE → 0
```

## Questions

- **Q2 (Fern → @Sober, theme files).** The refused lines collapse into one run-on line in default, clean-blue and minimal-mono (luxury-gold is fine) — evidence above and in `tests/harness/task-124/*-124-partial.png`. OK to add `white-space: pre-line` to the bot-message text in those three (the default's `chat.module.css`, clean-blue's `Chat.tsx`/its css, minimal-mono's chat css — I will read each before touching), then re-run `test:states` + `test:isolation`? Or accept the run-on for now and leave it to the PM?

- **Q1 (Fern → @Sober).** "Saved n" has no source in SPEC-105 E6 (it records only what was refused). I used the change set's counts (above). OK, or does TASK-123's `Round`/`ChatMessage` carry a saved count you want me to read instead? Default if you say nothing: keep mine.
  > answer (Sober, SA A, 16:4x): **Read a back-end count instead.** Your question found a gap in my SPEC.
  > - The change set's counts include link rows and the user's own accepts/answers, while `m` counts proposed **items**, so the two numbers wouldn't measure the same thing.
  > - SPEC-105 E6 now adds `roundSaved` (model items applied) beside `roundRefused`. Jason has it in TASK-123 step 4.
  > - Use `n = roundSaved`. If it's null on a row that has `roundRefused`, show the list alone, as you do now. Drop `savedCounts()` and the extra change-set reads.
  > - (b), newlines per theme: settle it at step 4, and ask before a theme edit, as you said.

## Review

> answer to Q2 (Sober, SA A, 17:1x): **Yes, add it.** A run-on list defeats AC-6's "the chat names the refused change" once there is more than one.
> - **Added to your closed list:** the bot-message text rule in `src/features/chat/chat.module.css` (default), clean-blue's chat message style (`pages/Chat.tsx` / its css), and minimal-mono's chat css.
> - **The change:** exactly one declaration each, `white-space: pre-line`, on the bot message's text only. Not on user messages: their typed text already keeps its own formatting rules.
> - Read each file first. If one of them has no single place for it, ask before writing more.

### Verdict — REWORK, one item (Sober, SA A, 2026-10-29 17:1x)

**Re-run (cheap checks, mine) deferred to the final verdict.** Accepted on the evidence:
- DoD 1–3 and 5: 227 unit, typecheck 0, states 34, isolation 4, only TASK-110's four files, ports freed.
- DoD 4: the real round from TASK-123's back end, stored `roundSaved 4` + one `unknown_kind` item. The text in all four themes is right, and the model's claim is shown nowhere.

**REWORK:** Q2's `white-space: pre-line` in the three themes.
- DoD: the partial render's text with **separate lines** in default, clean-blue and minimal-mono (an element height or screenshot, as you measured), and the same in luxury-gold, unchanged.
- Then `bun test src`, typecheck, `test:states`, `test:isolation`, each pasted.
- The `more` line stays unit-only (UNVERIFIED on a real round). That's accepted: 51 refusals live isn't worth building.

### Verdict — DONE (Sober, SA A, 2026-10-29 17:2x)

**Re-run by me:** `bun test src` → **227 pass / 0 fail** `[6.86s]`; `bun run typecheck` → exit 0; `git diff` of the three css files → exactly one `white-space: pre-line` each, on the bot rule only, with a REQ-110 comment; `git status` → 7 files, all on the (extended) list.

**Rework accepted:** in all four themes the refused item starts a line of its own on the real render. clean-blue's all-refused case is cut by its existing 2-row clamp, with "ดูรายละเอียด" to expand. That's existing behaviour and noted, not a defect of this TASK. states 34, isolation 4.

The work stays in the tree. No git until REQ-110 passes QA and the owner says "ขึ้น git".
