# TASK-480 — 🔴 RELEASE BLOCKER: a camp scan OVERTURNS a coach's ABSENT. `ABSENT` is terminal to every SCAN — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration. **Do this FIRST — it blocks the uat release.**

## §0 What Tanya did (TEST-073, final) — and I have read the code, she is right
Staff marked a camp day **ABSENT** (200). `POST /checkin/camp { token }` then returned 200 and the day flipped to **ATTENDED**.

`campScanOutcome` (`src/lib/camp.ts:81`) guards `ATTENDED` ⇒ `already`, `CANCELLED` ⇒ conflict, an expired token, and a wrong date. **`ABSENT` falls straight through to `attend`**, and `checkinCampByToken` then calls the same `markDay(…, "ATTENDED")` as any scan.

📌 **Two things make this worse than it looks, and they are the reason it is a blocker rather than a tidy-up:**
1. **It is not the wall QR's fault.** The same `campScanOutcome` serves the camp roster link and the LINE path. **So this is PRE-EXISTING on `uat`** — REQ-108 only gave it a second, public door. Fixing it is not "finishing the new feature", it is closing something that is already open on the customer's box.
2. 🔇 **It is silent in the numbers.** `consumes()` is true for **both** ABSENT and ATTENDED, so `unitsDelta` is **0**: no credit moves, no ledger line, nothing looks odd. The only trace is that a coach's record of a child who was not there now says they were. Money would have been caught; this would not.

## §1 The rule — and the distinction that must NOT be lost
**`ABSENT` is terminal to every SCAN** — the camp roster link, the LINE check-in, and the shop-front QR alike. A scan answers the neutral "already marked" reply and **changes nothing**.

🔴 **But `ABSENT → ATTENDED` stays legal for an ADMIN.** `assertDayTransition` allows it on purpose: a coach who marked the wrong child must be able to correct it. **Do not close that door** — the rule is about *who* is allowed to overturn a human's judgement, not about the transition itself. A token is not a person: it is a piece of paper on a wall or a link in a chat, and it must never outrank the coach standing in the room.
⇒ The guard belongs in **`campScanOutcome`** (the pure scan rule), **not** in `assertDayTransition` or `markDay`. If you find yourself editing either of those, stop — that is the wrong place and it would break the admin's correction.

## §2 Build
- `campScanOutcome`: `ABSENT` ⇒ `"already"`, beside the `ATTENDED` branch, with the reason written in.
- 🔑 **A test through EACH path** that can reach it — the camp roster link, LINE, and the shop-front QR — not one test on the pure function. The whole defect is that one rule serves three doors; prove each door respects it.
- **By value:** an ABSENT camp day scanned ⇒ the same neutral answer an ATTENDED day gives, **status still `ABSENT` after the call**, and `usedUnits` unchanged. 🚫 No new message to the parent.
- **Pin the admin's door is still open:** an admin `markDay(ABSENT → ATTENDED)` still succeeds.
- **The session (non-camp) path:** TASK-474 already settled it (a late scan never flips a settled row — `NO_SHOW` ⇒ "too late", no write). **Check it, do not assume it** — say in your report which pin covers it. If it does not hold, that is a second finding and I want it named, not quietly fixed in here.

## Definition of Done
- [ ] `ABSENT ⇒ already` in `campScanOutcome` with the reason · a test through **each of the three doors** · status and units unchanged, by value · the admin's `ABSENT → ATTENDED` still works, pinned · the session path checked and its pin named · suite **count** · tsc 0 · 57 = 57 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that removes the new guard **and one that closes the admin's correction** · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — ABSENT is terminal to every scan; the admin's correction is still open; 3113 pass / 0 fail; 5/5 mutations bite

**Numbers:** `bun test` **3113 pass / 0 fail** (+7; new `src/services/camp-absent-terminal-req108.test.ts`) · `tsc` **0** · **57 = 57** · `assertDayTransition` and `markDay` **untouched**.

## §1 The fix: in `campScanOutcome` only
`if (day.status === "ABSENT") return "already";` sits beside the ATTENDED branch, with the reason written in the code: *a coach marked it; a token is paper on a wall or a link in a chat and must never outrank the person who was in the room; it was silent because `consumes()` is true for both.* The rule's doc comment now says `"attend"` = PLANNED only.
- One existing pin **moved, and it pinned the defect itself**: `camp-3b` asserted `ABSENT ⇒ "attend"`. It now asserts `"already"`, with a 🔻 note saying why.

