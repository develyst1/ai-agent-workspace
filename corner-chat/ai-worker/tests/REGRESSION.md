# Regression checklist — corner-chat

> Owned by QA. Everything the product must STILL do after any change.
> Every delivered REQ adds its cases here; every escaped defect adds the case that
> would have caught it. Run the relevant subset in every test round.

## Cases

| # | Case | From REQ | Added | Last run | Result |
|---|------|----------|-------|----------|--------|
| R-01 | Only the owner reaches `/admin/*` (user token → 403, no token → 401); the admin web refuses a user account and keeps no usable token | REQ-001 AC-2 | 2026-11-01 | 2026-11-01, owner's server, back `7808f3ed…` | PASS (`test-001.ts` #5–#6) |
| R-02 | One user never reaches another's messages, rules, bar, corrections or devices — by list, by id, or by a `userId` in the body (404 / stored as own) | REQ-001 AC-3 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-001.ts` #7–#9) |
| R-03 | Disable or password reset ends a live sign-in at once; disabled sign-in shows "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล"; ingest for a disabled user is refused, no row | REQ-001 AC-4/5 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-001.ts` #10–#15) |
| R-04 | 5 wrong passwords in a row → 429 + `Retry-After` ≤ 300 even with the right one; the count resets on a right sign-in; one user's lock does not lock another | REQ-001 AC-6 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-001.ts` #16–#18; the 5-min tail last run 2026-11-01 local, `lockout-wait.ts`) |
| R-05 | A message is stored before the filter runs and is decided exactly once after a restart (`FILTER_PAUSED`) | REQ-001 req 6 | 2026-11-01 | 2026-11-01, local (`case19.ts`) | PASS |
| R-06 | App: after a 401 the token and every saved list are gone from storage (browser `localStorage` and Android Preferences); sign-out ends the server session | REQ-001 AC-3 / REQ-005 | 2026-11-01 | 2026-11-01, browser 360 px + APK on `emulator-5554` | PASS (`app-surface.mjs`, `app-emu.mjs`) |
| R-07 | A fixed rule decides with **0 AI calls**; `always` beats `never`; keyword = substring, Latin case-insensitive | REQ-004 AC-1/2 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-003-stub.ts` #1–#6) |
| R-08 | Bar: score bar−1 → held, bar → notified, bar+1 → notified; bar outside 0–100 or not whole → 400 | REQ-004 AC-3/7 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-003-stub.ts` #7–#10, #20–#21) |
| R-09 | Fail open: gateway down / 500 / non-JSON / bad score / no answer (40 s) → notified "AI ไม่ได้ตรวจ", score null; one retry except timeout and unreachable | REQ-004 AC-5 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-003-stub.ts` #13–#17) |
| R-10 | About line: `[channel · group or sender] summary`, ≤ 80, cut at a word with `…`; mail head = display name or the part before `@`; rule line `ตรงกฎของคุณ: …` | REQ-004 AC-10, D32 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-003-stub.ts` #26) |
| R-11 | Corrections move the message both ways, record who/when, send no new notification, and teach nothing | REQ-004 AC-8 | 2026-11-01 | 2026-11-01, owner's server | PASS (`test-003-stub.ts` #22–#24) |
| R-12 | **Corpus gate** — 30 labelled messages × 3 runs on the real gateway, run twice: 0 wrong holds · ≤ 2 wrong passes · 0 flips at the default bar 70; 0 failed judgements. **Re-run on every change of model, prompt or bar** | REQ-004 AC-6 (and DEF-1, which escaped run 1) | 2026-11-01 | 2026-11-01, real gateway, back `945cad21…` | PASS (`corpus-full.ts`, runs 3–4) |
| R-13 | LINE linking: a right 6-digit code links (OA replies "เชื่อม LINE แล้ว"); wrong / expired / old / reused / already-linked LINE id → "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป"; 6th try after 5 wrong in 10 min gets no reply | REQ-003 AC-1 | 2026-11-01 | 2026-11-01, owner's server, back `7808f3ed…` | PASS (`qa-b/test-004.ts` #1–#6, 1b, 1c) |
| R-14 | LINE intake takes in only: tag · reply to the user's own message · tag all · name/nickname (substring, Latin case-insensitive); never the sender's own message. **Real LINE marks "@All" as mentionee `type:"all"`; a typed "@name" that is not picked from the list is plain text (not a mention)** | REQ-003 AC-2, AC-8, Q1, Q7 | 2026-11-01 | 2026-11-01 real-LINE live run (TEST-004 run 3) + harness | PASS (`test-004.ts` #7–#13, #16; live rows 7, 8, 10, AC-8) |
| R-15 | **Privacy:** a group message that concerns no linked user leaves **no row in any table, no AI call, no text in the back-end log**; a linked user's own message keeps only its id (`line_own_messages`) | REQ-003 AC-3 | 2026-11-01 | same | PASS (`test-004.ts` #14–#20) |
| R-16 | Webhook refuses a wrong / missing / body-changed signature with 401 and no row change | REQ-003 AC-6 | 2026-11-01 | same | PASS (`test-004.ts` #27–#29) |
| R-17 | A passed LINE message is pushed 1-on-1 (about line + first 2 lines), once even if LINE redelivers; held → no push; disabled user → no push; nothing is ever sent to a group id; the month count +1 per push only, shown on the owner's page | REQ-003 AC-4, AC-7, req 7 | 2026-11-01 | same + admin web `bded52de…` | PASS (`test-004.ts` #21–#25, #30, #31, #35; `qa-b/ac7-admin.mjs`) |
| R-18 | **LINE checks never reach real LINE:** QA starts the back end with `LINE_API_BASE` = the fake and a made-up token in the process env (D44) — check `{"baseIsFake":true}` before any LINE run | D44 | 2026-11-01 | 2026-11-01 | PASS (env check, booleans only) |
| R-19 | Mail connect: wrong password → 422, nothing stored; right → connected; no mail older than the connect is taken in; the password is never returned, logged or stored readable | REQ-002 AC-1, AC-7 | 2026-11-01 | 2026-11-01, stand-in, back `7808f3ed…` | PASS (`test-002-stand.ts` #1–#3, #19–#20) |
| R-20 | Mail intake: once per mail across a restart; never marks mail read; Thai readable in UTF-8 / TIS-620 / windows-874 / QP / base64 / HTML-only and in RFC 2047 subjects; To / Cc / Bcc→to / List-Id→list; attachments named, not stored; > 15 MB → row kept with the PM's line | REQ-002 AC-2–AC-4, Q-SA-1 | 2026-11-01 | same | PASS (`test-002-stand.ts` #4–#12) |
| R-21 | Reply: from the user's own address to the **sender only**; `Re:` once; `In-Reply-To`/`References` keep the thread; one Sent copy; Thai byte-exact; LINE → `NOT_MAIL` | REQ-002 AC-5, D37 | 2026-11-01 | same + owner window `qa7k` (real Zimbra, threads in his mail app) | PASS (`test-002-stand.ts` #13–#15; `test-002-live.ts`) |
| R-22 | A failed reply is never lost and is sent **once**: survives a restart; retry → sent; retry again → 409; double-tap → one mail; **the app offers retry on the reply screen AND on the message detail** (TEST-002 DEF-1, escaped to run 1) | REQ-002 AC-6, req 6 | 2026-11-01 | 2026-11-01, stand-in + app `25db8739…` | PASS (`test-002-stand.ts` #16–#18; `app-mail.mjs` #16–#18) |
| R-23 | Disconnect: password row gone, nothing new taken in, old mail kept, reply → 409; one user never reaches another's mail, reply or retry | REQ-002 req 8, AC-8 | 2026-11-01 | 2026-11-01, stand-in | PASS (`test-002-stand.ts` #21–#22) |
| R-24 | **App notification (D-B14 watcher):** a passed message raises a phone notification ≤ 60 s (also with the app swiped from recents); held → none; messages from before sign-in → none; sign-out (or another user signing in) → nothing of the old user on this device | REQ-005 AC-2, AC-6 | 2026-11-02 | 2026-11-02, emulator API 34, APK `05fbbbca…` | PASS (`qa-b/test-005-emu.mjs`, `emu-retest.mjs`) |
| R-25 | **Notification tap (DEF-2):** tapping the collapsed corner-chat group opens the NEWEST message; in the expanded group a row opens THAT message — never the list. Message notifications form their own group, apart from the watcher's permanent one | REQ-005 AC-2 (DEF-2, escaped run 1–2) | 2026-11-02 | same | PASS (`emu-retest.mjs` #4/#5) |
| R-26 | **Android back key (D46):** sub-screen → one step back; a tab's top → leaves the app; with a menu or dialog open → closes it only (no step back, nothing confirmed) | REQ-005 AC-4, D46 | 2026-11-02 | same | PASS (`emu-retest.mjs` #17, D46x) |
| R-27 | **No secrets in logcat (DEF-1):** a full signed-in session on the live API leaves 0 lines with message text, password, `Bearer` or Capacitor verbose bridge data | SPEC-003 non-functional (DEF-1, escaped run 1) | 2026-11-02 | same | PASS (`emu-retest.mjs` #40; `def1-recheck.mjs` with a pre-fix control) |

## How to run (QA Team A harness, `tests/harness/qa-a/`)
- Environment: `QA_BACK_REPO` (the `corner-chat-back` checkout, from `machine.local.md`) · `QA_SECRETS` (QA's secrets file,
  outside the repo) · `ANDROID_HOME` for the APK rows.
- Start: `bun backend.ts <back-repo> <secrets> up` creates `corner_chat_test_qa_a` on the owner's server (TEST-001 Q4–Q6),
  migrates and starts the back end on 127.0.0.1:8191 with LINE pointed at a closed port. Fake gateway:
  `bun ../fake-gateway/server.ts gw.json --port 3991`.
- Suites: `bun test-001.ts` · `bun test-003-stub.ts` (it stops the fake gateway for #14 — restart it before another suite) ·
  `node app-surface.mjs <playwright-core>` (app on :3192) · `node app-emu.mjs <apk>` (emulator slot from the PM only).
- Mail (R-19…R-23): `bun backend.ts … reset`, then `bun test-002-stand.ts` (starts the team's local mail stand-in and its own
  back end) · app rows: vite on :3192, then `node app-mail.mjs <playwright-core>` · the real-Zimbra rows only in an owner window
  (`bun test-002-live.ts <code>`, TEST-002 § Owner window).
- Corpus (R-12, real gateway, D33): from the back repo, `LLM_GATEWAY_URL=… bun <harness>/qa-a/corpus-full.ts <corpus.md> <out.json> --runs 3`.
- **Always finish with `bun backend.ts <back-repo> <secrets> drop`** (TEST-001 Q5).
