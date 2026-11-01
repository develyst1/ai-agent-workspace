# TASK-007: Notify — FCM push + notifier registry for LINE, devices API, admin LINE push count
- Source: SPEC-001 §3.3 (`/admin/stats/line-pushes`), §3.8, §4 (`registerNotifier`, `Notification`), §5 (`devices`, `notifications_log`), §6 "Notify" · REQ-005 req 3 (server side) · REQ-003 req 6, 8 (server seam) · REQ-001 req 4
- Owner: BE (Jason)
- Status: REVIEW
- Depends on: TASK-006 · a live push needs **B3** (Firebase service-account JSON path in `FCM_SERVICE_ACCOUNT_JSON`) and a
  device token from Team B's app — without them this TASK is still DONE on the mocked tests + the "not configured" path.

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list):
  - `src/core/notify.ts` (`registerNotifier`, `onNotified`), `src/core/fcm.ts`
  - `src/modules/devices/**`, `src/modules/admin/line-stats.ts`, `src/modules/admin/index.ts` (mount only)
  - `src/app.ts` (wire `onNotified` into the filter pipeline's `deps.onNotified` — TASK-005 left that hook)
  - **Step 0 only (added by the SA 2026-11-01, from the TASK-006 review):** `src/filter/pipeline.ts` (the `rule_snapshot` write),
    and the `jsonb` fixture writes in `test/conditions.test.ts`, `test/messages-api.test.ts`, `test/filter-rules.test.ts`
  - `test/notify.test.ts`, `test/devices.test.ts`, `test/line-stats.test.ts`

## What to do
0. **`jsonb` written as an object, not a string** (added 2026-11-01; your finding in TASK-006). In `src/filter/pipeline.ts`, write
   `decisions.rule_snapshot` so that `jsonb_typeof(rule_snapshot) = 'object'` (`::text::jsonb`, or pass the object). Do the same
   for the test fixtures that write `jsonb`. Add one assertion: after a rule decision, `rule_snapshot->>'kind'` equals the
   rule's kind. Existing dev-DB rows may stay as strings; the reader already parses both.
1. Devices API exactly per §3.8 (`PUT /devices` upsert by token — a token seen under another user moves to this one;
   `DELETE /devices/:fcmToken` only the caller's own, else 404).
2. `notify.ts`: `registerNotifier(name, fn)`; `onNotified(messageId)` loads the message + user (skip if the user is disabled —
   REQ-001 AC-4), builds `Notification { userId, messageId, aboutLine, preview, senderName }`, then: FCM to each of the user's
   devices + every registered notifier. Each attempt → `notifications_log` (`target` `fcm` / the notifier name, `ok`, `error`).
   One failure never stops the others and never changes the outcome. Then set `messages.notified_at`.
3. `fcm.ts`: FCM HTTP v1 (`https://fcm.googleapis.com/v1/projects/<project_id>/messages:send`) with an OAuth token from the
   service-account JSON (signed JWT → Google token endpoint; cache the token until 1 min before expiry). Payload per §3.8:
   `notification.title` = `aboutLine` (or `AI ไม่ได้ตรวจ · <senderName>` when `aboutLine` is null), `notification.body` =
   `preview`, `data = { type: "message", messageId }`, Android `priority: "high"`. A 404/`UNREGISTERED` answer → delete that
   device row. **`FCM_SERVICE_ACCOUNT_JSON` unset → skip, log `ok=false, error='fcm not configured'`.** You may add one
   dependency for the JWT only if `crypto.subtle` RS256 signing is not enough — say which and why in Notes.
4. `GET /admin/stats/line-pushes?month=YYYY-MM` (§3.3): `count(*)` from `line_pushes` where `pushed_at` falls in that month in
   Asia/Bangkok; if the table does not exist yet (Team B's migration not in), return `count: 0`.

## Definition of Done (paste real output)
- [ ] `bun test` for the three files green with FCM's HTTP **mocked**: payload exact (title/body/data) · two devices → two sends ·
      a registered fake `line` notifier is called with the exact `Notification` shape · FCM throws → the line notifier still runs,
      both logged · disabled user → nothing sent · `UNREGISTERED` → device row deleted · not configured → logged, no throw ·
      line-stats month boundary in Asia/Bangkok (a push at 2026-11-30T17:30Z counts in December).
- [ ] Live end-to-end without Firebase: ingest a made-up message for U1 with an `always` rule → `notifications_log` has an `fcm`
      row `ok=false, 'fcm not configured'` and `messages.notified_at` is set (paste both rows).
- [ ] Live with B3 + a real device token from Team B's app (only if both exist by then; else `UNVERIFIED — needs B3 and the app`):
      the phone shows the notification.
- [ ] `git status --porcelain` — only closed-list files.

## Implementation Notes
Test-first throughout (step 0 and the rest each ran RED, then GREEN). Working tree only, no git. 2026-11-01. **No new dependency:** the service-account JWT is signed with `crypto.subtle` (RS256, PKCS#8), so `package.json` is untouched.

**Step 0 (jsonb as an object).** RED: the rule-decision test in `filter-rules.test.ts` now asserts `jsonb_typeof(rule_snapshot) = 'object'` and `rule_snapshot->>'kind'` / `->>'value'` equal the rule's → it failed on the old write. Fixed with `::text::jsonb` in `src/filter/pipeline.ts`; the `rule_snapshot` fixtures in `conditions.test.ts`, `messages-api.test.ts` use the same form and no longer `JSON.parse` the value. `grep` of `src` finds no other `JSON.stringify(...)::jsonb` write (the two remaining hits are a comment and the correct settings write). Step-0 files: `52 pass · 0 fail`.

**Files:** `src/core/{notify,fcm}.ts`, `src/modules/devices/index.ts`, `src/modules/admin/line-stats.ts`, `src/modules/admin/index.ts` (mount), `src/app.ts`, `src/filter/pipeline.ts` (step 0), and `test/{notify,devices,line-stats}.test.ts` plus the three fixture edits.

**Decided alone (declared):**
- **`registerNotifier(name, fn)` is a module function** in `src/core/notify.ts` (a registry; the same name replaces). Team B's `registerLine` should call it (`import { registerNotifier } from "../../core/notify"`) — their `index.ts` comment already says so. SPEC-002 §"LINE notifier" speaks of `deps.registerNotifier(…)`; `Deps` was not changed (it is not on my list), so the two specs disagree and the module function is what SPEC-001 §4 promises. SA to settle with SA-B.
- `createOnNotified({ db, fcm, notifiers? })` is the factory (tests pass their own `notifiers` map and a fake `fcm`); `app.ts` builds the real one **only outside tests**, beside the filter loop. `onNotified` still never throws because of a delivery failure; it does throw for an unknown message id (a bug, not silence).
- **All deliveries run at once** (`Promise.all`): FCM sends and every notifier. LINE retries for up to ~42 s; it must not delay the push (tested with a 150 ms notifier). A disabled user returns before anything is sent or logged.
- **`notified_at` is set when the notify step finished, whether or not a delivery succeeded** (the TASK's live check wants it set with only `fcm not configured`). It measures "REQ-005's 1 minute", not "a phone got it".
- **`fcm not configured` is logged once per message, even for a user with no device** (the TASK's live check has none); with FCM configured and no device there is no `fcm` row (no attempt happened).
- **A bare 404 does NOT delete a device.** Only FCM's explicit `UNREGISTERED` error code does (the task text said "404/UNREGISTERED"). A 404 `NOT_FOUND` also comes back for a wrong project id, which would wipe every registration. Tested: `UNREGISTERED`→ device row deleted (other device untouched); plain 404 → `FcmError` code `NOT_FOUND`, no deletion.
- Android `priority` is sent as **`"HIGH"`**, the v1 API's enum name (the TASK wrote `"high"`, the legacy API's spelling). Unverified against real Google.
- `FCM_SERVICE_ACCOUNT_JSON` may hold the JSON itself **or the path of the file**. A configured-but-broken value (bad JSON, missing `project_id`/`client_email`/`private_key`, unreadable path) throws at start-up with a message that never echoes the key; an unusable key only shows when signing (message without key material). Empty = "not configured".
- The access token is cached until 1 minute before it expires; concurrent first sends share one token request; a 401 from FCM clears the cache. FCM and token calls time out after 10 s (`TIMEOUT` / `UNREACHABLE` codes).
- Logged errors are cut to 500 characters and the device token is replaced by `[device token]` if it appears in an error text.
- `preview` for the push is computed with the same rule as the messages list (first two non-empty lines, ≤ 200) — I **duplicated** the 2-line helper in `notify.ts` because `messages/index.ts` is not on my list. Worth moving to one shared helper later.
- Devices: `fcmToken` trimmed, 1–4096 chars; `platform` must be `"android"`; `DELETE` takes the URL-decoded path segment, so a real token with `:` `_` `-` works (tested with `encodeURIComponent`).
- Line stats: months are `Asia/Bangkok`; default = the current Bangkok month; bad `month` → 400 with the field named; table missing → `count: 0`.

**Evidence (real output):**
- `bun run test --timeout 20000 test/notify.test.ts test/devices.test.ts test/line-stats.test.ts` → `38 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `262 pass · 0 fail · Ran 262 tests across 16 files [12.98s]`. `tsc --noEmit` → exit 0.
- DoD cases in tests: payload exact (`title` = aboutLine, `body` = preview, `data` = `{type:"message", messageId}`, Android HIGH) against a **mock Google that verifies the RS256 JWT signature** (header `{alg:RS256,typ:JWT}`, claims iss/scope/aud/iat/exp = iat+3600, grant type `urn:ietf:params:oauth:grant-type:jwt-bearer`) · token cache (reused at +50 min, renewed at 59 min 1 s; one request for 3 concurrent sends) · two devices → two sends and two log rows · a registered fake `line` notifier gets exactly `{userId, messageId, aboutLine, preview, senderName}` · FCM throws → line still runs, both logged, outcome stays `notified` · line throws → FCM still sent · disabled user → nothing sent, nothing logged, `notified_at` empty · `UNREGISTERED` → row deleted · not configured → one logged row, no throw, notifiers run, `notified_at` set · wired into the real pipeline: an `always`-rule message is pushed and logged, a `never`-rule one is not · line-stats: a push at `2031-04-30T17:30Z` counts in **May**, `2031-12-31T17:00:00Z` in **January 2032**, `…16:59:59Z` in December; table renamed away → `{count:0}`, then restored.
- **Live, no Firebase** (own port 8081, throwaway DB `corner_chat_t7_live`, dropped after; `FCM_SERVICE_ACCOUNT_JSON` empty; user U1 with an `always` keyword rule and one registered device; one made-up message ingested through the harness script):
  ```
   notifications_log:  fcm | f | fcm not configured
   message:  outcome notified · filter_state done · notified_at_set t · stored→notified 1.60 s · decided_by rule
  ```
  `PUT /devices` → 204 · `GET /admin/stats/line-pushes?month=2026-11` → `{"month":"2026-11","count":0}` · `DELETE /devices/live-fake-token%3AAPA91b_abc-123` → 204.
- `git status --porcelain` → my files are exactly the closed list incl. the step-0 additions (`src/app.ts src/core/{fcm,notify}.ts src/filter/pipeline.ts src/modules/admin/{index,line-stats}.ts src/modules/devices/index.ts test/{notify,devices,line-stats,conditions,messages-api,filter-rules}.test.ts`).

**UNVERIFIED — needs B3 and the app:** a real push to a phone. Nothing here has talked to Google: the JWT grant, the `messages:send` payload and the `HIGH` priority are checked only against my mock of Google's documented v1 shapes. Also unverified: Team B's `registerNotifier("line", …)` call (not wired on their side yet), and the 60-second refresh margin against a real token.

## Questions
- For the SA: (1) `registerNotifier` as a module function vs SPEC-002's `deps.registerNotifier` — please settle it with SA-B (I would keep the module function). (2) A bare FCM 404 does not delete a device (see above) — say if you want the TASK's literal "404 deletes". (3) `notified_at` = "notify step finished", not "delivered" — fine for REQ-005's timing?

## Review
