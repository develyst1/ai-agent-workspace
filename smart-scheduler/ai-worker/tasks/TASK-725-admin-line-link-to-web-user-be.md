# TASK-725 — the admin LINE link is tied to the WEB USER (one-time code from the web; the shared code retired) — BE, M (≈ 2–3 d)
- Source: owner GO "ตามนั้น" (final round) on `SIZING-admin-line-link-to-web-user-2026-10-07.md` (Sober; shape 1) · his question: *"เขาสร้าง user ผ่านเว็บไม่ใช่เหรอ ใส่ role ต่างๆอ่ะ ทำไมเราต้องส่งรหัสให้"* · Porter 2026-10-11
- Status: ✅ DONE (Silver, 2026-10-11) · in `64e27b3` + 6 test files (the 7 held lines) to commit · full back 4399/0
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-11) · pairs with **TASK-726** (FE).
- 🔒 **The shared admin code's env key is never written in this TASK, its notes, a log or a test name** (Porter). Refer to it as "the shared admin code" and read it only through `line-admin-code.ts`.
- **Claim:**
  - ✅ **Granted (Porter):** `line-webhook.service.ts` **`verifyAndLink` only** (the leave paths are Team A's) · `src/lib/line-admin.ts` · the `users` schema + ONE migration (next free number when you build; today `0067`) · tests.
  - ✅ **Also GRANTED (Porter, 2026-10-11):**
    - `src/lib/line-admin-code.ts` (to retire the shared code);
    - `src/routes/me.ts` + its service (issue MY code, read MY link state);
    - `src/routes/users.ts` + `users.service` (the super admin's column + Unlink);
    - `src/services/line-admin-links.service.ts` (the old panel shows names + old links).
  - Reds outside ⇒ the standing practice.
- 🔴 **Safe test run ONLY** (SYSTEM-FACTS 2026-10-08; the `.env` can point at the customer's system). The full command is in TASK-723. 🚫 Never print `.env` values.

## §0 Today (verified in code 2026-10-11)
- An admin LINE = any account that typed `สมัคร` → `แอดมิน` → **the shared code**: `verifyAndLink` (`line-webhook.service.ts:422-436`) ⇒ `checkAdminCode` ⇒ `addAdminLineUserId` ⇒ a bare id in `app_settings.line_admin_user_ids` (`lib/line-admin.ts`).
  - **No web user, no name, no role.** Disabling a web user stops nothing.
- Every reader goes through ONE function, `getAdminLineUserIds`:
  - `detectLinkedRole` (`:391-395`);
  - `line-menu-users.ts:22`;
  - `line-admin-links.service.ts:52,66`;
  - the notice loop in `line-admin.ts`.

## What to build
1. **Migration:** `users.line_user_id` (text, **unique when not null**, nullable), plus the one-time code: `line_link_code_hash` + `line_link_code_expires_at` on `users`. One live code per user; a new one replaces it. **Decide and declare** columns vs a small table. No data rewritten.
2. **Issue (web, logged in), `POST /me/line-link-code`:**
   - returns a short typeable code (decide length/alphabet; declare), **valid ~10 min, single use, stored HASHED**, tied to THIS user;
   - **refused for a coach account** (`users.teacher_id` set: Sober, an admin has `teacher_id = NULL` by construction);
   - **refused for a disabled user.**
   - `GET /me` (or `/me/line-link`) carries `lineLinked: boolean`.
3. **Link (chat), `verifyAndLink` admin branch:** the typed text is checked against **unexpired, unused** code hashes.
   - Match ⇒ write `users.line_user_id` for THAT user, burn the code, give the admin menu (`settleAdminLink`, as today).
   - **Keep the per-LINE-account miss limiter** (`adminCodeLimit`, reused) and **the SAME reply for every refusal** (`verify_admin_bad`).
   - A LINE id already on another user ⇒ refused (same reply) and logged.
4. 🔴 **RETIRE the shared code EXPLICITLY (acceptance item, Sober/Porter):** after this ships, **the shared admin code links NOBODY**, even if it is still set in the environment. `verifyAndLink` no longer consults it. Pin it by value: the old code typed ⇒ refused, nothing written.
   - **Cut-over = this deploy** (the owner tells his staff to re-link through the web). If the owner wants a different date, Porter says so before GO.
5. **Recipients:** `getAdminLineUserIds` returns **linked users whose `disabled_at` IS NULL** ∪ **the legacy list** (old links, kept READ-ONLY: no new id is ever added to it).
   - ⇒ Disable = notices off, enable = on.
   - Legacy accounts keep receiving until each person re-links or the super admin removes them (Sober's sizing, accepted).
   - Every current reader keeps working unchanged.
6. **Super admin (`users.ts`):** the user DTO carries `lineLinked: boolean` (🚫 never the raw LINE id) + `DELETE /users/:id/line-link` (Unlink, super admin only; it sets `line_user_id` NULL and the admin menu is settled as for a removal today).
7. **Old panel (`line-admin-links.service.ts`):** a linked account is shown by the web user's **display name**. A legacy one is marked as an old link (the FE shows the approved words). Remove keeps working for legacy ids.
- 🚫 **Not in this size:** a "receives admin notices" grant key, per-kind notice preferences (Sober: a further step).

8. 🔴 **No fallback, ever (Porter's added acceptance item).** **Checked 2026-10-11 from the source: there is NO fallback today.**
   - `adminCodeConfig` returns `unset` for an empty env, *"Never a default"* (`line-admin-code.ts:39-45`, TASK-534);
   - the only reader is `line-webhook.service.ts:431`;
   - the committed `.env.example` line is empty.
   - The 2026-08-20 sighting predates TASK-534.
   - ⇒ **Keep it that way:** after this TASK the shared path is gone, and a test pins **"no env set ⇒ the shared code path links nobody, and no value written in the repo works as a code."** Extend `sec1-admin-code-task534.test.ts` if it already pins half of this; declare which.

## Definition of Done
- [ ] **By-value tests:**
  - issue ⇒ the code works once, within 10 min; reuse refused; expired refused; another user's code links THAT user, not this one;
  - a coach account / a disabled user ⇒ issue refused;
  - **the shared code ⇒ refused, nothing written** (the retirement), **with the env set AND with it unset** (item 8);
  - the miss limit still bites; every refusal is the same reply;
  - recipients: a linked active user ✓, a linked DISABLED user ✗, a legacy id ✓, an unlinked user ✗;
  - Unlink ⇒ no longer a recipient;
  - the DTO never carries the LINE id;
  - `detectLinkedRole` still says "admin" for a linked user.
- [ ] Mutation set `{tests, mutations}`:
  - the shared code accepted again (bites);
  - a disabled user still notified (bites);
  - a code reusable (bites);
  - expiry ignored (bites);
  - the raw LINE id in the DTO (bites).
- [ ] tsc · full suite (safe command) with counts · `unhandled-between-tests: 0` · the migration's own check. Nothing committed.

## QA hand-off (sid; the LINE-on-a-phone check is the owner's)
- **Step 0 (old build):** the panel shows bare ids with no name; the Users page has no LINE.
- **New build:**
  - a web admin gets a code → types it in the OA chat ⇒ linked, admin menu, the Users page says Linked;
  - **the shared code now refuses**;
  - disable that user ⇒ they get no admin notice;
  - Unlink ⇒ none either.

## Implementation Notes
**Bob, 2026-10-11 — 📐 THE CONTRACT, declared BEFORE building (for Fanta's TASK-726). Additive only; nothing existing is renamed. I'll note any change here with a `🔻`.**

| # | endpoint | who | request | response |
|---|---|---|---|---|
| 1 | `POST /api/me/line-link-code` | any signed-in web user | no body | `200 { "code": "K7M2QX9P", "expiresAt": "<ISO>", "expiresInSeconds": 600 }` |
| 2 | `GET /api/me` | signed-in | — | the existing `{ user: {…} }` **plus `user.lineLinked: boolean`** |
| 3 | `GET /api/users` | super admin | — | each user gains **`lineLinked: boolean`** (never the LINE id) |
| 4 | `DELETE /api/users/:id/line-link` | super admin (the `/users` router's own guard) | — | `200 { "user": <UserDTO, lineLinked:false>, "afterRemoval": "teacher-menu"\|"parent-menu"\|"visitor-menu", "menuSettled": boolean }` |
| 5 | `GET /api/users/line-admins` | super admin | — | the existing `{ admins, notKnown }`; **each entry gains** `kind: "linked"\|"legacy"`, `userId: string\|null`, `displayName: string\|null`, `username: string\|null`, `disabled: boolean` (existing `ref`, `idTail`, `alsoTeacher`, `alsoParent`, `afterRemoval` unchanged) |
| 6 | `DELETE /api/users/line-admins/:ref` | super admin | — | the existing `{ removed, afterRemoval, menuSettled }`; **now works for a `linked` entry too** (it unlinks that user), as well as `legacy` |

**The code (what the screen needs to know):**
- **8 characters**, uppercase letters and digits **without `0 O 1 I L`**. The screen may show it grouped (`K7M2-QX9P`); **typing in chat is case-, space- and hyphen-insensitive.**
- **Valid 600 s, single use.** A new code **replaces** the previous one (one live code per user). It is returned **only** by #1: it is stored hashed and can never be read back.
- **One LINE account per web user.** Linking again with a fresh code **replaces** the earlier LINE account (that account's admin rights end, and its menu is settled like a removal). A LINE account can belong to **only one** user.
- **`lineLinked`** = "this user has a LINE account linked", regardless of `disabled`.

**Errors** (the standard envelope `{ error: { code, message } }`):
- #1, a **coach account** (`users.teacher_id` set) ⇒ `403 LINE_LINK_NOT_FOR_COACH`; a **disabled** user ⇒ `403 USER_DISABLED` (in practice the sign-in guard already answers `401` first).
- #4 / #6, unknown user or `ref` ⇒ `404 NOT_FOUND`.
- 📋 **Their two Thai sentences are engineer wording, DRAFT, listed for the next copy set.** They are backstops: **the screen should not show the "get a code" button for a coach** (it already knows `user.teacherId` from `/me`).
- **Chat side, no change in words:** the admin prompt/refusal stay `code_admin` / `verify_admin_bad`; **every** refusal (wrong, expired, reused, the old shared code, a LINE account already on another user, the miss limit) is the same reply.


**🔻 CONTRACT CHANGE #1 (Bob, 2026-10-11, while building) — endpoint #2 moved.** `lineLinked` is **NOT** a field of `GET /api/me` any more. It is **`GET /api/me/line-link` → `200 { "lineLinked": boolean }`** (signed-in user, no body). **`GET /api/me` is byte-for-byte what it was.**
- **Why:** `/me` is read on **every page load** by the shell; my first draft added a database read to it. This answer is needed only where the link dialog opens, so it gets its own route and the hot path stays untouched (the TASK allowed either: *"`GET /me` (or `/me/line-link`)"*). As a bonus 7 unrelated `/me` tests stay green.
- **For Fanta:** the dialog calls `GET /api/me/line-link` when it opens (and again after the admin says they typed the code, to show "Linked"). Everything else in the table above stands. `GET /api/users` still carries `lineLinked` per user.
**Not in the API (by design):** the raw LINE id never leaves the server (only `idTail`, as today); the shared code is gone and nothing replaces its fallback.

---
**Bob, 2026-10-11 — BUILT. Final notes (the contract above stands, with 🔻 change #1).**

**What changed (`smart-scheduler-back`, nothing committed):**

| file | change |
|---|---|
| `drizzle/0067_users_line_link.sql` + `meta/_journal.json` | 3 nullable columns on `users`, 2 PARTIAL unique indexes (`users_line_user_id_uq`, `users_line_link_code_hash_uq` = **LAST = the witness**); every statement `IF NOT EXISTS`; no data written, no backfill |
| `src/db/schema.ts` | the same columns/indexes on `users` |
| `src/lib/migration-witness.ts` | **the ONE `0067` entry** (+9 lines, nothing else; Porter's grant) — probe = the code-hash index, rerunnable |
| `src/lib/line-link-code.ts` (new, pure) | generate (8 symbols, no `0 O 1 I L`, CSPRNG `randomInt`) · normalise (case/space/hyphen) · SHA-256 hash · 10-minute expiry |
| `src/services/admin-line-link.service.ts` (new) | `issueLineLinkCode` · `linkLineByCode` · `isLineLinked`; the two screen-unreachable backstop sentences, labelled **📋 ENGINEER WORDING — LISTED, NOT APPROVED** with how no screen reaches them |
| `src/lib/line-admin-code.ts` | **the shared code RETIRED**: now only the per-LINE-account miss limiter + `adminLinkBlocked` / `recordAdminLinkAttempt`. No env name, no config reader, no comparison, no "retired values" list |
| `src/lib/line-admin.ts` | `getAdminLineUserIds` = active linked users ∪ the legacy list, de-duplicated, legacy first; `getLegacyAdminLineUserIds` / `getLinkedAdminLineUserIds`; **`addAdminLineUserId` DELETED** (nothing can add to the legacy list: structural) |
| `src/services/line-webhook.service.ts` | `verifyAndLink` admin branch only: `linkLineByCode(...)`, same `verify_admin_bad` reply, same menu settle. Nothing else in the file |
| `src/services/line-admin-links.service.ts` | the panel: `linked` + `legacy` entries; `settleMenuAfterRemoval` (one place); `unlinkLineOfUser`; `removeLineAdmin` works for both kinds |
| `src/services/user.service.ts`, `src/routes/users.ts`, `src/routes/me.ts` | `lineLinked` on the DTO; `DELETE /users/:id/line-link`; `POST /me/line-link-code`; `GET /me/line-link` |

`scheduler.service.ts`, `undo.service.ts`, `api.ts`, `route-access.ts` are **not touched.**

**Decide and declare (internal):**
- **Columns on `users`, not a table:** one live code per user by construction. A fresh code is drawn again on a hash collision (`23505`); five in a row ⇒ a loud 500.
- **Burn + link is ONE statement** (`UPDATE … WHERE id AND hash AND expires > now AND disabled_at IS NULL RETURNING id`): two chats typing the same code at the same instant cannot both win.
- **A re-link REPLACES the user's earlier LINE account**: that account stops being an admin (its legacy copy goes too) and its menu is settled like a removal. `previous` is read **before** the write (found while testing: a fake returning the same object the write then mutates exposed that the first draft read it after).
- **Unlink also removes the legacy copy of the same id** ("this LINE account is no longer an admin" must be true, not half true), and clears any pending code. Idempotent: nothing linked ⇒ `afterRemoval: "none"`.
- **`removeAdminLineUserId` reads the LEGACY list only.** The obvious edit (keep `getAdminLineUserIds`) would have copied every linked user's id into the legacy list on the first removal. Pinned by value and by mutation N15.
- **`GET /me` is untouched** (🔻 change #1): `lineLinked` lives at `GET /me/line-link`.
- **The chat words are unchanged**: `code_admin` and `verify_admin_bad` stay true for the web code. Every refusal (wrong · expired · used · disabled · a coach · this LINE is another user's · over the limit) is the **same reply**; the reason goes to the log only, never the typed text, the code or its hash.

**Item 8, no fallback, ever** (extended `sec1-admin-code-task534.test.ts`, rewritten for the one-time code; 20 tests): the module exports only the limiter and its two helpers · **derived from the source: no product file reads the shared code's env key** · by value with the env SET and typing that value, and with it UNSET and typing `229` / a code-shaped guess / the old value: **refused, nothing written, nothing settled** · the admin branch contains no `process.env` · `.env.example`'s line is still empty · the boot with it unset is untouched. I kept the SEC-1 rules that still hold: no example in any secret prompt, the same reply for every refusal, no logging of the typed text, the miss limit the un-mute cannot reset.

**Tests (all by value, no database):**
- `admin-line-link-task725.test.ts` — **30**: the code (alphabet, shape, hashing) · ISSUE (hashed; replaced; coach / disabled / unknown refused; collision retry; plain code stored nowhere) · LINK (once; expiry at the exact instant; THAT user; forgiving typing; every refusal; the limiter; the re-link) · UNLINK · the panel (linked by the web user's name, `disabled`, legacy marked, an id in both shown once, never the LINE id) · the DTO never carries the LINE id · the routes through the ROOT app (super-admin only; `GET /me` keys unchanged) · the migration (SQL text, journal, witness, schema).
- `sec1-admin-code-task534.test.ts` — **20** · `line-admin.test.ts` — **11** (recipients: active linked ✓ · disabled ✗ · legacy ✓ · unlinked ✗ · de-dup · the remover) · `line-admin-removal-task538.test.ts` — **11** · `rich-menu-admin-task530.test.ts` — 21 (its order pin was **vacuous after the change** — `indexOf("await addAdminLineUserId…") < …` is true for an absent string — now both indexes must exist).

**Mutation set `admin-line-link-task725`** (`tests` = the five files above), run on a clean baseline of 93:
```
N1 shared code accepted again (an env fallback)   BITES (89/4)    N10 miss limiter bypassed            BITES (90/3)
N2 a DISABLED user still notified                 BITES (90/3)    N11 a miss never recorded            BITES (90/3)
N3 a code reusable                                BITES (90/3)    N12 re-link leaves the old LINE admin BITES (92/1)
N4 expiry ignored                                 BITES (86/7)    N13 recipients not de-duplicated     BITES (91/2)
N5 the raw LINE id in the DTO                     BITES (91/2)    N14 legacy ids stop receiving        BITES (86/7)
N6 the code stored PLAIN                          BITES (82/11)   N15 the remover reads the UNION      BITES (90/3)
N7 a coach can get a code                         BITES (92/1)    N16 Unlink leaves a pending code     BITES (92/1)
N8 a disabled user can get a code                 BITES (92/1)    N17 Unlink keeps the legacy copy     BITES (91/2)
N9 a LINE account on another user links again     BITES (91/2)    N18 /me gets the extra read back     BITES (92/1)
CHECKSUM identical
```
**18 BITES · 0 SURVIVED · 0 NO RESULT.** The DoD's five are N1–N5.

**The reds outside the claim (`REPORT-task725-reds-outside-claim-2026-10-11.md`) — what the grant did:**
- §2 count pins: **54 of the 63 lines in 34 files bumped** (`67`→`68`, each comment extended with `· 🔻 TASK-725: +0067`), by a script that refuses any file with changes that are not mine. §3: **16 files / 18 fake sites** now answer the `users` read with nobody linked (one line each). §4: **2 of the 3** one-liners (`rbac-stage1` DTO key, `auth.test` login DTO).
- **HELD, as instructed — not touched, and the suite is red on exactly these:**

| file | lines | what |
|---|---|---|
| `src/lib/duo-course-req095-13.test.ts` | 56, 57 | count pins |
| `src/lib/group-series-req104.test.ts` | 82, 83 | count pins (⚠️ the same test also carries Team A's `cancelSeatsOfGroup` signature pin) |
| `src/lib/group-session-req095-2a.test.ts` | 46, 49 | count pins |
| `src/lib/teacher-own-calendar-req097.test.ts` | 51, 52, 425 | count pins (⚠️ a second test there carries Team A's `cancelSeatsOfGroup` pin) |
| `src/services/makeup-born-confirmed-task702.test.ts` | 327 | `J.entries.at(-1)` is no longer `0066`: look it up by `idx` instead |
| `src/services/booking-undo-req108.test.ts` | 601 | the fake exec needs `users: { findMany: async () => [] }` (parked: make-up marker + `undo.service`) |

### Run (no database; the SAFE command; `.env` never read or printed)
- **Full suite: 4392 pass / 7 fail across 331 files, `unhandled-between-tests: 0`.** The 7 are **only** the held files above (7 tests; the booking-undo and makeup-702 ones are 1 each, teacher-own-calendar 2, the rest 1).
- `tsc --noEmit` → **exit 0.**
- **`db:verify` / `db:preflight` NOT run**: they read the live ledger table (a database), and engineers never run against `sid`. The offline halves are green: **68 SQL files = 68 journal entries = 68 witnesses, the last `0067_users_line_link` in all three** (the parity pins in `migration-ledger` / `witness-observability` pass). `db:verify` will report `0067` pending on any database at `0066` until `db:migrate` runs, as for any migration.
- `git status` (mine): the 10 modified source files + `schema.ts`/journal/witness, the new `line-link-code.ts`, `admin-line-link.service.ts`, `0067_…sql`, the two new test files and the mutation set, and the test edits above. The untracked `*task710*/*task713*/*task716*` files in the tree are Jason's, not mine. **Nothing committed.**

### For you
- 🔴 **Ships ONLY with TASK-726** (without the screen nobody can ask for a code, and the shared code already refuses). **Cut-over = the deploy**: the owner tells staff to re-link through the web; legacy admins keep receiving until each re-links or the super admin removes them.
- `.env.example` still has the empty retired-key line and its comment (my SEC-1 test pins the line, so removing it is a test edit too). Nothing reads it any more. `.env*` on the boxes still hold the old value; I never read or printed them. Retiring the line is a clean-up for Porter/the owner, not part of this TASK.
- Known limits, unchanged in kind: the miss limiter is per process (a restart resets it; N× under PM2 cluster, as TASK-534 already said); a signed-in user may request codes freely (each replaces the last; no per-user throttle was asked for).
- The scratch copies I used to measure the baseline live in my session's scratchpad, not in the repo.
## Questions
**Bob, 2026-10-11 — read only, NO code touched. Waiting for your GO. Everything I need to ask is here, once:**

- **Plan, declared (internal; overturn at review):**
  - **Columns on `users`, not a table:** `line_user_id` (unique where not null), `line_link_code_hash`, `line_link_code_expires_at`. One live code per user by construction, and a new one simply overwrites the old. Migration `0067` (the drizzle folder ends at `0066` today).
  - **The code:** 8 characters from an unambiguous uppercase alphabet (no `0/O/1/I/L`), from a CSPRNG, **hashed** (SHA-256 of the normalised code) at rest, 10-minute expiry, burned on use. Typing is case- and space-insensitive.
  - **Retirement:** `verifyAndLink`'s admin branch stops consulting the shared code entirely; it is pinned by value (typed ⇒ refused, nothing written). `line-admin-code.ts` keeps only the miss limiter.
  - **Recipients:** `getAdminLineUserIds` = active linked users ∪ the legacy list, de-duplicated (an account in both counts once). `addAdminLineUserId` stops being called by anything.
- **Q1 — claim list, please ask Porter once.** Beyond your ❓ four, I will need these (found by reading, so there are no surprises later):
  1. `src/db/schema.ts` (the `users` columns) and `drizzle/0067_*.sql` + its `meta/` journal and snapshot. You granted "the users schema + ONE migration"; I read that as including these.
  2. **The migration witness / ledger.** `db:verify` counts journal = witnesses = ledger rows, and Team A edited `src/lib/migration-ledger*.ts`, `scripts/migrate-preflight.ts`, `seed-ledger-from-schema.ts` and `verify-migrations.ts` this week (TASK-655). A new migration needs a witness entry there. **Whose files are those for a new migration, and may I add the one entry?**
  3. `src/services/user.service.ts` (`listUsers` DTO + the Unlink) — I assume this is your "`users.service`".
  4. Tests that census the users/me routes or pin `getAdminLineUserIds` / the admin branch. I'll find them by grep when I start and list them to you before editing (as the claim asks).
  - `route-access.ts` is **not** needed: `/api/me` and `/api/users` are exempt from the table (they carry their own guards).
- **Q2 — one thing a person will see (no new words, so your call, not a blocker).** The admin chat prompt (`code_admin`) and the refusal (`verify_admin_bad`) read *"Please type the admin code" / "Wrong admin code, please try again"*. Both stay **true** for the web code, and every refusal keeps the same reply. The consequence to accept: **an admin who types a correct code after the 10 minutes sees "wrong code"**, with no hint that it expired. That is the same-reply rule doing its job; do you accept it, or is it a copy question for the owner?
- **Q3 — confirming the cut-over.** Nobody can link an admin LINE between this deploy and the moment a web admin issues a code (the shared code refuses from the first minute). I am taking "cut-over = this deploy" as already ruled; **shout if Porter wants a grace period instead.**

## Review

**Silver, 2026-10-11 — answers. ▶️ GO on everything except ONE entry (Q1.2).**
- **Plan:** all accepted. Columns on `users`, an 8-char unambiguous CSPRNG code, SHA-256 at rest, 10 min, burned on use; recipients de-duplicated; `addAdminLineUserId` uncalled. ⭐ Good read on the de-dup.
- **Q1:**
  1. ✅ **Covered:** "the users schema + ONE migration" includes `schema.ts`, `drizzle/0067_*.sql` and its `meta/` journal + snapshot.
  2. ⛔ **The migration witness/ledger entry: asked of @Porter** (Team A edited those files in TASK-655). Build everything else; add that ONE entry only after I write GO. `db:verify` will be red until then, which is expected; say so in your report.
  3. ✅ `src/services/user.service.ts` IS the "users.service" I meant.
  4. ✅ The standing practice: grep the census/pin tests, list the reds to me once, edit nothing outside before the grant.
  - Noted: `route-access.ts` is not needed (`/me` and `/users` carry their own guards). Agreed.
- **Q2 — accepted, no owner question.** An expired code answering "wrong code" is the SEC-1 same-reply rule working as designed, and both sentences stay true. The web dialog shows the expiry and offers «ขอรหัสใหม่» (TASK-726), so the way out is on the screen where the code came from.
- **Q3 — confirmed:** Porter ruled "Cut-over = this deploy" in writing (`inbox/SA-B.md`, 2026-10-11). No grace period.
- **Q1.2 — ✅ GRANTED by @Porter (2026-10-11):** you add the ONE `0067` witness/ledger entry yourself, **the entry only** (nothing else in Team A's TASK-655 files). ▶️ GO.

**Silver, 2026-10-11 — on CONTRACT CHANGE #1 and the reds report.**
- **Contract change #1: ✅ accepted.** The TASK allowed `/me/line-link`, and keeping a DB read off the shell's every-page `/me` is the right call. Fanta told; Porter's `contract.ts` grant narrows to `UserDTO` only.
- **`REPORT-task725-reds-outside-claim-2026-10-11.md`: exemplary.** It measures against a scratch-copy baseline, proves the hidden `expect`s in a second scratch copy, and edits nothing outside the claim.
  - I checked whether a different design could avoid §3's ~100 fakes: it can't. Recipients must come from `users` (otherwise disable would not cut notices), so every test that fakes only `appSettings` must answer the `users` read.
  - ⇒ **The whole report goes to Porter as ONE grant request: §2 + §3 + §4.** ⛔ Edit none of them until I write GO. Keep fixing §5 (inside your claim).
- **✅ GRANTED by @Porter (2026-10-11): report §2 + §3 + §4, the listed lines only.** ▶️ GO, EXCEPT these:
  - 🔴 **HOLD these 5 until I relay Porter's "710+713 committed"** (they are also in Jason's uncommitted set; your lines would ride into Team A's commit):
    - `src/lib/duo-course-req095-13.test.ts`
    - `src/lib/group-series-req104.test.ts`
    - `src/lib/group-session-req095-2a.test.ts`
    - `src/lib/teacher-own-calendar-req097.test.ts`
    - `src/services/makeup-born-confirmed-task702.test.ts`
  - ⚠️ **TASK-716 (Jason) will claim test files too.** Porter is getting its list. Don't edit a file it claims until 716 lands; I'll pass the list on.
  - The suite stays red on those 5 until then: expected; say so in your report.
- **The "derive the migration count" XS: DROPPED (Silver).** It would touch the same 63 lines, so it is not cheaper. And deriving the count from the journal makes each pin tautological (count = count), losing what it protects: each comment names the migration that must have landed. There is no next round (owner).
- **🔒 HOLD LIST (Sober via Porter, 2026-10-11, PROVISIONAL; the exact list follows).** Do NOT edit until I relay a release:
  - `src/services/scheduler.service.ts` · `src/services/undo.service.ts`;
  - any `*task713*` / `*task716*` file;
  - the 5 overlap files above (until "710+713 committed");
  - **tests that read the make-up marker.** Checked by grep against your report's files (`isMakeup|is_makeup|bookingEventKind|canInsert`): only **`src/services/booking-undo-req108.test.ts`** (NEW to the hold; it also sits beside the held `undo.service.ts`) and `makeup-born-confirmed-task702.test.ts` (already held).
  - ⇒ Park those lines and list them in your report as "held".

## Review
**Silver, 2026-10-11 — ✅ ENGINEERING ACCEPTED.**
- **Re-run by me with the SAFE command:** the full back suite **4392 pass / 7 fail**.
  - **The 7 are exactly the held lines:** the 5 overlap files = 6, plus `booking-undo-req108.test.ts` = 1.
  - The latter file's working-tree diff is **Jason's TASK-716** (a new test at `:568+`), not yours: you kept off it entirely. ⭐ ⇒ **That line waits for TASK-716 to land, not only for 710+713.**
- 🚫 **I did NOT re-run your mutation set:** Jason is working in the same back tree, and the runner mutates files temporarily (my own lesson from 673). Your 18/18 with `CHECKSUM identical` on a clean 93 baseline is accepted on the record.
- **The decisions all accepted.** ⭐ Especially:
  - burn + link as ONE conditional `UPDATE … RETURNING` (two chats can't both win);
  - `previous` read BEFORE the write;
  - the remover reading the LEGACY list only (N15: the "obvious" edit would have copied every linked id into the legacy list);
  - Unlink removing the legacy copy too.
- **Retirement:** `line-admin-code.ts` is now only the limiter; `addAdminLineUserId` is deleted (structural); no product file reads the env key; pinned with the env SET and UNSET.
- **Files to commit (after the held lines land):** see "BUILT. Final notes" above, plus the 34 + 16 granted test files and the 2 one-liners.
- **Still open, not yours:** `db:verify` needs a DB (offline parity 68 = 68 = 68). It runs at deploy, Tanya's sid gate.

- **▶️ RELEASE (Silver, 2026-10-11): the 7 held lines.** The owner committed everything in back **`64e27b3`** (710 + 713 + 716 + 725). The tree is clean.
  - **Checked: your 7 lines are NOT in it.** The four count-pin files still read `toBe(67)`, `makeup-born-confirmed-task702.test.ts:327` still reads `entries.at(-1)`, and `booking-undo-req108.test.ts` has no `users` fake.
  - ⇒ Apply exactly the 7 (report §2 for the 4 files, §4 for 702:327, §3 for booking-undo). Run the full back suite (SAFE command) and report **HEAD + green, with counts**. sid waits for this.

- **✅ Silver, 2026-10-11 — the 7 held lines verified:** HEAD `64e27b3`, exactly 6 test files modified (the 7 lines), full back suite (SAFE) **4399 pass / 0 fail**. **TASK-725 is DONE.** Commit: those 6 test files (test-only; the sid build of `64e27b3` is unaffected).
