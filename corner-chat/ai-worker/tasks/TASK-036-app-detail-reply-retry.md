# TASK-036: Retry a failed reply from the message detail (REQ-002 DEF-1)
- Source: TEST-002 § Defects DEF-1 (MAJOR, Tanya, 2026-11-01) · REQ-002 req 6 / AC-6 · SPEC-001 §3.4 (`POST /replies/:id/retry`)
  · SPEC-003 § Screens (`/messages/:id`)
- Owner: FE (Fern, Team A) · reviewer Sober
- Status: DONE (SA Sober, 2026-11-01; live row-18 path passed, mail once)
- Depends on: TASK-029 (DONE)

- Repo: `corner-chat-app` · git writes: **none**
- Files you may edit (closed list): `src/features/message-detail/MessageDetailScreen.tsx`,
  `src/features/message-detail/message-detail.css`, `src/test/detail.test.tsx`

## The defect (cause read, not guessed)
`MessageDetailScreen.tsx:155-163` lists each reply with only its body and status text. For a `failed` reply it shows
`ส่งไม่สำเร็จ ลองอีกครั้ง`, but there is no button, so once the user leaves the reply screen, a failed reply can never be retried
(AC-6: "a failed reply can be retried"). The reply screen has the retry (`reply/ReplyScreen.tsx:66-72`, `reply-retry`); the
detail does not.

## What to do
1. In the detail's reply list, a reply with `status === 'failed'` gets a button with the approved text `ลองอีกครั้ง` (`S.retry`,
   no new string). It has `data-testid="detail-reply-retry-<id>"` and is at least 44 px.
2. Tap → `messagesRepo().retryReply(id)` → replace that reply in the screen with the returned one (`queued`). While any reply on
   the detail is `queued` / `sending`, re-read the detail every 3 s for up to 1 minute, with the same timing as the reply screen.
   Import it from `reply/timing.ts`; don't copy the numbers.
3. While a retry is in flight, its button shows loading and can't be tapped twice. A failed retry call (network or API error)
   shows the generic error `เกิดข้อผิดพลาด ลองอีกครั้ง` on that row, and the button stays.
4. Nothing else changes: the other statuses, the order, the reply button, D40's line.

## Definition of Done (paste real output)
- [ ] `src/test/detail.test.tsx` (fake repo): a failed reply shows the button; tap → `retryReply` called once with its id → the row
      reads `กำลังส่ง`, then `ส่งแล้ว` after polling; a double tap calls `retryReply` once; a retry that errors → the generic error,
      button still there; `sent` / `queued` rows have no button.
- [ ] `npx vitest run` green · `npm run build` clean.
- [ ] **Live, the TEST-002 row-18 path:** QA's back end on `corner_chat_test_<yours>` (the owner's server, D43/D45), the stand-in
      SMTP pointed at a closed port → reply → `failed` → leave the reply screen → detail → retry button → SMTP restored → tap →
      `ส่งแล้ว`, and the stand-in received the mail exactly **once**. Screenshot before and after at 360 px.
- [ ] `git status --porcelain` → only the closed list.

## Implementation Notes
*(Fern, FE Team A, 2026-11-01)*

**Repo state:** `corner-chat-app`, `main`, HEAD `f5e060d`, the tree still untracked; no git writes. Changed only the closed list: `src/features/message-detail/MessageDetailScreen.tsx`, `message-detail.css`, `src/test/detail.test.tsx` (it only *imports* `reply/timing.ts`).

**What changed (the cause was read first: the detail listed a failed reply with status text and no control, so after leaving the reply screen nothing could retry it):**
- A reply with `status === 'failed'` gets a button with `S.retry` (`ลองอีกครั้ง`, no new string), `data-testid="detail-reply-retry-<id>"`, 44 px (CSS `.md-reply .md-reply-retry`).
- Tap → `messagesRepo().retryReply(id)` → that row is replaced by the returned reply (`queued`, shown as `กำลังส่ง`). While any reply on the detail is `queued` / `sending`, the detail is read every `timing.pollMs` for up to `timing.maxMs` — **`reply/timing.ts`, imported, not copied** (3 s / 1 min). The minute restarts with a retry.
- While a retry is in flight its button is `loading` and a second tap on that row is ignored. A retry that errors (network or API) shows `เกิดข้อผิดพลาด ลองอีกครั้ง` (`detail-reply-error-<id>`) on that row only, and the button stays; the next tap clears the error and tries again.
- Nothing else changed: other statuses, the order, the reply button, D40's line.

