# TASK-914 — FE: Notification subscriptions + web feed (R0.4) — backoffice-front — @Fanta (lent to Team A)

**From @Sober, 2026-11-09. R0.4: in-web notifications, per person and per type — the subscription settings + the web feed.** On a fixture now. Repo `smart-scheduler-backoffice-front`, branch `dong`. **Brownfield — map the final-UI Notification/Setting screens first.** Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews.**

**⚠️ Cross-cutting (not Stock-only):** the notification TYPES span Salary **and** Stock — so the *event generation* (what creates a Bonus/OT/Low-Stock notification) is a backend, cross-team concern for LATER. **This task is the FE only: the subscription settings + the feed, on a fixture.** Don't build any event generation.

## Requirement (REQ-120 R0.4, verbatim)
- **Notifications are in the WEB, per person and per type.** Each staff member is subscribed to chosen types.
- **Types: Bonus · Commission · Transportation · OT · Other · Low Stock.**
- **Today: ฟีน (CEO) gets ALL types; London gets Low Stock.** (Seed the fixture this way.)

## Step 0 (map first, file:line, in `## Implementation Notes`)
- The final-UI Notification + Setting screens (`final-ui/.../Notification*` / `Setting*` — path in `machine.local.md`): the per-person × per-type matrix, the feed/list item.
- People come from the existing admin-safe list `GET /v1/salary/entries/people` (names only, no pay) — reuse it, as 910 does for sellers.

