# TASK-013: LINE notifier: 1-on-1 push for every notified message + `line_pushes`
- Source: SPEC-002 § LINE notifier · SPEC-001 §4 (`registerNotifier`, `Notification`), §5 (`line_pushes` columns) · REQ-003 req 6, 8 · AC-4, AC-7
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review; registration + live check moved to TASK-020)
- Depends on: **TASK-011** (DONE) · TASK-012 (DONE). **Amended by the SA 2026-11-01: start now.**
  - Build `createLineNotifier(deps): (n: Notification) => Promise<void>` in `notifier.ts` and test it directly against the
    fake LINE API. Declare `Notification` locally in `types.ts`, copied **exactly** from SPEC-001 §4.
  - **Registration** (`deps.registerNotifier("line", …)`, step 1) needs Team A's `src/core/notify.ts` (TASK-007). Do it
    when that file is in your tree. Until then `index.ts` does not register, and the live DoD line stays `UNVERIFIED`.
  - **Carried from TASK-012 (SA review 2026-11-01):** when Team A's `src/core/intake.ts` (TASK-005) is in your tree, wire
    `index.ts` to its `ingestMessage` in place of `ingestNotAvailable`. Then add to `test/line-webhook.test.ts`: AC-2 → four
    `messages` rows for U1 with the right `recipient_kind`; redelivery → still one row.
  - **Update 2026-11-01 (PM, from Team A):** TASK-005 is DONE, so `src/core/intake.ts` (`ingestMessage`, `IngestRefused`)
    is live. Do the ingest wiring above now.
  - **Test DB, until Team A's TASK-019 lands:** both teams share one test database, and every `bun test` run wipes it, so
    runs at the same time hang or flake (TASK-019 § Why). Run your tests on a **Team B-only** local test database: create
    `corner_chat_test_b` once on the team's local cluster (:5433), then prefix each run with
    `DATABASE_URL_TEST=<same URL, database corner_chat_test_b>`. Do not edit `.env`. A hang or flake on the shared database
    is not evidence either way. Drop the prefix once TASK-019 is DONE.
  - REVIEW is allowed with either wiring still missing, if you say which is missing. The SA re-checks both once Team A's files land.

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list):
  - `src/modules/line/index.ts` (register the notifier; wire `ingestMessage`), `src/modules/line/notifier.ts`, `src/modules/line/line-api.ts` (add `push`), `src/modules/line/types.ts` (`Notification`)
  - `test/line-notifier.test.ts`, `test/line-webhook.test.ts` (only the TASK-005 wiring checks)
- Git writes allowed: **none.**

## What to do
Exactly SPEC-002 § LINE notifier:
1. `registerLine` calls `deps.registerNotifier("line", notifyLine)`.
2. No `line_links` row → return without a call.
3. Text = `aboutLine + "\n" + preview`; when `aboutLine` is null → `"AI ไม่ได้ตรวจ · " + senderName + "\n" + preview`.
4. `POST {LINE_API_BASE}/v2/bot/message/push` with `Authorization: Bearer <LINE_CHANNEL_ACCESS_TOKEN>` and
   `X-Line-Retry-Key: <one UUID per call>`, body `{ "to": <line_user_id>, "messages": [ { "type": "text", "text": … } ] }`.
   Retries: up to 3 more tries after 2 s / 10 s / 30 s on network error or 5xx, with the **same** retry key. 409 = sent.
   Other 4xx → throw at once. Make the delays injectable so tests run fast.
5. Sent → `INSERT INTO line_pushes (user_id, message_id) VALUES … ON CONFLICT (message_id, user_id) DO NOTHING`.
   Not sent → throw `Error("line push failed: <status>")`, with no body and no token in it.

## Definition of Done (paste real output)
- [ ] `bun test test/line-notifier.test.ts` green, against the fake LINE API (TASK-010):
  - linked U1 → one push call: path, `Authorization`, `X-Line-Retry-Key` present, body `to` + text exactly `"<about>\n<preview>"`; one `line_pushes` row;
  - `aboutLine: null` → text starts `"AI ไม่ได้ตรวจ · สมชาย\n"`;
  - not linked → no call, no row, no throw;
  - fake returns 500, 500, then 200 → 3 calls, **the same retry key** on all three, one row;
  - fake returns 409 → counted as sent, one row;
  - fake returns 400 → throws, no row, the error message has no token;
  - the same `messageId` notified twice → still one row (**AC-7: +1 per push**).
