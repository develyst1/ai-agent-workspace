# SPEC-038: LINE on UAT — role change must switch the rich menu (post-move diagnosis + operator runbook)
- Source: REQ-042
- Status: ACTIVE

## Overview
The reported symptom — "linked as teacher, typed `สมัคร`, chose ผู้ปกครอง, the link didn't visibly
complete and the menu stayed the teacher menu" — is **almost certainly an environment/OA-config
problem introduced by the `sid → UAT` move, not a code regression.** Grounded in the current `dong`
code:

- The **role-change fix (TASK-046) is present** in `smart-scheduler-back/src/services/line-webhook.service.ts`:
  `สมัคร` resets to `CHOOSE_ROLE` from **any** state (`:398`), an in-progress linking conversation
  wins over already-linked routing (`decideMessageRoute`, `:406-408`), and a role change **moves** the
  roster link instead of accumulating both (`moveRosterLink`, `:171/:178` → AC-2).
- The menu switch fires **after** a successful link: `linkRoleRichMenu(lineUserId, role, seed)` at
  `:461`, and again on language toggle at `:500`.
- 🔑 **The tell:** that call is wrapped in a `try/catch` that only `console.error`s and swallows the
  failure (`:462-464`). So if `linkRoleRichMenu` throws, **the role link still completes but the rich
  menu silently never changes** — which is precisely what the owner saw.

`linkRoleRichMenu` (`src/lib/line-rich-menu.ts:201-210`) reads the four menu ids from the DB
(`app_settings.line_rich_menu_ids`, written only by `bun run line:publish-menus`) and calls
`POST /v2/bot/user/{userId}/richmenu/{id}`. It fails / no-ops when:

- **(Cause A — different OA):** UAT's `LINE_CHANNEL_ACCESS_TOKEN` points at a **different OA channel**
  than the one the menus were published against. The stored ids belong to the old channel → they
  **404 on UAT's OA** → `linkRichMenuToUser` throws → swallowed → menu unchanged.
- **(Cause B — fresh/other DB):** UAT points at a DB where `line_rich_menu_ids` is **empty** →
  `getMenuIds()` returns `{}` → `linkRoleRichMenu` finds no target and **silently does nothing**.
- **(Cause C — webhook not on UAT):** the OA **webhook still targets `sid`/the old server**, so the
  UAT server never receives the `สมัคร` events at all (this is the same class of root cause as the
  2026-07-30 outage). Then any switch that happens, happens on `sid`, not UAT.
- **(Cause D — old build):** the running UAT build **predates TASK-046** → the branch-order bug
  returns and an already-linked teacher can never finish `สมัคร`. Ruled in/out by Q3.

**This spec does not assume which cause it is — it hands the owner a read-only diagnostic that tells
him, then the minimal fix for whichever it is.** The most likely single answer to the owner's literal
question is Cause A/B → **yes, re-run `line:publish-menus` on UAT** — but `line:inspect-menus` proves
it in one read before he changes anything.

## Direct answer to the owner's question (REQ-042 Q4)
> "After the sid → UAT move, does someone have to run `bun run line:publish-menus`? Is it related?"

**Rich-menu ids are per-OA and are stored in the database, not in `.env`.** `line:publish-menus`
creates the four menus **on whatever OA `LINE_CHANNEL_ACCESS_TOKEN` currently points to** and saves
their ids to `app_settings.line_rich_menu_ids`.

- **Re-run `line:publish-menus` on UAT if — and only if — UAT uses a different OA token OR a
  different/fresh DB than where the menus were last published.** In that case the old ids are useless
  on UAT and every menu switch fails silently. This is the most likely cause of exactly this symptom.
- **If UAT is the same OA channel *and* the same DB** as before the move, publishing is **not** the
  problem — then it is the **webhook target** (Cause C) or an **old build** (Cause D).
- `line:inspect-menus` (read-only — creates/links/deletes nothing) tells you which world you are in
  **before** running any write. Always inspect first.

## Data Model
None. No tables, no migrations. (`app_settings.line_rich_menu_ids` already exists; `publish-menus`
upserts that one row.)

## Interface / commands used (all already exist)
- `bun run line:inspect-menus [lineUserId]` — READ-ONLY diagnostic (`scripts/line-inspect-menus.ts`,
  TASK-045). Prints stored ids, whether each still exists on the OA, the channel default, the full
  channel menu list, and — if a userId is given — which menu that user has linked.
- `bun run line:publish-menus` — (re)publishes the 4 menus against the current OA token and stores
  the ids (`scripts/line-publish-menus.ts`, TASK-040). **Write** to the OA (creates menus + sets the
  default). Preflight-fails before any API call if the token or the 4 images are missing. Images are
  present in the repo (`assets/line/{parent,teacher}-{th,en}.png`), so preflight will pass.

## STEP 1 findings (owner ran it 2026-08-16) + ruling
The owner ran `line:inspect-menus` and it returned:
- **Stored ids in the DB:** `(none stored)`.
- **Channel default:** an id **not** one of ours.
- **On the OA: EIGHT menus**, named exactly like ours with correct areas (parent 6 / teacher 2),
  all flagged `created outside our publish` — i.e. our four menus were published against this OA
  **at least twice before**, but their ids were never (or no longer) stored in the DB this shell read.

