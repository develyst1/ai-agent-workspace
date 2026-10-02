# DEPLOY — sid — 2026-09-30
**Written by @Sober for @Porter.** **Supersedes `DEPLOY-sid-2026-09-29.md`.** 📌 **This is the RECORD of the REQ-110 batch the owner deployed today** — Tanya has already tested against it (TEST-076).

## 1. Environment
🚫 **No new keys.** **Unchanged:** `LINE_ADMIN_VERIFY_CODE` (already set) · `PUBLIC_ADMIN_BASE_URL` (🔴 **runtime, not build-time**).

## 2. 🔴 Order — `db:migrate` BEFORE the code
**Expect `Journal: 65 migration(s)`** and `✅ every migration is recorded in the ledger AND witnessed in the schema.`
- **New since 62:** **0062** the teacher leave-day table · **0063** the voucher expiry record · **0064** the reconfirm marker.
- 🔑 **Old code on the new schema is safe; new code on the old schema is not.** **Migrate, then start.**
- **Red verify ⇒ `bun run db:seed-ledger`, dry run first, read every line, then `--apply`.** 🚫 **Never start the app against a schema verify has called bad.**

## 3. What went out
1. **Bulk confirm accepts Extended** (no backend change — the server always did).
2. **The camp-deduction notice in the customer's format.**
3. **The camp week editor's rate box no longer clipped.**
4. **A one-session teacher cover** — 🔴 **see D10 below; it dead-ends on screen and is being fixed.**
5. **A voucher's expiry can be extended**, and the extension survives a full cancel-and-rebook.
6. **A course's start date can be changed** before it starts.
7. **Inert until their screens land:** the teacher leave-day block · camp delete/close.

## 4. What Tanya found (TEST-076) — **being fixed this round**
🔴 **D10 (blocker):** the cover dead-ends — `RATE_REQUIRED` with no rate box. 🔴 **D11:** a parent who abandons registration after the phone step is left linked with **0 children**.
🟠 **D9:** the reconfirm box prints `true` where a count belongs. 🟠 **F-E:** two duplicate-name boxes instead of one. 🟠 **F-D:** English sub-district names garbled.
✅ **Passed:** items 1, 3, 7 (@1920), item 6 apart from D9, the LINE-admin labels, smoke. **Item 12 waits for tonight's day-end.**

## 5. Rollback
**The code rolls back; the migrations do not need to.** 🔑 **Old code on the new schema is safe — the new tables and columns are simply unread.** ⇒ **Put the previous build back and leave the database alone.** 🚫 **Never roll a migration back to fix an app problem.**
