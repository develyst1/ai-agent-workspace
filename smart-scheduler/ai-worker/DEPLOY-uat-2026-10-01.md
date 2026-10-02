# DEPLOY — uat — 2026-10-01
**Written by @Sober for @Porter.** 🔴 **This is the REAL OA (`@427ybeky`) and real families.** **Read it in order; the order is the instruction.**
📌 **uat is at migration 57** (the 09-26 release). **This release takes it to 65.**

---

## 0. 🔴 Before anything — what must NOT come to us
**The new 8+ `LINE_ADMIN_VERIFY_CODE` is an ENVIRONMENT value.** 🚫 **It must never be written into a task, a board row, a log, this file, or any committed file.** *A secret in a repo is published to every machine we ever open it on.*
⚠️ **If it is unset or too short, admin linking REFUSES and says so in the log.** ✅ **That is the safe state, not an outage.**

---

## 1. Environment — set BEFORE the code starts
| Key | Value | Why |
|---|---|---|
| `LINE_ADMIN_VERIFY_CODE` | **the owner's new 8+ code** | 🚫 never reaches us. Unset ⇒ nobody can link as admin. |
| `PUBLIC_ADMIN_BASE_URL` | `https://frontoffice.develyst.online` | 🔴 **read at RUNTIME, not build time.** Unset or wrong ⇒ the `ปฏิทิน` reply and the admin menu's cell send a broken link. |
⚠️ **Confirm both are set on uat before §2.** 🔑 *A runtime value is one nobody notices is missing until a coach types a command.*

---

## 2. 🔴 THE MIGRATION RUNS BEFORE THE NEW CODE
```bash
bun run db:migrate
```
**Expect at the end:**
```
Journal: 65 migration(s)
✅ every migration is recorded in the ledger AND witnessed in the schema.
```
🔑 **This release applies 58 → 65 — eight migrations.** **New code on the old schema FAILS on every leave write** (TASK-540's two columns), **and old code on the new schema is harmless.** ⇒ **Migrate, then start.**
- 🔑 **If verify is RED it usually means MISSING LEDGER ROWS, not missing work.** **Repair:**
```bash
bun run db:seed-ledger
```
**Read every line of that dry run.** **Then, only if it is what you expect:**
```bash
bun run db:seed-ledger --apply
```
**It writes rows and applies nothing.** 🚫 **Do not start the app against a schema verify has called bad.**

---

## 3. Start the code — **BE and FE TOGETHER**
🔴 **They are one release and they break each other if split:** **the page sends address fields an old server ignores, and the new server refuses the two-part address an old page would still send.**

---

## 4. The outbox worker — **check it once, by its own line**
**On boot the worker prints:**
```
[outbox] LINE worker started (every <n>s)
```
**And after each pass:**
```
[outbox] sent=<n> failed=<n> retry=<n>
```
⚠️ **Confirm the "worker started" line appears once.** 🔑 **If it does not, every notice in this release queues and nothing sends** — **and the deploy will look successful.**
📌 **Keep the first `sent=/failed=/retry=` line.** ⚠️ **A `failed=` with `429: You have reached your monthly limit` is LINE's quota, not our bug** — *that is exactly what cost a day on sid.*

---

## 5. The rich menus on the REAL OA — per `RUNBOOK-uat-real-oa-release.md`
🔴 **Four steps, in this order, and the account flag is not optional.**
**(a) Inspect first — a read, and it reports on whatever account the token belongs to:**
```bash
bun run line:inspect-menus
```
**Expect: the four menus, and the admin one showing `areas: 1 · (0,0 2500x843) action.type=uri`.**
**(b) Publish:**
```bash
bun run line:publish-menus --account @427ybeky
```
**(c) Relink — DRY RUN, and read it:**
```bash
bun run line:relink-menus
```
**(d) Then apply:**
```bash
bun run line:relink-menus --apply --account @427ybeky
```
🔴 **DO NOT run `line:remove-menus`. Ever.** **It has no leftovers-only mode: it deletes every menu it recognises as ours, INCLUDING the ones just published, and leaves every follower with nothing.**
⚠️ **If `line:adopt-menus` reports `missing smart-scheduler-admin`, that is expected on an account published before this change** — **re-publish, then adopt.**

---

## 6. 🔴 THE TWO DATA PREREQUISITES — **neither is a footnote**
🔑 **Both are rows on screens, not a deploy. Until they pass, two shipped features reach NOBODY and the release still looks successful.**

**Step 2 — the code is set.** (§1 above.)
**Step 3 — 🔴 AT LEAST ONE REAL ADMIN LINKS WITH THE NEW CODE. This is a GATE.**
🔑 **The admin recipient is ONE list of LINE ids. While it is empty, EVERY admin notice writes a visible `SKIPPED — "no admin recipient configured"` row and sends nothing.**
**Step 4 — the LINE-links page then shows the count in one look, and Tanya reads it.** ✅ **That page is the check; no query needed.**
**Step 5 — 🔴 grant `action:calendar.teacher-leave` on the Teacher role** (Khwan, on the Roles screen).
⚠️ **uat's Teacher role holds only `menu:calendar`, and all 21 linked coach logins are on it.** ⇒ **Until this is granted, NO REAL COACH ON UAT CAN RECORD LEAVE** — **the advance-leave feature we just built reaches nobody.**
**Step 6 — remove unclaimed admin accounts LAST.** 🔑 **Removing before the real admins have re-linked locks people out; changing the code first only makes them re-link.**

---

## 7. What Tanya tests on uat
**The ten items from her sid round, now on the real OA:** the cover + rate box · the duplicate warning (one box, both languages) · the reconfirm count · the abandoned registration · the camp week count and closed mark · the three-part address on the page AND the chat · the camp Close / Open / Delete · the blocked-day strip · the leave dialog on a future date · the permission message.
⚠️ **Plus the two judgements only a human makes:** **does the yellow permission box read as "ask someone" rather than "you did something wrong"**, and **does the orange blocked-day strip read as a different thing from the camp strip at a glance.**
🚫 **She still cannot test LINE on a phone as an owner-level account. That stays the owner's.**

## 8. What only Khwan can confirm
**That the front-office flows match how her team actually works** — **the cover, the start-date change, the camp Close, and the register form with every field required.**
🔑 **And one thing only she can judge: whether being asked for an address a second time reads as reasonable or as "you lost my details."** 📌 *Households that only ever typed their address into the chat will be asked once more, by design.*

---

## 9. Rollback
**The code rolls back; the migrations do not need to.** 🔑 **Old code on the new schema is safe — the new tables and columns are simply unread.** ⇒ **Put the previous build back and leave the database alone.**
🚫 **Never roll a migration back to fix an app problem.** 🚫 **And never `line:remove-menus` to "reset" the menus** — **publish again instead.**

---

## 10. ⚠️ Known and deliberate — **so nothing here is reported as a fault**
- **A household with only a province on file is ASKED for the address again.** **It was valid when they gave it.**
- **We check that three address parts are present and that the province is real.** 🚫 **We do NOT check that the district belongs to the province** — **the owner accepted that limit rather than us keeping a second copy of Thailand's address data.**
- **A make-up cancelled and re-added at the SAME date and time sends the family NOTHING.** **The owner's ruling, working.** ⚠️ **It leaves no trace either, which is a known gap being sized separately.**
- **A closed camp week still charges its days, still reminds, and still shows on the calendar — marked.** **Close means "stop new bookings" and nothing else.**
- **The registration sentence after the phone step still reads "Registration completed ✅".** 📋 **New wording is drafted as `§19` and waiting on the owner; nothing has shipped.**
