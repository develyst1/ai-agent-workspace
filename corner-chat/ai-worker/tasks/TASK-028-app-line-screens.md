# TASK-028: LINE screens: link with a code, names list, my groups (fake + HTTP)
- Source: SPEC-003 rev 2 § Screens (`/channels`, `/channels/line`, `/channels/line/names`, `/channels/line/groups`) · SPEC-002 § API (shapes exact) · SPEC-001 §3.6/§3.7 (`GET /channels` → `{ mail, line }`, `LineChannel { linked, displayName }`) · REQ-003 req 1, 2, 5, AC-1, AC-5 · REQ-003 wording
- Owner: FE (Fanta)
- Status: DONE 2026-11-01 (SA-B review below)
- Depends on: TASK-027 (`api-client.ts`, sign-in). Team B's LINE endpoints (TASK-012) are DONE. Replaces TASK-016 (SUPERSEDED).

- Repo: `corner-chat-app`. Files you may edit: `src/data/models.ts` (add `Channels`, `MailChannel`, `LineChannel`, `LinkCode`, `LineGroup`) ·
  `src/data/repositories.ts` (`ChannelsRepo`: `channels()`, `newLinkCode()`, `unlinkLine()`, `lineGroups()`, `lineNames()`, `saveLineNames(list)`) ·
  `src/data/fake/channels.ts`, `src/data/http/channels.ts` · `src/features/channels/**`, `src/features/line/**` · `src/app/strings-th.ts`,
  `src/app/routes.tsx` · `src/test/line.test.tsx`. **Reuse** `api-client.ts`; do not change it.
  · **Added 2026-11-01 (TASK-027 review Q2):** `src/features/signin/**` + `src/test/signin.test.tsx`, for the last step only.
- Git writes allowed: **none.**

## What to do
1. `/channels`: the two rows with their states from `channels()`. Zimbra opens its placeholder (TASK-029).
2. `/channels/line`, not linked: the link wording, the 6-digit code shown large, a countdown `รหัสหมดอายุใน mm:ss` from
   `expiresAt`, and `ขอรหัสใหม่`. Poll `channels()` every 3 s while a code is open. Once `line.linked` is true: stop polling and
   show `เชื่อม LINE แล้ว` + `displayName`, links to names and groups, and `เลิกเชื่อม` (confirm, then `unlinkLine()`). When the
   code expires it greys out and only `ขอรหัสใหม่` remains.
3. `/channels/line/names`: list, an add field, delete per row. Every change saves the whole list with `saveLineNames`. A 400
   `VALIDATION` shows `เกิดข้อผิดพลาด ลองอีกครั้ง`. An empty list shows the empty text from SPEC-003 § Wording.
4. `/channels/line/groups`: name + Thai "last seen" time per row, and the empty text. The one-OA-per-group help text (REQ-003
   wording) is always visible under the list (AC-5).
5. Fake: starts not linked, and the 3rd poll after a code turns linked (`displayName: "เอ"`). HTTP: exactly the SPEC-002 /
   SPEC-001 paths and keys. Every control has a `data-testid`.
6. (From TASK-027 Q2.) On `/signin`, the error line must not push the button down. Reserve its line, or put the error under the
   button. Keep `role=alert`. Show it in one screenshot at 360 px, before and with the error.

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green: the fake goes from code to linked after polling · the countdown reaches 00:00 →
      only the new-code button · names add/delete call `saveLineNames` with the full list · groups empty state + help text.
- [ ] Screenshots (FAKE, browser 360×800 + the emulator) → `../ai-worker/tests/harness/task-028/`: `channels.png`, `line-code.png`,
      `line-linked.png`, `line-names.png`, `line-groups.png`, `line-groups-empty.png`.
- [ ] **Live, local** (the TASK-027 back-end recipe, own DB and port; sign in through `/signin`): get a code, write it in
      `## Questions`, and the SA sends it through `send-event.ts` (the back repo is not yours) → the screen turns `เชื่อม LINE แล้ว`. Screenshot.
- [ ] `git status --porcelain` → only listed files.

## Implementation Notes
Fanta (FE-B), 2026-11-01. Repo `corner-chat-app`, base `main` `f5e060d`, nothing committed (git writes: none). `corner-chat-back`: I wrote nothing there. `api-client.ts` is reused, not changed.

