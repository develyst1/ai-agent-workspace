# TASK-023: A rule-decided message gets its own "about" line, never "AI ไม่ได้ตรวจ"
- Source: SPEC-001 §3.4 (`aboutLine`, amended 2026-11-01) · `DECISIONS.md` 2026-11-01 (PM, UX writer): a rule-decided notification
  reads `[channel · group or sender] ตรงกฎของคุณ: {rule}` + the first 2 lines; "AI ไม่ได้ตรวจ" only when the AI was needed and could not answer
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-005, TASK-007 (DONE)

- Repo: `corner-chat-back` — Team A claim · git writes: **none**
- Files you may edit (closed list): `src/filter/pipeline.ts` (`buildAboutLine` and its callers only) · `src/modules/messages/index.ts`
  (only where it builds `aboutLine` for the API; also make it use the shared `preview` helper if you touch it) · `src/core/notify.ts`
  (only if it builds `aboutLine` itself) · `test/filter-rules.test.ts`, `test/messages-api.test.ts`, `test/notify.test.ts`

## What to do
Today `buildAboutLine` (`pipeline.ts:36-45`) returns `null` when there is no AI summary. That covers both the rule decisions
and `ai_unavailable`. Both consumers then print "AI ไม่ได้ตรวจ · <sender>": the FCM title (`core/notify.ts:64`) and Team B's
LINE notifier (`line/notifier.ts:27`). That is wrong for a rule decision.
1. `buildAboutLine` also takes `decidedBy` and the rule (`kind`, `value`) when a rule decided:
   - `decidedBy = "rule"` → `[<อีเมล|LINE> · <group or sender>] ตรงกฎของคุณ: <kind label> <value>`, where the kind label is
     `จากคนนี้` / `มีคำว่า` / `จากกลุ่มนี้` (REQ-004 wording, the same labels the rule reason uses);
   - `decidedBy = "ai"` → unchanged (`… <summary>`);
   - `decidedBy = "ai_unavailable"` → `null` (unchanged: the consumers' "AI ไม่ได้ตรวจ" is right there).
   Cut to 80 characters as before. A `user` correction does not change the line: it follows the system's decision.
2. The API's `MessageSummary.aboutLine` / `MessageDetail.aboutLine` and the notification both use this one function, so the app,
   the push and LINE agree. **Do not edit Team B's `line/notifier.ts`.** Its non-null path already prints the line correctly.
3. A rule whose snapshot is missing (an old row, or `rule_id` set null because the rule was deleted) → use `rule_snapshot` if
   present; if neither exists, `[… ] ตรงกฎของคุณ` with no rule text.

## Definition of Done (paste real output)
- [ ] Tests: an `always` keyword rule `ใบเสนอราคา` → `aboutLine` = `[LINE · ทีมทดสอบ] ตรงกฎของคุณ: มีคำว่า ใบเสนอราคา` (or the mail
      form), both in `GET /messages/:id` and in the FCM payload title · an AI decision → unchanged · `ai_unavailable` → `null`, FCM
      title `AI ไม่ได้ตรวจ · …` · cut at 80 characters · a deleted rule → the snapshot is used.
- [ ] `bun run test` green (whole tree) · `tsc --noEmit` 0 · `git status --porcelain` → only closed-list files.
- [ ] **No live server on :8080 or on the shared dev DB for this TASK** (DECISIONS 2026-11-01: one dev server per database) —
      a throwaway DB + your own port if you need a live check.

## Implementation Notes
Test-first (RED: 12 of the 73 tests failed on the old behaviour, then GREEN). Working tree only, no git. 2026-11-01. **No server was started for this TASK** (DECISIONS 2026-11-01: one dev server per database; the TASK's DoD asked for none).

**What changed**
- `src/filter/pipeline.ts` — `buildAboutLine` now takes `decidedBy` and `rule` (`{ kind, value } | null`):
  - `rule` → `[<อีเมล|LINE> · <group or sender>] ตรงกฎของคุณ: <kind label> <value>`; with no rule known → `[… ] ตรงกฎของคุณ`. The text is built as `ตรง` + the existing `ruleReason(rule)` (`กฎของคุณ: มีคำว่า …`), so the kind labels `จากคนนี้` / `มีคำว่า` / `จากกลุ่มนี้` come from the one place that already owns them and cannot drift from the decision's reason text.
  - `ai` → unchanged (`… <summary>`); `ai_unavailable` → `null`, so the consumers' `AI ไม่ได้ตรวจ` now appears only when the AI was needed and could not answer. Cut to 80 characters as before.
- New in `pipeline.ts`: `decidedRule(snapshot, liveKind, liveValue)` — the snapshot kept on the decision wins (it survives the rule being deleted), else the rule row the decision still points at (old rows have no snapshot), else `null`; and `previewOf` (the 2-line / 200-character preview). I **moved** `previewOf` here and deleted the two copies (the local `preview` in `messages/index.ts` and the duplicate in `core/notify.ts`), as the TASK asked ("use the shared `preview` helper if you touch it"); it lives in `pipeline.ts` because that is the one module both consumers already import and it is on the closed list.
- `src/modules/messages/index.ts` — list and detail queries `left join rules` on `decisions.rule_id` and select `rule_snapshot`; `aboutLine` is built from the **system's** decision (`d.decided_by`), so a user's later correction does not change it (tested: `decidedBy` becomes `user`, `aboutLine` stays).
- `src/core/notify.ts` — its query adds `decided_by`, the snapshot and the rule row, so the FCM title and the `Notification.aboutLine` handed to Team B's notifier use the same function as the API. A message with no decision row at all is treated as `ai_unavailable` (null line → `AI ไม่ได้ตรวจ · <sender>`).
- **Not touched:** Team B's `line/notifier.ts`. Its `aboutLine === null` branch now only fires for `ai_unavailable`; its non-null path prints the rule line as is.

**Evidence (real output)**
- RED run before the change: 12 failures — five `buildAboutLine` unit tests, four API tests (rule line for all three kinds and mail, list = detail, deleted-rule / live-rule / neither, correction keeps the line), two notify tests (FCM title, mail form), and the real-pipeline test.
- GREEN: `bun run test --timeout 30000 test/filter-rules.test.ts test/messages-api.test.ts test/notify.test.ts` → `73 pass · 0 fail`, three runs in a row. Whole tree `bun run test` → `331 pass · 0 fail · Ran 331 tests across 20 files [18.03s]`. `tsc --noEmit` → exit 0.
- DoD cases, all in tests: an `always` keyword rule `ใบเสนอราคา` → `[LINE · ทีมทดสอบ] ตรงกฎของคุณ: มีคำว่า ใบเสนอราคา` (unit) and `[LINE · ทีมงาน] ตรงกฎของคุณ: มีคำว่า …` in `GET /messages/:id`, in the list, and as the **FCM title** (also through the real filter pipeline: `[LINE · g] ตรงกฎของคุณ: มีคำว่า ต้องแจ้ง`) · the mail form `[อีเมล · Anna] ตรงกฎของคุณ: …` in the API and in the push · an AI decision unchanged · `ai_unavailable` → `aboutLine: null` and FCM title `AI ไม่ได้ตรวจ · สมหญิง`, and the line notifier receives `aboutLine: null` · cut at 80 characters for both an AI line and a rule line · a deleted rule → the snapshot is used; no snapshot but a live rule → the live rule is used; neither → `… ตรงกฎของคุณ` with no rule text.
- `git status --porcelain` → files changed for this TASK: `src/filter/pipeline.ts`, `src/modules/messages/index.ts`, `src/core/notify.ts`, `test/filter-rules.test.ts`, `test/messages-api.test.ts`, `test/notify.test.ts` (checked with `find … -newermt "2026-11-01 16:04"` over the repo, excluding `node_modules`, `.local`, `dist`, `.git`: exactly these six files and no others changed since I started; the repo's other untracked files are earlier TASKs', TASK-003's among them).

**UNVERIFIED:** Team B's LINE message itself (their notifier was not run; only the `aboutLine` it receives is tested) and the Flutter app's display of the new line (Team B / Fern).

## Questions
- None.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. Re-run by me: `bun run test` → `331 pass · 0 fail [18.95s]` · `tsc` 0.
`pipeline.ts:52` builds the line as `ตรง` + the existing `ruleReason()`, so the kind labels cannot drift from the decision's reason
text — good design. One function now feeds the API, the FCM title and Team B's notifier. `ai_unavailable` is the only `null`
left, and the user's correction keeps the system's line (tested). Snapshot → live rule → bare fallback all have tests. The
shared `previewOf` removed both duplicates (my TASK-007 follow-up, closed). No server was started — the right call under
the new desk rule. Unverified, accepted: Team B's notifier output and the app display (theirs).
