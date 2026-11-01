# TEST-004: LINE groups in + LINE 1-on-1 notification
- Team: B · TASKs: none yet (SPEC not written)
- Source REQ: REQ-003 (ACs tested: AC-1 … AC-8)
- Status: DRAFT — designed 2026-11-01 from the REQ, before any build; verdicts after SPEC_DONE
- Build under test: repo `corner-chat-back` (Team B's LINE area) + `corner-chat-app` + admin web in `corner-chat-front`, branch TBD (B6), HEAD — to be filled per round
- Surfaces: local back end · signed webhook calls from a harness · real LINE through a temporary tunnel with the **test** OA only (D16) · Android app on an emulator/device
- Designed: 2026-11-01 by Tefany

## Scope
- In: linking a LINE account (AC-1), the four intake triggers (AC-2), the drop-unread privacy rule (AC-3),
  the 1-on-1 push (AC-4), one-OA-per-group help (AC-5), webhook signature (AC-6), push count (AC-7), "tag all" (AC-8),
  the names list (req. 5), receive-only (req. 7).
- The filter's own decision (pass/hold, %) is REQ-004's (Tanya). Here the AI is **stubbed** to "pass" or "hold" so only
  the LINE side is judged. The app notification half of AC-4 is judged in TEST-005 (REQ-005 AC-2).
- Out (REQ Out of Scope): replying into groups, 1-on-1 chats to the OA as a channel, image/sticker content beyond the
  D7 note, Discord, Web Chat, Teams.
- Not in any AC, named so it is a decision, not a gap: user un-links LINE · OA removed from a group · user leaves a group.
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
| 1 | AC-1 link happy | happy | real OA + app | U1 opens Link LINE, adds test OA as friend, sends the shown code | App shows "เชื่อม LINE แล้ว"; screen text matches REQ wording | | | NOT_TESTED |
| 2 | AC-1 wrong code | negative | real OA | U1 sends a code never issued | OA replies "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป"; app still unlinked | | | NOT_TESTED |
| 3 | AC-1 expired code | boundary | real OA | Send a code just before and just after the SPEC's expiry time | before → linked · after → refused (wording above) | | | NOT_TESTED |
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
| 26 | AC-5 group already holding another OA | negative | real OA | Add corner-chat to a test group that holds a second test OA | LINE refuses; app help text "กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว …" present. Help text runs now; the LINE-refusal half needs a second test OA (B7, Q4) | | | NOT_TESTED |
| 27 | AC-6 bad signature | negative / security | harness (curl) | POST a valid event body with a wrong `x-line-signature` | rejected (4xx), DB + AI log unchanged | | | NOT_TESTED |
| 28 | AC-6 missing signature | negative / security | harness | POST with no signature header | rejected, nothing stored | | | NOT_TESTED |
| 29 | AC-6 body changed after signing | negative / security | harness | Sign body A, send body B | rejected, nothing stored | | | NOT_TESTED |
| 30 | AC-7 count +1 per push | happy | real OA + admin web | Read count; cause 1 push; read again | +1 exactly | | | NOT_TESTED |
| 31 | AC-7 non-pushes do not count | boundary | real OA + admin web | Wrong-code reply (case 2) and a held message (case 22) | count unchanged — pushes only (Q5, PM-decided) | | | NOT_TESTED |
| 32 | AC-8 tag-all event shape | settle | real OA | M uses LINE's "tag all"; capture the raw event | Record what LINE sends; SA + QA settle detection; then case 9 runs | | | NOT_TESTED |
| 33 | Req. 2 my groups list | happy | real OA + app | OA added to group G1 with U1 in it | G1 appears in U1's "my groups" once U1 is seen there (PM's preference); not in U2's (not a member). Rule settled in the SPEC | | | BLOCKED (Q3 → SA Team B) |
| 34 | Req. 5 names list edit | happy | app | U1 adds "ต้น", "Ton"; removes "ต้น"; M writes "ต้น" | after removal "ต้น" no longer takes in | | | NOT_TESTED |
| 35 | Req. 7 receive-only | negative | real OA | Through every app screen, look for any way to post into a group | none exists; no group send in back-end logs | | | NOT_TESTED |
| 36 | Wording | happy | app + LINE | Compare every string in REQ §User-facing wording, verbatim | exact match | | | NOT_TESTED |

## Defects
(none — not run)

## Observations (not ours)
(none yet)

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| none — design only | — | — |

## Verdict
Not run. Every case is NOT_TESTED or BLOCKED until: SPEC_DONE + TASKs DONE; Team A's base and REQ-001 users
(cases 1–36); the test OA (B1) for every real-OA case; Firebase (B3) for the app half of AC-4 (TEST-005).
Harness-only cases (11–20, 25, 27–29) can run as soon as the back end runs locally.

## Evidence (decisive)
(filled after the run)

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
