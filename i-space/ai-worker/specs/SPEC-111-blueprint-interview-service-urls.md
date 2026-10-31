# SPEC-111: Blueprint's interview stores the address of a service the spec names — an `api` part's `path` may be a full URL
- Source: REQ-114 (Team A)
- Status: DONE (2026-10-30 15:0x, Sober — SA, Team A) — round 1 TASK-132/133 committed 9578d51; round 2 TASK-136/137 committed 2da175e / 15283e1; follow-ups in SPEC-113 (REQ-116) · was ACTIVE (2026-10-30)
- Repos read: `blueprint-back` / `blueprint-front` on `atom` (HEAD a4bf924 / a52e022 + REQ-110's uncommitted tree), read 2026-10-30 08:0x by Sober. `caw-back` read-only, for the seam question only.
- Evidence: `tests/TEST-107-blueprint-interview-honest.md` § Round 4 — AC-1 LIVE, DEF-4; `tests/harness/test-107/r4/ac1-round1.json` (`refused`).

## What I read
- **Why the 4 were refused:** `back: src/spec/registry.ts:28`: `api.path: z.string().startsWith("/")`. The model sent `GET http://127.0.0.1:4200/health` and so on (refusal detail: `must start with "/" at path`).
- **Nowhere else to put an address:** `system` has an empty strict body (`registry.ts:37`). Every body is strict (`:4`). So a URL today fits only free text (a work goal, a data field's note).
- **The model was never told the rule.** `kindsBlock()` prints `api { …, path: string, … }` (`back: src/interview/context.ts:21-25,40-43`): a `startsWith` check is invisible in the type text. This is our cause, the same shape as F-023.
- **Readers already see `path`, as plain text:** `ApiVM.path: string` (`front: src/core/theme/contract.ts:79`), rendered `<code>{a.method} {a.path}</code>` (`front: src/core/theme/default/pages.tsx:304`) and in the 3 themes' `Api.tsx` (`clean-blue :52`, `minimal-mono :71`, `luxury-gold :50`). Nothing builds a link or URL from it (`grep -rn "a\.path\|api\.path" src` → only those renders and the dev loader).
- **Not a seam change:** caw-back passes spec content through as returned (`caw-back → src/blueprint/client.ts:3`), and keeps a part body as opaque JSON (`src/blueprint/latest.ts:42,58`). The rule is not in `openapi.json` either (part bodies are not typed there; `grep '\^/' openapi.json` → no hit), so the front's `gen:api` / `check:api` do not move.
- **The replay source:** the model's round-1 answer was **not** stored. `roundRaw` is null, because the reply was readable, and `roundRefused` holds only `item, op, kind, ref, title, reason, detail`, never the body. The 4 URLs in `ac1-round1-messages.json` are the **user's** message (`spec.txt`). So AC-1's replay is **rebuilt** (REQ-114 § Questions, the PM's note): 4 × `part.add api`, `ref`/`title` as recorded, `method: "GET"`, `path` = the spec's URL for that service. Their 4 `covers` links came **from** a decision (`registry.ts:105`) that was not stored either, so they are left out and named as left out.

## Design `[SA-decided]` (cheap to reverse)
- **E13 — `api.path` takes a path or a full http(s) URL.** `path` becomes `z.string().refine(isApiPath, …)`, where `isApiPath(v)` is: `v.startsWith("/")` **or** `new URL(v)` parses with protocol `http:` or `https:` and a non-empty host. Error message: `must start with "/" or be a full http(s) URL`. Measured on the base: `/rooms` true · `http://127.0.0.1:4200/health` false · `https://x.example/a` false · `127.0.0.1:3900` false · `ftp://h/x` false · `http://` false. After E13 the two http(s) URLs become true, and the other false ones stay false.
  - **Why `api`, not a new field or `system`:** a health check `GET http://host:4200/health` *is* an API call, to another server. The address then sits where every theme already prints `method path`. There is no new field, no front change and no migration, and old rows (all `/…`) stay valid.
  - `host:port` without a scheme stays refused (`invalid_change`, named). Guessing `http` against `https` has more than one reading. The prompt (E13b) asks for the full URL.
- **E13b — Tell the model.** One line after the kinds list in `kindsBlock()`: "api.path คือ path ของ API นี้ เริ่มด้วย / (เช่น /rooms) หรือ URL เต็มของบริการอื่น ขึ้นต้น http:// หรือ https:// (เช่น http://127.0.0.1:4200/health)". It is generated text, so the prompt-size tests (AC-11) still apply.
- No new refusal reason, so no new wording (REQ-114 § Wording).

**Consumers** (grepped 08:0x): `grep -rn "startsWith(\"/\")" src test` (back) → `src/spec/registry.ts:28` only. `api.path` readers: front `src/core/theme/default/pages.tsx:304`, `src/themes/{clean-blue/pages/Api.tsx:52, minimal-mono/pages/Api.tsx:71, luxury-gold/pages/Api.tsx:50}`, `src/app/dev/loaders/page.tsx:23` (dev only). All print text, so no code change; TASK-133 checks a long URL renders. Tests: `test/spec/registry.test.ts:11` (`/bookings`, stays valid).

## Data model
No schema change and no migration. Existing `api` rows all start with `/` and stay valid.

## AC → work
| AC | Covered by |
|---|---|
| AC-1 replay | TASK-132: E13 + a test replaying the rebuilt 4 `api` changes → stored with their URLs |
| AC-2 live (≤ 3 calls) | E13 + E13b, proof by QA's live run only |
| AC-3 regression | TASK-132 (back full suite + REQ-110 tests) · TASK-133 (front unit + real render) |

## Tasks
- TASK-132: blueprint-back — `api.path` takes a full http(s) URL, plus the prompt line, plus the AC-1 replay test — owner: BE (depends on: REQ-110 committed)
- TASK-133: blueprint-front — a full-URL `api` renders readably in the 4 themes — owner: FE (depends on: TASK-132 DONE + REQ-110 committed)

## Round 2 — Blueprint catches every address the user wrote (REQ-114 req 4, AC-4; TEST-111 DEF-1) (2026-10-30 10:3x, Sober)

**What I read:**
- In TEST-111's live run the model sent **no** `api` part, so E13 was never used. Final spec (`tests/harness/test-111/ac1-round2-spec.json`): `:3900` (the app's own address) is in WRK-001's body; `:3100` and `:3500` are only in Q-002's question text; `:4200/health` and `:4500/health` are in no part.
- `roundRaw` is null on every row of both rounds (the replies were readable), so the model's answers are **not recorded**. AC-4's replay is **rebuilt** like AC-1's: round 1's model answer = the changes that produced round 1's stored parts (`ac1-round1-spec.json`), round 2 = "ตามนั้น" on what was offered.
- A server-made change already exists: accept, answer and park build `server:…` entries (`back: src/interview/round.ts:259-262`); a server item that fails is an integrity error (`:616`). After the model fails, D-023 applies the user's own decisions in one set (`:627-641`).