## Build (on a fixture)
- **Subscription settings:** a per-person × per-type matrix (the 6 types) of on/off toggles. Seed ฟีน = all on, London = Low Stock on. Saved via a fixture seam `getNotificationSubs` / `setNotificationSubs` (`STOCK_SOURCE.writes`/a new `NOTIF_SOURCE` = "fixture" until a BE store lands). Who may edit whose subscriptions: CEO edits anyone's; an admin edits their own only (confirm against the final UI / ask me) — **no pay data anywhere** (R0).
- **Web feed:** a list of received notifications (type · short text · date · read/unread), from a fixture; mark-as-read is local/fixture. No generation.
- CEO + admin gated; `PAGE_RULES` row(s) tagged `🔻 TASK-914`.
- Error envelope = app standard `{ error: { code, message, details } }`.

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `bun test` green · `next build` 0 · the matrix seed + toggle round-trip + the feed render proven; static markup. (Browser DOM run = the block's known gap.)
- `git status` = only your files; no Salary file, no `smart-scheduler-back`; no git command.

## Claim
backoffice-front: the Notification settings + feed + their fixture seam + the `PAGE_RULES` row(s). **Sober reviews.** **The per-type event generation + the real subscription/notification store are cross-team backend follow-ons (NOT this task).** Questions → me.

## Questions / Implementation Notes / Review
_(—)_

## Implementation Notes — Fanta, 2026-11-09 (built on fixtures; Sober reviews)
**Step 0 — the final-UI Notification screens** (`final-ui/src/pages/a/notify/NotifySettings.tsx` + `NotifyAlert.tsx`, mock `mock/a-notify.ts`): **Notification Setting** (CEO) = a PLAIN recipient list — a table «Who · Role · Gets» (CEO gets all six; Beam: Low Stock; Ploy: Bonus), a badge «In the web», and a second card «Coach (Full-time / Part-time)» whose boxes are «MYSELF - ALWAYS»; its header comment says **«No opt-out matrix (ruling C-h; her page 9 note)»**. **Notification Alert** (every role, own items only) = «N new», «Mark all as read», rows type badge · text · dd/mm/yy · «Mark as read»; an Admin's items carry no money. **⚠ Conflict I did not resolve myself:** this TASK asks for a per-person × per-type **toggle matrix**; the final UI's ruling C-h says a plain list, no matrix. I built the matrix you asked for (it is a superset: the CEO's and Beam's rows read exactly as the list does). Say if C-h wins and I'll turn the page into the read-only list.
**Built (BF; new files + 1 edit):** `types/app/notification.ts` · `services/notification.service.ts` (`NOTIF_SOURCE = { people: "api", writes: "fixture" }`) + `services/__fixtures__/notification.ts` (the feed; only the service imports it) · `components/partials/Notification/{NotificationSettings.tsx, NotificationFeed.tsx, notification-logic.ts, NotificationData.ts, notification-914.test.tsx}` · `app/(admin)/notify/{settings,inbox}/page.tsx` · `lib/roles/pages.ts` (a new `NOTIFICATION` group token + two rows `🔻 TASK-914`, icons `ShieldCheck` / `BellRing`).
**Settings:** a matrix — a row per person (the CEO first, then the people of the existing admin-safe `GET /v1/salary/entries/people`, «No Teacher» dropped, by name), a switch per type (Bonus · Commission · Transportation · OT · Other · Low Stock); Save is open only when something changed; the seam `getNotificationSubs` / `setNotificationSubs` (fixture) seeds **the CEO = all six, Beam (the customer's «London») = Low Stock**, saves the whole map, and **refuses everyone but the CEO** (`FORBIDDEN`) and any unknown type (`INVALID`) in the standard envelope. **Rows:** «Notification Setting» **CEO only**, «Notification Alert» CEO + Admin; a Coach gets neither.
**Feed:** type badge · text · date (dd/mm/yy, no time) · read/unread, «N new», «Mark as read» / «Mark all as read» (the fixture's local state). The CEO's six items (one per type), an Admin's three — **an Admin's items carry no money** (a test greps `฿`). A Coach: nothing. **No event generation** (BE follow-on).
**Decisions I made (please confirm):** (1) **an Admin cannot open the settings page** — your text said «an admin edits their own only», but the BF session carries a username + a numeric teacher id, not the people-list's UUID, so an admin's own row can't be identified safely; the final UI also has Setting = CEO only. (2) The feed is the CEO's / Admin's role feed, not a per-person feed (no per-person identity yet). (3) No Coach rows (the final UI's coaches are «MYSELF - ALWAYS» — not a toggle).
**Evidence:** `tsc` (bunx typescript 5.9.3) 0 · `bun test` **228 pass / 0 fail** (whole front; `notification-914.test.tsx` 17; mutation: removing the CEO-only rule failed 1, restored) · `bun run build` 0 (`/notify/settings`, `/notify/inbox` listed) · no git; no Salary file, no `smart-scheduler-back`. **NOT PROVEN:** a browser run (toggling, a real Save, marking read) — no DOM test lib in the BF, no sign-in; proven = the pure rules, the seam round-trips incl. CEO-only, the seed drawn on the switches (`data-checked`), the feed markup.
**Questions for Sober:** (1) matrix vs the final UI's plain list (ruling C-h)? (2) Admin and the settings (above) — how does the BE identify «me» for an admin? (3) per-person vs role feed. (4) New English words for Porter: «Notification Setting», «Notification Alert», «Who», «In the web», «N new», «Mark as read», «Mark all as read» (all final UI) and «No notifications».

## CORRECTION + Review (Sober, SA Lead A, 2026-11-09) — C-h wins: NO matrix. My spec was wrong; convert to the read-only list
Fanta correctly flagged a conflict I missed: **ruling C-h (REQ-122 l.172): "notifications: no opt-out ticks; everyone always gets all their own. This simplifies R0."** My TASK-914 spec asked for a per-person × per-type opt-out MATRIX — that **contradicts C-h**. My mistake for not checking the ruling. Good catch not shipping it silently. The build is clean (228/0, build 0) but must change:
**Convert «Notification Setting» from the toggle matrix → the final-UI read-only recipient LIST** («Who · Role · Gets», the «In the web» badge): informational, **CEO-only, no toggles**. Notifications are **role-derived** (the system decides who gets what — e.g. London/Beam gets Low Stock by role; the CEO gets all), and **nobody opts out**. Drop `setNotificationSubs`/the switches; the list just reflects the rules. **Keep the Notification Alert feed as-is** (each person their own; admin's carry no money).
### Your 4 questions
**Q1 — matrix vs list: the LIST (C-h).** Convert as above — it's a simplification (less code). My apology for the wrong spec.
**Q2 — admin identity for settings: moot now.** Settings is CEO-only + read-only (the final UI agrees), so there's no "admin edits their own" problem — your decision (admin can't open settings) is right, and C-h removes the need entirely.
**Q3 — per-person vs role feed: role feed on the fixture is fine for now.** The real per-person feed ("everyone gets all their OWN") needs the identity mapping (username/teacherId → the person), which is a BE/wiring concern when the notification store lands. Note it; don't solve it on the fixture.
**Q4 — words → Porter** (relaying): «Notification Setting», «Notification Alert», «Who», «In the web», «N new», «Mark as read», «Mark all as read», «No notifications».
**Verdict: ✅ ACCEPTED on the fixture AFTER the matrix→list conversion** (small, removes code). The feed stands. Ball: you (convert settings to the read-only list; keep the feed).

## Conversion VERIFIED (Sober, 2026-11-09) — ✅ fully accepted
Read `NotificationSettings.tsx`: now a plain READ-ONLY recipient list (Who · Role · Gets), no switches, no save; the header comment cites C-h and "the list reflects the role-derived rules; no pay data (R0)". The feed is unchanged. **914 fully ✅ ACCEPTED on the fixture** (C-h honored).

## Review of the API wiring — @Silver, 2026-11-09 (Silver is the reviewer for this seam, Porter's split): ✅ ACCEPTED on code
- **My re-run:** BF tsc 0 · `bun test` **368 pass / 0 fail**.
- **Wiring:** `NOTIF_SOURCE = { recipients: "api", feed: "api" }` (`notification.service.ts:10`) on BB TASK-917's `/v1/notifications*`.
  - Recipients + coaches are CEO only: no request is made for anyone else.
  - The feed is the signed-in person's own items, and a coach makes no request.
- **Live check** (feed items appear after a Salary event; mark-read) → Tanya's gate on sid.
- **Security review:** none. The server scopes it to the caller's own rows (TASK-917), and the FE never asks for what the role can't read.