**Judgement calls / limits (veto welcome):**
1. **Double tap:** the guard is the button's `loading` state plus a state check in the handler. I first wrote a ref guard as well, then tested it by removing it: the double-tap test **still passed**, because React flushes each tap's update before the next one and antd-mobile blocks clicks on a loading button. So the test proves "one `retryReply` call for three taps", but it cannot tell the two guards apart; I removed the redundant ref rather than keep code no test needs.
2. **A narrow race I did not guard:** if another reply on the same detail is being polled while you tap retry, a poll that was sent *before* the retry was applied can come back after it and show the old `failed` row once more (no polling then runs, because nothing is queued in the UI). Tapping again would meet `409 NOT_FAILED` → the generic error. It needs two replies on one message plus unlucky timing, and no test exercises a guard, so there is none. Say if you want it.
3. The server's `reply.error` text is English developer text and is not shown (only the approved status text), as before.

**Evidence (real output):**
- **Test first, red:** the five new tests were written before any code and failed (`expected undefined to be 'ลองอีกครั้ง'`, `expected null not to be null` ×4) — no button existed. After the change: `npx vitest run src/test/detail.test.tsx` → `Tests 9 passed (9)` (4 older + 5 new): only a failed reply has the button, `sent` / `queued` rows have none · tap → `retryReply` called once with its id → `กำลังส่ง` → `ส่งแล้ว` after polling, button gone · three taps → one call · a retry that errors → the generic error on that row only, button still there, a later tap works and clears it · polling stops at the cap (no more reads after it).
- `npx vitest run` (whole app) → `Test Files 13 passed (13) · Tests 109 passed (109)`, three runs in a row, then twice more after the last edit. `npm run build` → `✓ built in 245ms`. `npm run lint` → only the 2 older `set-state-in-effect` warnings (`useMessageList.ts:40`, `MessageDetailScreen.tsx:30` — the existing load effect); the `react(purity)` warning my first version raised (`Date.now()` in the handler) is gone (the polling effect now stamps the time). `detect.mjs --json src/features/message-detail` → `[]`.
- **The DEF-1 path through the app's own navigation at 360 × 800, on the app's FAKE repos (no server, no database)** — `tests/harness/task-036/shoot-fake.mjs` → **`ALL PASS`**: reply with a body that the fake fails once → the reply screen shows `ส่งไม่สำเร็จ ลองอีกครั้ง` → **leave it** → the detail shows the failed reply with the retry button (approved text, **44 px**, no horizontal scroll) → tap → the row reads `กำลังส่ง` → then `ส่งแล้ว` (re-read every 3 s) and the button is gone. Screenshots: `fake-01-detail-failed-with-retry.png` (before) · `fake-02-detail-sent-after-retry.png` (after).
- `git status --porcelain --untracked-files=all` for the three paths → exactly those files.

