# TASK-010: LINE core: signature check, intake rule, names match, link codes, fake LINE API (pure, unit-tested)
- Source: SPEC-002 § Intake rule, § Linking, § Testability (fake LINE API), § API (webhook signature) · REQ-003 req 3, 4, 9 · AC-2, AC-3, AC-6, AC-8
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review)
- Depends on: Team A **TASK-001** (the repo, `package.json`, `tsconfig.json`, `test/setup.ts` and the empty `src/modules/line/index.ts` must exist). Start when TASK-001 is DONE on the board.

- Repo: `corner-chat-back`. Team B's claim is **only** `src/modules/line/**`, `migrations/*_line_*.sql`, `test/line-*.test.ts` (SPEC-002 § Seams).
- Base: Team A's TASK-001, DONE 2026-11-01 (board). SA read the tree 2026-11-01: all files untracked on `main`;
  `src/modules/line/index.ts` = `registerLine(app: Hono, deps: Deps): void {}`, mounted on the `/api/v1` sub-app in
  `src/app.ts:26`; `Deps = { db, config }` today (TASK-005/007 add `ingestMessage` / `registerNotifier` later; not needed here).
  `bun run test` preloads `test/setup.ts`, which resets the **test DB**. This TASK needs no DB: run
  `bun test test/line-core.test.ts` directly. Paste `git status` + `src/app.ts` in Notes first.
- Files you may edit (closed list, nothing else):
  - `src/modules/line/signature.ts`
  - `src/modules/line/intake-rule.ts`
  - `src/modules/line/names.ts`
  - `src/modules/line/link-code.ts`
  - `src/modules/line/types.ts` (the LINE webhook event types you need, hand-written: no LINE SDK dependency)
  - `src/modules/line/testing/fake-line-api.ts`
  - `test/line-core.test.ts`
- **No new dependency.** `package.json` is Team A's file. Bun's `crypto` and `fetch` are enough.
- Git writes allowed: **none.**

## What to do
Pure functions only: no database, no Hono, no network (except the fake server). TASK-011 wires them.
1. `signature.ts`: `verifyLineSignature(rawBody: string, header: string | null, channelSecret: string): boolean`.
   Base64(HMAC-SHA256(secret, rawBody)) compared with `crypto.timingSafeEqual` (lengths differ → false). Null/empty → false.
   Also export `signLineBody(rawBody, secret): string` (used by tests and the `send-event` script later).
2. `names.ts`: `normalizeNames(input: string[]): string[]`: trim, drop empty, drop duplicates case-insensitively
   (first kept), throws `NamesInvalid` if more than 20 remain or one is > 50 chars. `matchesName(text, names): boolean`:
   `text.toLowerCase().includes(name.toLowerCase())` for any name (SPEC-002: Latin is case-insensitive, Thai as written).
3. `intake-rule.ts`: the in-memory decision of SPEC-002 § Intake rule step 1, as **one pure function**:
   ```ts
   decideGroupMessage(ev: GroupMessageEvent, ctx: {
     linkedByLineId: Map<string, string>;        // LINE userId → our userId (active users only)
     membersOfGroup: Set<string>;                // our userIds with a line_user_groups row for this group
     ownMessageOwner: (lineMessageId: string) => string | undefined;  // our userId if that id is in line_own_messages
     namesByUser: Map<string, string[]>;
   }): { ownMessage?: { userId: string; messageId: string; groupId: string };
         concerned: Array<{ userId: string; recipientKind: 'mention' | 'mention_all' | 'reply_to_me' | 'name_match' }> }
   ```
   Order inside one user: mention → mention_all → reply_to_me → name_match (the first that holds). The sender is never
   in `concerned`. Non-text message → `concerned: []` (still `ownMessage` if the sender is linked). The function must not
   keep or return the text.
4. `link-code.ts`: `newCode(): string` (6 digits from `crypto.getRandomValues`, leading zeros kept); `isCodeShaped(text)`
   (`/^\d{6}$/` after trim); `class WrongCodeLimiter` (5 wrong in 10 min per LINE id → `blocked(lineId)` true for 10 min;
   inject a clock for tests).
