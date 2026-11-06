# TEST-004: LINE groups in + LINE 1-on-1 notification
- Team: B · TASKs: TASK-010 … TASK-013 (SPEC-002) · app screens TASK-028 (SPEC-003 rev 2) · rev 2 of the app cases 2026-11-01
- Source REQ: REQ-003 (ACs tested: AC-1 … AC-8)
- Status: **TEST_PASSED** — run 2 (owner's server: 48/48 + app 39/39 + AC-7 3/3) + **run 3, real LINE live 2026-11-01: all rows PASS, AC-8 settled (`type:"all"`)**; NOT_TESTED: AC-5 refusal (B7), #1b
- Build under test: repo `corner-chat-back` (Team B's LINE area) + `corner-chat-app` + admin web in `corner-chat-front`, branch TBD (B6), HEAD — to be filled per round
- Surfaces: local back end · signed webhook calls from a harness · real LINE through a temporary tunnel with the **test** OA only (D16) · the app's LINE screens (SPEC-003 rev 2, Capacitor + React): web build in headless Chrome at 360×800 via Playwright (`data-testid` selectors), plus the debug APK on the emulator for the real-OA runs — method and limits in TEST-005
- Designed: 2026-11-01 by Tefany

## Scope
- In: linking a LINE account (AC-1), the four intake triggers (AC-2), the drop-unread privacy rule (AC-3),
  the 1-on-1 push (AC-4), one-OA-per-group help (AC-5), webhook signature (AC-6), push count (AC-7), "tag all" (AC-8),
  the names list (req. 5), receive-only (req. 7).
- The filter's own decision (pass/hold, %) is REQ-004's (Tanya). Here the AI is **stubbed** to "pass" or "hold" so only
  the LINE side is judged. The app notification half of AC-4 is judged in TEST-005 (REQ-005 AC-2).
- Out (REQ Out of Scope): replying into groups, 1-on-1 chats to the OA as a channel, image/sticker content beyond the
  D7 note, Discord, Web Chat, Teams.
- Not in any AC, named so it is a decision, not a gap: ~~user un-links LINE~~ (now case 1d, from SPEC-002) · OA removed from a group · user leaves a group.
  No case until a REQ says what should happen.

## Instrument limits
- **Harness-signed webhook calls** (local secret): prove our intake logic, storage and signature check. They do NOT
  prove the shape of real LINE events (mention types, quote-reply ids, "tag all") — that needs the real test OA.
- **Real test OA via tunnel** (B1): proves real event shapes and the real push. Only test LINE accounts and a test group
  whose members are all ours. Tunnel up only during the run, down after (D16) — recorded in Test data.
- **AI stub**: proves routing pass → push / hold → no push. Says nothing about the AI's judgement.
- **DB + AI-call log reads, before/after**: prove "nothing stored / no AI call" only if the SPEC gives one place to read
  every table and every AI call (Q6). A grep of one table is not "no row anywhere".

## Cases
| # | Case (from AC) | Type | Surface | Steps / command | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 link happy | happy | real OA + app (web, then APK) | U1 opens `/channels/line`, adds test OA as friend, sends the shown 6-digit code | OA replies "เชื่อม LINE แล้ว"; within ~3 s (the screen polls) the app shows "เชื่อม LINE แล้ว" + display name, with no manual reload; texts match REQ + SPEC-003 wording | | | NOT_TESTED |
| 1a | AC-1 countdown + new code | state | app (web) | open the link screen; wait; tap `ขอรหัสใหม่` | "รหัสหมดอายุใน {mm:ss}" counts down from 10:00; a new code replaces the old (old now refused, case 4) | | | NOT_TESTED |
| 1b | AC-1 brute force | negative / security | real OA (or harness) | 5 wrong 6-digit codes from one LINE id within 10 min, then the right code | 6th try: no reply, not linked; after 10 min the right (fresh) code links (D-B3) | | | NOT_TESTED |
| 1c | AC-1 not a code | negative | harness | a 1-on-1 text "สวัสดี" / "12345" / "1234567" | no reply, nothing stored | | | NOT_TESTED |
| 1d | Un-link | state | app (web) | linked U1 taps `เลิกเชื่อม` | app shows not linked; U1's groups list empty; names list kept (SPEC-002); a tag of U1 is no longer taken in | | | NOT_TESTED |
| 2 | AC-1 wrong code | negative | real OA | U1 sends a code never issued | OA replies "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป"; app still unlinked | | | NOT_TESTED |
| 3 | AC-1 expired code | boundary | real OA | Send a code at 9:50 and at 10:10 after it was issued (SPEC-002: 10 min) | 9:50 → linked · 10:10 → refused (wording above) | | | NOT_TESTED |
| 4 | AC-1 old code after a new one | negative | real OA | Request code A, then code B; send A | A refused; B works | | | NOT_TESTED |
| 5 | AC-1 code reused | negative | real OA | U1 links with code; a second LINE account sends the same code | refused; U1's link unchanged | | | NOT_TESTED |
| 6 | AC-1 one LINE account, two users | negative | real OA | LINE account L1 already linked to U1 sends U2's code | refused, U1 stays linked (Q2, PM-decided) | | | NOT_TESTED |
| 7 | AC-2 tag U1 | happy | harness, then real OA | Member M tags U1 | taken in for U1 (enters filter) | | | NOT_TESTED |
| 8 | AC-2 reply to U1's message | happy | harness, then real OA | U1 writes in group; M quote-replies it | taken in for U1 | | | NOT_TESTED |
| 9 | AC-2 tag all | happy | real OA only | M tags all | taken in for every linked user in the group | | | BLOCKED (AC-8) |
| 10 | AC-2 nickname untagged | happy | harness, then real OA | U1's list has "ต้น"; M writes "ต้น ช่วยดูหน่อย" with no tag | taken in for U1 | | | NOT_TESTED |
| 11 | AC-2 name inside another word | boundary | harness | U1's list "ต้น"; M writes "ต้นไม้ล้ม" | Recorded, not judged: plain match will take it in (DECISIONS: false matches are open, counted). Counted in the report | | | NOT_TESTED |
| 12 | AC-2 name in English case | boundary | harness | List "Ton"; M writes "ton please" | taken in — Latin match is case-insensitive (Q7, PM-decided) | | | NOT_TESTED |
| 13 | AC-2 two linked users | state | harness | U1 and U2 linked, same group; M tags U1 and names U2 | taken in once for U1 and once for U2; each user sees only their own | | | NOT_TESTED |
| 14 | AC-2 tag a non-linked member | negative | harness | M tags N (not a corner-chat user) | dropped as in AC-3 | | | NOT_TESTED |
| 15 | AC-2 reply to a non-linked member | negative | harness | M quote-replies N's message | dropped as in AC-3 | | | NOT_TESTED |
| 16 | AC-2 U1 names themself | negative | harness | U1 writes a text containing U1's own nickname | not taken in for U1; only its id kept (Q1, PM-decided) | | | NOT_TESTED |
| 17 | AC-3 plain chatter leaves nothing | negative / privacy | harness + DB | Snapshot every table + AI-call log; M writes "ใครกินข้าวยัง" (no trigger); snapshot again | snapshots identical: no row, no text, no AI call, no log line holding the text | | | NOT_TESTED |
| 18 | AC-3 U1's own non-trigger message | privacy / boundary | harness + DB | U1 writes a message with no trigger | only the message **id** stored (req. 4); text appears nowhere — DB, AI log, app logs | | | NOT_TESTED |
| 19 | AC-3 text never in logs | privacy | harness | Grep back-end stdout/log files for a marker word sent in a dropped message | marker found 0 times | | | NOT_TESTED |
| 20 | AC-3 sticker/image with no trigger | negative | harness | M sends an image / sticker event | nothing stored, no AI call | | | NOT_TESTED |
| 21 | AC-4 passed message pushed | happy | real OA | AI stub = pass; M tags U1 | U1 gets 1-on-1 from the OA: line 1 = about line, then first 2 lines of the message | | | NOT_TESTED |
| 22 | AC-4 held message not pushed | negative | real OA | AI stub = hold; M tags U1 | no LINE push; push count unchanged | | | NOT_TESTED |
| 23 | AC-4 long and short messages | boundary | real OA | 1-line message; 5-line message | 1-line: about + that line · 5-line: about + lines 1–2 only | | | NOT_TESTED |
| 24 | AC-4 disabled user | regression (REQ-001 AC-4) | real OA | Owner disables U1; M tags U1 | no push to U1 | | | NOT_TESTED |
| 25 | AC-4 LINE redelivers the same event | state / idempotency | harness | Send the same signed event twice (same webhookEventId) | one decision, one push | | | NOT_TESTED |
| 26 | AC-5 group already holding another OA | negative | real OA | Add corner-chat to a test group that holds a second test OA | LINE refuses; app help text "กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว …" present on `/channels/line/groups`, always shown (SPEC-003). Help text runs now (web); the LINE-refusal half needs a second test OA (B7, Q4) | | | NOT_TESTED |
| 27 | AC-6 bad signature | negative / security | harness (curl) | POST a valid event body with a wrong `x-line-signature` | rejected (4xx), DB + AI log unchanged | | | NOT_TESTED |
| 28 | AC-6 missing signature | negative / security | harness | POST with no signature header | rejected, nothing stored | | | NOT_TESTED |
| 29 | AC-6 body changed after signing | negative / security | harness | Sign body A, send body B | rejected, nothing stored | | | NOT_TESTED |
| 30 | AC-7 count +1 per push | happy | real OA + admin web | Read count; cause 1 push; read again | +1 exactly | | | NOT_TESTED |
| 31 | AC-7 non-pushes do not count | boundary | real OA + admin web | Wrong-code reply (case 2) and a held message (case 22) | count unchanged — pushes only (Q5, PM-decided) | | | NOT_TESTED |
| 32 | AC-8 tag-all event shape | settle | real OA | M uses LINE's "tag all"; capture the raw event | Record what LINE sends; SA + QA settle detection; then case 9 runs | | | NOT_TESTED |
| 33 | Req. 2 my groups list | happy | real OA + app (web) | OA added to group G1 with linked U1 in it; U1 **never writes** in G1 | G1 appears on U1's `/channels/line/groups` right after the OA joins (SPEC-002 D-B1 membership check); not on U2's (not a member) | | | NOT_TESTED |
| 33a | Req. 2 groups, join order | state | real OA + app (web) | OA in G2 first; U1 links afterwards | G2 appears after linking (same check over open groups) | | | NOT_TESTED |
| 33b | Req. 2 groups, member joins later | state | real OA + app (web) | U1 joins G3 where the OA already is | G3 appears (`memberJoined`) | | | NOT_TESTED |
| 33c | Req. 2 groups, empty | boundary | app (web) | linked user in no group | "ยังไม่มีกลุ่ม เพิ่ม corner-chat เข้ากลุ่มไลน์ของคุณ แล้วกลุ่มจะขึ้นที่นี่" + the help text | | | NOT_TESTED |
| 34 | Req. 5 names list edit | happy | app (web) + harness | on `/channels/line/names` U1 adds "ต้น", "Ton", saves; removes "ต้น", saves; M writes "ต้น" | the list survives a reload; after removal "ต้น" no longer takes in | | | NOT_TESTED |
| 34a | Req. 5 names, empty | boundary | app (web) | no names yet | "ยังไม่มีชื่อ เพิ่มชื่อหรือชื่อเล่นที่เพื่อนใช้เรียกคุณ" | | | NOT_TESTED |
| 35 | Req. 7 receive-only | negative | real OA | Through every app screen, look for any way to post into a group | none exists; no group send in back-end logs | | | NOT_TESTED |
| 36 | Wording | happy | app (web) + LINE | Compare every LINE string in REQ-003 §User-facing wording and SPEC-003 §Wording, verbatim | exact match | | | NOT_TESTED |

## Run 1 — 2026-11-01 — local, no real LINE (Tefany)
Build: back `corner-chat-back` working tree, `src`+`migrations` fingerprint **`f930f30b0d6abb6f`** (53 files; repo has only
`d1152f1`, so the fingerprint is the build's name) · app `corner-chat-app` `src` fingerprint **`bc72845cb2e93213`** (82 files).
Surfaces:
- **API/webhook:** `harness/qa-b/test-004.ts` → `test-004-result.json`, **48/48 PASS**. It runs QA-B's own back end on :8192
  with its own database `corner_chat_qa_tefany`, re-created each run. Webhook events are signed with a made-up local
  secret. The product's **fake LINE API** records every push and reply, and the fake gateway is scripted by `qa-b/gw.json`.
- **App screens:** `harness/qa-b/test-005-web.mjs` → `test-005-web-result.json` (T4# rows). Browser build, headless Chrome
  360×800, `data-testid` only, against the same local stack (`qa-b/stack.ts`). Screenshots: `harness/qa-b/shots/b*.png`.
- **Clock stand-in for #3:** I moved `expires_at` on my own code rows in my own database (10 s past / 10 s ahead)
  instead of waiting 10 minutes. The expiry check itself ran unchanged.

| # | Result | Actual |
|---|---|---|
| 1 | **PASS** | code `^\d{6}$`, expires +10 min · OA reply "เชื่อม LINE แล้ว" · `/channels` linked, displayName from profile · app: intro text, code, linked + "เอ" shown 1.4 s after the code was sent, with no reload (`b02`, `b03`) |
| 1a | **PASS** | countdown "รหัสหมดอายุใน 10:00 → 09:58"; ขอรหัสใหม่ gives a new code; the old one no longer links |
| 1b | **PASS** (part) | 6th try after 5 wrong in 10 min: no reply, not linked. **The unblock after 10 min is NOT_TESTED** (the counter is in memory; it needs a 10-min wait) |
| 1c | **PASS** | "สวัสดี" / "12345" / "1234567": no reply, row counts unchanged |
| 1d | **PASS** | API + app: un-link → 204, not linked, groups [], names kept ["บี"/"Ton"], a tag no longer taken in |
| 2, 4, 5, 6 | **PASS** | wrong / old-after-new / reused / L1-already-linked → "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป"; U1 stays linked; the same code then works from a free LINE account |
| 3 | **PASS** | expired (−10 s) refused · 10 s before expiry linked |
| 7, 8, 10, 12, 13 | **PASS** | tag (`mention`) · quote-reply to U1's own message · nickname untagged · "TON" vs "Ton" · tag U1 + name U2 → +1 each |
| 9 | **PASS (harness shape only)** | `type:"all"` → +1 for each of U1–U4. Real LINE's event: **NOT_TESTED** (AC-8, B1) |
| 11 | **PASS — recorded** | "ต้นไม้ล้มขวางถนน" taken in for "ต้น" (substring, Q7). A false match, counted, as DECISIONS says |
| 14–17, 20 | **PASS** | non-linked tag / reply to non-linked / U1 writes own nickname / chatter / image / sticker: **no row change in any table, `ai_calls` unchanged** (only `line_own_messages` +1 where U1 wrote) |
| 17 (text) | **PASS** | marker words of every dropped message: 0 hits across every table (`row::text like`) |
| 18 | **PASS** | U1's own non-trigger message: `line_own_messages 0→1`, nothing else |
| 19 | **PASS** | dropped and taken-in text: 0 hits in the back end's stdout/stderr. Note: the back end wrote only 2 lines in the whole run, so this check is weak (Observation) |
| 21 | **PASS (fake LINE)** | push to L1: `"[LINE · กลุ่มทดสอบ] ขอให้ช่วยดูเรื่องงาน\n@U1 ช่วยดูเอกสารนี้หน่อย"`. AI down: `"AI ไม่ได้ตรวจ · สมชาย\n@U1 [L2DOWN] ด่วน"`. Real push: **NOT_TESTED** (B1) |
| 22 | **PASS** | [HOLD] → 0 pushes; held tab holds exactly that message |
| 23 | **PASS** | 5-line message → about line + lines 1–2 only |
| 24 | **PASS** | disabled U3 tagged → no push to L3 |
| 25 | **PASS** | same event twice → 1 message, 1 push |
| 26 | **PASS (help text)** | the groups screen always shows the help text, with or without groups. The LINE refusal: **NOT_TESTED** (B7) |
| 27–29 | **PASS** | wrong / missing / body-changed signature → 401, no row change |
| 30, 31 | **PASS** | count 11→12 for one push · a held message and a code reply do not count |
| 32 | **NOT_TESTED** | real "tag all" event shape (B1) |
| 33, 33a–c | **PASS** | G1 listed for a user who never wrote · G2 not listed where the profile check says 404 · listed after a later link · memberJoined adds G3 · empty wording + help text once the OA left (`b05`) |
| 34, 34a | **PASS** | app: add ต้น + Ton, delete ต้น, reload → ["Ton"]; a removed nickname no longer takes in · empty wording |
| 35 | **PASS** | no push or reply ever addressed to a group id |
| 36 | **PASS** | app strings for link, names, groups and help, and the OA's two replies, all verbatim |

## Defects
None.

## Observations (not ours)
- The back end logs very little (2 lines for a whole run), so #19 proves little. Tanya noted the same in TEST-001.
- The product's fake LINE API answers "member" for every profile check, so in these runs every linked user joins every
  open group the moment they link. That is a property of the fake, not of the product. #33's negative used an override.

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| database `corner_chat_qa_tefany` (owner `owner@qa-b.test`, users `*@qa-b.test`, made-up LINE ids `Uqab…`, groups `Cqab…`, messages with `QAB` markers) | team cluster 127.0.0.1:5433 | **left** — QA-B's own DB, dropped and re-created by every run of `test-004.ts` / `stack.ts`; nobody else reads it |
| QA-B secrets (owner password, SECRET_KEY) | my scratchpad, outside every repo | left there; never printed or committed |
| `playwright-core` 1.48.2 | my scratchpad `pw/` | left; not in any product repo |
| processes on :8192, :3292, :3992 + fake LINE | local | stopped 2026-11-01 ~20:22 (+07); ports checked closed |
| Vite dev cache | `corner-chat-app/node_modules/.vite` (git-ignored) | left: the app's normal dev cache |
| nothing sent to real LINE | — | — |

## Run 2 — 2026-11-01 — on the owner's server (D43), after TASK-033
Build: back `7808f3edcccd951c` (53 files) · app `bc72845c…` · admin web `corner-chat-front` `src` `bded52de653410f4`.
Database: `corner_chat_test_qa_b` on the owner's Postgres server. It was created and dropped through the maintenance DB
`postgres`, as `scripts/db-init.ts` does; no other database was touched. Before the run I checked the URL target as
booleans only (`local:false, ownerServer:true`). LINE: the fake LINE API and a made-up token (D44, Q9).
- `harness/qa-b/test-004.ts` → **48/48 PASS**, `dropped corner_chat_test_qa_b` at the end.
- `harness/qa-b/test-005-web.mjs` (the T4 app-screen rows, against this back end) → **39/39 PASS**.
- **AC-7 on the owner's admin web**: `harness/qa-b/ac7-admin.mjs` → `ac7-admin-result.json`, **3/3 PASS**. The owner signs
  in on `next dev` :3193. The card shows "ข้อความ LINE ที่ส่งในเดือน พฤศจิกายน 2569 **0**", equal to the API. One passed
  message → **1** (`shots/a7-02-after-push.png`). One held message → still 1.

## Run 3 — 2026-11-01, 23:00–23:52 — REAL LINE live sitting (SPEC-002 § Real-LINE live run plan), owner present
Go: the owner, relayed by the PM: *"Now"*; on the shop-bot question, *"ไม่ใช้ ใช้ไปเลย นี่ใช้ทดสอบ"* (a test OA, no customers,
no webhook restore). DB link unencrypted: `Interpreted D45 "unencrypted is fine" as covering this sitting`, said to the owner
up front.
Stack (`harness/qa-b/live-stack.ts`):
- back `7808f3ed…` on `corner_chat_test_qa_b` (owner's server);
- `LINE_LIVE=1` + `LINE_API_BASE=https://api.line.me` on the **process env only**; the real secret and token come from
  `.env` and were never read or printed by QA;
- startup line **`line: target=live`** (the script aborts otherwise);
- the AI stub (`gw.json`), and the app's web build :3292.

Tunnel: cloudflared quick tunnel (`share-faces-shift-arthur.trycloudflare.com`). Through it: health 200; an unsigned
webhook → 401. The owner set the webhook URL, Verify = Success, Use webhook ON, group join Allow, auto-response OFF.
People: the owner (U1, LINE "Dong_08") and M (a second account of his, "support08 Dong"), in a test group made for this.
Evidence: owner screenshots via the PM (`inbox/QA-B.md` lines, 2026-11-01 23:30–23:47) + `harness/qa-b/live-helper.ts`
status and row counts + `shots/live-0{1,2,3}-*.png`. **No LINE id or message text was written to any file.**

| Row | What happened (real LINE) | Our side | Result |
|---|---|---|---|
| 1 (AC-1) | the owner sent code `372126` to the OA | OA replied "เชื่อม LINE แล้ว" (owner's screenshot, 23:30); linked 23:30:26; the app shows "เชื่อม LINE แล้ว" + display name (`live-01-linked.png`) | **PASS** |
| 2 (AC-1) | `123456` (never issued) | OA replied "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป" (23:31) | **PASS** |
| 33 / req 2 | the OA added to the group (23:33) | the group listed for U1 at once, before anyone wrote (membership check, D-B1) | **PASS** |
| 17 (AC-3) | M: "QA6 ใครกินข้าวยัง", no trigger | every table's count unchanged (sessions aside), `ai_calls` unchanged, 0 log hits; later events from the same group arrived, so the path was live | **PASS** |
| 8 (AC-2) | M quote-replied the owner's own "QA2" | `reply_to_me` → pushed (11:40 on his phone); the owner's own message kept as **id only** (`line_own_messages` 1) | **PASS** |
| 10 (AC-2) | M: "ทดสอบคอร์เนอร์ QA4 อยู่ไหม", no tag | `name_match` → pushed (11:41) | **PASS** |
| 22 (AC-4) | M: real mention + "[HOLD] QA7…" | held (stub), **no push** | **PASS** |
| 7 (AC-2/4) | first try: "@Dong_08" typed as **plain text** → correctly dropped; redo: a real (blue) mention | `mention` → pushed | **PASS** |
| **AC-8** | first try had no @All → dropped; redo: M picked **All** from LINE's list | arrived as mentionee **`type:"all"`** → `mention_all` → pushed | **PASS — settled** |
| 21 (AC-4) | the pushes on the owner's phone | 1-on-1 from the OA: `[LINE · <group>] ขอให้ช่วยดูเรื่องงาน` + the message line, for (b) 11:40, (c) 11:41, (a2) 11:46, (d2) 11:47, all four seen on his 1-on-1 screenshot; none for (a), (d), (e), QA6 | **PASS** (4 of 4 seen) |
| AC-7 | — | push count 4 = 4 taken-in passed messages; the held one and code replies not counted | **PASS** |

Totals in the DB before the drop: messages 5 (4 notified, 1 held), `line_pushes` 4, `ai_calls` 10, `line_own_messages` 1.
None of the dropped texts (plain-@ "QA1", plain "QA3", "QA5" without @All, "QA6") left a row.

**Closing (23:52):**
- the tunnel stopped (the URL now answers 530);
- the back end, the app and the gateway stopped; all QA-B ports closed;
- `corner_chat_test_qa_b` (held the owner's and M's LINE ids, display names and tagged texts) **dropped** (`now: 0`).

The owner switched **Use webhook OFF** (his screenshot, via the PM, 2026-11-01). No URL restore was needed, per his word. The sitting is fully closed.

## Verdict
**`TEST_PASSED`** (2026-11-01, run 2 + live run 3). Run 3 closes AC-8 (real "tag all") and the real push, which Q8 had left
NOT_TESTED. Still NOT_TESTED, named: AC-5's LINE refusal (B7) · #1b, the unblock after 10 min.

Run 2 verdict (kept): **`TEST_PASSED`** (2026-11-01, run 2), REQ-003 as Team B built it, signed under Q8 (the PM's written ruling):
- AC-1, AC-2, AC-3, AC-6: PASS on back `7808f3ed…`, API + app screens.
- AC-4: PASS. The push is on the fake LINE API; the app notification is TEST-005 #1 on the emulator.
- AC-5: help text PASS.
- AC-7: PASS on the API and on the owner's page.

0 open defects. **NOT_TESTED, named (Q8):**
- AC-8, the real "tag all" event (B1);
- AC-5's LINE refusal (B7);
- the real push to a LINE account (B1); the real-LINE live run comes after TASK-034;
- #1b, the unblock after 10 min.

Earlier verdict (kept): **IN_TEST** (updated 2026-11-01 after TEST-005 run 2). AC by AC:
- **AC-1, AC-3, AC-6: PASS** on the local back end + the browser build.
- **AC-2: PASS** on harness-signed events.
- **AC-4: PASS.** The LINE push on the fake LINE API. The app notification half is TEST-005 #1 on the emulator: 28.6 s,
  full-form title.
- **AC-5:** help text PASS · the LINE refusal NOT_TESTED (B7).
- **AC-7:** the count logic PASS on the API (`/admin/stats/line-pushes` +1 per push, 0 for holds and replies). **The admin
  web *showing* it: NOT_TESTED by me.**
- **AC-8: NOT_TESTED** (real "tag all" event, B1). The AC says it is settled **before AC-2 is signed**, so I cannot sign
  REQ-003 without the PM's ruling (Q8).

DEF-1 (TEST-005) is in the app and is REQ-005's, not REQ-003's.
**LINE (D44):** every run started the back end with the fake LINE base and a made-up token in the process environment;
Bun keeps those over `.env` (checked, booleans only). Nothing reached real LINE.
**DB (D43):** run 1 used my own database on the local cluster. The rule against it reached me after the run. Re-runs wait
for `corner_chat_test_qa_b`.

Run 1 note (kept): **IN_TEST.** Every local row passes (48/48 API, every app-screen row): 0 defects.
Not run yet, named:
- **Real LINE** (B1): the real push · the real "tag all" event (AC-8, #9 / #32) · #26's LINE refusal (B7). Porter
  2026-11-01: these stay NOT_TESTED.
- #1b: the unblock after 10 min.
- The app rows **as a native APK**: these wait for the emulator slot (TEST-005).

The verdict is given when the emulator rows are done.

## Evidence (decisive)
- `harness/qa-b/test-004-result.json`: 48/48. AC-3 lines #14–#20 show the row-count diff per table, plus the `ai_calls` count before and after.
- `harness/qa-b/shots/b03-line-linked.png`: the app turns linked without a reload. `b05-groups-empty.png` shows the empty groups screen with the help text.

## Questions
For the PM. Each has my default — correct only the line that is wrong. Checked: DECISIONS 2026-11-01 lines (AI shape,
untagged name) · SYSTEM-FACTS LINE lines · decisions-for-owner-review D2, D7, D10, D16 — not covered because each is a
case the REQ's wording leaves open.

- **Q1 — U1's own message contains U1's name.** Default: not taken in for U1 (a user is never notified of their own
  message); only its id is kept. Changes case 16.
- **Q2 — one LINE account, two corner-chat users.** Default: a LINE account links to one user only; a second user's
  code from an already-linked LINE account is refused with the same "รหัสไม่ถูกต้อง…" reply; re-linking needs the first
  link removed (not in round 1). Changes case 6.
- **Q3 — how "the groups the OA is in for that user" is known (for the SA).** LINE's member-list API may need a
  verified/premium OA (`UNVERIFIED — my own knowledge`). Default: a group is listed for U1 once U1 has been seen in it
  (U1 sent a message there after linking, or was tagged there). Changes case 33 and what "lists" means in req. 2.
- **Q4 — AC-5 needs a second test OA in a test group.** Default: if the owner gives only one test OA, case 26 checks the
  help text only and the LINE refusal is NOT_TESTED (named). Adding a second OA = an extra item for §B.
- **Q5 — what AC-7 counts.** Default: only push messages (the 1-on-1 notifications); the OA's reply to a link code is a
  reply message and is not counted (LINE does not bill replies — `UNVERIFIED`, SA's Q1-SA). Changes case 31.
- **Q6 — testability, for the SPEC.** I need, locally: (a) one way to list every row the LINE intake can write
  (all tables), (b) an AI-call log (one line per call, no message text needed beyond an id), (c) an AI stub switch
  (pass / hold / down), (d) the webhook secret in local `.env` so the harness can sign events. Without (a)+(b) AC-3 is
  NOT_TESTED, not passed.
- **Q7 — name match and letter case.** Default: case-insensitive for Latin letters; Thai as written; substring match
  (so case 11 takes in, counted as a false match). Changes cases 11–12.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction; listed in project-docs/decisions-for-owner-review.md D19–D22]`:
> Q1 default accepted — never notify a user of their own message. · Q2 default accepted — one LINE account ↔ one user.
> · Q3 → the SA (Team B), your default is the PM's preference ("listed once seen"). · Q4 default accepted; a second
> test OA is added to the owner's §B list (B7) — case 26's LINE-refusal half is NOT_TESTED until then.
> · Q5 default accepted — count pushes only. · Q6 → both SAs as a testability requirement (relayed 2026-11-01).
> · Q7 default accepted.

- **Q8 — signing REQ-003 without real LINE (2026-11-01, Tefany).** AC-8 says the "tag all" check is settled on a real
  test group **before AC-2 is signed**. You ruled that real LINE (B1) stays NOT_TESTED. Default: REQ-003 is signed
  `TEST_PASSED` once you accept, in writing here, that AC-8, AC-5's LINE refusal and the real push stay NOT_TESTED until
  B1/B7, and once I have run AC-7's admin-web display (needs the D43 database). Without your line, it stays IN_TEST.
  Checked: DECISIONS · decisions-for-owner-review D16/D44/B1/B7 — none rules on AC-8's "before AC-2 is signed".
  > answer to Q8 `[PM, 2026-11-01]`: **your default, accepted in writing.** REQ-003 may be signed TEST_PASSED after your
  > AC-7 admin-web run on the D43 database. The following stay **NOT_TESTED** and are named in the verdict: AC-8 ("tag all" on a
  > real group), AC-5's LINE refusal (B7) and the real push. AC-8's "before AC-2 is signed" is set aside for round 1 by
  > this line. B1 has now been given (the owner put the keys in `.env`, 2026-11-01). The real-LINE check therefore becomes its
  > own live run, like REQ-002's B2: once TASK-034 (LINE_LIVE guard) lands, with the test OA only, a tunnel only while
  > testing (D16), and the owner present to post in a test group. REQ-003 is not DELIVERED until that live run.

- **Q9 — test doubles vs. rule 4's "never builds a stand-in" (2026-11-01, Tefany; applies to TEST-005 too).** My
  harnesses (`harness/qa-b/test-004.ts`, `stack.ts`) give the back end these values in the process environment:
  the product's own fake LINE API + a made-up LINE secret and token (D44 asks for the fake base), the desk's fake
  gateway (`harness/fake-gateway`), and a QA-generated `SECRET_KEY` + owner login for QA's throwaway database.
  Default: these are **test instruments, not stand-ins for the product's env**. They are allowed in QA runs only, never
  written to any `.env`. `DATABASE_URL` comes only from the owner's `.env` (name swapped to `corner_chat_test_qa_b`,
  D43). Mail stays as now (closed port; mail rows NOT_TESTED until B2). If you rule the other way, every LINE/AI row
  needs the owner's real values and the D44 guard. Correct only the line that is wrong.
  Checked: CLAUDE.md rule 4 (2026-11-01, re-read) · D43 · D44 — rule 4 does not say whether QA test doubles count.
  > answer to Q9 `[PM, 2026-11-01]`: **your default.** `Interpreted CLAUDE.md rule 4 "never builds a stand-in" as: do not
  > replace an env value the product needs from the owner (his database, his real keys) with a home-made one in a `.env`.`
  > It does not cover test instruments that live only in a QA run's process environment: the product's fake LINE (D44
  > requires it), the desk's fake gateway, and a throwaway `SECRET_KEY` and owner login for QA's own test database. Never
  > written to any `.env`. `DATABASE_URL` comes only from the owner's `.env`, with the name swapped (D43). The same reading
  > covers Tanya's harness. Atlas owns rule 4 and may overturn this; I have told him.

- **Q10 — the back end will not start on a QA database (2026-11-01, Tefany; blocks TEST-004 AC-7 and TEST-005's live rows,
  likely Tanya's runs too).** Measured: the owner's `DATABASE_URL` now points at his server (`local:false`). I swapped the
  name to `corner_chat_test_qa_b` per Q4/D43 and ran `bun scripts/migrate.ts`, and the back end refused:
  `Configuration error: DATABASE_URL must name the database "corner_chat" (this server is shared), got "corner_chat_test_qa_b"`
  (`corner-chat-back/src/config.ts:86`; the only other allowed names are `corner_chat_test_r<n>_<hex6>` for
  `DATABASE_URL_TEST`). Also, `corner_chat` itself does not exist on the server yet (`database "corner_chat" does not exist`).
  The run left nothing behind: the half-made DB was dropped and checked gone, and no process is left.
  Default: the back end gets a way to start on QA's own database (`corner_chat_test_qa_a` / `_qa_b`) for QA runs. How it
  does that is the SA's call, not mine. Fallback: QA runs on `corner_chat` only while no dev server runs, with you
  coordinating; that brings back the shared-DB risk of the earlier incident. Correct only the line that is wrong.
  Checked: Q4 answer (D43 names) · CLAUDE.md rule 4 · DECISIONS "one dev server per DB" — none covers the config guard.
  > answer to Q10 `[PM, 2026-11-01]`: **your default.** The back end must start on QA's own database for QA runs. I routed this
  > to SA Sober (the config guard is Team A's, TASK-033); the how is his. No fallback onto `corner_chat`. `corner_chat` itself
  > is created by `db:init` now that SSL is settled for test data (D45).
