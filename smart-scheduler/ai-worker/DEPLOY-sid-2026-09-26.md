# DEPLOY — `sid`, the next-round release. **For the owner, via @Porter. Written by @Sober, 2026-09-26.**
Every command is the owner's; no agent runs any of them. ⚠️ **This is `sid`, not `uat`** — `.env` must hold the **sid** values throughout. (Since TASK-503 the test suite refuses to run at all if `.env` points at uat or the real OA, but **that guard does not protect a deploy** — it only protects `bun test`.)

> 🔴 **ADDED 09-27 — READ BEFORE DEPLOYING.** Two tasks written for the NEXT release are already in the working tree: **the MOVE notice** (a new message to coaches AND families) and **a group seat notifying every coach of the group**. **"Next deploy" was a plan, not a mechanism** — so a build from today code SENDS the move notice, **in wording the owner has not yet approved.** ⇒ **either his wording is approved first (recommended; it is two short messages), or the move notice is gated, or this list is not run yet.** The group-seat change needs no wording and is his own ruling.

> 🔴 **ADDED 09-28 — the ORDER is now load-bearing, not tidy.** `bun run db:migrate` must run **BEFORE** the new code is started. TASK-540 added columns that **every leave write now uses**, so **code-before-migrate means every attempt to record a leave fails.** ⚠️ **Do not reorder these two steps under pressure** — the failure is immediate and customer-visible (staff cannot record a leave at all).

---
## 1. What is in it
**Four migrations.** (⚠️ Updated 09-28: TASK-540 added `0060`, so the journal ends at **61**. Earlier lines in this file said 60 — **61 is current**.)

🔴 **ORDER IS LOAD-BEARING: run `db:migrate` BEFORE starting the new code.** Every leave write now uses the two new columns, so new-code-on-old-schema fails on every leave; old-code-on-new-schema is safe.
- **0057** (journal tag; the 58th file) — the check-in provenance split: `bookings.checkin_channel` / `checkin_actor` and `camp_days.mark_channel` / `mark_actor`, with a backfill. **The old columns are kept and still written** — deliberately, so a mis-sorted backfill is recoverable.
- **0058** (the 59th) — Undo: `bookings.leave_charged` and the append-only `booking_undos`.
- **0059** (the 60th) — TASK-497: the undo event gains the kind `attendance`, so an undone STAFF or day-end mark is recorded as what it was instead of borrowing the word "check-in".

**Behaviour:** the admin **Undo** (a mistaken leave, a false check-in) with its own permission key · **the Shop QR chip** on the roster and booking detail · **the shop-front multi-select** (up to 10 children, one result per child) · **DUO suspension** now refusing only when **every** household is suspended · **ABSENT terminal to every camp scan** · the **teacher schedule** formats, the teacher help list and the **orange teacher menu artwork** · and the **public check-in answers narrowed to six fields**.
🔴 **The last one is a leak fix and the reason this release matters:** the public check-in doors were answering with the whole admin booking record, **including the coach's pay for that class and an admin's username**, to anyone holding a check-in link.

---
## 2. Before the deploy — two read-only checks
```
bun run db:provenance-report
```
**Run it BEFORE `db:migrate` and keep the output.** It reports what `checkin_source` / `marked_by` actually contain and flags any value that is not a known channel. 📌 **This is the only chance to see that column's real contents before the split reads them** — if it names a value we have not seen, **stop and send it to Porter** rather than migrating over it.
```
bun run db:verify
```
Expect **57 = 57** and the ✅ line **before** you start (that is sid today — the three files below are the ones this release adds). If it is already red, that is a pre-existing state and not this release — send the output up.

---
## 3. The migration
```
bun run db:migrate
```
(preflight → drizzle → verify, in one command.)
**Expect at the end:** `Journal: 61 migration(s)` and `✅ every migration is recorded in the ledger AND witnessed in the schema.`
- 🔑 **If verify is RED, the procedure has not changed:** a red verify usually means **missing ledger rows, not missing work** — `Schema witnesses: 61 applied` is a statement about the database's real objects. Repair with `bun run db:seed-ledger` (**dry run first, read every line**), then `--apply`, which writes rows and applies nothing. 🚫 **Do not restart the app against a schema verify has called bad.**
- 📌 **Both new migrations were written by hand into our numbering series** (`…053`, `…054`). That matters: `drizzle-kit generate` stamps a real clock time, which would sit above the whole series and make **every later migration skip in silence**. A test now enforces it (TASK-494) and `db:generate` renumbers automatically (TASK-495) — **nothing for you to do, recorded so the numbers do not look arbitrary.**