- [ ] Live, local, **only if Team A's TASK-007 is in the tree:** an `always` rule for U1 + a LINE event that mentions U1
      (`send-event.ts`) → the fake LINE API records the push, `notifications_log` has a `line` row `ok=true`, and
      `GET /api/v1/admin/stats/line-pushes` (owner token) shows `count` +1. Paste each. Not in the tree →
      `UNVERIFIED — needs TASK-007`.
- [ ] `git status --porcelain` → only closed-list files.
- Real LINE (the test OA) is **not** part of this TASK. It needs B1 and runs later with QA, through a temporary tunnel (D16).

## Implementation Notes
**Bob, 2026-11-01.** Test-first. RED: `test/line-notifier.test.ts` (10 tests) failed on a missing module, and the new "wired to Team A's ingestMessage" test in `test/line-webhook.test.ts` failed with `500` / `ingest not available yet`. Then `notifier.ts`, `line-api.ts` (+`push`), `types.ts` (+`Notification`, copied from SPEC-001 §4), `index.ts` → GREEN. No new dependency, no git writes, closed list held.

**Two wirings, status:**
- **Ingest wiring: DONE.** `index.ts` now passes Team A's `ingestMessage` from `src/core/intake.ts` (`ingestNotAvailable` removed). It throws an `Error` named `IngestRefused`, exactly the name `webhook.ts` already maps (my TASK-011 Q1 assumption is now confirmed by their file). Added two tests that go through `createApp()` → `registerLine`: AC-2 → four real `messages` rows for U1 (`mention`, `mention_all`, `reply_to_me`, `name_match`; `channel line`, `sender_name สมชาย`, `group_name ทีมขาย`, `filter_state pending`), redelivery of all four → still four rows; AC-3 → an event that concerns nobody changes no table count. This closes the TASK-011 `UNVERIFIED` lines.
- **Notifier registration: NOT done.** `src/core/notify.ts` (Team A, TASK-007) is not in my tree (`ls src/core`: auth, crypto, db, errors, intake, migrate). `index.ts` keeps a comment where `registerNotifier("line", createLineNotifier({ db, config }))` goes. The notifier itself is built and tested.