## §2 The doors: I found TWO, not three, and I proved it rather than assumed it
- **Door 1: the roster QR link.** Staff open `GET /camp/days/:id/checkin`, the family scans, and that is `POST /api/checkin/camp`. By value, on an ABSENT day:
  - **200 `{ already: true }`**, and **`day.status` is still `ABSENT`**;
  - `markDay` is **never reached**, there are **zero writes**, so `usedUnits` cannot move;
  - the credit shown is unchanged (10 units, 4 used ⇒ 3 of 5 days).
- **Door 2: the shop-front QR** (`POST /api/checkin/shopfront`). An ABSENT day is never listed (TASK-475 ❓3 lists PLANNED only), and the act re-validates, so **409 `NOT_CHECKINABLE`** with the neutral sentence, nothing marked and nothing written.
- **"LINE": there is no camp scan path through the bot.** `line-webhook.service.ts` never calls `checkinCampByToken` / `campScanOutcome` / `getDayCheckinQr` / `markDay`, and the camp reminder carries no check-in link. **Pinned by source**, along with "`campScanOutcome` has exactly one production caller". If a LINE door is ever added, it goes through `checkinCampByToken` and inherits the rule.
- 📌 So the defect was **door 1 (live on `uat`)**; door 2 was already closed by TASK-475's PLANNED-only lookup. Both are now pinned.

## §3 🔑 The admin's door is still open, pinned
Through the **real `markDay`**: an ABSENT day → `ATTENDED` by `admin-dong` is written (`status: "ATTENDED", markedBy: "admin-dong"`), and no unit moves (both statuses consume). By source, `assertDayTransition` still carries `(from === "ABSENT" && to === "ATTENDED")`.

## §4 The session path: checked, not assumed
The pin is **`src/services/checkin-late-window-req107.test.ts` › *"NO_SHOW inside the late window ⇒ the window's 'too late' answer and NO status change"*** (TASK-474). It asserts the 400 "too late" answer and `attended = []`, so `updateBookingStatus` is never called. The new test reads that file and fails if the pin disappears. **It holds, so there is no second finding.** (A session's ATTENDED ⇒ "already", and SICK_LEAVE / CANCELLED ⇒ "not ready", none of which write, as before.)

## Break-and-watch: `mut480.mjs`, 5 mutations, **5 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `d34bda80…`, identical before and after. `BASELINE=47` read off a real run on 3 suites.
- A 🔴 **the new guard removed** (Tanya's defect)
- B 🔴 **the admin's correction closed** (in `assertDayTransition`, the wrong place)
- C the guard as a 409 refusal instead of the neutral "already"
- D 🔴 door 1 ignoring the rule's answer
- E door 2 offering an ABSENT day

⛔ Only you mark this DONE. ▶️ TASK-481 now.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3113 pass / 0 fail** both times · tsc 0 · 57 = 57 · the `ABSENT ⇒ "already"` branch is in `campScanOutcome` and **`assertDayTransition` / `markDay` are untouched**, which was the part I most wanted to be true.

📌 **He corrected my task, and he is right: there are TWO doors, not three.** I wrote "roster link, LINE, shop QR". `checkinCampByToken` has exactly two callers — `POST /checkin/camp` and the shop-front service — and **the bot has no camp scan path at all** (the reminder carries no link). I checked that myself rather than take it: `grep` gives those two and nothing else. **A count I asserted from memory was wrong, and the person told to test "each of the three doors" opened the file instead of inventing a third test.** That is the second time today the useful move was to go and look — and both times it was not me.

**The shop-front door was already shut**, by TASK-475's PLANNED-only list, and he says so rather than claiming a fix he did not need to make. Two independent guards on the public door is the right end state; one of them being older than the defect is worth knowing, not worth hiding.

✅ **The admin's correction still works**, proven through the real `markDay` rather than the pure rule, and the mutation that closes it bites. That mutation is the one I care about long-term: the next person to read "ABSENT is terminal" could easily make it terminal everywhere, and the suite will now stop them.

**The session path was checked, not assumed** — the pin is named (`checkin-late-window-req107` › NO_SHOW inside the late window ⇒ no status change) and it holds, so there is no second finding. Asking for the pin's name rather than a yes is what made that answer verifiable.
