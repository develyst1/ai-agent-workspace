# TASK-943: Develyst LINE bot, phase 2: record the SOM SYSTEM group's messages + an authenticated GET /messages
- Source: REQ-5012 phase 2 · owner via Porter, 2026-11-10 02:14 (*"เมื่อไหร่นายจะตอบแทนได้วะ"*) · design: Sector [SA-decided]
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW · **Size ≈ 1 d**, ready for review **10 Nov evening**.
- Repo: `develyst-line-bot` (`machine.local.md`). **Branch:** work on `dong` (the working branch, SYSTEM-FACTS). Brew never runs git; I commit and merge when it's reviewed.

## 🔴 The consent rule (REQ-5012 phase 2, verbatim intent): recording is OFF until the owner turns it on
- New env **`RECORD_GROUP_MESSAGES`**: empty / anything but `true` ⇒ **nothing is stored** (today's phase-1 behaviour).
- The owner sets it to `true` **only after he has told the group** that the bot is in it and records messages for the project. That's his step, not ours.
- **Replying stays phase-1:** a post goes out only through `/send` after the owner's "ส่ง" (REQ-5012 "Out of scope: posts without the owner's ส่ง"). This TASK adds **no** outbound message and no auto-reply.

## Design (the contract)
1. **Webhook (`POST /line/webhook`, signature check unchanged).** When recording is on, for each event with `source.type === "group"` and `source.groupId === the stored group id` (any other group or a 1-to-1 chat: **dropped**, nothing stored):
   - `message` / `text` → a record `{ id: <LINE message id>, at: <ISO from event.timestamp>, userId, name, kind: "text", text }`;
   - `message` / any other type (image, sticker, video, file, location…) → `{ …, kind: "<type>", text: "[<type>]" }`. **The content is never downloaded or stored.**
   - Other events (join, leave, unsend, member joined…): `unsend` marks the stored record `unsent: true` and **blanks its text** (respect the deletion). The rest are ignored.
   - **Dedupe** by LINE message id (a redelivered webhook stores once).
2. **The sender name.** Resolve `name` with LINE's read-only **Get group member profile** (`GET {LINE_API_BASE}/v2/bot/group/{groupId}/member/{userId}`), **cached** per userId in `DATA_DIR/members.json`.
   - No `LINE_API_BASE` / token, or a failed call ⇒ `name: null`, never block storing.
   - This is the only new outbound call, and it's a GET with no message.
3. **The store:** `DATA_DIR/messages.jsonl`, append-only, one JSON per line (git-ignored, on the server only).
   - **Retention:** drop records older than **90 days** on each write (default; env `MESSAGE_RETENTION_DAYS`).
   - No message text in logs, ever.
4. **`GET /messages?since=<ISO time or message id>&limit=<1–500, default 200>`:** `Authorization: Bearer <SEND_KEY>` (the same constant-time check; wrong or missing → 401).
   - Returns `200 { messages: [...oldest first, after since], next: <id of the last one or null> }`.
   - Recording off → `200 { messages: [], recording: false }`, so the desk knows why it's empty.
5. **`GET /health`** gains `recording: bool` (no counts, no text).

## Privacy (desk side, for Porter; not code)
Pulled messages may hold personal data. The desk keeps raw pulls only in the git-ignored `ai-worker/.private/`, summarises into desk files, and **never pastes raw text into shared files** (REQ-5012 phase 2, our privacy rule).

## Definition of Done
- [ ] Tests (no network, the fake LINE):
  - recording off ⇒ nothing stored;
  - on ⇒ text stored with its fields; image/sticker → placeholder, no download;
  - another group / 1-to-1 dropped;
  - dedupe;
  - unsend blanks the text;
  - retention prunes;
  - the profile name cached, and a failure gives null;
  - `/messages` auth 401 / since by time and by id / limit / `recording: false`;
  - no message text in logs (a spy on the logger).
- [ ] `tsc` 0; `.env.example` gains `RECORD_GROUP_MESSAGES` (+ its one-line purpose: "true only after the owner told the group") and `MESSAGE_RETENTION_DAYS`.
- [ ] The desk pull: `scripts/pull.ts --since <iso|id>` writes the result to a path given with `--out` (the desk points it into `.private/`) and prints only the count + the `next` id.
- [ ] `/security-review` notes (stored personal data, auth on read, the new GET to LINE).

## Implementation Notes
(Brew, 2026-11-10. Repo `develyst-line-bot`. **The checkout is on `main`, not `dong`** (the TASK says work on `dong`); I ran no git and did not switch branch: the edits are uncommitted in the working tree, so whichever branch you check out carries them. No real LINE call, no secret opened.)
- **New / changed files:** `src/messages.ts` (new: the message store, `safeKind`) · `src/line.ts` (+ `getGroupMemberName`, the only new outbound call) · `src/index.ts` (config, recording in the webhook, `GET /messages`, `/health.recording`) · `scripts/pull.ts` (new) · `.env.example` (+ `RECORD_GROUP_MESSAGES`, `MESSAGE_RETENTION_DAYS`, each with its one-line purpose, "true only after the owner told the group" included) · `src/messages.test.ts` (new, 35 tests) · `src/bot.test.ts` (the config helper gained the 2 new fields; the two `/health` pins gained `recording:false`).
- **Consent:** `RECORD_GROUP_MESSAGES` is on only when it is exactly `true` after trimming (`TRUE`, `1`, `yes`, `on` are OFF; tested). Off = today's phase 1: nothing stored, no file, no profile call. `/messages` then answers `200 {messages: [], recording: false}` (after the key check).
- **No new outbound message:** the only added outbound request is LINE's read-only `GET {LINE_API_BASE}/v2/bot/group/{groupId}/member/{userId}` (3 s timeout, ids URL-encoded); a test pins that `line.ts` still has exactly one POST (the owner-approved push) and that `/v2/bot/message/reply` is nowhere.
- **Recording rules (as the contract):** only events whose `source.type` is `group` AND `groupId` equals the stored group (another group, a room, a 1:1, and anything before the first join are dropped). `text` → stored with its text (cut at 5,000 characters); any other type → `[<type>]`, the content is never fetched; a type that is not `[a-z]{1,20}` becomes `unknown` (it cannot forge text). `unsend` blanks the text **on disk** (atomic rewrite) and sets `unsent: true`; the unsend of an unknown id or of another group's does nothing. Dedupe by LINE message id: a redelivery stores once and asks LINE for nothing.
- **Name:** cached per userId in `DATA_DIR/members.json`; no base/token, a non-200 (even one with a `displayName` in the body), a bad body, a timeout or an unreachable LINE → `name: null`, the record is still stored, and a failure is **not cached** (the next message retries).
- **Store:** `DATA_DIR/messages.jsonl`, one JSON per line. A write is a plain append unless something has expired, in which case the file is rewritten atomically without the expired records (default 90 days, `MESSAGE_RETENTION_DAYS`; a record exactly at the cutoff stays; a value that is not a whole number ≥ 1 falls back to 90). A torn or foreign line in the file is skipped, never fatal.
- **`GET /messages?since=&limit=`:** same constant-time key as `/send` (401 otherwise). `since` = a known message id (records after it) or an ISO time (records strictly after it; it must start `YYYY-MM-DD`, so a bare `2026` is not a year); anything else is 400. `limit` 1–500, default 200; otherwise 400. Answer `{messages (oldest first), next (the id of the last one, or null)}`. An unsent record is listed with `text: ""` and `unsent: true`. The fields are exactly `id, at, userId, name, kind, text[, unsent]`.
- **A recording failure never fails the webhook** (a non-200 would make LINE redeliver for ever): it is caught and logs the error NAME only. **No message text is logged anywhere**; two tests put a spy on every `console` method (the normal path and the failure path) and assert the Thai text never appears.
- **`/health`** gains `recording: bool`, nothing else (no counts, no text).
- **`scripts/pull.ts --since <iso|id> --out <path>`:** pages of 500 until a short page, writes `{pulledAt, messages}` to `--out` (the desk points it into `.private/`), and **prints only `count: N` and `next: <id>`**; "recording is OFF" when the bot says so; a 401 / timeout is a non-zero exit and writes nothing.
- **One thing to know (retention vs an old `since`):** a webhook for a message whose own timestamp is older than the window is stored and then pruned by the next write. That is the retention rule working, not a bug.

## Questions
- None blocking. For the owner (via Sector): the group must be told BEFORE `RECORD_GROUP_MESSAGES=true` is set on the server. For the branch: I stayed on `main` as found; say if you want the edits moved.

## Review (Brew, 2026-11-10 — status REVIEW)
- **Tests (no network, a local fake LINE): 74 pass · 0 fail · 512 expects** (39 phase-1 + 35 new). **`tsc` 5.9.2: 0.** Covered, each as its own test: consent (exact `true` only; off stores nothing and makes no call); text stored with every field; image / sticker / video / audio / file / location → placeholder with no download; a hostile type; another group / room / 1:1 / before any join / no `groupId` dropped; a missing message id or user id; dedupe (and LINE not asked again, and the store refusing a second copy); unsend blanks the text on disk; the name cached / a failure gives null and is not cached / no base or token → no call / a 404 that carries a name / the timeout signal / id encoding (user and group); retention (boundary kept, half-day window, end to end, plain append when nothing expired); a torn file; `/messages` 401 (none / wrong / empty key), oldest-first and `next`, `since` by time and by id, bad `since` 400, limit default / 1 / 500 / 0 / 501 / abc / 1.5 / -1 / empty, unsent listed blank, `recording:false`; no text in logs; `pull.ts` (args, 1,200 messages over 3 pages, only count + next printed, off / 401 / timeout write nothing); `.env.example` and `.gitignore`; no new outbound POST.
- **Mutation set (in place, restore, hash identical on all 4 files): 58 mutants, 56 killed, 2 not killed:** one is equivalent (`g?.groupId` for `g.groupId` in the group check: a group message with no id before any join throws inside the recording `try`, which is caught and answers 200, same as the original); one is a stale anchor of mine (an authorization-header removal that no longer matched; that header is pinned by the profile-call test). The first run had 9 survivors; I added 4 tests for them (dedupe at each layer, a torn file, URL-encoding, a 404 with a name, the timeout signal, a group event with no id).
- **Smoke (the real app over a real local socket, a local fake LINE, recording ON):** join 200 → text + image + another group's text 200 → unsend of the image 200 → `/messages` with no key **401**; with the key **2 messages** (kinds `text,image`, **1 unsent**, name `Somchai`, `next` = the image's id) → `since=<text id>` **1** message → `pull.ts` printed exactly `count: 2 / next: m2` and wrote 2 → **LINE saw ONE request in total: the member GET** (the second message came from the cache) → the unsent image's text is blank on disk → `/health` `{ok, groupKnown:true, recording:true}`.
- **`/security-review` notes:**
  - **Stored personal data:** group message text, LINE user ids and display names, on the server only (`data/`, git-ignored), kept ≤ 90 days (configurable), unsent text blanked on disk, non-text content never downloaded or stored. Recording is OFF unless the owner sets one env value after telling the group.
  - **Auth on read:** `/messages` uses the same constant-time key check as `/send` (SHA-256 digests, empty key refuses everything); a wrong key reads nothing; `limit` is capped at 500; a bad `since` is 400, not an error with data.
  - **The new GET to LINE:** read-only, carries the channel token as `Authorization`, goes only to `LINE_API_BASE` (empty = no call), the group / user ids are URL-encoded into the path, 3 s timeout, the response is read for `displayName` only and never logged.
  - **Logs:** no message text, name or id is logged (a start line and an error NAME only; tested with spies).
  - **Webhook:** signature check unchanged and first; a recording failure is caught, so it never opens a redelivery loop.
  - **Desk side (Porter's privacy rule):** `pull.ts` writes raw text only to the path the desk gives (`.private/`) and prints counts; raw text must not be pasted into shared files.
  - **Not done / owner's:** setting `RECORD_GROUP_MESSAGES=true` (after he tells the group) and redeploying.
- **`git status` (develyst-line-bot):** `M .env.example` · `M src/bot.test.ts` · `M src/index.ts` · `M src/line.ts` · `?? scripts/pull.ts` · `?? src/messages.ts` · `?? src/messages.test.ts` (plus `.github/`, which is not mine).

## Review (Sector, 2026-11-10): ✅ DONE
- **Re-run by me:** `bun test` **74 pass · 0 fail**; tsc 0.
- **Read in code:**
  - `recordMessages` = env exactly `"true"` (`index.ts:32`); the webhook stores a message only when that's on **and** it comes from the stored group (`:131–133`), else drops it;
  - a store failure logs only the error name (`:137`);
  - `GET /messages` checks the key first (`:147`) and answers `recording: false` when off;
  - no new outbound message (a test pins one POST in `line.ts`); the only new LINE call is the read-only member GET.
- **Accepted from the report:** dedupe; unsend blanks the text on disk; 90-day retention; `pull.ts` prints only count + next; logger spies; your real-socket smoke (one request to LINE in total, the member GET).
- **Your flag (checkout on `main`): handled.** I switched to `dong` (= main's commit) carrying your edits.
- **Committed + pushed: `dong` `8427a0e`** (on `b1ffa6c`; your 7 files only; Otto's untracked `.github/` left out).
- **Next (git, me):** once Porter rings that the owner's 2 CI secrets are in → commit Otto's workflow, bring `dong` → `sit` (no force) and report whether Actions ran.
- **Owner steps:** tell the group the bot records messages → set `RECORD_GROUP_MESSAGES=true` → redeploy. **Posts still only via /send after his "ส่ง".**
- Security review: stored group messages are personal data, server-side in git-ignored `DATA_DIR` only, 90-day retention, read only with the key; no text in logs; consent gate off by default. **None open.**