Decisions (internal):
- `createLineNotifier({ db, config, retryDelaysMs?, sleep? })` returns `notifyLine(n)`. Defaults 2 s / 10 s / 30 s; `sleep` is injectable (tests record the delays instead of waiting, so the **real delays are asserted**: `[2000, 10000, 30000]`).
- `api.push` returns the HTTP status (0 on network error/timeout) and never throws; the notifier decides: 2xx or 409 → sent; 0 or ≥ 500 → retry (same retry key); other 4xx → throw at once. Error message is `line push failed: <status>` or `line push failed: network`: no body, token, address or LINE id.
- One retry key per `notifyLine` call (`crypto.randomUUID()`), the same on every attempt.
- A `line_pushes` row only after a sent push; `ON CONFLICT (message_id, user_id) DO NOTHING` (AC-7). Not linked → return before any call (no throw, no row).
- `fake-line-api.ts` (TASK-010's file, not on this closed list) cannot answer in a sequence, so the "500, 500, then 200" test flips the fake's response from inside the injected `sleep` instead of editing it.

Evidence:
```
$ DATABASE_URL_TEST=<…/corner_chat_test_b> bun test --preload ./test/setup.ts test/line-notifier.test.ts test/line-webhook.test.ts test/line-api.test.ts test/line-core.test.ts
 87 pass / 0 fail / 1232 expect() calls     (notifier 10, webhook 31, api 13, core 33)
$ …same prefix… bun run test      (whole repo)
 180 pass / 0 fail, 11 files                (Team A's base.test.ts is green again)
$ bunx tsc --noEmit                  → 0 errors, whole repo
```
Covered (DoD): linked U1 → one push: path `/v2/bot/message/push`, `Authorization: Bearer <token>`, `X-Line-Retry-Key` is a UUID, body `{to:"L1", messages:[{type:"text", text:"<about>\n<preview>"}]}` exactly, one `line_pushes` row · `aboutLine null` → `"AI ไม่ได้ตรวจ · สมชาย\n<preview>"` · not linked → no call, no row, no throw · 500, 500, 200 → 3 calls, one retry key, delays `[2000, 10000]`, one row · 500 every time → 4 calls, delays `[2000, 10000, 30000]`, throws `line push failed: 500`, no row · network error (nothing listens on the port) → same retries, `line push failed: network` · 409 → sent, one call, one row · 400 → throws at once, no retry, message has no token, no row · same `messageId` notified twice → two pushes, **one row** (AC-7) · two messages → two rows and different retry keys.

**Test DB (per your update):** I ran on a Team B-only database. `corner_chat_test_b` did not exist; I created it with `CREATE DATABASE corner_chat_test_b` on the team's local cluster (:5433) and prefixed each run with `DATABASE_URL_TEST` (same URL, that database). `.env` untouched. It is local only and stays until TASK-019 lands.

**A stall that was not the shared database, for the record:** one notifier test hung in the runner for 5 s while the process also would not exit, on the shared and on the private database. The cause is Bun's test runner: `await expect(promise).rejects.toThrow(...)` on a promise that still needs database I/O never completes. The same call with `.then(() => null, (e) => e)` does. All my error-path tests use that form now. Nothing in the production code was involved (checked with markers in `notifier.ts`, removed).

```
$ git status --porcelain -uall | grep -E "modules/line|test/line"      (Team B files; the migrations lines belong to the earlier TASKs / Team A)
?? src/modules/line/notifier.ts          (new, this TASK)
?? test/line-notifier.test.ts            (new, this TASK)
   src/modules/line/{index,line-api,types}.ts and test/line-webhook.test.ts   (edited, this TASK)
```

**UNVERIFIED / not done:**
- **Live DoD line (always-rule → LINE event → fake records the push → `notifications_log` `line` row → `GET /admin/stats/line-pushes` +1): `UNVERIFIED — needs TASK-007`.** No `notify.ts`, no `notifications_log` writer, no stats route in my tree.
- `registerNotifier("line", …)` call in `index.ts` — waits for `src/core/notify.ts`.
- Real LINE (B1) — not part of this TASK.

## Questions

## Review
**Verdict: DONE** for the notifier and the ingest wiring. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. Not a test verdict.

Re-run by the SA on the same tree, on `corner_chat_test_b` (:5433), 2026-11-01:
```
$ bun test --preload ./test/setup.ts test/line-notifier.test.ts test/line-webhook.test.ts test/line-api.test.ts test/line-core.test.ts → 87 pass, 0 fail, 1232 expect() [3.44s]
$ bun run test   (whole repo)                                                                                                     → 180 pass, 0 fail, 11 files [12.64s]
$ bunx tsc --noEmit                                                                                                               → exit 0
```
Read against SPEC-002 § LINE notifier:
- Text `aboutLine + "
" + preview`, null → `AI ไม่ได้ตรวจ · <senderName>` ✔. Not linked → return, no call ✔. One UUID retry key reused across
  attempts ✔. 2xx/409 sent · 0/5xx retry at 2/10/30 s (asserted, not waited) · other 4xx throw at once ✔. The error carries the status only ✔.
- `line_pushes` row only after a sent push, `ON CONFLICT DO NOTHING` ✔ (AC-7).
- **Ingest wiring** (`index.ts` → Team A's `ingestMessage`) ✔. The new `createApp()` tests give four real `messages` rows with the right
  `recipient_kind`, redelivery stays four, and nobody-concerned changes no count. **That closes TASK-011's `UNVERIFIED` lines** (AC-2, AC-3 end to end).
- Team B test DB as the TASK said. The Bun `rejects.toThrow` stall was diagnosed to the runner, with markers removed after ✔.
Not part of this verdict: `registerNotifier("line", …)` + the live push check → **TASK-020** (BLOCKED on Team A's TASK-007).
