# REQ-114: Blueprint's interview stores the address of a service the spec names
- Status: **DELIVERED + COMMITTED** (2026-10-30 13:3x — owner's "ขึ้น git REQ-114 (รอบ 2)": blueprint-back 2da175e · blueprint-front 15283e1, pushed, PM verified; round 1 9578d51) · DELIVERED (2026-10-30 13:1x, the PM — QA's TEST_PASSED; DEF-2/DEF-3 → REQ-116, O-2 accepted, `DECISIONS.md` § ตัดสินใจแทนเจ้าของ 13:1x) · was TEST_PASSED (round 2, 2026-10-30 13:11, QA Tanya — AC-1…AC-4 met, AC-2 live in 1 call (2 unspent); DEF-2 / DEF-3 MINOR + O-2 open for the PM; tested trees bp-back e4b2579+`7275c1bc9fb9` · bp-front 282e426+`55e35d7e7b5e`; TEST-111 § Round 2) · was SPEC_DONE round 2 (2026-10-30 12:3x, Sober — TASK-136/137 DONE, § AC check Round 2) · was TEST_FAILED (2026-10-30 09:57, QA Tanya — AC-2 live FAIL: the model sent no `api` part for the services, so after 2 rounds the 4 addresses are not in stored parts (TEST-111 DEF-1); AC-1 PASS, AC-3 PASS; 3 of 3 calls used; `tests/TEST-111-blueprint-stores-service-urls.md` § Verdict) · was READY_FOR_SA (2026-10-30, the PM)
- Priority: HIGH `[operator]` — split from REQ-110 AC-1 by the owner (`DECISIONS.md` 2026-10-30 02:4x)
- Requested: 2026-10-30 by the owner (relayed: *"แยกปัญหา URL ของ 4 services ไปเป็น REQ ใหม่เล็กๆ (ใช้ gateway ที่เหลือ 3 ครั้ง)"*)
- Deadline: none
- Team: **A (Blueprint)**. Builds on REQ-110 (delivered; its code waits for the owner's own "ขึ้น git REQ-110").

## Problem / Goal

A spec often says which other servers the product talks to, with their addresses. In REQ-110's last live run
(`tests/TEST-107-blueprint-interview-honest.md` § Round 4 — AC-1 LIVE, DEF-4) the model sent the Health Board's 4
services as `api` parts with a **full URL** (`http://127.0.0.1:4200/health`) where the registry reads a path that starts
with `/`. All 4 were refused, and after 2 rounds no stored part held any of the 4 addresses. Everything else in the spec
was stored. A PM reading the spec in Blueprint would not find where the dashboard is to look.

## Requirement

1. When the user's text names other services with their addresses (full URLs, host:port), the interview stores each
   address in the spec, in a part a reader can find. Which kind holds it is the SA's design.
2. A service on another server is never refused only because its address is a full URL.
3. REQ-110's behaviour stays: refused changes are named with their reason, nothing is claimed saved that was not.
4. **AMENDED 2026-10-30 10:1x by the PM** (TEST-111 DEF-1: live, the model sometimes sends no part for the services at all — where it puts them changes from run to run): **an address the user wrote is never lost, whatever the model does.** After a round, any full URL from the user's own message that is in no stored part is caught by Blueprint itself (not left to the model) and either stored or offered to the user with "ตามนั้น", and the chat names it. How is the SA's design. `[PM-decided — DECISIONS § ตัดสินใจแทนเจ้าของ 2026-10-30 10:1x]`

## Acceptance Criteria

- [ ] **AC-1** — **Given** the recorded live round-1 answer from TEST-107 round 4 (`tests/harness/test-107/r4/ac1-round1.json`)
  **When** it is replayed through the round with a stub **Then** the 4 services are stored with their addresses
  (`:4200/health`, `:3100`, `:4500/health`, `:3500`), or each one that is not is named with its reason.
  - Check: QA, stub replay — no live call.
- [ ] **AC-2** — **Given** a new project **When** the user pastes `tests/harness/test-106/spec.txt` as the first message
  **Then** after at most 2 rounds (accepting with "ตามนั้น" where offered) all 4 addresses are in stored parts, and
  REQ-110 AC-1's other points are still stored.
  - Check: QA, live — **at most 3 gateway calls** (the owner's remaining calls, `DECISIONS.md` 2026-10-30 01:1x / 02:4x). Out of calls and not passed → stop and report.
- [ ] **AC-4** (added 2026-10-30, req 4) — **Given** the recorded live answers from TEST-111 (`tests/harness/test-111/ac1-round1.json`, `ac1-round2.json` — no `api` part) **When** they are replayed with a stub **Then** after the 2 rounds all 4 addresses from `spec.txt` are in stored parts or offered for "ตามนั้น" and stored once accepted; the chat names each one.
  - Check: QA, stub replay — no live call.
- [ ] **AC-3** (regression) — REQ-110 AC-2…AC-9 still pass; blueprint-back and blueprint-front suites still pass.
  - Check: QA, stub.

## User-facing wording (the PM)

No new sentence. If a new refusal reason is added, its `{เหตุผลสั้น ๆ}` string comes to the PM for wording.

## Constraints

- LLM gateway: AC-1 and AC-3 with the stub; AC-2 live within the 3 remaining calls only.
- No seam change.

## Out of Scope

- Checking that the addresses answer, or any network call to them. · Any other kind change not needed for addresses.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Note (PM → SA A, 2026-10-30)** — I did not check whether `r4/ac1-round1.json` / `ac1-round1-messages.json` hold enough of the model's raw answer to replay. If not, rebuild the 4 refused `api` changes from the stored `roundRefused` detail and say so here; AC-1 stays as written.
  > answer (SA A, Sober 2026-10-30 08:0x): **not enough. The replay is rebuilt, and AC-1 stays as written.** `roundRaw` is null (the reply was readable), and `roundRefused` keeps ref/title/reason/detail but no body. The 4 URLs in `ac1-round1-messages.json` are the user's own message. TASK-132's fixture = 4 × `api` part.add with the recorded ref and title, `method GET`, and `path` = the spec's URL; it is marked `rebuilt`. The 4 `covers` links are left out: they came from a decision the model's answer held that was not stored either. SPEC-111 § What I read.
- **Note (SA A → PM, 2026-10-30) — blocked on git, not on a question.** REQ-114's code goes into files REQ-110 already changed in the same uncommitted tree (`context.ts`). So TASK-132/133 wait for **REQ-110 committed** (PROTOCOL § Repo layout, F-013). Design: `api.path` also takes a full `http(s)://` URL, and the prompt says so. There is no new field, no front change, no seam change and no new wording (SPEC-111). Live calls: AC-2 within the 3 left (round 1: 1 + 1 correction; round 2: 1).
- **Round 2 (SA A → PM, 2026-10-30 10:3x) — AC-4's replay is rebuilt too.** TEST-111's model answers were readable, so `roundRaw` is null on every row and the answers are not recorded. TASK-136 rebuilds round 1's answer from the parts it stored (`tests/harness/test-111/ac1-round1-spec.json`, no `api` part), marked REBUILT. AC-4 stays as written. Design: Blueprint itself stores every full URL from the user's message that no non-question part holds, as a `GET <url>` `api` part (stored, not offered), and names it in the chat. A URL that sits only in a question's text counts as not stored. SPEC-111 § Round 2.
- **Q (SA A → PM, wording — does not block; FE builds the default)** — the line per kept address: "{ที่อยู่} — Blueprint เก็บไว้ใน {key} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)" / EN "{address} — kept in {key} by Blueprint (the AI left it out)". Correct it if wrong.
  > answer: accepted as written (TH + EN). — Porter (PM) 2026-10-30 10:4x `[PM-decided]`
- **Order (SA A, `[SA-decided]`)** — round 2 is built after REQ-114 round 1 is committed **and** after TASK-113 (REQ-105) is committed, because Team B waits on TASK-113 (the PM's priority) and blueprint-back is one tree (F-013). TASK-117 (REQ-112) then follows round 2.

## AC check (SA A — Sober, 2026-10-30 09:5x)

| AC | Where it is met (deliverable) | Self-checked |
|---|---|---|
| AC-1 | `blueprint-back → src/spec/registry.ts` `isApiPath` (SPEC-111 E13). `test/interview/service-urls.test.ts` replays the **rebuilt** round-1 answer (`test/fixtures/service-urls-round1.json`, marked `_note` REBUILT, see § Questions): `applied`, 1 call, nothing refused, 4 `api` parts with `http://127.0.0.1:4200/health` · `:3100` · `:4500/health` · `:3500` (TASK-132; Sober's re-run 24/0). | yes (on the rebuilt answer) |
| AC-2 | Build side: E13 accepts the model's live shape (a full URL in `api.path`), and E13b tells the model so (`context.ts` `kindsBlock()`). That the real model stores all 4 in ≤ 2 rounds is **live only** (≤ 3 calls). | **no** — live only (same ruling as REQ-110 Q3) |
| AC-3 | back: `test/interview` 87/0 (Sober's re-run), full suite 279/16/0, tsc 0, no existing test changed (TASK-132). front: no code change; 235/0, typecheck 0; full-URL `api` parts render whole in 4 themes × 2 widths (TASK-133). | yes |

**Round 2 (SA A — Sober, 2026-10-30 12:3x) — AC-4 added, AC-2/AC-3 updated.**

| AC | Where it is met (deliverable) | Self-checked |
|---|---|---|
| AC-4 | `blueprint-back → src/interview/round.ts` `uncaughtUrls` + the E14 loop (SPEC-111 § Round 2). `test/interview/url-catcher.test.ts` (a) replays the **rebuilt** TEST-111 round 1 (`test/fixtures/url-catcher-round1.json`, `_note` REBUILT; message = `test-106/spec.txt`, which `test-111/ac1-live.mjs:17` sent): `:4200/health`, `:3100`, `:4500/health`, `:3500` each in one stored non-question part, `:3900` not duplicated (WRK-001), 4 `url_kept` with keys; round 2 adds none. (b)–(d) timeout, retry, edge cases (TASK-136; my re-run 6/0). The chat names each one: `blueprint-front → src/features/chat/load.ts` `adjustedLines` + `words.ts` `urlKept`, verbatim, real render in 4 themes (TASK-137; I checked the screenshots by eye). | yes (on the rebuilt answer) |
| AC-2 | E13 + now E14: if the model again leaves an address out, Blueprint stores it in round 1. The live model is not exercised. | **no** — live only (≤ 3 calls, the owner's word) |
| AC-3 | back full suite 308/16/0, tsc 0, no existing test changed (TASK-136). front 238/0, typecheck 0, check:api matches (TASK-137). REQ-110's chat lines unchanged (`field_dropped` test, `op_renamed` guard). | yes |

## Verification (by QA)

Build: blueprint-back e2c3326 + fp `4750edd216c3` · blueprint-front b041cbd (clean). Detail: `tests/TEST-111-blueprint-stores-service-urls.md`.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | QA's own rebuild of the live round-1 answer, through the chat page: 4 `api` parts with the full URLs, 1 call, nothing refused; `/api` page shows all 4 whole. Neighbours: ftp / `javascript:` / empty host refused and named; host:port without a scheme refused → TEST-111 Q1 |
| AC-2 | **FAIL** | live, 3 of 3 calls: round 1 stored 15 parts but the model sent **no** `api` part; round 2 ("ตามนั้น" ×2) refused 2 links to an `api` part it never sent. `:4200/health`, `:4500/health` in no part; `:3100`, `:3500` only in a question's text (DEF-1) |
| AC-3 | PASS | REQ-110 AC-2…9 scripts 49 OK (+ the known `ui.mjs` #6 miss, watched run OK); back 279/16/0, front 235 / 4 / 34 / 948 |
| **Round 2** (13:11, bp-back e4b2579+`7275c1bc9fb9` · bp-front 282e426+`55e35d7e7b5e`) | AC-1…AC-4 **PASS** | AC-4: rebuilt live round 1 (no api part) → Blueprint keeps the 4 as `GET` API-001…004, names each in the chat, round 2 adds none · AC-1: no copies when the model sends them · AC-2 live, 1 call: the model put all 4 in DATA-001, points 2–6 + ไม่ทำ stored · AC-3: 49 OK, back 308/16/0, front 238 / 4 / 34 / 948 · **DEF-2** Thai glued to a URL → `…/healthทุก` stored · **DEF-3** `:31000` in a part hides `:3100` (both MINOR) · O-2 `:3900` kept as an API when no part names it |
