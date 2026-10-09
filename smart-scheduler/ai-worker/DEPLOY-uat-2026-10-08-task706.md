# DEPLOY — uat — **TASK-706 alone: a cancelled GROUP date tells the families of its CONFIRMED seats**
> 🔻 **SUPERSEDED 2026-10-08 — NOT deployed alone. `TASK-706` ships together with `TASK-707` in `DEPLOY-uat-2026-10-08-706-707.md` — build from THAT note.** (Kept for the record: 706 was cleared by `TEST-088`.)

**Written by @Sober for @Porter, 2026-10-08.** 🔴 **The REAL OA and REAL families.** A small release on top of tonight's (`DEPLOY-uat-2026-10-09.md`, live on back `6f7a40f` · front `f60d7e7`; closed by `TEST-087`).
**Build from:** back **`a2185b2`** (= `6f7a40f` + `TASK-706`; tree clean) · **front: NO change** (stays `f60d7e7`).

## 🔴 READ FIRST
# 🚫 DO NOT RUN `line:remove-menus`. EVER. — no menu step in this release.
**`LINE_ADMIN_VERIFY_CODE` is an environment value — never in a file.** ⚠️ **Check the back `.env` holds the uat values** (it was switched to sid for the sid run — the opposite of tonight).

## 1. Migration — 🚫 NONE
```bash
bun run db:migrate
```
**Expect `Journal: 67 migration(s)` and the green verify line — unchanged.** A red here is a real gap (the ledger accepts either line ending since `TASK-655`) — read it, do not seed blindly.

## 2. Restart the BACK only. The front is untouched.

## 3. What changes — for families
**Before:** when an admin (or a coach's leave, or a series cancel-all) cancelled a **GROUP date that was still PENDING** — the dates a course sale ADDS to a group — **the families whose child's seat on that date was CONFIRMED got NO cancel message**, only the replacement's confirmed date. They could turn up.
**After:** **those families get the normal cancel notice** (`❌ CLASS CANCELLED`, the existing approved wording), and still the replacement's confirmed date. **A child whose seat was itself unconfirmed: not told** (they were never told that date). **A CONFIRMED group date, and every non-group class: exactly as before.** 🚫 **No new words.** **`TASK-706`** · *(F3, `tests/TEST-086-task705-sid.md`)*
⇒ **The interim step in `DEPLOY-uat-2026-10-09.md` §7 ("an admin tells the families by hand when cancelling a PENDING group date") is no longer needed after this release.**

## 4. ✅ The numbers — re-run by @Sober, 2026-10-08 (working tree = `a2185b2`, 5 files, verified before commit)
**Back:** `tsc` 0 · **`4312 pass · 0 fail`** (327 files) · **`unhandled-between-tests: 0`** · **`67 = 67`** · break-and-watch **`706` 4/4** (the gate reads the group row · a PENDING seat's family told · the seat filter on non-group rows · post-cancel seats read) · regression **`705` 8/8 · `704` 5/5** · CHECKSUM identical, tree identical.
**Boundary:** code and tests, DB-unreachable, with every connection setting blanked (SYSTEM-FACTS 2026-10-08). **On screen: @Tanya's sid run.**

## 5. LINE-side
**More family pushes than before:** one cancel notice per CONFIRMED seat's household on a cancelled PENDING group date (de-duplicated per household). Monthly-quota note as always: `429 … monthly limit` is LINE's, not ours.

## 6. After the restart — @Tanya on uat, READ-ONLY
Nothing to exercise on uat (a cancel would reach real families). **Read only:** the back answers; `[outbox] LINE worker started` in the log.

## 7. Rollback
**Back to `6f7a40f`** — no migration to undo. Cancel notices already sent stay sent; the old code simply stops sending them (and the §7 interim step comes back).