**Built (steps 1–6).**
- Data: `models.ts` (+ `MailChannel`, `LineChannel`, `Channels`, `LinkCode`, `LineGroup`, exactly the SPEC-001 §3.6/§3.7 + SPEC-002 keys) · `repositories.ts` (`ChannelsRepo`: `channels`, `newLinkCode`, `unlinkLine`, `lineGroups`, `lineNames`, `saveLineNames`) ·
  `data/fake/channels.ts` (starts not linked; the **3rd poll after a code turns linked** as `เอ`; 3 made-up groups; names trimmed, ≤ 20 / 1–50 else `ApiError('VALIDATION', 400)`, dups dropped as the server does) ·
  `data/http/channels.ts` (`GET /channels`, `POST /channels/line/link-code`, `DELETE /channels/line`, `GET /channels/line/groups`, `GET`/`PUT /channels/line/names`).
- Screens: `/channels` (`features/channels`) two rows with their state · `/channels/line` (`features/line`) code large + countdown `รหัสหมดอายุใน mm:ss` + `ขอรหัสใหม่`, polls `GET /channels` every 3 s while a code is open, stops when linked or expired, expired code greyed (`aria-disabled`) with only the new-code button left; linked → `เชื่อม LINE แล้ว` + display name + links to names and groups + `เลิกเชื่อม` with a confirm ·
  `/channels/line/names` list, add, delete, each change saves the whole list, a failed save shows `เกิดข้อผิดพลาด ลองอีกครั้ง` and keeps the list · `/channels/line/groups` name + Thai last-seen time, empty text, the help text always under the list (REQ-003 AC-5).
  Every control has a `data-testid`. The fake is `VITE_FAKE=true` (default); `?fixtures=empty` on the first URL starts it with no groups.
- Step 6 (from TASK-027 Q2): `/signin` has an always-present two-line `signin-error-slot` directly above the button; the error inside keeps `role=alert`.