**Ruling — the cause is confirmed in shape:** the runtime reads `app_settings.line_rich_menu_ids`,
finds **nothing**, so `linkRoleRichMenu` has no target and **silently no-ops** while the link itself
completes → the menu never switches. This is corroborated by the 2026-08-11 log: on the shared DB,
`app_settings` was **"already empty"** before the REQ-040 clear — so the ids have been absent for a
while and role-based menu switching has been silently dead on any environment whose DB lacks them
(**likely customer-prod too**, not only UAT).

**Both open points are now RESOLVED (owner answers, REQ-042 Q1–Q3/Q5, 2026-08-16):**
- **(i) Which DB/OA?** — The owner re-ran STEP 1 **on the server, pointed at UAT's DB** (he added his
  IP to reach it). So `(none stored)` is a **real fact about UAT's DB** → **Cause B confirmed.** The
  OA inspected **is UAT's OA**. Webhook points at `frontoffice.develyst.online` = the UAT server →
  **Cause C ruled out.** One build (the 2026-08-11 deploy) → contains TASK-046 → **Cause D ruled out.**
- **(ii) Blast radius — 🔴 corrected environment identity:** `frontoffice.develyst.online` is **one
  box** that the artifacts previously called "customer-prod" **and** the owner calls "UAT." There is
  **one OA — the customer-facing one.** So there is no "isolated UAT OA": any OA write here touches
  the customer-facing channel. A blind `publish-menus` would create a 3rd duplicate set **and reset
  the customer default menu** → **never run it casually. ADOPT is the fix.**

**Fix = adopt the existing ids (STEP 3a), full stop.** Adopting stores the four ids already on the OA
into `app_settings` — **zero OA write, no default reset, no new duplicates** — and fixes the exact bug
(the switch needs the ids in the DB, nothing else). Because it is zero-write it is safe on the
customer-facing OA **regardless of whether real users are on it today** (that open question, Porter →
owner, only ever mattered for an OA *write*, which adopt is not). **This fix repairs the
customer-facing environment directly** — the menu-switch (and the language-toggle re-link at `:500`)
have been silently dead there since publish, because the DB never held the ids.

## Flow — the owner-run runbook (copy-paste; team never touches UAT)
> Run every step **on the UAT server / with UAT's `.env`** (its own `DATABASE_URL` +
> `LINE_CHANNEL_ACCESS_TOKEN`), from the `smart-scheduler-back` repo — **not from a laptop whose
> `.env` may point elsewhere** (this is what made the first STEP 1 inconclusive). Steps 1–2 are
> read-only. **Do not** paste tokens, webhook URLs, or userIds into any tracked file, log, or chat.

**STEP 1 — inspect UAT's menu state (read-only, changes nothing).**
```
cd smart-scheduler-back
bun run line:inspect-menus
```
Read the output:
- `(none stored — has line:publish-menus been run against this DB?)` → **Cause B.** Go to STEP 3.
- Stored ids listed but one/more say `→ NOT FOUND on LINE (deleted or wrong id)`, or the default
  line says `⚠️ NOT one of our stored ids` → the stored ids don't belong to UAT's OA → **Cause A.**
  Go to STEP 3.
- All four ids present **and** `FOUND` with correct `areas`, default `= our parentTH` → menus are
  healthy on UAT's OA → **not a publish problem.** Go to STEP 2.

**STEP 1b (optional, pinpoints a stale per-user link — hypothesis B in the script).**
Get your own LINE userId (read-only) and pass it:
```
psql "$DATABASE_URL" -c "select line_user_id from teachers where line_user_id is not null; select line_user_id from parents where line_user_id is not null;"
bun run line:inspect-menus <yourLineUserId>
```
If it prints `linked = <id>  ⚠️ NOT one of our stored ids (stale link?)`, that stale link is left over
from the old environment — STEP 3's republish + your next `สมัคร` will re-link you to a valid menu.

**STEP 2 — 🔵 RULED OUT for this environment (2026-08-16).** The inspect showed the ids are *missing*
(not "healthy"), and the owner's answers ruled out both Cause C (webhook → `frontoffice.develyst.online`
= the server) and Cause D (single build, has TASK-046). This step stays only as reference for a future
env move where STEP 1 comes back *healthy*.
- **Webhook (Cause C):** in the LINE Developers console, confirm the OA's **webhook URL points at the
  UAT server** (not `sid`), webhook is **enabled**, and a **Verify** succeeds. If it still points at
  `sid`, re-point it to UAT — that alone restores delivery (same class of fix as 2026-07-30).
- **Build (Cause D):** confirm the UAT build is the current `dong` build (contains TASK-046). Quick
  check on the server: `git -C smart-scheduler-back log --oneline -1` should be at/after the deploy
  that shipped TASK-046. If UAT runs an older copy, **redeploy the current `dong` build** — no code
  change is needed, the fix is already in the branch.