**The live TEST-002 row-18 run (the DoD's third box) — DONE 2026-11-01, `tests/harness/task-036/shoot-live.mjs` → `ALL PASS` (15 checks).** The real back end (`bun src/index.ts`, my own port :8095) on **`corner_chat_test_fern` on the owner's server** (created by `bun run db:init`; the URL went only through env vars, never printed or passed as an argument), Jason's mail stand-in in place of Zimbra, the app in a browser at 360 × 800 through Vite (`VITE_FAKE=false`). LINE / FCM / AI values were made up and `LINE_LIVE` unset. The path, through the app's own navigation:
1. A user, a mailbox connected to stand-in #1 (`PUT /channels/mail` → 200, IMAP + SMTP verified), an "always notify" sender rule; one mail delivered → taken in and notified.
2. Stand-in #1 **killed** (its SMTP is a closed port) → open the mail → reply → the reply screen shows `ส่งไม่สำเร็จ ลองอีกครั้ง` (failed) → **leave** the reply screen → the detail shows the failed reply with the retry button `ลองอีกครั้ง`, **44 px**, no horizontal scroll (`sw 360 = cw 360`). Screenshot **before:** `live-01-detail-failed-with-retry.png`. Nothing had reached stand-in #1.
3. SMTP restored: stand-in #2 (empty, own `--sent-dir`) + the back end restarted on its ports (mailbox and reply are in the DB). The reply was **still `failed`** after the restart (nothing retries on its own). Tap the retry button → the row reads `ส่งแล้ว`, the button is gone. Screenshot **after:** `live-02-detail-sent-after-retry.png`.
4. After 9 more seconds (three outbox rounds) the stand-in's `--sent-dir` holds **exactly one file, `smtp-1.eml`** — `Re: row18 reply retry`, to the customer, with my body; stand-in #1 got none; the server shows **one reply, `sent`**. No uncaught page errors.
- A first run stopped at the data-setup step (my script asked `/messages?status=…` instead of `?tab=…`); fixed the script, and the second run is the one above. The mail is made-up data; real Zimbra, real LINE and the real phone were not touched.

**Footprint (cleaned up):** database `corner_chat_test_fern` on the owner's server **dropped** (`dropped (0 left)`, that name only); back ends, stand-ins and the Vite dev server (:8095, :5180) started by the script and stopped — `netstat` shows nothing listening on them. No other database, no `.env` or committed file touched (the helper scripts live in my scratchpad; `shoot-live.mjs` is in `tests/harness/task-036/`).

## Questions
- To SA: the live row-18 run waits on the owner's `DATABASE_URL` (TASK-033) and the stand-in SMTP's recipe — who tells me when both are ready? Also: do you want the stale-poll race (limit 2) guarded?

  > answer (SA Sober, 2026-11-01): **both are ready now.** Run the live box.
  > - **Database:** TASK-033 is DONE. `corner-chat-back/.env` has the owner's `DATABASE_URL` (his server, unencrypted per D45,
  >   made-up data only). Point your private back end at `corner_chat_test_fern`, which the guard accepts
  >   (`corner_chat_test_<suffix>`). `bun run db:init` with that URL creates and migrates it. Never print the URL.
  > - **Mail:** use the stand-in, not real Zimbra: `ai-worker/tests/harness/mail-stand-in/run.ts`, Jason's, from TASK-003. Run it on
  >   your own ports, set `ZIMBRA_*` to it, and point SMTP at a closed port for the `failed` step, then back.
  > - **Afterwards:** drop `corner_chat_test_fern` (that name only) and stop what you started.
  > - **The stale-poll race:** no guard for round 1. It needs two replies on one message with unlucky timing, it can't lose or
  >   duplicate a mail (the server answers `409 NOT_FAILED`), and a tap recovers. I re-ran your tests: `13 files · 109 passed`.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. This fixes REQ-002 DEF-1, and the defect's own path passes on a real back end.
- **What I re-ran / looked at:**
  - `npx vitest run` → `13 files · 109 passed`;
  - `live-02-detail-sent-after-retry.png`: the reply row reads `ส่งแล้ว`, and the retry button is gone.
- **Your live run accepted:**
  - the real back end on `corner_chat_test_fern`, on the owner's server;
  - SMTP killed → `failed` → leave the reply screen → the detail shows the 44 px `ลองอีกครั้ง`;
  - restarted, the reply was still `failed` (nothing retries on its own);
  - tap → `ส่งแล้ว`, and the stand-in received **exactly one** `smtp-1.eml`; the server shows one `sent` reply;
  - the database was dropped and every process stopped.
- **The double-tap guard** (loading state plus a state check) is accepted. The stale-poll race is left unguarded for round 1, as
  I answered above.
- **Security review:** not applicable. This is a UI button on an existing endpoint, with no auth, secret or data-exposure change.
- **QA:** Tanya re-tests TEST-002 row 18.
