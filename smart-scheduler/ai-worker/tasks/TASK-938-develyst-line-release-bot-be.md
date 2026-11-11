# TASK-938: the Develyst LINE release-note bot, phase 1 (a tiny Bun service)
- Source: REQ-5012 phase 1 · owner via Porter, 2026-11-10 01:12 ("build it NOW") · design: Sector [SA-decided]
- Owner: BE (Brew, Team C) · SA: Sector · Status: REVIEW · **Size ≈ 1.5 d** · ready for the owner's env + deploy **11 Nov**.
- **Where:** a NEW folder `develyst-line-bot` next to the other code repos. Its path goes into `machine.local.md` (logical name `develyst-line-bot`); never write the absolute path into a committed file.
  - **Don't run `git init`.** Whether it becomes a repo, and where, is the owner's call (I'll ask through Porter).
- Git writes: none. No real LINE call from you, ever: tests use a fake.

## Design (the contract)
**Stack:** Bun + Hono, one service, files `src/index.ts`, `src/line.ts`, `src/store.ts`, `scripts/send.ts`, tests.

**Env (`.env.example` lists every key, one line each; the real `.env` is git-ignored; the owner fills it; agents never open it):**
- `LINE_CHANNEL_SECRET`: verifies webhooks.
- `LINE_CHANNEL_ACCESS_TOKEN`: pushes.
- `LINE_API_BASE`: **empty by default ⇒ no outside call at all** (send answers 503 `NOT_CONFIGURED`). The owner sets `https://api.line.me` on the server. Tests point it at a local fake.
- `SEND_KEY`: a long random key that the desk's send command must present.
- `PUBLIC_BASE_URL`: the service's own HTTPS origin, used to build the image URLs.
- `PORT`, `DATA_DIR` (default `./data`, git-ignored).

**Routes:**
1. `POST /line/webhook`:
   - verify `X-Line-Signature` = base64(HMAC-SHA256(`LINE_CHANNEL_SECRET`, raw body)), compared in constant time. Missing or wrong → **401**, nothing read.
   - Valid: for each event with `type === "join"` and `source.type === "group"`, write `{ groupId, joinedAt }` to `DATA_DIR/group.json` (the latest join wins). Then **200**.
   - **Nothing else is stored or logged:** no message text, no user ids (phase 2 is out of scope). A `message` event is answered 200 and dropped.
2. `POST /send` (the desk's command calls it): header `Authorization: Bearer <SEND_KEY>` (wrong → 401). Multipart: `text` (required, 1–4,000 chars, Thai OK) + `image` ×0–3 (JPEG/PNG only, each ≤ **1 MB**, since LINE's preview limit is 1 MB and we reuse one URL for both).
   - No `group.json` → 409 `NO_GROUP`.
   - `LINE_API_BASE` or token empty → 503 `NOT_CONFIGURED`.
   - Otherwise save each image as `DATA_DIR/img/<random 32-hex>.<ext>` and push `POST {LINE_API_BASE}/v2/bot/message/push` with body `{ to: groupId, messages: [{type:"text", text}, ...images.map(u => ({type:"image", originalContentUrl:u, previewImageUrl:u}))] }`, plus header `X-Line-Retry-Key: <uuid>` so a retry never posts twice.
   - Answer `200 { sent: true, messages: n }`. A LINE error → **502** with LINE's status (no token in the body or logs).
   - **`?dryRun=1`** returns `200 { dryRun: true, body }` and sends nothing. That's the preview the owner sees before he says "ส่ง".
3. `GET /img/:name`: serves only files matching `^[0-9a-f]{32}\.(jpg|jpeg|png)$` from `DATA_DIR/img`, with the right content type. Anything else → 404 (no path traversal).
4. `GET /health` → 200 `{ ok: true, groupKnown: bool }`. No secrets.

**`scripts/send.ts` (run by the desk ONLY after the owner's "ส่ง", quoted in the log):** `bun scripts/send.ts --text note.txt [--img a.png ...] [--dry-run]`. It reads `BOT_URL` + `SEND_KEY` from a local git-ignored `.env.send`, which the owner fills. It prints the answer; it never prints the key.

## Definition of Done
- [ ] Tests (`bun test`, no network):
  - the signature: valid / wrong / missing / a body changed by one byte;
  - a join event stores only the group id; a message event stores nothing;
  - the push body shape for 0 / 1 / 3 images (and 4 → 400);
  - an image too large / the wrong type → 400;
  - `NOT_CONFIGURED`, `NO_GROUP`, `dryRun`;
  - `/img` refuses `../x` and a non-hex name;
  - the retry key is set.
- [ ] `tsc` 0. `.env.example` complete; `.gitignore` covers `.env`, `.env.send`, `data/`.
- [ ] **A one-line deploy note** in Implementation Notes for Porter / the owner. It's a single Bun service: `bun install && bun run src/index.ts` behind HTTPS on the owner's platform (Otto's `new-app`). Set the LINE webhook URL to `https://<host>/line/webhook` in the LINE console, then add the OA to the "SOM SYSTEM" group.
- [ ] `/security-review` notes (the webhook signature, the send key, file serving).

## Implementation Notes
(Brew, 2026-11-10. Folder `develyst-line-bot` (path in `machine.local.md`, added by Sector). No `git init`, no git, no real LINE call, no secret opened. Bun 1.3.14, Hono 4.13.17, TypeScript 5.9.2 pinned.)
- **Files:** `src/index.ts` (the app: `createApp(cfg, {fetch?, store?})`, `loadConfig`, the server only when run as main) · `src/line.ts` (signature check, push body, the push call) · `src/store.ts` (`group.json`, images, name rule, magic-byte sniffing) · `scripts/send.ts` (the desk command, `runSend` is testable) · `src/bot.test.ts` (37 tests) · `src/test-types.d.ts` (tests read JSON loosely) · `package.json`, `tsconfig.json`, `bun.lock`, `.gitignore` (`.env`, `.env.send`, `data/`, `node_modules/`), `.env.example` (7 keys, one comment line each, pinned by a test), `.env.send.example`.
- **Deploy note (one line, for Porter / the owner):** one Bun service: `bun install && bun run src/index.ts` behind HTTPS on the owner's platform (Otto's `new-app`); fill the server `.env` (`LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_API_BASE=https://api.line.me`, `SEND_KEY`, `PUBLIC_BASE_URL`); set the LINE webhook URL to `https://<host>/line/webhook` in the LINE console, then add the OA to the "SOM SYSTEM" group; the owner fills `.env.send` (`BOT_URL`, `SEND_KEY`) on the machine where the desk runs `scripts/send.ts`. Until `LINE_API_BASE` is set the bot makes NO outside call.
- **Decisions where the TASK was silent (overrule any):**
  1. **Order of checks on `/send`:** key (401) → form + text + images (400) → `?dryRun=1` returns the preview → no group (409) → not configured (503) → save images → push. So the owner can preview BEFORE the bot is configured or added to the group (`body.to` is `null` until a join).
  2. **dryRun writes nothing:** the image URLs in the preview are placeholders (`<PUBLIC_BASE_URL>/img/<random-1>.png`); the real names exist only on a real send.
  3. **"≤ 1 MB" = 1,000,000 bytes** (the stricter reading; exactly 1,000,000 is in, 1,000,001 is out).
  4. **Image type is decided by the file's first bytes** (JPEG `FF D8 FF`, PNG all 8 bytes), never by the name or declared type; a `.gif` renamed `.png` is 400, a PNG named `.gif` is accepted and stored as `.png`. The extension is `jpg` for JPEG (a `jpeg` name still serves).
  5. **Text limit is counted in UTF-16 units** (`text.length`), 1–4,000; a blank text is 400.
  6. **Images need `PUBLIC_BASE_URL`**; with an image and no public URL the send is 503 `NOT_CONFIGURED` (text-only still goes). (LINE needs an https image URL; I do not enforce `https://` in code, the owner sets it.)
  7. **Retry key:** a new UUID per call, or the caller's `X-Line-Retry-Key` when it is a valid UUID (so a retried `/send` posts once). `scripts/send.ts` does not send one yet (a retry from the desk is a new send); say if you want it to.
  8. **A LINE failure removes the images it saved** and answers 502 `{code:"LINE_ERROR", lineStatus}` (null when LINE is unreachable); neither LINE's body nor the token is returned or logged.
  9. **A webhook over 1 MB** is 413 (declared length or real length). Empty `LINE_CHANNEL_SECRET` or `SEND_KEY` fails closed (401), never open.
  10. **`/img` is public by design** (LINE fetches without a key; the 128-bit random name is the capability). Only `^[0-9a-f]{32}\.(jpg|jpeg|png)$` is served; the check is anchored and the path is built only from a name that passes it.
  11. Stored on disk: `group.json` = `{groupId, joinedAt}` only. No message text, no user id, is stored or logged anywhere (a test greps the source's `console.*` lines).

## Questions
- None blocking. For the owner (via Sector): who runs `git init` and where; and whether `scripts/send.ts` should keep a retry key between desk runs (today one run = one send).

## Review (Brew, 2026-11-10 — status REVIEW)
- **Tests (`bun test`, no network, 37 pass · 0 fail · 341 expects):** the signature (valid / wrong / missing / another secret / one changed byte / empty secret); join stores only the group id (latest wins); a message / room / user event stores nothing; `/send` gate (no key, wrong key, empty `SEND_KEY`); text 4000 in / 4001 out / blank / missing; images 3 in / 4 out / exactly 1,000,000 in / 1,000,001 out / wrong bytes / empty; the push body for 0 / 1 / 3 images with the headers and the retry key; `NO_GROUP`, `NOT_CONFIGURED` (each of base, token, public URL), `dryRun`; LINE 429 → 502 with no token in the body; unreachable LINE → 502; `/img` refuses `../`, encoded traversal, non-hex, wrong length / extension / case, a file on disk under a bad name; `/health` carries no secret; `.env.example` lists every key the code reads; `scripts/send.ts` (args, env file, `?dryRun=1`, never prints the key).
- **Fake LINE:** the pushes go to a local `Bun.serve` on a free port that records the request; `loadConfig({})` has an empty `apiBase`, and the smoke below made **0 outside calls**.
- **`tsc` (5.9.2): 0.**
- **Mutation set (in place, restore, hash identical on all 4 files): 48 mutants, 45 killed, 3 not killed:** (a) `JSON.stringify(g)` for `JSON.stringify({groupId, joinedAt})`: equivalent, since the type only has those two keys; (b) `expected !== "" &&` in the key compare: equivalent, since the `Bearer (.+)` match already refuses an empty key; (c) one anchor that did not match (my own bad mutant, not run). The first run had 10 survivors; I added 6 pin tests for them (anchored name regex, whole-signature sniffing, random names, room/user joins with a group id, declared-oversize webhook).
- **Smoke (the real app over a real local socket, default env, `LINE_API_BASE` empty):** health 200 `groupKnown:false` → send with no key 401 → send before join 409 `NO_GROUP` → webhook with a bad signature 401 → with a good one 200 → health `groupKnown:true` → send 503 `NOT_CONFIGURED` → `?dryRun=1` 200 with the Thai text → `/img/..%2Fgroup.json` 404 → data dir has only `group.json` (`{"groupId":"Csmoke","joinedAt":"2023-11-14T22:13:20.000Z"}`) and `img/` → **outside calls: 0**.
- **/security-review notes:**
  - **Webhook signature:** HMAC-SHA256 over the RAW bytes, `timingSafeEqual` on equal-length buffers, base64 decoded; empty secret never verifies; nothing is parsed or stored before it passes; body capped at 1 MB.
  - **Send key:** compared by `timingSafeEqual` on SHA-256 digests (no length leak), empty key refuses everything; the only credential in the request is the `Authorization` header; the key is never printed (`send.ts`) or logged; no `/send` rate limit (it is a single-owner command behind a long random key; the platform's HTTPS and Cloudflare are the outer layer).
  - **File serving:** public by design; only the anchored random-name pattern is served, from one directory, with `nosniff` and the right type; files are written by the bot only, under a random name, after a magic-byte check (JPEG / PNG only), ≤ 1 MB, ≤ 3 per send, so no HTML/SVG is ever served.
  - **Data kept:** the group id and a time. No message text, no user id, nothing logged but a start line and an error NAME. The token goes only into the outgoing push header; a LINE failure never echoes it.
  - **Secrets:** `.env` / `.env.send` / `data/` git-ignored; no agent opened any `.env`; test values are made up.
  - **Not done / owner's:** HTTPS termination, the LINE console setup, `git init`, a real push (never run by me).
- **`git status`:** not a repo (no `git init`, as told); the folder has only the files listed above plus `node_modules`.

## Review 1 (Sector, 2026-11-10): small REWORK (one gap), the rest ACCEPTED
- **Re-run by me:** `bun test` **37 pass · 0 fail**; tsc 0. `.gitignore` covers `.env`, `.env.send`, `data/`, `node_modules/`; `.env.example` + `.env.send.example` list every key with its purpose.
- **Read and accepted:**
  - the webhook HMAC with a constant-time compare (`line.ts:6–13`);
  - the send key compared in constant time via hashes, with an empty key refusing all (`index.ts:40, 78`);
  - only a group join is stored, everything else is dropped;
  - images sniffed by magic bytes, ≤ 1,000,000 bytes, ≤ 3;
  - `/img` only for `^[0-9a-f]{32}\.(jpg|jpeg|png)$` (`store.ts:12`);
  - images removed if LINE refuses;
  - no outside call with an empty `LINE_API_BASE` (your local-socket smoke: 0 calls).
- **Your 4 decisions: accepted.** dryRun before 409/503 (the owner can preview before the bot is configured), 1 MB = 1,000,000 bytes, magic bytes, and passing a caller's valid retry key through.
- **🔁 REWORK, the one gap:** the contract says a retry never posts twice. Today `send.ts` sends no `X-Line-Retry-Key`, so the server makes a NEW UUID on each call. A re-run after a timeout (LINE got it, the desk didn't hear back) **posts twice into the customer group.**
  - **Fix (`scripts/send.ts` only):** make one UUID per send, send it as `X-Line-Retry-Key`, **print it**, and accept `--retry-key <uuid>` so a re-run of the same note reuses it.
  - On any non-200, print "re-run with --retry-key <uuid>; do not change the text or images".
  - One test: the same key twice → the fake LINE sees the same retry key both times.
- Security review: signature + key in constant time; capability URLs for images (128-bit random); no secret in responses/logs; fail-closed by default. **None open after the rework.**
- **Owner items (via Porter):** env values; HTTPS deploy (Otto `new-app`); LINE console (webhook URL, enable webhook) + adding the OA to "SOM SYSTEM"; `git init` or not.

## Rework 1 (Brew, 2026-11-10): one retry key per send — done
- `scripts/send.ts` only. One UUID per send (or the one given with `--retry-key <uuid>`, validated), sent as `X-Line-Retry-Key`, and **printed** (`retry-key: <uuid>`). A run that times out (no answer) or gets any non-2xx prints `re-run with --retry-key <uuid>; do not change the text or images`; a success does not print the hint. A bad `--retry-key` exits 2.
- Tests: **39 pass · 0 fail** (2 new): the same key twice → the fake LINE sees the same `X-Line-Retry-Key` both times, a fresh send gets a fresh key, no hint on success, the key never appears with `SEND_KEY`; timeout / 502 print the key + hint; bad key refused. tsc 0.
- Mutation on the new lines: 5 of 6 run killed; the survivor (hint printed on success too) was killed by one more assertion; 1 anchor stale. Earlier set: 44 killed, 2 equivalent, 2 stale anchors.

## Review 2 (Sector, 2026-11-10): ✅ DONE
- **Re-run by me:** `bun test` **39 pass · 0 fail**; tsc 0.
- `scripts/send.ts:54`: `retryKey = a.retryKey ?? randomUUID()`. One key per send, sent as `X-Line-Retry-Key` (`:59`) and printed. `--retry-key` is validated as a UUID (`:26–29`). A failure prints the re-run hint. The gap is closed.
- **Ready for the owner (via Porter):** fill `.env` (secret, token, `LINE_API_BASE=https://api.line.me`, `SEND_KEY`, `PUBLIC_BASE_URL`) and `.env.send` (`BOT_URL`, `SEND_KEY`); the HTTPS deploy (Otto `new-app`); in the LINE console set the webhook URL `https://<host>/line/webhook` and turn the webhook on; add the OA to "SOM SYSTEM" (that one join stores the group id); decide on `git init`. **A post goes out only after his "ส่ง"** (REQ-5012).

- **Repo (Sector, 2026-11-10, under the owner's full-git grant for this repo):** connected to `github.com/develyst1/develyst-line-bot`. Pushed **main `b1ffa6c`** on top of his `39ff43c` Initial commit (no force). No `.env` / `.env.send` / `data/` committed.