**Then run the provenance report again** and compare: every previously-flagged value should now sit in the actor column, and the channel column should hold only known channels.

---
## 4. Deploy and restart
🔑 **Check this line in the log after the restart, on `sid` and later on `uat`:**
```
[outbox] LINE worker started (every 15s)
```
⚠️ **If it is missing, stop and tell Porter before anything is sent.** The worker now starts **only when the app is the process entry** (TASK-505, so a test run can never deliver messages). Everything in the repo starts it that way — **but pm2's launch script lives on the server, not in our repo**, and if it points at a wrapper that *imports* our file, the worker will not start. **The symptom would be silence, not an error:** messages queue and never go out.

---
## 5. The teacher menu republish
**New orange artwork** (`assets/line/menu-teacher.png`, 2500×843). On the **demo** OA, by `RUNBOOK-richmenu-v2-demo-publish.md`:
```
bun run line:inspect-menus                      # the header must name the DEMO account
bun run line:publish-menus --account @125vuzsj
bun run line:relink-menus                       # dry run — READ IT
bun run line:relink-menus --apply --account @125vuzsj
```
- **Expect** the sweep to read mostly `stale` on a repeat publish (or `variant` the first time) — **both are success.** Only **`BLOCKED`** is worth reading twice.
- 🔴 **Step 7 stays struck: never run `line:remove-menus`** — it deletes every menu it recognises as ours, **including the ones just published.**
- **21 teachers to re-link.** The real OA (`@427ybeky`) follows the same steps **only when Tanya has passed the demo** — and by `RUNBOOK-uat-real-oa-release.md`, not this file.

---
## 6. What Tanya checks on `sid`
- **Undo:** a mistaken leave ⇒ back to CONFIRMED, the leave refunded **only if it was charged**, the coach-hour held again, **the coach told and the family NOT** · a false check-in ⇒ CONFIRMED, credit back, **nobody told** · 🔑 **the same session undone twice changes nothing the second time** · a session the day-end has settled ⇒ **refused, clearly.**
- **The three admin actions are distinct and do different things:** **Cancel booking** (the session leaves the schedule, with a reason), **Undo attendance**, **Undo leave / check-in**. 🔑 **Cancel must not be reachable by pressing Undo, or the reverse.**
- **Shop QR:** two children ticked, one refusable ⇒ **a result per child** — 🔑 **the screen must never say "checked in" when one of them was not.** · the **Shop QR chip** appears on a wall-QR check-in and on nothing else.
- **DUO:** a session with two families, one suspended ⇒ **the other family checks in**, the suspended one is refused **in its own words**.
- **Camp:** a day marked ABSENT by staff, then scanned ⇒ **stays ABSENT**, and the page says **"already recorded"** with **no green tick** (after Fern's TASK-483).
- **Teacher LINE:** the orange menu · `ตารางของฉัน` typed **and** tapped · the `วันนี้ / สัปดาห์นี้` chips · **the schedule's words in English even in a Thai chat** (Khwan's own choice — **not a bug**) · the help list showing **teacher** commands, both of which must actually work when typed.
- **The check-in pages must look and behave exactly as before** — they now carry six fields instead of thirty-three. 🔑 **Anything missing on screen is a finding, not a tidy-up.**

---
## 7. If something looks wrong
| what you see | what it means | what to do |
|---|---|---|
| the provenance report flags an unknown value | the column holds something we did not expect | **stop**, send it up before migrating |
| verify RED after migrate | probably ledger rows, **not** the schema | `db:seed-ledger` dry run, send it up, **do not restart** |
| no `[outbox] LINE worker started` after restart | pm2 may be importing rather than running our entry | **stop**, tell Porter **before anything is sent** |
| a sweep row reads `BLOCKED` | that chat's menu is not published there | do **not** apply; send the output up |
| a check-in page is missing something | the allow-list is too narrow | a **finding** — report it, do not widen it locally |
