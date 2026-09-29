# DEPLOY — sid — 2026-09-29
**Written by @Sober for @Porter.** **Supersedes `DEPLOY-sid-2026-09-28.md`.** **Read it in order; the order is the instruction.**

📌 **This is the D8 round.** **Tanya re-tests D8 only**, then Khwan on sid, then uat.

---

## 1. What changed since the 09-28 deploy
1. 🔴 **D8 — the Undo no longer refuses an expiry it never moved.** ⚠️ **This was never a quirk of Tanya's course: it affects every 4-session course's leave**, the 2nd leave of a 6 and the 3rd of a 10. **It failed safe, but it made the most ordinary leave impossible to undo.**
2. ✅ **Older courses still refuse — deliberately**, because for them we genuinely cannot prove the expiry was never moved, **and the refusal now tells the admin what to DO** rather than that a calculation failed.
3. 🔴 **`repair-course-expiry.ts` is RETIRED.** **A re-run would have shortened expiries and erased recorded extensions and admin date changes, with no record.** **It is now a stub that refuses and explains.** 📌 **Nothing was wrong; this removes something that was one command from being very wrong.**

---

## 2. Environment — unchanged, check anyway
| Key | Why |
|---|---|
| `LINE_ADMIN_VERIFY_CODE` | **Already set by the owner.** 🚫 Never comes to us, never in a file. |
| `PUBLIC_ADMIN_BASE_URL` | 🔴 **Runtime, not build-time.** Unset ⇒ the `ปฏิทิน` command gives a coach nothing useful. |

---

## 3. 🔴 THE MIGRATION RUNS BEFORE THE NEW CODE
**`bun run db:migrate` FIRST. Then start the new code.** **Unchanged from last time, and still not a preference.**
**Expect at the end:** `Journal: 62 migration(s)` and `✅ every migration is recorded in the ledger AND witnessed in the schema.`
- ⚠️ **62, not 61.** `0061` is new in this round.
- 🔑 **`0061` writes ONE row that records "we have been recording expiry changes since ⟨date⟩".** **It reads the earliest change already in the database, or uses the current time if there are none**, and 🔑 **a re-run can never move it.**
  - 📌 **That single row is what decides which courses the Undo may proceed on.** **It must be applied on sid FIRST**, before anyone judges the fix.
- 🔑 **If verify is RED, the procedure has not changed:** usually **missing ledger rows, not missing work** — `bun run db:seed-ledger`, **dry run first, read every line**, then `--apply`. 🚫 **Do not start the app against a schema verify has called bad.**

---

## 4. ⚠️ What Tanya should expect, so she reports the right thing
- ✅ **Her fixture course should now UNDO cleanly** — the forecast names the replacement class and the act proceeds. 🔑 **If it still refuses with the expiry message, that is a NEW finding and I want it.**
- ✅ **An older course refusing is CORRECT, not a failure.** **The refusal should read as instructions** — what to open, what to fix. 📋 **Those words are a DRAFT: if they do not help her, that is useful and I want it.**
- ⚠️ **Everything else from the 09-28 round still stands, unchanged:** the note fix is **forward-only** (her old screenshot row stays as it is), and **a clean forecast can still be refused at the moment of the act** — both sentences are true together.

---

## 5. ⭐ Three read-only questions for the owner — separate from the deploy
**Nobody but he runs them, and the deploy does not wait for them.**
⭐ **The one that matters counts how many live courses are currently in the un-undoable state** — 🔑 **it tells him whether this has been quietly costing admins time for months.** The other two only confirm the fix's cutoff.

---

## 6. Rollback
**The code rolls back; the migration does not need to.** 🔑 **Old code on the new schema is safe** — the new row is simply unread. **Put the previous build back and leave the database alone.** 🚫 **Do not roll a migration back to fix an app problem.**
