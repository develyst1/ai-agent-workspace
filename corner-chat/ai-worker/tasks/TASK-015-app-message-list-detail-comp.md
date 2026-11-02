# TASK-015: Message list + message detail on fakes — the comp for REQ-005 AC-1
- Source: SPEC-003 § Screens (`/messages`, `/messages/:id`), § Structure (fakes, models) · SPEC-001 §3.4 (`MessageSummary`, `MessageDetail`, `Reply` — field names exact) · REQ-005 req 2, AC-1, AC-3 · REQ-004 wording · REQ-002 wording (Cc, attachments, reply button)
- Owner: FE (Fanta)
- Status: SUPERSEDED 2026-11-01 by TASK-026 (owner: not Flutter, DECISIONS D36; SA-B). Was: TODO
- Depends on: TASK-014

- Repo: `corner-chat-app`. Files you may edit:
  - `lib/data/models.dart` (`MessageSummary`, `MessageDetail`, `Decision`, `Rule`, `Reply`, `ModelRef` with `fromJson` on the exact SPEC-001 keys)
  - `lib/data/repositories.dart` (`MessagesRepo`: `list({tab, channel, before, limit})`, `detail(id)`, `correct(id, outcome)`)
  - `lib/data/fake/fake_messages.dart`, `lib/data/fake/fixtures.dart`
  - `lib/features/messages/**`, `lib/features/message_detail/**`, `lib/app/strings_th.dart`, `lib/app/router.dart` (wire the two screens)
  - `test/models_test.dart`, `test/messages_test.dart`
- Git writes allowed: **none.**

## What to do
1. Models exactly per SPEC-001 §3.4 (every field, nullable where it says `| null`). `models_test.dart` parses a JSON
   literal copied from §3.4's shape for each class.
2. Fixtures: 12 **made-up** Thai messages (never real people or groups): 6 notified, 6 held; mail and LINE mixed; at
   least one each of: rule decision, AI decision with score/bar/models, `ai_unavailable`, Cc mail, mail with
   attachments, `mention_all`, `name_match`, a corrected one, a mail with one `sent` and one `failed` reply.
3. `/messages`: the two tabs, the channel chips, pull to refresh (fake reloads), infinite scroll on `nextCursor` (fake
   pages of 5), the empty texts per tab (a fixture switch to show them), each row: channel label · `groupName` or sender ·
   time, the about line (or `AI ไม่ได้ตรวจ`), the preview in 2 lines.
4. `/messages/:id`: every element in SPEC-003's row for it, in that order. The correct button calls the fake and
   moves the message to the other tab. `ตอบกลับ` (mail only) opens the reply placeholder.
5. Layout at 360 dp: no overflow stripes, long Thai text wraps, the why card readable.

## Definition of Done (paste real output)
- [ ] `flutter analyze` → `No issues found!` · `flutter test` → green (models + a widget test: the held tab shows a held
      fixture with its reason; tapping `แจ้ง` on it moves it to `แจ้งแล้ว`).
- [ ] **The comp for the PM (AC-1):** on `cc_phone_360` with FAKE, screenshots → `../ai-worker/tests/harness/task-015/`:
      `list-notified.png`, `list-held.png`, `list-line-filter.png`, `list-empty.png`, `detail-ai.png`, `detail-rule.png`,
      `detail-ai-unavailable.png`, `detail-mail-cc-attachments.png` (scroll shots allowed: `-2.png`).
- [ ] A checklist in Notes: each element of REQ-005 req 2 for these two screens → the screenshot that shows it.
- [ ] `git status --porcelain` → only listed files.

## Implementation Notes

## Questions

## Review
