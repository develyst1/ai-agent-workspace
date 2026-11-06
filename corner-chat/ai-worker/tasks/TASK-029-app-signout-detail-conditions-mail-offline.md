# TASK-029: Sign-out, real detail + correction + mail reply, conditions, Zimbra connect, offline
- Source: SPEC-003 rev 2 § Screens (`/messages/:id*`, `/conditions`, `/channels/zimbra`), § Behaviour (sign-out, refresh, offline) · SPEC-001 §3.1–§3.6 (paths, keys, error codes exact) · REQ-005 req 2, 4, 5, AC-3, AC-4, AC-5, AC-6 · REQ-001/002/004 wording
- Owner: FE (**Fern, Team A**). The reviewer is **Sober** (SA, Team A). SPEC-003's owner stays Silver (SA, Team B). Questions go
  Fern → Sober → PM → Silver. `Interpreted` `DECISIONS.md` D30 ("TASK-017 → Fern") as covering this rev-2 successor of TASK-017.
- Status: DONE (SA Sober, 2026-11-01; mail-reply success path UNVERIFIED — needs B2)
- Depends on: **two phases (amended 2026-11-01, Team A SA's suggestion, PM supports, SA-B yes):**
  - **Phase A: after TASK-025 is DONE.** Build `/conditions` and `/channels/zimbra` (steps 3–4) on fakes, **only inside
    `src/features/conditions/**` and `src/features/zimbra/**`**. Put the types, the fake repo and the Thai strings in a file
    inside each folder (e.g. `src/features/conditions/types.ts`, `fake.ts`, `strings.ts`), and put tests there too. Do **not**
    touch any shared file: `models.ts`, `repositories.ts`, `api-client.ts`, `routes.tsx`, `strings-th.ts`, `main.tsx`,
    `src/test/**`. The screens are not routed yet; test them as components.
  - **Phase B: after TASK-027 and TASK-028 are DONE** (they write the shared `models.ts`, `repositories.ts`, `api-client.ts`,
    `routes.tsx`). Move the local types/strings into the shared files, wire the routes and HTTP, then do steps 1, 2 and 5 and the live DoD. Fern installs nothing: she uses TASK-025's toolchain (`machine.local.md`). Replaces TASK-017 (SUPERSEDED).

- Repo: `corner-chat-app`. Files you may edit:
  - **Never** (Team B's, D30): `src/features/line/**`, `src/features/channels/**`, `src/data/http/channels.ts`,
    `src/data/fake/channels.ts`, `src/push/**`, `android/**`, `src/features/signin/**` (report a bug there instead)
  - `src/data/models.ts`, `src/data/repositories.ts` (add, don't change existing types), `src/data/fake/**` and `src/data/http/**` except the channel files above
  - `src/features/messages/**`, `src/features/message-detail/**`, `src/features/reply/**`, `src/features/conditions/**`,
    `src/features/zimbra/**`, `src/features/shell/**` (offline banner, sign-out) · `src/app/**` · `src/test/**`
- Git writes allowed: **none.**

## What to do
1. Sign-out per SPEC-003 § Behaviour: `DeviceRepo.unregister()` first (a no-op until TASK-030), then `POST /auth/logout`, then clear the token and the offline cache.
2. (Added 2026-11-01, D40, phase B.) On the detail, put one line `คุณย้ายข้อความนี้มาเอง` under the why card, only when `correction` is not null.
   Put the string in `strings-th.ts`, add a test (fake: a corrected fixture shows it, an uncorrected one does not), and add a screenshot to the AC-4 walk.
   HTTP detail + correction (§3.4) on TASK-027's `api-client.ts`. Reply screen: `POST /messages/:id/replies` + `POST /replies/:id/retry`,
   with the detail polled every 3 s up to 1 min while a reply is `queued`/`sending`. `NOT_MAIL` / `MAIL_NOT_CONNECTED` → the generic
   error. `failed` → `ส่งไม่สำเร็จ ลองอีกครั้ง` + retry.
3. `/conditions` (§3.5): sentences + bar (slider, `แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}%`, save), rules list, add (kind, value, action; a
   `group` rule picks from `ChannelsRepo.lineGroups()`), delete. `RULE_EXISTS` → the generic error. On the detail, the menu
   `เพิ่มกฎจากผู้ส่งนี้` opens add-rule with `kind: sender` and `value: sender.key`.
4. `/channels/zimbra` (§3.6): connect (`PUT`), its states, `MAIL_LOGIN_FAILED` → `เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง`,
   `MAIL_SERVER_UNREACHABLE` → the generic error, disconnect `เลิกเชื่อม`. The password is never pre-filled or stored.
5. Offline per SPEC-003: cache the first page per (tab, channel); the banner; reload on reconnect and on app resume.

## Definition of Done (paste real output)
- [ ] `npm run build` clean · `npm test` green: sign-out order (unregister → logout) · offline banner + cached list, back online → reload · reply `failed` → retry button.
- [ ] **Live, local** (TASK-027's back-end recipe: own DB, own port; made-up users U1/U2):
  - **AC-3:** a held message shows in `ไม่ได้แจ้ง` with its reason, and correcting it to `แจ้ง` moves it (screenshot + the `corrections` row);
  - **AC-6:** sign in as U2 → none of U1's messages, rules or channels (screenshots of all three tabs for both users);
  - **AC-5:** emulator airplane mode → banner + last list; off → refresh works (screenshots);
  - conditions: bar → 80 → `GET /conditions` shows 80 (paste);
  - mail reply: only with B2 test mailboxes; otherwise `UNVERIFIED — needs B2`.
- [ ] **AC-4 walk:** every route of SPEC-003, reached through the app's own navigation at 360 px. Write it as a table in Notes
      (route → how reached → screenshot), with the screenshots in `../ai-worker/tests/harness/task-029/`.
- [ ] `git status --porcelain` → only listed paths.

## Implementation Notes
*(Fern, FE Team A)*

### Phase A — `/conditions` and `/channels/zimbra` on fakes (2026-11-01) — DONE, waiting for SA review; phase B (steps 1, 2, 5 + the live DoD) not started

**Repo state:** `corner-chat-app`, branch `main`, HEAD `f5e060d`; tracked files unchanged, the whole tree is still untracked (Fanta's TASK-025 scaffold and later). I wrote **13 files, all inside
`src/features/conditions/**` and `src/features/zimbra/**`** (list below) and touched no shared file (`models.ts`, `repositories.ts`, `api-client.ts`, `routes.tsx`, `strings-th.ts`, `main.tsx`, `src/test/**`), nor any of Team B's paths. I installed nothing.
`npm run build` also rebuilt the git-ignored `dist/`.
- `conditions/`: `types.ts` · `strings.ts` · `fake.ts` · `Choice.tsx` · `ConditionsScreen.tsx` · `conditions.test.tsx` · `index.ts`
- `zimbra/`: `types.ts` · `strings.ts` · `fake.ts` · `ZimbraScreen.tsx` · `zimbra.test.tsx` · `index.ts`

**What the screens do (SPEC-003 § Screens, SPEC-001 §3.5–3.6):**
- `ConditionsScreen({ repo, loadGroups, prefillRule? })` — sentences textarea + the REQ-004 hint; the bar as a range 0–100 with `แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}%`; save (disabled until something changed; a status line after saving);
  rules list (kind label · value · action label; a `group` rule shows the group's **name**, not its id) with delete; add form: kind (`จากคนนี้` / `มีคำว่า` / `จากกลุ่มนี้`), value text — or, for `group`, a select of `loadGroups()` (with `ยังไม่มีกลุ่ม …` when empty) — action (`แจ้งเสมอ` / `ไม่ต้องแจ้ง`), `เพิ่ม`.
  `RULE_EXISTS` and every other error → `เกิดข้อผิดพลาด ลองอีกครั้ง`. `prefillRule` is how the detail's `เพิ่มกฎจากผู้ส่งนี้` opens the form with `{ kind: 'sender', value: sender.key }`. Loading, load-failed + retry, and empty-rules states.
- `ZimbraScreen({ repo })` — not connected: email + password (type password, `autocomplete=off`) + connect; connected: `เชื่อมแล้ว`, the email, `เลิกเชื่อม`. `MAIL_LOGIN_FAILED` → `เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง`; `MAIL_SERVER_UNREACHABLE` and the rest → the generic error.
  The password is never pre-filled, never rendered, and the field is emptied after every attempt (test: it is not in the page text after a connect).
- Both are **content only**: the title, the sign-out menu / back arrow come from the route wrapper in phase B (today's `Placeholder`). Every interactive element has a `data-testid` (`conditions-*`, `zimbra-*`).
- `repo` / `loadGroups` must be **stable references** (the screens reload when they change) — phase B passes the repo from one place, not a new object per render.

**Judgement calls (veto welcome):**
1. **Native inputs, not antd-mobile's.** The range, text, textarea, select and the radio-style choices are plain elements styled with antd-mobile's CSS variables; buttons are antd-mobile `Button`. Why: antd-mobile's `Slider` is drag-only (it has `aria-valuenow` but no keyboard
   handling) and its `Input` puts a `data-testid` on a wrapper, not on the `<input>` — neither can be driven by a script (the owner's reason for D36, "script testing"). A native `<input type=range>` is scriptable with `fill`.
2. **No antd-mobile `Toast`** for "saved": under React 19 it threw `unmountComponentAtNode is not a function` on unmount (an unhandled error that fails the vitest run). The saved message is an inline `role="status"` line instead.
3. A `group` rule starts on the first group in the list, so adding is one tap.
4. The local `RepoError` class (carries `error.code`) is declared in each folder; phase B replaces it with `api-client.ts`'s error.
5. Zimbra's `lastSyncAt` / `lastError` (`MailChannel`) are not shown — SPEC-003 doesn't say to; showing a raw `lastError` would be developer text.

**Wording — real Thai only from the REQs / SPEC-003 § Wording; everything else shows its key name** (same rule as TASK-008). **Open keys (please route to the PM):**
`conditions.sentencesLabel` · `conditions.rulesTitle` · `conditions.rulesEmpty` · `conditions.addRuleTitle` · `conditions.valueLabel` · `conditions.groupLabel` · `conditions.loading` · `conditions.retry` · `conditions.saved` · `zimbra.passwordLabel` · `zimbra.connect` · `zimbra.loading` · `zimbra.retry`.
Also confirm: I reused the approved word `อีเมล` (the list chip) as the Zimbra **email field label**; and delete has no confirm (not in the SPEC) — say if the PM wants one.

**Evidence (real output):**
- `npx vitest run` (whole app) → `Test Files 4 passed (4) · Tests 28 passed (28)` — of which **10** are `conditions.test.tsx` and **7** are `zimbra.test.tsx` (against the fakes): label/kind/action rendering with a group name · bar → 80 → save → `repo.get()` returns 80 and the label follows · sentences save ·
  failed save keeps the draft + generic error · add keyword (trimmed) then the same again → generic error / one rule · group rule stores the id · no groups · delete (failed, then ok) · prefilled sender rule · failed load → retry; Zimbra: empty form + password type · good login → connected, password not in the page · wrong login → REQ text, password emptied, nothing stored ·
  `MAIL_SERVER_UNREACHABLE` → generic · connected on open → disconnect → empty form · failed disconnect · failed load → retry.
- `npm run build` → `tsc -b && vite build` → `✓ built in 336ms` (first run found `TS1294 erasableSyntaxOnly` on a constructor parameter property in both `types.ts` — fixed). `npm run lint` (oxlint) → no finding in my two folders (two `set-state-in-effect` warnings exist in `messages/useMessageList.ts` and `message-detail/MessageDetailScreen.tsx`, not mine).
- **360 × 800 walk** — `tests/harness/task-029/phase-a/` (`vite.config.mjs`, `main.tsx`, `shoot.mjs`: a throwaway page that mounts the two screens on their fakes, because the routes are not wired until phase B; headless Chrome) → **ALL PASS**: no horizontal scroll and **every control ≥ 44 px** on `/conditions`, the Zimbra form and the Zimbra connected view · add keyword → listed · same rule again → generic error ·
  group rule listed by name · bar label follows the slider · prefilled sender rule · wrong login → REQ-002 text and emptied password · good login → connected, no password in the page · disconnect → empty form · no console error. Screenshots (`phase-a/`): `a-01-conditions.png` · `a-02-conditions-rule-exists.png` · `a-03-conditions-group-picker.png` ·
  `a-04-conditions-saved.png` · `a-05-conditions-prefill.png` · `a-06-conditions-no-rules.png` · `a-07-zimbra-form.png` · `a-08-zimbra-login-failed.png` · `a-09-zimbra-connected.png`.
- `git status --porcelain --untracked-files=all` for my two folders → exactly the 13 files above.

**UNVERIFIED / not in phase A:** everything against the real back end (TASK-027's `api-client.ts` does not exist yet) · the routes and the header (phase B) · the detail's menu `เพิ่มกฎจากผู้ส่งนี้` that would pass `prefillRule` (needs TASK-027's detail screen) · AC-3/5/6 and the AC-4 route walk (phase B) · the real LINE-groups call (`ChannelsRepo.lineGroups()` is Team B's, phase B injects it as `loadGroups`).
**Footprint:** the harness server on :5199 started and stopped; nothing created on any back end; `dist/` rebuilt (git-ignored).

### Phase B — steps 1, 2, 3, 4, 5 + D39 + D40 + wording, live DoD (2026-11-01) — DONE except the items under UNVERIFIED; waiting for SA review

**Repo state:** `corner-chat-app`, `main`, HEAD `f5e060d`, the whole tree still untracked; no git writes. **Two files outside my closed list were edited with Sober's written OK** (TASK § Questions, "Phase B questions"), each re-read right before editing and unchanged since:
`src/features/placeholder/SignOutDialog.tsx` (the confirm handler now `await signOut()` → close → `navigate('/signin', { replace: true })`, plus its doc comment and one import) and `src/main.tsx` (the interim `setMessagesRepo(new HttpMessagesRepo(new FakeMessagesRepo()))` block and its three imports removed). Nothing in `android/**`, `src/push/**`, `features/{line,channels,signin}/**` or `data/{http,fake}/channels.ts` was touched (Team B's `BackHeader` and `TabHeader`/`channelsRepo` are imported only).

**What changed:**
- *Data layer.* `models.ts`: `ConditionsRule` (= `Rule` + `createdAt`), `Conditions`, `NewRule` (added; `Rule` untouched). `repositories.ts`: `ConditionsRepo` filled, new `MailRepo`, `SessionRepo`, `DeviceRepo.unregister`, and `MessagesRepo.reply` / `retryReply` — **`AuthRepo` was not changed**, so Fanta's `FakeAuthRepo` in `signin/` still compiles (logout is its own `SessionRepo`).
  `data/http/`: `messages.ts` (real `detail` / `correct` / `reply` / `retryReply`, no fake fallback), `conditions.ts`, `mail.ts`, `session.ts` (a 401 on logout counts as done), `device.ts` (a no-op until TASK-030). `data/fake/`: `conditions.ts`, `mail.ts`, and `messages.ts` extended (a reply goes queued → sending → sent on each detail read; a body containing `FAIL` ends `failed` once, a retry succeeds; `NOT_MAIL` for LINE, `MAIL_NOT_CONNECTED` option).
  Each feature has a `repo.ts` that picks fake or HTTP by `config.fake` (`messages/repo.ts` now does too, so `main.tsx` needs no wiring).
- *Step 1 sign-out* — `shell/signout.ts`: `DeviceRepo.unregister()` → `POST /auth/logout` → clear token → clear offline cache; a failed step 1 or 2 is logged with a fixed text (no error text, token or message) and the sign-out goes on.
- *Step 2* — `/messages/:id`: real detail and correction; **D40** `คุณย้ายข้อความนี้มาเอง` right after the why card when `correction` is not null (`S.movedByYou`); the button `เพิ่มกฎจากผู้ส่งนี้` (a button in the action list, not a popup menu) opens `/conditions` with `{ kind: 'sender', value: sender.key }`. `/messages/:id/reply` (`features/reply/`): body, send, status `กำลังส่ง` → `ส่งแล้ว` / `ส่งไม่สำเร็จ ลองอีกครั้ง` + retry (the approved `ลองอีกครั้ง`); the detail is read every 3 s for up to 1 minute (`reply/timing.ts`); `NOT_MAIL` / `MAIL_NOT_CONNECTED` → the generic error.
- *Steps 3, 4* — the phase A screens moved onto the shared types / strings (their local copies deleted); route pages `ConditionsPage` (tab header + screen, reads `location.state.prefillRule`) and `ZimbraPage`. `conditions.valueLabel` is split by kind (SA key names); **D39** delete confirm: ลบ opens a dialog `ลบกฎนี้ใช่ไหม` with ยกเลิก / ลบ, the rule goes only on ลบ — a scriptable `Dialog` (buttons with test ids inside the content, as `SignOutDialog`). The PM's Thai for all 13 keys is in `strings-th.ts`.
- *Step 5* — `shell/offline.ts` + `useMessageList` + `Shell`: the first page of each (tab, channel) is saved after every successful load (Preferences); a fetch that fails at the network level (not an API error, not a lost session) shows the saved page + the banner `ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด`; `@capacitor/network` offline raises the banner; reconnect and `@capacitor/app` resume reload the list; sign-out clears the saved pages. The banner is in the shell, so it shows on all three tabs.

**Judgement calls (veto welcome):**
1. A sender rule's value is lower-cased only when it contains `@` (SA-accepted); a LINE userId passes through exactly — proven live (`U0001abCDef` stored as typed).
2. The first reading of `@capacitor/network` may only *raise* the offline flag ("connected" says nothing about the server), so a failed fetch is never un-flagged by a late "connected".
3. The saved page is first-page-only, so while offline `nextCursor` is null (nothing to load more from).
4. `.adm-tabs-tab` raised from 40 px to 44 px in `messages.css` (it failed my own hit-target check).
5. The add-rule action on the detail is a plain button, because a popup menu was extra UI for one item.

**Evidence (real output):**
- `npx vitest run` → `Test Files 12 passed (12) · Tests 83 passed (83)` (56 passed before my five new phase B test files; they add 27, and the two phase A files grew): `conditions` 12 (incl. the D39 confirm both ways, the `@`-only lower-casing) · `zimbra` 7 · `signout` 5 (order unregister → logout → clear token → clear cache; a failed device step and a failed logout step still sign out locally; log text is fixed; the dialog: cancel does nothing, confirm calls it and lands on `/signin`) · `offline` 7 (online saves; fetch fails → banner + saved list, back online → reload + banner gone; a never-opened view → error state; an API error is not "offline"; the browser's `offline` / `online` events through the Capacitor plugin; sign-out clears the saved pages; banner on the other tabs) ·
  `reply` 4 (queued → sent; `FAIL` → failed → retry → sent; `NOT_MAIL` and `MAIL_NOT_CONNECTED`; polling stops at the cap) · `detail` 4 (D40 shown for a corrected fixture, absent for an uncorrected one, appears after a correction; add-rule prefill from a mail sender and from a LINE userId) · `http-repos` 7 (exact path, method, body and unwrapping of every new call against SPEC-001 §3.2/§3.4–§3.6; error codes → `ApiError(code, status)`; the mail password is in no URL, header or console call).
- `npm run build` → `tsc -b && vite build` → `✓ built in 301ms`. `npm run lint` (oxlint): 2 warnings, both `set-state-in-effect` in code that was there before (`messages/useMessageList.ts:40` — the pre-existing line, only moved down by my additions — and `message-detail/MessageDetailScreen.tsx:29`); nothing new.
- `/impeccable audit` (web, product register; no PRODUCT.md): `detect.mjs --json src` → `[]`; grep of my files: no inline hex, font-family, magic z-index or `transition: all`. Fixed from my own checks: antd-mobile `Toast` (React 19 unmount error) replaced by an inline `role=status`; `.adm-tabs-tab` 40 → 44 px; typecheck `erasableSyntaxOnly` on a class parameter property. **Left, minor:** the cached list's banner sits above the page header (a sticky bar would be nicer) · no dark mode · the D40 line is secondary-grey 14 px (readable, not measured). Passing the audit is not the PM's approval of the look.
- **Live, local, the real back end** (the desk rule): a private database `corner_chat_app_a` on the team's cluster (:5433, never :5432), the real back end `bun src/index.ts` on **:8094** with `FILTER_PAUSED=true`, the LLM gateway at a closed port (every message is seeded already decided) and no LINE token; the app in its browser run mode (`VITE_FAKE=false VITE_PROXY_TARGET=http://127.0.0.1:8094 vite --port 5180`); headless Chrome at **360 × 800**; two made-up users U1 / U2 created through `POST /admin/users` and the data from `tests/harness/task-029/seed.sql`; the owner login read from the back end's `.env` at run time. Script: `tests/harness/task-029/shoot-live.mjs` → **`ALL PASS`** on its last run (earlier runs on the same code found a wrong table name in the script itself, a wrong token in my sign-out check, and the 40 px message tabs):
  - **AC-3:** U1's held message `…004` is in ไม่ได้แจ้ง with `ทำไมไม่แจ้ง` and its reason (`เป็นการพูดคุยทั่วไปในกลุ่ม ไม่ได้ถึงตัวคุณ`, 18% · bar 70%); tapping แจ้ง → `select outcome from corrections where message_id = '…004'` → **`notified`**; `GET /messages/:id` → `outcome notified · decidedBy user · correction {outcome: notified, at: 2026-11-01T12:02:25Z}`; the message left ไม่ได้แจ้ง and is in แจ้งแล้ว. D40's line is absent before the correction and present after (`live-ac3-detail-corrected.png`).
  - **AC-6:** U1 sees exactly its 3 + 3 messages, U2 exactly its 1 + 1; no U1 text on U2's pages; U2: no rules, bar 70, empty sentences, a group picker with only U2's group, no LINE link, no mailbox; U1: `เชื่อมแล้ว` on LINE. **Server rule:** with U2's token `GET /messages/<U1's id>` → `404 NOT_FOUND` and `POST …/correction` → `404`. Screenshots of all three tabs for both users below.
  - **Conditions:** bar 80 + sentences saved → `GET /conditions` → `{"bar":80,"sentences":"แจ้งเฉพาะเรื่องงานที่ต้องตอบ (ทดสอบ)","rules":[{"kind":"sender","value":"sales@vendor.test","action":"always"}]}`; the same rule twice → the generic error (real 409 `RULE_EXISTS`); D39: ลบ opens `ลบกฎนี้ใช่ไหม`, nothing deleted; ยกเลิก keeps the rule; ลบ deletes it (real 204); a LINE sender key `U0001abCDef` carried to the add form and stored exactly.
  - **Reply:** U1 has no mailbox, so a real send is refused with `409 MAIL_NOT_CONNECTED` → the generic error on the screen and `mail_outbox` stays empty (`live-reply-not-connected.png`).
  - **Sign-out:** token and saved lists gone from the app; the *browser's own* session token → `401` afterwards (so `POST /auth/logout` ran); opening `/messages` goes to `/signin`.
  - **AC-5, browser equivalent:** both tabs loaded online (the two saved pages exist) → the network cut (`context.setOffline(true)`) → the banner and the saved held list → restored → the banner goes and the list reloads. **This is not the emulator run — see UNVERIFIED.**
- **AC-4 walk** — 360 px, every route reached through the app's own navigation, no horizontal page scroll on any (checked per route), every control in my files ≥ 44 px:
  | Route | How reached | Screenshot (`tests/harness/task-029/`) |
  |---|---|---|
  | `/signin` | open the app signed out (the guard redirects `/`) | `walk-01-signin.png` |
  | `/messages` (แจ้งแล้ว / ไม่ได้แจ้ง) | sign in → first tab; the held tab by its tab | `walk-02-messages-notified.png` · `walk-03-messages-held.png` |
  | `/messages/:id` | tap a row | `walk-04-detail-held.png` · corrected + D40: `live-ac3-detail-corrected.png` |
  | `/messages/:id/reply` | detail → ตอบกลับ (mail only) | `walk-05-reply.png` · the real refusal: `live-reply-not-connected.png` |
  | `/conditions` | detail → เพิ่มกฎจากผู้ส่งนี้ (prefilled); also the tab | `walk-06-conditions-prefilled.png` · `live-u1-tab-conditions.png` · D39: `live-delete-confirm.png` |
  | `/channels` | the third tab | `walk-07-channels.png` |
  | `/channels/zimbra` | channels → อีเมล Zimbra | `walk-08-zimbra.png` |
  | `/channels/line` | channels → LINE | `walk-09-line.png` |
  | `/channels/line/names` | LINE → names | `walk-10-line-names.png` |
  | `/channels/line/groups` | LINE → groups | `walk-11-line-groups.png` |
  AC-6 tabs: U1 `live-u1-tab-messages.png` · `live-u1-tab-conditions.png` · `live-u1-tab-channels.png`; U2 `live-u2-tab-messages.png` (+ held `live-u2-tab-messages-held.png`) · `live-u2-tab-conditions.png` · `live-u2-tab-channels.png`. AC-3: `live-ac3-notified-after.png`. AC-5: `live-ac5-offline-list.png` · `live-ac5-back-online.png`. Sign-out: `live-signout.png`.

**UNVERIFIED — what would settle each:**
1. **~~AC-5 on the emulator (airplane mode).~~ RESOLVED in REWORK round 1 below (run on the emulator, ALL PASS).** What I first wrote: not run. Someone else's `cc_phone_360` emulator was starting when I looked (processes started 19:04, `emulator-5554` flipping between `offline` and not found) and the owner's real phone `21ec5dd6` is attached. I did not touch either, and I did not run `cap sync` / `gradlew` in the shared `android/` tree, so no APK was built from phase B. The browser run above proves the app logic and the Capacitor Network *web* plugin; the **native** Network plugin path (APK) is what is unproven. Settles it: build `cornerchat-local.apk` with `VITE_API_BASE=http://10.0.2.2:<port>/api/v1`, `adb -s emulator-5554 install -r …`, then `adb -s emulator-5554 shell cmd connectivity airplane-mode enable` / `disable`, screenshots of the banner + list and of the refresh. Tell me when the emulator and `android/` are free (or Fanta / QA can run it), and I will.
2. **Mail reply (success path) and the Zimbra connect against a real mailbox** — needs B2 test mailboxes. The live run reached only the real refusal (`MAIL_NOT_CONNECTED`); `MAIL_LOGIN_FAILED` and a good login are proven on the fake + the HTTP contract test, not against a real IMAP/SMTP. I did **not** try a login against the owner's real Zimbra host with made-up credentials.
3. A real phone, and push (TASK-030).

**For you to route (not my files):** two controls measure 40 px, below the 44 px floor — `/signin` `signin-submit` (Fanta's TASK-027) and `/channels/line` `line-unlink` (Team B's). Reported, not edited. · The reply screen's wording is closed: the PM's answer (`reply.bodyLabel` = ข้อความตอบกลับ, `reply.send` = ส่ง) is in `strings-th.ts`, and the live walk was **re-run on that final code** (all PASS again; `walk-05-reply.png` shows the real text). Every string on every screen is now the PM's.
**A flake of mine, fixed:** `reply.test.tsx` "polling stops after the minute" failed once inside a full parallel run (a 120 ms wall-clock window starved by load; it passed alone). It now has wide margins (cap 300 ms, waits 900 + 300 ms, asserts "polled at least once, then stopped"); three full runs in a row → `83 passed` each.
**FAILURES.md F-018 (mine):** a failed `psql` call in my harness script printed the throwaway database's connection string, password included, into this session's output. Local cluster, 127.0.0.1 only; I have not repeated the value anywhere; the script now sanitises that error. The BE may want to re-init the cluster password at their convenience.

**Footprint / cleanup:** `corner_chat_app_a` **dropped** (the remaining databases are the BE's and QA's own); my back end (:8094) and Vite (:5180) stopped; Jason's dev server on :8080 and the :5433 cluster were never touched (:8080 had stopped by itself by the end — not me); no emulator, no real phone, no `android/` change; `dist/` rebuilt (git-ignored); the made-up users and messages died with the database.

**Security self-check (for your phase B review; the password first goes over HTTP here):** the Zimbra password is a `type=password` field with `autocomplete=off`, sent only in the body of one `PUT /channels/mail`, cleared from the screen in a `finally` after every attempt, never rendered, never in a URL, a header, storage or a console call (tests: `http-repos`, `zimbra`); sign-out ends the server session and clears the token and every saved page; the saved pages hold message previews in app-private storage (Preferences) and are cleared on sign-out; no log line carries an error text, token or message content (`signout`, `http-repos`); the only `fetch` goes through `api-client.ts` to the configured base (local only).

### Phase B REWORK round 1 (Fern, 2026-11-01, after Sober's review)
- **Item 1 — the saved lists must not outlive a lost session: DONE.** `shell/offline.ts` now registers `onSignedOut(() => clearOfflineCache())` once, at module load, so a 401 (user disabled, password reset) — which `api()` answers by clearing the token and broadcasting — also clears every saved page, not only an explicit sign-out. The next person to sign in on the phone, offline before a first load, now gets the error state, not the previous user's previews.
  Test (`src/test/offline.test.tsx`, "a LOST session…"): load online → the page is saved → a real `api('/me')` against a stubbed 401 rejects `SignedOut` → the saved page is gone → a fresh offline view shows `list-error` and no rows. **Red first:** with the hook switched off the test fails (`expected { items: [ …(5) ], nextCursor: 'NQ==' } to be null` — the old user's page was still there); with the hook on, it passes.
  Full suite after: `Test Files 12 passed (12) · Tests 84 passed (84)`, twice in a row; `npm run build` → `✓ built in 240ms`; `npm run lint` → the same 2 older warnings only. No live re-run: the change is in the app's own store and is covered by the test through the real api client; the live walk (ALL PASS) was on the code before this hook, which only adds a clear on 401.
- **Item 2 — AC-5 on the emulator: DONE (after Sober's "slot is open NOW", inbox line 12).** On the real APK, the native Capacitor Network plugin, a real airplane-mode toggle:
  - **Device:** `emulator-5554`, `sdk_gphone64_x86_64`, API 34, `wm size 720x1600` (= `cc_phone_360`, 360 dp), started by me headless (`emulator -avd cc_phone_360 -port 5554 -no-window -no-audio -no-snapshot -gpu swiftshader_indirect`). **Every adb call named `-s emulator-5554`; the owner's real phone `21ec5dd6` was never addressed** (it stayed listed as `device` throughout).
  - **APK:** `npm run apk:debug` with `VITE_FAKE=false`, `VITE_API_BASE=http://10.0.2.2:8094/api/v1`, `JAVA_HOME=H:\dev-tools\jdk-21` → `BUILD SUCCESSFUL`; `app-debug.apk` 4,498,568 bytes, SHA-256 `ba1209a55fe57b522c89cfad2412f5d704304c5f2c77606ecf17e00c10ef4428`, kept as `tests/harness/task-029/cornerchat-local-task029.apk`; its JS contains `10.0.2.2:8094/api/v1`; built from the code **with** REWORK item 1 (the build ran after it). Back end as in the live run: own database `corner_chat_app_a` (:5433), `bun src/index.ts` on :8094, U1 seeded.
  - **Script:** `tests/harness/task-029/shoot-emu.mjs` → **`ALL PASS`**. It attaches to the app's WebView over DevTools (adb forward + a WebSocket: Playwright cannot attach to a WebView) so the test ids are used; screenshots are the whole emulator screen (`adb exec-out screencap`). Checks: the page runs inside the native shell (`Capacitor.isNativePlatform()`) · U1 signs in and its 3 notified messages come from the real back end over `10.0.2.2` · both tabs loaded online (first pages saved), no banner ·
    **`cmd connectivity airplane-mode enable` → the banner `ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด` appears** (and `settings get global airplane_mode_on` = 1) → the held tab shows the saved list, no error state (`emu-03-airplane-offline-list.png` — the airplane icon is in the status bar) · a new message is inserted on the server meanwhile and is not on the phone ·
    **`airplane-mode disable` → the banner goes and the list reloads by itself, the new message appears** (`emu-04-back-online-refreshed.png`) · airplane mode really off (= 0) · sign-out on the device → `Preferences.keys()` holds no `cc.token` and no `cc.cache.*`. Other screenshots: `emu-01-signin.png`, `emu-02-list-online.png`, `emu-05-signed-out.png`.
  - **Two slips of mine on the way, both in the test, fixed:** Playwright's `connectOverCDP` cannot attach to an Android WebView (switched to raw DevTools); the first run's inserted Thai text was mangled to `????` by the Windows console code page (it went in as a command-line argument) — now inserted from a UTF-8 file and the run repeated; `emu-04` is from the repeat.
  - **Side effects on shared things (all reversed or noted):** the emulator I started is stopped (`emu kill`); `adb install -r` replaced any `com.develyst.cornerchat` installed on that emulator and `pm clear` wiped its data; `npm run apk:debug` ran `cap sync` + `gradlew` in `android/` (generated files only, no source edited) and its `npm run build` left `dist/` as the local-8094 variant — **restored with a default `npm run build`** (no `8094` in `dist/` any more); `android/app/src/main/assets/public` still holds the local-8094 web build until the next `npm run apk:debug` / `cap sync` (the documented build always syncs first). Right after I released the slot another `emulator.exe` started (19:15:03): not mine, left alone. Back end :8094 stopped, `corner_chat_app_a` dropped.
- Everything else in the review is accepted; the reply keys are in; the two 40 px controls are routed to the PM by Sober.

## Questions
- **Phase B (Fern → Sober):** (1) the emulator part of AC-5 (UNVERIFIED 1): who runs it and when `android/` is free? (2) the two 40 px buttons above: route to Fanta / Team B via the PM. (3) The 13 PM keys and the two reply keys are all in (nothing is a key name any more).
- To SA (non-blocking, route to the PM): the 13 open wording keys above · email-field label reuse · does delete want a confirm.
- To SA: OK to hand phase B the screens as they are (content only, props `repo` / `loadGroups` / `prefillRule`)? Say if you'd rather I wire a thin adapter into `ChannelsRepo` / `ConditionsRepo` differently.

  > answer (SA Sober, 2026-11-01): (1) The 13 wording keys, reusing `อีเมล` as the field label, and delete with no confirm all
  > go to the PM. I route them, and key names stay on screen until he answers. (2) Yes: hand the screens over as they are
  > (content only, props `repo` / `loadGroups` / `prefillRule`). In phase B, build one adapter per folder over TASK-027's
  > `api-client.ts`, and pass `ChannelsRepo.lineGroups` as `loadGroups`, memoised once. Do not change the screens' props.

  > answer `[PM, UX writer, 2026-11-01]` (1) the 13 keys:
  > - `conditions.sentencesLabel` เรื่องที่อยากให้แจ้ง
  > - `conditions.rulesTitle` กฎของฉัน · `conditions.rulesEmpty` ยังไม่มีกฎ · `conditions.addRuleTitle` เพิ่มกฎ
  > - `conditions.valueLabel`: follows the kind. จากคนนี้ → อีเมลหรือชื่อผู้ส่ง · มีคำว่า → คำที่ต้องการ
  > - `conditions.groupLabel` กลุ่ม LINE
  > - `conditions.loading` / `zimbra.loading` กำลังโหลด… · `conditions.retry` / `zimbra.retry` ลองอีกครั้ง
  > - `conditions.saved` บันทึกแล้ว
  > - `zimbra.passwordLabel` รหัสผ่าน · `zimbra.connect` เชื่อม (the pair of the approved เลิกเชื่อม)
  >
  > (2) `อีเมล` as the email field label: yes.
  >
  > (3) Delete gets a confirm (D39 in `../../project-docs/decisions-for-owner-review.md`): the dialog text is ลบกฎนี้ใช่ไหม,
  > with the buttons ลบ / ยกเลิก. The key names are the SA's choice. It can land in phase B.

  > answer (SA Sober, 2026-11-01), to carry into phase B: put the PM's Thai in `strings-th.ts` when you move the strings.
  > - Key names: split `conditions.valueLabel` into `conditions.valueLabelSender` (อีเมลหรือชื่อผู้ส่ง) and
  >   `conditions.valueLabelKeyword` (คำที่ต้องการ). A `group` rule keeps `conditions.groupLabel`. The new key is
  >   `conditions.deleteConfirm` (ลบกฎนี้ใช่ไหม), and its buttons reuse `delete` / `cancel`.
  > - Delete confirm (D39): a tap on ลบ opens the dialog, and the rule is deleted only on ลบ. ยกเลิก leaves it in place.
  > - Test the confirm both ways. Use a scriptable dialog, as in phase A's call 1: no hand-only `Dialog`.

- **Phase B questions to SA (Fern, 2026-11-01; non-blocking — I build everything else first):**
  1. **Two files outside my closed list need a one-line change.** (a) `src/features/placeholder/SignOutDialog.tsx` (Fanta's) — its confirm button only does `navigate('/signin')`; real
     sign-out (step 1) must call my new `src/features/shell/signout.ts` (`DeviceRepo.unregister()` → `POST /auth/logout` → clear token + offline cache) before navigating. (b) `src/main.tsx` — TASK-027's interim
     `setMessagesRepo(new HttpMessagesRepo(new FakeMessagesRepo()))` must go once `detail` / `correct` are real (`messages/repo.ts` will pick the HTTP repo by `config.fake`, as `channels/repo.ts` does).
     May I edit those two files for exactly that, or should Fanta / you?
  2. **Reply screen strings are in no table** (SPEC-003 only says "body field, send"): `reply.bodyLabel` (the field label) and `reply.send` (the send button). The retry button reuses the approved `ลองอีกครั้ง`. Please route the two keys to the PM; key names show until then.
  3. **Judgement (SA veto):** the sender value of an add-rule is lower-cased only when it contains `@` (an email). A LINE `sender.key` is a mixed-case userId and must not be lower-cased, so a blanket lower-case would break a rule added from a LINE message's detail.

  > answer (SA Sober, 2026-11-01):
  > **(1) Yes, both, for exactly that change.** `[SA-decided]` The closed list now also holds the two files, each for the one change
  > you describe:
  > - `src/features/placeholder/SignOutDialog.tsx`: the confirm calls your `signout.ts`, then navigates;
  > - `src/main.tsx`: remove the interim `setMessagesRepo(new HttpMessagesRepo(new FakeMessagesRepo()))` line.
  >
  > Nothing else in those files changes. The dialog is Fanta's, and her TASK-030 also hooks sign-out. So right before you edit,
  > check that the file is unchanged since you last read it, and keep your edit to the confirm handler. I am telling SA-B through
  > the PM.
  >
  > **(2)** `reply.bodyLabel` and `reply.send` go to the PM. Key names show until he answers.
  >
  > **(3) Accepted, and it corrects my phase-A note:** lower-case only a value that contains `@`. SPEC-001 §3.5 says `sender.key`
  > is a lower-case email **or** a LINE userId, and the userId must stay as it is.

  > answer `[PM, UX writer, 2026-11-01]` (2): `reply.bodyLabel` **ข้อความตอบกลับ** · `reply.send` **ส่ง**. (1b) has been passed to SA-B.

## Review
**Phase A verdict: ACCEPTED** — SA Sober, 2026-11-01. This is not the TASK's `DONE`: phase B (steps 1, 2 and 5, plus the live DoD)
is still open, and the TASK stays IN_PROGRESS.
- **What I re-ran:**
  - `npx vitest run` → `4 files · 28 passed`
  - `npm run build` → `✓ built in 492ms`
  - `git status --porcelain --untracked-files=all` → your 13 files, all inside `src/features/{conditions,zimbra}/**`
  - No shared or Team B file was changed after your first file. The newer files under `messages/` and `message-detail/` are
    Fanta's TASK-026 work — inferred from the board owner, not checked.
- **Contract check against SPEC-001 §3.5–§3.6:** the local types match exactly: `Conditions`, `Rule`, the `NewRule` kinds and
  actions, `MailChannel`, and the error codes `RULE_EXISTS`, `MAIL_LOGIN_FAILED` and `MAIL_SERVER_UNREACHABLE`.
- **Password handling — I read `ZimbraScreen.tsx` in full:**
  - the field is `type=password` with `autocomplete=off`;
  - the password is cleared in a `finally` after every attempt;
  - it is never rendered and never stored; no storage API and no `console` call.
- **Your judgement calls — all accepted:**
  - native inputs (scriptable, as D36 needs);
  - an inline `role=status` line in place of `Toast`;
  - the first group preselected;
  - a local `RepoError` until phase B;
  - `lastSyncAt` / `lastError` not shown.
- **For phase B:**
  - an adapter maps `POST /conditions/rules`'s `{ rule }` and `PUT /channels/mail`'s `{ mail }` to the screens' shapes;
  - a manually typed `sender` value is lower-cased before it is sent, because `sender.key` is lower-case (SPEC-001 §3.5).
- **Security review:** deferred to phase B, where the password first goes over HTTP. Phase A is fakes only, and the
  password-handling read above is clean.

**Phase B verdict: REWORK (small)** — SA Sober, 2026-11-01. The work is good: everything except the two items below is accepted.
- **What I re-ran:**
  - `npx vitest run` → `12 files · 83 passed`
  - `npm run build` → `✓ built in 243ms`
- **Files:** besides your listed paths and the two files I allowed, the newer files are Team B's. Their times are 18:19–18:35,
  which is TASK-027/028 work before phase B opened. `src/push/**` at 18:50 is Fanta's TASK-030. You touched none of them:
  `inferred` from the timestamps and the owners.
- **Code read:** `signout.ts`, `http/{mail,session}.ts` and how the offline cache is stored and cleared.
  - The order is right: unregister, logout, then clear the token and the cache.
  - The log texts are fixed, so no error text, token or message reaches a log.
  - The password goes only in the `PUT` body.
  - A 401 on logout counts as already signed out.
- **Your judgement calls 1–5:** all accepted.
- **Live run:** accepted as evidence for AC-3, AC-6, the conditions, D39, D40, the sign-out and the AC-4 walk.

**To fix:**
1. **The saved offline lists outlive a lost session (REQ-001 AC-3 / AC-6, data exposure).**
   - Today `clearOfflineCache()` runs only from `signOut()`. When the server answers 401 (an admin disabled the user or reset the
     password), `api()` clears the token but the saved pages stay. They are keyed by (tab, channel), not by user.
   - So the next person to sign in on that phone, if offline before their first load, is shown the previous user's previews.
   - Fix: clear the cache whenever the session is lost. Hook `onSignedOut` once in `offline.ts`, inside your closed list.
   - Add a test: save a page, then a 401 → `SignedOut` → the cache is empty, and the next offline view shows the error state, not
     the old list.
2. **AC-5 on the emulator** (DoD, live): it is still required, and the browser run does not replace it.
   - The emulator and `android/` are shared with Team B, so I am asking the PM for a free slot.
   - When he gives one, build the local APK and run airplane mode on and off, as in your UNVERIFIED 1.
   - Don't run `cap sync` / `gradlew` until he says the slot is free.

**Accepted as open, not REWORK:**
- The mail-reply success path and a real Zimbra connect: `UNVERIFIED — needs B2`, the same as TASK-003/004.
- A real phone and push: TASK-030.

**Routed to the PM:** the two 40 px controls on Team B's side (`signin-submit`, `line-unlink`). The reply keys are answered
(ข้อความตอบกลับ / ส่ง): replace the key names.

**F-018:** your fix (`psql()` sanitises the error) is right. Rotating the cluster password is the BE's call; I have told Jason.

Security review (phase B): one finding — item 1 above, the offline cache surviving a lost session. Everything else is clean:
- the password only in the `PUT` body;
- no secret in a URL, header, storage or log;
- the token kept in app-private storage;
- sign-out ends the server session.

Re-reviewed when item 1 is fixed.

**REWORK round 1, item 1: ACCEPTED** — SA Sober, 2026-11-01.
- `offline.ts:88` registers `onSignedOut` → `clearOfflineCache()` once.
- `api-client.ts` fires the listeners on every 401 that has `auth`; login's own 401 does not count.
- My re-run: `npx vitest run` → `12 files · 84 passed`.
- **Item 2 is still open:** the PM's slot **is open now**, until TASK-029 is DONE. You may use `cc_phone_360` and run `cap sync` /
  `gradlew`. Do not edit `android/` sources, and never touch the owner's real phone. When the AC-5 run passes, this TASK is DONE
  (mail reply stays `UNVERIFIED — needs B2`).

**Verdict: DONE** — SA Sober, 2026-11-01. REWORK item 2 is accepted, which closes both items.
- **AC-5 on the emulator — I looked at the screenshots myself:**
  - `emu-03-airplane-offline-list.png`: the airplane icon is in the status bar, the banner `ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด`
    shows, and so does the saved held list.
  - `emu-04-back-online-refreshed.png`: the network is back, the banner is gone, and the message added on the server while the
    phone was offline (`ข้อความใหม่ตอนออฟไลน์`, 19:14) is at the top.
  - The run used the real APK and the native Network plugin, on `emulator-5554` only. The owner's phone was never addressed.
- **`android/`:**
  - the files changed at 19:11 are `cap sync` output, which the slot allowed;
  - the Java and manifest files (18:50–19:02, `watch/**`) are Fanta's TASK-030 watcher — `inferred` from the times and the folder.
  - So no `android/` source was edited by this TASK.
- **Accepted as open:** the mail-reply success path and a real Zimbra connect (`UNVERIFIED — needs B2`, as TASK-003/004); a real
  phone and push (TASK-030).
- **Security review (phase B):** done. The one finding, the offline cache surviving a lost session, is fixed (round 1). Clean.
