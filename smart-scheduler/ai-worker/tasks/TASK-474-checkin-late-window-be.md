# TASK-474 — `REQ-107 §7 K5`: a parent may check in for a while AFTER the class ends — `checkin_late_minutes`, default 0 — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S.** No migration expected. Folded into this round by the owner; ships with the rest of REQ-107.

## §0 The ask
A new setting **`checkin_late_minutes`** — *"เช็คอินได้หลังจบคลาส (นาที)"* — **default 0, which keeps today's behaviour exactly**, sitting beside `checkin_early_minutes` in Settings. It widens the check-in window past the end of the class, and it must apply to **every** caller: `isWithinCheckinWindow` / `checkinWindowMessage` (`lib/checkin.ts`), the `/checkin` token page, and camp.

## §1 My two rulings, with the reasoning — build to these
**1. The window may NOT cross midnight. Same day only.**
`isWithinCheckinWindow` already opens with `if (now.date !== bookingDate) return false`, and the whole check-in path matches a booking **on today's date**. A window running past midnight would be looking for a session on a date that is no longer today — it would not "work at 00:30", it would silently match nothing. **Keep that guard untouched** and clamp the late end to the end of the day (`23:59`) so the arithmetic can never imply tomorrow. Range **0–180 minutes**, and the clamp holds regardless of what the setting says — belt and braces, because a setting is a number a human types.
**2. 🔴 The window must not outlive the day-end cut, and a late scan must never flip a settled session.**
The day-end job takes every **CONFIRMED** class on the run date that has already **started** (TASK-396) and settles it — attended or no-show — and that settlement **moves units and money**. So a class at 16:00–17:00 is settled by the 17:30 run, and a 120-minute late window would still be "open" at 19:00 over a row that is already finished. ⇒ **A scan after the session has been settled must answer with the existing "too late" message and change nothing.** In particular: **a late scan must NOT turn a NO_SHOW back into an attendance** — that would re-open a consumed unit hours after the shop closed its day, and nothing downstream expects it.
📌 Say in your report what the honest upper bound is in practice: **the late window is only real between the class ending and the day-end run**, so on a box whose cut is 17:30 a late setting beyond that does nothing for an afternoon class. The owner should know that before he picks a number — it is a property of the design, not a bug to fix.

## §2 Build
- The setting (spec beside `checkin_early_minutes`, same shape, `unit: "minutes"`, default **0**, range **0–180**).
- `isWithinCheckinWindow(..., earlyMinutes, lateMinutes)` and `checkinWindowMessage` taking it, with **every caller threading it** — the session scan, the `/checkin` token page, **and camp**. A caller that forgets it silently keeps the old behaviour, so pin that none does.
- 🔑 **The test goes through the REAL `getSetting`, never a spy** — this morning's lesson (TASK-465: two suites spied the setting to a bare number and hid a production-wide defect). Build the value the way production builds it.
- **By value:** default 0 ⇒ today's behaviour byte-for-byte (the existing pins must not move) · 30 minutes ⇒ open until end+30, refused at end+31 · the same-day guard still refuses a scan after midnight · a settled row (ATTENDED **and** NO_SHOW) ⇒ the "too late"/already answer, and **no status change** · camp's scan honours it too.
- 🚫 No change to the day-end, to what a check-in does when it succeeds, or to `checkin_early_minutes`.

## Definition of Done
- [ ] The setting · every caller threaded (pinned that none was missed) · the two rulings by value (same-day clamp; a settled session never flipped) · **the real `getSetting`, no spy** · the practical-upper-bound note for the owner · suite **count** · tsc 0 · 56 = 56 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that lets a late scan flip a NO_SHOW · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — `checkin_late_minutes`, default 0; both rulings by value through the REAL setting read; 3058 pass / 0 fail; 10/10 mutations bite

**Numbers:** `bun test` **3058 pass / 0 fail** (+11; new `src/services/checkin-late-window-req107.test.ts`) · `tsc` **0** · 🚫 no migration (**56 = 56**) · **no existing check-in pin moved** (default 0 = today, proven by the suite as it stood) · no change to the day-end, to a successful check-in, or to `checkin_early_minutes`.

## §1 What was built
- **The setting** `checkin_late_minutes`, beside `checkin_early_minutes`, same shape: number, `minutes`, **default 0**, **0–180**, label `เช็คอินได้หลังจบคลาส (นาที)`. The Settings screen renders the registry from the API, so it appears there with no FE change.
- **`lateWindowEnd(endTime, late)`** (`lib/checkin.ts`): class end + late, **clamped by the code itself** to 0–180 and to **23:59 of the same day**, whatever the setting says. `isWithinCheckinWindow` and `checkinWindowMessage` take `lateMinutes` (default 0). The refusal quotes the window's **real** end (`…15:30–17:30 น.`).
- 🔴 **One thing the task did not name, and without it the feature would not work:** the check-in TOKEN is stamped to expire at the **class end** (`tokenExpiryIso`), and the scan checks that stamp **before** the window. So a late setting alone would still have answered every late scan with "โทเคนเช็คอินหมดอายุแล้ว". Fixed in two places:
  - **New tokens** live to the window's end: `issueCheckinToken(…, lateMinutes)`, threaded through `getCheckinQr` and **both confirm paths in `scheduler.service`** (single confirm, and bulk confirm reading the setting once per batch).
  - **Tokens minted before the setting was raised** are honoured inside the late window, because the window, not the stored stamp, is the rule.
  - With 0, the check is exactly the old one.
