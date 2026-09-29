# DEPLOY — sid — 2026-09-28
**Written by @Sober for @Porter.** Supersedes `DEPLOY-sid-2026-09-26.md`. **Read it in order; the order is the instruction.**

📌 **Where this sits:** sid → Tanya → Khwan on sid → uat. **This is step one.**

---

## 0. Before you touch anything — the one value we do not have
🔴 **The new admin code has not reached us, and it must not.**
- **It is an ENVIRONMENT value, not a file:** `LINE_ADMIN_VERIFY_CODE` on the server. 🚫 **It must never be written into a task, a board row, a log, this file, or any committed file** — *a secret in a repo is a secret published to every future machine.*
- **At least 8 characters**, and 🚫 **never a retired one** (the old `229` and anything that was ever live).
- **The owner sets it, or hands it to whoever runs the deploy, out of band.** **We do not need to see it.**
- ⚠️ **If it is unset or too short, admin linking REFUSES and says so in the log** — **that is the safe state, not an outage.** *Nobody can link as an admin until a real code is set, which is the whole point.*

---

## 1. Environment — check BEFORE deploying
| Key | Why it matters now |
|---|---|
| `LINE_ADMIN_VERIFY_CODE` | **The new 8+ code** (see §0). Until it is set, nobody can link as admin. |
| `PUBLIC_ADMIN_BASE_URL` | 🔴 **Runtime, not build-time.** The `ปฏิทิน` reply and the admin menu's cell both build the web-app link from **this one key**. **Unset or invalid ⇒ the calendar command logs an error and replies with a generic failure** — the coach gets nothing useful. |
⚠️ **Confirm both are set on sid before §2.** *A value read at runtime is a value nobody notices is missing until a coach types a command.*

---

## 2. 🔴 THE MIGRATION RUNS BEFORE THE NEW CODE
**`bun run db:migrate` FIRST. Then start the new code.**
🔑 **This is not a preference and it is not reversible by luck:** **every leave write now uses two new columns.** **New code on the old schema fails on every leave.** Old code on the new schema is harmless.

**Expect at the end:** `Journal: 61 migration(s)` and `✅ every migration is recorded in the ledger AND witnessed in the schema.`
- ⚠️ **61, not 60.** The 09-26 list said 60; `0060` landed after it.
- 🔑 **If verify is RED, the procedure has not changed:** a red verify usually means **missing ledger rows, not missing work**. Repair with `bun run db:seed-ledger` — **dry run first, read every line** — then `--apply`, which writes rows and applies nothing. 🚫 **Do not start the app against a schema verify has called bad.**
- 📌 **All migrations are hand-numbered into our own series on purpose.** `drizzle-kit generate` stamps a real clock time, which sits above the whole series and would make **every later migration skip in silence**. A test enforces it and `db:generate` renumbers automatically — **nothing for you to do**, recorded so the numbers do not look arbitrary.

---

## 3. What this release changes, in the order a person will notice it
1. **The leave dialog tells the truth per booking** — no course · no leave left · declared at sign-up · ordinary. **It used to promise a quota and a make-up for all four.**
2. **The Undo dialog asks the server what the undo would do, and says only that** — including **a refusal shown before the click, in the server's own words.**
3. **An undone leave restores the note it replaced** (forward-only — see §5).
4. **A cancelled make-up tells the family**, and **names a new class only when one was actually added.**
5. **`ปฏิทิน` sends the web-app link** instead of a calendar subscription.
6. **A super admin can see and remove LINE accounts holding admin rights.**
7. **The admin code is no longer printed by the bot** (SEC-1), and **admin linking is rate-limited.**

---

## 4. ⭐ The admin-removal order — AFTER the deploy, and the order is the safety
🔑 **Removing first locks people out; changing the code first only makes them re-link.**
1. **Set the new code** (§0) — **the old one stops working the moment you do.**
2. **The demo phone can be removed at ANY time, including before all of this** — *it is ours, and nothing depends on it.*
3. **Tell the real admins and let them re-link** with the new code. **Wait for them.**
4. **Then remove the accounts still holding admin rights that nobody has claimed.**
⚠️ **"ไม่ทราบว่าเป็นบัญชีของใคร" rows are expected, not a bug** — we store bare LINE ids with no name. 📌 **They are also the ones most worth removing**: an admin we cannot name is either a test phone or someone who should not be there.
🔑 **Anyone removed keeps their coach or parent access.** It is not a deletion, and the dialog says so.

---

## 5. ⚠️ Two honest limits to say out loud BEFORE Tanya tests
- **The note fix is forward-only.** **Leaves undone AFTER this deploy restore the note properly. Leaves taken BEFORE it stay as they are, including the row in Tanya's screenshot** — that row will still read `Note: <reason>`. 🔑 **That is expected, not a failed fix:** at the moment of the Undo, the leave's reason and an admin's own note were **indistinguishable** — nothing recorded which one put the text there, so *the alternative was a guess that would quietly delete admins' notes.*
- **The Undo forecast is a forecast.** There is a rare case the system can only decide at the moment of the act, so **the server can still refuse after a clean forecast.** **The dialog says so in advance, and both sentences are true together.** ⚠️ **If Tanya sees that, it is the designed behaviour — I would rather she reports it and is told it is expected than assumes it is a bug.**

---

## 6. After the deploy — the one check only a phone can do
🧪 **Tanya's round:** the admin LINE list + Remove · all four leave dialogs · the Undo forecast, **including pressing Undo when the server refuses** · `ปฏิทิน` on LINE.
⚠️ **Only she can check the Undo dialog's layout on a PHONE while the forecast is loading** — the block grows as the answer arrives, and we cannot prove that on a machine.
🚫 **She still cannot test LINE on a phone as an owner-level account — that stays the owner's.**

---

## 7. Rollback
**The code rolls back; the migration does not need to.** 🔑 **The old code on the new schema is safe** (the new columns are simply unused), so **if something is wrong, put the previous build back and leave the database alone.** 🚫 **Do not roll a migration back to fix an app problem.**