**Design `[SA-decided]` (cheap to reverse):**
- **E14 — The URL catcher.** In every round that has a user `message`, before each apply attempt (so it also sees items the retry loop has just dropped):
  - **URLs** = matches of `https?://[^\s<>"'()\[\]{}]+` in **this round's** message, with trailing `.,;:!?` stripped, kept only if `isApiPath` (E13) accepts them. Deduplicated. At most 20.
  - **Held** = the URL (compared without a trailing `/`) occurs in the title or body JSON of a **non-question** part: either live in the project, or in this attempt's kept `part.add`/`part.update` entries. A question's text does not hold it (TEST-111 counted those as not stored).
  - **For each URL not held,** the server adds one entry `server:url <n>`: `part.add`, kind `api`, ref `$url_<n>`, title = the URL (cut at 80), body `{ method: "GET", path: <url> }`, origin `team-proposed`. It is stored with the round, not offered. "Stored" is the simpler of the REQ's two options, and the part is plainly editable on `/api`.
  - **Recorded** in `round_adjusted` as `{ item: "server:url <n>", what: "url_kept", title: <url>, key: <stored key>, ref }` (cap and `more` as E8).
  - **Runs whatever the model did:** applied, no_changes, changes_rejected, and bot_could_not_answer. For a failed bot the URL items join the user's decisions in D-023's one set, so the round still says what it says, and the URLs are kept.
  - A "ลองใหม่" retry re-reads the same message, finds the URLs held, and adds nothing.
  - By construction a URL item cannot fail the registry. If it ever does, that is the existing integrity 500.
- **E14b — The chat names each one.** The front shows one line per `url_kept` adjustment, under the round's other lines, like `field_dropped` (E9). Wording default (to the PM, non-blocking): "{ที่อยู่} — Blueprint เก็บไว้ใน {key} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)" / EN "{address} — kept in {key} by Blueprint (the AI left it out)".

**Contract:** `Adjusted.what` (`round.ts:40`) and the zod enum (`src/http/routes/rounds.ts:23`) gain `"url_kept"`; `openapi.json` is re-emitted; front `gen:api`. Consumers: as in Round 4 of SPEC-105 (`grep -rn "op_renamed" src` back → `round.ts:40`, `rounds.ts:23`; front → `load.ts:31` comment, `load.ts:113` `adjustedLines`, which gains the `url_kept` line).

**Risks:**
- The user's **own app's** address gets caught too when the model leaves it out (here `:3900` was held by WRK-001, so it wasn't). It becomes a `GET <url>` API part the user can edit or remove. Honest, and cheap.
- `GET` is assumed. The part is `team-proposed`, and the path is exactly what the user wrote.

**AC → work:** AC-4 → TASK-136 (E14 + rebuilt replay of TEST-111 rounds 1–2: all 4 addresses in stored non-question parts; `url_kept` names the ones the server added) + TASK-137 (E14b line) · AC-1/AC-3 unchanged · AC-2 live: E13 + E14 (the owner's word for new calls).

**Order `[SA-decided]`:** REQ-114 round 1 is committed first (the PM has asked the owner), then TASK-113 (REQ-105, Team B waits), then this round (TASK-136/137), then TASK-117, then TASK-134 (F-013, one tree).

## Risks
- The model may next time put the address somewhere else (a `system`, a `data` note). Then AC-2 still passes only if the address lands in *a* stored part, which the REQ allows. If it lands in no stored part, the refusal names it (REQ-110).
- 3 live calls are tight: round 1 (1 call, +1 correction), round 2 (1). If they run out, stop and report (owner's rule).

## Questions
(none: the replay source is answered in REQ-114 § Questions)