5. `testing/fake-line-api.ts`: `startFakeLineApi(): { baseUrl, calls: Array<{method, path, headers, body}>, setResponse(path, status, body), stop() }`
   on `Bun.serve({ port: 0 })`. Default answers: push 200 `{}`, reply 200 `{}`, `GET /v2/bot/group/:g/summary` 200
   `{ groupId, groupName:"กลุ่มทดสอบ" }`, `GET /v2/bot/group/:g/member/:u` 200 `{ displayName:"สมชาย" }`,
   `GET /v2/bot/profile/:u` 200 `{ displayName:"เอ" }`.
6. `types.ts`: only the fields SPEC-002 uses: `source.{type,userId,groupId}`, `message.{id,type,text,quotedMessageId,mention.mentionees[{type,userId?,isSelf?}]}`, `timestamp`, `replyToken`, `joined.members`, `left.members`.

## Definition of Done (paste the real output under Implementation Notes)
- [ ] `bun test test/line-core.test.ts` green, with at least these cases:
  - signature: a correct one → true · one byte of the body changed → false · header missing → false · wrong length → false;
  - **AC-2:** U1 tagged (`type:"user"`, U1's LINE id) → `mention` · `type:"all"` → `mention_all` for every member except the
    sender · `quotedMessageId` owned by U1 → `reply_to_me` · text containing U1's nickname `"aey"` written `"AEY"` → `name_match`;
    Thai nickname `"เอ"` inside `"พี่เอครับ"` → `name_match`;
  - **AC-3:** a text that does none of the four → `concerned: []`, and no `ownMessage` when the sender is not linked;
  - the sender U1 tags themself / writes their own name → U1 not in `concerned` (amended rule);
  - a linked sender → `ownMessage` set even for a sticker; a sticker → `concerned: []`;
  - a user who is linked but **not** in `membersOfGroup` → never concerned;
  - two users concerned by one `mention_all` → two entries;
  - names: 21 names → throws · `" a "`, `"A"` → `["a"]` · 51 chars → throws;
  - link codes: 1,000 codes all match `/^\d{6}$/` · limiter blocks on the 5th wrong try and frees after 10 min (fake clock);
  - fake API: a push POST is recorded with its headers and body.
- [ ] `bunx tsc --noEmit` (or the repo's typecheck script if TASK-001 made one) → no errors in `src/modules/line/**`. Paste the output.
- [ ] `git status --porcelain` → only the closed-list files are new or changed (paste it).

## Implementation Notes
**Bob, 2026-11-01.** Test-first: wrote `test/line-core.test.ts` (33 tests), ran it → RED (`Cannot find module '../src/modules/line/signature'`), then wrote the six files → GREEN.

Files (all on the closed list; nothing else touched, no new dependency, no git writes):
`src/modules/line/{signature,names,intake-rule,link-code,types}.ts`, `src/modules/line/testing/fake-line-api.ts`, `test/line-core.test.ts`.

Decisions I made (internal, reviewer may overturn):
- `verifyLineSignature` compares the UTF-8 bytes of the Base64 strings with `timingSafeEqual` after a length check (length differs → false).
- `decideGroupMessage` walks `membersOfGroup` in Set order; the first of mention → mention_all → reply_to_me → name_match wins per user. `ownMessage` is set whenever the sender is a linked active user, for any message type; a non-text message returns `concerned: []`.
- `matchesName` ignores an empty name (an empty string would match everything).
- `newCode` = `getRandomValues(Uint32Array) % 1_000_000`, zero-padded. Modulo bias is ~4e-4 of one code value: irrelevant for a 10-minute one-time code with the brute-force limiter.
- `WrongCodeLimiter(now = Date.now)`: `recordWrong(lineId)` / `blocked(lineId)`. The 5th wrong try inside a 10-minute window blocks for 10 minutes; older tries do not count. In memory (SPEC-002 D-B3).
- Fake API: `Bun.serve({port:0, hostname:"127.0.0.1"})`; `calls[].body` is the parsed JSON (raw text if not JSON); unknown path → 404 `{}`; `setResponse(path, …)` overrides by exact path.
- `types.ts` also has a `LineEvent` union (message/join/leave/memberJoined/memberLeft/follow/unfollow) for TASK-011; only SPEC-002 fields.

Evidence:
```
$ bun test test/line-core.test.ts
bun test v1.3.14 (0d9b296a)
 33 pass
 0 fail
 1061 expect() calls
Ran 33 tests across 1 file. [52.00ms]

$ bunx tsc --noEmit | grep -E "modules/line|line-core"      (no output = no errors in my files)
$ bunx tsc --noEmit                                         (whole repo, one error, NOT mine)
test/admin-users.test.ts(77,25): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

$ git status --porcelain -uall | grep line
?? src/modules/line/index.ts            (Team A's TASK-001 file, untracked with the whole base)
?? src/modules/line/intake-rule.ts
?? src/modules/line/link-code.ts
?? src/modules/line/names.ts
?? src/modules/line/signature.ts
?? src/modules/line/testing/fake-line-api.ts
?? src/modules/line/types.ts
?? test/line-core.test.ts
```
Covered DoD cases: signature (correct / body byte changed / header missing+empty / wrong length / other secret) · AC-2 (mention, tag-all minus sender, reply_to_me, `AEY` vs `aey`, Thai `เอ` in `พี่เอครับ`, the order between kinds) · AC-3 (none of the four → `[]`, no `ownMessage` for an unlinked sender) · sender tags self / writes own name → not concerned · linked sender sticker → `ownMessage` + `[]` · linked but not in `membersOfGroup` → never concerned · tag-all → one entry per user · result never carries the text · names (21 throws, `" a "`+`"A"` → `["a"]`, 51 chars throws) · codes (1,000 match, limiter 5th wrong blocks / frees after 10 min / old tries expire) · fake API (push recorded with headers+body, default answers, `setResponse`).

Notes for the SA:
- `bunx tsc --noEmit` reports 1 error in Team A's `test/admin-users.test.ts:77` (not my file, not touched). Telling you so Sober can hear it.
- `UNVERIFIED` — the real LINE webhook shape for `mention.mentionees` and `quotedMessageId`: types follow the LINE doc as quoted in SPEC-002; nothing here was run against a real LINE payload (needs B1 / TASK-011's AC-8 test-group check).

## Questions

## Review
**Verdict: DONE**. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. This is not a test verdict (that is QA's).

Re-run by the SA on the same tree, 2026-11-01:
```
$ bun test test/line-core.test.ts      → 33 pass, 0 fail, 1061 expect() calls [45.00ms]
$ bunx tsc --noEmit                     → 1 error, test/admin-users.test.ts(77,25) TS2345, a Team A file; none in src/modules/line/**
```
Read against SPEC-002, all 6 files line by line:
- `signature.ts`: HMAC-SHA256 → Base64 over the raw body, length check before `timingSafeEqual`, null/empty → false. ✔ § API / AC-6.
- `intake-rule.ts`: `ownMessage` for any type when the sender is linked · non-text → `[]` · the sender is skipped · per-user
  order mention → mention_all → reply_to_me → name_match · only `membersOfGroup` are candidates · the text is never
  returned. ✔ § Intake rule 1a–1e, amended rules. Pure: no `console`, `fetch` or `process.env` in `src/modules/line/*.ts`
  (grep, outside `testing/`).
- `names.ts`: trim, drop empty, case-insensitive dedupe (first kept), > 50 → throws, > 20 after dedupe → throws.
  `matchesName` ignores an empty name: a good guard. ✔
- `link-code.ts`: 6 digits zero-padded. The limiter blocks on the 5th wrong try within 10 min, for 10 min, with an
  injected clock. Modulo bias accepted, reasoning sound. ✔ D-B3.
- `fake-line-api.ts`: the defaults and `setResponse` match the TASK. Calls are recorded with headers + parsed body. ✔
- Closed list held: the only Team B files are the 7 listed (plus TASK-001's untracked `index.ts`, untouched). No new dependency.

Accepted decisions (Bob's): Set-order iteration · empty-name guard · the `LineEvent` union added for TASK-011
(only SPEC-002 fields). Carried into TASK-011: a linked user who is tagged but has no `line_user_groups` row is not
concerned. That is correct per SPEC-002 (membership comes from join/link/memberJoined/seen).
`UNVERIFIED` stays as Bob wrote it: real LINE payload shape (needs B1, AC-8 test group).
Team A's tsc error → reported to the PM for Team A (not ours to touch).
