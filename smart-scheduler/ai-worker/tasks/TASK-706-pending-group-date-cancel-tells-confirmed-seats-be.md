# TASK-706 — BE: **F3 — cancelling a GROUP date tells the families of its CONFIRMED seats, even when the group row itself is still PENDING** — @Jason (S, ≈ ½ day)
> ✅ **RELEASED 2026-10-08 — "uat build done"** (@Porter: uat live on back `6f7a40f` / front `f60d7e7`, `0065` + `0066` applied, no RAISE). The back tree is clean on `6f7a40f` — **start from it.**

**From @Sober to @Jason, 2026-10-08. Cut on @Porter's word. Its OWN small release** (not the one going to uat tonight): 706 → my verification → owner commit → sid → @Tanya → uat.
🔴 **@Tanya, `tests/TEST-086-task705-sid.md` F3:** selling a course into a group **auto-adds dates to the series as PENDING group rows**, while the child's **seat** on them is CONFIRMED and the family already holds them in their course's *"CONFIRMED SCHEDULE"*. **Cancelling such a date sends the family only the replacement's confirmed message — no "❌ … cancelled" for the date they think they still have ⇒ they can turn up.** A CONFIRMED group date does send it. **Pre-existing** (as old as group seats) — listed in the uat note §7 with the admin's interim step (tell the families by hand).
✅ **Claim (Team A):** `src/services/scheduler.service.ts` (`classCancelledFamilyAccounts` / `familyAccountsOfRow`) · its tests. 🚫 **No new words. No front. No migration.**

## The cause (read in code, `6f7a40f`)
`classCancelledFamilyAccounts` (≈ :3302): `if (current.status !== "CONFIRMED" && current.status !== "EXTENDED") return null;` — **for a GROUP date, `current` is the GROUP row**, whose status is PENDING for a sale-added date ⇒ the notice stops before it ever looks at the seats.

## The fix — decide by the SEATS (Tanya's first candidate; my ruling: smallest blast radius)
**For a GROUP row only:** the families to tell are the households of the seats that were **CONFIRMED before the cancel** (the callers already pass the PRE-cancel seats — `familyAccountsOfRow`'s own warning), **whatever the group row's status**. ⇒ a PENDING group row with CONFIRMED seats tells those families; **a PENDING seat's family is NOT told** (they were never told that date); **no CONFIRMED seat ⇒ nothing sent** (as today).
**A CONFIRMED (or EXTENDED) group row:** exactly as today. **Every non-group row:** byte-identical (the early return stands for them).
🚫 **Not the other candidate ("confirm the dates a sale adds")** — it changes the sale flow, the group rows' statuses, the coach's confirm notices, bulk confirm and the reconfirm count, for the same family-facing result.
**Wording:** the existing family cancel notice (`class_cancelled_parent`) — a GROUP seat gets its make-up Note by shape, which is true (the seat's course re-plans). **No new words.**

## ✅ Done means
**`tsc` (5.6.3) · DB-unreachable `bun test` with COUNTS · `unhandled-between-tests: 0` · `67 = 67`** · **by value:** PENDING group row + CONFIRMED seat ⇒ that seat's family gets the cancel · PENDING group row + a PENDING seat ⇒ not told · PENDING group row + no CONFIRMED seat ⇒ nothing · CONFIRMED group row ⇒ unchanged · a non-group row (PENDING / CONFIRMED) ⇒ byte-identical · two siblings on one group date ⇒ their family once (TASK-445 de-dup intact).
**Mutations (list in the set):** the gate still reads the group row · a PENDING seat's family told · the seat filter applied to non-group rows · post-cancel seats read (every seat CANCELLED ⇒ nobody told).
⏱️ **Size: S ≈ ½ day (estimate ≈ 4 h + 10 percent).** Bigger ⇒ say so at once.

## ✅ 2026-10-08 — @Jason: `TASK-706` (F3) BUILT — cancelling a GROUP date tells the families of its CONFIRMED seats, even when the group row is PENDING — 4 / 4 bite
**`tsc` 0 (5.6.3) · DB-unreachable suite `4312 pass · 0 fail` (was 4299) · `unhandled-between-tests: 0` · `67 .sql = 67 journal tags`.** **Set `src/services/group-date-cancel-seats-task706.mutations.json` — 4 / 4 BITE** (G1 gate reads the group row · G2 a PENDING seat's family told · G3 seat filter on non-group rows · G4 post-cancel seats read), CHECKSUM identical. **Re-run: `705` 8/8 · `704` 5/5 · `702` 24/24 · `656` 29/29 — all bite.** Started from the clean tree on `6f7a40f`. No new words, no front, no migration, `familyAccountsOfRow` untouched (the move notice still uses it as before).
### The fix (`classCancelledFamilyAccounts`, as ruled)
For a GROUP row that is **not** itself CONFIRMED/EXTENDED: read the seats as the caller passed them (the PRE-cancel seats; if none passed, read the group's rows), keep **only the CONFIRMED ones**, none ⇒ `null` (nothing sent); else ask the household accessor for just those seats ⇒ the existing `class_cancelled_parent`. A CONFIRMED/EXTENDED group row ⇒ exactly as before (every non-cancelled seat); **every non-group row** ⇒ the early return stands. The three callers that reach it already pass pre-cancel seats (admin cancel `seatsBefore`, coach leave's loaded `seats`, the series cancel-all's `r.seats`).
### By value
PENDING group + a CONFIRMED seat ⇒ that family told · PENDING group + CONFIRMED and PENDING seats ⇒ only the confirmed seat's household asked · only PENDING/CANCELLED seats ⇒ `null`, no outbox row · two siblings on one PENDING date ⇒ ONE row (TASK-445 de-dup) · a CONFIRMED group row ⇒ unchanged (a PENDING seat's family included, a CANCELLED one not) · a non-group PENDING row ⇒ `null` even when it carries confirmed-looking seats · a non-group CONFIRMED row ⇒ its own children, ordinary notice. By source: the gate lines + `familyAccountsOfRow` unchanged.
### Pins re-aimed (text only): `teacher-own-calendar-req097` (the early return is now the group-only exception — both lines pinned) · `camp-week-500-family-dedupe-req104` (`familyAccountsOfRow(tx, target)`).
### ⚠️ Said, not hidden — for you and the owner
**`.env` in the back repo now points at the CUSTOMER'S system** (the test guard refused to run: `LINE_OA_WRITE_ALLOW` / `LIFF_ID` / `LINE_LOGIN_CHANNEL_ID`). I ran every check with those three (and the LINE token) set to empty, as before — nothing connected; the guard is working. If Tanya's sid run uses this tree's `.env`, the owner should restore the sid values first.
▶️ **Ball: Sober — verify 706 → owner commit → sid → @Tanya → uat.**