**STEP 3 — get valid ids into the DB. Prefer ADOPT (no OA write) over republish.**

**STEP 3a — ADOPT the existing ids (recommended; blast-radius zero).** The OA already holds our four
menus; this stores their ids into `app_settings.line_rich_menu_ids` so the runtime stops no-op'ing.
No menu is created, no default is changed, no duplicate is added. Needs the small helper from
**TASK-130** (`bun run line:adopt-menus`), run on the UAT server:
```
cd smart-scheduler-back        # UAT env: UAT DATABASE_URL + UAT LINE token
bun run line:adopt-menus       # reads the OA, upserts the 4 ids into app_settings; prints them
```
This is the right fix whether the OA is isolated or the customer's, so it does **not** wait on
question (ii).

**STEP 3b — republish: 🚫 NOT for this environment.** The one OA here is the **customer-facing**
channel, so `line:publish-menus` (creates new menus **and resets the channel default**) must **not**
be run as the fix — it would change what real followers see. It stays documented only as the
theoretical path for a genuinely separate, non-customer OA, which does not exist today. Use STEP 3a.
```
# bun run line:publish-menus   ← do NOT run against the customer-facing OA
```
> The 8 existing menus are **harmless orphans** — LINE allows many per OA; an unlinked, non-default
> menu does nothing. No delete helper exists today; cleanup is optional and non-blocking.

**STEP 4 — re-verify (maps to the ACs).**
1. Re-run `bun run line:inspect-menus <yourLineUserId>` → the 4 stored ids are now listed and each is
   `FOUND` on the OA. **Expected pass even so:** the channel-default line may still read `⚠️ NOT one of
   our stored ids` — adopt deliberately does **not** change the default (that would be a customer-visible
   OA write), and the existing default already has correct areas. REQ-042 is about the **per-user** switch,
   not the default, so a non-owned default here is bookkeeping, not a failure.
2. In LINE, from your teacher account type `สมัคร` → choose **ผู้ปกครอง** → enter the parent phone →
   the bot confirms **and the menu becomes the 6-cell parent menu** (**AC-1**), with the teacher link
   gone (**AC-2**). Reverse direction (parent → `สมัคร` → ครู) → 2-cell teacher menu (**AC-3**; note a
   teacher claim now **queues for staff approval** per TASK-075, so it links on approval, not instantly).
3. Enter a wrong phone mid-`สมัคร` → clear "not found" reply, menu unchanged, retry works (**AC-4**).
4. Tap each rich-menu button → the bot replies, no dead taps (**AC-5**).
5. Spot-check regressions (**AC-6**): teacher "ตารางของฉัน", TH/EN toggle (both ways, persists),
   typed-keyword fallbacks, check-in link.

## Non-functional
- **UAT is owner-operated only.** Every step above is run by the owner; the team supplies the exact
  commands and reads the returned output. No team member runs anything against UAT.
- **Secrets discipline:** OA token, webhook URL, `DATABASE_URL`, and LINE userIds never enter a
  tracked file, log entry, or pasted output.
- AC-4 wording: `verifyAndLink` already returns role-specific failure messages (`src/lib/line-i18n.ts`).
  Only if STEP 4.3 shows a missing/unclear message do we add the owner-approved TH/EN string from
  REQ-042 — decided after the runbook runs, not pre-emptively.

## Tasks
- **TASK-130 (BE, Jason) — `line:adopt-menus` helper.** A small re-runnable script + pure function:
  read the OA's menus (`listRichMenus()`), pick the one id per canonical name
  (`smart-scheduler-parent-th/-en`, `-teacher-th/-en`), and **upsert** them into
  `app_settings.line_rich_menu_ids` (same upsert `publishRichMenus` already uses). **Must NOT create,
  link, delete, or set-default any menu** (zero OA write beyond the read) — it only stores ids.
  Deterministic pick when a name appears more than once (the current OA has 2 of each); print the
  chosen ids. Unit-test the pure name→id selection. This is the STEP 3a fix and unblocks the menu
  switch on any environment whose DB is missing the ids (UAT and likely prod).
- **No behavioural code change to the webhook** — the current `dong` code satisfies AC-1..AC-4/AC-6;
  the bug is purely the missing ids in the DB. Additional TASKs only if:
  - STEP 2 shows **Cause D (old build)** → action is a **redeploy of the current `dong` build**
    (owner/deploy via Porter), still no new code.
  - STEP 4 shows a genuine behavioural miss on the current build → then cut a BE TASK against the
    concrete repro.
- **Follow-up (not this REQ, noted for Porter):** the swallowed-error at `line-webhook.service.ts:462`
  is why this failed *silently* — worth a later REQ to surface it (a queued admin warning / a startup
  check that `line_rich_menu_ids` is populated), so a missing-ids environment can't look half-broken
  with nothing logged where anyone sees it.

## Questions
(Jason asks here; Sober answers as `> answer: ...`. Owner Q1–Q3 are being answered in REQ-042 chat;
their answers pre-select the branch in STEP 1–2 but do not block the runbook — the read-only inspect
determines the cause on its own.)
