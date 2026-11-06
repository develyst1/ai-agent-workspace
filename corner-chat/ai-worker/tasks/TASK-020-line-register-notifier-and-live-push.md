# TASK-020: Register the LINE notifier with Team A's notify module + the live push check
- Source: SPEC-002 § LINE notifier step 1 · SPEC-001 §4 (`registerNotifier`), §3.3 (`/admin/stats/line-pushes`) · REQ-003 req 6, 8 · AC-4, AC-7 · carried from TASK-013 (SA review 2026-11-01)
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review)
- Depends on: TASK-013 (DONE) · Team A **TASK-007** (`registerNotifier`, `notifications_log`, the stats route)

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list): `src/modules/line/index.ts` · `test/line-notifier.test.ts`
- Git writes allowed: **none.**
- Tests: Team A's TASK-019 is DONE (2026-11-01), so each run gets its own database. Always run **`bun run test`** (with
  file arguments if you like), never bare `bun test`. No `DATABASE_URL_TEST` prefix any more. Leftovers from a killed run:
  `bun run db:local clean-tests`. (`corner_chat_test_b` may stay; nothing uses it now.)

## What to do
1. In `registerLine`, call Team A's `registerNotifier("line", createLineNotifier({ db: deps.db, config: deps.config }))`,
   using whatever import or `deps` path TASK-007 actually exposes. Read `src/core/notify.ts` first and quote its signature in Notes.
2. One test through `createApp()`: a made-up U1 who is linked, with an `always` rule, plus a LINE `mention` event for U1
   (signed, fake LINE API). The filter decides `notified`, so the fake records one push to U1's LINE id, `notifications_log`
   gets a `line` row with `ok=true`, and `line_pushes` gets one row. If the filter loop is not started in tests, call the
   pipeline the way Team A's own tests do, and say how.

## Definition of Done (paste real output)
- [ ] The `registerNotifier` signature quoted from `src/core/notify.ts`, and the one-line diff in `index.ts`.
- [ ] `bun run test test/line-*.test.ts` green, including the new end-to-end test; then `bun run test` (whole repo) green.
- [ ] Live, local: `bun run dev` (a port that is free), the same flow with `send-event.ts`, then `GET /api/v1/admin/stats/line-pushes`
      with the owner's token → `count` went up by 1 (paste before/after). The fake LINE API stands in for LINE (`LINE_API_BASE`).
- [ ] `git status --porcelain` → only the two files.

## Implementation Notes
**Bob, 2026-11-01.** Test-first: the new end-to-end test in `test/line-notifier.test.ts` was RED (no push happens while nothing is registered), then the one registration in `index.ts` → GREEN. Closed list held (`index.ts`, `test/line-notifier.test.ts`); no new dependency, no git writes.

**Team A's seam, quoted from `src/core/notify.ts`:**
```
9   export type Notification = { userId: string; messageId: string; aboutLine: string | null; preview: string; senderName: string };
10  export type Notifier = (n: Notification) => Promise<void>;
14  export function registerNotifier(name: string, fn: Notifier): void {
```
It is a module function (registry map, registering a name again replaces it), not on `deps`. Our local `Notification` (TASK-013, `types.ts`) is structurally identical, so it is assignable as is; I did not swap the type because `types.ts` is not on this TASK's closed list.

**The diff in `src/modules/line/index.ts`:** the "not registered yet" comment is gone, and
```
+ import { registerNotifier } from "../../core/notify";
+ import { createLineNotifier } from "./notifier";
  …
+ registerNotifier("line", createLineNotifier({ db: deps.db, config: deps.config }));
```
(inside `registerLine`, after the routes). Because the registry is global, the last `createApp()` wins; that is harmless in tests.

**The end-to-end test (through `createApp()`):** U1 linked to `L1`, in group `G1`, with an `always` keyword rule (`ด่วน`); a signed LINE mention event posted to `/api/v1/webhooks/line` → real `ingestMessage` → the row is `pending`. The filter is driven the way Team A's own tests do (`test/notify.test.ts`): `createPipeline({ db, onNotified: createOnNotified({ db, fcm: createFcm("") }) }).runOnce()` (the loop is not started under test). Result: the fake LINE API records exactly one `POST /v2/bot/message/push` with `to: "L1"` and text ending `\nด่วน ช่วยดูหน่อย`; `notifications_log` = `fcm / ok=false / fcm not configured` and `line / ok=true`; one `line_pushes` row; `GET /api/v1/admin/stats/line-pushes` (owner token) went 0 → 1.

Evidence:
```
$ bun run test test/line-*.test.ts      → 95 pass / 0 fail, 5 files
$ bun run test                          → 263 pass / 0 fail, 16 files   (whole repo)
$ bunx tsc --noEmit | grep -c "error TS" → 0
```