**Evidence**
- `npm run build` → `✓ built in 609ms`, no errors · `npm test` → `Test Files 6 passed (6) · Tests 48 passed (48)` (before this TASK: 39). New: `line.test.tsx` 8 (fake: code → polling → linked, and polling stops · countdown reaches `00:00` → code greyed, polling stops, only the new-code button, and a new code reopens · unlink cancel / confirm → `unlinkLine` once → a fresh code · channels states · names add/delete call `saveLineNames` with the **full list** · a 400 shows the generic error and keeps the list · groups rows with Thai time + help · groups empty + help) + 1 in `signin.test.tsx` (the slot).
- Screenshots in `tests/harness/task-028/`. **Browser** (Chrome, real 360×800, FAKE; `hScroll=false` on every screen): `channels.png` `line-code.png` `line-linked.png` `line-names-empty.png` `line-names.png` `line-groups.png` `line-groups-empty.png` (+ `signin-before.png` `signin-error.png`). **Emulator `cc_phone_360`** (fake debug APK, `-s emulator-5554`; the real phone was not touched): `emu-channels.png` `emu-line-code.png` `emu-line-linked.png` `emu-line-names-empty.png` `emu-line-names.png` (one name added) `emu-line-groups.png`. The empty-groups state is browser-only (`?fixtures=empty` needs a URL).
- **Step 6 measured**, `/signin` with the call failing (real mode, nothing behind the proxy), button `top` before the error and with it: `316` and `316`, **moved by 0 px** (`shoot.mjs signin`; screenshots `signin-before.png`, `signin-error.png`).
- Debug APK built with `VITE_FAKE=true`, `BUILD SUCCESSFUL`: 4.28 MB (4491863 bytes) SHA-256 `030fb9fa2134d81d012183af60f8f0b28ac50b5529a79ebec7a88deab3038202` (not copied: TASK-027's two APKs are the milestone; this build is what the emulator shots came from).
- Detector (`impeccable`) on `features/line`, `features/channels`, `features/signin`: `[]`. No hex, `transition-all` or `z-index` outside `theme.css`. Manual audit, product register: 44 px+ targets (back, rows 52–56 px, buttons, inputs 44/48), visible focus rings, the code is text (not an image) with tabular figures, loading/empty/error/success each designed, errors are text in the normal colour with `role=alert`. P3 left: the long title `ชื่อที่ใช้เรียกคุณ (ใส่ชื่อเล่นได้หลายชื่อ)` takes two lines in the header (fits; shortening it is the PM's copy) · the delete button is a plain text button `ลบ` with no confirm (the SPEC asks for none; one tap changes the saved list) · the LINE display name has no label (no approved word).
- `git status --porcelain` in `corner-chat-app` (HEAD `f5e060d`): `?? .gitignore .oxlintrc.json android/ capacitor.config.ts index.html package-lock.json package.json public/ src/ tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts`. Nothing outside the repo except `tests/harness/task-028/` and `machine.local.md` (untouched).
- **Live check, local (DoD item 3): DONE, the screen turned linked by itself.** Silver sent the event at 18:44:52 local (`200 {}`, code `356325`); my screen, which was polling `GET /channels`, showed `เชื่อม LINE แล้ว` at 11:44:55 UTC = 18:44:55 local (3 s later, one poll). Screenshots `live-channels.png`, `live-code.png` (the open code with its countdown), `live-linked.png` (the linked screen: `เชื่อม LINE แล้ว`, the two links, `เลิกเชื่อม`). Script `live.mjs`.
  The database after the event: `line_links rows: 1`, `codes: 2 used: 2` (the dry run's code and this one).
  The display name is `null` on purpose of the setup: the made-up local secret and an **empty access token** mean no LINE profile call can be made (SPEC-002: `display_name` is null on failure), and the screen correctly shows no name instead of inventing one (`line-display-name` is absent). `UNVERIFIED` here: a real display name (needs a real token, a DATA REQUEST).
  The first send got `401 BAD_SIGNATURE` because my first 8093 server had no LINE secret (my recipe's gap, Silver's note); I restarted it with Silver's made-up `LINE_CHANNEL_SECRET`, the token left empty, same DB, and the open code stayed valid. Before that, with the real server (DB `corner_chat_app_b`, port 8093, the TASK-027 recipe, one made-up user): signed in through `/signin`, Channels tab → `/channels/line` opened a real code (`POST /channels/line/link-code` → 201) and showed it with its countdown; `GET /channels`, `/channels/line/groups`, `/channels/line/names` answer with the SPEC shapes. 
- **Teardown (done):** the back end stopped (nothing LISTENING on 8093) · Vite (5194) and the test Chrome (9333) stopped · `DROP DATABASE corner_chat_app_b` → `DROP DATABASE`, then `select count(*) from pg_database where datname='corner_chat_app_b'` → `0` · `corner-chat-back` `git status --porcelain`: 9 lines before and 9 after, `diff` empty (Team A's untracked files, none mine). The back end never got a real LINE secret or token; the made-up secret existed only as an environment variable of that one process.
  Commands: `psql -h 127.0.0.1 -p 5433 -U corner_chat -d postgres -c "DROP DATABASE corner_chat_app_b"`.

## Questions
**LIVE CHECK: DONE (result in the Notes above; the server and the database are torn down).** What I asked at the time, kept for the record: the SA's `send-event.ts` was needed (DoD item 3) and the app was waiting on the screen.
- **Code: `356325`** (opened 2026-11-01 11:42:42 local, valid 10 minutes). If it has expired, the waiting script taps `ขอรหัสใหม่` by itself and writes the **current** code to `tests/harness/task-028/live-code.txt`: read that file, do not use an older code.
- Back end: `http://127.0.0.1:8093` (my private dev server), database `corner_chat_app_b` on the team cluster `:5433`. Its owner/other data is not real. The app user is `appb@corner.test` (made-up; its password is in `tests/harness/task-027/seed.sql`'s header).
- The screen (Chrome at 360×800, signed in as that user, on `/channels/line`) polls `GET /channels` every 3 s. When your event links the code, it turns `เชื่อม LINE แล้ว` by itself; the script then screenshots it (`live-linked.png`) and exits. I will tear the server and the database down after that, so tell me when you are done.
- Seen already, with the real server (no code needed): `GET /channels` → 200 `{ "mail": {…}, "line": { "linked": false, "displayName": null } }`, `GET /channels/line/groups` → 200 `{ "groups": [] }`, `GET /channels/line/names` → 200 `{ "names": [] }`, and `POST /channels/line/link-code` → 201 with a 6-digit code. All match SPEC-001 §3.6/§3.7 and SPEC-002 §API.

> answer (Silver, SA-B, 2026-11-01 18:45): **I tried, and your server refused it, as it should.**
> `bun src/modules/line/scripts/send-event.ts <link event, text "356325"> --url http://127.0.0.1:8093/api/v1/webhooks/line` →
> `401 {"error":{"code":"BAD_SIGNATURE",...}}`. `corner-chat-back/.env` has **no** `LINE_*` variable, so your server started with no
> channel secret, and the webhook fails closed (webhook.ts ~208). That is my recipe's gap: TASK-027's recipe never set one.
> **Do this:** restart your 8093 server with the same prefix plus a **made-up local secret**: `LINE_CHANNEL_SECRET=cc-local-028-not-real`.
> Leave `LINE_CHANNEL_ACCESS_TOKEN` **empty**, so the linking reply stays fail-closed and no call leaves the machine. The DB stays,
> so your session and data survive. Then write the new code in `live-code.txt` and tell me. I will sign with the same made-up secret.
> **Sent** (Silver, 18:44:52 local): after Fanta restarted with that secret, `LINE_CHANNEL_SECRET=cc-local-028-not-real bun src/modules/line/scripts/send-event.ts
> <1-on-1 text "356325", made-up userId `Ufake0000000000000000000000000a1`> --url http://127.0.0.1:8093/api/v1/webhooks/line` → `200 {} (26 ms)`.

Non-blocking, for SA-B (answer when you review):
- **Q1** Words I had to choose from approved ones (no new Thai): the unlink confirm shows `เลิกเชื่อม` with `ยกเลิก` / `เลิกเชื่อม` (no `…ไหม` question, since none is approved); the name field's accessible name and placeholder is `ชื่อ` (the PM-confirmed admin-web word); a channel that is not connected shows no state text (SPEC-003 gives only `เชื่อมแล้ว`). Confirm or give the PM's wording.
- **Q2** The code is requested **automatically** when `/channels/line` opens and LINE is not linked (the SPEC has no "get a code" button, only `ขอรหัสใหม่`). So each visit of an unlinked user voids the previous code. OK?
- **Q3** `app.test.tsx` is also edited here (a second time): the LINE links `line-open-names` / `line-open-groups` now exist only once LINE is linked, so that test waits for them (short poll times through `features/line/timing.ts`) and resets the channels fake before each test.

> answers (Silver, SA-B, 2026-11-01):
> - **Q1** All three accepted as `Interpreted`. The unlink confirm reuses the approved button words (`ยกเลิก` / `เลิกเชื่อม`) with no new question. `ชื่อ` is the PM-confirmed field word. "Not connected" shows no state text, because SPEC-003 defines only `เชื่อมแล้ว`. No new Thai.
> - **Q2** OK. A fresh code on open is what SPEC-003's screen row means ("not linked: … the code large"). Voiding the old code is safe: a code is single-use, lives 10 minutes, and belongs to this user only (SPEC-002).
> - **Q3** Accepted. `app.test.tsx` is the shared navigation test, and its waiting step follows the new linked-only links.

## Review
**Verdict: DONE** (Silver, SA-B, 2026-11-01 ~19:00). Reviewed against SPEC-003 rev 2.1 (screen rows for `/channels*`), SPEC-002 § API and SPEC-001 §3.6/§3.7.
- Re-ran `npm run build` → `✓ built in 400ms` · `npm test` → `Test Files 6 passed (6) · Tests 48 passed (48)`.
- `data/http/channels.ts` was read against SPEC-002's API table: the paths, the methods and the `{ groups }` / `{ names }` wrappers match. `PUT` sends `{ names }`. `api-client.ts` is unchanged ✓.
- **Live link proven end to end.** My signed event at 18:44:52 → `200 {}`. Fanta's polling screen showed `เชื่อม LINE แล้ว` 3 s later. The DB had `line_links: 1` and `codes used: 2`. I looked at `live-linked.png` ✓. `displayName` is null by design (no token means no profile call); a real name is `UNVERIFIED` and needs a DATA REQUEST.
- Screenshots `line-groups.png` (3 groups, Thai times, help text always shown, REQ-003 AC-5) and `live-linked.png` were checked ✓.
- Step 6 is measured: the button moves 0 px ✓.
- Teardown: `netstat` shows nothing on 8093, 5194 or 9333 ✓. The DB drop count is `0` (pasted).
- Low, not REWORK: names can be deleted with one tap and no confirm. SPEC-003 asks for none, and the list saves again at once, so I am leaving it.
- My own gap: TASK-027's back-end recipe never set a local LINE secret, so the first send got `401 BAD_SIGNATURE` → `FAILURES` F-017.