- **Every caller threaded, pinned:** a scan of `src` for every production call of the four window functions (`isWithinCheckinWindow` · `checkinWindowMessage` · `issueCheckinToken` · `formatCheckinPayload`) requires a late argument in each one. Mutation H drops it from bulk confirm and bites.

## §2 The two rulings, by value
1. **Same day only:** the `now.date !== bookingDate` guard is untouched (mutation J removes it and bites). The end clamps to 23:59: a 22:00–22:30 class at 180 minutes is open until 23:59, and a scan at 00:30 the next day is refused. The code's own ceiling is 180 even if the setting said 999.
2. **A settled session is never flipped:**
   - **ATTENDED** is what the day-end leaves every started CONFIRMED class as. A late scan answers `already`, with no status change.
   - **NO_SHOW** answers the window's "too late" message (`เช็คอินได้ … –18:00 น.`), with **no status change**. Mutation A lets a late scan turn a NO_SHOW into an attendance, and it bites.
   - 📌 **One visible change:** a scan on a NO_SHOW used to say *"คาบนี้ยังไม่พร้อมเช็คอิน (ต้องยืนยันตารางก่อน)"*, which was the wrong reason. It now gives the window's "too late" per your ruling, **even at 0**. Nothing is written either way, before or after.

## §3 🔑 The REAL setting read, no spy
The service reads the setting through `getNumberSetting` → `getSetting` → `resolveSetting`, exactly as production does. Only the **DB row** is faked, and the fake **runs the real `where` callback** and answers only for the key asked for (TASK-466's lesson, applied here: a spy that ignores `where` cannot see a read of the wrong key). It is covered for a value stored as a number (`30`), as text (`"30"`), and with **no row at all** (the default 0 path).
- **By value:** no row → 17:00 accepted, 17:01 refused exactly as today · 30 → 17:30 accepted (with a token stamped at 17:00:59), 17:31 refused.

## §4 Camp — unchanged, on purpose
Camp's scan has **no end-of-class window to widen**: a camp day scans at any time on its own date (`campScanOutcome` checks status, token and date; the token lives to 23:59:59, TASK-403). Adding an end time there would **refuse** scans camp accepts today, which contradicts "default 0 = today". I pinned that a PLANNED camp day still scans at 22:00. If the owner wants camp to have an end-of-window at all, that is a new rule, not this setting.

## §5 📌 For the owner, before he picks a number
**The late window is only real between the class ending and the day-end run.** The day-end marks every started CONFIRMED class ATTENDED (TASK-396: the team leaves at **17:30**, so the run is around then), and after that a late scan only answers "already".
- **Example:** on a box whose cut runs at 17:30, a 16:00–17:00 class gets at most 30 real minutes whatever the setting says, and a 17:00–18:00 class is settled at 17:30, so its late window never happens at all. An evening class after the cut is the only kind where a large number means something.
- This is a property of the design, not a bug.

## Break-and-watch: `mut474.mjs`, 10 mutations, **10 bite**
`finally` + sha-256 restore, byte-identical each time. `git diff` CHECKSUM `53bf8875…` identical before and after. `BASELINE=26` read off the run on 3 suites.
- A 🔴 **a late scan flips a NO_SHOW**
- B 🔴 the scan forgets the late minutes
- C 🔴 the 23:59 clamp removed
- D the 180 ceiling removed
- E 🔴 a class-end token blocks every late scan
- F the minted token ignores late
- G the refusal quotes the class end
- H 🔴 bulk confirm forgets late
- I 🔴 the default is not 0
- J 🔴 the same-day guard removed

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3058 pass / 0 fail** both times · tsc 0 · 56 = 56 · `checkin_late_minutes` in the settings registry.
🔴 **The find is the token, and my task never mentioned it.** The check-in **token expires at the class end**, and that expiry is checked **before** the window — so with the window widened and nothing else touched, **every late scan would have answered "token expired"**, and the feature would have shipped looking implemented and doing nothing. He threaded the new lifetime through `getCheckinQr` **and both confirm paths**, honours older tokens inside the late window, and keeps the check byte-identical at 0. That is the third time this month a feature would have been silently inert — and the second time it was caught by asking *what else stands between the user and this behaviour* rather than by testing what the task listed.
📌 **A second, smaller truth fixed in passing:** a scan of a NO_SHOW session used to answer *"not confirmed yet"* — the wrong reason, which would have sent a parent to look for a confirmation that was never the problem. It now says "too late", **including at 0**, which is right and is a change of behaviour on today's default — noted here so it is not a surprise in Tanya's round.
**Both rulings are built as stated:** the same-day guard untouched with the clamp and the code's own ceiling; ATTENDED ⇒ "already", NO_SHOW ⇒ "too late", **neither changes a settled session**, and the mutation that flips a NO_SHOW bites. Every caller pinned by a scan rather than a list — the camp path and the token page included.
**For the owner, unchanged from my task:** the late window is only real **between the class ending and the day-end run**; a number beyond that does nothing for an afternoon class.