**Live, local** (server `bun run dev` on :8091; the fake LINE API as its own process, its URL passed as `LINE_API_BASE`; the seed owner as the linked user; ASCII text; token cut):
```
GET  /api/v1/admin/stats/line-pushes   (token j6NY6q…)   BEFORE → {"month":"2026-11","count":0} [200]
$ send-event.ts live-mention.json                          → 200 {} (43 ms)
GET  /api/v1/admin/stats/line-pushes                       AFTER  → {"month":"2026-11","count":1}
fake LINE API recorded:  POST /v2/bot/message/push  auth=Bearer ***  retry-key=14938171-0a7f-44e9-bf3d-595f74a3b915
                         {"to":"Llive1","messages":[{"type":"text","text":"AI ไม่ได้ตรวจ · สมชาย\nURGENT please look at this"}]}
notifications_log:  fcm | f | fcm not configured      line | t | -
line_pushes rows:   1
```

**Two findings you should know about:**
1. **My first live attempt hit a stray filter loop and made one outbound call to real LINE.** I first ran against the shared **dev** database. Another dev server was already running (`127.0.0.1:8080`, not mine, same tree). Every server's filter loop takes `pending` rows from the same database, so that server claimed my message and ran its own notifier with **its own** `LINE_API_BASE`/token: `notifications_log` showed `line | f | line push failed: 401`, and my fake never saw a push. So one `POST` to the real `api.line.me` went out from that other server, with whatever token it has, to the made-up recipient `Llive1`; LINE answered 401 and nothing was delivered. I did not start or stop that server. I removed my four rows from the dev database (the message, the rule, the link, the group; checked: 0 left) and redid the live run on a database only my server used (`corner_chat_live_b`, created and dropped by me on the local cluster; dev DB untouched since). **Why it matters for the team:** any running dev server processes any `pending` message in the shared dev database, so a QA message meant for a fake can be pushed by a different server using a real token. Worth a rule: one dev server per database, or a database per run for live checks.
2. **Wording, not my change:** a message decided by a *rule* has no AI summary, so Team A's `buildAboutLine` gives `null` and the push text starts `AI ไม่ได้ตรวจ · <sender>` (as SPEC-001 §3.8 / SPEC-002 define for a null `aboutLine`), even though no AI was needed. For the PM/SA to decide whether a rule decision should read differently.

```
$ git status --porcelain -uall | grep -E "modules/line/(index|notifier)|test/line-notifier"
?? src/modules/line/index.ts          (edited, this TASK)
?? test/line-notifier.test.ts         (edited, this TASK)
?? src/modules/line/notifier.ts       (TASK-013's file, untouched here; "??" because the whole tree is still uncommitted)
```
**UNVERIFIED:** real LINE (the test OA, B1) — nothing here talks to real LINE (see finding 1: the one unintended call was rejected with 401).

## Questions

## Review
**Verdict: DONE**. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. Not a test verdict.

Re-run by the SA, 2026-11-01:
```
$ bun run test test/line-api.test.ts test/line-core.test.ts test/line-notifier.test.ts test/line-stats.test.ts test/line-webhook.test.ts → 95 pass, 0 fail, 1261 expect() [4.10s]
$ bun run test   (whole repo) → 296 pass, 20 fail: all 20 in Team A's mail tests (UIDVALIDITY / intake / poller), being built now (src/modules/mail/poller.ts just appeared). Not ours.
```
- `index.ts` registers `registerNotifier("line", createLineNotifier(...))`, imported from Team A's `src/core/notify.ts` as it actually exports (line 14) ✔.
- The end-to-end test drives the real pipeline the way Team A's own tests do: one push to `L1`, `notifications_log` fcm/line rows,
  one `line_pushes` row, stats 0 → 1 ✔ (AC-4 server side, AC-7). The live run on a private DB shows the same ✔.
- **Finding 1 (a call to the real api.line.me):** handled as an incident, not as a defect in this TASK. Bob's code used the
  fake. A stray dev server on :8080 picked up his `pending` row from the shared dev DB. The repo `.env` has an
  **empty** LINE token (the SA checked: length 0), so that call carried no credential and got 401. Nothing was delivered.
  The root cause is my SPEC-002 default (real LINE, no guard for an empty token) → FAILURES entry + TASK-021 (fail closed).
  The "one dev server per database" rule → the PM.
- **Finding 2 (a rule decision pushes `AI ไม่ได้ตรวจ · <sender>`):** right. SPEC-001/002 map a null `aboutLine` that way, but a
  rule decision is not "AI down". Wording/behaviour for the PM (UX) and Team A (`buildAboutLine`) → PM.
