# TASK-009: Admin web — AI settings page (model per layer) + this month's LINE push count
- Source: SPEC-001 §3.3 (`/admin/settings/ai`, `/admin/ai-models`, `/admin/stats/line-pushes`) · REQ-004 req 6, AC-9 · REQ-003 req 8, AC-7
- Owner: FE (Fern)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-008's scaffold (built — may start now, SA 2026-11-01) · build against a harness mock of SPEC-001 §3.3, as in
  TASK-008 · live DoD needs TASK-006 (settings API) and TASK-007 (count API) running

- Repo: `corner-chat-front` — Team A claim · git writes: **none**
- Files you may edit (closed list): `src/app/**` (new pages + the menu entry only), `src/components/**`, `src/services/**`,
  `src/types/**`, `src/lib/strings.ts`

## What to do
1. AI settings page: `GET /admin/ai-models` fills two selects per layer — provider (incl. "let the gateway choose" = `null`)
   and model (only that provider's list); current values from `GET /admin/settings/ai`; save → `PUT /admin/settings/ai`;
   `VALIDATION` shown at the field; `GATEWAY_UNAVAILABLE` → the page says the gateway cannot be reached and keeps the
   current values read-only.
2. LINE push count: a card on the users page (or the menu's first page) with this month's `count` from
   `GET /admin/stats/line-pushes`, and a month picker (default the current month).
3. Wording: every visible string is a key in `src/lib/strings.ts`; the Thai comes from REQ-004 / REQ-001 `## Questions`
   answers (asked by the SA 2026-11-01). Same rule as TASK-008 step 5 — no Thai of your own.

## Definition of Done
- [ ] With TASK-006 running: change layer 1's model, save, reload → the new value shows; then ingest a made-up message (the
      BE's harness script) and its `decision.layer1.model` is the new one (REQ-004 AC-9 — paste the JSON).
- [ ] With TASK-007 running: the count card shows the number from `curl /admin/stats/line-pushes` (paste both).
- [ ] Gateway stopped → the page shows the unreachable state (screenshot).
- [ ] `bun run build` passes · `git status --porcelain` — only closed-list paths.

## Implementation Notes
*(Fern, FE Team A, 2026-11-01)*

**Repo state:** `corner-chat-front`, branch `main`, HEAD `0f8c0bc`, before and after; everything untracked (TASK-008's files plus this TASK's). No git writes.

**UNVERIFIED — real back end.** TASK-006 / TASK-007 don't exist yet, so all of it ran against the same throwaway mock as TASK-008, extended
with SPEC-001 §3.3's `GET/PUT /admin/settings/ai`, `GET /admin/ai-models`, `GET /admin/stats/line-pushes`
(`tests/harness/mock-api-task-008/mock-api.ts`). It follows the SPEC text, not the real server. **None of the DoD's live lines is proven**
(AC-9's `decision.layer1.model` after a save; the count card vs `curl`). What would settle it: the DoD run again once TASK-006 / TASK-007 are up.

**Built:**
- `/ai` page: per layer a provider select (first option = "let the gateway choose" = `null`, then the keys of the gateway's `/models` body) and a model
  select (only that provider's models; disabled while the provider is `null`); current values from `GET /admin/settings/ai`; save → `PUT`;
  save disabled until something changed. `VALIDATION.fields` marks the named field(s) with `admin.error.validation` (never the server's reason; a key that
  names neither provider nor model marks both). `GATEWAY_UNAVAILABLE` (on load or on save) → the PM's gateway-down warning, all four selects read-only
  with the current values kept, save disabled.
- LINE push panel on the users page: this month's count (`—` until it loads / on error, with the error text and retry) + a month picker.
- Nav: a two-item menu (users · AI settings) and the sign-out button now live in one `AdminBar` shared by both pages; the token guard is one hook
  (`src/components/useOwnerToken.ts`) — `UsersContent` was changed to use both (its behaviour is unchanged; the TASK-008 walk was re-run, ALL PASS).

**Commands run (real output):** `bun run lint` → `$ eslint src` (clean) · `bun run typecheck` → `$ tsc --noEmit` (clean) · `bun run build` → routes
`/ /_not-found /ai /login /users`, `[postbuild] copied .next/static into .next/standalone`, `ls .next/standalone/server.js` exists ·
standalone on :3100 → `/login /users /ai` = 200, a `/_next/static/…css` = 200.

**Walk, 1280 px headless Chrome, `tests/harness/task-009/shoot.mjs` → `ALL PASS`** (against the mock + the standalone build):
- count card shows the API's number for the current month (`{"month":"2026-11","count":7}`) · month picker → October → `{"month":"2026-10","count":31}`;
- change layer 1 to deepseek / deepseek-reasoner → save → `GET /admin/settings/ai` returns it (before `{"provider":null,"model":null}`) · reload shows it ·
  save disabled when unchanged · "gateway chooses" disables the model select;
- server `VALIDATION` (forced by a route stub) → the PM's text at the model field, server text not on the page;
- ai-models answers 502 `GATEWAY_UNAVAILABLE` (forced) → warning shown, 4 selects read-only, save disabled;
- 375 px on `/ai` and `/users`: no page scroll, every control ≥ 44 px (this caught 19 px nav links and 40 px selects — fixed).
Screenshots (`tests/harness/task-009/`): `01-users-line-count.png` · `02-ai-settings.png` · `03-ai-validation.png` · `04-ai-gateway-down.png`.
The gateway-unreachable screenshot is the DoD's "gateway stopped" shot, but forced at the browser, not by stopping a real gateway.

**Wording:** all from the PM's answers (REQ-004 Q-SA-1 and Q-SA-2, REQ-001 Q-SA-1). The layer hints were not given key names — I named them
`admin.ai.layer1.hint` / `admin.ai.layer2.hint`.
**REWORK item 1 done (2026-11-01):** `admin.common.save` = บันทึก and `admin.linePushes.title` = ข้อความ LINE ที่ส่งในเดือน {month} are in `KNOWN`
as written (REQ-004 Q-SA-2 answer). `{month}` is the picked month as Thai month + Buddhist year (`2026-11` → "พฤศจิกายน 2569", the PM's example),
made with dayjs' `th` locale and `buddhistEra` plugin; until the first answer arrives it shows "—". No key shows its name any more on these pages.
lint + typecheck + build clean; `tests/harness/task-009/shoot.mjs` re-run on the mock → `ALL PASS`, including a new check that the title follows the
picked month (ตุลาคม 2569). Item 2 (live lines) still waits on TASK-006 / TASK-007.
**REWORK item 3 done (2026-11-01):** `AdminBar`'s sign-out now calls `message.destroy()` (antd `App.useApp()`) before leaving, so "saved" /
"password changed" toasts no longer show over the sign-in page. Check added to `tests/harness/task-009/shoot.mjs`: save on `/ai`, sign out at once, no
`.ant-message-notice` on `/login` → PASS (the same walk, `ALL PASS`, 13 checks). I did not run that check **without** the fix, so it is not shown to fail
on the old code. Run against the mock on **:8081**: the real back end (Jason's `bun --watch src/index.ts`) holds :8080 right now, so for this run I built a
separate front variant (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1 NEXT_DIST_DIR=.next-mock`, deleted afterwards) and the mock now takes `PORT`; I
did not stop or touch the real back end. The deliverable `.next/standalone` (default API URL :8080) was rebuilt clean before: lint, typecheck, build pass.

**Judgement calls (veto welcome):**
1. Picking a provider selects that provider's **first listed model** (a named provider with no model isn't a state the SPEC describes); picking
   "gateway chooses" sets both to `null`.
2. Model options list the current model even if it is no longer in the gateway's list, so a stale value stays visible instead of vanishing.

**Closed-list deviations — please accept or tell me to undo:** (a) `src/app/globals.css` — two small blocks (44 px floor for antd's large select / date picker;
the nav link fills its menu item): the list says `src/app/**` for "new pages + the menu entry only"; there is no way to size a hit target
without CSS · (b) the shared token hook is under `src/components/` (I first put it in `src/lib/`, outside the list, and moved it) ·
(c) `src/services/api.ts` gained `"PUT"` — it is under `src/services/**`, so inside the list. `git status --porcelain`: only
`.env.example .gitignore bun.lock eslint.config.mjs next.config.ts package.json scripts/ src/ tsconfig.json`.

**`/impeccable audit` (web, product register):** `detect.mjs --json src` → `[]`; grep: no inline hex (only the `--page-bg` token), no font-family, z-index
or `transition: all`. Fixed: nav hit area, select / picker height, the layer heading (antd's `legend` rendered grey and underlined → real `h2`).
**Left, minor:** the error text under a rejected field sits tight against the next layer's heading · no dark mode · select values are the gateway's
raw ids (not translated — they are names, not copy). Passing the audit is not the owner's approval of the look.

**Footprint:** test data in the mock's memory only; servers on :3000 / :3100 / :8080 started and stopped; `playwright-core` was installed in my scratchpad
(outside the workspace and the repo).

**REWORK item 2 — live lines against the REAL back end (TASK-006 / TASK-007), done 2026-11-01** after Sober's "TASK-006/007 DONE":
- **Set-up (all local, nothing real):** Jason's own back end holds :8080 on the dev DB and I did not touch it or the shared settings. I created a
  **throwaway database** `corner_chat_fe9_live` on the team's local cluster (:5433; never :5432), applied the three migrations (`22 tables`), and started
  the real back end (`bun src/index.ts`) on **:8081** against it, with `LLM_GATEWAY_URL` = the **fake gateway** (`tests/harness/fake-gateway`, :3997). The front
  was a separate standalone build pointed at :8081 (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_DIST_DIR=.next-mock`, deleted afterwards; Next added its types to
  `tsconfig.json`, I reverted that). Owner login read from the back end's `.env` at run time, never printed. The gateway is the fake, not a real model
  (TASK-006's own UNVERIFIED: no real-gateway probe exists yet).
- **Fake-gateway script added:** `tests/harness/fake-gateway/scripts/fe-live-task-009.json` — `sample-run`'s answers plus a `/models` list that includes the
  shipped defaults (`deepseek-flash`, `deepseek-v4-pro`). Why: with the fake's default list the real server rejects *any* save, because it validates both layers and
  layer 2's saved default isn't listed (`PUT` → `400 {"fields":{"layer2.model":"not a model the gateway lists under deepseek"}}`). The page showed that as the
  field error it should; it was a harness gap, not a front-end defect. **Product note:** if the real gateway drops a model the owner has saved, he cannot
  save the *other* layer until he re-picks the dropped one — the page shows the stale value plus the listed ones, so it is possible, but the message is only
  `admin.error.validation` at that field.
- **Run:** `tests/harness/task-009/shoot-live.mjs … main` → **ALL PASS**, then the fake gateway **stopped for real** (its process killed, port 3997 closed) and
  `… down` → **ALL PASS**:
  - save layer 1's model in the UI: `{"provider":"deepseek","model":"deepseek-flash"}` → `{"provider":"deepseek","model":"deepseek-chat"}` on the real server; reload shows it;
    a real `PUT` with an unlisted model → `400 VALIDATION` naming `layer1.model`;
  - **AC-9** — a made-up message ingested *after* the save (`tests/harness/task-005-ingest.ts`, user U1, no rules → AI path). The decision U1 reads at `GET /messages/:id`:
    `{"decidedBy":"ai","outcome":"notified","rule":null,"summary":"ทดสอบหน้าตั้งค่า AI (FE)","score":85,"bar":70,"reason":"ถามตรง ๆ เรื่องงาน","layer1":{"provider":"deepseek","model":"deepseek-chat"},"layer2":{"provider":"deepseek","model":"deepseek-v4-pro"},"promptVersion":"v1","decidedAt":"2026-11-01T08:55:01.313Z"}` → `layer1.model` = the new one;
  - **count card** vs the endpoint: `GET /admin/stats/line-pushes` → `{"month":"2026-11","count":2}`, the card reads 2; October: `{"month":"2026-10","count":1}`, the picker's card reads 1.
    **The 3 `line_pushes` rows were hand-inserted** by `psql` into the throwaway DB (2 now, 1 on 2026-10-15) because nothing writes them until Team B's notifier is wired; this proves
    the card follows the endpoint, not that a real push increments it (AC-7's "+1 per push" is Team B's);
  - **gateway stopped for real:** `GET /admin/ai-models` → `502 GATEWAY_UNAVAILABLE`; the page shows the PM's gateway-down warning, 4 selects read-only with the saved values kept, save disabled.
- **Screenshots (1280 × 800, `tests/harness/task-009/`):** `live-01-ai-settings.png` · `live-02-ai-saved.png` · `live-03-users-line-count.png` · `live-04-ai-gateway-stopped.png`.
- `bun run lint` / `typecheck` / `build` clean after cleanup; `ls .next/standalone/server.js` exists; `git status --porcelain` in the front = only the closed-list paths; the back repo
  has no change from me.
- **Seen, minor (P3):** the count card's title says "พฤศจิกายน 2569" (Buddhist year, the PM's `{month}` example) while the month picker beside it shows "2026-11" — two calendars on one line. Say if the picker should show the Buddhist year too.
- **Footprint:** the throwaway DB `corner_chat_fe9_live` is **dropped** (`select datname …` lists only `corner_chat_dev` and the BE's `corner_chat_test*`); U1 users, messages and push rows died with it. My back end (:8081), fake gateway (:3997), front (:3000) are stopped;
  Jason's :8080 and the :5433 cluster are untouched and still running. Helper scripts that hold no secret and read the `.env` themselves live in my scratchpad, not in the workspace.

## Questions
- To SA (non-blocking): add `admin.common.save` to a PM wording question · the "this month" title vs the month picker · accept the three deviations above ·
  the live DoD needs TASK-006 / TASK-007 (see UNVERIFIED).
  > answer (SA Sober, 2026-11-01): `admin.common.save` and the title-vs-month-picker question are now REQ-004 **Q-SA-2**, asked
  > of the PM. Deviations (a)–(c) are accepted: `globals.css` is under `src/app/**`, and hit targets need CSS. Judgement
  > calls 1–2 are accepted, and so are the `.hint` key names.

## Review
**Verdict: code accepted on the mock — not DONE until the live lines run.** SA Sober, 2026-11-01. Re-run by me in
`corner-chat-front`: `bun run lint` → clean · `bun run typecheck` → clean · `git status` → only closed-list paths. I looked at
`tests/harness/task-009/02-ai-settings.png`: the PM's Thai renders, "gateway chooses" disables the model select, and the save
button still shows `admin.common.save` (asked of the PM). The shared `AdminBar` / `useOwnerToken` refactor of TASK-008's
page is accepted, because you re-ran the TASK-008 walk (ALL PASS).
What is left, then `REVIEW` again:
1. Put in the Thai for `admin.common.save` (and any title change) when the PM answers REQ-004 Q-SA-2.
2. Run the DoD's live lines once TASK-006 (settings API) and TASK-007 (count API) are DONE. I'll tell you. AC-9: save a model,
   ingest a made-up message, and check that `decision.layer1.model` is the new one. Count card = `curl /admin/stats/line-pushes`.
   Gateway stopped for real (closed port), not forced in the browser.
Status → `BLOCKED (waiting: TASK-006, TASK-007; PM wording)`. TASK-008's live rerun (now unblocked) comes first.
3. (added 2026-11-01, from TASK-008's round 2) clear antd's message toasts on sign-out, so "password changed" no longer
   shows over the sign-in page. A file in your list (the shared `AdminBar` / sign-out path).
**Update 2026-11-01:** the PM answered Q-SA-2 (save = บันทึก, title with `{month}`), so item 1 can be done now. Only item 2
still waits on TASK-006/007.
**SA check 2026-11-01:** items 1 and 3 are met. `strings.ts:62-63` → `ข้อความ LINE ที่ส่งในเดือน {month}` and `บันทึก`;
`AdminBar.tsx:30` → `message.destroy()` on sign-out; `bun run lint` and `bun run typecheck` are clean when I re-ran them.
I'll tell you when TASK-006 and TASK-007 are DONE, for item 2.

**Final verdict: DONE** — SA Sober, 2026-11-01. Item 2 is met against the real back end (TASK-006/007). You used your own
port (:8081) and a throwaway DB on :5433 (dropped afterwards), and left Jason's :8080 untouched — exactly right. AC-9: the
decision read through `GET /messages/:id` after the save shows `layer1.model = deepseek-chat`, the new value. The count card
matches the endpoint for both months. Gateway down: the fake was stopped for real (port closed), and I looked at
`live-04-ai-gateway-stopped.png` (warning shown, four selects read-only with the saved values, บันทึก disabled).
Accepted, with what each one proves:
- The hand-inserted `line_pushes` rows prove that the card follows the endpoint. "+1 per real push" is Team B's AC-7.
- The fake gateway, not a real model: the real-gateway probe is TASK-006's (done there).
**Your product note is right**, and it happened today (`deepseek-v4-flash` was dropped). If the gateway drops a saved model,
the owner must re-pick that layer before he can save the other one. The page makes that possible, and I've recorded it in
SPEC-001 §3.3 as known behaviour.
**P3, Buddhist year on the title vs the Gregorian picker:** left as is for round 1 and passed to the PM as wording.
